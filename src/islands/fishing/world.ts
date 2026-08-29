/** O mundo: um lago pequeno, visto de lado. A loja fica na margem esquerda e
    a agua fica mais funda para a direita. Tudo em "unidades de mundo" de 0 a
    100 — a vista e que decide quantos pixels cada unidade vale. */

export type Depth = 'raso' | 'medio' | 'abissal';

export const WORLD_MIN = 0;
export const WORLD_MAX = 100;

/** Meia-largura do barco em unidades de mundo. E tambem o alcance: o barco
    esta "em cima" de um ponto quando o centro dele chega a esta distancia. */
export const REACH = 3.5;

export const SHOP_X = 4;

/** Onde o barco nasce: na agua, a direita da loja. Nascer EM CIMA da loja
    empilhava os dois quadrados no mesmo lugar e nao se lia nem um nem outro. */
export const BOAT_START = 13;

/** Ate onde vai a margem. A loja fica nela; a agua comeca dali pra direita. */
export const SHORE_TO = 8;

/** Onde a agua muda de fundo. O barco anda por cima disso sem obstaculo — a
    profundidade decide o que morde, nao por onde da pra passar. */
const MEDIO_FROM = 44;
const ABISSAL_FROM = 72;

export function depthAt(x: number): Depth {
  return x < MEDIO_FROM ? 'raso' : x < ABISSAL_FROM ? 'medio' : 'abissal';
}

/** A profundidade e que abre a faixa de peixes, no lugar do "quantos voce ja
    conhece" que o v1 usava por nao ter mapa. Andar para a direita e a
    progressao agora. */
export const TIER_BY_DEPTH: Record<Depth, 1 | 2 | 3> = {
  raso: 1, medio: 2, abissal: 3,
};

/** O inverso: de que profundidade e o peixe desta faixa. A loja precisa dele
    para saber QUAL linha libera qual peixe raro. */
export const DEPTH_BY_TIER: Record<1 | 2 | 3, Depth> = {
  1: 'raso', 2: 'medio', 3: 'abissal',
};

/** Ponto de pesca: a marca fina sobre a agua. So da pra lancar em cima de um. */
export type Spot = { id: string; x: number };

export const SPOTS: Spot[] = [
  { id: 's1', x: 17 },
  { id: 's2', x: 29 },
  { id: 's3', x: 39 },
  { id: 's4', x: 52 },
  { id: 's5', x: 64 },
  { id: 's6', x: 79 },
  { id: 's7', x: 92 },
];

export function spotUnder(x: number): Spot | null {
  for (const s of SPOTS) if (Math.abs(s.x - x) <= REACH) return s;
  return null;
}

export function atShop(x: number): boolean {
  return Math.abs(x - SHOP_X) <= REACH;
}

/** Unidades de mundo por milissegundo. Atravessar o lago inteiro leva pouco
    mais de quatro segundos: o mapa e pequeno de proposito. */
export const BOAT_SPEED = 0.023;

export function moveBoat(x: number, dir: number, dtMs: number): number {
  const next = x + dir * BOAT_SPEED * dtMs;
  return Math.min(WORLD_MAX, Math.max(WORLD_MIN, next));
}

/** Canto esquerdo da janela visivel, em unidades de mundo. Segue o barco mas
    trava nas pontas, senao a camera mostraria vazio fora do lago. */
export function cameraAt(boat: number, viewW: number): number {
  return Math.min(WORLD_MAX - viewW, Math.max(WORLD_MIN, boat - viewW / 2));
}
