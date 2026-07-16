# Redesign "Mesa de Engenharia × Terminal Punk" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o portfólio (Astro + Preact + Tailwind v4) para a estética "mesa de engenharia" no claro e "terminal CRT punk" no escuro, portando as ideias visuais de um design de referência sem trazer o código React.

**Architecture:** Todo o estilo vive em `src/styles/global.css` (tokens + utilitários compartilhados) e em blocos `<style is:global>` dos componentes `.astro`. A migração acontece em duas frentes: (1) retunar os tokens de cor/fonte em `.light`/`.dark`; (2) migrar hexes neon hardcoded (104 ocorrências em 12 arquivos) para os novos tokens/paleta, e transformar Hero + ProjectCard.

**Tech Stack:** Astro 5, Preact islands, Tailwind CSS v4 (`@theme`, `@custom-variant`), TypeScript, pnpm. Fontes self-hosted (Inter, Sora, JetBrains Mono, Permanent Marker).

## Global Constraints

- **Sem TDD clássico:** é redesign visual. O "ciclo de teste" de cada tarefa = `pnpm build` passa **sem erros** + verificação visual (dev server / screenshot claro E escuro). Não inventar testes unitários de CSS.
- **Não adicionar dependências nem fontes.** Reusar JetBrains Mono (já self-hosted) no lugar de IBM Plex Mono.
- **Sem ticker/marquee.** Não portar `system-ticker` do zip.
- **Preservar sempre:** i18n pt-br/en/es; `@media (prefers-reduced-motion: reduce)`; `@media (prefers-contrast: high)`; prevenção de flicker (script inline no `<head>` do BaseLayout); print stylesheet.
- **Estilos:** manter o padrão do projeto — CSS em `global.css` ou `<style is:global>` dos componentes; **não** criar CSS modules.
- **Commits:** frequentes, um por tarefa, com `rtk git`. Sufixo de commit conforme convenção do repo.
- **Paleta de migração (tabela canônica — toda tarefa de migração de hex usa isto):**

  | Old (hardcoded) | Papel antigo | Novo valor |
  |---|---|---|
  | `#a277ff` / `rgba(162, 119, 255, X)` | roxo primário / glow | verde fósforo `#61ffca` / `rgba(97, 255, 202, X)` |
  | `#b794ff` | roxo hover | `#7dffb0` |
  | `#f694ff` / `rgba(246, 148, 255, X)` | rosa | vermelho-revolta `#ff3e3e` / `rgba(255, 62, 62, X)` |
  | `#82e2ff` / `rgba(130, 226, 255, X)` | ciano | verde fósforo `#61ffca` / `rgba(97, 255, 202, X)` |
  | `#61ffca` / `rgba(97, 255, 202, X)` | verde | **manter** (agora é a base) |
  | `#54c59f` | verde apagado | manter |
  | `#9a5b32` / `rgba(194, 112, 62, X)` | marrom claro | oxblood `#8f2d24` / `rgba(143, 45, 36, X)` |

- **Tokens novos:** `--color-revolt` (dark: `#ff3e3e`; light: `#8f2d24`) e `--color-ink-blue` (light: `#2f5aa8`; dark: `#54c59f`). Ambos mapeados no `@theme`.

---

## File Structure

**Modificados:**
- `src/styles/global.css` — tokens `.light`/`.dark`, `@theme`, utilitários novos, keyframes/hexes internos. (Ondas A + parte de D)
- `src/components/HeroSection.astro` — engineering card + terminal + stickers reduzidos. (Onda B)
- `src/components/ProjectCard.astro` — MSN chrome → punch-card. (Onda C)
- `src/components/ContactSection.astro`, `AboutSection.astro`, `TimelineSection.astro`, `TimelineEntry.astro`, `Footer.astro`, `NavBar.astro`, `StatCard.astro`, `SectionTitle.astro`, `CaseStudyContent.astro` — migração de hexes + carimbos/blueprint. (Onda D)
- `src/i18n/pt-br.json`, `en.json`, `es.json` — chaves novas (`hero.boot`, `hero.status`, `contact.stamp`). (Ondas B/D)

**Não tocar:** `BaseLayout.astro` (script de flicker), islands (`ThemeToggle`, etc.) — a cortina de transição continua; só recolorimos os keyframes `curtain-*` em global.css.

---

## WAVE A — Base (tokens, fontes, utilitários)

### Task A1: Retunar paleta do modo CLARO (mesa de engenharia)

**Files:**
- Modify: `src/styles/global.css:93-110` (bloco `.light`)

**Interfaces:**
- Produces: tokens `--color-*` do `.light` com valores de engenharia; novos `--color-revolt`, `--color-ink-blue`.

- [ ] **Step 1: Substituir o bloco `.light`**

Trocar `src/styles/global.css:93-110` por:

```css
.light {
  --color-bg-primary: #f2efe4;      /* Papel manila / creme frio */
  --color-bg-secondary: #f8f6ef;    /* Papel de card */
  --color-text-primary: #22242b;    /* Tinta quase-preta azulada */
  --color-text-secondary: #5f636e;  /* Cinza-tinta */
  --color-accent: #8f2d24;          /* Oxblood — carimbo */
  --color-accent-hover: #742019;
  --color-accent-muted: #f3e6e2;
  --color-accent-secondary: #2f5aa8; /* Azul-blueprint */
  --color-accent-tertiary: #8f2d24;
  --color-accent-quaternary: #2f5aa8;
  --color-accent-quinary: #5f636e;
  --color-border: #cbc7ba;          /* Borda de papel */
  --color-border-accent: rgba(143, 45, 36, 0.25);
  --color-revolt: #8f2d24;          /* Oxblood também no claro */
  --color-ink-blue: #2f5aa8;        /* Blueprint */
  --font-heading-tracking: -0.02em;
  --shadow-sm: 0 1px 3px rgba(34, 36, 43, 0.08);
  --shadow-md: 0 4px 12px rgba(34, 36, 43, 0.10);
}
```

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: build conclui sem erros (dist gerado).

