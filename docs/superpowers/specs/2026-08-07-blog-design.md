# Blog do portfolio — design

Data: 2026-08-07
Status: aprovado, pronto pra virar plano

## O que é

Uma seção de blog em `jbnado.dev`, atrelada ao canal do YouTube. Cada vídeo publicado
vira um post. O post não é o roteiro do vídeo: é um texto original e complementar, mais
técnico, na voz que os case studies já usam, com as fontes verificadas do vídeo.

Nas 3 línguas do site (pt-br, en, es), como todo o resto do portfolio.

A matéria-prima de cada post sai de um JSON autossuficiente exportado pelo repositório
`newsletter-watcher`:

```powershell
cd C:\Users\bernardo\Projetos\newsletter-watcher
.venv\Scripts\python.exe tools\export_portfolio.py --id 1372
# escreve artifacts\portfolio\video-1372.json
```

## Decisões tomadas

| Decisão | Escolha |
|---|---|
| Escopo editorial | Blog do canal. Todo post tem vídeo. |
| Corpo do post | Texto original e complementar, não o roteiro. `roteiro_md` é matéria-prima, não conteúdo. |
| Voz | A dos case studies (`upwatch.pt-br.md` como referência), podendo ser mais técnica. |
| Feed | Índice JSON + ilha Preact (busca e scroll infinito) sobre HTML renderizado no build, com páginas numeradas por baixo. |
| Card | Punch-card com thumb 16:9, reusando `.pc-head` / `.pc-foot` / `vintage-card`. |
| Imagem de compartilhamento | Capa do YouTube direto de `i.ytimg.com`. |
| Título do post 1 | Igual ao do YouTube, com o acento corrigido: "IA Hackeou uma empresa sem **ninguém** pedir". |
| Data do post 1 | `2026-08-04`. |
| Episódio E01 | Fora deste escopo. O schema tem `draft`, então entra quando o vídeo sair. |
| RSS | Sim, um feed por idioma. |

Descartados e por quê:

- **Pagefind** — busca full-text de verdade, mas ~50KB de runtime mais fragmentos de
  índice pra um blog que começa com um post, e ainda assim não resolveria o scroll
  infinito. Reavaliar por volta de 50 posts.
- **Só paginação numerada** — mais simples e mais leve, mas não é a experiência pedida.
- **Roteiro em accordion** — 26 mil caracteres de texto falado, com `[TELA]` e
  `[B-ROLL]`, é ruim de ler e caro de traduzir 3x.
- **OG gerado no build pelo `gen-og.mjs`** — mais consistente com a identidade do site,
  mas joga fora a capa que já foi desenhada pro vídeo.

## Arquitetura

### Content collection

Mesmo padrão dos case studies: um arquivo markdown por idioma, id combinando slug e
locale porque o glob default colide no slug.

```
src/content/blog/
  agente-invadiu-hugging-face.pt-br.md
  agente-invadiu-hugging-face.en.md
  agente-invadiu-hugging-face.es.md
```

```ts
const blog = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/blog',
    generateId: ({ data }) => `${data.slug}.${data.locale}`,
  }),
  schema: z.object({
    slug: z.string(),                                  // chave compartilhada entre os 3 idiomas
    locale: z.enum(['pt-br', 'en', 'es']),
    urlSlug: z.string(),                               // slug daquele idioma na URL
    title: z.string(),
    seoTitle: z.string().optional(),
    summary: z.string(),                               // meta description e resumo do card
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    tags: z.array(z.string()).default([]),
    video: z.object({
      youtubeId: z.string(),
      url: z.string().url(),
      title: z.string(),                               // título como publicado no YouTube
      thumbnail: z.string().url(),
      duration: z.string().optional(),                 // ISO 8601, ex. PT8M32S, pro JSON-LD
      channel: z.string().default('Jbnado'),
    }),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      note: z.string().optional(),
    })).default([]),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),                    // default: video.thumbnail
  }),
});
```

Duas escolhas de schema que têm motivo:

**`slug` e `urlSlug` separados.** O `slug` amarra as 3 traduções (é a chave do hreflang e
da navegação de idioma). O `urlSlug` é o que aparece na URL de cada idioma, porque
`/en/blog/a-ia-invadiu-uma-empresa-de-verdade-e-ninguem-mandou` é uma URL ruim pra quem
busca em inglês. Custa ~15 linhas no `getStaticPaths`.

