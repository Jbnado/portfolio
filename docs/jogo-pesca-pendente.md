# Jogo de pesca — o que falta

Estado em 31/08/2026, depois do PR #5, da página de vitrine e da arte dos
peixes. O jogo está jogável e no ar nos três idiomas. O que segue é o que ficou por fazer, com o
motivo de cada coisa ainda estar aberta.

Não é uma lista de bugs. Nada aqui impede o jogo de funcionar.

## Arte

### Os 24 peixes — feito

As espécies têm cara. A folha é `src/islands/fishing/art/peixes.png`, 384×256,
seis colunas por quatro linhas de células de 64, e pesa 17,7 KB para os
vinte e quatro. Ela aparece em dois sítios:

- `.catch-pic` na revelação da fisgada, 128 no computador e 64 no telefone,
  com a cor da espécie por trás a atravessar os pixels transparentes
- `.fishing-menu-pic` no caderno, 128 na grade de três colunas e 64 na de duas

**A decisão de uma folha ou duas ficou em UMA.** Os peixes continuam quentes
sobre o painel de fósforo, pela mesma razão que o pescador: uma segunda folha
em paleta fria custaria outros 17 KB para resolver um desconforto que, olhado
no escuro, não aparece.

Cada peixe leva um campo `sprite` próprio em `fish.ts`, e não a posição na
tabela. O caderno guarda por id: se alguém reordenasse a tabela, cada espécie
passaria a mostrar o desenho de outra, sem erro nenhum a apontar o problema.

O desenho foi feito em quatro tiras de seis, pelo `codex`, com as descrições
pesquisadas em `docs/jogo-pesca-especies.md`. Duas ferramentas ficaram:

- `scripts/montar-peixes.mjs` recorta a imagem grande do gerador. Acha os
  peixes pela FORMA, não por fatia fixa, porque a cauda de um passa para o
  quadro do vizinho e lá aparece como caco solto.
- `scripts/check-peixes.mjs` conta ilhas de pixels opacos por célula. Um peixe
  inteiro é uma ilha só; duas querem dizer que a cauda saiu separada do corpo,
  defeito que a caixa delimitadora não apanha e que o olho quase não vê.

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

**O quinto print, o da revelação da fisgada, deixou de estar bloqueado** — o
peixe já tem desenho. Mas entrar com ele quebra a grade de quatro, que foi
pedida par de propósito. Ou substitui um dos quatro, ou vira grade de seis.
É escolha do dono, não arrumação.

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

O Vite embute PNG abaixo do limite direto no CSS. A folha dos peixes passou do
limite e já sai como arquivo servido, que era o receio. Sobra um sprite ainda
embutido na folha de estilo do jogo — pequeno, e sem custo que se note.

## O que é placeholder de propósito

Para ninguém "consertar" por engano:

- **Os três minigames** (trilha, faixa, anéis) são instrumentos, não cenário.
  Arte ali atrapalha a leitura do que o jogador precisa acompanhar.
- **O vulto na espera** é elipse justamente para não entregar a espécie. A
  revelação pertence ao `CatchView`, que foi construído em cima dela.
