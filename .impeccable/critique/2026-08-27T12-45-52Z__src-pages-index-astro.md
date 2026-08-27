---
target: home page (src/pages/index.astro)
total_score: 17
max_score: 32
na_heuristics: 9,10
p0_count: 1
p1_count: 3
timestamp: 2026-08-27T12-45-52Z
slug: src-pages-index-astro
---
Method: dual-agent (A: revisão de design sem âncora · B: detector + evidência de browser)

Alvo: `src/pages/index.astro` — a home, nos dois temas. Modo: **Experience** (portfólio; o visitante está dentro do próprio trabalho).

## Design Health Score

| # | Heurística | Score | Achado principal |
|---|-----------|-------|------------------|
| 1 | Visibilidade do estado do sistema | 3 | ScrollSpy e estado ativo da nav funcionam. Desconto: "CASE STUDY ›" e "Ler case study →" não sinalizam qual sai da página. |
| 2 | Correspondência com o mundo real | 2 | `MEMORIAL DESCRITIVO`, `FL. 04/06`, `COL: 80 · ROW: 12` rotulam seções com termos que não descrevem o conteúdo delas — em três idiomas. |
| 3 | Controle e liberdade | 3 | Nada prende. Desconto: a cortina de tema bloqueia 1s inteiro uma ação intencional, sem pular. |
| 4 | Consistência e padrões | 2 | Dois controles com o mesmo nome fazendo coisas diferentes; `.contact-link--cv` com cor diferente de três irmãos idênticos; `#ffffff` literal sobre o acento em dois lugares. |
| 5 | Prevenção de erro | 2 | O link de e-mail sai como `href="#"` e é reescrito por script inline. Sem JS, a principal via de contato não faz nada — sem erro, sem fallback. |
| 6 | Reconhecer em vez de lembrar | 2 | A numeração de prancheta, `PROJETO` vs `CONTRIB` e `MATERIAIS:` exigem uma convenção que nunca é ensinada. |
| 7 | Flexibilidade e eficiência | 2 | 8 projetos em lista plana: sem filtro, sem ordenação, sem índice. A distinção projeto/contribuição é uma caixa de 9px cinza. |
| 8 | Estética e design minimalista | 1 | O tema claro gasta tinta em texto sem informação (`COL: 80 · ROW: 12` ×8, `IBM 5081` ×8 = 16 linhas) enquanto a evidência real fica colapsada atrás de um link de 12px. |
| 9 | Reconhecimento e recuperação de erro | n/a | A home não tem estado de erro, formulário nem superfície de falha. O mailto silencioso foi contado em #5. |
| 10 | Ajuda e documentação | n/a | Superfície Experience; um portfólio não precisa de sistema de ajuda. |
| **Total** | | **17/32** | **Acceptable (53%) — melhorias significativas antes de o visitante ficar satisfeito** |

Heurísticas marcadas `n/a`: 9 e 10. Máximo aplicável renormalizado para 32.

## Design Specificity Verdict

**Avaliação de design (sem âncora).** Os dois temas pontuam em extremos opostos, e a assimetria é o relatório inteiro.

O **tema escuro é hiperespecífico**. Adesivos, Permanent Marker a -1,5°, overlay CRT de fósforo, `jbnado@rp:~$ whoami`. Nenhum outro produto no mundo poderia publicar isso sem mudar nada.

O **tema claro é genérico**. Tire as palavras e sobra: campo bege quente, título sans escuro, corpo cinza, um acento vermelho-escuro, filetes de 1px, rótulos mono em caixa alta. É a estética padrão de site pessoal dos últimos quatro anos. O único dispositivo genuinamente autoral do claro — a numeração de prancheta (`PROJ. Nº 001/2026 · REV. 03`) — é renderizado a 10–11px no cinza de menor contraste da paleta, então lê como metadado de boilerplate, não como sistema autoral.

**A assimetria é mensurável.** Contando eventos visuais distintos acima da dobra, no mesmo HTML: escuro = 14, claro = 5. Nove posições em torno das quais o layout foi composto não pintam nada durante o dia — quatro posições de adesivo, a statusline `● active (running)`, a linha `$ whoami`, a linha `$ cat ~/.stack`, o tratamento Marker + duplo glow do h1, o glow do CTA. O terço direito vazio do hero claro a 1440px é, literalmente, um buraco com o formato do adesivo que só aparece à noite.

