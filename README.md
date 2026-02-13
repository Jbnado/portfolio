# jb. — Portfolio Pessoal

[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Preact](https://img.shields.io/badge/Preact-10-673AB8?logo=preact&logoColor=white)](https://preactjs.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)](https://vercel.com)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-95%2B-0CCE6B?logo=lighthouse&logoColor=white)](#performance--lighthouse)

Portfolio pessoal de **João Bernardo** — desenvolvedor fullstack, Brasil.

**[jbnado.dev](https://jbnado.dev)**

---

## Sumário

- [Sobre](#sobre)
- [Tech Stack](#tech-stack)
- [Funcionalidades](#funcionalidades)
- [Começando](#começando)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Internacionalização (i18n)](#internacionalização-i18n)
- [Sistema de Conteúdo](#sistema-de-conteúdo)
- [Design System](#design-system)
- [Performance & Lighthouse](#performance--lighthouse)
- [Acessibilidade](#acessibilidade)
- [Licença](#licença)

---

## Sobre

Site pessoal construído com foco em **performance**, **acessibilidade** e **design intencional**. Apresenta trajetória profissional, projetos em destaque com case studies, e informações de contato — tudo em três idiomas.

> _"Bom software é invisível: carrega rápido, é intuitivo e acessível a todos."_

---

## Tech Stack

| Camada          | Tecnologia                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| Framework       | [Astro 5](https://astro.build) — static-first, island architecture          |
| Interatividade  | [Preact](https://preactjs.com) — islands para componentes interativos       |
| Estilização     | [Tailwind CSS 4](https://tailwindcss.com) — utility-first com design tokens |
| Tipografia      | Inter, Sora, JetBrains Mono — variable fonts auto-hospedadas                |
| Deploy          | [Vercel](https://vercel.com) — edge deployment com adapter nativo           |
| CI/CD           | GitHub Actions — auditorias Lighthouse automatizadas                        |
| Package Manager | [pnpm](https://pnpm.io)                                                     |
| Linguagem       | TypeScript                                                                  |

---

## Funcionalidades

- **Island Architecture** — zero JS por padrão, hidratação seletiva apenas onde necessário
- **3 idiomas** — Português (BR), English, Español com rotas dedicadas
- **Dark / Light mode** — duas identidades visuais distintas, persistidas em `localStorage`
- **SEO completo** — Open Graph, Twitter Card, JSON-LD (Person schema), hreflang, sitemap automático
- **PWA-ready** — manifest.json, ícones em múltiplas resoluções, apple-touch-icon
- **Case studies** — accordion progressivamente aprimorado (funciona sem JS)
- **Stats animados** — contadores com easing que respeitam `prefers-reduced-motion`
- **Mobile-first** — menu hamburger com focus trap, scroll lock, e tecla Escape
- **Scroll spy** — navegação ativa baseada na viewport
- **Security headers** — CSP, X-Frame-Options, Permissions-Policy via `vercel.json`
- **Print stylesheet** — versão otimizada para impressão

---

## Começando

### Pré-requisitos

- **Node.js** >= 18
- **pnpm** >= 9

```bash
# Instalar pnpm (se necessário)
npm install -g pnpm
```

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/Jbnado/portfolio-jb.git
cd portfolio-jb

# Instalar dependências
pnpm install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento (http://localhost:4321)
pnpm dev
```

O hot-reload está habilitado por padrão. Edite qualquer arquivo em `src/` e veja as alterações instantaneamente.

### Build & Preview

```bash
# Gerar build de produção
pnpm build

# Pré-visualizar a build localmente
pnpm preview
```

### Deploy

O projeto está configurado para deploy automático na **Vercel**. Qualquer push para `main` dispara um novo deploy.

Para deploy manual:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Estrutura do Projeto

```
portfolio-jb/
├── .github/
│   ├── workflows/
│   │   └── lighthouse.yml        # CI — auditorias Lighthouse
│   └── lighthouse/
│       └── lighthouserc.json      # Config Lighthouse CI
├── public/
│   ├── fonts/                     # Variable fonts (woff2)
│   ├── Bernardo-CV.pdf            # CV para download
│   ├── manifest.json              # PWA manifest
│   ├── og-image.png               # Open Graph image
│   ├── robots.txt                 # Crawlers config
│   └── favicon.*                  # Favicons em múltiplos formatos
├── src/
│   ├── components/                # Componentes Astro (server-rendered)
│   │   ├── HeroSection.astro
│   │   ├── AboutSection.astro
│   │   ├── TimelineSection.astro
│   │   ├── ProjectsSection.astro
│   │   ├── ContactSection.astro
│   │   ├── NavBar.astro
│   │   ├── Footer.astro
│   │   ├── SEOHead.astro          # Meta tags, OG, JSON-LD
│   │   ├── LanguageSwitcher.astro
│   │   └── ...
│   ├── islands/                   # Preact islands (client-side)
│   │   ├── ThemeToggle.tsx        # Dark/light mode
│   │   ├── MobileNav.tsx          # Menu mobile com focus trap
│   │   ├── ScrollSpy.tsx          # Nav link ativo
│   │   ├── StatsCounter.tsx       # Contadores animados
│   │   ├── CaseStudyExpander.tsx  # Accordion de case studies
│   │   └── ScrollIndicator.tsx    # Indicador de scroll
│   ├── content/                   # Astro Content Collections (JSON)
│   │   ├── stats/
│   │   ├── timeline/
│   │   └── projects/
│   ├── i18n/                      # Traduções
│   │   ├── utils.ts               # Helpers t() e getLocaleFromUrl()
│   │   ├── pt-br.json
│   │   ├── en.json
│   │   └── es.json
│   ├── layouts/
│   │   └── BaseLayout.astro       # Layout principal
│   ├── pages/
│   │   ├── index.astro            # / (pt-br)
│   │   ├── 404.astro              # Página 404
│   │   ├── en/index.astro         # /en/
│   │   └── es/index.astro         # /es/
│   ├── styles/
│   │   └── global.css             # Design system completo
│   └── utils/
│       └── constants.ts           # SITE_URL, LOCALES, tipos
├── astro.config.mjs               # Config Astro + i18n + Vercel
├── vercel.json                    # Headers de segurança
├── tsconfig.json
└── package.json
```

---

## Internacionalização (i18n)

O site suporta **3 idiomas** usando o sistema nativo de i18n do Astro:

| Locale           | Rota   | Exemplo          |
| ---------------- | ------ | ---------------- |
| `pt-br` (padrão) | `/`    | `jbnado.dev/`    |
| `en`             | `/en/` | `jbnado.dev/en/` |
| `es`             | `/es/` | `jbnado.dev/es/` |

### Adicionando um novo idioma

1. Criar arquivo de tradução em `src/i18n/` (ex: `fr.json`)
2. Adicionar o locale em `astro.config.mjs` no array `locales`
3. Adicionar o locale no tipo `Locale` em `src/utils/constants.ts`
4. Criar a pasta de páginas `src/pages/fr/index.astro`
5. Adicionar traduções nos Content Collections (`timeline.json`, `projects.json`)

### Usando traduções

```typescript
import { t } from "../i18n/utils";

// Nos componentes Astro:
const label = t(locale, "nav.about"); // "Sobre Mim" | "About Me" | "Sobre Mí"
```

---

## Sistema de Conteúdo

O conteúdo é gerenciado via [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) com arquivos JSON:

| Collection | Arquivo                              | Descrição                               |
| ---------- | ------------------------------------ | --------------------------------------- |
| `stats`    | `src/content/stats/stats.json`       | Métricas do hero (anos, projetos, etc.) |
| `timeline` | `src/content/timeline/timeline.json` | Trajetória profissional e projetos      |
| `projects` | `src/content/projects/projects.json` | Projetos em destaque com case studies   |

Todos os textos voltados ao usuário usam o formato i18n:

```json
{
  "title": {
    "pt-br": "Título em Português",
    "en": "Title in English",
    "es": "Título en Español"
  }
}
```

---

## Design System

O tema é definido em `src/styles/global.css` com design tokens via CSS custom properties.

### Cores principais

| Token      | Dark      | Light     | Uso                      |
| ---------- | --------- | --------- | ------------------------ |
| `--accent` | `#C2703E` | `#C2703E` | Links, destaques, botões |
| `--bg`     | `#1A1A1A` | `#FAFAF8` | Fundo principal          |
| `--text`   | `#E8E8E8` | `#1A1A1A` | Texto principal          |
| `--muted`  | `#A0A0A0` | `#6B7280` | Texto secundário         |

### Tipografia

| Fonte              | Uso                | Formato        |
| ------------------ | ------------------ | -------------- |
| **Sora**           | Headings e display | Variable woff2 |
| **Inter**          | Body text          | Variable woff2 |
| **JetBrains Mono** | Código e badges    | Variable woff2 |

### Temas

O modo dark e light são tratados como **duas personalidades visuais** distintas:

- **Dark** — textura de ruído, gradiente radial no hero, sombras quentes
- **Light** — barra de acento no topo, sombras leves, fundo off-white limpo

---

## Performance & Lighthouse

O projeto mantém scores **95+** em Performance e Acessibilidade, validados automaticamente via GitHub Actions em cada push.

```
Performance:    95+
Accessibility:  95+
Best Practices: 95+
SEO:            95+
```

As auditorias rodam em todas as rotas (`/`, `/en/`, `/es/`) via [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

---

## Acessibilidade

O site segue as diretrizes **WCAG 2.1 AA**:

- Skip-to-content link
- Focus-visible em todos os elementos interativos
- ARIA labels em navegação, botões e landmarks
- `prefers-reduced-motion` — desabilita animações
- `prefers-contrast: high` — ajusta contrastes
- Focus trap no menu mobile
- Semantic HTML com landmarks apropriados
- Targets de toque mínimos de 44px
- Testes automatizados via Lighthouse CI

---

## Scripts Disponíveis

| Comando        | Descrição                                              |
| -------------- | ------------------------------------------------------ |
| `pnpm dev`     | Inicia servidor de desenvolvimento em `localhost:4321` |
| `pnpm build`   | Gera build de produção                                 |
| `pnpm preview` | Pré-visualiza build de produção localmente             |
| `pnpm astro`   | Acessa o CLI do Astro diretamente                      |

---

## Licença

Este projeto é de código aberto. Sinta-se livre para usar como referência ou inspiração para seu próprio portfolio.

---

<p align="center">
  Feito com <a href="https://astro.build">Astro</a> + <a href="https://preactjs.com">Preact</a> + <a href="https://tailwindcss.com">Tailwind CSS</a>
  <br />
  <strong><a href="https://jbnado.dev">jbnado.dev</a></strong>
</p>
