# Design: "Mesa de Engenharia × Terminal Punk"

**Data:** 2026-07-16
**Autor:** João Bernardo (com Claude)
**Status:** Aprovado para planejamento

## Objetivo

Mesclar as ideias visuais de um design de referência (um projeto Next.js + shadcn com
estética retrô-computação, entregue como zip) ao portfólio existente (Astro + Preact +
Tailwind v4), aumentando autenticidade e coesão visual — **sem** portar o código React.
As ideias são recriadas em Astro/CSS.

O design de referência traz duas personalidades:
- **Claro** = mesa de engenharia (papel manila, grid blueprint, carimbos de tinta oxblood, mono).
- **Escuro** = terminal CRT fosforado (verde ácido, vermelho revolta, scanlines, cursor).

O portfólio atual já tem "duas personalidades" (claro profissional / escuro punk pop-art
neon). Este design **funde** as duas fontes mantendo a espinha punk do usuário.

## Decisões de direção (travadas com o usuário)

1. **Direção geral:** modo claro vira "mesa de engenharia"; modo escuro vira híbrido
   "punk-CRT" (funde os dois modos escuros).
2. **Tipografia:** mono só no escuro (é um terminal); Inter no corpo do claro.
3. **Fusão do escuro:** verde-terminal CRT como **base**; punk como "revolta" (vermelho
   nos CTAs/destaques). O roxo/rosa neon (`#a277ff`, `#f694ff`) **se aposenta**. Glitch
   permanece. Chrome do MSN vira chrome de terminal.
4. **Elementos do zip a incorporar:** TODOS os quatro grupos — punch-cards, ink-stamps,
   grid blueprint + textura de papel, e o pacote CRT completo (cursor, boot text, glow,
   scanlines reforçadas, paper-tape).
5. **Destaque no claro:** vermelho **oxblood** como acento principal (substitui o marrom
   `#9a5b32`).
6. **Stickers:** reduzir para **1–2 principais** (proposta: Angela Davis + punho operário),
   recolorindo o entorno para assentar no CRT verde. O restante sai.
7. **Ticker/marquee:** **NÃO** entra (era o elemento que o usuário odiava). O
   `system-ticker` do zip é explicitamente excluído.

## Sistema de cores

Os tokens ficam em `src/styles/global.css` nas classes `.light` / `.dark` e são mapeados
para utilitários via `@theme`. A migração precisa também trocar hexes hardcoded em
componentes (ex.: `rgba(162,119,255,…)` no `ProjectCard.astro`, `HeroSection.astro`, etc.).

### Claro — mesa de engenharia
- `--color-bg-primary`: papel manila / creme frio (aprox. `oklch(0.94 0.012 95)`)
- `--color-bg-secondary`: papel de card mais claro (`oklch(0.965 0.01 95)`)
- `--color-text-primary`: tinta quase-preta com leve azul (`oklch(0.22 0.01 260)`)
- `--color-text-secondary`: cinza-tinta (`oklch(0.46 0.02 260)`)
- `--color-accent` (**principal**): **oxblood** carimbo (`oklch(0.47 0.19 27)`)
- Secundário técnico: **azul-blueprint** (`oklch(0.45 0.13 250)`) — novo token `--color-ink-blue`
- Radius: cantos retos (~2px)
- Sombras: suaves de papel (mantém `--shadow-sm/md` atuais, levemente ajustadas)

### Escuro — terminal CRT punk
- `--color-bg-primary`: preto-esverdeado (`oklch(0.12 0.015 155)`)
- `--color-bg-secondary`: card (`oklch(0.15 0.018 155)`)
- `--color-text-primary`: verde fósforo (`oklch(0.88 0.19 142)`)
- `--color-text-secondary`: verde apagado (`oklch(0.64 0.12 140)`)
- `--color-accent` / primário: verde ácido (`oklch(0.87 0.2 140)`)
- **CTA/destaque/revolta:** vermelho (`oklch(0.63 0.25 25)`) — token `--color-revolt`
- Aposentar: roxo `#a277ff`, rosa `#f694ff`, ciano/roxo neon antigos.

**Acessibilidade:** manter os blocos `prefers-contrast: high` (valores de fósforo mais
brilhantes) e `prefers-reduced-motion: reduce` (desliga scanlines/glitch/cursor/wobble).

## Tipografia

- **Claro:** Inter (corpo) + JetBrains Mono (labels, stats, stamps, código, metadados).
- **Escuro:** JetBrains Mono em tudo (o site vira "terminal"); Permanent Marker nos toques
  punk (títulos de seção, CTA de contato, labels de sticker).
