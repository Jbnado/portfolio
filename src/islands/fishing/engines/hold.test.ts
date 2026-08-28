import { describe, it, expect } from 'vitest';
import type { HoldParams } from '../types';
import { startHold, stepHold } from './hold';

const base: HoldParams = {
  bandHeight: 0.2,
  gravity: 0.000004,
  lift: 0.00001,
  pattern: 'calmo',
  fishSpeed: 0.0003,
  fillRate: 0.0005,
  drainRate: 0.0004,
};

/** rnd fixo: o peixe sempre mira o mesmo ponto, entao o teste e deterministico. */
const rnd = () => 0.5;

describe('startHold', () => {
  it('comeca com progresso pela metade e nada terminado', () => {
    const e = startHold(base);
    expect(e.progress).toBeCloseTo(0.5);
    expect(e.done).toBeNull();
  });
});

describe('stepHold', () => {
  it('segurando, a faixa sobe', () => {
    const i = startHold(base);
    const e = stepHold(base, i, 100, true, rnd);
    expect(e.bandPos).toBeGreaterThan(i.bandPos);
  });

  it('sem segurar, a faixa desce', () => {
    let e = startHold(base);
    e = stepHold(base, e, 100, true, rnd);
    const alto = e.bandPos;
    e = stepHold(base, e, 300, false, rnd);
    expect(e.bandPos).toBeLessThan(alto);
  });

  it('a faixa nao sai da barra', () => {
    let e = startHold(base);
    for (let i = 0; i < 200; i++) e = stepHold(base, e, 16, true, rnd);
    expect(e.bandPos).toBeLessThanOrEqual(1);
    for (let i = 0; i < 400; i++) e = stepHold(base, e, 16, false, rnd);
    expect(e.bandPos).toBeGreaterThanOrEqual(0);
  });

  it('peixe dentro da faixa enche o progresso', () => {
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0.5 };
    e = stepHold(base, e, 100, false, rnd);
    expect(e.progress).toBeGreaterThan(0.5);
  });

  it('peixe fora da faixa drena o progresso', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.5 };
    e = stepHold(base, e, 100, false, rnd);
    expect(e.progress).toBeLessThan(0.5);
  });

  it('progresso cheio fisga com qualidade igual ao progresso final', () => {
    // dt curto de proposito: em 200ms a gravidade derruba a faixa 0.16 e o
    // peixe sai dela, entao o passo drenaria em vez de encher.
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0.995 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeGreaterThan(0);
  });

  it('progresso zerado perde o peixe', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.01 };
    e = stepHold(base, e, 200, false, rnd);
    expect(e.done).toEqual({ caught: false, quality: 0 });
  });

  it('qualidade reflete a fracao do tempo com o peixe dentro da faixa', () => {
    // Um passo com o peixe FORA, depois um passo dentro que fisga.
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.9 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.done).toBeNull();
    expect(e.msInside).toBe(0);
    expect(e.msTotal).toBe(20);

    e = { ...e, bandPos: 0.5, fishPos: 0.5, progress: 0.995 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.done?.caught).toBe(true);
    // metade do tempo dentro -> metade da qualidade
    expect(e.done!.quality).toBeCloseTo(0.5);
  });

  it('segurar o peixe dentro o tempo todo da qualidade cheia', () => {
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0.995 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeCloseTo(1);
  });

  it('o peixe mira um alvo novo quando a espera acaba', () => {
    let e = startHold(base);
    expect(e.fishTarget).toBeCloseTo(0.5);
    e = stepHold(base, e, 1500, false, () => 0.9);
    expect(e.fishTarget).toBeCloseTo(0.9);
  });

  it('nao avanca depois de terminado', () => {
    const inicial = { ...startHold(base), progress: 0.01, bandPos: 0.1, fishPos: 0.9 };
    const fim = stepHold(base, inicial, 200, false, rnd);
    expect(stepHold(base, fim, 200, false, rnd)).toBe(fim);
  });
});
