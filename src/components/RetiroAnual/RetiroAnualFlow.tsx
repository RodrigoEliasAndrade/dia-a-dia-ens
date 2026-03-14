import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { format } from 'date-fns';
import type { RetiroAnualData } from '../../types';

/**
 * RETIRO ANUAL — 5.o Ponto Concreto de Esforço
 *
 * ENS Teaching: O Retiro Anual é um tempo forte de encontro com Deus,
 * consigo mesmo e com o cônjuge. É o "deserto" — um espaço de silêncio
 * e recolhimento para escutar Deus com profundidade.
 *
 * Padre Caffarel insistia: "O retiro é o momento em que paramos
 * para deixar Deus refazer o que a correria do ano desfez."
 *
 * O retiro pode ser:
 * - Com toda a equipe (mais comum)
 * - Retiro de casal (fim de semana a dois)
 * - Retiro pessoal (individual)
 *
 * Esta ferramenta ajuda antes, durante e depois do retiro.
 */

const steps = [
  {
    id: 'intro',
    emoji: '⛰️',
    title: 'O Retiro Anual',
    subtitle: 'Por que é tão importante?',
  },
  {
    id: 'exame',
    emoji: '🔍',
    title: 'Exame do Ano',
    subtitle: 'Olhar para trás com gratidão e verdade',
  },
  {
    id: 'preparacao',
    emoji: '🙏',
    title: 'Preparação Interior',
    subtitle: 'Abrir o coração para o que Deus quer dizer',
  },
  {
    id: 'gracas',
    emoji: '✨',
    title: 'Graças e Frutos',
    subtitle: 'O que Deus fez por nós este ano',
  },
  {
    id: 'compromissos',
    emoji: '📜',
    title: 'Compromissos do Ano',
    subtitle: 'O que levo do retiro para a vida',
  },
];

interface ExameArea {
  emoji: string;
  title: string;
  prompts: string[];
}

const exameAreas: ExameArea[] = [
  {
    emoji: '💑',
    title: 'Nosso Amor Conjugal',
    prompts: [
      'Como está o nosso diálogo? Conversamos de verdade ou apenas sobre logística?',
      'Demonstrei amor ao meu cônjuge com gestos concretos?',
      'Perdoei de coração? Há mágoas que ainda carrego?',
      'Nossos momentos a dois foram prioridade ou ficaram para depois?',
    ],
  },
  {
    emoji: '🙏',
    title: 'Minha Vida de Oração',
    prompts: [
      'Fui fiel à oração pessoal diária?',
      'A oração conjugal aconteceu com regularidade?',
      'Frequentei os sacramentos (Missa, Confissão)?',
      'Senti Deus próximo ou distante este ano? Por quê?',
    ],
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Nossa Família',
    prompts: [
      'Como está a minha relação com cada filho?',
      'Transmitimos a fé de forma viva e alegre?',
      'Nossas relações familiares (pais, sogros, irmãos) estão em paz?',
      'O que precisa de cura, perdão ou atenção na nossa família?',
    ],
  },
  {
    emoji: '🤝',
    title: 'Nossa Equipe ENS',
    prompts: [
      'Participamos das reuniões com fidelidade e entrega?',
      'Partilhamos de verdade ou ficamos na superfície?',
      'Ajudamos algum casal da equipe que precisava?',
      'O que a equipe representou para nós este ano?',
    ],
  },
  {
    emoji: '🌍',
    title: 'Nosso Serviço ao Mundo',
    prompts: [
      'Servimos alguém além do nosso círculo?',
      'Fomos generosos com nosso tempo, dons e recursos?',
      'Somos sinal de esperança no nosso ambiente?',
      'Onde Deus nos chama a servir no próximo ano?',
    ],
  },
];

const defaultData: RetiroAnualData = {
  lastCompleted: '',
  yearCompleted: false,
  notes: '',
};

