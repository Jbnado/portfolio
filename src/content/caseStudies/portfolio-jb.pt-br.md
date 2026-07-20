---
slug: "portfolio-jb"
locale: "pt-br"
title: "Este Portfólio"
seoTitle: "Este portfólio por dentro — teardown técnico em Astro e Preact | João Bernardo"
summary: "O site que você está navegando, aberto por dentro. Um teardown com código de verdade, das duas paletas em variáveis CSS às ilhas Preact hidratadas sob demanda, dos eyebrows que viram comando de shell no escuro e papelada de engenharia no claro, da statusline que digita ao clicar, do SEO e hreflang escritos à mão às pegadinhas de content collections e de deploy que me custaram um tempo."
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

## Cada tema no seu universo

As duas personalidades não param na cor. Cada seção tem uma linha decorativa em cima do título, e essa linha é uma coisa diferente em cada tema. No escuro ela é um comando de shell de verdade. No claro, é a papelada de uma prancheta de engenharia.

Acima de "Projetos", o modo escuro mostra `jbnado@rp:~$ cd ~/projetos && ls -la`. O modo claro mostra `FL. 04/06 · MEMORIAL DESCRITIVO`. Acima do contato, o escuro dá um `ping -c 1 bernardo` que responde de Ribeirão Preto, e o claro mostra `ASSINATURA DO RESPONSÁVEL`. São comandos reais, que existem em man page, e não enfeite fingindo ser terminal.

O jeito de fazer isso sem JavaScript e sem piscar na troca de tema é o mesmo truque das cores. Cada ponto desses renderiza dois spans, os dois `aria-hidden`, e o CSS decide qual aparece.

```astro
<span class="term-line" aria-hidden="true">{term}</span>
<span class="paper-tag" aria-hidden="true">{paper}</span>
```

```css
.light .term-line { display: none; }
.dark  .paper-tag { display: none; }
```

O `aria-hidden` nos dois importa. Quem usa leitor de tela não quer ouvir "jbnado arroba rp" antes de cada seção. O título de verdade, o `<h2>`, continua ali, limpo e legível pra máquina. O comando é enfeite pra quem enxerga, e some pra quem não precisa dele.

## A statusline que digita o comando

Esse foi o detalhe que eu mais me diverti fazendo. No modo escuro, quando você clica num link, uma barra fina aparece no rodapé e digita o comando equivalente antes de te levar pra página. Clicar em "ler case study" digita `cd /projeto/instanta`. Um link externo digita `xdg-open`. O download do CV digita `scp jbnado.dev:cv.pdf ~/Downloads/`.

Parece bobagem, mas tem regra pra caramba pra isso não atrapalhar ninguém. A barra só existe no escuro. Se você marcou "reduzir movimento" no sistema, ela ainda aparece, só que com o comando inteiro de uma vez, sem a digitação, e aí navega. Clique com ctrl ou no botão do meio, pra abrir em nova aba, passa direto sem eu tocar. Link que abre em outra aba, e-mail e download rodam a animação em paralelo, sem segurar a ação. Só a navegação normal, na mesma aba, é que eu seguro pra digitar, com um teto de 300 milissegundos pra nunca virar espera.

```tsx
// só no universo do terminal (escuro)
if (!isDark()) return;
// ctrl/cmd/shift/alt ou botão do meio nunca são interceptados
if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

e.preventDefault();
type(command, () => { window.location.href = dest; });
// type() respeita "reduzir movimento": mostra o comando inteiro,
// sem digitar, e então segue.
```

Se o JavaScript não carrega, os links funcionam normal, porque o `preventDefault` só roda dentro da ilha, que pode nem ter subido. É enfeite por cima de um link que já funcionava sozinho. E o e-mail nunca vai pra barra, nem no comando de mandar mensagem, porque o endereço fica ofuscado no site e eu não ia jogar ele na tela num easter egg.

## Ilhas Preact e a hidratação sob demanda

O site é Astro, então por padrão ele manda HTML e zero JavaScript. Onde eu preciso de interação uso uma ilha de Preact, e o detalhe que importa é escolher quando cada ilha ganha vida. O Astro tem uma diretiva pra cada urgência.

```astro
<ThemeToggle client:load />      <!-- essencial, hidrata já -->
<ScrollSpy client:idle />        <!-- pode esperar o navegador respirar -->
<StatsCounter client:visible />  <!-- só quando rolar até ele -->
```

O botão de tema precisa funcionar no primeiro toque, então `client:load`. O scroll spy que acende o item do menu conforme você lê não tem pressa, `client:idle` guarda ele pra quando a thread principal estiver livre. E o contador de estatísticas só faz sentido quando aparece na tela, `client:visible` nem baixa o JavaScript dele até você rolar até lá. A regra que eu sigo é casar o custo da hidratação com o quanto aquilo importa. A statusline que digita entra aqui também, com `client:idle`, porque ela pode esperar.

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
  // combinar slug + locale faz as entradas carregarem distintas.
  generateId: ({ data }) => `${data.slug}.${data.locale}`,
}),
```

Depois disso, pegar a versão certa é só pedir `getEntry('caseStudies', 'instanta.pt-br')`. Se você um dia montar um site multilíngue com content collections, é o primeiro lugar onde eu olharia.

## A pegadinha do Sharp no deploy

Essa me pegou depois de um deploy que eu jurava que ia passar. O build quebrou no Vercel com `MissingSharp: Could not find Sharp`, e o mais irritante é que o log mostrava o Sharp sendo instalado logo acima do erro. Localmente passava, no Vercel não.

O Sharp é o que o Astro usa pra otimizar as imagens no build. Ele vinha instalado, mas só como dependência transitiva do próprio Astro. Com o pnpm, dependência transitiva não sobe pro `node_modules` da raiz, ela fica aninhada. Localmente o build reaproveitava imagens do cache e nem chamava o Sharp, então o problema não aparecia. No Vercel, com build limpo e sem cache, o Astro tentava carregar o Sharp da raiz e não achava.

A correção é declarar o Sharp como dependência direta, pra ele subir pra raiz e o import resolver.

```jsonc
// package.json
"dependencies": {
  "sharp": "^0.34.0"  // casa com o range que o Astro pede
}
```

Aproveitei o Sharp já resolvido pra gerar a imagem de preview social do próprio site, aquela que aparece quando você manda o link no WhatsApp. Um script pega um SVG no visual do terminal e rasteriza num PNG de 1200 por 630. Antes disso, o preview era um retângulo laranja liso de placeholder, que não tinha nada a ver com o site.

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
