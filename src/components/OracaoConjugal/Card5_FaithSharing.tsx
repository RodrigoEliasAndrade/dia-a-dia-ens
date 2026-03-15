import { Timer, AlertTriangle } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

const reflectionQuestions = [
  '❤️ O que tocou o meu coração na Palavra de Deus de hoje?',
  '🙏 Pelo que sou grato(a) a Deus neste momento da nossa vida?',
  '💡 Em que preciso da ajuda de Deus e da sua oração?',
];

export default function Card5_FaithSharing() {
  const timer = useTimer();

  return (
    <div className="space-y-5">
      {/* CRITICAL: Listening rules box - prominent visual */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-red-700 text-lg">Regras da Escuta</h3>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>

        <p className="text-center font-semibold text-ens-text mb-4 text-base">
          Quando um fala, o outro APENAS ESCUTA
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <span className="text-lg">❌</span>
            <span className="text-sm font-medium text-red-700">Não interrompa</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <span className="text-lg">❌</span>
            <span className="text-sm font-medium text-red-700">Não aconselhe</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <span className="text-lg">❌</span>
            <span className="text-sm font-medium text-red-700">Não julgue</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2.5 border border-green-200">
            <span className="text-lg">✅</span>
            <span className="text-sm font-bold text-green-700">Apenas acolha com o coração</span>
          </div>
        </div>
      </div>

      {/* Reflection questions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-ens-blue text-sm">
          Partilhem sobre estas questões:
        </h3>
        {reflectionQuestions.map((q, i) => (
          <div key={i} className="bg-ens-cream rounded-xl p-4 border border-gray-200">
            <p className="text-ens-text text-sm">{q}</p>
          </div>
        ))}
      </div>

      {/* Optional timer */}
      <div className="text-center border-t border-gray-100 pt-5">
        <p className="text-xs text-ens-text-light mb-3">
          Sugestão: Reservem pelo menos 10 minutos para a partilha
        </p>
        {!timer.timerActive && !timer.isCompleted && timer.timeLeft === 0 ? (
          <button
            onClick={() => timer.start(600)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ens-blue/10 text-ens-blue font-medium transition-all active:scale-95"
          >
            <Timer className="w-5 h-5" />
            Iniciar timer de 10 min
          </button>
        ) : (
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${timer.timeLeft <= 60 ? 'text-red-500' : 'text-ens-blue'}`}>
              {timer.formatTime(timer.timeLeft)}
            </div>
            <p className="text-xs text-ens-text-light">
              {timer.isCompleted ? '🔔 Tempo sugerido completado' : 'Tomem o tempo que precisarem...'}
            </p>
            {timer.timerActive && (
              <button onClick={timer.stop} className="text-xs text-ens-text-light underline">
                Parar timer
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ens-text-light italic">
        💛 Este é o CORAÇÃO da oração conjugal segundo as ENS
      </p>
    </div>
  );
}
