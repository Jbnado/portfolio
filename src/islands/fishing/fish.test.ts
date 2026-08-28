import { describe, it, expect } from 'vitest';
import { FISH, sizeOf, guaranteedFish } from './fish';
import type { TrackParams, HoldParams, DodgeParams } from './types';

describe('FISH', () => {
  it('tem nove peixes', () => {
    expect(FISH).toHaveLength(9);
  });

  it('cobre os tres motores', () => {
    const motores = new Set(FISH.map((p) => p.engine));
    expect(motores).toEqual(new Set(['track', 'hold', 'dodge']));
  });

  it('cada faixa tem exatamente um peixe de cada engine', () => {
    for (const tier of [1, 2, 3]) {
      const engines = FISH.filter((f) => f.tier === tier).map((f) => f.engine).sort();
      expect(engines).toEqual(['dodge', 'hold', 'track']);
    }
  });

  it('so existem os dois caminhos continuos', () => {
    const paths = FISH.filter((f) => f.engine === 'track').map((f) => (f.params as { path: string }).path);
    expect(new Set(paths)).toEqual(new Set(['pendulo', 'radial']));
  });

  it('nao repete id', () => {
    expect(new Set(FISH.map((p) => p.id)).size).toBe(FISH.length);
  });

  it('tem faixa de tamanho valida em todos', () => {
    for (const p of FISH) {
      expect(p.sizeMax).toBeGreaterThan(p.sizeMin);
      expect(p.sizeMin).toBeGreaterThan(0);
    }
  });

  it('a faixa 1 so perde no peixe raro de hold', () => {
    const shallow = FISH.filter((f) => f.tier === 1);
    const track = shallow.find((f) => f.engine === 'track')!;
    const dodge = shallow.find((f) => f.engine === 'dodge')!;
    const hold = shallow.find((f) => f.engine === 'hold')!;
    expect((track.params as { tolerance: number | null }).tolerance).toBeNull();
    expect((dodge.params as { bumpsAllowed: number | null }).bumpsAllowed).toBeNull();
    expect((hold.params as { graceMs: number }).graceMs).toBeGreaterThan(0);
    expect(hold.weight).toBeLessThan(track.weight);
  });
});

describe('sizeOf', () => {
  const peixe = FISH[0];

  it('qualidade 0 devolve o minimo', () => {
    expect(sizeOf(peixe, 0)).toBe(peixe.sizeMin);
  });

  it('qualidade 1 devolve o maximo', () => {
    expect(sizeOf(peixe, 1)).toBe(peixe.sizeMax);
  });

  it('interpola no meio e arredonda para inteiro', () => {
    const meio = sizeOf(peixe, 0.5);
    expect(meio).toBe(Math.round((peixe.sizeMin + peixe.sizeMax) / 2));
    expect(Number.isInteger(meio)).toBe(true);
  });

  it('prende qualidade fora de 0..1', () => {
    expect(sizeOf(peixe, -5)).toBe(peixe.sizeMin);
    expect(sizeOf(peixe, 9)).toBe(peixe.sizeMax);
  });

  it('qualidade parcial de uma perda da tamanho acima do minimo (achado I3)', () => {
    // Antes, todo peixe resgatado no modo garantido saia com quality:0 (os
    // tres motores zeravam a qualidade na perda) e sizeOf sempre devolvia
    // sizeMin. Com quality parcial vinda do motor, o resgate reflete a luta.
    expect(sizeOf(peixe, 0.4)).toBeGreaterThan(peixe.sizeMin);
  });
});

describe('guaranteedFish', () => {
  it('desacelera o periodo do trajeto e da dragagem (achado I3)', () => {
    const trajeto = FISH.find((f) => f.engine === 'track')!;
    const lento = guaranteedFish(trajeto) as typeof trajeto;
    expect((lento.params as TrackParams).periodMs).toBeGreaterThan(
      (trajeto.params as TrackParams).periodMs,
    );

    const dragagem = FISH.find((f) => f.engine === 'dodge')!;
    const lenta = guaranteedFish(dragagem) as typeof dragagem;
    expect((lenta.params as DodgeParams).periodMs).toBeGreaterThan(
      (dragagem.params as DodgeParams).periodMs,
    );
  });

  it('reduz a velocidade do peixe e o dreno da sustentacao (achado I3)', () => {
    const sustentacao = FISH.find((f) => f.engine === 'hold')!;
    const lenta = guaranteedFish(sustentacao) as typeof sustentacao;
    const rapido = sustentacao.params as HoldParams;
    const devagar = lenta.params as HoldParams;
    expect(devagar.fishSpeed).toBeLessThan(rapido.fishSpeed);
    expect(devagar.drainRate).toBeLessThan(rapido.drainRate);
  });

  it('preserva id, faixa, cor e tamanho da especie — so o ritmo muda', () => {
    const original = FISH[0];
    const lento = guaranteedFish(original);
    expect(lento.id).toBe(original.id);
    expect(lento.tier).toBe(original.tier);
    expect(lento.color).toBe(original.color);
    expect(lento.sizeMin).toBe(original.sizeMin);
    expect(lento.sizeMax).toBe(original.sizeMax);
  });
});
