import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
    @IsUUID()
    @IsNotEmpty()
    eventId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;
}

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
