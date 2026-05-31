import { useCallback, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useSyncedStorage } from './useSyncedStorage';
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
  lastMonthReset: format(new Date(), 'yyyy-MM'),
};

export function usePrayerTracking() {
  // Oração Conjugal is SHARED between spouses → couple scope
  const [conjugalData, setConjugalData] = useSyncedStorage<OracaoConjugalData>(
    'ens-oracao-conjugal',
    defaultConjugalData,
    { scope: 'couple' }
  );

  // Oração Pessoal is PRIVATE to each spouse → user scope (default)
  const [pessoalData, setPessoalData] = useSyncedStorage<OracaoPessoalData>(
    'ens-oracao-pessoal',
    defaultPessoalData
  );

  // Auto-reset monthly counts — runs once per month transition, inside an effect
  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    if (conjugalData.lastMonthReset !== currentMonth) {
      setConjugalData(prev => ({
        ...prev,
        monthlyCount: 0,
        lastMonthReset: currentMonth,
      }));
    }
    if (pessoalData.lastMonthReset !== currentMonth) {
      setPessoalData(prev => ({
        ...prev,
        monthlyCount: 0,
        lastMonthReset: currentMonth,
      }));
    }
  }, [conjugalData.lastMonthReset, pessoalData.lastMonthReset, setConjugalData, setPessoalData]);

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

  const isCompletedToday = useCallback((type: 'conjugal' | 'pessoal') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (type === 'conjugal') {
      return conjugalData.completions.some(c => c.date === today);
    }
    return pessoalData.completions.includes(today);
  }, [conjugalData.completions, pessoalData.completions]);

  const completedDates = useMemo(() => {
    const conjugalDates = conjugalData.completions.map(c => c.date);
    const pessoalDates = pessoalData.completions;
    return [...new Set([...conjugalDates, ...pessoalDates])];
  }, [conjugalData.completions, pessoalData.completions]);

  const getCompletedDates = useCallback(() => completedDates, [completedDates]);

  return {
    conjugalData,
    pessoalData,
    completeConjugalPrayer,
    completePessoalPrayer,
    isCompletedToday,
    getCompletedDates,
  };
}
