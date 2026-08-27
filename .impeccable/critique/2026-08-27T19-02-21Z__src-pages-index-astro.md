---
target: home page (src/pages/index.astro)
total_score: 23
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 3
timestamp: 2026-08-27T19-02-21Z
slug: src-pages-index-astro
---
Method: dual-agent (A: revisão de design sem âncora · B: detector + evidência de browser)

Alvo: `src/pages/index.astro`, nos dois temas. Modo: Experience.

## Design Health Score

| # | Heurística | Score | Achado principal |
|---|-----------|-------|------------------|
| 1 | Visibilidade do estado | 2 | Os 8 `.case-study-trigger` são pixel-idênticos aberto e fechado: chevron `transform: none` e borda `rgb(168,159,139)` nos dois estados. |
| 2 | Correspondência com o mundo real | 3 | A metáfora de folha de engenharia agora é coerente e sequencial. Desconto por "Contacto"/"Saltar" (pt-PT) num site pt-BR. |
| 3 | Controle e liberdade | 3 | `<details>` nativo degrada certo; mas o estado aberto não vai para a URL, então um case aberto não é linkável. |
| 4 | Consistência e padrões | 2 | Desvios do próprio DESIGN.md: fonte do corpo escuro morta, Permanent Marker em numeral, 7 componentes fora da escala. |
| 5 | Prevenção de erro | 3 | Sem entradas para errar; links externos com rel e rótulo. Desconto: dois pontos de CV cujo texto nunca diz "PDF". |
| 6 | Reconhecer em vez de lembrar | 3 | `FL. n/06` orienta bem; mas os 8 rótulos de divulgação são idênticos. |
| 7 | Flexibilidade e eficiência | 2 | Um caminho só. O blog tem busca no cliente; o catálogo — o produto — não tem. |
| 8 | Estética e minimalismo | 2 | O conteúdo da dobra ocupa 32% da área; 840px de sarjeta horizontal não carregam nada. |
| 9 | Recuperação de erro | 3 | Sem superfícies de erro. Desconto: a única falha presente (island que não hidrata) renderiza igual ao sucesso. |
| 10 | Ajuda e documentação | n/a | Superfície Experience. |
| **Total** | | **23/36** | **Acceptable (64%)** |

Comparação like-for-like com a rodada anterior (mesmo conjunto n/a): 21/36 → 23/36.
Trend completo: 17/32 (53%) → 21/36 (58%) → 23/36 (64%).

## Design Specificity Verdict

**Claro — 6,5/10. Uma pele distintiva sobre um esqueleto padrão.** A paleta, a numeração de folhas, os furos e o carimbo rotacionado são escolhidos e não confundíveis com template. Mas a especificidade para no tratamento de superfície e nunca chega à estrutura. E a 1912px a página inteira vive nos 56% esquerdos da tela: 840px de sarjeta vazia, 44% da largura da viewport.

**Escuro — 6/10. Mais compromisso, drift mensurável.** Três desvios verificados na página rodando: `getComputedStyle(document.body).fontFamily` retorna Inter, não JetBrains Mono — a Regra do Body Terminal está morta; `.dark .project-number` computa Permanent Marker, proibido por duas regras nomeadas; e os adesivos são um terceiro sistema de cor sem token.

**Detector: zero achados como configurado.** Com as supressões esvaziadas: 11. Todos em `src/styles/`.

**Contraste: zero falhas de conteúdo nos dois temas** — 279 nós no claro, 308 no escuro. As 25 falhas são todas `aria-hidden` (decoração punk e o marcador do BLOG).

**Rampa de tipo: totalmente respeitada.** Único valor fora é 48px no h1, que é o piso do clamp de display.

**Headings: 41, zero pulos de nível, toda seção com título.** Âncoras: 19px de folga sob a barra fixa.

## What's Working

