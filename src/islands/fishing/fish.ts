import type { DodgeParams, Fish, HoldParams, TrackParams } from './types';

/**
 * Vinte e quatro especies. Os nomes vem do i18n por `game.fish.<id>`.
 *
 * Os PARAMETROS sao por (faixa, motor) e ja estao afinados: especie nova
 * reaproveita o bloco da sua faixa e muda so nome, agua, tamanho e valor. E o
 * que permite crescer o elenco sem reabrir nada dos minigames.
 *
 * Os ids p1..p9 nao mudam de especie nem de faixa: o caderno guarda por id, e
 * remexer neles apagaria a colecao de quem ja jogou.
 */

const TRACK: Record<1 | 2 | 3, TrackParams> = {
  1: { periodMs: 2600, zoneSize: 0.30, hits: 3, tolerance: 2 },
  2: { periodMs: 2400, zoneSize: 0.25, hits: 3, tolerance: 2 },
  3: { periodMs: 2200, zoneSize: 0.15, hits: 3, tolerance: 2 },
};

const HOLD: Record<1 | 2 | 3, HoldParams> = {
  1: { bandHeight: 0.34, gravity: 0.000003, lift: 0.000008, maxSpeed: 0.0007, pattern: 'calmo', fishSpeed: 0.00020, fillRate: 0.00032, drainRate: 0.00021, graceMs: 2500 },
  2: { bandHeight: 0.25, gravity: 0.0000035, lift: 0.000009, maxSpeed: 0.0009, pattern: 'erratico', fishSpeed: 0.00050, fillRate: 0.00038, drainRate: 0.00025, graceMs: 1600 },
  3: { bandHeight: 0.20, gravity: 0.0000045, lift: 0.000011, maxSpeed: 0.0012, pattern: 'arisco', fishSpeed: 0.00060, fillRate: 0.00040, drainRate: 0.00024, graceMs: 1400 },
};

const DODGE: Record<1 | 2 | 3, DodgeParams> = {
  1: { periodMs: 4200, gatesMin: 2, gatesMax: 4, gapMin: 0.08, gapMax: 0.12, holdMs: 3000, penaltyMs: 1500, fallsToLose: null, zeroesToLose: null },
  2: { periodMs: 2600, gatesMin: 4, gatesMax: 5, gapMin: 0.07, gapMax: 0.11, holdMs: 4000, penaltyMs: 2000, fallsToLose: 3, zeroesToLose: 2 },
  3: { periodMs: 1900, gatesMin: 4, gatesMax: 6, gapMin: 0.06, gapMax: 0.10, holdMs: 5000, penaltyMs: 2500, fallsToLose: 3, zeroesToLose: 2 },
};

/** Comum aparece muito, o raro (SUSTENTACAO) pouco, o lendario quase nunca. */
const COMUM = 20;
const RARO = 5;
const LENDA = 1;

const cor = (i: number) => `var(--fishing-fish-${'abcdefghi'[i % 9]})`;

type Linha = {
  id: string; tier: 1 | 2 | 3; water: 'doce' | 'salgada';
  min: number; max: number;
  engine: 'track' | 'hold' | 'dodge';
  legend?: { spot: string; bait: string };
};

