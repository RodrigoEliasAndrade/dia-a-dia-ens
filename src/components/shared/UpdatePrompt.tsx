import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Shown when the PWA service worker detects a new version.
 * Click "Atualizar" to activate the new SW and reload.
 */
export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(_r) {
      // SW registered
    },
    onRegisterError(error) {
      console.warn('[SW] registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) setShowPrompt(true);
  }, [needRefresh]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 z-[55] bg-ens-blue text-white rounded-2xl shadow-lg p-4 max-w-[600px] mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">Nova versão disponível</h3>
          <p className="text-xs opacity-90">Toque em atualizar pra carregar a versão mais recente.</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-4 py-2 rounded-lg bg-white text-ens-blue text-xs font-semibold active:scale-95 transition-transform"
        >
          Atualizar
        </button>
        <button
          onClick={() => {
            setNeedRefresh(false);
            setShowPrompt(false);
          }}
          aria-label="Dispensar"
          className="text-white/70 text-xs ml-1"
        >
          Depois
        </button>
      </div>
    </div>
  );
}
