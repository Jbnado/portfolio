import type { TrackParams, Result } from '../types';

export type TrackState = {
  hits: number;
  misses: number;
  /** Centro da zona verde AGORA. Pula de lugar a cada acerto: nao da pra
      decorar o ritmo da barra, tem que reencontrar o alvo toda vez. */
  zonePos: number;
  accuracies: number[];
  done: Result | null;
};

/** Posicao do marcador na barra, 0..1, no instante tMs. Vai e volta sem
    descontinuidade: 0 -> 1 -> 0. E o unico caminho do TRAJETO — o anel
    pertence a DRAGAGEM, e minigame nao empresta a forma do outro. */
export function positionAt(params: TrackParams, tMs: number): number {
  const phase = (tMs % params.periodMs) / params.periodMs;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

/** Sorteia o centro da zona de modo que ela caiba INTEIRA na barra: sem isto
    uma zona sorteada na ponta sairia pela borda e valeria menos que as
    outras, e a dificuldade deixaria de ser so o tamanho. */
export function pickZone(params: TrackParams, rnd: () => number): number {
  const half = params.zoneSize / 2;
  return half + rnd() * (1 - params.zoneSize);
}

/** Zero exato e inatingivel a 60fps: no peixe mais rapido o quantum de
    posicao por quadro ja passa da folga que "distancia zero" exigiria.
    Qualquer distancia abaixo deste limiar conta como acerto perfeito, entao
    o teto de qualidade fica alcancavel de verdade. */
const PERFECT_DIST = 0.025;

function accuracyOf(dist: number, half: number): number {
  const denom = half - PERFECT_DIST;
  return dist <= PERFECT_DIST || denom <= 0 ? 1 : 1 - (dist - PERFECT_DIST) / denom;
}

function meanAccuracy(a: number[]): number {
  return a.length > 0 ? a.reduce((s, p) => s + p, 0) / a.length : 0;
}

export function startTrack(params: TrackParams, rnd: () => number): TrackState {
  return { hits: 0, misses: 0, zonePos: pickZone(params, rnd), accuracies: [], done: null };
}

export function pressTrack(
  params: TrackParams,
  state: TrackState,
  tMs: number,
  rnd: () => number,
): TrackState {
  if (state.done) return state;

  const half = params.zoneSize / 2;
  const dist = Math.abs(positionAt(params, tMs) - state.zonePos);

  if (dist > half) {
    const misses = state.misses + 1;
    const lost = params.tolerance !== null && misses > params.tolerance;
    // Perda preserva a media acumulada e aplica o MESMO desconto por erro do
    // caminho de vitoria: perder nunca pode render peixe maior que vencer.
    const quality = Math.max(0, Math.min(1, meanAccuracy(state.accuracies) - misses * 0.15));
    return { ...state, misses, done: lost ? { caught: false, quality } : null };
  }

  const hits = state.hits + 1;
  const accuracies = [...state.accuracies, accuracyOf(dist, half)];
  const zonePos = pickZone(params, rnd);

  if (hits < params.hits) return { ...state, hits, accuracies, zonePos, done: null };

  // Cada erro custa 15% da qualidade. Nao perde o peixe, perde tamanho.
  const quality = Math.max(0, Math.min(1, meanAccuracy(accuracies) - state.misses * 0.15));
  return { ...state, hits, accuracies, zonePos, done: { caught: true, quality } };
}
