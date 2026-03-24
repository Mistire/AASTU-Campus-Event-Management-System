import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from 'src/auth/guard';
import {
  RecommendationResponseDto,
  SimilarEventsResponseDto,
  RetrainResponseDto,
  MlHealthResponseDto,
} from './dto/recommendation.dto';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get personalized event recommendations for a user',
    description:
      'Returns events ranked by relevance using a hybrid model (content-based + collaborative filtering). ' +
      'Falls back to content-only for cold-start users (<3 interactions) or popularity-based for unknown users.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    example: 'b6a4eee0-af07-42c7-a4a1-0f1b8990de68',
  })
  @ApiQuery({
    name: 'n',
    required: false,
    type: Number,
    description: 'Number of recommendations (1-50, default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommended events returned',
    type: RecommendationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 503, description: 'ML service unavailable or models not trained yet' })
  getRecommendations(@Param('userId') userId: string, @Query('n') n?: number) {
    return this.recommendationService.getRecommendations(userId, n ? Number(n) : 10);
  }

  @Get('similar/:eventId')
  @ApiOperation({
    summary: 'Get events similar to a given event',
    description:
      'Returns events ranked by cosine similarity based on TF-IDF descriptions, category, popularity, and ratings.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'UUID of the event',
    example: 'ebfcf253-670a-4ee8-a549-32498bdca5ff',
  })
  @ApiQuery({
    name: 'n',
    required: false,
    type: Number,
    description: 'Number of similar events (1-50, default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Similar events returned',
    type: SimilarEventsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found in recommendation model' })
  getSimilarEvents(@Param('eventId') eventId: string, @Query('n') n?: number) {
    return this.recommendationService.getSimilarEvents(eventId, n ? Number(n) : 10);
  }

  @Post('retrain')
  @ApiOperation({
    summary: 'Trigger model retraining',
    description:
      'Pulls fresh data from PostgreSQL, runs the full cleaning + feature engineering + training pipeline, ' +
      'and hot-reloads the new model into memory. Takes ~5-10 seconds.',
  })
  @ApiResponse({
    status: 200,
    description: 'Model retrained and reloaded',
    type: RetrainResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Retrain failed' })
  retrain() {
    return this.recommendationService.retrain();
  }

  @Get('status/:jobId')
  @ApiOperation({
    summary: 'Get background job status',
    description: 'Returns the status and progress of a background task (like retraining).',
  })
  @ApiParam({ name: 'jobId', description: 'ID of the BullMQ job' })
  @ApiResponse({ status: 200, description: 'Job status returned' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  getJobStatus(@Param('jobId') jobId: string) {
    return this.recommendationService.getJobStatus(jobId);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check ML service health',
    description:
      'Returns the ML microservice status, whether models are loaded, and last training timestamp.',
  })
  @ApiResponse({ status: 200, description: 'ML service health info', type: MlHealthResponseDto })
  getHealth() {
    return this.recommendationService.getHealth();
  }
}
