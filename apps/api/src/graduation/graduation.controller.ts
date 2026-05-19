import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard';
import { Public } from '../auth/decorator';
import { GraduationService } from './graduation.service';
import { AddStudentDto, ClaimSubmissionDto } from './dto/graduation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Graduation')
@Controller('graduation')
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  // ── Organizer: Import CSV ─────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':eventId/import-csv')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.graduationService.importFromCsv(eventId, req.user.id, file.buffer);
  }

  // ── Organizer: Add Single Student ─────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':eventId/add-student')
  addStudent(
    @Param('eventId') eventId: string,
    @Body() dto: AddStudentDto,
    @Req() req: any,
  ) {
    return this.graduationService.addStudent(eventId, req.user.id, dto);
  }

  // ── Organizer: Get Student List ───────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(':eventId/students')
  getStudents(@Param('eventId') eventId: string, @Req() req: any) {
    return this.graduationService.getStudentsForEvent(eventId, req.user.id);
  }

  // ── Organizer: Resend Guest Pass ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('guest-pass/:guestPassId/resend')
  resend(@Param('guestPassId') guestPassId: string, @Req() req: any) {
    return this.graduationService.resendDelivery(guestPassId, req.user.id);
  }

  // ── PUBLIC: Get Claim Status ──────────────────────────────────────────────
  @Public()
  @Get('claim/:token')
  getClaimStatus(@Param('token') token: string) {
    return this.graduationService.getClaimStatus(token);
  }

  // ── PUBLIC: Submit Claim ──────────────────────────────────────────────────
  @Public()
  @Post('claim/:token')
  submitClaim(@Param('token') token: string, @Body() dto: ClaimSubmissionDto) {
    return this.graduationService.submitClaim(token, dto);
  }
}
