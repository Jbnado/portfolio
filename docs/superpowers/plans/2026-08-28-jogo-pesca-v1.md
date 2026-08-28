# Jogo de Pesca v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma tela jogável com três motores de minigame e nove peixes de placeholder, para responder se o jogo é divertido antes de construir o mundo em volta dele.

**Architecture:** Cada motor é um par: um módulo `.ts` de **lógica pura** (sem DOM, sem tempo real, sem aleatoriedade não-injetada) e um componente `.tsx` de **casca visual burra** que só roda o laço de animação e desenha o que a lógica disser. A lógica pura é testada no vitest; a casca é verificada na mão. Interface e minigames em DOM/SVG; uma camada de Canvas existe e fica inerte no v1.

**Tech Stack:** Astro 5, Preact (island `client:load`), TypeScript, vitest (ambiente `node`), CSS por componente via import do Vite. **Zero dependências novas.**

**Spec:** `docs/superpowers/specs/2026-08-28-jogo-pesca-design.md`

## Global Constraints

Todo requisito abaixo vale para todas as tarefas.

- **Zero dependências novas.** Nada de engine, nada de biblioteca de animação. `package.json` não ganha entradas.
- **Orçamento: 15KB não comprimido** para todo o JS do jogo. Se um `pnpm build` mostrar o chunk da rota acima disso, **pare e reporte** antes de continuar.
- **Paridade trilíngue vinculante.** Toda string nova entra em `src/i18n/pt-br.json`, `en.json` e `es.json` na mesma tarefa que a cria. Nenhuma tarefa fecha com idioma faltando.
- **WCAG AA é piso.** Foco visível, operável por teclado, `prefers-reduced-motion` respeitado, cor nunca é o único sinal.
- **Espaço é o único botão de ação.** Setas/WASD só navegam. Nos motores, só espaço.
- **Espaçamento na grade de 4px** e tipografia na rampa de onze degraus (12/14/16/18/20/24/28/32/36/40/44px), conforme `DESIGN.md`.
- **Regra do Turno:** todo par cor/uso é declarado duas vezes, uma em `.light` e outra em `.dark`. Nunca herdar entre temas.
- **Sem `#000` nem `#fff` literais.** Use os tokens do tema.
- **Testes rodam com `pnpm test`** (vitest, ambiente `node`, `include: src/**/*.test.ts`). **Não existe jsdom no projeto** — não escreva testes que toquem `document` ou `window`.
- **Commits sem trailer de co-autoria.** Só o conteúdo da mudança.

---

### Task 1: Tipos e tabela de peixes

**Files:**
- Create: `src/islands/pesca/tipos.ts`
- Create: `src/islands/pesca/peixes.ts`
- Test: `src/islands/pesca/peixes.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `Resultado`, `Caminho`, `ParamsTrajeto`, `ParamsSustentacao`, `ParamsDragagem`, `Peixe`, `PEIXES: Peixe[]`, `tamanhoDe(peixe: Peixe, qualidade: number): number`.

- [ ] **Step 1: Escreva o teste que falha**

Crie `src/islands/pesca/peixes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PEIXES, tamanhoDe } from './peixes';

describe('PEIXES', () => {
  it('tem nove peixes', () => {
    expect(PEIXES).toHaveLength(9);
  });

  it('cobre os tres motores', () => {
    const motores = new Set(PEIXES.map((p) => p.motor));
    expect(motores).toEqual(new Set(['trajeto', 'sustentacao', 'dragagem']));
  });

  it('cobre os quatro caminhos do trajeto', () => {
    const caminhos = PEIXES.filter((p) => p.motor === 'trajeto').map(
      (p) => (p.params as { caminho: string }).caminho,
    );
    expect(new Set(caminhos)).toEqual(new Set(['reta', 'pendulo', 'radial', 'subida']));
  });

  it('nao repete id', () => {
    expect(new Set(PEIXES.map((p) => p.id)).size).toBe(PEIXES.length);
  });

  it('tem faixa de tamanho valida em todos', () => {
    for (const p of PEIXES) {
      expect(p.tamanhoMax).toBeGreaterThan(p.tamanhoMin);
      expect(p.tamanhoMin).toBeGreaterThan(0);
    }
  });
});

describe('tamanhoDe', () => {
  const peixe = PEIXES[0];

  it('qualidade 0 devolve o minimo', () => {
    expect(tamanhoDe(peixe, 0)).toBe(peixe.tamanhoMin);
  });

  it('qualidade 1 devolve o maximo', () => {
    expect(tamanhoDe(peixe, 1)).toBe(peixe.tamanhoMax);
  });

  it('interpola no meio e arredonda para inteiro', () => {
    const meio = tamanhoDe(peixe, 0.5);
    expect(meio).toBe(Math.round((peixe.tamanhoMin + peixe.tamanhoMax) / 2));
    expect(Number.isInteger(meio)).toBe(true);
  });

  it('prende qualidade fora de 0..1', () => {
    expect(tamanhoDe(peixe, -5)).toBe(peixe.tamanhoMin);
    expect(tamanhoDe(peixe, 9)).toBe(peixe.tamanhoMax);
  });
});
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/islands/pesca/peixes.test.ts`
Expected: FAIL — `Cannot find module './peixes'`

- [ ] **Step 3: Escreva os tipos**

Crie `src/islands/pesca/tipos.ts`:

```ts
/** Todo motor devolve o mesmo par. A camada de mundo nunca sabe qual rodou. */
export type Resultado = { pego: boolean; qualidade: number };

export type Caminho = 'reta' | 'pendulo' | 'radial' | 'subida';

/** Zona alvo sobre o caminho. `pos` e `tamanho` em fracao de 0..1 do caminho. */
export type Zona = { pos: number; tamanho: number };

export type ParamsTrajeto = {
  caminho: Caminho;
  periodoMs: number;
  zonas: Zona[];
  acertos: number;
  /** Acertou uma zona, ela esvazia e a proxima vira a ativa. */
  alternancia: boolean;
  /** null = nunca perde; o erro custa qualidade. */
  tolerancia: number | null;
};

export type PadraoPeixe = 'calmo' | 'erratico' | 'arisco';

export type ParamsSustentacao = {
  /** Altura da faixa do jogador, fracao de 0..1 da barra. */
  alturaFaixa: number;
  /** Aceleracao por ms^2, em fracao de barra. */
  gravidade: number;
  impulso: number;
  padrao: PadraoPeixe;
  /** Fracao de barra por ms que o peixe percorre. */
  velocidadePeixe: number;
  /** Progresso ganho por ms dentro da faixa. */
  encher: number;
  /** Progresso perdido por ms fora da faixa. */
  drenar: number;
};

/** Portao no anel: em `pos` (0..1 da volta), so estas pistas estao abertas. */
export type Portao = { pos: number; abertas: number[] };

export type ParamsDragagem = {
  pistas: number;
  periodoMs: number;
  portoes: Portao[];
  voltasParaFisgar: number;
  batidasToleradas: number;
};

type Base = {
  id: string;
  /** Retangulo colorido de placeholder. Token CSS, nunca hex literal. */
  cor: string;
  tamanhoMin: number;
  tamanhoMax: number;
};

export type Peixe = Base &
  (
    | { motor: 'trajeto'; params: ParamsTrajeto }
    | { motor: 'sustentacao'; params: ParamsSustentacao }
    | { motor: 'dragagem'; params: ParamsDragagem }
  );
```

- [ ] **Step 4: Escreva a tabela de peixes**

Crie `src/islands/pesca/peixes.ts`:

```ts
import type { Peixe } from './tipos';

/**
 * Nove peixes de placeholder. Os nomes vem do i18n por `jogo.peixes.<id>`.
 * A tabela existe para exercitar todo o espaco de parametros, nao para ser
 * conteudo final.
 */
export const PEIXES: Peixe[] = [
  {
    id: 'p1', cor: 'var(--pesca-peixe-a)', tamanhoMin: 12, tamanhoMax: 34,
    motor: 'trajeto',
    params: { caminho: 'reta', periodoMs: 2400, zonas: [{ pos: 0.5, tamanho: 0.26 }], acertos: 1, alternancia: false, tolerancia: null },
  },
  {
    id: 'p2', cor: 'var(--pesca-peixe-b)', tamanhoMin: 18, tamanhoMax: 46,
    motor: 'trajeto',
    params: { caminho: 'pendulo', periodoMs: 2000, zonas: [{ pos: 0.62, tamanho: 0.18 }], acertos: 2, alternancia: false, tolerancia: null },
  },
  {
    id: 'p3', cor: 'var(--pesca-peixe-c)', tamanhoMin: 22, tamanhoMax: 58,
    motor: 'trajeto',
    params: { caminho: 'pendulo', periodoMs: 1700, zonas: [{ pos: 0.2, tamanho: 0.14 }, { pos: 0.8, tamanho: 0.14 }], acertos: 3, alternancia: true, tolerancia: null },
  },
  {
    id: 'p4', cor: 'var(--pesca-peixe-d)', tamanhoMin: 15, tamanhoMax: 40,
    motor: 'trajeto',
    params: { caminho: 'radial', periodoMs: 1900, zonas: [{ pos: 0.35, tamanho: 0.16 }], acertos: 2, alternancia: false, tolerancia: null },
  },
  {
    id: 'p5', cor: 'var(--pesca-peixe-e)', tamanhoMin: 10, tamanhoMax: 28,
    motor: 'trajeto',
    params: { caminho: 'subida', periodoMs: 1500, zonas: [{ pos: 0.85, tamanho: 0.2 }], acertos: 3, alternancia: false, tolerancia: null },
  },
  {
    id: 'p6', cor: 'var(--pesca-peixe-f)', tamanhoMin: 30, tamanhoMax: 72,
    motor: 'sustentacao',
    params: { alturaFaixa: 0.22, gravidade: 0.0000035, impulso: 0.000009, padrao: 'calmo', velocidadePeixe: 0.00028, encher: 0.00055, drenar: 0.0004 },
  },
  {
    id: 'p7', cor: 'var(--pesca-peixe-g)', tamanhoMin: 26, tamanhoMax: 65,
    motor: 'sustentacao',
    params: { alturaFaixa: 0.16, gravidade: 0.0000045, impulso: 0.000011, padrao: 'arisco', velocidadePeixe: 0.00065, encher: 0.0005, drenar: 0.00055 },
  },
  {
    id: 'p8', cor: 'var(--pesca-peixe-h)', tamanhoMin: 40, tamanhoMax: 95,
    motor: 'dragagem',
    params: {
      pistas: 2, periodoMs: 3200, voltasParaFisgar: 2, batidasToleradas: 2,
      portoes: [
        { pos: 0.15, abertas: [0] }, { pos: 0.4, abertas: [1] },
        { pos: 0.65, abertas: [0] }, { pos: 0.9, abertas: [1] },
      ],
    },
  },
  {
    id: 'p9', cor: 'var(--pesca-peixe-i)', tamanhoMin: 55, tamanhoMax: 130,
    motor: 'dragagem',
    params: {
      pistas: 3, periodoMs: 2600, voltasParaFisgar: 2, batidasToleradas: 0,
      portoes: [
        { pos: 0.12, abertas: [1] }, { pos: 0.3, abertas: [0, 2] },
        { pos: 0.5, abertas: [2] }, { pos: 0.7, abertas: [0] },
        { pos: 0.88, abertas: [1, 2] },
      ],
    },
  },
];

/** Qualidade 0..1 vira tamanho dentro da faixa da especie. */
export function tamanhoDe(peixe: Peixe, qualidade: number): number {
  const q = Math.min(1, Math.max(0, qualidade));
  return Math.round(peixe.tamanhoMin + (peixe.tamanhoMax - peixe.tamanhoMin) * q);
}
```

- [ ] **Step 5: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/islands/pesca/peixes.test.ts`
Expected: PASS — 9 testes

- [ ] **Step 6: Commit**

```bash
git add src/islands/pesca/tipos.ts src/islands/pesca/peixes.ts src/islands/pesca/peixes.test.ts
git commit -m "feat(pesca): tipos e tabela de nove peixes de placeholder"
```

---

### Task 2: TRAJETO — lógica pura

**Files:**
- Create: `src/islands/pesca/motores/trajeto.ts`
- Test: `src/islands/pesca/motores/trajeto.test.ts`

**Interfaces:**
- Consumes: `ParamsTrajeto`, `Resultado` de `../tipos`.
- Produces: `posicaoEm(params, tMs): number`, `distanciaAteZona(caminho, pos, zona): number`, `EstadoTrajeto`, `iniciarTrajeto(params): EstadoTrajeto`, `apertarTrajeto(params, estado, tMs): EstadoTrajeto`, `voltaCompletaTrajeto(params, estado, tMs): EstadoTrajeto`.

- [ ] **Step 1: Escreva o teste que falha**

