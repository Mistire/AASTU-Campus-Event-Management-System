import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @IsUUID()
    @IsNotEmpty()
    statusId: string;

    @IsUUID()
    @IsNotEmpty()
    venueId: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    capacity: number;
}
