import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import type { PCECard, RegraDeVidaData } from '../../types';

const HABIT_DAYS = 66;

const pceCards: PCECard[] = [
  {
    id: 'oracao-pessoal',
    title: 'Oração Pessoal Diária',
    subtitle: 'Encontro pessoal com Deus',
    emoji: '🙏',
    frequency: 'Diária',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'oracao-conjugal',
    title: 'Oração Conjugal Diária',
    subtitle: 'Oração do casal frente a frente',
    emoji: '💑',
    frequency: 'Diária',
    color: 'from-ens-blue to-ens-blue-light',
  },
  {
    id: 'dever-sentar',
    title: 'Dever de Sentar-se',
    subtitle: 'Balanço mensal da vida conjugal',
    emoji: '📋',
    frequency: 'Mensal',
    color: 'from-amber-600 to-amber-700',
  },
  {
    id: 'regra-vida',
    title: 'Regra de Vida',
    subtitle: 'Compromissos de crescimento',
    emoji: '📖',
    frequency: 'Mensal',
    color: 'from-emerald-600 to-emerald-700',
  },
  {
    id: 'retiro-anual',
    title: 'Retiro Anual',
    subtitle: 'Tempo forte com Deus',
    emoji: '⛰️',
    frequency: 'Anual',
    color: 'from-purple-600 to-purple-700',
  },
];

function getPhaseEmoji(days: number): string {
  if (days < 30) return '🌱';
  if (days < 66) return '🌿';
  return '🌳';
}

interface PCECardsProps {
  completedToday: Record<string, boolean>;
}

export default function PCECards({ completedToday }: PCECardsProps) {
  const navigate = useNavigate();
  const [regraData, setRegraData] = useLocalStorage<RegraDeVidaData>('ens-regra-vida', {
    lastCompleted: '',
    commitments: [],
    history: [],
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeCommitments = (regraData.commitments ?? []).filter(c => c.status === 'active');

  const handleCheckIn = (e: React.MouseEvent, commitmentId: string) => {
    e.stopPropagation(); // Don't navigate to the flow
    setRegraData(prev => ({
      ...prev,
      lastCompleted: today,
      commitments: (prev.commitments ?? []).map(c =>
        c.id === commitmentId && !c.completedDays.includes(today)
          ? { ...c, completedDays: [...c.completedDays, today] }
          : c
      ),
    }));
  };

  const handleCardClick = (id: string) => {
    if (id === 'oracao-pessoal') navigate('/oracao-pessoal');
    else if (id === 'oracao-conjugal') navigate('/oracao-conjugal');
    else if (id === 'dever-sentar') navigate('/dever-sentar');
    else if (id === 'regra-vida') navigate('/regra-vida');
    else if (id === 'retiro-anual') navigate('/retiro-anual');
  };

  return (
    <div className="mx-4 mt-6 mb-4">
      <h2 className="text-lg font-bold text-ens-blue mb-3">
        Pontos Concretos de Esforço
      </h2>
      <div className="space-y-3">
        {pceCards.map(card => {
          const done = completedToday[card.id];
          const isRegra = card.id === 'regra-vida';

          return (
            <div key={card.id}>
              <button
                onClick={() => handleCardClick(card.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl shadow-sm
                  transition-all active:scale-[0.98]
                  ${done ? 'bg-green-50 border border-green-200' : 'bg-white border border-transparent'}
                  ${isRegra && activeCommitments.length > 0 ? 'rounded-b-none' : ''}
                `}
              >
                <div className="text-3xl">{card.emoji}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ens-text">{card.title}</span>
                    {done && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="text-sm text-ens-text-light">{card.subtitle}</span>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ens-blue/10 text-ens-blue font-medium">
                      {card.frequency}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ens-text-light" />
              </button>

              {/* Regra de Vida inline progress + check-in */}
              {isRegra && activeCommitments.length > 0 && (
                <div className={`bg-white border-t border-gray-100 rounded-b-2xl shadow-sm px-4 pb-3 pt-2 space-y-2.5 ${done ? 'bg-green-50 border-x border-b border-green-200' : ''}`}>
                  {activeCommitments.map(commitment => {
                    const daysPracticed = commitment.completedDays.length;
                    const progress = Math.min((daysPracticed / HABIT_DAYS) * 100, 100);
                    const doneToday = commitment.completedDays.includes(today);
                    const phase = getPhaseEmoji(daysPracticed);

                    return (
                      <div key={commitment.id} className="flex items-center gap-3">
                        {/* Progress info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[0.625rem]">{phase}</span>
                            <span className="text-xs text-ens-text font-medium truncate">{commitment.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${daysPracticed >= HABIT_DAYS ? 'bg-green-500' : 'bg-ens-gold'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[0.625rem] text-ens-text-light shrink-0">{daysPracticed}/{HABIT_DAYS}</span>
                          </div>
                        </div>

                        {/* Check-in button */}
                        {doneToday ? (
                          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700">
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[0.625rem] font-medium">Feito</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleCheckIn(e, commitment.id)}
                            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-ens-blue text-white text-[0.625rem] font-medium active:scale-95 transition-all"
                          >
                            Pratiquei
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
