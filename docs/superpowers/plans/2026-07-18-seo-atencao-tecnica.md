# SEO + Atenção Técnica — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer jbnado.dev dominar as buscas por "jbnado" e "João Bernardo" + qualificadores (dev, fullstack, Ribeirão Preto), rankear em long-tail técnico via case studies, e adicionar detalhes que chamam atenção de devs e recrutadores técnicos.

**Architecture:** Site estático Astro 5 + Preact islands + Tailwind v4, deploy na Vercel. As melhorias são incrementais: primeiro shipa o redesign que já existe local (maior alavanca — produção está meses atrasada), depois enriquece SEO on-page (JSON-LD, sitemap, títulos), depois adiciona dev-bait (RSS, llms.txt, console easter egg, view transitions).

**Tech Stack:** Astro 5.17, @astrojs/sitemap, @astrojs/rss (novo), Preact 10, Tailwind CSS 4, pnpm, Vercel.

## Contexto para quem nunca viu este repo

- **Working dir:** `C:\Users\bernardo\Projetos\portfolio-jb` (Windows 11; shell PowerShell, mas o Bash tool funciona).
- **i18n:** pt-br é o locale default (sem prefixo de URL); en e es têm prefixo (`/en/`, `/es/`). Strings em `src/i18n/{pt-br,en,es}.json`, helper `t(key, locale)` em `src/i18n/utils.ts`.
- **Conteúdo:** `src/content/projects/projects.json` (cards) + `src/content/caseStudies/<slug>.<locale>.md` (18 arquivos, 6 slugs × 3 locales). Collections definidas em `src/content.config.ts`.
- **Rotas de case study:** 6 arquivos quase idênticos: `src/pages/projeto/[slug].astro`, `src/pages/contribuicao/[slug].astro`, `src/pages/en/project/[slug].astro`, `src/pages/en/contribution/[slug].astro`, `src/pages/es/proyecto/[slug].astro`, `src/pages/es/contribucion/[slug].astro`. Cada um define constantes `TYPE` e `LOCALE` no topo.
- **SEO atual:** `src/components/SEOHead.astro` (canonical, hreflang, OG, Twitter, JSON-LD) renderizado por `src/layouts/BaseLayout.astro`.
- **Build:** `rtk pnpm build`. O adapter Vercel emite o site estático em `.vercel/output/static/`. Se esse diretório não existir após o build, procure em `dist/`.
- **Situação em produção (2026-07-18):** jbnado.dev está rodando um build ANTIGO (design com MSN messenger, 3 projetos, sitemap com só 3 URLs). O repo local está 36 commits à frente de origin/main com o redesign completo e 18 páginas de case study que NUNCA foram deployadas. jbnado.dev já é #1 no Google para "jbnado", mas com título/descrição desatualizados no índice; para "João Bernardo fullstack Ribeirão Preto" o site nem aparece (só o LinkedIn).

## Global Constraints

- Prefixe TODO comando de terminal com `rtk` (ex.: `rtk git status`, `rtk pnpm build`). Vale dentro de cadeias com `&&`.
- Package manager é `pnpm` (via `rtk pnpm ...`). Nunca npm ou yarn.
- NUNCA comite `portfolio-joao-bernardo.zip` (Task 1 o adiciona ao .gitignore).
- Não invente fatos biográficos: nenhum dado sobre João que não esteja neste repo (nada de anos de experiência diferentes, empresas, prêmios, nome completo — o nome público é "João Bernardo", handles "jbnado"/"Jbnado").
- Não altere a estética (tokens de cor, fontes, animações, stickers). Este plano só adiciona; não redesenha.
- Não exponha o e-mail em texto plano em HTML/JSON-LD — o site ofusca o e-mail de propósito (montagem via JS em `ContactSection.astro`).
- Texto pt-br novo: tom direto, sem clichês de IA ("não é X, é Y", excesso de travessões), sem falsas "lições aprendidas".
- Títulos de página ≤ 65 caracteres antes do sufixo "— João Bernardo".
- Commits: conventional commits em português, como o histórico (`feat(seo): ...`, `chore: ...`).
- Após CADA task: `rtk pnpm build` precisa passar antes do commit.

---

### Task 1: Higiene do repo + deploy do redesign (maior alavanca de SEO)

O que está em produção é um site de fevereiro. Tudo que as outras tasks fazem só importa depois deste push.

**Files:**
- Modify: `.gitignore` (raiz do repo)
- Commit: `src/content/caseStudies/instanta.{pt-br,en,es}.md`, `src/content/caseStudies/portfolio-jb.pt-br.md`, `src/content/projects/projects.json` (já modificados no working tree — são expansões de conteúdo dos cases, prontas para commit)

**Interfaces:**
- Produces: produção em jbnado.dev com o redesign + 21 URLs no sitemap (3 homes + 18 case studies). Todas as tasks seguintes assumem esse baseline.

- [ ] **Step 1: Ignorar o zip solto**

Adicione ao final do `.gitignore`:

```gitignore
# exports locais
portfolio-joao-bernardo.zip
```

