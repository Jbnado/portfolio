import { describe, it, expect } from 'vitest';
import type { DodgeParams } from '../types';
import {
  startDodge,
  switchLane,
  stepDodge,
  gatesCrossed,
} from './dodge';
import { FISH } from '../fish';

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
    e = stepDodge(base, e, 1300); // cruza o 0.75 limpo e bate de novo no 0.25 da volta 2: perde
    expect(e.done?.caught).toBe(false);
    // bumpPenalty 1-2*0.3=0.4; a unica passagem limpa (0.75) tem folga desde
    // o portao anterior (0.25, instante 250) ate ela (750): 500ms de espaco,
    // e a troca ainda em t=0 cobre tudo isso, entao precisao=500/500=1
    // (achado C2 — antes normalizava por periodMs e dava 0.75). quality=0.4.
    expect(e.done!.quality).toBeCloseTo(0.4);
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

  it('zero batidas com folga maxima alcanca o topo da qualidade (achado I2 e C2)', () => {
    // Estado seguido por jogo de verdade, nao construido a dedo (o teste
    // anterior seedava clearMsSum:periodMs com clearCount:1, um estado que
    // nenhuma jogada produz — nem com base nem com peixe algum da tabela: a
    // folga maxima real e o espaco ATE O PORTAO ANTERIOR, sempre menor que
    // periodMs quando ha mais de um portao por volta). Aqui o jogador troca
    // de pista assim que cada portao passa, comprometido o quanto antes.
    let e = startDodge(base);
    e = stepDodge(base, e, 250); // cruza 0.25 limpo (pista 0, folga desde o inicio)
    e = switchLane(base, e, e.tMs); // troca pra pista 1 na hora
    e = stepDodge(base, e, base.periodMs); // cruza 0.75 limpo, comprometido desde o portao anterior
    expect(e.done).toEqual({ caught: true, quality: 1 });
  });

  it('o topo da qualidade e alcancavel nos tres peixes de dragagem da tabela (achado C2)', () => {
    // Busca no espaco de jogadas contra os peixes DE VERDADE (p3, p6, p9):
    // pra cada portao, troca de pista o quanto antes (ainda no instante do
    // portao anterior) para a pista aberta mais proxima. Verifica que essa
    // politica realmente zera as batidas e alcanca qualidade 1 nos tres — o
    // teto e alcancavel de verdade, nao so assintotico. Normalizar por
    // periodMs (o defeito que este achado corrige) prendia o teto em 0.40
    // (p3), 0.24 (p6) e 0.24 (p9): sempre menor que a folga entre portoes.
    function bestReachable(params: DodgeParams) {
      let state = startDodge(params);
      const endMs = params.lapsToCatch * params.periodMs;
      let t = 0;
      while (t < endMs && !state.done) {
        let nextInstant = Infinity;
        let nextGate: DodgeParams['gates'][number] | null = null;
        const lapFrom = Math.floor(t / params.periodMs);
        for (let lap = lapFrom; lap <= lapFrom + 1; lap++) {
          for (const gate of params.gates) {
            const instant = (lap + gate.pos) * params.periodMs;
            if (instant > t && instant < nextInstant) { nextInstant = instant; nextGate = gate; }
          }
        }
        const stopAt = Math.min(nextInstant, endMs);
        if (nextGate && stopAt === nextInstant) {
          let hopsToNearest = Infinity;
          for (const lane of nextGate.open) {
            const hops = ((lane - state.lane) % params.lanes + params.lanes) % params.lanes;
            hopsToNearest = Math.min(hopsToNearest, hops);
          }
          for (let h = 0; h < hopsToNearest; h++) state = switchLane(params, state, t);
        }
        state = stepDodge(params, state, stopAt);
        t = stopAt;
      }
      return state.done ?? stepDodge(params, state, endMs).done!;
    }

    for (const id of ['p3', 'p6', 'p9'] as const) {
      const peixe = FISH.find((f) => f.id === id)!;
      const result = bestReachable(peixe.params as DodgeParams);
      expect(result.caught).toBe(true);
      expect(result.quality).toBeCloseTo(1);
    }
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