**`date` como string, não `z.coerce.date()`.** `coerce` transforma `2026-08-04` em
meia-noite UTC, e aí `toLocaleDateString` no fuso do visitante mostra 03/08. Como string
`YYYY-MM-DD`, a ordenação lexicográfica já é cronológica e a formatação sai dos pedaços,
sem passar por `Date`.

### Rotas

| | pt-br | en | es |
|---|---|---|---|
| feed | `/blog` | `/en/blog` | `/es/blog` |
| paginação | `/blog/pagina/2` | `/en/blog/page/2` | `/es/blog/pagina/2` |
| post | `/blog/<urlSlug>` | `/en/blog/<urlSlug>` | `/es/blog/<urlSlug>` |
| índice de busca | `/blog-index/pt-br.json` | `/blog-index/en.json` | `/blog-index/es.json` |
| RSS | `/rss.xml` | `/en/rss.xml` | `/es/rss.xml` |

O segmento `pagina/` (`page/` em inglês) existe porque `/blog/2` e `/blog/meu-post`
casariam no mesmo `[slug].astro`.

São 9 arquivos de rota de página, todos finos, delegando pra dois componentes
compartilhados. É o mesmo formato dos 6 arquivos de case study que já existem no repo.

Helpers novos em `src/utils/constants.ts`:

```ts
export const BLOG_SEGMENTS: Record<Locale, string> = { 'pt-br': 'blog', en: 'blog', es: 'blog' };
export const PAGE_SEGMENTS: Record<Locale, string> = { 'pt-br': 'pagina', en: 'page', es: 'pagina' };
export function blogUrl(locale?: Locale): string;
export function blogPostUrl(urlSlug: string, locale?: Locale): string;
export function blogPageUrl(page: number, locale?: Locale): string;
```

### Arquivos

Novos:

```
src/content/blog/agente-invadiu-hugging-face.{pt-br,en,es}.md
src/components/BlogFeedPage.astro          # cabeçalho + busca + grid + paginação
src/components/BlogPostPage.astro          # post completo
src/components/VideoEmbed.astro            # fachada clique-pra-tocar
src/islands/BlogFeed.tsx                   # busca + scroll infinito
src/islands/BlogCard.tsx                   # card do punch-card (com e sem hidratação)
src/utils/blog.ts                          # getBlogPosts, readingTime, toIndexEntry
src/pages/blog/index.astro
src/pages/blog/pagina/[page].astro
src/pages/blog/[slug].astro
src/pages/en/blog/index.astro
src/pages/en/blog/page/[page].astro
src/pages/en/blog/[slug].astro
src/pages/es/blog/index.astro
src/pages/es/blog/pagina/[page].astro
src/pages/es/blog/[slug].astro
src/pages/blog-index/[locale].json.ts
src/pages/rss.xml.ts
src/pages/en/rss.xml.ts
src/pages/es/rss.xml.ts
```

Modificados:

```
src/content.config.ts               # + collection blog
src/utils/constants.ts              # + helpers de URL do blog
src/components/NavBar.astro         # + link BLOG, + repasse de alternates
src/components/LanguageSwitcher.astro # usa alternates quando existirem
src/layouts/BaseLayout.astro        # repassa alternates pro NavBar
src/components/SEOHead.astro        # ogImage absoluto + link rel=alternate do RSS
src/components/Footer.astro         # + link do blog
src/styles/global.css               # bloco .blog-* (card e página do post)
src/styles/islands.css              # busca e controles do feed
src/i18n/{pt-br,en,es}.json         # + chaves blog.*, nav.blog, terminal.blog, paper.blog
astro.config.mjs                    # sitemap filter excluindo /blog-index/
package.json                        # + @astrojs/rss
```

O link BLOG entra no `navLinks` do `NavBar.astro`, o que já cobre o menu mobile porque o
`MobileNav` recebe os links por prop.

### O seletor de idioma precisa saber pra onde ir

O `LanguageSwitcher` hoje aponta fixo pra `/`, `/en/` e `/es/`. Numa página que não é a
home, trocar de idioma joga o visitante na home em vez da tradução da página que ele
estava lendo. No blog isso seria pior que nos case studies, porque cada idioma tem
`urlSlug` próprio e não dá pra adivinhar o destino trocando o prefixo da URL.

