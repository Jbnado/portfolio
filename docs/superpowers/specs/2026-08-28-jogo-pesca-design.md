# Jogo de pesca — design

Data: 2026-08-28
Estado: aprovado em conversa, aguardando revisão da spec escrita

## Por que existe

O hero do site afirma "Construo APIs, interfaces e **às vezes jogos**". O Sobre abre com
"Tudo começou pelos games". Hoje essas duas frases têm uma prova só, **Ribeirão Noir**
(Godot 4), que mora no catálogo como link — coisa que a pessoa precisa sair do site para ver.

Um jogo jogável na própria página é a evidência que se toca. Isso não é enfeite pendurado
num portfólio: é o mesmo princípio que rege o site inteiro, onde a afirmação vem acompanhada
do que a sustenta. A prova senta ao lado da alegação.

Referências declaradas pelo dono do projeto: **Dredge** e **Dave the Diver**.

## Propósito, nas palavras da decisão

Três papéis foram escolhidos ao mesmo tempo, e eles se conciliam por camadas:

1. **Prova tocável** da frase do hero — o jogo é achado às claras.
2. **Recompensa para quem fuça** — o escondido mora *dentro* do jogo (peixes raros, o que
   não é peixe), e não no acesso a ele.
3. **Motivo de voltar** — o caderno de espécimes persiste.

Resumo operacional: **achado às claras, recompensa quem mexe nele.**

## Visão completa (o destino, não o v1)

Barco sai da loja e anda por um mapa pequeno na horizontal. O mapa muda de bioma conforme
se afasta: areia visível é raso, corais é meio, mar escuro sem fundo visível é abissal.
Pontos de pesca aparecem como círculos, com cor por faixa de profundidade. A vara equipada
determina quais círculos ficam visíveis e pescáveis. Peixe vendido na loja vira dinheiro,
dinheiro vira vara nova, vara nova abre a faixa seguinte. O ciclo fecha em si.

Cada peça se justifica pela seguinte: a loja dá propósito ao peixe, a vara dá propósito à
loja, o bioma dá propósito ao movimento.

## Escopo do v1

**O v1 é uma tela.** Botão lançar, sorteia um peixe, roda o minigame do motor dele, mostra
o que foi pego, registra no caderno. Peixe é retângulo colorido com nome. Arte de programador
por decisão explícita — a pergunta que essa versão responde não depende de arte.

**O v1 não tem:** barco, mapa, biomas, loja, economia, varas, progressão de profundidade.

**Os três motores entram inteiros no v1.** Testar só um não responde a pergunta, e a DRAGAGEM
é justamente a que corre mais risco de não ser divertida.

**Nove peixes, matriz de motor × faixa de dificuldade.** Cada faixa tem exatamente um peixe de
cada motor, do raso que ensina ao abissal sem perdão — a tabela original (nove peixes indexados
só pela variação do TRAJETO) foi revista a pedido do dono: o raso precisa ensinar as três
mecânicas, não só a mais fácil (ver "Modelo de falha" para a regra de quem perde em cada faixa):

| faixa | TRAJETO | SUSTENTAÇÃO | DRAGAGEM |
|---|---|---|---|
| 1 — raso, ensina | p1: zona de 30%, 3 acertos | p2: peixe calmo, carência longa | p3: 2 pistas, nunca perde, 3 limpas seguidas |
| 2 — meio | p4: zona de 25%, 3 acertos | p5: peixe errático | p6: 2 pistas, tolera 2 quedas |
| 3 — abissal, sem perdão | p7: zona de 15%, 3 acertos (ainda o mais fácil dos três motores) | p8: peixe arisco, carência curta | p9: 3 pistas, tolera 1 queda |

Cada peixe carrega os próprios parâmetros diretamente na tabela, que é o que o modelo de dados já
faz. O amarre entre faixa de profundidade real (o mapa, ainda inexistente no v1) e essa faixa de
dificuldade entra junto com o mapa.

## Critério de sucesso

**Dez lances seguidos sem querer parar.** Se for preciso se forçar a chegar no décimo, a
resposta é não, e o trabalho seguinte é consertar os minigames — nunca construir o mundo em
cima deles.

O critério fica declarado antes de jogar, de propósito. Critério inventado depois do teste
sempre confirma o que já se queria acreditar.

## Rota, descoberta e idiomas

