import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';

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

const ERROR_AUTO_CLEAR_MS = 5000;

export function SyncProvider({ children }: { children: ReactNode }) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const reportError = useCallback((key: string) => {
    setActiveKeys(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setHasError(true);
    // Auto-clear the error flag so a one-off failure doesn't leave a
    // permanent red pill on screen.
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setHasError(false);
      errorTimerRef.current = null;
    }, ERROR_AUTO_CLEAR_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
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
