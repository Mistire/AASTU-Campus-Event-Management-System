/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { VenuesService } from './venues.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthUser } from '../auth/jwt.strategy';
import { EmailService } from '../auth/email.service';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
<<<<<<< HEAD
  },
=======
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
>>>>>>> dev
};

const mockVenuesService = {
  checkAvailability: jest.fn(),
};

const mockEmailService = {
  sendEventLiveEmail: jest.fn(),
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
<<<<<<< HEAD
=======
  let emailService: typeof mockEmailService;
>>>>>>> dev

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VenuesService, useValue: mockVenuesService },
<<<<<<< HEAD
=======
        { provide: EmailService, useValue: mockEmailService },
>>>>>>> dev
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    venuesService = module.get(VenuesService);
<<<<<<< HEAD
=======
    emailService = module.get(EmailService);
>>>>>>> dev
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
<<<<<<< HEAD
    const createDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Desc',
      categoryId: 'cat-id',
      statusId: 'stat-id',
      venueId: 'venue-id',
      startTime: '2026-03-20T10:00:00.000Z',
      endTime: '2026-03-20T12:00:00.000Z',
      capacity: 100,
    };

    it('should successfully create an event when venue is available', async () => {
      venuesService.checkAvailability.mockResolvedValue(true);
      prisma.event.create.mockResolvedValue({ id: 'event-id', ...createDto });

      const result = await service.create(createDto);

      expect(venuesService.checkAvailability).toHaveBeenCalledWith(
        'venue-id',
        new Date(createDto.startTime),
        new Date(createDto.endTime),
      );
=======
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
>>>>>>> dev
      expect(prisma.event.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'event-id');
    });

    it('should throw BadRequestException when venue is NOT available', async () => {
<<<<<<< HEAD
      venuesService.checkAvailability.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
=======
      prisma.eventStatus.findUnique.mockResolvedValue(draftStatus);
      venuesService.checkAvailability.mockResolvedValue(false);

      await expect(service.create(mockUser, createDto)).rejects.toThrow(BadRequestException);
>>>>>>> dev
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  describe('findAll', () => {
    it('should return an array of events', async () => {
      prisma.event.findMany.mockResolvedValue([{ id: '1', title: 'Evt' }]);
      const result = await service.findAll({});
      expect(result).toEqual([{ id: '1', title: 'Evt' }]);
      expect(prisma.event.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific event by id if found', async () => {
=======
  describe('findOne', () => {
    it('should return event details if found', async () => {
>>>>>>> dev
      const mockEvent = { id: 'evt-id', title: 'Single' };
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne('evt-id');
      expect(result).toEqual(mockEvent);
<<<<<<< HEAD
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'evt-id' } }),
      );
=======
>>>>>>> dev
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
<<<<<<< HEAD

=======
>>>>>>> dev
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

<<<<<<< HEAD
  describe('update', () => {
    it('should update and return the event', async () => {
      const mockEvent = { id: 'evt-id', title: 'Old Title' };
      const updateDto: UpdateEventDto = { title: 'New Title' };

      prisma.event.findUnique.mockResolvedValue(mockEvent); // Make findOne pass
      prisma.event.update.mockResolvedValue({ ...mockEvent, ...updateDto });

      const result = await service.update('evt-id', updateDto);

      expect(result.title).toEqual('New Title');
=======
  describe('approve', () => {
    it('should transition from PENDING to APPROVED', async () => {
      const mockEvent = { id: 'evt-id', statusId: pendingStatus.id, status: pendingStatus };
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.eventStatus.findUnique
        .mockResolvedValueOnce(pendingStatus) // current status lookup
        .mockResolvedValueOnce(approvedStatus); // target status lookup
      prisma.event.update.mockResolvedValue({ ...mockEvent, statusId: approvedStatus.id });

      const result = await service.approve('evt-id');
>>>>>>> dev
      expect(prisma.event.update).toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  describe('remove', () => {
    it('should delete the event if found', async () => {
      const mockEvent = { id: 'evt-id', title: 'Old Title' };
      prisma.event.findUnique.mockResolvedValue(mockEvent); // Make findOne pass
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove('evt-id');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'evt-id' } });
=======
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
          where: {
            OR: [
              { createdBy: 'user-id' },
              { organizers: { some: { userId: 'user-id', status: 'ACCEPTED' } } },
            ],
          },
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
>>>>>>> dev
    });
  });
});
