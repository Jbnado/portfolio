# Revisão crítica do README — 12 de agosto de 2026

## Veredito geral

O README novo é bem mais fiel ao projeto atual do que o anterior. A reescrita removeu várias afirmações falsas ou vencidas, atualizou a estrutura de pastas, incluiu blog, estudos de caso, RSS, `llms.txt`, Vitest e os três conjuntos de rotas. Todos os comandos documentados existem em `package.json`, e a URL de clone corresponde ao `origin` do repositório.

Ainda assim, ele não está pronto para publicação sem correções. Há dois erros factuais que afetam diretamente a confiança e a instalação: a negação do Lighthouse CI que existe no repositório e o requisito amplo demais de Node.js. Também há uma descrição incorreta da renderização como feita “no servidor”, apesar do deploy estático, e uma contradição sobre o foco do menu mobile.

Para um recrutador, a abertura comunica a stack e a abrangência em poucos segundos, mas logo vira um inventário técnico. O diferencial do trabalho — decisões de arquitetura, progressive enhancement, conteúdo multilíngue e cuidado com entrega — não é sintetizado em uma frase de resultado. Para quem clona, o fluxo é curto e quase suficiente, porém pode falhar em versões antigas do Node 18 e não explica com precisão o que reproduz a publicação da Vercel.

**Modelo estrutural usado na análise:** explicação conceitual com quickstart, para leitores humanos.  
**Tamanho atual:** cerca de 1.310 palavras em 9 seções de nível 2.  
**Ordem recomendada:** apresentação e prova visual → diferenciais demonstrados → stack → execução → arquitetura e conteúdo → qualidade/SEO/acessibilidade → design system resumido → licença.

## Achados de prioridade alta

### 1. O README nega uma auditoria automatizada que existe

- **Local:** `README.md:171`; `.github/workflows/lighthouse.yml:32`; `.github/lighthouse/lighthouserc.json:7`
- **O que está errado:** o texto diz que “não há auditoria automatizada de acessibilidade no CI”. O workflow `Build & Lighthouse CI` roda em pushes e pull requests para `main`, chama Lighthouse CI e exige nota mínima de 0,95 tanto em performance quanto em acessibilidade.
- **Por que importa:** é um erro factual verificável e apaga uma evidência forte de qualidade para recrutadores. Também cria contradição com arquivos versionados no próprio repositório.
- **Correção sugerida:** informar que o CI executa Lighthouse nas rotas `/`, `/en/` e `/es/`, com limiar de 95% para performance e acessibilidade. Manter a ressalva correta de que Lighthouse não prova conformidade WCAG 2.1 AA.
- **Vale a pena corrigir:** **sim**.

### 2. O requisito de Node.js permite versões incompatíveis

- **Local:** `README.md:45`; `pnpm-lock.yaml:59`
- **O que está errado:** “Node.js 18 ou superior” inclui Node 18.0 a 18.20.7. Dependências do Astro instaladas no lockfile exigem `18.20.8`, `^20.3.0` ou `>=22.0.0`.
- **Por que importa:** alguém pode seguir o quickstart corretamente e travar já no `pnpm install`. Esse é exatamente o tipo de falha que um README de clonagem deve evitar.
- **Correção sugerida:** preferir “Node.js 20.3 ou superior” para uma instrução simples, ou reproduzir a faixa completa: “Node.js 18.20.8+, 20.3+ ou 22+”. Idealmente, declarar também `engines.node` em `package.json`, em mudança separada do README.
- **Vale a pena corrigir:** **sim**.

### 3. A arquitetura é descrita como renderização no servidor, mas a saída é estática

- **Local:** `README.md:102`; `astro.config.mjs:9`; `.github/workflows/lighthouse.yml:29`
- **O que está errado:** “Astro renderiza a maior parte da interface no servidor” sugere SSR em tempo de requisição. O projeto usa a saída estática padrão do Astro; o CI inclusive publica e audita `.vercel/output/static`. O adapter da Vercel não muda, por si só, essa característica.
- **Por que importa:** a frase contradiz uma decisão central da arquitetura e o próprio objetivo declarado do projeto: deploy estático na Vercel.
- **Correção sugerida:** trocar por “Astro pré-renderiza a maior parte da interface como HTML durante a build”. Acrescentar na tabela da stack “deploy estático na Vercel com o adapter oficial”.
- **Vale a pena corrigir:** **sim**.

### 4. A seção de acessibilidade se contradiz sobre o ciclo de foco