**Veredito: o tema claro não é um design. É o tema escuro com o design removido e nada colocado no lugar.** É por isso que pessoas reais chamaram de feio, e elas estavam lendo corretamente.

**Varredura determinística.** O detector de CLI rodou duas vezes.

- **Markup** (`src/pages`, `src/layouts`, `src/components`, `src/islands`): exit 2, **41 achados** — 2 warnings, 39 advisories. Por regra: `design-system-font-size` 37, `design-system-color` 2, `side-tab` 1, `layout-transition` 1.
- **Folhas de estilo** (`global.css`, `islands.css`): exit 2, **53 achados** — 3 warnings, 50 advisories. Por regra: `design-system-font-size` 37, `design-system-color` 9, `design-system-radius` 4, `overused-font` 1, `bounce-easing` 1, `side-tab` 1.

Os warnings que **não** são falso positivo:

| Regra | Arquivo | Linha | O que é |
|---|---|---|---|
| `side-tab` | `src/components/AboutSection.astro` | 91 | `border-left: 3px solid var(--color-accent)` — borda colorida grossa num lado só de um card. É exatamente o tell que o `DESIGN.md` proíbe, e não está coberto pela exceção da barra de topo. |
| `layout-transition` | `src/components/NavBar.astro` | 178 | `transition: width` — anima layout. O `DESIGN.md` proíbe por nome. |

O detector também marcou como advisory duas linhas que são, na verdade, o defeito mais sério da página: `NavBar.astro:204` e `SkipToContent.astro:21`, ambas `color: #ffffff` sobre `var(--color-accent)`. A severidade advisory subestima o caso — ver P1 abaixo.

**Overlay no browser.** A injeção mutável foi comprovada (título alterado e `<script>` executado), o servidor de overlay subiu na porta 8400, o script rodou na página e o console reportou `[impeccable] 388 anti-patterns found`. **O overlay não está mais visível**: a aba foi fechada e o servidor derrubado no fim da varredura, então não há nada na tela agora.

O que o overlay mediu, por tema:

- **Escuro — 388 elementos, 563 achados.** `ai-color-palette` 296 (texto ciano-neon sobre fundo escuro ×290), `dark-glow` 147 (text-shadow sem offset em `#61ffca` ×72, box-shadow ×68), `undersized-ui-text` 67, `line-length` 36, `low-contrast` 6, `heading-rhythm` 3.
- **Claro — 126 elementos, 132 achados.** `undersized-ui-text` 67, `line-length` 36, `dark-glow` 13, `low-contrast` 4, `heading-rhythm` 3.

Os 296 hits de `ai-color-palette` e 147 de glow não são erro do detector: o fósforo verde é a identidade documentada. São a **medida de quão amplamente ela é aplicada** — 443 aplicações de um mesmo tratamento — e isso é dado de julgamento de design, não bug.

**Falsos positivos confirmados** (não agir): `overused-font` no Inter e `bounce-easing` no `sticker-wobble` (identidade documentada), `side-tab` em `.light body::before` (a barra de 3px do topo, documentada — diferente da de `AboutSection`), `cream-palette` no manila `#f2efe4`, `low-contrast` 1.0:1 nos `.footer-link` (o overlay lê o gradiente de sublinhado animado como fundo; os ratios reais são 5,22:1 e 8,40:1), `tight-leading` num `<script>` de hidratação, `radial-halo` reportado no claro medindo um gradiente que só existe no escuro, e `heading-rhythm`/`kicker-above-heading` (o bloco acima do h2 é o próprio eyebrow, que é intencional). Os 74 advisories de `design-system-font-size` são **uma decisão, não 74**: o `DESIGN.md` documenta ~7 degraus de tipo, então todo tamanho intermediário é marcado. Isso diz que a rampa está subespecificada.

**Limitação declarada da varredura:** o browser do host tinha `prefers-reduced-motion: reduce` ligado nativamente. Isso deu uma verificação de movimento reduzido mais forte do que emulação (varredura exaustiva de 841 elementos × `::before`/`::after`: **zero animações ou transições acima de 0,01ms**, e nenhum `!important` de autor fora de bloco reduce que pudesse furar o reset). Em compensação, **a página nunca foi observada em movimento pleno** — o glitch, a cortina e o stagger não foram vistos rodando.

## Overall Impression

