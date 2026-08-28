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
    e = switchLane(base, e, 0);
    expect(e.lane).toBe(1);
    e = switchLane(base, e, 0);
    expect(e.lane).toBe(0);
  });

  it('guarda o instante da troca, pro termo de folga do achado I2', () => {
    const e = switchLane(base, startDodge(base), 450);
    expect(e.lastSwitchMs).toBe(450);
  });
});

describe('stepDodge', () => {
  it('passa pelo portao na pista aberta sem batida', () => {
    const e = stepDodge(base, startDodge(base), 300);
    expect(e.bumps).toBe(0);
  });

  it('passa pelo portao na pista fechada e leva batida', () => {
    let e = switchLane(base, startDodge(base), 0); // pista 1
    e = stepDodge(base, e, 300); // portao 0.25 so abre a pista 0
    expect(e.bumps).toBe(1);
  });

  it('batidas alem da tolerancia perdem o peixe, com qualidade parcial (achado I3)', () => {
    let e = switchLane(base, startDodge(base), 0); // pista 1
    e = stepDodge(base, e, 300);  // batida 1, no portao 0.25 (fechado pra pista 1)
    e = stepDodge(base, e, 1300); // cruza o 0.75 limpo (folga 750) e bate de novo no 0.25 da volta 2: perde
    expect(e.done?.caught).toBe(false);
    // bumpPenalty 1-2*0.3=0.4; precisao 750/1000=0.75; quality=0.4*0.75.
    expect(e.done!.quality).toBeCloseTo(0.3);
  });

  it('bumpsAllowed 0 perde na primeira batida (p9 usa este valor)', () => {
    // dodge.ts usa `bumps > allowed`: com allowed=0, uma batida ja e demais.
    const p = { ...base, bumpsAllowed: 0 };
    let e = switchLane(p, startDodge(p), 0); // pista 1, vai bater no portao 0.25
    e = stepDodge(p, e, 300);
    expect(e.bumps).toBe(1);
    expect(e.done?.caught).toBe(false);
    expect(e.done!.quality).toBeCloseTo(0.7); // uma batida: 1 - 1*0.3
  });

  it('completar as voltas fisga', () => {
    const e = stepDodge(base, startDodge(base), 1100);
    expect(e.done?.caught).toBe(true);
  });

  it('qualidade varia com a folga da troca, nao so com a contagem de batidas (achado I2)', () => {
    // Limpo: pista 0 no portao 0.25 (abre [0]), troca logo depois, pista 1
    // chega ao portao 0.75 (abre [1]) com folga.
    let limpo = startDodge(base);
    limpo = stepDodge(base, limpo, 300);
    limpo = switchLane(base, limpo, limpo.tMs);
    limpo = stepDodge(base, limpo, 1100);
    expect(limpo.bumps).toBe(0);
    expect(limpo.done?.caught).toBe(true);
    // Qualidade continua, nao um dos cinco degraus antigos {1; 0.7; 0.4; 0.1; 0}.
    expect(limpo.done!.quality).toBeGreaterThan(0);
    expect(limpo.done!.quality).toBeLessThan(1);

    // Sujo: fica na pista 0 a volta toda, entao bate no portao 0.75.
    const sujo = stepDodge(base, startDodge(base), 1100);
    expect(sujo.bumps).toBe(1);
    expect(sujo.done?.caught).toBe(true);
    expect(sujo.done!.quality).toBeLessThan(limpo.done!.quality);
  });

  it('zero batidas com folga maxima alcanca o topo da qualidade (achado I2)', () => {
    // Estado construido: nunca bateu, e a unica passagem registrada teve
    // folga igual a um periodo inteiro — o teto que dodgeQuality aceita.
    const seeded = {
      ...startDodge(base), tMs: base.periodMs, bumps: 0,
      clearMsSum: base.periodMs, clearCount: 1,
    };
    const e = stepDodge(base, seeded, base.periodMs);
    expect(e.done).toEqual({ caught: true, quality: 1 });
  });

  it('bumpsAllowed null nunca perde, mas as batidas custam qualidade', () => {
    const p = { ...base, bumpsAllowed: null };
    let e = switchLane(p, startDodge(p), 0); // lane 1, vai bater no portao 0.25
    e = stepDodge(p, e, 1100);
    expect(e.bumps).toBeGreaterThan(0);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeLessThan(1);
  });

  it('tempo quantizado (movimento reduzido) produz o mesmo julgamento — achado I1', () => {
    // DodgeView usa 36 degraus por periodo. Um raw ANTES do portao (sem
    // cruzar ainda) quantiza para o degrau que cai EXATAMENTE no portao — o
    // motor tem que julgar o que a tela, ja quantizada, mostra.
    const steps = 36;
    const stepMs = base.periodMs / steps;
    const raw = 245;
    const tq = Math.round(raw / stepMs) * stepMs;
    const inLane1 = switchLane(base, startDodge(base), 0);
    const semQuantizar = stepDodge(base, inLane1, raw);
    const comQuantizar = stepDodge(base, inLane1, tq);
    expect(semQuantizar.bumps).toBe(0); // cru: portao ainda nao chegou
    expect(comQuantizar.bumps).toBe(1); // quantizado: bate, que e o que se ve
  });

  it('nao avanca depois de terminado', () => {
    const fim = stepDodge(base, startDodge(base), 1100);
    expect(stepDodge(base, fim, 2000)).toBe(fim);
  });
});
