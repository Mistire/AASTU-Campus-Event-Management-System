import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolveTimeRange } from './time-range.util';

// Mock ioredis before any imports that use it
jest.mock('ioredis');

import Redis from 'ioredis';

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  event: { count: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
  user: { count: jest.fn(), findMany: jest.fn() },
  registration: { count: jest.fn(), findMany: jest.fn() },
  attendance: { count: jest.fn(), findMany: jest.fn() },
  eventOrganizers: { findUnique: jest.fn() },
  feedback: { findMany: jest.fn() },
  eventSessions: { findMany: jest.fn() },
  category: { findMany: jest.fn() },
  department: { findMany: jest.fn() },
  eventWaitlist: { count: jest.fn(), findMany: jest.fn() },
};

// ─── Redis instance mock ──────────────────────────────────────────────────────

let mockRedisInstance: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

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

// ─── Helper: build service ────────────────────────────────────────────────────

async function buildService(): Promise<AnalyticsService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AnalyticsService,
      { provide: PrismaService, useValue: mockPrisma },
      {
        provide: ConfigService,
        useValue: {
          get: (key: string) => {
            if (key === 'REDIS_URL') return 'redis://localhost:6379';
            return undefined;
          },
        },
      },
    ],
  }).compile();
  return module.get(AnalyticsService);
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const registrationStatus = fc.constantFrom('CONFIRMED', 'CANCELLED', 'PENDING');

const registrationArb = registrationStatus.map((name) => ({ status: { name } }));

const ratingArb = fc.integer({ min: 1, max: 5 });

const uuidArb = fc.uuid();

// ─── Property 1: Event analytics counts match DB state ───────────────────────

