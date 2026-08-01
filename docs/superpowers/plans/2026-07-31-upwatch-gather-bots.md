# UpWatch e gather-bots no portfolio — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar UpWatch e gather-bots no portfolio como cards com case study dedicado nos três idiomas, mais entrada na timeline e o número de repositórios atualizado.

**Architecture:** Quase só conteúdo. As collections `projects`, `caseStudies`, `timeline` e `stats` já existem, e as rotas `/projeto/[slug]`, `/en/project/[slug]` e `/es/proyecto/[slug]` geram sozinhas a partir de `caseStudies`. A única exceção está na Task 6: a timeline nunca teve entrada com link, e o campo `href` que existe no schema não é localizado, então ligar a timeline aos case studies exige um campo novo e três linhas em `TimelineSection.astro`. Nenhum CSS muda.

**Tech Stack:** Astro content collections, Markdown com frontmatter validado por Zod, JSON.

**Spec:** `docs/superpowers/specs/2026-07-31-upwatch-gather-bots-design.md`

## Global Constraints

- **Idiomas:** todo conteúdo entra nos três — `pt-br`, `en`, `es`. Inglês e espanhol são versões completas do mesmo texto, não resumos. Paridade de seções.
- **Prosa em português, regras travadas:** sem construção "X: Y" dentro da frase; sem travessão inserindo aparte no meio da frase; sem glifo de seta (→) na prosa; primeira pessoa, direto, sabor TabNews; sem conclusão reflexiva manufaturada, sem tricolon de fecho, sem aforismo final; "eu" por último em sujeito composto ("alguns amigos e eu"); nada de fato inventado para dar cor.
- **Nenhum número inventado.** Todo número no texto sai da lista verificada no spec. Se um número novo for preciso, ele é medido no repositório de origem antes de ser escrito.
- **O texto assume o método.** Os dois projetos foram construídos com agentes de código entre 29 e 31 de julho de 2026. Isso é dito de frente e sustentado pelo que está commitado — o design doc no gather-bots, o `git log` e a suíte de testes no UpWatch. O que o João traz é o desenho do sistema, as decisões de engenharia e a condução do trabalho. Nunca escrever que ele digitou o código.
- **Ordem dos cards:** `ProjectsSection.astro` renderiza `items` na ordem do array. Itens novos entram no topo.
- **Comando de build:** `pnpm build` a partir de `C:\Users\bernardo\Projetos\portfolio-jb`.

---

### Task 1: Cards em `projects.json`

**Files:**
- Modify: `src/content/projects/projects.json` (inserir dois itens antes de `instanta`, hoje na linha 4)

**Interfaces:**
- Produces: os `id` `upwatch` e `gather-bots`, que as Tasks 2 a 5 usam como `slug` no frontmatter dos case studies e a Task 6 usa para montar o `href` da timeline.

- [ ] **Step 1: Inserir o item do UpWatch como primeiro do array**

Campos exatos, seguindo o schema em `content.config.ts:35-57`:

```json
{
  "id": "upwatch",
  "type": "project",
  "title": { "pt-br": "UpWatch", "en": "UpWatch", "es": "UpWatch" },
  "description": { "pt-br": "...", "en": "...", "es": "..." },
  "techStack": ["Go", "SQLite", "PostgreSQL", "React 19", "Docker", "Prometheus"],
  "startDate": "2026-07-29",
  "isFeatured": true,
  "links": {
    "github": "https://github.com/Jbnado/upwatch",
    "demo": "https://jbnado.github.io/upwatch/"
  },
  "caseStudy": {
    "problem": { "pt-br": "...", "en": "...", "es": "..." },
    "decision": { "pt-br": "...", "en": "...", "es": "..." },
    "result": { "pt-br": "...", "en": "...", "es": "..." }
  }
}
```

Conteúdo dos campos de texto, nos três idiomas:

- `description` — duas a três frases. Monitoramento de disponibilidade em Go, binário único com a interface embarcada, latência junto com o estado. Projeto meu, open source sob AGPL-3.0.
- `problem` — quase todo incidente começa com o serviço ficando lento, não caindo, e monitor que só responde no ar ou fora do ar não mostra isso. Somado a: monitor que exige nginx ao lado e pasta de estáticos é mais peça para manter do que serviço monitorado.
- `decision` — um binário com a interface embarcada por `go:embed`. Store plugável com SQLite e PostgreSQL, e a mesma bateria de conformidade rodando idêntica nos dois. Batidas cruas viram agregado horário e diário, com percentil sempre calculado do dado cru. Sonda independente separa queda do alvo de queda da própria rede, e só ganha esse poder depois de se provar.
- `result` — 27 mil linhas de Go, 12 mil delas de teste, 651 funções de teste. Testes de invasão na única superfície sem credencial. Imagem no GHCR, site do projeto no ar, licença AGPL-3.0.

