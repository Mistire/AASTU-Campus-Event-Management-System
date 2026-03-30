/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnnouncementQueryDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventId: string, userId: string, dto: CreateAnnouncementDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        status: true,
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });

    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);

    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can create announcements');
    }

    const allowedStatuses = ['APPROVED', 'LIVE'];
    if (!allowedStatuses.includes(event.status.statusName)) {
      throw new ForbiddenException(
        `Cannot create announcements for events in "${event.status.statusName}" status. Event must be APPROVED or LIVE.`,
      );
    }

    const announcement = await this.prisma.announcements.create({
      data: {
        eventId,
        title: dto.title,
        message: dto.message,
        createdBy: userId,
      },
      include: {
        event: { select: { id: true, title: true } },
        creator: { select: { id: true, fullName: true } },
      },
    });

    // Notify all registered attendees
    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    if (registrations.length > 0) {
      await this.prisma.notification.createMany({
        data: registrations.map((reg) => ({
          userId: reg.userId,
          title: `Announcement: ${dto.title}`,
          message: dto.message,
          type: 'EVENT_ANNOUNCEMENT',
        })),
      });
    }

    return announcement;
  }

  async findAllByEvent(eventId: string, query: AnnouncementQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.announcements.findMany({
        where: { eventId },
        include: {
          creator: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.announcements.count({ where: { eventId } }),
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

  async getMyAnnouncements(userId: string, query: AnnouncementQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { createdBy: userId },
        { event: { organizers: { some: { userId, status: 'ACCEPTED' } } } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.announcements.findMany({
        where,
        include: {
          event: { select: { id: true, title: true } },
          creator: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.announcements.count({ where }),
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

  async findOne(id: string) {
    const announcement = await this.prisma.announcements.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true } },
        creator: { select: { id: true, fullName: true } },
      },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(id: string, userId: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.findOne(id);

    // Allow any accepted organizer of the linked event to update
    await this.assertEventOrganizer(announcement.eventId, userId);

    return this.prisma.announcements.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.message && { message: dto.message }),
      },
      include: {
        creator: { select: { id: true, fullName: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const announcement = await this.findOne(id);

    // Allow any accepted organizer of the linked event to delete
    await this.assertEventOrganizer(announcement.eventId, userId);

    return this.prisma.announcements.delete({ where: { id } });
  }

  // Helper
  private async assertEventOrganizer(eventId: string, userId: string) {
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
  }
}
