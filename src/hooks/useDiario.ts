import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

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
  const [entries, setEntries] = useLocalStorage<DiarioEntry[]>('ens-diario-pessoal', []);

  const addEntry = useCallback((entry: Omit<DiarioEntry, 'id'>) => {
    const id = `${entry.date}-${Date.now()}`;
    setEntries(prev => [...prev, { ...entry, id }]);
  }, [setEntries]);

  // Get all entries sorted newest first
  const getEntries = useCallback(() => {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  // Group entries by month (YYYY-MM)
  const getEntriesByMonth = useCallback(() => {
    const sorted = getEntries();
    const grouped: Record<string, DiarioEntry[]> = {};
    for (const entry of sorted) {
      const month = entry.date.slice(0, 7); // YYYY-MM
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(entry);
    }
    return grouped;
  }, [getEntries]);

  // Search entries by text
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
    getEntries,
    getEntriesByMonth,
    searchEntries,
  };
}
