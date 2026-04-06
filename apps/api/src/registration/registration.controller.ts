import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@ApiTags('Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Register for an event (or join waitlist if full)' })
  @ApiResponse({ status: 201, description: 'Registered or added to waitlist.' })
  @ApiResponse({ status: 409, description: 'Already registered or waitlisted.' })
  register(@GetUser() user: AuthUser, @Body() dto: CreateRegistrationDto) {
    return this.registrationService.register({ userId: user.id, eventId: dto.eventId });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Student cancels their own registration' })
  @ApiResponse({ status: 200, description: 'Registration cancelled.' })
  @ApiResponse({ status: 403, description: "Cannot cancel another student's registration." })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  cancel(@GetUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.cancelByStudent(id, user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Organizer approves a PENDING registration' })
  @ApiResponse({ status: 200, description: 'Registration approved.' })
  @ApiResponse({ status: 403, description: 'Not an organizer of this event.' })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  @ApiResponse({ status: 409, description: 'Event is at capacity.' })
  approve(@GetUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.approveByOrganizer({
      registrationId: id,
      organizerId: user.id,
    });
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Organizer rejects a PENDING registration' })
  @ApiResponse({ status: 200, description: 'Registration rejected.' })
  @ApiResponse({ status: 403, description: 'Not an organizer of this event.' })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  reject(@GetUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.rejectByOrganizer({ registrationId: id, organizerId: user.id });
  }

  @Delete(':id/remove')
  @ApiOperation({ summary: 'Organizer removes a CONFIRMED registration' })
  @ApiResponse({ status: 200, description: 'Registration removed.' })
  @ApiResponse({ status: 403, description: 'Not an organizer of this event.' })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  remove(@GetUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.removeByOrganizer({ registrationId: id, organizerId: user.id });
  }
}
