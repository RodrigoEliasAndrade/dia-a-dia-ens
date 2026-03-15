import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Save } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTimer } from '../../hooks/useTimer';
import TimerButton from '../shared/TimerButton';
import { format } from 'date-fns';
import type { DeverSentarData, DeverSentarLevelId } from '../../types';

/**
 * DEVER DE SENTAR-SE — Diálogo Conjugal Mensal
 *
 * ENS Teaching: O Dever de Sentar-se é um dos pilares mais originais da
 * espiritualidade ENS. Padre Caffarel o descreveu como o momento em que
 * o casal "faz a verdade" sobre sua vida conjugal, diante de Deus.
 *
 * 3 NÍVEIS:
 *
 * 1. CHECK-IN (🌱) — ~15 min
 *    Três perguntas simples: o que foi bom, difícil, e o que desejamos.
 *
 * 2. CONVERSA GUIADA (🌿) — ~30 min
 *    Escolham um tema e aprofundem com perguntas guiadas.
 *
 * 3. REVISÃO COMPLETA (💎) — ~45-60 min
 *    O Dever de Sentar-se pleno segundo as ENS.
 *    Revisão de todas as áreas da vida conjugal.
 */

type LevelId = DeverSentarLevelId;

interface Level {
  id: LevelId;
  emoji: string;
  name: string;
  subtitle: string;
  duration: string;
  description: string;
  highlights: { emoji: string; text: string }[];
}

const levels: Level[] = [
  {
    id: 'check-in',
    emoji: '🌱',
    name: 'Check-in',
    subtitle: 'Sentar juntos e conversar',
    duration: '~15 min',
    description:
      'Para casais começando ou num mês corrido. Três perguntas simples, uma oração e pronto. O importante é sentar juntos.',
    highlights: [
      { emoji: '💬', text: '3 perguntas' },
      { emoji: '⏱️', text: 'Rápido' },
      { emoji: '📝', text: 'Anotações' },
    ],
  },
  {
    id: 'conversa-guiada',
    emoji: '🌿',
    name: 'Conversa Guiada',
    subtitle: 'Aprofundando um tema por mês',
    duration: '~30 min',
    description:
      'Escolham um tema e conversem com perguntas guiadas. Ideal para casais que querem aprofundar uma área específica da vida.',
    highlights: [
      { emoji: '🎯', text: 'Um tema' },
      { emoji: '❓', text: 'Perguntas guiadas' },
      { emoji: '📝', text: 'Decisões' },
    ],
  },
  {
    id: 'revisao-completa',
    emoji: '💎',
    name: 'Revisão Completa',
    subtitle: 'O Dever de Sentar-se pleno — ENS',
    duration: '~45-60 min',
    description:
      'A experiência completa segundo Padre Caffarel. Revisão de todas as áreas da vida conjugal diante de Deus. O ideal que as ENS propõem a cada casal.',
    highlights: [
      { emoji: '🔍', text: '6 áreas' },
      { emoji: '🕯️', text: 'Oração' },
      { emoji: '🤝', text: 'Decisões' },
    ],
  },
];

// ─── Step definitions per level ─────────────────────

interface StepDef {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
}

const checkInSteps: StepDef[] = [
  { id: 'prep-checkin', emoji: '🕯️', title: 'Preparação', subtitle: 'Um momento de paz a dois' },
  { id: 'tres-perguntas', emoji: '💬', title: 'Três Perguntas', subtitle: 'O que foi bom, difícil e o que desejamos' },
  { id: 'notas-checkin', emoji: '📝', title: 'Anotações e Oração', subtitle: 'Registrem e agradeçam' },
  { id: 'conclusao', emoji: '🎉', title: 'Dever Completado', subtitle: '' },
];

const conversaGuiadaSteps: StepDef[] = [
  { id: 'prep-guiada', emoji: '🕯️', title: 'Preparação', subtitle: 'Oração e regras' },
  { id: 'tema-selecao', emoji: '🎯', title: 'Escolha do Tema', subtitle: 'O que vocês querem conversar hoje?' },
  { id: 'conversa-guiada', emoji: '💬', title: 'Conversa Guiada', subtitle: 'Perguntas para aprofundar' },
  { id: 'notas-guiada', emoji: '📝', title: 'Decisões', subtitle: 'O que levarão para o próximo mês' },
  { id: 'conclusao', emoji: '🎉', title: 'Dever Completado', subtitle: '' },
];

