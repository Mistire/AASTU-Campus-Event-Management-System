import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogsService: AuditLogsService,
  ) {}

  async getTicket(userId: string, eventId: string) {
    // Check if user has a confirmed registration
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId,
        status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
      },
    });

    if (!registration) {
      throw new ForbiddenException('User does not have a confirmed registration for this event');
    }

    const payload = { sub: userId, eventId, registrationId: registration.id };
    const ticketToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30d', // generous duration for the event lifecycle
    });

    return { ticketToken };
  }

  async checkIn(organizerId: string, dto: CheckInDto) {
    const { eventId, sessionId, ticketToken } = dto;

    // 1. Verify event exists and the user is an organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isCreator = event.createdBy === organizerId;
    const isOrganizer = event.organizers.some(
      (org) => org.userId === organizerId && org.status === 'ACCEPTED',
    );

    if (!isCreator && !isOrganizer) {
      throw new ForbiddenException('You are not an authorized organizer for this event');
    }

    // 2. Decode the ticketToken
    let decoded: any;
    try {
      decoded = this.jwtService.verify(ticketToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (err) {
      throw new ForbiddenException('Invalid or expired ticket token');
    }

    // Support both student ticket formats and standard formats
    const isStudentTicket = decoded.kind === 'STUDENT_TICKET' || decoded.user_id;
    const attendeeId = isStudentTicket ? decoded.user_id : decoded.sub;
    const ticketEventId = isStudentTicket ? decoded.event_id : decoded.eventId;
    const isGuest = decoded.isGuest;
    const tokenType = decoded.type; // 'GUEST_PASS' for graduation parent QR codes

    if (ticketEventId !== eventId) {
      throw new ForbiddenException('Ticket is not valid for this event');
    }

    // ── Graduation Parent Guest Pass ──────────────────────────────────────────
    if (tokenType === 'GUEST_PASS') {
      const guestPassId = decoded.guestPassId;
      const guestPass = await this.prisma.guestPass.findUnique({
        where: { id: guestPassId },
        include: {
          graduationRecord: {
            include: { invite: { select: { eventId: true } } },
          },
        },
      });

      if (!guestPass || guestPass.graduationRecord.invite.eventId !== eventId) {
        throw new ForbiddenException('Guest pass is invalid or not for this event');
      }

      // Prevent double-scan: check by qrToken uniqueness
      const existingCheckIn = await this.prisma.attendance.findFirst({
        where: { qrToken: ticketToken, eventId },
      });
      if (existingCheckIn) {
        return {
          ...existingCheckIn,
          alreadyCheckedIn: true,
          message: 'Guest pass already used — attendee was previously checked in',
        };
      }

      const checkin = await this.prisma.attendance.create({
        data: {
          eventId,
          sessionId,
          qrToken: ticketToken,
          checkInTime: new Date(),
          // userId / inviteId intentionally null — this is a parent guest
        },
      });

      try {
        await this.auditLogsService.createLog({
          userId: organizerId,
          action: 'EVENT_CHECKIN',
          entityType: 'ATTENDANCE',
          entityId: checkin.id,
          outcome: 'SUCCESS',
          details: `Graduation parent guest check-in for event: "${event.title}" — ${guestPass.parentLabel}`,
          afterState: checkin,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

      return {
        ...checkin,
        message: `Guest checked in: ${guestPass.parentLabel}`,
        guestInfo: {
          parentLabel: guestPass.parentLabel,
          studentName: guestPass.graduationRecord.fullName,
          tier: guestPass.graduationRecord.tier,
        },
      };
    }

    // 3. Verify session if provided
    if (sessionId) {
      const session = await this.prisma.eventSessions.findUnique({
        where: { id: sessionId },
      });
      if (!session || session.eventId !== eventId) {
        throw new NotFoundException('Session not found or belongs to another event');
      }
    }

    if (isGuest) {
      // 4a. Check if guest invite is valid
      const invite = await this.prisma.eventInvites.findUnique({
        where: { id: attendeeId },
      });

      if (!invite || invite.eventId !== eventId) {
        throw new ConflictException('Guest invite is invalid or not found');
      }

      // 5a. Check if guest already checked in
      const existingCheckIn = await this.prisma.attendance.findFirst({
        where: {
          inviteId: attendeeId,
          eventId,
          sessionId: sessionId || null,
        },
      });

      if (existingCheckIn)
        return {
          ...existingCheckIn,
          alreadyCheckedIn: true,
          message: 'Guest was already checked in',
        };

      const checkin = await this.prisma.attendance.create({
        data: {
          inviteId: attendeeId, // userId left null for guests
          eventId,
          sessionId,
          qrToken: ticketToken,
          checkInTime: new Date(),
        },
      });

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId: organizerId,
          action: 'EVENT_CHECKIN',
          entityType: 'ATTENDANCE',
          entityId: checkin.id,
          outcome: 'SUCCESS',
          details: `Guest check-in for event: "${event.title}"`,
          afterState: checkin,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

      return { ...checkin, message: 'Guest successfully checked in!' };
    } else {
      // 4b. Check if attendee is registered and CONFIRMED
      const registration = await this.prisma.registration.findFirst({
        where: {
          userId: attendeeId,
          eventId,
          status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
        },
      });

      if (!registration) {
        throw new ConflictException('Attendee is not confirmed for this event');
      }

      // 5b. Check if user already checked in
      const existingCheckIn = await this.prisma.attendance.findFirst({
        where: {
          userId: attendeeId,
          eventId,
          sessionId: sessionId || null,
        },
      });

      if (existingCheckIn) {
        return {
          ...existingCheckIn,
          alreadyCheckedIn: true,
          message: 'Attendee was already checked in',
        };
      }

      const checkin = await this.prisma.attendance.create({
        data: {
          userId: attendeeId,
          eventId,
          sessionId,
          qrToken: ticketToken,
          checkInTime: new Date(),
        },
      });

      // Audit Log
      try {
        await this.auditLogsService.createLog({
          userId: organizerId,
          action: 'EVENT_CHECKIN',
          entityType: 'ATTENDANCE',
          entityId: checkin.id,
          outcome: 'SUCCESS',
          details: `Student check-in for event: "${event.title}"`,
          afterState: checkin,
        });
      } catch (e) {
        console.error(`Failed to create audit log: ${e.message}`);
      }

      return { ...checkin, message: 'Attendee successfully checked in!' };
    }
  }

  async manualCheckIn(organizerId: string, eventId: string, userId: string, sessionId?: string) {
    // 1. Verify event exists and the user is an organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizers: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isCreator = event.createdBy === organizerId;
    const isOrganizer = event.organizers.some(
      (org) => org.userId === organizerId && org.status === 'ACCEPTED',
    );

    if (!isCreator && !isOrganizer) {
      throw new ForbiddenException('You are not an authorized organizer for this event');
    }

    // 2. Check if attendee is registered and CONFIRMED
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId,
        status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
      },
    });

    if (!registration) {
      throw new ConflictException('Attendee is not confirmed for this event');
    }

    // 3. Check if user already checked in
    const existingCheckIn = await this.prisma.attendance.findFirst({
      where: {
        userId,
        eventId,
        sessionId: sessionId || null,
      },
    });

    if (existingCheckIn) {
      return existingCheckIn;
    }

    const checkin = await this.prisma.attendance.create({
      data: {
        userId,
        eventId,
        sessionId,
        qrToken: 'MANUAL',
        checkInTime: new Date(),
      },
    });

    // Audit Log
    try {
      await this.auditLogsService.createLog({
        userId: organizerId,
        action: 'EVENT_CHECKIN_MANUAL',
        entityType: 'ATTENDANCE',
        entityId: checkin.id,
        outcome: 'SUCCESS',
        details: `Manual check-in for event: "${event.title}"`,
        afterState: checkin,
      });
    } catch (e) {
      console.error(`Failed to create audit log: ${e.message}`);
    }

    return checkin;
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
        invite: {
          select: {
            invitedEmail: true,
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
        distinct: ['userId', 'inviteId'],
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
        invite: { select: { invitedEmail: true } },
        event: { select: { title: true } },
      },
    });
  }
}
