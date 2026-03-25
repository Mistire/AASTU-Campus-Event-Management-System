/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // ── Session CRUD ────────────────────────────────────────────────────────

  @Post('events/:eventId/sessions')
  @Roles('Organizer')
  @ApiOperation({
    summary:
      'Create a session for an event (Organizer). Session times must fall within event window.',
  })
  @ApiResponse({ status: 201, description: 'Session created with optional speaker assignments.' })
  create(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(eventId, user.id, dto);
  }

  @Get('events/:eventId/sessions')
  @ApiOperation({ summary: 'List all sessions for an event, ordered by start time' })
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.sessionsService.findAllByEvent(eventId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get session details including speakers, media, and attendance count' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch('sessions/:id')
  @Roles('Organizer')
  @ApiOperation({
    summary: 'Update a session (Organizer). Pass speakerIds to replace all speakers.',
  })
  update(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(id, user.id, dto);
  }

  @Delete('sessions/:id')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Delete a session and all its speakers/media/attendance (Organizer)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.sessionsService.remove(id, user.id);
  }

  // ── Session Speaker Management ──────────────────────────────────────────

  @Post('sessions/:sessionId/speakers/:speakerId')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Add a speaker to a session (Organizer)' })
  @ApiResponse({ status: 201, description: 'Speaker assigned to session.' })
  addSpeaker(
    @Param('sessionId') sessionId: string,
    @Param('speakerId') speakerId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.sessionsService.addSpeaker(sessionId, speakerId, user.id);
  }

  @Delete('sessions/:sessionId/speakers/:speakerId')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Remove a speaker from a session (Organizer)' })
  removeSpeaker(
    @Param('sessionId') sessionId: string,
    @Param('speakerId') speakerId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.sessionsService.removeSpeaker(sessionId, speakerId, user.id);
  }
}
