import { FISH } from './fish';
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
export const LINE_PRICE: Record<Depth, number> = { raso: 50, medio: 150, abissal: 500 };

/** Teto de moedas por peixe, por faixa. O raro de cada faixa vale bem mais
    que o comum dela — e o que faz caca-lo compensar, e o que faz a linha (que
    e o que libera o raro) se pagar. Os numeros sao do dono. */
const VALUE_CAP: Record<1 | 2 | 3, { comum: number; raro: number }> = {
  1: { comum: 5, raro: 10 },
  2: { comum: 10, raro: 25 },
  3: { comum: 50, raro: 100 },
};

export type Progress = {
  coins: number;
  /** Linhas compradas, e qual esta na vara. */
  lines: Depth[];
  line: Depth | null;
  /** Iscas compradas, e qual esta no anzol. */
  baits: BaitId[];
  bait: BaitId | null;
  /** Pescado ainda nao vendido. Guarda a especie junto do tamanho: o valor
      depende da faixa e de ser raro ou nao, entao so o cm nao basta. */
  hold: { id: string; cm: number }[];
};

export const EMPTY_PROGRESS: Progress = {
  coins: 0, lines: [], line: null, baits: [], bait: null, hold: [],
};

/** Quanto vale um peixe. O teto e da FAIXA, e o raro de cada faixa tem teto
    proprio, mais alto. Dentro disso o tamanho manda: um peixe no minimo da
    especie vale 40% do teto, um no maximo vale o teto inteiro. */
export function fishValue(id: string, cm: number): number {
  const fish = FISH.find((f) => f.id === id);
  if (!fish) return 1;
  const cap = VALUE_CAP[fish.tier][fish.engine === 'hold' ? 'raro' : 'comum'];
  const span = fish.sizeMax - fish.sizeMin;
  const fracao = span > 0 ? Math.min(1, Math.max(0, (cm - fish.sizeMin) / span)) : 1;
  return Math.max(1, Math.round(cap * (0.4 + 0.6 * fracao)));
}

export function holdValue(hold: { id: string; cm: number }[]): number {
  return hold.reduce((total, f) => total + fishValue(f.id, f.cm), 0);
}

/** Ate que faixa a linha equipada deixa PESCAR. Sem linha nenhuma da para
    pescar no raso — senao o jogo comeca travado, porque moeda so vem de
    vender peixe. O que a linha do raso compra nao e o acesso ao raso, e o
    peixe RARO dele. */
export function reachTier(p: Progress): 1 | 2 | 3 {
  return p.line ? TIER_BY_DEPTH[p.line] : 1;
}

/** Da para lancar nesta profundidade? A linha e que decide: sem a linha
    certa, o meio e o abissal ficam fechados. */
export function canFish(p: Progress, d: Depth): boolean {
  return TIER_BY_DEPTH[d] <= reachTier(p);
}

/** A linha equipada alcanca o PEIXE RARO desta profundidade? Aqui nao ha
    cortesia: sem linha, nenhum raro morde, nem no raso. */
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

export function addCatch(p: Progress, id: string, cm: number): Progress {
  return { ...p, hold: [...p.hold, { id, cm }] };
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
      // O porao mudou de formato (era so cm). Entrada fora do formato novo
      // e descartada em vez de adivinhada: peixe sem especie nao tem preco.
      hold: Array.isArray(raw.hold)
        ? raw.hold.filter((f: unknown): f is { id: string; cm: number } =>
            !!f && typeof f === 'object' && typeof (f as { id?: unknown }).id === 'string'
            && typeof (f as { cm?: unknown }).cm === 'number')
        : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota ou modo privado */ }
}