- [ ] **Step 3: Verificação visual (claro)**

Run: `pnpm dev` e abrir `http://localhost:4321/` em modo claro.
Expected: fundo creme manila, texto tinta escura, links/detalhes em vermelho oxblood. Sem quebra de layout.

- [ ] **Step 4: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "feat(theme): paleta clara mesa-de-engenharia (oxblood + blueprint)"
```

---

### Task A2: Retunar paleta do modo ESCURO (terminal CRT) + prefers-contrast

**Files:**
- Modify: `src/styles/global.css:74-91` (bloco `.dark`)
- Modify: `src/styles/global.css:161-175` (bloco `@media (prefers-contrast: high)`)

**Interfaces:**
- Consumes: tokens novos definidos em A1 (`--color-revolt`, `--color-ink-blue`).
- Produces: tokens `.dark` verde-fósforo + revolta.

- [ ] **Step 1: Substituir o bloco `.dark`**

Trocar `src/styles/global.css:74-91` por:

```css
.dark {
  --color-bg-primary: #0a0f0c;      /* Preto-esverdeado CRT */
  --color-bg-secondary: #0f1512;
  --color-text-primary: #7cf5ad;    /* Verde fósforo */
  --color-text-secondary: #4fbf85;
  --color-accent: #42f59b;          /* Verde ácido primário */
  --color-accent-hover: #7dffb0;
  --color-accent-muted: rgba(97, 255, 202, 0.18);
  --color-accent-secondary: #61ffca; /* Fósforo brilhante */
  --color-accent-tertiary: #ff3e3e;  /* Revolta */
  --color-accent-quaternary: #61ffca;
  --color-accent-quinary: #54c59f;
  --color-border: #1f5a3d;          /* Verde escuro */
  --color-border-accent: rgba(97, 255, 202, 0.25);
  --color-revolt: #ff3e3e;          /* Vermelho revolta — CTAs */
  --color-ink-blue: #54c59f;        /* No CRT dobra em verde apagado */
  --font-heading-tracking: -0.01em;
  --shadow-sm: none;
  --shadow-md: none;
}
```

- [ ] **Step 2: Substituir o bloco `@media (prefers-contrast: high)`**

Trocar `src/styles/global.css:161-175` por:

```css
@media (prefers-contrast: high) {
  .dark {
    --color-accent: #6affb3;
    --color-accent-secondary: #8affd4;
    --color-accent-tertiary: #ff6a6a;
    --color-accent-quaternary: #8affd4;
    --color-text-primary: #b6ffd6;
    --color-text-secondary: #d6ffe8;
    --color-border: currentColor;
  }
  .light {
    --color-accent: #742019;
    --color-text-secondary: #22242b;
    --color-border: currentColor;
  }
}
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: sem erros.

- [ ] **Step 4: Verificação visual (escuro)**

Alternar para modo escuro em `http://localhost:4321/`.
Expected: fundo preto-esverdeado, texto verde fósforo, sem roxo/rosa remanescente nos textos base. (Ainda haverá roxo em enfeites hardcoded — corrigidos em A5.)

- [ ] **Step 5: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "feat(theme): paleta escura terminal-CRT (verde fosforo + revolta)"
```

---

### Task A3: Fonte mono no corpo do modo escuro + tokens novos no @theme

**Files:**
- Modify: `src/styles/global.css:116-138` (bloco `@theme`)
- Modify: `src/styles/global.css:130-133` (fim do `body`/base) — adicionar regra de fonte

**Interfaces:**
- Consumes: `--font-mono` (já existe no `@theme`), `--color-revolt`, `--color-ink-blue`.
- Produces: `--color-revolt`/`--color-ink-blue` disponíveis como utilitários Tailwind; corpo mono no dark.

- [ ] **Step 1: Adicionar os dois tokens novos ao `@theme`**

Em `src/styles/global.css`, dentro do bloco `@theme` (após a linha `--color-border-accent: var(--color-border-accent);`, ~linha 129), inserir:

```css
  --color-revolt: var(--color-revolt);
  --color-ink-blue: var(--color-ink-blue);
```

- [ ] **Step 2: Aplicar mono ao corpo no escuro**

No `@layer base` (bloco `body` em ~linha 130-132), adicionar logo após a regra `body`:

```css
  /* Terminal: corpo monoespaçado só no escuro */
  .dark body {
    font-family: var(--font-mono);
  }
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: sem erros.

- [ ] **Step 4: Verificação visual**

Escuro: texto do corpo vira monoespaçado (JetBrains Mono). Claro: continua Inter.
Expected: confirmado; legibilidade ok.

- [ ] **Step 5: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "feat(theme): corpo mono no escuro + tokens revolt/ink-blue no @theme"
```

---

### Task A4: Adicionar utilitários visuais novos (punch-card, ink-stamp, blueprint, CRT)

**Files:**
- Modify: `src/styles/global.css` — inserir novo bloco de utilitários antes de `/* PUNK DARK MODE */` (~linha 440)

**Interfaces:**
- Produces: classes `.punch-card-holes`, `.punch-hole`, `.card-edge-holes`, `.vintage-card`, `.ink-stamp`, `.blueprint-wrap`, `.crt-glow`, `.terminal-cursor`, `.paper-tape`, `.redacted`, keyframe `cursor-blink`. Consumidas por Hero (B) e ProjectCard (C).

- [ ] **Step 1: Inserir o bloco de utilitários**

Em `src/styles/global.css`, imediatamente antes do comentário `/* ============================================\n   PUNK DARK MODE — Shared element styles`, inserir:

```css
/* ============================================
   ENGENHARIA / TERMINAL — utilitários portados
   ============================================ */

