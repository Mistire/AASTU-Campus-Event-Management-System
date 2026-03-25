import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
    @ApiProperty({ description: 'Unique name for the tag', example: '#AI' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class UpdateTagDto {
    @ApiPropertyOptional({ description: 'Unique name for the tag' })
    @IsString()
    @IsOptional()
    name?: string;
}

export class TagQueryDto {
    @ApiPropertyOptional({ description: 'Search term for tag names' })
    @IsString()
    @IsOptional()
    search?: string;
}
