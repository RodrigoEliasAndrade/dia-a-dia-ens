import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format, parseISO, differenceInDays, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RetiroAnualData, RetiroAnualEntry } from '../../types';

/**
 * RETIRO ANUAL — 5.o Ponto Concreto de Esforço
 *
 * 3 modes:
 * 1. Schedule — pick a date, see countdown, view prep tips
 * 2. Journal — guided 5-step flow for during/after the retreat
 * 3. Review — see completed retreat + history
 */

// ─── Journal Steps ───────────────────────────────────
const journalSteps = [
  { id: 'intro', emoji: '⛰️', title: 'O Retiro Anual', subtitle: 'Por que é tão importante?' },
  { id: 'exame', emoji: '🔍', title: 'Exame do Ano', subtitle: 'Olhar para trás com gratidão e verdade' },
  { id: 'preparacao', emoji: '🙏', title: 'Preparação Interior', subtitle: 'Abrir o coração para o que Deus quer dizer' },
  { id: 'gracas', emoji: '✨', title: 'Graças e Frutos', subtitle: 'O que Deus fez por nós este ano' },
  { id: 'compromissos', emoji: '📜', title: 'Compromissos do Ano', subtitle: 'O que levo do retiro para a vida' },
];

const exameAreas = [
  {
    emoji: '💑', title: 'Nosso Amor Conjugal',
    prompts: [
      'Como está o nosso diálogo? Conversamos de verdade ou apenas sobre logística?',
      'Demonstrei amor ao meu cônjuge com gestos concretos?',
      'Perdoei de coração? Há mágoas que ainda carrego?',
      'Nossos momentos a dois foram prioridade ou ficaram para depois?',
    ],
  },
  {
    emoji: '🙏', title: 'Minha Vida de Oração',
    prompts: [
      'Fui fiel à oração pessoal diária?',
      'A oração conjugal aconteceu com regularidade?',
      'Frequentei os sacramentos (Missa, Confissão)?',
      'Senti Deus próximo ou distante este ano? Por quê?',
    ],
  },
  {
    emoji: '👨‍👩‍👧‍👦', title: 'Nossa Família',
    prompts: [
      'Como está a minha relação com cada filho?',
      'Transmitimos a fé de forma viva e alegre?',
      'Nossas relações familiares (pais, sogros, irmãos) estão em paz?',
      'O que precisa de cura, perdão ou atenção na nossa família?',
    ],
  },
  {
    emoji: '🤝', title: 'Nossa Equipe ENS',
    prompts: [
      'Participamos das reuniões com fidelidade e entrega?',
      'Partilhamos de verdade ou ficamos na superfície?',
      'Ajudamos algum casal da equipe que precisava?',
      'O que a equipe representou para nós este ano?',
    ],
  },
  {
    emoji: '🌍', title: 'Nosso Serviço ao Mundo',
    prompts: [
      'Servimos alguém além do nosso círculo?',
      'Fomos generosos com nosso tempo, dons e recursos?',
      'Somos sinal de esperança no nosso ambiente?',
      'Onde Deus nos chama a servir no próximo ano?',
    ],
  },
];

const defaultData: RetiroAnualData = {
  scheduledDate: '',
  completedRetreats: [],
};

// ─── Data migration from old format ─────────────────
function migrateData(raw: RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string }): RetiroAnualData {
  if (Array.isArray(raw.completedRetreats)) return raw;

  const migrated: RetiroAnualData = { scheduledDate: '', completedRetreats: [] };

  if (raw.lastCompleted) {
    let oldNotes: Record<string, string> = {};
    try {
      const stored = localStorage.getItem('ens-retiro-anual-notes');
      if (stored) oldNotes = JSON.parse(stored);
    } catch { /* ignore */ }

    migrated.completedRetreats.push({
      date: raw.lastCompleted,
      completedAt: raw.lastCompleted,
      notes: oldNotes,
    });
  }

  return migrated;
}

type Mode = 'schedule' | 'journal' | 'review';