describe('Property 1 — Event analytics counts match DB state', () => {
  it('totalRegistrations, confirmedRegistrations, cancelledRegistrations and attendanceRate are always consistent', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(
        fc.array(registrationArb, { minLength: 0, maxLength: 50 }),
        fc.nat({ max: 100 }),
        async (registrations, attendanceCount) => {
          const eventId = 'evt-1';
          const userId = 'usr-1';

          mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
          mockPrisma.event.findUnique.mockResolvedValue({ id: eventId, title: 'Test Event' });
          mockPrisma.registration.findMany.mockResolvedValue(registrations);
          mockPrisma.attendance.count.mockResolvedValue(attendanceCount);

          const result = await service.getEventAnalytics(eventId, userId, {});

          const confirmed = registrations.filter(
            (r) => r.status.name.toUpperCase() === 'CONFIRMED',
          ).length;
          const cancelled = registrations.filter(
            (r) => r.status.name.toUpperCase() === 'CANCELLED',
          ).length;
          const expectedRate = confirmed > 0 ? (attendanceCount / confirmed) * 100 : 0;

          expect(result.totalRegistrations).toBe(registrations.length);
          expect(result.confirmedRegistrations).toBe(confirmed);
          expect(result.cancelledRegistrations).toBe(cancelled);
          expect(result.attendanceRate).toBeCloseTo(expectedRate, 5);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 2: Organizer ownership ─────────────────────────────────────────

describe('Property 2 — Organizer ownership enforcement', () => {
  it('throws ForbiddenException when user is not an organizer', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(uuidArb, uuidArb, async (eventId, userId) => {
        mockPrisma.event.findUnique.mockResolvedValue({ id: eventId });
        mockPrisma.eventOrganizers.findUnique.mockResolvedValue(null);

        await expect(service.getEventAnalytics(eventId, userId, {})).rejects.toThrow(
          ForbiddenException,
        );
      }),
      { numRuns: 30 },
    );
  });
});

// ─── Property 3: Session completeness ────────────────────────────────────────

describe('Property 3 — Session completeness', () => {
  it('response has exactly N entries for N sessions', async () => {
    const service = await buildService();

    const sessionArb = fc.array(
      fc.record({
        id: uuidArb,
        title: fc.string({ minLength: 1, maxLength: 30 }),
        attendance: fc.array(fc.record({ id: uuidArb }), { maxLength: 20 }),
      }),
      { minLength: 0, maxLength: 20 },
    );

    await fc.assert(
      fc.asyncProperty(sessionArb, async (sessions) => {
        mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
        mockPrisma.event.findUnique.mockResolvedValue({ id: 'evt-1' });
        mockPrisma.eventSessions.findMany.mockResolvedValue(sessions);

        const result = await service.getSessionAnalytics('evt-1', 'usr-1');

        expect(result).toHaveLength(sessions.length);
        result.forEach((entry, i) => {
          expect(entry.checkIns).toBe(sessions[i].attendance.length);
        });
      }),
      { numRuns: 50 },
    );
  });
});

// ─── Property 4: Feedback consistency ────────────────────────────────────────

describe('Property 4 — Feedback consistency', () => {
  it('averageRating = mean of ratings and distribution sums to total', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          ratingArb.map((r) => ({ rating: r })),
          { minLength: 0, maxLength: 100 },
        ),
        async (feedbackRecords) => {
          mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
          mockPrisma.event.findUnique.mockResolvedValue({ id: 'evt-1' });
          mockPrisma.feedback.findMany.mockResolvedValue(feedbackRecords);

          const result = await service.getFeedbackAnalytics('evt-1', 'usr-1');

          const total = feedbackRecords.length;
          const expectedAvg =
            total > 0 ? feedbackRecords.reduce((s, f) => s + f.rating, 0) / total : 0;

          expect(result.totalFeedback).toBe(total);
          expect(result.averageRating).toBeCloseTo(expectedAvg, 5);

          const distSum = result.distribution.reduce((s, d) => s + d.count, 0);
          expect(distSum).toBe(total);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 6: Top events ordering ─────────────────────────────────────────

describe('Property 6 — Top events ordering', () => {
  it('result has ≤ 10 entries and is sorted descending by attendance rate', async () => {
    const service = await buildService();

    // Shape matches the Prisma select in getTopEvents:
    // { id, title, registrations: [{ status: { name } }], attendance: [{ id }] }
    const eventRowArb = fc.record({
      id: uuidArb,
      title: fc.string({ minLength: 1, maxLength: 30 }),
      registrations: fc.array(fc.record({ status: fc.record({ name: registrationStatus }) }), {
        minLength: 0,
        maxLength: 20,
      }),
      attendance: fc.array(fc.record({ id: uuidArb }), { minLength: 0, maxLength: 20 }),
    });

    await fc.assert(
      fc.asyncProperty(fc.array(eventRowArb, { minLength: 0, maxLength: 30 }), async (events) => {
        mockPrisma.event.findMany.mockResolvedValue(events);

        const result = await service.getTopEvents({});

        expect(result.length).toBeLessThanOrEqual(10);

        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].attendanceRate).toBeGreaterThanOrEqual(result[i].attendanceRate);
        }
      }),
      { numRuns: 50 },
    );
  });
});

// ─── Property 10: Time range filtering ───────────────────────────────────────

describe('Property 10 — Time range filtering', () => {
  it('only records within the range are counted', async () => {
    const service = await buildService();

    // Use a fixed range: 2025-01-01 to 2025-01-31
    const rangeStart = new Date('2025-01-01T00:00:00Z');
    const rangeEnd = new Date('2025-01-31T23:59:59Z');

    const dateArb = fc.date({
      min: new Date('2024-11-01'),
      max: new Date('2025-03-31'),
    });

    await fc.assert(
      fc.asyncProperty(fc.array(dateArb, { minLength: 0, maxLength: 50 }), async (dates) => {
        const inRange = dates.filter((d) => d >= rangeStart && d <= rangeEnd);

        mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
        mockPrisma.event.findUnique.mockResolvedValue({ id: 'evt-1', title: 'T' });
        mockPrisma.registration.findMany.mockResolvedValue(
          inRange.map(() => ({ status: { name: 'CONFIRMED' } })),
        );
        mockPrisma.attendance.count.mockResolvedValue(0);

        const result = await service.getEventAnalytics('evt-1', 'usr-1', {
          startDate: rangeStart.toISOString(),
          endDate: rangeEnd.toISOString(),
        });

        expect(result.totalRegistrations).toBe(inRange.length);
      }),
      { numRuns: 30 },
    );
  });
});

// ─── Property 11: Preset resolution ──────────────────────────────────────────

describe('Property 11 — Preset resolution', () => {
  const presets: Array<{ key: string; days: number }> = [
    { key: 'last_7_days', days: 7 },
    { key: 'last_30_days', days: 30 },
    { key: 'last_90_days', days: 90 },
  ];

  it.each(presets)('preset $key resolves to correct offset from now', ({ key, days }) => {
    const before = Date.now();
    const { start, end } = resolveTimeRange({ preset: key });
    const after = Date.now();

    // start should be approximately (now - days)
    const expectedStartMin = before - days * 24 * 60 * 60 * 1000 - 1000;
    const expectedStartMax = after - days * 24 * 60 * 60 * 1000 + 1000;

    expect(start.getTime()).toBeGreaterThanOrEqual(expectedStartMin);
    expect(start.getTime()).toBeLessThanOrEqual(expectedStartMax);
    expect(end.getTime()).toBeGreaterThanOrEqual(before);
    expect(end.getTime()).toBeLessThanOrEqual(after + 1000);
  });

  it('no preset defaults to last 30 days', () => {
    const before = Date.now();
    const { start, end } = resolveTimeRange({});
    const after = Date.now();

    const expectedStartMin = before - 30 * 24 * 60 * 60 * 1000 - 1000;
    expect(start.getTime()).toBeGreaterThanOrEqual(expectedStartMin);
    expect(end.getTime()).toBeGreaterThanOrEqual(before);
    expect(end.getTime()).toBeLessThanOrEqual(after + 1000);
  });
});

// ─── Property 12: Invalid time ranges ────────────────────────────────────────

describe('Property 12 — Invalid time ranges throw BadRequestException', () => {
  it('throws when startDate > endDate', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
        fc.nat({ max: 365 }),
        (end, offsetDays) => {
          const start = new Date(end.getTime() + (offsetDays + 1) * 24 * 60 * 60 * 1000);
          expect(() =>
            resolveTimeRange({ startDate: start.toISOString(), endDate: end.toISOString() }),
          ).toThrow(BadRequestException);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('throws when endDate is more than 5 years in the past', () => {
    fc.assert(
      fc.property(fc.nat({ max: 365 * 3 }), (extraDays) => {
        // 5 * 365.25 = 1826.25 days; add extra + 10 to be safely past the boundary
        const fiveYearsMs = 5 * 365.25 * 24 * 60 * 60 * 1000;
        const oldEnd = new Date(Date.now() - fiveYearsMs - (extraDays + 10) * 24 * 60 * 60 * 1000);
        const oldStart = new Date(oldEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        expect(() =>
          resolveTimeRange({
            startDate: oldStart.toISOString(),
            endDate: oldEnd.toISOString(),
          }),
        ).toThrow(BadRequestException);
      }),
      { numRuns: 50 },
    );
  });
});

// ─── Property 13: Trend series completeness ──────────────────────────────────

describe('Property 13 — Trend series completeness', () => {
  it('daily series has exactly (end - start + 1) days with zero-fill', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 89 }), async (spanDays) => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date(start.getTime() + spanDays * 24 * 60 * 60 * 1000);

        mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
        mockPrisma.event.findUnique.mockResolvedValue({ id: 'evt-1' });
        mockPrisma.registration.findMany.mockResolvedValue([]);

        const result = await service.getEventTrends('evt-1', 'usr-1', {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        expect(result.length).toBe(spanDays + 1);
        result.forEach((pt) => expect(pt.count).toBe(0));
      }),
      { numRuns: 30 },
    );
  });

  it('weekly series is used when range > 90 days', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 91, max: 365 }), async (spanDays) => {
        const start = new Date('2024-01-01T00:00:00Z');
        const end = new Date(start.getTime() + spanDays * 24 * 60 * 60 * 1000);

        mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
        mockPrisma.event.findUnique.mockResolvedValue({ id: 'evt-1' });
        mockPrisma.registration.findMany.mockResolvedValue([]);

        const result = await service.getEventTrends('evt-1', 'usr-1', {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        // Weekly series: each point is a week start; should be fewer points than days
        expect(result.length).toBeLessThan(spanDays);
        result.forEach((pt) => expect(pt.count).toBe(0));
      }),
      { numRuns: 20 },
    );
  });
});

