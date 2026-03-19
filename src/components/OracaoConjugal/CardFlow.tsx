import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, Mic, MicOff, Save } from 'lucide-react';
import { useLiturgy } from '../../hooks/useLiturgy';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTimer } from '../../hooks/useTimer';
import { useFocusMode } from '../../hooks/useFocusMode';
import TimerButton from '../shared/TimerButton';
import FocusToggle from '../shared/FocusToggle';
import FontSizeToggle from '../shared/FontSizeToggle';
import wisdomDrops from '../../data/wisdomDrops.json';
import type { WisdomDrop } from '../../types';

/**
 * ORAÇÃO CONJUGAL DIÁRIA — 3 Níveis de Profundidade
 *
 * ENS Teaching: "A oração conjugal é o respiro do amor.
 * Não é um luxo, é oxigênio." — Equipes de Nossa Senhora
 *
 * 3 NÍVEIS:
 *
 * 1. SEMENTE (🌱) — ~5 min
 *    Para casais começando. Lado a lado, oração guiada.
 *    Sem partilha, sem exposição — apenas a presença de Deus.
 *
 * 2. CRESCIMENTO (🌿) — ~10 min
 *    Para casais aprofundando. Uma partilha leve, intercessão guiada.
 *
 * 3. PLENITUDE (💎) — ~15-20 min
 *    A oração conjugal plena segundo as ENS.
 *    Frente a frente, partilha da fé, bênção mútua.
 */