Rotas seguindo a convenção que já existe no projeto (`/projeto`, `/en/project`, `/es/proyecto`):

```
/jogo/pesca        /en/game/fishing        /es/juego/pesca
```

A rota é descritiva e não carrega o nome do jogo. **O nome ainda não foi decidido** e não
bloqueia nada: ele entra depois, no `<title>` e no hover do rodapé.

**Paridade trilíngue é vinculante** (PRODUCT.md). As três rotas saem no mesmo dia, com todas
as strings traduzidas.

Descoberta em duas camadas:

- **Aberta, nos dois turnos.** As palavras "jogos" (hero) e "games" (Sobre) viram link. Quem
  lê a frase encontra a prova dela. Não entra na navegação — ela já tem cinco itens.
- **Escondida, só no turno noturno.** Um bonequinho no rodapé, discreto, que ao receber
  ponteiro **ou foco** revela "jogar" e o nome do jogo.

Três regras fechadas sobre o bonequinho:

1. `:hover` **e** `:focus-visible`. Quem navega por teclado também encontra.
2. Em toque, onde hover não existe, ele renderiza já revelado em opacidade baixa.
3. **Ele não existe ainda.** O v1 sai sem. A palavra-link já entrega a descoberta aberta.

## Arquitetura

```
src/pages/jogo/pesca.astro              (+ en/game/fishing, es/juego/pesca)
src/islands/fishing/
  Fishing.tsx          ilha Preact, client:load
  sea.ts               camada Canvas — existe e fica VAZIA no v1
                       (mountSea, unmountSea, drawSea)
  types.ts             tipos compartilhados: Result, Fish, params de cada
                       motor, Zone, Gate
  engines/
    track.ts           lógica pura do TRAJETO
    hold.ts            lógica pura do SUSTENTAÇÃO
    dodge.ts           lógica pura da DRAGAGEM
  views/
    TrackView.tsx + TrackView.css     casca visual do TRAJETO
    HoldView.tsx + HoldView.css       casca visual do SUSTENTAÇÃO
    DodgeView.tsx + DodgeView.css     casca visual da DRAGAGEM
  draw.ts              sorteio ponderado do peixe (weightedPick), extraído
                       pra poder testar sem simular um lance inteiro
  fish.ts              tabela de peixes: id, nome, cor, faixa de tamanho
                       (min/max em cm), motor e parâmetros
  log.ts               localStorage: caderno de espécimes
```

Os nomes em inglês (`fishing`, `track`, `hold`, `dodge`, `Fishing.tsx`) divergem do
português do resto do texto: convenção de código do projeto, não uma tradução
esquecida. `TRAJETO`, `SUSTENTAÇÃO` e `DRAGAGEM` continuam sendo os nomes que este
documento usa pra falar dos três motores.

**A ilha só carrega nessa rota.** Astro não vaza island entre páginas. As outras 37 páginas
continuam entregando os 33KB de JS que entregam hoje.

**Orçamento imposto: 15KB não comprimido** para o jogo inteiro. Se passar disso, para e avisa
antes de passar.

**Sem engine.** Three.js seria ~600KB para desenhar quadrados, cerca de 18× todo o JavaScript
que o site tem hoje, e é um renderizador 3D aplicado a um problema 2D. Phaser e PixiJS são
grandes pelo mesmo motivo. O segundo argumento pesa mais que o tamanho: Canvas e WebGL são
caixa-preta para acessibilidade, e foco, teclado e leitor de tela teriam que ser
reimplementados em paralelo.

A CSP do site (`script-src 'self'`) **não** impede biblioteca de npm — dependência instalada
entra no bundle e é servida do próprio domínio. A decisão de não usar engine é de orçamento e
de acessibilidade, não de CSP.

**Costura DOM/Canvas.** Interface, botões e minigames em DOM e SVG. Uma camada de Canvas
existe atrás de tudo para o mar e as partículas quando o mundo existir.

No v1, "vazia" quer dizer literalmente: o elemento `<canvas>` e o módulo `sea.ts` existem e
expõem a interface (`mountSea`, `unmountSea`, `drawSea`), e **o laço de animação não roda**. Não
é para existir `requestAnimationFrame` sem nada para desenhar — isso queima bateria e aparece
em profiling como se o jogo fosse pesado.