- [ ] **Step 2: Verificar que o build passa com o working tree atual**

Run: `rtk pnpm build`
Expected: build conclui sem erro (Astro lista as páginas geradas; nenhum "error" no output).

- [ ] **Step 3: Comitar conteúdo pendente + gitignore**

```bash
rtk git add src/content .gitignore
rtk git commit -m "feat(case): expande cases do Instanta e do portfolio (pt-br) + ignora zip local"
```

- [ ] **Step 4: Push (dispara deploy na Vercel)**

```bash
rtk git push
```

Expected: push aceito; origin/main atualizado (estava 36 commits atrás).

- [ ] **Step 5: Verificar produção (aguarde ~2 min pelo deploy)**

Busque `https://jbnado.dev/sitemap-0.xml` (WebFetch ou `rtk curl https://jbnado.dev/sitemap-0.xml`).
Expected: o sitemap agora lista ~21 URLs, incluindo `https://jbnado.dev/projeto/instanta` e `https://jbnado.dev/en/project/instanta`. Se ainda mostrar só 3 URLs, aguarde mais um pouco e tente de novo (deploy da Vercel leva 1-3 min).

---

### Task 2: Título e description com a marca "jbnado"

O Google já ranqueia jbnado.dev como #1 para "jbnado", mas o `<title>` não contém o handle — colocar "jbnado" no título e na description amarra o handle ao nome e melhora o snippet nos resultados. Também adiciona "Ribeirão Preto" à description (query regional na qual o site hoje não aparece).

**Files:**
- Modify: `src/i18n/pt-br.json` (bloco `"seo"`)
- Modify: `src/i18n/en.json` (bloco `"seo"`)
- Modify: `src/i18n/es.json` (bloco `"seo"`)

**Interfaces:**
- Produces: `t('seo.title', locale)` e `t('seo.description', locale)` com os novos textos — consumidos por `SEOHead.astro` sem mudança de código.

- [ ] **Step 1: Substituir o bloco `"seo"` em `src/i18n/pt-br.json`**

```json
"seo": {
  "title": "João Bernardo (jbnado) — Fullstack Developer",
  "description": "Portfolio de João Bernardo (jbnado), fullstack developer em Ribeirão Preto — React, Node.js, TypeScript, Java, AWS. Case studies reais: edge computing, infra self-hosted, jogos e open source."
}
```

- [ ] **Step 2: Substituir o bloco `"seo"` em `src/i18n/en.json`**

```json
"seo": {
  "title": "João Bernardo (jbnado) — Fullstack Developer",
  "description": "Portfolio of João Bernardo (jbnado), fullstack developer in Ribeirão Preto, Brazil — React, Node.js, TypeScript, Java, AWS. Real case studies: edge computing, self-hosted infra, games and open source."
}
```

- [ ] **Step 3: Substituir o bloco `"seo"` em `src/i18n/es.json`**

```json
"seo": {
  "title": "João Bernardo (jbnado) — Fullstack Developer",
  "description": "Portfolio de João Bernardo (jbnado), fullstack developer en Ribeirão Preto, Brasil — React, Node.js, TypeScript, Java, AWS. Case studies reales: edge computing, infra self-hosted, juegos y open source."
}
```

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "jbnado) — Fullstack" .vercel/output/static/index.html`
Expected: pelo menos 1 match (no `<title>` e nos og:title). Se `.vercel/output/static/` não existir, use `dist/index.html`.

- [ ] **Step 5: Commit**

```bash
rtk git add src/i18n
rtk git commit -m "feat(seo): título e description com a marca jbnado nos 3 idiomas"
```

---

### Task 3: JSON-LD rico — Person completo + ProfilePage nas homes

O JSON-LD atual é um Person de 6 linhas. Um Person com `alternateName` (jbnado), localização, `knowsAbout` e `alumniOf`, mais `ProfilePage` nas homes, é o que faz o Google montar knowledge panel / rich snippet para buscas de nome.

**Files:**
- Create: `src/utils/jsonld.ts`
- Modify: `src/components/SEOHead.astro` (linhas 46-56, o `defaultPersonJsonLd`)
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/es/index.astro`

**Interfaces:**
- Produces: `personNode(locale)`, `personJsonLd(locale)`, `profilePageJsonLd(locale)`, `caseStudyJsonLd(opts)` exportados de `src/utils/jsonld.ts`. A Task 4 consome `caseStudyJsonLd`. Assinaturas exatas no Step 1.

- [ ] **Step 1: Criar `src/utils/jsonld.ts`**

