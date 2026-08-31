import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS, LINES, LINE_PRICE, BAITS,
  buyLine, equipLine, buyBait, equipBait, sellAll, addCatch,
  rareBites, canFish, reachTier, luckOf, fishValue, coinPerCm, holdValue, rareWeight, luckyQuality,
  rarityOf,
} from './shop';
import { FISH } from './fish';

/** Saldo folgado de proposito: os testes de equipar querem provar a REGRA de
    "so uma por vez", e nao esbarrar em dinheiro. Estava em 1000, e deixou de
    dar para duas iscas quando a braba subiu de 800 para perto de 1000. */
const rico = { ...EMPTY_PROGRESS, coins: 5000 };

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
    const taxa = { comum: { 1: 0.2, 2: 0.25, 3: 0.666 }, raro: { 1: 0.364, 2: 0.626, 3: 1.112 } };
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

  /**
   * Quanto se ganha POR FISGADA na faixa `t`, com a isca de sorte `luck`.
   *
   * Esta e a unidade certa para precificar, e o teste anterior usava a errada.
   * Ele media o esforco de cada linha em "peixes medios da faixa que a linha
   * DESTRAVA" — mas ninguem pesca no abissal antes de comprar a linha do
   * abissal. As 900 moedas juntavam-se no MEIO, e o preco derivado da faixa
   * errada custava 132 fisgadas em vez das 20 pedidas: 59 por cento do grind
   * do jogo inteiro numa compra so.
   *
   * O valor esperado sai dos pesos do sorteio, sem aleatoriedade: a qualidade
   * media de `luckyQuality` sobre q uniforme e 0.5 + 0.5*luck.
   */
  const ganhoPorFisgada = (t: 1 | 2 | 3, luck: number) => {
    const qMedia = 0.5 + 0.5 * luck;
    const pool = FISH.filter((f) => {
      if (f.tier > t) return false;
      if (f.legend) return false;               // exige ponto e isca proprios
      if (f.engine === 'hold') return luck > 0 || t > 1;  // o raro so morde com isca no raso
      return true;
    }).map((f) => {
      const distancia = t - f.tier;
      const perto = distancia === 0 ? 1 : distancia === 1 ? 0.35 : 0.12;
      const base = f.engine === 'hold' ? rareWeight(f.weight, luck) : f.weight;
      const peso = Math.max(1, Math.round(base * perto));
      return { peso, valor: fishValue(f.id, f.sizeMin + (f.sizeMax - f.sizeMin) * qMedia) };
    });
    const total = pool.reduce((a, p) => a + p.peso, 0);
    return pool.reduce((a, p) => a + p.peso * p.valor, 0) / total;
  };

  /** Fisgadas necessarias para comprar `preco`, poupando na faixa `t`. */
  const fisgadas = (preco: number, t: 1 | 2 | 3, luck: number) =>
    preco / ganhoPorFisgada(t, luck);

  const SORTE = { nenhuma: 0, minhoca: BAITS[0].luck, camarao: BAITS[1].luck };

  // O dono fixou o ESFORCO, nao o preco, e o esforco conta-se em FISGADAS na
  // faixa onde se poupa. Sem este teste, mudar tamanho ou taxa de um peixe
  // move a progressao em silencio.
  it('cada compra custa o numero de fisgadas pedido, na faixa onde se poupa', () => {
    expect(fisgadas(BAITS[0].price, 1, SORTE.nenhuma)).toBeCloseTo(6, 0);
    expect(fisgadas(LINE_PRICE.medio, 1, SORTE.minhoca)).toBeCloseTo(8, 0);
    expect(fisgadas(BAITS[1].price, 2, SORTE.minhoca)).toBeCloseTo(8, 0);
    expect(fisgadas(LINE_PRICE.abissal, 2, SORTE.camarao)).toBeCloseTo(10, 0);
    expect(fisgadas(BAITS[2].price, 3, SORTE.camarao)).toBeCloseTo(18, 0);
  });

  // O tecto que faltava. Um joguinho de browser nao pode pedir uma hora para
  // ser visto por inteiro, e era o que pedia: 223 fisgadas, cerca de 67
  // minutos. Este numero e o que impede a economia de voltar a inchar.
  it('o jogo inteiro cabe em cerca de cinquenta fisgadas', () => {
    const total =
      fisgadas(BAITS[0].price, 1, SORTE.nenhuma) +
      fisgadas(LINE_PRICE.medio, 1, SORTE.minhoca) +
      fisgadas(BAITS[1].price, 2, SORTE.minhoca) +
      fisgadas(LINE_PRICE.abissal, 2, SORTE.camarao) +
      fisgadas(BAITS[2].price, 3, SORTE.camarao);
    expect(total).toBeGreaterThan(40);
    expect(total).toBeLessThan(58);
  });

  it('a linha do abissal custa mais esforco que a do meio', () => {
    expect(fisgadas(LINE_PRICE.abissal, 2, SORTE.camarao))
      .toBeGreaterThan(fisgadas(LINE_PRICE.medio, 1, SORTE.minhoca));
  });

  // A primeira compra do jogo e a isca de minhoca. Ela tem de caber numa
  // sessao curta, senao o comeco arrasta.
  it('a primeira compra cabe numa sessao curta', () => {
    expect(fisgadas(BAITS[0].price, 1, SORTE.nenhuma)).toBeLessThan(8);
  });

  // A isca braba nao e definida pelo lugar no ranking de precos: e ser a
  // ultima compra, a de melhor sorte, e a que custa mais fisgadas.
  it('a isca braba e de fim de jogo: melhor sorte e o maior esforco', () => {
    const braba = BAITS[BAITS.length - 1];
    expect(braba.price).toBe(Math.max(...BAITS.map((b) => b.price)));
    expect(braba.luck).toBe(Math.max(...BAITS.map((b) => b.luck)));
    expect(fisgadas(braba.price, 3, SORTE.camarao))
      .toBeGreaterThan(fisgadas(LINE_PRICE.abissal, 2, SORTE.camarao));
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

  // A economia e a vista da fisgada leem a raridade da MESMA funcao. Se as
  // duas a calculassem por conta propria, um peixe podia pagar como raro e
  // comemorar como comum.
  it('a raridade sai de um lugar so: lendario, SUSTENTACAO raro, resto comum', () => {
    for (const f of FISH) {
      const esperado = f.legend ? 'lenda' : f.engine === 'hold' ? 'raro' : 'comum';
      expect(rarityOf(f)).toBe(esperado);
    }
    expect(new Set(FISH.map(rarityOf))).toEqual(new Set(['comum', 'raro', 'lenda']));
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
  // So ha linha onde ela e PERMISSAO. O raso pesca-se sem nada, entao nao ha
  // linha do raso para vender — comprava-se um item que nao levava a lado
  // nenhum e ainda adiava o fundo.
  it('nao ha linha do raso para comprar', () => {
    expect(LINES).toEqual(['medio', 'abissal']);
  });

  it('comprar ja equipa: ninguem compra pra deixar na gaveta', () => {
    const p = buyLine(rico, 'medio');
    expect(p.lines).toContain('medio');
    expect(p.line).toBe('medio');
  });

  it('so uma fica equipada por vez', () => {
    let p = buyLine({ ...rico, coins: 2000 }, 'medio');
    p = buyLine(p, 'abissal');
    expect(p.line).toBe('abissal');
    p = equipLine(p, 'medio');
    expect(p.line).toBe('medio');
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
    const p = buyLine(rico, 'medio');
    expect(buyLine(p, 'medio').coins).toBe(rico.coins - LINE_PRICE.medio);
  });
});

describe('quem abre o peixe raro', () => {
  // No raso quem abre e a ISCA. Mais fundo a permissao ja e a propria linha:
  // quem esta a pescar no meio tem a linha do meio, senao nao estaria ali.
  it('no raso e a isca, nao a linha', () => {
    expect(rareBites(EMPTY_PROGRESS, 'raso')).toBe(false);
    expect(rareBites(buyBait(rico, 'minhoca'), 'raso')).toBe(true);
    expect(rareBites(buyLine(rico, 'abissal'), 'raso')).toBe(false);
  });

  it('mais fundo, quem abre e a linha que ja e precisa para pescar ali', () => {
    const meio = buyLine(rico, 'medio');
    expect(rareBites(meio, 'medio')).toBe(true);
    expect(rareBites(meio, 'abissal')).toBe(false);
    expect(rareBites(buyLine({ ...rico, coins: 2000 }, 'abissal'), 'abissal')).toBe(true);
  });
});

describe('onde da pra pescar', () => {
  it('sem linha, so o raso — senao o jogo comeca travado', () => {
    expect(canFish(EMPTY_PROGRESS, 'raso')).toBe(true);
    expect(canFish(EMPTY_PROGRESS, 'medio')).toBe(false);
    expect(canFish(EMPTY_PROGRESS, 'abissal')).toBe(false);
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

  // Pescar no raso e de graca; o raro do raso e que nao e.
  it('o raso pesca-se sem nada, mas o raro do raso pede a isca', () => {
    expect(canFish(EMPTY_PROGRESS, 'raso')).toBe(true);
    expect(rareBites(EMPTY_PROGRESS, 'raso')).toBe(false);
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
    buyLine(p, 'medio'); equipLine(p, 'medio'); buyBait(p, 'minhoca');
    equipBait(p, 'minhoca'); sellAll(p); addCatch(p, 'p1', 10);
    expect(JSON.parse(JSON.stringify(p))).toEqual(copia);
  });
});
