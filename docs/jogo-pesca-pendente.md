# Jogo de pesca — o que falta

Estado em 31/08/2026, depois do PR #5 e da página de vitrine. O jogo está
jogável e no ar nos três idiomas. O que segue é o que ficou por fazer, com o
motivo de cada coisa ainda estar aberta.

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
referenciando sempre a última folha aprovada — o pipeline está em
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

`.shop-mark` é um quadrado de 10×10 que marca a seleção. Com ícone por item, a
lista para de parecer formulário. Item pequeno.

### O pescador no tema escuro

Ele é a única exceção declarada à Regra do Turno, e continua quente sobre o
fundo de fósforo, com o cabelo escuro perdendo contorno contra `#0a0f0c`. O
custo está aceito e escrito na spec. Uma segunda folha em paleta fria custaria
uns 2,8 KB, se a decisão mudar depois de conviver com ele.

## Página de vitrine — feita

Quatro prints capturados do jogo a correr, grade 2×2, e o texto do dono nos
três idiomas. O caderno saiu da página e ficou só dentro do jogo.

O texto assume o método sem meias palavras, incluindo dizer que o jogo é
completamente vibe codado. Uma afirmação do rascunho ficou de fora por não ser
verdade, a de que as imagens usaram a lib `sprite-gen`. Ela foi avaliada nesta
mesma sessão e descartada por ser feita para personagem com estados, e nada
dela entrou no projeto.

**Falta o quinto print, o da revelação da fisgada.** Ele mostra o retângulo de
placeholder no lugar do peixe, então só entra depois de os peixes terem arte.

## Defeitos pequenos, achados depois

**O rótulo "Loja aqui" corta ao meio.** Quando o barco navega para longe e a
loja sai da moldura, o rótulo acompanha e fica cortado no meio da palavra na
borda esquerda. Ele devia esconder-se quando o próprio alvo sai de vista.

**A venda é proporcionalmente maior no telefone.** Ocupa 56% da altura da cena
a 375px, contra 45% no desktop. Vem de a escala dela ser a dos outros sprites
mais um, e esse "mais um" pesar mais quando a escala base é 1. A correção
óbvia seria escala não-inteira, que borra o pixel e trocaria um desconforto
por um defeito.

## Dívida técnica

### Cinco `font-size` fora da rampa

`WorldView.css` tem `0.62rem` e `0.8rem`; `fishing.css` tem `0.66`, `0.68` e
`0.7rem`. Todos anteriores ao trabalho de arte. O detector sinaliza a cada
build.

Resolver é decidir o `DESIGN.md`: ou os valores caem na rampa de onze degraus,
ou a rampa ganha degraus novos. É decisão de sistema de design, não limpeza de
detector, e por isso merece tarefa própria.

### Sprites embutidos como data URI

O Vite embute PNG abaixo do limite de inline direto no CSS. Funciona bem com
os três assets de hoje e poupa requisições. Com os 24 peixes a folha de estilo
incha, e aí vale passar do inline para arquivo servido.

## O que é placeholder de propósito

Para ninguém "consertar" por engano:

- **Os três minigames** (trilha, faixa, anéis) são instrumentos, não cenário.
  Arte ali atrapalha a leitura do que o jogador precisa acompanhar.
- **O vulto na espera** é elipse justamente para não entregar a espécie. A
  revelação pertence ao `CatchView`, que foi construído em cima dela.
