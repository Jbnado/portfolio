---
name: jbnado.dev
description: Um portfólio de dois turnos — a prancheta de engenharia de dia, o terminal de fósforo de madrugada.
colors:
  midday-light: "#f2efe4"
  service-sheet: "#dfdace"
  paper-well: "#cdc7b9"
  graphite: "#22242b"
  worn-pencil: "#5e564a"
  approval-stamp: "#8f2d24"
  approval-stamp-deep: "#742019"
  approval-stamp-diluted: "#b58d85"
  draftsman-line: "#2f5aa8"
  paper-edge: "#a89f8b"
  instrument-edge: "#6f6757"
  room-at-2am: "#0a0f0c"
  room-at-2am-raised: "#0f1512"
  room-at-2am-well: "#060a08"
  screen-glow: "#7cf5ad"
  screen-glow-dim: "#4fbf85"
  command-accepted: "#42f59b"
  command-accepted-bright: "#7dffb0"
  live-cursor: "#61ffca"
  muted-phosphor: "#54c59f"
  alarm: "#ff3e3e"
  conduit-green: "#1f5a3d"
  conduit-green-strong: "#2f8a5e"
typography:
  display:
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  numeral:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  numeral-lg:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  cta-lg:
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-compact:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-terminal:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
  meta:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  display-404:
    fontFamily: "Sora, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4rem, 10vw, 8rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  marker:
    fontFamily: "Permanent Marker, Sora, cursive"
    fontSize: "clamp(3rem, 8vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "normal"
rounded:
  square: "0"
  thread: "1px"
  nub: "3px"
  hairline: "2px"
  sheet: "4px"
  control: "6px"
  toggle: "8px"
  pill: "20px"
  disc: "50%"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "3rem"
  4xl: "4rem"
components:
  button-cta-primary:
    backgroundColor: "{colors.approval-stamp}"
    textColor: "{colors.midday-light}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.75rem 1.25rem"
    height: "44px"
  button-cta-primary-hover:
    backgroundColor: "{colors.approval-stamp-deep}"
    textColor: "{colors.midday-light}"
  button-cta-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.75rem 1.25rem"
    height: "44px"
  button-cv:
    backgroundColor: "{colors.approval-stamp}"
    textColor: "{colors.midday-light}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.375rem 0.75rem"
  button-cv-hover:
    backgroundColor: "{colors.approval-stamp-deep}"
    textColor: "{colors.midday-light}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.sheet}"
    padding: "0.5rem 1.25rem"
  badge-tech:
    backgroundColor: "transparent"
    textColor: "{colors.worn-pencil}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  stamp-ink:
    backgroundColor: "transparent"
    textColor: "{colors.approval-stamp}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "0.2rem 0.6rem"
  card-sheet:
    backgroundColor: "{colors.service-sheet}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.sheet}"
    padding: "0.875rem"
  panel-instrument:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.square}"
    padding: "1.5rem"
  input-search:
    backgroundColor: "{colors.service-sheet}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.sheet}"
    padding: "0.625rem 2.25rem 0.625rem 0.75rem"
    width: "100%"
---

# Design System: jbnado.dev

## Overview

**Creative North Star: "Turno Diurno, Turno Noturno"**

O mesmo engenheiro, a mesma mesa, duas horas do dia. No turno diurno a mesa está sob luz natural: papel manila, tinta oxblood, traço azul de desenhista, grade milimetrada quase invisível sob o conteúdo. No turno noturno a luz natural acabou e sobrou o monitor: fósforo verde sobre preto-esverdeado, linhas de varredura, cursor piscando, o alarme vermelho quando alguma coisa exige atenção. A troca de tema não é troca de marca. É passagem de tempo, e a cortina de transição de 1s existe justamente para que ela seja lida como isso.

O sistema é **preciso e sóbrio**: o alinhamento e a escolha de tipo carregam a confiança, não o tratamento visual. É **físico antes de digital**: furos de cartão perfurado, carimbos rotacionados, etiquetas, bordas tracejadas e papel gasto vêm antes de qualquer efeito que só um navegador saberia fazer. E é **ruidoso quando quer** — mas a licença para ruído é do turno noturno, onde glitch RGB, glow de fósforo, Permanent Marker torto e adesivos são parte do vocabulário. O turno diurno não tem essa licença; a contenção é o traço dele, não uma falta.

A dupla personalidade é implementada inteiramente em custom properties sobre o mesmo HTML. Nenhum elemento é duplicado por tema: o texto decorativo vive em `data-txt` e é pintado por `::before`, então o turno errado simplesmente não pinta nada, e o modo de leitura do navegador recebe markup limpo.

