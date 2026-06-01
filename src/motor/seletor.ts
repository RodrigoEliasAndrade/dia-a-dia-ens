// ═══════════════════════════════════════════════════
// Motor Espiritual — O Seletor (filtra, pontua, escolhe)
// Conforme 01-arquitetura-motor.md §4-§5 e 03-guardrails.md
// ═══════════════════════════════════════════════════

import type { Ficha, Perfil, Momento } from './types';

/**
 * MODO_TESTE — quando true, ignora o filtro de status (G1).
 * As 10 fichas-piloto estão em "rascunho" e ainda não passaram pela revisão
 * doutrinal. Em produção isto DEVE ser false (07-primeiro-teste.md, decisão).
 */
export const MODO_TESTE = true;

/**
 * Escada de aprofundamento (01-arquitetura-motor.md §5).
 * 1ª vez → degrau 1; 2ª–3ª → 2; 4ª–5ª → 3; 6ª+ → 4.
 */
export function degrauAlvo(repeticao: number): 1 | 2 | 3 | 4 {
  if (repeticao >= 6) return 4;
  if (repeticao >= 4) return 3;
  if (repeticao >= 2) return 2;
  return 1;
}

/**
 * Passo 1 — Pré-filtro (guardrails, regras rígidas).
 * Descarta fichas que: não estão aprovadas (G1, salvo MODO_TESTE),
 * não atendem o estado, violam a disposição (G3: sem exortar em desolação),
 * ou não estão no degrau alvo (com fallback gracioso).
 */
export function preFiltrar(fichas: Ficha[], momento: Momento): Ficha[] {
  let candidatas = fichas.filter(f => {
    // G1 — só aprovado (salvo modo teste)
    if (!MODO_TESTE && f.status !== 'aprovado') return false;
    // estado pastoral atual
    if (!f.estado.includes(momento.estado_pastoral)) return false;
    // G3 — desolação proíbe exortar
    if (momento.disposicao === 'desolacao' && f.tom === 'exortar') return false;
    return true;
  });

  // Filtro de degrau alvo, com fallback gracioso para nunca falhar por falta
  // de combinação exata.
  const alvo = degrauAlvo(momento.repeticao);
  const noAlvo = candidatas.filter(f => f.degrau === alvo);
  if (noAlvo.length > 0) {
    candidatas = noAlvo;
  } else {
    // Sem ficha exatamente no degrau alvo → pega o degrau disponível mais
    // próximo abaixo do alvo; se não houver, mantém todas as sobreviventes.
    const abaixo = candidatas.filter(f => f.degrau <= alvo);
    if (abaixo.length > 0) {
      const maxDegrau = Math.max(...abaixo.map(f => f.degrau));
      candidatas = abaixo.filter(f => f.degrau === maxDegrau);
    }
  }

  return candidatas;
}

export interface FichaPontuada {
  ficha: Ficha;
  nota: number;
}

/**
 * Passo 2 — Pontuação (01-arquitetura-motor.md §4).
 * nota = 3·pref_registro + 2·pref_fonte + 2·(maturidade casa) + 1·(estação casa) − 4·(recente)
 */
export function pontuar(ficha: Ficha, perfil: Perfil, momento: Momento): number {
  const reg = 3 * (perfil.pref_registro[ficha.registro] ?? 0);
  const fon = 2 * (perfil.pref_fonte[ficha.fonte] ?? 0);
  const mat = 2 * (ficha.maturidade === perfil.maturidade_estimada ? 1 : 0);

  const estacaoFicha = ficha.estacao_de_vida ?? [];
  const casaEstacao =
    estacaoFicha.length > 0 &&
    estacaoFicha.some(e => momento.estacao_de_vida.includes(e));
  const est = 1 * (casaEstacao ? 1 : 0);

  const pen = 4 * (perfil.recentes.includes(ficha.id) ? 1 : 0);

  return reg + fon + mat + est - pen;
}

/**
 * Seleção completa: pré-filtra, pontua e ordena.
 * @param excluir ids a remover (variação: "quer outra abordagem?")
 * Retorna a lista ranqueada (maior nota primeiro; empate → menos recente).
 */
export function selecionar(
  fichas: Ficha[],
  perfil: Perfil,
  momento: Momento,
  excluir: string[] = [],
): FichaPontuada[] {
  const candidatas = preFiltrar(fichas, momento).filter(f => !excluir.includes(f.id));

  const pontuadas = candidatas.map(ficha => ({
    ficha,
    nota: pontuar(ficha, perfil, momento),
  }));

  // Maior nota primeiro. Desempate: a menos recente (não está em recentes,
  // ou aparece mais cedo na lista de recentes).
  pontuadas.sort((a, b) => {
    if (b.nota !== a.nota) return b.nota - a.nota;
    const ra = perfil.recentes.indexOf(a.ficha.id);
    const rb = perfil.recentes.indexOf(b.ficha.id);
    const recA = ra === -1 ? Infinity : ra; // -1 (nunca visto) = mais "antigo"
    const recB = rb === -1 ? Infinity : rb;
    return recB - recA; // menos recente (índice maior / nunca visto) primeiro
  });

  return pontuadas;
}

/** Conveniência: a melhor ficha, ou null se nada sobreviveu. */
export function escolher(
  fichas: Ficha[],
  perfil: Perfil,
  momento: Momento,
  excluir: string[] = [],
): Ficha | null {
  const ranking = selecionar(fichas, perfil, momento, excluir);
  return ranking.length > 0 ? ranking[0].ficha : null;
}
