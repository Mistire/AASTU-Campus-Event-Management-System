import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventTypeDto {
  @ApiProperty({ description: 'Unique name for the event type', example: 'Seminar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the event type',
    example: 'A formal academic presentation or lecture.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateEventTypeDto {
  @ApiPropertyOptional({ description: 'Unique name for the event type' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the event type' })
  @IsString()
  @IsOptional()
  description?: string;
}
