import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckInDto {
  @ApiProperty({ description: 'The UUID of the event' })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiPropertyOptional({ description: 'The UUID of the specific session' })
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: 'The JWT ticket token submitted by the organizer from the attendee\'s QR code' })
  @IsString()
  @IsNotEmpty()
  ticketToken: string;
}