- [ ] **Step 2: Inserir o item do gather-bots como segundo do array**

```json
{
  "id": "gather-bots",
  "type": "project",
  "title": { "pt-br": "gather-bots", "en": "gather-bots", "es": "gather-bots" },
  "description": { "pt-br": "...", "en": "...", "es": "..." },
  "techStack": ["TypeScript", "Node 24", "Azure DevOps", "Docker", "Vitest"],
  "startDate": "2026-07-30",
  "isFeatured": true,
  "links": {
    "github": "https://github.com/Jbnado/gather-bots",
    "demo": "https://jbnado.github.io/gather-bots/"
  },
  "caseStudy": {
    "problem": { "pt-br": "...", "en": "...", "es": "..." },
    "decision": { "pt-br": "...", "en": "...", "es": "..." },
    "result": { "pt-br": "...", "en": "...", "es": "..." }
  }
}
```

- `description` — alimenta os Smart Objects do Gather com trabalho de verdade. PRs esperando review, pipelines quebradas, tarefas e reuniões, na mesa do escritório virtual. Projeto meu, open source sob MIT.
- `problem` — saber o que espera por você exige abrir quatro ferramentas. E a mesa no escritório virtual é decoração, quando poderia ser o painel.
- `decision` — ports and adapters, com o núcleo sem conhecer Azure DevOps, Google, Microsoft nem o Gather. A fonte reporta fato e a superfície decide apresentação, então dois provedores de agenda não custam nada. O dispatcher compara com o último estado enviado e manda só a diferença, porque o rate limit do Gather é por space.
- `result` — 130 casos de teste, com as superfícies como funções puras testadas sem rede. Um minuto sem novidade custa zero requisições. A imagem acrescenta cerca de 1 MB sobre o `node:24-alpine`, com memória limitada a 128 MB.

- [ ] **Step 3: Validar o schema**

Run: `pnpm build`
Expected: o carregamento das collections passa sem erro de Zod. `links.github` e `links.demo` precisam ser URLs válidas, e os três idiomas são obrigatórios em todo campo `i18nText`.

**Corrigido durante a execução, 2026-07-31.** O build **não fica verde neste ponto**, e o plano original errava ao dizer que ficaria. A rota `/projeto/[slug]` gera uma página por item de `projects.json` e busca a entrada correspondente em `caseStudies`; card sem `.md` quebra a geração com `Entry caseStudies → upwatch.pt-br was not found`.

Consequência para o resto do plano:

- este Step verifica só que o Zod aceitou o JSON, e o erro esperado a seguir é o de entrada não encontrada
- não há commit no fim da Task 1
- `projects.json` é commitado junto com os seis arquivos de case study, no fim da Task 5, que é o primeiro ponto em que o build fica verde
- o Step 4 original, de conferir os cards no `pnpm preview`, migra para a Task 7

---

### Task 2: Case study do UpWatch em português

**Files:**
- Create: `src/content/caseStudies/upwatch.pt-br.md`

**Interfaces:**
- Consumes: o `id` `upwatch` da Task 1, usado como `slug` no frontmatter.
- Produces: o texto canônico que as versões `en` e `es` da Task 3 traduzem seção por seção.

Referência de forma: `src/content/caseStudies/instanta.pt-br.md`.

- [ ] **Step 1: Escrever o frontmatter**

```yaml
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
```

- [ ] **Step 2: Escrever o corpo**

Abertura sem `##`, dois ou três parágrafos. Quase todo incidente começa com o serviço ficando lento, não caindo, e o monitor que só sabe dizer no ar ou fora do ar chega tarde. O que o UpWatch verifica e como se instala.

`## Um binário` — `go:embed` põe a interface dentro do executável, então não existe nginx ao lado nem pasta de estáticos que fique defasada em relação ao servidor que a acompanha. `make build` compila a interface antes do binário porque a ordem é pré-requisito. Store plugável entre SQLite e PostgreSQL, e a suíte de conformidade que roda a mesma bateria contra os dois, sem casos pulados, é o que impede "banco plugável" de virar fachada.

