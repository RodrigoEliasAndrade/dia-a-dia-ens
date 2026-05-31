import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Global aggregator for sync activity across all useSyncedStorage instances.
 * Every synced-storage hook reports its activity here so the UI can show a
 * single, accurate sync indicator instead of fighting per-component state.
 */

interface SyncContextType {
  activeKeys: Set<string>;
  lastSavedAt: string | null;
  hasError: boolean;
  reportStart: (key: string) => void;
  reportSuccess: (key: string, at: string) => void;
  reportError: (key: string) => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const reportStart = useCallback((key: string) => {
    setActiveKeys(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const reportSuccess = useCallback((key: string, at: string) => {
    setActiveKeys(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setLastSavedAt(at);
    setHasError(false);
  }, []);

  const reportError = useCallback((key: string) => {
    setActiveKeys(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setHasError(true);
  }, []);

  const value = useMemo(
    () => ({ activeKeys, lastSavedAt, hasError, reportStart, reportSuccess, reportError }),
    [activeKeys, lastSavedAt, hasError, reportStart, reportSuccess, reportError],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  // Allow hooks to be called outside the provider (e.g. tests, isolated dev) —
  // they just won't report.
  return ctx;
}
