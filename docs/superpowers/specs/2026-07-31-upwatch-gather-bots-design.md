# Design: UpWatch e gather-bots no portfolio

**Data:** 2026-07-31
**Status:** Aprovado para planejamento

## Objetivo

Colocar dois projetos novos no portfolio — **UpWatch** e **gather-bots** — como cards na
seção de projetos, com case study dedicado nos três idiomas, entrada na timeline e o número
de repositórios das stats atualizado.

Os dois foram construídos entre 29 e 31 de julho de 2026, com agentes de código. O ângulo
editorial escolhido pelo João é **assumir o método**: ele fez o desenho do sistema, as
decisões de engenharia e a condução do trabalho com IA (Alethe rodando agentes em paralelo,
loops, documentos de planejamento antes do código, TDD). O que ele traz é o conhecimento,
não a digitação.

## Os dois projetos

### UpWatch — `github.com/Jbnado/upwatch` (público, AGPL-3.0)

Monitoramento de disponibilidade em Go. Binário único com a interface embarcada por
`go:embed`, sem nginx ao lado. Verifica por HTTP, TCP, ICMP, DNS, TLS e push.

Números verificados no repositório em 2026-07-31:

- 119 arquivos Go, 26.928 linhas; 53 arquivos de teste, 11.836 linhas
- 651 funções de teste em Go
- interface em React 19 + Vite + Tailwind 4, 29 arquivos, 5.007 linhas
- 37 commits, de 2026-07-29 a 2026-07-31
- site do projeto no ar em `jbnado.github.io/upwatch` (HTTP 200)

Decisões que viram matéria do texto:

- **Sentinela que precisa provar que funciona.** Quando as verificações falham, uma sonda
  independente confere se a rede local responde; se não responder, os resultados viram "sem
  medição" em vez de "fora do ar". A sonda só ganha esse poder depois de se provar — uma
  sonda bloqueada por firewall silenciaria todos os alertas para sempre.
- **`-1` para "sem medição" no Prometheus**, não `0`. Confundir os dois faria todo monitor
  recém-criado disparar alerta.
- **Endereço do alvo nunca vira label.** Descreve topologia interna e é cardinalidade alta.
- **Percentil sempre calculado do dado cru**, nunca percentil de percentil, mesmo depois de
  as batidas virarem agregado horário e diário.
- **`body_template` no webhook**, com substituição sobre o JSON já decodificado e
  serialização de volta, nunca por concatenação de texto. Marcador sozinho preserva o tipo
  (`"$duration_seconds"` chega como número). Marcador desconhecido é recusado no cadastro do
  canal, não na entrega.
- **A página pública nunca publica a causa detectada.** `dial tcp 10.0.3.7:5432: connect:
  connection refused` entregaria endereço, porta e tecnologia. As barras são automáticas, o
  relato é escrito à mão.
- **`UPWATCH_SECURE_COOKIES=false` por padrão**, porque instalação caseira serve HTTP na rede
  local e o cookie Secure faria o login parecer quebrado sem explicação.

Testes que viram matéria do texto:

- suíte de conformidade rodando a mesma bateria contra SQLite e PostgreSQL, sem casos pulados
- teste de deriva do OpenAPI nos dois sentidos, contra as rotas de verdade
- `internal/api/public_security_test.go` — travessia de caminho em nove formas, injeção de
  SQL no slug, enumeração de páginas, texto hostil, cabeçalho `Host` forjado. O README
  registra que um deles encontrou um defeito real durante o desenvolvimento.

### gather-bots — `github.com/Jbnado/gather-bots` (público, MIT)

TypeScript em Node 24. Alimenta os Smart Objects do Gather com trabalho real: PRs esperando
review, pipelines quebradas, work items, reuniões prestes a começar, quedas empurradas por
webhook de monitor de uptime.

Números verificados no repositório em 2026-07-31:

- 45 arquivos em `src/`, ports and adapters (`src/ports`, `src/adapters`, `src/domain`)
- 18 arquivos de teste, 130 casos
- 16 commits, de 2026-07-30 a 2026-07-31
- site do projeto no ar em `jbnado.github.io/gather-bots` (HTTP 200)

Decisões que viram matéria do texto:

- **Ports and adapters de verdade.** O núcleo não conhece Azure DevOps, Google, Microsoft nem
  o Gather. Três coisas se acrescentam sem tocar no meio: uma fonte nova, uma superfície nova,
  ou um destino que não é o Gather.
- **Fonte reporta fato, superfície decide apresentação.** `Signal` não carrega roteamento; se
  o adapter decidisse "isso vai no Inbox", mudar o significado de um objeto exigiria tocar em
  todas as fontes.
- **Dispatcher com diff.** O rate limit do Gather é por space, não por objeto. O dispatcher
  compara com o último estado enviado e manda só a diferença. Um minuto sem novidade custa
  zero requisições.
- **`activity.clear` proibido pelo tipo.** Um objeto carrega entradas de várias fontes;
  limpar apagaria as das outras. O tipo `Command` omite o evento, então o compilador recusa.
- **Último resultado bom vale 15 minutos.** Depois disso os itens somem, porque reunião que
  acabou há uma hora é pior que reunião nenhuma. Se todas as fontes falham de uma vez, nada é
  escrito — isso é queda de rede, não tudo acabando ao mesmo tempo.
- **Entrada `overflow` "+N outros"** acima de 15 itens no feed, porque badge 23 sobre feed de
  15 é interface que mente.
