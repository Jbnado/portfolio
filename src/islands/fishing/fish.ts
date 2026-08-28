import type { Fish } from './types';

/**
 * Nove peixes de placeholder. Os nomes vem do i18n por `game.fish.<id>`.
 * A tabela existe para exercitar todo o espaco de parametros, nao para ser
 * conteudo final.
 */
export const FISH: Fish[] = [
  {
    id: 'p1', color: 'var(--fishing-fish-a)', sizeMin: 12, sizeMax: 34,
    engine: 'trajeto',
    params: { path: 'reta', periodMs: 2400, zones: [{ pos: 0.5, size: 0.26 }], hits: 1, alternates: false, tolerance: null },
  },
  {
    id: 'p2', color: 'var(--fishing-fish-b)', sizeMin: 18, sizeMax: 46,
    engine: 'trajeto',
    params: { path: 'pendulo', periodMs: 2000, zones: [{ pos: 0.62, size: 0.18 }], hits: 2, alternates: false, tolerance: null },
  },
  {
    id: 'p3', color: 'var(--fishing-fish-c)', sizeMin: 22, sizeMax: 58,
    engine: 'trajeto',
    params: { path: 'pendulo', periodMs: 1700, zones: [{ pos: 0.2, size: 0.14 }, { pos: 0.8, size: 0.14 }], hits: 3, alternates: true, tolerance: null },
  },
  {
    id: 'p4', color: 'var(--fishing-fish-d)', sizeMin: 15, sizeMax: 40,
    engine: 'trajeto',
    params: { path: 'radial', periodMs: 1900, zones: [{ pos: 0.35, size: 0.16 }], hits: 2, alternates: false, tolerance: null },
  },
  {
    id: 'p5', color: 'var(--fishing-fish-e)', sizeMin: 10, sizeMax: 28,
    engine: 'trajeto',
    params: { path: 'subida', periodMs: 1500, zones: [{ pos: 0.85, size: 0.2 }], hits: 3, alternates: false, tolerance: null },
  },
  {
    id: 'p6', color: 'var(--fishing-fish-f)', sizeMin: 30, sizeMax: 72,
    engine: 'sustentacao',
    params: { bandHeight: 0.22, gravity: 0.0000035, lift: 0.000009, pattern: 'calmo', fishSpeed: 0.00028, fillRate: 0.00055, drainRate: 0.0004 },
  },
  {
    id: 'p7', color: 'var(--fishing-fish-g)', sizeMin: 26, sizeMax: 65,
    engine: 'sustentacao',
    params: { bandHeight: 0.16, gravity: 0.0000045, lift: 0.000011, pattern: 'arisco', fishSpeed: 0.00065, fillRate: 0.0005, drainRate: 0.00055 },
  },
  {
    id: 'p8', color: 'var(--fishing-fish-h)', sizeMin: 40, sizeMax: 95,
    engine: 'dragagem',
    params: {
      lanes: 2, periodMs: 3200, lapsToCatch: 2, bumpsAllowed: 2,
      gates: [
        { pos: 0.15, open: [0] }, { pos: 0.4, open: [1] },
        { pos: 0.65, open: [0] }, { pos: 0.9, open: [1] },
      ],
    },
  },
  {
    id: 'p9', color: 'var(--fishing-fish-i)', sizeMin: 55, sizeMax: 130,
    engine: 'dragagem',
    params: {
      lanes: 3, periodMs: 2600, lapsToCatch: 2, bumpsAllowed: 0,
      gates: [
        { pos: 0.12, open: [1] }, { pos: 0.3, open: [0, 2] },
        { pos: 0.5, open: [2] }, { pos: 0.7, open: [0] },
        { pos: 0.88, open: [1, 2] },
      ],
    },
  },
];

/** Qualidade 0..1 vira tamanho dentro da faixa da especie. */
export function sizeOf(fish: Fish, quality: number): number {
  const q = Math.min(1, Math.max(0, quality));
  return Math.round(fish.sizeMin + (fish.sizeMax - fish.sizeMin) * q);
}