1. O sistema `FL. nn/06` é uma ideia de verdade, não decoração: seis superfícies em sequência correta, em `data-txt` + `::before`, então modo leitura e leitor de tela recebem markup limpo.
2. Disciplina de contraste feita, não alegada: claro de 4,71:1 a 13,46:1, escuro de 8,40:1 a 15,34:1. O padrão `color: var(--color-bg-primary)` nos controles preenchidos evita a armadilha do branco sobre fósforo nos dois turnos.
3. Degradação graciosa real e verificada: os 8 case studies leem sem JavaScript, o mailto é href puro, o painel renderiza no servidor, e sob reduced-motion todo `.hero-stagger` resolve em opacity 1.

## Priority Issues

### [P0] O diferencial está 100% escondido, e o controle que o esconde não dá retorno nenhum
Os 8 `.case-study-trigger` são pixel-idênticos aberto e fechado. Medido: chevron `transform: none` nos dois estados, borda `rgb(168,159,139)` nos dois, rótulo nunca muda. Causa: a regra de rotação está escopada em `.case-study-details.enhanced.open`, e `.enhanced` vem da island `CaseStudyExpander`, que nunca hidrata — 0 de 8.
A primeira linha da prosa que o PRODUCT.md chama de diferencial está em y=3209px, atrás de um clique num controle que não parece fazer nada.
Fix: trocar o gate por CSS puro — `details[open] .case-study-chevron { transform: rotate(90deg) }` e `details[open] .case-study-trigger { border-color: var(--color-accent) }`. Opcionalmente abrir o primeiro card por padrão.

### [P1] O painel de evidência é inerte e gasta o acento em dado
`.hero-panel` tem 0 links ou botões. Sete linhas, uma delas `CASE STUDIES 8`, que enuncia o diferencial do produto e não leva a lugar nenhum. Os valores são 7 dos 9 nós de texto com acento na dobra, a 668px do CTA primário.
A Regra do Carimbo diz que coisas que não são ação não usam a cor de ação. Contagens de catálogo são dado.
Fix: tornar as quatro linhas do catálogo âncoras para `#projetos`; mover os numerais para o azul blueprint, deixando o oxblood para CTA, carimbo e ponto do logo.

### [P1] Paridade trilíngue quebrada nos dois rótulos que sobem em toda página
`SkipToContent.astro` fixa `label = 'Saltar para o conteúdo'` e o BaseLayout renderiza sem props: o primeiro elemento focável em `/en/` e `/es/` está em português. `ThemeToggle.tsx` fixa o aria-label em português e não aceita locale. As traduções já existem e nunca são referenciadas.
Paridade trilíngue e navegação por teclado são as duas restrições vinculantes do PRODUCT.md, e a interseção delas é exatamente o skip link.
Fix: passar locale para os dois componentes e usar as chaves existentes. Há também 15 chaves declaradas e usadas em lugar nenhum.

### [P1] A segunda tela do recrutador é autobiografia, não evidência
`#sobre` tem 828px; `#projetos` só começa em y=2712px, 2,97 alturas de viewport. A cópia mais destacada da seção é o pullquote, que quebra a regra de voz do PRODUCT.md (emenda por dois-pontos e travessão no meio).
Fix: cortar `#sobre` para umas três frases e mover `#projetos` acima de `#timeline`.

### [P2] O turno noturno perdeu a fonte do corpo em silêncio, e seus numerais quebram duas regras
`.dark body { font-family: var(--font-mono) }` está em `@layer base` e o utilitário `font-sans` no `<body>` do BaseLayout vence por ordem de camada. Fonte computada no escuro: Inter. E `.dark .project-number` renderiza 01–08 em Permanent Marker, proibido pela Regra do Marcador e pela Regra do Rótulo Mono, que nomeia "número do projeto".
Fix: tirar `font-sans` do `<body>` ou içar a regra para fora do `@layer base`; devolver `.project-number` ao mono.

## Persona Red Flags

