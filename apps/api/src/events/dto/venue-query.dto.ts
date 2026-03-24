import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class VenueQueryDto {
    @ApiPropertyOptional({ description: 'Search by venue name, building, or room number' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Minimum capacity filter', example: 50 })
    @IsInt()
    @Min(1)
    @IsOptional()
    minCapacity?: number;

    @ApiPropertyOptional({ description: 'Maximum capacity filter', example: 500 })
    @IsInt()
    @Min(1)
    @IsOptional()
    maxCapacity?: number;

    @ApiPropertyOptional({ description: 'Page number (1-indexed)', example: 1, default: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ description: 'Number of results per page', example: 10, default: 10 })
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;
}

export class VenueAvailabilityQueryDto {
    @ApiProperty({ description: 'Start time to check availability', example: '2026-10-15T09:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'End time to check availability', example: '2026-10-15T17:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @ApiPropertyOptional({ description: 'Minimum required capacity' })
    @IsInt()
    @Min(1)
    @IsOptional()
    minCapacity?: number;
}
