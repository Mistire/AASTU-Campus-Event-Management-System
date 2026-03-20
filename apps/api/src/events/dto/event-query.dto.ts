import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class EventQueryDto {
    @ApiPropertyOptional({ description: 'Filter events by category UUID' })
    @IsUUID()
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({ description: 'Filter events by a specific date', example: '2026-10-15' })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({ description: 'Filter events by department UUID' })
    @IsUUID()
    @IsOptional()
    department?: string;

    @ApiPropertyOptional({ description: 'Sort results by popularity or date', enum: ['popularity', 'date'] })
    @IsString()
    @IsOptional()
    sortBy?: 'popularity' | 'date'; // popularity uses registration count

    @ApiPropertyOptional({ description: 'Search term for event titles or descriptions' })
    @IsString()
    @IsOptional()
    search?: string;
}
