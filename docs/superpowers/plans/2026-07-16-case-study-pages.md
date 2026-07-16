# Páginas de Case Study — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Criar páginas de case study dedicadas (uma por projeto/contribuição × idioma), com conteúdo em Markdown (HTML estático, SEO forte), URLs semânticas localizadas, e link a partir do card.

**Architecture:** Content collection `caseStudies` (Markdown por `<slug>.<locale>.md`). `projects.json` continua fonte de metadados de card (título, type, stack, links, resumo). Rotas estáticas localizadas via `getStaticPaths`. `SEOHead`/`BaseLayout` estendidos para canonical/hreflang/JSON-LD por página. Componente `CaseStudyPage.astro` renderiza o layout de detalhe reusando os utilitários visuais já existentes.

**Tech Stack:** Astro 5 content collections + `render()`, Tailwind v4, TypeScript. `site: https://jbnado.dev`, i18n por prefixo (`pt-br` sem prefixo, `/en`, `/es`), `@astrojs/sitemap` ativo.

## Global Constraints

- **Sem TDD clássico** (feature de conteúdo/rotas): gate de cada tarefa = `pnpm build` (via `rtk pnpm build`) sem erros + verificação direcionada. Build de conteúdo valida frontmatter e resolve todas as rotas.
- **Preservar** i18n (pt-br/en/es), acessibilidade (headings semânticos, `prefers-reduced-motion`, foco visível), prevenção de flicker, e o comportamento atual da home (SEOHead na home NÃO pode regredir).
- **Slugs** = `id` do `projects.json`: `instanta, adg, alethe, ribeirao-noir, rpjs-community, portfolio-jb`.
- **Segmentos de path localizados (exatos):**
  - project → pt-br `projeto`, en `project`, es `proyecto`
  - contribution → pt-br `contribuicao`, en `contribution`, es `contribucion`
- **SITE_URL** = `https://jbnado.dev` (de `src/utils/constants.ts`).
- **Reusar** utilitários visuais existentes de `global.css` (`.punch-hole`, `.card-edge-holes`, `.vintage-card`, `.ink-stamp`, `.crt-glow`, `.blueprint-wrap`, `.project-type-stamp`). Não redefinir.
- Commits com `rtk git`, um por tarefa, sufixo padrão do repo. Não fazer push.

---

## File Structure

- Modify: `src/content.config.ts` — nova collection `caseStudies`.
- Create: `src/content/caseStudies/<slug>.<locale>.md` × 18.
- Modify: `src/utils/constants.ts` — segmentos localizados + `caseStudyUrl`.
- Modify: `src/i18n/{pt-br,en,es}.json` — chaves `caseStudy.*`.
- Modify: `src/components/SEOHead.astro` — props opcionais canonical/alternates/ogType/jsonLd.
- Modify: `src/layouts/BaseLayout.astro` — repassar novos props SEO + `showScrollSpy`.
- Create: `src/components/CaseStudyPage.astro` — layout de detalhe.
- Modify: `src/styles/global.css` — bloco `.case-*`.
- Create: 6 arquivos de rota em `src/pages/**`.
- Modify: `src/components/ProjectCard.astro` + `src/components/ProjectsSection.astro` — link "Ler case study".

---

## Task 1: Content collection `caseStudies`

**Files:** Modify `src/content.config.ts`

**Interfaces:**
- Produces: collection `caseStudies` com frontmatter `{ slug, locale, title, summary, seoTitle?, highlights?, meta?, ogImage? }` e corpo Markdown.

- [ ] **Step 1: Adicionar a collection**

Em `src/content.config.ts`, após o `const projects = defineCollection({...})` e antes do `export const collections`, adicionar:

```ts
const caseStudies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/caseStudies' }),
  schema: z.object({
    slug: z.string(),
    locale: z.enum(['pt-br', 'en', 'es']),
    title: z.string(),
    summary: z.string(),
    seoTitle: z.string().optional(),
    highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    meta: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    ogImage: z.string().optional(),
  }),
});
```

E incluir na exportação:
```ts
export const collections = { stats, timeline, projects, caseStudies };
```

- [ ] **Step 2: Build (falha esperada de collection vazia é tolerada; deve compilar)**

