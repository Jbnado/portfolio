---
slug: "adg"
locale: "pt-br"
title: "ADG — Arena Draft Guide"
summary: "Tracker de estatísticas de League of Legends (Arena e ARAM: Mayhem) e Valorant para um grupo de amigos. Contribuí com a infraestrutura de produção self-hosted e com o app companion que captura dados que a API pública da Riot não expõe."
highlights:
  - { value: "R$ 0", label: "custo mensal · Oracle Free Tier" }
  - { value: "2×", label: "réplicas · deploy sem downtime" }
  - { value: "0", label: "partidas perdidas · outbox offline" }
meta:
  - { label: "PAPEL", value: "Infra + Companion (solo)" }
  - { label: "TIPO", value: "Contribuição" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · Swarm" }
record:
  label: "Stats finais · top 1 vs eu"
  cards:
    - champ: "Cho'gath"
      who: "hokko tarumae · #1 do top bugs"
      kda: "29/4/12"
      stats:
        - { k: "Vida", v: "16.496.110" }
        - { k: "Poder de Habilidade", v: "693.745" }
        - { k: "Dano", v: "1.350.568" }
        - { k: "Mitigado", v: "33.628.504" }
    - champ: "Sion"
      who: "eu (Jbnado) · #4"
      kda: "29/7/8"
      stats:
        - { k: "Vida", v: "4.379.066" }
        - { k: "Dano", v: "693.589" }
        - { k: "Mitigado", v: "4.756.934" }
---

Você joga Arena, o modo do LoL? Se joga, conhece a meta boba e viciante que vem junto: ganhar com o máximo de campeões possível. Meus amigos viviam nessa caça. O problema é que o LoL tem uma interface péssima pra acompanhar isso. Com quem você já ganhou, quem falta, quem ficou em segundo ou terceiro. Nada disso é fácil de ver no cliente. Então a gente decidiu resolver.

No começo foi rápido. Batendo na API pública da Riot, montamos uma tela pra ver com quem cada um já tinha ganhado, quem faltava, quem tinha ficado em segundo e terceiro. Simples e satisfatório. Mas aí veio a percepção que muda o projeto de lugar: a API era riquíssima, e com aquele dado dava pra fazer muito mais do que uma lista. Então o ADG foi crescendo. Nasceu o top bugs, que ranqueia as partidas mais absurdas por dano, dano mitigado e cura. Nasceram ranking de jogadores, builds, tier lists. Cada dado novo virava uma tela nova.

Só que o pedaço que eu quero contar aqui é outro. Tem um modo que eu acho divertido demais, o ARAM: Mayhem, e a Riot simplesmente não entrega ele na API pública. A fila 2400 responde 403, e não é esquecimento. A Riot tirou o Mayhem da API de propósito, pra manter o modo experimental e impedir que sites agregadores publiquem estatística e "resolvam" a meta. A ironia é boa, porque era exatamente o agregador que eles não queriam que eu ia querer montar. Pra Arena o dado vinha de graça. Pro Mayhem, não vinha de jeito nenhum. Como todo dev que se preze, eu ia precisar de uma gambiarra pra chegar nesse dado. E fiquei com uma pergunta rondando o projeto inteiro: se a gambiarra funciona, é bonita e é bem feita, ela ainda é gambiarra?

O ADG hoje é um tracker de Arena, ARAM e Valorant, e tem potencial de sobra pra crescer mais. Ele foi criado por dois amigos meus. Eu amei a ideia, entrei pra ajudar no que desse, e acabei focando em duas coisas: o Mayhem, o modo que eu mais queria ver no ar, e a infra, pra eles nunca terem custo. É sobre essas duas que eu escrevo aqui.

## Lendo o cliente do LoL

O dado do Mayhem não está na API pública, mas ele existe. Ele está no seu próprio cliente do LoL, que precisa dele pra desenhar o pós-jogo. A ideia do companion é ir buscar exatamente ali. É um app de desktop em Tauri + Rust que lê o League client local e manda as partidas de Mayhem pro ADG.

O cliente do League expõe uma API HTTP local, a LCU (League Client Update, a API interna do próprio client). Ela sobe numa porta aleatória a cada vez que você abre o jogo, e protege tudo com um token que muda junto. A forma comum de descobrir essas credenciais é ler um arquivo `lockfile` que o client deixa no disco. Eu fui por outro caminho, que quebra menos. Varro os processos com `sysinfo` procurando o `LeagueClientUx.exe` e leio a porta e o token direto da linha de comando dele, que é onde a Riot também os coloca.

```rust
if let Some(v) = arg.strip_prefix("--app-port=") { port = v.parse().ok(); }
else if let Some(v) = arg.strip_prefix("--remoting-auth-token=") { token = Some(v.to_string()); }
```

Com a porta e o token, subo um cliente HTTPS pra `127.0.0.1`, autentico com Basic `riot:{token}` e aceito o certificado self-signed que o próprio client usa. A partir daí é conversa. Pergunto quem é o invocador em `/lol-summoner/v1/current-summoner`, o `gameId` da partida em andamento em `/lol-gameflow/v1/session`, e o jogo completo em `/lol-match-history/v1/games/{gameId}`, que devolve os cerca de 118 campos de stats pra cada um dos dez players. Esse último é o dado rico, o que alimenta o ranking.

Só que a LCU sozinha não vê tudo o que eu preciso. Ela me dá o placar final, mas não o que aconteceu durante a partida. Pra isso existe uma segunda API local, a LiveClient Data API, em `127.0.0.1:2999`. Ela só responde enquanto você está em jogo, nem pede autenticação, e é ela que me diz, ao vivo, se o modo é Mayhem. A Riot chama o Mayhem internamente de `KIWI` (o Arena é `CHERRY`), então basta olhar o `gameMode` em `/liveclientdata/gamestats`. As duas se completam. A LiveClient tem o estado ao vivo mas não tem o `gameId`, que só aparece depois de a partida indexar. A LCU tem o `gameId` certo mas só depois do jogo. Eu preciso das duas ao mesmo tempo, e é isso que a captura ao vivo resolve.

## Capturando enquanto a partida acontece

No `setup` do Tauri eu subo três tarefas `tokio` que rodam a vida toda do app.

A primeira é a captura ao vivo, que faz um poll a cada 3 segundos. Enquanto tem um jogo Mayhem em andamento, ela lê o `championStats` do jogador na LiveClient e vai guardando dois recortes. Um é o build final, o último valor que apareceu antes de a partida acabar. O outro é o pico de nove atributos ao longo do jogo: dano de ataque, poder de habilidade, armadura, resistência mágica, vida máxima, velocidade de ataque, velocidade de movimento, roubo de vida e omnivamp. Esse pico é o que vira os recordes de "maior X" no site. É também aqui que eu capturo o `gameId` da partida, pego do gameflow ainda dentro do jogo, pra não depender de a partida indexar depois.

A segunda tarefa é o sync em segundo plano, a cada 20 segundos. Se você está logado, ela faz o backfill uma vez por sessão do client (a janela padrão de histórico, as últimas partidas) e depois esvazia o outbox. A terceira é um dreno no boot, que joga pra fora o que ficou pendente de uma execução anterior do app.

Vale separar duas coisas que costumam se confundir. A captura não precisa de login. Se você jogou Mayhem com o app aberto, o snapshot ao vivo é gravado mesmo deslogado. O login só é exigido no upload, na hora de mandar pro servidor. Isso importa porque desacopla "não perder o dado" de "estar autenticado agora", e leva direto pra parte que eu mais gostei de fazer.

## O outbox, ou como não perder uma partida

A regra que eu queria garantir era simples de enunciar e chata de cumprir. Nada que foi capturado pode se perder se o servidor cair, a internet oscilar ou o app for fechado no meio do envio. A forma de cumprir isso é não confiar na rede em nenhum momento. Tudo que eu capturo vai primeiro pra um arquivo JSON no disco, antes de qualquer tentativa de envio, e só sai de lá depois de um `2xx` confirmado.

O arquivo guarda três tipos de item. Um `PendingMatch`, que é só um `gameId` esperando ser resolvido no detalhe rico via `/games/{id}`. Um `Snapshot`, que é o build final mais o pico de atributos daquela captura ao vivo. E o `MatchPayload`, que é o `PendingMatch` já resolvido, pronto pra subir. Um loop de dreno percorre a fila e tenta entregar cada item.

O que dá liga nisso é a política de retry, que é tipada pela natureza do erro em vez de ser um "tenta de novo" cego.

```
Transiente (5xx, rede, LCU fora)   retenta pra sempre
Permanente (4xx)                   descarta depois de 5 falhas
UpdateRequired (426)               nunca descarta, segura até atualizar
```

Cada uma dessas linhas resolve um problema real. O transiente é o caso comum, servidor reiniciando ou wi-fi caindo, e a resposta certa é insistir. O permanente é quando o servidor recusa aquele dado de vez, e aí insistir pra sempre só entope a fila, então depois de cinco tentativas o item é descartado. O `426` é o mais interessante. Toda request leva um header `x-companion-version`, e o servidor pode barrar um cliente velho. Quando isso acontece, o outbox inteiro congela até o usuário atualizar. É de propósito. Prefiro segurar o dado do que empurrar num formato que o backend não fala mais e corromper o ranking de todo mundo.

Fora a política de retry, o outbox tem alguns cuidados que só aparecem quando você já apanhou de fila persistente antes. Ele deduplica por `gameId`, então o mesmo jogo não entra duas vezes. Se o arquivo em disco corromper, ele carrega como fila vazia em vez de derrubar o app. E o loop de dreno nunca segura o mutex atravessando um `await`. Ele tira um retrato da fila, solta o lock, faz a chamada de rede, e só então pega o lock de novo pra remover o que entregou. É o tipo de detalhe que não muda nada quando dá certo e evita um deadlock quando dá errado. No fim são cinco testes cobrindo os casos chatos: persistir e recarregar, substituir preservando o id, descartar permanente no limite, transiente que nunca descarta, e o dedup. É pouca linha de código pra uma garantia grande.

Tem um efeito colateral bonito nisso tudo. Como o `/games/{gameId}` devolve os dez jogadores de uma vez, o upload de qualquer um da partida já preenche o dado rico dos outros nove. Basta um amigo do lobby ter o app aberto pra todo mundo daquela partida aparecer no ranking com stats completos.

Aquela pergunta do começo já tinha resposta aqui. Ler o cliente do jogo por baixo dos panos é hack, sem dúvida. Mas um hack com outbox em disco, retry tipado e teste automatizado deixa de parecer gambiarra e vira só a forma certa de resolver um problema torto.

## Botar de pé numa VPS de graça

Toda essa parte do servidor roda numa VPS que custa zero por mês. É uma VM ARM da camada sempre-gratuita do Oracle Cloud, com 2 OCPU (o "OCPU" da Oracle equivale a um core físico com hyperthreading, então na prática são uns dois cores) e 12 GB de RAM. Tem um truque aqui que vale contar. A capacidade ARM do free tier vive esgotada pra contas trial, e a Oracle às vezes recupera VMs ociosas de conta gratuita. A saída foi subir a conta pra Pay-As-You-Go mantendo o uso dentro do que é sempre-gratuito. O custo continua zero, mas a conta deixa de ser trial, o que destrava a capacidade ARM e tira o risco de perder a máquina por ociosidade. Junto disso, um IP público reservado, também gratuito, pra VM sobreviver a uma recriação sem eu ter que atualizar DNS.

Orquestrei com Docker Swarm de um nó só. É uma escolha que costuma levantar sobrancelha, então vale o porquê. Eu queria as primitivas de verdade de um orquestrador: rolling update, réplicas, secrets, healthcheck. Kubernetes entrega tudo isso e muito mais, mas o "muito mais" cobra caro de CPU e de operação numa máquina de dois cores. O Swarm dá exatamente essas primitivas com um YAML que é quase o compose que eu já sei escrever, e sem control plane pesado comendo a máquina. Pra um nó só, é o ponto certo da curva.

## A dependência circular do edge

A infra está dividida em duas stacks, e o motivo é uma dependência circular que aparece quando você quer fazer deploy pela interface. O Portainer é quem faz o deploy de tudo via GitOps. Só que o Portainer, pra eu abrir o painel dele, precisa estar no ar e roteado. E quem roteia é o Traefik. Ou seja, Traefik e Portainer têm que existir antes de qualquer coisa que eles vão servir, inclusive antes deles mesmos. Como eles não podem depender do resto, ficam numa stack `edge` que eu subo uma vez, na mão. Todo o resto vive na stack `adg`, com a API em duas réplicas, Postgres, Redis, backup e a observabilidade, e aí sim é o Portainer que sobe via GitOps.

O Traefik cuida do ingress e emite e renova o TLS sozinho via ACME (o protocolo do Let's Encrypt). Foi por isso que preferi ele ao nginx, que ia me obrigar a manter certbot com um cron de renovação. As portas 80 e 443 são publicadas em `mode: host` de propósito. Nesse modo o Traefik enxerga o IP real do cliente, em vez do IP interno da rede do Swarm, e a API precisa desse IP real pro rate limiting funcionar. Teve também um bug que documentei no caminho: o Traefik v3.1 fixava a versão 1.24 da API do Docker no provider de Swarm, que o Docker 25+ recusa, e o resultado era o Traefik subir sem nenhuma rota. A correção foi a v3.7, que negocia a versão da API.

Um detalhe que eu gosto é a compressão no edge. As respostas agregadas do ranking são JSON grande, na casa de 68 KB, e comprimir corta uns 80% disso, o que faz diferença real em quem abre no 4G. Mas a compressão exclui explicitamente o `text/event-stream`. Comprimir um stream bufferiza a resposta, e bufferizar mata os eventos em tempo real. Então o ganho de banda vale pro JSON e sai do caminho do que precisa chegar na hora.

## O deploy que garante o pull

O deploy é todo automático. Um merge na `main` dispara o GitHub Actions, que builda a imagem arm64 com QEMU e buildx, publica no GHCR e bate num webhook do Portainer pra ele dar `git pull` no compose e subir de novo. Só um filtro decide se rebuilda a imagem da API, a do backup, ou nenhuma, olhando o que mudou em `server/**` e `infra/**`.

O detalhe que vale contar é um comportamento do Swarm que pega muita gente. Ele só troca a imagem em execução quando o spec do serviço muda. Com `image: ...:latest` fixo, o spec não muda entre deploys, então o Swarm nem tenta um novo pull. A imagem velha fica rodando, achando que está tudo certo, enquanto a nova está lá no registry sem ninguém buscar. A saída foi fazer o próprio CI fixar o digest `@sha256` da imagem recém-buildada dentro do compose e commitar de volta com `[skip ci]`.

```yaml
sed -i -E "s#(image:...)${IMAGE_API}[^ ]*#\1${IMAGE_API}@${API_DIGEST}#" infra/docker-compose.yml
git commit -m "chore(deploy): fixa digest [skip ci]"
```

Como o digest muda a cada deploy, o spec muda junto, e o pull passa a ser garantido. O rolling em si é sem downtime porque a API roda em duas réplicas com `order: start-first`, que sobe a réplica nova antes de matar a velha, e `failure_action: rollback`, que reverte sozinho se a imagem nova subir quebrada. Os secrets nunca passam pela CI. JWT, senha do banco e chaves da Riot ficam nas variáveis da stack, que eu edito pela interface do Portainer sem abrir SSH. Rotacionar uma chave da Riot é um clique, não um deploy.

O build arm64 também teve o seu aprendizado. No começo o `bcrypt` compilava C++ sob emulação QEMU e cada build levava uns dez minutos. Troquei pelo `@node-rs/bcrypt`, que tem binário arm64 pré-compilado, e somei cache de build no Actions. Os dez minutos viraram segundos.

## Ver o que tá acontecendo

Pra não descobrir que caiu pelo amigo reclamando no grupo, botei observabilidade de verdade. Tem Grafana com Loki e Promtail pros logs, e Prometheus com node-exporter, cAdvisor, postgres-exporter e um blackbox-exporter que bate no `/health` da API de fora a cada 15 segundos. É essa sonda externa que acende o "no ar / fora do ar" na home do Grafana, porque ela testa o serviço do jeito que um usuário testa, e não de dentro. São quatro dashboards, um de home, um da API, um do Postgres e um da infra.

Aqui aparece um gotcha do Swarm que casa com o do deploy. As configs do Swarm são imutáveis. Se eu mudo o `prometheus.yml` e faço redeploy, ele quebra com um "config already exists", porque o Swarm não deixa reescrever uma config existente. O jeito é versionar no nome, renomear `prometheus_config` pra `prometheus_config_v2` nos dois lugares, e o Swarm cria uma nova. O Grafana escapa disso porque os dashboards dele são montados por bind mount em vez de config do Swarm. Editar um painel é trocar um `.json` no repo e dar `git pull` na VM, e o Grafana recarrega sem redeploy.

## Postgres e Redis, cada um no seu lugar

O Postgres é o único serviço que eu trato com regra rígida. Ele fica preso no nó manager, com uma réplica só e volume local. A regra é escalar a API à vontade e nunca o banco. Duas réplicas de Postgres apontando pro mesmo lugar é problema, não redundância. Ele é publicado na 5432 em `mode: host`, mas só é alcançável se a Security List da VCN abrir a porta pra IPs `/32` específicos dos parceiros, nunca pra `0.0.0.0/0`.

O tuning do Postgres também rendeu um aprendizado. Eu tinha um `idle_session_timeout` configurado, e ele estava matando as conexões ociosas do pool do Prisma e enchendo o log de reconexão. Troquei por TCP keepalives, que só derrubam o cliente que realmente morreu, em vez de matar conexão saudável só por estar parada um instante.

O Redis entrou tarde, e por um motivo específico. Com a API em duas réplicas, um WebSocket conectado numa réplica não enxergava os usuários conectados na outra, então a presença em tempo real ficava quebrada dependendo de onde você caía. O Redis guarda essa presença compartilhada entre as réplicas, via pub/sub. Ele é efêmero de propósito, sem volume e com limite de memória, porque é estado de sessão, não dado que eu preciso persistir.

## Backups que eu confio

O backup é um `pg_dump` a cada 6 horas, com 14 dias de retenção, mandado pra duas nuvens diferentes. Uma é o Object Storage da própria Oracle. A outra fica fora da Oracle, num R2, e existe justamente pro caso de um dia a conta ser reclamada. Uma falha em mandar pra um destino não impede o outro. E eu testo o restore de vez em quando, porque backup que você nunca restaurou não é backup, é esperança.

## O rei do top bugs

No fim, o ADG é um cantinho pra guardar os próprios números com os amigos, seja no Arena ou no Mayhem. E ele registra cada aberração que a gente já aprontou. O rei do nosso top bugs hoje é um Cho'gath que terminou uma partida de Arena com 16,5 milhões de vida e quase 700 mil de poder de habilidade. Eu tô em quarto, com um Sion de 4,4 milhões de vida, e não buguei mais porque precisava sair e ir pro médico.

Se você joga Arena ou ARAM, entra no [adg.gg](https://adg.gg), sincroniza tuas partidas e cola no nosso Discord. Aparece no ranking e vem quebrar esse número. Duvido.
