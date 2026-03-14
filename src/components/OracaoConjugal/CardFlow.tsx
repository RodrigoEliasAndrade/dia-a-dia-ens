import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SwipeableCard from '../shared/SwipeableCard';
import Card1_Wisdom from './Card1_Wisdom';
import Card2_Preparation from './Card2_Preparation';
import Card3_Welcome from './Card3_Welcome';
import Card4_WordOfGod from './Card4_WordOfGod';
import Card5_FaithSharing from './Card5_FaithSharing';
import Card6_Intercession from './Card6_Intercession';
import Card7_Blessing from './Card7_Blessing';
import Card8_Completion from './Card8_Completion';
import { useLiturgy } from '../../hooks/useLiturgy';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';
import wisdomDrops from '../../data/wisdomDrops.json';
import type { WisdomDrop } from '../../types';

const TOTAL_STEPS = 8;

export default function CardFlow() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const startTimeRef = useRef(Date.now());
  const { liturgy, loading, isFromFallback } = useLiturgy();
  const { conjugalData, completeConjugalPrayer } = usePrayerTracking();

  // Get today's wisdom based on day of year cycling through available drops
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const wisdomIndex = dayOfYear % wisdomDrops.length;
  const todayWisdom = wisdomDrops[wisdomIndex] as WisdomDrop;

  const next = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSave = (journalEntry?: string) => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
    completeConjugalPrayer({
      duration: Math.max(duration, 1),
      journalEntry,
      wisdomDay: todayWisdom.day,
    });
    setSaved(true);
  };

  const handleExit = () => {
    if (!saved && step > 1) {
      if (window.confirm('Tem certeza que deseja sair? O progresso não será salvo.')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const renderCard = () => {
    switch (step) {
      case 1:
        return <Card1_Wisdom wisdom={todayWisdom} />;
      case 2:
        return <Card2_Preparation />;
      case 3:
        return <Card3_Welcome />;
      case 4:
        return <Card4_WordOfGod liturgy={liturgy} loading={loading} isFromFallback={isFromFallback} />;
      case 5:
        return <Card5_FaithSharing />;
      case 6:
        return <Card6_Intercession />;
      case 7:
        return <Card7_Blessing />;
      case 8:
        return (
          <Card8_Completion
            duration={Math.round((Date.now() - startTimeRef.current) / 60000)}
            currentStreak={conjugalData.currentStreak}
            monthlyCount={conjugalData.monthlyCount}
            onSave={handleSave}
            saved={saved}
          />
        );
      default:
        return null;
    }
  };

  const titles = [
    { emoji: '💎', title: 'Sabedoria do Dia', subtitle: 'Reflexão e desafio' },
    { emoji: '🕯️', title: 'Preparação', subtitle: 'Ambiente de oração' },
    { emoji: '🙏', title: 'Acolhida de Deus', subtitle: 'Abrindo o coração' },
    { emoji: '📖', title: 'Palavra de Deus', subtitle: 'Escuta da Palavra de Deus — ENS' },
    { emoji: '💬', title: 'Partilha da Fé', subtitle: 'O coração da oração conjugal' },
    { emoji: '🕊️', title: 'Intercessão', subtitle: 'Oração de pedidos' },
    { emoji: '✨', title: 'Ação de Graças e Bênção', subtitle: 'Agradecimento e bênção mútua' },
    { emoji: '🎉', title: 'Oração Completada', subtitle: '' },
  ];

  const current = titles[step - 1];

  return (
    <div>
      {/* Back button */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-50">
        <button
          onClick={handleExit}
          className="absolute top-3 left-3 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <SwipeableCard
        step={step}
        totalSteps={TOTAL_STEPS}
        emoji={current.emoji}
        title={current.title}
        subtitle={current.subtitle}
        onNext={step < TOTAL_STEPS ? next : undefined}
        onPrev={step > 1 ? prev : undefined}
        showNext={step < TOTAL_STEPS}
        showPrev={step > 1}
        nextLabel={step === TOTAL_STEPS - 1 ? 'Finalizar' : 'Próximo'}
        prevLabel="Voltar"
      >
        {renderCard()}
      </SwipeableCard>

      {/* Home button on last step when saved */}
      {step === TOTAL_STEPS && saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-xl bg-ens-blue text-white font-semibold"
          >
            Voltar ao Início
          </button>
        </div>
      )}
    </div>
  );
}