Run: `rtk pnpm build`
Expected: build conclui sem erros (collection sem arquivos ainda é válida).

- [ ] **Step 3: Commit**

```bash
rtk git add src/content.config.ts
rtk git commit -m "feat(content): collection caseStudies (markdown por slug.locale)"
```

---

## Task 2: Helper de URL localizada + i18n

**Files:** Modify `src/utils/constants.ts`, `src/i18n/pt-br.json`, `src/i18n/en.json`, `src/i18n/es.json`

**Interfaces:**
- Produces: `caseStudyUrl(type, slug, locale): string` (path relativo, ex.: `/contribuicao/adg`, `/en/contribution/adg`); chaves i18n `caseStudy.back/readMore/eyebrow/code/liveDemo/problem/decision/result`.
- Consumes: nada.

- [ ] **Step 1: Adicionar segmentos + helper em `constants.ts`**

Acrescentar ao final de `src/utils/constants.ts`:

```ts
export const CASE_SEGMENTS: Record<'project' | 'contribution', Record<Locale, string>> = {
  project: { 'pt-br': 'projeto', en: 'project', es: 'proyecto' },
  contribution: { 'pt-br': 'contribuicao', en: 'contribution', es: 'contribucion' },
};

/** Path relativo (com prefixo de locale) para a página de case study. */
export function caseStudyUrl(
  type: 'project' | 'contribution',
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const seg = CASE_SEGMENTS[type][locale];
  return `${prefix}/${seg}/${slug}`;
}
```

- [ ] **Step 2: Adicionar chaves i18n**

No objeto `caseStudy` existente de cada locale, acrescentar (o objeto já tem `expand/problem/decision/result`):

`pt-br.json`:
```json
"back": "VOLTAR",
"readMore": "Ler case study",
"eyebrow": "> CASE_STUDY",
"code": "CÓDIGO",
"liveDemo": "DEMO"
```
`en.json`:
```json
"back": "BACK",
"readMore": "Read case study",
"eyebrow": "> CASE_STUDY",
"code": "CODE",
"liveDemo": "LIVE DEMO"
```
`es.json`:
```json
"back": "VOLVER",
"readMore": "Leer case study",
"eyebrow": "> CASE_STUDY",
"code": "CÓDIGO",
"liveDemo": "DEMO"
```

- [ ] **Step 3: Build**

Run: `rtk pnpm build`
Expected: sem erros; JSON válido.

- [ ] **Step 4: Commit**

```bash
rtk git add src/utils/constants.ts src/i18n/pt-br.json src/i18n/en.json src/i18n/es.json
rtk git commit -m "feat(case): helper caseStudyUrl + chaves i18n"
```

---

## Task 3: Seed dos 18 arquivos Markdown

**Files:** Create `src/content/caseStudies/<slug>.<locale>.md` (18 arquivos)

**Interfaces:**
- Consumes: `src/content/projects/projects.json` (title, type, description, caseStudy.problem/decision/result por locale).
- Produces: 18 arquivos md com frontmatter válido conforme Task 1.

- [ ] **Step 1: Gerar 1 arquivo por projeto × locale a partir do projects.json**

Para cada um dos 6 projetos (`instanta, adg, alethe, ribeirao-noir, rpjs-community, portfolio-jb`) e cada locale (`pt-br, en, es`), criar `src/content/caseStudies/<id>.<locale>.md` com ESTE template exato (substituir os campos pelos valores do projeto naquele locale):

```markdown
---
slug: "<id>"
locale: "<locale>"
title: "<title[locale]>"
summary: "<description[locale]>"
---

## <LABEL_PROBLEM>

<caseStudy.problem[locale]>

## <LABEL_DECISION>

<caseStudy.decision[locale]>

## <LABEL_RESULT>

<caseStudy.result[locale]>
```

Rótulos de seção por locale (usar exatamente):
- pt-br: `O Problema`, `A Solução`, `O Resultado`
- en: `The Problem`, `The Solution`, `The Result`
- es: `El Problema`, `La Solución`, `El Resultado`

