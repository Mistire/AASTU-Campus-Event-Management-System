import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EventQueryDto {
  @ApiPropertyOptional({ description: 'Search term for event titles or descriptions' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter events by a specific date', example: '2026-10-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Filter events by department UUID' })
  @IsUUID()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    description: 'Filter events by status name',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'LIVE', 'CANCELLED', 'ARCHIVED'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter events by event type UUID' })
  @IsUUID()
  @IsOptional()
  eventType?: string;

  @ApiPropertyOptional({ description: 'Filter events by tag UUID' })
  @IsUUID()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Sort results by popularity or date',
    enum: ['popularity', 'date'],
  })
  @IsString()
  @IsOptional()
  sortBy?: 'popularity' | 'date';

  @ApiPropertyOptional({ description: 'Filter events by venue UUID' })
  @IsUUID()
  @IsOptional()
  venueId?: string;

  @ApiPropertyOptional({ description: 'Filter events by creator (User) UUID' })
  @IsUUID()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of results per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'If true, only return events that have not ended' })
  @IsOptional()
  @Type(() => Boolean)
  upcomingOnly?: boolean;
}