export default function RetiroAnualFlow() {
  const navigate = useNavigate();
  const [rawData, setData] = useLocalStorage<RetiroAnualData>('ens-retiro-anual', defaultData);
  const data = migrateData(rawData as RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string });
  if (data !== rawData) setData(data);

  const [mode, setMode] = useState<Mode>('schedule');
  const [currentStep, setCurrentStep] = useState(0);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>('ens-retiro-anual-notes', {});
  const [saved, setSaved] = useState(false);
  const [dateInput, setDateInput] = useState(data.scheduledDate || '');
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const hasScheduled = data.scheduledDate !== '';
  const scheduledDate = hasScheduled ? parseISO(data.scheduledDate) : null;
  const isRetreatToday = scheduledDate ? isToday(scheduledDate) : false;
  const isRetreatFuture = scheduledDate ? isFuture(scheduledDate) : false;
  const daysUntil = scheduledDate ? differenceInDays(scheduledDate, new Date()) : 0;
  const currentYear = new Date().getFullYear().toString();
  const completedThisYear = data.completedRetreats.some(r => r.completedAt.startsWith(currentYear));

  // ─── Schedule Date ──────────────────────────────────
  const handleSchedule = () => {
    if (!dateInput) return;
    setData(prev => ({ ...migrateData(prev as RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string }), scheduledDate: dateInput }));
  };

  const handleClearDate = () => {
    setDateInput('');
    setData(prev => ({ ...migrateData(prev as RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string }), scheduledDate: '' }));
  };

  // ─── Save Retreat ───────────────────────────────────
  const handleSave = () => {
    const entry: RetiroAnualEntry = {
      date: data.scheduledDate || today,
      completedAt: today,
      notes: { ...notes },
    };
    setData(prev => ({
      scheduledDate: '',
      completedRetreats: [...(migrateData(prev as RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string }).completedRetreats), entry],
    }));
    setNotes({});
    setSaved(true);
  };

  // ─── SCHEDULE MODE ──────────────────────────────────
  if (mode === 'schedule') {
    return (
      <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
        <div className="bg-ens-blue px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white/70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Retiro Anual</h1>
              <p className="text-white/60 text-xs">Tempo forte com Deus</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 overflow-y-auto pb-28 space-y-5">
          {/* Countdown or Schedule */}
          {hasScheduled && (isRetreatFuture || isRetreatToday) ? (
            <div className={`bg-white rounded-2xl shadow-md p-6 text-center ${isRetreatToday ? 'ring-2 ring-ens-gold' : ''}`}>
              {isRetreatToday ? (
                <>
                  <div className="text-5xl mb-3">🙏</div>
                  <h2 className="text-xl font-bold text-ens-blue">Hoje é o dia do seu Retiro!</h2>
                  <p className="text-sm text-ens-text-light mt-2">
                    Que o Espírito Santo guie cada momento deste encontro com Deus.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">⛰️</div>
                  <div className="text-4xl font-bold text-ens-blue mb-1">{daysUntil}</div>
                  <p className="text-sm text-ens-text-light">
                    {daysUntil === 1 ? 'dia' : 'dias'} para o Retiro Anual
                  </p>
                  <p className="text-xs text-ens-gold font-medium mt-2">
                    {format(scheduledDate!, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleClearDate}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-ens-text-light font-medium text-sm"
                >
                  Alterar Data
                </button>
                <button
                  onClick={() => { setMode('journal'); setCurrentStep(0); setSaved(false); }}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-[0.97] ${
                    isRetreatToday
                      ? 'bg-ens-gold text-white animate-pulse-glow'
                      : 'bg-ens-blue text-white'
                  }`}
                >
                  {isRetreatToday ? 'Começar Retiro' : 'Iniciar Retiro Agora'}
                </button>
              </div>
            </div>
          ) : completedThisYear ? (
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-ens-blue">Retiro Concluído!</h2>
              <p className="text-sm text-ens-text-light mt-2">
                Você já fez seu Retiro Anual em {currentYear}. Que as graças recebidas frutifiquem o ano todo.
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => {
                    setDateInput('');
                    setData(prev => ({ ...migrateData(prev as RetiroAnualData & { yearCompleted?: boolean; lastCompleted?: string }), scheduledDate: '' }));
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-ens-blue text-ens-blue font-medium text-sm"
                >
                  Agendar Próximo
                </button>
                <button
                  onClick={() => { setMode('journal'); setCurrentStep(0); setSaved(false); }}
                  className="flex-1 py-3 rounded-xl bg-ens-blue text-white font-semibold text-sm"
                >
                  Novo Retiro
                </button>
              </div>
            </div>
          ) : (
            /* No date set — show intro + date picker */
            <>
              <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5">
                <p className="text-sm text-ens-text leading-relaxed">
                  O <strong>Retiro Anual</strong> é um dos compromissos fundamentais de todo equipista ENS.
                  É o "deserto" — um tempo de parar, silenciar e
                  deixar Deus falar ao coração com profundidade.
                </p>
                <p className="text-sm text-ens-text leading-relaxed mt-3">
                  Jesus mesmo se retirava para rezar sozinho (Lc 5,16).
                  O retiro é <strong>imitar Cristo</strong> neste gesto essencial.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-ens-blue" />
                  <h3 className="font-semibold text-ens-blue">Agendar meu Retiro</h3>
                </div>
                <p className="text-xs text-ens-text-light mb-4">
                  Quando será o seu próximo retiro? Definir uma data ajuda a se comprometer.
                </p>
                <input
                  type="date"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  min={today}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-ens-cream text-sm text-ens-text focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
                />
                <button
                  onClick={handleSchedule}
                  disabled={!dateInput}
                  className="w-full mt-4 py-3.5 rounded-xl bg-ens-blue text-white font-semibold shadow-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
                >
                  Confirmar Data
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-ens-blue text-sm mb-3">O Retiro pode ser:</h3>
                <div className="space-y-2">
                  {[
                    { emoji: '👥', title: 'Com a Equipe', desc: 'Retiro de fim de semana com toda a equipe — o mais tradicional' },
                    { emoji: '💑', title: 'Retiro de Casal', desc: 'Um fim de semana só do casal, em recolhimento e oração' },
                    { emoji: '🧘', title: 'Retiro Pessoal', desc: 'Um dia ou mais de silêncio e oração individual' },
                  ].map(item => (
                    <div key={item.title} className="bg-ens-cream rounded-lg p-3 flex items-start gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-ens-text">{item.title}</p>
                        <p className="text-xs text-ens-text-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Prep tips (when date is in the future) */}
          {hasScheduled && isRetreatFuture && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Semanas antes do retiro:</h3>
              <div className="space-y-3">
                {[
                  { emoji: '🙏', text: 'Intensifique a oração — Peça ao Espírito Santo que prepare seu coração' },
                  { emoji: '✝️', text: 'Confesse-se — Chegue ao retiro com o coração limpo' },
                  { emoji: '📵', text: 'Prepare o silêncio — Planeje desligar do ruído (redes, notícias)' },
                  { emoji: '💑', text: 'Converse com seu cônjuge — Que graças vocês querem pedir juntos?' },
                ].map(tip => (
                  <div key={tip.emoji} className="bg-ens-cream rounded-lg p-3">
                    <p className="text-sm text-ens-text">{tip.emoji} <strong>{tip.text.split(' — ')[0]}</strong> — {tip.text.split(' — ')[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caffarel Quote */}
          <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
            <p className="text-xs text-ens-text italic">
              "O retiro é o momento em que paramos para deixar Deus
              refazer o que a correria do ano desfez. Sem o retiro,
              a vida espiritual se torna superficial — como um rio
              sem nascente, que seca na primeira estiagem."
            </p>
            <p className="text-xs text-ens-text-light mt-1 text-right">— Padre Henri Caffarel</p>
          </div>

          {/* History */}
          {data.completedRetreats.length > 0 && (
            <div>
              <h3 className="font-bold text-ens-blue text-sm mb-3">Retiros Anteriores</h3>
              <div className="space-y-3">
                {[...data.completedRetreats].reverse().map((retreat, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedHistory(expandedHistory === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⛰️</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-ens-blue">
                            {format(parseISO(retreat.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-ens-text-light">
                            {Object.values(retreat.notes).filter(v => v.trim()).length} reflexões registradas
                          </p>
                        </div>
                      </div>
                      {expandedHistory === idx ? (
                        <ChevronUp className="w-4 h-4 text-ens-text-light" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ens-text-light" />
                      )}
                    </button>

                    {expandedHistory === idx && (
                      <div className="px-4 pb-4 space-y-3">
                        {Object.entries(retreat.notes)
                          .filter(([, v]) => v.trim())
                          .map(([key, value]) => (
                            <div key={key} className="bg-ens-cream rounded-lg p-3">
                              <p className="text-xs font-medium text-ens-blue mb-1 capitalize">
                                {key.replace(/-/g, ' ').replace(/^(exame|comp) /, (_, p) => p === 'exame' ? 'Exame: ' : 'Compromisso: ')}
                              </p>
                              <p className="text-xs text-ens-text leading-relaxed whitespace-pre-line">{value}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── JOURNAL MODE ───────────────────────────────────
  const step = journalSteps[currentStep];
  const progress = ((currentStep + 1) / journalSteps.length) * 100;

  const renderJournalStep = () => {
    switch (step.id) {
      case 'intro':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5">
              <p className="text-sm text-ens-text leading-relaxed">
                Bem-vindo ao seu Retiro! Este é um momento sagrado.
                Respire fundo, silencie o coração, e deixe Deus conduzir.
              </p>
              <p className="text-sm text-ens-text leading-relaxed mt-3">
                Nas próximas etapas, você vai olhar para o ano que passou,
                registrar as graças recebidas e definir compromissos para o futuro.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Esta ferramenta te ajuda a:</h3>
              <div className="space-y-2 text-sm text-ens-text">
                <p>🔍 Fazer um <strong>exame do ano</strong> que passou</p>
                <p>🙏 <strong>Preparar o coração</strong> para ouvir Deus</p>
                <p>✨ Registrar as <strong>graças recebidas</strong></p>
                <p>📜 Definir <strong>compromissos</strong> para o próximo ano</p>
                <p>📝 Escrever <strong>notas livres</strong> para guardar</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Balanço do Ano</h3>
              <p className="text-xs text-ens-text-light mb-3">
                Antes de mergulhar nos detalhes, como você resumiria este ano espiritualmente?
              </p>
              <textarea
                value={notes['balanco-ano'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'balanco-ano': e.target.value }))}
                placeholder="Este ano foi um ano de..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 bg-ens-cream text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text italic">
                "O retiro é o momento em que paramos para deixar Deus
                refazer o que a correria do ano desfez."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— Padre Henri Caffarel</p>
            </div>
          </div>
        );

      case 'exame':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text">
                Olhe para o ano que passou com <strong>gratidão</strong> pelo que foi bom
                e <strong>verdade</strong> sobre o que precisa mudar.
              </p>
              <p className="text-xs text-ens-text-light mt-2">
                Não se trata de se condenar, mas de reconhecer com humildade onde estamos.
              </p>
            </div>

            <div className="space-y-4">
              {exameAreas.map((area, idx) => (
                <div key={idx} className="bg-ens-cream rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{area.emoji}</span>
                    <h3 className="font-semibold text-ens-blue text-sm">{area.title}</h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    {area.prompts.map((prompt, i) => (
                      <p key={i} className="text-xs text-ens-text leading-relaxed pl-2 border-l-2 border-ens-gold/40">
                        {prompt}
                      </p>
                    ))}
                  </div>
                  <textarea
                    value={notes[`exame-${idx}`] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, [`exame-${idx}`]: e.target.value }))}
                    placeholder="Suas reflexões..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Examinai-vos a vós mesmos" (2Cor 13,5). O exame não é
                para se condenar, mas para ver com clareza onde Deus agiu
                e onde precisamos da Sua graça.
              </p>
            </div>
          </div>
        );

      case 'preparacao':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text leading-relaxed">
                <strong>Preparar-se</strong> para o retiro é tão importante
                quanto o retiro em si. Um coração aberto recebe mais.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Que graças quero pedir neste retiro?</h3>
              <textarea
                value={notes['gracas-pedidas'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'gracas-pedidas': e.target.value }))}
                placeholder="Ex: Quero pedir a graça de perdoar... de renovar meu amor... de ouvir o que Deus quer de mim..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 bg-ens-cream text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text italic">
                Santo Inácio de Loyola sempre começava os Exercícios Espirituais
                pedindo ao exercitante: "Peça a graça que deseja receber."
                Deus respeita nossa liberdade — Ele espera que peçamos.
              </p>
            </div>
          </div>
        );

      case 'gracas':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text leading-relaxed">
                Registre o que Deus fez por você. O que tocou seu coração? Que graças recebeu?
              </p>
              <p className="text-xs text-ens-text-light mt-2">
                Escrever ajuda a não esquecer. Muitos santos mantinham um diário espiritual.
              </p>
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">🌟 Momentos de Graça</h3>
              <p className="text-xs text-ens-text-light mb-3">
                Que momentos do retiro marcaram mais? Uma frase, um silêncio, uma lágrima, uma alegria...
              </p>
              <textarea
                value={notes['momentos-graca'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'momentos-graca': e.target.value }))}
                placeholder="Os momentos que mais me marcaram..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">💬 O que Deus me disse</h3>
              <p className="text-xs text-ens-text-light mb-3">
                Se pudesse resumir numa frase o que Deus falou ao seu coração...
              </p>
              <textarea
                value={notes['deus-disse'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'deus-disse': e.target.value }))}
                placeholder="Deus me disse que..."
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">💑 Nosso Casal no Retiro</h3>
              <p className="text-xs text-ens-text-light mb-3">
                O que o retiro trouxe para o seu casamento?
              </p>
              <textarea
                value={notes['casal-retiro'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'casal-retiro': e.target.value }))}
                placeholder="Para o nosso casal, o retiro significou..."
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "Guardava Maria todas estas coisas, meditando-as em seu coração" (Lc 2,19).
                Como Maria, guarde as graças que recebeu. Elas são tesouro para os dias difíceis.
              </p>
            </div>
          </div>
        );

      case 'compromissos':
        return (
          <div className="space-y-5">
            {Object.values(notes).some(v => v.trim()) && (
              <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-ens-text-light text-center mb-2">
                  Você tem reflexões registradas nos passos anteriores. Use-as para definir seus compromissos.
                </p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3 text-center">
                Meus Compromissos para o Próximo Ano
              </h3>
              <p className="text-xs text-ens-text-light mb-4 text-center">
                Seja concreto e realista. Compromissos vagos se perdem no vento.
              </p>

              <div className="space-y-4">
                {[
                  { key: 'comp-oracao', emoji: '🙏', label: 'Na minha vida de oração:', placeholder: 'Ex: Ser fiel à oração pessoal diária de 15 min...' },
                  { key: 'comp-casamento', emoji: '💑', label: 'No meu casamento:', placeholder: 'Ex: Ouvir mais, reclamar menos, ter um encontro semanal...' },
                  { key: 'comp-familia', emoji: '👨‍👩‍👧‍👦', label: 'Na minha família:', placeholder: 'Ex: Estar mais presente, jantar juntos, orar em família...' },
                  { key: 'comp-servico', emoji: '🌍', label: 'No meu serviço ao mundo:', placeholder: 'Ex: Participar de uma obra social, visitar doentes...' },
                ].map(item => (
                  <div key={item.key} className="bg-ens-cream rounded-lg p-3">
                    <label className="text-sm font-medium text-ens-blue block mb-2">
                      {item.emoji} {item.label}
                    </label>
                    <textarea
                      value={notes[item.key] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                      placeholder={item.placeholder}
                      rows={2}
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notas Livres */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">📝 Notas Livres</h3>
              <p className="text-xs text-ens-text-light mb-3">
                Qualquer coisa que queira guardar deste retiro — frases, intuições, desejos do coração...
              </p>
              <textarea
                value={notes['notas-livres'] || ''}
                onChange={e => setNotes(prev => ({ ...prev, 'notas-livres': e.target.value }))}
                placeholder="Escreva livremente..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 bg-ens-cream text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
              />
            </div>

            {/* Prayer + Save */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text italic leading-relaxed">
                "Senhor, Tu que me conheces mais do que eu mesmo,
                ajuda-me a viver estes compromissos não com as minhas forças,
                mas com a Tua graça. Que este ano seja um ano de fidelidade,
                de amor crescente e de santidade no meu estado de vida. Amém."
              </p>
            </div>

            <div className="border-t border-gray-200 pt-5">
              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
                >
                  ✅ Registrar meu Retiro Anual
                </button>
              ) : (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">⛰️</div>
                  <p className="text-green-600 font-semibold">Retiro registrado!</p>
                  <p className="text-xs text-ens-text-light mt-1">
                    Que as graças deste retiro frutifiquem o ano todo.
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
                Releia estes compromissos no Dever de Sentar-se de cada mês.
                O retiro não termina quando você sai — ele começa a dar fruto
                na fidelidade do dia a dia.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setMode('schedule')} className="text-white/70">
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

      <div className="flex-1 px-4 py-6 overflow-y-auto pb-28">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">{step.emoji}</div>
            <h2 className="text-xl font-bold text-ens-blue">{step.title}</h2>
            <p className="text-sm text-ens-text-light mt-1">{step.subtitle}</p>
          </div>
          {renderJournalStep()}
        </div>
      </div>

      {step.id !== 'compromissos' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 py-3.5 rounded-xl border-2 border-ens-blue text-ens-blue font-semibold transition-all active:scale-[0.97]"
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, journalSteps.length - 1))}
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
