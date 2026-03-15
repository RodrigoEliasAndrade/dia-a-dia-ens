import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mic, MicOff } from 'lucide-react';
import { useLiturgy } from '../../hooks/useLiturgy';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';
import { useDiario } from '../../hooks/useDiario';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTimer } from '../../hooks/useTimer';
import TimerButton from '../shared/TimerButton';
import { format } from 'date-fns';

/**
 * ORAÇÃO PESSOAL DIÁRIA — Leitura Orante do Evangelho
 *
 * ENS Teaching: "A oração conjugal nasce da oração pessoal.
 * Não podemos dar ao outro o que não temos."
 * — Padre Henri Caffarel
 *
 * 3 MÉTODOS DE LEITURA ORANTE:
 *
 * 1. LECTIO DIVINA (São Bento / Tradição Monástica)
 *    O método mais antigo da Igreja — escutar Deus na Palavra.
 *    Lectio → Meditatio → Oratio → Contemplatio
 *
 * 2. CONTEMPLAÇÃO INACIANA (Santo Inácio de Loyola)
 *    Dos Exercícios Espirituais — entrar na cena do Evangelho
 *    com a imaginação e todos os sentidos.
 *
 * 3. MEDITAÇÃO SALESIANA (São Francisco de Sales)
 *    Da "Introdução à Vida Devota" — meditar ponto a ponto,
 *    deixar surgir afetos e tomar uma resolução concreta.
 */

type MethodId = 'lectio-divina' | 'inaciana' | 'salesiana';

interface Method {
  id: MethodId;
  emoji: string;
  name: string;
  saint: string;
  saintYears: string;
  origin: string;
  description: string;
  steps: { id: string; emoji: string; title: string; subtitle: string }[];
}

const methods: Method[] = [
  {
    id: 'lectio-divina',
    emoji: '📜',
    name: 'Lectio Divina',
    saint: 'São Bento de Núrsia',
    saintYears: '480–547',
    origin: 'Tradição Monástica',
    description:
      'O método mais antigo da Igreja para ler a Palavra de Deus. Nascido nos mosteiros, convida a escutar Deus que fala através das Escrituras com o coração, não apenas com a mente.',
    steps: [
      { id: 'meditatio', emoji: '💭', title: 'Meditatio', subtitle: 'Ruminar a Palavra no coração' },
      { id: 'oratio', emoji: '🙏', title: 'Oratio', subtitle: 'Responder a Deus com o coração' },
      { id: 'contemplatio', emoji: '✨', title: 'Contemplatio', subtitle: 'Repousar em Deus em silêncio' },
    ],
  },
  {
    id: 'inaciana',
    emoji: '🎭',
    name: 'Contemplação Inaciana',
    saint: 'Santo Inácio de Loyola',
    saintYears: '1491–1556',
    origin: 'Exercícios Espirituais',
    description:
      'Dos Exercícios Espirituais de Santo Inácio. Use a imaginação para entrar na cena do Evangelho — veja os lugares, ouça as palavras, sinta os cheiros. Torne-se uma personagem. Encontre Jesus pessoalmente.',
    steps: [
      { id: 'composicao', emoji: '🎨', title: 'Composição de Lugar', subtitle: 'Entrar na cena com a imaginação' },
      { id: 'sentidos', emoji: '👁️', title: 'Sentidos Espirituais', subtitle: 'Ver, ouvir, sentir a cena' },
      { id: 'coloquio', emoji: '💬', title: 'Colóquio com Jesus', subtitle: 'Conversar pessoalmente com Cristo' },
    ],
  },
  {
    id: 'salesiana',
    emoji: '🌹',
    name: 'Meditação Salesiana',
    saint: 'São Francisco de Sales',
    saintYears: '1567–1622',
    origin: 'Introdução à Vida Devota',
    description:
      'Da obra-prima "Introdução à Vida Devota". Um método gentil e prático: medite ponto a ponto, deixe surgir sentimentos santos, tome uma resolução concreta e leve uma frase — o "ramalhete espiritual" — para o dia todo.',
    steps: [
      { id: 'consideracoes', emoji: '🔍', title: 'Considerações', subtitle: 'Meditar a Palavra ponto a ponto' },
      { id: 'afetos', emoji: '❤️‍🔥', title: 'Afetos e Resoluções', subtitle: 'Sentir e decidir concretamente' },
      { id: 'ramalhete', emoji: '💐', title: 'Ramalhete Espiritual', subtitle: 'Uma frase para levar o dia todo' },
    ],
  },
];

