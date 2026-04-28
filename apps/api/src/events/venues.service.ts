/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';
import { VenueQueryDto, VenueAvailabilityQueryDto } from './dto/venue-query.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VenuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateVenueDto, userId?: string) {
    const venue = await this.prisma.venue.create({ data: dto });

    if (userId) {
      try {
        await this.auditLogsService.createLog({
          userId,
          action: 'CREATE_VENUE',
          entityType: 'VENUE',
          entityId: venue.id,
          outcome: 'SUCCESS',
          details: `Venue created: "${venue.name}"`,
          afterState: venue,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }
    }

    return venue;
  }

  async findAll(query: VenueQueryDto) {
    const { search, minCapacity, maxCapacity, page = 1, limit = 10 } = query;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { building: { contains: search, mode: 'insensitive' } },
        { roomNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minCapacity || maxCapacity) {
      where.capacity = {};
      if (minCapacity) where.capacity.gte = minCapacity;
      if (maxCapacity) where.capacity.lte = maxCapacity;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where }),
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

  async findAvailable(query: VenueAvailabilityQueryDto) {
    const startTime = new Date(query.startTime);
    const endTime = new Date(query.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const where: any = {};

    if (query.minCapacity) {
      where.capacity = { gte: query.minCapacity };
    }

    // Find venues that do NOT have overlapping approved/live events
    const busyVenueIds = await this.prisma.event.findMany({
      where: {
        status: {
          statusName: { in: ['APPROVED', 'LIVE'] },
        },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
      select: { venueId: true },
      distinct: ['venueId'],
    });

    const busyIds = busyVenueIds.map((e) => e.venueId);

    if (busyIds.length > 0) {
      where.id = { notIn: busyIds };
    }

    return this.prisma.venue.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async checkAvailability(venueId: string, startTime: Date, endTime: Date): Promise<boolean> {
    await this.findOne(venueId);

    const conflict = await this.prisma.event.findFirst({
      where: {
        venueId,
        status: {
          statusName: { in: ['APPROVED', 'LIVE'] },
        },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    return !conflict;
  }

  async findOne(id: string, includeEvents?: boolean) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: includeEvents
        ? {
            events: {
              where: {
                startTime: { gte: new Date() },
                status: { statusName: { in: ['APPROVED', 'LIVE'] } },
              },
              orderBy: { startTime: 'asc' },
              include: {
                status: true,
                eventType: true,
              },
            },
          }
        : undefined,
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, userId?: string) {
    const before = await this.findOne(id);
    const venue = await this.prisma.venue.update({ where: { id }, data: dto });

    if (userId) {
      try {
        await this.auditLogsService.createLog({
          userId,
          action: 'UPDATE_VENUE',
          entityType: 'VENUE',
          entityId: venue.id,
          outcome: 'SUCCESS',
          details: `Venue updated: "${venue.name}"`,
          beforeState: before,
          afterState: venue,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }
    }

    return venue;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);

    const upcomingEvents = await this.prisma.event.count({
      where: {
        venueId: id,
        endTime: { gte: new Date() },
        status: {
          statusName: { in: ['APPROVED', 'LIVE', 'PENDING'] },
        },
      },
    });

    if (upcomingEvents > 0) {
      throw new BadRequestException(
        `Cannot delete venue: ${upcomingEvents} upcoming event(s) are booked at this venue`,
      );
    }

    const venue = await this.prisma.venue.delete({ where: { id } });

    if (userId) {
      try {
        await this.auditLogsService.createLog({
          userId,
          action: 'DELETE_VENUE',
          entityType: 'VENUE',
          entityId: id,
          outcome: 'SUCCESS',
          details: `Venue deleted: "${venue.name}"`,
          beforeState: venue,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }
    }

    return venue;
  }
}
