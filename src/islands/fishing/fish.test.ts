import { describe, it, expect } from 'vitest';
import { FISH, sizeOf } from './fish';

describe('FISH', () => {
  it('tem nove peixes', () => {
    expect(FISH).toHaveLength(9);
  });

  it('cobre os tres motores', () => {
    const motores = new Set(FISH.map((p) => p.engine));
    expect(motores).toEqual(new Set(['track', 'hold', 'dodge']));
  });

  it('cada faixa tem exatamente um peixe de cada engine', () => {
    for (const tier of [1, 2, 3]) {
      const engines = FISH.filter((f) => f.tier === tier).map((f) => f.engine).sort();
      expect(engines).toEqual(['dodge', 'hold', 'track']);
    }
  });

  it('so existem os dois caminhos continuos', () => {
    const paths = FISH.filter((f) => f.engine === 'track').map((f) => (f.params as { path: string }).path);
    expect(new Set(paths)).toEqual(new Set(['pendulo', 'radial']));
  });

  it('nao repete id', () => {
    expect(new Set(FISH.map((p) => p.id)).size).toBe(FISH.length);
  });

  it('tem faixa de tamanho valida em todos', () => {
    for (const p of FISH) {
      expect(p.sizeMax).toBeGreaterThan(p.sizeMin);
      expect(p.sizeMin).toBeGreaterThan(0);
    }
  });
});

describe('sizeOf', () => {
  const peixe = FISH[0];

  it('qualidade 0 devolve o minimo', () => {
    expect(sizeOf(peixe, 0)).toBe(peixe.sizeMin);
  });

  it('qualidade 1 devolve o maximo', () => {
    expect(sizeOf(peixe, 1)).toBe(peixe.sizeMax);
  });

  it('interpola no meio e arredonda para inteiro', () => {
    const meio = sizeOf(peixe, 0.5);
    expect(meio).toBe(Math.round((peixe.sizeMin + peixe.sizeMax) / 2));
    expect(Number.isInteger(meio)).toBe(true);
  });

  it('prende qualidade fora de 0..1', () => {
    expect(sizeOf(peixe, -5)).toBe(peixe.sizeMin);
    expect(sizeOf(peixe, 9)).toBe(peixe.sizeMax);
  });
});
