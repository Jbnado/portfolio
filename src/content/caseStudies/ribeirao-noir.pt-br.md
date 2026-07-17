---
slug: "ribeirao-noir"
locale: "pt-br"
title: "Ribeirão Noir"
summary: "Jogo investigativo noir nos anos 1950 de Ribeirão Preto, protagonizado por Dandara, como ferramenta de educação antirracista. Cuidei de todo o desenvolvimento em Godot, do motor de narrativa orientado a dados ao sistema de dados e save, com arquitetura SOLID. Validado por três doutores e lançado na Feira Internacional do Livro."
highlights:
  - { value: "9", label: "locais de Ribeirão investigáveis" }
  - { value: "6", label: "finais decididos pelas provas" }
  - { value: "3", label: "doutores validaram · USP, Metodista, UFTM" }
meta:
  - { label: "PAPEL", value: "Desenvolvedor (solo)" }
  - { label: "TIPO", value: "Projeto" }
  - { label: "PERÍODO", value: "2025" }
  - { label: "STACK", value: "Godot · GDScript" }
---

A protagonista do jogo é a Dandara. Uma investigadora negra, nos anos 1950 de Ribeirão Preto, atrás de quem roubou a estátua de São Sebastião pra libertar um inocente. E ela não está ali por acaso. O Ribeirão Noir é um jogo de educação antirracista, pensado pra ajudar a escola a cumprir as leis 10.639 e 11.645, que tornaram obrigatório o ensino de história e cultura afro-brasileira e indígena. Colocar uma mulher negra como protagonista, com agência histórica, num país onde os dados do IBGE mostram que pessoas negras são 87,8% das mortes por intervenção policial, não é detalhe de roteiro. É o ponto do jogo.

O Ribeirão Noir foi feito por um time. A narrativa, a arte e o design vieram do Ramon e da produção da Palimpsesto Produções. Eu cuidei do desenvolvimento, então é da engenharia por trás do jogo que eu falo aqui, o motor que interpreta a narrativa, o sistema de dados, o save, a arquitetura. Foram seis meses, financiados pela Lei Paulo Gustavo, e o trabalho virou meu TCC, sobre aplicar SOLID e padrões de projeto num jogo que carrega peso social.

## O jogo é uma investigação de verdade

Ribeirão Noir é um RPG narrativo em texto. Você escolhe uma de três profissões, detetive, jornalista ou advogada, e cada uma abre um jeito diferente de investigar. Anda por nove locais da Ribeirão Preto dos anos 50, boa parte deles históricos de verdade, como o Theatro Pedro II, a Praça XV, o Palacete Camilo de Mattos e a Choperia Pinguim, cada um com a sua própria história em vez de cenário genérico. Conversa com 32 personagens, junta pistas, e no fim aponta o culpado. São seis finais possíveis, e qual você chega depende das provas que conseguiu reunir no caminho.

O que dá liga a tudo isso é o sistema por baixo, e ele tem três peças que valem contar. Como a narrativa é feita de dado e não de código, como o risco de cada escolha se resolve no dado, e como o jogo lembra de tudo que você fez.

## A narrativa é dado, não código

Se eu tivesse escrito a história dentro do código, o Ramon não conseguiria escrever nem mudar nada sem me chamar, e eu ia virar gargalo do projeto inteiro. Então a narrativa toda mora em JSON. São 17 arquivos, quase 27 mil linhas, um por ato e por local, e o código só interpreta.

Cada arquivo é um grafo de nós. Um nó carrega as falas daquele momento, as opções de escolha (cada uma apontando pro próximo nó, algumas com uma condição pra aparecer), um bloco de rolagem de dado e os resultados possíveis, separados por sucesso total, sucesso parcial e fracasso.

O interpretador carrega o arquivo do ato, começa pelo nó inicial e vai desenhando cada fala, cada escolha e cada rolagem, seguindo os links de um nó pro outro. Quando você escolhe uma opção, um motor de efeitos aplica os modificadores daquele nó, que tiram ou dão vida, ajustam uma postura, liberam um local novo, entregam uma pista ou apresentam um personagem. Adicionar uma mecânica nova, uma profissão, um item, um comportamento, é escrever no JSON, não mexer no núcleo. Assim o jogo cresce sem o time virar refém do código.

## Dado, postura e risco

O coração do RPG é a rolagem. São dois dados de seis, e o resultado não é só sorte. À soma dos dois dados entram vários modificadores, e o total cai em uma de três faixas, sucesso total, sucesso parcial ou fracasso.

