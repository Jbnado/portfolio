import { describe, it, expect } from 'vitest';
import { weightedPick } from './draw';

// Pesos 1, 2, 3 — total 6. Fronteiras em roll = 1 (fim de a) e roll = 3 (fim de b).
const pool = [
  { id: 'a', weight: 1 },
  { id: 'b', weight: 2 },
  { id: 'c', weight: 3 },
];

describe('weightedPick', () => {
  it('rnd 0 seleciona o primeiro item', () => {
    expect(weightedPick(pool, () => 0).id).toBe('a');
  });

  it('rnd perto de 1 seleciona o ultimo item', () => {
    expect(weightedPick(pool, () => 0.9999).id).toBe('c');
  });

  it('rnd exatamente na fronteira entre dois itens cai no proximo', () => {
    // fronteira do item a (peso 1) sobre o total 6 fica em roll = 1, ou seja rnd = 1/6.
    expect(weightedPick(pool, () => 1 / 6).id).toBe('b');
  });

  it('pool de um item so sempre devolve ele, em qualquer ponta do rnd', () => {
    const single = [{ id: 'only', weight: 5 }];
    expect(weightedPick(single, () => 0).id).toBe('only');
    expect(weightedPick(single, () => 0.999).id).toBe('only');
  });

  it('todo item do pool e alcancavel variando o rnd', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 600; i++) {
      seen.add(weightedPick(pool, () => i / 600).id);
    }
    expect(seen).toEqual(new Set(['a', 'b', 'c']));
  });
});
