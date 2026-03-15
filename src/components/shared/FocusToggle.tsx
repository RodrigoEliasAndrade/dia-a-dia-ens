import { useState, useEffect } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import type { UseFocusModeReturn } from '../../hooks/useFocusMode';

interface FocusToggleProps {
  focusMode: UseFocusModeReturn;
}

/**
 * Header toggle for Focus Mode.
 * - Shows Shield icon (inactive) or ShieldCheck with pulse (active)
 * - On first activation per session, shows a DND reminder banner
 */
export default function FocusToggle({ focusMode }: FocusToggleProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [hasShownReminder, setHasShownReminder] = useState(false);

  // Show DND reminder on first activation only
  const handleToggle = async () => {
    if (!focusMode.isActive && !hasShownReminder) {
      setShowReminder(true);
      setHasShownReminder(true);
    }
    await focusMode.toggle();
  };

  // Auto-dismiss reminder after 5 seconds
  useEffect(() => {
    if (!showReminder) return;
    const timeout = setTimeout(() => setShowReminder(false), 5000);
    return () => clearTimeout(timeout);
  }, [showReminder]);

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={`p-1 rounded transition-all ${
          focusMode.isActive
            ? 'text-white animate-pulse'
            : 'text-white/50 hover:text-white/80'
        }`}
        aria-label={focusMode.isActive ? 'Desativar modo foco' : 'Ativar modo foco'}
        title={focusMode.isActive ? 'Modo Foco ativo' : 'Ativar Modo Foco'}
      >
        {focusMode.isActive ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
      </button>

      {/* DND reminder banner — slides down from header on first activation */}
      {showReminder && (
        <div
          onClick={() => setShowReminder(false)}
          className="absolute top-8 right-0 z-50 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-fade-in cursor-pointer"
        >
          <p className="text-sm font-semibold text-ens-text mb-2">
            📱 Ative o Não Perturbe
          </p>
          <div className="space-y-1.5 text-xs text-ens-text-light">
            <p>
              <span className="font-medium text-ens-text">iPhone:</span>{' '}
              Deslize de cima → Foco
            </p>
            <p>
              <span className="font-medium text-ens-text">Android:</span>{' '}
              Deslize de cima → Não Perturbe
            </p>
          </div>
          {focusMode.isSupported && (
            <p className="text-xs text-green-600 font-medium mt-2">
              ✓ Tela permanecerá ligada
            </p>
          )}
          <p className="text-[10px] text-ens-text-light mt-2 text-center">
            Toque para fechar
          </p>
        </div>
      )}
    </div>
  );
}
