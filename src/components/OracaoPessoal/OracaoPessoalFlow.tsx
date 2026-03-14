import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Timer, Pause, Play } from 'lucide-react';
import { useLiturgy } from '../../hooks/useLiturgy';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';

/**
 * ORAÇÃO PESSOAL DIÁRIA — Lectio Divina
 *
 * ENS Teaching: "A oração conjugal nasce da oração pessoal.
 * Não podemos dar ao outro o que não temos."
 * — Padre Henri Caffarel
 *
 * This is the FOUNDATION of the ENS spiritual life.
 * Each spouse needs their own personal encounter with God
 * before they can pray together as a couple.
 *
 * Method: Lectio Divina (4 steps)
 * 1. LECTIO — Read the Word slowly
 * 2. MEDITATIO — Meditate on what strikes you
 * 3. ORATIO — Respond to God in prayer
 * 4. CONTEMPLATIO — Rest in God's presence in silence
 */

const steps = [
  {
    id: 'intro',
    emoji: '🕯️',
    title: 'Preparação',
    subtitle: 'Silenciar o coração',
  },
  {
    id: 'lectio',
    emoji: '📖',
    title: 'Lectio — Leitura',
    subtitle: 'Escutar a Palavra de Deus',
  },
  {
    id: 'meditatio',
    emoji: '💭',
    title: 'Meditatio — Meditação',
    subtitle: 'O que Deus me diz?',
  },
  {
    id: 'oratio',
    emoji: '🙏',
    title: 'Oratio — Oração',
    subtitle: 'Minha resposta a Deus',
  },
  {
    id: 'contemplatio',
    emoji: '✨',
    title: 'Contemplatio — Contemplação',
    subtitle: 'Repousar em Deus',
  },
  {
    id: 'closing',
    emoji: '🕊️',
    title: 'Envio',
    subtitle: 'Levar a Palavra para o dia',
  },
];

