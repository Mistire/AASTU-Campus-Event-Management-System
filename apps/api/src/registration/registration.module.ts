import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RegistrationService } from './registration.service';
import { WaitlistService } from './waitlist.service';
import { AttendanceService } from './attendance.service';
import { RegistrationController } from './registration.controller';

@Module({
  imports: [PrismaModule, AnalyticsModule, NotificationsModule],
  controllers: [RegistrationController],
  providers: [RegistrationService, WaitlistService, AttendanceService],
  exports: [RegistrationService, WaitlistService, AttendanceService],
})
export class RegistrationModule {}
