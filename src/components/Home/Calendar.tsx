import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { getMonthDays, getMonthName, getFirstDayOffset, formatDate, isToday } from '../../utils/dateUtils';

interface CalendarProps {
  completedDates: string[];
  deverSentarDay?: number;
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Calendar({ completedDates, deverSentarDay = 15 }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = getMonthDays(currentMonth);
  const offset = getFirstDayOffset(currentMonth);
  const monthName = getMonthName(currentMonth);

  const isCompleted = (date: Date) => completedDates.includes(formatDate(date));
  const isDeverSentar = (date: Date) => date.getDate() === deverSentarDay;

  return (
    <div className="bg-white rounded-2xl mx-4 mt-4 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-2 rounded-full hover:bg-ens-cream active:bg-gray-200 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-ens-blue" />
        </button>
        <h2 className="text-lg font-semibold text-ens-blue capitalize">{monthName}</h2>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 rounded-full hover:bg-ens-cream active:bg-gray-200 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-ens-blue" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-ens-text-light py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const completed = isCompleted(day);
          const sentar = isDeverSentar(day);
          const today = isToday(day);

          return (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className={`
                relative flex flex-col items-center justify-center py-1.5 rounded-lg text-sm
                ${today ? 'ring-2 ring-ens-gold font-bold' : ''}
                ${completed ? 'bg-ens-blue/10' : ''}
              `}
            >
              <span className={`${completed ? 'text-ens-blue font-semibold' : 'text-ens-text'}`}>
                {format(day, 'd')}
              </span>
              <div className="flex gap-0.5 h-3 items-center">
                {completed && <span className="text-[10px]">✅</span>}
                {sentar && <span className="text-[10px]">💑</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
