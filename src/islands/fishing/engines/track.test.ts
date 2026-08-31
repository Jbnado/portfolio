import { describe, it, expect } from 'vitest';
import type { TrackParams } from '../types';
import { startTrack, pressTrack, positionAt, pickZone } from './track';

const base: TrackParams = { periodMs: 1000, zoneSize: 0.2, hits: 3, tolerance: 2 };

/** rnd fixo em 0.5 poe a zona no centro: pickZone = 0.1 + 0.5*0.8 = 0.5. */
const meio = () => 0.5;
/** Com a zona no centro, t=250 poe o marcador exatamente nela; t=0, longe. */
const NO_ALVO = 250;
const FORA = 0;

describe('positionAt', () => {
  it('a barra vai e volta sem salto', () => {
    expect(positionAt(base, 0)).toBeCloseTo(0);
    expect(positionAt(base, 250)).toBeCloseTo(0.5);
    expect(positionAt(base, 500)).toBeCloseTo(1);
    expect(positionAt(base, 750)).toBeCloseTo(0.5);
    expect(positionAt(base, 1000)).toBeCloseTo(0);
  });
});

describe('pickZone', () => {
  it('a zona cabe inteira na barra, em qualquer sorteio', () => {
    for (const size of [0.1, 0.3, 0.5]) {
      for (const r of [0, 0.25, 0.5, 0.99, 1]) {
        const pos = pickZone({ ...base, zoneSize: size }, () => r);
        expect(pos - size / 2).toBeGreaterThanOrEqual(-1e-9);
        expect(pos + size / 2).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });

  it('sorteios diferentes dao lugares diferentes', () => {
    expect(pickZone(base, () => 0.1)).not.toBeCloseTo(pickZone(base, () => 0.9));
  });
});

describe('pressTrack', () => {
  it('acertar move a zona de lugar', () => {
    const s = startTrack(base, meio);
    let r = 0.2;
    const next = pressTrack(base, s, NO_ALVO, () => r);
    expect(next.hits).toBe(1);
    expect(next.zonePos).not.toBeCloseTo(s.zonePos);
  });

  it('tres acertos fisgam', () => {
    let s = startTrack(base, meio);
    for (let i = 0; i < 3; i++) s = pressTrack(base, s, NO_ALVO, meio);
    expect(s.done?.caught).toBe(true);
  });

  it('errar nao move a zona: o alvo continua onde estava', () => {
    const s = startTrack(base, meio);
    const next = pressTrack(base, s, FORA, () => 0.9);
    expect(next.misses).toBe(1);
    expect(next.zonePos).toBeCloseTo(s.zonePos);
  });

  it('perde no terceiro erro', () => {
    let s = startTrack(base, meio);
    s = pressTrack(base, s, FORA, meio);
    s = pressTrack(base, s, FORA, meio);
    expect(s.done).toBeNull();
    s = pressTrack(base, s, FORA, meio);
    expect(s.done?.caught).toBe(false);
  });

  it('tolerance null nunca perde', () => {
    const p = { ...base, tolerance: null };
    let s = startTrack(p, meio);
    for (let i = 0; i < 12; i++) s = pressTrack(p, s, FORA, meio);
    expect(s.done).toBeNull();
  });

  it('acerto no centro tres vezes da qualidade cheia', () => {
    let s = startTrack(base, meio);
    for (let i = 0; i < 3; i++) s = pressTrack(base, s, NO_ALVO, meio);
    expect(s.done?.quality).toBeCloseTo(1);
  });

  it('cada erro custa 15% do tamanho', () => {
    let s = startTrack(base, meio);
    s = pressTrack(base, s, FORA, meio);
    for (let i = 0; i < 3; i++) s = pressTrack(base, s, NO_ALVO, meio);
    expect(s.done?.caught).toBe(true);
    expect(s.done?.quality).toBeCloseTo(0.85);
  });

  it('perder nunca rende mais que vencer com os mesmos erros', () => {
    const p = { ...base, tolerance: 0 };
    let s = startTrack(p, meio);
    s = pressTrack(p, s, NO_ALVO, meio);
    s = pressTrack(p, s, FORA, meio);
    expect(s.done?.caught).toBe(false);
    expect(s.done!.quality).toBeLessThan(1);
  });

  it('nao muda o estado recebido', () => {
    const s = startTrack(base, meio);
    const copia = JSON.parse(JSON.stringify(s));
    pressTrack(base, s, NO_ALVO, meio);
    expect(JSON.parse(JSON.stringify(s))).toEqual(copia);
  });
});
