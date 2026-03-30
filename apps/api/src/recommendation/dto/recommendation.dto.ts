import { ApiProperty } from '@nestjs/swagger';

export class RecommendationItemDto {
  @ApiProperty({ example: '67cb0aa5-09e1-40b9-b140-bfca04307b59' })
  event_id: string;

  @ApiProperty({ example: 0.889, description: 'Relevance score (0-1)' })
  score: number;

  @ApiProperty({ example: 'Cloud Computing Fundamentals', nullable: true })
  title: string | null;
}

export class RecommendationResponseDto {
  @ApiProperty({ example: 'b6a4eee0-af07-42c7-a4a1-0f1b8990de68' })
  user_id: string;

  @ApiProperty({ type: [RecommendationItemDto] })
  recommendations: RecommendationItemDto[];

  @ApiProperty({
    example: 'hybrid',
    enum: ['hybrid', 'content_only', 'popularity_fallback'],
    description: 'Which model strategy was used',
  })
  model_used: string;

  @ApiProperty({ example: false, description: 'True if user has fewer than 3 interactions' })
  is_cold_start: boolean;
}

export class SimilarEventsResponseDto {
  @ApiProperty({ example: 'ebfcf253-670a-4ee8-a549-32498bdca5ff' })
  event_id: string;

  @ApiProperty({ type: [RecommendationItemDto] })
  similar_events: RecommendationItemDto[];
}

export class RetrainResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Model retrained and reloaded' })
  message: string;

  @ApiProperty({ example: 50 })
  events_count: number;

  @ApiProperty({ example: 100 })
  users_count: number;

  @ApiProperty({ example: 883 })
  registrations_count: number;
}

export class MlHealthResponseDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: 'ml-recommendation' })
  service: string;

  @ApiProperty({ example: '0.1.0', required: false })
  version?: string;

  @ApiProperty({ example: true })
  models_loaded: boolean;

  @ApiProperty({ example: '2026-03-21T19:44:07.844793', nullable: true })
  last_trained: string | null;
}