**CSS por componente.** O PRODUCT.md concentra estilo em `global.css` e `islands.css`. Essa
regra foi **explicitamente dispensada para o jogo**: cada motor carrega seu `.css` ao lado do
`.tsx`, o Vite empacota, e o custo fica na rota que usa. Continua sem CSS modules.

**Estado no localStorage**, sem conta e sem servidor. No v1 guarda, por peixe, quantas vezes
foi pego (`times`) e o maior já pescado (`largest`).

## Os três motores

Os três devolvem **o mesmo par**, e é isso que impede a camada de mundo de precisar saber qual
minigame rodou:

```ts
type Resultado = { pego: boolean; qualidade: number }  // qualidade 0..1
```

`qualidade` vira o tamanho do peixe dentro da faixa da espécie. É assim que perícia vira
recompensa visível, e é o que dá sentido ao caderno.

### 1. TRAJETO — acerto no tempo

Uma barra vai e volta; uma zona verde fica sobre ela; espaço quando o marcador a cruza.
**A cada acerto a zona pula para outro lugar sorteado da barra**, então não dá para decorar o
ritmo: tem que reencontrar o alvo três vezes.

```ts
type TrackParams = {
  periodMs: number
  zoneSize: number          // botao de dificuldade: a zona encolhe
  hits: number              // sempre 3
  tolerance: number | null  // sempre 2: perde no terceiro erro
}
```

**O anel saiu daqui.** O `radial` era a segunda geometria do TRAJETO e foi removido a pedido do
dono, com a razão explícita de que o anel é a linguagem da DRAGAGEM e **cada minigame precisa ser
um tipo por si só** — emprestar a forma do vizinho apaga a diferença entre os dois. Junto saíram
o campo `path`, o tipo `PathKind`, o array `zones`, o campo `alternates` e o SVG do anel na vista.
`reta` e `subida` já tinham saído antes, por teleportarem o indicador (ver Controles).

**A posição da zona não é parâmetro, é estado.** Ela é sorteada em `startTrack` e resorteada a
cada acerto, sempre de modo que a zona caiba inteira na barra — senão uma zona sorteada na ponta
sairia pela borda e valeria menos que as outras, e a dificuldade deixaria de ser só o tamanho.
Isso também resolve de graça a saturação de qualidade: com alvo móvel, mesmo quem joga bem varia
o tamanho do peixe.

**O SUSTENTAÇÃO é o peixe raro de toda faixa.** Depois de jogar os três motores, o dono
concluiu que ele é de longe o mais difícil — a carga é de controle contínuo, que os outros dois
não têm — e que por isso ele fica para os peixes mais difíceis. Peso 10 contra 45 dos outros dois
em **todas** as faixas. A faixa 1 já era assim por decisão anterior dele (o peixe que ensina a
perder tem que ser raro, senão cai um em cada três); as faixas 2 e 3 tinham os três empatados.

**Este é o minigame de boa.** Por decisão do dono, o TRAJETO é simples e fácil **inclusive no
abissal** — é o descanso entre os outros dois. A dificuldade sobe só encolhendo a zona
(30% / 25% / 15% da barra), com a velocidade quase parada.

**Perde no terceiro erro em todas as faixas, inclusive no raso.** Isto revoga, só para o TRAJETO,
a regra "o raso nunca perde" da seção de modelo de falha: a pedido do dono, `tolerance: 2` vale
para os três. A DRAGAGEM do raso continua sem perder.

### 2. SUSTENTAÇÃO — controle contínuo

Segura espaço para subir, solta para descer, mantém a faixa sobre o peixe. A barra de progresso
enche enquanto o peixe está dentro e drena quando está fora. **Barra zerada não perde o peixe
na hora** — abre uma carência (`graceMs`): o peixe escapa só se a barra ficar zerada por tempo
demais sem se recuperar. `graceMs: number | null` segue a mesma convenção `null = nunca perde`
de `tolerancia` (TRAJETO) e `bumpsAllowed` (DRAGAGEM) — o dreno continua sendo o mecanismo, e uma
barra que não pode zerar não tem tensão nenhuma, mas zerar deixa de ser perda instantânea.

Parâmetros: altura da faixa (`bandHeight`), padrão do peixe, gravidade e força de subida
(`gravity`, `lift`), teto de velocidade da faixa (`maxSpeed`), velocidade do peixe (`fishSpeed`),
taxa de enchimento e de dreno, carência antes de escapar (`graceMs`).

