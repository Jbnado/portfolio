import { describe, it, expect } from 'vitest';
import { PEIXES, tamanhoDe } from './peixes';

describe('PEIXES', () => {
  it('tem nove peixes', () => {
    expect(PEIXES).toHaveLength(9);
  });

  it('cobre os tres motores', () => {
    const motores = new Set(PEIXES.map((p) => p.motor));
    expect(motores).toEqual(new Set(['trajeto', 'sustentacao', 'dragagem']));
  });

  it('cobre os quatro caminhos do trajeto', () => {
    const caminhos = PEIXES.filter((p) => p.motor === 'trajeto').map(
      (p) => (p.params as { caminho: string }).caminho,
    );
    expect(new Set(caminhos)).toEqual(new Set(['reta', 'pendulo', 'radial', 'subida']));
  });

  it('nao repete id', () => {
    expect(new Set(PEIXES.map((p) => p.id)).size).toBe(PEIXES.length);
  });

  it('tem faixa de tamanho valida em todos', () => {
    for (const p of PEIXES) {
      expect(p.tamanhoMax).toBeGreaterThan(p.tamanhoMin);
      expect(p.tamanhoMin).toBeGreaterThan(0);
    }
  });
});

describe('tamanhoDe', () => {
  const peixe = PEIXES[0];

  it('qualidade 0 devolve o minimo', () => {
    expect(tamanhoDe(peixe, 0)).toBe(peixe.tamanhoMin);
  });

  it('qualidade 1 devolve o maximo', () => {
    expect(tamanhoDe(peixe, 1)).toBe(peixe.tamanhoMax);
  });

  it('interpola no meio e arredonda para inteiro', () => {
    const meio = tamanhoDe(peixe, 0.5);
    expect(meio).toBe(Math.round((peixe.tamanhoMin + peixe.tamanhoMax) / 2));
    expect(Number.isInteger(meio)).toBe(true);
  });

  it('prende qualidade fora de 0..1', () => {
    expect(tamanhoDe(peixe, -5)).toBe(peixe.tamanhoMin);
    expect(tamanhoDe(peixe, 9)).toBe(peixe.tamanhoMax);
  });
});
