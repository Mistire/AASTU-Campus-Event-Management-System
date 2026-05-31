import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

// ── Shared ─────────────────────────────────────────────────────────────
export class InviteResponseDto {
  @ApiProperty({ description: 'Accept or reject the invitation', example: true })
  @IsBoolean()
  @IsNotEmpty()
  accept: boolean;
}

// ── Attendee Invitations (EventInvites table) ──────────────────────────
export class BulkInviteAttendeesDto {
  @ApiProperty({
    description: 'Array of email addresses to invite as attendees',
    example: ['student1@aastu.edu.et', 'student2@aastu.edu.et'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  emails: string[];
}

// ── Organizer Invitations (EventOrganizers table) ──────────────────────
export class InviteOrganizerDto {
  @ApiProperty({ description: 'UUID of the user to invite as co-organizer' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Role for the organizer', example: 'Co-Organizer' })
  @IsString()
  @IsOptional()
  role?: string;
}

// ── Guest Invitations (Graduation Events) ──────────────────────────────
export class InviteGuestsDto {
  @ApiProperty({
    description: 'Array of email addresses of guests to invite',
    example: ['family1@gmail.com', 'family2@gmail.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  emails: string[];
}
