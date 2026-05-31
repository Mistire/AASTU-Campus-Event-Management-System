import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────

  private async assertOrganizerOrCreator(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can manage sessions');
    }
    return event;
  }

  private validateTimeRange(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      throw new BadRequestException('Session endTime must be after startTime');
    }
  }

  private async validateSessionWithinEvent(eventId: string, startTime: Date, endTime: Date) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { startTime: true, endTime: true },
    });
    if (!event) return;

    if (startTime < event.startTime || endTime > event.endTime) {
      throw new BadRequestException(
        `Session time must fall within the event window (${event.startTime.toISOString()} – ${event.endTime.toISOString()})`,
      );
    }
  }

  private async attachSpeakers(sessionId: string, speakerIds: string[]) {
    // Verify all speakers exist
    const speakers = await this.prisma.speaker.findMany({
      where: { id: { in: speakerIds } },
      select: { id: true },
    });

    const foundIds = new Set(speakers.map((s) => s.id));
    const missing = speakerIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(`Speakers not found: ${missing.join(', ')}`);
    }

    await this.prisma.sessionSpeakers.createMany({
      data: speakerIds.map((speakerId) => ({ sessionId, speakerId })),
      skipDuplicates: true,
    });
  }

  private readonly sessionIncludes = {
    speakers: {
      include: {
        speaker: true,
      },
    },
    media: true,
    _count: { select: { attendance: true } },
  };

  // ── CRUD ───────────────────────────────────────────────────────────────

  async create(eventId: string, userId: string, dto: CreateSessionDto) {
    await this.assertOrganizerOrCreator(eventId, userId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.validateTimeRange(startTime, endTime);
    await this.validateSessionWithinEvent(eventId, startTime, endTime);

    const session = await this.prisma.eventSessions.create({
      data: {
        eventId,
        title: dto.title,
        description: dto.description,
        sessionType: dto.sessionType,
        startTime,
        endTime,
        location: dto.location,
      },
      include: this.sessionIncludes,
    });

    if (dto.speakerIds?.length) {
      await this.attachSpeakers(session.id, dto.speakerIds);
      // Re-fetch with speakers
      return this.findOne(session.id);
    }

    return session;
  }

  async findAllByEvent(eventId: string) {
    // Verify event exists
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);

    return this.prisma.eventSessions.findMany({
      where: { eventId },
      include: this.sessionIncludes,
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.eventSessions.findUnique({
      where: { id },
      include: {
        ...this.sessionIncludes,
        event: {
          select: { id: true, title: true, startTime: true, endTime: true },
        },
      },
    });

    if (!session) throw new NotFoundException(`Session with ID ${id} not found`);
    return session;
  }

  async update(id: string, userId: string, dto: UpdateSessionDto) {
    const session = await this.findOne(id);
    await this.assertOrganizerOrCreator(session.eventId, userId);

    // Validate times if changed
    const startTime = dto.startTime ? new Date(dto.startTime) : session.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : session.endTime;

    if (dto.startTime || dto.endTime) {
      this.validateTimeRange(startTime, endTime);
      await this.validateSessionWithinEvent(session.eventId, startTime, endTime);
    }

    // Handle speaker replacement
    if (dto.speakerIds) {
      await this.prisma.sessionSpeakers.deleteMany({ where: { sessionId: id } });
      if (dto.speakerIds.length > 0) {
        await this.attachSpeakers(id, dto.speakerIds);
      }
    }

    return this.prisma.eventSessions.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.sessionType !== undefined && { sessionType: dto.sessionType }),
        ...(dto.startTime && { startTime }),
        ...(dto.endTime && { endTime }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
      include: this.sessionIncludes,
    });
  }

  async remove(id: string, userId: string) {
    const session = await this.findOne(id);
    await this.assertOrganizerOrCreator(session.eventId, userId);

    // Delete related records first
    await this.prisma.$transaction([
      this.prisma.sessionSpeakers.deleteMany({ where: { sessionId: id } }),
      this.prisma.sessionMedia.deleteMany({ where: { sessionId: id } }),
      this.prisma.attendance.deleteMany({ where: { sessionId: id } }),
      this.prisma.eventSessions.delete({ where: { id } }),
    ]);

    return { message: 'Session deleted successfully' };
  }

  // ── Speaker assignment helpers (for direct add/remove) ─────────────────

  async addSpeaker(sessionId: string, speakerId: string, userId: string) {
    const session = await this.findOne(sessionId);
    await this.assertOrganizerOrCreator(session.eventId, userId);

    const speaker = await this.prisma.speaker.findUnique({ where: { id: speakerId } });
    if (!speaker) throw new NotFoundException(`Speaker with ID ${speakerId} not found`);

    const existing = await this.prisma.sessionSpeakers.findFirst({
      where: { sessionId, speakerId },
    });
    if (existing) {
      throw new BadRequestException('Speaker is already assigned to this session');
    }

    return this.prisma.sessionSpeakers.create({
      data: { sessionId, speakerId },
      include: { speaker: true, session: { select: { id: true, title: true } } },
    });
  }

  async removeSpeaker(sessionId: string, speakerId: string, userId: string) {
    const session = await this.findOne(sessionId);
    await this.assertOrganizerOrCreator(session.eventId, userId);

    const assignment = await this.prisma.sessionSpeakers.findFirst({
      where: { sessionId, speakerId },
    });
    if (!assignment) {
      throw new NotFoundException('Speaker is not assigned to this session');
    }

    await this.prisma.sessionSpeakers.delete({ where: { id: assignment.id } });
    return { message: 'Speaker removed from session' };
  }
}
