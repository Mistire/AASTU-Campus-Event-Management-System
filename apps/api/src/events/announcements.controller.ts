/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post('events/:eventId/announcements')
  @Roles('Admin', 'Organizer')
  @ApiOperation({
    summary: 'Create an announcement for an event (Organizer only, event must be APPROVED/LIVE)',
  })
  @ApiResponse({ status: 201, description: 'Announcement created and attendees notified.' })
  create(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(eventId, user.id, dto);
  }

  @Get('events/:eventId/announcements')
  @ApiOperation({ summary: 'List all announcements for an event' })
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.announcementsService.findAllByEvent(eventId);
  }

  @Get('announcements/:id')
  @ApiOperation({ summary: 'Get a single announcement by ID' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch('announcements/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Update an announcement (creator only)' })
  update(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, user.id, dto);
  }

  @Delete('announcements/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Delete an announcement (creator or admin)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.announcementsService.remove(id, user.id, user.role);
  }
}
