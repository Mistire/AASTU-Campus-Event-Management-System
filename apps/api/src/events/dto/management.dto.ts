// Legacy DTO — kept for backward compatibility
// New session DTOs are in session.dto.ts
// Organizer invite DTOs are in invitation.dto.ts

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrganizerDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
