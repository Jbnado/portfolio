import { describe, it, expect } from 'vitest';
import type { Fish } from './types';
import { castDuration, shadowScale, frameAt, fightFrame, LEVANTA_MS, FISGA_MS } from './cast';

/** Peixe de teste: so `sizeMax` importa aqui, o resto e enchimento valido. */
const peixe = (sizeMax: number): Fish => ({
  id: 'x', tier: 1, weight: 1, water: 'doce', color: 'var(--x)',
  sizeMin: 1, sizeMax,
  engine: 'track',
  params: { periodMs: 1000, zoneSize: 0.2, hits: 3, tolerance: 2 },
});

describe('castDuration', () => {
  it('a espera cai sempre entre um e dois segundos', () => {
    for (const r of [0, 0.01, 0.25, 0.5, 0.75, 0.99, 1]) {
      const ms = castDuration(() => r);
      expect(ms).toBeGreaterThanOrEqual(1000);
      expect(ms).toBeLessThanOrEqual(2000);
    }
  });

  it('sorteios diferentes dao esperas diferentes', () => {
    // Uma espera fixa fica mecanica e se percebe no terceiro lance.
    expect(castDuration(() => 0.1)).not.toBe(castDuration(() => 0.9));
  });
});

describe('shadowScale', () => {
  it('o vulto nunca sai da faixa, nem para tamanhos absurdos', () => {
    for (const cm of [0, 1, 18, 55, 190, 400, 10000]) {
      const s = shadowScale(peixe(cm));
      expect(s).toBeGreaterThanOrEqual(0.6);
      expect(s).toBeLessThanOrEqual(1.6);
    }
  });

  it('peixe maior lanca sombra maior', () => {
    // E o que torna o vulto honesto: ele adianta a raridade sem dar o nome.
    const s = [18, 50, 130, 400].map((cm) => shadowScale(peixe(cm)));
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
  });

  it('o menor peixe do jogo chega ao piso e o maior ao teto', () => {
    expect(shadowScale(peixe(18))).toBeCloseTo(0.6);
    expect(shadowScale(peixe(400))).toBeCloseTo(1.6);
  });
});

describe('frameAt', () => {
  const ESPERA = 1500;

  it('o gesto de levantar abre a espera', () => {
    expect(frameAt(0, ESPERA)).toBe(1);
    expect(frameAt(LEVANTA_MS - 1, ESPERA)).toBe(1);
  });

  it('depois de levantar, fica no quadro de lancado ate o peixe morder', () => {
    expect(frameAt(LEVANTA_MS, ESPERA)).toBe(2);
    expect(frameAt(ESPERA - 1, ESPERA)).toBe(2);
  });

  it('acabada a espera, a fisgada aparece com o mundo ainda limpo', () => {
    // A batida existe para a fisgada ser VISTA: antes dela o veu subia no
    // mesmo instante e cobria o quadro mais bonito da folha.
    expect(frameAt(ESPERA, ESPERA)).toBe(3);
    expect(frameAt(ESPERA + FISGA_MS - 1, ESPERA)).toBe(3);
  });

  it('a batida da fisgada nao encolhe nem estica', () => {
    expect(frameAt(ESPERA + FISGA_MS, ESPERA)).toBe(3);
    expect(frameAt(99999, ESPERA)).toBe(3);
  });

  it('a espera mais curta ainda mostra os tres quadros', () => {
    // Sem isto, um sorteio no piso pularia o gesto de levantar.
    expect(frameAt(0, 1000)).toBe(1);
    expect(frameAt(999, 1000)).toBe(2);
    expect(frameAt(1000, 1000)).toBe(3);
  });
});

describe('fightFrame', () => {
  it('peixe comum nao se debate: fica no quadro da fisgada', () => {
    // A luta com o comum e a de hoje. Sem isto, TODO peixe ganharia o mesmo
    // puxao e o raro deixaria de parecer diferente.
    for (const t of [0, 100, 500, 3000]) expect(fightFrame('comum', t)).toBe(3);
  });

  it('o raro alterna entre puxar e ceder', () => {
    const raro = [0, 300, 600, 900].map((t) => fightFrame('raro', t));
    expect(new Set(raro).size).toBe(2);
    expect(raro[0]).toBe(3);
  });

  it('a luta comeca sempre no puxao, nunca no meio do gesto', () => {
    expect(fightFrame('raro', 0)).toBe(3);
    expect(fightFrame('lenda', 0)).toBe(3);
  });

  it('o lendario se debate mais rapido que o raro', () => {
    // E o que faz a lenda PARECER lenda antes de o nome dela aparecer.
    const trocas = (k: 'raro' | 'lenda') => {
      let n = 0;
      for (let t = 1; t <= 2000; t += 1) if (fightFrame(k, t) !== fightFrame(k, t - 1)) n++;
      return n;
    };
    expect(trocas('lenda')).toBeGreaterThan(trocas('raro'));
  });

  it('so existem dois quadros na luta', () => {
    for (const k of ['comum', 'raro', 'lenda'] as const) {
      for (let t = 0; t < 2000; t += 37) expect([2, 3]).toContain(fightFrame(k, t));
    }
  });
});