```ts
import { SITE_URL } from './constants';

const JOB_TITLES: Record<string, string> = {
  'pt-br': 'Desenvolvedor Fullstack',
  en: 'Fullstack Developer',
  es: 'Desarrollador Fullstack',
};

const LANG_TAGS: Record<string, string> = {
  'pt-br': 'pt-BR',
  en: 'en',
  es: 'es',
};

const HOME_URLS: Record<string, string> = {
  'pt-br': `${SITE_URL}/`,
  en: `${SITE_URL}/en/`,
  es: `${SITE_URL}/es/`,
};

/** Nó Person compartilhado (sem @context — para embutir dentro de outros nós). */
export function personNode(locale: string = 'pt-br') {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'João Bernardo',
    alternateName: ['jbnado', 'Jbnado'],
    jobTitle: JOB_TITLES[locale] ?? JOB_TITLES['pt-br'],
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ribeirão Preto',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'FATEC Ribeirão Preto' },
    knowsAbout: [
      'React', 'Node.js', 'TypeScript', 'Java', 'Python', 'AWS',
      'Docker', 'Cloudflare Workers', 'Rust', 'Astro', 'Godot',
    ],
    sameAs: [
      'https://linkedin.com/in/jbnado',
      'https://github.com/Jbnado',
    ],
  };
}

/** JSON-LD standalone de Person (fallback para páginas sem nó principal próprio). */
export function personJsonLd(locale: string = 'pt-br') {
  return { '@context': 'https://schema.org', ...personNode(locale) };
}

/** ProfilePage para as homes — diz ao Google que esta página É o perfil da pessoa. */
export function profilePageJsonLd(locale: string = 'pt-br') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    inLanguage: LANG_TAGS[locale] ?? 'pt-BR',
    url: HOME_URLS[locale] ?? HOME_URLS['pt-br'],
    mainEntity: personNode(locale),
  };
}

/** TechArticle + BreadcrumbList para páginas de case study (Task 4). */
export function caseStudyJsonLd(opts: {
  title: string;
  summary: string;
  canonical: string;
  locale: string;
  techStack: string[];
  startDate: string;
}) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: opts.title,
      description: opts.summary,
      inLanguage: LANG_TAGS[opts.locale] ?? 'pt-BR',
      url: opts.canonical,
      datePublished: opts.startDate,
      keywords: opts.techStack.join(', '),
      author: personNode(opts.locale),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'João Bernardo',
          item: HOME_URLS[opts.locale] ?? HOME_URLS['pt-br'],
        },
        { '@type': 'ListItem', position: 2, name: opts.title, item: opts.canonical },
      ],
    },
  ];
}
```

- [ ] **Step 2: Usar o novo Person como default no `SEOHead.astro`**

No frontmatter, adicione o import junto aos existentes:

```ts
import { personJsonLd } from '../utils/jsonld';
```

Delete o bloco `const defaultPersonJsonLd = { ... };` inteiro (linhas 46-56 — o objeto com `'@context'`, `name: 'João Bernardo'`, `sameAs`).

Na última linha do arquivo, troque:

```astro
<script type="application/ld+json" set:html={JSON.stringify(jsonLd ?? defaultPersonJsonLd)} />
```

por:

```astro
<script type="application/ld+json" set:html={JSON.stringify(jsonLd ?? personJsonLd(locale))} />
```

- [ ] **Step 3: ProfilePage nas 3 homes**

Em `src/pages/index.astro`, adicione o import e passe o prop (o resto do arquivo fica igual):

```ts
import { profilePageJsonLd } from '../utils/jsonld';
```

```astro
<BaseLayout locale={locale} jsonLd={profilePageJsonLd(locale)}>
```

Em `src/pages/en/index.astro` e `src/pages/es/index.astro`, o mesmo, com import de dois níveis:

```ts
import { profilePageJsonLd } from '../../utils/jsonld';
```

