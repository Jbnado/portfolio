import { describe, it, expect } from 'vitest';
import type { HoldParams } from '../types';
import { startHold, stepHold } from './hold';
import { FISH, guaranteedFish } from '../fish';

/** Mesmo numero de degraus da HoldView, pra simular exatamente o que o
    jogador ve sob movimento reduzido. */
const REDUCED_STEPS = 12;

/** PRNG determinista (LCG) so pra este teste: nao precisa ser bom, precisa
    ser reproduzivel e nao ficar preso num ciclo curto. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Roda o motor real por `frames` quadros de dt aleatorio (o intervalo do
    requestAnimationFrame nunca e fixo, ate o teto de 50ms que HoldView
    aplica) e devolve quantos fishDrawPos distintos apareceram. Reinicia o
    motor se um lance terminar no meio, pra nao encurtar a amostra. */
function simulateDrawPositions(params: HoldParams, seed: number, frames: number): number {
  const dtRnd = lcg(seed);
  const targetRnd = lcg(seed + 1);
  let e = startHold(params);
  const distinct = new Set<number>([e.fishDrawPos]);
  for (let i = 0; i < frames; i++) {
    const dt = 1 + dtRnd() * 49;
    const holding = dtRnd() > 0.3;
    e = stepHold(params, e, dt, holding, targetRnd, REDUCED_STEPS);
    distinct.add(e.fishDrawPos);
    if (e.done) e = startHold(params);
  }
  return distinct.size;
}

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
    // 0.5). Quantizado a 12 degraus (mesmo numero da HoldView), fishDrawPos
    // cai em 7/12 = 0.5833, dentro da faixa — e essa MESMA posicao decide
    // "dentro"/"fora", nao uma continua escondida. fishPos (a base da
    // integracao) fica intocado pela quantizacao.
    const inicial = {
      ...startHold(base), bandPos: 0.5, fishPos: 0.605, fishTarget: 0.605, progress: 0.5,
    };
    const semQuantizar = stepHold(base, inicial, 20, false, rnd);
    const comQuantizar = stepHold(base, inicial, 20, false, rnd, 12);
    expect(semQuantizar.progress).toBeLessThan(0.5); // cru: fora, drena
    expect(comQuantizar.progress).toBeGreaterThan(0.5); // quantizado: dentro, enche
    expect(comQuantizar.fishDrawPos).toBeCloseTo(7 / 12, 5);
    expect(comQuantizar.fishPos).toBeCloseTo(0.605, 5);
  });

  it('sob movimento reduzido, fishDrawPos nao trava num unico degrau nos tres peixes de sustentacao (achado C1)', () => {
    // Simulacao do modulo real, nao leitura de codigo: 4000 quadros de dt
    // aleatorio por combinacao, pros tres peixes de SUSTENTACAO da tabela
    // (p2, p5, p8) e nos dois modos (normal e garantido). Antes do fix,
    // Math.round arredondava a integracao em si — o avanco maximo por
    // quadro (fishSpeed * 50ms) fica bem abaixo de meio degrau em todos os
    // tres, entao o peixe ficava preso no mesmo ponto: 1 valor distinto em
    // 4000 quadros, nas seis combinacoes. Este teste falha se isso voltar.
    const alvos = ['p2', 'p5', 'p8'] as const;
    for (const id of alvos) {
      const peixe = FISH.find((f) => f.id === id)!;
      for (const params of [peixe.params as HoldParams, guaranteedFish(peixe).params as HoldParams]) {
        const distintos = simulateDrawPositions(params, id.charCodeAt(1), 4000);
        expect(distintos).toBeGreaterThan(1);
      }
    }
  });
});
