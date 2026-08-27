---
target: home page (src/pages/index.astro)
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 3
timestamp: 2026-08-27T18-15-49Z
slug: src-pages-index-astro
---
Method: dual-agent (A: revisão de design sem âncora · B: detector + evidência de browser)

Alvo: `src/pages/index.astro`, nos dois temas. Modo: Experience.

## Design Health Score

| # | Heurística | Score | Achado principal |
|---|-----------|-------|------------------|
| 1 | Visibilidade do estado | 2 | O ScrollSpy rastreia só sobre/projetos/contacto; nos 998px do #timeline o indicador da nav fica vazio. |
| 2 | Correspondência com o mundo real | 2 | Numeração de folhas vai FL. 02/06 → 04/06 → 06/06. As folhas 01, 03 e 05 não existem. |
| 3 | Controle e liberdade | 3 | `scroll-margin-top` é 0 em todo o projeto contra nav fixa de 77px: toda âncora aterrissa errada. |
| 4 | Consistência e padrões | 2 | BLOG é tipograficamente idêntico a três âncoras internas, mas sai da página. |
| 5 | Prevenção de erro | 3 | `#email-link` ainda é `href="#"` reescrito por script inline. |
| 6 | Reconhecer em vez de lembrar | 2 | Ordinais 01–08 sugerem ranking; `.project-year` mostra 2026 em cinco dos oito. |
| 7 | Flexibilidade e eficiência | 2 | Oito gatilhos idênticos, sem filtro, sem expandir-todos. |
| 8 | Estética e minimalismo | 2 | O maior elemento da dobra final no claro é o CTA "Fala comigo." a 44px, num produto cujo sucesso declarado não é contato. |
| 9 | Recuperação de erro | 3 | Sem superfícies de erro; a única falha (e-mail sem JS) falha em silêncio. |
| 10 | Ajuda e documentação | n/a | Superfície Experience, sem afordância de ajuda. |
| **Total** | | **21/36** | **Acceptable (58%)** |

Não é comparação like-for-like com a rodada anterior (17/32, duas heurísticas n/a). Nas mesmas oito de antes: 17 → 18.

A nota quase não mexeu, mas não porque as correções falharam. Elas landaram: zero falhas de contraste em 573 nós nos dois temas, zero warnings no detector, rampa de tipo limpa, zero overflow em 390px. Uma leitura mais funda achou problemas mais fundos, que sempre estiveram lá.

## Design Specificity Verdict

**Claro — ainda intercambiável.** Tire quatro dispositivos decorativos (eyebrows de prancheta, furos, carimbo, grade a 6%) e sobra o template padrão de portfólio de dev. A paleta é distintiva; paleta não é composição.

**Escuro — fortemente específico, e específico da coisa errada.** `.dark .project-title` renderiza `gather-bots` em Permanent Marker: o identificador canônico do artefato fica ilegível justo no tema de quem veio procurar por ele. Viola a Regra do Marcador do próprio DESIGN.md.

O tema que é julgado não tem invenção; o tema com toda a invenção não é julgado.

**Detector:** 8 achados, zero warnings — todos #000/#fff em cortina, scrim, tarja de vídeo e bloco de impressão.

**Supressões:** cada uma esconde exatamente um achado hoje. Mas a de `side-tab` usa valor `*` escopado ao global.css, isentando prospectivamente qualquer padrão futuro naquele arquivo; e a razão registrada cita AboutSection.astro:91 como "segue valendo", quando aquele achado já foi corrigido. Larga demais e com razão obsoleta.

**Overlay:** claro 135 elementos/140 achados; escuro 182/263. O delta é quase todo dark-glow: 13 → 129.

**Contraste:** 272 nós no claro, 301 no escuro, zero falhas de conteúdo real nos dois.

## What's Working

1. O contrato de divulgação progressiva do card de projeto: controle de 44px, link da página completa rebaixado dentro do corpo revelado, `visibility: hidden` tirando links colapsados da ordem de foco com aria-expanded honesto.
2. Disciplina de contraste real: pior caso 4,71:1 no claro, mínimo 8,40:1 no escuro. A escada de superfícies do claro desce monotonicamente.
3. Paridade trilíngue verificada em nível de chave: 130 chaves por idioma, zero faltando.
4. Uma única imagem buscada na home clara; os adesivos nunca carregam.

## Priority Issues

### [P0] A primeira dobra não contém trabalho, e a coluna direita está 71% vazia
`.hero-panel` mede 403×149 numa célula de 403×519 — 370px mortos. O moat do produto começa 2.776px abaixo da dobra. A Regra da Coluna que se Preenche está sendo quebrada no eixo vertical pelo painel escrito para resolvê-la no horizontal.
Fix: encher o painel com o registro (PROJETOS 8 · CASE STUDIES 8 · IDIOMAS 3 · ANOS 5+ · EMPRESAS 4) ou colapsar o grid para uma coluna.
Comando: /impeccable layout src/components/HeroSection.astro