`## A sentinela que precisa provar que funciona` — quando as verificações começam a falhar, uma sonda independente confere se a rede local ainda responde; se não responder, os resultados viram "sem medição" em vez de "fora do ar". E a parte que importa: essa sonda só ganha o poder de silenciar depois de provar que funciona, porque uma sonda bloqueada por firewall calaria todos os alertas para sempre. Emendar aqui a decisão do Prometheus, onde "sem medição" é `-1` e não `0`, senão todo monitor recém-criado dispara alerta. E o endereço do alvo que nunca vira label, por descrever topologia interna e por cardinalidade alta.

`## O webhook é de quem recebe` — o destino que já existe espera os campos com os nomes dele, e nem sempre dá para mudar quem recebe. `body_template` deixa você declarar a forma. A substituição acontece sobre o JSON já decodificado e o resultado é serializado de volta, nunca por concatenação de texto, porque uma aspa no nome do monitor não pode produzir um corpo que o destino recusa e fazer você perder o aviso da queda por causa da própria queda. Marcador desconhecido é recusado no cadastro do canal, não na entrega.

`## A página pública que não entrega o que não deve` — a causa que a sonda detecta é literal e interna, do tipo `dial tcp 10.0.3.7:5432: connect: connection refused`, e entregaria endereço, porta e tecnologia de um serviço que ninguém de fora deveria enxergar. Por isso as barras são automáticas e o relato é escrito à mão. Cada componente tem rótulo público, então o monitor pode se chamar `api-prod-us-east-1` na operação e aparecer como "API" para quem lê.

`## Como isso foi construído em três dias` — a seção do método. Trinta e sete commits entre 29 e 31 de julho. O `git log` é o plano executado, em fatias verticais, cada uma com a intenção declarada no assunto do commit; citar dois assuntos reais como evidência. A IA escreve muito mais rápido do que eu digito, e o que eu ponho na mesa é o desenho do sistema e as restrições. Listar as restrições como exemplo do que não se decide sozinho, apontando para as seções anteriores. Fechar com o TDD como o que segura o resultado: 12 mil das 27 mil linhas de Go são teste, o teste de deriva do OpenAPI confere a especificação contra as rotas de verdade nos dois sentidos, e os testes de invasão atacam a única superfície sem credencial com travessia de caminho em nove formas, injeção no slug, enumeração de páginas e cabeçalho `Host` forjado. Um deles encontrou um defeito real durante o desenvolvimento.

Fecho curto e concreto. Estado atual do projeto, sem conclusão reflexiva.

- [ ] **Step 3: Rodar o build**

Run: `pnpm build`
Expected: build passa e a saída lista `/projeto/upwatch/index.html`. Se o Zod reclamar do frontmatter, conferir contra o schema em `content.config.ts:68-86`.

- [ ] **Step 4: Revisar a prosa contra as restrições**

Ler o arquivo inteiro procurando: construção "X: Y" dentro de frase, travessão inserindo aparte, glifo de seta, conclusão reflexiva manufaturada, número que não veio da lista verificada do spec. Corrigir o que encontrar.

- [ ] **Step 5: Commit**

```bash
rtk git add src/content/caseStudies/upwatch.pt-br.md
rtk git commit -m "content: case study do UpWatch"
```

---

### Task 3: Case study do UpWatch em inglês e espanhol

**Files:**
- Create: `src/content/caseStudies/upwatch.en.md`
- Create: `src/content/caseStudies/upwatch.es.md`

**Interfaces:**
- Consumes: `src/content/caseStudies/upwatch.pt-br.md` da Task 2, traduzido seção por seção.

- [ ] **Step 1: Escrever a versão em inglês**

Mesmo frontmatter, com `locale: "en"` e `summary`, `highlights` e `meta` traduzidos. Os rótulos de `meta` viram `ROLE`, `TYPE`, `PERIOD`, `STACK`, e o valor de `PAPEL` vira `Developer (solo)`, seguindo o padrão de `instanta.en.md`. Mesmas seções, mesmo conteúdo, texto completo e não resumo.

Termos que ficam em inglês nos três idiomas por serem nomes de coisa: `go:embed`, `body_template`, `make build`, os nomes de arquivo e os trechos de código.