**Leitor de tela / teclado.** O primeiro elemento focável em `/en/` e `/es/` está em português; o aria-label do toggle de tema também. Os `<summary>` anunciam expandido/colapsado nativamente, mas um usuário de teclado *vidente* não recebe nenhuma mudança visível ao focar e apertar Enter. E `.hero-panel` é um `<aside>` com 7 `<div>` irmãos, sem semântica de lista: nenhuma contagem de itens para o bloco de fatos mais denso da página.

**Mobile a 390px.** Sem overflow. Mas `#projetos` mede 3456px, 4,1 telas. E os cinco `.navbar-link` têm 20px de altura e são os únicos interativos que nunca receberam o pseudo-elemento de 44px que `.navbar-cv`, `.project-link` e `.navbar-logo` receberam.

**Skimmer.** 8 cards sem diferenciação nenhuma: mesmo tamanho de título, mesmo carimbo, mesma fileira de badges, mesmo botão. Nada diz por onde começar. Sem filtro, sem ordenação, sem link profundo.

**Dev vindo do blog.** O canal do YouTube, nomeado no PRODUCT.md como um dos quatro funis de entrada, não aparece na home. E a meta description promete "certificações", que não existem: nem diretório, nem superfície, e as chaves `nav.certifications`/`sections.certifications` estão declaradas nos três idiomas sem uso. Para um produto cujo princípio é que um número errado custa mais que uma tela sem graça, a própria descrição do site exagera o catálogo.

## Minor Observations

- `theme-color` fora da paleta nos dois turnos: `#faf9f6` e `#0c0a09` contra os tokens `#f2efe4` e `#0a0f0c`. O `#0c0a09` parece `#0a0f0c` com dígitos trocados.
- Sete componentes fora da escala de espaçamento, com frações escritas à mão: 13,6px, 9,6px, 14,4px, 6,4px, 1,6px, 7,2px.
- Dois tamanhos do mesmo elemento-assinatura no mesmo hero: `.hero-holes .punch-hole` 8px e `.hero-panel-holes .punch-hole` 6px, com gaps de 6,4 e 5,6px — 0,8px de distância, o sintoma exato da Regra do Degrau Inteiro.
- `.stat-card-value` a 28px está no degrau de Headline, não no de Numeral (32/40px).
- A borda em repouso do `.case-study-trigger` é 2,28:1, abaixo dos 3:1 que o SC 1.4.11 pede para componente de interface.
- `#contacto` é o único bloco centralizado numa página alinhada à esquerda, e `.contact-cta` a 44px é maior que qualquer título de seção (36px).
- Um `.punk-menacing` decorativo cruza a linha `TECNOLOGIAS / 31` do painel no escuro.
- O hero diz a mesma coisa duas vezes em 100px: `.hero-role` "FULLSTACK DEVELOPER" e a descrição abrindo com "Fullstack developer em Ribeirão Preto".
- Os quatro H3 do `#timeline` começam idênticos; o token que diferencia é o último de cada linha.
- O marcador que eu adicionei ao BLOG está a 2,31:1 e é `aria-hidden`: carrega significado que ninguém com leitor de tela recebe e quase ninguém enxerga.

## Supressões — assessment da B

Duas são mais largas do que aquilo que cobrem:
- `side-tab: "*"` escopado ao global.css é curinga. E o achado subjacente parece ser falso positivo da regra: `.light body::before` é uma barra fixa de largura total no topo da página, não a borda lateral de um card.
- `design-system-color: "#000"` é global e cobre 6 sítios. Cinco cabem na exceção fechada que o DESIGN.md documenta; a linha 1159 não: `.dark .blog-card { background: color-mix(... 88%, #000) }` é tinta de superfície de card, fora da exceção, e a supressão esconde assim mesmo.

## Nota de método

O host tinha `prefers-reduced-motion: reduce` ligado nativamente, então as duas avaliações mediram o caminho acessível. Movimento com reduce desligado não foi medido em nenhuma das rodadas desta sessão.
