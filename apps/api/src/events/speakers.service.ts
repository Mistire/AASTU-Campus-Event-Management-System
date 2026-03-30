/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/speaker.dto';

@Injectable()
export class SpeakersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────

  private async assertInvolvedOrganizer(speakerId: string, userId: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id: speakerId },
      include: {
        sessionSpeakers: {
          include: {
            session: {
              select: {
                eventId: true,
              },
            },
          },
        },
      },
    });

    if (!speaker) throw new NotFoundException(`Speaker with ID ${speakerId} not found`);

    // If speaker is not assigned to any sessions, we can't tie it to an event.
    // In this case, we check if the user is an Organizer of ANY event (already handled by RolesGuard).
    // But to be even stricter, we could track who created it.
    // However, the user said "owner of the event", so we check the speaker's assigned events.
    if (speaker.sessionSpeakers.length === 0) {
      // Allow any organizer to manage floating speakers for now
      return speaker;
    }

    const assignedEventIds = speaker.sessionSpeakers.map((ss) => ss.session.eventId);

    // Check if the user is an organizer of at least one of these events
    const validEvents = await this.prisma.event.findMany({
      where: {
        id: { in: assignedEventIds },
        OR: [
          { createdBy: userId },
          { organizers: { some: { userId, status: 'ACCEPTED' } } },
        ],
      },
      select: { id: true },
    });

    if (validEvents.length === 0) {
      throw new ForbiddenException(
        'You are not an authorized organizer for any events associated with this speaker',
      );
    }

    return speaker;
  }

  async create(dto: CreateSpeakerDto) {
    return this.prisma.speaker.create({
      data: {
        fullName: dto.fullName,
        bio: dto.bio,
        profileImage: dto.profileImage,
        organization: dto.organization,
      },
    });
  }

  async findAll() {
    return this.prisma.speaker.findMany({
      include: {
        sessionSpeakers: {
          include: {
            session: {
              select: { id: true, title: true, eventId: true },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        sessionSpeakers: {
          include: {
            session: {
              select: {
                id: true,
                title: true,
                sessionType: true,
                startTime: true,
                endTime: true,
                event: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (!speaker) throw new NotFoundException(`Speaker with ID ${id} not found`);
    return speaker;
  }

  async update(id: string, userId: string, dto: UpdateSpeakerDto) {
    await this.assertInvolvedOrganizer(id, userId);

    return this.prisma.speaker.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
        ...(dto.organization !== undefined && { organization: dto.organization }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.assertInvolvedOrganizer(id, userId);

    // Remove speaker assignments first, then the speaker
    await this.prisma.sessionSpeakers.deleteMany({ where: { speakerId: id } });
    await this.prisma.speaker.delete({ where: { id } });

    return { message: 'Speaker deleted successfully' };
  }
}
