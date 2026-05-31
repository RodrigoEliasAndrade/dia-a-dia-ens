import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';

/**
 * useSyncedStorage — persists data to both localStorage AND Supabase.
 *
 * Strategy:
 *   1. Initial value comes from localStorage (instant, offline-friendly)
 *   2. On mount, fetch from Supabase. If remote is newer, overwrite local.
 *   3. On every change, write to localStorage immediately and queue a debounced upsert.
 *   4. Realtime subscription updates state when the same key changes from
 *      another device.
 *   5. Reports activity to the global SyncContext so a single UI indicator
 *      shows aggregate sync state.
 *
 * Returned status:
 *   - syncing: any push is in-flight
 *   - isInitialLoading: true while the first pull is happening
 *   - lastSyncedAt: ISO timestamp of the last successful sync (push or pull)
 */

type ScopeType = 'user' | 'couple';

interface UseSyncedStorageOptions {
  scope?: ScopeType;
}

interface SyncStatus {
  syncing: boolean;
  isInitialLoading: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function useSyncedStorage<T>(
  key: string,
  initialValue: T,
  options: UseSyncedStorageOptions = {},
): [T, (value: T | ((prev: T) => T)) => void, SyncStatus] {
  const { scope = 'user' } = options;
  const { user, profile } = useAuth();
  const sync = useSync();

  const [value, setValueState] = useState<T>(() => readLocal(key, initialValue));
  const [syncing, setSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialPull = useRef(true);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const scopeId = scope === 'couple' ? profile?.couple_id ?? null : user?.id ?? null;
  const table = scope === 'couple' ? 'couple_data' : 'user_data';
  const idColumn = scope === 'couple' ? 'couple_id' : 'user_id';

  // INITIAL PULL
  useEffect(() => {
    if (!scopeId) return;
    let cancelled = false;
    setIsInitialLoading(true);
    setError(null);
    sync?.reportStart(key);

    (async () => {
      const { data, error: fetchError } = await supabase
        .from(table)
        .select('data, updated_at')
        .eq(idColumn, scopeId)
        .eq('data_key', key)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        console.warn(`[useSyncedStorage:${key}] pull failed`, fetchError.message);
        setError(fetchError.message);
        setIsInitialLoading(false);
        sync?.reportError(key);
        isInitialPull.current = false;
        return;
      }

      if (data) {
        const localSyncedAt = window.localStorage.getItem(`${key}::synced-at`) ?? '';
        if (data.updated_at >= localSyncedAt) {
          isInitialPull.current = true;
          setValueState(data.data as T);
          writeLocal(key, data.data);
          window.localStorage.setItem(`${key}::synced-at`, data.updated_at);
          setLastSyncedAt(data.updated_at);
        }
        sync?.reportSuccess(key, data.updated_at);
      } else {
        const local = readLocal(key, initialValueRef.current);
        if (JSON.stringify(local) !== JSON.stringify(initialValueRef.current)) {
          const { error: upsertError } = await supabase
            .from(table)
            .upsert({ [idColumn]: scopeId, data_key: key, data: local });
          if (upsertError) {
            console.warn(`[useSyncedStorage:${key}] initial push failed`, upsertError.message);
            setError(upsertError.message);
            sync?.reportError(key);
          } else {
            const now = new Date().toISOString();
            window.localStorage.setItem(`${key}::synced-at`, now);
            setLastSyncedAt(now);
            sync?.reportSuccess(key, now);
          }
        } else {
          sync?.reportSuccess(key, new Date().toISOString());
        }
      }
      isInitialPull.current = false;
      setIsInitialLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [scopeId, table, idColumn, key, sync]);

  // REALTIME
  useEffect(() => {
    if (!scopeId) return;
    const channel = supabase
      .channel(`sync:${table}:${scopeId}:${key}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${idColumn}=eq.${scopeId}`,
        },
        payload => {
          const row = (payload.new ?? payload.old) as {
            data_key?: string;
            data?: unknown;
            updated_at?: string;
          } | null;
          if (!row || row.data_key !== key) return;
          if (payload.eventType === 'DELETE') return;
          setValueState(row.data as T);
          writeLocal(key, row.data);
          if (row.updated_at) {
            window.localStorage.setItem(`${key}::synced-at`, row.updated_at);
            setLastSyncedAt(row.updated_at);
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [scopeId, table, idColumn, key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState(prev => {
        const resolved = next instanceof Function ? next(prev) : next;
        writeLocal(key, resolved);

        if (!scopeId || isInitialPull.current) return resolved;

        if (pushTimer.current) clearTimeout(pushTimer.current);
        sync?.reportStart(key);
        setSyncing(true);
        setError(null);

        pushTimer.current = setTimeout(async () => {
          const { error: upsertError } = await supabase
            .from(table)
            .upsert({ [idColumn]: scopeId, data_key: key, data: resolved });
          if (upsertError) {
            console.warn(`[useSyncedStorage:${key}] push failed`, upsertError.message);
            setError(upsertError.message);
            sync?.reportError(key);
          } else {
            const now = new Date().toISOString();
            window.localStorage.setItem(`${key}::synced-at`, now);
            setLastSyncedAt(now);
            sync?.reportSuccess(key, now);
          }
          setSyncing(false);
        }, 800);

        return resolved;
      });
    },
    [key, scopeId, table, idColumn, sync],
  );

  return [value, setValue, { syncing, isInitialLoading, lastSyncedAt, error }];
}
