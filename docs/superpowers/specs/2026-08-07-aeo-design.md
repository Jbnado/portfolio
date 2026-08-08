# AEO/GEO e identidade autoral — design

Data: 2026-08-07
Origem: relatório do check.aeojs.org sobre jbnado.dev, score 72/100

## O que motivou

Um checker automático de AEO apontou 7 problemas. **Três são falsos negativos, dois são
recomendações que pioram o site, e o resto é real.** Este documento registra a triagem,
porque a parte mais valiosa aqui é o que decidimos **não** fazer.

### Falsos negativos, verificados contra o repo

| Alegação do relatório | Realidade |
|---|---|
| "Remove blanket disallow" e "Allow GPTBot" | `public/robots.txt` é `User-agent: *` / `Allow: /`. Não existe disallow. O próprio relatório marca os 23 crawlers como liberados nas linhas 22 e 24, contradizendo a recomendação. |
| "sitemap.xml — Missing" | O `@astrojs/sitemap` gera `/sitemap-index.xml` e o `robots.txt` declara isso. O checker sondou `/sitemap.xml` literalmente e levou 404. |
| "Images have alt text — Missing" | As 9 imagens do site são stickers decorativos, todos com `alt=""`, que é o **correto**. Seguir a recomendação faria o leitor de tela anunciar "Killua, Gon, caveira" no meio da leitura. |
| "Add sameAs social profiles" | Já existia em `SEOHead.astro`, com LinkedIn e GitHub. |

### Recusados de propósito

- **`FAQPage`**. O Google cortou o rich result de FAQ para praticamente todo site em 2023.
  Inventar um FAQ que não existe para ganhar 4 pontos de um checker é schema spam.
- **`Organization`**. Tipo errado para portfolio pessoal. `Person` é o correto e é o que
  está lá. O problema real por trás da recomendação era o `Person` ser magro demais.
- **`SearchAction`**. Descontinuado pelo Google.
- **`SearchAction`**. Descontinuado pelo Google.

### Confirmados pelo João em 2026-08-08

`email`, `worksFor` e `alumniOf` ficaram de fora na primeira passada porque não dava para
verificar sem adivinhar. O João confirmou depois, e os três entraram:

- `worksFor`: Verzel, e é o vínculo **atual**. A timeline mostrava "2025 @ Verzel" sem
  data de fim, o que também poderia ser emprego passado.
- `alumniOf`: Fatec Ribeirão Preto. O `projects.json:220` já citava "FATEC" no case do
  Ribeirão Noir, mas sem o campus.
- `email`: `contato@jbnado.dev`.

**Divergência aberta:** a `ContactSection.astro:92` monta o mailto do botão "Email" com
`bernardojoao9@gmail.com`. O schema agora declara `contato@jbnado.dev`. São endereços
diferentes na mesma página, e vale unificar.

## O que foi feito

### 1. Entidade `Person` consolidada por `@id`

Antes, o `Person` só aparecia nas páginas que não passavam `jsonLd` próprio, ou seja, só
na home. Case study e post do blog o substituíam inteiro e declaravam um `author` solto,
com nome e URL repetidos. Para o buscador, isso é um autor diferente por página.

Agora existe `PERSON_ID` em `src/utils/constants.ts`, e:

- O `SEOHead` emite o `Person` completo em **toda** página, com esse `@id` estável.
- Páginas com schema próprio emitem **dois** blocos JSON-LD, o da página e o `Person`.
- `BlogPosting`, `TechArticle` e `Blog` referenciam `author: { '@id': PERSON_ID }` em vez
  de repetir os dados.

Campos novos no `Person`, todos verificáveis no próprio site: `alternateName` (Jbnado),
`description` (traduzida por idioma, vem de `hero.description`), `image`, `address`
(Ribeirão Preto, SP, BR), `knowsAbout` com 21 itens tirados do `techStack` real dos
projetos, e o canal do YouTube somado ao `sameAs`.

### 2. Foto de perfil

`public/jbnado.jpg` (512×512, 42KB) para o `Person.image` e `public/jbnado.webp`
(160×160, 5KB) para a assinatura visível no fim de cada post.

**Detalhe que quase virou um problema sério:** o canal do João é `youtube.com/@jbnad`, e
não `@Jbnado`. A primeira busca pegou o avatar de `@Jbnado`, que é outra pessoa. A
verificação foi via oEmbed do vídeo publicado, que devolve o `author_url` correto. Sempre
confirmar a titularidade do canal pelo oEmbed de um vídeo antes de usar a imagem.

### 3. `llms.txt` gerado no build

`src/pages/llms.txt.ts` monta o índice a partir das mesmas collections que alimentam as
páginas. Nunca escrito à mão, senão envelhece na primeira publicação e passa a mentir.

**Ressalva honesta:** nenhum crawler grande documentou publicamente que consome esse
arquivo. É convenção emergente, não padrão. Custa pouco e não faz mal, mas não é ganho
garantido.

### 4. `CreativeWork` → `TechArticle` nos case studies

Tipo mais específico, mais `datePublished` (vindo do `startDate` real do projeto),
`publisher`, `mainEntityOfPage` e `proficiencyLevel`. Seis arquivos de rota.

### 5. Redirect `/sitemap.xml` → `/sitemap-index.xml`

Duas linhas no `vercel.json`. Crawler sério lê o `robots.txt`, mas ferramenta e crawler
menor sondam o caminho canônico na unha.

## O achado que não estava no relatório

Durante a verificação, servindo o `dist` com os headers reais do `vercel.json`, apareceu
o problema mais grave de todos, e ele era **do blog, não do AEO**:

```
img-src 'self' data:
```

A CSP de produção bloqueava as thumbs do `i.ytimg.com`, e a ausência de `frame-src`
fazia o iframe do YouTube cair no `default-src 'self'`, também bloqueado. **O blog inteiro
teria ido ao ar com as capas quebradas e o vídeo sem tocar.**

Não apareceu antes porque o `astro dev` não aplica os headers do `vercel.json`. A
verificação toda do blog rodou contra o servidor de desenvolvimento.

Correção:

```
img-src 'self' data: https://*.ytimg.com;
frame-src https://www.youtube-nocookie.com;
```

**Lição operacional que vale mais que o conserto:** qualquer recurso de terceiro novo
(imagem, iframe, fonte, fetch) precisa ser verificado contra a CSV do `vercel.json` antes
do deploy, servindo o `dist` com os headers reais. Um script de servidor estático que lê
o `vercel.json` e aplica os headers resolve isso em um minuto.

## Fora de escopo

- Métricas de resultado. Não dá para prometer mudança de posição na busca ou taxa de
  citação em LLM. O que dá para afirmar é que são dados verdadeiros antes ausentes.
- `Organization`, `FAQPage`, `SearchAction`, alt em imagem decorativa.
- Mudança no `robots.txt`, que já está correto.
