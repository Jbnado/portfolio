import type { HoldParams, Result } from '../types';

export type HoldState = {
  /** Centro da faixa do jogador, 0..1. */
  bandPos: number;
  bandVel: number;
  /** Posicao do peixe, 0..1. E a mesma que a vista desenha e a mesma que
      decide "dentro da faixa": o que se ve e o que se julga. */
  fishPos: number;
  /** Para onde o peixe esta indo AGORA: 1 sobe, -1 desce, 0 fica parado
      tremendo. Velocidade e constante — o que o sorteio decide e a direcao,
      nunca o quanto. Isto substituiu um modelo de "alvo sorteado": la o peixe
      alcancava o alvo e ficava IMOVEL ate o proximo sorteio, e como ele
      nascia em cima do proprio alvo, todo lance comecava com o peixe parado.
      Medido no modelo antigo: imovel em 45% dos quadros no p2 e 51% no p5. */
  fishDir: number;
  /** Tempo restante ate o peixe sortear nova direcao, em ms. */
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

/** Sorteia a proxima direcao entre descer, ficar parado e subir. Perto das
    bordas a direcao que empurraria pra fora sai do sorteio: sem isso o peixe
    encosta no topo e fica preso ate a troca seguinte, que e exatamente a
    queixa de "peixe parado" que este modelo veio consertar. */
function pickDir(pos: number, rnd: () => number): number {
  const options = pos > 0.97 ? [0, -1] : pos < 0.03 ? [0, 1] : [-1, 0, 1];
  return options[Math.min(options.length - 1, Math.floor(rnd() * options.length))];
}

export function startHold(params: HoldParams, rnd: () => number = Math.random): HoldState {
  return {
    bandPos: 0.5,
    bandVel: 0,
    fishPos: 0.5,
    fishDir: pickDir(0.5, rnd),
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
): HoldState {
  if (state.done) return state;

  // Faixa: controle direto do jogador.
  const accel = holding ? params.lift : -params.gravity;
  let bandVel = state.bandVel + accel * dtMs;
  bandVel = Math.min(params.maxSpeed, Math.max(-params.maxSpeed, bandVel));
  let bandPos = state.bandPos + bandVel * dtMs;
  if (bandPos <= 0 || bandPos >= 1) bandVel = 0;
  bandPos = clamp(bandPos);

  // Peixe: anda na direcao sorteada e so troca quando a espera acaba. Nunca
  // fica realmente imovel — "parado" e um tremor em torno do lugar, para ler
  // como peixe vivo e nao como jogo travado.
  let { fishDir, fishWait } = state;
  fishWait -= dtMs;
  if (fishWait <= 0) {
    fishDir = pickDir(state.fishPos, rnd);
    fishWait = WAIT_BY_PATTERN[params.pattern];
  }
  const step = params.fishSpeed * dtMs;
  const drift = fishDir === 0 ? (rnd() - 0.5) * step : fishDir * step;
  let fishPos = state.fishPos + drift;
  // Quica na borda em vez de encostar e esperar. pickDir so roda no fim da
  // espera, entao sem o quique o peixe que chega no topo no meio de uma
  // espera fica preso ali ate a proxima troca — 77 quadros imoveis em 600,
  // medido. Quicar devolve o movimento no quadro seguinte.
  if (fishPos <= 0 || fishPos >= 1) fishDir = -fishDir;
  fishPos = clamp(fishPos);
  // Progresso.
  const half = params.bandHeight / 2;
  const inside = Math.abs(fishPos - bandPos) <= half;
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
    bandPos, bandVel, fishPos, fishDir, fishWait,
    progress, msInside, msTotal, msAtZero, done,
  };
}
