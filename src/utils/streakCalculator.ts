import { format, subDays, parseISO } from 'date-fns';

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...new Set(dates)].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Streak must include today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = parseISO(sortedDates[i]);
    const prev = parseISO(sortedDates[i + 1]);
    const diffDays = Math.round(
      (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getMonthlyCount(dates: string[]): number {
  const currentMonth = format(new Date(), 'yyyy-MM');
  return dates.filter(d => d.startsWith(currentMonth)).length;
}
