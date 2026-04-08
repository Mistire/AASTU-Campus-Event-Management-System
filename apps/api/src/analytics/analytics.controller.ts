import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';
import { TimeRangeDto } from './dto/time-range.dto';
import { ExportQueryDto } from './dto/export-query.dto';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ─── Admin routes ─────────────────────────────────────────────────────────

  @Get('admin/overview')
  @Roles('Admin')
  getAdminOverview(@Query() query: TimeRangeDto, @Query('refresh') refresh?: string) {
    return this.analyticsService.getAdminOverview(query, refresh === 'true');
  }

  @Get('admin/top-events')
  @Roles('Admin')
  getTopEvents(@Query() query: TimeRangeDto) {
    return this.analyticsService.getTopEvents(query);
  }

  @Get('admin/categories')
  @Roles('Admin')
  getCategoryAnalytics(@Query() query: TimeRangeDto) {
    return this.analyticsService.getCategoryAnalytics(query);
  }

  @Get('admin/departments')
  @Roles('Admin')
  getDepartmentAnalytics(@Query() query: TimeRangeDto) {
    return this.analyticsService.getDepartmentAnalytics(query);
  }

  @Get('admin/trends')
  @Roles('Admin')
  getAdminTrends(@Query() query: TimeRangeDto) {
    return this.analyticsService.getAdminTrends(query);
  }

  @Get('admin/engagement')
  @Roles('Admin')
  getUserEngagement(@Query() query: TimeRangeDto) {
    return this.analyticsService.getUserEngagement(query);
  }

  @Get('admin/export')
  @Roles('Admin')
  async exportAdmin(
    @Query() query: ExportQueryDto,
    @GetUser() user: AuthUser,
    @Res() res: express.Response,
  ) {
    const { buffer, filename } = await this.analyticsService.exportAnalytics(
      'admin',
      query,
      user.id,
    );
    const contentType = query.format === 'pdf' ? 'application/pdf' : 'text/csv';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  // ─── Organizer / Co-organizer event routes ───────────────────────────────
  // @Roles('Organizer') ensures only users with the Organizer system role reach
  // these endpoints. The service's assertEventOrganizer then further scopes
  // access to events the user owns or has an ACCEPTED co-organizer invitation for.

  @Get('events/:eventId')
  @Roles('Organizer')
  getEventAnalytics(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Query() query: TimeRangeDto,
  ) {
    return this.analyticsService.getEventAnalytics(eventId, user.id, query);
  }

  @Get('events/:eventId/sessions')
  @Roles('Organizer')
  getSessionAnalytics(@Param('eventId') eventId: string, @GetUser() user: AuthUser) {
    return this.analyticsService.getSessionAnalytics(eventId, user.id);
  }

  @Get('events/:eventId/feedback')
  @Roles('Organizer')
  getFeedbackAnalytics(@Param('eventId') eventId: string, @GetUser() user: AuthUser) {
    return this.analyticsService.getFeedbackAnalytics(eventId, user.id);
  }

  @Get('events/:eventId/trends')
  @Roles('Organizer')
  getEventTrends(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Query() query: TimeRangeDto,
  ) {
    return this.analyticsService.getEventTrends(eventId, user.id, query);
  }

  @Get('events/:eventId/export')
  @Roles('Organizer')
  async exportEvent(
    @Param('eventId') eventId: string,
    @Query() query: ExportQueryDto,
    @GetUser() user: AuthUser,
    @Res() res: express.Response,
  ) {
    const { buffer, filename } = await this.analyticsService.exportAnalytics(
      eventId,
      query,
      user.id,
    );
    const contentType = query.format === 'pdf' ? 'application/pdf' : 'text/csv';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  // ─── Organizer Overview routes ───────────────────────────────

  @Get('organizer/overview')
  @Roles('Organizer', 'Admin')
  getOrganizerOverview(@GetUser() user: AuthUser) {
    return this.analyticsService.getOrganizerOverview(user.id);
  }

  @Get('organizer/registrations/recent')
  @Roles('Organizer', 'Admin')
  getOrganizerRecentRegistrations(@GetUser() user: AuthUser) {
    return this.analyticsService.getOrganizerRecentRegistrations(user.id);
  }
}
