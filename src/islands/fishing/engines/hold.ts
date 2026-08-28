import type { HoldParams, Result } from '../types';

export type HoldState = {
  /** Centro da faixa do jogador, 0..1. */
  bandPos: number;
  bandVel: number;
  fishPos: number;
  fishTarget: number;
  /** Tempo restante ate o peixe sortear novo alvo, em ms. */
  fishWait: number;
  progress: number;
  /** Milissegundos com o peixe DENTRO da faixa, e o total da luta. A razao
      entre os dois e a pericia: quem segurou o peixe dentro o tempo todo
      pesca grande. Isto existe porque progresso sozinho nao serve — ele e
      travado em [0,1] antes do teste de captura, entao na hora de fisgar ele
      vale exatamente 1 sempre, e a qualidade seria constante. */
  msInside: number;
  msTotal: number;
  done: Result | null;
};

const WAIT_BY_PATTERN = { calmo: 1400, erratico: 700, arisco: 320 } as const;

export function startHold(params: HoldParams): HoldState {
  return {
    bandPos: 0.5,
    bandVel: 0,
    fishPos: 0.5,
    fishTarget: 0.5,
    fishWait: WAIT_BY_PATTERN[params.pattern],
    progress: 0.5,
    msInside: 0,
    msTotal: 0,
    done: null,
  };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function stepHold(
  params: HoldParams,
  state: HoldState,
  dtMs: number,
  holding: boolean,
  rnd: () => number,
): HoldState {
  if (state.done) return state;

  // Faixa: controle direto do jogador.
  const accel = holding ? params.lift : -params.gravity;
  let bandVel = state.bandVel + accel * dtMs;
  let bandPos = state.bandPos + bandVel * dtMs;
  if (bandPos <= 0 || bandPos >= 1) bandVel = 0;
  bandPos = clamp(bandPos);

  // Peixe: mira um alvo, sorteia outro quando a espera acaba.
  let { fishTarget, fishWait } = state;
  fishWait -= dtMs;
  if (fishWait <= 0) {
    fishTarget = rnd();
    fishWait = WAIT_BY_PATTERN[params.pattern];
  }
  const step = params.fishSpeed * dtMs;
  const delta = fishTarget - state.fishPos;
  const fishPos = clamp(
    Math.abs(delta) <= step ? fishTarget : state.fishPos + Math.sign(delta) * step,
  );

  // Progresso.
  const half = params.bandHeight / 2;
  const inside = Math.abs(fishPos - bandPos) <= half;
  const progress = clamp(
    state.progress + (inside ? params.fillRate : -params.drainRate) * dtMs,
  );

  const msTotal = state.msTotal + dtMs;
  const msInside = state.msInside + (inside ? dtMs : 0);

  let done: Result | null = null;
  if (progress >= 1) {
    done = { caught: true, quality: msTotal > 0 ? msInside / msTotal : 0 };
  } else if (progress <= 0) {
    done = { caught: false, quality: 0 };
  }

  return {
    bandPos, bandVel, fishPos, fishTarget, fishWait,
    progress, msInside, msTotal, done,
  };
}
