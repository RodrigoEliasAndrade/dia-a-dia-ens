import { useState } from 'react';
import { AlertCircle, Chrome, Copy, Check, RefreshCcw } from 'lucide-react';

/**
 * Shown when localStorage is blocked (iOS Safari Private Browsing or
 * "Block All Cookies"). Offers actions that actually work on iOS, since
 * Apple doesn't let web pages open the Settings app.
 */
export default function StorageBlockedBanner() {
  const [copied, setCopied] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // googlechrome:// works on iOS when Chrome is installed.
  // Falls back to the App Store if not.
  const openInChrome = () => {
    const url = window.location.href;
    const chromeUrl = url.replace(/^https?:/, 'googlechrome:');
    // Try Chrome; if it fails, send them to App Store
    window.location.href = chromeUrl;
    setTimeout(() => {
      // If we're still here, Chrome isn't installed
      window.location.href = 'https://apps.apple.com/app/google-chrome/id535886823';
    }, 1500);
  };

  const copyInstructions = async () => {
    const text = isIOS
      ? `Para usar o app ENS Dia a Dia no iPhone:

1. Abra os Ajustes do iPhone
2. Role até "Safari"
3. Em "Privacidade e Segurança":
   • Desligue "Bloquear Todos os Cookies"
4. Volte ao Safari (não em aba privada)
5. Acesse: ${window.location.href}`
      : `Para usar o app ENS Dia a Dia:

1. Saia da janela privada/anônima
2. Permita cookies nas configurações do navegador
3. Recarregue a página: ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
  };

  const reload = () => window.location.reload();

  return (
    <div className="w-full max-w-sm mb-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden text-left">
      <div className="p-3 border-b border-amber-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>O navegador está bloqueando o app.</strong>
            <span className="block mt-1 text-amber-800">
              {isIOS
                ? 'Você está em modo privado ou com "Bloquear cookies" ligado no Safari. O app precisa salvar dados pra funcionar.'
                : 'Você está em modo anônimo/privado. Saia do modo privado e tente novamente.'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {isIOS && (
          <button
            onClick={openInChrome}
            type="button"
            className="w-full py-2.5 rounded-lg bg-ens-blue text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Chrome className="w-3.5 h-3.5" />
            Abrir no Chrome (recomendado)
          </button>
        )}

        <button
          onClick={copyInstructions}
          type="button"
          className="w-full py-2.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              Instruções copiadas!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar passo-a-passo
            </>
          )}
        </button>

        <button
          onClick={reload}
          type="button"
          className="w-full py-2.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Já ajustei — recarregar
        </button>

        {isIOS && (
          <details className="text-xs">
            <summary className="cursor-pointer py-1.5 text-amber-800 font-medium text-center">
              Ver passo-a-passo no iPhone
            </summary>
            <ol className="mt-2 pl-4 space-y-1 text-amber-900 list-decimal">
              <li>Abra <strong>Ajustes</strong> do iPhone</li>
              <li>Role até <strong>Safari</strong></li>
              <li>Em "Privacidade e Segurança", desligue <strong>"Bloquear Todos os Cookies"</strong></li>
              <li>Volte ao Safari (saindo da aba privada se estiver)</li>
              <li>Toque em "Já ajustei — recarregar" acima</li>
            </ol>
          </details>
        )}
      </div>
    </div>
  );
}
