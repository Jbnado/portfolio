import type { HoldParams, Result } from '../types';

export type HoldState = {
  /** Centro da faixa do jogador, 0..1. */
  bandPos: number;
  bandVel: number;
  /** Posicao continua do peixe, nunca quantizada. E a base da integracao do
      proximo passo (achado C1 do rereview): quantizar isto travava o peixe,
      porque o avanco maximo por quadro (fishSpeed * dt) fica bem abaixo de
      meio degrau, entao Math.round sempre voltava pro mesmo ponto e nada
      fazia o peixe sair dali — sob movimento reduzido o SUSTENTACAO parava
      de existir. */
  fishPos: number;
  /** Posicao que decide "dentro da faixa" e que a vista desenha. Sem
      quantizacao e igual a fishPos; com quantizacao (movimento reduzido) e o
      degrau mais proximo — a mesma posicao que o jogador ve decide o teste,
      nunca uma continua escondida por baixo dela (achado I1, preservado). */
  fishDrawPos: number;
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
  /** Milissegundos acumulados com a barra em zero. Volta a zero assim que o
      progresso sobe: recuperou, recuperou de verdade. */
  msAtZero: number;
  done: Result | null;
};

const WAIT_BY_PATTERN = { calmo: 1400, erratico: 700, arisco: 320 } as const;

export function startHold(params: HoldParams): HoldState {
  return {
    bandPos: 0.5,
    bandVel: 0,
    fishPos: 0.5,
    fishDrawPos: 0.5,
    fishTarget: 0.5,
    fishWait: WAIT_BY_PATTERN[params.pattern],
    progress: 0.5,
    msInside: 0,
    msTotal: 0,
    msAtZero: 0,
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
  /** Passos de degrau do movimento reduzido (achado I1). Quando definido,
      fishDrawPos (JULGAR "dentro da faixa" e o desenho da vista) arredonda
      pro degrau mais proximo. A integracao em si (fishPos) nunca quantiza —
      ver o comentario de fishPos em HoldState para o porque (achado C1). */
  quantizeSteps: number | null = null,
): HoldState {
  if (state.done) return state;

  // Faixa: controle direto do jogador.
  const accel = holding ? params.lift : -params.gravity;
  let bandVel = state.bandVel + accel * dtMs;
  bandVel = Math.min(params.maxSpeed, Math.max(-params.maxSpeed, bandVel));
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
  const fishDrawPos = quantizeSteps
    ? Math.round(fishPos * quantizeSteps) / quantizeSteps
    : fishPos;

  // Progresso.
  const half = params.bandHeight / 2;
  const inside = Math.abs(fishDrawPos - bandPos) <= half;
  const progress = clamp(
    state.progress + (inside ? params.fillRate : -params.drainRate) * dtMs,
  );

  const msTotal = state.msTotal + dtMs;
  const msInside = state.msInside + (inside ? dtMs : 0);
  const msAtZero = progress <= 0 ? state.msAtZero + dtMs : 0;

  let done: Result | null = null;
  if (progress >= 1) {
    done = { caught: true, quality: msTotal > 0 ? msInside / msTotal : 0 };
  } else if (params.graceMs !== null && msAtZero >= params.graceMs) {
    done = { caught: false, quality: msTotal > 0 ? msInside / msTotal : 0 };
  }

  return {
    bandPos, bandVel, fishPos, fishDrawPos, fishTarget, fishWait,
    progress, msInside, msTotal, msAtZero, done,
  };
}
