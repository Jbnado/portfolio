import type { ParamsSustentacao, Resultado } from '../tipos';

export type EstadoSustentacao = {
  /** Centro da faixa do jogador, 0..1. */
  faixaPos: number;
  faixaVel: number;
  peixePos: number;
  peixeAlvo: number;
  /** Tempo restante ate o peixe sortear novo alvo, em ms. */
  peixeEspera: number;
  progresso: number;
  /** Milissegundos com o peixe DENTRO da faixa, e o total da luta. A razao
      entre os dois e a pericia: quem segurou o peixe dentro o tempo todo
      pesca grande. Isto existe porque progresso sozinho nao serve — ele e
      travado em [0,1] antes do teste de captura, entao na hora de fisgar ele
      vale exatamente 1 sempre, e a qualidade seria constante. */
  msDentro: number;
  msTotal: number;
  terminado: Resultado | null;
};

const ESPERA_POR_PADRAO = { calmo: 1400, erratico: 700, arisco: 320 } as const;

export function iniciarSustentacao(params: ParamsSustentacao): EstadoSustentacao {
  return {
    faixaPos: 0.5,
    faixaVel: 0,
    peixePos: 0.5,
    peixeAlvo: 0.5,
    peixeEspera: ESPERA_POR_PADRAO[params.padrao],
    progresso: 0.5,
    msDentro: 0,
    msTotal: 0,
    terminado: null,
  };
}

const prender = (v: number) => Math.min(1, Math.max(0, v));

export function avancarSustentacao(
  params: ParamsSustentacao,
  estado: EstadoSustentacao,
  dtMs: number,
  segurando: boolean,
  rnd: () => number,
): EstadoSustentacao {
  if (estado.terminado) return estado;

  // Faixa: controle direto do jogador.
  const acel = segurando ? params.impulso : -params.gravidade;
  let faixaVel = estado.faixaVel + acel * dtMs;
  let faixaPos = estado.faixaPos + faixaVel * dtMs;
  if (faixaPos <= 0 || faixaPos >= 1) faixaVel = 0;
  faixaPos = prender(faixaPos);

  // Peixe: mira um alvo, sorteia outro quando a espera acaba.
  let { peixeAlvo, peixeEspera } = estado;
  peixeEspera -= dtMs;
  if (peixeEspera <= 0) {
    peixeAlvo = rnd();
    peixeEspera = ESPERA_POR_PADRAO[params.padrao];
  }
  const passo = params.velocidadePeixe * dtMs;
  const delta = peixeAlvo - estado.peixePos;
  const peixePos = prender(
    Math.abs(delta) <= passo ? peixeAlvo : estado.peixePos + Math.sign(delta) * passo,
  );

  // Progresso.
  const meia = params.alturaFaixa / 2;
  const dentro = Math.abs(peixePos - faixaPos) <= meia;
  const progresso = prender(
    estado.progresso + (dentro ? params.encher : -params.drenar) * dtMs,
  );

  const msTotal = estado.msTotal + dtMs;
  const msDentro = estado.msDentro + (dentro ? dtMs : 0);

  let terminado: Resultado | null = null;
  if (progresso >= 1) {
    terminado = { pego: true, qualidade: msTotal > 0 ? msDentro / msTotal : 0 };
  } else if (progresso <= 0) {
    terminado = { pego: false, qualidade: 0 };
  }

  return {
    faixaPos, faixaVel, peixePos, peixeAlvo, peixeEspera,
    progresso, msDentro, msTotal, terminado,
  };
}
