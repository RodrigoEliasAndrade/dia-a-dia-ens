import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Archive, Check } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RegraDeVidaData, RegraDeVidaCommitment } from '../../types';

/**
 * REGRA DE VIDA — Habit Tracking + ENS Guidance + History
 *
 * ENS Teaching: A Regra de Vida é o compromisso pessoal que cada equipista
 * assume diante de Deus para crescer em santidade.
 *
 * Science: 66 days average to form a habit (UCL/Lally 2010).
 * 3 phases: 🌱 Início (1-30d), 🌿 Crescimento (31-66d), 🌳 Firmeza (67+)
 */

// ─── Commitment Areas ────────────────────────────────

interface CommitmentArea {
  id: string;
  emoji: string;
  title: string;
  description: string;
  suggestions: string[];
}

const commitmentAreas: CommitmentArea[] = [
  {
    id: 'oracao',
    emoji: '🙏',
    title: 'Oração',
    description: 'Meu encontro diário com Deus',
    suggestions: [
      'Rezar 10 minutos diários em silêncio',
      'Fazer Lectio Divina pelo menos 3x por semana',
      'Rezar o Terço diariamente',
      'Oração do Angelus ao meio-dia',
    ],
  },
  {
    id: 'palavra',
    emoji: '📖',
    title: 'Palavra de Deus',
    description: 'Alimento espiritual',
    suggestions: [
      'Ler o Evangelho do dia todas as manhãs',
      'Estudar um livro da Bíblia por mês',
      'Memorizar um versículo por semana',
      'Participar de um grupo de partilha bíblica',
    ],
  },
  {
    id: 'sacramentos',
    emoji: '⛪',
    title: 'Sacramentos',
    description: 'Encontro com Cristo nos sacramentos',
    suggestions: [
      'Missa dominical sem faltar',
      'Confissão mensal',
      'Comunhão em dia de semana quando possível',
      'Adoração ao Santíssimo semanal',
    ],
  },
  {
    id: 'caridade',
    emoji: '❤️',
    title: 'Caridade',
    description: 'Amor ao próximo em ação',
    suggestions: [
      'Realizar um gesto de caridade semanal',
      'Visitar um doente ou idoso por mês',
      'Contribuir com uma obra social',
      'Servir na paróquia ou comunidade',
    ],
  },
  {
    id: 'ascese',
    emoji: '⚖️',
    title: 'Ascese',
    description: 'Renúncia que liberta para amar',
    suggestions: [
      'Jejuar uma vez por semana',
      'Limitar tempo de telas/redes sociais',
      'Praticar o silêncio por 15 min diários',
      'Renunciar a uma queixa por dia',
    ],
  },
  {
    id: 'estudo',
    emoji: '📚',
    title: 'Estudo da Fé',
    description: 'Conhecer para amar mais',
    suggestions: [
      'Ler um livro espiritual por mês',
      'Estudar o Catecismo 15 min por semana',
      'Ler documentos do Papa ou da Igreja',
      'Estudar a carta de fundação das ENS',
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────

const HABIT_DAYS = 66;

function getPhase(daysPracticed: number) {
  if (daysPracticed < 30) return { emoji: '🌱', label: 'Início', color: 'text-green-600', bg: 'bg-green-50' };
  if (daysPracticed < 66) return { emoji: '🌿', label: 'Crescimento', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  return { emoji: '🌳', label: 'Firmeza', color: 'text-green-800', bg: 'bg-green-100' };
}

function getAreaEmoji(areaId: string): string {
  return commitmentAreas.find(a => a.id === areaId)?.emoji ?? '✨';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Default Data ────────────────────────────────────

const defaultData: RegraDeVidaData = {
  lastCompleted: '',
  commitments: [],
  history: [],
};

// ─── Component ───────────────────────────────────────

export default function RegraDeVidaFlow() {
  const navigate = useNavigate();
  const [data, setData] = useLocalStorage<RegraDeVidaData>('ens-regra-vida', defaultData);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0=area, 1=commitment, 2=prayer
  const [selectedArea, setSelectedArea] = useState('');
  const [commitmentText, setCommitmentText] = useState('');
  const [showGuidance, setShowGuidance] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeCommitments = (data.commitments ?? []).filter(c => c.status === 'active');
  const hasActive = activeCommitments.length > 0;

  // ─── Check-in Handler ──────────────────────────────

  const handleCheckIn = (commitmentId: string) => {
    setData(prev => ({
      ...prev,
      lastCompleted: today,
      commitments: (prev.commitments ?? []).map(c =>
        c.id === commitmentId && !c.completedDays.includes(today)
          ? { ...c, completedDays: [...c.completedDays, today] }
          : c
      ),
    }));
  };

  // ─── Archive Handler ───────────────────────────────

  const handleArchive = (commitmentId: string) => {
    const commitment = (data.commitments ?? []).find(c => c.id === commitmentId);
    if (!commitment) return;
    setData(prev => ({
      ...prev,
      commitments: (prev.commitments ?? []).filter(c => c.id !== commitmentId),
      history: [...(prev.history ?? []), {
        commitmentText: commitment.text,
        area: commitment.area,
        startDate: commitment.createdAt,
        endDate: today,
        totalDays: commitment.completedDays.length,
        status: commitment.completedDays.length >= HABIT_DAYS ? 'completed' as const : 'archived' as const,
      }],
    }));
    setConfirmArchive(null);
  };

  // ─── Save New Commitment ───────────────────────────

  const handleSaveCommitment = () => {
    if (!commitmentText.trim()) return;
    const newCommitment: RegraDeVidaCommitment = {
      id: generateId(),
      text: commitmentText.trim(),
      area: selectedArea || 'custom',
      createdAt: today,
      completedDays: [],
      status: 'active',
    };
    setData(prev => ({
      ...prev,
      commitments: [...(prev.commitments ?? []), newCommitment],
    }));
    // Reset setup state
    setShowSetup(false);
    setSetupStep(0);
    setSelectedArea('');
    setCommitmentText('');
  };

  // ─── Setup Wizard ──────────────────────────────────

  if (showSetup) {
    const area = commitmentAreas.find(a => a.id === selectedArea);

    return (
      <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-ens-blue px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowSetup(false); setSetupStep(0); setSelectedArea(''); setCommitmentText(''); }} className="text-white/70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-white/70 text-xs">
                <span>Nova Regra de Vida</span>
                <span>{setupStep + 1}/3</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                <div className="bg-ens-gold h-1.5 rounded-full transition-all duration-500" style={{ width: `${((setupStep + 1) / 3) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto pb-28">
          {/* Step 0: Choose Area */}
          {setupStep === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">📖</div>
                <h2 className="text-xl font-bold text-ens-blue">Escolha uma Área</h2>
                <p className="text-sm text-ens-text-light mt-1">Em que área deseja crescer?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {commitmentAreas.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedArea(a.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedArea === a.id
                        ? 'bg-ens-blue text-white shadow-md'
                        : 'bg-ens-cream border border-gray-200 text-ens-text hover:bg-ens-blue/5'
                    }`}
                  >
                    <div className="text-2xl mb-1">{a.emoji}</div>
                    <p className="text-xs font-semibold">{a.title}</p>
                    <p className={`text-[0.625rem] mt-0.5 ${selectedArea === a.id ? 'text-white/70' : 'text-ens-text-light'}`}>{a.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Write Commitment */}
          {setupStep === 1 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">{area?.emoji ?? '✍️'}</div>
                <h2 className="text-xl font-bold text-ens-blue">{area?.title ?? 'Meu Compromisso'}</h2>
                <p className="text-sm text-ens-text-light mt-1">Seja concreto(a) e realista</p>
              </div>

              <div className="bg-ens-blue/5 rounded-xl p-4 mb-4">
                <p className="text-xs text-ens-text italic">
                  "Melhor pouco e fiel do que muito e frustrado.
                  Comece com um passo pequeno — Deus faz o resto."
                </p>
              </div>

              {/* Suggestions */}
              {area && (
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs font-semibold text-ens-blue mb-2">Sugestões:</p>
                  {area.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setCommitmentText(s)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                        commitmentText === s
                          ? 'bg-ens-blue text-white'
                          : 'bg-ens-cream text-ens-text hover:bg-ens-blue/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={commitmentText && !(area?.suggestions.includes(commitmentText)) ? commitmentText : ''}
                onChange={e => setCommitmentText(e.target.value)}
                placeholder="Ou escreva seu próprio compromisso..."
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
              />
            </div>
          )}

          {/* Step 2: Prayer + Save */}
          {setupStep === 2 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">🕊️</div>
                <h2 className="text-xl font-bold text-ens-blue">Consagração</h2>
                <p className="text-sm text-ens-text-light mt-1">Entregar nas mãos de Deus</p>
              </div>

              {/* Preview */}
              <div className="bg-ens-cream rounded-xl p-4 mb-5 border border-gray-200">
                <p className="text-xs font-semibold text-ens-blue mb-1">Meu compromisso:</p>
                <div className="flex items-start gap-2">
                  <span>{getAreaEmoji(selectedArea)}</span>
                  <p className="text-sm text-ens-text font-medium">{commitmentText}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
                <p className="text-sm text-ens-text italic leading-relaxed text-center">
                  "Senhor, este é o meu compromisso diante de Ti.
                  Sei que sozinho(a) não consigo — mas com a Tua graça, tudo posso.
                  Ajuda-me a ser fiel, não por obrigação, mas por amor. Amém."
                </p>
              </div>

              <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
                <p className="text-xs text-ens-text">
                  <strong>66 dias</strong> — é o tempo médio para formar um novo hábito.
                  Acompanhe seu progresso diariamente. Cada dia conta!
                </p>
              </div>

              <button
                onClick={handleSaveCommitment}
                className="w-full mt-5 py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
              >
                Assumir minha Regra de Vida
              </button>
            </div>
          )}
        </div>

        {/* Bottom nav for setup (steps 0 and 1) */}
        {setupStep < 2 && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              {setupStep > 0 && (
                <button
                  onClick={() => setSetupStep(prev => prev - 1)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-ens-blue text-ens-blue font-semibold transition-all active:scale-[0.97]"
                >
                  Voltar
                </button>
              )}
              <button
                onClick={() => setSetupStep(prev => prev + 1)}
                disabled={setupStep === 0 && !selectedArea || setupStep === 1 && !commitmentText.trim()}
                className="flex-1 py-3.5 rounded-xl bg-ens-blue text-white font-semibold shadow-lg transition-all active:scale-[0.97] disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Dashboard / First Visit ───────────────────────

  return (
    <div className="min-h-dvh bg-ens-cream flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-ens-blue px-4 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Regra de Vida</h1>
            <p className="text-white/60 text-xs">Compromisso pessoal de crescimento</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto pb-24 space-y-4">
        {/* Caffarel Guidance (collapsible) */}
        <div className="bg-ens-blue/5 rounded-xl border-l-4 border-ens-blue overflow-hidden">
          <button
            onClick={() => setShowGuidance(!showGuidance)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <span className="text-sm font-semibold text-ens-blue">O que ensina a espiritualidade ENS</span>
            </div>
            <span className="text-ens-blue text-xs">{showGuidance ? '▲' : '▼'}</span>
          </button>
          {showGuidance && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-ens-text leading-relaxed">
                A <strong>Regra de Vida</strong> é o programa pessoal de crescimento espiritual
                que cada equipista assume, livremente, diante de Deus. Não é uma lista de obrigações —
                é um <strong>caminho de amor</strong>.
              </p>
              <p className="text-xs text-ens-text leading-relaxed">
                É <strong>pessoal</strong> (cada cônjuge tem a sua) e abrange 6 áreas:
                oração, Palavra de Deus, sacramentos, caridade, ascese e estudo da fé.
              </p>
              <p className="text-xs text-ens-text italic">
                "A mística e a regra não podem ser separadas — a mística inspira a regra;
                a regra protege e fortalece a mística."
              </p>
              <p className="text-xs text-ens-text-light text-right">— Padre Henri Caffarel</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-ens-text">
                  <strong>Base científica:</strong> Estudos mostram que são necessários em média
                  <strong> 66 dias</strong> para formar um novo hábito. Acompanhe seu progresso
                  diariamente — cada dia conta, e falhar um dia não zera o progresso!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* No Active Commitments — First Time */}
        {!hasActive && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <h2 className="text-lg font-bold text-ens-blue mb-2">Comece sua Regra de Vida</h2>
            <p className="text-sm text-ens-text-light mb-5 leading-relaxed">
              Escolha um compromisso concreto para crescer em santidade.
              Comece pequeno — Deus faz o resto.
            </p>
            <button
              onClick={() => setShowSetup(true)}
              className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
            >
              Começar
            </button>
          </div>
        )}

        {/* Active Commitments */}
        {hasActive && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ens-blue">Meus Compromissos</h2>
              <span className="text-xs text-ens-text-light">{activeCommitments.length} {activeCommitments.length === 1 ? 'ativo' : 'ativos'}</span>
            </div>

            {activeCommitments.map(commitment => {
              const daysPracticed = commitment.completedDays.length;
              const phase = getPhase(daysPracticed);
              const progress = Math.min((daysPracticed / HABIT_DAYS) * 100, 100);
              const doneToday = commitment.completedDays.includes(today);
              const justCompleted66 = daysPracticed === HABIT_DAYS;

              return (
                <div key={commitment.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  {/* Celebration banner at 66 days */}
                  {justCompleted66 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-center">
                      <p className="text-sm font-semibold text-green-800">
                        🌳 Parabéns! Este hábito já faz parte de você!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        66 dias de fidelidade. Continue ou arquive para começar um novo.
                      </p>
                    </div>
                  )}

                  {/* Commitment header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-xl shrink-0">{getAreaEmoji(commitment.area)}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ens-text leading-snug">{commitment.text}</p>
                        <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium ${phase.bg} ${phase.color}`}>
                          <span>{phase.emoji}</span>
                          <span>{phase.label}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmArchive(confirmArchive === commitment.id ? null : commitment.id)}
                      className="text-gray-300 hover:text-gray-500 p-1 shrink-0"
                      title="Arquivar"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Archive confirmation */}
                  {confirmArchive === commitment.id && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-amber-800 mb-2">Arquivar este compromisso? Ele irá para o histórico.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleArchive(commitment.id)}
                          className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium"
                        >
                          Sim, arquivar
                        </button>
                        <button
                          onClick={() => setConfirmArchive(null)}
                          className="flex-1 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-ens-text"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center justify-between text-xs text-ens-text-light mb-1.5">
                    <span>{daysPracticed}/{HABIT_DAYS} dias</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        daysPracticed >= HABIT_DAYS ? 'bg-green-500' : 'bg-ens-gold'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Check-in button */}
                  {doneToday ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Feito hoje</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(commitment.id)}
                      className="w-full py-2.5 rounded-xl bg-ens-blue text-white font-semibold text-sm shadow transition-all active:scale-[0.98]"
                    >
                      Pratiquei hoje
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add new commitment button */}
            <button
              onClick={() => setShowSetup(true)}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-ens-blue/30 text-ens-blue font-medium text-sm flex items-center justify-center gap-2 hover:bg-ens-blue/5 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nova Regra de Vida
            </button>
          </>
        )}

        {/* History */}
        {(data.history ?? []).length > 0 && (
          <div className="mt-2">
            <h2 className="text-sm font-bold text-ens-blue mb-3">Histórico</h2>
            <div className="space-y-2">
              {(data.history ?? []).map((entry, i) => {
                const startFormatted = (() => {
                  try { return format(new Date(entry.startDate), "MMM yyyy", { locale: ptBR }); }
                  catch { return entry.startDate; }
                })();
                const endFormatted = (() => {
                  try { return format(new Date(entry.endDate), "MMM yyyy", { locale: ptBR }); }
                  catch { return entry.endDate; }
                })();

                return (
                  <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                    <span className="text-lg shrink-0">{getAreaEmoji(entry.area)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ens-text font-medium">{entry.commitmentText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[0.625rem] font-medium px-1.5 py-0.5 rounded-full ${
                          entry.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.status === 'completed' ? '🌳 Completado' : 'Arquivado'}
                        </span>
                        <span className="text-[0.625rem] text-ens-text-light">
                          {entry.totalDays} dias
                        </span>
                      </div>
                      <p className="text-[0.625rem] text-ens-text-light mt-0.5 capitalize">
                        {startFormatted} — {endFormatted}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly review reminder */}
        <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
          <p className="text-xs text-ens-text italic">
            Revise sua Regra de Vida todo mês, no Dever de Sentar-se.
            Ela é um compromisso vivo — pode ser ajustada conforme você cresce.
          </p>
        </div>
      </div>
    </div>
  );
}
