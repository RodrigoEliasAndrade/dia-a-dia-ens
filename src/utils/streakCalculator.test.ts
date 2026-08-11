import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateStreak, getMonthlyCount } from './streakCalculator';

describe('streakCalculator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00-03:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts a sequence ending today and ignores duplicate dates', () => {
    expect(calculateStreak([
      '2026-01-08',
      '2026-01-09',
      '2026-01-10',
      '2026-01-10',
    ])).toBe(3);
  });

  it('keeps a streak alive when the most recent completion was yesterday', () => {
    expect(calculateStreak(['2026-01-07', '2026-01-08', '2026-01-09'])).toBe(3);
  });

  it('returns zero when the sequence is no longer current', () => {
    expect(calculateStreak(['2026-01-07', '2026-01-08'])).toBe(0);
  });

  it('counts only entries from the current month', () => {
    expect(getMonthlyCount(['2025-12-31', '2026-01-01', '2026-01-10'])).toBe(2);
  });
});
