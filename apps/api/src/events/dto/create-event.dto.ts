import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type as classTransformerType } from 'class-transformer';
import { CreateSessionDto } from './session.dto';
import { CreateHackathonDto } from './hackathon.dto';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event', example: 'Annual Tech Summit 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'A detailed description of the event' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'UUID of the event type' })
  @IsUUID()
  @IsNotEmpty()
  eventTypeId: string;

  @ApiProperty({ description: 'UUID of the venue where the event is held' })
  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @ApiProperty({ description: 'Event start time', example: '2026-10-15T18:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Event end time', example: '2026-10-15T21:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: 'Maximum number of attendees allowed', example: 100 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacity: number;

  @ApiPropertyOptional({
    description: 'Whether registration requires organizer approval',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Array of tag IDs to attach to the event', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of category IDs to attach to the event',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Array of sessions to create', type: [CreateSessionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @classTransformerType(() => CreateSessionDto)
  sessions?: CreateSessionDto[];

  @ApiPropertyOptional({ description: 'Hackathon specific configuration' })
  @IsOptional()
  @ValidateNested()
  @classTransformerType(() => CreateHackathonDto)
  hackathonConfig?: CreateHackathonDto;

  @ApiPropertyOptional({ description: 'Event access type', example: 'PUBLIC' })
  @IsString()
  @IsOptional()
  accessType?: string;

  @ApiPropertyOptional({ description: 'Array of emails to invite', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invites?: string[];

  @ApiPropertyOptional({
    description: 'Event thumbnail URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Number of guests allowed per registered student',
    example: 2,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  guestLimitPerUser?: number;
}
