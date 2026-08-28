import { describe, it, expect } from 'vitest';
import type { ParamsSustentacao } from '../tipos';
import { iniciarSustentacao, avancarSustentacao } from './sustentacao';

const base: ParamsSustentacao = {
  alturaFaixa: 0.2,
  gravidade: 0.000004,
  impulso: 0.00001,
  padrao: 'calmo',
  velocidadePeixe: 0.0003,
  encher: 0.0005,
  drenar: 0.0004,
};

/** rnd fixo: o peixe sempre mira o mesmo ponto, entao o teste e deterministico. */
const rnd = () => 0.5;

describe('iniciarSustentacao', () => {
  it('comeca com progresso pela metade e nada terminado', () => {
    const e = iniciarSustentacao(base);
    expect(e.progresso).toBeCloseTo(0.5);
    expect(e.terminado).toBeNull();
  });
});

describe('avancarSustentacao', () => {
  it('segurando, a faixa sobe', () => {
    const i = iniciarSustentacao(base);
    const e = avancarSustentacao(base, i, 100, true, rnd);
    expect(e.faixaPos).toBeGreaterThan(i.faixaPos);
  });

  it('sem segurar, a faixa desce', () => {
    let e = iniciarSustentacao(base);
    e = avancarSustentacao(base, e, 100, true, rnd);
    const alto = e.faixaPos;
    e = avancarSustentacao(base, e, 300, false, rnd);
    expect(e.faixaPos).toBeLessThan(alto);
  });

  it('a faixa nao sai da barra', () => {
    let e = iniciarSustentacao(base);
    for (let i = 0; i < 200; i++) e = avancarSustentacao(base, e, 16, true, rnd);
    expect(e.faixaPos).toBeLessThanOrEqual(1);
    for (let i = 0; i < 400; i++) e = avancarSustentacao(base, e, 16, false, rnd);
    expect(e.faixaPos).toBeGreaterThanOrEqual(0);
  });

  it('peixe dentro da faixa enche o progresso', () => {
    let e = { ...iniciarSustentacao(base), faixaPos: 0.5, peixePos: 0.5, progresso: 0.5 };
    e = avancarSustentacao(base, e, 100, false, rnd);
    expect(e.progresso).toBeGreaterThan(0.5);
  });

  it('peixe fora da faixa drena o progresso', () => {
    let e = { ...iniciarSustentacao(base), faixaPos: 0.1, peixePos: 0.9, progresso: 0.5 };
    e = avancarSustentacao(base, e, 100, false, rnd);
    expect(e.progresso).toBeLessThan(0.5);
  });

  it('progresso cheio fisga com qualidade igual ao progresso final', () => {
    // dt curto de proposito: em 200ms a gravidade derruba a faixa 0.16 e o
    // peixe sai dela, entao o passo drenaria em vez de encher.
    let e = { ...iniciarSustentacao(base), faixaPos: 0.5, peixePos: 0.5, progresso: 0.995 };
    e = avancarSustentacao(base, e, 20, false, rnd);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeGreaterThan(0);
  });

  it('progresso zerado perde o peixe', () => {
    let e = { ...iniciarSustentacao(base), faixaPos: 0.1, peixePos: 0.9, progresso: 0.01 };
    e = avancarSustentacao(base, e, 200, false, rnd);
    expect(e.terminado).toEqual({ pego: false, qualidade: 0 });
  });

  it('nao avanca depois de terminado', () => {
    let e = { ...iniciarSustentacao(base), progresso: 0.01, faixaPos: 0.1, peixePos: 0.9 };
    const fim = avancarSustentacao(base, e, 200, false, rnd);
    expect(avancarSustentacao(base, fim, 200, false, rnd)).toBe(fim);
  });
});