```astro
<BaseLayout locale={locale} jsonLd={profilePageJsonLd(locale)}>
```

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "ProfilePage" .vercel/output/static/index.html` e `rtk grep "alternateName" .vercel/output/static/en/index.html`
Expected: 1 match em cada.

- [ ] **Step 5: Commit**

```bash
rtk git add src/utils/jsonld.ts src/components/SEOHead.astro src/pages/index.astro src/pages/en/index.astro src/pages/es/index.astro
rtk git commit -m "feat(seo): Person rico com alternateName jbnado + ProfilePage nas homes"
```

---

### Task 4: TechArticle + BreadcrumbList nas 6 rotas de case study

Hoje as rotas emitem um `CreativeWork` raso. `TechArticle` com autor completo + `BreadcrumbList` dá elegibilidade a rich results de artigo e breadcrumb no snippet. Também padroniza o `<title>` para sempre terminar com "— João Bernardo" (reforça a query de nome em todas as páginas).

**Files:**
- Modify: `src/pages/projeto/[slug].astro`
- Modify: `src/pages/contribuicao/[slug].astro`
- Modify: `src/pages/en/project/[slug].astro`
- Modify: `src/pages/en/contribution/[slug].astro`
- Modify: `src/pages/es/proyecto/[slug].astro`
- Modify: `src/pages/es/contribucion/[slug].astro`

**Interfaces:**
- Consumes: `caseStudyJsonLd({ title, summary, canonical, locale, techStack, startDate })` de `src/utils/jsonld.ts` (Task 3). Retorna um array de objetos JSON-LD — `JSON.stringify` de array é JSON-LD válido, o `SEOHead` não precisa mudar.

- [ ] **Step 1: Atualizar `src/pages/projeto/[slug].astro`**

No frontmatter, adicione o import:

```ts
import { caseStudyJsonLd } from '../../utils/jsonld';
```

Troque a linha do título:

```ts
const title = entry.data.seoTitle ?? `${entry.data.title} — João Bernardo`;
```

por:

```ts
const title = `${entry.data.seoTitle ?? entry.data.title} — João Bernardo`;
```

Delete o bloco `const jsonLd = { '@context': ..., '@type': 'CreativeWork', ... };` inteiro e substitua por:

```ts
const jsonLd = caseStudyJsonLd({
  title: entry.data.title,
  summary: entry.data.summary,
  canonical,
  locale: LOCALE,
  techStack: item.techStack,
  startDate: item.startDate,
});
```

- [ ] **Step 2: Repetir exatamente o mesmo diff nos outros 5 arquivos**

Cada arquivo já define `TYPE`, `LOCALE`, `canonical` e `item` no próprio frontmatter — o snippet do Step 1 funciona sem alteração. Só o caminho do import muda com a profundidade:

| Arquivo | Import |
|---|---|
| `src/pages/contribuicao/[slug].astro` | `'../../utils/jsonld'` |
| `src/pages/en/project/[slug].astro` | `'../../../utils/jsonld'` |
| `src/pages/en/contribution/[slug].astro` | `'../../../utils/jsonld'` |
| `src/pages/es/proyecto/[slug].astro` | `'../../../utils/jsonld'` |
| `src/pages/es/contribucion/[slug].astro` | `'../../../utils/jsonld'` |

Em todos: mesma troca da linha `const title`, mesma substituição do bloco `const jsonLd`.

- [ ] **Step 3: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "TechArticle" .vercel/output/static/projeto/instanta/index.html` e `rtk grep "BreadcrumbList" .vercel/output/static/en/contribution/adg/index.html`
Expected: 1 match em cada. (Ajuste os paths se o output estiver em `dist/`.)

- [ ] **Step 4: Commit**

```bash
rtk git add src/pages
rtk git commit -m "feat(seo): TechArticle + BreadcrumbList nos case studies e título com sufixo do nome"
```

---

### Task 5: Sitemap com hreflang e lastmod

O sitemap atual é uma lista crua de URLs. Com a opção `i18n` do @astrojs/sitemap, as homes ganham alternates hreflang dentro do próprio sitemap; `lastmod` sinaliza conteúdo fresco e acelera recrawl (importante: o índice do Google está com snapshot de fevereiro).

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Configurar a integração sitemap**

Troque `integrations: [preact(), sitemap()],` por:

```js
integrations: [
  preact(),
  sitemap({
    lastmod: new Date(),
    i18n: {
      defaultLocale: 'pt-br',
      locales: {
        'pt-br': 'pt-BR',
        en: 'en',
        es: 'es',
      },
    },
  }),
],
```

Nota: o pareamento i18n do sitemap agrupa URLs pelo prefixo de locale. Como os case studies usam segmentos traduzidos (`/projeto/` vs `/en/project/`), eles não serão pareados no sitemap — tudo bem, essas páginas já têm hreflang via `<link>` no HTML. As homes serão pareadas.

- [ ] **Step 2: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "lastmod" .vercel/output/static/sitemap-0.xml` e `rtk grep "xhtml" .vercel/output/static/sitemap-0.xml`
Expected: matches em ambos.

- [ ] **Step 3: Commit**

```bash
rtk git add astro.config.mjs
rtk git commit -m "feat(seo): sitemap com lastmod e alternates i18n"
```

---

### Task 6: Head extras — preload de fontes, rel=me, author, ogImage por página

Quatro melhorias pequenas no `BaseLayout`: (1) preload da Sora (fonte do título hero no light — elemento LCP) e da JetBrains Mono (corpo inteiro no dark); (2) `rel="me"` para verificação de identidade bidirecional com GitHub/LinkedIn (IndieWeb — dev-cred e sinal de entidade); (3) meta author; (4) prop `ogImage` repassado ao SEOHead, para os case studies poderem ter OG próprio no futuro (o schema `caseStudies` já tem campo `ogImage` opcional).

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `BaseLayout` aceita prop opcional `ogImage?: string` e o repassa ao `SEOHead` (que já tem esse prop com default `/og-image.png`).

- [ ] **Step 1: Adicionar `ogImage` aos Props do BaseLayout**

Na interface `Props`, adicione:

```ts
ogImage?: string;
```

Na desestruturação `const { ... } = Astro.props;`, adicione `ogImage,` e no `<SEOHead ... />` adicione o atributo `ogImage={ogImage}`.

- [ ] **Step 2: Preloads e metas no `<head>`**

Logo após os dois `<link rel="preload" ...>` existentes (Inter e Permanent Marker), adicione:

```html
<link rel="preload" as="font" href="/fonts/sora-variable.woff2" type="font/woff2" crossorigin />
<link rel="preload" as="font" href="/fonts/jetbrains-mono-variable.woff2" type="font/woff2" crossorigin />
```

Logo após a linha `<meta name="generator" content={Astro.generator} />`, adicione:

```html
<meta name="author" content="João Bernardo" />
<link rel="me" href="https://github.com/Jbnado" />
<link rel="me" href="https://linkedin.com/in/jbnado" />
```

- [ ] **Step 3: Repassar `ogImage` nas 6 rotas de case study**

Em cada um dos 6 arquivos `[slug].astro` (mesma lista da Task 4), adicione ao `<BaseLayout ...>` o atributo:

```astro
ogImage={entry.data.ogImage}
```

(Quando o frontmatter não define `ogImage`, o valor é `undefined` e o SEOHead usa o default `/og-image.png` — comportamento idêntico ao atual.)

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "rel=\"me\"" .vercel/output/static/index.html` e `rtk grep "sora-variable" .vercel/output/static/index.html`
Expected: 2 matches de rel=me, 1 de sora.