- **Local:** `README.md:169`; `README.md:171`; `src/islands/MobileNav.tsx:64`
- **O que está errado:** a linha 169 afirma que o foco fica preso na gaveta; duas linhas depois, “o ciclo de foco do menu mobile” aparece entre pendências conhecidas. No código atual, há captura de `Tab` e `Shift+Tab`, foco inicial e botão de fechamento dentro da gaveta.
- **Por que importa:** o leitor não consegue saber se a funcionalidade está pronta ou pendente. A contradição também diminui a credibilidade da lista de acessibilidade.
- **Correção sugerida:** remover o ciclo de foco das pendências ou nomear com precisão uma limitação ainda existente, se houver. Transformar “relatórios em `docs/`” em links diretos e garantir que esses relatórios sejam versionados junto com o README.
- **Vale a pena corrigir:** **sim**.

## Achados de prioridade média

### 5. A validação local é apresentada como igual ao processo publicado

- **Local:** `README.md:68`; `package.json:7`; `.github/workflows/lighthouse.yml:22`
- **O que está errado:** “validar a mesma saída que será publicada” introduz `pnpm test`, `pnpm build` e `pnpm preview`, mas `preview` apenas serve a build local e o workflow versionado não executa os testes Vitest. A Vercel publica o artefato da build, não uma “saída” dos três comandos.
- **Por que importa:** confunde validação, geração de artefato e publicação. Também pode levar o leitor a supor que os testes fazem parte do gate de CI.
- **Correção sugerida:** escrever “Para testar e inspecionar localmente a build de produção” e manter os três comandos. Em outra frase, explicar que `pnpm build` gera a saída estática usada no deploy.
- **Vale a pena corrigir:** **sim**.

### 6. “Quatro famílias variáveis” inclui uma fonte estática

- **Local:** `README.md:120`; `src/styles/global.css:57`
- **O que está errado:** Permanent Marker é declarada somente com `font-weight: 400`; não é uma família variável no projeto. Inter, Sora e JetBrains Mono têm intervalos de peso.
- **Por que importa:** é uma afirmação técnica específica e fácil de conferir. O detalhe excessivo torna o erro mais visível.
- **Correção sugerida:** usar “Quatro famílias são hospedadas localmente; três delas são variáveis” ou retirar “variáveis”.
- **Vale a pena corrigir:** **sim**.

### 7. O README demora a dizer o que o projeto demonstra

- **Local:** `README.md:8`; `README.md:14`; `README.md:104`
- **O que está errado:** a abertura explica o conteúdo do site e lista dez recursos, mas não sintetiza o valor de engenharia. Depois, dedica cerca de 25 linhas a valores de tokens e tipografia antes de voltar a conteúdo, SEO e qualidade.
- **Por que importa:** em 30 segundos, um recrutador precisa entender não só “o que tem”, mas o que João demonstra saber fazer. A tabela completa de cores compete com evidências mais fortes: static-first, progressive enhancement, i18n de conteúdo e rotas, collections tipadas, SEO localizado, testes e CI.
- **Correção sugerida:** incluir, perto do primeiro parágrafo, uma frase curta como: “O projeto demonstra arquitetura static-first, conteúdo tipado e multilíngue, progressive enhancement e uma camada de qualidade automatizada.” Mover “Design system” para depois de qualidade/arquitetura e condensar as duas tabelas em um parágrafo ou em um link para o estudo de caso do próprio portfólio.
- **Vale a pena corrigir:** **sim**.

### 8. Faltam capacidades relevantes que já têm evidência no código

- **Local:** `README.md:14`; `README.md:27`; `src/layouts/BaseLayout.astro:10`; `src/styles/global.css:927`; `.github/workflows/lighthouse.yml:1`
- **O que está errado:** ficaram de fora Vercel Speed Insights, o stylesheet de impressão e o Lighthouse CI. A lista também não deixa claro que os testes atuais são unitários e cobrem utilitários do blog e constantes, não a interface inteira.
- **Por que importa:** Speed Insights e CI são sinais úteis de observabilidade e disciplina de entrega; o modo de impressão reforça o cuidado com conteúdo editorial. Já “Testes: Vitest” sem escopo pode soar maior do que é.
- **Correção sugerida:** recuperar uma linha curta para CI/Lighthouse e impressão; citar Speed Insights na stack ou em “Qualidade”. Trocar “Testes” por “Testes unitários: Vitest (`src/utils/*.test.ts`)”.
- **Vale a pena corrigir:** **sim** para CI, escopo dos testes e impressão; **não é essencial** para Speed Insights se a meta for máxima concisão.