- [ ] **Step 2: Escrever a versão em espanhol**

Mesma coisa com `locale: "es"`. Rótulos de `meta` seguindo `instanta.es.md`.

- [ ] **Step 3: Rodar o build**

Run: `pnpm build`
Expected: a saída lista `/en/project/upwatch/index.html` e `/es/proyecto/upwatch/index.html`.

- [ ] **Step 4: Conferir a paridade**

Comparar os três arquivos lado a lado. Mesma quantidade de seções, mesmos títulos traduzidos, mesmos números. Nenhuma seção mais curta nas traduções.

- [ ] **Step 5: Commit**

```bash
rtk git add src/content/caseStudies/upwatch.en.md src/content/caseStudies/upwatch.es.md
rtk git commit -m "content: case study do UpWatch em en e es"
```

---

### Task 4: Case study do gather-bots em português

**Files:**
- Create: `src/content/caseStudies/gather-bots.pt-br.md`

**Interfaces:**
- Consumes: o `id` `gather-bots` da Task 1, usado como `slug` no frontmatter.
- Produces: o texto canônico que as versões `en` e `es` da Task 5 traduzem seção por seção.

- [ ] **Step 1: Escrever o frontmatter**

```yaml
---
slug: "gather-bots"
locale: "pt-br"
title: "gather-bots"
summary: "Alimenta os Smart Objects do Gather com o trabalho de verdade. PRs esperando review, pipelines quebradas, tarefas e reuniões, na mesa do escritório virtual. Projeto meu, open source sob MIT, ports and adapters do começo ao fim."
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
```

- [ ] **Step 2: Escrever o corpo**

Abertura sem `##`. A mesa no escritório virtual é decoração, quando poderia contar o que está acontecendo. Os três objetos e a pergunta que cada um responde, no espírito do bloco de exemplo do README. Nada que você não configurar roda, e um objeto com uma integração já é um sistema útil.

`## Ports and adapters, e por que não é enfeite` — o núcleo não conhece Azure DevOps, Google, Microsoft nem o Gather. O ganho concreto é que três coisas se acrescentam sem tocar no meio: uma fonte nova, uma superfície nova, ou um destino que não é o Gather, do tipo uma lâmpada Philips Hue ou uma fita de LED. Emendar a decisão de a fonte reportar fato e a superfície decidir apresentação, porque `Signal` sem campo de roteamento é o que faz Google e Outlook emitirem o mesmo tipo de sinal e dois provedores de agenda não custarem nada nas superfícies.

`## O diff que mantém o custo em zero` — o rate limit do Gather é por space, não por objeto, e três objetos com vinte itens cada, a cada minuto, abusariam dele. O dispatcher calcula o estado desejado, compara com o último enviado e emite só a diferença. Um minuto sem novidade custa zero requisições. Primeiro boot é a exceção, e manda tudo espaçado em vez de em rajada.

`## As coisas que mordem` — as decisões defensivas, que é onde está o trabalho de verdade. `activity.clear` proibido pelo tipo, com o `Command` omitindo o evento para o compilador recusar, porque um objeto carrega entradas de várias fontes e limpar apagaria as das outras. O último resultado bom valendo quinze minutos, porque reunião que acabou há uma hora é pior que reunião nenhuma. E se todas as fontes falham de uma vez, nada é escrito, porque isso é queda de rede e não tudo acabando ao mesmo tempo. A entrada de overflow acima de quinze itens no feed, porque badge de vinte e três sobre feed de quinze é interface que mente. E o feed sendo visível para todos os Members e Guests do space, o que define o limite do que pode entrar em `activity.text`.

`## O checkup` — `pnpm checkup` funciona antes de você configurar qualquer coisa, e é justamente esse o objetivo. Nunca falha por falta de configuração, só diz o que falta. Três estados por objeto e por integração, e só a linha de configurado e quebrado merece atenção.

`## O design doc veio antes` — a seção do método, e aqui a prova é literal. Um documento de desenho escrito antes do código, com as decisões numeradas, a tabela de capabilities por preset lida da documentação do SDK, o registro de duas incertezas fechadas contra o space real, e uma sequência de build. Os commits saíram na ordem daquela sequência. Contar também a decisão que o documento derrubou: a documentação de suporte descrevia a lâmpada mudando de cor, o comportamento observado não bateu, nem o SDK nem a referência expõem qualquer campo de cor, e por isso a distinção entre produção e develop foi para o objeto de status em vez de uma lâmpada colorida. Fechar dizendo o que isso significa sobre construir com agentes: a IA escreve muito mais rápido, e o que decide o resultado é ter respondido as perguntas difíceis antes.

