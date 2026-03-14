import type { ReactNode } from 'react';

interface SwipeableCardProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  emoji: string;
  title: string;
  subtitle?: string;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  showNext?: boolean;
  showPrev?: boolean;
}

export default function SwipeableCard({
  children,
  step,
  totalSteps,
  emoji,
  title,
  subtitle,
  onNext,
  onPrev,
  nextLabel = 'Próximo',
  prevLabel = 'Voltar',
  showNext = true,
  showPrev = true,
}: SwipeableCardProps) {
  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      {/* Progress bar */}
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center justify-between text-white/70 text-xs mb-2">
          <span>Passo {step} de {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div
            className="bg-ens-gold h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-28">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{emoji}</div>
            <h2 className="text-xl font-bold text-ens-blue">{title}</h2>
            {subtitle && (
              <p className="text-sm text-ens-text-light mt-1">{subtitle}</p>
            )}
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {showPrev && onPrev && (
            <button
              onClick={onPrev}
              className="flex-1 py-3.5 rounded-xl border-2 border-ens-blue text-ens-blue font-semibold
                transition-all active:scale-[0.97]"
            >
              {prevLabel}
            </button>
          )}
          {showNext && onNext && (
            <button
              onClick={onNext}
              className="flex-1 py-3.5 rounded-xl bg-ens-blue text-white font-semibold shadow-lg
                transition-all active:scale-[0.97] hover:bg-ens-blue-light"
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
