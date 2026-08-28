import type { ParamsDragagem, Portao, Resultado } from '../tipos';

export type EstadoDragagem = {
  pista: number;
  batidas: number;
  /** Ultimo instante ja processado, em ms desde o inicio do minigame. */
  tMs: number;
  terminado: Resultado | null;
};

export function iniciarDragagem(_params: ParamsDragagem): EstadoDragagem {
  return { pista: 0, batidas: 0, tMs: 0, terminado: null };
}

export function trocarPistaDragagem(
  params: ParamsDragagem,
  estado: EstadoDragagem,
): EstadoDragagem {
  if (estado.terminado) return estado;
  return { ...estado, pista: (estado.pista + 1) % params.pistas };
}

/**
 * Portoes cruzados no intervalo (deMs, ateMs]. O indicador da voltas, entao o
 * intervalo pode atravessar o fim de uma volta e cobrir mais de uma.
 */
export function portoesCruzados(
  params: ParamsDragagem,
  deMs: number,
  ateMs: number,
): Portao[] {
  const achados: Portao[] = [];
  const voltaDe = Math.floor(deMs / params.periodoMs);
  const voltaAte = Math.floor(ateMs / params.periodoMs);
  for (let volta = voltaDe; volta <= voltaAte; volta++) {
    for (const portao of params.portoes) {
      const instante = (volta + portao.pos) * params.periodoMs;
      if (instante > deMs && instante <= ateMs) achados.push(portao);
    }
  }
  return achados;
}

export function avancarDragagem(
  params: ParamsDragagem,
  estado: EstadoDragagem,
  tMs: number,
): EstadoDragagem {
  if (estado.terminado) return estado;

  let batidas = estado.batidas;
  for (const portao of portoesCruzados(params, estado.tMs, tMs)) {
    if (!portao.abertas.includes(estado.pista)) batidas++;
  }

  if (batidas > params.batidasToleradas) {
    return { ...estado, batidas, tMs, terminado: { pego: false, qualidade: 0 } };
  }

  const fimMs = params.voltasParaFisgar * params.periodoMs;
  if (tMs >= fimMs) {
    // Cada batida custa 30% da qualidade.
    const qualidade = Math.max(0, Math.min(1, 1 - batidas * 0.3));
    return { ...estado, batidas, tMs, terminado: { pego: true, qualidade } };
  }

  return { ...estado, batidas, tMs, terminado: null };
}
