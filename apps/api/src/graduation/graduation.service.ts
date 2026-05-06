import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';
import { AddStudentDto, ClaimSubmissionDto } from './dto/graduation.dto';
import { TicketGeneratorUtil } from '../events/ticket-generator.util';

// ─── Tier Computation ────────────────────────────────────────────────────────

export interface TierResult {
  tier: 'GRADUATE' | 'HONORS' | 'DISTINGUISHED';
  guestSlots: number;
  label: string;
}

export function computeTier(gpa: number): TierResult {
  if (gpa >= 3.75) return { tier: 'DISTINGUISHED', guestSlots: 3, label: 'Distinguished Graduate' };
  if (gpa >= 3.5)  return { tier: 'HONORS',        guestSlots: 2, label: 'Honors Graduate' };
  return                  { tier: 'GRADUATE',       guestSlots: 1, label: 'Graduate' };
}

@Injectable()
export class GraduationService {
  private readonly logger = new Logger(GraduationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertOrganizerOfEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
        eventType: true,
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can manage graduation records');
    }
    if (event.eventType?.name?.toUpperCase() !== 'GRADUATION') {
      throw new BadRequestException('This endpoint is only available for Graduation events');
    }
    return event;
  }

  private generateQrToken(guestPassId: string, eventId: string): string {
    return this.jwtService.sign(
      { type: 'GUEST_PASS', guestPassId, eventId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '90d',
      },
    );
  }

  private buildDeepLink(telegramToken: string): string {
    const botUsername = this.configService.get<string>('TELEGRAM_BOT_USERNAME') ?? 'CemsBot';
    return `https://t.me/${botUsername}?start=${telegramToken}`;
  }

  private async processStudent(
    eventId: string,
    invitedBy: string,
    email: string,
    fullName: string,
    gpa: number,
    eventTitle: string,
  ) {
    const lowerEmail = email.trim().toLowerCase();
    const { tier, guestSlots } = computeTier(gpa);

    // Check for existing invite
    const existing = await this.prisma.eventInvites.findUnique({
      where: { eventId_invitedEmail: { eventId, invitedEmail: lowerEmail } },
      include: { graduationRecord: true },
    });

    if (existing?.graduationRecord) {
      return { skipped: true, email: lowerEmail, reason: 'already_imported' };
    }

    // Find matching CEMS user if they exist
    const matchedUser = await this.prisma.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true },
    });

    const claimToken = uuidv4();
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const claimUrl = `${frontendUrl}/graduation/claim?token=${claimToken}`;

    // Create invite + graduation record in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Resolve the inviteId — either from the existing record or a fresh create
      let inviteId: string;
      if (existing) {
        inviteId = existing.id;
      } else {
        const newInvite = await tx.eventInvites.create({
          data: {
            eventId,
            userId: matchedUser?.id ?? null,
            invitedEmail: lowerEmail,
            invitedBy,
            status: 'PENDING',
          },
        });
        inviteId = newInvite.id;
      }

      await tx.graduationRecord.create({
        data: {
          inviteId,
          fullName: fullName.trim(),
          gpa,
          tier,
          guestSlots,
          claimToken,
        },
      });
    });

    // Send claim email asynchronously (don't block on failure)
    this.emailService
      .sendGraduationClaimEmail(lowerEmail, fullName, eventTitle, claimUrl)
      .catch((err) => this.logger.error(`Failed to send claim email to ${lowerEmail}: ${err.message}`));

    return { skipped: false, email: lowerEmail };
  }

  // ─── Import from CSV ───────────────────────────────────────────────────────

  async importFromCsv(eventId: string, userId: string, fileBuffer: Buffer) {
    const event = await this.assertOrganizerOfEvent(eventId, userId);

    let records: any[];
    try {
      records = parse(fileBuffer, { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      throw new BadRequestException('Invalid CSV format');
    }

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const row of records) {
      const email = row.email || row.Email || row.EMAIL;
      const fullName = row.fullName || row.full_name || row.FullName || row.name || row.Name;
      const rawGpa = row.gpa || row.GPA || row.Gpa;
      const gpa = parseFloat(rawGpa);

      if (!email || !fullName || isNaN(gpa)) {
        results.errors.push(`Invalid row: ${JSON.stringify(row)}`);
        continue;
      }

      const result = await this.processStudent(eventId, userId, email, fullName, gpa, event.title);
      result.skipped ? results.skipped++ : results.imported++;
    }

    return {
      message: 'CSV import complete',
      ...results,
    };
  }

  // ─── Add Single Student Manually ──────────────────────────────────────────

  async addStudent(eventId: string, userId: string, dto: AddStudentDto) {
    const event = await this.assertOrganizerOfEvent(eventId, userId);
    const result = await this.processStudent(eventId, userId, dto.email, dto.fullName, dto.gpa, event.title);
    if (result.skipped) throw new BadRequestException('Student already imported for this event');
    return { message: 'Student added and invitation email sent', email: dto.email };
  }

  // ─── Get Students for Organizer Dashboard ─────────────────────────────────

  async getStudentsForEvent(eventId: string, userId: string) {
    await this.assertOrganizerOfEvent(eventId, userId);

    const records = await this.prisma.graduationRecord.findMany({
      where: { invite: { eventId } },
      include: {
        invite: { select: { invitedEmail: true, status: true } },
        guestPasses: true,
      },
      orderBy: { gpa: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.invite.invitedEmail,
      gpa: r.gpa,
      tier: r.tier,
      guestSlots: r.guestSlots,
      claimed: r.claimed,
      claimedAt: r.claimedAt,
      guestPasses: r.guestPasses.map((gp) => ({
        id: gp.id,
        parentLabel: gp.parentLabel,
        deliveryMethod: gp.deliveryMethod,
        delivered: gp.delivered,
        deliveredAt: gp.deliveredAt,
      })),
    }));
  }

  // ─── Get Claim Status (public, no auth) ───────────────────────────────────

  async getClaimStatus(token: string) {
    const record = await this.prisma.graduationRecord.findUnique({
      where: { claimToken: token },
      include: {
        invite: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                venue: { select: { name: true, building: true } },
              },
            },
          },
        },
        guestPasses: true,
      },
    });

    if (!record) throw new NotFoundException('Invalid or expired claim link');

    const { tier, label } = computeTier(record.gpa);

    return {
      studentName: record.fullName,
      tier,
      tierLabel: label,
      guestSlots: record.guestSlots,
      claimed: record.claimed,
      event: {
        title: record.invite.event.title,
        startTime: record.invite.event.startTime,
        venue: record.invite.event.venue,
      },
      existingPasses: record.claimed ? record.guestPasses.map(gp => ({
        parentLabel: gp.parentLabel,
        deliveryMethod: gp.deliveryMethod,
        delivered: gp.delivered,
      })) : [],
    };
  }

  // ─── Claim Submission (public, no auth) ───────────────────────────────────

  async submitClaim(token: string, dto: ClaimSubmissionDto) {
    const record = await this.prisma.graduationRecord.findUnique({
      where: { claimToken: token },
      include: {
        invite: {
          include: {
            event: {
              include: { venue: true, eventType: true },
            },
          },
        },
      },
    });

    if (!record) throw new NotFoundException('Invalid or expired claim link');
    if (record.claimed) throw new BadRequestException('This claim link has already been used');
    if (dto.parents.length > record.guestSlots) {
      throw new BadRequestException(`You are only allowed ${record.guestSlots} parent guest(s)`);
    }

    // Validate delivery method fields
    for (const parent of dto.parents) {
      if (parent.deliveryMethod === 'TELEGRAM' && !parent.telegramUsername) {
        throw new BadRequestException(`Telegram username required for ${parent.parentLabel}`);
      }
      if (parent.deliveryMethod === 'EMAIL' && !parent.parentEmail) {
        throw new BadRequestException(`Email required for ${parent.parentLabel}`);
      }
    }

    const event = record.invite.event;
    const telegramLinks: { parentLabel: string; deepLink: string }[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const parent of dto.parents) {
        const telegramToken = parent.deliveryMethod === 'TELEGRAM' ? uuidv4() : null;

        // Create guest pass with placeholder qrToken (will be updated after insert to get the ID)
        const guestPass = await tx.guestPass.create({
          data: {
            graduationRecordId: record.id,
            parentLabel: parent.parentLabel,
            deliveryMethod: parent.deliveryMethod,
            telegramUsername: parent.telegramUsername ?? null,
            parentEmail: parent.parentEmail ?? null,
            telegramToken,
            qrToken: 'PENDING', // placeholder
          },
        });

        // Now generate QR JWT with the real ID
        const qrToken = this.generateQrToken(guestPass.id, event.id);
        await tx.guestPass.update({ where: { id: guestPass.id }, data: { qrToken } });

        if (parent.deliveryMethod === 'TELEGRAM' && telegramToken) {
          telegramLinks.push({
            parentLabel: parent.parentLabel,
            deepLink: this.buildDeepLink(telegramToken),
          });
        }

        if (parent.deliveryMethod === 'EMAIL' && parent.parentEmail) {
          // Generate PDF and send email (outside transaction — handled below)
          const finalPass = { ...guestPass, qrToken, telegramToken };
          setImmediate(async () => {
            try {
              const pdf = await TicketGeneratorUtil.generateGraduationGuestCard(
                event,
                finalPass,
                record,
              );
              await this.emailService.sendParentQREmail(
                parent.parentEmail!,
                record.fullName,
                record.tier,
                event,
                pdf,
              );
              await this.prisma.guestPass.update({
                where: { id: guestPass.id },
                data: { delivered: true, deliveredAt: new Date() },
              });
            } catch (err) {
              this.logger.error(`Failed to send parent QR email: ${err.message}`);
            }
          });
        }
      }

      // Mark record as claimed
      await tx.graduationRecord.update({
        where: { id: record.id },
        data: { claimed: true, claimedAt: new Date() },
      });
    });

    return {
      message: 'Claim successful',
      telegramLinks,
      emailSent: dto.parents.filter((p) => p.deliveryMethod === 'EMAIL').map((p) => p.parentEmail),
    };
  }

  // ─── Resend Delivery (organizer action) ───────────────────────────────────

  async resendDelivery(guestPassId: string, organizerId: string) {
    const guestPass = await this.prisma.guestPass.findUnique({
      where: { id: guestPassId },
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

    if (!guestPass) throw new NotFoundException('Guest pass not found');

    const record = guestPass.graduationRecord;
    const event = record.invite.event;

    // Verify organizer
    await this.assertOrganizerOfEvent(event.id, organizerId);

    if (guestPass.deliveryMethod === 'TELEGRAM') {
      // Return deep link for organizer to manually share
      return {
        method: 'TELEGRAM',
        deepLink: guestPass.telegramToken ? this.buildDeepLink(guestPass.telegramToken) : null,
        note: 'Share this link with the parent',
      };
    }

    if (guestPass.deliveryMethod === 'EMAIL' && guestPass.parentEmail) {
      const pdf = await TicketGeneratorUtil.generateGraduationGuestCard(event, guestPass, record);
      await this.emailService.sendParentQREmail(
        guestPass.parentEmail,
        record.fullName,
        record.tier,
        event,
        pdf,
      );
      await this.prisma.guestPass.update({
        where: { id: guestPassId },
        data: { delivered: true, deliveredAt: new Date() },
      });
      return { method: 'EMAIL', message: 'QR email resent successfully' };
    }

    throw new BadRequestException('Cannot resend: missing delivery info');
  }
}
