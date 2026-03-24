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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto, UpdateHackathonDto } from './dto/hackathon.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Hackathons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Post('events/:eventId/hackathon')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Create hackathon config for an event — one per event (Organizer)' })
  @ApiResponse({ status: 201, description: 'Hackathon configuration created.' })
  @ApiResponse({ status: 409, description: 'Event already has a hackathon configuration.' })
  create(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: CreateHackathonDto,
  ) {
    return this.hackathonsService.create(eventId, user.id, dto);
  }

  @Get('events/:eventId/hackathon')
  @ApiOperation({ summary: 'Get hackathon configuration for an event (includes team/judge counts)' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.hackathonsService.findByEvent(eventId);
  }

  @Patch('events/:eventId/hackathon')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Update hackathon settings for an event (Organizer)' })
  update(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: UpdateHackathonDto,
  ) {
    return this.hackathonsService.update(eventId, user.id, dto);
  }

  @Delete('events/:eventId/hackathon')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Delete hackathon configuration for an event (Organizer)' })
  remove(@Param('eventId') eventId: string, @GetUser() user: AuthUser) {
    return this.hackathonsService.remove(eventId, user.id);
  }
}
