---
slug: "gather-bots"
locale: "pt-br"
title: "gather-bots"
summary: "Alimenta os Smart Objects do Gather com o trabalho de verdade. PR esperando review, pipeline vermelha, tarefa em andamento e reunião prestes a começar, na mesa do escritório virtual. Projeto meu, open source sob MIT, ports and adapters do começo ao fim."
highlights:
  - { value: "0 req", label: "o que custa um minuto sem novidade" }
  - { value: "130", label: "casos de teste, domínio puro sem rede" }
  - { value: "~1 MB", label: "o que a imagem acrescenta ao node:24-alpine" }
meta:
  - { label: "PAPEL", value: "Desenvolvedor (solo)" }
  - { label: "TIPO", value: "Projeto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "TypeScript · Node 24 · Docker" }
---

No Gather, o escritório virtual, cada pessoa tem uma mesa. Dá pra decorar com objetos, e alguns deles são Smart Objects, que aceitam comando por webhook. Na prática, quase todo mundo usa como enfeite.

Saber o que espera por mim, num dia normal, exige abrir quatro ferramentas. PR pedindo review numa, pipeline vermelha noutra, tarefa em andamento numa terceira, reunião começando em dez minutos na quarta. Nenhuma conversa com as outras, e a mesa fica ali sem fazer nada.

O gather-bots liga uma coisa na outra. Três objetos, e cada um responde uma pergunta.

```
INBOX          [8]  o que espera por mim
                    PR #101 · corrige cálculo de frete
                    Bug · Doing · arredondamento nas notas

BOT STATUS   alert   o que roda sem mim
                    svc-orders · main   ← pipeline vermelha

LIGHTBULB      off   pode me interromper?
                    "Em reunião: Weekly"
```

Nada que você não configurar roda. Um objeto e uma integração já é um sistema útil, e o que não estiver configurado fica quieto, desligado.

## Ports and adapters, e por que não é enfeite

O núcleo não conhece Azure DevOps, Google, Microsoft, nem o próprio Gather. Isso costuma soar como arquitetura por arquitetura, então vale dizer o que ele compra na prática. Três coisas se acrescentam sem tocar no meio.

Uma fonte nova, tipo Jira, GitHub, Linear ou PagerDuty, implementa uma porta e ganha uma linha num registro. Uma superfície nova é uma função pura de sinais pra estado do objeto. E um destino que não é o Gather implementa a outra porta, e todo o resto continua funcionando, seja uma lâmpada Philips Hue, um status no Slack ou uma fita de LED na parede.

A decisão que mais rendeu foi separar quem reporta de quem apresenta. A fonte reporta o fato e não carrega roteamento, então ela nunca decide que uma coisa "vai no Inbox". Se decidisse, a decisão de produto vazaria pro adaptador, e mudar o significado de um objeto exigiria mexer em todas as fontes. Como Google e Outlook emitem exatamente o mesmo tipo de sinal, o segundo provedor de agenda não custou nada nas superfícies, e os dois podem rodar juntos.

## O diff que mantém o custo em zero

O rate limit do Gather é por space, não por objeto. Isso muda tudo, porque cada comando é um POST e o SDK não agrupa. Três objetos com vinte itens cada, a cada minuto, abusariam do limite do space inteiro, e o space é compartilhado com o resto da empresa.

O despachante calcula o estado desejado, compara com o último que ele enviou e emite só a diferença. Em regime estável, um minuto sem novidade custa zero requisições. O primeiro boot é a exceção, e manda tudo espaçado em vez de em rajada.

## As coisas que mordem

É aqui que mora o trabalho de verdade, e o README tem uma seção com esse nome.

`activity.clear` é proibido no código. Um objeto carrega entradas de várias fontes ao mesmo tempo, e limpar apagaria as das outras. Não confiei em disciplina pra isso, então o tipo `Command` omite o evento e o compilador recusa antes de eu conseguir escrever a chamada.

Integração fora do ar não apaga o seu feed. O último resultado bom vale por até quinze minutos, e depois disso os itens somem, porque reunião que acabou há uma hora é pior do que reunião nenhuma. Mas se todas as fontes falham de uma vez, nada é escrito, porque isso é queda de rede e não o seu dia inteiro esvaziando ao mesmo tempo.

O feed mostra no máximo quinze itens, e acima disso entra uma linha de "mais N outros". O contador continua mostrando o total real. Badge de vinte e três sobre um feed de quinze é interface que mente, e interface que mente sobre volume de trabalho é pior do que interface nenhuma.

E tem o limite que não é técnico. O feed é visível pra todos os Members e Guests do space, o que define o teto do que pode entrar ali. Título de PR e de tarefa é o limite. Corpo de PR e nome de cliente não entram.

## O checkup

`pnpm checkup` funciona antes de você configurar qualquer coisa, e esse é justamente o objetivo. Ele nunca falha por falta de configuração, só diz o que está faltando e qual variável ligaria aquilo.

Cada objeto e cada integração cai em três estados. Funcionando, não configurado, ou configurado e quebrado. Só o terceiro merece atenção, e essa distinção é a diferença entre um diagnóstico e uma parede de vermelho que você aprende a ignorar.

## O design doc veio antes

Este projeto saiu em dois dias, com agentes escrevendo o código, e a prova de que isso não foi improviso está commitada. O documento de desenho foi escrito antes de existir uma linha, com as decisões numeradas de D1 a D7, e os commits saíram na ordem da sequência de build que ele define.

Antes das decisões, o documento tem uma seção de restrições descobertas, lida da documentação do SDK. Autenticação por Standard Webhooks, o par de URL e segredo sendo por objeto, a tabela de quais capabilities cada preset tem, os limites de tamanho de cada campo, e o rate limit por space. Metade das decisões de desenho caiu direto dessa tabela.

O documento também registra uma coisa que eu gosto mais do que as decisões, que é onde ele me obrigou a parar e ir olhar. A documentação de suporte do Gather descreve a lâmpada mudando entre verde, amarelo e vermelho. Fui conferir contra o space de verdade e o comportamento não bate. Nem o SDK nem a referência expõem qualquer campo, evento ou capability que defina cor, porque a aparência é decisão de renderização do Gather e a API só escolhe estado. A consequência é que a distinção entre produção e develop foi morar no objeto de status, e não numa lâmpada colorida que eu teria descoberto que não existia depois de construir em cima dela.

É isso que eu acho que muda quando se constrói com agentes. A IA escreve muito mais rápido do que eu, e o que decide o resultado é quantas dessas perguntas foram respondidas antes de começar.

O que sustenta depois é o teste. São 130 casos, e as superfícies são funções puras de sinais pra estado, testadas sem rede nenhuma. O adaptador do Gather tem um par falso pra suíte poder rodar sem POSTar num space de verdade.

## Onde está hoje

Público no GitHub sob MIT, com CI passando em Linux, Windows e macOS. Roda como container, como serviço systemd de usuário sem root, ou como tarefa agendada no Windows. A imagem é construída em dois estágios e não carrega TypeScript nem tsx, então as camadas que o projeto acrescenta somam cerca de 1 MB sobre o `node:24-alpine`, com memória limitada a 128 MB. Monitor que atrapalha a máquina que ele monitora falhou no trabalho dele.
