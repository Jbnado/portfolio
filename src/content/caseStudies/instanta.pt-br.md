---
slug: "instanta"
locale: "pt-br"
title: "Instanta"
summary: "Feed colaborativo de fotos por evento, com mural ao vivo e telão no salão. Projeto meu, solo, edge-native na Cloudflare (Workers, D1, R2, Durable Objects), com uma pegada de segurança e arquitetura mais séria do que um app de festa pediria."
highlights:
  - { value: "edge", label: "Workers + D1 + R2 + Durable Objects" }
  - { value: "solo", label: "projeto pessoal, feito sozinho" }
  - { value: "workerd", label: "testes de integração no runtime real" }
meta:
  - { label: "PAPEL", value: "Desenvolvedor (solo)" }
  - { label: "TIPO", value: "Projeto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Hono · Workers · D1 · React" }
---

Todo evento hoje espalha as fotos por vinte celulares e três grupos de WhatsApp. No fim ninguém tem o álbum inteiro, e as fotos boas somem no meio da conversa. O Instanta é a minha tentativa de resolver isso. É um feed colaborativo de fotos por evento. Os convidados entram, mandam foto pra um mural que atualiza ao vivo, e dá pra jogar tudo num telão no salão da festa.

A entrada é sem cadastro. O convidado entra digitando só um nome e já posta. Se depois quiser, aquele nome vira uma conta de verdade sem perder nada do que já subiu. Tem reação, comentário, stories, umas missões pra dar um empurrão na galera postar, e o telão exibindo o feed na hora, ali no salão. As fotos são efêmeras, somem sozinhas trinta dias depois do evento.

É um projeto meu, solo. Entrei nele querendo construir uma coisa edge-native de verdade, e tratar a parte de segurança e arquitetura com o cuidado que eu daria num produto, e não num fim de semana.

## Edge-native de verdade

O Instanta roda inteiro na borda da Cloudflare. O backend é o Hono num único Worker, com o banco em D1, o SQLite deles que vive na borda, acessado com Drizzle. As fotos ficam no R2 e passam pelo próprio Worker. O rate limit mora num Durable Object, e tem cinco crons cuidando de limpeza, backup e monitoramento.

O front é React 19 com TanStack Router. O que eu mais curto do setup é que, em dev, o front e o Worker sobem no mesmo processo com HMR abaixo de 500ms, e em produção os dois vão juntos num único deploy. A API fica a milissegundos de qualquer convidado, e o custo de manter isso no ar é quase nada.

Vou ser honesto sobre o estado dele. Hoje sobe num endereço workers.dev. O domínio próprio já está no código, mas desligado, esperando eu migrar o DNS pra Cloudflare. O e-mail transacional ainda é um stub. É projeto pessoal em construção, não um produto no ar.

## Segurança

Levei a segurança bem mais a sério do que um mural de fotos de festa exige. Tem 2FA, o cuidado de não revelar se um e-mail existe ou não numa tentativa de login, rate limit que aperta com quem insiste, e um controle de sessão que percebe quando um token foi roubado e derruba as sessões daquela conta. Um app de festa não cobraria nada disso de mim. Esse era o lugar onde eu queria exercitar segurança pra valer, então exercitei.

## Arquitetura

A parte de que eu mais gosto não aparece na tela. A camada onde mora a regra de negócio é proibida, por uma regra de ESLint, de importar o Hono, o runtime da Cloudflare, as rotas ou os middlewares. Se eu esbarro nessa fronteira, o lint quebra na hora. O efeito é que essa camada não sabe que existe um Worker embaixo dela, e por isso eu testo a regra de negócio inteira sem precisar subir nada.

## Testes rodando no runtime de verdade

Os testes de integração não rodam contra um mock da Cloudflare. Rodam dentro do workerd, o runtime real dos Workers, com D1, R2 e Durable Object de verdade, cada teste com o banco isolado do outro. São 78 arquivos cobrindo cadastro, login, permissões, o apagamento de dados por LGPD, moderação, upload e os crons. Tem também teste de acessibilidade com axe-core no Playwright e um piso de cobertura no CI.

## O offline que existe mesmo

O Instanta não é um PWA, não instala e não abre sem internet, e eu não vou fingir que abre. Mas o upload aguenta rede ruim, e essa parte é real. Cada foto, já comprimida no próprio celular, entra numa fila no navegador antes de tentar subir. Se a rede cai ou você fecha a aba no meio, ela não se perde, e quando a conexão volta a fila drena sozinha. A compressão ainda apaga os metadados de EXIF e GPS da imagem, então o lugar onde a foto foi tirada não vai junto com ela.

Hoje o Instanta é um projeto pessoal de umas três semanas de trabalho, feito sozinho, e ainda não lançado. O que falta pra botar no ar é mundano. Migrar o DNS do domínio, ligar o e-mail de verdade no lugar do stub, e apontar pra ele o primeiro evento real.
