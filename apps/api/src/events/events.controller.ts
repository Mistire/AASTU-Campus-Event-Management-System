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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('Organizer', 'Admin')
  @ApiOperation({ summary: 'Create a new event (Organizer). Status auto-set to DRAFT.' })
  @ApiResponse({ status: 201, description: 'Event created in DRAFT status.' })
  create(@GetUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with filtering and pagination' })
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming approved/live events' })
  getUpcoming() {
    return this.eventsService.getUpcoming();
  }

  @Get('my-organized')
  @ApiOperation({
    summary: 'Get events managed by the authenticated user (Creator or Co-organizer)',
  })
  getMyOrganized(@GetUser() user: AuthUser, @Query() query: EventQueryDto) {
    return this.eventsService.getMyOrganizedEvents(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full event details by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Organizer', 'Admin', 'Student')
  @ApiOperation({ summary: 'Update event (only DRAFT or PENDING status). Organizer/Creator only.' })
  @ApiResponse({ status: 403, description: 'Cannot edit event in current status.' })
  update(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, user.id, dto);
  }

  @Post(':id/submit')
  @Roles('Organizer', 'Admin')
  @ApiOperation({ summary: 'Submit event for admin approval' })
  submit(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.eventsService.submitForApproval(id, user.id);
  }

  @Post(':id/go-live')
  @Roles('Organizer', 'Admin')
  @ApiOperation({ summary: 'Manually set an event to LIVE' })
  goLive(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.eventsService.goLive(id, user.id);
  }

  @Patch(':id/approve')
  @Roles('Admin')
  @ApiOperation({ summary: 'Approve event (PENDING → APPROVED). Admin only.' })
  approve(@Param('id') id: string) {
    return this.eventsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('Admin')
  @ApiOperation({ summary: 'Reject event (PENDING → REJECTED). Admin only.' })
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.eventsService.reject(id, reason);
  }

  @Patch(':id/cancel')
  @Roles('Organizer', 'Admin')
  @ApiOperation({
    summary: 'Cancel event (Organizer/Creator). Works from DRAFT, PENDING, or APPROVED.',
  })
  cancel(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.eventsService.cancel(id, user.id);
  }

  @Patch(':id/archive')
  @Roles('Organizer', 'Admin')
  @ApiOperation({ summary: 'Archive event (LIVE → ARCHIVED). Organizers only.' })
  archive(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.eventsService.archive(id, user.id);
  }

  @Delete(':id')
  @Roles('Organizer', 'Admin', 'Student')
  @ApiOperation({ summary: 'Delete event (Organizer: only DRAFT)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.eventsService.remove(id, user);
  }
}
