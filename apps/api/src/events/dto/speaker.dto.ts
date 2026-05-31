import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeakerDto {
  @ApiProperty({ description: 'Full name of the speaker', example: 'Dr. Abebe Bekele' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Short biography of the speaker' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'URL of the speaker profile image' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Organization the speaker belongs to', example: 'AASTU' })
  @IsString()
  @IsOptional()
  organization?: string;
}

export class UpdateSpeakerDto {
  @ApiPropertyOptional({ description: 'Full name of the speaker' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Short biography of the speaker' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'URL of the speaker profile image' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Organization the speaker belongs to' })
  @IsString()
  @IsOptional()
  organization?: string;
}
