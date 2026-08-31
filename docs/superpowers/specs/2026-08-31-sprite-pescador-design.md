# Sprite do pescador — design

> Primeiro dos quatro subsistemas de arte do jogo de pesca. Os outros três
> (cenário com parallax, os 24 peixes, a loja) ficam de fora e ganham spec
> própria.

## Por que agora

O mundo do jogo é blockout: o barco é uma `div` com borda de 2px, o jogador não
existe, e o lance vai direto de `idle` para o minigame. O jogo já se joga — o que
falta é ele parecer um jogo.

O jogador e o barco vêm primeiro por duas razões. É o que mais muda a sensação de
jogar, e é o único dos quatro que exige mudança de código e não só arte: a
sequência de lançamento precisa de uma fase que hoje não existe. Descobrir esse
risco cedo vale mais do que entregar 24 peixes bonitos em cima de uma máquina de
estados que não os comporta.

## Escopo

**Entra:** a folha de sprites do jogador com o barco, a fase `casting`, o vulto do
peixe durante a espera, e a escala em degraus que a pixel art exige.

**Não entra:** os 24 peixes, o cenário e o parallax, a loja, e separar o barco do
jogador em dois assets.

## Decisões, e o que as sustenta

### Pixel art em grade de 64, não vetor

A primeira prova de estilo foi vetor com oito papéis de cor em tokens CSS, o que
resolvia o tema de graça e animava por `transform` sem folha de sprites. O
resultado foi rejeitado: ficou num limbo entre pixel art e ilustração, e a 45px o
óculos — traço que mais identifica o personagem — não lia.

A pixel art de verdade, em grade de 64 com dez cores sólidas, resolveu a
legibilidade. E derrubou o argumento de peso que sustentava o vetor: a folha de
quatro quadros tem **2.779 bytes**, contra 4.564 do SVG de um único quadro
estático.

### Uma folha só nos dois temas — exceção declarada à Regra do Turno

O projeto exige que todo par cor/uso seja declarado duas vezes, uma em `.light` e
outra em `.dark`. Um PNG não obedece a isso.

A decisão é **não** produzir uma segunda folha em paleta de fósforo. O argumento:
o pescador é uma pessoa, não cromo de interface. Quem muda de turno é o site em
volta dele, não ele dentro do barco.

Isto é uma exceção consciente, e fica registrada aqui para que a próxima pessoa a
ler o CSS não a tome por descuido. O custo aceito é que no tema escuro o
personagem fica quente demais para o mundo de fósforo verde e o cabelo escuro
perde contorno contra o fundo `#0a0f0c`.

### O quadro vem da fase, nunca de um keyframe

A prova de estilo animou por `@keyframes` com `step-end`, e funcionou porque lá o
tempo era fixo. No jogo não é: `castDuration(rng)` sorteia entre 1000 e 2000ms a
cada lance, e o CSS não tem como saber esse número.

Portanto a vista lê a fase e escreve `data-frame`; o CSS só traduz índice em
`background-position`. A lógica de tempo fica no módulo puro, testável.

### Escala só em múltiplos inteiros

`.world-boat` hoje é `height: 17%` — fluido. Pixel art só fica nítida em múltiplos
inteiros do pixel de origem; a 1,5× o pixel cai entre a grade e borra, destruindo
exatamente o que faz a técnica funcionar.

O barco passa a ter altura fixa em degraus, em vez de percentagem contínua: 64px
(1×) abaixo de 900px de viewport, 128px (2×) daí para cima. A cena continua
`16/7` e fluida; só o sprite deixa de escalar junto.

### `prefers-reduced-motion` mantém a animação do lançamento

A preferência existe para evitar movimento grande varrendo a tela, que causa
enjoo. Um personagem de 64px levantando e jogando uma linha não é isso, e é
conteúdo do jogo, não decoração.

O que continua respeitando a preferência é o de campo largo: o parallax do
cenário, e o clarão, os raios e a aura do `CatchView`, que piscam em tela cheia.

## A máquina de estados

Hoje `Phase` tem três estados e o peixe já é sorteado no lançamento. Entra um
quarto, entre o lance e a luta:

```ts
type Phase =
  | { kind: 'idle' }
  | { kind: 'casting'; fish: Fish; luck: number; ms: number }   // nova
  | { kind: 'playing'; fish: Fish; luck: number }
  | { kind: 'result'; fish: Fish; result: Resultado; size: number }
```

Como o peixe já está decidido quando o vulto aparece, o vulto pode ser honesto: o
tamanho dele deriva da espécie sorteada, e um lendário lança uma sombra maior.
Não é blefe — é informação real chegando antes do nome.

### `cast.ts`, módulo puro

Mesmo padrão dos três motores: lógica sem DOM, sem tempo real e sem
aleatoriedade não-injetada, testada no vitest em ambiente `node`.

