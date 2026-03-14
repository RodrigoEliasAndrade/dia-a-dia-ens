import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import type { PCECard } from '../../types';

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
];

interface PCECardsProps {
  completedToday: Record<string, boolean>;
}

export default function PCECards({ completedToday }: PCECardsProps) {
  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    if (id === 'oracao-pessoal') {
      navigate('/oracao-pessoal');
    } else if (id === 'oracao-conjugal') {
      navigate('/oracao-conjugal');
    } else if (id === 'dever-sentar') {
      navigate('/dever-sentar');
    } else if (id === 'regra-vida') {
      navigate('/regra-vida');
    }
  };

  return (
    <div className="mx-4 mt-6 mb-4">
      <h2 className="text-lg font-bold text-ens-blue mb-3">
        Pontos Concretos de Esforço
      </h2>
      <div className="space-y-3">
        {pceCards.map(card => {
          const done = completedToday[card.id];
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl shadow-sm
                transition-all active:scale-[0.98]
                ${done ? 'bg-green-50 border border-green-200' : 'bg-white border border-transparent'}
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
          );
        })}
      </div>
    </div>
  );
}