**Key Characteristics:**

- Dois turnos completos sob os mesmos nomes de token; nenhum é o outro com filtro aplicado
- Vocabulário de papelaria técnica: furos, carimbos, etiquetas, numeração, tracejado
- Bordas fazem o trabalho que sombras fariam em outro sistema
- Mono para tudo que é rótulo, comando ou metadado; proporcional para tudo que se lê em quantidade
- Cantos quase retos: o padrão é 0–4px, e 8px já é exceção
- Decoração de personagem só existe a partir de 1024px; a identidade no celular vive no tipo e na cor

## Colors

Duas paletas inteiras sob os mesmos nomes de token. O turno diurno é papel e tinta — pouca saturação, um único acento quente. O turno noturno é emissão — fósforo verde dominante com um vermelho de alarme guardado para pontos únicos.

### Primary

- **Carimbo de Aprovação** (`{colors.approval-stamp}`, turno diurno): o único acento quente do dia. Marca ação e estado — CTA do hero, links ativos, carimbo `CONTRIB`, barra de 3px no topo da página, foco de teclado. É oxblood de almofada de carimbo, não vermelho de erro.
- **Comando Aceito** (`{colors.command-accepted}`, turno noturno): o verde que responde. Preenchimento de CTA, outline de foco, borda de campo em foco. Ocupa no escuro exatamente o papel que o Carimbo ocupa no claro.

### Secondary

- **Traço de Desenhista** (`{colors.draftsman-line}`, turno diurno): azul de blueprint. Grade milimetrada do `.blueprint-wrap`, ano do projeto, acento secundário. Nunca compete com o Carimbo por atenção — é infraestrutura de fundo.
- **Cursor Vivo** (`{colors.live-cursor}`, turno noturno): o fósforo mais brilhante do sistema. Títulos de case, carimbos, statusline, tech badges, e a origem de praticamente todo `text-shadow` de glow. No claro, o token equivalente dobra para o azul de blueprint; no escuro ele dobra para **Fósforo Apagado** (`{colors.muted-phosphor}`) onde precisa recuar.

### Tertiary

- **Alarme** (`{colors.alarm}`): vermelho de revolta, exclusivo do turno noturno. Carimbo de contribuição, `BOOM!`, hover alternado da navegação, franjas do glitch RGB. No turno diurno o token de revolta dobra para o próprio Carimbo de Aprovação — o dia não tem uma cor de alarme separada.

### Neutral

**Turno diurno**
- **Luz de Meio-Dia** (`{colors.midday-light}`): fundo da página. É a mesa, e é o campo **mais claro** do sistema. Manila frio, não branco — o branco puro nunca aparece como superfície.
- **Folha de Serviço** (`{colors.service-sheet}`): superfície de card e campo. **Mais escura que a mesa** (1,21:1), porque um cartão perfurado é papel buff apoiado sobre a prancheta, não papel branco. Papel branco sobre bege é site; cartão buff sobre manila é o objeto.
- **Poço de Papel** (`{colors.paper-well}`): recesso abaixo do cartão — poço de mídia, imagem ainda carregando. Um degrau abaixo da Folha de Serviço, nunca acima.
- **Grafite** (`{colors.graphite}`): texto primário. Preto azulado — tinta de caneta, e a única coisa fria da paleta de propósito. 13,46:1 sobre a mesa.
- **Lápis Gasto** (`{colors.worn-pencil}`): texto secundário, rótulos, metadados. Cinza **quente**, da família do papel — lápis é grafite sobre celulose, não ardósia. 6,28:1 sobre a mesa, 5,18:1 sobre o cartão e 4,80:1 sobre a ponta escura do gradiente do cartão envelhecido — que é o fundo mais escuro do turno, e o que define o valor.
- **Borda de Papel** (`{colors.paper-edge}`): filete de 1px — divisórias, contorno de card, tracejados. 2,28:1, calibrado para igualar o trabalho que a borda faz no turno noturno (2,38:1), já que o dia não tem emissão para compensar.
- **Borda de Instrumento** (`{colors.instrument-edge}`): filete de 2px — cabeçalho de case, célula de metadado, destaque, botão de case. 4,86:1. É o que torna a Regra da Espessura Falante visível em vez de teórica.

