import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, LINE_PRICE, BAITS,
  buyLine, equipLine, buyBait, equipBait, sellAll, addCatch,
  lineReaches, luckOf, fishValue, holdValue, rareWeight, luckyQuality,
} from './shop';

const rico = { ...EMPTY_PROGRESS, coins: 1000 };

describe('valor do pescado', () => {
  it('peixe grande paga mais, e nenhum lance da em nada', () => {
    expect(fishValue(60)).toBeGreaterThan(fishValue(20));
    expect(fishValue(1)).toBeGreaterThanOrEqual(1);
  });

  it('vender esvazia o porao e credita', () => {
    let p = addCatch(addCatch(EMPTY_PROGRESS, 40), 60);
    const esperado = holdValue(p.hold);
    p = sellAll(p);
    expect(p.hold).toEqual([]);
    expect(p.coins).toBe(esperado);
  });
});

describe('linhas', () => {
  it('comprar ja equipa: ninguem compra pra deixar na gaveta', () => {
    const p = buyLine(rico, 'raso');
    expect(p.lines).toContain('raso');
    expect(p.line).toBe('raso');
  });

  it('a linha abissal pesca em TODO lugar', () => {
    const p = buyLine(rico, 'abissal');
    expect(lineReaches(p, 'raso')).toBe(true);
    expect(lineReaches(p, 'medio')).toBe(true);
    expect(lineReaches(p, 'abissal')).toBe(true);
  });

  it('a linha do raso nao alcanca o fundo', () => {
    const p = buyLine(rico, 'raso');
    expect(lineReaches(p, 'raso')).toBe(true);
    expect(lineReaches(p, 'medio')).toBe(false);
    expect(lineReaches(p, 'abissal')).toBe(false);
  });

  it('sem linha equipada nenhum raro morde', () => {
    for (const d of ['raso', 'medio', 'abissal'] as const) {
      expect(lineReaches(EMPTY_PROGRESS, d)).toBe(false);
    }
  });

  it('so uma fica equipada por vez', () => {
    let p = buyLine(rico, 'raso');
    p = buyLine(p, 'abissal');
    expect(p.line).toBe('abissal');
    p = equipLine(p, 'raso');
    expect(p.line).toBe('raso');
    expect(p.lines).toHaveLength(2);
  });

  it('nao equipa o que nao comprou', () => {
    expect(equipLine(EMPTY_PROGRESS, 'abissal').line).toBeNull();
  });

  it('sem moeda nao compra, e nada muda', () => {
    const pobre = { ...EMPTY_PROGRESS, coins: 1 };
    expect(buyLine(pobre, 'abissal')).toEqual(pobre);
  });

  it('nao compra a mesma linha duas vezes', () => {
    const p = buyLine(rico, 'raso');
    expect(buyLine(p, 'raso').coins).toBe(rico.coins - LINE_PRICE.raso);
  });
});

describe('iscas', () => {
  it('sao permanentes: comprar uma vez basta e a sorte fica', () => {
    const p = buyBait(rico, 'minhoca');
    expect(p.baits).toContain('minhoca');
    expect(p.bait).toBe('minhoca');
    expect(luckOf(p)).toBeGreaterThan(0);
  });

  it('so uma fica equipada por vez', () => {
    let p = buyBait(rico, 'minhoca');
    p = buyBait(p, 'sardinha');
    expect(p.bait).toBe('sardinha');
    p = equipBait(p, 'minhoca');
    expect(p.bait).toBe('minhoca');
    expect(p.baits).toHaveLength(2);
  });

  it('isca melhor da mais sorte e custa mais', () => {
    for (let i = 1; i < BAITS.length; i++) {
      expect(BAITS[i].luck).toBeGreaterThan(BAITS[i - 1].luck);
      expect(BAITS[i].price).toBeGreaterThan(BAITS[i - 1].price);
    }
  });

  it('sem isca a sorte e zero, e nada muda no sorteio nem no tamanho', () => {
    expect(luckOf(EMPTY_PROGRESS)).toBe(0);
    expect(rareWeight(10, 0)).toBe(10);
    expect(luckyQuality(0.4, 0)).toBe(0.4);
  });

  it('a sorte SOMA no peso do raro e no tamanho, sem passar do teto', () => {
    expect(rareWeight(10, 0.5)).toBeGreaterThan(10);
    expect(luckyQuality(0.4, 0.5)).toBeGreaterThan(0.4);
    expect(luckyQuality(1, 0.85)).toBe(1);
  });
});

describe('pureza', () => {
  it('nenhuma operacao muda o estado recebido', () => {
    const p = { ...rico, hold: [30] };
    const copia = JSON.parse(JSON.stringify(p));
    buyLine(p, 'raso'); equipLine(p, 'raso'); buyBait(p, 'minhoca');
    equipBait(p, 'minhoca'); sellAll(p); addCatch(p, 10);
    expect(JSON.parse(JSON.stringify(p))).toEqual(copia);
  });
});
