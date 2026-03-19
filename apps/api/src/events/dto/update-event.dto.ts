import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class UpdateEventDto {
    @ApiPropertyOptional({ description: 'The title of the event', example: 'Networking Night (Updated)' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ description: 'A detailed description of the event' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'UUID of the category for the event' })
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'UUID of the current status of the event' })
    @IsUUID()
    @IsOptional()
    statusId?: string;

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
}
