import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title', example: 'Schedule Change' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Announcement message body',
    example: 'The event has been moved to Hall B.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ description: 'Announcement title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Announcement message body' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class AnnouncementQueryDto {
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
}