/* Furos de punch card */
.punch-hole {
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-radius: 2px;
}
.dark .punch-hole {
  background: color-mix(in srgb, var(--color-accent-secondary) 50%, transparent);
  box-shadow: 0 0 4px rgba(97, 255, 202, 0.6);
}

/* Borda perfurada nos cantos de um card */
.card-edge-holes {
  background:
    linear-gradient(90deg,
      transparent 0%, transparent 2%,
      color-mix(in srgb, var(--color-border) 60%, transparent) 2%,
      color-mix(in srgb, var(--color-border) 60%, transparent) 4%,
      transparent 4%, transparent 96%,
      color-mix(in srgb, var(--color-border) 60%, transparent) 96%,
      color-mix(in srgb, var(--color-border) 60%, transparent) 98%,
      transparent 98%);
}

/* Papel vintage gasto (claro) / painel fósforo (escuro) */
.vintage-card {
  position: relative;
  background:
    linear-gradient(135deg,
      color-mix(in srgb, var(--color-bg-secondary) 92%, #d8d2bf) 0%,
      var(--color-bg-secondary) 50%,
      color-mix(in srgb, var(--color-bg-secondary) 95%, #d8d2bf) 100%);
}
.vintage-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: multiply;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 3px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 3px);
}
.dark .vintage-card {
  background: linear-gradient(135deg, #101613 0%, #0d1310 50%, #111713 100%);
}
.dark .vintage-card::before { opacity: 0; }

/* Carimbo de tinta rotacionado (claro) / brilho fósforo (escuro) */
.ink-stamp {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  padding: 0.2rem 0.6rem;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 2px;
  transform: rotate(-6deg);
  opacity: 0.9;
  box-shadow: inset 0 0 0 1px var(--color-accent);
}
.dark .ink-stamp {
  border-color: var(--color-accent-secondary);
  color: var(--color-accent-secondary);
  transform: none;
  box-shadow: none;
  opacity: 1;
  text-shadow: 0 0 6px rgba(97, 255, 202, 0.5);
}

/* Grid milimetrado sutil (claro) / grid fósforo (escuro) */
.blueprint-wrap { position: relative; }
.blueprint-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.06;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 23px, var(--color-ink-blue) 23px, var(--color-ink-blue) 24px),
    repeating-linear-gradient(90deg, transparent, transparent 23px, var(--color-ink-blue) 23px, var(--color-ink-blue) 24px);
}
.dark .blueprint-wrap::before {
  opacity: 0.05;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(97,255,202,1) 23px, rgba(97,255,202,1) 24px),
    repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(97,255,202,1) 23px, rgba(97,255,202,1) 24px);
}

/* Brilho fósforo em texto (escuro) */
.dark .crt-glow {
  text-shadow: 0 0 2px rgba(97,255,202,0.7), 0 0 8px rgba(97,255,202,0.35);
}

/* Cursor de terminal piscando */
.terminal-cursor::after {
  content: '\2588';
  margin-left: 2px;
  animation: cursor-blink 1.1s step-end infinite;
}
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}

/* Barra censurada tipo zine — revela no hover */
.redacted {
  background: currentColor;
  color: transparent;
  border-radius: 1px;
  transition: background 0.2s ease, color 0.2s ease;
  user-select: none;
}
.redacted:hover { background: transparent; color: inherit; }

/* Fita de papel decorativa */
.paper-tape { position: relative; }
```

- [ ] **Step 2: Adicionar `terminal-cursor`, `crt-glow` e `redacted` ao override de reduced-motion**

No bloco `@media (prefers-reduced-motion: reduce)` existente (~linha 423-438), acrescentar `.terminal-cursor::after` à lista de `animation: none`:

```css
  .terminal-cursor::after {
    animation: none !important;
  }
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: sem erros (classes ainda não usadas, mas devem compilar).

- [ ] **Step 4: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "feat(theme): utilitarios punch-card, ink-stamp, blueprint, CRT"
```

---

### Task A5: Migrar hexes neon internos do global.css (scanlines, glitch, curtain, stickers, collage)

**Files:**
- Modify: `src/styles/global.css` — linhas 183-190 (selection), 218-235 (scanlines), 290-299 (tech-badge dark + scrollbar), 345-380 (glitch-rgb), 407-420 (curtain), 476-480 (sticker-bg), 615-630 (collage-strip)

**Interfaces:**
- Consumes: tabela de paleta canônica (Global Constraints).
- Produces: global.css sem roxo/rosa/ciano hardcoded (exceto onde a tabela manda manter verde).

- [ ] **Step 1: Migrar `::selection` (dark) e scanlines**

`src/styles/global.css:187-190` — trocar `rgba(162, 119, 255, 0.3)` por `rgba(97, 255, 202, 0.25)`.

`src/styles/global.css:225` (dentro de `.dark body::after`) — trocar as duas ocorrências de `rgba(162, 119, 255, 0.03)` por `rgba(97, 255, 202, 0.04)`.

- [ ] **Step 2: Migrar tech-badge dark + scrollbar dark**

`src/styles/global.css:290-295` — no bloco `.dark .tech-badge`, trocar:
- `border-color: rgba(97, 255, 202, 0.3);` → manter.
- `color: #82e2ff;` → `color: #61ffca;`
- `text-shadow: 0 0 6px rgba(130, 226, 255, 0.3);` → `text-shadow: 0 0 6px rgba(97, 255, 202, 0.3);`
- `box-shadow: inset 0 0 6px rgba(162, 119, 255, 0.08);` → `box-shadow: inset 0 0 6px rgba(97, 255, 202, 0.08);`

