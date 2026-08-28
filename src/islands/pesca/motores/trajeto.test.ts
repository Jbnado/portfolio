import { describe, it, expect } from 'vitest';
import type { ParamsTrajeto } from '../tipos';
import {
  posicaoEm,
  distanciaAteZona,
  iniciarTrajeto,
  apertarTrajeto,
} from './trajeto';

const base: ParamsTrajeto = {
  caminho: 'reta',
  periodoMs: 1000,
  zonas: [{ pos: 0.5, tamanho: 0.2 }],
  acertos: 1,
  alternancia: false,
  tolerancia: null,
};

describe('posicaoEm', () => {
  it('reta anda de 0 a 1 e reinicia', () => {
    expect(posicaoEm(base, 0)).toBeCloseTo(0);
    expect(posicaoEm(base, 500)).toBeCloseTo(0.5);
    expect(posicaoEm(base, 1000)).toBeCloseTo(0);
  });

  it('pendulo vai e volta dentro de um periodo', () => {
    const p = { ...base, caminho: 'pendulo' as const };
    expect(posicaoEm(p, 0)).toBeCloseTo(0);
    expect(posicaoEm(p, 250)).toBeCloseTo(0.5);
    expect(posicaoEm(p, 500)).toBeCloseTo(1);
    expect(posicaoEm(p, 750)).toBeCloseTo(0.5);
  });

  it('radial e subida andam como a reta', () => {
    for (const caminho of ['radial', 'subida'] as const) {
      expect(posicaoEm({ ...base, caminho }, 250)).toBeCloseTo(0.25);
    }
  });
});

describe('distanciaAteZona', () => {
  it('mede distancia direta nos caminhos abertos', () => {
    expect(distanciaAteZona('reta', 0.5, { pos: 0.5, tamanho: 0.2 })).toBeCloseTo(0);
    expect(distanciaAteZona('reta', 0.1, { pos: 0.9, tamanho: 0.2 })).toBeCloseTo(0.8);
  });

  it('no radial a volta fecha, entao 0.1 e 0.9 estao perto', () => {
    expect(distanciaAteZona('radial', 0.1, { pos: 0.9, tamanho: 0.2 })).toBeCloseTo(0.2);
  });
});

describe('apertarTrajeto', () => {
  it('acerto no centro da zona fisga com qualidade cheia', () => {
    const e = apertarTrajeto(base, iniciarTrajeto(base), 500);
    expect(e.terminado).toEqual({ pego: true, qualidade: 1 });
  });

  it('acerto na borda da zona fisga com qualidade baixa', () => {
    // zona 0.5 +- 0.1; posicao 0.59 fica quase na borda
    const e = apertarTrajeto(base, iniciarTrajeto(base), 590);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeLessThan(0.2);
  });

  it('erro com tolerancia null nao termina e nao perde', () => {
    const e = apertarTrajeto(base, iniciarTrajeto(base), 0);
    expect(e.terminado).toBeNull();
    expect(e.erros).toBe(1);
  });

  it('exige tantos acertos quantos params.acertos pedir', () => {
    const p = { ...base, acertos: 2 };
    let e = iniciarTrajeto(p);
    e = apertarTrajeto(p, e, 500);
    expect(e.terminado).toBeNull();
    expect(e.acertos).toBe(1);
    e = apertarTrajeto(p, e, 1500);
    expect(e.terminado?.pego).toBe(true);
  });

  it('alternancia troca a zona ativa a cada acerto', () => {
    const p: ParamsTrajeto = {
      ...base,
      zonas: [{ pos: 0.2, tamanho: 0.2 }, { pos: 0.8, tamanho: 0.2 }],
      acertos: 2,
      alternancia: true,
    };
    let e = iniciarTrajeto(p);
    expect(e.zonaAtiva).toBe(0);
    e = apertarTrajeto(p, e, 200);
    expect(e.zonaAtiva).toBe(1);
    e = apertarTrajeto(p, e, 1800);
    expect(e.terminado?.pego).toBe(true);
  });

  it('erro alem da tolerancia perde o peixe', () => {
    const p = { ...base, tolerancia: 1 };
    let e = iniciarTrajeto(p);
    e = apertarTrajeto(p, e, 0);
    expect(e.terminado).toBeNull();
    e = apertarTrajeto(p, e, 1000);
    expect(e.terminado).toEqual({ pego: false, qualidade: 0 });
  });

  it('erro custa qualidade quando nao ha perda', () => {
    let e = iniciarTrajeto(base);
    e = apertarTrajeto(base, e, 0);
    e = apertarTrajeto(base, e, 1000);
    e = apertarTrajeto(base, e, 1500);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeLessThan(1);
  });

  it('nao aceita aperto depois de terminado', () => {
    const e1 = apertarTrajeto(base, iniciarTrajeto(base), 500);
    const e2 = apertarTrajeto(base, e1, 500);
    expect(e2).toBe(e1);
  });
});
