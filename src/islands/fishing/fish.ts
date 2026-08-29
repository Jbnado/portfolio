import type { Fish } from './types';

/**
 * Nove peixes de placeholder. Os nomes vem do i18n por `game.fish.<id>`.
 * A tabela e uma matriz motor x faixa: cada faixa de dificuldade tem
 * exatamente um peixe de cada motor, do raso generoso ao abissal sem perdao.
 */
export const FISH: Fish[] = [
  // ---- Faixa 1, o raso que ensina. Margem generosa nos tres motores.
  { id: 'p1', tier: 1, weight: 45, color: 'var(--fishing-fish-a)', sizeMin: 12, sizeMax: 34,
    engine: 'track',
    params: { path: 'pendulo', periodMs: 2600, zones: [{ pos: 0.5, size: 0.30 }], hits: 1, alternates: false, tolerance: null } },
  { id: 'p2', tier: 1, weight: 10, color: 'var(--fishing-fish-b)', sizeMin: 18, sizeMax: 46,
    engine: 'hold',
    params: { bandHeight: 0.30, gravity: 0.000003, lift: 0.000008, maxSpeed: 0.0007, pattern: 'calmo', fishSpeed: 0.00020, fillRate: 0.0006, drainRate: 0.0003, graceMs: 2500 } },
  { id: 'p3', tier: 1, weight: 45, color: 'var(--fishing-fish-c)', sizeMin: 22, sizeMax: 58,
    engine: 'dodge',
    params: { lanes: 2, periodMs: 4200, gapWidth: 0.10, cleanToCatch: 3, bumpsAllowed: null,
      gates: [{ pos: 0.125, open: [0] }, { pos: 0.375, open: [1] },
              { pos: 0.625, open: [0] }, { pos: 0.875, open: [1] }] } },

  // ---- Faixa 2, o meio. Janela menor, mais velocidade, menos perdao.
  { id: 'p4', tier: 2, weight: 1, color: 'var(--fishing-fish-d)', sizeMin: 15, sizeMax: 40,
    engine: 'track',
    params: { path: 'radial', periodMs: 2000, zones: [{ pos: 0.35, size: 0.18 }], hits: 2, alternates: false, tolerance: null } },
  { id: 'p5', tier: 2, weight: 1, color: 'var(--fishing-fish-e)', sizeMin: 10, sizeMax: 28,
    engine: 'hold',
    params: { bandHeight: 0.22, gravity: 0.0000035, lift: 0.000009, maxSpeed: 0.0009, pattern: 'erratico', fishSpeed: 0.00035, fillRate: 0.00055, drainRate: 0.0004, graceMs: 1800 } },
  { id: 'p6', tier: 2, weight: 1, color: 'var(--fishing-fish-f)', sizeMin: 30, sizeMax: 72,
    engine: 'dodge',
    params: { lanes: 2, periodMs: 3000, gapWidth: 0.09, cleanToCatch: 3, bumpsAllowed: 2,
      gates: [{ pos: 0.125, open: [0] }, { pos: 0.375, open: [1] },
              { pos: 0.625, open: [0] }, { pos: 0.875, open: [1] }] } },

  // ---- Faixa 3, o abissal. Sem perdao.
  { id: 'p7', tier: 3, weight: 1, color: 'var(--fishing-fish-g)', sizeMin: 26, sizeMax: 65,
    engine: 'track',
    params: { path: 'pendulo', periodMs: 1500, zones: [{ pos: 0.2, size: 0.12 }, { pos: 0.8, size: 0.12 }], hits: 3, alternates: true, tolerance: 2 } },
  { id: 'p8', tier: 3, weight: 1, color: 'var(--fishing-fish-h)', sizeMin: 40, sizeMax: 95,
    engine: 'hold',
    params: { bandHeight: 0.16, gravity: 0.0000045, lift: 0.000011, maxSpeed: 0.0012, pattern: 'arisco', fishSpeed: 0.0006, fillRate: 0.0005, drainRate: 0.00055, graceMs: 1200 } },
  { id: 'p9', tier: 3, weight: 1, color: 'var(--fishing-fish-i)', sizeMin: 55, sizeMax: 130,
    engine: 'dodge',
    params: { lanes: 3, periodMs: 2200, gapWidth: 0.08, cleanToCatch: 3, bumpsAllowed: 0,
      gates: [{ pos: 0.1, open: [1] }, { pos: 0.3, open: [0] }, { pos: 0.5, open: [2] },
              { pos: 0.7, open: [1] }, { pos: 0.9, open: [0] }] } },
];

/** Qualidade 0..1 vira tamanho dentro da faixa da especie. */
export function sizeOf(fish: Fish, quality: number): number {
  const q = Math.min(1, Math.max(0, quality));
  return Math.round(fish.sizeMin + (fish.sizeMax - fish.sizeMin) * q);
}

/** Afinavel: quanto o modo garantido desacelera o minigame. */
const GUARANTEED_SLOWDOWN = 1.6;

/**
 * Modo garantido agora desacelera de verdade em vez de so forcar a captura
 * (achado I3): TRAJETO e DRAGAGEM ganham periodo maior, SUSTENTACAO ganha
 * peixe mais lento e dreno mais fraco. Id, faixa, cor e tamanho da especie
 * nao mudam — so o ritmo do minigame muda.
 */
export function guaranteedFish(fish: Fish): Fish {
  // Ramifica por engine, nao por `!== 'hold'` (achado C3 do rereview): negar
  // 'hold' deixa o resto como a uniao `track | dodge`, e o spread de
  // `fish.params` nessa uniao descorrelaciona de `fish.engine` — o unico
  // erro de tipo do diretorio, invisivel porque o projeto nao roda
  // typecheck em lugar nenhum.
  if (fish.engine === 'hold') {
    return {
      ...fish,
      params: {
        ...fish.params,
        fishSpeed: fish.params.fishSpeed / GUARANTEED_SLOWDOWN,
        drainRate: fish.params.drainRate / GUARANTEED_SLOWDOWN,
      },
    };
  }
  if (fish.engine === 'track') {
    return {
      ...fish,
      params: { ...fish.params, periodMs: fish.params.periodMs * GUARANTEED_SLOWDOWN },
    };
  }
  return {
    ...fish,
    params: { ...fish.params, periodMs: fish.params.periodMs * GUARANTEED_SLOWDOWN },
  };
}
