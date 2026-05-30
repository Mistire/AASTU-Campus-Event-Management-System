/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { VenuesService } from './venues.service';
import { AuthUser } from '../auth/jwt.strategy';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../auth/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

import { TicketGeneratorUtil } from './ticket-generator.util';
import { InviteGuestsDto } from './dto/invitation.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FeedbackService } from '../feedback/feedback.service';
import { TelegramService } from '../telegram/telegram.service';

// Allowed status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['LIVE', 'CANCELLED'],
  REJECTED: [],
  LIVE: ['ARCHIVED', 'CANCELLED'],
  CANCELLED: [],
  ARCHIVED: [],
};

// Statuses where organizer can edit the event
const EDITABLE_STATUSES = ['DRAFT', 'PENDING'];

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly venuesService: VenuesService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
    private readonly feedbackService: FeedbackService,
    private readonly telegramService: TelegramService,
  ) {}

  private async getStatusByName(name: string) {
    const status = await this.prisma.eventStatus.findUnique({
      where: { statusName: name },
    });
    if (!status) {
      throw new BadRequestException(`Event status "${name}" not found. Please seed the database.`);
    }
    return status;
  }

  // Helper
  private async assertOrganizerOrCreator(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('You are not an organizer of this event');
    }
    return event;
  }

  async create(user: AuthUser, dto: CreateEventDto) {
    const draftStatus = await this.getStatusByName('DRAFT');

    const isAvailable = await this.venuesService.checkAvailability(
      dto.venueId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );
    if (!isAvailable) {
      throw new BadRequestException('The venue is already booked for this time range');
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (start <= new Date()) {
      throw new BadRequestException('startTime must be in the future');
    }

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventTypeId: dto.eventTypeId,
        venueId: dto.venueId,
        createdBy: user.id,
        statusId: draftStatus.id,
        startTime: start,
        endTime: end,
        capacity: dto.capacity,
        requiresApproval: dto.requiresApproval ?? false,

        ...(dto.tagIds?.length && {
          tags: {
            create: dto.tagIds.map((tagId) => ({ tagId })),
          },
        }),

        ...(dto.categoryIds?.length && {
          eventCategories: {
            create: dto.categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),

        ...(dto.sessions?.length && {
          sessions: {
            create: dto.sessions.map((s) => ({
              title: s.title,
              description: s.description,
              startTime: new Date(s.startTime),
              endTime: new Date(s.endTime),
              location: s.location,
              sessionType: s.sessionType,
              speakers: s.speakers?.length
                ? {
                    create: s.speakers.map((name) => ({
                      speaker: {
                        create: {
                          fullName: name,
                        },
                      },
                    })),
                  }
                : undefined,
            })),
          },
        }),

        ...(dto.hackathonConfig && {
          hackathons: {
            create: {
              teamSizeMin: dto.hackathonConfig.teamSizeMin,
              teamSizeMax: dto.hackathonConfig.teamSizeMax,
              submissionDeadline: new Date(dto.hackathonConfig.submissionDeadline),
              judgingCriteria: dto.hackathonConfig.judgingCriteria,
            },
          },
        }),

        access: {
          create: {
            accessType: dto.accessType || 'PUBLIC',
            requiresApproval: dto.accessType === 'INVITE_ONLY' || (dto.requiresApproval ?? false),
          },
        },

        invites: {
          create: (dto.invites || []).map((email) => ({
            invitedEmail: email,
            invitedBy: user.id,
            status: 'PENDING',
          })),
        },

        ...(dto.thumbnailUrl && {
          media: {
            create: [
              {
                fileUrl: dto.thumbnailUrl,
                mediaType: 'THUMBNAIL',
              },
            ],
          },
        }),
      },
      include: this.defaultIncludes(),
    });

    await this.prisma.eventOrganizers.create({
      data: {
        eventId: event.id,
        userId: user.id,
        role: 'Creator',
        status: 'ACCEPTED',
      },
    });

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId: user.id,
        action: 'CREATE_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event created: "${event.title}"`,
        afterState: event,
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    return event;
  }

  async submitForApproval(eventId: string, userId: string) {
    const event = await this.assertOrganizerOrCreator(eventId, userId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'PENDING');

    if (!event.createdBy) {
      throw new BadRequestException('Event creator not found');
    }

    // 1. Notify the owner (creator)
    await this.notificationsService.enqueueNotification(
      event.createdBy,
      'Event Submitted',
      `Your event "${event.title}" has been submitted for approval and is now pending.`,
      NotificationType.EVENT_SUBMITTED_OWNER,
    );

    // 2. Notify all Admins
    const admins = await this.prisma.user.findMany({
      where: { role: { roleName: 'ADMIN' } },
      select: { id: true },
    });

    if (admins.length > 0) {
      await this.notificationsService.enqueueBulkNotifications(
        admins.map((admin) => admin.id),
        'New Event Pending Approval',
        `Event "${event.title}" has been submitted for approval.`,
        NotificationType.EVENT_SUBMITTED,
      );
    }

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId,
        action: 'SUBMIT_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event submitted for approval: "${event.title}"`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    return updated;
  }

  async approve(eventId: string, adminId?: string) {
    const event = await this.findOneRaw(eventId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'APPROVED');

    if (!event.createdBy) {
      throw new BadRequestException('Event creator not found');
    }

    await this.notificationsService.enqueueNotification(
      event.createdBy,
      'Event Approved',
      `Your event "${event.title}" has been approved and is now ready.`,
      NotificationType.EVENT_APPROVED,
    );

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId: adminId || event.createdBy || 'SYSTEM', 
        action: 'APPROVE_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event approved: "${event.title}"${adminId ? ` by admin ${adminId}` : ''}`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    // Post announcement to Telegram channel (fire-and-forget)
    this.telegramService.sendEventAnnouncement(updated).catch((err) =>
      this.logger.error(`Telegram announce failed for "${event.title}": ${err.message}`),
    );

    return updated;
  }

  async reject(eventId: string, adminId?: string, reason?: string) {
    const event = await this.findOneRaw(eventId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'REJECTED');

    if (!event.createdBy) {
      throw new BadRequestException('Event creator not found');
    }

    await this.notificationsService.enqueueNotification(
      event.createdBy,
      'Event Rejected',
      `Your event "${event.title}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      NotificationType.EVENT_REJECTED,
    );

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId: adminId || event.createdBy || 'SYSTEM',
        action: 'REJECT_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event rejected: "${event.title}"${reason ? `. Reason: ${reason}` : ''}${adminId ? ` by admin ${adminId}` : ''}`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    return updated;
  }

  async cancel(eventId: string, userId: string) {
    const event = await this.assertOrganizerOrCreator(eventId, userId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'CANCELLED');

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId,
        action: 'CANCEL_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event cancelled: "${event.title}"`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    return updated;
  }

  async goLive(eventId: string, userId?: string) {
    if (userId) {
      await this.assertOrganizerOrCreator(eventId, userId);
    }
    const event = await this.findOneRaw(eventId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'LIVE');

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId: userId || event.createdBy || 'SYSTEM',
        action: 'GO_LIVE',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event went live: "${event.title}"`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    // Notify all registered attendees
    const registrations = await this.prisma.registration.findMany({
      where: { eventId, deletedAt: null },
      include: { user: { select: { id: true, email: true } } },
    });

    if (registrations.length > 0) {
      const attendeeIds = registrations.map((r) => r.userId);
      const attendeeEmails = registrations.map((r) => r.user.email);

      // 1. In-app notifications
      await this.notificationsService.enqueueBulkNotifications(
        attendeeIds,
        'Event is LIVE!',
        `The event "${event.title}" has officially started. Join now!`,
        NotificationType.EVENT_LIVE,
      );

      // 2. Email notifications
      await this.emailService.sendEventLiveEmail(attendeeEmails, event.title);
    }

    // Post live alert to Telegram channel (fire-and-forget)
    this.telegramService.sendEventLiveAlert(updated).catch((err) =>
      this.logger.error(`Telegram live alert failed for "${event.title}": ${err.message}`),
    );

    return updated;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCronGoLive() {
    const now = new Date();
    const approvedEvents = await this.prisma.event.findMany({
      where: {
        status: { statusName: 'APPROVED' },
        startTime: { lte: now },
      },
    });

    if (approvedEvents.length === 0) return;

    this.logger.log(`Cron: Setting ${approvedEvents.length} approved events to LIVE`);

    for (const event of approvedEvents) {
      try {
        await this.goLive(event.id);
      } catch (error) {
        this.logger.error(`Failed to set event ${event.id} to LIVE: ${error.message}`);
      }
    }
  }

  async archive(eventId: string, userId: string) {
    await this.assertOrganizerOrCreator(eventId, userId);
    const event = await this.findOneRaw(eventId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'ARCHIVED');

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId,
        action: 'ARCHIVE_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        outcome: 'SUCCESS',
        details: `Event archived: "${event.title}"`,
        beforeState: { ...event },
        afterState: { ...updated },
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    // Dispatch feedback request emails to all attendees
    try {
      await this.feedbackService.dispatchFeedbackEmails(eventId);
    } catch (e) {
      this.logger.error(`Failed to dispatch feedback emails for event ${eventId}: ${e.message}`);
    }

    return updated;
  }

  async remove(eventId: string, user: AuthUser) {
    const event = await this.assertOrganizerOrCreator(eventId, user.id);

    const draftStatus = await this.getStatusByName('DRAFT');
    if (event.statusId !== draftStatus.id) {
      throw new BadRequestException('Only DRAFT events can be deleted');
    }

    return this.prisma.event.delete({ where: { id: eventId } });
  }

  async update(eventId: string, userId: string, dto: UpdateEventDto) {
    const event = await this.assertOrganizerOrCreator(eventId, userId);

    // Get current status name
    const currentStatus = await this.prisma.eventStatus.findUnique({
      where: { id: event.statusId },
    });

    if (!currentStatus || !EDITABLE_STATUSES.includes(currentStatus.statusName)) {
      throw new ForbiddenException(
        `Cannot edit an event with status "${currentStatus?.statusName}". Events can only be edited in DRAFT or PENDING status.`,
      );
    }

    // If venue or time changed, re-check availability
    if (dto.venueId || dto.startTime || dto.endTime) {
      const venueId = dto.venueId || event.venueId;
      const startTime = dto.startTime ? new Date(dto.startTime) : event.startTime;
      const endTime = dto.endTime ? new Date(dto.endTime) : event.endTime;

      const isAvailable = await this.venuesService.checkAvailability(
        venueId,
        startTime,
        endTime,
        eventId,
      );
      if (!isAvailable) {
        throw new BadRequestException('The venue is already booked for this time range');
      }
    }

    // Handle tag replacement
    if (dto.tagIds) {
      await this.prisma.eventTags.deleteMany({ where: { eventId } });
      if (dto.tagIds.length > 0) {
        await this.prisma.eventTags.createMany({
          data: dto.tagIds.map((tagId) => ({ eventId, tagId })),
        });
      }
    }

    // Handle category replacement
    if (dto.categoryIds) {
      await this.prisma.eventCategory.deleteMany({ where: { eventId } });
      if (dto.categoryIds.length > 0) {
        await this.prisma.eventCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({ eventId, categoryId })),
        });
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.eventTypeId && { eventTypeId: dto.eventTypeId }),
        ...(dto.venueId && { venueId: dto.venueId }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.capacity && { capacity: dto.capacity }),
        ...(dto.requiresApproval !== undefined && { requiresApproval: dto.requiresApproval }),
      },
      include: this.defaultIncludes(),
    });

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId,
        action: 'UPDATE_EVENT',
        entityType: 'EVENT',
        entityId: eventId,
        outcome: 'SUCCESS',
        details: `Event updated: "${updatedEvent.title}"`,
        beforeState: event,
        afterState: updatedEvent,
      });
    } catch (e) {
      this.logger.error(`Failed to create audit log: ${e.message}`);
    }

    return updatedEvent;
  }

  // FIND ALL — with status, type, tag and search filters + pagination

  async findAll(query: EventQueryDto, user?: AuthUser) {
    const {
      search,
      date,
      department,
      sortBy,
      status,
      eventType,
      tag,
      categoryId,
      venueId,
      createdById,
      upcomingOnly,
      page = 1,
      limit = 10,
    } = query;
    const where: any = {};

    // 1. Enforce Status Visibility Logic
    const userRole = user?.role?.toUpperCase();

    if (userRole === 'ADMIN') {
      // Admins see whatever they specifically filter for, or everything if no filter
      if (status) {
        where.status = { statusName: status };
      } else {
        where.status = { statusName: { not: 'ARCHIVED' } };
      }
    } else {
      // Non-Admins: Students, Organizers, or Guests (undefined user)
      if (status) {
        // If a specific status is requested, verify permission
        if (['APPROVED', 'LIVE'].includes(status)) {
          where.status = { statusName: status };
        } else if (user) {
          // Attempting to see DRAFT/PENDING: only if they are the creator or organizer
          where.AND = [
            { status: { statusName: status } },
            {
              OR: [
                { createdBy: user.id },
                { organizers: { some: { userId: user.id, status: 'ACCEPTED' } } },
              ],
            },
          ];
        } else {
          // Guest cannot see non-public statuses
          where.status = { statusName: { in: ['APPROVED', 'LIVE'] } };
        }
      } else {
        // Default View: Show APPROVED and LIVE events
        if (user) {
          // PLUS show the user's own DRAFT/PENDING events if they are an organizer
          where.OR = [
            { status: { statusName: { in: ['APPROVED', 'LIVE'] } } },
            {
              AND: [
                { status: { statusName: { in: ['DRAFT', 'PENDING'] } } },
                {
                  OR: [
                    { createdBy: user.id },
                    { organizers: { some: { userId: user.id, status: 'ACCEPTED' } } },
                  ],
                },
              ],
            },
          ];
        } else {
          // Guest only sees public events
          where.status = { statusName: { in: ['APPROVED', 'LIVE'] } };
        }
      }
    }

    if (upcomingOnly) {
      where.endTime = { gte: new Date() };
    }

    // if (status) { // Removed as it is handled by the visibility logic above
    //   where.status = { statusName: status };
    // }

    if (venueId) {
      where.venueId = venueId;
    }

    if (createdById) {
      where.createdBy = createdById;
    }

    if (eventType) {
      where.eventTypeId = eventType;
    }

    if (tag) {
      where.tags = { some: { tagId: tag } };
    }

    if (categoryId) {
      where.eventCategories = { some: { categoryId: categoryId } };
    }

    if (date) {
      where.startTime = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (department) {
      where.organizers = {
        some: {
          user: { departmentId: department },
          status: 'ACCEPTED',
        },
      };
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy = this.resolveOrderBy(sortBy);

    const [data, total, stats] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          ...this.defaultIncludes(),
          _count: { select: { registrations: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
      this.prisma.event.groupBy({
        by: ['statusId'],
        _count: { _all: true },
        where: { ...where, status: undefined }, // Get global totals for the status breakdown
      }),
    ]);

    // Map status names to counts for the frontend
    const allStatuses = await this.prisma.eventStatus.findMany();
    const statusStats = allStatuses.reduce(
      (acc, s) => {
        const match = stats.find((st) => st.statusId === s.id);
        acc[s.statusName] = match?._count._all || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: statusStats,
      },
    };
  }

  // MY ORGANIZED — events where user is creator or accepted co-organizer

  async getMyOrganizedEvents(userId: string, query: EventQueryDto) {
    const { search, status, page = 1, limit = 10 } = query;

    const where: any = {
      OR: [{ createdBy: userId }, { organizers: { some: { userId, status: 'ACCEPTED' } } }],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (status) {
      where.status = { statusName: status };
    } else {
      where.status = { statusName: { not: 'ARCHIVED' } };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          ...this.defaultIncludes(),
          _count: { select: { registrations: true } },
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // UPCOMING — approved/live events in the future

  async getUpcoming() {
    return this.prisma.event.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { statusName: { in: ['APPROVED', 'LIVE'] } },
      },
      take: 10,
      orderBy: { startTime: 'asc' },
      include: this.defaultIncludes(),
    });
  }

  // FIND ONE — full details

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        status: true,
        eventType: true,
        venue: true,
        creator: {
          select: { id: true, fullName: true, email: true, profileImage: true },
        },
        eventCategories: { include: { category: true } },
        sessions: {
          include: {
            speakers: { include: { speaker: true } },
            media: true,
            _count: { select: { attendance: true } },
          },
          orderBy: { startTime: 'asc' },
        },
        organizers: {
          where: { status: 'ACCEPTED' },
          include: {
            user: { select: { id: true, fullName: true, email: true, profileImage: true } },
          },
        },
        tags: { include: { tag: true } },
        media: true,
        access: true,
        formFields: { orderBy: { id: 'asc' } },
        hackathons: true,
        _count: { select: { registrations: true, feedback: true, teams: true, judges: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  // PRIVATE HELPERS

  private async findOneRaw(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  private async transitionStatus(
    eventId: string,
    currentStatusId: string,
    targetStatusName: string,
  ) {
    const currentStatus = await this.prisma.eventStatus.findUnique({
      where: { id: currentStatusId },
    });

    if (!currentStatus) {
      throw new BadRequestException('Current event status not found');
    }

    const allowed = STATUS_TRANSITIONS[currentStatus.statusName] || [];
    if (!allowed.includes(targetStatusName)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus.statusName}" to "${targetStatusName}". Allowed transitions: ${allowed.join(', ') || 'none'}`,
      );
    }

    const targetStatus = await this.getStatusByName(targetStatusName);

    return this.prisma.event.update({
      where: { id: eventId },
      data: { statusId: targetStatus.id },
      include: this.defaultIncludes(),
    });
  }

  private async deleteEvent(eventId: string) {
    // Delete related records in proper order (deepest children first)
    // 1. Session children (speakers, media, attendance with sessionId)
    const sessionIds = (
      await this.prisma.eventSessions.findMany({
        where: { eventId },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (sessionIds.length > 0) {
      await this.prisma.$transaction([
        this.prisma.sessionSpeakers.deleteMany({ where: { sessionId: { in: sessionIds } } }),
        this.prisma.sessionMedia.deleteMany({ where: { sessionId: { in: sessionIds } } }),
        this.prisma.attendance.deleteMany({ where: { sessionId: { in: sessionIds } } }),
      ]);
    }

    // 2. Form response children
    const formFieldIds = (
      await this.prisma.formFields.findMany({
        where: { eventId },
        select: { id: true },
      })
    ).map((f) => f.id);

    if (formFieldIds.length > 0) {
      await this.prisma.formResponses.deleteMany({ where: { fieldId: { in: formFieldIds } } });
    }

    // 3. Delete all direct children and the event
    await this.prisma.$transaction([
      this.prisma.eventSessions.deleteMany({ where: { eventId } }),
      this.prisma.eventTags.deleteMany({ where: { eventId } }),
      this.prisma.eventCategory.deleteMany({ where: { eventId } }),
      this.prisma.eventOrganizers.deleteMany({ where: { eventId } }),
      this.prisma.eventInvites.deleteMany({ where: { eventId } }),
      this.prisma.announcements.deleteMany({ where: { eventId } }),
      this.prisma.eventAccess.deleteMany({ where: { eventId } }),
      this.prisma.eventMedia.deleteMany({ where: { eventId } }),
      this.prisma.eventWaitlist.deleteMany({ where: { eventId } }),
      this.prisma.formFields.deleteMany({ where: { eventId } }),
      this.prisma.hackathons.deleteMany({ where: { eventId } }),
      this.prisma.event.delete({ where: { id: eventId } }),
    ]);

    return { message: 'Event deleted successfully' };
  }

  async inviteGuests(eventId: string, userId: string, dto: InviteGuestsDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true, eventType: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.guestLimitPerUser || event.guestLimitPerUser <= 0) {
      throw new BadRequestException('This event does not support guest invitations.');
    }

    // Ensure the inviter is fully registered & CONFIRMED
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId,
        status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
      },
    });

    if (!registration) {
      throw new ForbiddenException('You must have a CONFIRMED registration to invite guests.');
    }

    // Check how many guests the user has already invited
    const existingInvitesCount = await this.prisma.eventInvites.count({
      where: { eventId, invitedBy: userId },
    });

    if (existingInvitesCount + dto.emails.length > event.guestLimitPerUser) {
      throw new BadRequestException(
        `You cannot invite more than ${event.guestLimitPerUser} guests. You have already invited ${existingInvitesCount}.`,
      );
    }

    const createdInvites: any[] = [];

    for (const email of dto.emails) {
      // Check if email is already invited
      const existing = await this.prisma.eventInvites.findUnique({
        where: { eventId_invitedEmail: { eventId, invitedEmail: email } },
      });

      if (existing) {
        continue; // Skip silently
      }

      const invite = await this.prisma.eventInvites.create({
        data: {
          eventId,
          invitedEmail: email,
          invitedBy: userId,
          status: 'ACCEPTED', // Guest tickets are auto-accepted
        },
      });

      // Generate Ticket Token for Guest
      const guestPayload = { sub: invite.id, eventId, isGuest: true };
      const ticketToken = this.jwtService.sign(guestPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30d',
      });

      // Generate PDF
      try {
        const pdfBuffer = await TicketGeneratorUtil.generatePdfTicket(
          event as any,
          email,
          email,
          ticketToken,
        );

        // Send Email
        await this.emailService.sendRegistrationTicket(email, event.title, pdfBuffer);

        createdInvites.push(invite);
      } catch (err) {
        this.logger.error(`Failed to generate or send ticket for ${email}. err: ${err.message}`);
      }
    }

    return {
      message: `Successfully invited ${createdInvites.length} guests.`,
      invites: createdInvites,
    };
  }

  private defaultIncludes() {
    return {
      status: true,
      eventType: true,
      venue: true,
      media: true,
      creator: true,
      tags: { include: { tag: true } },
      eventCategories: { include: { category: true } },
      sessions: {
        include: {
          speakers: { include: { speaker: true } },
        },
        orderBy: { startTime: 'asc' as const },
      },
    };
  }

  private resolveOrderBy(sortBy?: string): any {
    if (sortBy === 'date') return { startTime: 'asc' };
    if (sortBy === 'popularity') return { registrations: { _count: 'desc' } };
    return { startTime: 'asc' };
  }
}