### 9. A árvore mistura o nome do repositório com o diretório criado pelo clone

- **Local:** `README.md:49`; `README.md:50`; `README.md:79`
- **O que está errado:** o comando clona `Jbnado/portfolio.git` e entra em `portfolio`, mas a árvore começa por `portfolio-jb/`.
- **Por que importa:** não impede a execução, porém causa uma pequena dúvida logo após o quickstart e sugere que a árvore foi reaproveitada de uma versão anterior.
- **Correção sugerida:** usar `portfolio/` na árvore ou clonar explicitamente para `portfolio-jb` (`git clone ... portfolio-jb`).
- **Vale a pena corrigir:** **sim**.

### 10. A política de licença para materiais pessoais não está formalizada no arquivo de licença

- **Local:** `README.md:175`; `LICENSE:1`
- **O que está errado:** o README exclui textos, identidade, currículos e imagens da reutilização, enquanto o arquivo `LICENSE` contém apenas a licença MIT padrão para “software e documentação associada”, sem uma exceção explícita para esses materiais.
- **Por que importa:** a intenção é razoável, mas a formulação pode criar ambiguidade sobre o que está ou não licenciado no repositório.
- **Correção sugerida:** alinhar a frase com uma exceção formal no `LICENSE` ou adotar no README uma formulação menos categórica até essa separação estar documentada. Esta revisão não recomenda alterar a licença sem decisão consciente do autor.
- **Vale a pena corrigir:** **sim**, após decisão do autor.

## Achados de prioridade baixa

### 11. Há trechos com voz de texto gerado e densidade explicativa desnecessária

- **Local:** `README.md:106`; `README.md:129`; `README.md:161`; `README.md:166`
- **O que está errado:** construções como “não são o mesmo layout com brilho invertido: ...”, a explicação longa de cascata e flash de tema, “O que já está implementado:” e “em seis blocos de `global.css`” têm tom de release note ou de justificativa gerada. O padrão combina contraste retórico, dois-pontos explicativos e precisão sem valor para a tarefa do leitor.
- **Por que importa:** o tom TabNews funciona melhor quando parte de fatos, decisões e consequências concretas. Esses trechos soam promocionais ou defensivos e alongam a leitura.
- **Correção sugerida:** aplicar intervenções mínimas:

  | Original | Revisão sugerida | Mudança |
  | --- | --- | --- |
  | “Os dois temas não são o mesmo layout com brilho invertido: o claro imita...” | “O tema claro usa a linguagem visual de uma mesa de engenharia; o escuro, de um terminal CRT.” | Remove contraste formulaico e enumeração longa. |
  | “Um script inline no `<head>` ... evitando o flash de tema errado.” | “O tema é definido por um script no `<head>` antes do carregamento dos estilos, sem flash visual.” | Encurta causa e efeito. |
  | “O que já está implementado:” | “O projeto inclui:” | Remove entusiasmo de changelog. |
  | “... desliga as animações, em seis blocos de `global.css`” | “... reduz ou desliga animações.” | Retira contagem frágil e irrelevante. |

- **Vale a pena corrigir:** **sim**, junto com a condensação estrutural.

### 12. Alguns termos oscilam entre português e inglês sem necessidade

- **Local:** `README.md:17`; `README.md:18`; `README.md:22`; `README.md:106`
- **O que está errado:** “open source”, “scroll spy”, “Twitter Cards”, “design system”, “blueprint” e “eyebrows” aparecem misturados. Alguns são nomes técnicos consolidados; outros têm equivalente natural ou precisam de uma breve definição.
- **Por que importa:** a oscilação não impede a compreensão, mas enfraquece o português direto pedido e dá ao texto aparência de catálogo de features.
- **Correção sugerida:** manter nomes próprios e termos de código, mas preferir “código aberto”, “cartões do Twitter/X”, “sistema visual” e “etiquetas de seção” quando não houver perda de precisão. Se “scroll spy” for mantido, explicar uma vez como destaque automático da seção ativa.
- **Vale a pena corrigir:** **não** isoladamente; **sim** durante a edição final.

### 13. `llms.txt` é chamado de endpoint em um projeto estático

- **Local:** `README.md:23`; `src/pages/llms.txt.ts:1`
- **O que está errado:** “endpoint” pode sugerir geração dinâmica. A rota Astro é pré-renderizada como arquivo no build estático.
- **Por que importa:** é uma imprecisão pequena, mas soma-se à confusão entre build estática e servidor.
- **Correção sugerida:** usar “arquivo `llms.txt` gerado a partir do conteúdo publicado” ou “rota estática `/llms.txt`”.
- **Vale a pena corrigir:** **sim**, se o achado 3 for corrigido.

