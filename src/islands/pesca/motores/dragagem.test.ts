import { describe, it, expect } from 'vitest';
import type { ParamsDragagem } from '../tipos';
import {
  iniciarDragagem,
  trocarPistaDragagem,
  avancarDragagem,
  portoesCruzados,
} from './dragagem';

const base: ParamsDragagem = {
  pistas: 2,
  periodoMs: 1000,
  portoes: [
    { pos: 0.25, abertas: [0] },
    { pos: 0.75, abertas: [1] },
  ],
  voltasParaFisgar: 1,
  batidasToleradas: 1,
};

describe('portoesCruzados', () => {
  it('acha o portao dentro do intervalo', () => {
    expect(portoesCruzados(base, 200, 300).map((p) => p.pos)).toEqual([0.25]);
  });

  it('nao acha nada quando o intervalo nao cobre portao', () => {
    expect(portoesCruzados(base, 300, 400)).toHaveLength(0);
  });

  it('acha os dois quando o intervalo cobre os dois', () => {
    expect(portoesCruzados(base, 200, 800)).toHaveLength(2);
  });

  it('atravessa o fim da volta', () => {
    expect(portoesCruzados(base, 900, 1300).map((p) => p.pos)).toEqual([0.25]);
  });
});

describe('trocarPistaDragagem', () => {
  it('avanca a pista circularmente', () => {
    let e = iniciarDragagem(base);
    expect(e.pista).toBe(0);
    e = trocarPistaDragagem(base, e);
    expect(e.pista).toBe(1);
    e = trocarPistaDragagem(base, e);
    expect(e.pista).toBe(0);
  });
});

describe('avancarDragagem', () => {
  it('passa pelo portao na pista aberta sem batida', () => {
    const e = avancarDragagem(base, iniciarDragagem(base), 300);
    expect(e.batidas).toBe(0);
  });

  it('passa pelo portao na pista fechada e leva batida', () => {
    let e = trocarPistaDragagem(base, iniciarDragagem(base)); // pista 1
    e = avancarDragagem(base, e, 300); // portao 0.25 so abre a pista 0
    expect(e.batidas).toBe(1);
  });

  it('batidas alem da tolerancia perdem o peixe', () => {
    let e = trocarPistaDragagem(base, iniciarDragagem(base)); // pista 1
    e = avancarDragagem(base, e, 300);  // batida 1
    e = avancarDragagem(base, e, 1300); // batida 2, alem da tolerancia 1
    expect(e.terminado).toEqual({ pego: false, qualidade: 0 });
  });

  it('completar as voltas fisga', () => {
    const e = avancarDragagem(base, iniciarDragagem(base), 1100);
    expect(e.terminado?.pego).toBe(true);
  });

  it('qualidade cai com as batidas', () => {
    // Limpo: pista 0 no portao 0.25 (abre [0]), troca, pista 1 no 0.75 (abre [1]).
    let limpo = iniciarDragagem(base);
    limpo = avancarDragagem(base, limpo, 300);
    limpo = trocarPistaDragagem(base, limpo);
    limpo = avancarDragagem(base, limpo, 1100);
    expect(limpo.batidas).toBe(0);
    expect(limpo.terminado?.pego).toBe(true);

    // Sujo: fica na pista 0 a volta toda, entao bate no portao 0.75.
    const sujo = avancarDragagem(base, iniciarDragagem(base), 1100);
    expect(sujo.batidas).toBe(1);
    expect(sujo.terminado?.pego).toBe(true);
    expect(sujo.terminado!.qualidade).toBeLessThan(limpo.terminado!.qualidade);
  });

  it('nao avanca depois de terminado', () => {
    const fim = avancarDragagem(base, iniciarDragagem(base), 1100);
    expect(avancarDragagem(base, fim, 2000)).toBe(fim);
  });
});
