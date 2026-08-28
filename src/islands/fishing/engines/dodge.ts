import type { DodgeParams, Gate, Result } from '../types';

export type DodgeState = {
  lane: number;
  bumps: number;
  /** Ultimo instante ja processado, em ms desde o inicio do minigame. */
  tMs: number;
  /** Instante da ultima troca de pista. Comeca em 0: a pista inicial conta
      como escolhida desde o comeco, entao um peixe cuja pista nunca precisa
      trocar nao e penalizado por "nunca ter trocado". */
  lastSwitchMs: number;
  /** Instante do ultimo portao ja processado (limpo ou batido). Comeca em 0,
      mesma convencao de lastSwitchMs: antes do primeiro portao, o unico
      "portao anterior" possivel e o proprio comeco do lance. Existe pra
      normalizar a folga de cada portao contra o espaco REAL ate o anterior
      (achado C2), e nao contra periodMs — o espacamento entre portoes e
      quase sempre menor que uma volta inteira, entao normalizar por periodMs
      criava um teto inatingivel mesmo jogando perfeito. */
  lastGateMs: number;
  /** Soma e contagem da folga (ja normalizada 0..1 por portao) medida em
      cada passagem limpa: quanto da janela disponivel desde o portao
      anterior o jogador ja estava comprometido com a pista certa. A media
      vira o termo continuo de qualidade (achado I2) — sem ele, so a
      contagem de batidas decidia, e ela e inteira: cinco valores possiveis,
      e o teto vira rotina assim que zera bumps. */
  clearRatioSum: number;
  clearCount: number;
  done: Result | null;
};

export function startDodge(_params: DodgeParams): DodgeState {
  return {
    lane: 0, bumps: 0, tMs: 0, lastSwitchMs: 0, lastGateMs: 0,
    clearRatioSum: 0, clearCount: 0, done: null,
  };
}

export function switchLane(
  params: DodgeParams,
  state: DodgeState,
  tMs: number,
): DodgeState {
  if (state.done) return state;
  return { ...state, lane: (state.lane + 1) % params.lanes, lastSwitchMs: tMs };
}

type GateEvent = { gate: Gate; instant: number };

/** Portoes cruzados no intervalo (fromMs, toMs], com o instante exato de cada
    cruzamento. O indicador da voltas, entao o intervalo pode atravessar o fim
    de uma volta e cobrir mais de uma. */
function crossedGateEvents(
  params: DodgeParams,
  fromMs: number,
  toMs: number,
): GateEvent[] {
  const found: GateEvent[] = [];
  const lapFrom = Math.floor(fromMs / params.periodMs);
  const lapTo = Math.floor(toMs / params.periodMs);
  for (let lap = lapFrom; lap <= lapTo; lap++) {
    for (const gate of params.gates) {
      const instant = (lap + gate.pos) * params.periodMs;
      if (instant > fromMs && instant <= toMs) found.push({ gate, instant });
    }
  }
  return found;
}

export function gatesCrossed(
  params: DodgeParams,
  fromMs: number,
  toMs: number,
): Gate[] {
  return crossedGateEvents(params, fromMs, toMs).map((e) => e.gate);
}

/** Compoe a penalidade por batida com a folga media (achado I2): passar mais
    limpo — pista escolhida com antecedencia, nao trocada em cima da hora —
    rende peixe maior, e o teto (1) so sai quando as duas coisas batem: zero
    batidas E folga maxima em toda passagem. Usada tanto na captura quanto na
    perda (achado I3): um peixe resgatado no modo garantido reflete a luta em
    vez de sair sempre do tamanho minimo. */
function dodgeQuality(
  bumps: number,
  clearRatioSum: number,
  clearCount: number,
): number {
  const bumpPenalty = Math.max(0, 1 - bumps * 0.3);
  const precision = clearCount > 0 ? clearRatioSum / clearCount : 1;
  return Math.max(0, Math.min(1, bumpPenalty * precision));
}

export function stepDodge(
  params: DodgeParams,
  state: DodgeState,
  tMs: number,
): DodgeState {
  if (state.done) return state;

  let bumps = state.bumps;
  let lastGateMs = state.lastGateMs;
  let clearRatioSum = state.clearRatioSum;
  let clearCount = state.clearCount;
  for (const { gate, instant } of crossedGateEvents(params, state.tMs, tMs)) {
    // Teto real de folga (achado C2): o espaco disponivel e o tempo desde o
    // portao ANTERIOR, nao periodMs — uma volta quase sempre cabe varios
    // portoes, entao periodMs e um teto que jogar perfeito nunca alcanca.
    const sincePrevGate = instant - lastGateMs;
    if (gate.open.includes(state.lane)) {
      // Teto: comprometido desde o portao anterior ja conta como maximamente
      // limpo, alem disso mais antecedencia nao soma.
      const clearance = Math.min(sincePrevGate, Math.max(0, instant - state.lastSwitchMs));
      clearRatioSum += sincePrevGate > 0 ? clearance / sincePrevGate : 1;
      clearCount++;
    } else {
      bumps++;
    }
    lastGateMs = instant;
  }

  if (params.bumpsAllowed !== null && bumps > params.bumpsAllowed) {
    const quality = dodgeQuality(bumps, clearRatioSum, clearCount);
    return { ...state, bumps, tMs, lastGateMs, clearRatioSum, clearCount, done: { caught: false, quality } };
  }

  const endMs = params.lapsToCatch * params.periodMs;
  if (tMs >= endMs) {
    const quality = dodgeQuality(bumps, clearRatioSum, clearCount);
    return { ...state, bumps, tMs, lastGateMs, clearRatioSum, clearCount, done: { caught: true, quality } };
  }

  return { ...state, bumps, tMs, lastGateMs, clearRatioSum, clearCount, done: null };
}
