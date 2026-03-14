import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import type { DeverSentarData } from '../../types';

/**
 * DEVER DE SENTAR-SE — Diálogo Conjugal Mensal
 *
 * ENS Teaching: O Dever de Sentar-se é um dos pilares mais originais da
 * espiritualidade ENS. Padre Caffarel o descreveu como o momento em que
 * o casal "faz a verdade" sobre sua vida conjugal, diante de Deus.
 *
 * Não é uma reunião de negócios. É um momento SAGRADO de transparência
 * e vulnerabilidade mútua, onde marido e esposa se olham com os olhos
 * de Deus e escolhem crescer juntos.
 *
 * Regras:
 * - Sem TV, celular, filhos (se possível)
 * - Cada um fala sem ser interrompido
 * - Não é hora de cobrar, mas de compreender
 * - Começa e termina com oração
 */

const dialogueSteps = [
  {
    id: 'opening',
    emoji: '🕯️',
    title: 'Oração Inicial',
    subtitle: 'Colocar o encontro nas mãos de Deus',
  },
  {
    id: 'us',
    emoji: '💑',
    title: 'Nosso Amor',
    subtitle: 'Como está o nosso relacionamento?',
  },
  {
    id: 'prayer-life',
    emoji: '🙏',
    title: 'Nossa Vida de Oração',
    subtitle: 'Oração pessoal, conjugal e sacramental',
  },
  {
    id: 'family',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Nossa Família',
    subtitle: 'Filhos, educação, vida doméstica',
  },
  {
    id: 'world',
    emoji: '🌍',
    title: 'Nós no Mundo',
    subtitle: 'Trabalho, finanças, serviço, comunidade',
  },
  {
    id: 'pces',
    emoji: '📋',
    title: 'Nossos PCEs',
    subtitle: 'Como vivemos os pontos concretos este mês?',
  },
  {
    id: 'decisions',
    emoji: '🤝',
    title: 'Decisões e Compromissos',
    subtitle: 'O que levaremos para o próximo mês',
  },
  {
    id: 'closing',
    emoji: '✨',
    title: 'Oração Final',
    subtitle: 'Agradecer e abençoar',
  },
];

const defaultData: DeverSentarData = {
  lastCompleted: '',
  scheduledDay: 15,
  completions: [],
};

