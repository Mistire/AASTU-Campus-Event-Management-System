import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

const mockPrisma = {
  user: { count: jest.fn() },
  event: { count: jest.fn() },
  registration: { count: jest.fn() },
  venue: { count: jest.fn() },
  category: { count: jest.fn() },
  attendance: { count: jest.fn() },
};

const mockAuditLogsService = {
  createLog: jest.fn().mockResolvedValue(null),
};

async function buildService(): Promise<AdminService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AdminService,
      { provide: PrismaService, useValue: mockPrisma },
      { provide: AuditLogsService, useValue: mockAuditLogsService },
    ],
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
      mockPrisma.venue.count.mockResolvedValue(9);
      mockPrisma.category.count.mockResolvedValue(6);
      mockPrisma.attendance.count.mockResolvedValue(80);

      mockPrisma.registration.count
        .mockResolvedValueOnce(120) // total
        .mockResolvedValueOnce(33)  // pending
        .mockResolvedValueOnce(4)   // approved
        .mockResolvedValueOnce(2)   // rejected
        .mockResolvedValueOnce(1)   // cancelled
        .mockResolvedValueOnce(7);  // today

      const result = await service.getStats();

      expect(result).toEqual({
        users: 42,
        events: 18,
        registrations: 120,
        venues: 9,
        categories: 6,
        totalAttendance: 80,
        approvedRegistrations: 4,
        pendingRegistrations: 33,
        registrationsToday: 7,
        registrationStatusBreakdown: [
          { status: 'PENDING', count: 33 },
          { status: 'APPROVED', count: 4 },
          { status: 'REJECTED', count: 2 },
          { status: 'CANCELLED', count: 1 },
        ],
      });

      expect(mockPrisma.registration.count).toHaveBeenNthCalledWith(6, {
        where: {
          registrationDate: {
            gte: startOfToday,
          },
        },
      });
      expect(mockPrisma.registration.count).toHaveBeenNthCalledWith(2, {
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
