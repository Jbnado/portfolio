---
slug: "upwatch"
locale: "pt-br"
title: "UpWatch"
summary: "Monitoramento de disponibilidade em Go que cabe num binário e mostra latência junto com o estado. Projeto meu, open source sob AGPL, com a interface embarcada no executável e uma suíte de conformidade que roda idêntica em SQLite e PostgreSQL."
highlights:
  - { value: "1 binário", label: "interface embarcada por go:embed" }
  - { value: "12k/27k", label: "linhas de teste sobre linhas de Go" }
  - { value: "2 bancos", label: "a mesma bateria de conformidade nos dois" }
meta:
  - { label: "PAPEL", value: "Desenvolvedor (solo)" }
  - { label: "TIPO", value: "Projeto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Go · SQLite · Postgres · React" }
---

Quase todo incidente que eu vi de perto começou com o serviço ficando lento, não caindo. A latência sobe, alguém reclama que está travando, e só bem depois é que alguma coisa efetivamente para de responder. Um monitor que só sabe dizer no ar ou fora do ar chega no fim dessa história, quando já não dá pra fazer muito.

O UpWatch mostra as duas coisas no mesmo lugar. Ele verifica por HTTP, TCP, ICMP, DNS, TLS e por sinal do próprio serviço, esse último pra tarefa agendada e processo sem porta exposta. O intervalo vai de cinco segundos em diante, por monitor.

Instalar é um comando.

```bash
docker run -d --name upwatch -p 8080:8080 -v upwatch:/data \
  ghcr.io/jbnado/upwatch:latest
```

Você abre no 8080, cria a conta de administração, e o cadastro fecha depois dela. É a única conta que nasce sem autenticação.

## Um binário

A interface vive dentro do executável, por `go:embed`. Não tem nginx ao lado, não tem pasta de arquivos estáticos, e não existe a situação clássica de a interface estar numa versão e o servidor que a entrega estar em outra. O preço é que compilar a interface virou pré-requisito de compilar o binário, e o `make build` cuida da ordem.

O armazenamento é plugável entre SQLite e PostgreSQL. Isso é fácil de escrever num README e difícil de sustentar, porque a diferença entre os dois mora nos cantos, no tipo de data, no comportamento de conflito, na semântica de transação. Por isso a suíte de conformidade roda a mesma bateria contra os dois bancos, sem caso pulado. É o que impede banco plugável de virar fachada.

Guardar meses de histórico sem guardar meses de dado cru também estava no desenho desde o começo. As batidas duram uma semana e depois viram agregado horário e diário. O percentil sai sempre do dado cru, nunca percentil de percentil, que é o atalho que faz o p99 do mês parecer bem melhor do que ele foi. Uma instalação com cinco alvos verificando a cada minuto ocupou 2,6 MB depois de trinta dias.

## A sentinela que precisa provar que funciona

Quando as verificações começam a falhar em série, existem duas explicações, e elas pedem reações opostas. Ou os alvos caíram, ou a rede de onde o UpWatch olha caiu. Tratar a segunda como se fosse a primeira enche o plantão de alerta falso na madrugada em que a rede do servidor oscilou.

Então tem uma sonda independente. Quando as verificações falham, ela confere se a rede local ainda responde. Se não responder, os resultados daquele momento viram "sem medição" em vez de "fora do ar".

A parte que eu acho mais interessante é a trava. Essa sonda só ganha o poder de silenciar depois de provar que funciona. Uma sonda bloqueada por firewall responderia sempre que a rede está fora, e o UpWatch passaria a engolir todos os alertas pra sempre, sem avisar ninguém. Monitor que nunca alerta se parece bastante com monitor que nunca precisou alertar.

A mesma preocupação aparece no `/metrics`. Em `upwatch_monitor_status`, 1 é no ar, 0 é fora do ar, 2 é degradado, e "sem medição" é `-1`, não zero. Se fosse zero, todo monitor recém-criado dispararia alerta antes mesmo da primeira verificação. E o endereço do alvo nunca vira rótulo. Além de descrever a topologia interna pra quem lê o Prometheus, endereço em rótulo é cardinalidade alta, e cardinalidade alta é como se derruba um Prometheus.

## O webhook é de quem recebe

O canal de webhook começou entregando um envelope meu, com os campos nos nomes que eu escolhi. Funciona bem até você tentar ligar num destino que já existe e que espera os campos com os nomes dele. Nem sempre dá pra mudar quem recebe.

