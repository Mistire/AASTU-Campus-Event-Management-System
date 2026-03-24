import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateHackathonDto {
  @ApiProperty({ description: 'Minimum team size', example: 2 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  teamSizeMin: number;

  @ApiProperty({ description: 'Maximum team size', example: 5 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  teamSizeMax: number;

  @ApiProperty({ description: 'Submission deadline', example: '2026-10-20T23:59:00Z' })
  @IsDateString()
  @IsNotEmpty()
  submissionDeadline: string;

  @ApiPropertyOptional({ description: 'Judging criteria description' })
  @IsString()
  @IsOptional()
  judgingCriteria?: string;
}

export class UpdateHackathonDto {
  @ApiPropertyOptional({ description: 'Minimum team size' })
  @IsInt()
  @Min(1)
  @IsOptional()
  teamSizeMin?: number;

  @ApiPropertyOptional({ description: 'Maximum team size' })
  @IsInt()
  @Min(1)
  @IsOptional()
  teamSizeMax?: number;

  @ApiPropertyOptional({ description: 'Submission deadline' })
  @IsDateString()
  @IsOptional()
  submissionDeadline?: string;

  @ApiPropertyOptional({ description: 'Judging criteria description' })
  @IsString()
  @IsOptional()
  judgingCriteria?: string;
}
