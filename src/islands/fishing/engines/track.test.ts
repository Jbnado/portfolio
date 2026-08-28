import { describe, it, expect } from 'vitest';
import type { TrackParams } from '../types';
import {
  positionAt,
  distanceToZone,
  startTrack,
  pressTrack,
} from './track';

const base: TrackParams = {
  path: 'pendulo',
  periodMs: 1000,
  zones: [{ pos: 0.5, size: 0.2 }],
  hits: 1,
  alternates: false,
  tolerance: null,
};

describe('positionAt', () => {
  it('pendulo vai e volta dentro de um periodo', () => {
    expect(positionAt(base, 0)).toBeCloseTo(0);
    expect(positionAt(base, 250)).toBeCloseTo(0.5);
    expect(positionAt(base, 500)).toBeCloseTo(1);
    expect(positionAt(base, 750)).toBeCloseTo(0.5);
  });

  it('radial percorre a volta inteira e reinicia', () => {
    const p = { ...base, path: 'radial' as const };
    expect(positionAt(p, 250)).toBeCloseTo(0.25);
    expect(positionAt(p, 1000)).toBeCloseTo(0);
  });
});

describe('distanceToZone', () => {
  it('mede distancia direta nos caminhos abertos', () => {
    expect(distanceToZone('pendulo', 0.5, { pos: 0.5, size: 0.2 })).toBeCloseTo(0);
    expect(distanceToZone('pendulo', 0.1, { pos: 0.9, size: 0.2 })).toBeCloseTo(0.8);
  });

  it('no radial a volta fecha, entao 0.1 e 0.9 estao perto', () => {
    expect(distanceToZone('radial', 0.1, { pos: 0.9, size: 0.2 })).toBeCloseTo(0.2);
  });
});

describe('pressTrack', () => {
  it('acerto no centro da zona fisga com qualidade cheia', () => {
    // t=250: fase 0.25 no trecho ascendente do pendulo, pos = 0.5 (centro).
    const e = pressTrack(base, startTrack(base), 250);
    expect(e.done).toEqual({ caught: true, quality: 1 });
  });

  it('acerto na borda da zona fisga com qualidade baixa', () => {
    // zona 0.5 +- 0.1; t=295 (ascendente) da pos 0.59, quase na borda
    const e = pressTrack(base, startTrack(base), 295);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeLessThan(0.2);
  });

  it('erro com tolerancia null nao termina e nao perde', () => {
    const e = pressTrack(base, startTrack(base), 0);
    expect(e.done).toBeNull();
    expect(e.misses).toBe(1);
  });

  it('exige tantos acertos quantos params.hits pedir', () => {
    const p = { ...base, hits: 2 };
    let e = startTrack(p);
    // t=250 (ascendente) e t=750 (descendente) caem no centro da zona.
    e = pressTrack(p, e, 250);
    expect(e.done).toBeNull();
    expect(e.hits).toBe(1);
    e = pressTrack(p, e, 750);
    expect(e.done?.caught).toBe(true);
  });

  it('alternancia troca a zona ativa a cada acerto', () => {
    const p: TrackParams = {
      ...base,
      zones: [{ pos: 0.2, size: 0.2 }, { pos: 0.8, size: 0.2 }],
      hits: 2,
      alternates: true,
    };
    let e = startTrack(p);
    expect(e.activeZone).toBe(0);
    // t=100 (ascendente) da pos 0.2, centro da zona 0.
    e = pressTrack(p, e, 100);
    expect(e.activeZone).toBe(1);
    // t=600 (descendente) da pos 0.8, centro da zona 1.
    e = pressTrack(p, e, 600);
    expect(e.done?.caught).toBe(true);
  });

  it('erro alem da tolerancia perde o peixe', () => {
    const p = { ...base, tolerance: 1 };
    let e = startTrack(p);
    e = pressTrack(p, e, 0);
    expect(e.done).toBeNull();
    e = pressTrack(p, e, 1000);
    expect(e.done).toEqual({ caught: false, quality: 0 });
  });

  it('erro custa qualidade quando nao ha perda', () => {
    let e = startTrack(base);
    e = pressTrack(base, e, 0);
    e = pressTrack(base, e, 1000);
    // t=1250: mesma fase de t=250 (0.25), pos volta ao centro da zona.
    e = pressTrack(base, e, 1250);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeLessThan(1);
  });

  it('nao aceita aperto depois de terminado', () => {
    const e1 = pressTrack(base, startTrack(base), 250);
    const e2 = pressTrack(base, e1, 250);
    expect(e2).toBe(e1);
  });
});
