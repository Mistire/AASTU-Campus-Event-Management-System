import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, Registration, EventWaitlist } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { WaitlistService, PrismaTransactionClient } from './waitlist.service';
import { EmailService } from '../auth/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TicketGeneratorUtil } from '../events/ticket-generator.util';
import { Event } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  userId: string;
  eventId: string;
}

export interface OrganizerActionDto {
  registrationId: string;
  organizerId: string;
}

export type RegistrationResult =
  | { kind: 'registered'; registration: Registration }
  | { kind: 'waitlisted'; waitlistEntry: EventWaitlist };

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class RegistrationService implements OnModuleInit {
  private readonly logger = new Logger(RegistrationService.name);
  /** In-memory cache: status name → status id */
  private readonly statusCache = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationsService: NotificationsService,
    private readonly waitlistService: WaitlistService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async onModuleInit() {
    await this.bootstrapStatuses();
  }

  /**
   * Ensures that the required registration statuses exist in the database.
   * This provides a permanent fix for cases where the database seed hasn't been run.
   */
  private async bootstrapStatuses() {
    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'APPROVED'];
    this.logger.log('Bootstrapping registration statuses...');

    for (const name of statuses) {
      try {
        const existing = await this.prisma.registrationStatus.findFirst({
          where: { name },
        });

        if (!existing) {
          await this.prisma.registrationStatus.create({
            data: { name },
          });
        }
      } catch (error) {
        this.logger.error(`Failed to bootstrap status ${name}: ${error.message}`);
      }
    }
    this.logger.log('Registration statuses bootstrapped successfully.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Status id cache
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Returns the RegistrationStatus row id for a given status name.
   * Cached after first call.
   */
  async getStatusId(name: 'PENDING' | 'CONFIRMED' | 'CANCELLED'): Promise<string> {
    if (this.statusCache.has(name)) {
      return this.statusCache.get(name)!;
    }
    const status = await this.prisma.registrationStatus.findFirst({
      where: { name },
      select: { id: true },
    });
    if (!status) {
      throw new NotFoundException(`RegistrationStatus '${name}' not found`);
    }
    this.statusCache.set(name, status.id);
    return status.id;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Student registration
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Student registers for an event.
   * Checks capacity inside a serializable transaction.
   * Returns the created Registration or WaitlistEntry.
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 8.1, 8.3
   */
  async register(dto: RegisterDto): Promise<RegistrationResult> {
    const { userId, eventId } = dto;

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          // 1. Verify event exists
          const event = await tx.event.findUnique({
            where: { id: eventId },
            select: { id: true, capacity: true, requiresApproval: true, endTime: true },
          });
          if (!event) {
            throw new NotFoundException(`Event ${eventId} not found`);
          }

          // 1.1 Check if event has already ended
          if (event.endTime < new Date()) {
            throw new BadRequestException('This event has already ended');
          }

          // 2. Check for duplicate active registration
          const [pendingId, confirmedId] = await Promise.all([
            this.getStatusId('PENDING'),
            this.getStatusId('CONFIRMED'),
          ]);

          const existing = await tx.registration.findFirst({
            where: {
              userId,
              eventId,
              statusId: { in: [pendingId, confirmedId] },
            },
          });
          if (existing) {
            throw new ConflictException('You already have an active registration for this event');
          }

          // 3. Count CONFIRMED registrations
          const confirmedCount = await tx.registration.count({
            where: { eventId, statusId: confirmedId },
          });

          if (confirmedCount < event.capacity) {
            // Spot available — register directly
            const statusId = event.requiresApproval ? pendingId : confirmedId;
            const registration = await tx.registration.create({
              data: { userId, eventId, statusId },
            });
            return { kind: 'registered' as const, registration } satisfies RegistrationResult;
          } else {
            // Event full — add to waitlist
            const waitlistEntry: EventWaitlist = await this.waitlistService.addToWaitlist(
              userId,
              eventId,
              tx as unknown as PrismaTransactionClient,
            );
            return { kind: 'waitlisted' as const, waitlistEntry } satisfies RegistrationResult;
          }
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      // Trigger ticket email if directly registered (confirmed)
      if (
        result.kind === 'registered' &&
        result.registration.statusId === (await this.getStatusId('CONFIRMED'))
      ) {
        this.generateAndSendTicket(result.registration.id).catch((err) => {
          this.logger.error(`Failed to send registration ticket: ${err.message}`);
        });
      }

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId,
          action: result.kind === 'registered' ? 'EVENT_REGISTRATION' : 'EVENT_WAITLIST_JOIN',
          entityType: 'EVENT',
          entityId: eventId,
          outcome: 'SUCCESS',
          details:
            result.kind === 'registered'
              ? `User registered for event. Status: ${dto.userId === userId ? 'Direct' : 'Admin Action'}`
              : `User joined event waitlist`,
          afterState: result,
        });
      } catch (e) {
        this.logger.error(`Failed to create audit log: ${e.message}`);
      }

      return result;
    } catch (err) {
      this.rethrowSerializationError(err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Student self-cancellation
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Student cancels their own registration.
   * Requirements: 5.1, 5.2, 5.3, 3.1, 8.3
   */
  async cancelByStudent(registrationId: string, studentId: string): Promise<Registration> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const reg = await tx.registration.findUnique({
            where: { id: registrationId },
            include: { status: true },
          });
          if (!reg) {
            throw new NotFoundException(`Registration ${registrationId} not found`);
          }
          if (reg.userId !== studentId) {
            throw new ForbiddenException('You are not allowed to cancel this registration');
          }
          if (reg.status.name === 'CANCELLED') {
            throw new ConflictException('Registration is already cancelled');
          }

          const wasConfirmed = reg.status.name === 'CONFIRMED';
          const cancelledId = await this.getStatusId('CANCELLED');

          const updated = await tx.registration.update({
            where: { id: registrationId },
            data: { statusId: cancelledId },
          });

          if (wasConfirmed) {
            await this.waitlistService.promoteNext(
              reg.eventId,
              tx as unknown as PrismaTransactionClient,
            );
          }

          await this.analyticsService.invalidateEventCache(reg.eventId);

          // Audit Log
          try {
            await this.auditLogsService.createLog({
              userId: studentId,
              action: 'EVENT_REGISTRATION_CANCEL',
              entityType: 'EVENT',
              entityId: reg.eventId,
              outcome: 'SUCCESS',
              details: `User cancelled their registration for event`,
              beforeState: reg,
              afterState: updated,
            });
          } catch (e) {
            this.logger.error(`Failed to create audit log: ${e.message}`);
          }

          return updated;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      this.rethrowSerializationError(err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Organizer actions
  // ──────────────────────────────────────────────────────────────────────────

  async approveByOrganizer(dto: OrganizerActionDto): Promise<Registration> {
    const { registrationId, organizerId } = dto;

    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { status: true, event: true },
    });
    if (!reg) {
      throw new NotFoundException(`Registration ${registrationId} not found`);
    }

    await this.assertOrganizer(reg.eventId, organizerId);

    const confirmedId = await this.getStatusId('CONFIRMED');

    // Capacity check
    const confirmedCount = await this.prisma.registration.count({
      where: { eventId: reg.eventId, statusId: confirmedId },
    });
    if (confirmedCount >= reg.event.capacity) {
      throw new ConflictException('Event is already at capacity');
    }

    const updated = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { statusId: confirmedId },
    });

    await this.notificationsService.enqueueNotification(
      reg.userId,
      'Registration Approved',
      `Your registration for the event has been approved.`,
      NotificationType.REGISTRATION_APPROVED,
    );

    await this.analyticsService.invalidateEventCache(reg.eventId);

    // Trigger ticket email after successful approval
    this.generateAndSendTicket(updated.id).catch((err) => {
      this.logger.error(`Failed to send registration ticket after approval: ${err.message}`);
    });

    return updated;
  }

  /**
   * Organizer rejects a PENDING registration.
   * Requirements: 4.3, 4.5
   */
  async rejectByOrganizer(dto: OrganizerActionDto): Promise<Registration> {
    const { registrationId, organizerId } = dto;

    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { status: true },
    });
    if (!reg) {
      throw new NotFoundException(`Registration ${registrationId} not found`);
    }

    await this.assertOrganizer(reg.eventId, organizerId);

    const cancelledId = await this.getStatusId('CANCELLED');

    const updated = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { statusId: cancelledId },
    });

    await this.notificationsService.enqueueNotification(
      reg.userId,
      'Registration Rejected',
      `Your registration for the event has been rejected.`,
      NotificationType.REGISTRATION_REJECTED,
    );

    await this.analyticsService.invalidateEventCache(reg.eventId);
    return updated;
  }

  /**
   * Organizer removes a CONFIRMED registration.
   * Requirements: 4.4, 4.5, 3.1
   */
  async removeByOrganizer(dto: OrganizerActionDto): Promise<Registration> {
    const { registrationId, organizerId } = dto;

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const reg = await tx.registration.findUnique({
            where: { id: registrationId },
            include: { status: true },
          });
          if (!reg) {
            throw new NotFoundException(`Registration ${registrationId} not found`);
          }

          await this.assertOrganizer(reg.eventId, organizerId);

          const cancelledId = await this.getStatusId('CANCELLED');

          const updated = await tx.registration.update({
            where: { id: registrationId },
            data: { statusId: cancelledId },
          });

          await this.notificationsService.enqueueNotification(
            reg.userId,
            'Registration Removed',
            `Your registration for the event has been removed by an organizer.`,
            NotificationType.REGISTRATION_REMOVED,
          );

          await this.waitlistService.promoteNext(
            reg.eventId,
            tx as unknown as PrismaTransactionClient,
          );

          await this.analyticsService.invalidateEventCache(reg.eventId);
          return updated;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      this.rethrowSerializationError(err);
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Queries
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all active registrations and waitlist entries for a student.
   */
  async findMyRegistrations(userId: string) {
    const [registrations, waitlist] = await Promise.all([
      this.prisma.registration.findMany({
        where: { userId, deletedAt: null },
        include: {
          event: {
            include: {
              venue: true,
              status: true,
              media: { where: { mediaType: 'THUMBNAIL' } },
              _count: { select: { registrations: true } },
              eventType: true,
            },
          },
          status: true,
        },
        orderBy: { registrationDate: 'desc' },
      }),
      this.prisma.eventWaitlist.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              venue: true,
              status: true,
              media: { where: { mediaType: 'THUMBNAIL' } },
              _count: { select: { registrations: true } },
              eventType: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      }),
    ]);

    const confirmedId = await this.getStatusId('CONFIRMED');

    const mappedRegistrations = await Promise.all(
      registrations.map(async (reg) => {
        if (reg.statusId === confirmedId) {
          const token = this.jwtService.sign(
            {
              sub: reg.id,
              event_id: reg.eventId,
              user_id: reg.userId,
              kind: 'STUDENT_TICKET',
            },
            {
              secret: this.configService.get<string>('JWT_SECRET'),
              expiresIn: '30d',
            },
          );
          return { ...reg, ticketToken: token };
        }
        return reg;
      }),
    );

    return { registrations: mappedRegistrations, waitlist };
  }

  /**
   * Returns the registration status of the current user for a specific event.
   */
  async findStatusForEvent(userId: string, eventId: string) {
    const [registration, waitlist] = await Promise.all([
      this.prisma.registration.findFirst({
        where: { userId, eventId, deletedAt: null },
        include: { status: true },
      }),
      this.prisma.eventWaitlist.findFirst({
        where: { userId, eventId },
      }),
    ]);

    if (registration) {
      let ticketToken: string | undefined;
      const confirmedId = await this.getStatusId('CONFIRMED');

      if (registration.statusId === confirmedId) {
        ticketToken = this.jwtService.sign(
          {
            sub: registration.id,
            event_id: registration.eventId,
            user_id: registration.userId,
            kind: 'STUDENT_TICKET',
          },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '30d',
          },
        );
      }
      return { kind: 'registered', registration: { ...registration, ticketToken } };
    }
    if (waitlist) {
      const position =
        (await this.prisma.eventWaitlist.count({
          where: {
            eventId,
            joinedAt: { lt: waitlist.joinedAt },
          },
        })) + 1;
      return { kind: 'waitlisted', waitlistEntry: { ...waitlist, position } };
    }
    return { kind: 'none' };
  }

  /**
   * Fetches all attendees for an event (Organizer only).
   */
  async findAllForEvent(eventId: string, organizerId: string) {
    await this.assertOrganizer(eventId, organizerId);

    const [registrations, waitlist] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId, deletedAt: null },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
              department: true,
            },
          },
          status: true,
        },
        orderBy: { registrationDate: 'asc' },
      }),
      this.prisma.eventWaitlist.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
              department: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      }),
    ]);

    return { registrations, waitlist };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Legacy CRUD (kept for backward compatibility with other parts of codebase)
  // ──────────────────────────────────────────────────────────────────────────

  async create(data: { userId: string; eventId: string; statusId: string }) {
    const registration = await this.prisma.registration.create({ data });
    await this.analyticsService.invalidateEventCache(data.eventId);
    return registration;
  }

  async update(id: string, data: Partial<{ statusId: string }>) {
    const registration = await this.prisma.registration.update({ where: { id }, data });
    await this.analyticsService.invalidateEventCache(registration.eventId);
    return registration;
  }

  async remove(id: string) {
    const registration = await this.prisma.registration.delete({ where: { id } });
    await this.analyticsService.invalidateEventCache(registration.eventId);
    return registration;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Asserts that organizerId is the event creator or an accepted organizer.
   * Throws ForbiddenException otherwise.
   * Requirements: 4.5
   */
  private async assertOrganizer(eventId: string, organizerId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        createdBy: true,
        organizers: {
          where: { userId: organizerId, status: 'ACCEPTED' },
          select: { id: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    const isCreator = event.createdBy === organizerId;
    const isOrganizer = event.organizers.length > 0;

    if (!isCreator && !isOrganizer) {
      throw new ForbiddenException('You are not an organizer of this event');
    }
  }

  /**
   * Catches Prisma serialization failure (P2034) and re-throws as ConflictException.
   * Requirements: 8.4
   */
  private rethrowSerializationError(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
      throw new ConflictException('Transaction conflict due to concurrent request. Please retry.');
    }
  }

  /**
   * Private helper to generate a JWT token, create a PDF ticket, and send it via email.
   * This is called asynchronously after a registration is confirmed.
   */
  private async generateAndSendTicket(registrationId: string): Promise<void> {
    try {
      const reg = await this.prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          user: { select: { email: true, fullName: true } },
          event: {
            include: {
              venue: true,
              eventType: true,
            },
          },
        },
      });

      if (!reg || !reg.user?.email || !reg.event) {
        this.logger.error(
          `Cannot generate ticket: Registration ${registrationId} incomplete or not found`,
        );
        return;
      }

      // Generate secure ticket token (JWT)
      const payload = {
        sub: reg.id,
        event_id: reg.eventId,
        user_id: reg.userId,
        kind: 'STUDENT_TICKET',
      };

      const ticketToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30d',
      });

      // Generate PDF
      const pdfBuffer = await TicketGeneratorUtil.generatePdfTicket(
        reg.event as any,
        reg.user.fullName || reg.user.email,
        reg.user.email,
        ticketToken,
      );

      // Send Email
      await this.emailService.sendRegistrationTicket(reg.user.email, reg.event.title, pdfBuffer);

      this.logger.log(
        `Ticket successfully sent to student ${reg.user.email} for registration ${reg.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Background ticket generation failed for registration ${registrationId}: ${error.message}`,
      );
    }
  }
}
