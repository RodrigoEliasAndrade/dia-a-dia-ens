import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getMonthDays(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

export function getMonthName(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getFirstDayOffset(date: Date): number {
  // Sunday = 0, we want Monday = 0
  const day = getDay(startOfMonth(date));
  return day === 0 ? 6 : day - 1;
}

export { isToday, isSameMonth, format };
