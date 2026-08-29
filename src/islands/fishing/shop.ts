import { TIER_BY_DEPTH, type Depth } from './world';

/** Iscas sao PERMANENTES: compra uma vez e a sorte dela vale para sempre.
    So uma fica equipada por vez, como as linhas. A melhor domina, e isso e
    proposital — e progressao, nao dilema. */
export type BaitId = 'minhoca' | 'camarao' | 'sardinha';

export const BAITS: { id: BaitId; price: number; luck: number }[] = [
  { id: 'minhoca', price: 30, luck: 0.25 },
  { id: 'camarao', price: 90, luck: 0.5 },
  { id: 'sardinha', price: 220, luck: 0.85 },
];

export const LINES: Depth[] = ['raso', 'medio', 'abissal'];
export const LINE_PRICE: Record<Depth, number> = { raso: 40, medio: 120, abissal: 300 };

export type Progress = {
  coins: number;
  /** Linhas compradas, e qual esta na vara. */
  lines: Depth[];
  line: Depth | null;
  /** Iscas compradas, e qual esta no anzol. */
  baits: BaitId[];
  bait: BaitId | null;
  /** Pescado ainda nao vendido, em cm. */
  hold: number[];
};

export const EMPTY_PROGRESS: Progress = {
  coins: 0, lines: [], line: null, baits: [], bait: null, hold: [],
};

/** Um peixe vale metade do tamanho em moedas, com piso de 1. */
export function fishValue(cm: number): number {
  return Math.max(1, Math.round(cm / 2));
}

export function holdValue(hold: number[]): number {
  return hold.reduce((total, cm) => total + fishValue(cm), 0);
}

/** A linha equipada ALCANCA esta profundidade? Uma linha mais funda cobre
    tudo que e mais raso: por isso a abissal e a melhor — com ela se pesca o
    raro em qualquer lugar. Sem linha nenhuma, nenhum raro morde. */
export function lineReaches(p: Progress, d: Depth): boolean {
  return p.line !== null && TIER_BY_DEPTH[p.line] >= TIER_BY_DEPTH[d];
}

/** Sorte da isca equipada. Zero sem isca. */
export function luckOf(p: Progress): number {
  return BAITS.find((b) => b.id === p.bait)?.luck ?? 0;
}

export function sellAll(p: Progress): Progress {
  return { ...p, coins: p.coins + holdValue(p.hold), hold: [] };
}

export function buyLine(p: Progress, d: Depth): Progress {
  if (p.lines.includes(d) || p.coins < LINE_PRICE[d]) return p;
  // Comprar ja equipa: ninguem compra uma linha para deixar na gaveta.
  return { ...p, coins: p.coins - LINE_PRICE[d], lines: [...p.lines, d], line: d };
}

export function equipLine(p: Progress, d: Depth): Progress {
  return p.lines.includes(d) ? { ...p, line: d } : p;
}

export function buyBait(p: Progress, id: BaitId): Progress {
  const bait = BAITS.find((b) => b.id === id);
  if (!bait || p.baits.includes(id) || p.coins < bait.price) return p;
  return { ...p, coins: p.coins - bait.price, baits: [...p.baits, id], bait: id };
}

export function equipBait(p: Progress, id: BaitId): Progress {
  return p.baits.includes(id) ? { ...p, bait: id } : p;
}

export function addCatch(p: Progress, cm: number): Progress {
  return { ...p, hold: [...p.hold, cm] };
}

/** Peso do peixe raro no sorteio. A sorte da isca SOMA: com ela o raro
    aparece mais. Sem isca, o peso e o da tabela. */
export function rareWeight(base: number, luck: number): number {
  return Math.max(1, Math.round(base * (1 + luck)));
}

/** A isca tambem puxa o TAMANHO para cima, travado em 1 para nao passar do
    maximo da especie — o teto continua sendo o teto. */
export function luckyQuality(quality: number, luck: number): number {
  return Math.min(1, quality + luck * (1 - quality));
}

const KEY = 'fishing:progress';

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return EMPTY_PROGRESS;
    const lines: Depth[] = Array.isArray(raw.lines) ? raw.lines.filter((d: Depth) => LINES.includes(d)) : [];
    const baits: BaitId[] = Array.isArray(raw.baits) ? raw.baits.filter((b: BaitId) => BAITS.some((x) => x.id === b)) : [];
    return {
      coins: typeof raw.coins === 'number' ? raw.coins : 0,
      lines,
      // Equipado tem que estar entre os possuidos: um valor gravado por fora
      // (ou de uma versao antiga) nao pode deixar a vara com linha fantasma.
      line: lines.includes(raw.line) ? raw.line : (lines[lines.length - 1] ?? null),
      baits,
      bait: baits.includes(raw.bait) ? raw.bait : (baits[baits.length - 1] ?? null),
      hold: Array.isArray(raw.hold) ? raw.hold.filter((n: unknown) => typeof n === 'number') : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota ou modo privado */ }
}