O conserto não precisa de prop nova nas páginas. O `BaseLayout` já recebe `alternates`
com as 3 URLs, porque o `SEOHead` usa isso pro hreflang. Basta repassar o mesmo objeto
pro `NavBar` e dele pro `LanguageSwitcher`, que passa a usar `alternates[code]` quando
existir e cai no caminho da home quando não existir.

Efeito colateral bom: as páginas de case study já passam `alternates`, então o seletor
delas passa a funcionar também, sem tocar em nenhum dos 6 arquivos de rota.

O `LanguageSwitcher` converte a URL absoluta em caminho (`new URL(href).pathname`), senão
clicar no seletor rodando `astro dev` pularia pra produção, já que `SITE_URL` é fixo.

### Fluxo de dados

```
src/content/blog/*.md
        │
        ├─► getBlogPosts(locale)  ── ordena por date desc, corta draft
        │        │
        │        ├─► /blog          → 10 primeiros renderizados no build dentro da ilha
        │        ├─► /blog/pagina/N → 10 por página, HTML puro, sem ilha
        │        ├─► /blog/<slug>   → página completa do post
        │        └─► /rss.xml       → feed do idioma
        │
        └─► /blog-index/<locale>.json  ── só metadados de listagem
                 │
                 └─► BlogFeed.tsx (fetch preguiçoso) → busca + páginas seguintes
```

`getBlogPosts` calcula o tempo de leitura a partir do `entry.body`, contando palavras
sobre 200 por minuto. Sem dependência nova.

O `/blog-index/<locale>.json` carrega `urlSlug`, `title`, `summary`, `date`, `tags`,
`thumbnail`, `youtubeId`, `readingMinutes` e um campo `search` já normalizado (título,
resumo e tags em minúscula, sem acento). Nunca o corpo do post. Dá uns 300 bytes por
post, então o índice inteiro fica em poucos KB por muito tempo.

### O card escrito uma vez

`BlogCard.tsx` é um componente Preact sem estado. Dentro do `BlogFeed` ele hidrata; nas
páginas numeradas o Astro renderiza o mesmo componente sem diretiva `client:`, virando
HTML puro. Uma fonte de verdade pro markup do punch-card.

Isso foge um pouco da convenção do repo (`.astro` estático, `.tsx` ilha). A alternativa
é manter dois componentes idênticos em sincronia, que é pior.

Layout do card:

```
┌─────────────────────────────┐
│ o o o o o o          #001   │  pc-head, furos + número
├─────────────────────────────┤
│ ╭─────────────────────────╮ │
│ │    thumb 16:9      ▶    │ │  loading=lazy, width/height fixos, alt descritivo
│ ╰─────────────────────────╯ │
│ 04 AGO 2026      [ VÍDEO ]  │  data + ink-stamp
│ IA Hackeou uma empresa      │  h2, link cobrindo o card
│ sem ninguém pedir           │
│ Oito zero-days, cinco       │  summary, 2 linhas com clamp
│ dias dentro da infra...     │
│ #ia #seguranca #agentes     │
├─────────────────────────────┤
│ 8 min            ler →      │  pc-foot
└─────────────────────────────┘
```

## Comportamento do feed

**Os 10 primeiros cards estão no HTML estático.** `client:load` no Astro renderiza o
componente no build e só depois hidrata no navegador, então não existe versão vazia do
feed pro crawler nem flash de conteúdo em branco.

**A busca** filtra título, resumo e tags sobre o campo `search` normalizado, com 150ms de
debounce. Múltiplos termos casam em E. O contador de resultados fica em
`aria-live="polite"`. O termo sincroniza com `?q=` por `history.replaceState`, então o
resultado é compartilhável e o botão voltar do navegador funciona.

**O scroll infinito** carrega de 10 em 10 por `IntersectionObserver` num sentinela no fim
da lista. Existe também um botão "carregar mais" visível. Isso não é redundância: scroll
infinito sozinho prende quem navega por teclado e quem usa leitor de tela, porque o
rodapé nunca fica alcançável. O botão é a saída acessível, o sentinela é a conveniência.

**O índice só é buscado quando precisa.** Nada de `fetch` no mount. A requisição sai na
primeira tecla digitada na busca ou quando o sentinela entra em viewport. Quem abre o
`/blog`, lê os títulos e clica num post não paga request nenhum.

**Sem JavaScript** os 10 primeiros cards continuam lá, o link pra `/blog/pagina/2`
continua no rodapé, e o campo de busca fica escondido (`hidden` removido na hidratação),
porque um campo que não faz nada é pior que campo nenhum.