Crie `src/islands/pesca/motores/trajeto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { ParamsTrajeto } from '../tipos';
import {
  posicaoEm,
  distanciaAteZona,
  iniciarTrajeto,
  apertarTrajeto,
} from './trajeto';

const base: ParamsTrajeto = {
  caminho: 'reta',
  periodoMs: 1000,
  zonas: [{ pos: 0.5, tamanho: 0.2 }],
  acertos: 1,
  alternancia: false,
  tolerancia: null,
};

describe('posicaoEm', () => {
  it('reta anda de 0 a 1 e reinicia', () => {
    expect(posicaoEm(base, 0)).toBeCloseTo(0);
    expect(posicaoEm(base, 500)).toBeCloseTo(0.5);
    expect(posicaoEm(base, 1000)).toBeCloseTo(0);
  });

  it('pendulo vai e volta dentro de um periodo', () => {
    const p = { ...base, caminho: 'pendulo' as const };
    expect(posicaoEm(p, 0)).toBeCloseTo(0);
    expect(posicaoEm(p, 250)).toBeCloseTo(0.5);
    expect(posicaoEm(p, 500)).toBeCloseTo(1);
    expect(posicaoEm(p, 750)).toBeCloseTo(0.5);
  });

  it('radial e subida andam como a reta', () => {
    for (const caminho of ['radial', 'subida'] as const) {
      expect(posicaoEm({ ...base, caminho }, 250)).toBeCloseTo(0.25);
    }
  });
});

describe('distanciaAteZona', () => {
  it('mede distancia direta nos caminhos abertos', () => {
    expect(distanciaAteZona('reta', 0.5, { pos: 0.5, tamanho: 0.2 })).toBeCloseTo(0);
    expect(distanciaAteZona('reta', 0.1, { pos: 0.9, tamanho: 0.2 })).toBeCloseTo(0.8);
  });

  it('no radial a volta fecha, entao 0.1 e 0.9 estao perto', () => {
    expect(distanciaAteZona('radial', 0.1, { pos: 0.9, tamanho: 0.2 })).toBeCloseTo(0.2);
  });
});

describe('apertarTrajeto', () => {
  it('acerto no centro da zona fisga com qualidade cheia', () => {
    const e = apertarTrajeto(base, iniciarTrajeto(base), 500);
    expect(e.terminado).toEqual({ pego: true, qualidade: 1 });
  });

  it('acerto na borda da zona fisga com qualidade baixa', () => {
    // zona 0.5 +- 0.1; posicao 0.59 fica quase na borda
    const e = apertarTrajeto(base, iniciarTrajeto(base), 590);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeLessThan(0.2);
  });

  it('erro com tolerancia null nao termina e nao perde', () => {
    const e = apertarTrajeto(base, iniciarTrajeto(base), 0);
    expect(e.terminado).toBeNull();
    expect(e.erros).toBe(1);
  });

  it('exige tantos acertos quantos params.acertos pedir', () => {
    const p = { ...base, acertos: 2 };
    let e = iniciarTrajeto(p);
    e = apertarTrajeto(p, e, 500);
    expect(e.terminado).toBeNull();
    expect(e.acertos).toBe(1);
    e = apertarTrajeto(p, e, 1500);
    expect(e.terminado?.pego).toBe(true);
  });

  it('alternancia troca a zona ativa a cada acerto', () => {
    const p: ParamsTrajeto = {
      ...base,
      zonas: [{ pos: 0.2, tamanho: 0.2 }, { pos: 0.8, tamanho: 0.2 }],
      acertos: 2,
      alternancia: true,
    };
    let e = iniciarTrajeto(p);
    expect(e.zonaAtiva).toBe(0);
    e = apertarTrajeto(p, e, 200);
    expect(e.zonaAtiva).toBe(1);
    e = apertarTrajeto(p, e, 1800);
    expect(e.terminado?.pego).toBe(true);
  });

  it('erro alem da tolerancia perde o peixe', () => {
    const p = { ...base, tolerancia: 1 };
    let e = iniciarTrajeto(p);
    e = apertarTrajeto(p, e, 0);
    expect(e.terminado).toBeNull();
    e = apertarTrajeto(p, e, 1000);
    expect(e.terminado).toEqual({ pego: false, qualidade: 0 });
  });

  it('erro custa qualidade quando nao ha perda', () => {
    let e = iniciarTrajeto(base);
    e = apertarTrajeto(base, e, 0);
    e = apertarTrajeto(base, e, 1000);
    e = apertarTrajeto(base, e, 1500);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeLessThan(1);
  });

  it('nao aceita aperto depois de terminado', () => {
    const e1 = apertarTrajeto(base, iniciarTrajeto(base), 500);
    const e2 = apertarTrajeto(base, e1, 500);
    expect(e2).toBe(e1);
  });
});
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/islands/pesca/motores/trajeto.test.ts`
Expected: FAIL — `Cannot find module './trajeto'`

- [ ] **Step 3: Escreva a implementação mínima**

Crie `src/islands/pesca/motores/trajeto.ts`:

```ts
import type { Caminho, ParamsTrajeto, Resultado, Zona } from '../tipos';

export type EstadoTrajeto = {
  acertos: number;
  erros: number;
  zonaAtiva: number;
  precisoes: number[];
  terminado: Resultado | null;
};

/** Posicao do indicador no caminho, em 0..1, no instante tMs. */
export function posicaoEm(params: ParamsTrajeto, tMs: number): number {
  const fase = (tMs % params.periodoMs) / params.periodoMs;
  if (params.caminho === 'pendulo') {
    return fase < 0.5 ? fase * 2 : 2 - fase * 2;
  }
  return fase;
}

/** No radial a volta fecha, entao 0.05 e 0.95 distam 0.1 e nao 0.9. */
export function distanciaAteZona(caminho: Caminho, pos: number, zona: Zona): number {
  const d = Math.abs(pos - zona.pos);
  return caminho === 'radial' ? Math.min(d, 1 - d) : d;
}

export function iniciarTrajeto(_params: ParamsTrajeto): EstadoTrajeto {
  return { acertos: 0, erros: 0, zonaAtiva: 0, precisoes: [], terminado: null };
}

export function apertarTrajeto(
  params: ParamsTrajeto,
  estado: EstadoTrajeto,
  tMs: number,
): EstadoTrajeto {
  if (estado.terminado) return estado;

  const zona = params.zonas[estado.zonaAtiva];
  const meia = zona.tamanho / 2;
  const dist = distanciaAteZona(params.caminho, posicaoEm(params, tMs), zona);

  if (dist > meia) {
    const erros = estado.erros + 1;
    const perdeu = params.tolerancia !== null && erros > params.tolerancia;
    return {
      ...estado,
      erros,
      terminado: perdeu ? { pego: false, qualidade: 0 } : null,
    };
  }

  const precisao = 1 - dist / meia;
  const acertos = estado.acertos + 1;
  const precisoes = [...estado.precisoes, precisao];
  const zonaAtiva = params.alternancia
    ? (estado.zonaAtiva + 1) % params.zonas.length
    : estado.zonaAtiva;

  if (acertos < params.acertos) {
    return { ...estado, acertos, precisoes, zonaAtiva, terminado: null };
  }

  const media = precisoes.reduce((s, p) => s + p, 0) / precisoes.length;
  // Cada erro custa 15% da qualidade. Nao perde o peixe, perde tamanho.
  const qualidade = Math.max(0, Math.min(1, media - estado.erros * 0.15));
  return { ...estado, acertos, precisoes, zonaAtiva, terminado: { pego: true, qualidade } };
}

/**
 * O indicador completou uma volta sem aperto. No v1 isso nao penaliza: existe
 * para a casca poder reagir (piscar a zona, por exemplo) sem inventar regra.
 */
export function voltaCompletaTrajeto(
  _params: ParamsTrajeto,
  estado: EstadoTrajeto,
  _tMs: number,
): EstadoTrajeto {
  return estado;
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/islands/pesca/motores/trajeto.test.ts`
Expected: PASS — 12 testes

- [ ] **Step 5: Commit**

```bash
git add src/islands/pesca/motores/trajeto.ts src/islands/pesca/motores/trajeto.test.ts
git commit -m "feat(pesca): logica pura do motor TRAJETO"
```

---

### Task 3: SUSTENTAÇÃO — lógica pura

**Files:**
- Create: `src/islands/pesca/motores/sustentacao.ts`
- Test: `src/islands/pesca/motores/sustentacao.test.ts`

**Interfaces:**
- Consumes: `ParamsSustentacao`, `Resultado` de `../tipos`.
- Produces: `EstadoSustentacao`, `iniciarSustentacao(params): EstadoSustentacao`, `avancarSustentacao(params, estado, dtMs, segurando, rnd): EstadoSustentacao`.

A aleatoriedade do movimento do peixe entra por parâmetro `rnd: () => number`, o que torna a função determinística no teste.

- [ ] **Step 1: Escreva o teste que falha**

Crie `src/islands/pesca/motores/sustentacao.test.ts`:

```ts
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

  it('qualidade reflete a fracao do tempo com o peixe dentro da faixa', () => {
    // Um passo com o peixe FORA, depois um passo dentro que fisga.
    let e = { ...iniciarSustentacao(base), faixaPos: 0.1, peixePos: 0.9, progresso: 0.9 };
    e = avancarSustentacao(base, e, 20, false, rnd);
    expect(e.terminado).toBeNull();
    expect(e.msDentro).toBe(0);
    expect(e.msTotal).toBe(20);

    e = { ...e, faixaPos: 0.5, peixePos: 0.5, progresso: 0.995 };
    e = avancarSustentacao(base, e, 20, false, rnd);
    expect(e.terminado?.pego).toBe(true);
    // metade do tempo dentro -> metade da qualidade
    expect(e.terminado!.qualidade).toBeCloseTo(0.5);
  });

  it('segurar o peixe dentro o tempo todo da qualidade cheia', () => {
    let e = { ...iniciarSustentacao(base), faixaPos: 0.5, peixePos: 0.5, progresso: 0.995 };
    e = avancarSustentacao(base, e, 20, false, rnd);
    expect(e.terminado?.pego).toBe(true);
    expect(e.terminado!.qualidade).toBeCloseTo(1);
  });

  it('o peixe mira um alvo novo quando a espera acaba', () => {
    let e = iniciarSustentacao(base);
    expect(e.peixeAlvo).toBeCloseTo(0.5);
    e = avancarSustentacao(base, e, 1500, false, () => 0.9);
    expect(e.peixeAlvo).toBeCloseTo(0.9);
  });

  it('nao avanca depois de terminado', () => {
    const inicial = { ...iniciarSustentacao(base), progresso: 0.01, faixaPos: 0.1, peixePos: 0.9 };
    const fim = avancarSustentacao(base, inicial, 200, false, rnd);
    expect(avancarSustentacao(base, fim, 200, false, rnd)).toBe(fim);
  });
});
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/islands/pesca/motores/sustentacao.test.ts`
Expected: FAIL — `Cannot find module './sustentacao'`

- [ ] **Step 3: Escreva a implementação mínima**

Crie `src/islands/pesca/motores/sustentacao.ts`:

```ts
import type { ParamsSustentacao, Resultado } from '../tipos';

export type EstadoSustentacao = {
  /** Centro da faixa do jogador, 0..1. */
  faixaPos: number;
  faixaVel: number;
  peixePos: number;
  peixeAlvo: number;
  /** Tempo restante ate o peixe sortear novo alvo, em ms. */
  peixeEspera: number;
  progresso: number;
  /** Milissegundos com o peixe DENTRO da faixa, e o total da luta. A razao
      entre os dois e a pericia: quem segurou o peixe dentro o tempo todo
      pesca grande. Isto existe porque progresso sozinho nao serve — ele e
      travado em [0,1] antes do teste de captura, entao na hora de fisgar ele
      vale exatamente 1 sempre, e a qualidade seria constante. */
  msDentro: number;
  msTotal: number;
  terminado: Resultado | null;
};

const ESPERA_POR_PADRAO = { calmo: 1400, erratico: 700, arisco: 320 } as const;

export function iniciarSustentacao(params: ParamsSustentacao): EstadoSustentacao {
  return {
    faixaPos: 0.5,
    faixaVel: 0,
    peixePos: 0.5,
    peixeAlvo: 0.5,
    peixeEspera: ESPERA_POR_PADRAO[params.padrao],
    progresso: 0.5,
    msDentro: 0,
    msTotal: 0,
    terminado: null,
  };
}

const prender = (v: number) => Math.min(1, Math.max(0, v));

export function avancarSustentacao(
  params: ParamsSustentacao,
  estado: EstadoSustentacao,
  dtMs: number,
  segurando: boolean,
  rnd: () => number,
): EstadoSustentacao {
  if (estado.terminado) return estado;

  // Faixa: controle direto do jogador.
  const acel = segurando ? params.impulso : -params.gravidade;
  let faixaVel = estado.faixaVel + acel * dtMs;
  let faixaPos = estado.faixaPos + faixaVel * dtMs;
  if (faixaPos <= 0 || faixaPos >= 1) faixaVel = 0;
  faixaPos = prender(faixaPos);

  // Peixe: mira um alvo, sorteia outro quando a espera acaba.
  let { peixeAlvo, peixeEspera } = estado;
  peixeEspera -= dtMs;
  if (peixeEspera <= 0) {
    peixeAlvo = rnd();
    peixeEspera = ESPERA_POR_PADRAO[params.padrao];
  }
  const passo = params.velocidadePeixe * dtMs;
  const delta = peixeAlvo - estado.peixePos;
  const peixePos = prender(
    Math.abs(delta) <= passo ? peixeAlvo : estado.peixePos + Math.sign(delta) * passo,
  );

  // Progresso.
  const meia = params.alturaFaixa / 2;
  const dentro = Math.abs(peixePos - faixaPos) <= meia;
  const progresso = prender(
    estado.progresso + (dentro ? params.encher : -params.drenar) * dtMs,
  );

  const msTotal = estado.msTotal + dtMs;
  const msDentro = estado.msDentro + (dentro ? dtMs : 0);

  let terminado: Resultado | null = null;
  if (progresso >= 1) {
    terminado = { pego: true, qualidade: msTotal > 0 ? msDentro / msTotal : 0 };
  } else if (progresso <= 0) {
    terminado = { pego: false, qualidade: 0 };
  }

  return {
    faixaPos, faixaVel, peixePos, peixeAlvo, peixeEspera,
    progresso, msDentro, msTotal, terminado,
  };
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/islands/pesca/motores/sustentacao.test.ts`
Expected: PASS — 12 testes

