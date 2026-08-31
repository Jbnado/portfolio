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
 * Qual quadro da folha mostrar durante a espera.
 *
 * Nunca devolve 0, que e a fase parada, nem 3, que pertence a entrada na luta.
 */
export function frameAt(elapsed: number): 1 | 2 {
  return elapsed < LEVANTA_MS ? 1 : 2;
}

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