type LevelId = 'semente' | 'crescimento' | 'plenitude';

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
    id: 'semente',
    emoji: '🌱',
    name: 'Semente',
    subtitle: 'Rezar juntos, lado a lado',
    duration: '~5 min',
    description:
      'Para casais que estão começando a rezar juntos ou para dias com pouco tempo. Sem pressão, sem exposição — apenas a presença de Deus entre vocês.',
    highlights: [
      { emoji: '🪑', text: 'Lado a lado' },
      { emoji: '📖', text: 'Evangelho do dia' },
      { emoji: '📿', text: 'Oração guiada' },
    ],
  },
  {
    id: 'crescimento',
    emoji: '🌿',
    name: 'Crescimento',
    subtitle: 'Abrindo o coração, passo a passo',
    duration: '~10 min',
    description:
      'Para casais que querem ir mais fundo. Inclui uma partilha leve — apenas uma pergunta, sem pressão — e uma intercessão guiada.',
    highlights: [
      { emoji: '💬', text: 'Partilha leve' },
      { emoji: '❓', text: 'Uma pergunta' },
      { emoji: '🙏', text: 'Intercessão guiada' },
    ],
  },
  {
    id: 'plenitude',
    emoji: '💎',
    name: 'Plenitude',
    subtitle: 'A oração conjugal plena — ENS',
    duration: '~15-20 min',
    description:
      'A oração conjugal completa segundo as Equipes de Nossa Senhora. Frente a frente, olhos nos olhos, coração a coração. O ideal que Padre Caffarel sonhou para cada casal.',
    highlights: [
      { emoji: '👫', text: 'Frente a frente' },
      { emoji: '❤️', text: 'Partilha da fé' },
      { emoji: '✨', text: 'Bênção mútua' },
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

const sementeSteps: StepDef[] = [
  { id: 'prep-simples', emoji: '🕯️', title: 'Preparação', subtitle: 'Um momento de paz juntos' },
  { id: 'evangelho', emoji: '📖', title: 'Evangelho do Dia', subtitle: 'Escutar a Palavra de Deus' },
  { id: 'oracao-guiada', emoji: '📿', title: 'Oração Guiada', subtitle: 'Rezar juntos com palavras prontas' },
  { id: 'conclusao', emoji: '🎉', title: 'Oração Completada', subtitle: '' },
];

const crescimentoSteps: StepDef[] = [
  { id: 'prep', emoji: '🕯️', title: 'Preparação', subtitle: 'Criar o ambiente de oração' },
  { id: 'acolhida', emoji: '🙏', title: 'Acolhida', subtitle: 'Invocação do Espírito Santo' },
  { id: 'evangelho', emoji: '📖', title: 'Evangelho do Dia', subtitle: 'Escutar a Palavra de Deus' },
  { id: 'partilha-leve', emoji: '💬', title: 'Partilha e Intercessão', subtitle: 'Uma pergunta para o coração' },
  { id: 'conclusao', emoji: '🎉', title: 'Oração Completada', subtitle: '' },
];

const plenitudeSteps: StepDef[] = [
  { id: 'sabedoria', emoji: '💎', title: 'Sabedoria do Dia', subtitle: 'Reflexão e desafio' },
  { id: 'prep-full', emoji: '🕯️', title: 'Preparação', subtitle: 'Ambiente de oração' },
  { id: 'acolhida-full', emoji: '🙏', title: 'Acolhida de Deus', subtitle: 'Abrindo o coração' },
  { id: 'evangelho', emoji: '📖', title: 'Evangelho do Dia', subtitle: 'Escutar a Palavra de Deus' },
  { id: 'partilha-fe', emoji: '💬', title: 'Partilha da Fé', subtitle: 'O coração da oração conjugal' },
  { id: 'intercessao', emoji: '🕊️', title: 'Intercessão', subtitle: 'Oração de pedidos' },
  { id: 'bencao', emoji: '✨', title: 'Bênção Mútua', subtitle: 'Agradecimento e bênção' },
  { id: 'conclusao', emoji: '🎉', title: 'Oração Completada', subtitle: '' },
];

const stepsMap: Record<LevelId, StepDef[]> = {
  semente: sementeSteps,
  crescimento: crescimentoSteps,
  plenitude: plenitudeSteps,
};

// ─── Guided prayers for Semente (rotating by day of week) ────

const guidedPrayers = [
  {
    title: 'Oração de Domingo',
    text: `Senhor do Sábado e do Domingo, este é o dia que fizeste para nós.

Abençoa o nosso descanso, as nossas conversas, a nossa mesa partilhada.

Que neste dia possamos olhar um para o outro com os olhos do primeiro encontro — cheios de encanto e gratidão.

Renova as nossas forças para a semana que vem.

Glória ao Pai, ao Filho e ao Espírito Santo, como era no princípio, agora e sempre. Amém.`,
  },
  {
    title: 'Oração pelo Nosso Amor',
    text: `Senhor, obrigado pelo dom do nosso amor.

Abençoa o nosso casamento e renova a cada dia a graça do nosso Sacramento.

Que o nosso amor seja reflexo do Teu amor por nós — fiel, paciente e generoso.

Ajuda-nos a ser um para o outro sinal da Tua presença.

Maria, Mãe das famílias, cuida de nós.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
  {
    title: 'Oração pela Nossa Família',
    text: `Senhor, colocamos a nossa família nas Tuas mãos.

Protege os nossos filhos e todos que amamos.

Dá-nos sabedoria para educar, paciência para acompanhar e amor para perdoar.

Que o nosso lar seja uma pequena igreja doméstica, onde Tu és o centro.

São José, guardião da Sagrada Família, intercede por nós.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
  {
    title: 'Oração de Ação de Graças',
    text: `Senhor, obrigado por mais um dia juntos.

Obrigado pelo pão de cada dia, pelo teto que nos abriga, pela saúde que nos sustenta.

Obrigado pelas alegrias e também pelas cruzes — porque em tudo Tu estás presente.

Ensina-nos a gratidão que transforma o olhar e renova o coração.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
  {
    title: 'Oração pela Unidade do Casal',
    text: `Senhor Jesus, Tu que rezaste "para que todos sejam um", concede ao nosso casal a graça da unidade.

Onde houver distância, aproxima-nos.
Onde houver mágoa, cura-nos.
Onde houver silêncio frio, aquece-nos com o Teu Espírito.

Que sejamos um só coração diante de Ti.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
  {
    title: 'Oração de Entrega',
    text: `Pai, entregamos nas Tuas mãos tudo o que nos preocupa.

Os problemas que não conseguimos resolver, as angústias que carregamos em silêncio, os medos que não ousamos confessar.

Tu conheces o nosso coração melhor do que nós mesmos.

Cuida de nós como só Tu sabes cuidar.

Maria, Mãe de confiança, ensina-nos a confiar.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
  {
    title: 'Oração pelo Nosso Matrimônio',
    text: `Espírito Santo, reaviva em nós a chama do Sacramento do Matrimônio.

Que a rotina não apague o encanto.
Que o cansaço não mate a ternura.
Que as feridas não destruam a confiança.

Faz do nosso casamento um testemunho do Teu amor ao mundo.

Nossa Senhora das Equipes, acompanha o nosso caminho.

Em nome do Pai, do Filho e do Espírito Santo. Amém.`,
  },
];

// ─── Plenitude constants ────────────────────────────

const prepChecklist = [
  { id: 'phones', label: 'Desliguem os celulares', emoji: '📱' },
  { id: 'face', label: 'Sentem-se FRENTE A FRENTE', emoji: '👫' },
  { id: 'eyes', label: 'Olhem nos olhos um do outro', emoji: '👀' },
  { id: 'breathe', label: 'Respirem juntos, devagar', emoji: '🌬️' },
];

const faithSharingQuestions = [
  '❤️ O que tocou o meu coração na Palavra de Deus de hoje?',
  '🙏 Pelo que sou grato(a) a Deus neste momento da nossa vida?',
  '💡 Em que preciso da ajuda de Deus e da sua oração?',
];

const prayerOptions = [
  { id: 'spontaneous', label: 'Oração espontânea', emoji: '💬', desc: 'Rezem livremente, em voz alta, um de cada vez' },
  { id: 'rosary', label: 'Mistério do Rosário', emoji: '📿', desc: 'Rezem um mistério do terço juntos' },
  { id: 'psalm', label: 'Salmo 127 ou 128', emoji: '📖', desc: 'Salmos da família — leiam alternando versículos' },
  { id: 'intentions', label: 'Intenções livres', emoji: '🕊️', desc: 'Cada um coloca suas intenções diante de Deus' },
];

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export default function CardFlow() {
  const navigate = useNavigate();
  const { liturgy, loading, isFromFallback } = useLiturgy();
  const { conjugalData, completeConjugalPrayer } = usePrayerTracking();
  const { isSupported: micSupported, isListening, interimText, startListening, stopListening } = useSpeechRecognition();

  const [selectedLevel, setSelectedLevel] = useState<LevelId | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [saved, setSaved] = useState(false);
  const [journal, setJournal] = useState('');

  // Plenitude-specific state
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [intentions, setIntentions] = useState(['', '']);

  // Shared timer hook (sound + vibration on completion)
  const timer = useTimer();
  // Focus Mode — keeps screen awake + DND reminder
  const focusMode = useFocusMode();

  // Wisdom for Plenitude
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const wisdomIndex = dayOfYear % wisdomDrops.length;
  const todayWisdom = wisdomDrops[wisdomIndex] as WisdomDrop;

  // Guided prayer for Semente (rotate by day of week)
  const todayPrayer = guidedPrayers[new Date().getDay()];

  // ─── Mic toggle ─────────────────────────────────

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening((spokenText: string) => {
        setJournal(prev => {
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
    const duration = Math.round((Date.now() - startTime) / 60000);
    completeConjugalPrayer({
      duration: Math.max(duration, 1),
      journalEntry: journal.trim() || undefined,
      wisdomDay: selectedLevel === 'plenitude' ? todayWisdom.day : 0,
    });
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
              <h1 className="text-white font-bold text-lg">Oração Conjugal Diária</h1>
              <p className="text-white/60 text-xs">Escolham o nível para hoje</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto pb-8">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
            <p className="text-sm text-ens-text leading-relaxed text-center">
              A oração conjugal é uma <strong>caminhada</strong>, não um salto.
              Comecem de onde estão — Deus está presente em <strong>cada nível</strong>.
            </p>
            <p className="text-xs text-ens-text-light mt-2 text-center">
              Podem variar o nível a cada dia: mais profundo no domingo,
              mais simples num dia corrido.
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

          {/* ENS quote */}
          <div className="mt-5 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text italic">
              "A oração conjugal é o respiro do amor. Não é um luxo, é oxigênio.
              Mesmo cinco minutos de oração juntos transformam um casamento."
            </p>
            <p className="text-xs text-ens-text-light mt-1 text-right">— Espiritualidade ENS</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // CONCLUSION STEP (shared across all levels)
  // ═══════════════════════════════════════════════════

  const renderConclusion = () => (
    <div className="space-y-5">
      <div className="text-center py-2">
        <h3 className="text-2xl font-bold text-ens-blue">Glória a Deus!</h3>
        <p className="text-ens-text-light mt-1">
          {selectedLevel === 'semente' && 'Vocês rezaram juntos — isso é lindo!'}
          {selectedLevel === 'crescimento' && 'Oração conjugal completada!'}
          {selectedLevel === 'plenitude' && 'Oração conjugal plena completada!'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">⏱️</div>
          <div className="text-lg font-bold text-ens-blue">
            {Math.max(Math.round((Date.now() - startTime) / 60000), 1)} min
          </div>
          <div className="text-[0.625rem] text-ens-text-light">duração</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">🔥</div>
          <div className="text-lg font-bold text-ens-blue">{conjugalData.currentStreak + 1}</div>
          <div className="text-[0.625rem] text-ens-text-light">dias seguidos</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">📅</div>
          <div className="text-lg font-bold text-ens-blue">{conjugalData.monthlyCount + 1}</div>
          <div className="text-[0.625rem] text-ens-text-light">este mês</div>
        </div>
      </div>

      {/* Journal with mic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-ens-blue text-sm">
            📝 Diário de oração (opcional)
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

        {/* Listening indicator */}
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
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Como foi a oração de hoje? O que Deus falou ao coração de vocês?"
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
            placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
          rows={4}
          disabled={saved}
        />
        {micSupported && (
          <p className="text-[0.6875rem] text-ens-text-light mt-1 text-right">
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
          Salvar Oração
        </button>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-semibold">Oração salva com sucesso!</p>
          <p className="text-xs text-ens-text-light mt-1">
            Que Deus abençoe a noite de vocês 🌙
          </p>
          {selectedLevel !== 'plenitude' && (
            <p className="text-xs text-ens-blue mt-2">
              💡 Quando se sentirem prontos, experimentem o próximo nível!
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
            setJournal('');
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
    // SEMENTE — Preparação Simples
    // ─────────────────────────────────────────────────

    if (step.id === 'prep-simples') {
      return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-ens-text font-semibold text-lg">🕯️ Preparem-se para rezar</p>
            <p className="text-sm text-ens-text-light mt-1">Sem pressa, sem pressão</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🪑</span>
              <p className="text-sm text-ens-text font-medium">
                Sentem-se <strong>lado a lado</strong> — onde se sentirem confortáveis
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">📱</span>
              <p className="text-sm text-ens-text font-medium">Silenciem os celulares</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🤝</span>
              <p className="text-sm text-ens-text font-medium">Se quiserem, deem as mãos</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-ens-text mb-2">Façam juntos o sinal da cruz:</p>
            <p className="text-ens-blue font-semibold">
              Em nome do Pai, do Filho e do Espírito Santo. Amém.
            </p>
          </div>

          <TimerButton timer={timer} label="30 segundos de silêncio" defaultDuration={30} />

          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text italic">
              Não se preocupem em "fazer certo". O simples fato de estarem juntos
              diante de Deus já é oração.
            </p>
          </div>

          {/* Level indicator */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">🌱 Semente</strong>
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
    // EVANGELHO DO DIA (shared by all levels)
    // ─────────────────────────────────────────────────

    if (step.id === 'evangelho') {
      return (
        <div className="space-y-5">
          {loading ? (
            <div className="flex flex-col items-center py-10">
              <div className="animate-spin w-8 h-8 border-3 border-ens-blue border-t-transparent rounded-full" />
              <p className="text-sm text-ens-text-light mt-3">Carregando o Evangelho do dia...</p>
            </div>
          ) : liturgy ? (
            <>
              {isFromFallback && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700">
                  <span>📡</span>
                  <span>Evangelho de arquivo (API indisponível)</span>
                </div>
              )}

              {liturgy.cor && (
                <div className="text-center">
                  <span className="inline-block text-xs px-3 py-1 rounded-full bg-ens-blue/10 text-ens-blue font-medium">
                    {liturgy.liturgia} • Cor: {liturgy.cor}
                  </span>
                </div>
              )}

              <div className="bg-[#faf8f3] rounded-xl p-5 border-l-[3px] border-ens-gold/50">
                {liturgy.evangelhoReferencia && (
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-ens-gold/40" />
                      <p className="text-sm font-semibold text-ens-blue">{liturgy.evangelhoReferencia}</p>
                      <div className="h-px w-8 bg-ens-gold/40" />
                    </div>
                    {liturgy.evangelhoTitulo && (
                      <p className="text-xs text-ens-gold font-medium mt-0.5">{liturgy.evangelhoTitulo}</p>
                    )}
                  </div>
                )}
                <p className="font-serif text-base leading-[1.9] text-ens-text whitespace-pre-line">
                  {liturgy.evangelho}
                </p>
              </div>

              {selectedLevel === 'semente' && (
                <p className="text-center text-xs text-ens-text-light">
                  💡 Leiam juntos, em voz alta — um lê para o outro
                </p>
              )}

              {selectedLevel === 'crescimento' && (
                <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
                  <p className="text-sm text-ens-text italic">
                    "O que esta Palavra diz ao nosso casal hoje?"
                  </p>
                  <p className="text-xs text-ens-text-light mt-2">
                    💡 Leiam alternando os parágrafos, depois um momento de silêncio
                  </p>
                </div>
              )}

              {selectedLevel === 'plenitude' && (
                <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
                  <p className="text-sm text-ens-text italic">
                    "O que esta Palavra diz ao nosso casal hoje?"
                  </p>
                  <p className="text-xs text-ens-text-light mt-2">
                    💡 Leiam em voz alta, alternando os parágrafos. Depois, silêncio.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // SEMENTE — Oração Guiada
    // ─────────────────────────────────────────────────

    if (step.id === 'oracao-guiada') {
      return (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">
              Rezem juntos, em voz alta — um lê ou ambos juntos:
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-ens-blue text-center mb-4">{todayPrayer.title}</h3>
            <div className="space-y-3 text-ens-text text-sm leading-relaxed">
              {todayPrayer.text.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Podem também permanecer em silêncio por um momento, de mãos dadas
          </p>

          <TimerButton timer={timer} label="Silêncio de 1 minuto" defaultDuration={60} />
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CRESCIMENTO — Preparação
    // ─────────────────────────────────────────────────

    if (step.id === 'prep') {
      return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-ens-text font-semibold text-lg">🕯️ Preparem o ambiente</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">📱</span>
              <p className="text-sm text-ens-text font-medium">Silenciem os celulares</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🪑</span>
              <p className="text-sm text-ens-text font-medium">
                Lado a lado <strong>ou</strong> frente a frente — como preferirem
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ens-cream">
              <span className="text-xl">🌬️</span>
              <p className="text-sm text-ens-text font-medium">Respirem juntos, devagar</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-ens-text mb-2">Façam juntos o sinal da cruz</p>
            <p className="text-ens-blue font-semibold">
              Em nome do Pai, do Filho e do Espírito Santo. Amém.
            </p>
          </div>

          <TimerButton timer={timer} label="1 minuto de silêncio" defaultDuration={60} />

          {/* Level indicator */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">🌿 Crescimento</strong>
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
    // CRESCIMENTO — Acolhida
    // ─────────────────────────────────────────────────

    if (step.id === 'acolhida') {
      return (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">Rezem juntos, em voz alta:</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 text-ens-text leading-relaxed">
            <p className="text-center font-semibold text-ens-blue">
              Em nome do Pai, do Filho e do Espírito Santo. Amém.
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p>Senhor, nós Te acolhemos no meio de nós.</p>
              <p className="mt-3">
                Tu prometeste estar presente onde dois ou três se reunissem em Teu nome.
              </p>
              <p className="mt-3">
                Abre os nossos corações para Te ouvir e nos ouvir mutuamente.
              </p>
              <p className="mt-3">Vem, Espírito Santo, conduz este momento.</p>
            </div>
            <p className="text-center font-semibold text-ens-blue">Amém.</p>
          </div>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // CRESCIMENTO — Partilha Leve + Intercessão
    // ─────────────────────────────────────────────────

    if (step.id === 'partilha-leve') {
      return (
        <div className="space-y-5">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
            <p className="text-ens-text text-sm leading-relaxed">
              Agora, se quiserem, partilhem <strong>uma coisa simples</strong>:
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="bg-ens-cream rounded-xl p-4 text-center">
              <p className="text-ens-text text-base font-medium leading-relaxed">
                ❤️ "Que palavra ou frase do Evangelho tocou o meu coração?"
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700 text-center font-medium mb-2">
              Lembrete gentil:
            </p>
            <div className="space-y-2">
              <p className="text-sm text-green-600 text-center">
                Não é preciso se explicar — apenas partilhar
              </p>
              <p className="text-sm text-green-600 text-center">
                Quem ouve, apenas acolhe 💛
              </p>
            </div>
          </div>

          <TimerButton timer={timer} label="Timer de 5 minutos" defaultDuration={300} />

          <div className="border-t border-gray-200 pt-5">
            <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-2 text-center">
                🕊️ Intercessão
              </h3>
              <p className="text-sm text-ens-text text-center leading-relaxed">
                Rezem juntos: cada um diga em voz alta um pedido a Deus.
              </p>
              <p className="text-xs text-ens-text-light text-center mt-2 italic">
                "Senhor, eu Te peço por..."
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center space-y-3">
            <p className="text-ens-text text-sm leading-relaxed">Para encerrar, rezem juntos:</p>
            <p className="text-ens-text text-sm italic">
              "Senhor, obrigado por este momento juntos.
              Abençoa o nosso amor e a nossa família. Amém."
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Podem se abraçar em silêncio por um momento
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // PLENITUDE — Sabedoria do Dia
    // ─────────────────────────────────────────────────

    if (step.id === 'sabedoria') {
      return (
        <div className="space-y-5">
          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-ens-gold uppercase tracking-wider">
                {todayWisdom.category}
              </span>
            </div>
            <blockquote className="text-ens-text italic text-base leading-relaxed">
              "{todayWisdom.quote}"
            </blockquote>
            <p className="text-right text-sm text-ens-text-light mt-2">— {todayWisdom.author}</p>
          </div>

          <div>
            <h3 className="font-semibold text-ens-blue mb-2">Reflexão</h3>
            <p className="text-ens-text text-sm leading-relaxed">{todayWisdom.reflection}</p>
          </div>

          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <h3 className="font-semibold text-ens-blue mb-1">🎯 Desafio do dia</h3>
            <p className="text-ens-text text-sm">{todayWisdom.challenge}</p>
          </div>

          {/* Level indicator — first step */}
          <div className="bg-ens-cream rounded-xl p-3 border border-gray-200 text-center">
            <p className="text-xs text-ens-text-light">
              Nível: <strong className="text-ens-blue">💎 Plenitude</strong>
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
    // PLENITUDE — Preparação (full checklist)
    // ─────────────────────────────────────────────────

    if (step.id === 'prep-full') {
      return (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-ens-text font-semibold text-lg">✨ Preparem o ambiente de oração</p>
            <p className="text-sm text-ens-text-light mt-1">Este momento é sagrado. Cuidem do espaço.</p>
          </div>

          <div className="space-y-3">
            {prepChecklist.map(item => (
              <button
                key={item.id}
                onClick={() => setChecked(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                  checked[item.id]
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className={`flex-1 text-left text-sm ${
                  checked[item.id] ? 'line-through text-ens-text-light' : 'text-ens-text font-medium'
                }`}>
                  {item.label}
                </span>
                {checked[item.id] && <Check className="w-5 h-5 text-green-600" />}
              </button>
            ))}
          </div>

          <div className="bg-ens-blue text-white rounded-xl p-4 text-center">
            <p className="font-bold text-lg">👫 FRENTE A FRENTE</p>
            <p className="text-sm text-white/80 mt-1">Olhos nos olhos</p>
          </div>

          <TimerButton timer={timer} label="30 segundos de silêncio" defaultDuration={30} />
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // PLENITUDE — Acolhida de Deus (full)
    // ─────────────────────────────────────────────────

    if (step.id === 'acolhida-full') {
      return (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center">
            <p className="text-sm text-purple-600 font-medium mb-3">
              Rezem juntos, em voz alta:
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 text-ens-text leading-relaxed">
            <p className="text-center font-semibold text-ens-blue">
              Em nome do Pai, do Filho e do Espírito Santo. Amém.
            </p>

            <div className="border-t border-gray-100 pt-4">
              <p>Senhor, nós Te acolhemos no meio de nós.</p>
              <p className="mt-3">
                Tu prometeste estar presente onde dois ou três se reunissem em Teu nome.
                Estamos aqui, juntos diante de Ti.
              </p>
              <p className="mt-3">
                Abre os nossos corações para que possamos Te ouvir
                e nos ouvir mutuamente.
              </p>
              <p className="mt-3">
                Que o Teu Espírito Santo conduza este momento de oração.
              </p>
              <p className="mt-3">Maria, Mãe das famílias, reza conosco.</p>
            </div>

            <p className="text-center font-semibold text-ens-blue pt-2">Amém.</p>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💡 Podem também cantar um louvor curto ou rezar um Pai Nosso juntos
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // PLENITUDE — Partilha da Fé (full)
    // ─────────────────────────────────────────────────

    if (step.id === 'partilha-fe') {
      return (
        <div className="space-y-5">
          {/* CRITICAL: Listening rules */}
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
            {faithSharingQuestions.map((q, i) => (
              <div key={i} className="bg-ens-cream rounded-xl p-4 border border-gray-200">
                <p className="text-ens-text text-sm">{q}</p>
              </div>
            ))}
          </div>

          <TimerButton timer={timer} label="Timer de 10 minutos" defaultDuration={600} />

          <p className="text-center text-xs text-ens-text-light italic">
            💛 Este é o CORAÇÃO da oração conjugal segundo as ENS
          </p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // PLENITUDE — Intercessão
    // ─────────────────────────────────────────────────

    if (step.id === 'intercessao') {
      return (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-700">
              ✨ Variem as formas de oração — não se prendam a uma só
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-ens-blue text-sm">Escolham uma forma de oração:</h3>
            {prayerOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedPrayer(option.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedPrayer === option.id
                    ? 'bg-ens-blue text-white shadow-md'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <p className={`font-semibold text-sm ${
                      selectedPrayer === option.id ? 'text-white' : 'text-ens-text'
                    }`}>
                      {option.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      selectedPrayer === option.id ? 'text-white/80' : 'text-ens-text-light'
                    }`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPrayer === 'intentions' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-ens-blue text-sm">Intenções de oração:</h3>
              {intentions.map((intention, i) => (
                <textarea
                  key={i}
                  value={intention}
                  onChange={e => {
                    const next = [...intentions];
                    next[i] = e.target.value;
                    setIntentions(next);
                  }}
                  placeholder={`Intenção ${i + 1} (opcional)`}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
                    placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
                  rows={2}
                />
              ))}
              <button
                onClick={() => setIntentions(prev => [...prev, ''])}
                className="text-xs text-ens-blue font-medium"
              >
                + Adicionar intenção
              </button>
            </div>
          )}

          {selectedPrayer === 'psalm' && (
            <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-ens-blue text-sm mb-2">Salmo 128 (127)</h4>
              <p className="text-ens-text text-sm leading-relaxed">
                Feliz todo aquele que teme o Senhor e anda nos seus caminhos!{'\n\n'}
                Do trabalho das tuas mãos comerás, serás feliz e tudo te irá bem.{'\n\n'}
                A tua esposa será como vide fecunda no interior da tua casa;
                os teus filhos como rebentos de oliveira ao redor da tua mesa.{'\n\n'}
                Assim será abençoado o homem que teme o Senhor.
              </p>
            </div>
          )}
        </div>
      );
    }

    // ─────────────────────────────────────────────────
    // PLENITUDE — Bênção Mútua
    // ─────────────────────────────────────────────────

    if (step.id === 'bencao') {
      return (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 text-ens-text leading-relaxed">
            <h3 className="font-semibold text-ens-blue text-center mb-2">
              Oração de Agradecimento
            </h3>
            <p>Senhor, obrigado por este momento de oração juntos.</p>
            <p>Obrigado pela presença do Teu Espírito entre nós.</p>
            <p>Obrigado pelo dom do nosso amor e pela graça do nosso matrimônio.</p>
            <p>
              Abençoa a nossa família, a nossa equipe ENS e todas as famílias
              que se encomendam às nossas orações.
            </p>
          </div>

          <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
            <h3 className="font-bold text-ens-blue text-lg mb-3">✨ Bênção Mútua</h3>
            <div className="space-y-4 text-sm text-ens-text">
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium">1. O marido faz o sinal da cruz sobre a esposa:</p>
                <p className="italic text-ens-text-light mt-1">
                  "Que Deus te abençoe e te guarde."
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium">2. A esposa faz o sinal da cruz sobre o marido:</p>
                <p className="italic text-ens-text-light mt-1">
                  "Que Deus te abençoe e te guarde."
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium">3. Juntos:</p>
                <p className="italic text-ens-text-light mt-1">
                  "Em nome do Pai, do Filho e do Espírito Santo. Amém."
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-ens-text-light">
            💑 Podem também se abraçar em silêncio por um momento
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
              <div className="flex items-center gap-2">
                <FontSizeToggle />
                <FocusToggle focusMode={focusMode} />
                <span>{Math.round(progress)}%</span>
              </div>
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
              className="flex-1 py-3.5 rounded-xl bg-ens-blue text-white font-semibold shadow-lg transition-all active:scale-[0.97]"
            >
              {currentStep === allSteps.length - 2 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
