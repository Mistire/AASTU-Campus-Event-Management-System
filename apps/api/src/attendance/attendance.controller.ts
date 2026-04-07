import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { GetUser, Roles } from '../auth/decorator';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in a user to an event/session (1:N)' })
  checkIn(@GetUser('id') userId: string, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(userId, dto);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all attendance records for a specific event' })
  getAttendanceByEvent(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceByEvent(eventId);
  }

  @Get('stats/:eventId')
  @ApiOperation({ summary: 'Get attendance statistics for a specific event' })
  getAttendanceStats(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceStats(eventId);
  }

  @Get('global/summary')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get campus-wide attendance summary (ADMIN only)' })
  getGlobalSummary() {
    return this.attendanceService.getGlobalSummary();
  }

  @Get('global/participation')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get cross-event participation data (ADMIN only)' })
  getEventsParticipation() {
    return this.attendanceService.getEventsParticipation();
  }

  @Get('global/recent')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get most recent campus-wide check-ins (ADMIN only)' })
  getRecentGlobalAttendance() {
    return this.attendanceService.getRecentGlobalAttendance();
  }
}
