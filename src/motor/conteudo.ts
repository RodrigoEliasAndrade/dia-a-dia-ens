// ═══════════════════════════════════════════════════
// Motor Espiritual — Carregamento de conteúdo
// Importa as fichas e estados (cópias dos canônicos em
// motor-espiritual/conteudo/). No MVP é import estático.
// ═══════════════════════════════════════════════════

import fichasAbandono from './data/abandono-oracao-pessoal.json';
import estadosRaw from './data/estados-pastorais.json';
import type { Ficha, EstadoPastoral } from './types';

// Cast — os JSON seguem o schema em _schema.md.
export const FICHAS: Ficha[] = fichasAbandono as Ficha[];

export const ESTADOS: EstadoPastoral[] = estadosRaw as EstadoPastoral[];

/** Estados marcados como prioridade do MVP e que têm fichas disponíveis. */
export function estadosComFichas(): EstadoPastoral[] {
  const idsComFicha = new Set(FICHAS.flatMap(f => f.estado));
  return ESTADOS.filter(e => idsComFicha.has(e.id));
}

export function estadoPorId(id: string): EstadoPastoral | undefined {
  return ESTADOS.find(e => e.id === id);
}
