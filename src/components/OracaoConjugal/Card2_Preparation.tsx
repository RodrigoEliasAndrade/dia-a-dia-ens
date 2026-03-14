import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Timer } from 'lucide-react';

const checklist = [
  { id: 'phones', label: 'Desliguem os celulares', emoji: '📱' },
  { id: 'face', label: 'Sentem-se FRENTE A FRENTE', emoji: '👫' },
  { id: 'eyes', label: 'Olhem nos olhos um do outro', emoji: '👀' },
  { id: 'breathe', label: 'Respirem juntos, devagar', emoji: '🌬️' },
];

export default function Card2_Preparation() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef<number | null>(null);

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerActive(false);
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(30);
    setTimerActive(true);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-ens-text font-semibold text-lg">
          ✨ Preparem o ambiente de oração
        </p>
        <p className="text-sm text-ens-text-light mt-1">
          Este momento é sagrado. Cuidem do espaço.
        </p>
      </div>

      <div className="space-y-3">
        {checklist.map(item => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`
              w-full flex items-center gap-3 p-3.5 rounded-xl transition-all
              ${checked[item.id]
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200'}
            `}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className={`flex-1 text-left text-sm ${checked[item.id] ? 'line-through text-ens-text-light' : 'text-ens-text font-medium'}`}>
              {item.label}
            </span>
            {checked[item.id] && <Check className="w-5 h-5 text-green-600" />}
          </button>
        ))}
      </div>

      {/* Emphasis box */}
      <div className="bg-ens-blue text-white rounded-xl p-4 text-center">
        <p className="font-bold text-lg">👫 FRENTE A FRENTE</p>
        <p className="text-sm text-white/80 mt-1">Olhos nos olhos</p>
      </div>

      {/* Optional silence timer */}
      <div className="text-center">
        <p className="text-sm text-ens-text-light mb-3">Silêncio de preparação (opcional)</p>
        {!timerActive ? (
          <button
            onClick={startTimer}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ens-cream border border-gray-300 text-ens-text font-medium transition-all active:scale-95"
          >
            <Timer className="w-5 h-5" />
            30 segundos de silêncio
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-5xl font-bold text-ens-blue">{timeLeft}</div>
            <p className="text-sm text-ens-text-light">
              {timeLeft === 0 ? '🔔 Tempo completado' : 'Respirem juntos em silêncio...'}
            </p>
            {timeLeft > 0 && (
              <button onClick={stopTimer} className="text-xs text-ens-text-light underline">
                Pular
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
