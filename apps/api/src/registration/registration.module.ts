import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { RegistrationService } from './registration.service';
import { WaitlistService } from './waitlist.service';
import { AttendanceService } from './attendance.service';
import { RegistrationController } from './registration.controller';

import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    AnalyticsModule,
    NotificationsModule,
    AuthModule,
    ConfigModule,
    JwtModule.register({}),
    AuditLogsModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, WaitlistService, AttendanceService],
  exports: [RegistrationService, WaitlistService, AttendanceService],
})
export class RegistrationModule {}
