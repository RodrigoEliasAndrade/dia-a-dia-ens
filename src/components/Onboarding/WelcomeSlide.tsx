import { Cross, ArrowRight } from 'lucide-react';

interface SlideProps {
  onNext: () => void;
}

export default function WelcomeSlide({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center animate-fade-in">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Cross className="w-8 h-8 text-ens-gold" />
        <h1 className="text-3xl font-bold text-ens-blue tracking-wide">ENS DIA A DIA</h1>
        <Cross className="w-8 h-8 text-ens-gold" />
      </div>

      {/* Illustration */}
      <div className="text-7xl mb-8">💑🙏</div>

      {/* Title */}
      <h2 className="text-xl font-bold text-ens-blue mb-4 leading-snug">
        Sua caminhada espiritual como casal, um dia de cada vez
      </h2>

      {/* Description */}
      <p className="text-sm text-ens-text-light leading-relaxed max-w-xs mb-3">
        As <strong className="text-ens-text">Equipes de Nossa Senhora</strong> são um
        movimento de espiritualidade conjugal fundado pelo Padre Henri Caffarel.
      </p>
      <p className="text-sm text-ens-text-light leading-relaxed max-w-xs">
        Este app ajuda você e seu cônjuge a viver os compromissos do
        movimento — juntos, todos os dias.
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-10 px-8 py-3.5 rounded-xl bg-ens-blue text-white font-semibold flex items-center gap-2
          transition-all active:scale-[0.97] shadow-lg"
      >
        Começar
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