**Turno noturno**
- **Sala às 2h** (`{colors.room-at-2am}`): fundo. Preto com puxada de verde, nunca `#000`.
- **Sala às 2h, Elevada** (`{colors.room-at-2am-raised}`): superfície de card e bloco de código.
- **Sala às 2h, Poço** (`{colors.room-at-2am-well}`): recesso de mídia. À noite o recesso é mais escuro que o cartão; de dia é mais escuro que o cartão também. A direção do poço não inverte entre turnos.
- **Brilho de Tela** (`{colors.screen-glow}`): texto primário. 14,29:1 sobre o fundo.
- **Brilho de Tela, Fraco** (`{colors.screen-glow-dim}`): texto secundário. 8,40:1.
- **Verde de Conduíte** (`{colors.conduit-green}`): filete de 1px, bordas e divisórias. 2,38:1.
- **Conduíte Aceso** (`{colors.conduit-green-strong}`): filete de 2px, painel de instrumento. 4,53:1.

**Realce de sintaxe**

O Shiki roda com `theme: 'css-variables'`, então os blocos de código desenham com `var(--astro-code-*)` e a cor vem do turno, não de um tema de editor. O padrão do Astro é `github-dark`, que injeta a própria paleta em `style` inline — violeta, azul-claro e um slab `#24292e` — e aterrissa um retângulo escuro no meio do papel manila. O turno diurno usa o jogo de tintas da prancheta e nada mais: grafite para o texto e a pontuação, Carimbo de Aprovação para palavra-chave e constante, Linha de Desenhista para string e função, Lápis Gasto para comentário. O noturno troca a palavra-chave por Alarme e a pontuação por Fósforo Apagado. Pior par de cada turno: 5,18:1 no dia (comentário), 5,29:1 à noite (palavra-chave).

### Named Rules

**A Regra do Turno.** Todo par cor/uso é declarado duas vezes — uma em `.light`, outra em `.dark` — e nunca herdado entre os dois. Um tema não é o outro com filtro; é outra paleta inteira sob os mesmos nomes de token. Se você precisou de um `filter:` para fazer um tema virar o outro, o token está faltando.

**A Regra do Carimbo.** O acento marca ação e estado, nunca decora superfície. Se o acento está preenchendo uma área grande e parada, ele virou fundo e perdeu a função. As exceções são as duas superfícies que realmente são ação: o CTA primário e a statusline do terminal. Corolário: coisas que não são ação não usam a cor de ação — a perfuração do cartão é ausência, então ela usa a tinta de instrumento, e o oxblood fica livre para onde alguém decide alguma coisa.

**A Regra da Mistura Sólida.** `color-mix` não é seguro em superfície que carrega texto. O build embrulha a versão moderna num `@supports` e deixa um **fallback sólido** fora dele — `color-mix(in srgb, var(--color-accent) 12%, transparent)` deixa para trás `background: var(--color-accent)`, ou seja, o acento inteiro. Nos dois chips onde isso acontecia, o resultado no caminho de fallback era 1,9:1 no código inline e 1:1 no número de folha, que simplesmente sumia. Superfície com texto usa token real. `color-mix` fica para o que é decorativo — furo de cartão, filete de hover, textura de card.

**A Regra do Fundo Mais Escuro.** Um par de contraste vale contra o fundo **mais escuro** onde o texto pode pousar, não contra o fundo nominal do turno. Isso inclui a parada mais escura de qualquer gradiente. O Lápis Gasto passava com folga contra a mesa e falhava a 4,35:1 na ponta escura do gradiente do cartão envelhecido, que é papel de superfície e não decoração. Ao medir, componha o alpha e leia as paradas do gradiente; ao escolher um valor, escolha pelo pior caso.

**A Regra do Alarme.** Alarme só existe no turno noturno e só em ocorrências únicas. Duas peças em Alarme visíveis ao mesmo tempo na mesma dobra já é uma a mais.

## Typography

**Display Font:** Sora (com fallback Inter → system sans)
**Body Font:** Inter (com fallback system sans)
**Label/Mono Font:** JetBrains Mono (com fallback ui-monospace → Cascadia Code)
**Marker Font:** Permanent Marker (turno noturno, só em títulos)

Todas variáveis, self-hosted em `/fonts`, com `font-display: optional` nas três primeiras — o layout nunca reflui por fonte chegando tarde.

**Character:** Sora dá aos títulos uma geometria levemente condensada que aguenta `letter-spacing` negativo sem fechar; Inter faz o texto longo desaparecer, que é o trabalho dele; JetBrains Mono carrega tudo que é máquina — comando, rótulo, número, metadado. O contraste entre os três é o que faz um comando de terminal parecer um comando e uma frase parecer uma frase.

### A rampa

Onze degraus fixos, **todos em pixel inteiro a 16px de raiz**, mais os clamps de display. A progressão é de 2px na faixa de interface e de 4px acima de 20px: onde 1px ainda se distingue, os degraus são finos; onde não se distingue mais, eles abrem.

