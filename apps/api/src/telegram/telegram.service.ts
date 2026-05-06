import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TicketGeneratorUtil } from '../events/ticket-generator.util';
import { EmailService } from '../auth/email.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf | null = null;
  private isPolling = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not set — Telegram bot is disabled. Set the token to enable it.',
      );
      return;
    }

    this.bot = new Telegraf(token);
    this.bot.start(async (ctx) => {
      const payload = ctx.startPayload; // the value after /start
      if (payload) {
        await this.handleStartPayload(ctx.chat.id.toString(), payload);
      } else {
        await ctx.reply(
          'Welcome to the AASTU CEMS Graduation Bot!\n\nIf a student sent you a link, please click it to receive your entry pass.',
        );
      }
    });

    // Use polling in development (no public URL needed), webhook in production
    const webhookUrl = this.configService.get<string>('TELEGRAM_WEBHOOK_URL');
    if (webhookUrl) {
      await this.bot.telegram.setWebhook(webhookUrl);
      this.logger.log(`Telegram webhook set to ${webhookUrl}`);
    } else {
      this.bot.launch({ dropPendingUpdates: true });
      this.isPolling = true;
      this.logger.log('Telegram bot started in polling mode (development)');
    }
  }

  async onModuleDestroy() {
    if (this.bot && this.isPolling) {
      this.bot.stop('SIGTERM');
    }
  }

  // ─── Handle /start TOKEN payload from parent clicking deep link ──────────

  async handleStartPayload(chatId: string, telegramToken: string) {
    if (!this.bot) return;

    const guestPass = await this.prisma.guestPass.findUnique({
      where: { telegramToken },
      include: {
        graduationRecord: {
          include: {
            invite: {
              include: {
                event: { include: { venue: true, eventType: true } },
              },
            },
          },
        },
      },
    });

    if (!guestPass) {
      await this.bot.telegram.sendMessage(
        chatId,
        'This link is invalid or has already been used. Please ask the student to resend it.',
      );
      return;
    }

    if (guestPass.delivered) {
      await this.bot.telegram.sendMessage(
        chatId,
        'Your entry pass was already sent! Please scroll up to find it, or ask the organizer for a resend.',
      );
      return;
    }

    const record = guestPass.graduationRecord;
    const event = record.invite.event;

    // Save the chatId so we can message them later
    await this.prisma.guestPass.update({
      where: { id: guestPass.id },
      data: { telegramChatId: chatId },
    });

    // Send confirmation first
    await this.bot.telegram.sendMessage(
      chatId,
      `*Welcome!*\n\nYou are receiving this on behalf of *${record.fullName}*'s graduation ceremony.\n\nGenerating your entry pass now...`,
      { parse_mode: 'Markdown' },
    );

    try {
      // Generate the tier-styled PDF
      const pdf = await TicketGeneratorUtil.generateGraduationGuestCard(event, guestPass, record);

      // Send QR card as a document
      await this.bot.telegram.sendDocument(
        chatId,
        {
          source: pdf,
          filename: `GraduationPass_${record.fullName.replace(/\s+/g, '_')}.pdf`,
        },
        {
          caption: this.buildCaption(record, guestPass, event),
          parse_mode: 'Markdown',
        },
      );

      // Mark as delivered
      await this.prisma.guestPass.update({
        where: { id: guestPass.id },
        data: { delivered: true, deliveredAt: new Date() },
      });

      this.logger.log(`QR card sent via Telegram to chatId ${chatId} for student ${record.fullName}`);
    } catch (err) {
      this.logger.error(`Failed to send QR card via Telegram: ${err.message}`);
      await this.bot.telegram.sendMessage(
        chatId,
        'We encountered an issue generating your pass. Please contact the event organizer.',
      );
    }
  }

  // ─── Handle webhook updates (called by controller in production) ──────────

  async handleWebhookUpdate(body: any) {
    if (!this.bot) return;
    await this.bot.handleUpdate(body);
  }

  // ─── Send QR card directly to a known chatId (for resend) ────────────────

  async sendQRCard(chatId: string, guestPassId: string) {
    if (!this.bot) throw new Error('Telegram bot is not configured');

    const guestPass = await this.prisma.guestPass.findUnique({
      where: { id: guestPassId },
      include: {
        graduationRecord: {
          include: {
            invite: { include: { event: { include: { venue: true, eventType: true } } } },
          },
        },
      },
    });

    if (!guestPass) throw new Error('Guest pass not found');

    const record = guestPass.graduationRecord;
    const event = record.invite.event;
    const pdf = await TicketGeneratorUtil.generateGraduationGuestCard(event, guestPass, record);

    await this.bot.telegram.sendDocument(
      chatId,
      { source: pdf, filename: `GraduationPass_${record.fullName.replace(/\s+/g, '_')}.pdf` },
      { caption: this.buildCaption(record, guestPass, event), parse_mode: 'Markdown' },
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private buildCaption(
    record: { fullName: string; tier: string },
    guestPass: { parentLabel: string },
    event: { title: string; startTime: Date; venue?: { name: string } | null },
  ): string {
    const date = new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const time = new Date(event.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });

    const icons: Record<string, string> = {
      DISTINGUISHED: '★',
      HONORS:        '⬥',
      GRADUATE:      '■',
    };
    const icon = icons[record.tier] ?? '■';

    return (
      `*${icon} Congratulations!*\n\n` +
      `You are invited as *${guestPass.parentLabel}* to the graduation ceremony of *${record.fullName}*.\n\n` +
      `*Date:* ${date}\n` +
      `*Time:* ${time}\n` +
      `*Venue:* ${event.venue?.name ?? 'Campus Venue'}\n\n` +
      `Please present the attached QR code at the entrance gate. See you there!`
    );
  }
}
