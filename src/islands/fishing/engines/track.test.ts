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

  it('topo da qualidade e alcancavel sem exigir distancia zero exata (achado I2)', () => {
    // t=250 da distancia exata 0; t=254 da uma distancia pequena (~0,008),
    // dentro do limiar que absorve o quantum de posicao de um quadro a 60fps
    // no caminho mais rapido da tabela (p7). As duas contam como perfeitas.
    const exato = pressTrack(base, startTrack(base), 250);
    const quaseExato = pressTrack(base, startTrack(base), 254);
    expect(exato.done).toEqual({ caught: true, quality: 1 });
    expect(quaseExato.done).toEqual({ caught: true, quality: 1 });
  });

  it('qualidade cai continuamente para alem do limiar de perfeicao (achado I2)', () => {
    const maisLonge = pressTrack(base, startTrack(base), 295); // dist 0.09
    const maisPerto = pressTrack(base, startTrack(base), 290); // dist 0.08
    expect(maisLonge.done!.quality).toBeGreaterThan(0);
    expect(maisLonge.done!.quality).toBeLessThan(1);
    expect(maisPerto.done!.quality).toBeGreaterThan(maisLonge.done!.quality);
  });

  it('perda preserva a media acumulada em vez de zerar (achado I3)', () => {
    // Dois acertos medianos antes do terceiro erro estourar a tolerancia:
    // a qualidade da perda reflete essa media, nao sai zerada.
    const p: TrackParams = { ...base, hits: 3, tolerance: 0 };
    let e = startTrack(p);
    e = pressTrack(p, e, 290); // acerto parcial, fase ascendente
    expect(e.done).toBeNull();
    e = pressTrack(p, e, 710); // acerto parcial, fase descendente
    expect(e.done).toBeNull();
    e = pressTrack(p, e, 0); // erro: fora da zona, estoura tolerancia 0
    expect(e.done?.caught).toBe(false);
    expect(e.done!.quality).toBeGreaterThan(0);
    // media (dois acertos ~0.2667 cada) menos 1 erro * 0.15 (achado C4).
    expect(e.done!.quality).toBeCloseTo(0.26666666 - 0.15, 5);
  });

  it('perder nunca vale mais que vencer com a mesma precisao e mais erros (achado C4)', () => {
    // p7 (TRAJETO do abissal): dois acertos perfeitos e dai duas jogadas
    // divergem com o MESMO tanto de erro pelo caminho — uma completa a
    // captura com um terceiro acerto perfeito, a outra estoura a tolerancia
    // no erro seguinte. Antes do fix, so o caminho de vitoria descontava
    // erro (0.15 por erro): a perda saia sempre em quality:mean(acertos),
    // entao perder com 3 erros podia pescar peixe MAIOR que vencer com 2 —
    // 1.0 > 0.7. O fix aplica o mesmo desconto nos dois caminhos.
    const p: TrackParams = {
      path: 'pendulo', periodMs: 1500,
      zones: [{ pos: 0.2, size: 0.12 }, { pos: 0.8, size: 0.12 }],
      hits: 3, alternates: true, tolerance: 2,
    };

    let vence = startTrack(p);
    vence = pressTrack(p, vence, 150); // zona 0, centro exato
    vence = pressTrack(p, vence, 600); // zona 1, centro exato
    vence = pressTrack(p, vence, 0);   // erro 1 (zona 0 de novo, longe do centro)
    vence = pressTrack(p, vence, 0);   // erro 2 (tolerancia 2 ainda aguenta)
    expect(vence.done).toBeNull();
    vence = pressTrack(p, vence, 1350); // zona 0, centro exato: terceiro acerto, fisga
    expect(vence.done).toEqual({ caught: true, quality: 0.7 }); // 1 - 2*0.15

    let perde = startTrack(p);
    perde = pressTrack(p, perde, 150); // zona 0, centro exato
    perde = pressTrack(p, perde, 600); // zona 1, centro exato
    perde = pressTrack(p, perde, 0);   // erro 1
    perde = pressTrack(p, perde, 0);   // erro 2 (tolerancia 2 ainda aguenta)
    expect(perde.done).toBeNull();
    perde = pressTrack(p, perde, 0);   // erro 3: estoura tolerancia 2, perde
    expect(perde.done?.caught).toBe(false);
    expect(perde.done!.quality).toBeCloseTo(0.55); // 1 - 3*0.15

    expect(perde.done!.quality).toBeLessThan(vence.done!.quality);
  });

  it('tempo quantizado (movimento reduzido) produz o mesmo julgamento — achado I1', () => {
    // TrackView usa 24 degraus por periodo. Um raw fora da zona (dist 0.11)
    // quantiza para o degrau mais proximo, que cai dentro dela (dist 0.083)
    // — o motor tem que julgar a posicao quantizada, a mesma que a tela
    // desenha, nao a posicao cru que o jogador nunca ve.
    const steps = 24;
    const stepMs = base.periodMs / steps;
    const raw = 305;
    const tq = Math.round(raw / stepMs) * stepMs;
    expect(positionAt(base, raw)).toBeGreaterThan(0.6);
    expect(positionAt(base, tq)).toBeLessThan(0.6);

    const julgamentoCru = pressTrack(base, startTrack(base), raw);
    const julgamentoQuantizado = pressTrack(base, startTrack(base), tq);
    expect(julgamentoCru.done).toBeNull(); // cru: fora da zona, so registra erro
    expect(julgamentoQuantizado.done?.caught).toBe(true); // quantizado: fisga
  });
});