- [ ] **Step 5: Commit**

```bash
git add src/islands/pesca/motores/sustentacao.ts src/islands/pesca/motores/sustentacao.test.ts
git commit -m "feat(pesca): logica pura do motor SUSTENTACAO"
```

---

### Task 4: DRAGAGEM — lógica pura

**Files:**
- Create: `src/islands/pesca/motores/dragagem.ts`
- Test: `src/islands/pesca/motores/dragagem.test.ts`

**Interfaces:**
- Consumes: `ParamsDragagem`, `Resultado` de `../tipos`.
- Produces: `EstadoDragagem`, `iniciarDragagem(params): EstadoDragagem`, `trocarPistaDragagem(params, estado): EstadoDragagem`, `avancarDragagem(params, estado, tMs): EstadoDragagem`, `portoesCruzados(params, deMs, ateMs): Portao[]`.

O indicador dá voltas; ao cruzar um portão, se a pista atual não estiver aberta, é batida.

- [ ] **Step 1: Escreva o teste que falha**

Crie `src/islands/pesca/motores/dragagem.test.ts`:

```ts
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
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/islands/pesca/motores/dragagem.test.ts`
Expected: FAIL — `Cannot find module './dragagem'`

- [ ] **Step 3: Escreva a implementação mínima**

Crie `src/islands/pesca/motores/dragagem.ts`:

```ts
import type { ParamsDragagem, Portao, Resultado } from '../tipos';

export type EstadoDragagem = {
  pista: number;
  batidas: number;
  /** Ultimo instante ja processado, em ms desde o inicio do minigame. */
  tMs: number;
  terminado: Resultado | null;
};

export function iniciarDragagem(_params: ParamsDragagem): EstadoDragagem {
  return { pista: 0, batidas: 0, tMs: 0, terminado: null };
}

export function trocarPistaDragagem(
  params: ParamsDragagem,
  estado: EstadoDragagem,
): EstadoDragagem {
  if (estado.terminado) return estado;
  return { ...estado, pista: (estado.pista + 1) % params.pistas };
}

/**
 * Portoes cruzados no intervalo (deMs, ateMs]. O indicador da voltas, entao o
 * intervalo pode atravessar o fim de uma volta e cobrir mais de uma.
 */
export function portoesCruzados(
  params: ParamsDragagem,
  deMs: number,
  ateMs: number,
): Portao[] {
  const achados: Portao[] = [];
  const voltaDe = Math.floor(deMs / params.periodoMs);
  const voltaAte = Math.floor(ateMs / params.periodoMs);
  for (let volta = voltaDe; volta <= voltaAte; volta++) {
    for (const portao of params.portoes) {
      const instante = (volta + portao.pos) * params.periodoMs;
      if (instante > deMs && instante <= ateMs) achados.push(portao);
    }
  }
  return achados;
}

export function avancarDragagem(
  params: ParamsDragagem,
  estado: EstadoDragagem,
  tMs: number,
): EstadoDragagem {
  if (estado.terminado) return estado;

  let batidas = estado.batidas;
  for (const portao of portoesCruzados(params, estado.tMs, tMs)) {
    if (!portao.abertas.includes(estado.pista)) batidas++;
  }

  if (batidas > params.batidasToleradas) {
    return { ...estado, batidas, tMs, terminado: { pego: false, qualidade: 0 } };
  }

  const fimMs = params.voltasParaFisgar * params.periodoMs;
  if (tMs >= fimMs) {
    // Cada batida custa 30% da qualidade.
    const qualidade = Math.max(0, Math.min(1, 1 - batidas * 0.3));
    return { ...estado, batidas, tMs, terminado: { pego: true, qualidade } };
  }

  return { ...estado, batidas, tMs, terminado: null };
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/islands/pesca/motores/dragagem.test.ts`
Expected: PASS — 11 testes

- [ ] **Step 5: Commit**

```bash
git add src/islands/pesca/motores/dragagem.ts src/islands/pesca/motores/dragagem.test.ts
git commit -m "feat(pesca): logica pura do motor DRAGAGEM"
```

---

### Task 5: Caderno de espécimes

**Files:**
- Create: `src/islands/pesca/estado.ts`
- Test: `src/islands/pesca/estado.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `Caderno`, `CADERNO_VAZIO`, `registrarCaptura(caderno, peixeId, tamanho): Caderno`, `carregarCaderno(): Caderno`, `salvarCaderno(caderno): void`, `CHAVE_CADERNO`.

`registrarCaptura` é pura e é o que os testes cobrem. `carregar`/`salvar` são cascas finas sobre `localStorage`, protegidas por `try/catch` porque em janela privada o acessor lança.

- [ ] **Step 1: Escreva o teste que falha**

Crie `src/islands/pesca/estado.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CADERNO_VAZIO, registrarCaptura } from './estado';

describe('registrarCaptura', () => {
  it('registra um peixe novo', () => {
    const c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    expect(c.p1).toEqual({ vezes: 1, maior: 30 });
  });

  it('guarda o maior quando pesca um maior', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    c = registrarCaptura(c, 'p1', 45);
    expect(c.p1).toEqual({ vezes: 2, maior: 45 });
  });

  it('mantem o recorde quando pesca um menor', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 45);
    c = registrarCaptura(c, 'p1', 12);
    expect(c.p1).toEqual({ vezes: 2, maior: 45 });
  });

  it('nao muda o caderno recebido', () => {
    const antes = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    const copia = JSON.parse(JSON.stringify(antes));
    registrarCaptura(antes, 'p1', 99);
    expect(antes).toEqual(copia);
  });

  it('mantem separados peixes diferentes', () => {
    let c = registrarCaptura(CADERNO_VAZIO, 'p1', 30);
    c = registrarCaptura(c, 'p2', 50);
    expect(Object.keys(c).sort()).toEqual(['p1', 'p2']);
  });
});
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/islands/pesca/estado.test.ts`
Expected: FAIL — `Cannot find module './estado'`

- [ ] **Step 3: Escreva a implementação mínima**

Crie `src/islands/pesca/estado.ts`:

```ts
export type Registro = { vezes: number; maior: number };
export type Caderno = Record<string, Registro>;

export const CADERNO_VAZIO: Caderno = Object.freeze({});
export const CHAVE_CADERNO = 'pesca:caderno';

export function registrarCaptura(
  caderno: Caderno,
  peixeId: string,
  tamanho: number,
): Caderno {
  const antes = caderno[peixeId];
  return {
    ...caderno,
    [peixeId]: {
      vezes: (antes?.vezes ?? 0) + 1,
      maior: Math.max(antes?.maior ?? 0, tamanho),
    },
  };
}

/**
 * localStorage lanca em janela privada e em contextos sem armazenamento, e
 * pode voltar vazio. Ler e gravar sempre dentro de try/catch, e a pagina tem
 * que renderizar certo com caderno vazio.
 */
export function carregarCaderno(): Caderno {
  try {
    const bruto = localStorage.getItem(CHAVE_CADERNO);
    return bruto ? (JSON.parse(bruto) as Caderno) : CADERNO_VAZIO;
  } catch {
    return CADERNO_VAZIO;
  }
}

export function salvarCaderno(caderno: Caderno): void {
  try {
    localStorage.setItem(CHAVE_CADERNO, JSON.stringify(caderno));
  } catch {
    // Sem armazenamento o jogo segue jogavel, so nao lembra.
  }
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/islands/pesca/estado.test.ts`
Expected: PASS — 5 testes

- [ ] **Step 5: Commit**

```bash
git add src/islands/pesca/estado.ts src/islands/pesca/estado.test.ts
git commit -m "feat(pesca): caderno de especimes com persistencia tolerante a falha"
```

---

### Task 6: Rota trilíngue, strings e página vazia

**Files:**
- Create: `src/pages/jogo/pesca.astro`
- Create: `src/pages/en/game/fishing.astro`
- Create: `src/pages/es/juego/pesca.astro`
- Create: `src/styles/pesca.css`
- Modify: `src/i18n/pt-br.json`, `src/i18n/en.json`, `src/i18n/es.json` — adicionar a chave de topo `jogo`
- Test: `src/i18n/paridade.test.ts` (criar se não existir; se existir, apenas confirmar que passa)

**Interfaces:**
- Consumes: `BaseLayout` de `src/layouts/BaseLayout.astro` (props: `title`, `description`, `locale`, `canonical`, `alternates`).
- Produces: as três rotas e a folha `src/styles/pesca.css` com os tokens `--pesca-*`.

- [ ] **Step 1: Escreva o teste de paridade que falha**

Crie `src/i18n/paridade.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import ptBr from './pt-br.json';
import en from './en.json';
import es from './es.json';

function caminhos(obj: unknown, prefixo = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefixo];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    caminhos(v, prefixo ? `${prefixo}.${k}` : k),
  );
}

