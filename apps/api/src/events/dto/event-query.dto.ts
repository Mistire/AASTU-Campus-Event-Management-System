import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class EventQueryDto {
    @IsUUID()
    @IsOptional()
    category?: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsUUID()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    sortBy?: 'popularity' | 'date'; // popularity uses registration count

    @IsString()
    @IsOptional()
    search?: string;
}
