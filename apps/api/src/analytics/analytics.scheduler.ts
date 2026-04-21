import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsScheduler {
  private readonly logger = new Logger(AnalyticsScheduler.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Cron('0 * * * *')
  async refreshPlatformSnapshots(): Promise<void> {
    try {
      await this.analyticsService.getAdminOverview({}, true);
      this.logger.log('Platform analytics snapshot refreshed successfully');
    } catch (err) {
      this.logger.error('Failed to refresh platform analytics snapshot', err);
    }
  }
}