export default function RetiroAnualFlow() {
  const navigate = useNavigate();
  const [, setData] = useLocalStorage<RetiroAnualData>('ens-retiro-anual', defaultData);
  const [currentStep, setCurrentStep] = useState(0);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>('ens-retiro-anual-notes', {});
  const [saved, setSaved] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setData({
      lastCompleted: today,
      yearCompleted: true,
      notes: JSON.stringify(notes),
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
                O <strong>Retiro Anual</strong> é um dos compromissos fundamentais de todo equipista ENS.
                É o "deserto" — um tempo de parar, silenciar e
                deixar Deus falar ao coração com profundidade.
              </p>
              <p className="text-sm text-ens-text leading-relaxed mt-3">
                Jesus mesmo se retirava para rezar sozinho (Lc 5,16).
                O retiro é <strong>imitar Cristo</strong> neste gesto essencial.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">O Retiro pode ser:</h3>
              <div className="space-y-2">
                <div className="bg-ens-cream rounded-lg p-3 flex items-start gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="text-sm font-medium text-ens-text">Com a Equipe</p>
                    <p className="text-xs text-ens-text-light">Retiro de fim de semana com toda a equipe — o mais tradicional</p>
                  </div>
                </div>
                <div className="bg-ens-cream rounded-lg p-3 flex items-start gap-2">
                  <span className="text-lg">💑</span>
                  <div>
                    <p className="text-sm font-medium text-ens-text">Retiro de Casal</p>
                    <p className="text-xs text-ens-text-light">Um fim de semana só do casal, em recolhimento e oração</p>
                  </div>
                </div>
                <div className="bg-ens-cream rounded-lg p-3 flex items-start gap-2">
                  <span className="text-lg">🧘</span>
                  <div>
                    <p className="text-sm font-medium text-ens-text">Retiro Pessoal</p>
                    <p className="text-xs text-ens-text-light">Um dia ou mais de silêncio e oração individual</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Esta ferramenta te ajuda a:</h3>
              <div className="space-y-2 text-sm text-ens-text">
                <p>🔍 Fazer um <strong>exame do ano</strong> que passou</p>
                <p>🙏 <strong>Preparar o coração</strong> para o retiro</p>
                <p>✨ Registrar as <strong>graças recebidas</strong></p>
                <p>📜 Definir <strong>compromissos</strong> para o próximo ano</p>
              </div>
            </div>

            <div className="bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
              <p className="text-xs text-ens-text italic">
                "O retiro é o momento em que paramos para deixar Deus
                refazer o que a correria do ano desfez. Sem o retiro,
                a vida espiritual se torna superficial — como um rio
                sem nascente, que seca na primeira estiagem."
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
              <h3 className="font-semibold text-ens-blue text-sm mb-3">Semanas antes do retiro:</h3>
              <div className="space-y-3">
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">🙏 <strong>Intensifique a oração</strong> — Peça ao Espírito Santo que prepare seu coração</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">✝️ <strong>Confesse-se</strong> — Chegue ao retiro com o coração limpo</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">📵 <strong>Prepare o silêncio</strong> — Planeje desligar do ruído (redes, notícias)</p>
                </div>
                <div className="bg-ens-cream rounded-lg p-3">
                  <p className="text-sm text-ens-text">💑 <strong>Converse com seu cônjuge</strong> — Que graças vocês querem pedir juntos?</p>
                </div>
              </div>
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
                <strong>Depois do retiro</strong> (ou durante), registre o que Deus
                fez por você. O que tocou seu coração? Que graças recebeu?
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
            {/* Summary of notes */}
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
                <div className="bg-ens-cream rounded-lg p-3">
                  <label className="text-sm font-medium text-ens-blue block mb-2">
                    🙏 Na minha vida de oração:
                  </label>
                  <textarea
                    value={notes['comp-oracao'] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, 'comp-oracao': e.target.value }))}
                    placeholder="Ex: Ser fiel à oração pessoal diária de 15 min..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                  />
                </div>

                <div className="bg-ens-cream rounded-lg p-3">
                  <label className="text-sm font-medium text-ens-blue block mb-2">
                    💑 No meu casamento:
                  </label>
                  <textarea
                    value={notes['comp-casamento'] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, 'comp-casamento': e.target.value }))}
                    placeholder="Ex: Ouvir mais, reclamar menos, ter um encontro semanal..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                  />
                </div>

                <div className="bg-ens-cream rounded-lg p-3">
                  <label className="text-sm font-medium text-ens-blue block mb-2">
                    👨‍👩‍👧‍👦 Na minha família:
                  </label>
                  <textarea
                    value={notes['comp-familia'] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, 'comp-familia': e.target.value }))}
                    placeholder="Ex: Estar mais presente, jantar juntos, orar em família..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                  />
                </div>

                <div className="bg-ens-cream rounded-lg p-3">
                  <label className="text-sm font-medium text-ens-blue block mb-2">
                    🌍 No meu serviço ao mundo:
                  </label>
                  <textarea
                    value={notes['comp-servico'] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, 'comp-servico': e.target.value }))}
                    placeholder="Ex: Participar de uma obra social, visitar doentes..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
                  />
                </div>
              </div>
            </div>

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
