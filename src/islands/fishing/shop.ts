import { FISH } from './fish';
import { TIER_BY_DEPTH, type Depth } from './world';

/** Iscas sao PERMANENTES: compra uma vez e a sorte dela vale para sempre.
    So uma fica equipada por vez, como as linhas. A melhor domina, e isso e
    proposital — e progressao, nao dilema. */
export type BaitId = 'minhoca' | 'camarao' | 'sardinha';

export const BAITS: { id: BaitId; price: number; luck: number }[] = [
  { id: 'minhoca', price: 30, luck: 0.25 },
  { id: 'camarao', price: 100, luck: 0.5 },
  // A braba: e ela que libera os dois lendarios do abissal, entao custa como
  // item de fim de jogo — a compra de MAIOR esforco do jogo, 18 fisgadas no
  // abissal. Custava 800 e saia por 28 fisgadas, menos esforco do que a linha
  // que abre a faixa onde ela se usa: a ultima compra era a penultima em
  // dificuldade, e a curva descia no fim.
  { id: 'sardinha', price: 1040, luck: 0.85 },
];

/** So ha linha para comprar onde ela e PERMISSAO: o raso pesca-se sem linha
    nenhuma. A linha do raso existia para abrir o peixe raro do raso, e era um
    mau primeiro alvo — 50 moedas gastas sem sair do sitio, e o fundo ficava
    ainda mais longe. Esse papel passou para a isca. */
export type LineId = 'medio' | 'abissal';
export const LINES: LineId[] = ['medio', 'abissal'];

/** Preco antigo da linha do raso. Fica aqui so para devolver o dinheiro a
    quem a comprou antes de ela deixar de existir — ver `loadProgress`. */
const PRECO_LINHA_RASO = 50;

/* Os precos sao derivados do ESFORCO, e o esforco conta-se em FISGADAS NA
   FAIXA ONDE SE POUPA — nao na faixa que a compra destrava.

   Essa distincao ja custou caro. A linha do abissal valia 900 porque foi
   precificada em "20 peixes medios do abissal"; mas ninguem pesca no abissal
   antes de comprar a linha do abissal, e essas 900 moedas juntavam-se no
   MEIO, a cerca de 7 por fisgada. Davam 132 fisgadas em vez de 20: sozinha,
   59 por cento do grind do jogo inteiro, que somava 223 fisgadas e uns 67
   minutos. Para um joguinho de browser era tempo a mais para se ver o fim.

   O alvo agora e o jogo inteiro em cerca de 50 fisgadas, repartidas assim:

     6   isca de minhoca      (poupa no raso, sem isca)
     8   linha do meio        (poupa no raso, com minhoca)
     8   isca de camarao      (poupa no meio, com minhoca)
    10   linha do abissal     (poupa no meio, com camarao)
    18   isca braba           (poupa no abissal, com camarao)

   As taxas por cm dobraram junto, para os precos continuarem a ter cara de
   preco em vez de virarem trocos de dois digitos.

   `shop.test.ts` mede isto e falha se sair da faixa: mexer no tamanho, na
   taxa ou no peso de um peixe MOVE estes numeros. */
export const LINE_PRICE: Record<LineId, number> = { medio: 50, abissal: 140 };

export type Progress = {
  coins: number;
  /** Linhas compradas, e qual esta na vara. */
  lines: LineId[];
  line: LineId | null;
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
  comum: { 1: 0.2, 2: 0.25, 3: 0.666 },
  raro: { 1: 0.364, 2: 0.626, 3: 1.112 },
  lenda: { 1: 2, 2: 2, 3: 2 },
};

export type Kind = 'comum' | 'raro' | 'lenda';

/** Comum, raro ou lendario. A economia usa isto para a taxa por cm, e a
    vista da fisgada usa para escolher o tamanho da comemoracao — uma
    definicao so, para as duas nao poderem discordar. */
export function rarityOf(f: { legend?: unknown; engine: string }): Kind {
  return f.legend ? 'lenda' : f.engine === 'hold' ? 'raro' : 'comum';
}

export function coinPerCm(f: { legend?: unknown; engine: string; tier: 1 | 2 | 3 }): number {
  return RATE[rarityOf(f)][f.tier];
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
    vender peixe. */
export function reachTier(p: Progress): 1 | 2 | 3 {
  return p.line ? TIER_BY_DEPTH[p.line] : 1;
}

/** Da para lancar nesta profundidade? A linha e que decide: sem a linha
    certa, o meio e o abissal ficam fechados. */
export function canFish(p: Progress, d: Depth): boolean {
  return TIER_BY_DEPTH[d] <= reachTier(p);
}

/** O peixe RARO desta profundidade morde?

    No raso quem abre e a ISCA. Nao ha linha do raso para comprar, e o
    primeiro alvo do jogo passa a ser a isca de minhoca, a 30: oito peixes
    comuns, e o raso ja fica mais rico enquanto se junta para o meio. Antes o
    primeiro alvo eram 50 moedas numa linha que nao levava a lado nenhum.

    Mais fundo, a permissao ja e a propria linha: quem chega ao meio tem a
    linha do meio, senao nao estaria a pescar ali. */
export function rareBites(p: Progress, d: Depth): boolean {
  if (d === 'raso') return p.bait !== null;
  return canFish(p, d);
}

/** Sorte da isca equipada. Zero sem isca. */
export function luckOf(p: Progress): number {
  return BAITS.find((b) => b.id === p.bait)?.luck ?? 0;
}

export function sellAll(p: Progress): Progress {
  return { ...p, coins: p.coins + holdValue(p.hold), hold: [] };
}

export function buyLine(p: Progress, d: LineId): Progress {
  if (p.lines.includes(d) || p.coins < LINE_PRICE[d]) return p;
  // Comprar ja equipa: ninguem compra uma linha para deixar na gaveta.
  return { ...p, coins: p.coins - LINE_PRICE[d], lines: [...p.lines, d], line: d };
}

export function equipLine(p: Progress, d: LineId): Progress {
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
    const guardadas: unknown[] = Array.isArray(raw.lines) ? raw.lines : [];
    const lines: LineId[] = guardadas.filter((d): d is LineId => LINES.includes(d as LineId));
    // A linha do raso deixou de existir. Quem a comprou recebe as moedas de
    // volta: perder 50 num item que sumiu do jogo seria roubo de save.
    const devolvido = guardadas.includes('raso') ? PRECO_LINHA_RASO : 0;
    const baits: BaitId[] = Array.isArray(raw.baits) ? raw.baits.filter((b: BaitId) => BAITS.some((x) => x.id === b)) : [];
    return {
      coins: (typeof raw.coins === 'number' ? raw.coins : 0) + devolvido,
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
