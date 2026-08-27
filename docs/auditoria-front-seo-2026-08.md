# Relatório de Auditoria Frontend & SEO (Agosto / 2026)

**Projeto:** Portfolio João Bernardo ([https://jbnado.dev](https://jbnado.dev))  
**Stack:** Astro 5, Preact Islands, Tailwind CSS v4, Vercel Adapter  
**Data da Auditoria:** 10 de Agosto de 2026  
**Status do Repositório:** Apenas auditoria (nenhum código alterado, sem commits)

---

## 1. Metodologia de Teste e Verificação de Ambiente

Para garantir a fidelidade da auditoria, os seguintes passos foram executados localmente e validados contra a produção:

1. **Instalação e Execução de Testes Automáticos:**
   - Comando: `pnpm install` — Executado com sucesso.
   - Comando: `pnpm test` (`vitest run`): **2 arquivos de teste executados, 25 testes com sucesso (0 falhas)**.
     - Suítes testadas: `src/utils/blog.test.ts` e `src/utils/constants.test.ts`.

2. **Build Estático e Inspeção de Servidor:**
   - Comando: `pnpm build` (`astro build`) — **34 páginas HTML geradas em 10.7s**, juntamente com `sitemap-index.xml`, `sitemap-0.xml`, `rss.xml` e bundles estáticos.
   - Os cabeçalhos de segurança e rotas foram auditados diretamente sobre o `vercel.json` e no build servido (`dist/`), uma vez que o `astro dev` não aplica os headers do Vercel.

3. **Comparação Repositório vs. Produção (`https://jbnado.dev`):**
   - **Resultado:** O site em produção reflete **100% do estado atual do repositório**.
   - **Evidência:** O hash dos bundles CSS (`index.DpckE1TV.css` e `index.DlZnD2wP.css`) e os hashes de todas as imagens otimizadas geradas na produção correspondem exatamente aos arquivos gerados no build estático local (`dist/`).
   - Os cabeçalhos de segurança (`Content-Security-Policy`, `X-Frame-Options`, `Permissions-Policy`, etc.) retornados pela Vercel em produção coincidem exatamente com o `vercel.json`.

---

## 2. Decisões de Projeto Desconsideradas (Conforme Instrução)
Em conformidade com as diretrizes da auditoria, os seguintes itens **não foram reportados como problemas**:
- Tema padrão claro por opção de design (sem sugestão de `prefers-color-scheme`).
- Exibição de stickers visuais apenas a partir do breakpoint de `1024px`.
- Uso de arquivo CSS único (`src/styles/global.css`) sem CSS Modules.

---

## 3. Matriz de Achados Ranqueados por Impacto

---

### A. ACHADOS CRÍTICOS (Impacto Alto / Bloqueio / Falha WCAG / Erro de SEO)

#### 1. [Acessibilidade / Navegação por Teclado] Trap de Foco e Impossibilidade de Fechar Menu Mobile via Tab
- **Local:** [`src/islands/MobileNav.tsx:56-85`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/islands/MobileNav.tsx#L56-L85) e [`src/islands/MobileNav.tsx:90-101`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/islands/MobileNav.tsx#L90-L101)
- **O que está errado:** O algoritmo de focus trap do menu mobile prende o foco do teclado exclusivamente nos elementos dentro de `drawerRef` (do primeiro link `#sobre` até o botão de download `CV ↓`). Porém, o botão de gatilho/fechamento (`.mobile-nav-trigger`) está posicionado **fora** do `drawerRef`. Quando um usuário abre o menu por teclado, ele fica preso em um ciclo infinito entre os links da gaveta e nunca consegue navegar via `Tab` até o botão de fechar. A única forma de fechar o menu por teclado é pressionar `Escape`.
- **WCAG Relacionada:** WCAG 2.1.2 (No Keyboard Trap) e WCAG 2.4.3 (Focus Order).
- **Correção Sugerida:** Incluir um botão de fechar dedicado dentro do `drawerRef` ou incluir o gatilho `.mobile-nav-trigger` na lista de elementos navegáveis da armadilha de foco.

#### 2. [Segurança / CSP] Content Security Policy Bloqueia as Requisições do Vercel Speed Insights
- **Local:** [`vercel.json:20`](file:///C:/Users/bernardo/Projetos/portfolio-jb/vercel.json#L20) e [`src/layouts/BaseLayout.astro:107`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/layouts/BaseLayout.astro#L107)
- **O que está errado:** O layout base instancia o componente `<SpeedInsights />` do pacote `@vercel/speed-insights`. No entanto, a regra de CSP no `vercel.json` define `connect-src 'self'` e `script-src 'self' 'unsafe-inline'`. Em runtime, o script de métricas do Speed Insights tenta carregar scripts e enviar beacons HTTP para `https://va.vercel-scripts.com` e `https://vitals.vercel-insights.com`. Como a política restringe `connect-src` apenas a `'self'`, o navegador bloqueia a transmissão das métricas de Core Web Vitals.
- **Correção Sugerida:** Atualizar o `Content-Security-Policy` no `vercel.json` adicionando `https://va.vercel-scripts.com` em `script-src` e `https://vitals.vercel-insights.com` (ou `https://*.vercel-insights.com`) em `connect-src`.

#### 3. [SEO] Tag `<title>` Duplicada entre Páginas de Diferentes Idiomas
- **Local:** [`src/pages/projeto/[slug].astro:25`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/projeto/%5Bslug%5D.astro#L25), [`src/pages/en/project/[slug].astro:25`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/en/project/%5Bslug%5D.astro#L25), [`src/pages/es/proyecto/[slug].astro`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/es/proyecto/%5Bslug%5D.astro), [`src/pages/index.astro`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/index.astro)
- **O que está errado:** Diversas páginas i18n geram a exata mesma tag `<title>` em idiomas diferentes. Exemplos verificados no build:
  - `/projeto/upwatch` e `/en/project/upwatch`: ambas contêm `<title>UpWatch — João Bernardo</title>`.
  - `/projeto/instanta` e `/en/project/instanta`: ambas contêm `<title>Instanta — João Bernardo</title>`.
  - `/projeto/gather-bots` e `/en/project/gather-bots`: ambas contêm `<title>gather-bots — João Bernardo</title>`.
  - `/projeto/ribeirao-noir`, `/en/project/ribeirao-noir` e `/es/proyecto/ribeirao-noir`: as três páginas compartilham a mesma string de título.
  - `/` e `/en/`: ambas usam `<title>João Bernardo — Fullstack Developer</title>`.
  Mecanismos de busca penalizam ou desconsideram variantes i18n quando o título não indica o idioma ou contexto da página.
- **Correção Sugerida:** Diferenciar os títulos por idioma, incluindo o sufixo traduzido (ex.: `UpWatch — Project Case Study | João Bernardo` para EN e `UpWatch — Estudio de Caso | João Bernardo` para ES).

---

### B. ACHADOS IMPORTANTES (Usabilidade / WCAG AA / SEO Relevante)

#### 4. [Acessibilidade / UX Mobile] Alvos de Toque (Touch Targets) Menores que 44x44px
- **Local:** [`src/components/LanguageSwitcher.astro:67`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/LanguageSwitcher.astro#L67), [`src/styles/islands.css:7`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/islands.css#L7) e [`src/styles/islands.css:171`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/islands.css#L171)
- **O que está errado:** Três elementos interativos possuem área clicável inferior ao padrão mínimo de acessibilidade para telas de toque (44x44px / WCAG 2.5.8):
  1. `.lang-trigger` (Seletor de idioma): possui padding `0.375rem 0.5rem`, resultando em uma área útil de ~35x26px.
  2. `.theme-toggle` (Botão de tema): possui padding `0.5rem` com ícone de 20x20px, resultando em 36x36px.
  3. `.blog-search-clear` (Botão de limpar busca do blog): possui dimensão explícita de `1.5rem` x `1.5rem` (24x24px).
- **WCAG Relacionada:** WCAG 2.5.8 Target Size (Minimum).
- **Correção Sugerida:** Definir `min-width: 44px; min-height: 44px;` ou expandir a área de toque usando pseudo-elemento `::before`.

#### 5. [SEO / Meta] Meta Description Duplicada da Home na Página 404
- **Local:** [`src/pages/404.astro:8`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/404.astro#L8) e [`src/components/SEOHead.astro:19`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/SEOHead.astro#L19)
- **O que está errado:** O arquivo `404.astro` repassa a prop `title` para o `BaseLayout`, mas omite a prop `description`. Como consequência, o `SEOHead.astro` utiliza a descrição padrão da Home (`t('seo.description', 'pt-br')`), fazendo com que a página `404.html` tenha a mesma meta description do site principal ("Portfolio de João Bernardo — Fullstack Developer...").
- **Correção Sugerida:** Passar explicitamente a descrição traduzida da página de erro em `404.astro` (ex.: `description={t('notFound.message', locale)}`).

#### 6. [SEO / Snippets] Meta Description Extensas (> 160 caracteres) nos Case Studies
- **Local:** Coleções de conteúdo em `src/content/caseStudies/` (ex.: `portfolio-jb.es.md`, `portfolio-jb.pt-br.md`, `ribeirao-noir.pt-br.md`)
- **O que está errado:** Vários resumos de projetos usados como meta description excedem o limite recomendado de 160 caracteres para SERPs:
  - `es/proyecto/portfolio-jb`: 443 caracteres.
  - `projeto/portfolio-jb`: 388 caracteres.
  - `projeto/ribeirao-noir`: 329 caracteres.
  Search engines cortam o texto com reticências nas buscas do Google.
- **Correção Sugerida:** Adicionar um campo opcional `seoDescription` no schema da collection com limite de 120–150 caracteres, ou truncar a string no `[slug].astro`.

#### 7. [Acessibilidade] Imagens Decorativas (Stickers) sem `aria-hidden="true"`
- **Local:** [`src/components/HeroSection.astro:26-30`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/HeroSection.astro#L26-L30), [`src/components/AboutSection.astro:18-22`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/AboutSection.astro#L18-L22), [`src/components/TimelineEntry.astro:20-24`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/TimelineEntry.astro#L20-L24) e [`src/components/ContactSection.astro:20-29`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/ContactSection.astro#L20-L29)
- **O que está errado:** As imagens decorativas de personagens/stickers (`Gon`, `skullRock`, `killua`, `esqueleto`, `thorfinn`, `fist`, `angelaDavis`, `sharkboy`) utilizam o componente `<Image>` do Astro com `alt=""`. Contudo, sem a propriedade `aria-hidden="true"` direta no elemento `<img>` gerado, leitores de tela em certas combinações de navegadores/plataformas ainda navegam até nós gráficos vazios.
- **Correção Sugerida:** Adicionar a prop `aria-hidden="true"` nos componentes `<Image>` que têm função puramente estática/estilística.

#### 8. [Acessibilidade / WCAG 2.4.7] Remoção de Contorno de Foco em `.skip-to-content`
- **Local:** [`src/components/SkipToContent.astro:31`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/SkipToContent.astro#L31)
- **O que está errado:** O estilo `.skip-to-content:focus-visible` possui a regra `outline: none;`. Embora o link deslize para `top: 0` quando focado, suprimir totalmente o anel de foco reduz a visibilidade para usuários que navegam exclusivamente via teclado.
- **WCAG Relacionada:** WCAG 2.4.7 (Focus Visible) e WCAG 2.4.13 (Focus Appearance).
- **Correção Sugerida:** Substituir `outline: none;` por um contorno visível explícito (ex.: `outline: 2px solid var(--color-accent); outline-offset: 2px;`).

#### 9. [Acessibilidade / Landmarks] Seções sem Cabeçalhos Elegíveis ou Marcação de Acessibilidade
- **Local:** [`src/components/ContactSection.astro:16`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/ContactSection.astro#L16) e [`src/components/CaseStudyPage.astro:78`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/CaseStudyPage.astro#L78)
- **O que está errado:**
  1. Em `ContactSection.astro`, a chamada de ação principal ("Vamos construir algo juntos?") é estruturada como um parágrafo `<p class="contact-cta">`, deixando a seção `<section id="contacto">` sem um elemento de cabeçalho `<h2>`.
  2. Em `CaseStudyPage.astro`, o bloco `<section class="case-record">` não possui `aria-label` ou `aria-labelledby` apontando para o seu rótulo `div.case-record-label`.
- **Correção Sugerida:** Em `ContactSection.astro`, converter `.contact-cta` para `<h2>`. Em `CaseStudyPage.astro`, associar a seção ao seu título com `aria-labelledby` ou converter o rótulo para `<h2>`/`<h3>`.

---

### C. ACHADOS COSMÉTICOS (Semântica / Boas Práticas / Otimização Leve)

#### 10. [Semântica / A11y] Atributo `aria-haspopup="true"` Redundante em Elemento `<summary>`
- **Local:** [`src/components/LanguageSwitcher.astro:46`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/LanguageSwitcher.astro#L46)
- **O que está errado:** O elemento nativo HTML `<summary class="lang-trigger" aria-haspopup="true">` inclui o atributo `aria-haspopup="true"`. Por ser um filho nativo de `<details>`, navegadores e leitores de tela já anunciam nativamente o comportamento de revelação (disclosure widget). O uso de `aria-haspopup` pode fazer com que tecnologias assistivas anunciem o elemento de forma ambígua como um menu pop-up.
- **Correção Sugerida:** Remover o atributo `aria-haspopup="true"` da tag `<summary>`.

#### 11. [Desempenho / Fontes] Preload de Fonte Decorativa não Utilizada no Tema Padrão
- **Local:** [`src/layouts/BaseLayout.astro:54`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/layouts/BaseLayout.astro#L54)
- **O que está errado:** O cabeçalho carrega previamente a fonte `permanent-marker.woff2` via `<link rel="preload" as="font">` em todas as páginas. No entanto, a fonte Permanent Marker é utilizada apenas no modo escuro (CRT terminal) ou em elementos específicos com classe `.dark`. No carregamento inicial do tema padrão claro (Manila), essa fonte é baixada sem ser renderizada de imediato, gastando banda de rede.
- **Correção Sugerida:** Manter o preload restrito à fonte primária `inter-variable.woff2` e permitir que `permanent-marker.woff2` seja carregada sob demanda pelo CSS.

#### 12. [Semântica HTML] Uso de `div` em Vez de Lista de Definição (`<dl>`) em Metadados de Case Study
- **Local:** [`src/components/CaseStudyPage.astro:63-70`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/CaseStudyPage.astro#L63-L70)
- **O que está errado:** Os metadados da página de estudo de caso (Função, Período, Cliente, Stack) utilizam divs aninhadas (`div.case-meta-cell`, `div.case-meta-label`, `div.case-meta-value`) em vez de elementos semânticos de lista de definição (`<dl>`, `<dt>`, `<dd>`), os quais já são utilizados corretamente em outros pontos do mesmo componente (`case-record-stat`).
- **Correção Sugerida:** Substituir a estrutura de divs por `<dl class="case-meta">`, usando `<dt>` para rótulos e `<dd>` para os valores.

---

## 4. Auditoria Específica por Área

### A. Tema, Contraste e Responsividade
- **Temas:**
  - Light ("Mesa de engenharia"): Fundo `#f2efe4`, texto principal `#22242b` (contraste 14.5:1), texto secundário `#5f636e` (contraste 5.16:1), accent oxblood `#8f2d24` (contraste 6.55:1). **Todos aprovados no padrão WCAG AA (> 4.5:1).**
  - Dark ("Terminal CRT"): Fundo `#0a0f0c`, texto principal `#7cf5ad` (contraste 13.9:1), texto secundário `#4fbf85` (contraste 8.44:1), accent neon `#61ffca` (contraste 15.6:1). **Todos aprovados com folga.**
- **Responsividade (360px, 768px, 1280px, 1920px):**
  - Nenhum *overflow* horizontal detectado no layout em 360px (`max-width: 100%`, imagens responsivas, blocos `<pre>` com `overflow-x: auto`).
  - Layouts de grid e flexbox adaptam-se corretamente entre 1 e 4 colunas nos breakpoints.

### B. SEO Técnico
- **Canonical & Hreflang:**
  - Todas as páginas possuem tag `<link rel="canonical">` apontando para a URL absoluta em `https://jbnado.dev`.
  - As tags `hreflang` recíprocas entre `pt-BR`, `en`, `es` e `x-default` estão corretas na Home, no Blog e nos Case Studies.
- **Open Graph & Twitter Cards:**
  - Imagem `og-image.png` existe na raiz (`/og-image.png`), responde com `200 OK` e possui 150KB em formato PNG (1200x630).
  - Metatags `og:title`, `og:description`, `og:image`, `twitter:card="summary_large_image"` presentes em todas as páginas.
- **JSON-LD (Structured Data):**
  - Entidades `Person` (no `SEOHead`), `TechArticle` (nos Case Studies) e `BlogPosting` + `VideoObject` (nos Posts) testadas e validadas sintaticamente.
  - O `@id` unificado de `Person` impede a duplicação de dados autorais nas subpáginas.
- **Sitemap & Robots:**
  - `robots.txt` expõe a rota correta `Sitemap: https://jbnado.dev/sitemap-index.xml`.
  - O redirecionamento de `/sitemap.xml` para `/sitemap-index.xml` via `vercel.json` funciona com código HTTP 308 em produção.
  - O índice `sitemap-0.xml` lista exatamente as 33 páginas públicas do site. Nenhuma rota estática faltando e nenhuma URL fantasma encontrada.
- **RSS Feeds:**
  - `/rss.xml`, `/en/rss.xml` e `/es/rss.xml` gerados com `application/rss+xml`, contendo `<item>` completo, guids permanentes, datas GMT e tags de categoria.

---

## 5. Resumo da Entrega

| Categoria | Total de Achados | Críticos | Importantes | Cosméticos |
| :--- | :---: | :---: | :---: | :---: |
| **Acessibilidade (a11y)** | 6 | 1 | 4 | 1 |
| **SEO & Metadados** | 3 | 1 | 2 | 0 |
| **Segurança & CSP** | 1 | 1 | 0 | 0 |
| **Desempenho / Semântica** | 2 | 0 | 0 | 2 |
| **TOTAL** | **12** | **3** | **6** | **3** |

> [!NOTE]
> Nenhum arquivo de código do repositório foi alterado ou versionado via git. Este documento reflete a auditoria estática e em tempo de execução realizada em Agosto de 2026.
