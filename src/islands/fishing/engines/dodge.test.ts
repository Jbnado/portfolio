import { describe, it, expect } from 'vitest';
import type { DodgeParams } from '../types';
import {
  startDodge,
  switchLane,
  stepDodge,
  gatesCrossed,
} from './dodge';

const base: DodgeParams = {
  lanes: 2,
  periodMs: 1000,
  gates: [
    { pos: 0.25, open: [0] },
    { pos: 0.75, open: [1] },
  ],
  lapsToCatch: 1,
  bumpsAllowed: 1,
};

describe('gatesCrossed', () => {
  it('acha o portao dentro do intervalo', () => {
    expect(gatesCrossed(base, 200, 300).map((p) => p.pos)).toEqual([0.25]);
  });

  it('nao acha nada quando o intervalo nao cobre portao', () => {
    expect(gatesCrossed(base, 300, 400)).toHaveLength(0);
  });

  it('acha os dois quando o intervalo cobre os dois', () => {
    expect(gatesCrossed(base, 200, 800)).toHaveLength(2);
  });

  it('atravessa o fim da volta', () => {
    expect(gatesCrossed(base, 900, 1300).map((p) => p.pos)).toEqual([0.25]);
  });
});

describe('switchLane', () => {
  it('avanca a pista circularmente', () => {
    let e = startDodge(base);
    expect(e.lane).toBe(0);
    e = switchLane(base, e);
    expect(e.lane).toBe(1);
    e = switchLane(base, e);
    expect(e.lane).toBe(0);
  });
});

describe('stepDodge', () => {
  it('passa pelo portao na pista aberta sem batida', () => {
    const e = stepDodge(base, startDodge(base), 300);
    expect(e.bumps).toBe(0);
  });

  it('passa pelo portao na pista fechada e leva batida', () => {
    let e = switchLane(base, startDodge(base)); // pista 1
    e = stepDodge(base, e, 300); // portao 0.25 so abre a pista 0
    expect(e.bumps).toBe(1);
  });

  it('batidas alem da tolerancia perdem o peixe', () => {
    let e = switchLane(base, startDodge(base)); // pista 1
    e = stepDodge(base, e, 300);  // batida 1
    e = stepDodge(base, e, 1300); // batida 2, alem da tolerancia 1
    expect(e.done).toEqual({ caught: false, quality: 0 });
  });

  it('completar as voltas fisga', () => {
    const e = stepDodge(base, startDodge(base), 1100);
    expect(e.done?.caught).toBe(true);
  });

  it('qualidade cai com as batidas', () => {
    // Limpo: pista 0 no portao 0.25 (abre [0]), troca, pista 1 no 0.75 (abre [1]).
    let limpo = startDodge(base);
    limpo = stepDodge(base, limpo, 300);
    limpo = switchLane(base, limpo);
    limpo = stepDodge(base, limpo, 1100);
    expect(limpo.bumps).toBe(0);
    expect(limpo.done?.caught).toBe(true);

    // Sujo: fica na pista 0 a volta toda, entao bate no portao 0.75.
    const sujo = stepDodge(base, startDodge(base), 1100);
    expect(sujo.bumps).toBe(1);
    expect(sujo.done?.caught).toBe(true);
    expect(sujo.done!.quality).toBeLessThan(limpo.done!.quality);
  });

  it('bumpsAllowed null nunca perde, mas as batidas custam qualidade', () => {
    const p = { ...base, bumpsAllowed: null };
    let e = switchLane(p, startDodge(p)); // lane 1, vai bater no portao 0.25
    e = stepDodge(p, e, 1100);
    expect(e.bumps).toBeGreaterThan(0);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeLessThan(1);
  });

  it('nao avanca depois de terminado', () => {
    const fim = stepDodge(base, startDodge(base), 1100);
    expect(stepDodge(base, fim, 2000)).toBe(fim);
  });
});
