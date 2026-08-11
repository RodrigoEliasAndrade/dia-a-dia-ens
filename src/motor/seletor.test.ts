import { describe, expect, it } from 'vitest';
import { degrauAlvo, escolher, pontuar, preFiltrar } from './seletor';
import { perfilNeutro, type Ficha, type Momento } from './types';

function ficha(overrides: Partial<Ficha> = {}): Ficha {
  return {
    id: 'ficha-base',
    estado: ['abandono-oracao-pessoal'],
    texto: 'Texto pastoral aprovado.',
    fonte: 'Evangelho',
    referencia: 'Lc 15,20',
    registro: 'cotidiano',
    maturidade: 'iniciante',
    tom: 'consolar',
    degrau: 1,
    status: 'aprovado',
    ...overrides,
  };
}

function momento(overrides: Partial<Momento> = {}): Momento {
  return {
    estado_pastoral: 'abandono-oracao-pessoal',
    disposicao: 'neutro',
    estacao_de_vida: [],
    repeticao: 1,
    ...overrides,
  };
}

describe('seletor pastoral', () => {
  it.each([
    [1, 1],
    [2, 2],
    [4, 3],
    [6, 4],
  ] as const)('maps repetition %s to step %s', (repeticao, degrau) => {
    expect(degrauAlvo(repeticao)).toBe(degrau);
  });

  it('never returns an exhortation while the person is in desolation', () => {
    const result = preFiltrar([
      ficha({ id: 'consolo' }),
      ficha({ id: 'exortacao', tom: 'exortar' }),
    ], momento({ disposicao: 'desolacao' }));

    expect(result.map(item => item.id)).toEqual(['consolo']);
  });

  it('falls back to the closest lower available step', () => {
    const result = preFiltrar([
      ficha({ id: 'degrau-1', degrau: 1 }),
      ficha({ id: 'degrau-2', degrau: 2 }),
    ], momento({ repeticao: 6 }));

    expect(result.map(item => item.id)).toEqual(['degrau-2']);
  });

  it('penalizes recently shown content and supports explicit exclusion', () => {
    const perfil = perfilNeutro();
    perfil.recentes = ['recente'];
    const recente = ficha({ id: 'recente' });
    const nova = ficha({ id: 'nova' });

    expect(pontuar(nova, perfil, momento())).toBeGreaterThan(pontuar(recente, perfil, momento()));
    expect(escolher([recente, nova], perfil, momento())?.id).toBe('nova');
    expect(escolher([recente, nova], perfil, momento(), ['nova'])?.id).toBe('recente');
  });
});