Fecho curto e concreto.

- [ ] **Step 3: Rodar o build**

Run: `pnpm build`
Expected: build passa e a saída lista `/projeto/gather-bots/index.html`.

- [ ] **Step 4: Revisar a prosa contra as restrições**

Mesma passada da Task 2, Step 4.

- [ ] **Step 5: Commit**

```bash
rtk git add src/content/caseStudies/gather-bots.pt-br.md
rtk git commit -m "content: case study do gather-bots"
```

---

### Task 5: Case study do gather-bots em inglês e espanhol

**Files:**
- Create: `src/content/caseStudies/gather-bots.en.md`
- Create: `src/content/caseStudies/gather-bots.es.md`

**Interfaces:**
- Consumes: `src/content/caseStudies/gather-bots.pt-br.md` da Task 4, traduzido seção por seção.

- [ ] **Step 1: Escrever a versão em inglês**

`locale: "en"`, rótulos de `meta` como `ROLE`, `TYPE`, `PERIOD`, `STACK`, valor de papel como `Developer (solo)`. Mesmas seções e mesmo conteúdo.

Termos que ficam em inglês nos três idiomas: `activity.clear`, `Command`, `activity.text`, `pnpm checkup`, `Signal`, `Members`, `Guests`, `space`, `node:24-alpine`, e os nomes de arquivo.

- [ ] **Step 2: Escrever a versão em espanhol**

`locale: "es"`, rótulos de `meta` seguindo `instanta.es.md`.

- [ ] **Step 3: Rodar o build**

Run: `pnpm build`
Expected: a saída lista `/en/project/gather-bots/index.html` e `/es/proyecto/gather-bots/index.html`.

- [ ] **Step 4: Conferir a paridade**

Mesma comparação da Task 3, Step 4.

- [ ] **Step 5: Commit**

```bash
rtk git add src/content/caseStudies/gather-bots.en.md src/content/caseStudies/gather-bots.es.md
rtk git commit -m "content: case study do gather-bots em en e es"
```

---

### Task 6: Timeline e stats

**Revertida em parte, 2026-07-31.** Depois de ver na tela, o João pediu pra tirar os dois projetos do "Percurso", porque aquela seção é só trabalho formal. As duas entradas saíram, e com elas o `caseStudySlug` no schema e a resolução de URL no `TimelineSection.astro`, que ficariam sem nenhum consumidor. A atualização das stats no Step 4 continua valendo. O que está escrito abaixo é o registro do que foi feito antes da reversão.

**Files:**
- Modify: `src/content.config.ts:29` (campo `caseStudySlug` opcional na collection `timeline`)
- Modify: `src/components/TimelineSection.astro:7,21,52` (montar o `href` localizado)
- Modify: `src/content/timeline/timeline.json`
- Modify: `src/content/stats/stats.json:5`

**Interfaces:**
- Consumes: os `id` da Task 1 e as páginas criadas nas Tasks 2 e 4, referenciadas por `caseStudySlug`.
- Produces: `caseStudySlug?: string` na collection `timeline`, resolvido em URL pela função `caseStudyUrl(type, slug, locale)` que já existe em `src/utils/constants.ts`.

- [ ] **Step 1: Acrescentar `caseStudySlug` ao schema da timeline**

Em `src/content.config.ts`, na collection `timeline`, ao lado de `href`:

```ts
      href: z.string().optional(),
      caseStudySlug: z.string().optional(),
```

O `href` continua existindo para link arbitrário. Nenhuma entrada usa nenhum dos dois hoje.

- [ ] **Step 2: Localizar o link no `TimelineSection.astro`**

O campo `href` é passado direto para `TimelineEntry` (`TimelineSection.astro:52`), sem localizar. Uma URL fixa `/projeto/upwatch` levaria o leitor de `/en` e `/es` para a página em português. Resolver com o helper que as rotas já usam.

Acrescentar o import:

```astro
import { caseStudyUrl } from '../utils/constants';
```

E trocar a linha do `href`:

```astro
          href={item.caseStudySlug ? caseStudyUrl('project', item.caseStudySlug, localeKey) : item.href}
```