A parte que eu acho elegante é como a postura entra nessa conta. Suas escolhas vão te definindo nas quatro posturas, temerário, sábio, prudente e evasivo, e cada rolagem cobra uma delas. Numa checagem sábia, é a sua postura sábia que pesa no dado. Ou seja, quem você decidiu ser muda o que você consegue fazer. E os modificadores só contam se você realmente os tem. A habilidade só entra se bater com a sua profissão, o item só entra se você o carrega, o personagem só entra se você o conhece.

A vida amarra o risco. Você começa com 10 de vida, e pode rolar de novo quando erra, mas cada nova tentativa custa 1 de vida, e trava quando você chega perto de zero. Insistir tem preço. Chegar a zero abre o final de game over. É um sistema simples de enunciar e que gera tensão real na hora de decidir se você arrisca mais uma.

## O save é um transcript, não um checkpoint

A maioria dos jogos salva um ponto de retorno. O Ribeirão Noir salva a partida inteira, jogada por jogada. Em JSON, no disco, ele guarda três coisas, a ficha da Dandara, a posição atual na narrativa, e o histórico completo do que aconteceu.

A ficha guarda exatamente o que importa. Vida, profissão, as quatro posturas, quais pistas você achou e onde, os locais visitados e liberados, itens, e as pessoas que você conheceu. Mas o pulo do gato é o histórico. Ele é uma lista de momentos narrativos, e cada momento guarda os balões de diálogo com o tipo certo (fala da heroína, pensamento, personagem, narrador, rolagem). Quando você recarrega, o jogo não te joga num ponto seco. Ele reconstrói na tela cada balão que você já tinha visto, o rolê inteiro da investigação. E ele salva de forma contínua, a cada linha renderizada, então não tem como perder progresso.

## SOLID, com uma cicatriz honesta

A arquitetura foi o foco do TCC, com a ideia de aplicar SOLID de verdade, não de enfeite. Um autoload central segura o estado do jogo, mas não salva nada sozinho. Ele delega pra uma classe de save, que delega pra uma de histórico, que delega pros momentos narrativos. Cada uma cuida de uma coisa só. A comunicação entre as telas passa por um barramento global de sinais, onde quem emite e quem escuta nunca se conhecem. Quando a Dandara toma dano, o personagem emite um sinal, e a barra de vida, o game over e o aviso na tela reagem sozinhos, sem ninguém chamar ninguém. A interface é composta, não herdada. As telas de item, personagem e caderneta são componentes montados e conectados na hora, não subclasses de uma árvore gigante.

E aqui vem a parte honesta, documentada no TCC em vez de escondida. A cena principal, a que interpreta os atos, passou de mil linhas. Ela acumula responsabilidades que, no mundo ideal, estariam em classes separadas. Foi uma escolha consciente de prazo. Distribuir tudo direitinho teria consumido um tempo que eu não tinha pra entregar o jogo em seis meses. Fica funcionando, mas é uma violação de responsabilidade única, e eu prefiro chamar de cicatriz do que fingir que não existe. Foi o aprendizado mais real do projeto. Na vida profissional você equilibra a arquitetura ideal com prazo, orçamento e o que dá pra entregar.

## Os detalhes de ofício

Fora o núcleo, teve cuidado com a experiência. O jogo exporta pra web e Android, com o layout se adaptando ao touch e ao retrato do celular. E a acessibilidade é um sistema de verdade, não um botão solto, com uma escala de fonte que se propaga por um sinal pra cada widget da tela, e legendas para as pistas em áudio.

## O time, o feito e a validação

Um jogo de educação antirracista só vira ferramenta de verdade se pessoas que entendem do assunto disserem que ele funciona. Três doutores avaliaram e recomendaram: Sérgio de Souza, pós-doutor em Sociologia da Educação na USP, que o reconheceu como instrumento de educação antirracista; José Lages, doutor pela Metodista, que o validou como educação patrimonial, por ressignificar os pontos históricos reais de Ribeirão; e Marcelo Silva, doutor em História Social e professor da licenciatura em História da UFTM, que mapeou o jogo às competências da BNCC do 9º ano e cunhou a ideia de "mundos epistêmicos", ambientes onde o jogador simula papéis sociais e internaliza formas de pensar próprias daquele contexto. Junto do jogo saiu um material pedagógico, "Racismo e Misoginia em Jogo: o que Dandara nos ensina?", porque, como a gente reconheceu, jogar sozinho não garante impacto sem mediação em sala.

O jogo foi lançado na Feira Internacional do Livro, é gratuito, e leva a tag "No AI", sem arte nem texto gerado por IA.

Eu comecei a programar porque amava jogos e queria entender como eram feitos. Ajudar a fazer um que serve pra alguma coisa foi melhor do que eu esperava. Como o material pedagógico coloca, a ideia não é "jogar e aprender", é jogar, refletir e debater, pra que a tecnologia sirva a fins de libertação e transformação social.
