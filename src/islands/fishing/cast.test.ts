import { describe, it, expect } from 'vitest';
import type { Fish } from './types';
import { castDuration, shadowScale, castFrameAt, fightFrame, LEVANTA_MS, FISGA_MS } from './cast';

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

describe('castFrameAt', () => {
  const ESPERA = 1500;
  const naBatida = (t: number) => ESPERA + t;

  it('o gesto de levantar abre a espera', () => {
    expect(castFrameAt(0, ESPERA, 'comum')).toBe(1);
    expect(castFrameAt(LEVANTA_MS - 1, ESPERA, 'comum')).toBe(1);
  });

  it('depois de levantar, fica no quadro de lancado ate o peixe morder', () => {
    expect(castFrameAt(LEVANTA_MS, ESPERA, 'comum')).toBe(2);
    expect(castFrameAt(ESPERA - 1, ESPERA, 'comum')).toBe(2);
  });

  it('o comum fisga e segura, sem se debater', () => {
    for (const p of [0, 0.3, 0.6, 0.99]) expect(castFrameAt(naBatida(p * FISGA_MS), ESPERA, 'comum')).toBe(3);
  });

  it('o raro se debate DURANTE a batida, com o mundo ainda limpo', () => {
    // E aqui que a alternancia tem de morar. Enquanto ela vivia so na fase da
    // luta, acontecia atras de um veu de 82% e ninguem a via — foi o relato de
    // quem pescou um bagre, que e `hold` e portanto raro.
    const vistos = new Set([0, 0.3, 0.55, 0.85].map((p) => castFrameAt(naBatida(p * FISGA_MS), ESPERA, 'raro')));
    expect(vistos.size).toBe(2);
  });

  it('a batida comeca sempre no puxao, seja qual for a raridade', () => {
    for (const k of ['comum', 'raro', 'lenda'] as const) {
      expect(castFrameAt(naBatida(0), ESPERA, k)).toBe(3);
    }
  });

  it('a espera mais curta ainda mostra o gesto de levantar', () => {
    expect(castFrameAt(0, 1000, 'comum')).toBe(1);
    expect(castFrameAt(999, 1000, 'comum')).toBe(2);
    expect(castFrameAt(1000, 1000, 'comum')).toBe(3);
  });

  it('nunca devolve um quadro que nao existe na folha', () => {
    for (const k of ['comum', 'raro', 'lenda'] as const) {
      for (let t = 0; t < ESPERA + FISGA_MS; t += 23) {
        expect([1, 2, 3]).toContain(castFrameAt(t, ESPERA, k));
      }
    }
  });
});

describe('fightFrame', () => {
  it('peixe comum nao se debate: fica no quadro da fisgada', () => {
    // Sem isto, TODO peixe ganharia o mesmo puxao e o raro deixaria de
    // parecer diferente.
    for (const t of [0, 100, 500, 3000]) expect(fightFrame('comum', t)).toBe(3);
  });

  it('o raro alterna entre puxar e ceder', () => {
    const raro = [0, 300, 600, 900].map((t) => fightFrame('raro', t));
    expect(new Set(raro).size).toBe(2);
    expect(raro[0]).toBe(3);
  });

  it('o gesto comeca sempre no puxao, nunca no meio dele', () => {
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

  it('so existem dois quadros no puxao', () => {
    for (const k of ['comum', 'raro', 'lenda'] as const) {
      for (let t = 0; t < 2000; t += 37) expect([2, 3]).toContain(fightFrame(k, t));
    }
  });
});
