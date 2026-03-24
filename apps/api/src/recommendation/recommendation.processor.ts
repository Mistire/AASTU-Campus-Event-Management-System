import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Processor('recommendation')
export class RecommendationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationProcessor.name);
  private readonly mlServiceUrl: string;
  private readonly redis: Redis;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async process(job: Job) {
    if (job.name === 'retrain') {
      this.logger.log(`Processing job ${job.id} of type ${job.name}`);
      this.logger.log('Starting background model retraining...');

      try {
        // 1. Get current health for timestamp comparison
        const beforeHealth = await this.getMlHealth();
        const lastTrainedBefore = beforeHealth?.last_trained;

        // 2. Trigger retraining
        await job.updateProgress(10);
        await firstValueFrom(this.httpService.post(`${this.mlServiceUrl}/retrain`));
        await job.updateProgress(80);

        // 3. Verification loop (wait for model to be truly loaded)
        this.logger.log('Verifying model reload...');
        let verified = false;
        // Check for 5 cycles (10 seconds total)
        for (let i = 0; i < 5; i++) {
          const health = await this.getMlHealth();
          if (health?.models_loaded && health.last_trained !== lastTrainedBefore) {
            verified = true;
            this.logger.log(`Model verification successful. New timestamp: ${health.last_trained}`);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
        }

        if (!verified) {
          throw new Error('Retraining finished but model health/timestamp did not update.');
        }

        // 4. Strict Cache Invalidation
        this.logger.log('Invalidating recommendation cache...');
        const keys = await this.redis.keys('recommendations:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.log(`Cleared ${keys.length} cache keys.`);
        }

        await job.updateProgress(100);
        this.logger.log('Background retraining completed successfully.');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Retraining job failed: ${errorMessage}`);
        throw error; // Let BullMQ handle retries
      }
    }
  }

  private async getMlHealth() {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.mlServiceUrl}/health`));
      return response.data;
    } catch {
      return null;
    }
  }
}