- **Sem baixar IBM Plex Mono** — reusar JetBrains Mono (já self-hosted) para manter o peso
  da página. A vibe mono é preservada.
- Adicionar variável `--font-mono` já existente ao corpo apenas quando `.dark` estiver
  ativo (não trocar a fonte do corpo no claro).

## Componentes / utilitários

### Utilitários novos em `global.css` (portados do zip, adaptados aos tokens)
- `.punch-card-holes`, `.punch-hole`, `.card-edge-holes` — padrão de furos.
- `.vintage-card` (+ `::before`/`::after`) — textura de papel gasto (claro) / fósforo (escuro).
- `.ink-stamp` — selo rotacionado oxblood; no escuro brilha em fósforo (sem rotação).
- `.blueprint-wrap::before` — grid milimetrado sutil (claro) / grid fósforo (escuro).
- `.crt-glow`, `.crt-scanlines` (reforçar as existentes), `.terminal-cursor`,
  `.crt-glitch` (já existe glitch — unificar), `.paper-tape`.
- `.redacted` — barra censurada que revela no hover (zine).

### Hero (`HeroSection.astro`)
- Card com `card-edge-holes` + `blueprint-wrap`.
- Fileira de `punch-hole` + `ink-stamp` de status (`DISPONÍVEL P/ PROJETOS`).
- Linha de boot mono: `> SISTEMA_ONLINE — READY` (i18n).
- `<h1>` com `crt-glitch` (dark) sobre o nome.
- Cargo com `terminal-cursor` (dark).
- Grid de stats em mono com bordas.
- Stickers: manter só 1–2 no dark, reposicionados.

### Cards de projeto (`ProjectCard.astro`)
- Substituir o **chrome do MSN** por cabeçalho/rodapé de **punch-card**:
  sprocket holes, título, `#001`, rodapé `COL: 80 · ROW: 12 · > IBM_FORMAT`.
- Claro = `vintage-card` (papel gasto); escuro = fósforo verde.
- Manter `<details>` do case study, links, tech badges, i18n.
- Remover hexes roxos hardcoded; usar tokens (`--color-accent`, `--color-revolt`).
- `ゴゴゴ`/`gogo` menacing: manter mas recolorir para verde/vermelho.

### Demais seções (About / Timeline / Contact)
- Aplicar `blueprint-wrap` de fundo, `ink-stamp` em títulos-chave, labels mono.
- Contato: CTA em Permanent Marker (dark) com cor revolta; carimbo de status.
- Timeline: entradas com estética de "log"/paper-tape opcional.

### Fora de escopo
- `system-ticker` (marquee) — **não** implementar.
- Portar componentes shadcn/React do zip.
- Refatorações não relacionadas.

## Rollout (ondas de revisão)

- **Onda A — Base:** tokens de cor (claro+escuro), fonte mono no dark, utilitários novos
  em `global.css`, aposentar hexes neon globais. Sem quebrar layout.
- **Onda B — Hero:** transformar `HeroSection.astro`.
- **Onda C — Projetos:** transformar `ProjectCard.astro` em punch-card.
- **Onda D — Seções restantes:** About/Timeline/Contact + carimbos/blueprint + enxugar
  stickers.

Cada onda é revisável isoladamente e deixa o site funcional.

## Critérios de sucesso

1. Modo claro tem identidade "mesa de engenharia" clara (papel, blueprint, carimbo, mono nos detalhes).
2. Modo escuro é um terminal CRT verde coeso, com punk como acento (vermelho/stickers/glitch), sem roxo/rosa neon remanescente.
3. Cards de projeto são punch-cards; o chrome do MSN não existe mais.
4. Não há ticker/marquee.
5. i18n (pt-br/en/es), `prefers-reduced-motion`, `prefers-contrast` e prevenção de flicker continuam funcionando.
6. Build (`pnpm build`) passa; sem regressões de layout perceptíveis em mobile/desktop.

## Riscos / notas

- Paleta hardcoded espalhada em componentes → risco de sobra de roxo. Mitigar com um grep
  final por `162, 119, 255` / `#a277ff` / `#f694ff` / `#61ffca` e migração para tokens.
- Full-mono no dark pode reduzir legibilidade de textos longos → manter tamanho/entrelinha
  confortáveis; JetBrains Mono é legível.
- Contraste: verde fósforo sobre preto e vermelho-revolta precisam passar em AA; validar.