- [ ] **Step 3: Inserir as duas entradas da timeline**

Schema em `content.config.ts:21-34`. A posição no array não importa, porque `TimelineSection.astro:18-19` ordena por `date` de forma decrescente antes de renderizar. Ainda assim, inserir no topo mantém o arquivo legível na mesma ordem em que aparece na tela.

```json
{
  "type": "project",
  "date": "2026",
  "title": { "pt-br": "UpWatch", "en": "UpWatch", "es": "UpWatch" },
  "description": { "pt-br": "...", "en": "...", "es": "..." },
  "tech": ["Go", "SQLite", "PostgreSQL", "React 19"],
  "caseStudySlug": "upwatch"
},
{
  "type": "project",
  "date": "2026",
  "title": { "pt-br": "gather-bots", "en": "gather-bots", "es": "gather-bots" },
  "description": { "pt-br": "...", "en": "...", "es": "..." },
  "tech": ["TypeScript", "Node 24", "Docker"],
  "caseStudySlug": "gather-bots"
}
```

`description` é uma frase curta, no tom das entradas de carreira que já existem. Para o UpWatch, monitoramento de disponibilidade em Go num binário único, open source sob AGPL, com a interface embarcada e conformidade verde em SQLite e PostgreSQL. Para o gather-bots, Smart Objects do Gather alimentados por PRs, pipelines, tarefas e agenda, open source sob MIT, em ports and adapters.

Os dois entram com a mesma `date`, e `Array.prototype.sort` é estável, então a ordem entre eles no arquivo é a ordem na tela.

- [ ] **Step 4: Atualizar o número de repositórios**

Em `src/content/stats/stats.json:5`, trocar `"value": 42` por `"value": 46`. Os outros dois números continuam corretos.

- [ ] **Step 5: Rodar o build**

Run: `pnpm build`
Expected: build passa. Se o Zod reclamar, `type` só aceita `career` ou `project`.

- [ ] **Step 6: Conferir a renderização nos três idiomas**

Run: `pnpm preview` e abrir a seção "Percurso" em `/`, `/en` e `/es`
Expected: as duas entradas de 2026 no topo, com o marcador de círculo vazado que distingue `project` de `career`. No tema escuro, o marcador é vermelho. Os títulos são links, e o link leva ao case study **do idioma da página** — `/projeto/upwatch` em `/`, `/en/project/upwatch` em `/en`, `/es/proyecto/upwatch` em `/es`. O contador de repos anima até 46.

- [ ] **Step 7: Commit**

```bash
rtk git add src/content.config.ts src/components/TimelineSection.astro src/content/timeline/timeline.json src/content/stats/stats.json
rtk git commit -m "content: UpWatch e gather-bots na timeline, repos atualizados"
```

---

### Task 7: Verificação final

**Files:** nenhum, a menos que a verificação encontre defeito.

- [ ] **Step 1: Build limpo**

Run: `pnpm build`
Expected: sem erro e sem aviso novo. A saída lista 24 páginas de case study, 8 projetos vezes 3 idiomas.

- [ ] **Step 2: Conferir as seis URLs novas**

Run: `pnpm preview`
Abrir: `/projeto/upwatch`, `/en/project/upwatch`, `/es/proyecto/upwatch`, `/projeto/gather-bots`, `/en/project/gather-bots`, `/es/proyecto/gather-bots`
Expected: cada uma renderiza com o cabeçalho, os três highlights, a faixa de meta e o corpo. Conferir no `<head>` que `canonical` e as três `alternate` hreflang apontam para as URLs certas, e que o JSON-LD de `CreativeWork` está presente.

- [ ] **Step 3: Conferir a home nos três idiomas**

Abrir: `/`, `/en`, `/es`
Expected: os dois cards novos no topo da seção de projetos, com o selo PROJETO traduzido, os links funcionando, e o "Ler case study" levando à página do idioma correspondente. Na seção "Percurso", as duas entradas de 2026 com link também localizado.

- [ ] **Step 4: Passada de revisão de prosa**

Ler os seis arquivos de case study procurando os padrões proibidos das Global Constraints. Conferir também que nenhum número no texto está fora da lista verificada do spec.

- [ ] **Step 5: Commit, se a verificação corrigiu algo**

```bash
rtk git add -A
rtk git commit -m "content: correções da revisão final"
```