export default function OracaoPessoalFlow() {
  const navigate = useNavigate();
  const { liturgy, loading, isFromFallback } = useLiturgy();
  const { completePessoalPrayer } = usePrayerTracking();
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [saved, setSaved] = useState(false);

  // Silence timer for intro and contemplatio
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerActive(false);
  }, []);

  const startTimer = useCallback((seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
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
    return () => { if (intervalRef.current !== null) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSave = () => {
    completePessoalPrayer();
    setSaved(true);
  };

  const handleNext = () => {
    stopTimer();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    stopTimer();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderTimerButton = (label: string, seconds: number) => (
    <div className="text-center mt-4">
      {!timerActive && timeLeft === 0 ? (
        <button
          onClick={() => startTimer(seconds)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ens-blue/10 text-ens-blue text-sm font-medium"
        >
          <Timer className="w-4 h-4" />
          {label}
        </button>
      ) : (
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-ens-gold' : 'text-ens-blue'}`}>
            {formatTime(timeLeft)}
          </div>
          {timeLeft > 0 && (
            <button
              onClick={timerActive ? stopTimer : () => startTimer(timeLeft)}
              className="text-xs text-ens-text-light inline-flex items-center gap-1"
            >
              {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {timerActive ? 'Pausar' : 'Continuar'}
            </button>
          )}
          {timeLeft === 0 && (
            <p className="text-xs text-ens-gold font-medium">🔔 Tempo completado</p>
          )}
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (step.id) {
      case 'intro':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
              <p className="text-ens-text text-sm leading-relaxed">
                Encontre um lugar tranquilo.<br />
                Sente-se confortavelmente.<br />
                Respire fundo três vezes.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-ens-text text-sm leading-relaxed italic text-center">
                "Senhor, abre os meus ouvidos para escutar a Tua Palavra.
                Abre o meu coração para acolhê-la.
                Fala, Senhor, o Teu servo escuta."
              </p>
            </div>

            <p className="text-center text-xs text-ens-text-light">
              Faça o sinal da cruz e permaneça em silêncio por um momento
            </p>

            {renderTimerButton('Silêncio de 1 minuto', 60)}

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                💡 Padre Caffarel ensinava: "A oração pessoal é o alicerce.
                Sem ela, a oração conjugal é como uma casa construída sobre a areia."
              </p>
            </div>
          </div>
        );

      case 'lectio':
        return (
          <div className="space-y-5">
            <div className="bg-ens-blue/5 rounded-xl p-4 text-center">
              <p className="text-sm text-ens-blue font-medium">
                📖 Leia a Palavra de Deus <span className="font-bold">lentamente</span>, em voz baixa
              </p>
              <p className="text-xs text-ens-text-light mt-1">
                Não tenha pressa. Deus fala no silêncio.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin w-8 h-8 border-3 border-ens-blue border-t-transparent rounded-full" />
                <p className="text-sm text-ens-text-light mt-3">Carregando a Palavra...</p>
              </div>
            ) : liturgy ? (
              <>
                {isFromFallback && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Evangelho de arquivo (API indisponível)</span>
                  </div>
                )}
                {liturgy.evangelhoReferencia && (
                  <p className="text-center text-xs text-ens-text-light font-medium">
                    {liturgy.evangelhoReferencia}
                  </p>
                )}
                <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
                  <p className="text-ens-text text-sm leading-relaxed whitespace-pre-line">
                    {liturgy.evangelho}
                  </p>
                </div>
              </>
            ) : null}

            <p className="text-center text-xs text-ens-text-light italic">
              Releia uma segunda vez. Que palavra ou frase salta aos seus olhos?
            </p>
          </div>
        );

      case 'meditatio':
        return (
          <div className="space-y-5">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Pergunte ao seu coração:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-sm text-ens-text">❤️ Que palavra ou frase tocou o meu coração?</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-sm text-ens-text">🔦 O que Deus quer me dizer hoje, pessoalmente?</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-sm text-ens-text">🪞 Esta Palavra espelha algo da minha vida neste momento?</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                Não se trata de estudar ou analisar o texto, mas de deixar que a Palavra
                entre no seu coração como uma semente. A meditação é o solo onde ela germina.
              </p>
            </div>

            {renderTimerButton('Meditar por 3 minutos', 180)}
          </div>
        );

      case 'oratio':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-ens-text text-sm leading-relaxed">
                Agora é a <span className="font-bold text-ens-blue">sua vez de falar com Deus</span>.
              </p>
              <p className="text-ens-text-light text-sm mt-2">
                Responda à Palavra que ouviu. Fale com Deus como se fala com um amigo.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Pode rezar assim:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙏 <strong>Agradeça</strong> — pelo que Deus lhe mostrou</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">💔 <strong>Peça perdão</strong> — pelo que reconheceu em si</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙌 <strong>Peça graças</strong> — para o(a) seu/sua esposo(a), filhos, equipe</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🕊️ <strong>Entregue</strong> — o que te preocupa nas mãos de Deus</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-ens-text-light italic">
              Reze especialmente pelo seu cônjuge. A oração pessoal alimenta o amor conjugal.
            </p>

            {renderTimerButton('Rezar por 3 minutos', 180)}
          </div>
        );

      case 'contemplatio':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-6 text-center">
              <p className="text-ens-text text-base leading-relaxed font-medium">
                Não diga nada.
              </p>
              <p className="text-ens-text text-sm leading-relaxed mt-2">
                Apenas descanse na presença de Deus.<br />
                Como uma criança nos braços do Pai.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-ens-text text-sm leading-relaxed italic text-center">
                "Estai quietos e sabei que Eu sou Deus."
              </p>
              <p className="text-xs text-ens-text-light text-center mt-2">— Salmo 46,11</p>
            </div>

            {renderTimerButton('Silêncio de 2 minutos', 120)}

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                A contemplação é o ponto mais alto da oração. Não se preocupe
                se parecer "não acontecer nada". O silêncio diante de Deus nunca é vazio.
              </p>
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center space-y-3">
              <p className="text-ens-text text-sm leading-relaxed">
                Antes de encerrar, guarde no coração <strong>uma palavra</strong> para levar consigo hoje.
              </p>
              <p className="text-ens-text-light text-sm">
                Que ela te acompanhe no trabalho, em casa, com seu cônjuge.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-ens-text text-sm italic leading-relaxed">
                "Senhor, obrigado(a) por este momento contigo.
                Que a Tua Palavra ilumine o meu dia
                e me ajude a amar melhor quem está ao meu lado. Amém."
              </p>
            </div>

            <p className="text-center text-xs text-ens-text-light">
              Faça o sinal da cruz
            </p>

            <div className="border-t border-gray-200 pt-5">
              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-ens-blue text-white font-semibold shadow-lg transition-all active:scale-[0.97]"
                >
                  ✅ Oração Pessoal Concluída
                </button>
              ) : (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">🕊️</div>
                  <p className="text-green-600 font-semibold">Glória a Deus!</p>
                  <p className="text-xs text-ens-text-light mt-1">
                    Duração: {Math.round((Date.now() - startTime) / 60000)} minutos
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 w-full py-3 rounded-xl bg-ens-blue text-white font-semibold"
                  >
                    Voltar ao Início
                  </button>
                </div>
              )}
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Quem reza sozinho(a) com Deus, depois reza melhor com seu cônjuge.
                A intimidade com Cristo alimenta a intimidade do casal."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— Espiritualidade ENS</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/')} className="text-white/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-white/70 text-xs">
              <span>{step.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
              <div
                className="bg-ens-gold h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-28">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">{step.emoji}</div>
            <h2 className="text-xl font-bold text-ens-blue">{step.title}</h2>
            <p className="text-sm text-ens-text-light mt-1">{step.subtitle}</p>
          </div>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      {step.id !== 'closing' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3.5 rounded-xl border-2 border-ens-blue text-ens-blue font-semibold transition-all active:scale-[0.97]"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 rounded-xl bg-ens-blue text-white font-semibold shadow-lg transition-all active:scale-[0.97]"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