// ─── Property 14: Organizer trend scoping ────────────────────────────────────

describe('Property 14 — Organizer trend scoping', () => {
  it('getEventTrends only returns data for the requested event', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        fc.array(
          fc.record({
            registrationDate: fc.date({ min: new Date('2025-01-01'), max: new Date('2025-01-31') }),
          }),
          { minLength: 0, maxLength: 20 },
        ),
        async (eventId, otherEventId, regs) => {
          fc.pre(eventId !== otherEventId);

          mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
          mockPrisma.event.findUnique.mockResolvedValue({ id: eventId });
          // Only return regs for the requested event (Prisma where clause is mocked)
          mockPrisma.registration.findMany.mockResolvedValue(regs);

          const result = await service.getEventTrends(eventId, 'usr-1', {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          });

          const totalCount = result.reduce((s, pt) => s + pt.count, 0);
          expect(totalCount).toBe(regs.length);
        },
      ),
      { numRuns: 30 },
    );
  });
});

// ─── Property 15: Engagement metrics ─────────────────────────────────────────

describe('Property 15 — Engagement metrics', () => {
  it('activeUsers = distinct users and bucket counts sum to activeUsers', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ userId: fc.constantFrom('u1', 'u2', 'u3', 'u4', 'u5') }), {
          minLength: 0,
          maxLength: 50,
        }),
        async (registrations) => {
          mockPrisma.registration.findMany.mockResolvedValueOnce(registrations);
          mockPrisma.user.findMany.mockResolvedValue([]);
          mockPrisma.eventWaitlist.count.mockResolvedValue(0);
          mockPrisma.eventWaitlist.findMany.mockResolvedValue([]);

          const result = await service.getUserEngagement({});

          const distinctUsers = new Set(registrations.map((r) => r.userId)).size;
          expect(result.activeUsers).toBe(distinctUsers);

          const bucketSum = result.repeatEngagement.reduce((s, b) => s + b.count, 0);
          expect(bucketSum).toBe(distinctUsers);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 16: Cache invalidation ─────────────────────────────────────────

describe('Property 16 — Cache invalidation', () => {
  it('invalidateEventCache deletes the correct Redis key', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(uuidArb, async (eventId) => {
        await service.invalidateEventCache(eventId);
        expect(mockRedisInstance.del).toHaveBeenCalledWith(`analytics:event:${eventId}`);
      }),
      { numRuns: 30 },
    );
  });
});

