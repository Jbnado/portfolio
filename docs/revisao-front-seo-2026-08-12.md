# Revisão de Frontend & SEO — 12 de Agosto de 2026

**Projeto:** Portfolio João Bernardo ([https://jbnado.dev](https://jbnado.dev))
**Stack:** Astro 5.17.1, Preact 10.28, Tailwind CSS v4.1.18, adapter Vercel, pnpm 9.15.4
**Escopo:** árvore de trabalho **atual**, incluindo as 9 alterações não commitadas
**Natureza:** somente leitura, build e testes. Nenhum arquivo em `src/` foi alterado, nenhum commit criado.

---

## 1. Validação real executada

Tudo abaixo foi rodado de fato nesta máquina, não inferido por leitura.

| Comando | Resultado |
| :--- | :--- |
| `pnpm install` | OK em 2,3s. Lockfile íntegro, sem `peer dependency` quebrada. |
| `pnpm test` (`vitest run`) | **2 arquivos, 25 testes, 25 passando, 0 falhas** (1,08s). Suítes: `src/utils/blog.test.ts`, `src/utils/constants.test.ts`. |
| `pnpm build` (`astro build`) | **34 páginas em 9,50s**, mais `sitemap-index.xml`, `sitemap-0.xml`, 3 feeds RSS e 9 imagens WebP otimizadas. Zero warning. |
| `dist/` servido em `http://127.0.0.1:4321` | 26 rotas e assets testados, **todos 200**. Nenhuma referência quebrada: `/jbnado.jpg` (usado no JSON-LD `Person`), os três PDFs de CV, ícones do manifest, fontes e `og-image.png` existem. |

Análise adicional feita sobre o HTML gerado, não sobre o código-fonte: extração de `<title>`, `description`, `canonical`, hierarquia de headings, `<img>`, landmarks e ilhas hidratadas de todas as 34 páginas.

**Sobre os headers de segurança:** servir o `dist` localmente **não** valida o `vercel.json`. Nem `astro dev` nem `astro preview` nem um servidor estático aplicam aqueles headers, porque quem os aplica é a borda da Vercel. O que dá para verificar localmente, e foi o que fiz, é o outro lado da equação: **quais origens externas o HTML construído realmente chama**. Cruzando isso com a política declarada em `vercel.json` dá para afirmar com segurança o que a CSP bloqueia (ver item C-2).

### Decisões de projeto respeitadas (não reportadas como problema)

- Tema padrão claro sem detecção de `prefers-color-scheme`.
- Stickers decorativos só a partir de 1024px.
- CSS único em `src/styles/global.css`, sem CSS Modules.

---

## 2. TAREFA 1 — As correções aplicadas resolvem o que as auditorias apontaram?

Resumo: **as três correções funcionam e não encontrei regressão em nenhuma delas.** Uma está completa pela metade em relação ao que a auditoria pediu, e isso está detalhado abaixo.

### V1. Trap de foco do menu mobile — RESOLVIDO

**Local:** `src/islands/MobileNav.tsx:126-133`, `src/styles/islands.css:100-122`

O botão de fechar entrou **dentro** do `drawerRef`, que era exatamente o que faltava. Verificação item a item:

- **Ciclo de foco fechado.** O seletor do trap (`MobileNav.tsx:68-70`) é `a[href], button, [tabindex]:not([tabindex="-1"])`. O `<button class="mobile-nav-close">` é o primeiro nó do `drawerRef`, então vira o `first` da lista e o link de CV vira o `last`. `Tab` a partir do CV volta pro fechar, `Shift+Tab` a partir do fechar vai pro CV. O ciclo agora inclui uma saída.
- **Foco inicial.** `first.focus()` (linha 75) passou a pousar no botão de fechar em vez do primeiro link, que é o comportamento padrão esperado de um `dialog`.
- **Retorno do foco.** `close()` chama `triggerRef.current?.focus()` (linha 35). Funciona pelas quatro vias de fechamento: botão de fechar, `Escape`, clique no overlay e clique num link.
- **Foco visível.** `.mobile-nav-close` não declara `:focus-visible` própria, mas herda a regra global de `global.css:173-176` (`outline: 2px solid var(--color-accent)`). No escuro é verde sobre fundo quase preto, no claro é oxblood sobre papel. Visível nos dois.
- **Alvo de toque.** 44x44px explícitos (`islands.css:107-108`). Dentro do WCAG 2.5.8.
- **`prefers-reduced-motion`.** A `transition` de `color`/`border-color` do botão e a animação `slide-in-right` da gaveta são neutralizadas pela regra global `*` de `global.css:161-170`. O bloco local de `islands.css:265-268` cobre só dois seletores do blog, mas é redundante: a regra global já resolve.
- **Contraste.** Borda `--color-border` e texto `--color-text-primary`, ambos tokens de tema. Sem cor fixa. Correto.

**Lacuna residual (baixa):** o fundo não fica `inert` enquanto a gaveta está aberta. O `aria-modal="true"` (linha 119) resolve para o modo de navegação por foco, mas leitores de tela em cursor virtual ainda alcançam o conteúdo de trás. É a limitação clássica de `aria-modal` sem `inert`. Está listado como N-16.

### V2. CTA primário na Hero — RESOLVIDO

**Local:** `src/components/HeroSection.astro:67-70` e `:233-269`

- **Contraste, tema claro.** `.hero-cta-primary` usa `background: var(--color-accent)` com `color: var(--color-bg-primary)`, ou seja `#f2efe4` sobre `#8f2d24`. **7,10:1**, AAA.
- **Contraste, tema escuro.** `#0a0f0c` sobre `#42f59b`. **13,6:1**, AAA. Essa é a escolha certa e vale sublinhar porque quatro outros botões do site fazem o oposto (N-1).
- **Alvo de toque.** `min-height: 44px` mais `padding: 0.75rem 1.25rem`. Passa no WCAG 2.5.8.
- **Foco.** Sem `outline: none`. Herda o `:focus-visible` global.
- **i18n.** As três chaves novas (`hero.ctaProjects`, `hero.ctaContact`) existem nos três arquivos e saem traduzidas no HTML construído: `Ver projetos | Fala comigo`, `View projects | Say hello`, `Ver proyectos | Hablemos`.
- **Âncoras válidas.** `#projetos` e `#contacto` existem como `id` de `<section>` no HTML gerado das três home pages, porque as três montam os mesmos componentes.
- **Telas pequenas.** `.hero-cta` é `flex` com `flex-wrap: wrap` e `gap: 0.75rem`. Em 360px os dois botões somam cerca de 312px contra 328px de área útil. Cabem, apertados, e se não coubessem quebrariam em duas linhas. Sem overflow horizontal.
- **`prefers-reduced-motion`.** As `transition` de 150ms caem na regra global, e o `.hero-stagger` tem o override explícito `opacity: 1 !important` (`HeroSection.astro:308-312`), então o bloco de CTA não fica invisível.
- **Sem regressão de ordem.** O `--stagger` do bloco de stats foi corretamente reindexado de 5 para 6.

### V3. Tipografia do tema escuro — RESOLVIDO, mas só metade do que a auditoria pediu

**Local:** `src/styles/global.css:702-705`

- **Funciona, e o mecanismo de cascata está certo.** `.dark body { font-family: var(--font-mono) }` mora dentro de `@layer base` (`global.css:150-155`). A nova regra `.dark .case-body { font-family: var(--font-sans) }` está fora de qualquer layer, e estilo sem layer vence estilo em layer independente de especificidade. A troca acontece de verdade.
- **Cobre o blog também**, o que não é óbvio pelo diff. `BlogPostPage.astro:99` renderiza `<div class="post-body case-body">`, então posts longos herdam a mesma correção que os case studies. Era o pedido central da auditoria visual.
- **Títulos e código continuam em mono**, porque `.case-body h2` e `.case-body pre/code` declaram `var(--font-mono)` explicitamente. A identidade não se perdeu.

**O que ficou de fora.** A auditoria visual pedia três coisas no mesmo item: trocar a fonte, desligar o `text-shadow` nos parágrafos e suavizar a cor do corpo. Só a primeira foi feita. Sobre as outras duas:

- O `text-shadow` **já não existia** em parágrafo nenhum. Verifiquei as 12 ocorrências de `text-shadow` em `global.css` e todas atingem título, badge, linha de terminal ou card. Nenhuma pega `p`. Essa parte da recomendação partia de premissa errada e não há o que corrigir.
- A cor do corpo continua em `--color-text-secondary` (`global.css:709`), que é justamente o item #4 da auditoria visual e segue aberto. Está registrado como pendência na tabela da seção 3, não como regressão.

### V4. Sincronia de i18n — RESOLVIDO, e o conjunto inteiro está íntegro

Comparei as três árvores de tradução achatadas em notação de ponto: **127 chaves, zero divergência**. Nenhuma chave existe em um arquivo e falta em outro. As quatro chaves novas do diff (`nav.menuLabel`, `hero.ctaProjects`, `hero.ctaContact` e a manutenção de `nav.openMenu`/`nav.closeMenu`) entraram nos três idiomas.

Além disso, o `MobileNav` deixou de ter rótulo fixo em português. `NavBar.astro:60-67` passa `openLabel`, `closeLabel` e `menuLabel` traduzidos, e os defaults em português no componente (`MobileNav.tsx:25-27`) são apenas rede de segurança para uso sem props.

**Só que o mesmo problema segue vivo em dois outros componentes** que o diff não tocou, e são componentes mais expostos que o menu mobile. Ver N-2.

---

## 3. TAREFA 2 (parte A) — Estado dos achados das auditorias anteriores

Cada item foi reverificado no código atual e no HTML construído. Nada aqui é achado novo.

| # | Achado original | Status hoje |
| :--- | :--- | :--- |
| Front A-1 | Trap de foco no menu mobile | **CORRIGIDO** (ver V1) |
| Front A-2 | CSP bloqueia o Vercel Speed Insights | **CONFIRMADO, aberto.** O HTML de todas as 34 páginas carrega `https://va.vercel-scripts.com/v1/speed-insights/script.js` por script inline. `vercel.json:20` mantém `script-src 'self' 'unsafe-inline'` e `connect-src 'self'`. O script externo é bloqueado antes mesmo de chegar ao beacon. As métricas de CWV não saem. |
| Front A-3 | `<title>` duplicado entre idiomas | **CONFIRMADO, aberto e mais amplo que o relatado.** No build atual: `UpWatch — João Bernardo`, `Instanta — João Bernardo`, `gather-bots — João Bernardo`, `Ribeirão Noir — João Bernardo`, `ADG — Arena Draft Guide — João Bernardo`, `Alethe — João Bernardo` e `Blog — João Bernardo` são idênticos nas 3 línguas. `/`, `/en/` e `/es/` compartilham `João Bernardo — Fullstack Developer`. Causa raiz: `seo.title` e `blog.seoTitle` têm valor idêntico nos três JSONs. As `description`, por contraste, estão traduzidas. |
| Front B-4 | Alvos de toque < 44x44px | **CONFIRMADO, aberto.** `.lang-trigger` segue com `padding: 0.375rem 0.5rem` e fonte de 0.75rem (`LanguageSwitcher.astro:67`, ~26px de altura). `.theme-toggle` segue em `padding: 0.5rem` com ícone de 20px (`islands.css:8`, 36px). `.blog-search-clear` segue em 1.5rem x 1.5rem (`islands.css:199-200`, 24px). |
| Front B-5 | Meta description da home reaproveitada na 404 | **CONFIRMADO, aberto.** `dist/404.html` traz a mesma description de 128 caracteres de `dist/index.html`. E há um agravante não relatado: ver N-5. |
| Front B-6 | Meta description > 160 caracteres nos case studies | **CONFIRMADO, e o problema é maior do que "case studies".** Medi as 34 páginas: 21 passam de 160. Case studies vão de 192 a 443 caracteres, e os **posts do blog também estouram** (227, 231, 248), o que a auditoria não mencionou. Só as home pages e os índices de blog estão dentro do limite. |
| Front B-7 | Stickers decorativos sem `aria-hidden` | **CONFIRMADO, aberto.** As 10 `<Image>` decorativas continuam só com `alt=""`. Baixa gravidade real, já que `alt=""` remove o elemento da árvore de acessibilidade em navegadores atuais, mas o custo da correção também é baixo. |
| Front B-8 | `outline: none` em `.skip-to-content:focus-visible` | **CONFIRMADO, aberto** (`SkipToContent.astro:31`). E o mesmo arquivo tem um problema pior na linha 21: ver N-1. |
| Front B-9 | Seções sem `<h2>` semântico | **CONFIRMADO, aberto.** A extração de headings do `dist/index.html` mostra `h1 → h2 Sobre Mim → h2 Percurso → h2 Projetos` e **nenhum h2 na seção de contato**. `ContactSection.astro:44` segue como `<p class="contact-cta">`. |
| Front C-10 | `aria-haspopup` redundante no `<summary>` | **CONFIRMADO, aberto** (`LanguageSwitcher.astro:46`). Ver também N-9, que é o problema mais grave do mesmo componente. |
| Front C-11 | Preload da Permanent Marker desperdiça banda | **CONFIRMADO, e o diagnóstico estava incompleto.** Não é só desperdício. O preload está apontando para a fonte errada. Ver N-3, que é achado Alto. |
| Front C-12 | Metadados de case study em `div` em vez de `<dl>` | **CONFIRMADO, aberto** (`CaseStudyPage.astro:63-70`). |
| Visual A-1 | Fadiga de leitura no escuro | **CORRIGIDO no essencial** (ver V3). |
| Visual A-2 | Falta de CTA na Hero | **CORRIGIDO** (ver V2). |
| Visual A-3 | Ordem das seções na home | **ABERTO.** `index.astro:12-18` mantém Hero → About → Timeline → Projects → Contact. É recomendação de produto, não defeito. Fica a critério do João. |
| Visual B-4 | `.case-body p` em cor secundária | **CONFIRMADO, aberto** (`global.css:709`). Vale a ressalva de que não é falha de WCAG: `#4fbf85` sobre `#0a0f0c` dá 9,1:1 e `#5f636e` sobre `#f2efe4` dá 5,1:1. Os dois passam em AA. É hierarquia visual, não contraste. |
| Visual B-5 | Contraste baixo das bordas de card | **CONFIRMADO, aberto** (`global.css:86` e `:107`). |
| Visual B-6 | Título da 404 e das páginas paginadas sem marca | **PARCIALMENTE REFUTADO.** A parte da 404 procede: `dist/404.html` traz `<title>Página não encontrada</title>` sem sufixo. A parte das páginas paginadas **está errada**. `BlogFeedPage.astro:44` monta `${t('blog.seoTitle')} — ${pageLabel}`, e `blog.seoTitle` já é `"Blog — João Bernardo"`. O título da página 2 sairia como `Blog — João Bernardo — Página 2 de N`, com a marca presente. Além disso a rota `/blog/pagina/[page]` só gera saída a partir do segundo lote de posts (`blog/pagina/[page].astro:6-13`) e hoje há 1 post, então **nenhuma página paginada existe no build**. |
| Visual B-7 | `og:image` estática para todas as páginas | **CONFIRMADO, aberto.** `SEOHead.astro:20` mantém `/og-image.png` como default. A infraestrutura para resolver já existe: o prop `ogImage` percorre `BaseLayout → SEOHead` e `SEOHead.astro:41` já trata URL absoluta. Falta só popular por conteúdo. |
| Visual B-8 | `MobileNav` com `client:load` | **CONFIRMADO, aberto.** `NavBar.astro:60` segue em `client:load`. Confirmado no build: `dist/index.html` traz `<astro-island client="load">` para `MobileNav.DrQhTk2c.js` mesmo em viewport de desktop, onde `.mobile-nav-trigger` está em `display: none` (`islands.css:43-47`). |
| Visual B-9 | `line-height: 0.95` no `.hero-title` | **CONFIRMADO, aberto** (`HeroSection.astro:212`). |
| Visual B-10 | `.case-meta` quebrando em 360px | **CONFIRMADO, aberto** (`global.css:696`). |

---

## 4. TAREFA 2 (parte B) — Achados NOVOS

Nenhum dos itens abaixo aparece nas duas auditorias anteriores.

### A. IMPACTO ALTO

#### N-1. [Acessibilidade / Contraste] Texto branco fixo sobre fundo `--color-accent` falha no tema escuro em quatro componentes

- **Local:** `src/components/NavBar.astro:204`, `src/components/SkipToContent.astro:21`, `src/styles/islands.css:152`, `src/pages/404.astro:85`
- **O que está errado:** os quatro componentes usam `background: var(--color-accent)` com a cor de texto **fixada** em `#ffffff` / `white`, sem nenhum override `.dark`. Confirmei por grep que não existe `.dark .navbar-cv`, `.dark .skip-to-content`, `.dark .mobile-nav-cv` nem `.dark .not-found-link` em lugar nenhum de `src/`. No tema claro o accent é oxblood `#8f2d24` e branco sobre ele dá 8,17:1, tudo bem. No tema escuro o accent é verde-fósforo `#42f59b`, e **branco sobre `#42f59b` dá 1,42:1**. Os componentes afetados são o botão de CV do navbar (visível em toda página, desktop), o skip link (primeiro elemento focável de toda página), o botão de CV da gaveta mobile e o botão de volta da 404.
- **Por que importa:** falha direta de WCAG 1.4.3 (mínimo 4,5:1) em elementos permanentes de navegação, no tema que é metade da identidade do site. Em `prefers-contrast: high` fica pior, porque `global.css:180` clareia o accent para `#6affb3`. É a mesma classe de erro que o CTA novo da Hero acertou ao usar `var(--color-bg-primary)`, o que mostra que o padrão correto já está estabelecido no projeto.
- **Correção sugerida:** trocar `color: #ffffff` por `color: var(--color-bg-primary)` nos quatro. Dá 13,6:1 no escuro e 8,9:1 no claro, sem override por tema e sem token novo.
- **Esforço:** Mínimo (10 min, 4 linhas).
- **Vale a pena corrigir?** **SIM.** É o achado de melhor relação custo-benefício desta revisão.

#### N-2. [Acessibilidade / i18n] Skip link e botão de tema com rótulo fixo em português nas três línguas

- **Local:** `src/components/SkipToContent.astro:7` combinado com `src/layouts/BaseLayout.astro:99`, e `src/islands/ThemeToggle.tsx:61-64`
- **O que está errado:** verificado no HTML construído das três home pages. `/`, `/en/` e `/es/` renderizam **todas** `<a class="skip-to-content">Saltar para o conteúdo</a>` e `<button aria-label="Mudar para modo escuro" role="switch">`. O `SkipToContent` aceita props `href` e `label`, mas `BaseLayout.astro:99` o invoca sem nenhuma delas, então o default português vale sempre. O `ThemeToggle` sequer aceita prop de rótulo e monta a string internamente.
- **Por que importa:** o skip link é, por definição, **o primeiro elemento focável de toda página**. Um usuário de leitor de tela em `/en/` recebe português como primeira informação da sessão, dentro de um documento declarado `lang="en"`. Isso viola WCAG 3.1.2 (Language of Parts), porque o texto está em idioma diferente do documento sem marcação. O toggle de tema tem o mesmo problema e aparece em toda página. Ironicamente é exatamente o defeito que o diff pendente acabou de corrigir no `MobileNav`, aplicando o padrão certo, só que sem estendê-lo aos vizinhos.
- **Correção sugerida:** as chaves já existem. `a11y.skipToContent` ou equivalente pode entrar nos três JSONs seguindo o modelo de `nav.openMenu`. `BaseLayout` passa `label={t('a11y.skipToContent', locale)}` e `NavBar` passa `lightLabel`/`darkLabel` para o `ThemeToggle`, do mesmo jeito que já faz com o `MobileNav`.
- **Esforço:** Baixo (30 min, incluindo as 6 entradas de tradução).
- **Vale a pena corrigir?** **SIM.**

#### N-3. [Performance / Fontes] O preload aponta para a fonte do tema não-padrão, e a fonte do H1 do tema padrão nunca chega a tempo

- **Local:** `src/layouts/BaseLayout.astro:53-54`, `src/styles/global.css:22-43` (Sora) e `:57-67` (Permanent Marker)
- **O que está errado:** duas fontes recebem `<link rel="preload">`, Inter e Permanent Marker. O problema aparece ao cruzar isso com quem usa o quê:
  - `.hero-title` usa `var(--font-display)`, que é **Sora** (`global.css:138`). Esse `<h1>` é o elemento LCP da home no tema claro, que é o padrão.
  - **Sora não tem preload** e está declarada com `font-display: optional` (`global.css:26` e `:38`). `optional` dá à fonte uma janela de bloqueio de cerca de 100ms e **nunca faz swap depois**. Uma fonte de 33KB que só começa a ser descoberta depois do parse do CSS não ganha essa corrida em rede real. Na prática o H1 do primeiro acesso renderiza na fonte de fallback do sistema, e os 33KB de Sora são baixados para não serem usados naquela navegação.
  - **Permanent Marker tem preload** (29KB) e é usada só em `.dark .hero-title` (`HeroSection.astro:316`) e `.dark .case-title`. Para todo visitante no tema claro padrão são 29KB baixados com prioridade alta e zero pixel renderizado.
- **Por que importa:** é perda dos dois lados. Gasta banda prioritária com a fonte que não vai aparecer e deixa sem prioridade a fonte que assina visualmente o elemento mais importante da primeira dobra. O efeito visível é que o nome "João Bernardo" no tema claro sai na fonte errada no primeiro acesso, o que é um problema de identidade antes de ser de métrica.
- **Correção sugerida:** trocar o preload de `permanent-marker.woff2` por `sora-variable.woff2`. Se a Permanent Marker precisar de garantia no escuro, o preload dela pode ser emitido condicionalmente, já que `BaseLayout` conhece o tema no script inline de `:48-50`. Trocar `font-display: optional` por `swap` na Sora é a alternativa mais simples, com o custo de aceitar um FOUT no H1.
- **Esforço:** Baixo (20 min).
- **Vale a pena corrigir?** **SIM.**

#### N-4. [Core Web Vitals / LCP] O `<h1>` da home nasce com `opacity: 0` e atrasa o LCP por decisão de animação

- **Local:** `src/components/HeroSection.astro:301-305`, aplicado ao `<h1>` em `:57`
- **O que está errado:** `.hero-stagger` define `opacity: 0` e `animation-delay: calc(var(--stagger) * 100ms)`. O `<h1>` carrega `--stagger: 2`, ou seja começa invisível, espera 200ms e só então roda 500ms de `fade-in-up`.
- **Por que importa:** o LCP é cravado quando o maior elemento é **pintado de forma visível**. Elemento com `opacity: 0` não conta. Como o H1 é o candidato a LCP da home, essa animação empurra o LCP em algo entre 200ms e 700ms **depois** de o conteúdo já estar pronto para pintar. É atraso auto-infligido numa página que, fora isso, é rápida: 68,7KB de HTML, sem imagem no caminho crítico, cerca de 23KB de JS não comprimido no total. O `prefers-reduced-motion` já tem override em `:308-312`, então o problema atinge exatamente a maioria dos visitantes.
- **Correção sugerida:** animar só `transform` no H1 e deixar `opacity: 1`, ou remover `.hero-stagger` do H1 e manter o efeito nos elementos abaixo dele. O escalonamento visual se preserva quase inteiro e o LCP passa a marcar no primeiro paint.
- **Esforço:** Baixo (15 min, incluindo verificação visual nos dois temas).
- **Vale a pena corrigir?** **SIM.** É o único ganho de LCP realmente disponível nesta base.

### B. IMPACTO MÉDIO

#### N-5. [SEO Técnico] A página 404 se declara canônica da home e emite hreflang e JSON-LD de página real

- **Local:** `src/pages/404.astro:8` combinado com `src/components/SEOHead.astro:39`
- **O que está errado:** `404.astro` chama o `BaseLayout` sem `canonical` e sem `alternates`. O `SEOHead` então cai no fallback `hreflangMap[locale]` e o `dist/404.html` sai com `<link rel="canonical" href="https://jbnado.dev/">`, mais os quatro `<link rel="alternate" hreflang>` apontando para as home das três línguas e o `x-default`, mais o bloco JSON-LD completo de `Person`.
- **Por que importa:** a página de erro afirma para o buscador que seu conteúdo canônico é a home. É o padrão clássico de soft 404. O `noindex` em `404.astro:8` neutraliza a maior parte do estrago, porque `noindex` prevalece sobre `canonical`, e por isso o item não é Alto. Mas continua sendo sinal contraditório mandado de graça, e o hreflang recíproco fica sujo.
- **Correção sugerida:** passar `canonical={`${SITE_URL}/404`}` e `alternates={{}}` no `404.astro`, junto com o `description` que o achado B-5 anterior já pedia.
- **Esforço:** Mínimo (10 min).
- **Vale a pena corrigir?** **SIM.**

#### N-6. [SEO Técnico] Sitemap sem anotação de idioma e sem `lastmod`

- **Local:** `astro.config.mjs:17-21`
- **O que está errado:** o `sitemap-0.xml` gerado lista as 33 URLs como `<url><loc>...</loc></url>` puro. Sem `<xhtml:link rel="alternate" hreflang>` e sem `<lastmod>`. O `@astrojs/sitemap` sabe emitir os dois: o primeiro exige repassar a opção `i18n` para a integração, o segundo sai de `lastmod` ou `serialize`. O `astro.config.mjs` declara `i18n` no nível do Astro (`:26-33`) mas não repassa nada para a integração de sitemap, que hoje recebe só o `filter`.
- **Por que importa:** o site tem três versões de idioma de praticamente tudo, com hreflang correto no `<head>`. O sitemap é o segundo canal por onde o Google confirma esse agrupamento, e hoje ele não diz nada. Para um site de 34 páginas com 3 línguas, é sinal barato deixado na mesa. O `lastmod` ausente também tira do crawler a dica de recrawl nos posts do blog, que é justamente o conteúdo que muda.
- **Correção sugerida:** passar `i18n: { defaultLocale: 'pt-br', locales: { 'pt-br': 'pt-BR', en: 'en-US', es: 'es-ES' } }` para `sitemap()` e usar `serialize` para preencher `lastmod` a partir da data do post.
- **Esforço:** Baixo (30 a 45 min, contando conferir a saída).
- **Vale a pena corrigir?** **SIM.**

#### N-7. [Performance] A imagem LCP dos posts vem de terceiro sem `preconnect` e em resolução única

- **Local:** `src/components/VideoEmbed.astro:20`
- **O que está errado:** a fachada de vídeo renderiza `<img src="https://i.ytimg.com/vi/.../maxresdefault.jpg" width="1280" height="720" fetchpriority="high">`. Essa imagem é o maior elemento acima da dobra nos posts do blog e é o candidato a LCP deles. Não existe `<link rel="preconnect" href="https://i.ytimg.com">` em lugar nenhum do projeto, confirmado por grep. E `maxresdefault.jpg` é servido em 1280x720 fixo, sem `srcset`/`sizes`, para um container que em mobile tem menos de 400px.
- **Por que importa:** sem `preconnect`, o navegador só inicia DNS, TCP e TLS com `i.ytimg.com` depois de encontrar a tag, o que costuma custar de 100 a 300ms em 4G antes do primeiro byte da imagem LCP. E um JPEG 720p entregue para uma tela de 360px é banda descartada. O resto da fachada está muito bem feito, com `width`/`height` explícitos evitando CLS, `rel="noopener noreferrer"`, `aria-label`, fallback funcional sem JS e o iframe pesado só depois do clique. Só falta a camada de rede.
- **Correção sugerida:** adicionar `<link rel="preconnect" href="https://i.ytimg.com" crossorigin>` no `BaseLayout`, idealmente só nas páginas que têm vídeo. Trocar `maxresdefault.jpg` por `hqdefault.jpg` no mobile via `srcset`, ou baixar a capa para `src/assets` e servir pelo `<Image>` do Astro, o que também elimina a dependência de terceiro no caminho crítico.
- **Esforço:** Baixo para o preconnect (10 min), Médio para o `srcset` ou a internalização (1h).
- **Vale a pena corrigir?** **SIM** para o preconnect. O `srcset` fica a critério.

#### N-8. [Robustez / CSS] Os tokens de cor só existem dentro de `.light` e `.dark`, sem fallback em `:root`

- **Local:** `src/styles/global.css:74-114`
- **O que está errado:** todas as custom properties de cor são declaradas em `.dark { ... }` e `.light { ... }`. Não existe bloco `:root` com valores padrão, confirmado por grep. A classe é adicionada ao `<html>` pelo script inline de `BaseLayout.astro:48-50`. Se esse script não rodar, seja por JS desligado, erro de CSP ou falha de parse, **nenhuma** das variáveis fica definida. Toda declaração `color: var(--color-text-primary)` vira inválida em tempo de valor computado, e o site perde a paleta inteira de uma vez: fundo transparente, texto preto herdado, bordas invisíveis, accent sumido.
- **Por que importa:** é um ponto único de falha para a aparência de um site que, fora isso, é estático e funciona inteiro sem JS. Todo o resto da página é HTML pré-renderizado. Seria uma pena a paleta depender de uma linha de script.
- **Correção sugerida:** duplicar o bloco `.light` em `:root` como padrão. A classe `.light` continua existindo para o toggle e vence por especificidade. Custo em bytes é desprezível depois do gzip.
- **Esforço:** Mínimo (10 min).
- **Vale a pena corrigir?** **SIM.**

#### N-9. [Acessibilidade] O nome acessível do seletor de idioma está num elemento que não o expõe

- **Local:** `src/components/LanguageSwitcher.astro:45-46`
- **O que está errado:** o `aria-label` traduzido ("Mudar idioma", "Change language", "Cambiar idioma") está no `<details>`, e o `<details>` não tem role que aceite nome acessível de forma confiável entre navegadores. Quem tem role de botão e recebe o foco é o `<summary>`, e o `<summary>` não tem `aria-label`. O resultado é que o controle é anunciado apenas como o texto visível, "Português (Brasil)", sem dizer que serve para trocar de idioma.
- **Por que importa:** o rótulo traduzido já existe e já é passado, só está no elemento errado, então a intenção estava certa. Vale corrigir junto com o C-10 anterior, que é remover o `aria-haspopup` do mesmo `<summary>`, e junto com o alvo de toque do B-4. Três correções de uma linha no mesmo componente.
- **Correção sugerida:** mover o `aria-label` do `<details>` para o `<summary>`.
- **Esforço:** Mínimo (5 min).
- **Vale a pena corrigir?** **SIM.**

### C. IMPACTO BAIXO

#### N-10. [Performance] `ScrollSpy` é hidratado na 404, onde não há seção para observar

- **Local:** `src/layouts/BaseLayout.astro:35` e `:101`, consumido por `src/pages/404.astro:8`
- **O que está errado:** `showScrollSpy` tem default `true`. Blog, posts e as seis rotas de case study passam `false` explicitamente, mas a 404 não passa nada. Confirmado no build: `dist/404.html` traz `<astro-island client="idle">` para `ScrollSpy.Dg7dvi8j.js` numa página cujo conteúdo é um `<h1>`, um parágrafo e um link.
- **Correção sugerida:** `showScrollSpy={false}` no `404.astro`.
- **Esforço:** Mínimo (2 min).
- **Vale a pena corrigir?** **SIM**, é uma palavra.

#### N-11. [PWA / Chrome do navegador] `theme-color` e `manifest.json` com cores de uma paleta que não existe mais

- **Local:** `src/layouts/BaseLayout.astro:73` e `:75`, `src/islands/ThemeToggle.tsx:25` e `:42`, `public/manifest.json:8-9`
- **O que está errado:** o `<meta name="theme-color">` usa `#faf9f6` no claro e `#0c0a09` no escuro. Os fundos reais são `#f2efe4` e `#0a0f0c` (`global.css:96` e `:75`). O `manifest.json` está pior, com `theme_color: "#C2703E"`, um laranja, e `background_color: "#1A1A1A"`. Nenhum dos dois pertence a qualquer um dos temas atuais. São resquícios de antes do redesign "Engenharia × Terminal".
- **Por que importa:** em Android o Chrome pinta a barra de endereço com o `theme-color`, e a tela de splash do app instalado usa as cores do manifest. Hoje aparece uma faixa levemente fora de tom no topo e uma splash laranja e cinza que não tem relação nenhuma com o site.
- **Correção sugerida:** alinhar os cinco valores aos tokens reais. Vale extrair para constantes, já que a cor aparece repetida em três arquivos.
- **Esforço:** Mínimo (10 min).
- **Vale a pena corrigir?** **SIM.**

#### N-12. [Qualidade de CSS] Cinco seletores mortos, sendo três dentro do print stylesheet

- **Local:** `src/styles/global.css:661` e `:668` (`.redacted`), `:671` (`.paper-tape`), `:927-929` (`.scroll-indicator` e `.mobile-nav` dentro de `@media print`), `:935` (`.case-study-expander`)
- **O que está errado:** varri os seletores de classe dos dois arquivos de CSS contra todo o markup de `src/`. `.redacted`, `.paper-tape`, `.scroll-indicator`, `.case-study-expander` e a classe exata `.mobile-nav` não aparecem em nenhum `.astro`, `.tsx` ou `.md`. O caso do print merece nota: a regra tenta esconder `.mobile-nav`, mas as classes reais do componente são `.mobile-nav-trigger`, `.mobile-nav-overlay` e `.mobile-nav-drawer`. O seletor nunca casou. Na prática o navbar é escondido pelo seletor de elemento `nav` que está na mesma regra, então o efeito visível está correto por acidente.
- **Ressalva de método:** `.theme-transition-overlay--to-dark` e `--to-light` também apareceram na varredura e **não são mortos**. São montados por template string em `ThemeToggle.tsx:33`. Verifiquei um a um antes de listar.
- **Correção sugerida:** remover os cinco e trocar `.mobile-nav` por `.mobile-nav-overlay` no bloco de impressão, para o caso de alguém imprimir com a gaveta aberta.
- **Esforço:** Mínimo (10 min).
- **Vale a pena corrigir?** **SIM**, é limpeza barata.

#### N-13. [Qualidade de CSS] `.post-body` é aplicada no markup e não tem nenhuma regra

- **Local:** `src/components/BlogPostPage.astro:99`
- **O que está errado:** o elemento é `<div class="post-body case-body">` e não existe nenhum seletor `.post-body` em `global.css` nem em `islands.css`. Todo o estilo vem de `.case-body`. Não é bug, é uma classe pendurada que sugere um ponto de customização que não existe. Vale como registro porque quem for corrigir o N-14 vai passar por ela.
- **Correção sugerida:** ou remover a classe, ou usá-la de fato para o que diferencia post de case study.
- **Esforço:** Mínimo (5 min).
- **Vale a pena corrigir?** Opcional.

#### N-14. [i18n] Strings decorativas de terminal em português nos arquivos `en` e `es`

- **Local:** `src/i18n/en.json:131` e `src/i18n/es.json:131`
- **O que está errado:** `terminal.notFound` tem o valor `"bash: cd: essa-página: No such file or directory"` nos três idiomas. Nos arquivos `en` e `es` sobrou o "essa-página" em português no meio de uma mensagem em inglês. Vale notar que as outras 33 chaves de `terminal.*` idênticas entre idiomas são intencionais, porque comando de shell não se traduz. Esta é a única que carrega texto natural em português.
- **Por que importa pouco:** o texto sai em `data-txt` sobre um elemento `aria-hidden="true"` (`404.astro:13-14`), então leitor de tela não lê. É defeito visual para quem lê e presta atenção.
- **Correção sugerida:** `"bash: cd: this-page: No such file or directory"` e `"bash: cd: esta-pagina: No such file or directory"`.
- **Esforço:** Mínimo (2 min).
- **Vale a pena corrigir?** **SIM.**

#### N-15. [SEO] Hreflang das páginas paginadas do blog apontaria para a página 1 das outras línguas

- **Local:** `src/components/BlogFeedPage.astro:47-49`
- **O que está errado:** o `canonical` é montado corretamente por página (`:46`, usando `blogPageUrl(paged.page, locale)`), mas o mapa de `alternates` usa `blogUrl(l)`, que é sempre a página 1. Uma futura `/blog/pagina/2` declararia como alternativa em inglês a `/en/blog`, que não é a tradução dela. Hreflang não recíproco é ignorado pelo Google.
- **Por que importa pouco:** é latente. Com 1 post publicado, `getStaticPaths` não gera nenhuma página paginada e o build confirma isso. O problema só nasce quando o blog passar de `POSTS_PER_PAGE`.
- **Correção sugerida:** montar os alternates com `blogPageUrl(paged.page, l)` e omitir a linha quando a outra língua não tiver aquela página.
- **Esforço:** Baixo (20 min).
- **Vale a pena corrigir?** Não agora. Vale registrar para quando o blog crescer.

#### N-16. [Acessibilidade] `aria-modal` na gaveta sem tornar o fundo `inert`

- **Local:** `src/islands/MobileNav.tsx:118-119`
- **O que está errado:** a gaveta declara `role="dialog"` e `aria-modal="true"`, o que é correto e faz o leitor de tela restringir a navegação por foco. Mas o conteúdo de trás não recebe `inert` nem `aria-hidden`, então em modo de cursor virtual ou exploração por toque o usuário ainda alcança a página inteira por baixo do modal.
- **Correção sugerida:** aplicar `inert` no `<main>` e no `<footer>` enquanto `open` for true. Hoje é suportado nos navegadores atuais e dispensa polyfill.
- **Esforço:** Baixo (20 min).
- **Vale a pena corrigir?** Opcional. O trap de foco por teclado, que era o problema grave, já está resolvido.

#### N-17. [UX] O ícone do botão de tema pisca no modo escuro durante a hidratação

- **Local:** `src/islands/ThemeToggle.tsx:4` e `:7-12`
- **O que está errado:** o estado inicial é `useState<'light'|'dark'>('light')`, então o HTML pré-renderizado sempre traz o ícone de lua e `aria-checked="false"`, confirmado no `dist`. O `useEffect` só corrige depois da hidratação. Para quem tem `theme: dark` salvo, o fundo já entra escuro pelo script inline, mas o ícone e o `aria-checked` ficam errados até o Preact assumir.
- **Por que importa pouco:** é uma janela curta e o `client:load` a mantém mínima. Mas o `aria-checked` errado nessa janela é informação incorreta para tecnologia assistiva, não só ruído visual.
- **Correção sugerida:** ler `document.documentElement.classList` no inicializador lazy do `useState` em vez de no efeito.
- **Esforço:** Mínimo (10 min).
- **Vale a pena corrigir?** Opcional.

#### N-18. [Documentação] Alvos das auditorias sem correspondência no build atual

- **Local:** `docs/auditoria-visual-design-2026-08.md:76`
- **O que está errado:** já detalhado na tabela da seção 3, mas vale isolar porque afeta quem for executar as correções em lote. O item Visual B-6 pede correção num título de página paginada que o build não gera e que, se gerasse, já viria com a marca. Executar aquela recomendação ao pé da letra produziria `Blog — João Bernardo — Página 2 de N — João Bernardo`.
- **Correção sugerida:** ao aplicar as auditorias, tratar B-6 como se referindo só à 404.
- **Esforço:** nenhum, é ressalva de leitura.
- **Vale a pena corrigir?** N/A.

---

## 5. O que está bom e não deveria mudar

Registrado porque revisão só com defeito distorce a leitura do estado do projeto.

1. **Peso de JS realmente enxuto.** A home carrega cerca de 23KB não comprimidos somando runtime do Preact, hooks, o loader das ilhas e as 5 ilhas. O `signals.module.js` (7,5KB) fica atrás de import dinâmico em `client.js` e não é buscado enquanto nenhuma prop for signal. As diretivas estão bem escolhidas: `client:visible` no `StatsCounter` e no `CaseStudyExpander`, `client:idle` no `ScrollSpy` e no `TermStatusline`. A exceção é o `MobileNav`, que é o achado Visual B-8.
2. **A fachada de vídeo é exemplar.** Link real para o YouTube sem JS, `iframe` de terceiro só depois do clique, `width`/`height` no `img` eliminando CLS, `aria-label`, `rel="noopener noreferrer"` e foco movido para o iframe após a troca. Só falta o `preconnect` do N-7.
3. **Hierarquia de headings correta em todas as páginas verificadas.** Um `h1` por página, sem salto de nível. A home vai de `h1` para `h2` de seção, `h3` de projeto e `h4` de subtítulo de card, e o post do blog é `h1` seguido de nove `h2`. A única falha é a seção de contato sem `h2`, que é o achado Front B-9.
4. **Nenhuma referência quebrada.** As 26 URLs e assets testados contra o `dist` servido respondem 200, incluindo os três PDFs de CV por idioma, `/jbnado.jpg` do JSON-LD e todos os ícones do manifest.
5. **i18n estruturalmente íntegro.** 127 chaves, zero divergência entre `pt-br`, `en` e `es`. Os defeitos de i18n desta revisão são de componentes que não consultam o dicionário, não do dicionário.
6. **A cascata da correção de tipografia foi bem pensada.** Usar regra sem layer para vencer o `@layer base` é a solução certa em Tailwind v4 e evita `!important`. E pegar o blog de graça pela composição `post-body case-body` foi bom desenho, não sorte.

---

## 6. Resumo quantitativo

| Categoria | Alto | Médio | Baixo | Total |
| :--- | :---: | :---: | :---: | :---: |
| Achados NOVOS | 4 | 5 | 9 | **18** |
| Correções verificadas (resolvidas) | — | — | — | **4** |
| Achados anteriores confirmados e ainda abertos | — | — | — | **17** |
| Achados anteriores refutados ou parcialmente refutados | — | — | — | **1** |

**Ordem de execução sugerida, por retorno sobre esforço:** N-1 (4 linhas, corrige falha de contraste em elemento permanente), N-10 e N-14 (uma palavra cada), N-9 mais Front C-10 mais Front B-4 juntos no mesmo componente, N-8, N-5, N-11, N-3, N-4, N-2, N-6, N-7.

> Nenhum arquivo de `src/` foi modificado e nenhum commit foi criado durante esta revisão. Os únicos artefatos gerados foram `dist/`, `.vercel/output/` e este documento.
