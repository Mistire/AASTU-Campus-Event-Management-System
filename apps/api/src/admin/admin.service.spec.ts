import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: { count: jest.fn() },
  event: { count: jest.fn() },
  registration: { count: jest.fn() },
  venue: { count: jest.fn() },
  category: { count: jest.fn() },
};

async function buildService(): Promise<AdminService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [AdminService, { provide: PrismaService, useValue: mockPrisma }],
  }).compile();

  return module.get<AdminService>(AdminService);
}

describe('AdminService', () => {
  let service: AdminService;
  let startOfToday: Date;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-08T10:15:00.000Z'));
    startOfToday = new Date('2026-04-08T10:15:00.000Z');
    startOfToday.setHours(0, 0, 0, 0);
    service = await buildService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('returns dashboard aggregates and registration breakdowns', async () => {
      mockPrisma.user.count.mockResolvedValue(42);
      mockPrisma.event.count.mockResolvedValue(18);
      mockPrisma.registration.count
        .mockResolvedValueOnce(120)
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(33)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);
      mockPrisma.venue.count.mockResolvedValue(9);
      mockPrisma.category.count.mockResolvedValue(6);

      const result = await service.getStats();

      expect(result).toEqual({
        users: 42,
        events: 18,
        registrations: 120,
        venues: 9,
        categories: 6,
        registrationsToday: 7,
        registrationStatusBreakdown: [
          { status: 'PENDING', count: 33 },
          { status: 'APPROVED', count: 4 },
          { status: 'REJECTED', count: 2 },
          { status: 'CANCELLED', count: 1 },
        ],
      });

      expect(mockPrisma.registration.count).toHaveBeenNthCalledWith(2, {
        where: {
          registrationDate: {
            gte: startOfToday,
          },
        },
      });
      expect(mockPrisma.registration.count).toHaveBeenNthCalledWith(3, {
        where: {
          status: {
            name: {
              equals: 'PENDING',
              mode: 'insensitive',
            },
          },
        },
      });
    });
  });
});
