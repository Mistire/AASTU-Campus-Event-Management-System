import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed relative to src/events
import { VenuesService } from './venues.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockVenuesService = {
  checkAvailability: jest.fn(),
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: typeof mockPrismaService;
  let venuesService: typeof mockVenuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VenuesService, useValue: mockVenuesService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    venuesService = module.get(VenuesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
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
      expect(prisma.event.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'event-id');
    });

    it('should throw BadRequestException when venue is NOT available', async () => {
      venuesService.checkAvailability.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

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
      const mockEvent = { id: 'evt-id', title: 'Single' };
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne('evt-id');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'evt-id' } }),
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the event', async () => {
      const mockEvent = { id: 'evt-id', title: 'Old Title' };
      const updateDto: UpdateEventDto = { title: 'New Title' };

      prisma.event.findUnique.mockResolvedValue(mockEvent); // Make findOne pass
      prisma.event.update.mockResolvedValue({ ...mockEvent, ...updateDto });

      const result = await service.update('evt-id', updateDto);

      expect(result.title).toEqual('New Title');
      expect(prisma.event.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete the event if found', async () => {
      const mockEvent = { id: 'evt-id', title: 'Old Title' };
      prisma.event.findUnique.mockResolvedValue(mockEvent); // Make findOne pass
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove('evt-id');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'evt-id' } });
    });
  });
});
