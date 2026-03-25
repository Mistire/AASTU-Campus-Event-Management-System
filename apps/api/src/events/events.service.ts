import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventQueryDto } from './dto/event-query.dto';
import { VenuesService } from './venues.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly venuesService: VenuesService,
  ) {}

  async create(dto: CreateEventDto) {
    const isAvailable = await this.venuesService.checkAvailability(
      dto.venueId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );

    if (!isAvailable) {
      throw new BadRequestException('The venue is already booked for this time range');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        statusId: dto.statusId,
        venueId: dto.venueId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: dto.capacity,
      },
      include: {
        category: true,
        venue: true,
        status: true,
      },
    });
  }

  async findAll(query: EventQueryDto) {
    const { category, date, department, sortBy, search } = query;

    const where: any = {};

    if (category) where.categoryId = category;
    if (date) {
      where.startTime = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }
    if (department) {
      where.organizers = {
        some: {
          user: {
            departmentId: department,
          },
        },
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'date') orderBy.startTime = 'asc';
    if (sortBy === 'popularity') {
      return this.prisma.event.findMany({
        where,
        include: {
          category: true,
          venue: true,
          status: true,
          _count: { select: { registrations: true } },
        },
        orderBy: {
          registrations: { _count: 'desc' },
        },
      });
    }

    return this.prisma.event.findMany({
      where,
      include: {
        category: true,
        venue: true,
        status: true,
        _count: { select: { registrations: true } },
      },
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
    });
  }

  async getUpcoming() {
    return this.prisma.event.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { statusName: 'APPROVED' },
      },
      take: 10,
      orderBy: { startTime: 'asc' },
      include: { category: true, venue: true },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        venue: true,
        status: true,
        sessions: true,
        organizers: { include: { user: true } },
        tags: { include: { tag: true } },
        media: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async updateStatus(id: string, statusId: string) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: { statusId },
      include: { status: true },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id); // Ensure exists

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
      include: {
        category: true,
        venue: true,
        status: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists

    return this.prisma.event.delete({
      where: { id },
    });
  }
}
