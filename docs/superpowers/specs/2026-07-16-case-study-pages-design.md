# Design: Páginas de Case Study (SEO-first)

**Data:** 2026-07-16
**Status:** Aprovado para planejamento

## Objetivo

Transformar os case studies (hoje um `<details>` inline no card de projeto) em **páginas
dedicadas**, uma por projeto/contribuição, onde o João pode escrever a fundo sobre a
tecnologia. Prioridade explícita do usuário: **SEO máximo**. Recriar, em Astro, o padrão de
página de detalhe do design de referência (zip) com a estética "mesa de engenharia ×
terminal CRT" já implementada.

## Decisões (travadas com o usuário)

1. **Formato do conteúdo:** Markdown por projeto e idioma (content collection). Renderizado
   para HTML estático no build — ótimo para SEO. Texto técnico livre (headings, listas,
   código).
2. **URLs:** semânticas e localizadas (melhor SEO):
   - pt-br: `/projeto/[slug]`, `/contribuicao/[slug]`
   - en: `/en/project/[slug]`, `/en/contribution/[slug]`
   - es: `/es/proyecto/[slug]`, `/es/contribucion/[slug]`
3. **Card:** mantém resumo curto inline + adiciona link "Ler case study →" para a página.
4. **Seed:** semear os arquivos .md com o conteúdo atual (problem/decision/result); o usuário
   aprofunda depois.

## Modelo de conteúdo

### Fonte de metadados de card: `projects.json` (inalterado como fonte)
Já contém: `id` (=slug), `type` (project|contribution), `title`, `description` (resumo curto),
`techStack`, `startDate`, `links` (github/demo), `isFeatured`. Continua sendo a fonte de:
título, tipo, stack, links, resumo curto do card.

### Nova content collection: `caseStudies`
- Localização: `src/content/caseStudies/`
- Um arquivo por projeto × idioma: `<slug>.<locale>.md` (ex.: `adg.pt-br.md`, `adg.en.md`,
  `adg.es.md`). 6 projetos × 3 idiomas = 18 arquivos.
- **Frontmatter (schema Zod):**
  - `slug: string` — casa com `projects.json` id
  - `locale: 'pt-br' | 'en' | 'es'`
  - `title: string` — título da página (pode = título do projeto)
  - `summary: string` — 1–2 frases; vira `meta description` e o tagline do cabeçalho
  - `seoTitle?: string` — override do `<title>` (default: `title` + sufixo do site)
  - `highlights?: { label: string; value: string }[]` — cards de destaque (stats)
  - `meta?: { label: string; value: string }[]` — faixa de metadados (ex.: "PAPEL",
    "PERÍODO", "STATUS")
  - `ogImage?: string` — imagem OG opcional
- **Corpo (Markdown):** o texto técnico livre. Seed inicial estruturado em seções
  (`## O Problema`, `## A Solução`, `## O Que Eu Fiz`) a partir de
  problem/decision/result atuais.

> Schema em `src/content.config.ts`: novo `defineCollection` com `loader glob('*.md')` e
> `type: 'content'` (ou `glob` + `render`). Usar `z` para o frontmatter acima.

## Rotas (Astro, estáticas via getStaticPaths)

Arquivos de rota (thin — delegam a um componente `CaseStudyPage.astro`):
- `src/pages/projeto/[slug].astro` (pt-br, type=project)
- `src/pages/contribuicao/[slug].astro` (pt-br, type=contribution)
- `src/pages/en/project/[slug].astro`, `src/pages/en/contribution/[slug].astro`
- `src/pages/es/proyecto/[slug].astro`, `src/pages/es/contribucion/[slug].astro`

Cada um: `getStaticPaths` filtra `projects.json` pelo `type` correspondente e gera um path por
slug; carrega o `.md` de `caseStudies` para aquele `slug`+`locale`; passa tudo ao componente.
Se um `.md` não existir para um slug/locale, faz fallback para pt-br (ou 404 controlado).

> Alternativa considerada e descartada: rota única `/case/[slug]` (mais simples, 3 arquivos),
> mas perde a URL semântica projeto/contribuição — pior para SEO. Rejeitada por causa da
> prioridade de SEO.

## Componentes