`src/styles/global.css:298-300` — `.dark::-webkit-scrollbar-thumb { background: rgba(162, 119, 255, 0.4); }` → `rgba(97, 255, 202, 0.4)`.

- [ ] **Step 3: Migrar keyframe `glitch-rgb`**

Substituir o bloco `@keyframes glitch-rgb` (`src/styles/global.css:345-380`) por (mantém o "chromatic aberration" `#ff0040`/`#0ff` mas base vira verde/vermelho):

```css
@keyframes glitch-rgb {
  0%, 82%, 97%, 100% {
    text-shadow:
      0 0 20px rgba(97, 255, 202, 0.4),
      0 0 60px rgba(97, 255, 202, 0.15);
  }
  83% {
    text-shadow:
      -3px 0 #ff3e3e,
      3px 0 #61ffca,
      0 0 20px rgba(97, 255, 202, 0.4);
  }
  86% {
    text-shadow:
      4px 0 #ff3e3e,
      -4px 0 #61ffca,
      0 0 30px rgba(255, 62, 62, 0.5);
  }
  89% {
    text-shadow:
      -2px 2px #ff3e3e,
      2px -2px #61ffca,
      0 0 20px rgba(97, 255, 202, 0.4);
  }
  92% {
    text-shadow:
      3px -1px #ff3e3e,
      -3px 1px #61ffca,
      0 0 40px rgba(97, 255, 202, 0.5);
  }
  95% {
    text-shadow:
      0 0 20px rgba(97, 255, 202, 0.4),
      0 0 60px rgba(97, 255, 202, 0.15);
  }
}
```

- [ ] **Step 4: Migrar keyframes `curtain-to-dark` / `curtain-to-light`**

`src/styles/global.css:407-420` — trocar as cores da cortina para o novo mundo:
- `#1a0a2e` (roxo escuro) → `#06120c` (verde-preto)
- `rgba(162, 119, 255, 0.15)` → `rgba(97, 255, 202, 0.15)`

(As duas ocorrências em cada keyframe.)

- [ ] **Step 5: Migrar `.punk-sticker-bg` e `.punk-collage-strip`**

`src/styles/global.css:477` — `background: radial-gradient(circle, #a277ff 0%, #f694ff 50%, transparent 72%);` → `radial-gradient(circle, #61ffca 0%, #ff3e3e 50%, transparent 72%);`

`src/styles/global.css:615` — `filter: drop-shadow(0 2px 12px rgba(162, 119, 255, 0.4));` → `rgba(97, 255, 202, 0.4)`.
`src/styles/global.css:629` — `filter: drop-shadow(0 4px 20px rgba(246, 148, 255, 0.6));` → `rgba(255, 62, 62, 0.6)`.

- [ ] **Step 6: Verificar que não sobrou roxo/rosa/ciano no global.css**

Run: `rtk grep "162, 119, 255|a277ff|b794ff|f694ff|246, 148, 255|82e2ff|130, 226, 255" src/styles/global.css`
Expected: **nenhum resultado**.

- [ ] **Step 7: Build + visual**

Run: `pnpm build`
Expected: sem erros. Alternar tema: a cortina de transição agora é verde-preta; glitch do título em verde/vermelho.

- [ ] **Step 8: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "refactor(theme): migra hexes neon internos p/ verde-fosforo/revolta"
```

---

## WAVE B — Hero (engineering card + terminal)

### Task B1: Adicionar chaves i18n de boot/status do Hero

**Files:**
- Modify: `src/i18n/pt-br.json`, `src/i18n/en.json`, `src/i18n/es.json` (objeto `hero`)

**Interfaces:**
- Produces: chaves `hero.boot`, `hero.status` acessíveis via `t('hero.boot', locale)`.

- [ ] **Step 1: Adicionar chaves em cada locale**

No objeto `"hero"` de `pt-br.json`, adicionar:
```json
"boot": "> SISTEMA_ONLINE — READY",
"status": "DISPONÍVEL P/ PROJETOS"
```
`en.json`:
```json
"boot": "> SYSTEM_ONLINE — READY",
"status": "AVAILABLE FOR WORK"
```
`es.json`:
```json
"boot": "> SISTEMA_ONLINE — READY",
"status": "DISPONIBLE P/ PROYECTOS"
```

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: sem erros; JSON válido.

- [ ] **Step 3: Commit**

```bash
rtk git add src/i18n/pt-br.json src/i18n/en.json src/i18n/es.json
rtk git commit -m "feat(i18n): chaves hero.boot e hero.status"
```

---

### Task B2: Transformar o markup do Hero (boot line, ink-stamp, terminal-cursor, edge-holes)

**Files:**
- Modify: `src/components/HeroSection.astro:24-74` (markup)

**Interfaces:**
- Consumes: `t('hero.boot')`, `t('hero.status')` (B1); `.ink-stamp`, `.card-edge-holes`, `.blueprint-wrap`, `.terminal-cursor`, `.crt-glow`, `.punch-hole` (A4).
- Produces: Hero com cara de "cartão de sistema".

- [ ] **Step 1: Substituir a fileira de decorações `punk-ono` e adicionar boot/stamp**

Em `HeroSection.astro`, dentro de `.hero-content` (antes de `<span class="hero-role...">`, ~linha 50), inserir:

```astro
        <div class="hero-syshead">
          <div class="hero-holes" aria-hidden="true">
            {[...Array(6)].map(() => <span class="punch-hole"></span>)}
          </div>
          <span class="ink-stamp hero-stamp crt-glow">{t('hero.status', locale)}</span>
        </div>
        <p class="hero-boot crt-glow" aria-hidden="true">{t('hero.boot', locale)}</p>
