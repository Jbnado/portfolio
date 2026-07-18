# Termos Reais de Terminal e Prancheta — Design Spec

Data: 2026-07-18
Status: aprovado em brainstorm (decisões do João registradas abaixo)

## Objetivo

Substituir os textos decorativos inventados ("`> SISTEMA_ONLINE — READY`", "`> CASE_STUDY`", carimbo "DOSSIÊ", "`VOLTAR_AO_DECK`") por artefatos que devs reconhecem de verdade: comandos shell reais no tema dark (terminal CRT) e linguagem real de documentação de engenharia no tema light (mesa de engenharia). Adicionar uma statusline de terminal que "digita" o comando ao clicar em links (dark only).

## Decisões do brainstorm

1. **Cada tema no seu universo**: dark ganha shell real (`cd`, `ls`, `git log`, `systemctl`); light ganha papelada real de engenharia (FL. 02/06, REV. 03, MEMORIAL DESCRITIVO, HISTÓRICO DE REVISÕES). Nada de comando impresso em papel manila.
2. **Comando como eyebrow**: os títulos humanos ficam (h2 "Projetos" continua sendo o nome acessível); o comando entra como linha decorativa mono acima. Nenhum título vira comando.
3. **Tom: humor dev em tudo**: os comandos são 100% reais (existem em man page); o humor mora nos *outputs* (`whoami` → "fullstack developer", `ping bernardo` respondendo de Ribeirão Preto, `exit` → "Connection to jbnado.dev closed.").
4. **Animação de clique: statusline fixa no rodapé** (estilo tmux/vim), dark only, digitação ≤300ms, invisível até o clique.

## Arquitetura da troca por tema

Cada ponto decorado renderiza **dois elementos**, ambos `aria-hidden="true"`:

- `.term-line` — a linha de shell; `display: none` quando `html.light`.
- `.paper-tag` — o rótulo de prancheta; `display: none` quando `html.dark`.

CSS puro decide (as classes `.dark`/`.light` já existem no `<html>`). Zero JS novo para os eyebrows, zero flash na troca de tema, i18n pelo sistema atual (`t()`).

**Componente novo:** `src/components/SectionEyebrow.astro`

```
Props: { term: string; paper: string }
Renderiza:
  <span class="term-line" aria-hidden="true">{term}</span>
  <span class="paper-tag" aria-hidden="true">{paper}</span>
```

Usado pelos componentes de seção imediatamente acima do `SectionTitle` existente (componente separado; `SectionTitle` não muda). O prompt padrão `jbnado@rp:~$ ` faz parte da string `term`.

**Abordagens descartadas:** strings via CSS `content:` (sai do sistema i18n); island JS trocando texto (JS desnecessário, flash na troca).

## Inventário de copy

Comandos são idênticos nos 3 idiomas (shell real é inglês/universal). Outputs e papelada são localizados via chaves novas `terminal.*` e `paper.*` nos 3 JSONs de i18n. Valores pt-br abaixo; en/es traduzem outputs/papelada, nunca os comandos.

| Ponto | DARK (`terminal.*`) | LIGHT (`paper.*`) |
|---|---|---|
| Hero boot (substitui `hero.boot`) | `jbnado@rp:~$ whoami` — a linha de role existente ("fullstack developer") vira o output do comando | `PROJ. Nº 001/2026 · REV. 03` |
| Hero status (substitui `hero.status`) | `● active (running) — aberto a projetos` | carimbo `DISPONÍVEL` |
| Hero tech list | `jbnado@rp:~$ cat ~/.stack` acima da lista | `MATERIAIS:` antes da lista |
| Sobre (substitui carimbo `DOSSIÊ`) | `jbnado@rp:~$ cat sobre-mim.md` | `FL. 02/06 · RESPONSÁVEL TÉCNICO` |
| Percurso/timeline | `jbnado@rp:~$ git log --oneline --reverse` | `HISTÓRICO DE REVISÕES` |
| Projetos | `jbnado@rp:~$ cd ~/projetos && ls -la` | `FL. 04/06 · MEMORIAL DESCRITIVO` |
| Contato | `jbnado@rp:~$ ping -c 1 bernardo` + output `64 bytes from Ribeirão Preto: time=1ms` | `ASSINATURA DO RESPONSÁVEL` |
| Case study eyebrow (substitui `caseStudy.eyebrow`) | `jbnado@rp:~/projetos$ less <slug>.case.md` (slug real, composto no frontmatter Astro — sem interpolação no `t()`) | `MEMORIAL DESCRITIVO · FL. 01` |
| Voltar do case (corrige o bug `{t('caseStudy.back')}_AO_DECK` em `CaseStudyPage.astro:24`) | `cd ..` (aria-label localizado: "Voltar") | `← VOLTAR AO ÍNDICE` |
| 404 | `bash: /essa-pagina: No such file or directory`; botão de volta vira `cd ~` | `FL. NÃO ENCONTRADA · VERIFICAR NUMERAÇÃO` |
| Footer | `jbnado@rp:~$ exit` + `Connection to jbnado.dev closed.` | `FIM DO DOCUMENTO · FL. 06/06` |
| LanguageSwitcher (tooltip/aria mantidos) | comando na statusline ao trocar: `export LANG=pt_BR` / `en_US` / `es_ES` | sem mudança |

