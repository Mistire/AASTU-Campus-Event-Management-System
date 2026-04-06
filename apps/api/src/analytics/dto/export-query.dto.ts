import { IsIn, IsOptional } from 'class-validator';
import { TimeRangeDto } from './time-range.dto';

export class ExportQueryDto extends TimeRangeDto {
  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format?: 'csv' | 'pdf' = 'csv';

  @IsOptional()
  @IsIn(['admin', 'event'])
  scope?: 'admin' | 'event';
}