- **`src/components/CaseStudyPage.astro`** — layout da página de detalhe:
  - `<SEOHead>` com title/description/canonical/OG/Twitter/hreflang/JSON-LD (ver SEO).
  - Link "VOLTAR" (localizado) para a home + âncora `#projetos`.
  - Cabeçalho punch-card: fileira de furos, `#<num>`, eyebrow mono (`> CASE_STUDY`),
    título (com `crt-glow`/`crt-glitch` no dark), carimbo `.project-type-stamp` (PROJETO/
    CONTRIB), `summary`, chips de `techStack`, botões CÓDIGO (github) / DEMO (demo).
  - Faixa de `meta` (grid mono) se houver.
  - Corpo: `<Content />` (Markdown renderizado) dentro de um `.case-body` estilizado
    (usa `.vintage-card`/blueprint conforme a estética).
  - `highlights` como cards de stat (se houver).
  - `<Footer>`.
- **Estilos:** adicionar bloco `.case-*` em `src/styles/global.css` (segue tokens; claro =
  papel/oxblood, escuro = fósforo/revolta). Reusa `.punch-hole`, `.card-edge-holes`,
  `.vintage-card`, `.ink-stamp`, `.crt-glow`, `.blueprint-wrap`.

## Ajustes no card de projeto

- `ProjectCard.astro`: manter o resumo (`description`) e o `<details>` atual **encurtado**
  OU manter o expander e **adicionar** um link "Ler case study →" para a URL localizada.
  Decisão do usuário: manter resumo inline + link "Ler mais".
  - Implementação: manter a descrição curta visível; o `<details>` "Case Study" continua
    (preview do problem/decision/result curtos) **e** abaixo dele um link
    `Ler case study →` para `caseStudyUrl(type, slug, locale)`.
  - Helper `caseStudyUrl(type, slug, locale)` em `src/i18n/utils` ou `src/utils/constants`:
    mapeia (type, locale) → segmento de path localizado + slug.
- `ProjectsSection.astro`: passar `slug`/`locale` ao card para montar o link.

## SEO (requisito central)

Cada página de case study deve ter:
1. `<title>` único (do `seoTitle`/`title`) + sufixo do site.
2. `<meta name="description">` do `summary`.
3. `<link rel="canonical">` para a URL da página no idioma atual.
4. `<link rel="alternate" hreflang="pt-br|en|es">` para as 3 versões + `x-default`.
5. Open Graph (`og:title`, `og:description`, `og:type=article`, `og:url`, `og:image`) e
   Twitter Card.
6. JSON-LD `CreativeWork`/`Article` (headline, description, author=João Bernardo, inLanguage,
   url, keywords=techStack).
7. Inclusão automática no `sitemap` (`@astrojs/sitemap` já configurado — rotas estáticas
   entram sozinhas).
8. HTML semântico: um `<h1>` (título), `<h2>` nas seções do corpo, `<time>` na data.

> Estender `SEOHead.astro` (ou criar variante) para aceitar canonical/hreflang/JSON-LD
> por página, sem quebrar o uso atual na home.

## i18n

- Novas chaves em `pt-br/en/es.json` (namespace `caseStudy` já existe — estender):
  `back` ("VOLTAR"), `readMore` ("Ler case study →"), `eyebrow` ("> CASE_STUDY"),
  `code` ("CÓDIGO"), `liveDemo` ("DEMO"), rótulos default de meta se necessário.
- `caseStudyUrl(type, slug, locale)` centraliza os segmentos localizados
  (project→projeto/project/proyecto; contribution→contribuicao/contribution/contribucion).

## Escopo / seed

- Gerar os 18 `.md` (6 projetos × 3 idiomas) a partir do `caseStudy` atual de cada projeto,
  estruturados em `## O Problema` / `## A Solução` / `## O Que Eu Fiz`, com `summary` =
  `description` atual. Highlights iniciais opcionais (ex.: ADG: "0" custo, "2" réplicas;
  Ribeirão Noir: "3" doutores, "6" meses) — poucos, o usuário ajusta.
- Projetos: instanta, adg, alethe, ribeirao-noir, rpjs-community, portfolio-jb.

## Fora de escopo

- Escrever o conteúdo técnico profundo final (é do usuário; entregamos o seed).
- MDX/componentes dentro do Markdown (Markdown puro basta; MDX pode vir depois).
- Comentários, busca, paginação de cases.

## Critérios de sucesso

1. Cada projeto tem página em pt-br/en/es nas URLs semânticas localizadas; build estático.
2. Cada página tem title/description/canonical/hreflang/OG/JSON-LD corretos; entra no sitemap.
3. Card mostra resumo + link "Ler case study →" que leva à página certa no idioma atual.
4. Estética consistente (claro mesa-de-engenharia / escuro terminal) e acessível
   (`prefers-reduced-motion`, headings semânticos, foco visível).
5. `pnpm build` passa; sem links quebrados (todas as rotas geradas resolvem).
6. i18n intacto; fallback de idioma se um .md faltar.
