import { describe, it, expect } from 'vitest';
import type { DodgeParams } from '../types';
import { startDodge, switchLane, stepDodge, gateAt } from './dodge';

/** Duas pistas, quatro portoes alternando: nenhuma pista sobrevive a volta
    inteira parada. E de proposito — parar nao pode pescar. */
const base: DodgeParams = {
  lanes: 2,
  periodMs: 1000,
  gapWidth: 0.1,
  cleanToCatch: 3,
  bumpsAllowed: null,
  gates: [
    { pos: 0.125, open: [0] },
    { pos: 0.375, open: [1] },
    { pos: 0.625, open: [0] },
    { pos: 0.875, open: [1] },
  ],
};

/** Roda o minigame quadro a quadro. `laneAt` decide em que pista estar. */
function play(
  params: DodgeParams,
  laneFor: (tMs: number, atual: number) => number,
  maxMs = 20000,
) {
  let s = startDodge(params);
  for (let t = 0; !s.done && t < maxMs; t += 10) {
    let guard = 0;
    while (s.lane !== laneFor(t, s.lane) && guard++ < params.lanes) {
      s = switchLane(params, s);
    }
    s = stepDodge(params, s, t);
  }
  return s;
}

/** Jogador perfeito: fora dos vaos, ja se compromete com a pista do proximo
    portao; DENTRO de um vao nao troca, porque trocar la e cair. */
const perfect = (params: DodgeParams) => (tMs: number, atual: number) => {
  if (gateAt(params, tMs) !== null) return atual;
  const ph = (tMs % params.periodMs) / params.periodMs;
  let best = params.gates[0];
  let bestD = 2;
  for (const g of params.gates) {
    const d = (g.pos - ph + 1) % 1;
    if (d < bestD) { bestD = d; best = g; }
  }
  return best.open[0];
};

describe('gateAt', () => {
  it('acusa o vao pelo angulo, com a largura que a tela desenha', () => {
    expect(gateAt(base, 125)).toBe(0);
    expect(gateAt(base, 125 + 40)).toBe(0);
    expect(gateAt(base, 125 + 60)).toBeNull();
    expect(gateAt(base, 375)).toBe(1);
  });

  it('o vao fecha em volta do zero sem descontinuidade', () => {
    const p = { ...base, gates: [{ pos: 0, open: [0] }] };
    expect(gateAt(p, 20)).toBe(0);
    expect(gateAt(p, 980)).toBe(0);
    expect(gateAt(p, 500)).toBeNull();
  });
});

describe('stepDodge', () => {
  it('parado NUNCA pesca, por mais que gire', () => {
    const s = play(base, (_t, a) => a, 60000);
    expect(s.done).toBeNull();
    expect(s.streak).toBeLessThan(base.cleanToCatch);
  });

  it('trocar de rota na hora certa pesca, e com qualidade cheia', () => {
    const s = play(base, perfect(base));
    expect(s.done?.caught).toBe(true);
    expect(s.done?.quality).toBe(1);
    expect(s.bumps).toBe(0);
  });

  it('cair zera a sequencia em vez de descontar dela', () => {
    let s = startDodge(base);
    // entra no primeiro vao pela pista errada: cai
    s = switchLane(base, s); // pista 1, e o portao 0 so abre a 0
    s = stepDodge(base, s, 125);
    expect(s.bumps).toBe(1);
    expect(s.streak).toBe(0);
  });

  it('uma queda por vao visitado, nao uma por quadro', () => {
    let s = startDodge(base);
    s = switchLane(base, s);
    for (let t = 105; t <= 145; t += 5) s = stepDodge(base, s, t);
    expect(s.bumps).toBe(1);
  });

  it('bumpsAllowed 0 perde o peixe na primeira queda', () => {
    const p = { ...base, bumpsAllowed: 0 };
    let s = startDodge(p);
    s = switchLane(p, s);
    s = stepDodge(p, s, 125);
    expect(s.done?.caught).toBe(false);
  });

  it('bumpsAllowed null nunca perde: o raso ensina sem tirar o peixe', () => {
    const s = play(base, () => 1, 30000);
    expect(s.done).toBeNull();
    expect(s.bumps).toBeGreaterThan(3);
  });

  it('qualidade e a limpeza da luta, e o topo sai de jogo perfeito', () => {
    const s = play(base, perfect(base));
    expect(s.done?.quality).toBe(1);
  });

  it('nao muda o estado recebido', () => {
    const s = startDodge(base);
    const copia = { ...s };
    stepDodge(base, s, 125);
    expect(s).toEqual(copia);
  });
});
