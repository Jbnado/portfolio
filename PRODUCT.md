# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primário — recrutador ou tech lead.** Chega pelo LinkedIn, pelo CV ou por busca direta, com poucos minutos e uma decisão binária a tomar: esse candidato avança ou não. Lê em diagonal, abre um projeto, procura evidência de nível.

**Primário — dev colega.** Chega pelo blog, pelo canal do YouTube ou por um repositório open source. Não quer vitrine, quer método: por que essa decisão de arquitetura, o que foi testado, o que foi descartado.

Os dois compartilham uma característica confirmada em entrevista: **entram no tema claro e formam a primeira impressão ali.** Pessoas reais disseram ao autor que acharam o modo claro feio, e não chegaram a ver o modo escuro. O toggle de tema não é acionado antes do julgamento acontecer.

Audiências secundárias observadas no repositório mas não confirmadas em entrevista: clientes avaliando trabalho contratado, e pares da comunidade RP.js.

## Product Purpose

jbnado.dev é o **registro de obra** de João Bernardo — o catálogo definitivo e correto do que ele construiu. O sucesso não é medido em contatos gerados nem em audiência recorrente: é medido pelo catálogo estar completo, preciso e verificável, independentemente de quem lê.

Isso subordina tudo o mais. Uma mudança que aumentasse conversão às custas da precisão do registro seria uma regressão.

## Positioning

*(derivado do repositório, não confirmado em entrevista)*

Cada projeto carrega um case study estruturado em problema → decisão → resultado, escrito nos três idiomas, com números específicos e rastreáveis (linhas de código, quantidade de funções de teste, limites de memória, licenças). O diferencial é a profundidade documentada da decisão de engenharia, não a listagem de tecnologias. Um portfólio vizinho pode copiar o layout; não pode copiar o fato de que cada projeto tem um trade-off explicado por escrito e um número que aguenta ser checado.

## Operating Context

- Site trilíngue com rotas próprias por idioma: `pt-br` como padrão sem prefixo, `/en/` e `/es/`. Nav, CV, RSS e conteúdo existem nos três.
- Superfícies publicadas: home (hero, sobre, timeline, projetos, certificações, contato), páginas de case study (`/projeto/`, `/contribuicao/` e seus equivalentes localizados), blog com busca no cliente, tags e paginação, 404, feeds RSS por idioma, `llms.txt` gerado do conteúdo publicado.
- Conteúdo vive em Astro Content Collections: `blog/`, `caseStudies/`, `projects/`, `stats/`, `timeline/`, `certifications/` — um arquivo Markdown por idioma nos casos de texto longo, JSON multilíngue nos catálogos.
- Funil de entrada externo: GitHub `@Jbnado`, LinkedIn `jbnado`, canal do YouTube `@jbnad`, e-mail `contato@jbnado.dev`.
- Publicação na Vercel com saída estática. Cabeçalhos de segurança e CSP configurados em `vercel.json` — o `astro dev` não os aplica, então validação de terceiros exige servir o `dist`.
- O site tem dois modos de tema com identidades visuais distintas. **O modo claro é o padrão e essa é regra fechada**, reafirmada em entrevista: não se adiciona detecção de `prefers-color-scheme`, e o trabalho futuro corrige o modo claro em vez de trocar qual abre primeiro.

## Capabilities and Constraints

**Confirmado e vinculante:**

- **Paridade total nos três idiomas.** Nada entra só em português. Seção, post e case study saem em pt-br, en e es ao mesmo tempo.
- **WCAG AA como piso.** Contraste, foco visível, `prefers-reduced-motion` e navegação por teclado são requisito de aceite, não melhoria opcional. AAA onde couber.
- **Zero terceiros invasivos.** Sem analytics que rastreie o visitante, embeds sempre em modo privacidade (`youtube-nocookie`), fontes variáveis self-hosted.
- **Tema claro é o padrão**, sem detecção de preferência do sistema.

**Restrições técnicas herdadas:**

- HTML por padrão via Astro; JavaScript no cliente apenas nas ilhas Preact que exigem interação (navegação mobile, scroll spy, contadores, busca do blog, expansores de case study, toggle de tema).
- Estilos concentrados em `src/styles/global.css` e `src/styles/islands.css`. Não há CSS Modules nem styled-components no projeto.
- `sharp` precisa ser dependência direta, não transitiva, sob pena de falha de build na Vercel.
- O script inline de prevenção de flicker de tema roda no `<head>` antes das folhas de estilo.

**Explicitamente em aberto:**