### [P1] `.case-study-text` corre a 125ch
Sem max-width, renderiza a 1000px. As duas irmãs foram capadas a 70ch no passe de polish, com comentário. Ficou justo a terceira, que carrega o conteúdo que o posicionamento chama de diferencial. Overlay: 36 hits de line-length, 24 nesse seletor.
Fix: max-width: 70ch.
Comando: /impeccable polish src/components/CaseStudyContent.astro

### [P1] Oito linhas indistinguíveis, com ordinal que afirma ranking inexistente
Cards mostram 01–08 em mono de 40px, mas a ordem não é cronológica nem agrupada por tipo, e .project-year mostra 2026 em cinco dos oito. Lista numerada é lida como ranking; o número é a coisa mais alta da linha e não significa nada.
Fix: tornar o ordinal verdadeiro, ou rebaixá-lo a 10px e pôr no lugar a cifra checável do caseStudy.result.
Comando: /impeccable layout src/components/ProjectCard.astro

### [P1] Navegação aterrissa errada, omite uma seção e disfarça saída de página
- scroll-margin-top é 0: eyebrow de #projetos em y=64 totalmente coberto pela nav de 77px.
- #timeline não está no navLinks nem no sectionIds do ScrollSpy. O Percurso não está na navegação.
- BLOG sai da página vestido igual às âncoras internas.
Fix: scroll-margin-top 96px; adicionar timeline; sinal de partida no BLOG.
Comando: /impeccable clarify src/components/NavBar.astro

### [P2] A numeração de folhas está errada
FL. 02/06 → 04/06 → 06/06; as folhas 01, 03 e 05 nunca aparecem. E paper.case afirma FL. 01, colidindo. Idêntico nos três idiomas. É o único ponto onde a linguagem de prancheta faz afirmação verificável.
Fix: numerar consecutivamente ou remover o denominador /06.
Comando: /impeccable clarify src/i18n

## Persona Red Flags

**Alex (power user).** Aterrissa com o eyebrow sob a nav. Oito gatilhos idênticos de 12px, sem filtro. O caminho rápido (GitHub) está a 12px, 5,70:1, 400px à direita. Sai tendo aberto zero cases.

**Sam (acessibilidade).** Contraste e foco bons; corpos colapsados saem da ordem de foco. Mas o esquema de headings é h1 → h2 Sobre → h2 Percurso → h2 Projetos → nada: #contacto não tem heading. Quem navega por heading não alcança o contato.

**Casey (mobile).** 7.320px a 390px, ~8,7 telas; #projetos ocupa 3.348px (46%). O painel de prova cai em y=650–799, na borda da primeira tela.

**Dev colega.** O método está atrás de oito botões cinzas idênticos e corre a 125ch. No escuro o título do projeto vira Permanent Marker.

## Minor Observations

- A dobra final no escuro quebra a Regra do Alarme por cerca de três peças simultâneas.
- Conteúdo transparece pela nav fixa (95% opaca, sem backdrop-filter).
- Três ritmos de seção: vãos de 160, 128 e 192px, fora da escala que fecha em 64.
- 69 execuções de texto a 10px; o piso de 11px recomendado no audit nunca foi aplicado.
- Os quatro timeline-title são "Full Stack Developer @ <Empresa>"; liderar pela empresa tornaria a seção escaneável.
- ~60 linhas de CSS morto reposicionando .punk-sticker abaixo de 1024px, onde ele é display:none.
- src/content/certifications/ está vazio, mas sections.certifications existe nos três idiomas.
- Os alvos por pseudo-elemento são assimétricos: a faixa do .navbar-cv vai de y=15 a 59 num botão de 30px.
- Três links do rodapé abaixo de 44px de largura (35, 30, 27). Passam no SC 2.5.8 (24x24).
- O pullquote destaca a cópia que quebra a regra de voz da marca (emenda por dois-pontos, travessão no meio).

## Nota sobre a island CaseStudyExpander

Sob o client:visible que está no código, o módulo nunca é buscado — não aparece em performance.getEntriesByType('resource') mesmo após rolar o details para o centro da viewport. Consistente com a explicação original: astro-island é display:contents com zero filhos, não gera caixa, e o IntersectionObserver nunca dispara.

A retratação feita no passo de polish foi excessiva: a observação "o módulo foi baixado" tinha sido tomada com a diretiva temporariamente em client:idle, que não depende de geometria.

## Questions to Consider

1. Se o registro é o produto, por que a página abre com o autor e fecha com um pedido de contato, e nunca, em nenhum tamanho acima de 24px, diz quanto trabalho existe?
2. Tudo genuinamente inventado vive no tema que os usuários não veem. Dado que a única evidência de usuário é "acharam o claro feio e não viram o escuro", sobre o que o tema claro tem permissão de ser barulhento?
3. `max-width: 70ch` foi escrito em duas descrições com comentário explicando a medida, e `.case-study-text` ficou a 125ch. O case study é tratado como o produto, ou como a coisa atrás do botão?
