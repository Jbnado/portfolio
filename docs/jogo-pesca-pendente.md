# Jogo de pesca — o que falta

Estado em 31/08/2026, depois do merge do PR #5. O jogo está jogável e no ar
nos três idiomas. O que segue aqui é o que ficou por fazer, com o motivo de
cada coisa ainda estar aberta.

Não é uma lista de bugs. Nada aqui impede o jogo de funcionar.

## Arte

### Os 24 peixes — o buraco grande

As espécies ainda são bloco de cor. Aparecem em dois lugares:

- `.catch-pic` na revelação da fisgada, 84×56, hoje `background: var(--catch-fish)`
- `.fishing-menu-pic` no caderno, célula quadrada que mostra `???` ou vazio

O caderno é uma pokédex de 24 espécies brasileiras em que nenhuma tem cara. É
ali que a coleção deixa de valer a pena, e é por isso que este item vem antes
dos outros.

A 600 bytes por sprite, os 24 dão uns 15 KB. Gerar em folhas de seis,
referenciando sempre a última folha aprovada — ver o pipeline em
`superpowers/specs/2026-08-31-sprite-pescador-design.md`.

**Decisão em aberto antes de gerar:** uma versão ou duas. Os peixes aparecem
sobre *cromo de interface* (o véu da revelação e o painel do caderno), não
dentro do lago. Então herdam a mesma tensão do pescador: peixe quente sobre
painel de fósforo. Decidir antes de gerar 24, não depois.

### O céu

Degradê liso, sem sol, sem lua, sem nuvem. É a mesma técnica da mata: faixa
que ladrilha na horizontal, dia e noite empilhados na mesma folha. Barato, e
muda bastante o clima da cena.

### O painel da loja

`.shop-mark` é um quadrado de 10×10 que marca a seleção. Com ícone por item,
a lista para de parecer formulário. Item pequeno.

### O pescador no tema escuro

Ele é a única exceção declarada à Regra do Turno, e continua quente sobre o
fundo de fósforo, com o cabelo escuro perdendo contorno contra `#0a0f0c`. O
custo está aceito e escrito na spec. Uma segunda folha em paleta fria custaria
uns 2,8 KB, se a decisão mudar depois de conviver com ele.

## Página

A página de vitrine no formato itch.io. Em andamento: prints capturados do
jogo real, o que é, como foi feito, ficha técnica. O caderno sai da página e
fica só dentro do jogo.

O texto ainda vai ser revisto pelo dono. O enquadramento acordado é motivação
boba por fora e método sério por dentro: abre pela verdade (fissurado em jogo
de pesca, Dredge e Dave the Diver) e sustenta o método com artefato commitado,
nunca com adjetivo.

## Dívida técnica

### Cinco `font-size` fora da rampa

`WorldView.css` tem `0.62rem` e `0.8rem`; `fishing.css` tem `0.66`, `0.68` e
`0.7rem`. Todos anteriores ao trabalho de arte. O detector sinaliza a cada
build.

Resolver é decidir o `DESIGN.md`: ou os valores caem na rampa de onze degraus,
ou a rampa ganha degraus novos. É decisão de sistema de design, não limpeza de
detector, e por isso merece tarefa própria.

### Sprites embutidos como data URI

O Vite embute PNG abaixo do limite de inline direto no CSS. Funciona bem hoje,
com três assets, e poupa requisições. Com os 24 peixes a folha de estilo
incha, e aí vale passar do inline para arquivo servido.

## O que é placeholder de propósito

Para ninguém "consertar" por engano:

- **Os três minigames** (trilha, faixa, anéis) são instrumentos, não cenário.
  Arte ali atrapalha a leitura do que o jogador precisa acompanhar.
- **O vulto na espera** é elipse justamente para não entregar a espécie. A
  revelação pertence ao `CatchView`, que foi construído em cima dela.
