import { describe, it, expect } from 'vitest';
import {
  depthAt, spotUnder, atShop, moveBoat, cameraAt, TIER_BY_DEPTH,
  SPOTS, SHOP_X, SHORE_TO, BOAT_START, WORLD_MAX, WORLD_MIN, REACH,
} from './world';

describe('depthAt', () => {
  it('fica mais fundo conforme anda para a direita', () => {
    expect(depthAt(0)).toBe('raso');
    expect(depthAt(43)).toBe('raso');
    expect(depthAt(45)).toBe('medio');
    expect(depthAt(71)).toBe('medio');
    expect(depthAt(73)).toBe('abissal');
    expect(depthAt(WORLD_MAX)).toBe('abissal');
  });

  it('cada fundo abre uma faixa de peixes', () => {
    expect(TIER_BY_DEPTH[depthAt(10)]).toBe(1);
    expect(TIER_BY_DEPTH[depthAt(55)]).toBe(2);
    expect(TIER_BY_DEPTH[depthAt(90)]).toBe(3);
  });
});

describe('pontos de pesca', () => {
  it('so da pra lancar em cima de um ponto', () => {
    expect(spotUnder(SPOTS[0].x)).not.toBeNull();
    expect(spotUnder(SPOTS[0].x + REACH - 0.1)).not.toBeNull();
    expect(spotUnder(SPOTS[0].x + REACH + 1)).toBeNull();
  });

  it('ha ponto em cada um dos tres fundos', () => {
    const fundos = new Set(SPOTS.map((s) => depthAt(s.x)));
    expect(fundos).toEqual(new Set(['raso', 'medio', 'abissal']));
  });

  it('nenhum ponto se sobrepoe a outro', () => {
    for (let i = 0; i < SPOTS.length; i++) {
      for (let j = i + 1; j < SPOTS.length; j++) {
        expect(Math.abs(SPOTS[i].x - SPOTS[j].x)).toBeGreaterThan(REACH * 2);
      }
    }
  });

  it('nenhum ponto fica em cima da loja', () => {
    for (const s of SPOTS) expect(atShop(s.x)).toBe(false);
  });
});

describe('barco', () => {
  it('anda para os dois lados', () => {
    expect(moveBoat(50, 1, 100)).toBeGreaterThan(50);
    expect(moveBoat(50, -1, 100)).toBeLessThan(50);
    expect(moveBoat(50, 0, 100)).toBe(50);
  });

  it('nao sai do lago', () => {
    expect(moveBoat(WORLD_MIN, -1, 5000)).toBe(WORLD_MIN);
    expect(moveBoat(WORLD_MAX, 1, 5000)).toBe(WORLD_MAX);
  });

  it('atravessa o lago inteiro em poucos segundos: o mapa e pequeno', () => {
    let x = WORLD_MIN;
    let ms = 0;
    while (x < WORLD_MAX && ms < 60000) { x = moveBoat(x, 1, 16); ms += 16; }
    expect(ms).toBeGreaterThan(2000);
    expect(ms).toBeLessThan(8000);
  });

  it('nasce na agua, nao em cima da loja', () => {
    expect(atShop(BOAT_START)).toBe(false);
    expect(BOAT_START).toBeGreaterThan(SHORE_TO);
    expect(depthAt(BOAT_START)).toBe('raso');
  });

  it('a loja esta na margem, e a margem nao tem ponto de pesca', () => {
    expect(SHOP_X).toBeLessThan(SHORE_TO);
    for (const s of SPOTS) expect(s.x).toBeGreaterThan(SHORE_TO);
  });
});

describe('camera', () => {
  it('segue o barco', () => {
    expect(cameraAt(50, 40)).toBeCloseTo(30);
  });

  it('trava nas pontas para nao mostrar vazio', () => {
    expect(cameraAt(0, 40)).toBe(0);
    expect(cameraAt(WORLD_MAX, 40)).toBe(WORLD_MAX - 40);
  });
});