describe('paridade trilingue', () => {
  const base = caminhos(ptBr).sort();

  it('en tem exatamente as mesmas chaves de pt-br', () => {
    expect(caminhos(en).sort()).toEqual(base);
  });

  it('es tem exatamente as mesmas chaves de pt-br', () => {
    expect(caminhos(es).sort()).toEqual(base);
  });

  it('o jogo tem as chaves que a rota precisa', () => {
    for (const dic of [ptBr, en, es] as Record<string, any>[]) {
      expect(dic.jogo).toBeDefined();
      expect(typeof dic.jogo.titulo).toBe('string');
      expect(typeof dic.jogo.lancar).toBe('string');
      expect(Object.keys(dic.jogo.peixes)).toHaveLength(9);
    }
  });
});
```

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `pnpm vitest run src/i18n/paridade.test.ts`
Expected: FAIL — `expected undefined to be defined` na chave `jogo`

- [ ] **Step 3: Adicione as strings nos três idiomas**

Em `src/i18n/pt-br.json`, adicione a chave de topo `jogo` (no mesmo nível de `nav`, `hero` etc.):

```json
"jogo": {
  "titulo": "Pesca",
  "descricao": "Um jogo de pesca dentro do portfólio. Uma tela, três minigames, nove peixes.",
  "lancar": "Lançar a linha",
  "instrucao": {
    "trajeto": "Espaço quando o marcador cruzar a zona.",
    "sustentacao": "Segure espaço para subir. Mantenha o peixe dentro da faixa.",
    "dragagem": "Espaço troca de pista. Passe pelas brechas."
  },
  "fisgou": "Fisgou",
  "escapou": "Escapou",
  "caderno": "Caderno de espécimes",
  "cadernoVazio": "Nenhum peixe registrado ainda.",
  "vezes": "vezes",
  "maior": "maior",
  "modoGarantido": "Modo garantido",
  "modoGarantidoAjuda": "Mais lento, mas sempre pesca.",
  "peixes": {
    "p1": "Tainha", "p2": "Robalo", "p3": "Corvina",
    "p4": "Sardinha", "p5": "Anchova", "p6": "Bagre",
    "p7": "Cavala", "p8": "Arraia", "p9": "Sombra"
  }
}
```

Em `src/i18n/en.json`, mesma estrutura:

```json
"jogo": {
  "titulo": "Fishing",
  "descricao": "A fishing game inside the portfolio. One screen, three minigames, nine fish.",
  "lancar": "Cast the line",
  "instrucao": {
    "trajeto": "Space when the marker crosses the zone.",
    "sustentacao": "Hold space to rise. Keep the fish inside the band.",
    "dragagem": "Space switches lane. Get through the gaps."
  },
  "fisgou": "Hooked",
  "escapou": "Got away",
  "caderno": "Specimen log",
  "cadernoVazio": "No fish logged yet.",
  "vezes": "times",
  "maior": "largest",
  "modoGarantido": "Guaranteed mode",
  "modoGarantidoAjuda": "Slower, but always lands the fish.",
  "peixes": {
    "p1": "Mullet", "p2": "Sea bass", "p3": "Croaker",
    "p4": "Sardine", "p5": "Bluefish", "p6": "Catfish",
    "p7": "Mackerel", "p8": "Ray", "p9": "Shadow"
  }
}
```

Em `src/i18n/es.json`:

```json
"jogo": {
  "titulo": "Pesca",
  "descricao": "Un juego de pesca dentro del portfolio. Una pantalla, tres minijuegos, nueve peces.",
  "lancar": "Lanzar la línea",
  "instrucao": {
    "trajeto": "Espacio cuando el marcador cruce la zona.",
    "sustentacao": "Mantén espacio para subir. Conserva el pez dentro de la franja.",
    "dragagem": "Espacio cambia de carril. Pasa por los huecos."
  },
  "fisgou": "Picó",
  "escapou": "Se escapó",
  "caderno": "Cuaderno de especímenes",
  "cadernoVazio": "Aún no hay peces registrados.",
  "vezes": "veces",
  "maior": "mayor",
  "modoGarantido": "Modo garantizado",
  "modoGarantidoAjuda": "Más lento, pero siempre pesca.",
  "peixes": {
    "p1": "Lisa", "p2": "Róbalo", "p3": "Corvina",
    "p4": "Sardina", "p5": "Anchoa", "p6": "Bagre",
    "p7": "Caballa", "p8": "Raya", "p9": "Sombra"
  }
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `pnpm vitest run src/i18n/paridade.test.ts`
Expected: PASS — 3 testes

- [ ] **Step 5: Crie a folha de estilo com os tokens dos dois turnos**

Crie `src/styles/pesca.css`:

```css
/* Regra do Turno: todo par cor/uso declarado duas vezes, nunca herdado. */
.light {
  --pesca-fundo: var(--color-bg-secondary);
  --pesca-linha: var(--color-border-strong);
  --pesca-zona: var(--color-accent-secondary);
  --pesca-marcador: var(--color-accent);
  --pesca-perigo: var(--color-accent);
  --pesca-peixe-a: #4a7c59;
  --pesca-peixe-b: #2f5aa8;
  --pesca-peixe-c: #8f2d24;
  --pesca-peixe-d: #6f6757;
  --pesca-peixe-e: #a8763e;
  --pesca-peixe-f: #3d6b7d;
  --pesca-peixe-g: #7a4b8f;
  --pesca-peixe-h: #22242b;
  --pesca-peixe-i: #5e564a;
}

.dark {
  --pesca-fundo: var(--color-bg-secondary);
  --pesca-linha: var(--color-border-strong);
  --pesca-zona: var(--color-accent);
  --pesca-marcador: var(--color-accent-secondary);
  --pesca-perigo: var(--color-revolt);
  --pesca-peixe-a: #42f59b;
  --pesca-peixe-b: #61ffca;
  --pesca-peixe-c: #ff3e3e;
  --pesca-peixe-d: #54c59f;
  --pesca-peixe-e: #7dffb0;
  --pesca-peixe-f: #4fbf85;
  --pesca-peixe-g: #7cf5ad;
  --pesca-peixe-h: #2f8a5e;
  --pesca-peixe-i: #1f5a3d;
}

/* A area do jogo ocupa a tela sem transbordar: e isto que resolve a rolagem
   por espaco, e nao um preventDefault. */
.pesca-palco {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 64px e exatamente o pt-16 do <main> do BaseLayout. Com o rodape
     desligado, 64 + (100svh - 64) = 100svh cravado, e nao ha o que rolar. */
  min-height: calc(100svh - 64px);
  padding: 16px;
  overflow: hidden;
}

.pesca-mar {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.pesca-conteudo { position: relative; z-index: 1; }

.pesca-botao {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-height: 44px;
  padding: 12px 16px;
  color: var(--color-bg-primary);
  background: var(--color-accent);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pesca-botao:focus-visible {
  outline: 2px solid var(--color-accent-secondary);
  outline-offset: 2px;
}

/* Prompt do botao contextual: espaco so e obvio se a tela disser o que faz. */
.pesca-prompt {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  max-width: 60ch;
}
```

- [ ] **Step 6: Dê ao BaseLayout um modo sem rodapé**

Em `src/layouts/BaseLayout.astro`, acrescente a prop ao `interface Props` (linha ~22),
logo depois de `showScrollSpy`:

```ts
  /** Paginas de tela cheia (o jogo) desligam o rodape: com ele o documento
      passa de 100svh e a barra de espaco volta a rolar a pagina. */
  showFooter?: boolean;
```

No destructuring do frontmatter, some `showFooter = true` — o padrao preserva as 37
paginas existentes sem tocar em nenhuma delas.

E troque a linha 105 de:

```astro
    <Footer locale={locale} />
```

por:

```astro
    {showFooter && <Footer locale={locale} />}
```

- [ ] **Step 7: Crie as três rotas**

Crie `src/pages/jogo/pesca.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t } from '../../i18n/utils';
import '../../styles/pesca.css';

const locale = 'pt-br';
const alternates = {
  'pt-br': 'https://jbnado.dev/jogo/pesca',
  en: 'https://jbnado.dev/en/game/fishing',
  es: 'https://jbnado.dev/es/juego/pesca',
};
---

<BaseLayout
  locale={locale}
  title={t('jogo.titulo', locale)}
  description={t('jogo.descricao', locale)}
  canonical={alternates['pt-br']}
  alternates={alternates}
  showFooter={false}
>
  <div class="pesca-palco">
    <canvas class="pesca-mar" aria-hidden="true"></canvas>
    <div class="pesca-conteudo">
      <h1>{t('jogo.titulo', locale)}</h1>
    </div>
  </div>
</BaseLayout>
```

Crie `src/pages/en/game/fishing.astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';
import '../../../styles/pesca.css';

const locale = 'en';
const alternates = {
  'pt-br': 'https://jbnado.dev/jogo/pesca',
  en: 'https://jbnado.dev/en/game/fishing',
  es: 'https://jbnado.dev/es/juego/pesca',
};
---

<BaseLayout
  locale={locale}
  title={t('jogo.titulo', locale)}
  description={t('jogo.descricao', locale)}
  canonical={alternates.en}
  alternates={alternates}
  showFooter={false}
>
  <div class="pesca-palco">
    <canvas class="pesca-mar" aria-hidden="true"></canvas>
    <div class="pesca-conteudo">
      <h1>{t('jogo.titulo', locale)}</h1>
    </div>
  </div>
</BaseLayout>
```

Crie `src/pages/es/juego/pesca.astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';
import '../../../styles/pesca.css';

const locale = 'es';
const alternates = {
  'pt-br': 'https://jbnado.dev/jogo/pesca',
  en: 'https://jbnado.dev/en/game/fishing',
  es: 'https://jbnado.dev/es/juego/pesca',
};
---

<BaseLayout
  locale={locale}
  title={t('jogo.titulo', locale)}
  description={t('jogo.descricao', locale)}
  canonical={alternates.es}
  alternates={alternates}
  showFooter={false}
>
  <div class="pesca-palco">
    <canvas class="pesca-mar" aria-hidden="true"></canvas>
    <div class="pesca-conteudo">
      <h1>{t('jogo.titulo', locale)}</h1>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 8: Verifique que as três rotas constroem**

Run: `pnpm build`
Expected: `40 page(s) built` (eram 37, entram 3 rotas)

Confirme que os arquivos existem:

```bash
ls dist/jogo/pesca/index.html dist/en/game/fishing/index.html dist/es/juego/pesca/index.html
```

- [ ] **Step 9: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/jogo src/pages/en/game src/pages/es/juego src/styles/pesca.css src/i18n src/i18n/paridade.test.ts
git commit -m "feat(pesca): rota trilingue, tokens dos dois turnos e teste de paridade de i18n"
```

---

### Task 7: Ilha e primeiro motor jogável (TRAJETO)

**Files:**
- Create: `src/islands/pesca/Pesca.tsx`
- Create: `src/islands/pesca/motores/trajeto.tsx`
- Create: `src/islands/pesca/motores/trajeto.css`
- Modify: `src/pages/jogo/pesca.astro`, `src/pages/en/game/fishing.astro`, `src/pages/es/juego/pesca.astro` — montar a ilha

**Interfaces:**
- Consumes: `PEIXES`, `tamanhoDe`, `iniciarTrajeto`, `apertarTrajeto`, `posicaoEm`, `carregarCaderno`, `salvarCaderno`, `registrarCaptura`.
- Produces: componente `Pesca` com props `{ locale: string; textos: Record<string, any> }`, e `TrajetoView` com props `{ params: ParamsTrajeto; aoTerminar: (r: Resultado) => void }`.

Ao fim desta tarefa o jogo já é jogável com cinco dos nove peixes.

- [ ] **Step 1: Escreva a casca visual do TRAJETO**

Crie `src/islands/pesca/motores/trajeto.css`:

```css
.tj { display: flex; flex-direction: column; gap: 12px; }

.tj-pista {
  position: relative;
  height: 44px;
  background: var(--pesca-fundo);
  border: 2px solid var(--pesca-linha);
  border-radius: 4px;
  overflow: hidden;
}

/* Cor nao e o unico sinal: a zona tambem tem borda tracejada propria. */
.tj-zona {
  position: absolute;
  top: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--pesca-zona) 30%, transparent);
  border-left: 2px dashed var(--pesca-zona);
  border-right: 2px dashed var(--pesca-zona);
}

.tj-zona[data-ativa='false'] { opacity: 0.25; border-style: dotted; }

.tj-marcador {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--pesca-marcador);
}

.tj-anel { display: block; width: 100%; max-width: 240px; height: auto; margin: 0 auto; }
```

Crie `src/islands/pesca/motores/trajeto.tsx`:

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ParamsTrajeto, Resultado } from '../tipos';
import {
  iniciarTrajeto,
  apertarTrajeto,
  posicaoEm,
  type EstadoTrajeto,
} from './trajeto';
import './trajeto.css';

type Props = { params: ParamsTrajeto; aoTerminar: (r: Resultado) => void };

/** Movimento reduzido: o marcador anda em degraus em vez de deslizar. */
const DEGRAUS = 24;

