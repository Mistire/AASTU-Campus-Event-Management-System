import { BadRequestException } from '@nestjs/common';
import { TimeRangeDto } from './dto/time-range.dto';

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 60 * 60 * 1000;

const PRESET_DAYS: Record<string, number> = {
  last_7_days: 7,
  last_30_days: 30,
  last_90_days: 90,
};

export function resolveTimeRange(dto: TimeRangeDto): { start: Date; end: Date } {
  const now = new Date();

  // Preset takes priority
  if (dto.preset) {
    const days = PRESET_DAYS[dto.preset];
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - days);
    return { start, end: now };
  }

  // Custom range
  if (dto.startDate || dto.endDate) {
    const start = dto.startDate
      ? new Date(dto.startDate)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = dto.endDate ? new Date(dto.endDate) : now;

    if (start > end) {
      throw new BadRequestException(
        `startDate (${start.toISOString()}) must not be after endDate (${end.toISOString()})`,
      );
    }

    if (now.getTime() - end.getTime() > FIVE_YEARS_MS) {
      throw new BadRequestException(
        `endDate (${end.toISOString()}) is more than 5 years in the past, which exceeds the allowed historical limit`,
      );
    }

    return { start, end };
  }

  // Default: last 30 days
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end: now };
}
