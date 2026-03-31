import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { Permissions, Roles } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get()
    @Roles('ADMIN', 'ORGANIZER')
    @Permissions('MANAGE_ATTENDANCE')
    findAll() {
        return this.attendanceService.findAll();
    }

    @Post()
    @Roles('ADMIN', 'ORGANIZER')
    @Permissions('MANAGE_ATTENDANCE')
    markAttendance(@Body() dto: { userId: string; eventId: string; sessionId?: string; qrToken: string }) {
        return this.attendanceService.markAttendance(dto);
    }
}
