import type { DodgeParams, Result } from '../types';

export type DodgeState = {
  lane: number;
  /** Quedas no total. Alimenta a tolerancia e a qualidade. */
  bumps: number;
  /** Passagens limpas SEGUIDAS. Cair zera. E a sequencia que pesca. */
  streak: number;
  /** Passagens limpas no total, so para a qualidade. */
  cleanTotal: number;
  /** Ultimo instante ja processado, em ms desde o inicio do minigame. */
  tMs: number;
  /** Indice do vao em que o marcador esta AGORA, ou null fora de todos.
      A visita e a unidade do julgamento: entrar num vao abre uma, sair
      fecha. Sem isto, um vao com largura contaria uma queda por quadro. */
  visitGate: number | null;
  /** Se ja caiu nesta visita. Uma queda por vao visitado. */
  visitFell: boolean;
  done: Result | null;
};

/** Distancia angular no circulo: 0.02 e 0.98 distam 0.04, nao 0.96. */
function arcDist(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

/** Em qual vao o marcador esta no instante tMs, ou null. O vao tem LARGURA
    (params.gapWidth), a mesma que a tela desenha como buraco no anel: quem
    ve o marcador sobre o buraco ve exatamente o que o motor julga. */
export function gateAt(params: DodgeParams, tMs: number): number | null {
  const ph = (((tMs % params.periodMs) / params.periodMs) + 1) % 1;
  const half = params.gapWidth / 2;
  for (let i = 0; i < params.gates.length; i++) {
    if (arcDist(ph, params.gates[i].pos) <= half) return i;
  }
  return null;
}

export function startDodge(_params: DodgeParams): DodgeState {
  return {
    lane: 0, bumps: 0, streak: 0, cleanTotal: 0, tMs: 0,
    visitGate: null, visitFell: false, done: null,
  };
}

export function switchLane(params: DodgeParams, state: DodgeState): DodgeState {
  if (state.done) return state;
  return { ...state, lane: (state.lane + 1) % params.lanes };
}

/** Qualidade e a limpeza da luta: das passagens que voce tentou, quantas
    saiu inteiro. Jogo perfeito da exatamente 1, entao o topo da faixa de
    tamanho e alcancavel de verdade. */
function dodgeQuality(cleanTotal: number, bumps: number): number {
  const tries = cleanTotal + bumps;
  return tries > 0 ? cleanTotal / tries : 0;
}

export function stepDodge(
  params: DodgeParams,
  state: DodgeState,
  tMs: number,
): DodgeState {
  if (state.done) return state;

  const g = gateAt(params, tMs);
  let { visitGate, visitFell, streak, bumps, cleanTotal } = state;

  // Trocou de vao (ou saiu de um): fecha a visita anterior. Sair inteiro de
  // um vao e o que conta como passagem limpa.
  if (g !== visitGate) {
    if (visitGate !== null && !visitFell) {
      streak += 1;
      cleanTotal += 1;
    }
    visitGate = g;
    visitFell = false;
  }

  // Dentro do vao, na pista que quebra ali: cai. Cair ZERA a sequencia em
  // vez de descontar dela — sao tres limpas SEGUIDAS que pescam.
  if (
    visitGate !== null &&
    !visitFell &&
    !params.gates[visitGate].open.includes(state.lane)
  ) {
    visitFell = true;
    bumps += 1;
    streak = 0;
  }

  const next = { ...state, tMs, visitGate, visitFell, streak, bumps, cleanTotal };

  if (params.bumpsAllowed !== null && bumps > params.bumpsAllowed) {
    return { ...next, done: { caught: false, quality: dodgeQuality(cleanTotal, bumps) } };
  }
  if (streak >= params.cleanToCatch) {
    return { ...next, done: { caught: true, quality: dodgeQuality(cleanTotal, bumps) } };
  }
  return next;
}