Regras:
- Escapar aspas duplas no frontmatter YAML se houver (preferir manter os textos como estão; usar aspas duplas ao redor e escapar internas com `\"`, ou usar bloco `>` se necessário).
- Não inventar conteúdo novo — apenas transpor o que já existe no `projects.json`.
- `highlights`/`meta` ficam ausentes por ora (opcionais).

- [ ] **Step 2: Validar via build (o schema valida todo o frontmatter)**

Run: `rtk pnpm build`
Expected: sem erros de collection; 18 entradas carregadas.

- [ ] **Step 3: Conferir contagem**

Run: `ls src/content/caseStudies | wc -l`
Expected: `18`.

- [ ] **Step 4: Commit**

```bash
rtk git add src/content/caseStudies
rtk git commit -m "content(case): seed dos 18 case studies a partir do projects.json"
```

---

## Task 4: Estender SEOHead + BaseLayout para SEO por página

**Files:** Modify `src/components/SEOHead.astro`, `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `SEOHead` aceita `canonical?`, `alternates?` (`Record<locale,absUrl>`), `ogType?`, `jsonLd?` (objeto). `BaseLayout` aceita e repassa os mesmos + `showScrollSpy?: boolean` (default true).
- Consumes: nada novo.

- [ ] **Step 1: Estender `SEOHead.astro`**

Adicionar aos `Props` e usar (mantendo defaults = comportamento atual da home):

```ts
interface Props {
  locale?: string;
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;                     // absoluto; default = home do locale
  alternates?: Record<string, string>;    // locale -> URL absoluta; default = home
  ogType?: string;                         // default 'website'
  jsonLd?: unknown;                        // default = Person (atual)
}
```

- Trocar o cálculo de `canonicalUrl` para: `const canonicalUrl = canonical ?? (hreflangMap[locale] ?? \`${SITE_URL}/\`);`
- Trocar as `<link rel="alternate" hreflang>` para iterar `alternates ?? hreflangMap` (usar as chaves `pt-br/en/es` e mapear `pt-br`→`pt-BR`), mantendo `x-default` = versão pt-br.
- `og:type` = `ogType ?? 'website'`.
- `set:html` do JSON-LD = `JSON.stringify(jsonLd ?? defaultPersonJsonLd)` (o objeto Person atual vira `defaultPersonJsonLd`).

- [ ] **Step 2: Estender `BaseLayout.astro`**

- Adicionar aos `Props`: `canonical?: string; alternates?: Record<string,string>; ogType?: string; jsonLd?: unknown; showScrollSpy?: boolean;` (este último default `true`).
- Repassar `canonical`, `alternates`, `ogType`, `jsonLd` ao `<SEOHead ... />`.
- Envolver `<ScrollSpy client:idle />` em `{showScrollSpy && (<ScrollSpy client:idle />)}`.

- [ ] **Step 3: Build (home não pode regredir)**

Run: `rtk pnpm build`
Expected: sem erros. A home continua com canonical/hreflang/JSON-LD Person atuais (defaults).

- [ ] **Step 4: Verificar home inalterada**

Run: `rtk grep "hreflang" dist/index.html`
Expected: as 3 alternates + x-default presentes como antes.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/SEOHead.astro src/layouts/BaseLayout.astro
rtk git commit -m "feat(seo): SEOHead/BaseLayout aceitam canonical/alternates/ogType/jsonLd por pagina"
```

---

## Task 5: Componente `CaseStudyPage.astro` + estilos

**Files:** Create `src/components/CaseStudyPage.astro`, Modify `src/styles/global.css`

**Interfaces:**
- Consumes: props `{ project, number, locale, entry }` onde `project` é o item do projects.json, `number` é o índice+1, `entry` é a entrada da collection `caseStudies` (com `.data` e método `render()`), `locale`.
- Produces: markup completo da página de detalhe. Consome utilitários visuais existentes.

- [ ] **Step 1: Criar `CaseStudyPage.astro`**

```astro
---
import { t } from '../i18n/utils';
import { caseStudyUrl } from '../utils/constants';
import TechBadge from './TechBadge.astro';

interface Props {
  project: any;        // item do projects.json
  number: number;
  locale: string;
  entry: any;          // entrada de caseStudies
  typeLabel: string;
}
const { project, number, locale, entry, typeLabel } = Astro.props;
const { Content } = await entry.render();
const data = entry.data;
const displayNumber = String(number).padStart(2, '0');
const year = project.startDate.slice(0, 4);
const homeHref = locale === 'pt-br' ? '/#projetos' : `/${locale}/#projetos`;
---

<div class="case-page blueprint-wrap">
  <div class="case-container">
    <a href={homeHref} class="case-back">← {t('caseStudy.back', locale)}_AO_DECK</a>

    <header class="case-head card-edge-holes vintage-card">
      <div class="case-head-top">
        <div class="case-holes" aria-hidden="true">
          {[...Array(6)].map(() => <span class="punch-hole"></span>)}
        </div>
        <span class="case-num">#{displayNumber}</span>
      </div>
      <p class="case-eyebrow crt-glow">{t('caseStudy.eyebrow', locale)}</p>
      <div class="case-titlerow">
        <h1 class="case-title crt-glow">{data.title}</h1>
        <span class={`project-type-stamp project-type-stamp--${project.type}`}>{typeLabel}</span>
      </div>
      <p class="case-summary">{data.summary}</p>
      <div class="case-stack">
        {project.techStack.map((tech: string) => <TechBadge name={tech} />)}
      </div>
      <div class="case-actions">
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" class="case-btn">{t('caseStudy.code', locale)} ↗</a>
        )}
        {project.links.demo && (
          <a href={project.links.demo} target="_blank" rel="noopener noreferrer" class="case-btn">{t('caseStudy.liveDemo', locale)} ↗</a>
        )}
      </div>
    </header>

    {data.meta && data.meta.length > 0 && (
      <div class="case-meta">
        {data.meta.map((m: any) => (
          <div class="case-meta-cell">
            <div class="case-meta-label">{m.label}</div>
            <div class="case-meta-value crt-glow">{m.value}</div>
          </div>
        ))}
      </div>
    )}

    <article class="case-body">
      <Content />
    </article>

    {data.highlights && data.highlights.length > 0 && (
      <div class="case-highlights">
        {data.highlights.map((h: any) => (
          <div class="case-highlight vintage-card">
            <div class="case-highlight-value crt-glow">{h.value}</div>
            <div class="case-highlight-label">{h.label}</div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 2: Adicionar estilos `.case-*` em `global.css`**

Inserir (antes do bloco PUNK ou junto aos utilitários) — usa tokens, então funciona nos dois temas:

```css
/* ===== Case study page ===== */
.case-page { min-height: 100vh; position: relative; }
.case-container { max-width: 860px; margin: 0 auto; padding: 2rem 1rem 4rem; position: relative; z-index: 1; }
.case-back {
  display: inline-block; font-family: var(--font-mono); font-size: 0.75rem;
  letter-spacing: 0.1em; color: var(--color-text-secondary); text-decoration: none; margin-bottom: 1.5rem;
}
.case-back:hover { color: var(--color-accent); }
.case-head { border: 2px solid var(--color-border); padding: 1.5rem; margin-bottom: 2rem; position: relative; }
.case-head-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.case-holes { display: flex; gap: 0.4rem; }
.case-holes .punch-hole { width: 0.5rem; height: 0.5rem; }
.case-num { font-family: var(--font-mono); font-size: 0.75rem; background: color-mix(in srgb, var(--color-accent) 18%, transparent); color: var(--color-accent); padding: 0.1rem 0.5rem; border-radius: 2px; }
.case-eyebrow { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent); margin-bottom: 0.75rem; }
.case-titlerow { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.case-title { font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 700; color: var(--color-text-primary); letter-spacing: var(--font-heading-tracking); }
.dark .case-title { font-family: var(--font-punk); }
.case-summary { color: var(--color-text-secondary); line-height: 1.6; max-width: 60ch; margin-bottom: 1.25rem; }
.case-stack { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
.case-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.case-btn { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; border: 2px solid var(--color-border); padding: 0.5rem 1rem; color: var(--color-text-primary); text-decoration: none; transition: all 150ms; }
.case-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.case-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 2rem; font-family: var(--font-mono); }
@media (min-width: 640px) { .case-meta { grid-template-columns: repeat(4, 1fr); } }
.case-meta-cell { border: 2px solid var(--color-border); padding: 0.75rem; }
.case-meta-label { font-size: 0.625rem; color: var(--color-text-secondary); letter-spacing: 0.08em; margin-bottom: 0.25rem; }
.case-meta-value { font-size: 0.875rem; font-weight: 700; }
.case-body { line-height: 1.7; color: var(--color-text-primary); }
.case-body h2 { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 0.75rem; color: var(--color-text-primary); font-family: var(--font-mono); }
.dark .case-body h2 { color: var(--color-accent-secondary); text-shadow: 0 0 6px rgba(97,255,202,0.3); }
.case-body h3 { font-size: 1.05rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
.case-body p { margin-bottom: 1rem; color: var(--color-text-secondary); }
.case-body ul, .case-body ol { margin: 0 0 1rem 1.25rem; color: var(--color-text-secondary); }
.case-body li { margin-bottom: 0.4rem; }
.case-body a { color: var(--color-accent); text-decoration: underline; }
.case-body code { font-family: var(--font-mono); font-size: 0.85em; background: color-mix(in srgb, var(--color-accent) 12%, transparent); padding: 0.1rem 0.3rem; border-radius: 2px; }
.case-body pre { background: var(--color-bg-secondary); border: 1px solid var(--color-border); padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
.case-body pre code { background: none; padding: 0; }
.case-highlights { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-top: 2rem; }
@media (min-width: 640px) { .case-highlights { grid-template-columns: repeat(3, 1fr); } }
.case-highlight { border: 2px solid var(--color-border); padding: 1.25rem; text-align: center; }
.case-highlight-value { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); }
.case-highlight-label { font-family: var(--font-mono); font-size: 0.625rem; color: var(--color-text-secondary); letter-spacing: 0.08em; margin-top: 0.25rem; }
```

- [ ] **Step 3: Build (componente ainda não usado — deve compilar)**

Run: `rtk pnpm build`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/CaseStudyPage.astro src/styles/global.css
rtk git commit -m "feat(case): componente CaseStudyPage + estilos"
```

---

## Task 6: Rotas localizadas (6 arquivos)

**Files:** Create `src/pages/projeto/[slug].astro`, `src/pages/contribuicao/[slug].astro`, `src/pages/en/project/[slug].astro`, `src/pages/en/contribution/[slug].astro`, `src/pages/es/proyecto/[slug].astro`, `src/pages/es/contribucion/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('projects')`, `getCollection('caseStudies')` / `getEntry`, `CaseStudyPage`, `BaseLayout`, `caseStudyUrl`, `SITE_URL`, `t`.
- Produces: páginas estáticas para cada slug×locale×type, com SEO por página.

- [ ] **Step 1: Criar o arquivo-modelo (pt-br, projeto)**

`src/pages/projeto/[slug].astro`:

```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import CaseStudyPage from '../../components/CaseStudyPage.astro';
import { caseStudyUrl, SITE_URL } from '../../utils/constants';
import { t } from '../../i18n/utils';

const TYPE = 'project';
const LOCALE = 'pt-br';

export async function getStaticPaths() {
  const projectEntries = await getCollection('projects');
  const items = projectEntries[0].data.items;
  return items
    .map((item, index) => ({ item, number: index + 1 }))
    .filter(({ item }) => item.type === 'project')
    .map(({ item, number }) => ({ params: { slug: item.id }, props: { item, number } }));
}

const { item, number } = Astro.props;
const localeKey = LOCALE as 'pt-br';
// entrada da collection: `${slug}.${locale}` com fallback pt-br
let entry = await getEntry('caseStudies', `${item.id}.${LOCALE}`);
if (!entry) entry = await getEntry('caseStudies', `${item.id}.pt-br`);

const title = entry.data.seoTitle ?? `${entry.data.title} — João Bernardo`;
const description = entry.data.summary;
const canonical = `${SITE_URL}${caseStudyUrl(TYPE, item.id, LOCALE)}`;
const alternates = {
  'pt-br': `${SITE_URL}${caseStudyUrl(TYPE, item.id, 'pt-br')}`,
  en: `${SITE_URL}${caseStudyUrl(TYPE, item.id, 'en')}`,
  es: `${SITE_URL}${caseStudyUrl(TYPE, item.id, 'es')}`,
};
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  headline: entry.data.title,
  description: entry.data.summary,
  inLanguage: LOCALE,
  url: canonical,
  author: { '@type': 'Person', name: 'João Bernardo' },
  keywords: item.techStack.join(', '),
};
const typeLabel = t('projects.typeProject', LOCALE);
---

<BaseLayout
  locale={LOCALE}
  title={title}
  description={description}
  canonical={canonical}
  alternates={alternates}
  ogType="article"
  jsonLd={jsonLd}
  showScrollSpy={false}
>
  <CaseStudyPage item={item} project={item} number={number} locale={LOCALE} entry={entry} typeLabel={typeLabel} />
</BaseLayout>
```

> Nota: `CaseStudyPage` recebe `project={item}` (o componente usa `project`). Passar ambos `item` e `project` é redundante — no componente use apenas `project`. Ajustar a assinatura para receber `project`, `number`, `locale`, `entry`, `typeLabel` (remover `item` do uso).

- [ ] **Step 2: Criar as outras 5 rotas por analogia**

Para cada arquivo, mudar apenas `TYPE`, `LOCALE`, o filtro (`item.type === TYPE`), o `typeLabel` (`typeProject` vs `typeContribution`), e os caminhos relativos de import (`../../` vs `../../../` para as rotas em `en/`/`es/`):

- `src/pages/contribuicao/[slug].astro`: `TYPE='contribution'`, `LOCALE='pt-br'`, filtro `=== 'contribution'`, `typeLabel = t('projects.typeContribution','pt-br')`.
- `src/pages/en/project/[slug].astro`: `TYPE='project'`, `LOCALE='en'`, imports `../../../`.
- `src/pages/en/contribution/[slug].astro`: `TYPE='contribution'`, `LOCALE='en'`, imports `../../../`.
- `src/pages/es/proyecto/[slug].astro`: `TYPE='project'`, `LOCALE='es'`, imports `../../../`.
- `src/pages/es/contribucion/[slug].astro`: `TYPE='contribution'`, `LOCALE='es'`, imports `../../../`.

Em cada `getStaticPaths`, o filtro usa o `TYPE` do arquivo. O fallback de `getEntry` sempre tenta `${id}.${LOCALE}` e cai para `${id}.pt-br`.

- [ ] **Step 3: Build — todas as rotas devem gerar**

Run: `rtk pnpm build`
Expected: sem erros. No log, contagem de páginas sobe (home + 404 + N cases). 6 projetos → 4 projetos + 2 contribuições? Não: 4 `project` (instanta, ribeirao-noir, rpjs-community, portfolio-jb) e 2 `contribution` (adg, alethe) × 3 locales = 18 páginas de case + 4 originais.

- [ ] **Step 4: Verificar rotas geradas**

Run: `ls dist/projeto dist/contribuicao dist/en/project dist/es/proyecto`
Expected: diretórios com os slugs corretos (ex.: `dist/contribuicao/adg/index.html`).

- [ ] **Step 5: Verificar SEO numa página**

Run: `rtk grep "canonical|hreflang|CreativeWork|og:type" dist/contribuicao/adg/index.html`
Expected: canonical = `https://jbnado.dev/contribuicao/adg`; 3 hreflang + x-default; `og:type` article; JSON-LD CreativeWork.

- [ ] **Step 6: Commit**

```bash
rtk git add src/pages
rtk git commit -m "feat(case): rotas localizadas projeto/contribuicao (pt-br/en/es) com SEO"
```

---

## Task 7: Link "Ler case study" no card

**Files:** Modify `src/components/ProjectCard.astro`, `src/components/ProjectsSection.astro`

**Interfaces:**
- Consumes: `caseStudyUrl` (Task 2), props existentes `type`/`typeLabel`.
- Produces: card mantém resumo + `<details>` e ganha link "Ler case study →" para a URL localizada.

- [ ] **Step 1: Passar `slug`/`caseUrl` ao card**

Em `ProjectsSection.astro`, importar `caseStudyUrl` de `../utils/constants` e passar ao `ProjectCard`:
```astro
caseUrl={caseStudyUrl(item.type, item.id, localeKey)}
```
(usar `localeKey` já existente no componente).

- [ ] **Step 2: Renderizar o link no `ProjectCard.astro`**

- Adicionar `caseUrl?: string;` aos `Props` e ao destructuring.
- Logo após o `</details>` (fim do `case-study-details`), adicionar:
```astro
    {caseUrl && (
      <a href={caseUrl} class="project-readmore">{t('caseStudy.readMore', locale)} →</a>
    )}
```
- Importar `t` no frontmatter do `ProjectCard.astro` (`import { t } from '../i18n/utils';`).
- Adicionar estilo no `<style is:global>`:
```css
  .project-readmore {
    display: inline-block;
    margin-top: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--color-accent);
    text-decoration: none;
  }
  .project-readmore:hover { text-decoration: underline; }
```

- [ ] **Step 3: Build + verificar link**

Run: `rtk pnpm build`
Expected: sem erros.
Run: `rtk grep "project-readmore" dist/index.html`
Expected: presente; hrefs apontam para `/projeto/...` e `/contribuicao/...`.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/ProjectCard.astro src/components/ProjectsSection.astro
rtk git commit -m "feat(projects): link 'Ler case study' no card para a pagina localizada"
```

---

## Task 8: QA end-to-end + verificação SEO

**Files:** Verify only.

- [ ] **Step 1: Build limpo**

Run: `rtk pnpm build`
Expected: sem erros/warnings novos; contagem de páginas = 4 (home×3 + 404) + 18 cases = 22+.

- [ ] **Step 2: Todas as rotas resolvem**

Run: `ls dist/projeto dist/contribuicao dist/en/project dist/en/contribution dist/es/proyecto dist/es/contribucion`
Expected: cada tipo com os slugs certos; sem faltantes.

- [ ] **Step 3: Sitemap inclui as páginas**

Run: `rtk grep "contribuicao/adg|projeto/instanta" dist/sitemap-0.xml`
Expected: URLs presentes no sitemap.

- [ ] **Step 4: hreflang recíproco numa página en**

Run: `rtk grep "hreflang" dist/en/contribution/adg/index.html`
Expected: alternates apontam para pt-br/en/es corretos + x-default.

- [ ] **Step 5: Verificação visual (claro e escuro)**

Rodar `pnpm dev`; abrir `/contribuicao/adg` e `/projeto/instanta` nos dois temas. Conferir: cabeçalho punch-card, carimbo CONTRIB/PROJETO, stack, botões, corpo Markdown legível (h2 verde no dark), link VOLTAR, footer. Sem overflow horizontal no mobile.
Expected: estética consistente com a home; conteúdo do seed aparece.

- [ ] **Step 6: Commit (se houve ajustes)**

```bash
rtk git add -A
rtk git commit -m "chore(case): QA final das paginas de case study"
```

---

## Self-Review (preenchido)

**Cobertura do spec:**
- Collection Markdown → Task 1. ✅
- Seed 18 arquivos → Task 3. ✅
- URLs localizadas semânticas → Task 2 (helper) + Task 6 (rotas). ✅
- SEO (title/desc/canonical/hreflang/OG/JSON-LD/sitemap) → Task 4 (infra) + Task 6 (por página) + Task 8 (verificação). ✅
- Página de detalhe (estética) → Task 5. ✅
- Card com resumo + "Ler case study" → Task 7. ✅
- i18n + fallback → Task 2 (chaves) + Task 6 (fallback getEntry). ✅
- Acessibilidade/semântica → Task 5 (h1/h2, foco) + constraints. ✅

**Placeholders:** nenhum "TBD"; Task 3 usa template determinístico sobre dados existentes (não é placeholder — é transformação). Task 6 dá o arquivo-modelo completo + as 5 variações por diferença explícita.

**Consistência de nomes:** `caseStudyUrl(type, slug, locale)` definido em Task 2 e usado em Tasks 6/7. `CaseStudyPage` props `{ project, number, locale, entry, typeLabel }` definidos em Task 5 e passados em Task 6 (nota corrige a redundância `item`/`project` → usar `project`). Collection `caseStudies` (Task 1) consumida em Tasks 3/6. Chaves i18n `caseStudy.*` (Task 2) usadas em Tasks 5/6/7.