**Fica como está:** punch-card dos cards (`COL: 80 · ROW: 12`, `IBM_FORMAT` — formato real de cartão de 80 colunas), elementos punk/JoJo (gogo, BOOM!, stickers — identidade, não cosplay de terminal), curtain transition do theme toggle.

## Statusline de digitação (island nova)

**Arquivo:** `src/islands/TermStatusline.tsx`, montada no `BaseLayout` com `client:idle`.

**Comportamento:** barra fina fixa na base do viewport, invisível até um clique elegível. Ao clicar, digita o comando caractere a caractere e então deixa a navegação acontecer.

**Regras (todas obrigatórias):**

- **Dark only**: checa `document.documentElement.classList.contains('dark')` no momento do clique. No light, nada acontece.
- **`prefers-reduced-motion: reduce`**: island não intercepta nada; navegação instantânea.
- **Cliques modificados** (ctrl/cmd/shift/alt, botão do meio): nunca interceptados — abrir em nova aba funciona nativo.
- **Links `target="_blank"` e âncoras internas (`#...`)**: NUNCA atrasados. `_blank`: sem `preventDefault`, a animação roda em paralelo (fire-and-forget). Âncoras: não disparam statusline (o scroll começa na hora; digitação viraria ruído).
- **Navegação same-tab interna**: `preventDefault` → digita → `location.href`. Custo total ≤300ms (velocidade ~12ms/char; comandos longos aceleram para caber no teto).
- **Comando por link**: atributo `data-cmd` opcional no `<a>`; fallback automático: interno → `cd <path>`, externo → `xdg-open <url>` (URL truncada em ~40 chars com `…`), CV → `scp jbnado.dev:cv.pdf ~/Downloads/`, e-mail → `mail -s "oi" bernardo` (endereço NUNCA impresso — preserva a ofuscação existente).
- **A11y**: container `aria-hidden="true"`; sem roubo de foco; sem impacto em navegação por teclado (Enter dispara `click` e segue as mesmas regras).
- **Sem JS** (island não carregou): links funcionam 100% normal.
- Compatível com as view transitions cross-document já planejadas (navegação por `location.href` mesma origem dispara a transição normalmente).

## i18n

- Namespaces novos `terminal` e `paper` nos 3 JSONs; as chaves antigas `hero.boot`, `hero.status` e `caseStudy.eyebrow` são REMOVIDAS dos 3 JSONs (as novas chaves as substituem; nenhum reaponte).
- Comandos: mesma string nos 3 locales. Outputs e papelada: localizados (en: `SHEET 02/06 · TECHNICAL LEAD ON RECORD`, `REVISION HISTORY`, `SPECIFICATION REPORT`; es: `HOJA 02/06`, `HISTORIAL DE REVISIONES`, `MEMORIA DESCRIPTIVA`).
- O `_AO_DECK` hardcoded morre junto com o bug.

## Critérios de sucesso

1. `rtk grep -r "SISTEMA_ONLINE\|CASE_STUDY\|DOSSIÊ\|_AO_DECK" src/` → zero resultados.
2. Todo comando exibido existe em man page (cd, ls, cat, git, ping, whoami, less, exit, export, xdg-open, scp, mail, bash).
3. h2s continuam texto humano; tudo decorativo tem `aria-hidden`.
4. `rtk pnpm build` verde; Lighthouse CI sem regressão.
5. Com `prefers-reduced-motion` ou JS desligado, navegação idêntica à atual.

## Fora de escopo

- Qualquer mudança de layout, cor, tipografia ou nos elementos punk.
- Animação de digitação no tema light (papel não digita).
- Interpolação no `t()` (o slug do case é composto no Astro; se a fase de qualidade adicionar interpolação, é decisão independente).
