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
| 1 — raso, ensina | p1: zona de 36%, 3 acertos | p2: peixe calmo, carência longa | p3: 2 pistas, nunca perde, 3 limpas seguidas |
| 2 — meio | p4: zona de 30%, 3 acertos | p5: peixe errático | p6: 2 pistas, tolera 2 quedas |
| 3 — abissal, sem perdão | p7: zona de 25%, 3 acertos (ainda o mais fácil dos três motores) | p8: peixe arisco, carência curta | p9: 3 pistas, tolera 1 queda |

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

**Este é o minigame de boa.** Por decisão do dono, o TRAJETO é simples e fácil **inclusive no
abissal** — é o descanso entre os outros dois. A dificuldade sobe só encolhendo a zona
(36% / 30% / 25% da barra), com a velocidade quase parada.

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

O indicador ocupa uma pista; os anéis giram e **cada anel é desenhado quebrado**: onde um portão
fecha aquela pista, o trilho simplesmente acaba. Espaço troca de pista antes do vão. Cair no vão
é o dano.

**Não é acerto no tempo, é posicionamento sob pressão contínua.** É a habilidade genuinamente
diferente das três, e é o motor de peixe **brigão**.

**O vão tem largura, e é a mesma que a tela desenha.** Isto revoga o texto original desta seção,
que dizia "não um tamanho de brecha: o portão é um ponto, a brecha é a pista aberta". O portão
virou intervalo (`gapWidth`, fração da volta) por dois motivos: um buraco no anel só se desenha
se tiver largura, e julgar por ponto enquanto se desenha um buraco recria a discordância entre o
que se vê e o que se julga que esta spec proíbe em todo o resto. Trocar de pista **dentro** do
vão cai, e isso é a regra, não um efeito colateral.

**Fisga com passagens limpas seguidas, não com voltas sobrevividas.** `cleanToCatch` (3) passagens
limpas em sequência fisgam; cair **zera** a sequência. Isto substitui `lapsToCatch`, e existe por
um defeito medido: com a regra de voltas, ficar **parado sem tocar em nada** pescava o p3 com
47cm de um máximo de 58 — o peixe que existe para ensinar premiava não aprender. Como toda pista
quebra em algum portão, nenhuma sequência de três limpas sai sem trocar de rota: trocar virou
obrigatório em vez de opcional.

**A dificuldade da DRAGAGEM é a velocidade da volta.** `periodMs` encurta por faixa (4200 / 3000 /
2200), o que encolhe a janela para decidir e agir. Contagem de pistas e tolerância acompanham,
mas o botão principal é a velocidade.

Parâmetros: período da volta (`periodMs`), número de pistas, portões (posição no anel e quais
pistas abrem ali), largura do vão (`gapWidth`), limpas seguidas para fisgar (`cleanToCatch`),
quedas toleradas (`bumpsAllowed`).

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
- **`prefers-reduced-motion`:** TRAJETO e DRAGAGEM avançam em **passos discretos** em vez de
  deslizar, mesma cadência e mesma decisão. No SUSTENTAÇÃO o peixe salta entre posições e **a
  faixa não muda** — ela é a mão do jogador, e controle direto não é animação automática.
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
