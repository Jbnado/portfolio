---
slug: "portfolio-jb"
locale: "pt-br"
title: "Este Portfólio"
summary: "O site que você está navegando, aberto por dentro. Um teardown técnico com código de verdade, das duas paletas em CSS às ilhas Preact hidratadas sob demanda, do SEO e hreflang à mão até a pegadinha de content collections multi-idioma e os detalhes de build do Astro."
highlights:
  - { value: "0 JS", label: "por padrão; ilhas Preact hidratadas sob demanda" }
  - { value: "2", label: "paletas trocadas em variáveis CSS" }
  - { value: "3", label: "idiomas com hreflang e SEO à mão" }
meta:
  - { label: "PAPEL", value: "Design e desenvolvimento (solo)" }
  - { label: "TIPO", value: "Projeto" }
  - { label: "PERÍODO", value: "2025 – 2026" }
  - { label: "STACK", value: "Astro · Preact · Tailwind 4" }
---

Esta página que você está lendo é feita pelo próprio sistema que ela descreve. Então, em vez de falar do conceito, deixa eu abrir o capô. O site tem duas personalidades. No claro ele é uma mesa de engenharia, papel manila e linhas de blueprint. No escuro é um terminal punk, verde fósforo brilhando no CRT. O que segue é como cada parte disso funciona, com o código de verdade que está no ar agora.

## Duas paletas, um só conjunto de classes

O truque das duas personalidades é que não existem dois sites. Existe um, e o tema é um punhado de variáveis CSS trocadas na tag `<html>`. Cada paleta é um bloco de custom properties.

```css
.light {
  --color-bg-primary: #f2efe4;   /* papel manila */
  --color-text-primary: #22242b; /* tinta quase preta */
  --color-accent: #8f2d24;       /* oxblood de carimbo */
}
.dark {
  --color-bg-primary: #0a0f0c;   /* preto-esverdeado de CRT */
  --color-text-primary: #7cf5ad; /* verde fósforo */
  --color-accent: #42f59b;       /* verde ácido */
}
```

O Tailwind 4 entra por cima. Eu declaro o modo escuro como uma variante de classe e mapeio cada variável pra uma utility no bloco `@theme`.

```css
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-bg-primary: var(--color-bg-primary);
  --color-text-primary: var(--color-text-primary);
  --color-accent: var(--color-accent);
}
```

Na prática eu escrevo `bg-bg-primary` uma vez no HTML e nunca mais penso nisso. Trocar a classe `light` pela `dark` no `<html>` reescreve a paleta inteira embaixo. A cor não fica grudada no componente, ela mora no tema.

## O tema não pisca no carregamento

O problema clássico de tema escuro é o flash. A página nasce clara, o JavaScript carrega, percebe que você quer escuro, e troca na sua cara. Feio. A saída é decidir o tema antes do primeiro paint, com um script inline no topo do `<head>`, antes das folhas de estilo.

```html
<script is:inline>
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(t);
</script>
```

São duas linhas. Como elas rodam de forma síncrona antes do CSS, quando o navegador desenha o primeiro pixel a classe certa já está na tag `<html>`. O `is:inline` é o que diz pro Astro não processar nem mover esse script, deixar ali cru mesmo. Sem isso, não tem como o tema não piscar.

## Ilhas Preact e a hidratação sob demanda

O site é Astro, então por padrão ele manda HTML e zero JavaScript. Onde eu preciso de interação uso uma ilha de Preact, e o detalhe que importa é escolher quando cada ilha ganha vida. O Astro tem uma diretiva pra cada urgência.

```astro
<ThemeToggle client:load />      <!-- essencial, hidrata já -->
<ScrollSpy client:idle />        <!-- pode esperar o navegador respirar -->
<StatsCounter client:visible />  <!-- só quando rolar até ele -->
```

O botão de tema precisa funcionar no primeiro toque, então `client:load`. O scroll spy que acende o item do menu conforme você lê não tem pressa, `client:idle` guarda ele pra quando a thread principal estiver livre. E o contador de estatísticas só faz sentido quando aparece na tela, `client:visible` nem baixa o JavaScript dele até você rolar até lá. A regra que eu sigo é casar o custo da hidratação com o quanto aquilo importa.

