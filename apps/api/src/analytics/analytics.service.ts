import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminOverviewDto,
  CategoryAnalyticsDto,
  DepartmentAnalyticsDto,
  EventAnalyticsDto,
  FeedbackAnalyticsDto,
  SessionAnalyticsDto,
  TopEventDto,
  TrendPointDto,
  UserEngagementDto,
} from './dto/response.dto';
import { ExportQueryDto } from './dto/export-query.dto';
import { TimeRangeDto } from './dto/time-range.dto';
import { resolveTimeRange } from './time-range.util';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  private resolveTimeRange(dto: TimeRangeDto): { start: Date; end: Date } {
    return resolveTimeRange(dto);
  }

  private async getCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (err) {
      this.logger.warn(`Redis read failed for key ${key}: ${err}`);
      return null;
    }
  }

  private async setCached<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      this.logger.warn(`Redis write failed for key ${key}: ${err}`);
    }
  }

  async invalidateEventCache(eventId: string): Promise<void> {
    const key = `analytics:event:${eventId}`;
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Redis delete failed for key ${key}: ${err}`);
    }
  }

  private async assertEventOrganizer(eventId: string, userId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, createdBy: true },
    });

    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    // Primary organizer (event creator) always has access
    if (event.createdBy === userId) return;

    // Co-organizer: must have an ACCEPTED invitation in EventOrganizers
    const organizer = await this.prisma.eventOrganizers.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { id: true, status: true },
    });

    if (!organizer || organizer.status !== 'ACCEPTED') {
      throw new ForbiddenException('You are not an organizer of this event');
    }
  }

  async getEventAnalytics(
    eventId: string,
    userId: string,
    query: TimeRangeDto,
  ): Promise<EventAnalyticsDto> {
    await this.assertEventOrganizer(eventId, userId);

    const cacheKey = `analytics:event:${eventId}`;

    const cached = await this.getCached<EventAnalyticsDto>(cacheKey);
    if (cached) return cached;

    const { start, end } = this.resolveTimeRange(query);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    // event existence already checked in assertEventOrganizer
    const [registrations, attendanceCount] = await Promise.all([
      this.prisma.registration.findMany({
        where: {
          eventId,
          registrationDate: { gte: start, lte: end },
        },
        select: { status: { select: { name: true } } },
      }),
      this.prisma.attendance.count({
        where: {
          eventId,
          sessionId: null,
          checkInTime: { gte: start, lte: end },
        },
      }),
    ]);

    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter(
      (r) => r.status.name.toUpperCase() === 'CONFIRMED',
    ).length;
    const cancelledRegistrations = registrations.filter(
      (r) => r.status.name.toUpperCase() === 'CANCELLED',
    ).length;
    const attendanceRate =
      confirmedRegistrations > 0 ? (attendanceCount / confirmedRegistrations) * 100 : 0;

    const result: EventAnalyticsDto = {
      eventId,
      title: event!.title,
      totalRegistrations,
      confirmedRegistrations,
      cancelledRegistrations,
      attendanceCount,
      attendanceRate,
    };

    await this.setCached(cacheKey, result, 300);

    return result;
  }

  async getSessionAnalytics(eventId: string, userId: string): Promise<SessionAnalyticsDto[]> {
    await this.assertEventOrganizer(eventId, userId);

    const sessions = await this.prisma.eventSessions.findMany({
      where: { eventId },
      select: {
        id: true,
        title: true,
        attendance: { select: { id: true } },
      },
    });

    return sessions.map((s) => ({
      sessionId: s.id,
      title: s.title,
      checkIns: s.attendance.length,
    }));
  }

  async getFeedbackAnalytics(eventId: string, userId: string): Promise<FeedbackAnalyticsDto> {
    await this.assertEventOrganizer(eventId, userId);

    const feedbackRecords = await this.prisma.feedback.findMany({
      where: { eventId },
      select: { rating: true },
    });

    const totalFeedback = feedbackRecords.length;
    const averageRating =
      totalFeedback > 0 ? feedbackRecords.reduce((sum, f) => sum + f.rating, 0) / totalFeedback : 0;

    const distributionMap = new Map<number, number>();
    for (let score = 1; score <= 5; score++) {
      distributionMap.set(score, 0);
    }
    for (const f of feedbackRecords) {
      distributionMap.set(f.rating, (distributionMap.get(f.rating) ?? 0) + 1);
    }

    const distribution = Array.from(distributionMap.entries()).map(([score, count]) => ({
      score,
      count,
    }));

    return { averageRating, totalFeedback, distribution };
  }

  async getEventTrends(
    eventId: string,
    userId: string,
    query: TimeRangeDto,
  ): Promise<TrendPointDto[]> {
    await this.assertEventOrganizer(eventId, userId);

    const { start, end } = this.resolveTimeRange(query);

    const registrations = await this.prisma.registration.findMany({
      where: {
        eventId,
        registrationDate: { gte: start, lte: end },
      },
      select: { registrationDate: true },
    });

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const useWeekly = diffDays > 90;

    if (useWeekly) {
      return buildWeeklySeries(
        start,
        end,
        registrations.map((r) => r.registrationDate),
      );
    } else {
      return buildDailySeries(
        start,
        end,
        registrations.map((r) => r.registrationDate),
      );
    }
  }

  async getAdminOverview(query: TimeRangeDto, refresh?: boolean): Promise<AdminOverviewDto> {
    const cacheKey = 'analytics:admin:overview';

    if (!refresh) {
      const cached = await this.getCached<AdminOverviewDto>(cacheKey);
      if (cached) return cached;
    }

    const [totalEvents, totalUsers, totalRegistrations, totalAttendance] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.user.count(),
      this.prisma.registration.count(),
      this.prisma.attendance.count(),
    ]);

    const result: AdminOverviewDto = {
      totalEvents,
      totalUsers,
      totalRegistrations,
      totalAttendance,
    };

    await this.setCached(cacheKey, result, 300);

    return result;
  }

  async getTopEvents(query: TimeRangeDto): Promise<TopEventDto[]> {
    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex').slice(0, 8);
    const cacheKey = `analytics:admin:top-events:${hash}`;

    const cached = await this.getCached<TopEventDto[]>(cacheKey);
    if (cached) return cached;

    const { start, end } = this.resolveTimeRange(query);

    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        title: true,
        registrations: {
          where: { registrationDate: { gte: start, lte: end } },
          select: { status: { select: { name: true } } },
        },
        attendance: {
          where: { sessionId: null, checkInTime: { gte: start, lte: end } },
          select: { id: true },
        },
      },
    });

    const mapped: TopEventDto[] = events.map((e) => {
      const registrations = e.registrations.length;
      const confirmed = e.registrations.filter(
        (r) => r.status.name.toUpperCase() === 'CONFIRMED',
      ).length;
      const attendance = e.attendance.length;
      const attendanceRate = confirmed > 0 ? (attendance / confirmed) * 100 : 0;
      return { eventId: e.id, title: e.title, registrations, attendance, attendanceRate };
    });

    const result = mapped.sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 10);

    await this.setCached(cacheKey, result, 300);

    return result;
  }

  async getCategoryAnalytics(query: TimeRangeDto): Promise<CategoryAnalyticsDto[]> {
    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex').slice(0, 8);
    const cacheKey = `analytics:admin:categories:${hash}`;

    const cached = await this.getCached<CategoryAnalyticsDto[]>(cacheKey);
    if (cached) return cached;

    const { start, end } = this.resolveTimeRange(query);

    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        eventCategories: {
          select: {
            event: {
              select: {
                registrations: {
                  where: { registrationDate: { gte: start, lte: end } },
                  select: { status: { select: { name: true } } },
                },
                attendance: {
                  where: { sessionId: null, checkInTime: { gte: start, lte: end } },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    const result: CategoryAnalyticsDto[] = categories.map((cat) => {
      let registrations = 0;
      let confirmed = 0;
      let attendance = 0;

      for (const ec of cat.eventCategories) {
        registrations += ec.event.registrations.length;
        confirmed += ec.event.registrations.filter(
          (r) => r.status.name.toUpperCase() === 'CONFIRMED',
        ).length;
        attendance += ec.event.attendance.length;
      }

      const attendanceRate = confirmed > 0 ? (attendance / confirmed) * 100 : 0;
      return { categoryId: cat.id, name: cat.name, registrations, attendanceRate };
    });

    await this.setCached(cacheKey, result, 300);

    return result;
  }

  async getDepartmentAnalytics(query: TimeRangeDto): Promise<DepartmentAnalyticsDto[]> {
    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex').slice(0, 8);
    const cacheKey = `analytics:admin:departments:${hash}`;

    const cached = await this.getCached<DepartmentAnalyticsDto[]>(cacheKey);
    if (cached) return cached;

    const { start, end } = this.resolveTimeRange(query);

    const departments = await this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        users: {
          select: {
            registrations: {
              where: { registrationDate: { gte: start, lte: end } },
              select: { id: true },
            },
          },
        },
      },
    });

    const result: DepartmentAnalyticsDto[] = departments.map((dept) => {
      const registrations = dept.users.reduce((sum, u) => sum + u.registrations.length, 0);
      return { departmentId: dept.id, name: dept.name, registrations };
    });

    await this.setCached(cacheKey, result, 300);

    return result;
  }

  async getAdminTrends(query: TimeRangeDto): Promise<TrendPointDto[]> {
    const { start, end } = this.resolveTimeRange(query);

    const registrations = await this.prisma.registration.findMany({
      where: { registrationDate: { gte: start, lte: end } },
      select: { registrationDate: true },
    });

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const useWeekly = diffDays > 90;

    if (useWeekly) {
      return buildWeeklySeries(
        start,
        end,
        registrations.map((r) => r.registrationDate),
      );
    } else {
      return buildDailySeries(
        start,
        end,
        registrations.map((r) => r.registrationDate),
      );
    }
  }

  async getUserEngagement(query: TimeRangeDto): Promise<UserEngagementDto> {
    const { start, end } = this.resolveTimeRange(query);

    // Active users: distinct users with at least one registration in range
    const registrationsInRange = await this.prisma.registration.findMany({
      where: { registrationDate: { gte: start, lte: end } },
      select: { userId: true },
    });

    const userRegistrationCounts = new Map<string, number>();
    for (const r of registrationsInRange) {
      userRegistrationCounts.set(r.userId, (userRegistrationCounts.get(r.userId) ?? 0) + 1);
    }

    const activeUsers = userRegistrationCounts.size;

    // Repeat engagement buckets
    const buckets = { '1 event': 0, '2 events': 0, '3-5 events': 0, '6+ events': 0 };
    for (const count of userRegistrationCounts.values()) {
      if (count === 1) buckets['1 event']++;
      else if (count === 2) buckets['2 events']++;
      else if (count <= 5) buckets['3-5 events']++;
      else buckets['6+ events']++;
    }
    const repeatEngagement = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));

    // New user growth: daily time-series of new user account creations
    const newUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    });
    const newUserGrowth = buildDailySeries(
      start,
      end,
      newUsers.map((u) => u.createdAt),
    );

    // Waitlist totals
    const [waitlistTotal, waitlistPromotedUsers] = await Promise.all([
      this.prisma.eventWaitlist.count({
        where: { joinedAt: { gte: start, lte: end } },
      }),
      // Promoted = user has a waitlist entry AND a confirmed registration for the same event in range
      this.prisma.eventWaitlist.findMany({
        where: { joinedAt: { gte: start, lte: end } },
        select: { userId: true, eventId: true },
      }),
    ]);

    // Check which waitlist entries have a corresponding confirmed registration
    let waitlistPromoted = 0;
    if (waitlistPromotedUsers.length > 0) {
      const confirmedRegs = await this.prisma.registration.findMany({
        where: {
          registrationDate: { gte: start, lte: end },
          status: { name: { equals: 'CONFIRMED', mode: 'insensitive' } },
        },
        select: { userId: true, eventId: true },
      });
      const confirmedSet = new Set(confirmedRegs.map((r) => `${r.userId}:${r.eventId}`));
      waitlistPromoted = waitlistPromotedUsers.filter((w) =>
        confirmedSet.has(`${w.userId}:${w.eventId}`),
      ).length;
    }

    return {
      activeUsers,
      repeatEngagement,
      newUserGrowth,
      waitlistTotal,
      waitlistPromoted,
    };
  }

  private exportToCsv(data: object[]): Buffer {
    if (data.length === 0) {
      // Return buffer with just an empty header line
      return Buffer.from('', 'utf-8');
    }

    const csvString = stringify(data, { header: true });
    return Buffer.from(csvString, 'utf-8');
  }

  private exportToPdf(metrics: object): Buffer {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(20).text('Analytics Report', { align: 'center' });
    doc.moveDown();

    const entries = Object.entries(metrics);
    if (entries.length === 0) {
      doc.fontSize(12).text('No data available');
    } else {
      doc.fontSize(12);
      for (const [key, value] of entries) {
        doc.text(`${key}: ${value}`);
      }
    }

    doc.end();

    return Buffer.concat(chunks);
  }

  async exportAnalytics(
    scope: string,
    query: ExportQueryDto,
    userId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const format = query.format ?? 'csv';
    const { start, end } = this.resolveTimeRange(query);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);
    const ext = format === 'pdf' ? 'pdf' : 'csv';
    const filename = `analytics-${scope}-${startDate}-${endDate}.${ext}`;

    let buffer: Buffer;

    if (scope === 'admin') {
      const overview = await this.getAdminOverview(query);

      if (format === 'pdf') {
        buffer = this.exportToPdf(overview as unknown as object);
      } else {
        buffer = this.exportToCsv([overview as unknown as object]);
      }
    } else {
      // scope is an eventId
      const analytics = await this.getEventAnalytics(scope, userId, query);

      if (format === 'pdf') {
        buffer = this.exportToPdf(analytics as unknown as object);
      } else {
        buffer = this.exportToCsv([analytics as unknown as object]);
      }
    }

    return { buffer, filename };
  }
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function buildDailySeries(start: Date, end: Date, dates: Date[]): TrendPointDto[] {
  const counts = new Map<string, number>();

  // Zero-fill every day in range
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setUTCHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    counts.set(toDateKey(cursor), 0);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const d of dates) {
    const key = toDateKey(d);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

function buildWeeklySeries(start: Date, end: Date, dates: Date[]): TrendPointDto[] {
  const counts = new Map<string, number>();

  // Zero-fill every week in range
  const cursor = getWeekStart(start);
  const endWeek = getWeekStart(end);

  while (cursor <= endWeek) {
    counts.set(toDateKey(cursor), 0);
    const next = new Date(cursor);
    next.setUTCDate(next.getUTCDate() + 7);
    cursor.setTime(next.getTime());
  }

  for (const d of dates) {
    const key = toDateKey(getWeekStart(d));
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
