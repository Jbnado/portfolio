import { FISH } from './fish';
import { TIER_BY_DEPTH, type Depth } from './world';

/** Iscas sao PERMANENTES: compra uma vez e a sorte dela vale para sempre.
    So uma fica equipada por vez, como as linhas. A melhor domina, e isso e
    proposital — e progressao, nao dilema. */
export type BaitId = 'minhoca' | 'camarao' | 'sardinha';

export const BAITS: { id: BaitId; price: number; luck: number }[] = [
  { id: 'minhoca', price: 30, luck: 0.25 },
  { id: 'camarao', price: 90, luck: 0.5 },
  // A braba: e ela que libera os dois lendarios do abissal, entao ela custa
  // como um item de fim de jogo — mais que a propria linha abissal.
  { id: 'sardinha', price: 800, luck: 0.85 },
];

export const LINES: Depth[] = ['raso', 'medio', 'abissal'];
/* Os precos das linhas sao derivados do ESFORCO que o dono pediu, nao
   escolhidos a mao: quantos peixes medios da faixa e preciso vender para
   comprar a linha seguinte. Ele fixou 15 para o meio e 20 para o abissal.

   Peixe medio por faixa (tamanho no meio da escala, sem os lendarios):
   3.67 / 7.50 / 44.33. Logo 15 x 7.50 = 112.5 e 20 x 44.33 = 886.7, que
   arredondam para 110 e 900 — 14.7 e 20.3 de esforco medido. O raso fica nos
   50 do dono, 13.6.

   Mexer no tamanho ou no valor de um peixe MOVE estes numeros: quem mexer
   volta aqui e recalcula, senao a progressao sai do que foi pedido. */
export const LINE_PRICE: Record<Depth, number> = { raso: 50, medio: 110, abissal: 900 };

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

/**
 * Moedas por centimetro, por grupo (faixa x raridade). ESTA e a fonte da
 * verdade da economia: "um peixe vale um tanto por cm". O teto de cada grupo
 * e consequencia — a taxa vezes o maior exemplar dele.
 *
 * Foi assim que o dono pediu, e a ordem importa: com o teto na frente,
 * engordar um peixe BAIXAVA a taxa do grupo inteiro (a taxa era teto dividido
 * pelo maior), entao um abissal mais imenso pagava menos por centimetro. Com
 * a taxa na frente, peixe maior simplesmente vale mais.
 */
const RATE: Record<Kind, Record<1 | 2 | 3, number>> = {
  comum: { 1: 0.1, 2: 0.125, 3: 0.333 },
  raro: { 1: 0.182, 2: 0.313, 3: 0.556 },
  lenda: { 1: 1, 2: 1, 3: 1 },
};

type Kind = 'comum' | 'raro' | 'lenda';

function kindOf(f: { legend?: unknown; engine: string }): Kind {
  return f.legend ? 'lenda' : f.engine === 'hold' ? 'raro' : 'comum';
}

export function coinPerCm(f: { legend?: unknown; engine: string; tier: 1 | 2 | 3 }): number {
  return RATE[kindOf(f)][f.tier];
}

/** Quanto vale um peixe: a taxa do grupo vezes os centimetros que ele deu. */
export function fishValue(id: string, cm: number): number {
  const fish = FISH.find((f) => f.id === id);
  if (!fish) return 1;
  return Math.max(1, Math.round(coinPerCm(fish) * cm));
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
