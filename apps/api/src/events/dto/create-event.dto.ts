import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateEventDto {
    @ApiProperty({ description: 'The title of the event', example: 'Networking Night' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ description: 'A detailed description of the event' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'UUID of the category for the event' })
    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ description: 'UUID of the current status of the event' })
    @IsUUID()
    @IsNotEmpty()
    statusId: string;

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
}