## SEO escrito à mão

Nada de plugin mágico de SEO. Cada página monta as próprias tags, e as que mais pesam num site em três idiomas são as de hreflang, que avisam o Google que aquela página tem irmãs em outras línguas.

```astro
<link rel="alternate" hreflang="pt-BR" href={links['pt-br']} />
<link rel="alternate" hreflang="en" href={links['en']} />
<link rel="alternate" hreflang="es" href={links['es']} />
<link rel="alternate" hreflang="x-default" href={links['pt-br']} />
```

O `x-default` aponta pra versão padrão pra quem não bate em nenhum idioma da lista. E cada case study ainda emite um JSON-LD, os dados estruturados que dizem pro buscador que aquilo é um trabalho autoral, e não um texto solto na página.

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  headline: entry.data.title,
  inLanguage: LOCALE,
  url: canonical,
  author: { '@type': 'Person', name: 'João Bernardo' },
};
```

Como o Astro gera tudo isso como HTML estático no build, o robô do Google recebe as tags prontas, sem precisar rodar nada pra ver o conteúdo.

## A pegadinha de content collections multi-idioma

Essa aqui me custou um tempo, então fica a dica. Cada case study é um markdown, um arquivo por idioma, tipo `instanta.pt-br.md` e `instanta.en.md`. Os dois têm o mesmo `slug` no frontmatter. O loader de glob do Astro, por padrão, usa esse `slug` como id da entrada. Resultado, os idiomas colidem e um sobrescreve o outro.

A saída é gerar o id na mão, combinando slug e locale.

```ts
loader: glob({
  pattern: '*.md',
  base: './src/content/caseStudies',
  // o id padrão é o slug do frontmatter, que colide entre locales.
  // combinar slug + locale faz as 18 entradas carregarem distintas.
  generateId: ({ data }) => `${data.slug}.${data.locale}`,
}),
```

Depois disso, pegar a versão certa é só pedir `getEntry('caseStudies', 'instanta.pt-br')`. Se você um dia montar um site multilíngue com content collections, é o primeiro lugar onde eu olharia.

## Acessibilidade que o usuário controla

Acessibilidade boa não é só contraste, é respeitar o que a pessoa já configurou no sistema dela. Três media queries fazem quase todo o trabalho aqui.

```css
/* quem pediu menos movimento, recebe menos movimento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* quem pediu mais contraste, ganha cores mais fortes */
@media (prefers-contrast: high) {
  .dark { --color-text-primary: #b6ffd6; --color-border: currentColor; }
}

/* contorno de foco só pra quem navega no teclado */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

O glitch e o brilho de CRT, que são a graça do modo escuro, somem inteiros pra quem marcou "reduzir movimento". O `:focus-visible` mostra o contorno pra quem anda pelo teclado sem poluir a tela de quem usa mouse. Nada disso aparece numa demo bonita, mas é o que faz o site funcionar pra quem não navega igual a mim.

## Uns detalhes de build

Duas coisas na configuração que valem ouro. A primeira é setar o `site` no `astro.config`. Sem essa URL absoluta, o sitemap e as tags de canônico saem quebrados. A segunda é o i18n com o idioma padrão sem prefixo, então o português mora na raiz e só en e es ganham pasta própria.

```js
export default defineConfig({
  site: 'https://jbnado.dev',
  integrations: [preact(), sitemap()],
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
});
```

E as fontes são todas self-hosted, servidas do próprio domínio, como fontes variáveis subsetadas por `unicode-range` pra baixar só os caracteres que o site usa. As duas mais críticas pro primeiro paint eu ainda dou preload no `<head>`. Fonte vinda de terceiro é um pedido de rede a mais e um ponto de lentidão que eu não quero num site que se vende pela velocidade.

```html
<link rel="preload" as="font" href="/fonts/inter-variable.woff2"
      type="font/woff2" crossorigin />
```

No fim é o meu site pessoal, mas eu não tratei como cartão de visita. Tratei como produto, e o próprio código é parte do portfólio. Está tudo aberto no GitHub pra quem quiser ler por inteiro, não só os pedaços que couberam aqui.