export function TrajetoView({ params, aoTerminar }: Props) {
  const [pos, setPos] = useState(0);
  const estadoRef = useRef<EstadoTrajeto>(iniciarTrajeto(params));
  const [zonaAtiva, setZonaAtiva] = useState(0);
  const inicioRef = useRef(0);

  // O pai monta `aoTerminar` a cada render. Se ela entrar nas dependencias do
  // efeito, o efeito reinicia a cada render e o minigame se reinicia sozinho.
  // A ref mantem a chamada atual sem prender o efeito a ela.
  const fimRef = useRef(aoTerminar);
  fimRef.current = aoTerminar;

  useEffect(() => {
    // Preact reusa a instancia entre peixes do mesmo motor, entao o estado
    // TEM que reiniciar aqui. Sem isto o segundo peixe herda o do primeiro e
    // aparece ja fisgado.
    estadoRef.current = iniciarTrajeto(params);
    setZonaAtiva(0);

    const passos = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    inicioRef.current = performance.now();

    const laco = (agora: number) => {
      const t = agora - inicioRef.current;
      const p = posicaoEm(params, t);
      setPos(passos ? Math.round(p * DEGRAUS) / DEGRAUS : p);
      raf = requestAnimationFrame(laco);
    };
    raf = requestAnimationFrame(laco);

    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      const t = performance.now() - inicioRef.current;
      const proximo = apertarTrajeto(params, estadoRef.current, t);
      estadoRef.current = proximo;
      setZonaAtiva(proximo.zonaAtiva);
      if (proximo.terminado) fimRef.current(proximo.terminado);
    };
    window.addEventListener('keydown', aoTeclar);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', aoTeclar);
    };
  }, [params]);

  if (params.caminho === 'radial') {
    const ang = pos * 2 * Math.PI;
    return (
      <div class="tj">
        <svg class="tj-anel" viewBox="0 0 100 100" role="presentation">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--pesca-linha)" stroke-width="6" />
          {params.zonas.map((z, i) => (
            <circle
              key={i}
              cx="50" cy="50" r="40" fill="none"
              stroke="var(--pesca-zona)"
              stroke-width={i === zonaAtiva ? 8 : 4}
              stroke-dasharray={`${z.tamanho * 251} 251`}
              stroke-dashoffset={-((z.pos - z.tamanho / 2) * 251)}
              opacity={i === zonaAtiva ? 1 : 0.25}
              transform="rotate(-90 50 50)"
            />
          ))}
          <circle
            cx={50 + 40 * Math.cos(ang - Math.PI / 2)}
            cy={50 + 40 * Math.sin(ang - Math.PI / 2)}
            r="6" fill="var(--pesca-marcador)"
          />
        </svg>
      </div>
    );
  }

  const vertical = params.caminho === 'subida';
  return (
    <div class="tj">
      <div class="tj-pista">
        {params.zonas.map((z, i) => (
          <div
            key={i}
            class="tj-zona"
            data-ativa={String(i === zonaAtiva)}
            style={{ left: `${(z.pos - z.tamanho / 2) * 100}%`, width: `${z.tamanho * 100}%` }}
          />
        ))}
        <div
          class="tj-marcador"
          style={{ left: `${(vertical ? 1 - pos : pos) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Escreva a ilha**

Crie `src/islands/pesca/Pesca.tsx`:

```tsx
import { useCallback, useState } from 'preact/hooks';
import { PEIXES, tamanhoDe } from './peixes';
import type { Peixe, ParamsTrajeto, Resultado } from './tipos';
import { TrajetoView } from './motores/trajeto';
import {
  carregarCaderno,
  salvarCaderno,
  registrarCaptura,
  type Caderno,
} from './estado';

type Textos = {
  lancar: string;
  fisgou: string;
  escapou: string;
  caderno: string;
  cadernoVazio: string;
  vezes: string;
  maior: string;
  instrucao: Record<string, string>;
  peixes: Record<string, string>;
};

type Fase =
  | { tipo: 'parado' }
  | { tipo: 'pescando'; peixe: Peixe }
  | { tipo: 'resultado'; peixe: Peixe; resultado: Resultado; tamanho: number };

export default function Pesca({ textos }: { textos: Textos }) {
  const [fase, setFase] = useState<Fase>({ tipo: 'parado' });
  const [caderno, setCaderno] = useState<Caderno>(() => carregarCaderno());

  // No v1 so os cinco peixes de TRAJETO entram no sorteio. As tarefas 8 e 9
  // liberam os outros quatro ao adicionarem as cascas que faltam.
  const sortear = useCallback(() => {
    const posiveis = PEIXES.filter((p) => p.motor === 'trajeto');
    const peixe = posiveis[Math.floor(Math.random() * posiveis.length)];
    setFase({ tipo: 'pescando', peixe });
  }, []);

  const aoTerminar = useCallback(
    (peixe: Peixe) => (resultado: Resultado) => {
      const tamanho = tamanhoDe(peixe, resultado.qualidade);
      if (resultado.pego) {
        const novo = registrarCaptura(caderno, peixe.id, tamanho);
        setCaderno(novo);
        salvarCaderno(novo);
      }
      setFase({ tipo: 'resultado', peixe, resultado, tamanho });
    },
    [caderno],
  );

  return (
    <div>
      {fase.tipo === 'parado' && (
        <button class="pesca-botao" onClick={sortear}>{textos.lancar}</button>
      )}

      {fase.tipo === 'pescando' && (
        <>
          <p class="pesca-prompt">{textos.instrucao[fase.peixe.motor]}</p>
          <TrajetoView
            params={fase.peixe.params as ParamsTrajeto}
            aoTerminar={aoTerminar(fase.peixe)}
          />
        </>
      )}

      {fase.tipo === 'resultado' && (
        <>
          <p>
            {fase.resultado.pego
              ? `${textos.fisgou}: ${textos.peixes[fase.peixe.id]}, ${fase.tamanho} cm`
              : `${textos.escapou}: ${textos.peixes[fase.peixe.id]}`}
          </p>
          <button class="pesca-botao" onClick={sortear}>{textos.lancar}</button>
        </>
      )}

      <section>
        <h2>{textos.caderno}</h2>
        {Object.keys(caderno).length === 0 ? (
          <p>{textos.cadernoVazio}</p>
        ) : (
          <ul>
            {Object.entries(caderno).map(([id, r]) => (
              <li key={id}>
                {textos.peixes[id]} — {r.vezes} {textos.vezes}, {textos.maior} {r.maior} cm
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Monte a ilha nas três rotas**

Reescreva `src/pages/jogo/pesca.astro` **inteiro** — não cole um segundo bloco `---`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Pesca from '../../islands/pesca/Pesca';
import { t } from '../../i18n/utils';
import ptBr from '../../i18n/pt-br.json';
import '../../styles/pesca.css';

const locale = 'pt-br';
const alternates = {
  'pt-br': 'https://jbnado.dev/jogo/pesca',
  en: 'https://jbnado.dev/en/game/fishing',
  es: 'https://jbnado.dev/es/juego/pesca',
};
---

<BaseLayout
  locale={locale}
  title={t('jogo.titulo', locale)}
  description={t('jogo.descricao', locale)}
  canonical={alternates['pt-br']}
  alternates={alternates}
  showFooter={false}
>
  <div class="pesca-palco">
    <canvas class="pesca-mar" aria-hidden="true"></canvas>
    <div class="pesca-conteudo">
      <h1>{t('jogo.titulo', locale)}</h1>
      <Pesca client:load textos={ptBr.jogo} />
    </div>
  </div>
</BaseLayout>
```

Em `src/pages/en/game/fishing.astro`, faça a mesma reescrita com `../../../` nos
cinco imports, `import en from '../../../i18n/en.json';`, `const locale = 'en';`,
`canonical={alternates.en}` e `textos={en.jogo}`.

Em `src/pages/es/juego/pesca.astro`, idem com `../../../`,
`import es from '../../../i18n/es.json';`, `const locale = 'es';`,
`canonical={alternates.es}` e `textos={es.jogo}`.

- [ ] **Step 4: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Abra `http://localhost:4330/jogo/pesca` e confirme:
1. O botão aparece e recebe foco visível com Tab.
2. Espaço durante o minigame fisga ou erra, e **não rola a página**.
3. Cinco lances seguidos sorteiam caminhos diferentes.
4. O caderno enche e sobrevive a um F5.
5. Repita em `/en/game/fishing` e `/es/juego/pesca`.

- [ ] **Step 5: Confirme o orçamento de JS**

```bash
ls -la dist/_astro/*.js | awk '{s+=$5} END {print "total: "int(s/1024)"KB"}'
```

Expected: o total sobe de 33KB para no máximo 48KB. **Se passar disso, pare e reporte.**

- [ ] **Step 6: Commit**

```bash
git add src/islands/pesca src/pages
git commit -m "feat(pesca): ilha jogavel com o motor TRAJETO"
```

---

### Task 8: Casca visual do SUSTENTAÇÃO

**Files:**
- Create: `src/islands/fishing/views/HoldView.tsx`
- Create: `src/islands/fishing/views/HoldView.css`
- Modify: `src/islands/fishing/Fishing.tsx` — liberar os fish de sustentação no sorteio

**Interfaces:**
- Consumes: `startHold`, `stepHold`, `HoldParams`, `Result`.
- Produces: `HoldView` com props `{ params: HoldParams; onDone: (r: Result) => void }`.

- [ ] **Step 1: Escreva o CSS**

Crie `src/islands/fishing/views/HoldView.css`:

```css
.hold { display: flex; gap: 12px; align-items: stretch; height: 240px; }

.hold-bar {
  position: relative;
  width: 44px;
  background: var(--fishing-surface);
  border: 2px solid var(--fishing-rule);
  border-radius: 4px;
  overflow: hidden;
}

.hold-band {
  position: absolute;
  left: 0;
  right: 0;
  background: color-mix(in srgb, var(--fishing-zone) 30%, transparent);
  border-top: 2px dashed var(--fishing-zone);
  border-bottom: 2px dashed var(--fishing-zone);
}

.hold-fish {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 16px;
  border-radius: 2px;
}

.hold-meter {
  position: relative;
  width: 12px;
  background: var(--fishing-surface);
  border: 2px solid var(--fishing-rule);
  border-radius: 4px;
  overflow: hidden;
}

.hold-meter-fill {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  background: var(--fishing-zone);
}
```

- [ ] **Step 2: Escreva a casca visual**

Crie `src/islands/fishing/views/HoldView.tsx`:

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import type { HoldParams, Result } from '../types';
import {
  startHold,
  stepHold,
  type HoldState,
} from '../engines/hold';
import './HoldView.css';

type Props = {
  params: HoldParams;
  color: string;
  onDone: (r: Result) => void;
};

/** Movimento reduzido: o fish salta entre degraus. A FAIXA nao muda, porque
    ela e a mao do jogador e controle direto nao e animacao automatica. */
const STEPS = 12;

export function HoldView({ params, color, onDone }: Props) {
  const [est, setEst] = useState<HoldState>(() => startHold(params));
  const holdingRef = useRef(false);

  // Mesma razao do TRAJETO: `onDone` fora das dependencias, senao o efeito
  // reinicia a cada render e o minigame nunca termina.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let anterior = performance.now();
    let atual = startHold(params);

    const loop = (now: number) => {
      const dt = Math.min(50, now - anterior);
      anterior = now;
      atual = stepHold(params, atual, dt, holdingRef.current, Math.random);
      setEst(
        stepped
          ? { ...atual, fishPos: Math.round(atual.fishPos * STEPS) / STEPS }
          : atual,
      );
      if (atual.done) { onDoneRef.current(atual.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const baixo = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space') return;
      ev.preventDefault();
      holdingRef.current = true;
    };
    const cima = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space') return;
      ev.preventDefault();
      holdingRef.current = false;
    };
    window.addEventListener('keydown', baixo);
    window.addEventListener('keyup', cima);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', baixo);
      window.removeEventListener('keyup', cima);
    };
  }, [params]);

  const meia = params.bandHeight / 2;
  return (
    <div class="hold">
      <div class="hold-bar">
        <div
          class="hold-band"
          style={{
            bottom: `${(est.bandPos - meia) * 100}%`,
            height: `${params.bandHeight * 100}%`,
          }}
        />
        <div
          class="hold-fish"
          style={{ bottom: `calc(${est.fishPos * 100}% - 8px)`, background: color }}
        />
      </div>
      <div class="hold-meter">
        <div class="hold-meter-fill" style={{ height: `${est.progress * 100}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Libere os fish de sustentação na ilha**

Em `src/islands/fishing/Fishing.tsx`:

1. Adicione o import: `import { HoldView } from './views/HoldView';`
2. Adicione ao import de tipos: `HoldParams`
3. Troque o filtro do sorteio por:

```tsx
const pool = FISH.filter(
  (p) => p.engine === 'track' || p.engine === 'hold',
);
```

4. No bloco `phase.tipo === 'pescando'`, troque o `<TrackView …/>` por:

```tsx
{phase.fish.engine === 'track' && (
  <TrackView
    params={phase.fish.params as TrackParams}
    onDone={onDone(phase.fish)}
  />
)}
{phase.fish.engine === 'hold' && (
  <HoldView
    params={phase.fish.params as HoldParams}
    color={phase.fish.color}
    onDone={onDone(phase.fish)}
  />
)}
```

- [ ] **Step 4: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Em `http://localhost:4330/jogo/pesca`, lance até cair um fish de sustentação e confirme:
1. Segurar espaço sobe a faixa; soltar desce.
2. Fish dentro da faixa enche a barra; fora, drena.
3. Barra cheia fisga; barra zerada perde.
4. Com movimento reduzido ligado no SO, o fish salta e a faixa continua lisa.

- [ ] **Step 5: Commit**

```bash
git add src/islands/fishing
git commit -m "feat(pesca): casca visual do engine SUSTENTACAO"
```

---

### Task 9: Casca visual do DRAGAGEM

**Files:**
- Create: `src/islands/fishing/views/DodgeView.tsx`
- Create: `src/islands/fishing/views/DodgeView.css`
- Modify: `src/islands/fishing/Fishing.tsx` — liberar os nove fish

**Interfaces:**
- Consumes: `startDodge`, `switchLane`, `stepDodge`, `DodgeParams`, `Result`.
- Produces: `DodgeView` com props `{ params: DodgeParams; onDone: (r: Result) => void }`.

- [ ] **Step 1: Escreva o CSS**

Crie `src/islands/fishing/views/DodgeView.css`:

```css
.dodge { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.dodge-ring { display: block; width: 100%; max-width: 280px; height: auto; }
.dodge-bumps {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--fishing-danger);
}
```

- [ ] **Step 2: Escreva a casca visual**

Crie `src/islands/fishing/views/DodgeView.tsx`:

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import type { DodgeParams, Result } from '../types';
import {
  startDodge,
  switchLane,
  stepDodge,
  type DodgeState,
} from '../engines/dodge';
import './DodgeView.css';

type Props = { params: DodgeParams; onDone: (r: Result) => void };

const STEPS = 36;
const BASE_RADIUS = 20;
const RADIUS_STEP = 12;

export function DodgeView({ params, onDone }: Props) {
  const [est, setEst] = useState<DodgeState>(() => startDodge(params));
  const [angle, setAng] = useState(0);
  const stateRef = useRef(startDodge(params));

  // Mesma razao do TRAJETO e do SUSTENTACAO.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const stepped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const inicio = performance.now();
    stateRef.current = startDodge(params);

    const loop = (now: number) => {
      const t = now - inicio;
      const next = stepDodge(params, stateRef.current, t);
      stateRef.current = next;
      setEst(next);
      const p = (t % params.periodMs) / params.periodMs;
      setAng(stepped ? Math.round(p * STEPS) / STEPS : p);
      if (next.done) { onDoneRef.current(next.done); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || ev.repeat) return;
      ev.preventDefault();
      stateRef.current = switchLane(params, stateRef.current);
      setEst(stateRef.current);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [params]);

  const rad = angle * 2 * Math.PI - Math.PI / 2;
  const raio = BASE_RADIUS + est.lane * RADIUS_STEP;

  return (
    <div class="dodge">
      <svg class="dodge-ring" viewBox="0 0 100 100" role="presentation">
        {Array.from({ length: params.lanes }, (_, i) => (
          <circle
            key={i}
            cx="50" cy="50" r={BASE_RADIUS + i * RADIUS_STEP}
            fill="none" stroke="var(--fishing-rule)" stroke-width="2"
          />
        ))}
        {params.gates.map((portao, i) =>
          Array.from({ length: params.lanes }, (_, lane) => {
            const aberto = portao.abertas.includes(lane);
            const r = BASE_RADIUS + lane * RADIUS_STEP;
            const a = portao.pos * 2 * Math.PI - Math.PI / 2;
            return (
              <circle
                key={`${i}-${lane}`}
                cx={50 + r * Math.cos(a)}
                cy={50 + r * Math.sin(a)}
                r={aberto ? 2 : 4}
                fill={aberto ? 'none' : 'var(--fishing-danger)'}
                stroke={aberto ? 'var(--fishing-zone)' : 'none'}
                stroke-width="1.5"
              />
            );
          }),
        )}
        <circle
          cx={50 + raio * Math.cos(rad)}
          cy={50 + raio * Math.sin(rad)}
          r="4" fill="var(--fishing-marker)"
        />
      </svg>
      <p class="dodge-bumps">
        {est.bumps} / {params.bumpsAllowed + 1}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Libere os nove fish na ilha**

Em `src/islands/fishing/Fishing.tsx`:

1. Adicione: `import { DodgeView } from './views/DodgeView';`
2. Adicione ao import de tipos: `DodgeParams`
3. Troque o filtro do sorteio por: `const pool = FISH;`
4. Adicione o terceiro ramo ao bloco de pesca:

```tsx
{phase.fish.engine === 'dodge' && (
  <DodgeView
    params={phase.fish.params as DodgeParams}
    onDone={onDone(phase.fish)}
  />
)}
```

- [ ] **Step 4: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Confirme:
1. Espaço troca de lane e o marcador salta de anel.
2. Passar por um portão fechado incrementa o contador de bumps.
3. Batidas além da tolerância perdem o fish.
4. Completar as voltas fisga.
5. **Os nove fish aparecem** ao longo de uns 20 lances.

- [ ] **Step 5: Commit**

```bash
git add src/islands/fishing
git commit -m "feat(pesca): casca visual do engine DRAGAGEM e os nove fish no sorteio"
```

---

### Task 10: Costura do Canvas, inerte

**Files:**
- Create: `src/islands/fishing/sea.ts`
- Modify: `src/islands/fishing/Fishing.tsx` — chamar `mountSea`/`unmountSea`

**Interfaces:**
- Consumes: nada.
- Produces: `mountSea(canvas: HTMLCanvasElement): void`, `drawSea(): void`, `unmountSea(): void`.

**A camada existe e não roda.** Não crie `requestAnimationFrame` sem nada para desenhar: isso queima bateria e aparece em profiling como se o game fosse pesado.

- [ ] **Step 1: Escreva o módulo**

Crie `src/islands/fishing/sea.ts`:

```ts
/**
 * Camada de Canvas do mar.
 *
 * No v1 ela EXISTE e NAO RODA. A fronteira DOM/Canvas fica definida antes de
 * ser necessaria, e quando o mundo (barco, biomas, particulas) chegar, ele tem
 * onde morar sem reorganizar a ilha.
 *
 * Nao adicione um loop de animacao aqui enquanto nao houver o que desenhar.
 */

let ctx: CanvasRenderingContext2D | null = null;

export function mountSea(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx = canvas.getContext('2d');
  ctx?.scale(dpr, dpr);
}

/** Sem conteudo no v1. Chamada explicita, nunca em loop. */
export function drawSea(): void {
  if (!ctx) return;
}

export function unmountSea(): void {
  ctx = null;
}
```

- [ ] **Step 2: Ligue na ilha**

Em `src/islands/fishing/Fishing.tsx`:

1. **Não crie um segundo import de `preact/hooks`.** Acrescente `useEffect` ao import que já existe, deixando a linha assim:

```tsx
import { useCallback, useEffect, useState } from 'preact/hooks';
```

2. Adicione o import do módulo do mar junto dos outros:

```tsx
import { mountSea, unmountSea } from './sea';
```

3. Dentro do componente `Fishing`, logo depois dos `useState`, adicione:

```tsx
// O <canvas> pertence a pagina Astro, nao a ilha, entao a ilha o alcanca por
// seletor. Efeito de montagem unica: nao ha loop de animacao no v1.
useEffect(() => {
  const canvas = document.querySelector<HTMLCanvasElement>('.fishing-sea');
  if (canvas) mountSea(canvas);
  return () => unmountSea();
}, []);
```

- [ ] **Step 3: Verifique que nenhum laço roda**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Abra `http://localhost:4330/jogo/pesca`, deixe a página **parada no state inicial** e no DevTools rode o Performance por 5 segundos. Expected: nenhum frame de animação enquanto nenhum minigame está ativo.

- [ ] **Step 4: Commit**

```bash
git add src/islands/fishing/sea.ts src/islands/fishing/Fishing.tsx
git commit -m "feat(pesca): costura da camada de Canvas, inerte no v1"
```

---

### Task 11: Acessibilidade — anúncio, modo garantido e foco

**Files:**
- Modify: `src/islands/fishing/Fishing.tsx`
- Modify: `src/styles/fishing.css`
- Modify: `src/i18n/pt-br.json`, `en.json`, `es.json` — já contêm `guaranteedMode` desde a Task 6

**Interfaces:**
- Consumes: as três `*View` já existentes.
- Produces: nada updated exportado.

- [ ] **Step 1: Adicione a live region e o modo garantido**

Em `src/islands/fishing/Fishing.tsx`:

1. Some ao tipo `Texts`: `guaranteedMode: string; guaranteedModeHelp: string;`
2. Adicione o state: `const [garantido, setGarantido] = useState(false);`
3. Em `onDone`, force a captura quando o modo estiver ligado:

```tsx
const onDone = useCallback(
  (fish: Fish) => (bruto: Result) => {
    const result = garantido ? { caught: true, quality: bruto.quality } : bruto;
    const tamanho = sizeOf(fish, result.quality);
    if (result.caught) {
      const updated = recordCatch(log, fish.id, tamanho);
      setCaderno(updated);
      saveLog(updated);
    }
    setFase({ tipo: 'result', fish, result, tamanho });
  },
  [log, garantido],
);
```

4. Adicione a live region e o controle no JSX, logo abaixo do `<div>` externo:

```tsx
<p class="fishing-live" role="status" aria-live="polite">
  {phase.tipo === 'result'
    ? phase.result.caught
      ? `${texts.caught}: ${texts.fish[phase.fish.id]}, ${phase.tamanho} cm`
      : `${texts.escaped}: ${texts.fish[phase.fish.id]}`
    : ''}
</p>

<label class="fishing-option">
  <input
    type="checkbox"
    checked={garantido}
    onChange={(e) => setGarantido((e.target as HTMLInputElement).checked)}
  />
  <span>{texts.guaranteedMode}</span>
  <small>{texts.guaranteedModeHelp}</small>
</label>
```

- [ ] **Step 2: Adicione o CSS**

Acrescente ao fim de `src/styles/fishing.css`:

```css
/* Anuncio para leitor de tela. Visualmente escondido, nunca display:none,
   que remove do leitor tambem. */
.fishing-live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.fishing-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.fishing-option small { color: var(--color-text-secondary); }
.fishing-option input:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Confirme, nos três idiomas:
1. Só com Tab e espaço dá para play do começo ao fim.
2. Todo elemento focável mostra foco visível.
3. Com o modo garantido ligado, nenhum fish escapa.
4. Ligando movimento reduzido no SO, os três motores continuam jogáveis.
5. Com um leitor de tela, o result é anunciado.

- [ ] **Step 4: Rode a suíte inteira e o detector**

```bash
pnpm test
npx --yes impeccable@3.6.0 detect src/
npx --yes impeccable@3.6.0 detect http://localhost:4330/jogo/pesca --json
```

Expected: testes verdes; detector sem achados novos além dos adjudicados (`ai-color-palette`, `heading-rhythm`).

- [ ] **Step 5: Commit**

```bash
git add src/islands/fishing src/styles/fishing.css
git commit -m "feat(pesca): anuncio por live region, modo garantido e foco por teclado"
```

---

### Task 12: Descoberta — as palavras viram link

**Files:**
- Modify: `src/components/HeroSection.astro` — a palavra "jogos" da descrição
- Modify: `src/components/AboutSection.astro` — a palavra "games" do intro
- Modify: `src/i18n/pt-br.json`, `en.json`, `es.json` — fatiar as frases
- Modify: `src/styles/fishing.css`

**Interfaces:**
- Consumes: as rotas da Task 6.
- Produces: nada exportado.

A frase precisa ser fatiada no i18n, porque a palavra que vira link está no meio dela e não dá para injetar HTML numa string traduzida sem abrir buraco de XSS.

- [ ] **Step 1: Fatiar as frases nos três idiomas**

Em `src/i18n/pt-br.json`, dentro de `hero`, some as três chaves (mantendo `description` intacta para quem já a usa):

```json
"descricaoAntes": "Fullstack developer em Ribeirão Preto. Construo APIs, interfaces e às times ",
"descricaoLink": "jogos",
"descricaoDepois": "."
```

Em `en.json`, dentro de `hero`:

```json
"descricaoAntes": "Fullstack developer from Ribeirão Preto, Brazil. I build APIs, interfaces, and sometimes ",
"descricaoLink": "games",
"descricaoDepois": "."
```

Em `es.json`, dentro de `hero`:

```json
"descricaoAntes": "Fullstack developer en Ribeirão Preto, Brasil. Construyo APIs, interfaces y a veces ",
"descricaoLink": "juegos",
"descricaoDepois": "."
```

- [ ] **Step 2: Rode o teste de paridade**

Run: `pnpm vitest run src/i18n/paridade.test.ts`
Expected: PASS — as três chaves novas existem nos três dicionários

- [ ] **Step 3: Trocar a frase do hero por versão com link**

Em `src/components/HeroSection.astro`, adicione ao frontmatter:

```astro
const rotaJogo = locale === 'en' ? '/en/game/fishing'
  : locale === 'es' ? '/es/juego/pesca'
  : '/jogo/pesca';
```

E substitua o parágrafo da descrição por:

```astro
<p class="hero-description hero-stagger" style="--stagger: 3">
  {t('hero.descricaoAntes', locale)}<a class="fishing-bait" href={rotaJogo}>{t('hero.descricaoLink', locale)}</a>{t('hero.descricaoDepois', locale)}
</p>
```

- [ ] **Step 4: Fatiar também a frase do Sobre**

O Sobre renderiza `{t('about.intro', locale)}` como um parágrafo único em
`src/components/AboutSection.astro:35`. A frase "Tudo começou pelos games" fica no meio dele,
então o mesmo fatiamento se aplica.

Em `src/i18n/pt-br.json`, dentro de `about`, some:

```json
"introAntes": "Sou um developer fullstack com 5 anos de experiência construindo aplicações web que fazem a diferença. Já passei por empresas de marketing (Authorify, EUA), e-commerce B2B (Take) e fintech (Verzel). Tudo começou pelos ",
"introLink": "games",
"introDepois": ". Eu amava play e sempre quis entender como eram feitos, então fui parar em Análise e Desenvolvimento de Sistemas e me apaixonei pela programação e por esse mundo da tecnologia. Aquela curiosidade de desmontar as coisas pra ver como funcionam virou paixão por criar soluções completas, do backend ao pixel final."
```

Em `en.json`, dentro de `about`:

```json
"introAntes": "I'm a fullstack developer with 5 years of experience building web applications that make a difference. I've worked at marketing (Authorify, US), B2B e-commerce (Take), and fintech (Verzel) companies. It all started with ",
"introLink": "games",
"introDepois": ". I loved playing them and always wanted to understand how they were made, so I ended up studying Systems Analysis and Development and fell for programming and this whole world of technology. That curiosity to take things apart and see how they work turned into a passion for building complete solutions, from the backend to the final pixel."
```

Em `es.json`, dentro de `about`:

```json
"introAntes": "Soy un developer fullstack con 5 años de experiencia construyendo aplicaciones web que hacen la diferencia. He trabajado en empresas de marketing (Authorify, EE.UU.), e-commerce B2B (Take) y fintech (Verzel). Todo empezó por los ",
"introLink": "videojuegos",
"introDepois": ". Amaba jugarlos y siempre quise entender cómo estaban hechos, así que terminé estudiando Análisis y Desarrollo de Sistemas y me enamoré de la programación y de este mundo de la tecnología. Esa curiosidad de desarmar las cosas para ver cómo funcionan se volvió una pasión por crear soluciones completas, del backend al pixel final."
```

Em `src/components/AboutSection.astro`, adicione ao frontmatter:

```astro
const rotaJogo = locale === 'en' ? '/en/game/fishing'
  : locale === 'es' ? '/es/juego/pesca'
  : '/jogo/pesca';
```

E troque a linha 35 por:

```astro
<p class="about-description">{t('about.introAntes', locale)}<a class="fishing-bait" href={rotaJogo}>{t('about.introLink', locale)}</a>{t('about.introDepois', locale)}</p>
```

- [ ] **Step 5: Estilo do link**

O link vive na **home**, e a home não carrega `pesca.css` — aquela folha é importada só
pelas rotas do game. Portanto a regra vai para `src/styles/global.css`, não para `pesca.css`.

Acrescente ao fim de `src/styles/global.css`:

```css
/* A evidencia senta ao lado da alegacao: a palavra que afirma o game e o link
   para ele. Sublinhado ancorado no texto, nunca no rodape da caixa. */
.fishing-bait {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.fishing-bait:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 6: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Confirme, em `/`, `/en/` e `/es/`:
1. As **duas** palavras estão sublinhadas — a do hero e a do Sobre — e levam à rota do idioma.
2. Os dois links recebem foco visível com Tab.
3. As frases continuam legíveis e o sublinhado fica **no texto**, não abaixo da caixa.
4. A medida do parágrafo do Sobre não mudou (60ch continua valendo).

- [ ] **Step 7: Rode tudo e commite**

```bash
pnpm test && pnpm build
git add src/components/HeroSection.astro src/components/AboutSection.astro src/i18n src/styles
git commit -m "feat(pesca): as palavras que afirmam o game viram o link para ele"
```

---

---

### Task 13: LP do game, saída por Esc e sobreposição em tela cheia

**Files:**
- Modify: `src/islands/fishing/Fishing.tsx`
- Modify: `src/styles/fishing.css`
- Modify: `src/i18n/pt-br.json`, `en.json`, `es.json`
- Modify: `src/pages/jogo/pesca.astro`, `src/pages/en/game/fishing.astro`, `src/pages/es/juego/pesca.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: o componente `Fishing` e as três `*View` já existentes.
- Produces: nada updated exportado.

A rota deixa de ser "o game" e passa a ser a **página do game**: título, como se joga, o log e um botão Jogar. O game roda numa **sobreposição em tela cheia** por cima de tudo, e Esc ou o botão Sair voltam para a página.

Isso substitui o `showFooter` da Task 6. A sobreposição é `position: fixed; inset: 0`, do tamanho da viewport por construção, então não depende de aritmética de `calc()` nem de esconder o rodapé. A página volta a ter rodapé, que é o certo para quem chegou pelo link do hero e quer navegar para outro lugar.

- [ ] **Step 1: Novas strings nos três idiomas**

Em `src/i18n/pt-br.json`, dentro de `game`:

```json
"play": "Jogar",
"exit": "Sair",
"exitHelp": "Esc também sai",
"gameArea": "Área de game",
"howToPlay": "Espaço faz tudo: lança a linha e resolve o minigame de cada fish."
```

Em `en.json`, dentro de `game`:

```json
"play": "Play",
"exit": "Exit",
"exitHelp": "Esc exits too",
"gameArea": "Game area",
"howToPlay": "Space does everything: it casts the line and plays each fish's minigame."
```

Em `es.json`, dentro de `game`:

```json
"play": "Jugar",
"exit": "Salir",
"exitHelp": "Esc también sale",
"gameArea": "Área de juego",
"howToPlay": "Espacio hace todo: lanza la línea y resuelve el minijuego de cada pez."
```

- [ ] **Step 2: Rode o teste de paridade**

Run: `pnpm vitest run src/i18n/paridade.test.ts`
Expected: PASS — as cinco chaves novas existem nos três dicionários

- [ ] **Step 3: Desfaça o `showFooter`**

Ele deixou de ter uso: a sobreposição cobre o rodapé, e a página do game deve mostrá-lo.

Em `src/layouts/BaseLayout.astro`, remova a prop `showFooter` do `interface Props`, remova `showFooter = true` do destructuring, e volte a linha do rodapé para:

```astro
    <Footer locale={locale} />
```

Nas três rotas, remova a linha `showFooter={false}`.

Em `src/styles/fishing.css`, o `.fishing-stage` deixa de precisar travar altura. Troque `min-height: calc(100svh - 64px);` por `min-height: 0;` e apague o comentário sobre o `pt-16`, que deixou de valer.

- [ ] **Step 4: CSS da sobreposição**

Acrescente ao fim de `src/styles/fishing.css`:

```css
/* Sobreposicao em tela cheia: fixed + inset zera qualquer questao de altura,
   porque a caixa E a viewport. Nada de calc() competindo com navbar e rodape. */
.fishing-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-primary);
  overflow: hidden;
}

/* Enquanto a sobreposicao esta aberta o documento atras nao rola. Sem isto a
   barra de espaco volta a rolar a pagina de baixo. */
body.fishing-locked {
  overflow: hidden;
}

.fishing-overlay-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fishing-exit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  background: transparent;
  border: 2px solid var(--color-border-strong);
  border-radius: 4px;
  cursor: pointer;
}

.fishing-exit:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.fishing-exit:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.fishing-exit small {
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-text-secondary);
}

.fishing-arena {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 0;
}
```

- [ ] **Step 5: A ilha ganha o state de tela**

Em `src/islands/fishing/Fishing.tsx`:

1. Some ao tipo `Texts`: `play: string; exit: string; exitHelp: string; gameArea: string; howToPlay: string;`

2. Acrescente `useRef` ao import que já existe de `preact/hooks` — não crie um segundo import do mesmo módulo.

3. Adicione o state e as duas referências, junto dos outros `useState`:

```tsx
const [playing, setJogando] = useState(false);
const playBtnRef = useRef<HTMLButtonElement>(null);
const overlayRef = useRef<HTMLDivElement>(null);
```

4. Adicione o efeito que trava o corpo, escuta Esc e move o foco:

```tsx
// A sobreposicao e um dialogo modal: enquanto ela esta aberta o documento
// atras nao rola, Esc fecha, o foco entra nela e VOLTA para o botao Jogar ao
// exit — sem isso quem navega por teclado e largado no meio da pagina.
useEffect(() => {
  if (!playing) return;
  document.body.classList.add('fishing-locked');
  overlayRef.current?.focus();

  const onKey = (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    setJogando(false);
  };
  window.addEventListener('keydown', onKey);

  return () => {
    document.body.classList.remove('fishing-locked');
    window.removeEventListener('keydown', onKey);
    playBtnRef.current?.focus();
  };
}, [playing]);
```

5. Crie a função que entra no game, junto de `cast`:

```tsx
const enter = useCallback(() => {
  setJogando(true);
  setFase({ tipo: 'parado' });
}, []);
```

6. Reestruture o `return` para as duas telas. A página (LP) fica assim, e a sobreposição só existe quando `playing`:

```tsx
return (
  <div>
    <p class="fishing-live" role="status" aria-live="polite">
      {/* a live region existente continua exatamente como esta */}
    </p>

    <p class="fishing-prompt">{texts.howToPlay}</p>

    <button class="fishing-button" ref={playBtnRef} onClick={enter}>
      {texts.play}
    </button>

    <section>
      <h2>{texts.log}</h2>
      {Object.keys(log).length === 0 ? (
        <p>{texts.logEmpty}</p>
      ) : (
        <ul>
          {Object.entries(log).map(([id, r]) => (
            <li key={id}>
              {texts.fish[id]} — {r.times} {texts.times}, {texts.largest} {r.largest} cm
            </li>
          ))}
        </ul>
      )}
    </section>

    {playing && (
      <div
        class="fishing-overlay"
        ref={overlayRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={texts.gameArea}
      >
        <div class="fishing-overlay-bar">
          <button class="fishing-exit" onClick={() => setJogando(false)}>
            {texts.exit} <small>{texts.exitHelp}</small>
          </button>
        </div>

        <div class="fishing-arena">
          {/* aqui entram, sem alteracao nenhuma na logica: o bloco 'parado',
              o bloco 'pescando' com os tres ramos de engine, o bloco
              'result', e o controle de modo garantido */}
        </div>
      </div>
    )}
  </div>
);
```

**Preserve o que já existe.** A live region, o controle de modo garantido e os três ramos de engine continuam exatamente como estão — este passo move a árvore, não reescreve a lógica. Se algum bloco sumir do diff, é regressão.

- [ ] **Step 6: Verifique na mão**

```bash
pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Em `http://localhost:4330/jogo/pesca`, confirme:

1. A página mostra título, como se joga, o log, o botão Jogar **e o rodapé**.
2. Jogar abre a sobreposição cobrindo a tela inteira.
3. Com a sobreposição aberta, `document.body` tem a classe `fishing-locked` e a página de trás não rola. Meça: `document.documentElement.scrollHeight` contra `window.innerHeight`.
4. **Esc** volta para a página. O botão **Sair** também.
5. Ao exit, `document.activeElement` é o botão Jogar.
6. Esc no meio de um minigame abandona e volta, sem deixar laço de animação rodando — confirme no Performance do DevTools que não há frames após a saída.
7. Só com Tab e Espaço dá para chegar ao game, play e exit.
8. As outras páginas seguem com rodapé — confira `/` e `/blog/`.
9. Repita em `/en/game/fishing` e `/es/juego/pesca`.

- [ ] **Step 7: Rode tudo e commite**

```bash
pnpm test && pnpm build
git add src/islands/fishing src/styles/fishing.css src/i18n src/pages src/layouts/BaseLayout.astro
git commit -m "feat(pesca): pagina do game, sobreposicao em tela cheia e saida por Esc"
```

---

### Task 14: Ajustes depois do primeiro teste de jogo

**Files:**
- Modify: `src/islands/fishing/types.ts`
- Modify: `src/islands/fishing/engines/track.ts` + `track.test.ts`
- Modify: `src/islands/fishing/engines/hold.ts` + `hold.test.ts`
- Modify: `src/islands/fishing/fish.ts` + `fish.test.ts`
- Modify: `src/islands/fishing/views/TrackView.tsx`
- Modify: `src/islands/fishing/views/HoldView.tsx` + `HoldView.css`
- Modify: `src/islands/fishing/Fishing.tsx`

Tudo aqui saiu de o dono do projeto jogar a build. Cinco achados, quatro deles defeito do plano.

- [ ] **Step 1: Os dois caminhos que teleportam saem**

O caminho `reta` faz o marcador ir até a ponta e reaparecer instantaneamente na esquerda. Uma varredura linear que se repete só tem duas saídas — inverter ou teleportar — e inverter *é* o pêndulo. Não existe forma não-teleportante do `reta`.

E `subida` nunca subiu: era desenhado como `left: (1 - pos)`, uma varredura horizontal espelhada. Teleporta igual, e o nome descreve o que não acontece.

Em `types.ts`:

```ts
export type PathKind = 'pendulo' | 'radial';
```

Em `engines/track.ts`, `positionAt` fica com dois casos, ambos contínuos — o pêndulo inverte, o radial fecha a volta porque num círculo o fim *é* o começo:

```ts
export function positionAt(params: TrackParams, tMs: number): number {
  const phase = (tMs % params.periodMs) / params.periodMs;
  // Pendulo inverte no meio do periodo: 0 -> 1 -> 0, sem descontinuidade.
  if (params.path === 'pendulo') return phase < 0.5 ? phase * 2 : 2 - phase * 2;
  // Radial da a volta: 0.99 e 0.01 sao vizinhos no circulo, entao a fase pode
  // reiniciar sem que o olho veja um salto.
  return phase;
}
```

Em `views/TrackView.tsx`, apague a constante `vertical` e use `pos` direto no `left` do marcador.

Em `engines/track.test.ts`, o teste `'radial e subida andam como a reta'` perde sentido: troque por

```ts
  it('radial percorre a volta inteira e reinicia', () => {
    const p = { ...base, path: 'radial' as const };
    expect(positionAt(p, 250)).toBeCloseTo(0.25);
    expect(positionAt(p, 1000)).toBeCloseTo(0);
  });
```

e no `base` do arquivo troque `path: 'reta'` por `path: 'pendulo'`, ajustando as posições esperadas de `positionAt` conforme a fórmula do pêndulo (em `periodMs: 1000`: t=0 → 0, t=250 → 0.5, t=500 → 1, t=750 → 0.5).

- [ ] **Step 2: Rode os testes do TRACK**

Run: `pnpm vitest run src/islands/fishing/engines/track.test.ts`
Expected: PASS. Se algum caso falhar, recalcule a expectativa pela fórmula do pêndulo antes de mexer no motor.

- [ ] **Step 3: HOLD ganha teto de velocidade**

A física é aceleração pura, sem amortecimento e sem teto: segurando, a velocidade cresce sem limite. Medido — 336ms do meio ao topo, chegando a 3 barras por segundo. A única forma de manter controle é tocar de leve, que é o oposto de segurar. Diminuir os números só adia o descontrole; o que resolve é o teto.

Em `types.ts`, `HoldParams` ganha dois campos:

```ts
  /** Teto de velocidade da faixa, em fracao de barra por ms. Sem ele a
      aceleracao acumula sem limite e so da para tocar, nunca segurar. */
  maxSpeed: number;
  /** Carencia: quanto tempo a barra pode ficar zerada antes de o peixe ir
      embora. Zerar deixa de ser perda imediata e vira "esta escapando". */
  graceMs: number;
```

Em `engines/hold.ts`, `HoldState` ganha o contador:

```ts
  /** Milissegundos acumulados com a barra em zero. Volta a zero assim que o
      progresso sobe: recuperou, recuperou de verdade. */
  msAtZero: number;
```

`startHold` inicializa `msAtZero: 0`.

Em `stepHold`, prenda a velocidade logo depois de integrá-la:

```ts
  const accel = holding ? params.lift : -params.gravity;
  let bandVel = state.bandVel + accel * dtMs;
  bandVel = Math.min(params.maxSpeed, Math.max(-params.maxSpeed, bandVel));
  let bandPos = state.bandPos + bandVel * dtMs;
```

E troque o desfecho por:

```ts
  const msTotal = state.msTotal + dtMs;
  const msInside = state.msInside + (inside ? dtMs : 0);
  const msAtZero = progress <= 0 ? state.msAtZero + dtMs : 0;

  let done: Result | null = null;
  if (progress >= 1) {
    done = { caught: true, quality: msTotal > 0 ? msInside / msTotal : 0 };
  } else if (msAtZero >= params.graceMs) {
    done = { caught: false, quality: 0 };
  }

  return {
    bandPos, bandVel, fishPos, fishTarget, fishWait,
    progress, msInside, msTotal, msAtZero, done,
  };
```

- [ ] **Step 4: Testes do teto e da carência**

Acrescente a `engines/hold.test.ts` (e some `maxSpeed: 0.0009, graceMs: 2000` ao `base` do arquivo):

```ts
  it('a velocidade da faixa nao passa do teto', () => {
    let e = startHold(base);
    for (let i = 0; i < 200; i++) e = stepHold(base, e, 16, true, rnd);
    expect(Math.abs(e.bandVel)).toBeLessThanOrEqual(base.maxSpeed);
  });

  it('barra zerada nao perde na hora: comeca a carencia', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.01 };
    e = stepHold(base, e, 200, false, rnd);
    expect(e.progress).toBe(0);
    expect(e.done).toBeNull();
    expect(e.msAtZero).toBeGreaterThan(0);
  });

  it('carencia estourada perde o peixe', () => {
    let e = { ...startHold(base), bandPos: 0.1, fishPos: 0.9, progress: 0.01, msAtZero: 1900 };
    e = stepHold(base, e, 200, false, rnd);
    expect(e.done).toEqual({ caught: false, quality: 0 });
  });

  it('recuperar zera a carencia', () => {
    let e = { ...startHold(base), bandPos: 0.5, fishPos: 0.5, progress: 0, msAtZero: 1500 };
    e = stepHold(base, e, 20, false, rnd);
    expect(e.progress).toBeGreaterThan(0);
    expect(e.msAtZero).toBe(0);
  });
```

Run: `pnpm vitest run src/islands/fishing/engines/hold.test.ts`
Expected: PASS.

- [ ] **Step 5: A tela mostra a carência**

Carência invisível não serve de nada: a pessoa precisa saber que ainda dá tempo. Em `views/HoldView.css`:

```css
/* Barra de fuga: so aparece quando o progresso zerou. Cor de perigo E forma
   propria (borda grossa), porque cor sozinha nao pode carregar o aviso. */
.hold-escape {
  position: relative;
  width: 12px;
  border: 2px solid var(--fishing-danger);
  border-radius: 4px;
  overflow: hidden;
}

.hold-escape-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--fishing-danger);
}
```

Em `views/HoldView.tsx`, junto do medidor:

```tsx
{state.msAtZero > 0 && (
  <div class="hold-escape" role="presentation">
    <div
      class="hold-escape-fill"
      style={{ height: `${Math.max(0, 1 - state.msAtZero / params.graceMs) * 100}%` }}
    />
  </div>
)}
```

Esta barra **não** é congelada em `prefers-reduced-motion`: ela carrega tempo restante, que é informação essencial, não enfeite.

- [ ] **Step 6: A tabela vira matriz de motor × dificuldade**

Hoje cada peixe tem parâmetros escolhidos a esmo. A regra do dono é que o raso ensine: **cada motor aparece em cada faixa**, do fácil ao difícil. Três motores × três faixas = nove peixes, encaixe exato.

`types.ts`: `Fish` ganha `tier: 1 | 2 | 3`.

Reescreva `fish.ts` mantendo os ids `p1`…`p9` (as traduções já existem e não mudam):

```ts
export const FISH: Fish[] = [
  // ---- Faixa 1, o raso que ensina. Margem generosa nos tres motores.
  { id: 'p1', tier: 1, color: 'var(--fishing-fish-a)', sizeMin: 12, sizeMax: 34,
    engine: 'track',
    params: { path: 'pendulo', periodMs: 2600, zones: [{ pos: 0.5, size: 0.30 }], hits: 1, alternates: false, tolerance: null } },
  { id: 'p2', tier: 1, color: 'var(--fishing-fish-b)', sizeMin: 18, sizeMax: 46,
    engine: 'hold',
    params: { bandHeight: 0.30, gravity: 0.000003, lift: 0.000008, maxSpeed: 0.0007, pattern: 'calmo', fishSpeed: 0.00020, fillRate: 0.0006, drainRate: 0.0003, graceMs: 2500 } },
  { id: 'p3', tier: 1, color: 'var(--fishing-fish-c)', sizeMin: 22, sizeMax: 58,
    engine: 'dodge',
    params: { lanes: 2, periodMs: 4000, lapsToCatch: 1, bumpsAllowed: 3,
      gates: [{ pos: 0.3, open: [0] }, { pos: 0.8, open: [1] }] } },

  // ---- Faixa 2, o meio. Janela menor, mais velocidade, menos perdao.
  { id: 'p4', tier: 2, color: 'var(--fishing-fish-d)', sizeMin: 15, sizeMax: 40,
    engine: 'track',
    params: { path: 'radial', periodMs: 2000, zones: [{ pos: 0.35, size: 0.18 }], hits: 2, alternates: false, tolerance: null } },
  { id: 'p5', tier: 2, color: 'var(--fishing-fish-e)', sizeMin: 10, sizeMax: 28,
    engine: 'hold',
    params: { bandHeight: 0.22, gravity: 0.0000035, lift: 0.000009, maxSpeed: 0.0009, pattern: 'erratico', fishSpeed: 0.00035, fillRate: 0.00055, drainRate: 0.0004, graceMs: 1800 } },
  { id: 'p6', tier: 2, color: 'var(--fishing-fish-f)', sizeMin: 30, sizeMax: 72,
    engine: 'dodge',
    params: { lanes: 2, periodMs: 3200, lapsToCatch: 2, bumpsAllowed: 2,
      gates: [{ pos: 0.15, open: [0] }, { pos: 0.4, open: [1] }, { pos: 0.65, open: [0] }, { pos: 0.9, open: [1] }] } },

  // ---- Faixa 3, o abissal. Sem perdao.
  { id: 'p7', tier: 3, color: 'var(--fishing-fish-g)', sizeMin: 26, sizeMax: 65,
    engine: 'track',
    params: { path: 'pendulo', periodMs: 1500, zones: [{ pos: 0.2, size: 0.12 }, { pos: 0.8, size: 0.12 }], hits: 3, alternates: true, tolerance: 2 } },
  { id: 'p8', tier: 3, color: 'var(--fishing-fish-h)', sizeMin: 40, sizeMax: 95,
    engine: 'hold',
    params: { bandHeight: 0.16, gravity: 0.0000045, lift: 0.000011, maxSpeed: 0.0012, pattern: 'arisco', fishSpeed: 0.0006, fillRate: 0.0005, drainRate: 0.00055, graceMs: 1200 } },
  { id: 'p9', tier: 3, color: 'var(--fishing-fish-i)', sizeMin: 55, sizeMax: 130,
    engine: 'dodge',
    params: { lanes: 3, periodMs: 2600, lapsToCatch: 2, bumpsAllowed: 0,
      gates: [{ pos: 0.12, open: [1] }, { pos: 0.3, open: [0, 2] }, { pos: 0.5, open: [2] }, { pos: 0.7, open: [0] }, { pos: 0.88, open: [1, 2] }] } },
];
```

Em `fish.test.ts`, troque o teste dos quatro caminhos por dois que travam a matriz:

```ts
  it('cada faixa tem exatamente um peixe de cada engine', () => {
    for (const tier of [1, 2, 3]) {
      const engines = FISH.filter((f) => f.tier === tier).map((f) => f.engine).sort();
      expect(engines).toEqual(['dodge', 'hold', 'track']);
    }
  });

  it('so existem os dois caminhos continuos', () => {
    const paths = FISH.filter((f) => f.engine === 'track').map((f) => (f.params as { path: string }).path);
    expect(new Set(paths)).toEqual(new Set(['pendulo', 'radial']));
  });
```

- [ ] **Step 7: O sorteio começa pelos fáceis**

O v1 não tem mapa, então não existe "raso". Sem isso o sorteio aleatório entrega um abissal no terceiro lance e a curva que a matriz desenha não existe para ser testada.

Em `Fishing.tsx`, dentro de `cast`:

```tsx
// Sem mapa no v1, a profundidade e simulada pelo caderno: as faixas abrem
// conforme se pesca. Sem isto a curva de aprendizado da matriz nao aparece.
const known = Object.keys(log).length;
const maxTier = known >= 6 ? 3 : known >= 3 ? 2 : 1;
const pool = FISH.filter((f) => f.tier <= maxTier);
const fish = pool[Math.floor(Math.random() * pool.length)];
```

- [ ] **Step 8: Verifique na mão**

```bash
pnpm test && pnpm build && npx --yes serve@14 dist -l 4330 --no-clipboard
```

Em `http://localhost:4330/jogo/pesca`:

1. **Nenhum marcador teleporta.** Jogue vários TRACK e confirme que o movimento é contínuo em ambos os caminhos.
2. **Segurar funciona.** No HOLD, segure espaço: a faixa sobe em velocidade constante e leva mais de um segundo para cruzar a barra. Não deve dar vontade de tocar repetidamente.
3. **A carência aparece.** Deixe a barra zerar: o peixe **não** some na hora, a barrinha de fuga aparece drenando, e trazer a faixa de volta ao peixe zera a carência e salva.
4. **Os três primeiros lances são da faixa 1.** Depois de três peixes distintos no caderno, a faixa 2 aparece; depois de seis, a 3.
5. Repita em `/en/game/fishing`.

- [ ] **Step 9: Commit**

```bash
git add src/islands/fishing src/styles
git commit -m "feat(fishing): ajustes do primeiro teste de jogo"
```

## Verificação final

- [ ] `pnpm test` verde
- [ ] `pnpm build` sem aviso
- [ ] JS total ≤ 48KB não comprimido (33KB de base + 15KB de orçamento)
- [ ] As três rotas respondem e jogam
- [ ] Jogável só com Tab e espaço
- [ ] `prefers-reduced-motion` respeitado nos três motores
- [ ] Detector sem achados novos
- [ ] Esc e o botao Sair voltam para a pagina, e o foco volta para o botao Jogar
- [ ] Com a sobreposicao aberta, a pagina de tras nao rola
- [ ] A pagina do game TEM rodape; as outras 37 tambem
- [ ] Nenhum marcador teleporta
- [ ] No HOLD da para SEGURAR o espaco, nao so tocar
- [ ] Barra zerada entra em carencia e da para recuperar
- [ ] Os primeiros lances sao da faixa 1
- [ ] **Dez lances seguidos sem querer parar** — se falhar, o próximo trabalho é afinar parâmetros em `fish.ts`, nunca construir o mundo
