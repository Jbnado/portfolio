import type { DodgeParams, Gate, Result } from '../types';

/** Sempre duas pistas, por decisao do dono. O que muda entre as faixas e a
    velocidade da volta e quantos vaos obrigam a trocar de pista. */
export const LANES = 2;

/** Folga minima entre a borda de um vao e a do vizinho, em fracao da volta.
    Sem ela dois vaos sorteados podem colar e exigir uma troca em poucos
    milissegundos — isso nao e dificuldade, e sorte. */
const MIN_SEP = 0.05;

/** Quanto da barra precisa ter subido para uma zerada CONTAR como progresso
    perdido. Sem isto a regra punia o comeco: a barra nasce em zero, entao as
    primeiras tropecadas zeravam de graca e duas delas acabavam com o lance
    antes de o jogador ter chegado a lugar nenhum. */
const ZERO_MIN = 0.35;

export type DodgeState = {
  lane: number;
  /** Quedas no total, so para a qualidade. */
  bumps: number;
  /** Quedas SEGUIDAS. Passar limpo por um vao zera. Perde o peixe. */
  streakFalls: number;
  /** Quantas vezes a barrinha ja voltou a zero DEPOIS de ter chegado a
      algum lugar. Zerar uma barra que nunca subiu nao conta: nao e perder
      progresso, e so o comeco da luta. */
  zeroed: number;
  /** Maior cleanMs desde a ultima zerada. E ele que decide se a zerada
      conta — nao o valor no instante da queda, que e sempre pequeno por
      construcao (a barra so chega a zero quando ja estava abaixo do recuo). */
  peak: number;
  /** Os vaos deste lance: sorteados na largada, nao fixos no peixe. */
  gates: Gate[];
  /** Milissegundos limpos SEGUIDOS. Cair zera. Chegar em holdMs fisga. */
  cleanMs: number;
  tMs: number;
  /** Vao em que o marcador esta AGORA, ou null. A visita e a unidade do
      julgamento: sem ela um vao com largura contaria uma queda por quadro. */
  visitGate: number | null;
  visitFell: boolean;
  done: Result | null;
};

/** Distancia angular no circulo: 0.02 e 0.98 distam 0.04, nao 0.96. */
function arcDist(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

/** Sorteia os vaos do lance. As pistas abertas alternam, entao cada vao
    obriga uma troca; a posicao e a largura e que variam. Cada vao nasce
    dentro da sua fatia da volta, com folga para nao encostar no vizinho:
    assim "estao perto ou longe" muda a cada lance sem virar armadilha. */
export function makeGates(params: DodgeParams, rnd: () => number): Gate[] {
  const span = params.gatesMax - params.gatesMin;
  const n = params.gatesMin + Math.floor(rnd() * (span + 1));
  const slot = 1 / n;
  const gates: Gate[] = [];
  for (let i = 0; i < n; i++) {
    const width = params.gapMin + rnd() * (params.gapMax - params.gapMin);
    const room = Math.max(0, slot - width - MIN_SEP);
    const pos = (i + 0.5) * slot + (rnd() - 0.5) * room;
    gates.push({ pos: (pos + 1) % 1, width, open: i % LANES });
  }
  return gates;
}

/** Em qual vao o marcador esta no instante tMs, ou null. O vao tem largura, a
    mesma que a tela desenha como buraco: quem ve o marcador sobre o buraco ve
    exatamente o que o motor julga. */
export function gateAt(
  params: DodgeParams,
  gates: Gate[],
  tMs: number,
): number | null {
  const ph = (((tMs % params.periodMs) / params.periodMs) + 1) % 1;
  for (let i = 0; i < gates.length; i++) {
    if (arcDist(ph, gates[i].pos) <= gates[i].width / 2) return i;
  }
  return null;
}

export function startDodge(
  params: DodgeParams,
  rnd: () => number = Math.random,
): DodgeState {
  return {
    lane: 0, bumps: 0, streakFalls: 0, zeroed: 0, peak: 0, gates: makeGates(params, rnd), cleanMs: 0, tMs: 0,
    visitGate: null, visitFell: false, done: null,
  };
}

export function switchLane(state: DodgeState): DodgeState {
  if (state.done) return state;
  return { ...state, lane: (state.lane + 1) % LANES };
}

/** Qualidade e o quanto da luta foi a arrancada final: quem puxou sem cair
    gasta exatamente holdMs e tira 1. Cada queda alonga a luta e encolhe o
    peixe, sem degrau — resolve a saturacao que a regra antiga tinha, onde
    jogar limpo dava sempre o tamanho maximo. */
function dodgeQuality(params: DodgeParams, cleanMs: number, tMs: number): number {
  if (tMs <= 0) return 0;
  return Math.max(0, Math.min(1, Math.max(cleanMs, params.holdMs) / tMs));
}

export function stepDodge(
  params: DodgeParams,
  state: DodgeState,
  tMs: number,
): DodgeState {
  if (state.done) return state;

  const dt = Math.max(0, tMs - state.tMs);
  const g = gateAt(params, state.gates, tMs);
  let { visitGate, visitFell, bumps, streakFalls, zeroed, peak, cleanMs } = state;

  if (g !== visitGate) {
    // Saiu de um vao sem cair: a sequencia de quedas zera. E isso que faz
    // "tres seguidas" significar seguidas, e nao tres no lance inteiro.
    if (visitGate !== null && !visitFell) streakFalls = 0;
    visitGate = g;
    visitFell = false;
  }

  const caiu =
    visitGate !== null && !visitFell && state.gates[visitGate].open !== state.lane;

  if (caiu) {
    visitFell = true;
    bumps += 1;
    streakFalls += 1;
    // Errou: a barrinha RECUA. O peixe puxou de volta um pedaco.
    const recuado = Math.max(0, cleanMs - params.penaltyMs);
    if (recuado === 0) {
      if (peak >= params.holdMs * ZERO_MIN) zeroed += 1;
      peak = 0;
    }
    cleanMs = recuado;
  } else {
    cleanMs += dt;
    if (cleanMs > peak) peak = cleanMs;
  }

  const next = { ...state, tMs, visitGate, visitFell, bumps, streakFalls, zeroed, peak, cleanMs };

  // Duas portas de saida: cair varias vezes em fila, ou a barrinha zerar
  // vezes demais. A primeira pega quem se perdeu no ritmo; a segunda pega
  // quem cai espacado e nunca junta uma sequencia, mas tambem nao progride.
  const perdeu =
    (params.fallsToLose !== null && streakFalls >= params.fallsToLose) ||
    (params.zeroesToLose !== null && zeroed >= params.zeroesToLose);
  if (perdeu) {
    return { ...next, done: { caught: false, quality: dodgeQuality(params, cleanMs, tMs) } };
  }
  if (cleanMs >= params.holdMs) {
    return { ...next, done: { caught: true, quality: dodgeQuality(params, cleanMs, tMs) } };
  }
  return next;
}
