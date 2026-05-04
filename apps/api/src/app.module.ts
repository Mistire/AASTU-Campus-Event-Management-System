import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { RegistrationModule } from './registration/registration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DepartmentsModule } from './departments/departments.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SupportModule } from './support/support.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    EventsModule,
    RegistrationModule,
    NotificationsModule,
    RecommendationModule,
    AnalyticsModule,
    MediaModule,
    AdminModule,
    RoleModule,
    PermissionModule,
    AttendanceModule,
    DepartmentsModule,
    AuditLogsModule,
    SupportModule,
    FeedbackModule,
    BookmarksModule,
  ],
})
export class AppModule {}
