import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ManualCheckInDto {
  @ApiProperty({ description: 'The UUID of the event' })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'The UUID of the attendee (user)' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'The UUID of the specific session' })
  @IsUUID()
  @IsOptional()
  sessionId?: string;
}