O conteúdo aqui é bom o bastante para justificar o site inteiro, e está escondido. "27 mil linhas de Go, 12 mil delas de teste, em 651 funções de teste" é exatamente a frase que faz um tech lead parar de rolar — e ela vive colapsada dentro de um `<details>`, a 3.000px de scroll, atrás de um link de 12px. Enquanto isso, `COL: 80 · ROW: 12` tem linha visível permanente, oito vezes.

A maior oportunidade não é redesenhar nada. É **inverter o que está visível por padrão**. O tema claro tem um buraco no terço direito do hero e uma seção "Sobre" de 892px sem um único evento visual; o catálogo tem oito registros com números checáveis. Colocar um no outro resolve o problema de composição e o problema de posicionamento na mesma mexida.

## What's Working

1. **O mecanismo de dupla personalidade é engenharia genuinamente excelente.** `data-txt` + `::before` (`global.css:580–592`) faz o turno errado não pintar nada, entrega markup limpo pro modo leitura, não duplica uma linha de HTML e não gera ruído pra leitor de tela. É solução melhor que a de muitos design systems em produção. O problema é para que ela é usada, não como foi construída.

2. **O conteúdo dos case studies é o diferencial real, e ele está certo.** Problema → Decisão Técnica → Resultado, com números checáveis, em três idiomas, para 8 projetos. A afirmação de posicionamento do `PRODUCT.md` é verdadeira e o conteúdo entrega. Todas as questões prioritárias abaixo são sobre expor isso, não sobre criar.

3. **A timeline é a única composição clara que funciona.** Largura cheia, ponto oxblood por entrada, ano em mono contra um filete vertical, descrições com números reais. Ela prova que a paleta clara *consegue* segurar estrutura — só não faz isso em nenhum outro lugar.

4. **Movimento reduzido é respeitado de forma exemplar.** 841 elementos varridos, zero animação acima de 0,01ms, `scroll-behavior` resetado, e as três ilhas com movimento (`StatsCounter`, `TermStatusline`, `ThemeToggle`) checam a media query em JS. Isso quase nunca está completo em projeto real.

## Priority Issues

### [P0] O tema claro não tem meios-tons, então nada tem borda

Medido contra o fundo manila `#f2efe4`:

| Par | Contraste |
|---|---|
| Superfície de card `#f8f6ef` vs fundo | **1,065 : 1** |
| Borda `#cbc7ba` vs fundo | **1,469 : 1** |
| Acento oxblood `#8f2d24` vs tinta `#22242b` | **1,895 : 1** |

O tema claro tem exatamente três valores de texto: 13,46 / 7,10 / 5,22. **Onze de vinte e três elementos medidos caem no mesmo 5,22:1** — corpo, eyebrows de 10px, carimbos de 9px, tech badges, rodapé, descrição de projeto, tudo no mesmo peso. Em L\*: fundo 94, cinza 42, oxblood 34, tinta 15 — **um vão de 52 pontos com nada dentro**.

**Por que importa.** O mecanismo de profundidade que o `DESIGN.md` declara para o turno diurno ("a Folha de Serviço fica meio tom acima da Luz de Meio-Dia, a Borda de Papel separa") está **não-funcional**: as duas ferramentas dele estão abaixo do limiar de visibilidade. O `.vintage-card` pinta um painel visível no escuro (`#101613` sobre `#0a0f0c`) e um invisível no claro. E como o acento está a 1,9:1 da tinta do corpo, ele nunca lê como acento — lê como mais uma coisa escura. Para o recrutador, oito cards de projeto viram uma parede única de 3.226px de texto cinza sobre bege. Ele não consegue fatiar, então não escaneia, então não acha a evidência.

Vale a distinção: **isso não é falha de WCAG.** O contraste de texto passa em AA em todos os 23 elementos medidos no claro. O que falha é o contraste *estrutural* — e é justamente o que faz a página parecer "não terminada".

**Fix.** Introduzir dois meios-tons reais na rampa clara. Superfície de card para ~L\* 88–90 (alvo ≥1,15:1 contra a página, algo como `#eae5d6`) para que `.vintage-card` e `.pc-head` de fato apareçam; borda para ~2,5:1 (algo como `#b0aa98`) para que `.section-title-line` e o divisor de card façam o trabalho que o `DESIGN.md` atribui a eles. Depois, ou clarear o acento na direção de L\* 45, ou — melhor — reservá-lo: preencher mais formas com ele em vez de tingir mais texto.

**Comando sugerido:** `/impeccable colorize src/styles/global.css`

### [P1] As regras que o próprio sistema declara não são cumpridas

