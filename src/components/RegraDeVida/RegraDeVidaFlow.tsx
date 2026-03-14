import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import type { RegraDeVidaData } from '../../types';

/**
 * REGRA DE VIDA — Compromisso Pessoal de Crescimento
 *
 * ENS Teaching: A Regra de Vida é o compromisso pessoal que cada equipista
 * assume diante de Deus para crescer em santidade. Não é um peso —
 * é um caminho concreto de amor.
 *
 * É pessoal (cada cônjuge tem a sua), mas partilhada na equipe.
 * Inclui áreas de: oração, Palavra, sacramentos, caridade,
 * ascese (renúncia), e estudo da fé.
 */

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

const steps = [
  { id: 'intro', emoji: '📖', title: 'O que é a Regra de Vida?', subtitle: 'Entender antes de se comprometer' },
  { id: 'review', emoji: '🔍', title: 'Examinar', subtitle: 'Onde estou hoje?' },
  { id: 'commit', emoji: '✍️', title: 'Meus Compromissos', subtitle: 'Escolher com liberdade e amor' },
  { id: 'closing', emoji: '🕊️', title: 'Consagração', subtitle: 'Entregar nas mãos de Deus' },
];

const defaultData: RegraDeVidaData = {
  lastCompleted: '',
  monthlyCompleted: false,
  notes: '',
};

export default function RegraDeVidaFlow() {
  const navigate = useNavigate();
  const [, setData] = useLocalStorage<RegraDeVidaData>('ens-regra-vida', defaultData);
  const [currentStep, setCurrentStep] = useState(0);
  const [commitments, setCommitments] = useLocalStorage<Record<string, string>>('ens-regra-vida-commitments', {});
  const [saved, setSaved] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setData({
      lastCompleted: today,
      monthlyCompleted: true,
      notes: JSON.stringify(commitments),
    });
    setSaved(true);
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'intro':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5">
              <p className="text-sm text-ens-text leading-relaxed">
                A <strong>Regra de Vida</strong> é o programa pessoal de crescimento espiritual
                que cada equipista assume, livremente, diante de Deus.
              </p>
              <p className="text-sm text-ens-text leading-relaxed mt-3">
                Não é uma lista de obrigações. É um <strong>caminho de amor</strong> — gestos concretos
                para se tornar mais parecido(a) com Cristo e amar melhor seu cônjuge.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">A Regra de Vida inclui 6 áreas:</h3>
              <div className="grid grid-cols-2 gap-2">
                {commitmentAreas.map(area => (
                  <div key={area.id} className="bg-ens-cream rounded-lg p-2.5 text-center">
                    <div className="text-xl">{area.emoji}</div>
                    <p className="text-xs font-medium text-ens-blue mt-1">{area.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text italic">
                "A Regra de Vida é pessoal. Cada cônjuge tem a sua.
                Mas ela é partilhada na equipe — porque crescer em santidade
                nunca é uma aventura solitária."
              </p>
              <p className="text-xs text-ens-text-light mt-1 text-right">— Espiritualidade ENS</p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text">
                Antes de assumir compromissos, faça um exame sincero.<br />
                <strong>Onde estou hoje em cada área?</strong>
              </p>
            </div>

            <div className="space-y-3">
              {commitmentAreas.map(area => (
                <div key={area.id} className="bg-ens-cream rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{area.emoji}</span>
                    <h3 className="font-semibold text-ens-blue text-sm">{area.title}</h3>
                  </div>
                  <p className="text-xs text-ens-text-light italic">{area.description}</p>
                  <p className="text-xs text-ens-text mt-2">
                    Como estou vivendo esta área? Estou crescendo ou estagnado(a)?
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-ens-text-light italic">
              Seja honesto(a) consigo mesmo(a). Deus não espera perfeição — espera desejo sincero.
            </p>
          </div>
        );

      case 'commit':
        return (
          <div className="space-y-5">
            <div className="bg-ens-blue/5 rounded-xl p-4 text-center">
              <p className="text-sm text-ens-blue font-medium">
                Escolha <strong>um compromisso concreto</strong> para cada área.
              </p>
              <p className="text-xs text-ens-text-light mt-1">
                Seja realista. Melhor pouco e fiel do que muito e frustrado.
              </p>
            </div>

            <div className="space-y-4">
              {commitmentAreas.map(area => (
                <div key={area.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{area.emoji}</span>
                    <h3 className="font-semibold text-ens-blue text-sm">{area.title}</h3>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1.5 mb-3">
                    {area.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setCommitments(prev => ({ ...prev, [area.id]: suggestion }))}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                          commitments[area.id] === suggestion
                            ? 'bg-ens-blue text-white'
                            : 'bg-ens-cream text-ens-text hover:bg-ens-blue/10'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <input
                    type="text"
                    value={commitments[area.id] && !area.suggestions.includes(commitments[area.id]) ? commitments[area.id] : ''}
                    onChange={e => setCommitments(prev => ({ ...prev, [area.id]: e.target.value }))}
                    placeholder="Ou escreva seu próprio compromisso..."
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-5">
            {/* Summary */}
            {Object.keys(commitments).length > 0 && (
              <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-ens-blue text-sm mb-3 text-center">Meus Compromissos:</h3>
                <div className="space-y-2">
                  {commitmentAreas.map(area => (
                    commitments[area.id] ? (
                      <div key={area.id} className="flex items-start gap-2 bg-white rounded-lg p-2.5">
                        <span className="text-sm">{area.emoji}</span>
                        <div>
                          <p className="text-xs font-medium text-ens-blue">{area.title}</p>
                          <p className="text-xs text-ens-text">{commitments[area.id]}</p>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-ens-text italic leading-relaxed text-center">
                "Senhor, estes são os meus compromissos diante de Ti.
                Sei que sozinho(a) não consigo — mas com a Tua graça, tudo posso.
                Ajuda-me a ser fiel, não por obrigação, mas por amor.
                Que cada gesto destes me aproxime de Ti,
                do meu cônjuge e dos que mais amo. Amém."
              </p>
            </div>

            <div className="border-t border-gray-200 pt-5">
              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
                >
                  ✅ Assumir minha Regra de Vida
                </button>
              ) : (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">🕊️</div>
                  <p className="text-green-600 font-semibold">Regra de Vida registrada!</p>
                  <p className="text-xs text-ens-text-light mt-1">
                    Que o Espírito Santo te dê a graça da fidelidade.
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
                Revise sua Regra de Vida todo mês, no Dever de Sentar-se.
                Ela é um compromisso vivo — pode ser ajustada conforme você cresce.
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
          <button onClick={() => navigate('/')} className="text-white/70">
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
          {renderStepContent()}
        </div>
      </div>

      {step.id !== 'closing' && (
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
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
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
