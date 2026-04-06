import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(data: {
    userId: string;
    eventId: string;
    sessionId?: string;
    checkInTime: Date;
    qrToken: string;
  }) {
    const attendance = await this.prisma.attendance.create({ data });
    await this.analyticsService.invalidateEventCache(data.eventId);
    return attendance;
  }

  async update(id: string, data: Partial<{ checkInTime: Date; qrToken: string }>) {
    const attendance = await this.prisma.attendance.update({ where: { id }, data });
    await this.analyticsService.invalidateEventCache(attendance.eventId);
    return attendance;
  }

  async remove(id: string) {
    const attendance = await this.prisma.attendance.delete({ where: { id } });
    await this.analyticsService.invalidateEventCache(attendance.eventId);
    return attendance;
  }
}