Este é o motor de peixe **rápido e arisco**. A dificuldade mora no comportamento do peixe, não
em código diferente: um peixe que dá arranco e muda de direção é muito mais difícil que um
calmo, com a mesma implementação.

### 3. DRAGAGEM — desvio contínuo

**Sempre duas pistas.** Dois anéis concêntricos giram; onde um vão quebra a pista em que você
está, o trilho acaba. Espaço troca de pista antes do vão. Cair no vão é o dano.

**Os vãos são sorteados a cada lance.** Quantos (dentro de um intervalo por peixe), onde e de que
largura — tudo muda de lance para lance, então não dá para decorar o anel. As pistas abertas
alternam, então cada vão cobra uma troca; o que varia é o ritmo em que elas chegam. Cada vão
nasce dentro da sua fatia da volta com folga mínima para o vizinho: sem isso dois vãos poderiam
colar e exigir uma troca em poucos milissegundos, o que não é dificuldade, é sorte.

**Fisga enchendo uma barrinha, não contando passagens.** A barra sobe enquanto você não cai e
representa o peixe sendo puxado. Encher exige `holdMs` de tempo limpo — 3s, 4s e 5s. Isto
substituiu um modelo de "três passagens limpas seguidas", a pedido do dono.

**Cair recua, não zera.** Cada queda desconta `penaltyMs` da barra. A regra anterior zerava tudo,
e perder 15 segundos de luta por um deslize é punição demais para um jogo de portfólio.

**Duas portas de saída para perder o peixe**, ambas desligadas no raso:

1. **Três quedas seguidas.** Passar limpo por um vão zera a contagem. Pega quem se perdeu no
   ritmo — e é alcançável justamente porque as pistas alternam: quem troca *atrasado* erra o vão,
   troca, e o vão seguinte já pedia a outra pista. Esse cai em todos.
2. **A barra zerar duas vezes.** Pega o caso que a primeira porta não pega: quem cai espaçado
   nunca junta uma sequência, mas também nunca progride.

**A dificuldade é a velocidade da volta e a quantidade de vãos** — decisão do dono. Mais vãos por
volta significa mais trocas obrigatórias; a volta mais curta encurta a janela de cada decisão.

Parâmetros: `periodMs`, `gatesMin`/`gatesMax`, `gapMin`/`gapMax`, `holdMs`, `penaltyMs`,
`fallsToLose`, `zeroesToLose`.

## O mundo (v2, em construção)

**O cenário é um lago pequeno, visto de lado.** A premissa, do dono: peixes de água doce e
salgada aparecem ali **do nada** — é justamente por isso que se pesca nesse lago, e é o que
autoriza a matriz de espécies a misturar o que na natureza não se encontra junto.

### As espécies

O pedido foi "só peixes endêmicos brasileiros". **Endemismo estrito não sobrevive ao contato com
a lista**: as bacias brasileiras atravessam fronteiras, então pirarucu, tucunaré, dourado e jaú
também ocorrem no Peru, no Paraguai ou na Argentina. Espécie estritamente endêmica costuma ser
peixe obscuro de uma bacia só, que ninguém reconheceria. A régua adotada é outra e está dita
aqui para não virar discussão depois: **peixes brasileiros icônicos**, e a decisão de mudar de
régua é do dono.

Cada faixa tem **pelo menos um peixe de água salgada** — é a premissa aparecendo onde o jogador
está, e não só na ficha do cenário. Há teste travando isso.

| faixa | TRAJETO | SUSTENTAÇÃO (raro) | DRAGAGEM |
|---|---|---|---|
| 1 — raso | Lambari, doce, 8–18cm | Traíra, doce, 25–55cm | Tainha, **salgada**, 25–50cm |
| 2 — meio | Robalo, **salgada**, 30–70cm | Matrinxã, doce, 28–58cm | Pacu, doce, 35–80cm |
| 3 — abissal | Garoupa, **salgada**, 45–95cm | Dourado, doce, 55–105cm | Jaú, doce, 80–150cm |

Os tamanhos são fiéis às espécies, e o teto sobe a cada faixa — há teste para isso também. Mudar
tamanho **não** mexe na dificuldade: ela mora nos parâmetros dos motores, e o tamanho é só a
recompensa que a qualidade vira.

**Blockout primeiro, arte depois.** Tudo quadrado de propósito: o que se julga nesta fase é o
arranjo — onde fica a loja, quanto se anda, como o minigame cobre a cena — e não o desenho, que
ainda não existe. Os peixes já têm lugar reservado para a foto no caderno.

