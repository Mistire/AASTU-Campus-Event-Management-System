import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from './dto/event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventTypeDto) {
    await this.checkUniqueName(dto.name);

    return this.prisma.eventType.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.eventType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const eventType = await this.prisma.eventType.findUnique({
      where: { id },
    });
    if (!eventType) {
      throw new NotFoundException(`Event type with ID ${id} not found`);
    }
    return eventType;
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      await this.checkUniqueName(dto.name, id);
    }

    return this.prisma.eventType.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const eventsUsingType = await this.prisma.event.count({
      where: { eventTypeId: id },
    });

    if (eventsUsingType > 0) {
      throw new BadRequestException(
        `Cannot delete event type: ${eventsUsingType} event(s) are using this type`,
      );
    }

    return this.prisma.eventType.delete({ where: { id } });
  }

  private async checkUniqueName(name: string, excludeId?: string) {
    const existing = await this.prisma.eventType.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (existing) {
      throw new ConflictException(`Event type with name "${name}" already exists`);
    }
  }
}