## Conferência técnica sem erro encontrado

- Os seis scripts citados em `README.md:61`–`README.md:66` existem em `package.json:5`–`package.json:11`. Não há comando inexistente no README novo.
- A URL `git clone https://github.com/Jbnado/portfolio.git` corresponde ao remoto `origin`.
- Astro 5, Preact 10, Tailwind CSS 4, TypeScript, Sharp, Vitest, pnpm 9 e o adapter oficial da Vercel conferem com `package.json` e `astro.config.mjs`.
- As rotas de início, blog, RSS, projetos e contribuições em português, inglês e espanhol conferem com `src/pages/`.
- As collections `stats`, `timeline`, `projects`, `caseStudies` e `blog`, seus formatos JSON/Markdown, `locale`, `slug`, `urlSlug` e `draft` conferem com `src/content.config.ts` e `src/utils/blog-content.ts`.
- Busca no cliente, tags, paginação, scroll incremental, tempo de leitura e vídeo via `youtube-nocookie.com` existem.
- Canonical, `hreflang`, Open Graph, Twitter Cards, JSON-LD, sitemap, RSS, `robots.txt`, manifesto, `llms.txt` e o índice JSON do blog existem.
- Os cabeçalhos citados conferem com `vercel.json`, incluindo CSP, bloqueio de frames, política de referência e `Permissions-Policy`.
- Os seis blocos de `prefers-reduced-motion`, `prefers-contrast: high`, tema persistido, três currículos localizados e fontes locais existem. O problema é apenas chamar todas as quatro famílias de variáveis.
- As islands reais incluem navegação mobile, scroll spy, contadores, busca/feed do blog, expansor de estudos de caso, seletor de tema e statusline. A lista do README é representativa, embora omita as duas últimas.

## O que se perdeu na reescrita

### Deve voltar, de forma corrigida e curta

1. **Lighthouse CI e seus limiares.** Era útil e continua real. O README novo removeu a seção e depois afirmou o oposto do código.
2. **Stylesheet de impressão.** A regra `@media print` continua em `src/styles/global.css:927`; uma menção curta nas capacidades comunica atenção ao conteúdo fora da tela.
3. **Progressive enhancement dos estudos de caso.** A versão antiga destacava que o accordion funciona sem JavaScript. Esse é um exemplo concreto da arquitetura de ilhas e vale mais para recrutamento do que uma tabela completa de cores.
4. **Orientação para adicionar idioma/conteúdo, mas reescrita.** A seção antiga era útil para manutenção, porém ficou incompleta com blog, case studies, rotas traduzidas e `urlSlug`. Se voltar, deve ser um checklist atualizado ou um link para documentação própria, não o texto antigo.

### Foi correto remover

- O badge e as promessas genéricas de Lighthouse 95+ sem explicar a configuração.
- A afirmação de conformidade WCAG 2.1 AA e a garantia de alvos de toque de 44 px.
- O clone antigo de `portfolio-jb.git`, que não corresponde ao remoto atual.
- A descrição antiga de cores, pastas e collections, já vencida.
- A citação genérica “Bom software é invisível...”, as “lições” implícitas e o sumário longo.
- O tutorial de deploy manual com instalação global da Vercel CLI. Ele não ajuda a clonar e rodar e envelhece rápido; bastam uma frase sobre o deploy estático e, se necessário, um link para a configuração da Vercel.

## Estrutura proposta

1. **Título, descrição em duas frases, links e uma captura do site.**
2. **O que este projeto demonstra.** Quatro ou cinco itens com decisões e consequências, não uma lista extensa de features.
3. **Stack.** Tabela curta, com “deploy estático” e escopo dos testes.
4. **Como executar.** Pré-requisito correto de Node, clone, instalação, desenvolvimento e build local.
5. **Arquitetura e conteúdo.** Árvore reduzida e explicação de collections, i18n e islands.
6. **Qualidade, SEO e acessibilidade.** Unir evidências hoje dispersas, incluindo Lighthouse CI e as ressalvas de conformidade.
7. **Design system.** Um parágrafo sobre as duas direções visuais; detalhes de tokens podem ficar no estudo de caso.
8. **Licença.** Texto alinhado ao arquivo de licença.

Com essa ordem, o README preserva a utilidade técnica, melhora a leitura de 30 segundos e pode cair para algo próximo de 800–950 palavras sem perder informação necessária para executar o projeto.