// Common steps (before and after method-specific steps)
const prepStep = { id: 'preparacao', emoji: '🕯️', title: 'Preparação', subtitle: 'Silenciar o coração' };
const leituraStep = { id: 'leitura', emoji: '📖', title: 'Evangelho do Dia', subtitle: 'Escutar a Palavra de Deus' };
const envioStep = { id: 'envio', emoji: '🕊️', title: 'Envio', subtitle: 'Levar a Palavra para o dia' };

export default function OracaoPessoalFlow() {
  const navigate = useNavigate();
  const { liturgy, loading, isFromFallback } = useLiturgy();
  const { completePessoalPrayer } = usePrayerTracking();
  const { addEntry } = useDiario();

  const [selectedMethod, setSelectedMethod] = useState<MethodId | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [saved, setSaved] = useState(false);
  const [diarioNotes, setDiarioNotes] = useState('');

  // Speech recognition for diary
  const { isSupported: micSupported, isListening, interimText, startListening, stopListening } = useSpeechRecognition();

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening((spokenText: string) => {
        setDiarioNotes(prev => {
          // Add a space before appending if there's existing text
          const separator = prev.trim() ? ' ' : '';
          return prev + separator + spokenText;
        });
      });
    }
  }, [isListening, startListening, stopListening]);

  // Shared timer hook (sound + vibration on completion)
  const timer = useTimer();

  // Build steps array based on selected method
  const method = methods.find(m => m.id === selectedMethod);
  const allSteps = method
    ? [prepStep, leituraStep, ...method.steps, envioStep]
    : [];

  const step = allSteps[currentStep];
  const progress = allSteps.length > 0 ? ((currentStep + 1) / allSteps.length) * 100 : 0;

  const handleSave = () => {
    stopListening(); // Stop mic if active
    completePessoalPrayer();

    // Save diary entry (even if notes are empty — records the method & reference)
    if (method) {
      addEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        method: method.id,
        methodName: method.name,
        methodEmoji: method.emoji,
        gospelReference: liturgy?.evangelhoReferencia || '',
        notes: diarioNotes.trim(),
        duration: Math.round((Date.now() - startTime) / 60000),
      });
    }

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

  // ─── GOSPEL TEXT FORMATTER ──────────────────────
  // Parses inline verse numbers (e.g. "9Jesus", "10"Dois") into
  // styled superscript numbers with verse-by-verse paragraph breaks.
  const renderGospelText = (text: string) => {
    // Regex: find 1-3 digit numbers directly followed by any non-space/non-digit
    // character (letter, quote, etc). These are verse numbers embedded by the API.
    // The number must be preceded by whitespace, punctuation, or start of string.
    const verseRegex = /(?:^|[\s.!?;:,])(\d{1,3})(?=[^\s\d])/g;

    const matches: { index: number; numLen: number; number: string }[] = [];
    let m;
    while ((m = verseRegex.exec(text)) !== null) {
      const offset = m[0].length - m[1].length; // skip leading space/punct
      matches.push({
        index: m.index + offset,
        numLen: m[1].length,
        number: m[1],
      });
    }

    if (matches.length === 0) {
      return (
        <p className="font-serif text-[17px] leading-[2] text-ens-text">
          {text}
        </p>
      );
    }

    // Build verse segments
    const verses: { number?: string; text: string }[] = [];

    // Text before first verse number (e.g., "Naquele tempo,")
    if (matches[0].index > 0) {
      const intro = text.slice(0, matches[0].index).trim();
      if (intro) verses.push({ text: intro });
    }

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i].numLen;
      const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const verseText = text.slice(start, end).trim();
      if (verseText) {
        verses.push({ number: matches[i].number, text: verseText });
      }
    }

    return (
      <div className="space-y-3">
        {verses.map((verse, i) => (
          <p key={i} className="font-serif text-[17px] leading-[2] text-ens-text">
            {verse.number && (
              <sup className="text-[11px] font-sans font-bold text-ens-gold mr-1 select-none">
                {verse.number}
              </sup>
            )}
            {verse.text}
          </p>
        ))}
      </div>
    );
  };

  // ─── METHOD SELECTION SCREEN ───────────────────────────
  if (!selectedMethod) {
    return (
      <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
        <div className="bg-ens-blue px-4 pt-3 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white/70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Leitura Orante do Evangelho</h1>
              <p className="text-white/60 text-xs">Escolha como quer encontrar Deus hoje</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto pb-8">
          {/* Intro */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
            <p className="text-sm text-ens-text leading-relaxed text-center">
              A Igreja oferece <strong>vários caminhos</strong> para ler a Palavra de Deus.
              Todos levam ao mesmo destino: um <strong>encontro pessoal com Cristo</strong>.
            </p>
            <p className="text-xs text-ens-text-light mt-2 text-center">
              Escolha o método que fala ao seu coração hoje.
              Você pode variar a cada dia.
            </p>
          </div>

          {/* Method cards */}
          <div className="space-y-4">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className="w-full bg-white rounded-2xl shadow-md p-5 text-left transition-all active:scale-[0.98] border-2 border-transparent hover:border-ens-blue/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{m.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-ens-blue text-base">{m.name}</h3>
                    <p className="text-xs text-ens-gold font-medium">{m.saint} ({m.saintYears})</p>
                    <p className="text-xs text-ens-text-light">{m.origin}</p>
                  </div>
                </div>
                <p className="text-sm text-ens-text leading-relaxed">{m.description}</p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {m.steps.map(s => (
                    <span key={s.id} className="text-xs px-2 py-1 rounded-full bg-ens-blue/5 text-ens-blue">
                      {s.emoji} {s.title}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* ENS quote */}
          <div className="mt-5 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text italic">
              "A oração pessoal é o alicerce. Sem ela, a oração conjugal é como uma casa
              construída sobre a areia. Cada esposo precisa do seu encontro pessoal com Deus."
            </p>
            <p className="text-xs text-ens-text-light mt-1 text-right">— Padre Henri Caffarel</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── GUIDED FLOW (after method selection) ──────────────

  const renderStepContent = () => {
    if (!step) return null;

    // ─── COMMON: Preparação ────────────────────────
    if (step.id === 'preparacao') {
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
            Faça o sinal da cruz e permaneça em silêncio
          </p>

          <TimerButton timer={timer} label="Silêncio de 1 minuto" defaultDuration={60} />

          <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-ens-text-light text-center">
              Método escolhido: <strong className="text-ens-blue">{method?.emoji} {method?.name}</strong>
            </p>
            <button
              onClick={() => { setSelectedMethod(null); setCurrentStep(0); timer.reset(); }}
              className="block mx-auto mt-2 text-xs text-ens-blue underline"
            >
              Trocar método
            </button>
          </div>
        </div>
      );
    }

    // ─── COMMON: Leitura do Evangelho ──────────────
    if (step.id === 'leitura') {
      return (
        <div className="space-y-5">
          {/* Compact instruction — subtle, doesn't compete with Scripture */}
          <p className="text-center text-sm text-ens-text-light">
            Leia <strong className="text-ens-blue">lentamente</strong>, em voz baixa.{' '}
            {selectedMethod === 'inaciana'
              ? 'Prepare-se para entrar na cena.'
              : selectedMethod === 'salesiana'
                ? 'Na segunda leitura, observe o que toca seu coração.'
                : 'Na segunda leitura, deixe uma palavra saltar aos seus olhos.'}
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-10">
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

              {/* Reference — prominent, with decorative divider */}
              {liturgy.evangelhoReferencia && (
                <div className="text-center space-y-1 py-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-ens-gold/40" />
                    <p className="text-sm font-semibold text-ens-blue tracking-wide">
                      {liturgy.evangelhoReferencia}
                    </p>
                    <div className="h-px w-8 bg-ens-gold/40" />
                  </div>
                  {liturgy.evangelhoTitulo && (
                    <p className="text-xs text-ens-gold font-medium">{liturgy.evangelhoTitulo}</p>
                  )}
                </div>
              )}

              {/* Scripture text — the hero of the screen */}
              <div className="rounded-xl px-5 py-6 bg-[#faf8f3] border-l-[3px] border-ens-gold/50">
                {renderGospelText(liturgy.evangelho)}
              </div>
            </>
          ) : null}

          <p className="text-center text-xs text-ens-text-light italic pt-1">
            Não tenha pressa. Deus fala no ritmo do coração, não da mente.
          </p>
        </div>
      );
    }

    // ─── COMMON: Envio (closing) ───────────────────
    if (step.id === 'envio') {
      return (
        <div className="space-y-5">
          {/* Diary / Reflection Notes */}
          <div className="bg-[#faf8f3] rounded-xl p-5 border-l-[3px] border-ens-gold/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h3 className="font-semibold text-ens-blue text-sm">Meu Diário de Oração</h3>
              </div>
              {micSupported && (
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-full transition-all ${
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
            <p className="text-xs text-ens-text-light mb-3">
              O que Deus te disse hoje? Que palavra tocou seu coração?
              Que sentimento, decisão ou graça quer guardar?
            </p>

            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-0.5 items-end">
                  <div className="w-1 h-2 bg-red-400 rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]" />
                  <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:450ms]" />
                </div>
                <span className="text-xs text-red-600 font-medium">
                  Ouvindo... fale naturalmente
                </span>
              </div>
            )}

            {/* Interim text preview (what's being recognized right now) */}
            {interimText && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-ens-blue/5 border border-ens-blue/20">
                <p className="text-sm text-ens-blue/70 italic">{interimText}...</p>
              </div>
            )}

            <textarea
              value={diarioNotes}
              onChange={e => setDiarioNotes(e.target.value)}
              placeholder={
                selectedMethod === 'lectio-divina'
                  ? 'A palavra que me tocou foi... Deus me disse que...'
                  : selectedMethod === 'inaciana'
                    ? 'Na cena do Evangelho, eu vi... senti... Jesus me disse...'
                    : 'Minha resolução de hoje é... O ramalhete que levo é...'
              }
              rows={4}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-gold/40 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-ens-text-light italic">
                Suas anotações ficam salvas no Diário.
              </p>
              {micSupported && (
                <p className="text-[11px] text-ens-text-light">
                  {isListening ? '🔴 Gravando' : '🎙️ Toque no mic para falar'}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center space-y-3">
            <p className="text-ens-text text-sm leading-relaxed">
              Guarde no coração <strong>uma palavra</strong> para levar consigo hoje.
            </p>
          </div>

          <div className="bg-ens-cream rounded-xl p-5 border border-gray-200 text-center">
            <p className="text-ens-text text-sm italic leading-relaxed">
              "Senhor, obrigado(a) por este momento contigo.
              Que a Tua Palavra ilumine o meu dia
              e me ajude a amar melhor quem está ao meu lado. Amém."
            </p>
          </div>

          <p className="text-center text-xs text-ens-text-light">Faça o sinal da cruz</p>

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
                  Duração: {Math.round((Date.now() - startTime) / 60000)} minutos •
                  Método: {method?.name}
                </p>
                {diarioNotes.trim() && (
                  <p className="text-xs text-ens-gold mt-1">📝 Anotação salva no Diário</p>
                )}
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

    // ─── LECTIO DIVINA steps ───────────────────────
    if (selectedMethod === 'lectio-divina') {
      if (step.id === 'meditatio') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-1">O que é a Meditatio?</h3>
              <p className="text-xs text-ens-text-light leading-relaxed">
                Os monges chamavam de "ruminar" — como quem mastiga lentamente
                um alimento para extrair todo o sabor. Repita no coração a palavra que te tocou.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Pergunte ao seu coração:</h3>
              <div className="space-y-3">
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">❤️ Que palavra ou frase <strong>tocou</strong> o meu coração?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🔦 O que Deus quer <strong>me dizer</strong> hoje, pessoalmente?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🪞 Esta Palavra <strong>espelha</strong> algo da minha vida agora?</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Na meditação, não se trata de estudar ou analisar. É deixar que a Palavra
                entre no coração como semente na terra boa." — Tradição Beneditina
              </p>
            </div>

            <TimerButton timer={timer} label="Meditar por 3 minutos" defaultDuration={180} />
          </div>
        );
      }

      if (step.id === 'oratio') {
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-ens-text text-sm leading-relaxed">
                Agora é a <strong className="text-ens-blue">sua vez de falar com Deus</strong>.
              </p>
              <p className="text-ens-text-light text-sm mt-2">
                Responda à Palavra que ouviu. Fale com Ele como se fala com um amigo íntimo.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">São Bento sugere:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙏 <strong>Agradeça</strong> — pelo que Deus revelou a você</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">💔 <strong>Peça perdão</strong> — pelo que reconheceu em si</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙌 <strong>Interceda</strong> — pelo seu cônjuge, filhos, equipe</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🕊️ <strong>Entregue</strong> — suas preocupações nas mãos de Deus</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-ens-text-light italic">
              Reze especialmente pelo seu cônjuge. A oração pessoal alimenta o amor conjugal.
            </p>

            <TimerButton timer={timer} label="Rezar por 3 minutos" defaultDuration={180} />
          </div>
        );
      }

      if (step.id === 'contemplatio') {
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

            <TimerButton timer={timer} label="Silêncio de 2 minutos" defaultDuration={120} />

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                São Bento ensinava: a contemplação é o ápice da oração.
                Não se preocupe se parecer "não acontecer nada".
                O silêncio diante de Deus nunca é vazio — é plenitude.
              </p>
            </div>
          </div>
        );
      }
    }

    // ─── CONTEMPLAÇÃO INACIANA steps ───────────────
    if (selectedMethod === 'inaciana') {
      if (step.id === 'composicao') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-1">O que é a Composição de Lugar?</h3>
              <p className="text-xs text-ens-text-light leading-relaxed">
                Santo Inácio ensina: antes de meditar, <strong>entre na cena</strong> do Evangelho
                com a imaginação. Não é fantasia — é deixar o Espírito Santo
                usar seus sentidos para encontrar Cristo.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Imagine a cena:</h3>
              <div className="space-y-3">
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">📍 <strong>Onde</strong> acontece? Como é o lugar? (uma casa, um campo, o templo, o lago...)</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">👥 <strong>Quem</strong> está presente? Como são seus rostos, gestos, postura?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🕐 <strong>Quando</strong> — é dia, noite? Faz calor, frio? Há barulho ou silêncio?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🧑 <strong>Onde estou eu?</strong> Eu sou uma das personagens? Um observador? Estou ao lado de Jesus?</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Não se trata de 'inventar' coisas, mas de deixar que o Espírito Santo
                ilumine a sua imaginação para que o Evangelho se torne vivo, real,
                presente — aqui e agora." — Santo Inácio de Loyola
              </p>
            </div>

            <TimerButton timer={timer} label="Imaginar por 3 minutos" defaultDuration={180} />
          </div>
        );
      }

      if (step.id === 'sentidos') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
              <p className="text-sm text-ens-text font-medium">
                Agora use os <strong>cinco sentidos da alma</strong>
              </p>
              <p className="text-xs text-ens-text-light mt-1">
                Mergulhe mais fundo na cena. Deus te espera lá dentro.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">👁️</div>
                  <div>
                    <p className="text-sm font-medium text-ens-blue">Ver</p>
                    <p className="text-xs text-ens-text">O que vejo? Os rostos, as cores, os gestos de Jesus...</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xl">👂</div>
                  <div>
                    <p className="text-sm font-medium text-ens-blue">Ouvir</p>
                    <p className="text-xs text-ens-text">O que ouço? As palavras de Jesus, o tom de voz, os sons ao redor...</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xl">🫁</div>
                  <div>
                    <p className="text-sm font-medium text-ens-blue">Sentir</p>
                    <p className="text-xs text-ens-text">O que sinto no corpo? O vento, o cheiro do pão, o calor do sol...</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xl">💗</div>
                  <div>
                    <p className="text-sm font-medium text-ens-blue">Experimentar</p>
                    <p className="text-xs text-ens-text">O que acontece no meu coração? Paz, alegria, consolação, inquietação?</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                Santo Inácio chama atenção para os "movimentos interiores": consolação (paz, alegria,
                proximidade de Deus) e desolação (tristeza, inquietude, distância). Ambos são
                matéria de oração.
              </p>
            </div>

            <TimerButton timer={timer} label="Contemplar por 3 minutos" defaultDuration={180} />
          </div>
        );
      }

      if (step.id === 'coloquio') {
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-ens-text text-sm leading-relaxed">
                Agora <strong className="text-ens-blue">converse pessoalmente com Jesus</strong>.
              </p>
              <p className="text-ens-text-light text-sm mt-2">
                Fale com Ele como um amigo fala com outro amigo,
                ou como um filho fala com o Pai.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">No Colóquio, você pode:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🗣️ Contar a Jesus o que <strong>sentiu</strong> durante a contemplação</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">❓ Fazer <strong>perguntas</strong> a Ele — "Senhor, o que queres de mim?"</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙏 <strong>Pedir graças</strong> para seu casamento, filhos, equipe</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🤲 <strong>Oferecer</strong> seu dia, suas lutas, seu amor conjugal</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "O colóquio se faz propriamente como um amigo fala a outro,
                ou como um servo ao seu senhor: ora pedindo alguma graça,
                ora acusando-se de algum mal feito, ora comunicando suas coisas
                e pedindo conselho sobre elas."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— Santo Inácio, Exercícios Espirituais §54</p>
            </div>

            <TimerButton timer={timer} label="Colóquio de 3 minutos" defaultDuration={180} />
          </div>
        );
      }
    }

    // ─── MEDITAÇÃO SALESIANA steps ─────────────────
    if (selectedMethod === 'salesiana') {
      if (step.id === 'consideracoes') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-1">O que são as Considerações?</h3>
              <p className="text-xs text-ens-text-light leading-relaxed">
                São Francisco de Sales ensina: tome cada ponto do texto e reflita
                <strong> com calma</strong>. Não precisa refletir sobre tudo — se um
                ponto toca seu coração, fique nele. "Como as abelhas que não
                passam de flor em flor, mas se demoram onde encontram mel."
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Considere ponto a ponto:</h3>
              <div className="space-y-3">
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">1️⃣ <strong>Quem</strong> está falando ou agindo neste texto? O que faz ou diz?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">2️⃣ <strong>Por quê?</strong> Qual a intenção, o ensinamento por trás?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">3️⃣ <strong>Para mim</strong> — como isso se aplica à minha vida hoje?</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">4️⃣ <strong>Para o meu casal</strong> — o que isso diz sobre o meu amor conjugal?</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Não vos apresseis. Se encontrardes suficiente matéria, sabor e consolação
                numa das considerações, detende-vos aí sem passar adiante,
                fazendo como as abelhas, que não deixam a flor enquanto encontram mel."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— São Francisco de Sales, Vida Devota II,6</p>
            </div>

            <TimerButton timer={timer} label="Considerar por 3 minutos" defaultDuration={180} />
          </div>
        );
      }

      if (step.id === 'afetos') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4">
              <h3 className="font-semibold text-ens-blue text-sm mb-1">Afetos e Resoluções</h3>
              <p className="text-xs text-ens-text leading-relaxed">
                São Francisco de Sales distingue: os <strong>afetos</strong> são os sentimentos santos
                que surgem da meditação. As <strong>resoluções</strong> são decisões concretas
                para hoje. Sem resolução, a meditação fica no ar.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Que afetos surgiram?</h3>
              <div className="space-y-2">
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">💝 Amor a Deus — desejo de agradá-Lo, servi-Lo</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">😢 Arrependimento — reconhecer onde falhei</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🔥 Desejo — de ser melhor esposo(a), pai/mãe, equipista</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙏 Confiança — entregar a Deus o que não consigo resolver</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-5 border border-ens-blue/20">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">⚡ Minha Resolução Concreta:</h3>
              <p className="text-xs text-ens-text mb-3">
                Tome uma decisão <strong>específica, prática e realizável hoje</strong>. Exemplos:
              </p>
              <div className="space-y-2 text-xs text-ens-text-light">
                <p>• "Hoje vou dizer ao meu cônjuge algo que admiro nele(a)"</p>
                <p>• "Vou perdoar aquela mágoa que carrego"</p>
                <p>• "Vou servir em algo concreto sem que me peçam"</p>
                <p>• "Não vou reclamar, mesmo quando tiver razão"</p>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "A meditação sem resolução é como uma nuvem sem chuva.
                Tome resoluções particulares e concretas, não gerais e vagas."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— São Francisco de Sales</p>
            </div>
          </div>
        );
      }

      if (step.id === 'ramalhete') {
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💐</div>
              <h3 className="font-semibold text-ens-blue text-base">O Ramalhete Espiritual</h3>
              <p className="text-sm text-ens-text mt-2 leading-relaxed">
                São Francisco de Sales inventou esta prática bela:
                ao final da oração, escolha <strong>uma frase, uma palavra,
                uma imagem</strong> da meditação e leve-a consigo o dia todo.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-ens-text text-sm leading-relaxed text-center">
                Como quem colhe um ramalhete de flores num jardim
                e o leva para perfumar a casa, leve esta palavra
                para perfumar as horas do seu dia.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3 text-center">Como usar o Ramalhete:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🌅 <strong>De manhã</strong> — repita a frase ao começar o dia</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🕐 <strong>Ao longo do dia</strong> — nas pausas, no trânsito, na espera</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">💑 <strong>Com seu cônjuge</strong> — partilhe a frase na oração conjugal</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-ens-text">🌙 <strong>À noite</strong> — recorde a frase antes de dormir</p>
                </div>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text italic">
                "Quem passeou por um belo jardim não sai de bom grado sem levar
                quatro ou cinco flores para cheirá-las e conservá-las o resto do dia.
                Assim, devemos colher, ao sair da meditação, um ou dois pontos
                que mais nos tocaram, para recordá-los durante o dia."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— São Francisco de Sales, Vida Devota II,7</p>
            </div>

            <TimerButton timer={timer} label="Silêncio de 1 minuto" defaultDuration={60} />
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      {/* Header with progress */}
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/')} className="text-white/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-white/70 text-xs">
              <span>{method?.emoji} {step?.title}</span>
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
            <p className="text-sm text-ens-text-light mt-1">{step?.subtitle}</p>
          </div>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      {step?.id !== 'envio' && (
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