```

- [ ] **Step 2: Adicionar `terminal-cursor` ao role e `blueprint-wrap` na section**

- Linha 24: `<section id="hero" class="hero-section">` → `<section id="hero" class="hero-section blueprint-wrap">`
- Linha 51: `<span class="hero-role hero-stagger" ...>` → adicionar classe `terminal-cursor` **apenas no dark** não é possível via classe estática condicional; então adicionar `terminal-cursor` sempre e no CSS esconder o cursor no claro (feito no Step 4).

Trocar linha 51 por:
```astro
        <span class="hero-role hero-stagger terminal-cursor" style="--stagger: 1">{t('hero.role', locale)}</span>
```

- [ ] **Step 3: Reduzir decorações `punk-ono` a duas**

Remover as linhas 42-45 (`BOOM!`, duas estrelas, `POW!`) e manter só duas: substituir por:
```astro
  <span class="punk-ono" style="top:8%;right:10%;font-size:2rem;color:#61ffca;text-shadow:0 0 15px rgba(97,255,202,0.5)" aria-hidden="true">&#9733;</span>
  <span class="punk-ono" style="bottom:10%;right:6%;font-size:1.5rem;color:#ff3e3e;text-shadow:0 0 12px rgba(255,62,62,0.5)" aria-hidden="true">BOOM!</span>
```

Também migrar os `punk-menacing` (linhas 38-39): trocar `rgba(162,119,255,0.2)` → `rgba(97,255,202,0.2)` (mantém o outro que já é verde).

- [ ] **Step 4: Adicionar estilos do syshead/boot no `<style is:global>` do Hero**

No `<style is:global>` do Hero, após `.hero-role { ... }` (~linha 139), inserir:

```css
  .hero-syshead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .hero-holes { display: flex; gap: 0.4rem; }
  .hero-holes .punch-hole { width: 0.5rem; height: 0.5rem; }
  .hero-stamp { font-size: 0.625rem; }
  .hero-boot {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-accent);
    margin-bottom: 1rem;
  }
  /* Cursor de terminal só no escuro */
  .light .terminal-cursor::after { content: none; }