const revisaoCompletaSteps: StepDef[] = [
  { id: 'opening', emoji: '🕯️', title: 'Oração Inicial', subtitle: 'Colocar o encontro nas mãos de Deus' },
  { id: 'us', emoji: '💑', title: 'Nosso Amor', subtitle: 'Como está o nosso relacionamento?' },
  { id: 'prayer-life', emoji: '🙏', title: 'Nossa Vida de Oração', subtitle: 'Oração pessoal, conjugal e sacramental' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', title: 'Nossa Família', subtitle: 'Filhos, educação, vida doméstica' },
  { id: 'world', emoji: '🌍', title: 'Nós no Mundo', subtitle: 'Trabalho, finanças, serviço, comunidade' },
  { id: 'pces', emoji: '📋', title: 'Nossos PCEs', subtitle: 'Como vivemos os pontos concretos este mês?' },
  { id: 'decisions', emoji: '🤝', title: 'Decisões e Compromissos', subtitle: 'O que levaremos para o próximo mês' },
  { id: 'conclusao', emoji: '🎉', title: 'Dever Completado', subtitle: '' },
];

const stepsMap: Record<LevelId, StepDef[]> = {
  'check-in': checkInSteps,
  'conversa-guiada': conversaGuiadaSteps,
  'revisao-completa': revisaoCompletaSteps,
};

// ─── Theme data for Level 2 ────────────────────────

interface Theme {
  id: string;
  emoji: string;
  name: string;
  description: string;
  questions: string[];
}

const themes: Theme[] = [
  {
    id: 'nosso-amor',
    emoji: '💑',
    name: 'Nosso Amor',
    description: 'Como estamos cuidando do nosso relacionamento?',
    questions: [
      '💬 Como nos sentimos um com o outro este mês? Houve momentos de carinho? De distanciamento?',
      '⏰ Tivemos tempo de qualidade juntos? Conversas profundas, passeios, intimidade?',
      '💭 Existe algo que não consegui dizer e que precisa ser dito?',
      '❤️ O que posso fazer para amar melhor você no próximo mês?',
    ],
  },
  {
    id: 'nossa-familia',
    emoji: '👨‍👩‍👧‍👦',
    name: 'Nossa Família',
    description: 'Filhos, educação, lar, família estendida',
    questions: [
      '👧👦 Como estão os filhos? Cada um deles? Escola, amizades, comportamento?',
      '🏠 Nosso lar é um lugar de paz e acolhida?',
      '📚 Estamos educando na fé? De que forma?',
      '👴👵 Pais idosos, família estendida — alguma preocupação?',
    ],
  },
  {
    id: 'vida-pratica',
    emoji: '💰',
    name: 'Vida Prática',
    description: 'Trabalho, finanças, organização do lar',
    questions: [
      '💼 Estamos em equilíbrio com o trabalho? Alguém sobrecarregado?',
      '💰 Finanças: vivemos com responsabilidade e generosidade?',
      '🏡 A divisão de tarefas em casa está justa?',
      '📋 Há alguma decisão prática importante que precisamos tomar juntos?',
    ],
  },
  {
    id: 'vida-espiritual',
    emoji: '🙏',
    name: 'Vida Espiritual',
    description: 'Oração pessoal, conjugal e sacramental',
    questions: [
      '📖 Tenho reservado tempo diário para Deus? Leitura, silêncio, Lectio Divina?',
      '💑 Estamos rezando juntos com frequência? É um encontro verdadeiro?',
      '⛪ Missa dominical? Confissão? Sacramentos?',
      '🕊️ Sinto Deus presente no nosso dia a dia?',
    ],
  },
  {
    id: 'vida-social',
    emoji: '🤝',
    name: 'Vida Social',
    description: 'Serviço, comunidade, equipe ENS',
    questions: [
      '🤲 Servimos alguém este mês? Caridade, voluntariado?',
      '👥 Nossa equipe ENS — como estamos participando?',
      '🌍 Temos cultivado boas amizades? Somos presença de Deus para outros casais?',
    ],
  },
];

// ─── Default data ───────────────────────────────────

const defaultData: DeverSentarData = {
  lastCompleted: '',
  scheduledDay: 15,
  completions: [],
};

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export default function DeverSentarFlow() {
  const navigate = useNavigate();
  const [data, setData] = useLocalStorage<DeverSentarData>('ens-dever-sentar', defaultData);
  const { isSupported: micSupported, isListening, interimText, startListening, stopListening } = useSpeechRecognition();

  // Core flow state
  const [selectedLevel, setSelectedLevel] = useState<LevelId | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState('');

  // Level 2 specific
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Shared timer hook (sound + vibration on completion)
  const timer = useTimer();

  // ─── Mic toggle ─────────────────────────────────

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening((spokenText: string) => {
        setNotes(prev => {
          const separator = prev.trim() ? ' ' : '';
          return prev + separator + spokenText;
        });
      });
    }
  }, [isListening, startListening, stopListening]);

  // ─── Step navigation ───────────────────────────

  const allSteps = selectedLevel ? stepsMap[selectedLevel] : [];
  const step = allSteps[currentStep];
  const progress = allSteps.length > 0 ? ((currentStep + 1) / allSteps.length) * 100 : 0;

  const handleSave = () => {
    stopListening();
    const today = format(new Date(), 'yyyy-MM-dd');
    const duration = Math.max(Math.round((Date.now() - startTime) / 60000), 1);
    setData(prev => ({
      ...prev,
      lastCompleted: today,
      completions: [
        ...prev.completions,
        {
          date: today,
          level: selectedLevel!,
          duration,
          theme: selectedLevel === 'conversa-guiada' ? selectedTheme || undefined : undefined,
          notes: notes.trim() || undefined,
        },
      ],
    }));
    setSaved(true);
  };

  const handleNext = () => {
    timer.reset();
    if (currentStep < allSteps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    timer.reset();
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleExit = () => {
    if (!saved && currentStep > 0) {
      if (window.confirm('Tem certeza que deseja sair? O progresso não será salvo.')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  // Completions count
  const currentYear = new Date().getFullYear();
  const completionsThisYear = data.completions.filter(
    c => c.date.startsWith(String(currentYear))
  ).length;
  const currentMonth = format(new Date(), 'yyyy-MM');
  const doneThisMonth = data.completions.some(c => c.date.startsWith(currentMonth));

  // ═══════════════════════════════════════════════════
  // LEVEL SELECTION SCREEN
  // ═══════════════════════════════════════════════════

  if (!selectedLevel) {
    return (
      <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
        <div className="bg-ens-blue px-4 pt-3 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white/70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Dever de Sentar-se</h1>
              <p className="text-white/60 text-xs">Escolham o nível para este mês</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto pb-8">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
            <p className="text-sm text-ens-text leading-relaxed text-center">
              O Dever de Sentar-se é o momento em que o casal <strong>"faz a verdade"</strong> sobre
              a sua vida. Não é uma reunião — é um <strong>encontro sagrado</strong> de transparência.
            </p>
            <p className="text-xs text-ens-text-light mt-2 text-center">
              Escolham o nível que faz sentido para vocês hoje.
              Num mês corrido, o check-in já é uma vitória.
            </p>
          </div>

          {/* Level cards */}
          <div className="space-y-4">
            {levels.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLevel(l.id)}
                className="w-full bg-white rounded-2xl shadow-md p-5 text-left transition-all active:scale-[0.98] border-2 border-transparent hover:border-ens-blue/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{l.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-ens-blue text-base">{l.name}</h3>
                    <p className="text-xs text-ens-gold font-medium">{l.subtitle}</p>
                    <p className="text-xs text-ens-text-light">{l.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-ens-text leading-relaxed">{l.description}</p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {l.highlights.map(h => (
                    <span key={h.text} className="text-xs px-2 py-1 rounded-full bg-ens-blue/5 text-ens-blue">
                      {h.emoji} {h.text}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Status */}
          {doneThisMonth && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-green-700 font-medium">
                ✅ Vocês já fizeram o Dever de Sentar-se este mês!
              </p>
              <p className="text-xs text-green-600 mt-1">
                Podem fazer novamente se quiserem.
              </p>
            </div>
          )}

          {/* Caffarel quote */}
          <div className="mt-5 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text italic">
              "O Dever de Sentar-se é o momento em que o casal faz a verdade
              sobre a sua vida, sem medo, porque sabe que Deus está ali."
            </p>
            <p className="text-xs text-ens-text-light mt-1 text-right">— Padre Henri Caffarel</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // CONCLUSION (shared across all levels)
  // ═══════════════════════════════════════════════════

  const renderConclusion = () => (
    <div className="space-y-5">
      <div className="text-center py-2">
        <h3 className="text-2xl font-bold text-ens-blue">Dever Completado!</h3>
        <p className="text-ens-text-light mt-1">
          {selectedLevel === 'check-in' && 'Vocês sentaram juntos — isso já é lindo!'}
          {selectedLevel === 'conversa-guiada' && 'Conversa guiada completada!'}
          {selectedLevel === 'revisao-completa' && 'Revisão completa — vocês viveram o Dever de Sentar-se pleno!'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">⏱️</div>
          <div className="text-lg font-bold text-ens-blue">
            {Math.max(Math.round((Date.now() - startTime) / 60000), 1)} min
          </div>
          <div className="text-[10px] text-ens-text-light">duração</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">📅</div>
          <div className="text-lg font-bold text-ens-blue">{completionsThisYear + 1}</div>
          <div className="text-[10px] text-ens-text-light">este ano</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">💑</div>
          <div className="text-lg font-bold text-ens-blue">{data.completions.length + 1}</div>
          <div className="text-[10px] text-ens-text-light">total</div>
        </div>
      </div>

      {/* Notes with mic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-ens-blue text-sm">
            📝 Anotações do casal (opcional)
          </h3>
          {micSupported && (
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-ens-blue/10 text-ens-blue hover:bg-ens-blue/20'
              }`}
              title={isListening ? 'Parar gravação' : 'Falar ao invés de digitar'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {isListening && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <div className="flex gap-0.5 items-end">
              <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
              <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
              <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:450ms]" />
            </div>
            <span className="text-xs text-red-600 font-medium">Ouvindo... falem naturalmente</span>
          </div>
        )}

        {interimText && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-ens-blue/5 border border-ens-blue/20">
            <p className="text-sm text-ens-blue/70 italic">{interimText}...</p>
          </div>
        )}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Decisões, compromissos, observações do casal..."
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
            placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
          rows={4}
          disabled={saved}
        />
        {micSupported && (
          <p className="text-[11px] text-ens-text-light mt-1 text-right">
            {isListening ? '🔴 Gravando' : '🎙️ Toque no mic para falar'}
          </p>
        )}
      </div>

      {!saved ? (
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg
            transition-all active:scale-[0.97]"
        >
          <Save className="w-5 h-5 inline mr-2" />
          Registrar Dever de Sentar-se
        </button>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">💑</div>
          <p className="text-green-600 font-semibold">Registrado com amor!</p>
          <p className="text-xs text-ens-text-light mt-1">
            Que Deus abençoe as decisões que tomaram juntos.
          </p>
          {selectedLevel !== 'revisao-completa' && (
            <p className="text-xs text-ens-blue mt-2">
              💡 No próximo mês, experimentem o nível seguinte!
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full py-3 rounded-xl bg-ens-blue text-white font-semibold"
          >
            Voltar ao Início
          </button>
        </div>
      )}

      {/* Level indicator */}
      <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
        <p className="text-xs text-ens-text-light text-center">
          Nível: <strong className="text-ens-blue">
            {levels.find(l => l.id === selectedLevel)?.emoji} {levels.find(l => l.id === selectedLevel)?.name}
          </strong>
        </p>
        <button
          onClick={() => {
            setSelectedLevel(null);
            setCurrentStep(0);
            timer.reset();
            setSaved(false);
            setNotes('');
            setSelectedTheme(null);
          }}
          className="block mx-auto mt-2 text-xs text-ens-blue underline"
        >
          Trocar nível
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // STEP CONTENT RENDERER
  // ═══════════════════════════════════════════════════

  const renderStepContent = () => {
    if (!step) return null;

    // ─── Conclusion (all levels) ─────────────────
    if (step.id === 'conclusao') return renderConclusion();

    // ─────────────────────────────────────────────────
    // CHECK-IN — Preparação
    // ─────────────────────────────────────────────────

    if (step.id === 'prep-checkin') {
      return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-ens-text font-semibold text-lg">🕯️ Preparem-se</p>
            <p className="text-sm text-ens-text-light mt-1">Um momento simples e verdadeiro</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">📱</span>
              <p className="text-sm text-ens-text font-medium">Silenciem os celulares</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🪑</span>
              <p className="text-sm text-ens-text font-medium">Sentem-se juntos, com calma</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🙏</span>
              <p className="text-sm text-ens-text font-medium">Façam o sinal da cruz juntos</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, estamos aqui diante de Ti.
              Ajuda-nos a sermos verdadeiros um com o outro.
              Amém."
            </p>
          </div>

          {/* Level indicator */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">🌱 Check-in</strong>
            </p>
            <button
              onClick={() => { setSelectedLevel(null); setCurrentStep(0); timer.reset(); }}
              className="text-xs text-ens-blue underline mt-1"
            >
              Trocar nível
            </button>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CHECK-IN — Três Perguntas
    // ─────────────────────────────────────────────────

    if (step.id === 'tres-perguntas') {
      return (
        <div className="space-y-5">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
            <p className="text-sm text-ens-text">
              Cada um responde por vez. O outro <strong>apenas escuta</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                <p className="text-ens-text text-base font-medium leading-relaxed">
                  🌟 "O que foi <strong>bom</strong> entre nós este mês?"
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                <p className="text-ens-text text-base font-medium leading-relaxed">
                  🌧️ "O que foi <strong>difícil</strong>?"
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-ens-text text-base font-medium leading-relaxed">
                  💫 "O que <strong>desejamos</strong> para o próximo mês?"
                </p>
              </div>
            </div>
          </div>

          <TimerButton timer={timer} label="Sugestão: Timer de 10 minutos" defaultDuration={600} />

          <p className="text-center text-xs text-ens-text-light italic">
            Não se preocupem com perfeição. A honestidade simples já é oração.
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CHECK-IN — Anotações e Oração
    // ─────────────────────────────────────────────────

    if (step.id === 'notas-checkin') {
      return (
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ens-blue text-sm">📝 Anotem as decisões:</h3>
              {micSupported && (
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      : 'bg-ens-blue/10 text-ens-blue hover:bg-ens-blue/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListening && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-0.5 items-end">
                  <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
                  <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:450ms]" />
                </div>
                <span className="text-xs text-red-600 font-medium">Ouvindo...</span>
              </div>
            )}

            {interimText && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-ens-blue/5 border border-ens-blue/20">
                <p className="text-sm text-ens-blue/70 italic">{interimText}...</p>
              </div>
            )}

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="O que decidimos juntos? O que queremos mudar?"
              className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
                placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
              rows={4}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, obrigado por este momento juntos.
              Ajuda-nos a viver o que decidimos.
              Abençoa o nosso lar e o nosso amor. Amém."
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Abracem-se em silêncio por um momento
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CONVERSA GUIADA — Preparação
    // ─────────────────────────────────────────────────

    if (step.id === 'prep-guiada') {
      return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-ens-text font-semibold text-lg">🕯️ Preparem o ambiente</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">📱</span>
              <p className="text-sm text-ens-text font-medium">Desliguem os celulares</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🪑</span>
              <p className="text-sm text-ens-text font-medium">Sentem-se num lugar tranquilo, sem interrupções</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">👶</span>
              <p className="text-sm text-ens-text font-medium">Se possível, sem os filhos por perto</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, estamos aqui diante de Ti.
              Ajuda-nos a nos olhar com os Teus olhos.
              Dá-nos a coragem de sermos verdadeiros
              e a ternura de acolher o que o outro disser. Amém."
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 text-center mb-2">Regras deste momento:</p>
            <div className="space-y-1.5 text-sm text-red-700">
              <p>❌ Não é hora de cobrar ou acusar</p>
              <p>❌ Não interrompa quando o outro fala</p>
              <p>✅ Fale na primeira pessoa: "Eu sinto...", "Eu percebo..."</p>
              <p>✅ Escute com o coração aberto</p>
            </div>
          </div>

          {/* Level indicator */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">🌿 Conversa Guiada</strong>
            </p>
            <button
              onClick={() => { setSelectedLevel(null); setCurrentStep(0); timer.reset(); setSelectedTheme(null); }}
              className="text-xs text-ens-blue underline mt-1"
            >
              Trocar nível
            </button>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CONVERSA GUIADA — Seleção de Tema
    // ─────────────────────────────────────────────────

    if (step.id === 'tema-selecao') {
      return (
        <div className="space-y-5">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
            <p className="text-sm text-ens-text">
              Escolham <strong>um tema</strong> para aprofundar este mês.
              Nos próximos meses, explorem outros.
            </p>
          </div>

          <div className="space-y-3">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-ens-blue text-white shadow-md'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{theme.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${
                      selectedTheme === theme.id ? 'text-white' : 'text-ens-text'
                    }`}>
                      {theme.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      selectedTheme === theme.id ? 'text-white/80' : 'text-ens-text-light'
                    }`}>
                      {theme.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!selectedTheme && (
            <p className="text-center text-xs text-ens-text-light italic">
              Escolham um tema para continuar
            </p>
          )}
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CONVERSA GUIADA — Conversa com perguntas
    // ─────────────────────────────────────────────────

    if (step.id === 'conversa-guiada') {
      const theme = themes.find(t => t.id === selectedTheme);
      return (
        <div className="space-y-5">
          {theme && (
            <>
              <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
                <p className="text-lg">{theme.emoji}</p>
                <p className="text-sm text-ens-text font-semibold">{theme.name}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 text-center">
                  Cada um fala por vez. O outro <strong>apenas escuta com o coração</strong>. 💛
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-ens-blue text-sm">Conversem sobre:</h3>
                {theme.questions.map((q, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-ens-text">{q}</p>
                  </div>
                ))}
              </div>

              <TimerButton timer={timer} label="Sugestão: Timer de 20 minutos" defaultDuration={1200} />
            </>
          )}
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CONVERSA GUIADA — Decisões
    // ─────────────────────────────────────────────────

    if (step.id === 'notas-guiada') {
      return (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-sm text-ens-text">
              Com base no que conversaram, tomem <strong>decisões concretas</strong> para o próximo mês.
            </p>
          </div>

          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📅 Que compromisso prático podemos assumir juntos?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">❤️ Que gesto de amor cada um vai cultivar?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🗓️ Quando será o nosso próximo Dever de Sentar-se?</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ens-blue text-sm">📝 Anotem as decisões:</h3>
              {micSupported && (
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      : 'bg-ens-blue/10 text-ens-blue hover:bg-ens-blue/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListening && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-0.5 items-end">
                  <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
                  <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:450ms]" />
                </div>
                <span className="text-xs text-red-600 font-medium">Ouvindo...</span>
              </div>
            )}

            {interimText && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-ens-blue/5 border border-ens-blue/20">
                <p className="text-sm text-ens-blue/70 italic">{interimText}...</p>
              </div>
            )}

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Decisões, compromissos, observações do casal..."
              className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
                placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
              rows={4}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, obrigado por este momento de verdade entre nós.
              Ajuda-nos a viver o que decidimos.
              Abençoa o nosso lar, os nossos filhos e a nossa equipe.
              Maria, Rainha das Equipes, rogai por nós. Amém."
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Abracem-se em silêncio por um momento
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Oração Inicial
    // ─────────────────────────────────────────────────

    if (step.id === 'opening') {
      return (
        <div className="space-y-5">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
            <p className="text-sm text-ens-text">
              Sentem-se juntos, num lugar tranquilo.<br />
              Desliguem os telefones.<br />
              Este momento é de vocês dois e de Deus.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, estamos aqui diante de Ti.
              Ajuda-nos a nos olhar com os Teus olhos.
              Dá-nos a coragem de sermos verdadeiros
              e a ternura de acolher o que o outro disser.
              Que este encontro nos aproxime de Ti e um do outro. Amém."
            </p>
          </div>

          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text-light italic">
              💡 Padre Caffarel: "O Dever de Sentar-se é o momento em que o casal
              faz a verdade sobre a sua vida, sem medo, porque sabe que Deus está ali."
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 text-center mb-2">Regras deste momento:</p>
            <div className="space-y-1.5 text-sm text-red-700">
              <p>❌ Não é hora de cobrar ou acusar</p>
              <p>❌ Não interrompa quando o outro fala</p>
              <p>✅ Fale na primeira pessoa: "Eu sinto...", "Eu percebo..."</p>
              <p>✅ Escute com o coração aberto</p>
            </div>
          </div>

          {/* Level indicator */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">💎 Revisão Completa</strong>
            </p>
            <button
              onClick={() => { setSelectedLevel(null); setCurrentStep(0); timer.reset(); }}
              className="text-xs text-ens-blue underline mt-1"
            >
              Trocar nível
            </button>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Nosso Amor
    // ─────────────────────────────────────────────────

    if (step.id === 'us') {
      return (
        <div className="space-y-4">
          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-ens-blue text-sm mb-3">Conversem sobre:</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">💬 Como nos sentimos um com o outro este mês?</p>
                <p className="text-xs text-ens-text-light mt-1">Houve momentos de carinho? De distanciamento?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">⏰ Tivemos tempo de qualidade juntos?</p>
                <p className="text-xs text-ens-text-light mt-1">Conversas profundas, passeios, intimidade?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🙏 O que posso fazer para amar melhor você no próximo mês?</p>
              </div>
            </div>
          </div>

          <TimerButton timer={timer} label="Sugestão: Timer de 10 minutos" defaultDuration={600} />

          <p className="text-center text-xs text-ens-text-light italic">
            Cada um fala por vez. O outro apenas escuta com o coração.
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Vida de Oração
    // ─────────────────────────────────────────────────

    if (step.id === 'prayer-life') {
      return (
        <div className="space-y-4">
          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-ens-blue text-sm mb-3">Avaliem juntos:</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📖 Oração pessoal: Tenho reservado tempo diário para Deus?</p>
                <p className="text-xs text-ens-text-light mt-1">Leitura da Palavra, silêncio, Lectio Divina</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">💑 Oração conjugal: Estamos rezando juntos com frequência?</p>
                <p className="text-xs text-ens-text-light mt-1">É um encontro verdadeiro ou apenas rotina?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">⛪ Sacramentos: Missa dominical? Confissão?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🕊️ Sinto Deus presente no nosso dia a dia?</p>
              </div>
            </div>
          </div>
          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
            <p className="text-xs text-ens-text italic">
              "A vida de oração é como a respiração do casal cristão.
              Quando para de rezar, o amor começa a sufocar."
            </p>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Família
    // ─────────────────────────────────────────────────

    if (step.id === 'family') {
      return (
        <div className="space-y-4">
          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-ens-blue text-sm mb-3">Falem sobre:</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">👧👦 Como estão os filhos? Cada um deles?</p>
                <p className="text-xs text-ens-text-light mt-1">Escola, amizades, fé, comportamento, alegrias</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🏠 Nosso lar é um lugar de paz e acolhida?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📚 Estamos educando na fé? Como?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">👴👵 Pais idosos, família estendida — alguma preocupação?</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Mundo
    // ─────────────────────────────────────────────────

    if (step.id === 'world') {
      return (
        <div className="space-y-4">
          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-ens-blue text-sm mb-3">Reflitam juntos:</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">💼 Trabalho: Estamos em equilíbrio? Alguém sobrecarregado?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">💰 Finanças: Estamos vivendo com responsabilidade e generosidade?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🤲 Servimos alguém este mês? Caridade, voluntariado?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🤝 Nossa equipe ENS — como estamos participando?</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — PCEs
    // ─────────────────────────────────────────────────

    if (step.id === 'pces') {
      return (
        <div className="space-y-4">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
            <p className="text-sm text-ens-text font-medium">
              Os PCEs são o termômetro da nossa vida espiritual como casal ENS
            </p>
          </div>
          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🙏 <strong>Oração pessoal:</strong> Cada um tem rezado diariamente?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">💑 <strong>Oração conjugal:</strong> Quantas vezes rezamos juntos este mês?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📋 <strong>Dever de Sentar-se:</strong> Fizemos no mês passado?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📖 <strong>Regra de Vida:</strong> Estamos vivendo nossos compromissos?</p>
              </div>
            </div>
          </div>
          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text-light italic">
              Não se trata de contar números, mas de avaliar com sinceridade:
              estes compromissos estão nos aproximando de Deus e um do outro?
            </p>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // REVISÃO COMPLETA — Decisões
    // ─────────────────────────────────────────────────

    if (step.id === 'decisions') {
      return (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-sm text-ens-text">
              Com base no que conversaram, tomem <strong>decisões concretas</strong> para o próximo mês.
            </p>
          </div>

          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">📅 Que compromisso prático podemos assumir juntos?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">❤️ Que gesto de amor cada um vai cultivar?</p>
              </div>
              <div className="bg-white rounded-lg p-3.5">
                <p className="text-sm text-ens-text">🗓️ Quando será o nosso próximo Dever de Sentar-se?</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ens-blue text-sm">📝 Anotem as decisões:</h3>
              {micSupported && (
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      : 'bg-ens-blue/10 text-ens-blue hover:bg-ens-blue/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListening && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-0.5 items-end">
                  <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
                  <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:450ms]" />
                </div>
                <span className="text-xs text-red-600 font-medium">Ouvindo...</span>
              </div>
            )}

            {interimText && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-ens-blue/5 border border-ens-blue/20">
                <p className="text-sm text-ens-blue/70 italic">{interimText}...</p>
              </div>
            )}

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Decisões, compromissos, observações do casal..."
              className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
                placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
              rows={4}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-ens-text italic leading-relaxed text-center">
              "Senhor, obrigado por este momento de verdade entre nós.
              Ajuda-nos a viver o que decidimos.
              Abençoa o nosso lar, os nossos filhos e a nossa equipe.
              Que o Teu amor seja a base do nosso amor.
              Maria, Rainha das Equipes, rogai por nós. Amém."
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Abracem-se em silêncio por um momento
          </p>
        </div>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════════════
  // GUIDED FLOW (after level selection)
  // ═══════════════════════════════════════════════════

  const level = levels.find(l => l.id === selectedLevel);
  const isThemeStep = step?.id === 'tema-selecao';

  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      {/* Header with progress */}
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={handleExit} className="text-white/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-white/70 text-xs">
              <span>{level?.emoji} {step?.title}</span>
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
            <div className="text-4xl mb-2">{step?.emoji}</div>
            <h2 className="text-xl font-bold text-ens-blue">{step?.title}</h2>
            {step?.subtitle && (
              <p className="text-sm text-ens-text-light mt-1">{step?.subtitle}</p>
            )}
          </div>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation — hide on conclusion step */}
      {step?.id !== 'conclusao' && (
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
              disabled={isThemeStep && !selectedTheme}
              className={`flex-1 py-3.5 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.97] ${
                isThemeStep && !selectedTheme
                  ? 'bg-gray-300 text-gray-500 shadow-none'
                  : 'bg-ens-blue text-white'
              }`}
            >
              {currentStep === allSteps.length - 2 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
