/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { VenuesService } from './venues.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthUser } from '../auth/jwt.strategy';
import { EmailService } from '../auth/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FeedbackService } from '../feedback/feedback.service';
import { TelegramService } from '../telegram/telegram.service';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  eventStatus: {
    findUnique: jest.fn(),
  },
  eventOrganizers: {
    create: jest.fn(),
  },
  eventTags: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  eventCategory: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
  registration: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockVenuesService = {
  checkAvailability: jest.fn(),
};

const mockEmailService = {
  sendEventLiveEmail: jest.fn(),
};

const mockNotificationsService = {
  enqueueNotification: jest.fn().mockResolvedValue(null),
  enqueueBulkNotifications: jest.fn().mockResolvedValue(null),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn().mockReturnValue({}),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultVal?: unknown) => defaultVal),
};

const mockAuditLogsService = {
  createLog: jest.fn().mockResolvedValue(null),
};

const mockFeedbackService = {
  dispatchFeedbackEmails: jest.fn().mockResolvedValue(null),
};

const mockTelegramService = {
  sendEventAnnouncement: jest.fn().mockResolvedValue(null),
  sendEventLiveAlert: jest.fn().mockResolvedValue(null),
};

const mockUser: AuthUser = {
  id: 'user-id',
  email: 'organizer@aastu.edu.et',
  fullName: 'Test Organizer',
  role: 'Organizer',
  permissions: ['event:create', 'event:read', 'event:update'],
  sessionId: 'session-id',
  isEmailVerified: true,
  isCampusIdVerified: true,
};

const draftStatus = { id: 'draft-status-id', statusName: 'DRAFT' };
const pendingStatus = { id: 'pending-status-id', statusName: 'PENDING' };
const approvedStatus = { id: 'approved-status-id', statusName: 'APPROVED' };

describe('EventsService', () => {
  let service: EventsService;
  let prisma: typeof mockPrismaService;
  let venuesService: typeof mockVenuesService;
  let emailService: typeof mockEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VenuesService, useValue: mockVenuesService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: FeedbackService, useValue: mockFeedbackService },
        { provide: TelegramService, useValue: mockTelegramService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    venuesService = module.get(VenuesService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      title: 'Test Event',
      description: 'Desc',
      eventTypeId: 'type-id',
      venueId: 'venue-id',
      startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      endTime: new Date(Date.now() + 172800000).toISOString(), // day after
      capacity: 100,
    };

    it('should create an event in DRAFT status when venue is available', async () => {
      prisma.eventStatus.findUnique.mockResolvedValue(draftStatus);
      venuesService.checkAvailability.mockResolvedValue(true);
      prisma.event.create.mockResolvedValue({
        id: 'event-id',
        ...createDto,
        statusId: draftStatus.id,
      });
      prisma.eventOrganizers.create.mockResolvedValue({});

      const result = await service.create(mockUser, createDto);

      expect(prisma.eventStatus.findUnique).toHaveBeenCalledWith({
        where: { statusName: 'DRAFT' },
      });
      expect(venuesService.checkAvailability).toHaveBeenCalled();
      expect(prisma.event.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'event-id');
    });

    it('should throw BadRequestException when venue is NOT available', async () => {
      prisma.eventStatus.findUnique.mockResolvedValue(draftStatus);
      venuesService.checkAvailability.mockResolvedValue(false);

      await expect(service.create(mockUser, createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return event details if found', async () => {
      const mockEvent = { id: 'evt-id', title: 'Single' };
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne('evt-id');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should transition from PENDING to APPROVED', async () => {
      const mockEvent = { id: 'evt-id', statusId: pendingStatus.id, status: pendingStatus, createdBy: 'user-id' };
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.eventStatus.findUnique
        .mockResolvedValueOnce(pendingStatus) // current status lookup
        .mockResolvedValueOnce(approvedStatus); // target status lookup
      prisma.event.update.mockResolvedValue({ ...mockEvent, statusId: approvedStatus.id });

      const result = await service.approve('evt-id');
      expect(prisma.event.update).toHaveBeenCalled();
    });
  });

  describe('update — status guard', () => {
    it('should throw ForbiddenException if event is APPROVED', async () => {
      const mockEvent = {
        id: 'evt-id',
        createdBy: mockUser.id,
        statusId: approvedStatus.id,
        venueId: 'venue-id',
        startTime: new Date(),
        endTime: new Date(),
        organizers: [],
      };
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.eventStatus.findUnique.mockResolvedValue(approvedStatus);

      await expect(service.update('evt-id', mockUser.id, { title: 'Updated' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMyOrganizedEvents', () => {
    it('should return events where user is creator or organizer', async () => {
      const mockEvents = [{ id: 'evt-1', title: 'My Event' }];
      prisma.event.findMany.mockResolvedValue(mockEvents);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.getMyOrganizedEvents('user-id', {});

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { createdBy: 'user-id' },
              { organizers: { some: { userId: 'user-id', status: 'ACCEPTED' } } },
            ],
          }),
        }),
      );
      expect(result).toEqual({
        data: mockEvents,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });
});
