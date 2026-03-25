import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RecommendationScheduler {
  private readonly logger = new Logger(RecommendationScheduler.name);

  constructor(@InjectQueue('recommendation') private readonly recommendationQueue: Queue) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightRetrain() {
    this.logger.log('Triggering automated midnight model retraining...');

    // Use the fixed jobId for deduplication
    const jobId = 'recommendation-retrain';

    await this.recommendationQueue.add(
      'retrain',
      {
        timestamp: new Date().toISOString(),
        triggeredBy: 'scheduler',
      },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 900000, // 15 minutes timeout
      },
    );

    this.logger.log(`Automated retrain job queued with ID: ${jobId}`);
  }
}
