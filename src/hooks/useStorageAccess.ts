import { useEffect, useState } from 'react';

/**
 * Detects browsers where localStorage is blocked or unavailable.
 *
 * iOS Safari in Private Browsing mode, "Block All Cookies", and some content
 * blockers can throw or no-op on localStorage.setItem. Without storage:
 *   - Supabase auth cannot persist sessions (re-login on every reload)
 *   - Our useLocalStorage hook silently fails
 *
 * Returns true once we've confirmed storage works. False means we should warn
 * the user before they try to create an account.
 */
export function useStorageAccess(): { storageOk: boolean; reason: string | null } {
  const [storageOk, setStorageOk] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const probeKey = '__ens_storage_probe__';
    try {
      window.localStorage.setItem(probeKey, '1');
      const got = window.localStorage.getItem(probeKey);
      window.localStorage.removeItem(probeKey);
      if (got !== '1') {
        setStorageOk(false);
        setReason('localStorage read returned wrong value');
      }
    } catch (e) {
      setStorageOk(false);
      setReason(e instanceof Error ? e.message : 'localStorage blocked');
    }
  }, []);

  return { storageOk, reason };
}
