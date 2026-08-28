import type { Peixe } from './tipos';

/**
 * Nove peixes de placeholder. Os nomes vem do i18n por `jogo.peixes.<id>`.
 * A tabela existe para exercitar todo o espaco de parametros, nao para ser
 * conteudo final.
 */
export const PEIXES: Peixe[] = [
  {
    id: 'p1', cor: 'var(--pesca-peixe-a)', tamanhoMin: 12, tamanhoMax: 34,
    motor: 'trajeto',
    params: { caminho: 'reta', periodoMs: 2400, zonas: [{ pos: 0.5, tamanho: 0.26 }], acertos: 1, alternancia: false, tolerancia: null },
  },
  {
    id: 'p2', cor: 'var(--pesca-peixe-b)', tamanhoMin: 18, tamanhoMax: 46,
    motor: 'trajeto',
    params: { caminho: 'pendulo', periodoMs: 2000, zonas: [{ pos: 0.62, tamanho: 0.18 }], acertos: 2, alternancia: false, tolerancia: null },
  },
  {
    id: 'p3', cor: 'var(--pesca-peixe-c)', tamanhoMin: 22, tamanhoMax: 58,
    motor: 'trajeto',
    params: { caminho: 'pendulo', periodoMs: 1700, zonas: [{ pos: 0.2, tamanho: 0.14 }, { pos: 0.8, tamanho: 0.14 }], acertos: 3, alternancia: true, tolerancia: null },
  },
  {
    id: 'p4', cor: 'var(--pesca-peixe-d)', tamanhoMin: 15, tamanhoMax: 40,
    motor: 'trajeto',
    params: { caminho: 'radial', periodoMs: 1900, zonas: [{ pos: 0.35, tamanho: 0.16 }], acertos: 2, alternancia: false, tolerancia: null },
  },
  {
    id: 'p5', cor: 'var(--pesca-peixe-e)', tamanhoMin: 10, tamanhoMax: 28,
    motor: 'trajeto',
    params: { caminho: 'subida', periodoMs: 1500, zonas: [{ pos: 0.85, tamanho: 0.2 }], acertos: 3, alternancia: false, tolerancia: null },
  },
  {
    id: 'p6', cor: 'var(--pesca-peixe-f)', tamanhoMin: 30, tamanhoMax: 72,
    motor: 'sustentacao',
    params: { alturaFaixa: 0.22, gravidade: 0.0000035, impulso: 0.000009, padrao: 'calmo', velocidadePeixe: 0.00028, encher: 0.00055, drenar: 0.0004 },
  },
  {
    id: 'p7', cor: 'var(--pesca-peixe-g)', tamanhoMin: 26, tamanhoMax: 65,
    motor: 'sustentacao',
    params: { alturaFaixa: 0.16, gravidade: 0.0000045, impulso: 0.000011, padrao: 'arisco', velocidadePeixe: 0.00065, encher: 0.0005, drenar: 0.00055 },
  },
  {
    id: 'p8', cor: 'var(--pesca-peixe-h)', tamanhoMin: 40, tamanhoMax: 95,
    motor: 'dragagem',
    params: {
      pistas: 2, periodoMs: 3200, voltasParaFisgar: 2, batidasToleradas: 2,
      portoes: [
        { pos: 0.15, abertas: [0] }, { pos: 0.4, abertas: [1] },
        { pos: 0.65, abertas: [0] }, { pos: 0.9, abertas: [1] },
      ],
    },
  },
  {
    id: 'p9', cor: 'var(--pesca-peixe-i)', tamanhoMin: 55, tamanhoMax: 130,
    motor: 'dragagem',
    params: {
      pistas: 3, periodoMs: 2600, voltasParaFisgar: 2, batidasToleradas: 0,
      portoes: [
        { pos: 0.12, abertas: [1] }, { pos: 0.3, abertas: [0, 2] },
        { pos: 0.5, abertas: [2] }, { pos: 0.7, abertas: [0] },
        { pos: 0.88, abertas: [1, 2] },
      ],
    },
  },
];

/** Qualidade 0..1 vira tamanho dentro da faixa da especie. */
export function tamanhoDe(peixe: Peixe, qualidade: number): number {
  const q = Math.min(1, Math.max(0, qualidade));
  return Math.round(peixe.tamanhoMin + (peixe.tamanhoMax - peixe.tamanhoMin) * q);
}
