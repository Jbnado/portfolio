/**
 * Camada de Canvas do mar.
 *
 * No v1 ela EXISTE e NAO RODA. A fronteira DOM/Canvas fica definida antes de
 * ser necessaria, e quando o mundo (barco, biomas, particulas) chegar, ele tem
 * onde morar sem reorganizar a ilha.
 *
 * Nao adicione um loop de animacao aqui enquanto nao houver o que desenhar.
 */

let ctx: CanvasRenderingContext2D | null = null;

export function mountSea(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx = canvas.getContext('2d');
  ctx?.scale(dpr, dpr);
}

/** Sem conteudo no v1. Chamada explicita, nunca em loop. */
export function drawSea(): void {
  if (!ctx) return;
}

export function unmountSea(): void {
  ctx = null;
}