const TABELA: Linha[] = [
  // ---- Raso: seis especies. Os comuns carregam o comeco do jogo.
  { id: 'p1',  tier: 1, water: 'doce',    min: 8,   max: 18,  engine: 'track' },
  { id: 'p10', tier: 1, water: 'doce',    min: 10,  max: 22,  engine: 'track' },
  { id: 'p3',  tier: 1, water: 'salgada', min: 25,  max: 50,  engine: 'dodge' },
  { id: 'p11', tier: 1, water: 'doce',    min: 20,  max: 45,  engine: 'dodge' },
  { id: 'p2',  tier: 1, water: 'doce',    min: 25,  max: 55,  engine: 'hold' },
  { id: 'p12', tier: 1, water: 'doce',    min: 20,  max: 40,  engine: 'hold' },

  // ---- Meio: dez especies, a faixa mais povoada do lago.
  { id: 'p4',  tier: 2, water: 'salgada', min: 30,  max: 70,  engine: 'track' },
  { id: 'p13', tier: 2, water: 'salgada', min: 25,  max: 55,  engine: 'track' },
  { id: 'p14', tier: 2, water: 'doce',    min: 25,  max: 45,  engine: 'track' },
  { id: 'p15', tier: 2, water: 'doce',    min: 20,  max: 40,  engine: 'track' },
  { id: 'p6',  tier: 2, water: 'doce',    min: 35,  max: 80,  engine: 'dodge' },
  { id: 'p16', tier: 2, water: 'doce',    min: 30,  max: 60,  engine: 'dodge' },
  { id: 'p17', tier: 2, water: 'doce',    min: 25,  max: 50,  engine: 'dodge' },
  { id: 'p18', tier: 2, water: 'salgada', min: 30,  max: 65,  engine: 'dodge' },
  { id: 'p5',  tier: 2, water: 'doce',    min: 28,  max: 58,  engine: 'hold' },
  { id: 'p19', tier: 2, water: 'doce',    min: 40,  max: 80,  engine: 'hold' },

  // ---- Abissal: seis especies, todas grandes.
  { id: 'p7',  tier: 3, water: 'salgada', min: 45,  max: 95,  engine: 'track' },
  { id: 'p20', tier: 3, water: 'doce',    min: 60,  max: 120, engine: 'track' },
  { id: 'p9',  tier: 3, water: 'doce',    min: 80,  max: 150, engine: 'dodge' },
  { id: 'p21', tier: 3, water: 'salgada', min: 40,  max: 90,  engine: 'dodge' },
  { id: 'p8',  tier: 3, water: 'doce',    min: 55,  max: 105, engine: 'hold' },
  { id: 'p22', tier: 3, water: 'doce',    min: 90,  max: 180, engine: 'hold' },

  // ---- Os dois lendarios. Cada um mora num UNICO ponto de pesca e so morde
  // com a melhor isca. Mesmo assim quase nunca aparece: sao o fim do jogo.
  { id: 'p23', tier: 3, water: 'doce',    min: 150, max: 300, engine: 'hold',
    legend: { spot: 's6', bait: 'sardinha' } },
  { id: 'p24', tier: 3, water: 'salgada', min: 120, max: 250, engine: 'hold',
    legend: { spot: 's7', bait: 'sardinha' } },
];

export const FISH: Fish[] = TABELA.map((l, i) => {
  const peso = l.legend ? LENDA : l.engine === 'hold' ? RARO : COMUM;
  const base = {
    id: l.id, tier: l.tier, weight: peso, water: l.water, color: cor(i),
    sizeMin: l.min, sizeMax: l.max, legend: l.legend,
  };
  // Cada especie leva a PROPRIA copia dos parametros. Compartilhar o objeto
  // faria duas especies da mesma faixa terem params identicos por referencia,
  // e qualquer efeito que dependa dessa identidade deixaria de disparar.
  if (l.engine === 'track') return { ...base, engine: 'track' as const, params: { ...TRACK[l.tier] } };
  if (l.engine === 'hold') return { ...base, engine: 'hold' as const, params: { ...HOLD[l.tier] } };
  return { ...base, engine: 'dodge' as const, params: { ...DODGE[l.tier] } };
});

/** Qualidade 0..1 vira tamanho dentro da faixa da especie. */
export function sizeOf(fish: Fish, quality: number): number {
  const q = Math.min(1, Math.max(0, quality));
  return Math.round(fish.sizeMin + (fish.sizeMax - fish.sizeMin) * q);
}

/** Afinavel: quanto o modo garantido desacelera o minigame. */
const GUARANTEED_SLOWDOWN = 1.6;

/**
 * O mesmo peixe, mais lento. O modo garantido promete "mais lento, mas sempre
 * pesca", e sem isto so a parte do "sempre pesca" era verdade.
 */
export function guaranteedFish(fish: Fish): Fish {
  const s = GUARANTEED_SLOWDOWN;
  if (fish.engine === 'track') {
    return { ...fish, params: { ...fish.params, periodMs: fish.params.periodMs * s } };
  }
  if (fish.engine === 'dodge') {
    return { ...fish, params: { ...fish.params, periodMs: fish.params.periodMs * s } };
  }
  return {
    ...fish,
    params: {
      ...fish.params,
      fishSpeed: fish.params.fishSpeed / s,
      drainRate: fish.params.drainRate / s,
    },
  };
}
