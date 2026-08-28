import type { Caminho, ParamsTrajeto, Resultado, Zona } from '../tipos';

export type EstadoTrajeto = {
  acertos: number;
  erros: number;
  zonaAtiva: number;
  precisoes: number[];
  terminado: Resultado | null;
};

/** Posicao do indicador no caminho, em 0..1, no instante tMs. */
export function posicaoEm(params: ParamsTrajeto, tMs: number): number {
  const fase = (tMs % params.periodoMs) / params.periodoMs;
  if (params.caminho === 'pendulo') {
    return fase < 0.5 ? fase * 2 : 2 - fase * 2;
  }
  return fase;
}

/** No radial a volta fecha, entao 0.05 e 0.95 distam 0.1 e nao 0.9. */
export function distanciaAteZona(caminho: Caminho, pos: number, zona: Zona): number {
  const d = Math.abs(pos - zona.pos);
  return caminho === 'radial' ? Math.min(d, 1 - d) : d;
}

export function iniciarTrajeto(_params: ParamsTrajeto): EstadoTrajeto {
  return { acertos: 0, erros: 0, zonaAtiva: 0, precisoes: [], terminado: null };
}

export function apertarTrajeto(
  params: ParamsTrajeto,
  estado: EstadoTrajeto,
  tMs: number,
): EstadoTrajeto {
  if (estado.terminado) return estado;

  const zona = params.zonas[estado.zonaAtiva];
  const meia = zona.tamanho / 2;
  const dist = distanciaAteZona(params.caminho, posicaoEm(params, tMs), zona);

  if (dist > meia) {
    const erros = estado.erros + 1;
    const perdeu = params.tolerancia !== null && erros > params.tolerancia;
    return {
      ...estado,
      erros,
      terminado: perdeu ? { pego: false, qualidade: 0 } : null,
    };
  }

  const precisao = 1 - dist / meia;
  const acertos = estado.acertos + 1;
  const precisoes = [...estado.precisoes, precisao];
  const zonaAtiva = params.alternancia
    ? (estado.zonaAtiva + 1) % params.zonas.length
    : estado.zonaAtiva;

  if (acertos < params.acertos) {
    return { ...estado, acertos, precisoes, zonaAtiva, terminado: null };
  }

  const media = precisoes.reduce((s, p) => s + p, 0) / precisoes.length;
  // Cada erro custa 15% da qualidade. Nao perde o peixe, perde tamanho.
  const qualidade = Math.max(0, Math.min(1, media - estado.erros * 0.15));
  return { ...estado, acertos, precisoes, zonaAtiva, terminado: { pego: true, qualidade } };
}

/**
 * O indicador completou uma volta sem aperto. No v1 isso nao penaliza: existe
 * para a casca poder reagir (piscar a zona, por exemplo) sem inventar regra.
 */
export function voltaCompletaTrajeto(
  _params: ParamsTrajeto,
  estado: EstadoTrajeto,
  _tMs: number,
): EstadoTrajeto {
  return estado;
}