// ─── Property 17: CSV structure ──────────────────────────────────────────────

describe('Property 17 — CSV structure', () => {
  it('exportAnalytics CSV has correct row count for admin scope', async () => {
    const service = await buildService();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          totalEvents: fc.nat({ max: 1000 }),
          totalUsers: fc.nat({ max: 10000 }),
          totalRegistrations: fc.nat({ max: 50000 }),
          attendanceCount: fc.nat({ max: 50000 }),
        }),
        async (overview) => {
          mockPrisma.event.count.mockResolvedValue(overview.totalEvents);
          mockPrisma.user.count.mockResolvedValue(overview.totalUsers);
          mockPrisma.registration.count.mockResolvedValue(overview.totalRegistrations);
          mockPrisma.attendance.count.mockResolvedValue(overview.attendanceCount);

          const { buffer, filename } = await service.exportAnalytics(
            'admin',
            { format: 'csv' },
            'usr-1',
          );
          const csv = buffer.toString('utf-8');

          // 1 header row + 1 data row
          const lines = csv.split('\n').filter((l) => l.trim().length > 0);
          expect(lines.length).toBe(2);
          expect(filename).toMatch(/^analytics-admin-.*\.csv$/);
        },
      ),
      { numRuns: 20 },
    );
  });

  it('returns empty CSV (header only or empty) when no data', async () => {
    const service = await buildService();

    mockPrisma.event.count.mockResolvedValue(0);
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.registration.count.mockResolvedValue(0);
    mockPrisma.attendance.count.mockResolvedValue(0);

    const { buffer } = await service.exportAnalytics('admin', { format: 'csv' }, 'usr-1');
    // Should not throw; buffer should be defined
    expect(buffer).toBeDefined();
  });
});

// ─── Property 18: Content-Disposition header ─────────────────────────────────

describe('Property 18 — Content-Disposition filename pattern', () => {
  it('exportAnalytics filename matches analytics-{scope}-{startDate}-{endDate}.{ext}', async () => {
    const service = await buildService();

    const scopeArb = fc.constantFrom('admin', 'evt-abc', 'evt-xyz');
    const formatArb = fc.constantFrom('csv', 'pdf');

    await fc.assert(
      fc.asyncProperty(scopeArb, formatArb, async (scope, format) => {
        if (scope !== 'admin') {
          mockPrisma.eventOrganizers.findUnique.mockResolvedValue({ id: 'org-1', status: 'ACCEPTED' });
          mockPrisma.event.findUnique.mockResolvedValue({ id: scope, title: 'T' });
          mockPrisma.registration.findMany.mockResolvedValue([]);
          mockPrisma.attendance.count.mockResolvedValue(0);
        } else {
          mockPrisma.event.count.mockResolvedValue(0);
          mockPrisma.user.count.mockResolvedValue(0);
          mockPrisma.registration.count.mockResolvedValue(0);
          mockPrisma.attendance.count.mockResolvedValue(0);
        }

        const fmt = format as 'csv' | 'pdf';
        const { filename } = await service.exportAnalytics(scope, { format: fmt }, 'usr-1');
        const ext = format === 'pdf' ? 'pdf' : 'csv';
        const pattern = new RegExp(
          `^analytics-${scope}-\\d{4}-\\d{2}-\\d{2}-\\d{4}-\\d{2}-\\d{2}\\.${ext}$`,
        );
        expect(filename).toMatch(pattern);
      }),
      { numRuns: 20 },
    );
  });
});
