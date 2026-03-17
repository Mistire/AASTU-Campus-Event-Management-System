import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
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
  ],
})
export class AppModule {}
