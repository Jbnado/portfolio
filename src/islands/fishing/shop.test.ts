import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, LINE_PRICE, BAITS,
  buyLine, equipLine, buyBait, equipBait, sellAll, addCatch,
  lineReaches, canFish, reachTier, luckOf, fishValue, coinPerCm, holdValue, rareWeight, luckyQuality,
} from './shop';
import { FISH } from './fish';

const rico = { ...EMPTY_PROGRESS, coins: 1000 };

describe('valor do pescado', () => {
  const grupo = (t: 1 | 2 | 3, raro: boolean) =>
    FISH.filter((f) => f.tier === t && !f.legend && (f.engine === 'hold') === raro);
  const maiorDo = (t: 1 | 2 | 3, raro: boolean) =>
    grupo(t, raro).reduce((a, b) => (b.sizeMax > a.sizeMax ? b : a));

  // A TAXA por centimetro e a fonte da verdade; o teto de cada grupo e
  // consequencia dela. Com o teto na frente, engordar um peixe BAIXAVA a taxa
  // do grupo — um abissal mais imenso pagava menos por cm, que e o oposto do
  // que o jogo promete.
  it('a taxa por centimetro e a que o dono definiu', () => {
    const taxa = { comum: { 1: 0.1, 2: 0.125, 3: 0.333 }, raro: { 1: 0.182, 2: 0.313, 3: 0.556 } };
    for (const t of [1, 2, 3] as const) {
      expect(coinPerCm(maiorDo(t, false))).toBeCloseTo(taxa.comum[t], 3);
      expect(coinPerCm(maiorDo(t, true))).toBeCloseTo(taxa.raro[t], 3);
    }
  });

  it('a taxa nao depende do tamanho: engordar um peixe so faz ele valer mais', () => {
    for (const t of [1, 2, 3] as const) {
      const g = grupo(t, false);
      for (const f of g) expect(coinPerCm(f)).toBeCloseTo(coinPerCm(g[0]), 6);
    }
  });

  /** Peixe medio de uma faixa: o valor do exemplar do meio da escala, media
      sobre as especies nao lendarias. E a unidade em que o dono pensa o
      preco — "quantos peixes tenho de vender para comprar a proxima linha". */
  const peixeMedio = (t: 1 | 2 | 3) => {
    const g = FISH.filter((f) => f.tier === t && !f.legend);
    const v = g.map((f) => fishValue(f.id, (f.sizeMin + f.sizeMax) / 2));
    return v.reduce((a, b) => a + b, 0) / v.length;
  };

  // O dono fixou o ESFORCO, nao o preco: 15 peixes medios para a linha do
  // meio, 20 para a abissal. O preco e derivado. Sem este teste, mudar o
  // tamanho ou a taxa de um peixe move a progressao em silencio — e nada mais
  // no projeto olha para essa relacao.
  it('o esforco de cada linha e o que o dono pediu: 15 no meio, 20 no abissal', () => {
    expect(LINE_PRICE.medio / peixeMedio(2)).toBeCloseTo(15, 0);
    expect(LINE_PRICE.abissal / peixeMedio(3)).toBeCloseTo(20, 0);
    // O raso continua nos 50 que ele deu, sem esforco alvo.
    expect(LINE_PRICE.raso).toBe(50);
  });

  it('a linha custa mais esforco a cada faixa: o abissal e o compromisso grande', () => {
    const e = ([1, 2, 3] as const).map((t) => {
      const preco = t === 1 ? LINE_PRICE.raso : t === 2 ? LINE_PRICE.medio : LINE_PRICE.abissal;
      return preco / peixeMedio(t);
    });
    expect(e[1]).toBeGreaterThan(e[0]);
    expect(e[2]).toBeGreaterThan(e[1]);
  });

  // A isca braba deixou de ser o item mais caro do jogo quando a linha abissal
  // subiu para 900. O que a define nao e o lugar no ranking de precos: e ser a
  // ultima compra, a de melhor sorte, e custar uma temporada no abissal.
  it('a isca braba e de fim de jogo: melhor sorte e uma temporada de abissal', () => {
    const braba = BAITS[BAITS.length - 1];
    expect(braba.price).toBe(Math.max(...BAITS.map((b) => b.price)));
    expect(braba.luck).toBe(Math.max(...BAITS.map((b) => b.luck)));
    expect(braba.price / peixeMedio(3)).toBeGreaterThan(12);
  });

  it('o valor e proporcional aos centimetros: peixe maior paga mais, sempre', () => {
    for (const t of [1, 2, 3] as const) {
      const comuns = grupo(t, false);
      // Entre especies DIFERENTES da mesma faixa, quem der mais cm paga mais.
      for (const a of comuns) {
        for (const b of comuns) {
          if (a.sizeMax === b.sizeMax) continue;
          const maior = a.sizeMax > b.sizeMax ? a : b;
          const menor = a.sizeMax > b.sizeMax ? b : a;
          expect(fishValue(maior.id, maior.sizeMax)).toBeGreaterThanOrEqual(fishValue(menor.id, menor.sizeMax));
        }
      }
      // E dentro da MESMA especie, idem.
      for (const f of comuns) {
        expect(fishValue(f.id, f.sizeMax)).toBeGreaterThan(fishValue(f.id, f.sizeMin));
      }
    }
  });

  it('dois peixes do mesmo grupo com o mesmo tamanho valem o mesmo', () => {
    const [a, b] = grupo(2, false);
    expect(fishValue(a.id, 40)).toBe(fishValue(b.id, 40));
  });

  it('o raro paga mais por centimetro que o comum da mesma faixa', () => {
    for (const t of [1, 2, 3] as const) {
      expect(coinPerCm(maiorDo(t, true))).toBeGreaterThan(coinPerCm(maiorDo(t, false)));
    }
  });

  it('a faixa mais funda paga mais por centimetro', () => {
    expect(coinPerCm(maiorDo(3, false))).toBeGreaterThan(coinPerCm(maiorDo(2, false)));
    expect(coinPerCm(maiorDo(2, false))).toBeGreaterThan(coinPerCm(maiorDo(1, false)));
  });

  it('o lendario paga mais que qualquer outro', () => {
    const lenda = FISH.find((f) => f.legend)!;
    const melhorComum = maiorDo(3, true);
    expect(fishValue(lenda.id, lenda.sizeMax)).toBeGreaterThan(fishValue(melhorComum.id, melhorComum.sizeMax));
  });

  it('nenhum peixe vale zero', () => {
    for (const f of FISH) expect(fishValue(f.id, f.sizeMin)).toBeGreaterThanOrEqual(1);
  });

  it('peixe de especie desconhecida nao quebra a conta', () => {
    expect(fishValue('nao-existe', 50)).toBe(1);
  });

  it('a linha do raso exige varios peixes do raso', () => {
    const melhor = maiorDo(1, false);
    expect(LINE_PRICE.raso / fishValue(melhor.id, melhor.sizeMax)).toBeGreaterThanOrEqual(10);
  });

  it('vender esvazia o porao e credita', () => {
    const f = maiorDo(1, false);
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
