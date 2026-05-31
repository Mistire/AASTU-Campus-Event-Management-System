import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

const mockPrismaService = {
  registration: {
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  guestPass: {
    findUnique: jest.fn(),
  },
  attendance: {
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  eventSessions: {
    findUnique: jest.fn(),
  },
  eventInvites: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => defaultValue || 'test-secret'),
};

const mockAuditLogsService = {
  createLog: jest.fn().mockResolvedValue(null),
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: typeof mockPrismaService;
  let jwt: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTicket', () => {
    it('should generate a token for a user with a confirmed registration', async () => {
      prisma.registration.findFirst.mockResolvedValue({ id: 'reg-id', userId: 'user-id', eventId: 'event-id' });
      jwt.sign.mockReturnValue('signed-token');

      const result = await service.getTicket('user-id', 'event-id');

      expect(prisma.registration.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          eventId: 'event-id',
          status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
        },
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({ ticketToken: 'signed-token' });
    });

    it('should throw ForbiddenException if user registration is not found or not confirmed', async () => {
      prisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.getTicket('user-id', 'event-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('checkIn', () => {
    const checkInDto = {
      eventId: 'event-id',
      sessionId: 'session-id',
      ticketToken: 'ticket-token',
    };

    beforeEach(() => {
      prisma.eventSessions.findUnique.mockResolvedValue({ id: 'session-id', eventId: 'event-id' });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.checkIn('organizer-id', checkInDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if organizer is not authorized', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'another-creator',
        organizers: [{ userId: 'another-organizer', status: 'ACCEPTED' }],
      });

      await expect(service.checkIn('unauthorized-id', checkInDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if ticket is invalid or expired', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        organizers: [],
      });
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(service.checkIn('organizer-id', checkInDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if ticket eventId does not match the scanning eventId', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        organizers: [],
      });
      jwt.verify.mockReturnValue({
        sub: 'student-id',
        eventId: 'different-event-id',
      });

      await expect(service.checkIn('organizer-id', checkInDto)).rejects.toThrow(ForbiddenException);
    });

    it('should successfully check-in a confirmed student', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        title: 'Graduation Day',
        organizers: [],
      });
      jwt.verify.mockReturnValue({
        sub: 'student-id',
        eventId: 'event-id',
      });
      prisma.registration.findFirst.mockResolvedValue({ id: 'reg-id' });
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue({ id: 'checkin-id' });

      const result = await service.checkIn('organizer-id', checkInDto);

      expect(prisma.registration.findFirst).toHaveBeenCalled();
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: {
          userId: 'student-id',
          eventId: 'event-id',
          sessionId: 'session-id',
          qrToken: 'ticket-token',
          checkInTime: expect.any(Date),
        },
      });
      expect(result).toEqual({ id: 'checkin-id' });
    });

    it('should return existing checkin and prevent double-scan if student already checked in', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        organizers: [],
      });
      jwt.verify.mockReturnValue({
        sub: 'student-id',
        eventId: 'event-id',
      });
      prisma.registration.findFirst.mockResolvedValue({ id: 'reg-id' });
      prisma.attendance.findFirst.mockResolvedValue({ id: 'existingcheckin-id' });

      const result = await service.checkIn('organizer-id', checkInDto);

      expect(prisma.attendance.create).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'existingcheckin-id' });
    });

    it('should support checkin for graduation guest parent passes', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        title: 'Graduation Ceremony',
        organizers: [],
      });
      jwt.verify.mockReturnValue({
        type: 'GUEST_PASS',
        guestPassId: 'guest-pass-id',
        eventId: 'event-id',
      });
      prisma.guestPass.findUnique.mockResolvedValue({
        id: 'guest-pass-id',
        parentLabel: 'Father',
        graduationRecord: {
          fullName: 'Grad Student',
          tier: 'VIP',
          invite: { eventId: 'event-id' },
        },
      });
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue({ id: 'parent-checkin-id' });

      const result = await service.checkIn('organizer-id', checkInDto);

      expect(prisma.attendance.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'parent-checkin-id',
        guestInfo: {
          parentLabel: 'Father',
          studentName: 'Grad Student',
          tier: 'VIP',
        },
      });
    });
  });

  describe('manualCheckIn', () => {
    it('should successfully manually check-in a confirmed student', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        title: 'Tech Fest',
        organizers: [],
      });
      prisma.registration.findFirst.mockResolvedValue({ id: 'reg-id' });
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue({ id: 'manual-checkin-id' });

      const result = await service.manualCheckIn('organizer-id', 'event-id', 'student-id');

      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: {
          userId: 'student-id',
          eventId: 'event-id',
          sessionId: undefined,
          qrToken: 'MANUAL',
          checkInTime: expect.any(Date),
        },
      });
      expect(result).toEqual({ id: 'manual-checkin-id' });
    });

    it('should throw ConflictException if student is not registered/confirmed', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-id',
        createdBy: 'organizer-id',
        organizers: [],
      });
      prisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.manualCheckIn('organizer-id', 'event-id', 'student-id')).rejects.toThrow(ConflictException);
    });
  });
});