O degrau de baixo é 12px, e o piso é isso mesmo: **não existe degrau de 10px**. Existia — era o degrau "Meta", e ele carregava tech badge, carimbo de tipo e rótulo de célula, ou seja, texto funcional que alguém precisa ler. Estar na rampa não isenta: colocar 10px na tabela documenta o token, não conserta a legibilidade. As vinte declarações subiram para 12px e o papel Meta foi absorvido pelo Rótulo. Reintroduzir 11px para amortecer a subida quebraria a Regra do Degrau Inteiro, então não há amortecimento.

| px | rem | Camada | Onde vive |
|---|---|---|---|
| 12 | `0.75rem` | Rótulo / Meta | o cavalo de batalha — comandos, eyebrows, botões, tags, ano, tech badges, carimbo de tipo |
| 14 | `0.875rem` | Leitura curta | descrição de projeto, resumo de card, rodapé, texto de case |
| 16 | `1rem` | Corpo | texto corrido, links de contato, subtítulos |
| 18 | `1.125rem` | Lead | primeira frase de seção, resumo de post, pullquote |
| 20 | `1.25rem` | Título | projeto, card de blog |
| 24 | `1.5rem` | Título ≥768px | projeto no desktop |
| 28 | `1.75rem` | Headline | título de seção |
| 32 | `2rem` | Numeral / CTA | número do projeto, CTA de contato |
| 36 | `2.25rem` | Headline ≥768px | título de seção no desktop |
| 40 | `2.5rem` | Numeral ≥768px | número do projeto no desktop |
| 44 | `2.75rem` | CTA ≥768px | "Fala comigo" no desktop |

Fora da rampa fixa existem só duas coisas, ambas deliberadas: os **clamps de display** (hero `clamp(3rem, 8vw, 5.5rem)`, 404 `clamp(4rem, 10vw, 8rem)`, mais blog, post e case), que precisam responder à largura; e dois valores em **`em`** — `0.85em` no código inline e `0.8em` na URL impressa —, relativos de propósito, porque devem escalar com o texto em que estão embutidos.


### Hierarchy

- **Display** (`{typography.display}`): só o h1 do hero. No turno noturno troca para **Marker** e ganha rotação de -1,5° e glow duplo de fósforo.
- **Headline** (`{typography.headline}`): títulos de seção — 28px, subindo para 36px a partir de 768px —, acompanhados de uma linha de 1px que ocupa o resto da largura. No escuro, Marker rotacionado -2,5° e a linha vira gradiente de 3px.
- **Title** (`{typography.title}`): títulos de projeto, de card de blog e de case study. 20px, subindo para 24px a partir de 768px.
- **Lead** (`{typography.lead}`): a frase que abre uma seção, o resumo do post, o pullquote.
- **Body** (`{typography.body}`): texto corrido, sempre limitado pela Regra da Medida.
- **Body Terminal** (`{typography.body-terminal}`): no turno noturno o `body` inteiro do site vira mono. É a casca — nav, hero, listas, cards.
- **Label** (`{typography.label}`): rótulos, comandos, badges, botões, tags. Sempre mono, caixa alta quando leva `letter-spacing` (ver Regra do Tracking de Caixa Alta), com tracking entre 0,06em e 0,2em conforme o tamanho encolhe.
- **Meta** (`{typography.meta}`): o dado sobre o dado — tech badge, carimbo de tipo, numeração de card. Mono, e **no mesmo degrau do Label**: Meta é um papel semântico, não um tamanho menor.

### Named Rules

**A Regra dos Oito Minutos.** Texto corrido longo sai do mono mesmo no turno noturno. `.dark .case-body` volta explicitamente para Inter, e a mesma regra vale para posts. O terminal é a casca do site, não o corpo de um artigo de oito minutos de leitura. Títulos, código e etiquetas continuam mono, então a identidade não se perde.

**A Regra do Marcador.** Permanent Marker aparece só no turno noturno e só em títulos — h1 do hero, título de seção, título de case. Nunca em texto que precise ser lido em quantidade, nunca em rótulo, nunca no turno diurno.

**A Regra do Rótulo Mono.** Se o texto é um dado sobre outro texto — data, contagem, tag, tempo de leitura, número do projeto — ele é mono. Essa é a fronteira entre os dois universos tipográficos, e ela é rígida.

