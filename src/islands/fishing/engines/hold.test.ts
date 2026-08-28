import { describe, it, expect } from 'vitest';
import type { HoldParams } from '../types';
import { startHold, stepHold } from './hold';

const base: HoldParams = {
  bandHeight: 0.2,
  gravity: 0.000004,
  lift: 0.00001,
  maxSpeed: 0.0009,
  pattern: 'calmo',
  fishSpeed: 0.0003,
  fillRate: 0.0005,
  drainRate: 0.0004,
  graceMs: 2000,
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

  // A perda instantanea no zero saiu: agora zerar abre a carencia (achado 4
  // do teste de jogo). Estes quatro testes substituem o antigo
  // 'progresso zerado perde o peixe', que descrevia a perda imediata.
  it('a velocidade da faixa nao passa do teto', () => {
    let e = startHold(base);
    for (let i = 0; i < 200; i++) e = stepHold(base, e, 16, true, rnd);
    expect(Math.abs(e.bandVel)).toBeLessThanOrEqual(base.maxSpeed);
  });

  it('barra zerada nao perde na hora: comeca a carencia', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.01 };
    e = stepHold(base, e, 200, false, rnd);
    expect(e.progress).toBe(0);
    expect(e.done).toBeNull();
    expect(e.msAtZero).toBeGreaterThan(0);
  });

  it('carencia estourada perde o peixe', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.01, msAtZero: 1900 };
    e = stepHold(base, e, 200, false, rnd);
    expect(e.done).toEqual({ caught: false, quality: 0 });
  });

  it('recuperar zera a carencia', () => {
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0, msAtZero: 1500 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.progress).toBeGreaterThan(0);
    expect(e.msAtZero).toBe(0);
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
    // msAtZero perto do teto: o passo de 200ms estoura a carencia e fisga
    // 'done', entao o segundo passo tem que encontrar state.done e devolver
    // a mesma referencia sem processar nada.
    const inicial = {
      ...startHold(base), progress: 0.01, bandPos: 0.1, fishPos: 0.9, msAtZero: 1900,
    };
    const fim = stepHold(base, inicial, 200, false, rnd);
    expect(stepHold(base, fim, 200, false, rnd)).toBe(fim);
  });

  it('qualidade varia com a fracao de tempo dentro da faixa, e o topo e alcancavel (achado I2)', () => {
    // Metade do tempo dentro: qualidade parcial, nem topo nem piso.
    let parcial = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.9 };
    parcial = stepHold(base, parcial, 20, false, rnd);
    parcial = { ...parcial, bandPos: 0.5, fishPos: 0.5, progress: 0.995 };
    parcial = stepHold(base, parcial, 20, false, rnd);
    expect(parcial.done?.caught).toBe(true);
    expect(parcial.done!.quality).toBeGreaterThan(0);
    expect(parcial.done!.quality).toBeLessThan(1);

    // Sempre dentro: o topo (1) e realmente alcancavel, nao so assintotico.
    let cheio = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0.995 };
    cheio = stepHold(base, cheio, 20, false, rnd);
    expect(cheio.done?.caught).toBe(true);
    expect(cheio.done!.quality).toBeCloseTo(1);

    expect(cheio.done!.quality).toBeGreaterThan(parcial.done!.quality);
  });

  it('carencia com tempo dentro registrado antes preserva qualidade parcial na perda (achado I3)', () => {
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0.5 };
    e = stepHold(base, e, 100, false, rnd); // um tempo dentro da faixa antes de tudo desandar
    expect(e.msInside).toBeGreaterThan(0);

    e = { ...e, bandPos: 0.1, fishPos: 0.9, progress: 0.01, msAtZero: 1900 };
    e = stepHold(base, e, 200, false, rnd); // estoura a carencia
    expect(e.done?.caught).toBe(false);
    // Antes esta perda saia sempre em quality:0. Agora reflete msInside/msTotal,
    // entao um peixe resgatado no modo garantido nao sai mais sempre no sizeMin.
    expect(e.done!.quality).toBeGreaterThan(0);
    expect(e.done!.quality).toBeCloseTo(e.msInside / e.msTotal);
  });

  it('graceMs null nunca perde por carencia, mesmo com a barra zerada por muito tempo (achado I5)', () => {
    const p = { ...base, graceMs: null };
    let e = { ...startHold(p), bandPos: 0.1, fishPos: 0.9, progress: 0, msAtZero: 999999 };
    e = stepHold(p, e, 200, false, rnd);
    expect(e.done).toBeNull();
  });

  it('com quantizacao, o peixe julgado dentro/fora da faixa e o mesmo que a tela desenha (achado I1)', () => {
    // fishPos cru (0.605) fica 0.005 fora da faixa (half 0.1 em torno de
    // 0.5). Quantizado a 12 degraus (mesmo numero da HoldView), a posicao
    // desenhada cai em 7/12 = 0.5833, dentro da faixa — e agora e essa
    // MESMA posicao que decide "dentro"/"fora", nao uma continua escondida.
    const inicial = {
      ...startHold(base), bandPos: 0.5, fishPos: 0.605, fishTarget: 0.605, progress: 0.5,
    };
    const semQuantizar = stepHold(base, inicial, 20, false, rnd);
    const comQuantizar = stepHold(base, inicial, 20, false, rnd, 12);
    expect(semQuantizar.progress).toBeLessThan(0.5); // cru: fora, drena
    expect(comQuantizar.progress).toBeGreaterThan(0.5); // quantizado: dentro, enche
    expect(comQuantizar.fishPos).toBeCloseTo(7 / 12, 5);
  });
});
