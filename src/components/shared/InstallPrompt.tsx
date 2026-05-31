import { useEffect, useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

/**
 * "Add to Home Screen" prompt for PWA installation.
 *
 * Two paths:
 *   1. Chromium-based (Android Chrome, desktop Chrome, Edge): fires
 *      `beforeinstallprompt` event we can capture and invoke.
 *   2. iOS Safari: no programmatic install API exists. We show a card
 *      with the manual Share → Add to Home Screen instructions.
 *
 * Dismissal: persisted in localStorage so we don't nag.
 */

const DISMISS_KEY = 'ens-install-prompt-dismissed';
const DISMISS_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  // Already installed?
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (Number.isNaN(ts)) return false;
    const ageMs = Date.now() - ts;
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandaloneMode = isStandalone();

  useEffect(() => {
    if (isStandaloneMode) return;
    if (wasRecentlyDismissed()) return;

    // Listen for Chrome's beforeinstallprompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay 5s before showing — let user see the app first
      setTimeout(() => setShow(true), 5000);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS: no event fires. If we're on iOS Safari and not installed, show after delay.
    if (isIOS) {
      const t = setTimeout(() => setShow(true), 8000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [isStandaloneMode, isIOS]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  if (isStandaloneMode || !show) return null;

  // iOS Safari: manual install instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-3 right-3 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 max-w-[600px] mx-auto animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-ens-blue/10 rounded-xl flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-ens-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ens-blue text-sm">Instalar ENS na tela inicial</h3>
            <p className="text-xs text-ens-text-light mt-0.5 mb-2">
              Abre como um app, sem barra do navegador.
            </p>
            <ol className="text-xs text-ens-text leading-relaxed space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-ens-blue/10 rounded text-ens-blue font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                Toque no botão <Share className="inline w-3.5 h-3.5 align-text-bottom" /> <span className="font-medium">Compartilhar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-ens-blue/10 rounded text-ens-blue font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <span className="font-medium">"Adicionar à Tela de Início"</span> <Plus className="inline w-3.5 h-3.5 align-text-bottom" />
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-ens-blue/10 rounded text-ens-blue font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                Toque em <span className="font-medium">"Adicionar"</span>
              </li>
            </ol>
          </div>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Chromium: native install button
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-24 left-3 right-3 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 max-w-[600px] mx-auto animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ens-blue/10 rounded-xl flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-ens-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ens-blue text-sm">Instalar como app</h3>
            <p className="text-xs text-ens-text-light mt-0.5">
              Abre direto sem o navegador, igual app de loja.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={install}
          type="button"
          className="w-full mt-3 py-2.5 rounded-lg bg-ens-blue text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Download className="w-4 h-4" />
          Instalar agora
        </button>
      </div>
    );
  }

  return null;
}
