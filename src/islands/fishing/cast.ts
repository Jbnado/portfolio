import type { Fish } from './types';

/**
 * A espera entre o lance e a fisgada.
 *
 * Logica pura, no mesmo contrato dos tres motores: sem DOM, sem tempo real e
 * sem aleatoriedade que nao venha injetada. Quem conta o tempo e a vista; aqui
 * so se decide QUANTO se espera e O QUE se mostra em cada instante.
 */

/** Piso e teto da espera. Faixa estreita de proposito: abaixo de um segundo
    nao da tempo de ler o vulto, acima de dois a vontade e de largar. */
const ESPERA_MIN = 1000;
const ESPERA_MAX = 2000;

/** Quanto dura o gesto de levantar do banco. FIXO: levantar e o mesmo gesto
    sempre, so a espera depois dele e que varia com a sorte do lance. */
export const LEVANTA_MS = 300;

/** Os dois extremos de `sizeMax` do elenco: o lambari do raso e o pirarucu.
    Sao referencia de escala, nao limite — peixe fora da faixa e grampeado. */
const MENOR_CM = 18;
const MAIOR_CM = 400;

const VULTO_MIN = 0.6;
const VULTO_MAX = 1.6;

const grampeia = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

/** Sorteia a espera deste lance. */
export function castDuration(rng: () => number): number {
  return ESPERA_MIN + rng() * (ESPERA_MAX - ESPERA_MIN);
}

/**
 * O multiplicador do vulto que se aproxima na agua.
 *
 * Sai do tamanho da especie ja sorteada, entao o vulto e HONESTO: adianta a
 * raridade sem entregar o nome, que pertence ao CatchView.
 */
export function shadowScale(fish: Fish): number {
  const t = (fish.sizeMax - MENOR_CM) / (MAIOR_CM - MENOR_CM);
  return grampeia(VULTO_MIN + t * (VULTO_MAX - VULTO_MIN), VULTO_MIN, VULTO_MAX);
}

/**
 * Quanto tempo a fisgada fica na tela ANTES de o veu e o minigame entrarem.
 *
 * E o unico tempo morto do lance, e e de proposito. Sem esta batida a mordida
 * e a subida do veu aconteciam no mesmo instante, e o puxao — que e o quadro
 * mais bonito da folha — nunca era visto por ninguem.
 */
export const FISGA_MS = 700;

/** Cadencia do debate, em ms por quadro. O lendario se sacode mais depressa:
    e o que faz a lenda PARECER lenda antes de o nome dela aparecer. O comum
    nao entra aqui — ele nao se debate. */
const DEBATE_MS: Record<'raro' | 'lenda', number> = { raro: 260, lenda: 150 };

/**
 * Qual quadro mostrar durante a luta.
 *
 * O comum fica parado no quadro da fisgada, que e a luta como sempre foi. Os
 * outros alternam entre ceder e puxar, e a alternancia le como esforco — a
 * mesma folha de quatro quadros conta duas historias.
 *
 * Comeca sempre no puxao: entrar pelo `ceder` faria a luta abrir com o
 * pescador ja relaxando, no exato instante em que o peixe mordeu.
 */
export function fightFrame(rarity: 'comum' | 'raro' | 'lenda', elapsed: number): 2 | 3 {
  if (rarity === 'comum') return 3;
  return Math.floor(elapsed / DEBATE_MS[rarity]) % 2 === 0 ? 3 : 2;
}

/**
 * Qual quadro da folha mostrar em toda a fase do lance.
 *
 * Uma funcao so para a fase inteira, em vez de duas a disputarem a fronteira:
 * levanta, lanca, e entao ENTREGA a batida ao `fightFrame`. E por isso que o
 * raro se debate com o mundo ainda limpo — enquanto essa alternancia vivia so
 * na fase da luta, ela acontecia atras de um veu de 82% e ninguem a via.
 *
 * Nunca devolve 0, que e a fase parada.
 */
export function castFrameAt(
  elapsed: number,
  esperaMs: number,
  rarity: 'comum' | 'raro' | 'lenda',
): 1 | 2 | 3 {
  if (elapsed < LEVANTA_MS) return 1;
  if (elapsed < esperaMs) return 2;
  return fightFrame(rarity, elapsed - esperaMs);
}