- [ ] **Step 5: Commit**

```bash
rtk git add src/layouts/BaseLayout.astro src/pages
rtk git commit -m "feat(seo): preload Sora/JetBrains Mono, rel=me, author e ogImage por página"
```

---

### Task 7: seoTitle rico em keywords nos 18 case studies

Os `<title>` dos cases hoje são só o nome do projeto ("Instanta — João Bernardo"), que ninguém busca. Títulos descrevendo o conteúdo técnico ("App edge-native com Cloudflare Workers, D1, R2...") capturam long-tail de buscas de dev — é assim que o site vira "referência técnica" em busca. A Task 4 já garante o sufixo "— João Bernardo" automático.

**Files:**
- Modify: os 18 arquivos `src/content/caseStudies/<slug>.<locale>.md` (frontmatter apenas)

- [ ] **Step 1: Adicionar `seoTitle` ao frontmatter de cada arquivo**

Em cada arquivo, adicione a linha `seoTitle: "..."` logo abaixo da linha `title: "..."`, com estes valores exatos:

| Slug | Locale | seoTitle |
|---|---|---|
| instanta | pt-br | `App edge-native com Cloudflare Workers, D1, R2 e Durable Objects` |
| instanta | en | `Edge-native app with Cloudflare Workers, D1, R2 and Durable Objects` |
| instanta | es | `App edge-native con Cloudflare Workers, D1, R2 y Durable Objects` |
| adg | pt-br | `Infra self-hosted com Docker Swarm, Traefik e Grafana a custo zero` |
| adg | en | `Self-hosted infra with Docker Swarm, Traefik and Grafana at zero cost` |
| adg | es | `Infra self-hosted con Docker Swarm, Traefik y Grafana a costo cero` |
| alethe | pt-br | `PRs em Tauri + Rust: scroll de TUI, PTY e auto-update` |
| alethe | en | `Tauri + Rust PRs: TUI scroll, PTY lifecycle and auto-update` |
| alethe | es | `PRs en Tauri + Rust: scroll de TUI, PTY y auto-update` |
| ribeirao-noir | pt-br | `Jogo investigativo em Godot 4 com narrativa data-driven` |
| ribeirao-noir | en | `Investigative game in Godot 4 with a data-driven narrative` |
| ribeirao-noir | es | `Juego investigativo en Godot 4 con narrativa data-driven` |
| rpjs-community | pt-br | `RP.js: co-fundando a comunidade JavaScript de Ribeirão Preto` |
| rpjs-community | en | `RP.js: co-founding Ribeirão Preto's JavaScript community` |
| rpjs-community | es | `RP.js: cofundando la comunidad JavaScript de Ribeirão Preto` |
| portfolio-jb | pt-br | `Landing page com Astro, Preact islands e Tailwind CSS 4` |
| portfolio-jb | en | `Landing page with Astro, Preact islands and Tailwind CSS 4` |
| portfolio-jb | es | `Landing page con Astro, Preact islands y Tailwind CSS 4` |

Exemplo (`instanta.pt-br.md`):

```yaml
title: "Instanta"
seoTitle: "App edge-native com Cloudflare Workers, D1, R2 e Durable Objects"
```

- [ ] **Step 2: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "edge-native com Cloudflare" .vercel/output/static/projeto/instanta/index.html`
Expected: match no `<title>` (com o sufixo `— João Bernardo` no final).

- [ ] **Step 3: Commit**

```bash
rtk git add src/content/caseStudies
rtk git commit -m "feat(seo): seoTitle com keywords técnicas nos 18 case studies"
```

---

### Task 8: Completar as traduções en/es do case do portfolio

`portfolio-jb.pt-br.md` foi expandido para ~169 linhas, mas `portfolio-jb.en.md` e `portfolio-jb.es.md` continuam stubs de 18 linhas — as versões en/es publicam uma página rasa e desalinhada da pt-br.

**Files:**
- Modify: `src/content/caseStudies/portfolio-jb.en.md` (reescrever a partir do pt-br)
- Modify: `src/content/caseStudies/portfolio-jb.es.md` (idem)

- [ ] **Step 1: Ler `src/content/caseStudies/portfolio-jb.pt-br.md` inteiro**

- [ ] **Step 2: Reescrever `portfolio-jb.en.md` como tradução fiel do pt-br**

Regras:
- Frontmatter: manter `slug: "portfolio-jb"`, trocar `locale: "en"`; traduzir `title`, `summary`, `seoTitle` (usar o da tabela da Task 7) e os valores de `highlights`/`meta` se existirem no pt-br (labels e values).
- Corpo: traduzir parágrafo a parágrafo. Blocos de código, nomes de arquivos, comandos e termos técnicos ficam como estão.
- Nada de conteúdo novo: se está no pt-br, traduz; se não está, não existe.
- Tom natural em inglês, sem tradução literal de expressões.

- [ ] **Step 3: Reescrever `portfolio-jb.es.md` com as mesmas regras (locale: "es")**

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep -c "<h2" .vercel/output/static/en/project/portfolio-jb/index.html`
Expected: mesmo número de `<h2` que a versão pt-br (`rtk grep -c "<h2" .vercel/output/static/projeto/portfolio-jb/index.html`).