- **`pnpm checkup` funciona antes de qualquer configuração**, e classifica cada objeto e cada
  integração em funcionando, não configurado, ou configurado e quebrado. Só a terceira linha
  merece atenção.

## A espinha narrativa

O texto assume o método e sustenta com o que está commitado.

**Em gather-bots a prova é literal.** O design doc
`docs/superpowers/specs/2026-07-30-gather-smart-objects-design.md` foi escrito antes do
código, com decisões numeradas de D1 a D7, a tabela de capabilities por preset lida da
documentação do SDK, o registro de duas incertezas fechadas contra o space real, e uma
sequência de build. Os commits saíram na ordem daquela sequência.

**Em UpWatch a prova é o `git log`.** Fundação, store, scheduler, checker, rollup, auth, API,
web, incidente, notificador, página pública, Postgres, métricas, release. Fatias verticais,
cada uma com a intenção declarada no assunto do commit: *"feat(metrics): exposição
Prometheus, e a composição que a escondia"*, *"feat(status): tela pública, e o que sobreviveu
à tentativa de invasão"*.

O argumento central dos dois textos: o que a IA não decide sozinha são as restrições. A lista
de decisões acima é o miolo, e o TDD é o que segura o resultado — 12k das 27k linhas de Go
são teste.

A seção sobre o método é escrita de forma diferente em cada case study. No gather-bots, pelo
documento. No UpWatch, pelo log e pela suíte. Não é o mesmo parágrafo duplicado.

## Restrições de escrita

Valem as preferências já estabelecidas para prosa em português:

- sem construções "X: Y" dentro da frase
- sem travessão inserindo aparte no meio da frase, sem glifo de seta na prosa
- primeira pessoa, direto, sabor TabNews
- sem conclusão reflexiva manufaturada; termina em algo concreto ou não termina
- nada de fato inventado para dar cor
- "eu" por último em sujeito composto

## Mudanças no repositório

Nenhum código novo. As rotas `/projeto/[slug]`, `/en/project/[slug]` e `/es/proyecto/[slug]`
já geram a partir da collection `caseStudies`, e `ogImage` é opcional com fallback para o
`/og-image.png` global. O `content.config.ts` não muda.

| Arquivo | Mudança |
|---|---|
| `src/content/projects/projects.json` | 2 itens novos, no topo do array |
| `src/content/caseStudies/upwatch.{pt-br,en,es}.md` | 3 arquivos novos |
| `src/content/caseStudies/gather-bots.{pt-br,en,es}.md` | 3 arquivos novos |
| `src/content/timeline/timeline.json` | 2 entradas novas, `type: "project"` |
| `src/content/stats/stats.json` | repos 42 → 46 |

### projects.json

Os dois entram no topo do array, que é a ordem de renderização dos cards
(`ProjectsSection.astro` mapeia `items` na ordem). `type: "project"`, `isFeatured: true`.

- **upwatch** — `startDate: "2026-07-29"`, links `github` e `demo`, techStack
  `["Go", "SQLite", "PostgreSQL", "React 19", "Docker", "Prometheus"]`
- **gather-bots** — `startDate: "2026-07-30"`, links `github` e `demo`, techStack
  `["TypeScript", "Node 24", "Azure DevOps", "Docker", "Vitest"]`

Cada um leva `description` e o `caseStudy` de três campos (problem, decision, result) nos
três idiomas, que é o que abre inline no card.

### caseStudies

Mesma forma do `instanta.pt-br.md`: frontmatter com `slug`, `locale`, `title`, `summary`,
três `highlights` e quatro campos de `meta`, depois prosa em primeira pessoa com `##`.

Seções do UpWatch: abertura sobre latência junto com estado · Um binário · A sentinela que
precisa provar que funciona · O webhook é de quem recebe · A página pública que não entrega o
que não deve · Como isso foi construído em três dias · estado atual.

Seções do gather-bots: abertura sobre a mesa que conta o que está acontecendo · Ports and
adapters, e por que não é enfeite · O diff que mantém o custo em zero · As coisas que mordem
· O checkup · O design doc veio antes · estado atual.

Inglês e espanhol são versões do mesmo texto, não resumos. Paridade de seções e de conteúdo,
como já acontece nos outros seis case studies.

### timeline.json

Duas entradas `type: "project"`, data `"2026"`, no topo (a lista é decrescente e hoje começa
em 2025). Cada uma com `href` para o case study em português e `tech` com a stack curta.

Isso liga pela primeira vez o estilo `timeline-dot--project` que já existe no
`TimelineEntry.astro` — círculo vazado, vermelho `#ff3e3e` no dark. Hoje a timeline só tem
entradas `career`.

### stats.json

`public_repos` da API do GitHub para o usuário Jbnado é 46 hoje; o valor no arquivo é 42. Os
outros dois números continuam corretos (5+ anos desde o trainee em 2021, 4 empresas).

## Verificação

- `pnpm build` passa, e as 24 páginas de case study aparecem na saída (8 projetos × 3 idiomas)
- as seis URLs novas respondem: `/projeto/upwatch`, `/en/project/upwatch`,
  `/es/proyecto/upwatch`, e as três de `gather-bots`
- os dois cards novos aparecem no topo da seção de projetos, nos três idiomas
- a timeline mostra as duas entradas com o marcador vazado, e os links levam ao case study
- revisão de prosa contra as restrições de escrita acima, arquivo por arquivo

## Fora de escopo

- imagem OG própria por case study (o fallback global continua valendo)
- qualquer alteração no `content.config.ts`, nas rotas ou no CSS
- o fork privado `gather-bots` (só o repositório público entra no portfolio)
