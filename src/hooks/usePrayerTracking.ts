import { useCallback } from 'react';
import { format } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { calculateStreak } from '../utils/streakCalculator';
import type { OracaoConjugalData, PrayerCompletion, OracaoPessoalData } from '../types';

const defaultConjugalData: OracaoConjugalData = {
  lastCompleted: '',
  monthlyCount: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  completions: [],
  currentWisdomIndex: 0,
  lastMonthReset: format(new Date(), 'yyyy-MM'),
};

const defaultPessoalData: OracaoPessoalData = {
  lastCompleted: '',
  monthlyCount: 0,
  currentStreak: 0,
  completions: [],
};

export function usePrayerTracking() {
  const [conjugalData, setConjugalData] = useLocalStorage<OracaoConjugalData>(
    'ens-oracao-conjugal',
    defaultConjugalData
  );

  const [pessoalData, setPessoalData] = useLocalStorage<OracaoPessoalData>(
    'ens-oracao-pessoal',
    defaultPessoalData
  );

  // Auto-reset monthly counts
  const currentMonth = format(new Date(), 'yyyy-MM');
  if (conjugalData.lastMonthReset !== currentMonth) {
    setConjugalData(prev => ({
      ...prev,
      monthlyCount: 0,
      lastMonthReset: currentMonth,
    }));
  }

  const completeConjugalPrayer = useCallback(
    (completion: Omit<PrayerCompletion, 'date'>) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      setConjugalData(prev => {
        const alreadyCompletedToday = prev.completions.some(c => c.date === today);
        if (alreadyCompletedToday) return prev;

        const newCompletions = [...prev.completions, { ...completion, date: today }];
        const dates = newCompletions.map(c => c.date);
        const currentStreak = calculateStreak(dates);
        const longestStreak = Math.max(prev.longestStreak, currentStreak);

        return {
          ...prev,
          lastCompleted: today,
          monthlyCount: prev.monthlyCount + 1,
          currentStreak,
          longestStreak,
          totalCompletions: prev.totalCompletions + 1,
          completions: newCompletions,
          currentWisdomIndex: (prev.currentWisdomIndex + 1) % 50,
        };
      });
    },
    [setConjugalData]
  );

  const completePessoalPrayer = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setPessoalData(prev => {
      if (prev.completions.includes(today)) return prev;
      const newCompletions = [...prev.completions, today];
      const currentStreak = calculateStreak(newCompletions);
      return {
        ...prev,
        lastCompleted: today,
        monthlyCount: prev.monthlyCount + 1,
        currentStreak,
        completions: newCompletions,
      };
    });
  }, [setPessoalData]);

  const isCompletedToday = (type: 'conjugal' | 'pessoal') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (type === 'conjugal') {
      return conjugalData.completions.some(c => c.date === today);
    }
    return pessoalData.completions.includes(today);
  };

  const getCompletedDates = () => {
    return conjugalData.completions.map(c => c.date);
  };

  return {
    conjugalData,
    pessoalData,
    completeConjugalPrayer,
    completePessoalPrayer,
    isCompletedToday,
    getCompletedDates,
  };
}
