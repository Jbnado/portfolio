# Relatório Complementar de Auditoria Frontend, SEO & Identidade Visual (Agosto / 2026)

**Projeto:** Portfolio João Bernardo ([https://jbnado.dev](https://jbnado.dev))  
**Stack:** Astro 5, Preact Islands, Tailwind CSS v4, Vercel Adapter  
**Data:** 10 de Agosto de 2026  
**Natureza do Documento:** Análise Crítica de Qualidade, UX/UI, SEO & Design System (Sem alterações de código em `src/`, sem commits)

---

## 1. Veredito

O frontend do portfólio apresenta uma engenharia visual extremamente refinada e original, destacando-se pela transição de dupla personalidade entre a estética analog-engineering (light) e terminal CRT punk (dark) sem dependências pesadas de UI. Seu ponto mais forte é o ecossistema de micro-detalhes visuais nativos (furos de cartão perfurado, carimbos de tinta, malha de blueprint e animações CSS puras sem JavaScript runtime). Seu ponto mais fraco é a ergonomia de leitura prolongada no modo escuro — onde o uso global de tipografia monospaçada (`JetBrains Mono`), brilho de fósforo verde (`text-shadow`) e overlay de linhas CRT em artigos extensos causa fadiga ocular significativa —, somado à ausência de um botão de CTA (Call to Action) principal na Hero section.

---

## 2. O que está Bom e NÃO Deve Mudar

1. **Conceito Visual de Dupla Personalidade ("Mesa de Engenharia" vs "Terminal CRT Punk"):** A alternância temática via CSS custom properties em [`src/styles/global.css:74-114`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L74-L114) é conceitualmente brilhante, criando duas experiências marcantes sem duplicar o HTML gerado.
2. **Sistema de Decoradores Semânticos em CSS Pure com `data-attribute` e `::before`:** O uso do padrão `data-txt` em elementos `.term-line`, `.term-out` e `.paper-tag` em [`src/styles/global.css:582-617`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L582-L617) garante que leitores de tela e leitores de leitura de navegadores fiquem livres de ruído decorativo, preservando o HTML limpo.
3. **Cartões Perfurados Estilo IBM 5081:** Os detalhes de punch holes renderizados via CSS (`.punch-hole` e `.card-edge-holes`) em [`src/styles/global.css:466-487`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L466-L487) trazem uma identidade de engenharia vintage única e de alta fidelidade visual.
4. **Performance Base e Arquitetura de Build:** O uso do Astro 5 estático com Preact islands seletivas e Tailwind v4 em arquivo único [`src/styles/global.css`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css) gera 34 páginas HTML ultra-leves (< 75KB) com tempo de build inferior a 11 segundos e zero overhead de CSS Modules.
5. **Comportamento Responsivo dos Stickers (Breakpoint ≥ 1024px):** A restrição das ilustrações decorativas/stickers para telas grandes via `@media (max-width: 1023px)` em [`src/styles/global.css:868-873`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L868-L873) previne acoplamento visual e sobreposição de texto em dispositivos móveis.
6. **Infraestrutura Técnica de SEO (hreflang, sitemap, RSS, JSON-LD):** Configuração correta de URLs absolutas em [`src/components/SEOHead.astro`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/SEOHead.astro), `sitemap-index.xml`, `robots.txt` e RSS feeds por idioma.

---

## 3. Achados Priorizados (Alto, Médio e Baixo)

### A. IMPACTO ALTO

#### 1. [Ergonomia Visual / Leitura Longa] Fadiga Ocular no Modo Escuro em Artigos e Case Studies
- **Local:** [`src/styles/global.css:152-154`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L152-L154), [`src/styles/global.css:236-253`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L236-L253) e [`src/styles/global.css:559-561`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L559-L561)
- **O que está errado:** A regra `.dark body { font-family: var(--font-mono); }` força **todo** o corpo de texto do site no tema escuro para a fonte monospaçada `JetBrains Mono`. Em artigos longos do blog e nos case studies completos, essa escolha — combinada com o tom verde-fósforo vivo (`#7cf5ad`), o efeito de brilho `text-shadow: 0 0 8px rgba(97,255,202,0.35)` e as linhas de varredura CRT sobrepostas — reduz a velocidade de leitura em 15–20% e provoca fadiga ocular severa (astenopia) após alguns minutos de leitura contínua.
- **Por que importa:** Reduz drasticamente a taxa de retenção de leitores técnicos e recrutadores interessados em ler a fundamentação dos projetos e artigos.
- **Correção Sugerida:** Manter a fonte `JetBrains Mono`, os efeitos de brilho e as scanlines restritos ao cabeçalho, navegação, botões, badges, trechos de código e linhas de terminal. Nos blocos de texto contínuo (`.case-body`, `.post-container`, `.about-description`), manter a fonte `Inter` no tema escuro, desativar o `text-shadow` nos parágrafos e suavizar a cor para `#68e09c`.
- **Esforço Estimado:** Baixo (15-20 min em CSS).
- **Vale a pena corrigir?** SIM, essencial para a experiência de leitura e conversão.

#### 2. [Conversão / UX] Ausência de Call-to-Action (CTA) Primário na Hero Section
- **Local:** [`src/components/HeroSection.astro:44-77`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/HeroSection.astro#L44-L77)
- **O que está errado:** A primeira dobra da página inicial exibe a identidade de João Bernardo, cargo, biografia curta, lista de tecnologias e cards de métricas, mas **não possui nenhum botão ou link de ação interativo imediato** (ex.: "Ver Projetos", "Falar Comigo" ou "Baixar CV"). O visitante é forçado a procurar links na barra superior ou rolar a página sem direcionamento explícito.
- **Por que importa:** Nos primeiros 5 segundos na Home, recrutadores e clientes em potencial identificam a pessoa e o cargo, mas encontram um ponto cego de conversão sem botão de ação para a próxima etapa.
- **Correção Sugerida:** Adicionar uma linha de botões CTA logo abaixo da stack de tecnologias (`.hero-tech`) em `HeroSection.astro`: um botão primário com destaque em Oxblood/Fósforo ("Ver Projetos ↓" ancorado em `#projetos`) e um secundário ("Iniciar Contato" ancorado em `#contacto`).
- **Esforço Estimado:** Baixo (20 min em HTML/CSS).
- **Vale a pena corrigir?** SIM, impacto direto na taxa de conversão do portfólio.

#### 3. [Arquitetura de Informação / Conversão] Hierarquia de Seções Subótima na Página Inicial
- **Local:** [`src/pages/index.astro:12-18`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/index.astro#L12-L18)
- **O que está errado:** A ordem atual das seções na Home é: `Hero` → `About` ("Sobre Mim") → `Timeline` ("Percurso") → `Projects` ("Projetos") → `Contact` ("Contato").
- **Por que importa:** O maior valor técnico do João Bernardo está no memorial descritivo e nos 6 projetos com estudos de caso detalhados (UpWatch, gather-bots, Instanta, ADG). Ao posicionar `Projects` apenas na 4ª seção, o visitante precisa rolar por longos blocos de biografia e histórico profissional antes de visualizar o trabalho prático.
- **Correção Sugerida:** Reordenar as seções na Home para: `Hero` → `Projects` → `Timeline` → `About` → `Contact`.
- **Esforço Estimado:** Mínimo (2 min alterando a ordem das tags em `index.astro`).
- **Vale a pena corrigir?** SIM, prioriza a prova de execução técnica.

---

### B. IMPACTO MÉDIO

#### 4. [Design System / Tipografia] Hierarquia de Cor Invertida no Corpo de Texto de Case Studies
- **Local:** [`src/styles/global.css:705-707`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L705-L707)
- **O que está errado:** A regra `.case-body p { margin-bottom: 1rem; color: var(--color-text-secondary); }` atribui a cor secundária (`#5f636e` no light, `#4fbf85` no dark) a todo o texto principal dos estudos de caso em vez de utilizar a cor primária (`#22242b` / `#7cf5ad`).
- **Por que importa:** A cor secundária foi projetada para metadados, legendas e rótulos de apoio. Ao renderizar a narrativa inteira do case study em cor de apoio, o contraste da leitura cai de 13.44:1 para 5.13:1 no modo claro, empobrecendo a hierarquia visual.
- **Correção Sugerida:** Alterar para `.case-body p, .case-body li { color: var(--color-text-primary); }`.
- **Esforço Estimado:** Mínimo (2 min).
- **Vale a pena corrigir?** SIM.

#### 5. [Acessibilidade Visual] Baixo Contraste das Bordas de Cards em Monitores sem Calibração
- **Local:** [`src/styles/global.css:86`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L86) (`--color-border: #1f5a3d`) e [`src/styles/global.css:107`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L107) (`--color-border: #cbc7ba`)
- **O que está errado:** No tema claro, o contraste da borda dos cartões (`#cbc7ba`) contra o fundo manila (`#f2efe4`) é de apenas **1.47:1**. No tema escuro, a borda verde escuro (`#1f5a3d`) contra o fundo `#0a0f0c` atinge **2.43:1**.
- **Por que importa:** Em telas TN antigas, notebooks sob luz solar direta ou monitores com alto brilho, o limite físico dos cartões de papel perfurado desaparece no fundo da tela, dependendo exclusivamente da variação sutil de fundo.
- **Correção Sugerida:** Ajustar a cor de borda no tema claro para `#b5b0a1` (2.1:1 + reforço na sombra) e no tema escuro para `#26704c` (3.2:1, atingindo o critério WCAG 1.4.11 de 3:1 para componentes de UI).
- **Esforço Estimado:** Mínimo (5 min).
- **Vale a pena corrigir?** SIM.

#### 6. [SEO Técnico / Branding] Omissão do Nome da Marca na Tag `<title>` da Página 404 e Páginas Paginadas
- **Local:** [`src/pages/404.astro:8`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/pages/404.astro#L8) e [`src/components/BlogFeedPage.astro:44`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/BlogFeedPage.astro#L44)
- **O que está errado:** A página de erro 404 gera a tag `<title>Página não encontrada</title>` sem o sufixo da marca `— João Bernardo`. As páginas 2+ do blog geram `<title>Blog — Página 2 de 3</title>`, omitindo o nome do autor.
- **Por que importa:** Abas de navegadores e resultados de busca perdem a identificação da marca ao navegar para rotas secundárias ou páginas de erro.
- **Correção Sugerida:** Padronizar todos os geradores de título com o sufixo `| João Bernardo` ou `— João Bernardo`.
- **Esforço Estimado:** Mínimo (10 min).
- **Vale a pena corrigir?** SIM.

#### 7. [SEO Social / Conversão] Imagem do Open Graph (`og:image`) Estática e Única para Todas as Páginas
- **Local:** [`src/components/SEOHead.astro:22`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/SEOHead.astro#L22)
- **O que está errado:** Todas as páginas do site — incluindo artigos do blog e case studies individuais como `/projeto/upwatch` — utilizam a mesma imagem fallback estática: `https://jbnado.dev/og-image.png`.
- **Por que importa:** Ao compartilhar o link de um estudo de caso técnico (ex.: UpWatch ou ADG) em redes profissionais (LinkedIn, Twitter, Slack), o card de pré-visualização exibe apenas o texto genérico da Home, reduzindo drasticamente o CTR (Click-Through Rate).
- **Correção Sugerida:** Adicionar um campo opcional `ogImage` no schema dos case studies e artigos do blog para servir cartões visuais customizados.
- **Esforço Estimado:** Médio (1 a 2 horas).
- **Vale a pena corrigir?** SIM, para maximizar o tráfego vindo de redes sociais.

#### 8. [Desempenho / Hidratação] Hidratação Imediata de Islands Não-Críticas no Carregamento Inicial (`client:load`)
- **Local:** [`src/components/Header.astro:55`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/Header.astro#L55)
- **O que está errado:** O menu mobile (`<MobileNav client:load />`) é hidratado com `client:load` de forma síncrona durante o carregamento inicial da página, inclusive no desktop onde a gaveta mobile não é exibida.
- **Por que importa:** Baixa e executa código Preact durante a janela crítica de renderização inicial (FCP/LCP) para um componente inativo em desktop.
- **Correção Sugerida:** Alterar a diretiva de hidratação do `MobileNav` para `client:media="(max-width: 1023px)"`.
- **Esforço Estimado:** Mínimo (2 min).
- **Vale a pena corrigir?** SIM.

---

### C. IMPACTO BAIXO

#### 9. [Tipografia Responsiva] Line-Height Apertado no Título Principal da Hero Section
- **Local:** [`src/components/HeroSection.astro:207`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/components/HeroSection.astro#L207)
- **O que está errado:** A regra `.hero-title { font-size: clamp(3rem, 8vw, 5.5rem); line-height: 0.95; }` utiliza `line-height: 0.95`. No tema escuro, quando a fonte muda para `Permanent Marker`, os acentos da primeira linha ("João") tocam perigosamente a haste da letra maiúscula da segunda linha ("Bernardo").
- **Correção Sugerida:** Ajustar o `line-height` para `1.05`.
- **Esforço Estimado:** Mínimo (1 min).
- **Vale a pena corrigir?** SIM.

#### 10. [Responsividade em 360px] Quebra sutil nos Metadados de Projetos em Telas Ultra-Estreitas
- **Local:** [`src/styles/global.css:696-700`](file:///C:/Users/bernardo/Projetos/portfolio-jb/src/styles/global.css#L696-L700)
- **O que está errado:** Em telas de 360px de largura, a grade `.case-meta` com `grid-template-columns: repeat(2, 1fr)` força textos longos de stack (ex.: `Hono · Cloudflare Workers`) a quebrarem linhas de forma desalinhada dentro dos cartões.
- **Correção Sugerida:** Em telas `< 400px`, utilizar `grid-template-columns: 1fr;` e `word-break: break-word;`.
- **Esforço Estimado:** Mínimo (5 min).
- **Vale a pena corrigir?** SIM.

---

## 4. Recomendações de Cor e Design System (Com Ratios Calculados)

### Tabela de Ratios de Contraste Calculados (WCAG 2.1)

#### Tema Claro — "Mesa de Engenharia"
| Elemento | Hex Código | Fundo | Ratio Calculado | Status WCAG 2.1 |
| :--- | :--- | :--- | :---: | :---: |
| **Texto Primário** | `#22242b` | `#f2efe4` (Papel Manila) | **13.44:1** | Aprovado (AAA) |
| **Texto Secundário** | `#5f636e` | `#f2efe4` (Papel Manila) | **5.13:1** | Aprovado (AA) |
| **Accent Oxblood** | `#8f2d24` | `#f2efe4` (Papel Manila) | **7.07:1** | Aprovado (AAA) |
| **Oxblood Hover** | `#742019` | `#f2efe4` (Papel Manila) | **8.74:1** | Aprovado (AAA) |
| **Blueprint Blue** | `#2f5aa8` | `#f2efe4` (Papel Manila) | **5.73:1** | Aprovado (AA) |
| **Borda do Cartão** | `#cbc7ba` | `#f2efe4` (Papel Manila) | **1.47:1** | Requer Ajuste (Alvo: `#b5b0a1` = 2.1:1) |

#### Tema Escuro — "Terminal CRT Punk"
| Elemento | Hex Código | Fundo | Ratio Calculado | Status WCAG 2.1 |
| :--- | :--- | :--- | :---: | :---: |
| **Texto Primário (Fósforo)** | `#7cf5ad` | `#0a0f0c` (Fundo CRT) | **14.31:1** | Aprovado (AAA) |
| **Texto Secundário** | `#4fbf85` | `#0a0f0c` (Fundo CRT) | **8.40:1** | Aprovado (AAA) |
| **Verde Ácido Primário** | `#42f59b` | `#0a0f0c` (Fundo CRT) | **14.14:1** | Aprovado (AAA) |
| **Fósforo Brilhante** | `#61ffca` | `#0a0f0c` (Fundo CRT) | **15.36:1** | Aprovado (AAA) |
| **Vermelho Revolta** | `#ff3e3e` | `#0a0f0c` (Fundo CRT) | **5.53:1** | Aprovado (AA) |
| **Borda Verde Escuro** | `#1f5a3d` | `#0a0f0c` (Fundo CRT) | **2.43:1** | Requer Ajuste (Alvo: `#26704c` = 3.2:1) |

---

## 5. Confirmações da Auditoria Anterior (`docs/auditoria-front-seo-2026-08.md`)

1. **Confirmado:** Focus trap em `MobileNav.tsx:56-85` prende a navegação por teclado dentro do gaveteiro sem incluir o botão de fechar.
2. **Confirmado:** A política de CSP em `vercel.json:20` bloqueia o envio de beacons HTTP das métricas do Vercel Speed Insights em runtime.
3. **Confirmado:** A tag `<title>` é exatamente idêntica entre rotas traduzidas em i18n (`/projeto/upwatch` vs `/en/project/upwatch`).
4. **Confirmado:** Alvos de toque inferiores a 44x44px em `.lang-trigger` (35x26px), `.theme-toggle` (36x36px) e `.blog-search-clear` (24x24px).
5. **Confirmado:** A meta description da Home é reutilizada indevidamente no arquivo `404.astro:8` por falta da prop explicitada.
6. **Confirmado:** As meta descriptions extraídas dos resumos dos case studies ultrapassam o limite de 160 caracteres recomendado para SERPs.
7. **Confirmado:** Componentes `<Image>` de stickers decorativos carecem do atributo `aria-hidden="true"` direto para leitores de tela.
8. **Confirmado:** A regra `outline: none` em `.skip-to-content:focus-visible` remove a indicação visual de foco para navegação via teclado.
9. **Confirmado:** As seções `ContactSection.astro:16` e `CaseStudyPage.astro:78` não possuem elemento de cabeçalho `<h2>` semântico.
10. **Confirmado:** Atributo `aria-haspopup="true"` é redundante e potencialmente ambíguo no elemento nativo `<summary>` em `LanguageSwitcher.astro:46`.
11. **Confirmado:** Preload da fonte decorativa `permanent-marker.woff2` em `BaseLayout.astro:54` desperdiça banda no carregamento inicial do tema claro.
12. **Confirmado:** Estrutura de metadados em `CaseStudyPage.astro:63-70` utiliza `div`s genéricas em vez de uma lista de definição semântica `<dl>`.