- Se o método assistido por agentes deve aparecer explícito no conteúdo dos projetos. Não foi confirmado como compromisso vinculante nesta entrevista; trabalho futuro não deve assumir nem uma coisa nem outra sem perguntar.
- Nenhuma decisão tomada sobre audiências secundárias (cliente contratante, comunidade) como alvo de design.

## Brand Commitments

- Nome e domínio: João Bernardo, jbnado.dev. Handles: GitHub `@Jbnado`, LinkedIn `jbnado`, YouTube `@jbnad` (atenção: `@Jbnado` no YouTube é outra pessoa).
- Voz autoral em primeira pessoa, direta, sem entusiasmo de release. O corpus existente evita construções de texto gerado — sem emenda por dois-pontos, sem travessão no meio da frase, sem "lição aprendida" fabricada.
- O site tem duas identidades de tema já implementadas e maduras. Elas são autoridade visual incumbente; o registro visual em si pertence ao DESIGN.md, que este arquivo não escreve.

## Evidence on Hand

**Real e publicável:**

- 8 case studies completos × 3 idiomas em `src/content/caseStudies/` (upwatch, gather-bots, instanta, adg, alethe, portfolio-jb, ribeirao-noir, rpjs-community).
- `src/content/projects/projects.json`: catálogo com problema/decisão/resultado por projeto e números específicos — UpWatch com 27 mil linhas de Go, 12 mil de teste, 651 funções de teste; gather-bots com 130 casos de teste e imagem de ~1 MB sobre `node:24-alpine`; Instanta com testes de integração no `workerd`.
- `src/content/timeline/timeline.json`: trajetória com Verzel (2025) e entradas anteriores. Empresas citadas na cópia: Authorify (EUA), Take, Verzel.
- `src/content/stats/stats.json`: 5+ anos de experiência, 4 empresas, 46 repositórios no GitHub.
- Currículos em três idiomas: `public/Bernardo-CV.pdf`, `Bernardo-CV-en.pdf`, `Bernardo-CV-es.pdf`.
- Foto autoral (`public/jbnado.jpg` / `.webp`) e imagem Open Graph gerada por `scripts/gen-og.mjs`.
- 2 posts de blog × 3 idiomas.
- Fatos biográficos confirmados na cópia: co-fundador da RP.js (comunidade JavaScript de Ribeirão Preto); Ribeirão Noir, jogo investigativo lançado na Feira do Livro e validado por 3 doutores.
- Auditorias técnicas próprias em `docs/auditoria-visual-design-2026-08.md` e `docs/auditoria-front-seo-2026-08.md`, com ratios de contraste calculados.

**Evidência de usuário:**

- Relato direto de pessoas reais ao autor: o modo claro foi considerado feio, e o modo escuro não chegou a ser visto. É o único dado de usuário registrado sobre o site.

**Ausências que trabalho futuro NÃO pode fabricar:**

- Não há depoimentos, testemunhos nem citações de clientes.
- Não há logos de clientes nem prova de contratação.
- Não há métricas de tráfego, conversão ou audiência.
- Não há preço, pacote de serviço nem oferta comercial.
- Nenhum prêmio, certificação de terceiro ou selo além do que já está em `src/content/certifications/`.

## Product Principles

1. **O registro é o produto.** Completude e correção do catálogo vencem qualquer ganho de ornamento ou conversão. Um número errado custa mais do que uma tela sem graça.
2. **A primeira impressão acontece no claro.** O visitante julga antes de tocar no toggle. O modo escuro é recompensa para quem fica, nunca desculpa para o modo claro ser fraco.
3. **Paridade trilíngue é condição de entrega, não tradução posterior.** Uma feature que só existe em português não está pronta.
4. **Acessibilidade AA é critério de aceite.** Sai do escopo de "melhoria" e entra no de "não passa sem".
5. **Nada de terceiros entre o visitante e o conteúdo.** Sem rastreio, sem embed que vaze, sem fonte remota.

## Accessibility & Inclusion

- WCAG 2.1 nível AA como piso obrigatório em ambos os temas; AAA onde o contraste permitir.
- `prefers-reduced-motion: reduce` desliga as animações decorativas — já implementado e não regressível.
- `prefers-contrast: high` é atendido com valores mais brilhantes no tema escuro.
- Navegação por teclado completa, foco visível e skip-to-content presente.
- Texto decorativo (linhas de terminal, tags de papel) fica em `data-txt` e `::before`, mantendo o HTML limpo para leitores de tela e modo de leitura do navegador. Esse padrão é requisito, não detalhe de implementação.
- Leitura prolongada no modo escuro é um problema conhecido e documentado na auditoria própria: mono global, brilho de fósforo e overlay CRT causam fadiga em artigos longos.