**A Regra da Medida.** Todo bloco de texto corrido tem `max-width: 60ch`, e o valor é 60 em todo lugar — descrição de projeto, entrada de trajetória, corpo de case, corpo de post, nota de fontes, bio. O número parece baixo porque `ch` não mede um caractere: mede o glifo "0", que no Inter tem 0,63em, enquanto o caractere médio da prosa tem 0,50em. Um `Nch` entrega cerca de 1,26 N caracteres. Foi assim que `70ch` — que parecia estar dentro da faixa — rendia 88 caracteres por linha. 60ch cai em ~76. Corolário: o container não é a medida. Cap no elemento de texto, não no container, senão o bloco de código herda a mesma largura da prosa e perde a razão de ser largo.

**A Regra do Tracking de Caixa Alta.** `letter-spacing` positivo só em texto em caixa alta. Em caixa alta ele compensa a falta de ascendente e descendente, que é o que faz a palavra ter silhueta; em texto de frase ele destrói a silhueta que já existe e o olho passa a soletrar. O sintoma é sempre o mesmo: uma classe chamada `-label` que na verdade carrega uma frase inteira. Se o conteúdo é uma frase, o nome está errado ou o tracking está.

**A Regra do Degrau Inteiro.** Todo tamanho fixo sai da rampa de onze degraus e cai em pixel inteiro a 16px de raiz. Um valor novo entra na rampa ou não entra no sistema; não existe "quase o degrau de cima". O sintoma de que a regra foi quebrada é sempre o mesmo: dois valores a menos de 1px um do outro, que não conseguem carregar papéis diferentes e por isso só existem porque ninguém mediu.

## Layout

O sistema tem três larguras, escolhidas por tipo de página em vez de uma medida global:

- **Sistema (1200px):** nav, hero, feed do blog, seções da home. É a largura das superfícies que catalogam.
- **Leitura de case (860px):** `.case-container`.
- **Leitura de post (720px):** `.post-container`. Quanto mais longo o texto, mais estreita a coluna.

O padding horizontal escalona em três degraus, idêntico em nav, hero e blog: `1rem` no celular, `2rem` a partir de 768px, `4rem` a partir de 1024px. Os breakpoints do sistema são 480, 640, 768 e 1024px.

O hero é coluna única no celular e vira grid de `1.2fr 0.8fr` a partir de 768px, com `align-items: start`. A coluna direita carrega a **ficha técnica** — painel de instrumento cujas linhas usam `space-between`, o que faz o conteúdo ocupar a largura da coluna em vez de flutuar dentro dela. No celular o painel desce para baixo do CTA em largura cheia, alinhado à mesma margem esquerda de todo o resto; as linhas continuam linhas, então não há baseline para desalinhar. O feed do blog vai de 1 para 2 colunas em 640px e para 3 em 1024px. Grades de metadado de case seguem o mesmo padrão: 2 colunas no celular, 4 a partir de 640px.

A altura do hero é `90svh`, não `100vh` — a barra do navegador móvel não corta a primeira dobra.

### Named Rules

**A Regra da Coluna Decrescente.** Quanto mais longo o texto, mais estreita a coluna. 1200px para catalogar, 860px para o case, 720px para o post. Uma página nova herda a largura do tipo de leitura que ela é, não a do container mais próximo.

**A Regra dos 44px.** Todo alvo de toque tem no mínimo 44px de altura ou lado — CTA do hero, hambúrguer, botão de fechar da gaveta, links da gaveta, CV mobile. Não é sugestão.

**A Regra da Coluna que se Preenche.** Uma coluna de grid é uma promessa do tamanho dela. Se o conteúdo mede 136px dentro de 403px, ou o conteúdo cresce até a largura ou a coluna deixa de existir — flutuar no meio não é opção. O padrão de linha com `space-between` (rótulo à esquerda, valor à direita, filete tracejado entre) é o mecanismo padrão do sistema para isso.