- **Margem à esquerda com a loja.** O barco nasce na água, à direita dela.
- **Anda com A/D ou setas**, segurando. O lago inteiro se atravessa em pouco mais de quatro
  segundos: o mapa é pequeno de propósito.
- **Marcas finas sobre a água** são os pontos de pesca. Só dá para lançar em cima de uma.
- **A profundidade abre a faixa de peixes** — raso, meio, abissal, da esquerda para a direita.
  Isto substitui o "quantos peixes você já conhece" do v1, que era progressão de mentira por não
  existir mapa. **Andar para a direita passa a ser a progressão.**
- **O minigame cobre a cena, não a substitui.** O lago fica desenhado atrás.
- **Tab abre o caderno** por cima da cena.

### A loja

Abre com espaço quando o barco está na margem. Setas escolhem, espaço age — a mesma gramática do
resto do jogo, uma tecla faz tudo.

**Linha é permissão, isca é probabilidade.** A separação importa e veio das palavras do dono.

- **Três linhas**, uma por profundidade (40, 120, 300). Cada uma **alcança** a sua profundidade
  e todas as mais rasas — por isso **a abissal é a melhor: com ela se pesca o raro em qualquer
  lugar**. O que a linha libera é o peixe raro daquela faixa, que já é o SUSTENTAÇÃO por decisão
  anterior do dono. Sem linha equipada, nenhum raro morde.
- **Três iscas** (30, 90, 220), com sorte crescente. São **permanentes**: compra uma vez e a
  sorte vale para sempre. A sorte soma em dois lugares — multiplica o peso do raro no sorteio e
  puxa o tamanho para cima, travado no máximo da espécie.
- **Só uma linha e só uma isca ficam equipadas por vez.** Comprar já equipa, porque ninguém
  compra para deixar na gaveta. A melhor domina, e isso é proposital: é progressão, não dilema.

### Celular

**Portrait, e completamente responsivo** — pedido do dono. Duas coisas que só apareceram medindo
num viewport real de 410px:

- **O jogo era injogável no celular.** Tudo dependia de tecla: mover, lançar, abrir a loja e o
  caderno. Sem teclado, não havia entrada nenhuma. Agora há uma fileira de controles com alvos de
  48px, escondida onde há ponteiro fino **e** tela larga.
- **A cópia do HUD falava de tecla** ("Espaço lança a linha") para quem não tem tecla. As frases
  passam a ser neutras quanto ao meio de entrada, e o rótulo do botão diz o que fazer.

A ação principal — lançar, abrir a loja, dispensar o resultado — é **uma função só**, que o
Espaço e o botão de toque chamam. Duplicar a regra faria teclado e dedo divergirem na primeira
mudança. Em paisagem baixa, um aviso pede para girar o aparelho em vez de espremer a cena.
- **Vender o pescado** é o que vira moeda: um peixe vale metade do tamanho em cm, com piso de 1.
  Pescar enche o porão; vender esvazia e credita.

O progresso mora numa chave própria (`fishing:progress`), separada do caderno de espécimes — o
caderno tem formato já publicado, e misturar obrigaria a migrar um dado que não precisa mudar.

### Origem das mecânicas

Verificado, não presumido. O Dredge tem seis minigames de pesca, e todos são o mesmo gesto —
apertar quando o indicador cruza a zona — variando **a geometria do caminho**: Radial,
Ball Catcher, Diamond, Pendulum, Spiral. O TRAJETO é essa família inteira reduzida a um motor
com dois caminhos (`pendulo` e `radial` — ver a seção acima para os dois que saíram e por quê).

A DRAGAGEM vem do minigame de **dragagem** do Dredge, que não é de pesca lá e é aproveitado
aqui como mecânica de pesca por decisão explícita.

O SUSTENTAÇÃO vem do Stardew Valley.

