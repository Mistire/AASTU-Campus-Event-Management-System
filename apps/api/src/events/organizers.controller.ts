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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganizersService } from './organizers.service';
import { InviteOrganizerDto, InviteResponseDto } from './dto/invitation.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Organizers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  @Post('events/:eventId/organizers/invite')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Invite a user to co-organize an event (Organizer)' })
  @ApiResponse({ status: 201, description: 'Organizer invitation sent.' })
  @ApiResponse({ status: 409, description: 'User is already an organizer.' })
  invite(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: InviteOrganizerDto,
  ) {
    return this.organizersService.invite(eventId, user.id, dto);
  }

  @Patch('organizers/:id/respond')
  @ApiOperation({ summary: 'Accept or reject organizer invitation (Invited user)' })
  respond(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: InviteResponseDto) {
    return this.organizersService.respond(id, user.id, dto.accept);
  }

  @Get('events/:eventId/organizers')
  @ApiOperation({ summary: 'List organizers for an event' })
  @ApiQuery({
    name: 'includeAll',
    required: false,
    type: Boolean,
    description: 'Include pending/rejected organizers',
  })
  findAllByEvent(@Param('eventId') eventId: string, @Query('includeAll') includeAll?: string) {
    return this.organizersService.findAllByEvent(eventId, includeAll === 'true');
  }

  @Delete('organizers/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Remove an organizer (Event creator or the organizer themselves)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.organizersService.remove(id, user.id);
  }
}
