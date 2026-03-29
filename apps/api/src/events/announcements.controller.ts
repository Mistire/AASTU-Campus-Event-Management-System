/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import {
  AnnouncementQueryDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
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
  @Roles('Organizer')
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
  findAllByEvent(@Param('eventId') eventId: string, @Query() query: AnnouncementQueryDto) {
    return this.announcementsService.findAllByEvent(eventId, query);
  }

  @Get('announcements/my')
  @ApiOperation({
    summary: 'Get announcements where user is creator or event co-organizer (Organizer)',
  })
  getMyAnnouncements(@GetUser() user: AuthUser, @Query() query: AnnouncementQueryDto) {
    return this.announcementsService.getMyAnnouncements(user.id, query);
  }

  @Get('announcements/:id')
  @ApiOperation({ summary: 'Get a single announcement by ID' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch('announcements/:id')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Update an announcement (organizer only)' })
  update(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, user.id, dto);
  }

  @Delete('announcements/:id')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Delete an announcement (organizer)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.announcementsService.remove(id, user.id);
  }
}
