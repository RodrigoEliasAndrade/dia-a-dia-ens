import { useCallback } from 'react';
import { useSyncedStorage } from './useSyncedStorage';

export interface DiarioEntry {
  id: string;
  date: string;          // ISO date YYYY-MM-DD
  method: string;        // 'lectio-divina' | 'inaciana' | 'salesiana'
  methodName: string;    // "Lectio Divina" | "Contemplação Inaciana" | "Meditação Salesiana"
  methodEmoji: string;   // 📜 🎭 🌹
  gospelReference: string;
  notes: string;
  duration: number;      // minutes
}

export function useDiario() {
  const [entries, setEntries] = useSyncedStorage<DiarioEntry[]>('ens-diario-pessoal', []);

  const addEntry = useCallback((entry: Omit<DiarioEntry, 'id'>) => {
    const id = `${entry.date}-${Date.now()}`;
    setEntries(prev => [...prev, { ...entry, id }]);
  }, [setEntries]);

  const updateEntry = useCallback((id: string, patch: Partial<Omit<DiarioEntry, 'id'>>) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [setEntries]);

  const getEntries = useCallback(() => {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  const getEntriesByMonth = useCallback(() => {
    const sorted = getEntries();
    const grouped: Record<string, DiarioEntry[]> = {};
    for (const entry of sorted) {
      const month = entry.date.slice(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(entry);
    }
    return grouped;
  }, [getEntries]);

  const searchEntries = useCallback((query: string) => {
    const lower = query.toLowerCase();
    return getEntries().filter(
      e =>
        e.notes.toLowerCase().includes(lower) ||
        e.gospelReference.toLowerCase().includes(lower) ||
        e.methodName.toLowerCase().includes(lower)
    );
  }, [getEntries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntries,
    getEntriesByMonth,
    searchEntries,
  };
}