export default function DeverSentarFlow() {
  const navigate = useNavigate();
  const [, setData] = useLocalStorage<DeverSentarData>('ens-dever-sentar', defaultData);
  const [currentStep, setCurrentStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const step = dialogueSteps[currentStep];
  const progress = ((currentStep + 1) / dialogueSteps.length) * 100;

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setData(prev => ({
      ...prev,
      lastCompleted: today,
      completions: [...prev.completions, { date: today, notes: notes || undefined }],
    }));
    setSaved(true);
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'opening':
        return (
          <div className="space-y-5">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text">
                Sentem-se juntos, num lugar tranquilo.<br />
                Desliguem os telefones.<br />
                Este momento é de vocês dois e de Deus.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-ens-text italic leading-relaxed text-center">
                "Senhor, estamos aqui diante de Ti.
                Ajuda-nos a nos olhar com os Teus olhos.
                Dá-nos a coragem de sermos verdadeiros
                e a ternura de acolher o que o outro disser.
                Que este encontro nos aproxime de Ti e um do outro. Amém."
              </p>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                💡 Padre Caffarel: "O Dever de Sentar-se é o momento em que o casal
                faz a verdade sobre a sua vida, sem medo, porque sabe que Deus está ali."
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 text-center mb-2">Regras deste momento:</p>
              <div className="space-y-1.5 text-sm text-red-700">
                <p>❌ Não é hora de cobrar ou acusar</p>
                <p>❌ Não interrompa quando o outro fala</p>
                <p>✅ Fale na primeira pessoa: "Eu sinto...", "Eu percebo..."</p>
                <p>✅ Escute com o coração aberto</p>
              </div>
            </div>
          </div>
        );

      case 'us':
        return (
          <div className="space-y-4">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Conversem sobre:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">💬 Como nos sentimos um com o outro este mês?</p>
                  <p className="text-xs text-ens-text-light mt-1">Houve momentos de carinho? De distanciamento?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">⏰ Tivemos tempo de qualidade juntos?</p>
                  <p className="text-xs text-ens-text-light mt-1">Conversas profundas, passeios, intimidade?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🙏 O que posso fazer para amar melhor você no próximo mês?</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-ens-text-light italic">
              Cada um fala por vez. O outro apenas escuta com o coração.
            </p>
          </div>
        );

      case 'prayer-life':
        return (
          <div className="space-y-4">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Avaliem juntos:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">📖 Oração pessoal: Tenho reservado tempo diário para Deus?</p>
                  <p className="text-xs text-ens-text-light mt-1">Leitura da Palavra, silêncio, Lectio Divina</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">💑 Oração conjugal: Estamos rezando juntos com frequência?</p>
                  <p className="text-xs text-ens-text-light mt-1">É um encontro verdadeiro ou apenas rotina?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">⛪ Sacramentos: Missa dominical? Confissão?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🕊️ Sinto Deus presente no nosso dia a dia?</p>
                </div>
              </div>
            </div>
            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-gold">
              <p className="text-xs text-ens-text italic">
                "A vida de oração é como a respiração do casal cristão.
                Quando para de rezar, o amor começa a sufocar."
              </p>
            </div>
          </div>
        );

      case 'family':
        return (
          <div className="space-y-4">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Falem sobre:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">👧👦 Como estão os filhos? Cada um deles?</p>
                  <p className="text-xs text-ens-text-light mt-1">Escola, amizades, fé, comportamento, alegrias</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🏠 Nosso lar é um lugar de paz e acolhida?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">📚 Estamos educando na fé? Como?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">👴👵 Pais idosos, família estendida — alguma preocupação?</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'world':
        return (
          <div className="space-y-4">
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Reflitam juntos:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">💼 Trabalho: Estamos em equilíbrio? Alguém sobrecarregado?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">💰 Finanças: Estamos vivendo com responsabilidade e generosidade?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🤲 Servimos alguém este mês? Caridade, voluntariado?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🤝 Nossa equipe ENS — como estamos participando?</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pces':
        return (
          <div className="space-y-4">
            <div className="bg-ens-gold/10 border border-ens-gold/30 rounded-xl p-4 text-center">
              <p className="text-sm text-ens-text font-medium">
                Os PCEs são o termômetro da nossa vida espiritual como casal ENS
              </p>
            </div>
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🙏 <strong>Oração pessoal:</strong> Cada um tem rezado diariamente?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">💑 <strong>Oração conjugal:</strong> Quantas vezes rezamos juntos este mês?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">📋 <strong>Dever de Sentar-se:</strong> Fizemos no mês passado?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">📖 <strong>Regra de Vida:</strong> Estamos vivendo nossos compromissos?</p>
                </div>
              </div>
            </div>
            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text-light italic">
                Não se trata de contar números, mas de avaliar com sinceridade:
                estes compromissos estão nos aproximando de Deus e um do outro?
              </p>
            </div>
          </div>
        );

      case 'decisions':
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-ens-text">
                Com base no que conversaram, tomem <strong>decisões concretas</strong> para o próximo mês.
              </p>
            </div>
            <div className="bg-ens-cream rounded-xl p-5 border border-gray-200">
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">📅 Que compromisso prático podemos assumir juntos?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">❤️ Que gesto de amor cada um vai cultivar?</p>
                </div>
                <div className="bg-white rounded-lg p-3.5">
                  <p className="text-sm text-ens-text">🗓️ Quando será o nosso próximo Dever de Sentar-se?</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-ens-blue text-sm mb-2">📝 Anotem as decisões:</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Decisões, compromissos, observações do casal..."
                className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
                rows={4}
                disabled={saved}
              />
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-ens-text italic leading-relaxed text-center">
                "Senhor, obrigado por este momento de verdade entre nós.
                Ajuda-nos a viver o que decidimos.
                Abençoa o nosso lar, os nossos filhos e a nossa equipe.
                Que o Teu amor seja a base do nosso amor.
                Maria, Rainha das Equipes, rogai por nós. Amém."
              </p>
            </div>

            <p className="text-center text-sm text-ens-text-light">
              Abracem-se em silêncio por um momento 💑
            </p>

            <div className="border-t border-gray-200 pt-5">
              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg transition-all active:scale-[0.97]"
                >
                  ✅ Registrar Dever de Sentar-se
                </button>
              ) : (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">💑</div>
                  <p className="text-green-600 font-semibold">Registrado com amor!</p>
                  <p className="text-xs text-ens-text-light mt-1">
                    Que Deus abençoe as decisões que tomaram juntos.
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
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, dialogueSteps.length - 1))}
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
