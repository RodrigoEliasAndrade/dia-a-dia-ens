// ═══════════════════════════════════════════════════
// Motor Espiritual — Tipos
// Espelha motor-espiritual/conteudo/_schema.md e 01-arquitetura-motor.md
// ═══════════════════════════════════════════════════

export type Fonte = 'Evangelho' | 'Catecismo' | 'ENS' | 'Santo';
export type Registro = 'coracao' | 'cotidiano' | 'reflexivo';
export type Maturidade = 'iniciante' | 'crescimento' | 'maduro';
export type Tom = 'consolar' | 'instruir' | 'exortar';
export type Disposicao = 'consolacao' | 'desolacao' | 'neutro';
export type StatusFicha = 'rascunho' | 'aprovado';

/** Uma peça atômica do banco de conteúdo. */
export interface Ficha {
  id: string;
  estado: string[];
  texto: string;
  texto_micro?: string;
  fonte: Fonte;
  referencia: string;
  proximo_passo?: string;
  registro: Registro;
  maturidade: Maturidade;
  tom: Tom;
  estacao_de_vida?: string[];
  degrau: 1 | 2 | 3 | 4;
  status: StatusFicha;
  revisao_nota?: string;
}

/** Estado pastoral — é, ao mesmo tempo, opção de tela e gaveta do banco. */
export interface EstadoPastoral {
  id: string;
  rotulo_tela: string;
  descricao: string;
  leitura_caridosa: string;
  pce_relacionado: string | null;
  prioridade_mvp: boolean;
}

/** Traços estáveis aprendidos pelo uso. No cold start, começa neutro. */
export interface Perfil {
  pref_registro: Record<Registro, number>;
  pref_fonte: Record<Fonte, number>;
  maturidade_estimada: Maturidade;
  recentes: string[];               // ids das últimas fichas vistas
  retornos: Record<string, number>; // por estado: quantas vezes voltou
}

/** Leitura fresca do momento, lida a cada interação. */
export interface Momento {
  estado_pastoral: string;
  disposicao: Disposicao;
  estacao_de_vida: string[];
  repeticao: number; // 1 = primeira vez
}

/** Perfil neutro de cold start (01-arquitetura-motor.md §2). */
export function perfilNeutro(): Perfil {
  return {
    pref_registro: { coracao: 0.3, cotidiano: 0.5, reflexivo: 0.2 },
    pref_fonte: { Evangelho: 0.4, Catecismo: 0.2, ENS: 0.2, Santo: 0.2 },
    maturidade_estimada: 'iniciante',
    recentes: [],
    retornos: {},
  };
}
