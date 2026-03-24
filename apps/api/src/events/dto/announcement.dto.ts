import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
    @ApiProperty({ description: 'Announcement title', example: 'Schedule Change' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Announcement message body', example: 'The event has been moved to Hall B.' })
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
