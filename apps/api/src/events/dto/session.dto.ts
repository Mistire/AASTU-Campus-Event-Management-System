import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Session title', example: 'Opening Keynote' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Session description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of session',
    example: 'KEYNOTE',
    enum: ['KEYNOTE', 'WORKSHOP', 'PANEL', 'TALK', 'BREAK', 'NETWORKING', 'OTHER'],
  })
  @IsString()
  @IsOptional()
  sessionType?: string;

  @ApiProperty({ description: 'Session start time', example: '2026-10-15T18:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Session end time', example: '2026-10-15T19:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ description: 'Location / room for this specific session', example: 'Room A-301' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Array of speaker IDs to assign to this session', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  speakerIds?: string[];
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: 'Session title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Session description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of session',
    enum: ['KEYNOTE', 'WORKSHOP', 'PANEL', 'TALK', 'BREAK', 'NETWORKING', 'OTHER'],
  })
  @IsString()
  @IsOptional()
  sessionType?: string;

  @ApiPropertyOptional({ description: 'Session start time' })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Session end time' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Location / room for this session' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Replace speaker IDs for this session', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  speakerIds?: string[];
}
