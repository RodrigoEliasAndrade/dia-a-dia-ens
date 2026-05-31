import { useEffect, useState } from 'react';
import { CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { useSync } from '../../contexts/SyncContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

/**
 * Floating sync status pill — bottom-right of the screen.
 * Quietly shows one of: syncing, saved, offline, error.
 * Auto-hides 2 seconds after the last successful sync.
 */
export default function SyncIndicator() {
  const sync = useSync();
  const { isOnline } = useNetworkStatus();
  const [showSaved, setShowSaved] = useState(false);

  const syncing = sync?.activeKeys.size ? sync.activeKeys.size > 0 : false;
  const hasError = sync?.hasError ?? false;
  const lastSavedAt = sync?.lastSavedAt ?? null;

  // Briefly flash "Salvo" right after a save completes
  useEffect(() => {
    if (!lastSavedAt) return;
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [lastSavedAt]);

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed left-1/2 -translate-x-1/2 top-3 z-[60] bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
      >
        <CloudOff className="w-3.5 h-3.5" />
        Sem conexão — suas notas ficam salvas localmente
      </div>
    );
  }

  if (hasError && !syncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 right-3 z-[60] bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        Erro ao salvar — tentaremos novamente
      </div>
    );
  }

  if (syncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 right-3 z-[60] bg-white border border-gray-200 text-ens-text-light text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Sincronizando...
      </div>
    );
  }

  if (showSaved) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 right-3 z-[60] bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 animate-fade-in"
      >
        <Check className="w-3.5 h-3.5" />
        Salvo
      </div>
    );
  }

  return null;
}
