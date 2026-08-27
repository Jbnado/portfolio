# jbnado.dev

[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Preact](https://img.shields.io/badge/Preact-10-673AB8?logo=preact&logoColor=white)](https://preactjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-deploy-000?logo=vercel&logoColor=white)](https://vercel.com)

Código-fonte do portfólio pessoal de [João Bernardo](https://jbnado.dev), desenvolvedor fullstack em Ribeirão Preto, SP.

O site reúne trajetória profissional, projetos, contribuições open source, estudos de caso e artigos técnicos. Foi construído com Astro para entregar HTML por padrão e usa ilhas Preact somente nas interações que precisam de JavaScript no navegador.

**Site:** [jbnado.dev](https://jbnado.dev) · **GitHub:** [@Jbnado](https://github.com/Jbnado) · **LinkedIn:** [jbnado](https://linkedin.com/in/jbnado)

## Principais recursos

- conteúdo em português, inglês e espanhol, com rotas e currículos próprios para cada idioma;
- páginas de projetos e contribuições com estudos de caso escritos em Markdown;
- blog técnico com busca no cliente, tags, paginação, tempo de leitura e vídeos incorporados com privacidade aprimorada;
- feeds RSS independentes por idioma;
- tema claro e escuro com preferência persistida;
- componentes interativos isolados em Preact: navegação mobile, scroll spy, contadores, busca do blog e expansores;
- metadados canônicos, `hreflang`, Open Graph, Twitter Cards e JSON-LD;
- sitemap, `robots.txt`, manifesto web e endpoint `llms.txt` gerado a partir do conteúdo publicado;
- cabeçalhos de segurança configurados para a Vercel;
- fontes variáveis hospedadas localmente e suporte a `prefers-reduced-motion`.

## Stack

| Área | Tecnologia |
| --- | --- |
| Framework | [Astro 5](https://astro.build) |
| Interatividade | [Preact 10](https://preactjs.com) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com) e CSS global |
| Linguagem | TypeScript |
| Conteúdo | Astro Content Collections, Markdown e JSON |
| Testes | [Vitest](https://vitest.dev) |
| Imagens | [Sharp](https://sharp.pixelplumbing.com) |
| Hospedagem | Vercel com adapter oficial do Astro |
| Pacotes | pnpm 9 |

## Como executar

### Pré-requisitos

- Node.js 18 ou superior;
- [pnpm](https://pnpm.io/installation) 9.

```bash
git clone https://github.com/Jbnado/portfolio.git
cd portfolio
pnpm install
pnpm dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:4321`.

### Scripts

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Valida o conteúdo e gera a build de produção |
| `pnpm preview` | Serve localmente a última build |
| `pnpm test` | Executa os testes uma vez com Vitest |
| `pnpm test:watch` | Executa os testes em modo interativo |
| `pnpm astro` | Encaminha argumentos para a CLI do Astro |

Para validar a mesma saída que será publicada:

```bash
pnpm test
pnpm build
pnpm preview
```

## Arquitetura

```text
portfolio-jb/
├── public/                  # CVs, favicons, imagens sociais, fontes e manifesto
├── scripts/                 # geração de favicons e imagem Open Graph
├── src/
│   ├── components/          # componentes Astro e composição das páginas
│   ├── content/
│   │   ├── blog/            # artigos Markdown, um arquivo por idioma
│   │   ├── caseStudies/     # estudos de caso Markdown, um arquivo por idioma
│   │   ├── projects/        # catálogo e resumo dos projetos em JSON
│   │   ├── stats/           # números exibidos no portfólio
│   │   └── timeline/        # experiência profissional
│   ├── i18n/                # dicionários e utilitários de tradução
│   ├── islands/             # componentes Preact hidratados no cliente
│   ├── layouts/             # layout base compartilhado
│   ├── pages/               # rotas Astro em pt-BR, inglês e espanhol
│   ├── styles/              # estilos globais e das ilhas
│   └── utils/               # constantes, conteúdo e regras do blog
├── astro.config.mjs         # Astro, Preact, Tailwind, sitemap, i18n e Vercel
├── src/content.config.ts    # schemas das Content Collections
├── vercel.json              # redirect do sitemap e cabeçalhos de segurança
└── vitest.config.ts         # configuração dos testes
```

Astro renderiza a maior parte da interface no servidor. Os arquivos em `src/islands/` são hidratados apenas quando uma funcionalidade exige estado ou APIs do navegador, reduzindo o JavaScript enviado nas páginas essencialmente editoriais.

## Design system

Os tokens ficam em `src/styles/global.css`, nos blocos `.dark` e `.light`. Os dois temas não são o mesmo layout com brilho invertido: o claro imita uma mesa de engenharia, com papel manila, tinta oxblood e azul de blueprint; o escuro imita um terminal CRT, com fósforo verde sobre preto esverdeado. O tema claro é o padrão.

| Token | Claro | Escuro |
| --- | --- | --- |
| `--color-bg-primary` | `#f2efe4` papel manila | `#0a0f0c` preto-esverdeado |
| `--color-bg-secondary` | `#f8f6ef` | `#0f1512` |
| `--color-text-primary` | `#22242b` tinta azulada | `#7cf5ad` verde fósforo |
| `--color-text-secondary` | `#5f636e` | `#4fbf85` |
| `--color-accent` | `#8f2d24` oxblood | `#42f59b` verde ácido |
| `--color-accent-secondary` | `#2f5aa8` azul blueprint | `#61ffca` fósforo brilhante |
| `--color-revolt` | `#8f2d24` | `#ff3e3e` |
| `--color-border` | `#cbc7ba` borda de papel | `#1f5a3d` |
| `--color-ink-blue` | `#2f5aa8` | `#54c59f` |

Quatro famílias variáveis são hospedadas localmente e expostas como tokens:

| Token | Fonte | Uso |
| --- | --- | --- |
| `--font-sans` | Inter | corpo do texto no tema claro |
| `--font-display` | Sora | títulos e display |
| `--font-mono` | JetBrains Mono | código, etiquetas e todo o corpo do tema escuro |
| `--font-punk` | Permanent Marker | destaques manuscritos do tema escuro |

A troca de tema aplica a classe `dark` ou `light` na tag `<html>`, e as custom properties cascateiam para os utilitários do Tailwind pelo bloco `@theme`. Um script inline no `<head>` do `BaseLayout.astro` resolve o tema antes das folhas de estilo carregarem, evitando o flash de tema errado.

## Conteúdo e internacionalização

O idioma padrão é `pt-br` e não recebe prefixo. Inglês e espanhol vivem sob `/en/` e `/es/`.

| Conteúdo | Português | Inglês | Espanhol |
| --- | --- | --- | --- |
| Página inicial | `/` | `/en/` | `/es/` |
| Blog | `/blog/` | `/en/blog/` | `/es/blog/` |
| RSS | `/rss.xml` | `/en/rss.xml` | `/es/rss.xml` |
| Projeto | `/projeto/:slug/` | `/en/project/:slug/` | `/es/proyecto/:slug/` |
| Contribuição | `/contribuicao/:slug/` | `/en/contribution/:slug/` | `/es/contribucion/:slug/` |

Textos compartilhados da interface ficam em `src/i18n/*.json`. Estatísticas, timeline e catálogo de projetos usam objetos com as chaves `pt-br`, `en` e `es`. Artigos e estudos de caso têm um arquivo Markdown por locale e frontmatter validado por Zod em `src/content.config.ts`.

Ao publicar conteúdo, mantenha o mesmo `slug` entre as traduções e defina o `locale` correto em cada arquivo. No blog, `urlSlug` controla o endereço público traduzido; posts com `draft: true` não entram nas listagens públicas.

## SEO, descoberta e segurança

Cada página pode fornecer título, descrição, canonical, alternates, imagem social e dados estruturados próprios. O componente `SEOHead.astro` centraliza as tags comuns e publica uma entidade `Person` estável, referenciada pelos schemas de artigos e estudos de caso.

A aplicação também oferece:

- sitemap gerado por `@astrojs/sitemap`;
- feeds RSS localizados;
- `llms.txt` derivado das collections;
- índice JSON enxuto para a busca do blog;
- política de segurança de conteúdo, bloqueio de frames, política de referência e restrições de permissões em `vercel.json`.

## Acessibilidade

O que já está implementado:

- link de pular para o conteúdo (`src/components/SkipToContent.astro`);
- HTML semântico com landmarks e `lang` correto por rota;
- `aria-label` nos links de contato, na navegação e nos controles de idioma e tema;
- texto decorativo dos eyebrows em `data-txt` renderizado por `::before`, o que mantém o modo leitura e os leitores de tela livres de ruído;
- `prefers-reduced-motion: reduce` desliga as animações, em seis blocos de `global.css`;
- `prefers-contrast: high` sobe o contraste do texto e das bordas nos dois temas;
- foco preso na gaveta do menu mobile e fechamento por `Escape`.

Não há auditoria automatizada de acessibilidade no CI, e o projeto não afirma conformidade WCAG 2.1 AA. As pendências conhecidas, incluindo alvos de toque abaixo de 44px e o ciclo de foco do menu mobile, estão registradas nos relatórios em `docs/`.

## Licença

Distribuído sob a [licença MIT](./LICENSE). O código pode ser estudado e reutilizado conforme os termos da licença; textos, identidade pessoal, currículos e imagens do autor permanecem materiais próprios do portfólio.

---

<p align="center">
  Feito por <a href="https://jbnado.dev">João Bernardo</a> com Astro, Preact e Tailwind CSS.
</p>
