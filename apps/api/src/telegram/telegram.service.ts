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
      // Webhook mode: async but quick
      this.bot.telegram.setWebhook(webhookUrl)
        .then(() => this.logger.log(`Telegram webhook set to ${webhookUrl}`))
        .catch((err: any) => {
          this.logger.error(`Failed to set Telegram webhook: ${err.message}`);
          this.logger.warn('The API will continue running without Telegram webhook.');
        });
    } else {
      // Polling mode: bot.launch() blocks internally — run it detached so onModuleInit returns immediately
      this.bot.launch({ dropPendingUpdates: true })
        .then(() => this.logger.log('Telegram bot started in polling mode (development)'))
        .catch((err: any) => {
          this.logger.error(`Failed to start Telegram bot in polling mode: ${err.message}`);
          this.logger.warn('The API will continue running without Telegram functionality.');
        });
      this.isPolling = true;
      this.logger.log('Telegram bot launch initiated (non-blocking)');
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

  // ─── Channel broadcast helpers (event announcements) ──────────────────────

  /**
   * Post a rich announcement to the configured Telegram channel when an event
   * is APPROVED (registration open). Silently skips if no channel is configured.
   */
  async sendEventAnnouncement(event: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    capacity: number | null;
    venue?: { name: string } | null;
    eventType?: { name: string } | null;
    access?: { accessType: string } | null;
    media?: Array<{ fileUrl: string; mediaType: string }> | null;
    creator?: { fullName: string } | null;
    tags?: Array<{ tag: { name: string } }> | null;
  }): Promise<void> {
    if (!this.bot) return;
    const channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');
    if (!channelId) return;
    const webUrl = (this.configService.get<string>('CEMS_WEB_URL') ?? '').replace(/\/$/, '');

    const date = new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const time = new Date(event.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
    const endTime = new Date(event.endTime).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });

    const accessLabel = event.access?.accessType === 'INVITE_ONLY' ? '🔒 Invite Only' : '🌐 Open to All';
    const capacityLine = event.capacity ? `\n*Capacity:* ${event.capacity} seats` : '';
    const organizerLine = event.creator?.fullName ? `\n👥 *Organized by:* ${event.creator.fullName}` : '';
    const descLine = event.description
      ? `\n\n${event.description.length > 200 ? event.description.slice(0, 197) + '...' : event.description}`
      : '';

    // Convert tags to CamelCase hashtags (e.g. "Tech & Innovation" -> "#TechAndInnovation")
    const hashTags = event.tags?.length
      ? '\n\n' + event.tags
          .map((t) => `#${t.tag.name.replace(/[^a-zA-Z0-9]/g, '')}`)
          .filter((tag) => tag.length > 1)
          .join(' ')
      : '';

    const message =
      `📢 *New Event Announced!*\n\n` +
      `*${event.title}*${descLine}\n\n` +
      `📅 *Date:* ${date}\n` +
      `🕐 *Time:* ${time} – ${endTime}\n` +
      `📍 *Venue:* ${event.venue?.name ?? 'Campus Venue'}\n` +
      `🏷 *Type:* ${event.eventType?.name ?? 'General'}${organizerLine}\n` +
      `${accessLabel}${capacityLine}${hashTags}`;

    const eventUrl = webUrl ? `${webUrl}/events/${event.id}` : null;
    const hasValidUrl = eventUrl && !eventUrl.includes('localhost') && !eventUrl.includes('127.0.0.1');

    // Try to send with cover image if available
    const imageMedia = event.media?.find((m) => m.fileUrl);
    if (imageMedia?.fileUrl) {
      try {
        await this.bot.telegram.sendPhoto(channelId, imageMedia.fileUrl, {
          caption: message,
          parse_mode: 'Markdown',
          ...(hasValidUrl && {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📋 View Event Details', url: eventUrl },
                  { text: '✅ Register Now', url: eventUrl },
                ],
              ],
            },
          }),
        });
        this.logger.log(`Event announcement (with image) sent to channel for: "${event.title}"`);
        return;
      } catch (err: any) {
        this.logger.warn(`Failed to send event announcement with image: ${err.message}. Falling back to text message.`);
      }
    }

    // Text fallback
    try {
      await this.bot.telegram.sendMessage(channelId, message, {
        parse_mode: 'Markdown',
        ...(hasValidUrl && {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📋 View Event Details', url: eventUrl },
                { text: '✅ Register Now', url: eventUrl },
              ],
            ],
          },
        }),
      });
      this.logger.log(`Event announcement (text-only) sent to channel for: "${event.title}"`);
    } catch (err: any) {
      this.logger.error(`Failed to send event announcement to channel: ${err.message}`);
    }
  }

  /**
   * Post a "starting now" alert to the Telegram channel when an event goes LIVE.
   * Silently skips if no channel is configured.
   */
  async sendEventLiveAlert(event: {
    id: string;
    title: string;
    startTime: Date;
    venue?: { name: string } | null;
  }): Promise<void> {
    if (!this.bot) return;
    const channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');
    if (!channelId) return;
    const webUrl = (this.configService.get<string>('CEMS_WEB_URL') ?? '').replace(/\/$/, '');

    const time = new Date(event.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });

    const message =
      `🚀 *Event is LIVE Now!*\n\n` +
      `*${event.title}* has officially started.\n\n` +
      `📍 *Venue:* ${event.venue?.name ?? 'Campus Venue'}\n` +
      `🕐 *Started at:* ${time}\n\n` +
      `_Head over now — don't miss it!_`;

    const eventUrl = webUrl ? `${webUrl}/events/${event.id}` : null;
    const hasValidUrl = eventUrl && !eventUrl.includes('localhost') && !eventUrl.includes('127.0.0.1');

    try {
      await this.bot.telegram.sendMessage(channelId, message, {
        parse_mode: 'Markdown',
        ...(hasValidUrl && {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎟 Join Now →', url: eventUrl },
              ],
            ],
          },
        }),
      });
      this.logger.log(`Live alert sent to channel for: "${event.title}"`);
    } catch (err: any) {
      this.logger.error(`Failed to send live alert to channel: ${err.message}`);
    }
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
