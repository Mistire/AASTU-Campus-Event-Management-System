import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Processor('recommendation')
export class RecommendationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationProcessor.name);
  private readonly mlServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    super();
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'retrain') {
      try {
        this.logger.log('Starting background model retraining...');
        const response = await firstValueFrom(
          this.httpService.post(`${this.mlServiceUrl}/retrain`),
        );
        this.logger.log('Model retraining completed successfully');
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Model retraining failed: ${errorMessage}`);
        throw error;
      }
    }

    this.logger.warn(`Unknown job type: ${job.name}`);
  }
}
