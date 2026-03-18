import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class UpdateEventDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsUUID()
    @IsOptional()
    statusId?: string;

    @IsUUID()
    @IsOptional()
    venueId?: string;

    @IsDateString()
    @IsOptional()
    startTime?: string;

    @IsDateString()
    @IsOptional()
    endTime?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    capacity?: number;
}
