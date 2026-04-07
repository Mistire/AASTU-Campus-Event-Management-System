import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const { eventId, sessionId, qrTokenCode } = dto;

    // 1. Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Check if user is registered for the event
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId,
      },
    });
    if (!registration) {
      throw new ConflictException('User is not registered for this event');
    }

    // 3. Verify sessionId if provided
    if (sessionId) {
      const session = await this.prisma.eventSessions.findUnique({
        where: { id: sessionId },
      });
      if (!session || session.eventId !== eventId) {
        throw new NotFoundException('Session not found or belongs to another event');
      }
    }

    // 4. Simple check-in logic (assuming qrTokenCode is verified or just logs check-in)
    // In a real scenario, we'd verify the qrTokenCode against a stored one if applicable.

    // Check if user already checked in (if we want to prevent duplicates for a specific session/event)
    const existingCheckIn = await this.prisma.attendance.findFirst({
      where: {
        userId,
        eventId,
        sessionId: sessionId || null,
      },
    });

    if (existingCheckIn) {
      return existingCheckIn; // Already checked in
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        eventId,
        sessionId,
        qrToken: qrTokenCode,
        checkInTime: new Date(),
      },
    });
  }

  async getAttendanceByEvent(eventId: string) {
    return this.prisma.attendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async getAttendanceStats(eventId: string) {
    const [totalRegistrations, totalCheckins] = await Promise.all([
      this.prisma.registration.count({ where: { eventId } }),
      this.prisma.attendance.findMany({
        where: { eventId },
        distinct: ['userId'],
      }),
    ]);

    return {
      totalRegistrations,
      totalCheckins: totalCheckins.length,
      attendanceRate:
        totalRegistrations > 0 ? (totalCheckins.length / totalRegistrations) * 100 : 0,
    };
  }

  async getGlobalSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalCheckinsToday, totalEvents] = await Promise.all([
      this.prisma.attendance.count({
        where: { checkInTime: { gte: today } },
      }),
      this.prisma.event.count({
        where: { status: { statusName: 'LIVE' } },
      }),
    ]);

    return {
      totalCheckinsToday,
      activeEvents: totalEvents,
      engagementTrend: '+12%', // Mocked trend
    };
  }

  async getEventsParticipation() {
    const events = await this.prisma.event.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            attendance: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      registrations: event._count.registrations,
      checkins: event._count.attendance,
      rate:
        event._count.registrations > 0
          ? (event._count.attendance / event._count.registrations) * 100
          : 0,
    }));
  }

  async getRecentGlobalAttendance() {
    return this.prisma.attendance.findMany({
      take: 20,
      orderBy: { checkInTime: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        event: { select: { title: true } },
      },
    });
  }
}
