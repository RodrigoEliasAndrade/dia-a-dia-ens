import { useNavigate } from 'react-router-dom';

const PCES = [
  { id: 'oracao-pessoal', num: 1, title: 'Oração Pessoal Diária', emoji: '🙏', desc: 'Encontro pessoal com Deus, todos os dias' },
  { id: 'oracao-conjugal', num: 2, title: 'Oração Conjugal Diária', emoji: '💑', desc: 'Oração do casal, frente a frente' },
  { id: 'dever-sentar', num: 3, title: 'Dever de Sentar-se Mensal', emoji: '📋', desc: 'Balanço mensal da vida conjugal' },
  { id: 'regra-vida', num: 4, title: 'Regra de Vida', emoji: '📖', desc: 'Compromissos de crescimento espiritual' },
  { id: 'retiro-anual', num: 5, title: 'Retiro Anual', emoji: '⛰️', desc: 'Tempo forte de encontro com Deus' },
];

export default function PCEsPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Pontos Concretos de Esforço</h1>
      <p className="text-ens-text-light text-sm">
        Os PCEs são os compromissos práticos que cada casal assume para crescer na fé e no amor.
        São o coração da espiritualidade ENS. Toque em cada um para saber mais.
      </p>
      <div className="mt-6 space-y-4">
        {PCES.map(pce => (
          <button
            key={pce.id}
            onClick={() => navigate(`/pces/${pce.id}`)}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">{pce.emoji}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-ens-blue">{pce.num}. {pce.title}</h3>
              <p className="text-sm text-ens-text-light mt-0.5">{pce.desc}</p>
            </div>
            <span className="text-ens-text-light text-lg">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