**A Regra do Vão na Escala.** Todo espaçamento vertical sai de `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Um vão que não está na escala quase sempre é acidente e não decisão: meia-entrelinha de `inline-block`, `0.35rem` escrito à mão. Meça o valor renderizado, não o declarado.

## Elevation & Depth

**Sem elevação, só emissão.** Nada flutua neste sistema, em nenhum dos dois turnos.

No turno diurno os objetos estão apoiados na mesa. A profundidade vem de traço e de camada tonal, e a direção importa: a Folha de Serviço fica **um degrau abaixo** da Luz de Meio-Dia, porque o cartão é buff e a mesa é o campo claro. Tudo que recua — cartão, poço de mídia, bloco de código — escurece. Nada no turno diurno fica mais claro que a mesa. A Borda de Papel separa, e o `.vintage-card` acrescenta um gradiente diagonal de papel gasto com uma trama de fibra em `multiply`. Existem dois tokens de sombra (`--shadow-sm`, `--shadow-md`), muito curtos e muito discretos, e eles são exceção — não o mecanismo padrão de hierarquia.

No turno noturno as sombras são literalmente `none`. A profundidade vem de luz emitida: `text-shadow` de fósforo nos títulos, `box-shadow` de glow verde nos cards em hover, `inset` de brilho nos tech badges, e o overlay fixo de linhas de varredura CRT com ruído em `mix-blend-mode: overlay` a 6% de opacidade cobrindo a página inteira.

### Shadow Vocabulary

- **Apoio de papel** (`box-shadow: 0 1px 3px rgba(34, 36, 43, 0.08)`): turno diurno, uso raro. Uma folha em cima de outra.
- **Papel levantado** (`box-shadow: 0 4px 12px rgba(34, 36, 43, 0.10)`): turno diurno, o degrau mais alto que o sistema tem.
- **Glow de fósforo** (`box-shadow: 0 0 18px rgba(97, 255, 202, 0.15)`): turno noturno. Não é sombra, é emissão — o objeto está aceso, não elevado.
- **Glow de texto** (`text-shadow: 0 0 2px rgba(97,255,202,0.7), 0 0 8px rgba(97,255,202,0.35)`): o `.crt-glow`, aplicado em comandos e títulos do escuro.

### Named Rules

**A Regra Sem Elevação, Só Emissão.** Sombra difusa de elevação é vocabulário estrangeiro. No dia, se você precisa separar duas coisas, use borda ou camada tonal. Na noite, se precisa destacar, acenda — não levante.

**A Regra do Recuo Único.** Toda superfície que recua escurece, nos dois turnos. O poço nunca é mais claro que o cartão, e o cartão nunca é mais claro que a mesa. Uma superfície que clareia ao recuar lê como buraco, não como camada.

**A Regra da Borda Compensatória.** O turno diurno não tem emissão, então a borda dele precisa trabalhar pelo menos tanto quanto a do noturno. Filete de 1px em 2,28:1 no claro contra 2,38:1 no escuro; se um valor novo de borda clara ficar abaixo de 2:1, ele não separa nada e o design volta a parecer inacabado.

## Shapes

Cantos quase retos. O raio máximo do sistema é 8px e ele é uma exceção (o toggle de tema); o padrão real é 0 a 4px.

- **Reto (0)** — painéis de instrumento: cabeçalho de case, células de metadado, cards de destaque, CTAs do hero, botões de case.
- **Fio (2px)** — carimbos, furos de punch card, código inline, número do case. O raio mínimo que ainda tira o canto matemático sem virar arredondamento.
- **Folha (4px)** — cards de blog, campo de busca, fachada de vídeo, navegação entre posts, assinatura do autor.
- **Controle (6px)** — botão de CV, na nav e na gaveta.
- **Toggle (8px)** — o toggle de tema, e só ele.
- **Pílula (20px)** — tech badges, e só eles.
- **Disco (50%)** — avatar do autor e botão de play.

Bordas carregam a hierarquia. **2px** marca instrumento (cabeçalho de case, célula de metadado, destaque, botão de case, carimbo). **1px** marca papel e superfície de leitura (card de blog, campo, navegação de post). **1px tracejado** marca costura interna — cabeçalho e rodapé do card de blog, linha de estatística, separador de fontes.

O carimbo de tinta é rotacionado -6° e o carimbo de tipo de projeto -4° no turno diurno; no noturno os dois voltam a 0° e ganham glow. Papel aceita ser carimbado torto; fósforo não.

### Named Rules

**A Regra do Canto Quase Reto.** Se um elemento novo pede mais de 8px de raio, ele não pertence a este sistema. Pílula e disco existem para exatamente duas formas cada, e a lista não cresce.

**A Regra da Espessura Falante.** A espessura da borda diz o que a coisa é: 2px é equipamento, 1px é papel, 1px tracejado é costura interna. Escolher a espessura errada é classificar o objeto errado.

## Components

### Buttons

- **Caráter:** instrumento, não enfeite. Mono em caixa alta, `letter-spacing` de 0,08em, borda de 2px, canto reto.
- **Shape:** reto (0) nos CTAs do hero e de case; Controle (6px) no botão de CV; Folha (4px) nos botões de feed do blog.
- **CTA primário:** preenchido com o acento do turno, texto na cor do fundo do turno (`{components.button-cta-primary}`), altura mínima 44px. No escuro ganha `box-shadow: 0 0 12px rgba(97, 255, 202, 0.25)`.
- **CTA secundário:** transparente com a mesma borda de acento; no hover preenche com 12% do acento via `color-mix`.
- **Botão de contorno** (feed do blog, "ver no YouTube", navegação de case, e o `<summary>` que abre o case study no card de projeto): borda neutra em repouso, borda e texto viram acento no hover. Nenhum preenchimento.
- **Divulgação (`<summary>`) versus navegação:** quando os dois convivem no mesmo bloco, o que expande no lugar tem peso de botão e o que leva embora tem peso de link sublinhado, dentro do conteúdo revelado. Nunca no mesmo peso e nunca lado a lado — dois controles com a mesma aparência prometendo destinos diferentes é o defeito que essa regra existe para impedir.
- **Hover / Focus:** transições de 150–200ms em `cubic-bezier(0.25, 0.1, 0.25, 1)`, sempre sobre cor e borda — nunca sobre geometria. Foco de teclado é `outline: 2px solid var(--color-accent)` com `outline-offset: 2px`, via `:focus-visible`.

### Chips

- **Tech badge:** pílula de 20px, borda de 1px na cor de borda do turno, mono 0,75rem, texto secundário. No turno noturno ganha texto em Cursor Vivo, `text-shadow` de fósforo e um `inset` de brilho de 6px — parece um LED de painel, não uma tag de blog.
- **Carimbo de tinta** (`.ink-stamp`, `.project-type-stamp`): borda de 2px na cor do acento, mono 700 em caixa alta com `letter-spacing` de 0,15em, rotacionado no turno diurno e reto com glow no noturno. É como o sistema diz `PROJETO` ou `CONTRIB`.

### Cards / Containers

- **Card de blog** (`{components.card-sheet}`): a peça mais completa do sistema. Cabeçalho com furos de punch card e numeração separado por tracejado, thumb 16:9, corpo, rodapé tracejado. Hover levanta 3px em `translateY` e troca a borda para acento; no escuro acrescenta glow. `.blog-card-link::after` cobre o card inteiro, então o alvo é o card e o foco continua no link.
- **Painel de instrumento** (`{components.panel-instrument}`): cabeçalho de case, células de metadado, cards de destaque. Borda de 2px, canto reto, sem fundo próprio.
- **Card de projeto:** não é caixa. É uma linha de catálogo — número mono grande à esquerda, conteúdo à direita, separada por borda inferior de 1px. No hover o conteúdo desliza 4px e o número acende no acento.
- **`.vintage-card`:** gradiente diagonal de papel gasto com trama de fibra em `multiply` a 40% no turno diurno; no noturno o gradiente vira painel de fósforo e a trama some.

### Inputs / Fields

- **Busca do blog** (`{components.input-search}`): fundo de superfície, borda de 1px, canto Folha, texto mono. Rótulo acima em mono 0,625rem caixa alta com `letter-spacing` de 0,12em.
- **Focus:** a borda vira acento e o `:focus-visible` acrescenta outline de 2px com offset. No turno noturno o foco também acende: `box-shadow: 0 0 12px rgba(97, 255, 202, 0.2)`.
- **Botão de limpar:** dentro do campo, à direita, vira acento no hover, com foco próprio.

### Navigation

- **Barra fixa**, transparente no topo e com fundo a 95% + borda inferior depois do scroll.
- **Logo** em mono 700 com um ponto no acento que pulsa 400ms no hover.
- **Links** em 0,7rem caixa alta com sublinhado que cresce de 0 a 100% em 150ms; o item ativo já nasce com 100%. No turno noturno os links ganham `text-shadow` de fósforo e os pares alternam para Alarme no hover.
- **Mobile:** hambúrguer de 44px que vira X, gaveta de 280px (máx. 80vw) entrando da direita em 300ms com `cubic-bezier(0.16, 1, 0.3, 1)`, overlay escuro atrás, botão de fechar como primeiro item do ciclo de foco.

### Signature Components

- **Furo de cartão perfurado** (`.punch-hole`): quadrado de 2px de raio preenchido com 60% da Borda de Instrumento no dia (2,35:1 — lê como buraco) e 50% do fósforo com glow na noite. O tamanho vem sempre do container, nunca da classe. Aparece no hero, nos cabeçalhos de case e nos cards de blog — é o fio que costura o sistema inteiro.
- **Linha de terminal / etiqueta de prancheta** (`.term-line`, `.term-out`, `.paper-tag`): o mecanismo central da dupla personalidade. O texto vive em `data-txt` e é pintado por `::before`; cada elemento só aparece no seu turno. Sem duplicação de markup, e no modo de leitura do navegador o span fica vazio e some.
- **Grade milimetrada** (`.blueprint-wrap`): duas grades repetidas de 24px a 6% de opacidade em Traço de Desenhista no dia, 5% em fósforo na noite. Fica atrás do conteúdo e nunca compete com ele.
- **Statusline do terminal** (`.term-statusline`): barra fixa no rodapé, fundo em Cursor Vivo com texto no preto da sala, cursor piscando, entra por `translateY` em 140ms. Existe apenas no turno noturno.
- **Cortina de troca de tema** (`.theme-transition-overlay`): 1s cobrindo a tela inteira, passando por preto → verde-escuro → lampejo de fósforo na ida e o caminho inverso na volta. É o que faz a troca ser lida como passagem de tempo.
- **Glitch RGB** (`.punk-glitch`): 5s de ciclo em que 95% do tempo é só glow, e as franjas em Alarme e Cursor Vivo aparecem por instantes entre 83% e 92%. A raridade é o efeito.
- **Adesivos e ono** (`.punk-sticker`, `.punk-menacing`, `.punk-ono`): exclusivos do turno noturno. Adesivos só a partir de 1024px; `gogo` some abaixo de 480px; os `ono` reduzem a dois. No celular a identidade noturna vive no tipo, na cor e no glow.

## Do's and Don'ts

### Do:

- **Do** declarar cor nova nos dois turnos, em `.light` e `.dark`, sob o mesmo nome de token. Um turno nunca é o outro com filtro.
- **Do** usar borda para separar e camada tonal para agrupar no turno diurno; usar emissão para destacar no noturno.
- **Do** manter texto corrido longo em Inter mesmo no escuro, seguindo a Regra dos Oito Minutos.
- **Do** colocar texto decorativo em `data-txt` com `::before`, para que o modo de leitura e o leitor de tela recebam markup limpo.
- **Do** derivar a cor do texto de um botão preenchido do token de fundo do turno (`var(--color-bg-primary)`), nunca de um `#ffffff` literal — o acento do turno noturno é claro, e branco sobre ele não passa em AA.
- **Do** escalonar o padding horizontal em 1rem → 2rem (768px) → 4rem (1024px) em qualquer container novo de sistema.
- **Do** dar 44px de alvo a tudo que se toca.
- **Do** desligar animação decorativa em `prefers-reduced-motion: reduce` e manter o conteúdo visível — elementos com stagger voltam a `opacity: 1`, nunca ficam invisíveis.

