import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { RecommendationProcessor } from './recommendation.processor';
import { RecommendationScheduler } from './recommendation.scheduler';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30s timeout for ML operations
      maxRedirects: 3,
    }),
    BullModule.registerQueue({
      name: 'recommendation',
    }),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationProcessor, RecommendationScheduler],
  exports: [RecommendationService],
})
export class RecommendationModule {}
