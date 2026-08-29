import type { Depth } from './world';

/** Tudo que o jogador acumula fora do caderno de especimes. Fica numa chave
    propria do localStorage: o caderno tem formato antigo e ja publicado, e
    misturar os dois obrigaria a migrar um dado que nao precisa mudar. */
export type Progress = {
  coins: number;
  /** Linhas compradas. Cada uma libera o peixe RARO da sua profundidade. */
  lines: Depth[];
  /** Iscas em estoque. Cada lance gasta uma, se houver. */
  bait: number;
  /** Pescado ainda nao vendido, em cm. Vender e o que vira moeda. */
  hold: number[];
};

export const EMPTY_PROGRESS: Progress = { coins: 0, lines: [], bait: 0, hold: [] };

export const LINE_PRICE: Record<Depth, number> = { raso: 40, medio: 120, abissal: 300 };
export const BAIT_PRICE = 15;
export const BAIT_PACK = 5;

/** Sorte que uma isca adiciona. Entra em DOIS lugares, como o dono descreveu:
    soma no peso do peixe raro no sorteio e soma no tamanho do que vier. */
export const BAIT_LUCK = 0.6;

/** Um peixe vale metade do seu tamanho em moedas, com piso de 1: peixe grande
    paga mais, e nenhum lance da em nada. */
export function fishValue(cm: number): number {
  return Math.max(1, Math.round(cm / 2));
}

export function holdValue(hold: number[]): number {
  return hold.reduce((total, cm) => total + fishValue(cm), 0);
}

export function hasLine(p: Progress, d: Depth): boolean {
  return p.lines.includes(d);
}

export function sellAll(p: Progress): Progress {
  return { ...p, coins: p.coins + holdValue(p.hold), hold: [] };
}

export function buyLine(p: Progress, d: Depth): Progress {
  if (hasLine(p, d) || p.coins < LINE_PRICE[d]) return p;
  return { ...p, coins: p.coins - LINE_PRICE[d], lines: [...p.lines, d] };
}

export function buyBait(p: Progress): Progress {
  if (p.coins < BAIT_PRICE) return p;
  return { ...p, coins: p.coins - BAIT_PRICE, bait: p.bait + BAIT_PACK };
}

export function addCatch(p: Progress, cm: number): Progress {
  return { ...p, hold: [...p.hold, cm] };
}

export function useBait(p: Progress): Progress {
  return p.bait > 0 ? { ...p, bait: p.bait - 1 } : p;
}

/** Peso do peixe raro no sorteio. A isca SOMA sorte: com ela o raro aparece
    mais, sem ela o peso e o da tabela. */
export function rareWeight(base: number, withBait: boolean): number {
  return withBait ? Math.round(base * (1 + BAIT_LUCK)) : base;
}

/** A isca tambem puxa o tamanho para cima. Travado em 1 para nao passar do
    maximo da especie — o teto continua sendo o teto. */
export function luckyQuality(quality: number, withBait: boolean): number {
  return withBait ? Math.min(1, quality + BAIT_LUCK * (1 - quality)) : quality;
}

const KEY = 'fishing:progress';

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return EMPTY_PROGRESS;
    return {
      coins: typeof raw.coins === 'number' ? raw.coins : 0,
      lines: Array.isArray(raw.lines) ? raw.lines : [],
      bait: typeof raw.bait === 'number' ? raw.bait : 0,
      hold: Array.isArray(raw.hold) ? raw.hold : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota ou modo privado */ }
}
