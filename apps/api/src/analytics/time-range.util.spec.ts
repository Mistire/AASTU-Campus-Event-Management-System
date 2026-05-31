import { BadRequestException } from '@nestjs/common';
import { resolveTimeRange } from './time-range.util';

describe('resolveTimeRange', () => {
  const NOW = new Date('2025-06-01T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('presets', () => {
    it('resolves last_7_days to 7 days before now', () => {
      const { start, end } = resolveTimeRange({ preset: 'last_7_days' });
      expect(end.toISOString()).toBe(NOW.toISOString());
      const expectedStart = new Date(NOW);
      expectedStart.setUTCDate(expectedStart.getUTCDate() - 7);
      expect(start.toISOString()).toBe(expectedStart.toISOString());
    });

    it('resolves last_30_days to 30 days before now', () => {
      const { start, end } = resolveTimeRange({ preset: 'last_30_days' });
      expect(end.toISOString()).toBe(NOW.toISOString());
      const expectedStart = new Date(NOW);
      expectedStart.setUTCDate(expectedStart.getUTCDate() - 30);
      expect(start.toISOString()).toBe(expectedStart.toISOString());
    });

    it('resolves last_90_days to 90 days before now', () => {
      const { start, end } = resolveTimeRange({ preset: 'last_90_days' });
      expect(end.toISOString()).toBe(NOW.toISOString());
      const expectedStart = new Date(NOW);
      expectedStart.setUTCDate(expectedStart.getUTCDate() - 90);
      expect(start.toISOString()).toBe(expectedStart.toISOString());
    });
  });

  describe('default (no range, no preset)', () => {
    it('defaults to last 30 days', () => {
      const { start, end } = resolveTimeRange({});
      expect(end.toISOString()).toBe(NOW.toISOString());
      const expectedStart = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
      expect(start.toISOString()).toBe(expectedStart.toISOString());
    });
  });

  describe('custom range', () => {
    it('returns the provided start and end dates', () => {
      const { start, end } = resolveTimeRange({
        startDate: '2025-05-01T00:00:00.000Z',
        endDate: '2025-05-31T00:00:00.000Z',
      });
      expect(start.toISOString()).toBe('2025-05-01T00:00:00.000Z');
      expect(end.toISOString()).toBe('2025-05-31T00:00:00.000Z');
    });
  });

  describe('validation', () => {
    it('throws BadRequestException when startDate > endDate', () => {
      expect(() =>
        resolveTimeRange({
          startDate: '2025-05-31T00:00:00.000Z',
          endDate: '2025-05-01T00:00:00.000Z',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException with descriptive message when startDate > endDate', () => {
      expect(() =>
        resolveTimeRange({
          startDate: '2025-05-31T00:00:00.000Z',
          endDate: '2025-05-01T00:00:00.000Z',
        }),
      ).toThrow(/startDate.*must not be after endDate/);
    });

    it('throws BadRequestException when endDate is more than 5 years in the past', () => {
      // NOW is 2025-06-01; 5 years ago is ~2020-06-01; use 2019 to be safely over
      expect(() =>
        resolveTimeRange({
          startDate: '2019-01-01T00:00:00.000Z',
          endDate: '2019-06-01T00:00:00.000Z',
        }),
      ).toThrow(BadRequestException);
    });

    it('throws BadRequestException with descriptive message when endDate exceeds 5-year limit', () => {
      expect(() =>
        resolveTimeRange({
          startDate: '2019-01-01T00:00:00.000Z',
          endDate: '2019-06-01T00:00:00.000Z',
        }),
      ).toThrow(/more than 5 years in the past/);
    });

    it('does not throw for endDate exactly at the 5-year boundary', () => {
      // Just inside the limit: 5 years ago minus 1 day should be fine
      const fiveYearsAgoMs = NOW.getTime() - 5 * 365.25 * 24 * 60 * 60 * 1000;
      const justInside = new Date(fiveYearsAgoMs + 24 * 60 * 60 * 1000); // 1 day inside limit
      expect(() =>
        resolveTimeRange({
          startDate: new Date(justInside.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: justInside.toISOString(),
        }),
      ).not.toThrow();
    });
  });
});