### Don't:

- **Don't** trazer de volta neon roxo, rosa ou ciano. Essa paleta foi aposentada quando o fósforo verde entrou, e a decisão está fechada.
- **Don't** reintroduzir cromo de MSN ou moldura de janelinha de chat nos cards. Foi removido de propósito.
- **Don't** usar ticker ou marquee de texto rolando em nenhuma superfície. Foi recusado explicitamente.
- **Don't** cometer os tells de UI gerada: gradiente em texto de título, borda colorida grossa num lado só do card, easing de bounce ou elástico em transição de estado.
- **Don't** animar `width`, `height`, `padding` ou `margin`. Use `transform` e `opacity`, ou `grid-template-rows` quando precisar animar altura.
- **Don't** passar de 8px de raio. Pílula existe para o tech badge e disco para avatar e play; a lista não cresce.
- **Don't** usar branco puro como superfície no turno diurno nem `#000` como fundo de página no noturno. O papel é manila e a sala é preto-esverdeado.
  **Exceção, e ela é fechada:** preto e branco puros valem onde não são superfície do sistema e sim ausência de imagem ou véu sobre a página — a tarja da fachada de vídeo, o scrim da gaveta mobile, os quadros da cortina de troca de tema e o bloco de impressão. Nesses quatro, `#000` e `#fff` são o valor correto e não drift de paleta: uma tarja de vídeo cinza-esverdeada seria erro, não identidade. Fora deles, a proibição continua valendo integralmente.
- **Don't** deixar adesivo ou decoração de personagem aparecer abaixo de 1024px. Eles sobrepõem texto e link no celular.
- **Don't** aplicar Permanent Marker fora de título, e nunca no turno diurno.
- **Don't** empilhar duas peças em Alarme na mesma dobra.
- **Don't** usar `color-mix` como fundo de qualquer coisa que tenha texto em cima — o fallback do build é a cor sólida. Ver Regra da Mistura Sólida.
- **Don't** deixar tema de editor decidir a cor de bloco de código. O realce sai de `--astro-code-*`, que sai do turno.
- **Don't** pôr `letter-spacing` positivo em texto de frase, mesmo que a classe se chame `-label`.
- **Don't** deixar texto corrido sem `max-width`, e não confunda `ch` com caractere: `60ch` já é ~76 caracteres.