- [ ] **Step 5: Commit**

```bash
rtk git add src/content/caseStudies
rtk git commit -m "feat(case): traduz case expandido do portfolio para en/es"
```

---

### Task 9: RSS feed dos case studies

Feed RSS é dev-cred clássico (devs assinam, agregadores tipo dev news pegam) e é mais uma superfície indexável apontando para os cases.

**Files:**
- Create: `src/pages/rss.xml.ts`
- Modify: `src/layouts/BaseLayout.astro` (link no head)
- Modify: `package.json` (via pnpm add)

- [ ] **Step 1: Instalar @astrojs/rss**

Run: `rtk pnpm add @astrojs/rss`
Expected: adicionado a dependencies sem erro.

- [ ] **Step 2: Criar `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_URL, caseStudyUrl } from '../utils/constants';

export async function GET() {
  const projectEntries = await getCollection('projects');
  const items = projectEntries[0].data.items;
  const cases = await getCollection('caseStudies');
  const ptCases = cases.filter((c) => c.data.locale === 'pt-br');

  return rss({
    title: 'João Bernardo (jbnado) — Case Studies',
    description:
      'Case studies de engenharia: edge computing, infra self-hosted, jogos e open source.',
    site: SITE_URL,
    items: ptCases.map((c) => {
      const item = items.find((i) => i.id === c.data.slug);
      const type = item?.type ?? 'project';
      return {
        title: c.data.title,
        description: c.data.summary,
        link: caseStudyUrl(type, c.data.slug, 'pt-br'),
        pubDate: new Date(item?.startDate ?? '2026-01-01'),
      };
    }),
  });
}
```

- [ ] **Step 3: Anunciar o feed no head do `BaseLayout.astro`**

Logo após a linha `<link rel="manifest" href="/manifest.json" />`:

```html
<link rel="alternate" type="application/rss+xml" title="João Bernardo — Case Studies" href="/rss.xml" />
```

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep "Instanta" .vercel/output/static/rss.xml`
Expected: match (o feed lista os 6 cases).

- [ ] **Step 5: Commit**

```bash
rtk git add src/pages/rss.xml.ts src/layouts/BaseLayout.astro package.json pnpm-lock.yaml
rtk git commit -m "feat: RSS feed dos case studies"
```

---

### Task 10: Alinhar a home pt-br com en/es (section dividers)

As homes en/es têm 3 `section-divider` entre as seções; a home pt-br (a mais vista) não tem nenhum. O CSS já existe — é só alinhar a estrutura.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Adicionar os dividers**

Deixe o `<BaseLayout>` de `src/pages/index.astro` idêntico em estrutura ao de `src/pages/en/index.astro`:

```astro
<BaseLayout locale={locale} jsonLd={profilePageJsonLd(locale)}>
  <HeroSection locale={locale} />
  <AboutSection locale={locale} />
  <div class="section-divider" aria-hidden="true">
    <span class="section-divider-dot"></span>
  </div>
  <TimelineSection locale={locale} />
  <div class="section-divider" aria-hidden="true">
    <span class="section-divider-dot"></span>
  </div>
  <ProjectsSection locale={locale} />
  <div class="section-divider" aria-hidden="true">
    <span class="section-divider-dot"></span>
  </div>
  <ContactSection locale={locale} />
