import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InviteResponseDto {
    @ApiProperty({ description: 'Accept or reject the invitation', example: true })
    @IsBoolean()
    @IsNotEmpty()
    accept: boolean;
}

export class InviteOrganizerDto {
    @ApiProperty({ description: 'UUID of the user to invite as organizer' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiPropertyOptional({ description: 'Role for the organizer', example: 'Co-Organizer' })
    @IsString()
    @IsOptional()
    role?: string;
}