Hoje você declara a forma do corpo e os marcadores são substituídos.

```json
{
  "url": "https://automacao.exemplo/alertas",
  "headers": { "X-Chave": "…" },
  "body_template": {
    "event": "$status",
    "service": { "name": "$monitor", "id": "$monitor_id" },
    "outage_seconds": "$duration_seconds",
    "summary": "[$status] $monitor"
  }
}
```

Duas decisões aí valem mais do que o recurso em si.

A substituição acontece sobre o JSON já decodificado, e o resultado é serializado de volta. Nunca por concatenação de texto. Parece preciosismo até você imaginar um monitor com aspas no nome, ou uma causa de erro com quebra de linha, produzindo um corpo malformado que o destino recusa. Você perderia o aviso da queda por causa da própria queda.

E marcador desconhecido é recusado no cadastro do canal, não na hora da entrega. Descobrir o erro de digitação durante o incidente é descobrir tarde demais.

## A página pública que não entrega o que não deve

A página pública de estado segue o formato que Anthropic, Cloudflare e Google consolidaram. Veredito no topo, componentes agrupados, noventa barras de histórico, incidentes anteriores com linha do tempo.

O que ela faz de propósito é não publicar a causa. A causa que a sonda detecta é literal e interna, do tipo `dial tcp 10.0.3.7:5432: connect: connection refused`, e entregaria endereço, porta e tecnologia de um serviço que ninguém de fora deveria enxergar. As barras são automáticas, o relato é escrito à mão. Uma instalação recém-subida mostra as barras e "nenhum incidente relatado".

Cada componente também tem um rótulo público próprio. O monitor pode se chamar `api-prod-us-east-1` na operação e aparecer como "API" pra quem lê, sem te obrigar a renomear nada nem a entregar sua convenção de nomes.

## Como isso foi construído em três dias

Trinta e sete commits entre 29 e 31 de julho. Vale dizer como, porque a velocidade não é o ponto interessante.

O `git log` é o plano executado. Fundação, armazenamento, escalonador, verificadores, agregação, autenticação, API, interface, motor de incidente, canais de aviso, página pública, PostgreSQL, métricas, release. Fatias verticais, cada uma com a intenção declarada no assunto do commit. *"feat(metrics): exposição Prometheus, e a composição que a escondia"*. *"feat(status): tela pública, e o que sobreviveu à tentativa de invasão"*.

Eu escrevi o desenho antes e conduzi a execução com agentes rodando em paralelo no Alethe, em ciclos curtos, cada um com o seu documento de planejamento. A IA escreve muito mais rápido do que eu digito, e não faz sentido fingir o contrário. O que eu ponho na mesa é o que ela não decide sozinha, que são as restrições.

Todas as decisões que eu contei aqui em cima são isso. A trava da sentinela existe porque eu me perguntei o que aconteceria se a própria sonda fosse bloqueada. O `-1` do Prometheus existe porque eu pensei no monitor recém-criado. A substituição sobre JSON decodificado existe porque eu imaginei o nome com aspas. Nenhuma dessas veio de um requisito escrito em lugar nenhum.

E o que segura o resultado é o teste. O projeto foi escrito em TDD, e a suíte é o principal artefato de desenho que ele tem. Doze das vinte e sete mil linhas de Go são teste, em 651 funções. A conformidade do armazenamento roda a mesma bateria nos dois bancos. Um teste de deriva confere a especificação OpenAPI contra as rotas de verdade, nos dois sentidos, então a documentação não tem como envelhecer sozinha.

E existe uma bateria só pra atacar a única superfície que não pede credencial, que é a página pública. Travessia de caminho em nove formas, injeção de SQL no slug, enumeração de páginas, texto hostil, cabeçalho `Host` forjado. Um deles encontrou um defeito real durante o desenvolvimento.

## Onde está hoje

Público no GitHub sob AGPL-3.0, com imagem no GHCR, binário estático nos releases e um compose com PostgreSQL pra quando a disponibilidade do próprio monitorador importa. Tem página de projeto no ar, CI com detector de corrida, e o Dependabot já abriu, e eu já mergeei, os primeiros bumps de dependência.

A API é de primeira classe e não acessório da interface, então a tela consome exatamente os mesmos endpoints que qualquer script seu consumiria. Quem já tem Prometheus liga em `/metrics` e deixa o alerta morar onde já mora o resto.