| Função | Contrato |
|---|---|
| `castDuration(rng: () => number): number` | Sorteia a espera em 1000–2000ms. Um valor fixo fica mecânico e se percebe no terceiro lance. |
| `shadowScale(fish: Fish): number` | Devolve o multiplicador do vulto a partir de `fish.sizeMax`, na faixa de 0,6 a 1,6. Monotônico: peixe maior, sombra maior, sem exceção. |
| `frameAt(elapsed: number, total: number): 1 \| 2` | Traduz tempo decorrido em índice de quadro dentro da espera. Nunca devolve 0, que é a fase `idle`, nem 3, que pertence à transição para `playing`. |

A troca do quadro 1 para o 2 acontece aos 300ms, um valor fixo: é o gesto de
levantar, que não tem por que variar com a sorte do lance.

### Mapa de fase para quadro

| Estado | Quadro | O que se vê |
|---|---|---|
| `idle` | 0 | Sentado, vara apoiada |
| `casting`, primeiros ~300ms | 1 | Levantando |
| `casting`, o resto da espera | 2 | Lançou; o vulto se aproxima na água |
| Entrada em `playing` | 3 | Fisgou, vara curvada por cima da cabeça |

### Comportamentos

**Esc cancela e não pune.** Durante `casting`, Esc volta para `idle` e o peixe
sorteado é descartado. Segue a regra que o arquivo já tem — "Esc fecha o que está
por cima primeiro" — e não cria uma armadilha onde desistir custa um peixe.

**O foco volta para o botão de lançar.** Já é o comportamento na saída do
resultado; `casting` herda. Durante a espera o botão fica desabilitado, senão dá
para lançar duas vezes.

## O asset

`src/islands/fishing/art/pescador.png` — 256×64, quatro quadros de 64×64, dez
cores sólidas, alfa binário, 2.779 bytes.

Renderizado numa `div` com `background-image`, `image-rendering: pixelated`,
`background-size` de `calc(256px * var(--s))` e `background-position` em múltiplos
exatos de 64 vezes a escala. O `data-frame` no elemento escolhe a posição.

O vulto do peixe é um segundo asset em `src/islands/fishing/art/vulto.png`, ainda
por produzir: uma silhueta genérica de peixe, de uma cor só mais alfa, que serve a
todas as espécies e é escalada por `shadowScale`. Ele não revela a espécie — a
revelação pertence ao `CatchView`, que foi construído em cima dela.

Por ser silhueta chapada, o vulto é o único asset do jogo que pode ser recolorido
por tema com `mask-image` sobre um token de cor, se isso vier a ser desejado.

### Como o asset é gerado

Registrado porque a segunda tentativa falhou e a causa não é óbvia.

1. A referência sai do `image_gen` via `codex exec`, com a foto do dono anexada
   por `-i`.
2. A folha nova é gerada **sempre a partir da última folha aprovada**, nunca de um
   quadro isolado. A tentativa que usou o sprite avulso como referência voltou com
   caixa preta opaca atrás de cada quadro (12% de pixels transparentes, contra 76%
   da folha boa), o personagem encolhido e o barco achatado numa tábua.
3. A saída é reduzida à grade real com vizinho-mais-próximo e quantizada, porque o
   `image_gen` produz pixel art *falsa*: grande, com pixels que não caem numa
   grade.
4. Verificação antes de aceitar: proporção exata, percentagem de pixels
   transparentes próxima da folha anterior, e contagem de cores dentro do teto.

## Acessibilidade

O sprite é decoração pura e entra com `aria-hidden`. O estado do jogo já está no
texto: a profundidade no HUD, o nome e o tamanho da espécie no `CatchView`, e a
região viva anuncia a captura. Nenhuma informação nova passa a depender de
imagem, e portanto nada de novo se perde sem ela.

Contraste não se aplica ao sprite, que não carrega texto. O que continua valendo é
o piso WCAG AA de todo o resto da interface em volta.

## Testes

**Vitest, ambiente `node`:** `cast.test.ts` cobre `castDuration` dentro da faixa
com rng injetado, `shadowScale` monotônico em relação a `sizeMax`, e `frameAt`
nas fronteiras — início, troca de quadro, e fim da espera.

Não existe jsdom no projeto: nenhum teste toca `document` ou `window`.

**Na mão:** a sequência completa nos dois temas; Esc durante `casting` voltando a
`idle` com o foco no botão; o barco nítido em 1× e 2×; e a página do jogo dentro
do orçamento de JS depois da mudança.

## Defeitos conhecidos da arte

Não bloqueiam a implementação. Ficam para uma rodada de arte depois.

1. **No quarto quadro o rosto some.** Os braços erguidos e a vara curvada passam
   por cima da cabeça, e o óculos quase não lê — perde o personagem justo no
   quadro mais dramático.
2. **A linha desce abaixo do casco.** Nos quadros 3 e 4 a linha e o flutuador saem
   por baixo da base do barco, o que estica a caixa do sprite e desalinha a base
   quando ele for posicionado na água.
3. **No escuro o cabelo perde contorno**, consequência aceita da folha única.

## Fora de escopo

Os 24 peixes, o cenário com parallax e a loja seguem em specs próprias. Separar o
barco do jogador em dois assets só se justifica se o barco precisar balançar
independente, ou o jogador existir sem barco — nenhum dos dois é requisito hoje.
