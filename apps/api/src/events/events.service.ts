/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { VenuesService } from './venues.service';
import { AuthUser } from '../auth/jwt.strategy';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly venuesService: VenuesService,
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

    return event;
  }

  async submitForApproval(eventId: string, userId: string) {
    const event = await this.assertOrganizerOrCreator(eventId, userId);
    return this.transitionStatus(event.id, event.statusId, 'PENDING');
  }

  async approve(eventId: string) {
    const event = await this.findOneRaw(eventId);
    return this.transitionStatus(event.id, event.statusId, 'APPROVED');
  }

  async reject(eventId: string, reason?: string) {
    const event = await this.findOneRaw(eventId);
    const updated = await this.transitionStatus(event.id, event.statusId, 'REJECTED');

    await this.prisma.notification.create({
      data: {
        userId: event.createdBy,
        title: 'Event Rejected',
        message: `Your event "${event.title}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'EVENT_REJECTED',
      },
    });

    return updated;
  }

  async cancel(eventId: string, userId: string) {
    const event = await this.assertOrganizerOrCreator(eventId, userId);
    return this.transitionStatus(event.id, event.statusId, 'CANCELLED');
  }

  async goLive(eventId: string) {
    const event = await this.findOneRaw(eventId);
    return this.transitionStatus(event.id, event.statusId, 'LIVE');
  }

  async archive(eventId: string) {
    const event = await this.findOneRaw(eventId);
    return this.transitionStatus(event.id, event.statusId, 'ARCHIVED');
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

      const isAvailable = await this.venuesService.checkAvailability(venueId, startTime, endTime);
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

    return this.prisma.event.update({
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
  }

  // FIND ALL — with status, type, tag and search filters + pagination

  async findAll(query: EventQueryDto) {
    const {
      search,
      date,
      department,
      sortBy,
      status,
      eventType,
      tag,
      page = 1,
      limit = 10,
    } = query;
    const where: any = {};

    if (status) {
      where.status = { statusName: status };
    }

    if (eventType) {
      where.eventTypeId = eventType;
    }

    if (tag) {
      where.tags = { some: { tagId: tag } };
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
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy = this.resolveOrderBy(sortBy);

    const [data, total] = await Promise.all([
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
        sessions: true,
        organizers: {
          where: { status: 'ACCEPTED' },
          include: {
            user: { select: { id: true, fullName: true, email: true, profileImage: true } },
          },
        },
        tags: { include: { tag: true } },
        media: true,
        access: true,
        _count: { select: { registrations: true, feedback: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  // DELETE — Admin or Organizer (if DRAFT)

  async remove(eventId: string, user: AuthUser) {
    const event = await this.findOneRaw(eventId);
    const currentStatus = await this.prisma.eventStatus.findUnique({
      where: { id: event.statusId },
    });

    // Admin can delete any event
    if (user.role === 'Admin') {
      return this.deleteEvent(eventId);
    }

    // Organizer can only delete DRAFT events they created/organize
    if (event.createdBy !== user.id) {
      throw new ForbiddenException('Only the event creator or admin can delete this event');
    }

    if (currentStatus?.statusName !== 'DRAFT') {
      throw new ForbiddenException('Organizers can only delete events in DRAFT status');
    }

    return this.deleteEvent(eventId);
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
    // Delete related records first
    await this.prisma.$transaction([
      this.prisma.eventTags.deleteMany({ where: { eventId } }),
      this.prisma.eventCategory.deleteMany({ where: { eventId } }),
      this.prisma.eventOrganizers.deleteMany({ where: { eventId } }),
      this.prisma.eventInvites.deleteMany({ where: { eventId } }),
      this.prisma.announcements.deleteMany({ where: { eventId } }),
      this.prisma.eventAccess.deleteMany({ where: { eventId } }),
      this.prisma.eventMedia.deleteMany({ where: { eventId } }),
      this.prisma.eventWaitlist.deleteMany({ where: { eventId } }),
      this.prisma.event.delete({ where: { id: eventId } }),
    ]);

    return { message: 'Event deleted successfully' };
  }

  private defaultIncludes() {
    return {
      status: true,
      eventType: true,
      venue: true,
      tags: { include: { tag: true } },
      eventCategories: { include: { category: true } },
    };
  }

  private resolveOrderBy(sortBy?: string): any {
    if (sortBy === 'date') return { startTime: 'asc' };
    if (sortBy === 'popularity') return { registrations: { _count: 'desc' } };
    return { createdAt: 'desc' };
  }
}
