import type { PathKind, TrackParams, Result, Zone } from '../types';

export type TrackState = {
  hits: number;
  misses: number;
  activeZone: number;
  accuracies: number[];
  done: Result | null;
};

/** Posicao do indicador no caminho, em 0..1, no instante tMs. */
export function positionAt(params: TrackParams, tMs: number): number {
  const phase = (tMs % params.periodMs) / params.periodMs;
  // Pendulo inverte no meio do periodo: 0 -> 1 -> 0, sem descontinuidade.
  if (params.path === 'pendulo') return phase < 0.5 ? phase * 2 : 2 - phase * 2;
  // Radial da a volta: 0.99 e 0.01 sao vizinhos no circulo, entao a fase pode
  // reiniciar sem que o olho veja um salto.
  return phase;
}

/** No radial a volta fecha, entao 0.05 e 0.95 distam 0.1 e nao 0.9. */
export function distanceToZone(path: PathKind, pos: number, zone: Zone): number {
  const d = Math.abs(pos - zone.pos);
  return path === 'radial' ? Math.min(d, 1 - d) : d;
}

export function startTrack(_params: TrackParams): TrackState {
  return { hits: 0, misses: 0, activeZone: 0, accuracies: [], done: null };
}

export function pressTrack(
  params: TrackParams,
  state: TrackState,
  tMs: number,
): TrackState {
  if (state.done) return state;

  const zone = params.zones[state.activeZone];
  const half = zone.size / 2;
  const dist = distanceToZone(params.path, positionAt(params, tMs), zone);

  if (dist > half) {
    const misses = state.misses + 1;
    const lost = params.tolerance !== null && misses > params.tolerance;
    return {
      ...state,
      misses,
      done: lost ? { caught: false, quality: 0 } : null,
    };
  }

  const accuracy = 1 - dist / half;
  const hits = state.hits + 1;
  const accuracies = [...state.accuracies, accuracy];
  const activeZone = params.alternates
    ? (state.activeZone + 1) % params.zones.length
    : state.activeZone;

  if (hits < params.hits) {
    return { ...state, hits, accuracies, activeZone, done: null };
  }

  const mean = accuracies.reduce((s, p) => s + p, 0) / accuracies.length;
  // Cada erro custa 15% da qualidade. Nao perde o peixe, perde tamanho.
  const quality = Math.max(0, Math.min(1, mean - state.misses * 0.15));
  return { ...state, hits, accuracies, activeZone, done: { caught: true, quality } };
}

/**
 * O indicador completou uma volta sem aperto. No v1 isso nao penaliza: existe
 * para a casca poder reagir (piscar a zona, por exemplo) sem inventar regra.
 */
export function lapCompleteTrack(
  _params: TrackParams,
  state: TrackState,
  _tMs: number,
): TrackState {
  return state;
}