```

- [ ] **Step 5: Build + visual (claro e escuro)**

Run: `pnpm build`
Expected: sem erros. Claro: carimbo oxblood "DISPONÍVEL P/ PROJETOS" rotacionado + linha de boot; sem cursor. Escuro: carimbo verde fósforo + cursor piscando no role.

- [ ] **Step 6: Commit**

```bash
rtk git add src/components/HeroSection.astro
rtk git commit -m "feat(hero): cartao de sistema (boot, ink-stamp, cursor, blueprint)"
```

---

### Task B3: Migrar hexes e dark-styles do Hero + reduzir stickers a 2

**Files:**
- Modify: `src/components/HeroSection.astro` — imports 7-9, stickers 25-35, dark styles 87-93, 212-223, mobile 226-256

**Interfaces:**
- Consumes: tabela de paleta (Global Constraints).
- Produces: Hero sem roxo/rosa; 2 stickers no lugar de 3.

- [ ] **Step 1: Reduzir stickers a dois (Gon + skull) — remover o flaming skull**

Remover o import `flamingSkullImg` (linha 9) e o bloco de imagem correspondente (linhas 33-35). Manter Gon (top-right) e skull rock (mid-left).

> Nota: a decisão do spec é "1–2 principais". Mantemos 2 stickers icônicos; se o usuário preferir os políticos (Angela Davis / punho operário), trocar os imports por `../assets/imgs/pngtree-angela-davis-...webp` e `../assets/imgs/pngtree-powerful-fist-with-wrench-...png`. Deixar como está e sinalizar na revisão.

- [ ] **Step 2: Migrar gradiente radial dark da section**

`HeroSection.astro:87-93` — no bloco `.dark .hero-section`, trocar `rgba(162, 119, 255, 0.08)` → `rgba(97, 255, 202, 0.07)`.

- [ ] **Step 3: Migrar `.dark .hero-title` e `.dark .hero-role`**

`HeroSection.astro:212-223`:
- `text-shadow: 0 0 30px rgba(162, 119, 255, 0.5), 0 0 80px rgba(162, 119, 255, 0.2);` → `0 0 30px rgba(97, 255, 202, 0.5), 0 0 80px rgba(97, 255, 202, 0.2);`
- `.dark .hero-role { color: #61ffca; ... }` → manter (`#61ffca` é verde, ok).

- [ ] **Step 4: Verificar ausência de roxo/rosa no Hero**

Run: `rtk grep "162, 119, 255|a277ff|f694ff|82e2ff|130, 226, 255|246, 148, 255" src/components/HeroSection.astro`
Expected: nenhum resultado.

- [ ] **Step 5: Build + visual**

Run: `pnpm build`
Expected: sem erros. Escuro: 2 stickers, glow verde no título, sem roxo.

- [ ] **Step 6: Commit**

```bash
rtk git add src/components/HeroSection.astro
rtk git commit -m "refactor(hero): migra neon p/ verde/revolta e reduz stickers a 2"
```

---

## WAVE C — Projetos (punch-card)

> **Pré-existente (commit de conteúdo):** `ProjectCard.astro` já recebe os props
> `type` (`'project' | 'contribution'`) e `typeLabel` (string localizada) e renderiza
> `<span class="project-type-stamp project-type-stamp--{type}">`. `ProjectsSection.astro`
> já passa esses props. **Não duplicar** — preservar o markup do carimbo e, no C2,
> **reestilizar** `.project-type-stamp` como `.ink-stamp` (oxblood/rotacionado no claro,
> verde fósforo no escuro), mantendo a distinção project vs contribution.

### Task C1: Substituir MSN chrome por cabeçalho/rodapé punch-card no markup

**Files:**
- Modify: `src/components/ProjectCard.astro:32-95` (markup — chrome, status, menacing)

**Interfaces:**
- Consumes: `.punch-hole`, `.vintage-card`, `.card-edge-holes` (A4).
- Produces: markup de punch-card (`.pc-head`, `.pc-foot`).

- [ ] **Step 1: Trocar o chrome do MSN pelo cabeçalho punch-card**

Em `ProjectCard.astro`, substituir o bloco `<!-- MSN chrome ... -->` (linhas 33-42) por:

```astro
  <!-- Punch-card header: sprocket holes + card number -->
  <div class="pc-head" style="grid-column:1/-1" aria-hidden="true">
    <div class="pc-sprockets">
      {[...Array(8)].map(() => <span class="punch-hole"></span>)}
    </div>
    <span class="pc-title">{title}</span>
    <span class="pc-num">#{displayNumber}</span>
  </div>
```

- [ ] **Step 2: Trocar a status bar do MSN pelo rodapé punch-card**

Substituir o bloco `<!-- MSN status bar -->` (linhas 89-91) por:

```astro
  <!-- Punch-card footer -->
  <div class="pc-foot" style="grid-column:1/-1" aria-hidden="true">
    <span>COL: 80 · ROW: 12</span>
    <span>{'>'} IBM_FORMAT · {year}</span>
    <div class="pc-sprockets">
      {[...Array(8)].map(() => <span class="punch-hole"></span>)}
    </div>
  </div>
```

- [ ] **Step 3: Recolorir o `punk-menacing` gogo**

Linha 93 (`gogo` decoration) — trocar `color:rgba(162,119,255,0.15)` por `color:rgba(97,255,202,0.15)`.

- [ ] **Step 4: Aplicar `vintage-card` ao article**

Linha 32: `<article class="project-card" style="position:relative">` → `<article class="project-card vintage-card" style="position:relative">`.

- [ ] **Step 5: Build**

Run: `pnpm build`
Expected: sem erros (estilos `.pc-*` ainda ausentes — layout tosco, ok por ora).

- [ ] **Step 6: Commit**

```bash
rtk git add src/components/ProjectCard.astro
rtk git commit -m "feat(projects): markup punch-card no lugar do chrome MSN"
```

---

### Task C2: Estilos punch-card + migração de hexes + remover CSS do MSN

**Files:**
- Modify: `src/components/ProjectCard.astro` — `<style is:global>` (pc-head/foot novos; migrar `.dark .project-*` linhas ~275-320)
- Modify: `src/styles/global.css:514-584` (remover regras `.punk-msn-*` órfãs), `src/styles/global.css:659-669` e `731-737` (limpar refs a `.punk-msn-*`)

**Interfaces:**
- Consumes: markup `.pc-head`/`.pc-foot`/`.pc-sprockets` (C1).
- Produces: cards de projeto estilizados; global.css sem MSN chrome.

- [ ] **Step 1: Adicionar estilos `.pc-head`/`.pc-foot` no `<style is:global>` do ProjectCard**

Adicionar ao final do `<style is:global>` do ProjectCard:

```css
  /* Punch-card header/footer */
  .pc-head, .pc-foot {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-bg-secondary) 70%, transparent);
  }
  .pc-head { border-bottom: none; }
  .pc-foot { border-top: none; justify-content: space-between; }
  .pc-sprockets { display: flex; gap: 0.35rem; }
  .pc-sprockets .punch-hole { width: 0.375rem; height: 0.375rem; }
  .pc-title { flex: 1; font-weight: 700; text-transform: uppercase; }
  .pc-num {
    background: color-mix(in srgb, var(--color-accent) 20%, transparent);
    color: var(--color-accent);
    padding: 0.05rem 0.4rem;
    border-radius: 2px;
  }
  .dark .pc-head, .dark .pc-foot {
    border-color: var(--color-border);
    color: var(--color-accent-secondary);
    text-shadow: 0 0 6px rgba(97, 255, 202, 0.3);
  }
```

- [ ] **Step 1b: Reestilizar `.project-type-stamp` como ink-stamp**

Substituir o bloco `.project-type-stamp*` existente por uma variação que usa a linguagem de carimbo:
```css
  .project-type-stamp {
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 0.1rem 0.45rem;
    border: 2px solid currentColor;
    border-radius: 2px;
    line-height: 1.4;
    transform: rotate(-4deg);
  }
  .project-type-stamp--project { color: var(--color-text-secondary); }
  .project-type-stamp--contribution { color: var(--color-accent); }
  .dark .project-type-stamp {
    transform: none;
    text-shadow: 0 0 6px rgba(97, 255, 202, 0.4);
  }
  .dark .project-type-stamp--project { color: var(--color-accent-secondary); }
  .dark .project-type-stamp--contribution { color: var(--color-revolt); }
```

- [ ] **Step 2: Migrar os `.dark .project-*` hexes**

No `<style is:global>` do ProjectCard, migrar (tabela de paleta):
- `.dark .project-card` `border-bottom-color: rgba(162, 119, 255, 0.15)` → `rgba(97, 255, 202, 0.15)`
- `.dark .project-card:hover` `border-bottom-color: rgba(162, 119, 255, 0.4)` → `rgba(97, 255, 202, 0.4)`
- `.dark .project-card:hover::after` (ゴゴゴ) `color: rgba(162, 119, 255, 0.6); text-shadow: ... rgba(162, 119, 255, 0.4)` → `rgba(97, 255, 202, 0.6)` e `rgba(97, 255, 202, 0.4)`
- `.dark .project-number` `color: rgba(162, 119, 255, 0.3)` → `rgba(97, 255, 202, 0.3)`
- `.dark .project-card:hover .project-number` `color: #61ffca; text-shadow: ... rgba(97, 255, 202, ...)` → manter (já verde).

- [ ] **Step 3: Remover CSS órfão do MSN no global.css**

Remover de `src/styles/global.css`:
- Bloco `.punk-msn-chrome` … `.punk-msn-status { ... .dark .punk-msn-status { display: block; }` (linhas ~514-584).
- No media query mobile (linhas ~658-669): remover as regras `.punk-msn-chrome`, `.punk-msn-btn`, `.punk-msn-status`.
- No print (linhas ~731-737): remover `.punk-msn-chrome`, `.punk-msn-status` da lista `display:none`.

- [ ] **Step 4: Verificar ausência de MSN e de roxo nos projetos**

Run: `rtk grep "punk-msn|162, 119, 255" src/styles/global.css src/components/ProjectCard.astro`
Expected: nenhum resultado.

- [ ] **Step 5: Build + visual (claro e escuro)**

Run: `pnpm build`
Expected: sem erros. Claro: cards viram punch-cards de papel vintage com `#01`, sprockets, rodapé `COL:80 · ROW:12`. Escuro: fósforo verde, sem janela do MSN.

- [ ] **Step 6: Commit**

```bash
rtk git add src/styles/global.css src/components/ProjectCard.astro
rtk git commit -m "feat(projects): estilos punch-card e remocao do chrome MSN"
```

---

## WAVE D — Seções restantes + acabamento

### Task D1: Migrar hexes neon dos componentes restantes

**Files:**
- Modify: `src/components/ContactSection.astro`, `AboutSection.astro`, `TimelineSection.astro`, `TimelineEntry.astro`, `Footer.astro`, `NavBar.astro`, `StatCard.astro`, `SectionTitle.astro`, `CaseStudyContent.astro`

**Interfaces:**
- Consumes: tabela de paleta canônica (Global Constraints).
- Produces: componentes sem roxo/rosa/ciano hardcoded.

- [ ] **Step 1: Para cada arquivo, listar as ocorrências**

Run: `rtk grep "162, 119, 255|a277ff|b794ff|f694ff|246, 148, 255|82e2ff|130, 226, 255|194, 112, 62|9a5b32" src/components/ContactSection.astro src/components/AboutSection.astro src/components/TimelineSection.astro src/components/TimelineEntry.astro src/components/Footer.astro src/components/NavBar.astro src/components/StatCard.astro src/components/SectionTitle.astro src/components/CaseStudyContent.astro`
Expected: lista das linhas a migrar (~30 no total).

- [ ] **Step 2: Migrar cada ocorrência conforme a tabela**

Aplicar por arquivo (usar Edit, uma ocorrência por vez):
- `#a277ff` / `rgba(162, 119, 255, X)` → `#61ffca` / `rgba(97, 255, 202, X)`
- `#b794ff` → `#7dffb0`
- `#f694ff` / `rgba(246, 148, 255, X)` → `#ff3e3e` / `rgba(255, 62, 62, X)`
- `#82e2ff` / `rgba(130, 226, 255, X)` → `#61ffca` / `rgba(97, 255, 202, X)`
- `rgba(194, 112, 62, X)` / `#9a5b32` → `rgba(143, 45, 36, X)` / `#8f2d24`
- `#61ffca` / `#54c59f` → manter.

- [ ] **Step 3: Verificar ausência total de neon roxo/rosa/ciano no src**

Run: `rtk grep "162, 119, 255|a277ff|b794ff|f694ff|246, 148, 255|82e2ff|130, 226, 255" src`
Expected: **nenhum resultado**.

- [ ] **Step 4: Build + visual**

Run: `pnpm build`
Expected: sem erros. Percorrer todas as seções nos dois modos — sem roxo/rosa remanescente.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components
rtk git commit -m "refactor(theme): migra hexes neon restantes p/ verde/revolta/oxblood"
```

---

### Task D2: Carimbos + blueprint nas seções (About, Timeline, Contact)

**Files:**
- Modify: `src/components/AboutSection.astro`, `TimelineSection.astro`, `ContactSection.astro`

**Interfaces:**
- Consumes: `.ink-stamp`, `.blueprint-wrap` (A4).

- [ ] **Step 1: Envolver cada `<section>` com `blueprint-wrap`**

Em cada um dos três componentes, adicionar a classe `blueprint-wrap` ao elemento `<section>` de topo (grid milimetrado sutil de fundo). Verificar que o conteúdo fica em `position: relative`/`z-index` acima do `::before` (o `::before` é `pointer-events:none`, então não precisa alterar z-index do conteúdo, mas confirmar visualmente).

- [ ] **Step 2: Adicionar um `ink-stamp` no cabeçalho de About e Timeline**

Em `AboutSection.astro`, próximo ao título da seção, inserir:
```astro
<span class="ink-stamp" style="font-size:0.625rem">DOSSIÊ</span>
```
Em `TimelineSection.astro`, próximo ao título:
```astro
<span class="ink-stamp" style="font-size:0.625rem">LOG</span>
```

- [ ] **Step 3: Build + visual**

Run: `pnpm build`
Expected: sem erros. Fundo com grid sutil; carimbos aparecem (rotacionados/oxblood no claro, verde fósforo no escuro).

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/AboutSection.astro src/components/TimelineSection.astro src/components/ContactSection.astro
rtk git commit -m "feat(sections): blueprint de fundo e ink-stamps"
```

---

### Task D3: Contato — CTA revolta + carimbo de status

**Files:**
- Modify: `src/components/ContactSection.astro`
- Modify: `src/i18n/pt-br.json`, `en.json`, `es.json` (chave `contact.stamp`)

**Interfaces:**
- Consumes: `.ink-stamp`, `--color-revolt`, `--font-punk`.
- Produces: chave `contact.stamp`.

- [ ] **Step 1: Adicionar chave `contact.stamp`**

`pt-br.json` (objeto `contact`): `"stamp": "SEM CLT"`. `en.json`: `"stamp": "OPEN TO WORK"`. `es.json`: `"stamp": "SIN JEFE"`.

> Sinalizar na revisão: o texto do carimbo é editorial; o usuário pode querer outro (ex.: "DISPONÍVEL").

- [ ] **Step 2: Inserir carimbo perto do CTA e reforçar cor revolta no escuro**

No markup, adicionar antes do título/CTA:
```astro
<span class="ink-stamp contact-stamp">{t('contact.stamp', locale)}</span>
```
No `<style>` do componente, garantir que o CTA (`.contact-cta` ou equivalente) no escuro use Permanent Marker + revolta:
```css
  .dark .contact-cta {
    font-family: var(--font-punk);
    color: var(--color-revolt);
  }
```
(Ajustar o seletor ao nome real usado no ContactSection após lê-lo.)

- [ ] **Step 3: Build + visual**

Run: `pnpm build`
Expected: sem erros. Contato tem carimbo; CTA no escuro em Permanent Marker vermelho-revolta.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/ContactSection.astro src/i18n/pt-br.json src/i18n/en.json src/i18n/es.json
rtk git commit -m "feat(contact): carimbo de status e CTA revolta"
```

---

### Task D4: Varredura final + verificação end-to-end

**Files:**
- Verify only (sem edições esperadas, corrigir o que aparecer)

**Interfaces:**
- Consumes: tudo.

- [ ] **Step 1: Varredura global por neon órfão e MSN**

Run: `rtk grep "162, 119, 255|a277ff|b794ff|f694ff|246, 148, 255|82e2ff|130, 226, 255|punk-msn|system-ticker|ticker-track" src`
Expected: **nenhum resultado**. Se aparecer algo, corrigir conforme a tabela e recommitar.

- [ ] **Step 2: Build de produção**

Run: `pnpm build`
Expected: build conclui sem erros nem warnings novos.

- [ ] **Step 3: Verificação visual completa (claro e escuro, desktop e mobile)**

Rodar `pnpm dev`. Conferir nas 3 rotas (`/`, `/en`, `/es`), nos dois temas:
- Claro = mesa de engenharia (papel, blueprint, oxblood, carimbos, mono nos detalhes).
- Escuro = terminal CRT verde (fósforo, cursor, punch-cards, glitch, ≤2 stickers, revolta nos CTAs), **sem roxo/rosa**, **sem chrome MSN**, **sem ticker**.
- `prefers-reduced-motion`: animações desligadas. Redimensionar p/ mobile: sem overflow horizontal.
Expected: todos os critérios de sucesso do spec atendidos.

- [ ] **Step 4: Commit final (se houve correções)**

```bash
rtk git add -A
rtk git commit -m "chore(theme): varredura final do redesign engenharia/terminal"
```

---

## Self-Review (preenchido)

**Cobertura do spec:**
- Sistema de cores claro → A1; escuro → A2/A3. ✅
- Tipografia (mono no dark) → A3. ✅
- Utilitários (punch-card, ink-stamp, blueprint, CRT) → A4. ✅
- Aposentar neon roxo/rosa → A5 (global), B3 (hero), C2 (projetos), D1 (restante), D4 (varredura). ✅
- Hero engenharia/terminal → B2/B3. ✅
- Cards punch-card + remover MSN → C1/C2. ✅
- Ink-stamps + blueprint nas seções → D2; contato revolta → D3. ✅
- Stickers reduzidos a 1–2 → B3. ✅
- Ticker fora → nunca adicionado; verificado em D4. ✅
- i18n / reduced-motion / contrast / flicker preservados → constraints + A2/A4/B1/D4. ✅

**Placeholders:** nenhum "TBD/TODO"; toda etapa tem código ou comando concreto. Duas notas editoriais (escolha de stickers em B3, texto do carimbo em D3) são decisões do usuário sinalizadas para revisão — não são lacunas técnicas.

**Consistência de nomes:** classes `.punch-hole`, `.card-edge-holes`, `.vintage-card`, `.ink-stamp`, `.blueprint-wrap`, `.crt-glow`, `.terminal-cursor` definidas em A4 e consumidas com os mesmos nomes em B/C/D. Tokens `--color-revolt`/`--color-ink-blue` definidos em A1/A2 e mapeados em A3. `.pc-head`/`.pc-foot`/`.pc-sprockets` definidos em C1 (markup) e estilizados em C2.
