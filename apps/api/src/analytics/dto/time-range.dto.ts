import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class TimeRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['last_7_days', 'last_30_days', 'last_90_days'])
  preset?: string;
}
