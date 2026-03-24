/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { InviteResponseDto } from './dto/invitation.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('events/:eventId/invitations/import')
  @Roles('Admin', 'Organizer')
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
      'Import invitations from CSV (Organizer). Extracts emails, matches users, sends notifications.',
  })
  @ApiResponse({ status: 201, description: 'Invitations processed.' })
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

  @Get('events/:eventId/invitations')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'List all invitations for an event (Organizer)' })
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.invitationsService.findAllByEvent(eventId);
  }

  @Patch('invitations/:id/respond')
  @ApiOperation({ summary: 'Accept or reject an invitation (Invited user)' })
  respond(@Param('id') id: string, @GetUser() user: AuthUser, @Body() dto: InviteResponseDto) {
    return this.invitationsService.respond(id, user.id, dto.accept);
  }

  @Delete('invitations/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Cancel a pending invitation (Inviter only)' })
  cancel(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.invitationsService.cancel(id, user.id);
  }
}
