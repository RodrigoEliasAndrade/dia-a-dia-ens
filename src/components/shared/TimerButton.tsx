import { useState } from 'react';
import { Timer, Pause, Play, Minus, Plus } from 'lucide-react';
import type { UseTimerReturn } from '../../hooks/useTimer';

interface TimerButtonProps {
  /** The timer hook instance (from useTimer()) */
  timer: UseTimerReturn;
  /** Button label text (e.g., "Silêncio de 1 minuto") */
  label: string;
  /** Default duration in seconds */
  defaultDuration: number;
  /** Minimum allowed duration in seconds (defaults to defaultDuration) */
  minDuration?: number;
  /** Maximum allowed duration in seconds (defaults to 2× defaultDuration) */
  maxDuration?: number;
  /** Whether to show duration adjustment controls (default: true) */
  adjustable?: boolean;
  /** Custom completion message */
  completionMessage?: string;
  /** Time in seconds below which color turns warning (default: 10) */
  warningThreshold?: number;
}

/**
 * Calculate the adjustment increment based on duration.
 * ≤60s: adjust by 15 seconds | >60s: adjust by 60 seconds
 */
function getIncrement(duration: number): number {
  return duration <= 60 ? 15 : 60;
}

/**
 * Format duration for the adjust display label.
 */
function formatDurationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m${s}s` : `${m} min`;
}

export default function TimerButton({
  timer,
  label,
  defaultDuration,
  minDuration,
  maxDuration,
  adjustable = true,
  completionMessage = '🔔 Tempo completado',
  warningThreshold = 10,
}: TimerButtonProps) {
  const min = minDuration ?? defaultDuration;
  const max = maxDuration ?? defaultDuration * 2;
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const increment = getIncrement(defaultDuration);

  const canDecrease = selectedDuration - increment >= min;
  const canIncrease = selectedDuration + increment <= max;

  const handleDecrease = () => {
    setSelectedDuration(prev => {
      const next = prev - increment;
      return next >= min ? next : prev;
    });
  };

  const handleIncrease = () => {
    setSelectedDuration(prev => {
      const next = prev + increment;
      return next <= max ? next : prev;
    });
  };

  // ─── State: Not started yet ─────────────────────────
  if (!timer.timerActive && timer.timeLeft === 0 && !timer.isCompleted) {
    return (
      <div className="text-center mt-4">
        {/* Duration adjuster (only shown if there's room to adjust) */}
        {adjustable && (canDecrease || canIncrease) && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={handleDecrease}
              disabled={!canDecrease}
              className="p-2 rounded-full bg-gray-100 text-ens-text-light disabled:opacity-30 transition-all active:scale-90"
              aria-label="Diminuir tempo"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-ens-blue min-w-[60px] text-center">
              {formatDurationLabel(selectedDuration)}
            </span>
            <button
              onClick={handleIncrease}
              disabled={!canIncrease}
              className="p-2 rounded-full bg-gray-100 text-ens-text-light disabled:opacity-30 transition-all active:scale-90"
              aria-label="Aumentar tempo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={() => timer.start(selectedDuration)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ens-blue/10 text-ens-blue text-sm font-medium transition-all active:scale-95"
        >
          <Timer className="w-4 h-4" />
          {label}
        </button>
      </div>
    );
  }

  // ─── State: Completed ───────────────────────────────
  if (timer.isCompleted) {
    return (
      <div className="text-center mt-4">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-ens-gold">0:00</div>
          <p className="text-xs text-ens-gold font-medium">{completionMessage}</p>
        </div>
      </div>
    );
  }

  // ─── State: Running or Paused ───────────────────────
  return (
    <div className="text-center mt-4">
      <div className="space-y-2">
        <div className={`text-3xl font-bold ${timer.timeLeft <= warningThreshold ? 'text-ens-gold' : 'text-ens-blue'}`}>
          {timer.formatTime(timer.timeLeft)}
        </div>
        {timer.timeLeft > 0 && (
          <button
            onClick={timer.timerActive ? timer.pause : timer.resume}
            className="text-xs text-ens-text-light inline-flex items-center gap-1"
          >
            {timer.timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {timer.timerActive ? 'Pausar' : 'Continuar'}
          </button>
        )}
      </div>
    </div>
  );
}