</BaseLayout>
```

(O atributo `jsonLd` vem da Task 3 — mantenha-o.)

- [ ] **Step 2: Build + verificar**

Run: `rtk pnpm build`
Depois: `rtk grep -c "section-divider" .vercel/output/static/index.html`
Expected: 6 (3 divs + 3 spans).

- [ ] **Step 3: Commit**

```bash
rtk git add src/pages/index.astro
rtk git commit -m "fix(home): alinha home pt-br com en/es (section dividers)"
```

---

### Task 11: Dev-bait — console easter egg, llms.txt e humans.txt

Detalhes que devs encontram e compartilham: mensagem estilizada no console (quem abre DevTools é exatamente o público-alvo), `llms.txt` (o "robots.txt para LLMs" — assistentes de IA citam o site corretamente) e `humans.txt` (clássico IndieWeb).

**Files:**
- Modify: `src/components/Footer.astro`
- Create: `public/llms.txt`
- Create: `public/humans.txt`

- [ ] **Step 1: Console easter egg no Footer**

Em `src/components/Footer.astro`, logo antes do `</footer>`, adicione:

```html
<script is:inline>
  console.log(
    '%c jb. ',
    'background:#0a0f0c;color:#61ffca;font-size:2rem;padding:8px 16px;border:2px solid #61ffca;border-radius:4px;font-family:monospace',
  );
  console.log(
    '%c> Abriu o DevTools? Então você é do time.\n> Código aberto: https://github.com/Jbnado/portfolio-jb\n> Fala comigo: https://linkedin.com/in/jbnado',
    'color:#7cf5ad;font-family:monospace;font-size:0.9rem;line-height:1.6',
  );
</script>
```

- [ ] **Step 2: Criar `public/llms.txt`**

```markdown
# João Bernardo (jbnado)

> Fullstack developer em Ribeirão Preto, SP, Brasil. React, Node.js, TypeScript, Java, Python, AWS. Co-fundador da RP.js, a comunidade JavaScript de Ribeirão Preto. Site em pt-BR (default), inglês (/en/) e espanhol (/es/).

## Case studies

