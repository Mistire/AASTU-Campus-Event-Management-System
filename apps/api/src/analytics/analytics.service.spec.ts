import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock ioredis before any imports that use it
jest.mock('ioredis');

import Redis from 'ioredis';

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockPrisma = {
  event: { count: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
  user: { count: jest.fn() },
  registration: { count: jest.fn(), findMany: jest.fn() },
  attendance: { count: jest.fn() },
  eventOrganizers: { findUnique: jest.fn() },
  feedback: { findMany: jest.fn() },
  eventSessions: { findMany: jest.fn() },
  category: { findMany: jest.fn() },
  department: { findMany: jest.fn() },
  eventWaitlist: { count: jest.fn(), findMany: jest.fn() },
};

// ─── Redis instance mock ──────────────────────────────────────────────────────

let mockRedisInstance: {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

beforeEach(() => {
  mockRedisInstance = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  MockRedis.mockImplementation(() => mockRedisInstance as unknown as Redis);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function buildService(): Promise<AnalyticsService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AnalyticsService,
      { provide: PrismaService, useValue: mockPrisma },
      {
        provide: ConfigService,
        useValue: {
          get: (key: string, defaultVal?: unknown) => {
            if (key === 'REDIS_HOST') return 'localhost';
            if (key === 'REDIS_PORT') return 6379;
            return defaultVal;
          },
        },
      },
    ],
  }).compile();

  return module.get<AnalyticsService>(AnalyticsService);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    service = await buildService();
  });

  // ── a. Cache hit ────────────────────────────────────────────────────────────

  describe('getAdminOverview — cache hit', () => {
    it('returns cached value without calling Prisma', async () => {
      const cached = {
        totalEvents: 5,
        totalUsers: 10,
        totalRegistrations: 20,
        totalAttendance: 15,
      };
      mockRedisInstance.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getAdminOverview({});

      expect(result).toEqual(cached);
      expect(mockPrisma.event.count).not.toHaveBeenCalled();
      expect(mockPrisma.user.count).not.toHaveBeenCalled();
    });
  });

  // ── b. Cache miss ───────────────────────────────────────────────────────────

  describe('getAdminOverview — cache miss', () => {
    it('calls Prisma and stores result in Redis', async () => {
      mockRedisInstance.get.mockResolvedValue(null);
      mockPrisma.event.count.mockResolvedValue(3);
      mockPrisma.user.count.mockResolvedValue(7);
      mockPrisma.registration.count.mockResolvedValue(12);
      mockPrisma.attendance.count.mockResolvedValue(9);

      const result = await service.getAdminOverview({});

      expect(mockPrisma.event.count).toHaveBeenCalled();
      expect(mockPrisma.user.count).toHaveBeenCalled();
      expect(mockPrisma.registration.count).toHaveBeenCalled();
      expect(mockPrisma.attendance.count).toHaveBeenCalled();

      expect(result).toEqual({
        totalEvents: 3,
        totalUsers: 7,
        totalRegistrations: 12,
        totalAttendance: 9,
      });

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'analytics:admin:overview',
        JSON.stringify(result),
        'EX',
        300,
      );
    });
  });

  // ── c. refresh=true bypasses cache ─────────────────────────────────────────

  describe('getAdminOverview — refresh=true', () => {
    it('skips cache read and calls Prisma', async () => {
      mockPrisma.event.count.mockResolvedValue(1);
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.registration.count.mockResolvedValue(3);
      mockPrisma.attendance.count.mockResolvedValue(4);

      await service.getAdminOverview({}, true);

      // Redis.get should NOT have been called (cache bypassed)
      expect(mockRedisInstance.get).not.toHaveBeenCalled();
      expect(mockPrisma.event.count).toHaveBeenCalled();
    });
  });

  // ── d. invalidateEventCache ─────────────────────────────────────────────────

  describe('invalidateEventCache', () => {
    it('calls redis.del with the correct key', async () => {
      const eventId = 'event-abc-123';
      await service.invalidateEventCache(eventId);

      expect(mockRedisInstance.del).toHaveBeenCalledWith(`analytics:event:${eventId}`);
    });
  });

  // ── e. Attendance rate = 0 when confirmedRegistrations = 0 ─────────────────

  describe('getEventAnalytics — attendance rate edge case', () => {
    it('returns attendanceRate = 0 when confirmedRegistrations = 0', async () => {
      const eventId = 'event-zero';
      const userId = 'organizer-1';

      // Ownership check passes
      mockPrisma.event.findUnique.mockResolvedValue({ id: eventId, title: 'Zero Event' });
      mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1' });

      // No cached value
      mockRedisInstance.get.mockResolvedValue(null);

      // No registrations at all
      mockPrisma.registration.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      const result = await service.getEventAnalytics(eventId, userId, {});

      expect(result.confirmedRegistrations).toBe(0);
      expect(result.attendanceRate).toBe(0);
    });
  });

  // ── f. Empty export returns a valid buffer ──────────────────────────────────

  describe('exportAnalytics — empty data', () => {
    it('returns a valid (possibly empty) buffer when there is no data', async () => {
      // For admin scope with no data
      mockRedisInstance.get.mockResolvedValue(null);
      mockPrisma.event.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.registration.count.mockResolvedValue(0);
      mockPrisma.attendance.count.mockResolvedValue(0);

      const { buffer } = await service.exportAnalytics('admin', { format: 'csv' }, 'user-1');

      expect(buffer).toBeInstanceOf(Buffer);
    });
  });
});
