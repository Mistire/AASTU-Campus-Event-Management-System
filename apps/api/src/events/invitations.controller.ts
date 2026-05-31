import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvitationsService } from './invitations.service';
import { InviteResponseDto, BulkInviteAttendeesDto } from './dto/invitation.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Attendee Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('events/:eventId/invitations/import')
  @Roles('Organizer')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file with an "email" column' },
      },
    },
  })
  @ApiOperation({
    summary:
      'Import attendee invitations from CSV (Organizer). Extracts emails, matches users, sends notifications.',
  })
  @ApiResponse({ status: 201, description: 'Attendee invitations processed.' })
  importCsv(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('CSV file is required');
    }
    return this.invitationsService.importCsv(eventId, user.id, file.buffer);
  }

  @Post('events/:eventId/invitations/bulk')
  @Roles('Organizer')
  @ApiOperation({
    summary: 'Bulk invite attendees via JSON email array (Organizer). Alternative to CSV import.',
  })
  @ApiResponse({ status: 201, description: 'Attendee invitations processed.' })
  bulkInvite(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: BulkInviteAttendeesDto,
  ) {
    return this.invitationsService.bulkInvite(eventId, user.id, dto.emails);
  }

  @Get('events/:eventId/invitations')
  @Roles('Organizer')
  @ApiOperation({ summary: 'List all attendee invitations for an event (Organizer view)' })
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.invitationsService.findAllByEvent(eventId);
  }

  @Get('my/invitations')
  @ApiOperation({ summary: 'View my pending attendee invitations (Authenticated user)' })
  findMyInvitations(@GetUser() user: AuthUser) {
    return this.invitationsService.findMyInvitations(user.id);
  }

  @Patch('invitations/:id/respond')
  @ApiOperation({ summary: 'Accept or reject an attendee invitation (Invited user)' })
  respond(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: InviteResponseDto) {
    return this.invitationsService.respond(id, user.id, dto.accept);
  }

  @Delete('invitations/:id')
  @Roles('Organizer')
  @ApiOperation({ summary: 'Cancel a pending attendee invitation (Inviter only)' })
  cancel(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.invitationsService.cancel(id, user.id);
  }
}