Três violações da mesma natureza, todas contra regras que o `DESIGN.md` e o `PRODUCT.md` marcam como vinculantes:

**Contraste AA.** `.navbar-cv` (`NavBar.astro:197-206`) fixa `color: #ffffff` sobre `background: var(--color-accent)`, sem override para o escuro. No turno noturno o acento é `#42f59b` e o resultado é **1,42:1** — precisa de 4,5:1. O estado `:hover` é pior, ~1,25:1. **O mesmo bug, com a mesma forma, está em `SkipToContent.astro:20-21`** — que é o link de pular para o conteúdo, ou seja, a falha cai exatamente no caminho de quem navega por teclado. Essas duas são a **única falha de contraste da página inteira**; os outros 45 pares medidos passam.

**Alvo de 44px.** O `DESIGN.md` diz "Não é sugestão". Medido a 390×844: `a.navbar-logo` 36×30, `a.navbar-cv` 52,8×**30**, `summary.lang-trigger` 42,3×**32**, `a.lang-option` ×2 38,4×**30**, `button.theme-toggle` 38×38 — e os quatro `a.footer-link` a **16px de altura**, separados por `·`, ou seja, pequenos *e* colados. A gaveta mobile e o hero passam limpo; a barra fixa do topo e o rodapé não.

**Tamanho de texto.** 107 execuções de texto renderizam abaixo de 11px no claro (100 no escuro), com piso em **9px** nos carimbos `PROJETO`/`CONTRIB` (`ProjectCard.astro:222`) e 10px em 59 tech badges. Todos passam em contraste; o problema é tamanho.

**Por que importa.** O `PRODUCT.md` acabou de registrar AA como piso vinculante e o `DESIGN.md` declara os 44px como não-negociáveis. Um sistema que enuncia a regra e não a cumpre é pior do que um que não a enuncia: ele documenta a intenção e entrega o contrário, e a próxima pessoa a mexer no código vai confiar no documento.

**Fix.** `color: var(--color-bg-primary)` nas duas ocorrências; área de toque de 44px nos seis controles (padding ou pseudo-elemento, mantendo o tamanho visual); piso de 11px para texto de interface, subindo os carimbos de 9px e as badges de 10px.

**Comando sugerido:** `/impeccable audit src/components/NavBar.astro src/components/SkipToContent.astro src/components/Footer.astro src/components/LanguageSwitcher.astro`

### [P1] Dois controles com o mesmo nome, a 33px um do outro, fazendo coisas diferentes

`ProjectCard.astro:80` renderiza `<summary class="case-study-trigger">CASE STUDY ›</summary>` (expande no lugar). `ProjectCard.astro:94` renderiza `<a class="project-readmore">Ler case study →</a>` (navega para outra página). Colapsados, ficam empilhados a 33px de distância, no mesmo mono oxblood de 12px, diferindo apenas pelo glifo da seta.

**Por que importa.** O recrutador com quatro minutos vai clicar em um dos dois, no escuro, e ou cai numa página que não queria ou expande um acordeão que achava que era link. De qualquer forma gastou um dos quatro minutos aprendendo a navegação em vez do trabalho. **É o conteúdo mais valioso do site atrás da affordance mais confusa do site.**

**Fix.** Escolher um. Dado o propósito de "registro de obra", o `<summary>` é o primário certo — expande no lugar e mantém a pessoa no catálogo. Estilizar como controle de peso de botão (o vocabulário de botão de contorno que o `DESIGN.md` já define) e rebaixar o link de página para um `Ver case study completo →` dentro do corpo expandido, onde ele já aparece hoje.

**Comando sugerido:** `/impeccable clarify src/components/ProjectCard.astro`

### [P1] O terço direito do hero claro tem três números fracos onde o escuro tem um personagem

`HeroSection.astro:78–86` coloca o `stats.json` na coluna de 0.8fr: 5+ anos, 4 empresas, **46 repos no GitHub**. A 1440px isso ocupa 140px de uma coluna de 430px, e tudo à direita fica vazio pela dobra inteira.

**Por que importa.** "46 repos" é o maior objeto colorido com acento da dobra clara, e é a afirmação mais fraca do site — para um engenheiro sênior lê como enchimento, o que ativamente mina o posicionamento de "registro de obra". O `PRODUCT.md` documenta que os números reais existem: 27.000 linhas de Go, 12.000 de teste, 651 funções de teste, 8 case studies documentados, 3 idiomas. **Nenhum deles está acima da dobra.**

