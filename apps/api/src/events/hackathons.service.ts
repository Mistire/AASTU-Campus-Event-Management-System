/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHackathonDto, UpdateHackathonDto } from './dto/hackathon.dto';

@Injectable()
export class HackathonsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOrganizerOrCreator(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can manage hackathon settings');
    }
    return event;
  }

  async create(eventId: string, userId: string, dto: CreateHackathonDto) {
    await this.assertOrganizerOrCreator(eventId, userId);

    // Only one hackathon config per event
    const existing = await this.prisma.hackathons.findFirst({ where: { eventId } });
    if (existing) {
      throw new ConflictException('This event already has a hackathon configuration. Use PATCH to update it.');
    }

    if (dto.teamSizeMin > dto.teamSizeMax) {
      throw new BadRequestException('teamSizeMin cannot be greater than teamSizeMax');
    }

    return this.prisma.hackathons.create({
      data: {
        eventId,
        teamSizeMin: dto.teamSizeMin,
        teamSizeMax: dto.teamSizeMax,
        submissionDeadline: new Date(dto.submissionDeadline),
        judgingCriteria: dto.judgingCriteria,
      },
    });
  }

  async findByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);

    const hackathon = await this.prisma.hackathons.findFirst({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            _count: { select: { teams: true, judges: true } },
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('No hackathon configuration found for this event');
    }

    return hackathon;
  }

  async update(eventId: string, userId: string, dto: UpdateHackathonDto) {
    await this.assertOrganizerOrCreator(eventId, userId);

    const hackathon = await this.prisma.hackathons.findFirst({ where: { eventId } });
    if (!hackathon) {
      throw new NotFoundException('No hackathon configuration found for this event');
    }

    const newMin = dto.teamSizeMin ?? hackathon.teamSizeMin;
    const newMax = dto.teamSizeMax ?? hackathon.teamSizeMax;
    if (newMin > newMax) {
      throw new BadRequestException('teamSizeMin cannot be greater than teamSizeMax');
    }

    return this.prisma.hackathons.update({
      where: { id: hackathon.id },
      data: {
        ...(dto.teamSizeMin !== undefined && { teamSizeMin: dto.teamSizeMin }),
        ...(dto.teamSizeMax !== undefined && { teamSizeMax: dto.teamSizeMax }),
        ...(dto.submissionDeadline && { submissionDeadline: new Date(dto.submissionDeadline) }),
        ...(dto.judgingCriteria !== undefined && { judgingCriteria: dto.judgingCriteria }),
      },
    });
  }

  async remove(eventId: string, userId: string) {
    await this.assertOrganizerOrCreator(eventId, userId);

    const hackathon = await this.prisma.hackathons.findFirst({ where: { eventId } });
    if (!hackathon) {
      throw new NotFoundException('No hackathon configuration found for this event');
    }

    await this.prisma.hackathons.delete({ where: { id: hackathon.id } });
    return { message: 'Hackathon configuration deleted successfully' };
  }
}
