import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, LINE_PRICE, BAIT_PRICE, BAIT_PACK,
  buyLine, buyBait, sellAll, addCatch, useBait, hasLine,
  fishValue, holdValue, rareWeight, luckyQuality,
} from './shop';

describe('valor do pescado', () => {
  it('peixe grande paga mais, e nenhum lance da em nada', () => {
    expect(fishValue(60)).toBeGreaterThan(fishValue(20));
    expect(fishValue(1)).toBeGreaterThanOrEqual(1);
  });

  it('vender esvazia o porao e credita as moedas', () => {
    let p = addCatch(addCatch(EMPTY_PROGRESS, 40), 60);
    const esperado = holdValue(p.hold);
    p = sellAll(p);
    expect(p.hold).toEqual([]);
    expect(p.coins).toBe(esperado);
  });
});

describe('linhas', () => {
  it('compra desconta e registra', () => {
    const p = buyLine({ ...EMPTY_PROGRESS, coins: 100 }, 'raso');
    expect(hasLine(p, 'raso')).toBe(true);
    expect(p.coins).toBe(100 - LINE_PRICE.raso);
  });

  it('sem moeda nao compra, e nada muda', () => {
    const pobre = { ...EMPTY_PROGRESS, coins: 1 };
    expect(buyLine(pobre, 'abissal')).toEqual(pobre);
  });

  it('nao compra a mesma linha duas vezes', () => {
    const p = buyLine({ ...EMPTY_PROGRESS, coins: 500 }, 'raso');
    expect(buyLine(p, 'raso')).toEqual(p);
  });

  it('a linha do fundo custa mais que a do raso', () => {
    expect(LINE_PRICE.abissal).toBeGreaterThan(LINE_PRICE.medio);
    expect(LINE_PRICE.medio).toBeGreaterThan(LINE_PRICE.raso);
  });
});

describe('iscas', () => {
  it('compra vem em pacote', () => {
    const p = buyBait({ ...EMPTY_PROGRESS, coins: BAIT_PRICE });
    expect(p.bait).toBe(BAIT_PACK);
    expect(p.coins).toBe(0);
  });

  it('cada lance gasta uma, e sem estoque nao fica negativo', () => {
    let p = { ...EMPTY_PROGRESS, bait: 1 };
    p = useBait(p);
    expect(p.bait).toBe(0);
    expect(useBait(p).bait).toBe(0);
  });

  it('a sorte da isca SOMA no peso do raro', () => {
    expect(rareWeight(10, true)).toBeGreaterThan(rareWeight(10, false));
    expect(rareWeight(10, false)).toBe(10);
  });

  it('a sorte puxa o tamanho para cima sem passar do teto', () => {
    expect(luckyQuality(0.4, true)).toBeGreaterThan(0.4);
    expect(luckyQuality(0.4, false)).toBe(0.4);
    expect(luckyQuality(1, true)).toBe(1);
    expect(luckyQuality(0.9, true)).toBeLessThanOrEqual(1);
  });
});

describe('pureza', () => {
  it('nenhuma operacao muda o estado recebido', () => {
    const p = { ...EMPTY_PROGRESS, coins: 500, bait: 2, hold: [30] };
    const copia = JSON.parse(JSON.stringify(p));
    buyLine(p, 'raso'); buyBait(p); sellAll(p); addCatch(p, 10); useBait(p);
    expect(JSON.parse(JSON.stringify(p))).toEqual(copia);
  });
});
