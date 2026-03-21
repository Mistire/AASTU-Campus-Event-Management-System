import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30s timeout for ML operations
      maxRedirects: 3,
    }),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
