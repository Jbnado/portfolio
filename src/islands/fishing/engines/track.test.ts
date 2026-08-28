import { describe, it, expect } from 'vitest';
import type { TrackParams } from '../types';
import {
  positionAt,
  distanceToZone,
  startTrack,
  pressTrack,
} from './track';

const base: TrackParams = {
  path: 'reta',
  periodMs: 1000,
  zones: [{ pos: 0.5, size: 0.2 }],
  hits: 1,
  alternates: false,
  tolerance: null,
};

describe('positionAt', () => {
  it('reta anda de 0 a 1 e reinicia', () => {
    expect(positionAt(base, 0)).toBeCloseTo(0);
    expect(positionAt(base, 500)).toBeCloseTo(0.5);
    expect(positionAt(base, 1000)).toBeCloseTo(0);
  });

  it('pendulo vai e volta dentro de um periodo', () => {
    const p = { ...base, path: 'pendulo' as const };
    expect(positionAt(p, 0)).toBeCloseTo(0);
    expect(positionAt(p, 250)).toBeCloseTo(0.5);
    expect(positionAt(p, 500)).toBeCloseTo(1);
    expect(positionAt(p, 750)).toBeCloseTo(0.5);
  });

  it('radial e subida andam como a reta', () => {
    for (const path of ['radial', 'subida'] as const) {
      expect(positionAt({ ...base, path }, 250)).toBeCloseTo(0.25);
    }
  });
});

describe('distanceToZone', () => {
  it('mede distancia direta nos caminhos abertos', () => {
    expect(distanceToZone('reta', 0.5, { pos: 0.5, size: 0.2 })).toBeCloseTo(0);
    expect(distanceToZone('reta', 0.1, { pos: 0.9, size: 0.2 })).toBeCloseTo(0.8);
  });

  it('no radial a volta fecha, entao 0.1 e 0.9 estao perto', () => {
    expect(distanceToZone('radial', 0.1, { pos: 0.9, size: 0.2 })).toBeCloseTo(0.2);
  });
});

describe('pressTrack', () => {
  it('acerto no centro da zona fisga com qualidade cheia', () => {
    const e = pressTrack(base, startTrack(base), 500);
    expect(e.done).toEqual({ caught: true, quality: 1 });
  });

  it('acerto na borda da zona fisga com qualidade baixa', () => {
    // zona 0.5 +- 0.1; posicao 0.59 fica quase na borda
    const e = pressTrack(base, startTrack(base), 590);
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
    e = pressTrack(p, e, 500);
    expect(e.done).toBeNull();
    expect(e.hits).toBe(1);
    e = pressTrack(p, e, 1500);
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
    e = pressTrack(p, e, 200);
    expect(e.activeZone).toBe(1);
    e = pressTrack(p, e, 1800);
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
    e = pressTrack(base, e, 1500);
    expect(e.done?.caught).toBe(true);
    expect(e.done!.quality).toBeLessThan(1);
  });

  it('nao aceita aperto depois de terminado', () => {
    const e1 = pressTrack(base, startTrack(base), 500);
    const e2 = pressTrack(base, e1, 500);
    expect(e2).toBe(e1);
  });
});
