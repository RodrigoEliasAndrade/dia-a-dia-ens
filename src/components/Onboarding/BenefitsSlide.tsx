import { ArrowRight } from 'lucide-react';

interface SlideProps {
  onNext: () => void;
}

const pces = [
  { emoji: '🙏', title: 'Oração Pessoal Diária', desc: 'Encontro pessoal com Deus' },
  { emoji: '💑', title: 'Oração Conjugal Diária', desc: 'Orar juntos como casal' },
  { emoji: '📋', title: 'Dever de Sentar-se', desc: 'Balanço mensal da vida a dois' },
  { emoji: '📖', title: 'Regra de Vida', desc: 'Compromissos de crescimento' },
  { emoji: '⛰️', title: 'Retiro Anual', desc: 'Tempo forte com Deus' },
];

export default function BenefitsSlide({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      {/* Title */}
      <h2 className="text-xl font-bold text-ens-blue mb-2">
        Os Pontos Concretos de Esforço
      </h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        Tudo o que você precisa para viver os PCEs no dia a dia
      </p>

      {/* PCE cards */}
      <div className="w-full max-w-sm space-y-2.5 mb-8">
        {pces.map(pce => (
          <div
            key={pce.title}
            className="bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3 text-left"
          >
            <span className="text-2xl">{pce.emoji}</span>
            <div>
              <h3 className="font-semibold text-ens-blue text-sm">{pce.title}</h3>
              <p className="text-xs text-ens-text-light">{pce.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="flex gap-4 mb-8 text-center">
        <div>
          <div className="text-2xl mb-1">📅</div>
          <p className="text-xs text-ens-text-light">Acompanhe<br />seu progresso</p>
        </div>
        <div>
          <div className="text-2xl mb-1">🔗</div>
          <p className="text-xs text-ens-text-light">Sincronize<br />com seu cônjuge</p>
        </div>
        <div>
          <div className="text-2xl mb-1">📖</div>
          <p className="text-xs text-ens-text-light">Evangelho<br />do dia</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="px-8 py-3.5 rounded-xl bg-ens-blue text-white font-semibold flex items-center gap-2
          transition-all active:scale-[0.97] shadow-lg"
      >
        Criar minha conta
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