Fontes: [DREDGE Wiki — Minigames](https://dredge.wiki.gg/wiki/Minigames),
[StrategyWiki — DREDGE/Fishing](https://strategywiki.org/wiki/DREDGE/Fishing).

## Controles

**Espaço é o verbo. Setas são o movimento.** Um botão só para tudo que é ação.

| onde | tecla | o quê |
|---|---|---|
| mapa | ← → ou A D | andar o barco |
| mapa, no mar | espaço | lançar a linha |
| mapa, na loja | espaço | entrar na loja |
| loja | setas ou WASD | andar nos itens |
| loja | espaço | comprar, vender |
| **os três motores** | **espaço** | tudo |

Espaço significa sempre "a ação óbvia daqui", e isso traz uma obrigação: **botão contextual
exige que a tela sempre diga o que ele faz agora.** Sem prompt visível, contextual vira
adivinhação.

Consequências técnicas assumidas:

- **A área do jogo ocupa a tela sem transbordar.** É requisito de layout, e é o que de fato
  resolve a rolagem por espaço. `preventDefault` fica como cinto de segurança.
- **Espaço segurado dispara repeat.** SUSTENTAÇÃO quer isso; os outros dois filtram
  `event.repeat`.
- **Foco pode escapar da ilha.** A ilha gerencia foco e mostra claramente quando está ao vivo.

Um jogo de um botão mapeia direto para toque: um botão vira um toque em qualquer lugar, e o
jogo funciona no celular sem redesenho.

## Modelo de falha

**Perda existe sempre no meio e no abissal.** No raso, dois dos três motores nunca perdem
(TRAJETO e DRAGAGEM, `tolerancia`/`bumpsAllowed` null) — mas a SUSTENTAÇÃO do raso (p2) pode
perder, raro de propósito, com carência longa. É uma exceção registrada, não um vazamento: o
tipo do parâmetro de carência (`graceMs: number | null`) segue a mesma convenção `null = nunca
perde` dos outros dois motores, então quando o SUSTENTAÇÃO do raso perde é porque alguém decidiu
isso, não porque o tipo não tinha como dizer o contrário.

| faixa | TRAJETO | SUSTENTAÇÃO | DRAGAGEM |
|---|---|---|---|
| 1 — raso | **perde no 3º erro** | pode perder (raro, de propósito) | nunca perde |
| 2 — meio | perde | perde | perde |
| 3 — abissal | perde | perde | perde |

Isto revoga a regra original do v1, "SUSTENTAÇÃO e DRAGAGEM não aparecem nos rasos": a pedido do
dono, a tabela de peixes virou uma matriz motor × faixa (ver "Escopo do v1") onde **cada faixa
tem exatamente um peixe de cada motor**, para que o raso ensine as três mecânicas em vez de só a
mais fácil. A generosidade do raso passou a morar no **parâmetro** (tolerância nula, carência
longa), não na ausência do motor.

**Por que o custo do erro que não perde o peixe é tamanho, não tempo.** No Dredge, errar não
perde o peixe, só demora mais — e isso funciona lá porque a noite é perigosa e demorar é caro.
Este jogo não tem noite nem pressão temporal, então "demora mais" não custaria absolutamente
nada. O custo é tamanho: pesca menor, vale menos, não bate o recorde.

Esta decisão é registrada explicitamente porque alguém no futuro pode "corrigir" o modelo para
o do Dredge sem perceber que falta o sistema que o sustenta.

**Motor não é função da profundidade.** O motor é função da personalidade do peixe: TRAJETO
para o de tempo, SUSTENTAÇÃO para o rápido, DRAGAGEM para o brigão. A faixa controla aposta e
dificuldade — e agora, com a matriz completa, também garante que as três personalidades
apareçam em toda faixa.

**Tolerância se expressa na moeda de cada motor:** tamanho da zona no TRAJETO, taxa de dreno no
SUSTENTAÇÃO, quedas até arrebentar na DRAGAGEM.

### Orçamento de JS: por página, e dois em vez de um

O v1 nasceu com **um** teto de 48KB medido como "a soma de todos os
`dist/_astro/*.js`". Essa métrica estava errada por dois motivos, e os dois
apareceram na prática.

**Ela nunca mediu o que alguém baixa.** Somava a pasta inteira, incluindo
chunks que só uma rota usa — o `BlogFeed` conta contra o jogo, e vice-versa.
Medido pelo fecho transitivo dos imports a partir do HTML: a home baixa
**30,3KB**, a página do jogo **44,4KB**, e o jogo em si é **14,1KB** deles.

**E um teto só faz o jogo pesar contra páginas que não o carregam.** O
`Fishing.js` é um chunk separado que só a rota do jogo puxa; o site não fica
mais lento porque o jogo cresceu. Com sprites, loja, barco e mapa vindo, um
teto compartilhado obrigaria a apertar o site para caber o jogo.

Passam a ser dois, verificados por `pnpm budget`:

| orçamento | mede | teto |
|---|---|---|
| **site** | JS que a home baixa | 32KB |
| **jogo** | JS que `/jogo/pesca` baixa | 80KB |

O do site é apertado de propósito — é ele que protege o portfólio. O do jogo
tem folga para o que falta construir.

**Sprites não entram aqui.** Imagem não é JS: elas não contam contra estes
tetos, mas contam contra o peso da página, e vão precisar do seu próprio
limite quando existirem.

### Calibragem das faixas

Medida por simulação, não por opinião: três jogadores sintéticos (tempo de reação e tremor
diferentes) × 400 tentativas por peixe. Taxa de captura:

| faixa | iniciante | mediano | bom |
|---|---|---|---|
| 1 — ensina | 100% | 100% | 100% |
| 2 — meio | ~50% | ~90% | 100% |
| 3 — abissal | 3–22% | 41–62% | ~100% |

**O p4 nunca perdia o peixe.** Ele tinha `tolerance: null`, o que contradizia a tabela do modelo
de falha logo acima — a faixa 2 perde. Nenhum teste comparava os parâmetros com aquela tabela,
então a contradição sobreviveu. Corrigido para `tolerance: 2`.

**Cada motor tem um botão dominante, e não é o óbvio.**

- **SUSTENTAÇÃO:** a razão `fillRate`/`drainRate`. Com `fillRate < drainRate` é preciso ficar
  dentro da faixa mais da metade do tempo só para empatar, e a taxa de captura despenca de 64%
  para 6% com o jogador mediano. Mantenha o enchimento acima do dreno e use a largura da faixa
  e a velocidade do peixe para dosar. Regra prática: `fishSpeed ≈ bandHeight / 340` põe o
  jogador de reação média no fio da navalha, porque em 170ms o peixe anda meia faixa.

  Isto já **inverteu a escada uma vez**: o p5 ficou com razão 0,89 enquanto o p8 tinha 1,06, e o
  peixe do meio passou a doer mais que o do abissal. O dono percebeu jogando antes de qualquer
  medição minha. Um saldo negativo não é dificuldade — é perder terreno mesmo jogando bem, e
  lê como jogo quebrado. **A razão fica acima de 1 nos três**, e a escada mora na faixa
  (34% / 19% / 15%) e na velocidade do peixe.

  Os três também precisam de **larguras de faixa visivelmente diferentes**. p5 e p8 chegaram a
  ter exatamente 17% os dois, e a primeira coisa que o dono relatou foi "a barra verde nunca
  muda de tamanho".
- **DRAGAGEM:** o espaçamento entre portões (`periodMs / nº de portões`) contra o tempo de
  reação. É quase uma função degrau — acima da reação, quase 100%; abaixo, quase 0% — e só o
  tremor humano suaviza a borda. Por isso a dificuldade é a velocidade, como pedido pelo dono.
- **TRAJETO:** o tamanho da zona contra o quanto o marcador anda no erro de tempo típico.
  É o mais gradual dos três, e por isso o melhor para a faixa 3.

**Lacuna conhecida:** para um jogador competente, o tamanho do p2 e do p3 é sempre o máximo
(46cm e 58cm). A qualidade satura quando não se erra, e no raso isso é generosidade de propósito;
mas o recorde do caderno nesses dois nasce cravado. Resolver exige um termo contínuo de precisão
na qualidade, que não cabe no teto de 48KB de JS — decisão a tomar junto com o escopo do jogo
completo.

## Acessibilidade

WCAG AA é piso vinculante no projeto (PRODUCT.md), e aqui são requisitos de aceite, não
melhorias.

- **Um botão** já resolve metade. Switch access funciona por definição.
- **`prefers-reduced-motion`: revogado, e a revogação é a correção de um erro meu.** A regra
  original mandava TRAJETO e DRAGAGEM avançarem em **passos discretos** em vez de deslizar.
  Na prática isso atualizava o marcador **9 a 11 vezes por segundo**, e o dono do projeto — que
  tem a preferência ligada no Windows — relatou o jogo como travando. Não era percepção: era o
  comportamento especificado.

  A regra estava errada por dois motivos. O primeiro é que `prefers-reduced-motion` existe contra
  movimento que causa desconforto vestibular — parallax, giro, zoom, movimento de área grande —
  e um marcador de 4px numa barra de 420px não é nada disso. O segundo é que esse movimento é
  **essencial à tarefa**: ele *é* o minigame. O próprio WCAG isenta movimento essencial
  (2.3.3 Animation from Interactions, que além disso é AAA, acima do piso AA deste projeto).
  Discretizar não protegia ninguém — deixava o jogo pior e mais difícil exatamente para quem
  tinha a preferência ligada.

  Os três motores passam a se mover continuamente para todo mundo. Saíram `quantizeSteps` do
  `stepHold`, o campo `fishDrawPos` do estado e as constantes `STEPS` das três vistas. As
  animações **decorativas** do site seguem respeitando a preferência, como sempre — o que muda
  é só o movimento que carrega a jogabilidade.
- **Aviso de erro.** Errar sacode a arena e acende uma vinheta vermelha nas bordas. Duas
  decisões deliberadas aqui. A vinheta é **de borda, não de tela cheia**: o critério de três
  flashes por segundo (WCAG 2.3.1, **nível A** — dentro do piso do projeto) mede área, e uma
  piscada que ocupasse mais de 25% do campo visual viraria estrobo se alguém martelasse o espaço.
  E a **tremida vale para todo mundo, inclusive sob `prefers-reduced-motion`** — decisão explícita
  do dono, tomada depois de ver os dois lados lado a lado e com o custo dito: sacudir a tela é o
  exemplo canônico de gatilho vestibular, e quem liga a preferência costuma ligar por isso. Não
  fere o piso AA do projeto, porque o critério que trata de animação por interação (2.3.3) é AAA.
  Se um dia doer, o botão é a amplitude nos keyframes, não a media query.

  Detalhe que quase passou: `global.css:202` zera a duração de **toda** animação sob a
  preferência (seletor `*`, `!important`). Sem furar aquele reset, tanto a vinheta quanto a
  tremida rodariam por 0,01ms — e o aviso de erro ficava **invisível** justamente para quem tem
  a preferência ligada. Verificar o nome da animação não pega isso; só a duração pega.
- **Modo garantido.** Uma opção que garante a captura, mais lenta. O próprio Dredge tem isso.
- **Cor não pode ser o único sinal.** "Zona verde" é informação só por cor e falha o critério
  AA de uso de cor. A zona ativa muda também de **forma e espessura**.
- **Leitor de tela.** Uma live region anuncia o resultado: "fisgou: tainha, 32 cm".
- **Contraste.** As zonas passam AA contra o fundo **nos dois turnos**, verificadas com
  composição alpha correta.

## Testes

**Motor é função pura, casca é burra.** Dado o estado do minigame e o instante do aperto, o
próximo estado é determinístico. A assinatura real do TRAJETO, por exemplo:

```ts
pressTrack(params: TrackParams, state: TrackState, tMs: number) → TrackState
```

Os outros dois motores seguem a mesma forma (`stepHold`, `stepDodge`), cada um com o `params` e
o `state` da própria mecânica. `TrackState.done` (e o equivalente nos outros dois) é que carrega
o par `{ caught: boolean; quality: number }` quando o lance termina.

Isso roda em `vitest`, que já está no projeto. Cobre janela de acerto, alternância de zonas,
taxa de dreno, contagem de batidas, sem navegador e sem flake. A casca visual só desenha o que
a função pura disser.

**O que não se automatiza é o que importa:** se é gostoso. Isso é o dono jogando dez lances,
com o critério declarado antes.

## Restrições herdadas que se aplicam

- Paridade trilíngue **vinculante**.
- WCAG AA como piso **vinculante**.
- Zero terceiros invasivos.
- Tema claro é o padrão, sem detecção de preferência do sistema.
- Espaçamento na grade de 4px, tipografia na rampa de onze degraus, medida de 60ch
  (DESIGN.md).
- Regra do Turno: todo par cor/uso declarado duas vezes, uma por tema. O jogo desenha com a
  tinta do turno.

## O que fica em aberto

- **O nome do jogo.** Não bloqueia o v1.
- **O bonequinho do rodapé.** Não existe ainda; entra quando existir.
- **Arte.** Retângulos coloridos por decisão, até a pergunta de diversão ser respondida.
- **Nomes e espécies dos peixes.** No v1 são placeholders; conteúdo real vem depois do sim.