**Fix.** Trocar o bloco de estatísticas pelo artefato que o turno diurno deveria conter — um índice de prancheta do próprio catálogo: *8 projetos documentados · 3 idiomas · 651 funções de teste · código aberto*, como painel de instrumento com borda de verdade (que passa a existir depois do P0). Isso preenche o buraco com evidência em vez de com nada, e é a composição que um concorrente não consegue copiar.

**Comando sugerido:** `/impeccable layout src/components/HeroSection.astro`

### [P2] Dezesseis linhas de texto sem informação na frente da evidência

`ProjectCard.astro:35–41` e `:98–101` imprimem, por card: o título do projeto em `.pc-title` (duplicando o `<h3>` 55px abaixo), depois `COL: 80 · ROW: 12` e `> IBM 5081 · 2026`. Em 8 cards, isso é 8 títulos duplicados e 16 linhas de trivia de cartão perfurado. No celular o rodapé quebra em duas linhas, custando ~45px por card — **360px de texto literalmente sem significado numa tela de 390px**.

**Por que importa.** O dev que chegou pelo blog veio por método. A primeira coisa que cada card conta pra ele é um número de peça de IBM 5081 inventado. Sinaliza decoração acima de substância, que é o oposto do que o conteúdo entrega.

**Fix.** Apagar `.pc-foot` inteiro e tirar `.pc-title` do `.pc-head` (mantendo os furos e o `#01`, que ganham o lugar como índice de catálogo). Se a moldura de cartão perfurado vale a pena, dar a ela uma carga real: ano, licença, linguagem — fatos que já estão no `projects.json`.

**Comando sugerido:** `/impeccable distill src/components/ProjectCard.astro`

## Persona Red Flags

**Alex (power user impaciente) — a correspondência mais próxima do usuário primário real.**
- Precisa rolar **2.763px, três telas cheias**, passando por um ensaio autobiográfico de 892px, antes do primeiro projeto aparecer.
- O CTA "VER PROJETOS" do hero é a única coisa que o salva, e é o único motivo de ele chegar lá.
- Chegando: 8 entradas planas, sem filtro, sem ordenação, sem índice, e a distinção projeto/contribuição é uma caixa rotacionada de 9px em `#5f636e` que ele nunca vai notar.
- Cada card pede que ele clique em "CASE STUDY ›" *ou* "Ler case study →" sem meio de prever qual fica na página.

**Casey (usuária mobile distraída).**
- Quatro controles de chrome (CV↓, PT▾, toggle, hambúrguer) amontoados no topo direito a 390px; três deles têm 30–38px de altura e ficam a menos de 8px um do outro. Território de dedo gordo, e o download do CV é o que tem a pior chance.
- O `.pc-foot` quebra em duas linhas por card, somando ~360px de `COL: 80 · ROW: 12` na lista de projetos, na menor tela.
- Detalhe importante: **o mobile é a melhor experiência clara** — a coluna única elimina o terço direito vazio. É a dobra de desktop que a perde.

**Sam (dependente de acessibilidade).**
- `.navbar-cv` a **1,42:1 no escuro**, falha dura de AA num piso declarado vinculante.
- `SkipToContent` com o mesmo bug: o link de pular para o conteúdo, no caminho de teclado, também a 1,42:1 quando focado no escuro.
- Seis alvos de toque abaixo do mínimo de 44px que o próprio design system declara não-negociável, quatro deles a 16px de altura.
- O link de e-mail é `href="#"` até o JS reescrever (`ContactSection.astro:790`) — com JS bloqueado, ativar "Enviar email para Bernardo" pula para o topo do documento sem nenhum retorno.
- Do lado positivo: decoração em `data-txt`/`::before`, `aria-hidden` em todo ornamento, `prefers-reduced-motion` completo e verificado, skip link presente e texto secundário a 5,22:1 estão todos corretos. As falhas são localizadas, não sistêmicas.

**Persona derivada — "a tech lead com quatro minutos, indicada pelo LinkedIn"** (primária no `PRODUCT.md`).
Ela abre no claro, num laptop 1920×1080, e precisa responder uma pergunta: *essa pessoa é sênior?* Na primeira dobra recebe: um nome, um cargo que ela já tinha, uma cidade, seis palavras de tecnologia e "46 repos no GitHub". **Nenhuma evidência de nível.** A coisa que responderia a pergunta dela em oito segundos — *27.000 linhas de Go, 12.000 de teste, 651 funções de teste, licenciado AGPL-3.0* — existe, está escrita, está traduzida, e está **colapsada dentro de um `<details>` na posição de scroll 3.000px, atrás de um link de 12px rotulado com um substantivo seco**. Ela não chega lá. O registro está completo e correto, que é o que o `PRODUCT.md` pede; ele só não é *legível* na velocidade em que ela lê.

