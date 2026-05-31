import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ description: 'The title of the event', example: 'Updated Event Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'A detailed description of the event' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'UUID of the event type' })
  @IsUUID()
  @IsOptional()
  eventTypeId?: string;

  @ApiPropertyOptional({ description: 'UUID of the venue where the event is held' })
  @IsUUID()
  @IsOptional()
  venueId?: string;

  @ApiPropertyOptional({ description: 'Event start time', example: '2026-10-15T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Event end time', example: '2026-10-15T21:00:00Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Maximum number of attendees allowed', example: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Whether registration requires organizer approval' })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Array of tag IDs to replace current tags', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of category IDs to replace current categories',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Number of guests allowed per registered student' })
  @IsInt()
  @Min(0)
  @IsOptional()
  guestLimitPerUser?: number;
}