- [Instanta](https://jbnado.dev/projeto/instanta): app edge-native de fotos por evento — Cloudflare Workers, D1, R2, Durable Objects, Hono, React 19
- [ADG — Arena Draft Guide](https://jbnado.dev/contribuicao/adg): infra self-hosted (Docker Swarm, Traefik, Grafana, Oracle Free Tier) + companion Tauri/Rust que captura dados que a API da Riot não expõe
- [Alethe](https://jbnado.dev/contribuicao/alethe): contribuições open source em Tauri + Rust — scroll de TUI, ciclo de vida de PTY, auto-update
- [Ribeirão Noir](https://jbnado.dev/projeto/ribeirao-noir): jogo investigativo em Godot 4 com narrativa data-driven, educação antirracista
- [RP.js](https://jbnado.dev/projeto/rpjs-community): comunidade JavaScript de Ribeirão Preto, co-fundada em 2022
- [Portfolio](https://jbnado.dev/projeto/portfolio-jb): este site — Astro, Preact islands, Tailwind CSS 4

## Contato

- GitHub: https://github.com/Jbnado
- LinkedIn: https://linkedin.com/in/jbnado
```

- [ ] **Step 3: Criar `public/humans.txt`**

```text
/* TEAM */
Developer: João Bernardo (jbnado)
Site: https://jbnado.dev
Location: Ribeirão Preto, SP, Brasil

/* SITE */
Stack: Astro, Preact, Tailwind CSS 4, TypeScript
Fonts: Inter, Sora, JetBrains Mono, Permanent Marker
Hosting: Vercel
Source: https://github.com/Jbnado/portfolio-jb
```

- [ ] **Step 4: Build + verificar**

Run: `rtk pnpm build`
Depois: confira que `.vercel/output/static/llms.txt` e `.vercel/output/static/humans.txt` existem e que `rtk grep "DevTools" .vercel/output/static/index.html` tem match.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/Footer.astro public/llms.txt public/humans.txt
rtk git commit -m "feat: console easter egg, llms.txt e humans.txt"
```

---

### Task 12: View transitions cross-document (CSS puro)

Navegação home ↔ case study com crossfade nativo do browser — zero JS, progressive enhancement (Chrome/Edge/Safari 18.2+; browsers sem suporte ignoram). Polimento que devs notam.

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Adicionar no final de `src/styles/global.css`**

```css
/* ============================================
   VIEW TRANSITIONS — cross-document, progressive enhancement
   ============================================ */

@view-transition {
  navigation: auto;
}

@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}
```

- [ ] **Step 2: Build + teste manual**

Run: `rtk pnpm build`
Expected: build passa. Opcional: `rtk pnpm dev` e navegar home → case study num Chromium para ver o crossfade (feche o dev server depois).

- [ ] **Step 3: Commit**

```bash
rtk git add src/styles/global.css
rtk git commit -m "feat(ux): view transitions cross-document via CSS"
```

---

### Task 13: Push final + verificação em produção

- [ ] **Step 1: Push**

```bash
rtk git push
```

- [ ] **Step 2: Verificar produção (aguarde ~2 min)**

- `https://jbnado.dev/` → `<title>` contém "(jbnado)"; view-source contém `ProfilePage` e `rel="me"`.
- `https://jbnado.dev/projeto/instanta` → `<title>` = seoTitle + "— João Bernardo"; view-source contém `TechArticle` e `BreadcrumbList`.
- `https://jbnado.dev/rss.xml` → feed com 6 itens.
- `https://jbnado.dev/llms.txt` → 200.
- `https://jbnado.dev/sitemap-0.xml` → ~21 URLs com `lastmod`.

- [ ] **Step 3: Validar structured data**

Abra `https://search.google.com/test/rich-results?url=https%3A%2F%2Fjbnado.dev%2F` (ou peça ao usuário) — Expected: ProfilePage/Person detectados sem erro. Alternativa CLI: `rtk curl -s https://validator.schema.org/` não tem API pública; se não puder validar, registre no relatório final que a validação manual está pendente.

---

### Task 14 (OPCIONAL — só se as 13 anteriores estiverem verdes): OG image por case study

Imagens OG únicas por case (título + stack no visual do site) fazem os links renderizarem bem no LinkedIn/Twitter — onde devs compartilham. Usa `astro-og-canvas` (geração em build, sem serviço externo).

**Files:**
- Create: `src/pages/og/[...route].ts`
- Modify: os 18 frontmatters de `src/content/caseStudies/` (campo `ogImage`)
- Modify: `package.json` (via pnpm add)

- [ ] **Step 1: Consultar a doc atual do astro-og-canvas**

Use o MCP context7 (`resolve-library-id` → `query-docs` para "astro-og-canvas") e confirme a API atual de `OGImageRoute` para Astro 5. A referência abaixo é o formato clássico — ajuste ao que a doc disser.

- [ ] **Step 2: Instalar**

Run: `rtk pnpm add astro-og-canvas`

- [ ] **Step 3: Criar `src/pages/og/[...route].ts` (referência — ajuste conforme doc)**

```ts
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const cases = await getCollection('caseStudies');

const pages = Object.fromEntries(
  cases.map((c) => [c.id, { title: c.data.title, description: c.data.summary }]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 15, 12]],
    font: {
      title: { color: [124, 245, 173], families: ['Sora'], weight: 'Bold' },
      description: { color: [200, 220, 210] },
    },
    fonts: ['./public/fonts/sora-variable.woff2', './public/fonts/inter-variable.woff2'],
  }),
});
```

- [ ] **Step 4: Apontar os frontmatters**

Em cada `<slug>.<locale>.md`, adicione (o id da collection é `<slug>.<locale>`):

```yaml
ogImage: "/og/<slug>.<locale>.png"
```

Exemplo em `instanta.pt-br.md`: `ogImage: "/og/instanta.pt-br.png"`.

- [ ] **Step 5: Build + verificar**

Run: `rtk pnpm build`
Expected: arquivos `og/*.png` no output; `rtk grep "og/instanta.pt-br.png" .vercel/output/static/projeto/instanta/index.html` com match.
**Se o build quebrar e a doc não resolver em 2 tentativas: `rtk git checkout -- .` + `rtk pnpm remove astro-og-canvas` e pule esta task inteira — ela é opcional.**

- [ ] **Step 6: Commit + push**

```bash
rtk git add src/pages/og src/content/caseStudies package.json pnpm-lock.yaml
rtk git commit -m "feat(seo): OG image gerada por case study"
rtk git push
```

---

## Ações manuais do João (fora do código — o modelo executor NÃO faz isso)

Nenhuma mudança de código substitui isto. É o que de fato move ranking de busca de nome:

1. **Google Search Console** (maior impacto imediato): verificar a propriedade `jbnado.dev` (via DNS TXT na Vercel), submeter `https://jbnado.dev/sitemap-index.xml` e usar "Inspeção de URL → Solicitar indexação" na home e nos 6 cases pt-br. O Google está servindo um snapshot de fevereiro — isso força o refresh do título/descrição no resultado.
2. **Bing Webmaster Tools**: importar do Search Console (1 clique). Alimenta Bing, DuckDuckGo e boa parte das respostas de assistentes de IA.
3. **Backlinks próprios** (autoridade para o domínio):
   - LinkedIn: jbnado.dev como site no topo do perfil e em "Featured".
   - GitHub: criar/atualizar o repo de perfil `Jbnado/Jbnado` (README com link) e colocar jbnado.dev no campo website do perfil.
   - Site da RP.js: "co-fundada por João Bernardo" linkando jbnado.dev.
   - Página do Ribeirão Noir no itch.io: link para o case study.
4. **Distribuição dos cases**: publicar versões dos case studies no TabNews/dev.to com link canônico (dev.to suporta `canonical_url`) apontando para jbnado.dev. Cada post é backlink + audiência.
5. **Expectativa honesta**: "João Bernardo" seco é query dominada por homônimos e perfis grandes — a meta realista é #1 em "jbnado" (já é — falta melhorar o snippet), top 3 em "João Bernardo" + dev/fullstack/Ribeirão Preto (hoje: ausente), e long-tail técnico via os seoTitles dos cases (ex.: "docker swarm oracle free tier"). Busca genérica por "landing page" não é alcançável com um portfólio — é alcançável via os posts distribuídos (item 4) que apontam para cá.

## Fora de escopo (decidido, não esquecido)

- Blog/seção de notas separada dos cases — os cases já cumprem o papel; reavaliar depois dos resultados das ações manuais.
- Redesign visual — o site acabou de ganhar identidade nova; este plano não mexe na estética.
- Analytics (Vercel Analytics/Plausible) — decisão de privacidade do João; sugerido, não planejado.
