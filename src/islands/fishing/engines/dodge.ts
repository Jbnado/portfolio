import type { DodgeParams, Gate, Result } from '../types';

export type DodgeState = {
  lane: number;
  bumps: number;
  /** Ultimo instante ja processado, em ms desde o inicio do minigame. */
  tMs: number;
  done: Result | null;
};

export function startDodge(_params: DodgeParams): DodgeState {
  return { lane: 0, bumps: 0, tMs: 0, done: null };
}

export function switchLane(
  params: DodgeParams,
  state: DodgeState,
): DodgeState {
  if (state.done) return state;
  return { ...state, lane: (state.lane + 1) % params.lanes };
}

/**
 * Portoes cruzados no intervalo (fromMs, toMs]. O indicador da voltas, entao o
 * intervalo pode atravessar o fim de uma volta e cobrir mais de uma.
 */
export function gatesCrossed(
  params: DodgeParams,
  fromMs: number,
  toMs: number,
): Gate[] {
  const found: Gate[] = [];
  const lapFrom = Math.floor(fromMs / params.periodMs);
  const lapTo = Math.floor(toMs / params.periodMs);
  for (let lap = lapFrom; lap <= lapTo; lap++) {
    for (const gate of params.gates) {
      const instant = (lap + gate.pos) * params.periodMs;
      if (instant > fromMs && instant <= toMs) found.push(gate);
    }
  }
  return found;
}

export function stepDodge(
  params: DodgeParams,
  state: DodgeState,
  tMs: number,
): DodgeState {
  if (state.done) return state;

  let bumps = state.bumps;
  for (const gate of gatesCrossed(params, state.tMs, tMs)) {
    if (!gate.open.includes(state.lane)) bumps++;
  }

  if (params.bumpsAllowed !== null && bumps > params.bumpsAllowed) {
    return { ...state, bumps, tMs, done: { caught: false, quality: 0 } };
  }

  const endMs = params.lapsToCatch * params.periodMs;
  if (tMs >= endMs) {
    // Cada batida custa 30% da qualidade.
    const quality = Math.max(0, Math.min(1, 1 - bumps * 0.3));
    return { ...state, bumps, tMs, done: { caught: true, quality } };
  }

  return { ...state, bumps, tMs, done: null };
}
