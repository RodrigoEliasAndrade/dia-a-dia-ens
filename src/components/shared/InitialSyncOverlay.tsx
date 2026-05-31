import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSync } from '../../contexts/SyncContext';

/**
 * Shown over the app on the very first session of a logged-in device
 * while initial pulls from Supabase are in flight. Prevents the user
 * from seeing "empty" data and panicking.
 *
 * Behavior:
 *   - Visible while ANY synced storage is in its initial pull AND we
 *     haven't recorded a sync-done flag in localStorage yet.
 *   - After 8 seconds, fades out regardless (network might be very slow;
 *     better to let the user in than block forever).
 */
const FLAG_KEY = 'ens-first-sync-done';
const MAX_WAIT_MS = 5000;

export default function InitialSyncOverlay() {
  const sync = useSync();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(FLAG_KEY) === '1';
    } catch {
      return false;
    }
  });

  const activeCount = sync?.activeKeys.size ?? 0;

  // Mark first-sync done once nothing's active anymore (and we saw at least one)
  useEffect(() => {
    if (dismissed) return;
    if (activeCount === 0 && sync?.lastSavedAt) {
      try {
        window.localStorage.setItem(FLAG_KEY, '1');
      } catch { /* ignore */ }
      setDismissed(true);
    }
  }, [activeCount, sync?.lastSavedAt, dismissed]);

  // Hard timeout — never block the user more than 8s
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setDismissed(true), MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (dismissed || activeCount === 0) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-ens-cream/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg px-8 py-7 max-w-xs text-center">
        <Loader2 className="w-8 h-8 text-ens-blue mx-auto mb-3 animate-spin" />
        <h2 className="text-base font-bold text-ens-blue mb-1">
          Recuperando seus dados
        </h2>
        <p className="text-xs text-ens-text-light leading-relaxed">
          Buscando seu diário, orações e histórico no servidor. Isso só acontece na primeira vez neste dispositivo.
        </p>
      </div>
    </div>
  );
}