## Minor Observations

- **`.hero-tech { opacity: 0.7 }` (`HeroSection.astro:230`) nunca se aplica.** O elemento também carrega `.hero-stagger`, cuja animação `forwards` termina em `opacity: 1` e vence. Declaração morta — inofensiva aqui porque melhora o contraste, mas a intenção de recuar aquele texto nunca esteve em vigor.
- **A "Regra do Body Terminal" que acabei de documentar está morta no código.** `.dark body { font-family: var(--font-mono) }` está em `@layer base` e perde para a classe `font-sans` do Tailwind no `<body>`. Confirmado ao vivo: `getComputedStyle(document.body).fontFamily` retorna Inter no escuro. O resultado visível é discutivelmente melhor que a regra documentada, mas doc e código discordam — e isso é drift que eu introduzi no `DESIGN.md` por confiar no CSS sem checar a cascata.
- **A medida de linha não é limitada em lugar nenhum.** Timeline e descrições de projeto ocupam os 1.072px do grid a 1440px — cerca de 120 caracteres, contra os 60–75ch confortáveis, e contra a própria regra de 60ch do `DESIGN.md`. O overlay contou 36 elementos acima de 124 caracteres por linha.
- **`@vercel/speed-insights` sobe em toda página** (`BaseLayout.astro`). A restrição vinculante do `PRODUCT.md` é "sem analytics que rastreie o visitante". Speed Insights é RUM. Merece decisão explícita registrada, não exceção implícita.
- **`.contact-link--cv` usa `--color-text-primary` enquanto os três irmãos usam `--color-accent`** — quatro controles visualmente paralelos, um arbitrariamente diferente, sem razão semântica.
- **`.blueprint-wrap` está no hero, sobre, timeline e contato — mas não em `#projetos`**, a seção mais longa da página (3.226px, 49% do documento). A única textura que o tema claro tem está ausente de metade dele.
- **O carimbo `PROJETO` é cinza e o `CONTRIB` é oxblood.** Os seis itens próprios ficam sem marca e as duas contribuições ficam destacadas — ênfase invertida para um registro de obra cujos artefatos-título são os projetos próprios.
- **O toggle de tema é o quarto item do cluster de ações da nav**, a posição menos proeminente, num site cujo problema conhecido é que ninguém encontra o outro tema. Não é argumento para trocar o padrão — é argumento para o controle merecer um rótulo.

## Questions to Consider

1. **E se a decoração do tema claro fosse o próprio registro, em vez de uma prancheta fictícia?** O turno diurno hoje inventa papelada — `PROJ. Nº 001/2026`, `FL. 04/06`, `COL: 80 · ROW: 12` — para preencher o espaço que o turno noturno preenche com adesivos. Mas existe um corpus real, autoral, trilíngue e cheio de números a um clique abaixo da dobra. Como seria o hero claro se o terço direito vazio segurasse um índice de verdade do catálogo? A metáfora deixa de ser fantasia e passa a ser verdade, e o "registro de obra" vira a proposta *visual* em vez de uma afirmação que o conteúdo honra em silêncio.

2. **O defeito real é o claro ser quieto, ou o claro ser quieto exatamente onde o escuro é barulhento?** O `DESIGN.md` diz que a contenção é traço do turno diurno, "não uma falta" — e isso é defensável. Mas contenção significa marcas *menos numerosas e mais fortes*, não as mesmas marcas a 1,07:1. E se o claro mantivesse o silêncio e gastasse todo o orçamento visual em três coisas — uma superfície preenchida por card, um filete visível, um acento que de fato separa — em vez de se distribuir igualmente por sessenta elementos a 5,22:1?

3. **Para quem é o `<details>`?** Hoje o case study colapsado serve quem quer menos. Mas o `PRODUCT.md` diz que o sucesso é o registro estar completo e correto, e as duas personas nomeadas vieram especificamente por profundidade. E se a seção de projetos abrisse expandida — problema/decisão/resultado visível nos oito — e o colapso existisse para quem quer passar o olho, em vez do contrário? A página fica mais longa e o recrutador de quatro minutos recebe a resposta dele sem um único clique.
