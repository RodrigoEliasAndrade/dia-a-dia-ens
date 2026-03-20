/**
 * PCE Content — Rich educational content for each Ponto Concreto de Esforço.
 *
 * Sources: ENS foundational documents, Padre Henri Caffarel's writings,
 * Carta das ENS, Catholic Church Catechism, Familiaris Consortio,
 * Amoris Laetitia, and the tradition of the saints.
 */

export interface PCEContentItem {
  text: string;
  highlight?: boolean; // Bold/emphasized item
  quote?: boolean;     // Italic quote style
  author?: string;     // For attributed quotes
}

export interface PCESection {
  title: string;
  emoji: string;
  items: PCEContentItem[];
}

export interface PCEContentData {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  flowRoute: string;
  ctaLabel: string;
  intro: string;
  sections: PCESection[];
}

export const pceContent: PCEContentData[] = [
  // ─── 1. ORAÇÃO PESSOAL DIÁRIA ─────────────────────
  {
    id: 'oracao-pessoal',
    title: 'Oração Pessoal Diária',
    emoji: '🙏',
    subtitle: 'Encontro pessoal com Deus',
    flowRoute: '/oracao-pessoal',
    ctaLabel: 'Iniciar Oração Pessoal',
    intro: 'A oração pessoal é o primeiro e mais fundamental PCE. É o encontro diário, íntimo e insubstituível com Deus — a raiz de onde brota toda a vida espiritual do equipista.',
    sections: [
      {
        title: 'O que é',
        emoji: '📖',
        items: [
          { text: 'Um encontro pessoal e diário com Deus, em silêncio e recolhimento.', highlight: true },
          { text: 'Não é apenas "rezar orações" — é estar com Deus, ouvir Sua voz, deixar-se transformar.' },
          { text: 'É o fundamento de toda a espiritualidade ENS. Sem oração pessoal, os outros PCEs perdem sua força.' },
          { text: 'Padre Caffarel a comparava ao encontro de dois que se amam: não se trata de falar muito, mas de estar presente.' },
        ],
      },
      {
        title: 'Como viver',
        emoji: '🎯',
        items: [
          { text: 'Escolha um horário fixo — de preferência pela manhã, quando a mente está fresca.', highlight: true },
          { text: 'Encontre um lugar tranquilo — pode ser um canto da casa, uma capela, ou qualquer espaço de silêncio.' },
          { text: 'Comece com o tempo que tiver disponível. A fidelidade importa mais que a duração.' },
          { text: 'Use a Palavra de Deus como ponto de partida — o Evangelho do dia é um excelente guia.' },
          { text: 'Métodos: Lectio Divina (leitura orante), Meditação Inaciana (imaginação), ou simplesmente ler e ficar em silêncio.' },
          { text: 'Termine anotando uma palavra ou frase que tocou seu coração — isso alimenta o Diário de Oração.' },
        ],
      },
      {
        title: 'Padre Caffarel ensina',
        emoji: '✝️',
        items: [
          { text: '"A oração pessoal é o encontro de amor entre a alma e Deus. Não se trata de dizer muitas palavras, mas de estar diante d\'Ele com o coração aberto."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Sem oração pessoal, a oração conjugal é vazia. Não podemos dar ao outro o que não temos."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"A fidelidade à oração diária é mais importante que a intensidade de uma oração ocasional. Deus espera por nós todos os dias."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: 'Caffarel insistia que a oração pessoal não é um luxo para "os mais devotos", mas uma necessidade vital para todo cristão que leva a sério seu batismo.' },
        ],
      },
      {
        title: 'A Igreja nos orienta',
        emoji: '⛪',
        items: [
          { text: '"A oração é a elevação da alma a Deus ou o pedido a Deus dos bens convenientes" (CIC 2559).', quote: true },
          { text: '"Orai sem cessar" (1Ts 5,17) — São Paulo nos convida a fazer da vida inteira uma oração.' },
          { text: '"A oração mental é um íntimo comércio de amizade, em que frequentemente se conversa a sós com Deus, de quem nos sabemos amados."', quote: true, author: 'Santa Teresa de Ávila' },
          { text: '"Dediquem meia hora por dia à oração mental e nunca a deixem, por mais que tenham trabalho."', quote: true, author: 'São Francisco de Sales' },
          { text: 'O Concílio Vaticano II reafirmou que todos os fiéis são chamados à santidade — e o caminho passa pela oração diária (Lumen Gentium, 40).' },
        ],
      },
      {
        title: 'Dicas práticas',
        emoji: '💡',
        items: [
          { text: 'Se não sabe por onde começar, use o Evangelho do dia — a app já traz para você.', highlight: true },
          { text: 'Coloque um alarme no celular como lembrete do seu horário de oração.' },
          { text: 'Nos dias difíceis, mesmo 5 minutos de silêncio diante de Deus valem mais do que nada.' },
          { text: 'Escreva no Diário de Oração o que Deus falou ao seu coração — releia nos dias secos.' },
          { text: 'Não desanime com distrações — elas fazem parte. Gentilmente volte a atenção para Deus.' },
          { text: 'Peça ao Espírito Santo antes de começar: "Vinde, Espírito Santo, ensinai-me a rezar."' },
        ],
      },
    ],
  },

  // ─── 2. ORAÇÃO CONJUGAL DIÁRIA ────────────────────
  {
    id: 'oracao-conjugal',
    title: 'Oração Conjugal Diária',
    emoji: '💑',
    subtitle: 'Oração do casal frente a frente',
    flowRoute: '/oracao-conjugal',
    ctaLabel: 'Iniciar Oração Conjugal',
    intro: 'A oração conjugal é o coração pulsante da espiritualidade ENS. É o momento em que o casal se coloca diante de Deus, lado a lado, e deixa o Senhor entrar no centro do seu amor.',
    sections: [
      {
        title: 'O que é',
        emoji: '📖',
        items: [
          { text: 'O casal rezando junto, frente a frente — não apenas "ao mesmo tempo", mas em verdadeira comunhão.', highlight: true },
          { text: 'É o Sacramento do Matrimônio tornando-se oração: Cristo presente no meio do casal.' },
          { text: '"Onde dois ou três estiverem reunidos em meu nome, ali estou eu no meio deles" (Mt 18,20) — isto vale especialmente para o casal.' },
          { text: 'Padre Caffarel dizia que é a oração mais poderosa que existe, porque é a oração do sacramento.' },
        ],
      },
      {
        title: 'Como viver',
        emoji: '🎯',
        items: [
          { text: 'Escolham um momento fixo — geralmente à noite, depois das crianças dormirem.', highlight: true },
          { text: 'Sentem-se frente a frente. Podem dar as mãos ou simplesmente estar próximos.' },
          { text: 'Leiam juntos um trecho do Evangelho — o do dia ou outro que escolherem.' },
          { text: 'Partilhem: "O que me tocou?" — cada um diz uma palavra ou frase que falou ao coração.' },
          { text: 'Rezem intenções: pelos filhos, pela família, pelos que sofrem, pela equipe.' },
          { text: 'Terminem com um Pai-Nosso, uma Ave-Maria, ou simplesmente em silêncio juntos.' },
          { text: 'Usem o tempo que tiverem. Não é o tempo que importa, é a fidelidade. O casal já estar junto em oração já é uma graça.' },
        ],
      },
      {
        title: 'Padre Caffarel ensina',
        emoji: '✝️',
        items: [
          { text: '"A oração conjugal não é um luxo, é oxigênio para o amor. Sem ela, o amor do casal sufoca lentamente."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"A oração conjugal é o respiro do amor. Não é um luxo, é oxigênio."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Quando o casal reza junto, algo de misterioso acontece: o amor humano é elevado, purificado, fortalecido pela presença de Cristo."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: 'Caffarel via na oração conjugal a expressão mais pura da vocação matrimonial — o casal como "igreja doméstica" em ato.' },
        ],
      },
      {
        title: 'A Igreja nos orienta',
        emoji: '⛪',
        items: [
          { text: '"A família cristã é o primeiro lugar de educação na oração" (CIC 2685).', quote: true },
          { text: '"Os esposos cristãos, em virtude do sacramento do matrimônio, significam e participam do mistério de unidade e de amor fecundo entre Cristo e a Igreja" (LG 11).', quote: true },
          { text: 'A Exortação Familiaris Consortio (1981) de São João Paulo II insiste na oração em família como sinal da presença de Deus no lar.' },
          { text: 'Papa Francisco em Amoris Laetitia: a oração do casal fortalece o vínculo e ajuda a superar as crises.' },
        ],
      },
      {
        title: 'Dicas práticas',
        emoji: '💡',
        items: [
          { text: 'Comecem hoje, mesmo que imperfeito. Não esperem o "momento ideal".', highlight: true },
          { text: 'Se um dos dois não se sente à vontade para rezar em voz alta, o outro pode conduzir.' },
          { text: 'Não usem este momento para discutir problemas — é hora de oração, não de reunião.' },
          { text: 'Se têm filhos pequenos, rezem depois que adormecerem. Se são maiores, incluam-nos às vezes.' },
          { text: 'Nos dias de briga, rezem mesmo assim. Aliás, especialmente nesses dias.' },
          { text: 'A app oferece 3 níveis (Semente, Crescimento, Plenitude) — comecem pelo mais simples.' },
        ],
      },
    ],
  },

  // ─── 3. DEVER DE SENTAR-SE ─────────────────────────
  {
    id: 'dever-sentar',
    title: 'Dever de Sentar-se',
    emoji: '📋',
    subtitle: 'Balanço mensal da vida conjugal',
    flowRoute: '/dever-sentar',
    ctaLabel: 'Iniciar Dever de Sentar-se',
    intro: 'O Dever de Sentar-se é o compromisso mensal do casal de parar, sentar-se frente a frente e fazer um balanço honesto e amoroso de como está a vida a dois, a família, a fé e o serviço.',
    sections: [
      {
        title: 'O que é',
        emoji: '📖',
        items: [
          { text: 'Um encontro mensal do casal para revisar juntos como estão vivendo sua vocação.', highlight: true },
          { text: 'Não é uma "reunião de condomínio" — é um momento de verdade, vulnerabilidade e amor.' },
          { text: 'Olham-se nos olhos e perguntam: como estamos? O que precisa mudar? O que devemos agradecer?' },
          { text: 'Padre Caffarel o chamava de "encontro privilegiado" — o momento em que o casal para de correr e se encontra de verdade.' },
        ],
      },
      {
        title: 'Como viver',
        emoji: '🎯',
        items: [
          { text: 'Marquem um dia fixo no mês (ex: dia 15). Tratem como compromisso sagrado.', highlight: true },
          { text: 'Reservem o tempo que tiverem, sem filhos, sem celular. O importante é sentar e conversar.' },
          { text: 'Comecem com uma breve oração pedindo a luz do Espírito Santo.' },
          { text: 'Revisem juntos: nosso amor conjugal, nossa oração, nossa família, nosso serviço.' },
          { text: 'Usem frases que começam com "Eu sinto..." em vez de "Você sempre...".' },
          { text: 'Terminem com gratidão: o que há de bom? Pelo que agradecemos?' },
          { text: 'Façam notas para relembrar no próximo mês.' },
        ],
      },
      {
        title: 'Padre Caffarel ensina',
        emoji: '✝️',
        items: [
          { text: '"O Dever de Sentar-se é um encontro privilegiado de verdade e de amor entre os esposos."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Sem este momento de parar e olhar-se com sinceridade, o casal corre o risco de viver lado a lado sem se encontrar de verdade."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Não tenham medo da verdade. Ela é o primeiro passo para a liberdade e para o amor verdadeiro."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: 'Caffarel insistia: mesmo quando tudo parece bem, o Dever de Sentar-se revela áreas que precisam de atenção antes que se tornem problemas.' },
        ],
      },
      {
        title: 'A Igreja nos orienta',
        emoji: '⛪',
        items: [
          { text: 'A Carta das Equipes de Nossa Senhora estabelece o Dever de Sentar-se como compromisso fundamental de todo casal equipista.' },
          { text: '"A comunicação sincera entre os esposos é essencial para a vida matrimonial" — tema constante no magistério sobre a família.' },
          { text: 'São João Paulo II em Familiaris Consortio: o diálogo conjugal é caminho de santificação mútua.' },
          { text: '"Sede sinceros uns com os outros" (Ef 4,25) — a verdade dita com amor constrói o casamento.' },
        ],
      },
      {
        title: 'Dicas práticas',
        emoji: '💡',
        items: [
          { text: 'Não pulem o Dever de Sentar-se mesmo quando "está tudo bem" — é quando mais se descobre.', highlight: true },
          { text: 'Saiam de casa se possível — um café, um parque, um lugar neutro ajuda o diálogo.' },
          { text: 'Ouçam mais do que falem. O silêncio atento é um ato de amor.' },
          { text: 'Celebrem as vitórias: o que melhorou desde o último mês?' },
          { text: 'Se um tema é muito difícil, anotem e peçam ajuda ao casal-piloto ou conselheiro espiritual.' },
          { text: 'A app oferece 3 níveis: Check-in rápido, Conversa Guiada e Revisão Completa.' },
        ],
      },
    ],
  },

  // ─── 4. REGRA DE VIDA ──────────────────────────────
  {
    id: 'regra-vida',
    title: 'Regra de Vida',
    emoji: '📖',
    subtitle: 'Compromissos de crescimento espiritual',
    flowRoute: '/regra-vida',
    ctaLabel: 'Gerenciar Regra de Vida',
    intro: 'A Regra de Vida é o programa pessoal e concreto de crescimento espiritual de cada equipista. São compromissos pequenos, precisos e realizáveis que nos ajudam a crescer na fé, no amor e no serviço.',
    sections: [
      {
        title: 'O que é',
        emoji: '📖',
        items: [
          { text: 'Um conjunto de compromissos pessoais, concretos e livres que cada equipista assume para crescer em santidade.', highlight: true },
          { text: 'É pessoal e individual — cada cônjuge tem a sua própria Regra de Vida.' },
          { text: 'Não é uma lista de proibições, mas um caminho positivo de crescimento.' },
          { text: 'Abrange 6 áreas: Oração, Palavra de Deus, Sacramentos, Caridade, Ascese e Estudo da Fé.' },
          { text: 'Deve ser revista mensalmente (no Dever de Sentar-se) e anualmente (no Retiro).' },
        ],
      },
      {
        title: 'Como viver',
        emoji: '🎯',
        items: [
          { text: 'Comece com poucos compromissos (1-3). Qualidade importa mais que quantidade.', highlight: true },
          { text: 'Seja concreto: "Rezar 15 min por dia" é melhor que "Rezar mais".' },
          { text: 'Escolha compromissos desafiadores mas realizáveis — nem fáceis demais, nem impossíveis.' },
          { text: 'A ciência mostra que são necessários cerca de 66 dias para formar um hábito. Seja paciente.' },
          { text: 'Acompanhe diariamente: marque quando cumpriu, sem se condenar quando falhar.' },
          { text: 'Revise no Dever de Sentar-se: está funcionando? Precisa ajustar? É hora de avançar?' },
        ],
      },
      {
        title: 'Padre Caffarel ensina',
        emoji: '✝️',
        items: [
          { text: '"Mística e regra não se separam. A Regra de Vida é o caminho concreto por onde a graça circula."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"A Regra de Vida é o programa pessoal de santidade. Não é um peso — é o caminho da liberdade interior."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Não se trata de fazer muito, mas de fazer com fidelidade. Um pequeno compromisso vivido com amor vale mais que grandes planos nunca realizados."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: 'Caffarel via a Regra de Vida como a resposta pessoal ao chamado universal à santidade — cada um no seu ritmo, mas todos caminhando.' },
        ],
      },
      {
        title: 'A Igreja nos orienta',
        emoji: '⛪',
        items: [
          { text: 'A tradição monástica (São Bento, São Francisco) sempre valorizou a "regra" como caminho de liberdade e santidade.' },
          { text: '"Sede perfeitos, como é perfeito o vosso Pai celeste" (Mt 5,48) — a perfeição se constrói com passos concretos diários.' },
          { text: 'O Concílio Vaticano II reafirmou que todos — não apenas religiosos — são chamados à santidade de vida (LG 40).' },
          { text: '"A disciplina espiritual não é inimiga da liberdade. Pelo contrário: é ela que nos liberta das nossas escravidões."', quote: true, author: 'São Josemaría Escrivá' },
        ],
      },
      {
        title: 'Dicas práticas',
        emoji: '💡',
        items: [
          { text: 'Comece com UM compromisso e viva-o por 66 dias antes de acrescentar outro.', highlight: true },
          { text: 'Escreva sua Regra de Vida — compromisso escrito tem mais força que intenção mental.' },
          { text: 'Se falhar um dia, não desanime: retome no dia seguinte. Falhar uma vez não anula o progresso.' },
          { text: 'Partilhe sua Regra de Vida com seu cônjuge — o apoio mútuo fortalece.' },
          { text: 'Use a app para acompanhar o progresso diário e ver o hábito se formando.' },
          { text: 'No Retiro Anual, faça uma revisão completa e renove seus compromissos.' },
        ],
      },
    ],
  },

  // ─── 5. RETIRO ANUAL ──────────────────────────────
  {
    id: 'retiro-anual',
    title: 'Retiro Anual',
    emoji: '⛰️',
    subtitle: 'Tempo forte de encontro com Deus',
    flowRoute: '/retiro-anual',
    ctaLabel: 'Ir para o Retiro Anual',
    intro: 'O Retiro Anual é o "deserto" do equipista — um tempo forte de silêncio, oração e recolhimento para escutar Deus com profundidade, revisar o ano que passou e renovar os compromissos para o futuro.',
    sections: [
      {
        title: 'O que é',
        emoji: '📖',
        items: [
          { text: 'Um período de recolhimento (geralmente um fim de semana) dedicado inteiramente a Deus.', highlight: true },
          { text: 'É o momento de parar a correria, silenciar e deixar Deus falar ao coração com profundidade.' },
          { text: 'Pode ser com a equipe (o mais tradicional), apenas o casal, ou individual.' },
          { text: 'Jesus mesmo se retirava para rezar sozinho (Lc 5,16). O retiro é imitar Cristo neste gesto essencial.' },
        ],
      },
      {
        title: 'Como viver',
        emoji: '🎯',
        items: [
          { text: 'Agende com antecedência — reserve a data no início do ano.', highlight: true },
          { text: 'Prepare-se semanas antes: intensifique a oração, confesse-se, converse com o cônjuge.' },
          { text: 'Durante o retiro: silencie o celular, evite conversas desnecessárias, esteja presente.' },
          { text: 'Faça um exame do ano: como foi minha oração? Meu casamento? Minha família? Meu serviço?' },
          { text: 'Registre as graças recebidas — são tesouro para os dias difíceis.' },
          { text: 'Defina compromissos concretos para o próximo ano (renove a Regra de Vida).' },
          { text: 'Depois do retiro: releia suas anotações no Dever de Sentar-se de cada mês.' },
        ],
      },
      {
        title: 'Padre Caffarel ensina',
        emoji: '✝️',
        items: [
          { text: '"O retiro é o momento em que paramos para deixar Deus refazer o que a correria do ano desfez."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"Sem o retiro, a vida espiritual se torna superficial — como um rio sem nascente, que seca na primeira estiagem."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: '"No retiro, Deus nos fala como falou a Elias: não no terremoto, não no fogo, mas na brisa suave do silêncio."', quote: true, author: 'Pe. Henri Caffarel' },
          { text: 'Caffarel considerava o retiro tão importante que o colocou como um dos 5 PCEs fundamentais — não é opcional, é essencial.' },
        ],
      },
      {
        title: 'A Igreja nos orienta',
        emoji: '⛪',
        items: [
          { text: 'A tradição dos Exercícios Espirituais de Santo Inácio de Loyola (séc. XVI) mostra o poder transformador do retiro.' },
          { text: '"Vinde a um lugar deserto e descansai um pouco" (Mc 6,31) — Jesus convida seus discípulos ao recolhimento.' },
          { text: 'A espiritualidade do deserto (Padres do Deserto, séc. III-V) nos ensina que no silêncio encontramos Deus e a nós mesmos.' },
          { text: '"O silêncio é o idioma de Deus; todo o resto é má tradução."', quote: true, author: 'São João da Cruz' },
        ],
      },
      {
        title: 'Dicas práticas',
        emoji: '💡',
        items: [
          { text: 'Agende o retiro no início do ano — quanto antes, maior a chance de acontecer.', highlight: true },
          { text: 'Se não conseguir um fim de semana inteiro, faça pelo menos um dia de retiro.' },
          { text: 'Leve Bíblia, caderno e caneta. Deixe o celular no quarto (ou desligue).' },
          { text: 'Use a app para registrar suas reflexões durante e depois do retiro.' },
          { text: 'Converse com seu cônjuge antes: que graças querem pedir juntos?' },
          { text: 'Depois do retiro, não volte à rotina bruscamente — reserve um tempo de transição.' },
        ],
      },
    ],
  },
];

export function getPCEContent(id: string): PCEContentData | undefined {
  return pceContent.find(p => p.id === id);
}
