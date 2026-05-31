import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';

/**
 * useSyncedStorage — persists data to both localStorage AND Supabase.
 *
 * Strategy:
 *   1. Initial value comes from localStorage (instant, offline-friendly)
 *   2. On mount, fetch from Supabase (with 6s timeout). If remote is newer,
 *      overwrite local.
 *   3. On every change, write to localStorage immediately and queue a
 *      debounced upsert (with 6s timeout).
 *   4. Realtime subscription updates state when the same key changes from
 *      another device.
 *   5. Reports activity to the global SyncContext so a single UI indicator
 *      shows aggregate sync state.
 *
 * Returned status:
 *   - syncing: any push is in-flight
 *   - isInitialLoading: true while the first pull is happening
 *   - lastSyncedAt: ISO timestamp of the last successful sync
 *   - error: last sync error message
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

const REQUEST_TIMEOUT_MS = 6000;

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

/** Race a thenable against a timeout. Resolves to { __timeout: true } on timeout. */
function withTimeout<T>(
  thenable: PromiseLike<T>,
  ms: number,
): Promise<T | { __timeout: true }> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<{ __timeout: true }>(resolve => setTimeout(() => resolve({ __timeout: true }), ms)),
  ]);
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

  // Refs to break dependency cycles — these change identity but we don't
  // want the effects to re-run when they do.
  const syncRef = useRef(sync);
  syncRef.current = sync;
  const initialValueRef = useRef(initialValue);
  useEffect(() => { initialValueRef.current = initialValue; }, [initialValue]);

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialPull = useRef(true);

  const scopeId = scope === 'couple' ? profile?.couple_id ?? null : user?.id ?? null;
  const table = scope === 'couple' ? 'couple_data' : 'user_data';
  const idColumn = scope === 'couple' ? 'couple_id' : 'user_id';

  // INITIAL PULL — fetch remote on mount/login. Single source of truth: this
  // effect MUST always pair its reportStart with a reportSuccess/reportError.
  useEffect(() => {
    if (!scopeId) return;
    let settled = false;
    setIsInitialLoading(true);
    setError(null);
    syncRef.current?.reportStart(key);

    const finish = (ok: boolean, at?: string, errMsg?: string) => {
      if (settled) return;
      settled = true;
      if (ok && at) {
        syncRef.current?.reportSuccess(key, at);
      } else {
        if (errMsg) setError(errMsg);
        syncRef.current?.reportError(key);
      }
      isInitialPull.current = false;
      setIsInitialLoading(false);
    };

    (async () => {
      const result = await withTimeout(
        supabase
          .from(table)
          .select('data, updated_at')
          .eq(idColumn, scopeId)
          .eq('data_key', key)
          .maybeSingle(),
        REQUEST_TIMEOUT_MS,
      );

      if ('__timeout' in result) {
        console.warn(`[useSyncedStorage:${key}] pull timed out`);
        finish(false, undefined, 'timeout');
        return;
      }

      const { data, error: fetchError } = result;

      if (fetchError) {
        console.warn(`[useSyncedStorage:${key}] pull failed`, fetchError.message);
        finish(false, undefined, fetchError.message);
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
        finish(true, data.updated_at);
        return;
      }

      // No remote yet — push local up if it differs from default.
      const local = readLocal(key, initialValueRef.current);
      if (JSON.stringify(local) !== JSON.stringify(initialValueRef.current)) {
        const upsertResult = await withTimeout(
          supabase.from(table).upsert({ [idColumn]: scopeId, data_key: key, data: local }),
          REQUEST_TIMEOUT_MS,
        );
        if ('__timeout' in upsertResult) {
          finish(false, undefined, 'timeout (initial push)');
          return;
        }
        if (upsertResult.error) {
          finish(false, undefined, upsertResult.error.message);
          return;
        }
        const now = new Date().toISOString();
        window.localStorage.setItem(`${key}::synced-at`, now);
        setLastSyncedAt(now);
        finish(true, now);
      } else {
        // Nothing to push, fresh device, empty data — still report success.
        finish(true, new Date().toISOString());
      }
    })().catch(e => {
      console.warn(`[useSyncedStorage:${key}] unexpected error`, e);
      finish(false, undefined, String(e));
    });

    return () => {
      // If the effect tears down before settlement (rare — happens when
      // scopeId/key/table change mid-flight), report a clean settle so
      // the SyncContext doesn't leak active keys.
      if (!settled) {
        settled = true;
        syncRef.current?.reportError(key);
      }
    };
  }, [scopeId, table, idColumn, key]); // NOTE: sync intentionally NOT in deps

  // REALTIME subscription — independent of the pull above.
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
        syncRef.current?.reportStart(key);
        setSyncing(true);
        setError(null);

        pushTimer.current = setTimeout(async () => {
          const result = await withTimeout(
            supabase.from(table).upsert({ [idColumn]: scopeId, data_key: key, data: resolved }),
            REQUEST_TIMEOUT_MS,
          );

          if ('__timeout' in result) {
            console.warn(`[useSyncedStorage:${key}] push timed out`);
            setError('timeout');
            syncRef.current?.reportError(key);
          } else if (result.error) {
            console.warn(`[useSyncedStorage:${key}] push failed`, result.error.message);
            setError(result.error.message);
            syncRef.current?.reportError(key);
          } else {
            const now = new Date().toISOString();
            window.localStorage.setItem(`${key}::synced-at`, now);
            setLastSyncedAt(now);
            syncRef.current?.reportSuccess(key, now);
          }
          setSyncing(false);
        }, 800);

        return resolved;
      });
    },
    [key, scopeId, table, idColumn],
  );

  return [value, setValue, { syncing, isInitialLoading, lastSyncedAt, error }];
}
