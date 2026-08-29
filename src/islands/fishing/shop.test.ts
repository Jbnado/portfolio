import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, LINE_PRICE, BAITS,
  buyLine, equipLine, buyBait, equipBait, sellAll, addCatch,
  lineReaches, canFish, reachTier, luckOf, fishValue, holdValue, rareWeight, luckyQuality,
} from './shop';
import { FISH } from './fish';

const rico = { ...EMPTY_PROGRESS, coins: 1000 };

describe('valor do pescado', () => {
  const raro = (t: 1 | 2 | 3) => FISH.find((f) => f.tier === t && f.engine === 'hold')!;
  const comum = (t: 1 | 2 | 3) => FISH.find((f) => f.tier === t && f.engine !== 'hold')!;
  const noMaximo = (f: { id: string; sizeMax: number }) => fishValue(f.id, f.sizeMax);

  it('o teto de cada faixa e o que o dono pediu', () => {
    expect(noMaximo(comum(1))).toBe(5);
    expect(noMaximo(comum(2))).toBe(10);
    expect(noMaximo(comum(3))).toBe(50);
  });

  it('so o raro de cada faixa passa do teto comum', () => {
    expect(noMaximo(raro(1))).toBe(10);
    expect(noMaximo(raro(2))).toBe(25);
    expect(noMaximo(raro(3))).toBe(100);
    for (const t of [1, 2, 3] as const) {
      expect(noMaximo(raro(t))).toBeGreaterThan(noMaximo(comum(t)));
    }
  });

  it('dentro da especie, peixe maior paga mais', () => {
    const f = comum(3);
    expect(fishValue(f.id, f.sizeMax)).toBeGreaterThan(fishValue(f.id, f.sizeMin));
  });

  it('nenhum peixe vale zero', () => {
    for (const f of FISH) expect(fishValue(f.id, f.sizeMin)).toBeGreaterThanOrEqual(1);
  });

  it('peixe de especie desconhecida nao quebra a conta', () => {
    expect(fishValue('nao-existe', 50)).toBe(1);
  });

  it('a linha do raso exige varios peixes do raso', () => {
    const porPeixe = noMaximo(comum(1));
    expect(LINE_PRICE.raso / porPeixe).toBeGreaterThanOrEqual(10);
  });

  it('vender esvazia o porao e credita', () => {
    const f = comum(1);
    let p = addCatch(addCatch(EMPTY_PROGRESS, f.id, f.sizeMax), f.id, f.sizeMin);
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

describe('onde da pra pescar', () => {
  it('sem linha, so o raso — senao o jogo comeca travado', () => {
    expect(canFish(EMPTY_PROGRESS, 'raso')).toBe(true);
    expect(canFish(EMPTY_PROGRESS, 'medio')).toBe(false);
    expect(canFish(EMPTY_PROGRESS, 'abissal')).toBe(false);
  });

  it('a linha do raso NAO abre o meio', () => {
    const p = buyLine(rico, 'raso');
    expect(canFish(p, 'raso')).toBe(true);
    expect(canFish(p, 'medio')).toBe(false);
    expect(canFish(p, 'abissal')).toBe(false);
  });

  it('a linha do meio abre raso e meio, e nao o abissal', () => {
    const p = buyLine(rico, 'medio');
    expect(canFish(p, 'medio')).toBe(true);
    expect(canFish(p, 'abissal')).toBe(false);
  });

  it('a abissal abre tudo', () => {
    const p = buyLine(rico, 'abissal');
    for (const d of ['raso', 'medio', 'abissal'] as const) expect(canFish(p, d)).toBe(true);
  });

  it('sem linha nenhum raro morde, nem no raso', () => {
    expect(canFish(EMPTY_PROGRESS, 'raso')).toBe(true);
    expect(lineReaches(EMPTY_PROGRESS, 'raso')).toBe(false);
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
    const p = { ...rico, hold: [{ id: 'p1', cm: 30 }] };
    const copia = JSON.parse(JSON.stringify(p));
    buyLine(p, 'raso'); equipLine(p, 'raso'); buyBait(p, 'minhoca');
    equipBait(p, 'minhoca'); sellAll(p); addCatch(p, 'p1', 10);
    expect(JSON.parse(JSON.stringify(p))).toEqual(copia);
  });
});