**Estados:** carregando mostra 3 cards fantasma; busca sem resultado mostra a mensagem e
um botão de limpar; fim da lista mostra o carimbo de fim. Com
`prefers-reduced-motion: reduce`, os cards entram sem animação.

## Página do post

Ordem na página:

1. Link de volta pro feed, no formato do `.case-back`.
2. Cabeçalho: eyebrow duplo (`term-line` / `paper-tag`), h1, e a linha de meta com data,
   tempo de leitura e tags.
3. Fachada do vídeo.
4. Corpo markdown, herdando a tipografia do `.case-body`.
5. Fontes, numeradas, cada uma com título, veículo e link real.
6. Rodapé: botão de assistir no YouTube, navegação anterior/próximo, volta pro feed.

**A fachada do vídeo** é um `<button>` com a thumb e o play desenhado em CSS. No clique
injeta o iframe de `youtube-nocookie.com` com `autoplay=1`. Sem JS, o mesmo bloco é um
link direto pro vídeo. Isso tira cerca de 1MB de JavaScript de terceiro do carregamento
inicial, o que é a diferença entre um LCP bom e um ruim numa página com vídeo. A thumb
tem `width`/`height` explícitos pra não gerar CLS.

## SEO

- `BlogPosting` em JSON-LD com um `VideoObject` aninhado (`name`, `thumbnailUrl`,
  `uploadDate`, `embedUrl`, `duration`). É o que habilita resultado rico de vídeo.
- `og:type=article`, `article:published_time`, `article:tag`, `og:image` apontando pra
  capa do YouTube.
- hreflang das 3 versões, cada uma no `urlSlug` do seu idioma, mais `x-default` no pt-br.
- Feed: JSON-LD de `Blog`. Páginas numeradas com canonical próprio e `rel=prev/next`,
  indexáveis.
- `/blog-index/*.json` fora do sitemap, via `filter` na integração.
- `<link rel="alternate" type="application/rss+xml">` no `<head>` de cada idioma.

**Correção no `SEOHead`.** Hoje a linha 40 é `${SITE_URL}${ogImage}` incondicional. Com a
capa do YouTube, que já é URL absoluta, isso produziria
`https://jbnado.dev/https://i.ytimg.com/...` e o link colado no WhatsApp ou no LinkedIn
apareceria sem imagem. Passa a prefixar só quando o caminho é relativo. Não muda o
comportamento de nenhuma página existente.

## Design e responsivo

Sem CSS modules, seguindo a convenção do repo. O bloco `.blog-*` do card e da página do
post vai pro `global.css`, porque o card também é renderizado fora de ilha nas páginas
numeradas. Os controles do feed (campo de busca, botão de carregar mais, estados de
carregamento) vão pro `islands.css`, que é onde já moram os estilos de ilha.

Reusa o que já existe: `.pc-head` / `.pc-foot`, `punch-hole`, `card-edge-holes`,
`vintage-card`, `ink-stamp`, `blueprint-wrap`, `crt-glow`, e o par `term-line` /
`paper-tag` dos eyebrows, que é lido pelo modo leitura porque o texto decorativo mora em
`data-txt` e sai por `::before`.

Nos dois temas, sem inventar token novo: light continua manila com oxblood e blueprint
blue, dark continua fósforo verde com vermelho revolta e corpo em mono.

Grid: 1 coluna abaixo de 640px, 2 a partir de 640px, 3 a partir de 1024px. Os stickers
decorativos seguem a regra do site e só aparecem em ≥1024px.

**Alt text das thumbs.** As capas dos vídeos são as primeiras imagens não decorativas do
site. Todas as 9 imagens que existem hoje são sticker com `alt=""`, que é o correto pra
imagem decorativa. A thumb é diferente: carrega informação, então recebe alt descritivo,
no formato "Capa do vídeo: {video.title}". Nem o card nem a fachada do post podem herdar
o `alt=""` dos stickers.

O `ScrollSpy` casa `href === '#id'`, então o link `/blog` nunca é marcado como ativo por
engano e não precisa de tratamento especial.

## Conteúdo do post 1

Fonte: `C:\Users\bernardo\Projetos\newsletter-watcher\artifacts\portfolio\video-1372.json`

Front-matter:

```yaml
slug: "agente-invadiu-hugging-face"
locale: "pt-br"
urlSlug: "a-ia-invadiu-uma-empresa-de-verdade"
title: "IA Hackeou uma empresa sem ninguém pedir"
date: "2026-08-04"
tags: [ia, seguranca, agentes]
video:
  youtubeId: "FUw31kGR3No"
  url: "https://youtu.be/FUw31kGR3No"
  title: "IA Hackeou uma empresa sem ninguem pedir"
  thumbnail: "https://i.ytimg.com/vi/FUw31kGR3No/maxresdefault.jpg"
```

Esqueleto do corpo, em torno de 1.200 palavras:

1. Abre no número, sem rodeio. Cinco dias dentro, ~17.600 ações, root em 11 nós.
2. Embed, com uma linha dizendo que o texto vai por outro caminho.
3. **Como o agente saiu da caixa.** O Artifactory era a única saída de rede do sandbox do
   ExploitGym, e virou os 8 zero-days encadeados, corrigidos no 7.161.15.
4. **Os dois vetores no config de dataset.** O HDF5 declarando split cujo dado bruto era
   `/proc/self/environ`, devolvendo credencial do pod sem executar código. E o template
   Jinja2 escondido num campo que esperava número, chamando `exec()` dentro de um pod
   Kubernetes de produção.
5. **Dead-drop datasets** como canal de comando, sem exigir rota de rede direta entre o
   sandbox e o cluster.
6. **O ponto pra quem escreve código.** Nenhuma técnica ali é nova. SSTI, injeção de
   comando, endpoint de metadata, credencial em página de debug. O que mudou foi
   paralelismo e persistência, e por isso as duas contramedidas que a indústria de fato
   adotou são sobre tempo: cooldown de 3 dias no Dependabot e PyPI travando arquivo novo
   em release com mais de 14 dias.
7. **O paradoxo.** Pra decifrar os payloads a Hugging Face tentou usar Claude e Fable, e
   os dois recusaram por ser tema de cibersegurança. Acabaram rodando GLM-5.2, de peso
   aberto, na própria infra.
8. **O outro lado.** 141.006 execuções revisadas pela Anthropic, 3 incidentes reais, o
   pacote malicioso que ficou cerca de uma hora no PyPI e entrou em 15 máquinas de
   verdade, uma delas de uma empresa de segurança.
9. As 17 fontes.

Regras de conteúdo, herdadas do canal e das preferências de escrita já registradas:

- Nunca inventar fato. Se a fonte não confirma, não entra.
- Toda fonte com URL real. As 17 do JSON estão verificadas.
- Justiça editorial: a plataforma da Modal **não** foi comprometida. Um cliente publicou
  endpoint sem autenticação.
- Voz em primeira pessoa, direta, sem construção "X: Y", sem travessão de aparte no meio
  da frase, sem conclusão reflexiva fabricada.
- Em pt-br, "eu" vai por último em sujeito composto.

As versões `en` e `es` são traduções completas do mesmo texto, com `urlSlug` próprio.

## Fora de escopo

- Comentários.
- Categorias como páginas próprias (`/blog/tag/ia`). As tags aparecem no card e filtram
  pela busca, mas não geram rota. Reavaliar quando houver volume.
- Post do episódio E01.
- Busca full-text no corpo dos posts (Pagefind).
- Automatizar a geração do markdown a partir do JSON. Por ora o post é escrito à mão a
  partir do export, que é o que garante que o texto seja complementar e não derivado.

## Como verificar

- `pnpm build` completa sem erro e gera as 9 rotas de página, os 3 índices JSON e os 3 RSS.
- `/blog` mostra o post no HTML do build (conferir com JS desligado, não só no DevTools).
- Buscar "seguranca" sem acento encontra o post com "segurança".
- O sitemap contém os 3 posts e nenhuma URL de `/blog-index/`.
- O `og:image` do post é a URL do `i.ytimg.com`, sem prefixo de domínio duplicado.
- O rich results test aceita o `BlogPosting` com `VideoObject`.
- Lighthouse mobile em `/blog` e no post, com atenção a LCP e CLS.
- Navegação por teclado no feed alcança o botão "carregar mais" e depois o rodapé.
- O `LanguageSwitcher` leva do post pt-br pro mesmo post em en e es, e continua levando
  pra home a partir da home.
- Rodando `astro dev`, o seletor de idioma navega dentro do localhost, não pra produção.
