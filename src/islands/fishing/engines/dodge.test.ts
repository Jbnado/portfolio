import { describe, it, expect } from 'vitest';
import type { DodgeParams } from '../types';
import { startDodge, switchLane, stepDodge, gateAt, makeGates, LANES } from './dodge';

const base: DodgeParams = {
  periodMs: 2000, gatesMin: 4, gatesMax: 4,
  gapMin: 0.08, gapMax: 0.08, holdMs: 4000, penaltyMs: 1500, fallsToLose: null, zeroesToLose: null,
};

function lcg(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

/** Roda o lance com um jogador que troca de pista a tempo, ou nunca troca. */
function play(params: DodgeParams, troca: boolean, maxMs = 60000) {
  let s = startDodge(params, lcg(9));
  for (let t = 0; !s.done && t < maxMs; t += 10) {
    if (troca && gateAt(params, s.gates, t) === null) {
      // Pista do proximo vao: quem joga bem se compromete antes de chegar.
      const ph = (t % params.periodMs) / params.periodMs;
      let alvo = s.gates[0], bd = 2;
      for (const g of s.gates) { const d = (g.pos - ph + 1) % 1; if (d < bd) { bd = d; alvo = g; } }
      if (s.lane !== alvo.open) s = switchLane(s);
    }
    s = stepDodge(params, s, t);
  }
  return s;
}

describe('makeGates', () => {
  it('sorteia a quantidade dentro do intervalo pedido', () => {
    const p = { ...base, gatesMin: 4, gatesMax: 6 };
    const vistos = new Set<number>();
    for (let i = 0; i < 60; i++) vistos.add(makeGates(p, lcg(i)).length);
    for (const n of vistos) { expect(n).toBeGreaterThanOrEqual(4); expect(n).toBeLessThanOrEqual(6); }
    expect(vistos.size).toBeGreaterThan(1);
  });

  it('sorteia larguras dentro do intervalo pedido', () => {
    const p = { ...base, gapMin: 0.06, gapMax: 0.12 };
    for (const g of makeGates(p, lcg(3))) {
      expect(g.width).toBeGreaterThanOrEqual(0.06);
      expect(g.width).toBeLessThanOrEqual(0.12);
    }
  });

  it('as pistas abertas alternam, entao todo vao obriga a trocar', () => {
    const gates = makeGates(base, lcg(5));
    gates.forEach((g, i) => expect(g.open).toBe(i % LANES));
  });

  it('os vaos nunca se sobrepoem', () => {
    for (let seed = 0; seed < 40; seed++) {
      const gates = makeGates({ ...base, gatesMin: 6, gatesMax: 6, gapMin: 0.1, gapMax: 0.1 }, lcg(seed));
      for (let i = 0; i < gates.length; i++) {
        for (let j = i + 1; j < gates.length; j++) {
          const d = Math.abs(gates[i].pos - gates[j].pos);
          const circular = Math.min(d, 1 - d);
          expect(circular).toBeGreaterThan((gates[i].width + gates[j].width) / 2);
        }
      }
    }
  });

  it('cada lance sorteia um anel diferente', () => {
    const a = makeGates(base, lcg(1)).map((g) => g.pos).join();
    const b = makeGates(base, lcg(2)).map((g) => g.pos).join();
    expect(a).not.toBe(b);
  });
});

describe('stepDodge', () => {
  it('parado NUNCA fisga, por mais que gire', () => {
    const s = play(base, false);
    expect(s.done).toBeNull();
    expect(s.cleanMs).toBeLessThan(base.holdMs);
  });

  it('trocar a tempo enche a barrinha e fisga', () => {
    const s = play(base, true);
    expect(s.done?.caught).toBe(true);
    expect(s.bumps).toBe(0);
  });

  it('quem nao cai gasta o tempo minimo e tira qualidade cheia', () => {
    const s = play(base, true);
    expect(s.done!.quality).toBeCloseTo(1, 1);
  });

  it('cair RECUA a barrinha em penaltyMs, sem zerar', () => {
    let s = startDodge(base, lcg(9));
    const vao = s.gates.find((g) => g.open !== 0)!;
    const antes = stepDodge(base, s, 500);
    expect(antes.cleanMs).toBe(500);
    // instante exato do centro do vao fechado para a pista 0
    const t = vao.pos * base.periodMs;
    s = stepDodge(base, { ...antes, tMs: t - 20 }, t);
    expect(s.bumps).toBe(1);
    expect(s.cleanMs).toBe(0); // 500ms acumulados - 1500ms de recuo, travado em 0
  });

  it('o recuo desconta, e nao apaga, quando ha tempo acumulado', () => {
    const p = { ...base, penaltyMs: 1500 };
    let s = startDodge(p, lcg(9));
    const vao = s.gates.find((g) => g.open !== 0)!;
    const t = vao.pos * p.periodMs;
    const cheio = { ...s, cleanMs: 5000, tMs: t - 20 };
    const depois = stepDodge(p, cheio, t);
    expect(depois.cleanMs).toBe(3500);
  });

  it('tres quedas SEGUIDAS perdem o peixe', () => {
    // Quem fica PARADO nao serve de prova: com os vaos alternando, a pista
    // parada cai so a cada dois portoes e a sequencia nunca passa de 1. Quem
    // cai em fila e quem troca ATRASADO — erra o portao, troca, e o seguinte
    // ja pedia a outra pista. Esse cai em todos.
    const p = { ...base, fallsToLose: 3 };
    let s = startDodge(p, lcg(9));
    const emOrdem = [...s.gates].sort((a, b) => a.pos - b.pos).slice(0, 3);
    for (const g of emOrdem) {
      // entra no vao sempre na pista ERRADA
      if (s.lane === g.open) s = switchLane(s);
      s = stepDodge(p, { ...s, tMs: g.pos * p.periodMs - 30 }, g.pos * p.periodMs);
      if (s.done) break;
    }
    expect(s.streakFalls).toBe(3);
    expect(s.done?.caught).toBe(false);
  });

  it('passar limpo por um vao zera a contagem de seguidas', () => {
    const p = { ...base, fallsToLose: 3 };
    let s = startDodge(p, lcg(9));
    const fechado = s.gates.find((g) => g.open !== 0)!;
    const aberto = s.gates.find((g) => g.open === 0)!;
    s = stepDodge(p, { ...s, tMs: fechado.pos * p.periodMs - 20 }, fechado.pos * p.periodMs);
    expect(s.streakFalls).toBe(1);
    // atravessa um vao aberto para esta pista, inteiro
    s = stepDodge(p, s, aberto.pos * p.periodMs);
    s = stepDodge(p, s, aberto.pos * p.periodMs + aberto.width * p.periodMs);
    expect(s.streakFalls).toBe(0);
  });

  it('uma queda por vao visitado, nao uma por quadro', () => {
    let s = startDodge(base, lcg(9));
    const vao = s.gates.find((g) => g.open !== 0)!;
    const t = vao.pos * base.periodMs;
    for (let k = -20; k <= 20; k += 5) s = stepDodge(base, s, t + k);
    expect(s.bumps).toBe(1);
  });

  it('fallsToLose null nunca perde o peixe', () => {
    const s = play(base, false);
    expect(s.done).toBeNull();
    expect(s.bumps).toBeGreaterThan(3);
  });

  it('nao muda o estado recebido', () => {
    const s = startDodge(base, lcg(9));
    const copia = JSON.stringify(s);
    stepDodge(base, s, 500);
    expect(JSON.stringify(s)).toBe(copia);
  });
});

describe('zerar a barrinha', () => {
  const base2: DodgeParams = {
    periodMs: 2000, gatesMin: 4, gatesMax: 4, gapMin: 0.08, gapMax: 0.08,
    holdMs: 8000, penaltyMs: 2000, fallsToLose: null, zeroesToLose: 2,
  };

  it('so conta zerada quando a barra TINHA tempo acumulado', () => {
    let s = startDodge(base2, lcg(9));
    const vao = s.gates.find((g) => g.open !== 0)!;
    const t = vao.pos * base2.periodMs;
    // barra ja em zero: cair de novo nao conta como "zerou"
    s = stepDodge(base2, { ...s, cleanMs: 0, tMs: t - 30 }, t);
    expect(s.zeroed).toBe(0);
  });

  it('zerar duas vezes perde o peixe', () => {
    const emOrdem = [...startDodge(base2, lcg(9)).gates].sort((a, b) => a.pos - b.pos);
    let s = startDodge(base2, lcg(9));
    let zeradas = 0;
    for (const g of emOrdem) {
      if (s.done) break;
      if (s.lane === g.open) s = switchLane(s);
      // chega no vao com pouco tempo acumulado: a queda zera
      s = stepDodge(base2, { ...s, cleanMs: 500, tMs: g.pos * base2.periodMs - 30 }, g.pos * base2.periodMs);
      if (s.zeroed > zeradas) zeradas = s.zeroed;
    }
    expect(zeradas).toBeGreaterThanOrEqual(2);
    expect(s.done?.caught).toBe(false);
  });
});
