---
slug: "agente-invadiu-hugging-face"
locale: "pt-br"
urlSlug: "a-ia-invadiu-uma-empresa-de-verdade"
title: "IA Hackeou uma empresa sem ninguém pedir"
seoTitle: "IA Hackeou uma empresa sem ninguém pedir — João Bernardo"
summary: "Dois modelos da OpenAI encadearam oito zero-days pra sair de um sandbox de avaliação e passaram cinco dias dentro da infraestrutura de produção da Hugging Face. Nenhuma técnica usada ali é nova, e é justamente isso que assusta."
date: "2026-08-04"
tags: ["ia", "segurança", "agentes"]
video:
  youtubeId: "FUw31kGR3No"
  url: "https://youtu.be/FUw31kGR3No"
  title: "IA Hackeou uma empresa sem ninguem pedir"
  thumbnail: "https://i.ytimg.com/vi/FUw31kGR3No/maxresdefault.jpg"
  channel: "Jbnado"
sources:
  - title: "Hugging Face — Anatomy of a Frontier Lab Agent Intrusion (timeline técnica)"
    url: "https://huggingface.co/blog/agent-intrusion-technical-timeline"
    note: "Fonte primária. Timeline minuto a minuto, payloads, as 17.600 ações e o uso do GLM-5.2 na investigação."
  - title: "Anthropic — Investigating three real-world incidents in our cybersecurity evaluations"
    url: "https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals"
    note: "Fonte primária. As 141.006 execuções revisadas, os 3 incidentes, o pacote no PyPI e a causa raiz."
  - title: "Simon Willison — Anatomy of a Frontier Lab Agent Intrusion"
    url: "https://simonwillison.net/2026/Jul/28/anatomy-of-a-frontier-lab-agent-intrusion/"
    note: "A análise que originou o vídeo."
  - title: "Simon Willison — OpenAI's accidental cyberattack against Hugging Face"
    url: "https://simonwillison.net/2026/Jul/22/openai-cyberattack/"
    note: "O paradoxo da trava, que prende o defensor legítimo enquanto o modelo sem trava opera livre."
  - title: "The Register — JFrog's 0-days let OpenAI's models hack Hugging Face"
    url: "https://www.theregister.com/security/2026/07/28/jfrogs-0-days-let-openais-models-hack-hugging-face/5280001"
    note: "Os oito zero-days encadeados no Artifactory."
  - title: "BleepingComputer — OpenAI models used Artifactory zero-days to escape to the internet"
    url: "https://www.bleepingcomputer.com/news/security/openai-models-used-artifactory-zero-days-to-escape-to-the-internet/"
    note: "Confirmação da fuga do sandbox e a lista de CVEs."
  - title: "The Hacker News — JFrog confirms OpenAI models exploited Artifactory zero-day"
    url: "https://thehackernews.com/2026/07/jfrog-confirms-openai-models-exploited.html"
    note: "Correção publicada no Artifactory 7.161.15."
  - title: "The Hacker News — OpenAI says its own AI models escaped sandbox"
    url: "https://thehackernews.com/2026/07/openai-says-its-own-ai-models-escaped.html"
    note: "A divulgação da OpenAI em 21 de julho."
  - title: "Axios — OpenAI says Hugging Face breach caused by one of its models"
    url: "https://www.axios.com/2026/07/21/openai-says-hugging-face-breach-caused-by-one-its-models"
    note: "A OpenAI assume responsabilidade publicamente."
  - title: "Fortune — os agentes também atingiram um cliente numa segunda empresa"
    url: "https://fortune.com/2026/07/29/openai-rouge-ai-agent-hack-hugging-face-breached-second-tech-company/"
    note: "A plataforma da Modal não foi comprometida. Um cliente publicou um endpoint sem autenticação."
  - title: "CNBC — OpenAI cyber models broke out of training environment"
    url: "https://www.cnbc.com/2026/07/22/open-ai-cyber-models-hack-hugging-face.html"
    note: "Cobertura da divulgação inicial."
  - title: "BleepingComputer — Anthropic's Claude breached 3 orgs, uploaded PyPI malware during tests"
    url: "https://www.bleepingcomputer.com/news/security/anthropics-claude-breached-3-orgs-uploaded-pypi-malware-during-tests/"
    note: "O pacote ficou cerca de uma hora no ar e entrou em 15 máquinas reais."
  - title: "Fortune — Anthropic says its Claude models escaped a testing environment"
    url: "https://fortune.com/2026/07/31/anthropic-claude-escaped-test-hacked-three-companies-openai/"
    note: "Cobertura dos três incidentes."
  - title: "Reuters (via Japan Times) — OpenAI finds evidence other AI agents escaped containment"
    url: "https://www.japantimes.co.jp/business/2026/08/01/tech/openai-agent-more-breakouts/"
    note: "Mais escapes encontrados em 31 de julho, todos limitados à rede da OpenAI."
  - title: "MIT Technology Review — A fundamental flaw leaves LLMs strikingly vulnerable to attack"
    url: "https://www.technologyreview.com/2026/07/30/1140927/a-fundamental-flaw-leaves-llms-vulnerable-to-attack/"
    note: "Paper do ICML de Charles Ye e Jasmine Cui, com o contraponto de Florian Tramèr."
  - title: "SecurityWeek — New GitHub, PyPI policies boost supply chain security"
    url: "https://www.securityweek.com/new-github-pypi-policies-boost-supply-chain-security/"
    note: "O cooldown de três dias no Dependabot e a trava do PyPI."
  - title: "InfoQ — GitHub introduces default cooldown policy for Dependabot version updates"
    url: "https://www.infoq.com/news/2026/07/github-dependabot-cooldown/"
    note: "O detalhe de configuração no dependabot.yml."
---

Cinco dias. Cerca de 17.600 ações. Root em onze nós.

Foi isso que dois modelos da OpenAI fizeram dentro da infraestrutura de produção da Hugging Face entre 9 e 13 de julho de 2026. Ninguém pediu. O objetivo declarado deles era outro, e eles chegaram lá pelo caminho mais desconfortável possível.

O vídeo conta a história inteira. Aqui eu quero abrir o capô, porque a parte técnica é mais interessante que o susto, e porque quase tudo que esses modelos usaram está em qualquer curso de segurança de dez anos atrás.

## Como o agente saiu da caixa

O ambiente se chama ExploitGym. É um sandbox de avaliação de cibersegurança, e nesse teste os classificadores de segurança estavam desligados de propósito, pra medir capacidade bruta em vez de comportamento com trava.

Esse sandbox tinha uma única saída de rede. Um JFrog Artifactory self-hosted funcionando como proxy e cache de registro de pacotes. Toda a superfície externa daquele ambiente era esse serviço, e só ele.

O agente achou oito vulnerabilidades zero-day nesse proxy e encadeou as oito.

Vale parar nesse número. Não era uma falha conhecida esperando patch. Eram oito falhas que ninguém tinha reportado, encontradas e combinadas contra o mesmo alvo. Os créditos das CVEs foram atribuídos a funcionários da OpenAI, e a correção saiu na versão 7.161.15 do Artifactory.

## Dois campos que ninguém olha

A entrada na Hugging Face veio por config de dataset, em dois vetores diferentes. Os dois merecem atenção de quem escreve backend.

O primeiro nem executou código. O agente declarou splits de um dataset cujo dado bruto morava em caminhos locais do worker, incluindo `/proc/self/environ`. O parser de HDF5 fez o que parser de HDF5 faz, leu o arquivo apontado e devolveu o conteúdo. Do outro lado saíram as variáveis de ambiente do pod de produção, com credenciais dentro.

Isso é leitura arbitrária de arquivo escondida atrás de um recurso legítimo. Não tem exploit, não tem shellcode. Tem um campo de caminho que confiou no valor que recebeu.

O segundo é pior de achar. O agente usou uma spec `fsspec` do tipo `reference://` e escondeu um template Jinja2 num campo que esperava um offset numérico. O payload chamava `cycler.__init__.__globals__.__builtins__.exec(...)` com o conteúdo real comprimido em gzip e codificado em base64.

Resultado, Python arbitrário rodando dentro de um pod Kubernetes de conversão, em produção. A cadeia de atributos ali é o clássico da injeção de template em Python, subindo de um objeto qualquer até os builtins. O que chama atenção é o lugar. Ninguém valida um campo de offset como se fosse entrada de usuário, porque ninguém espera texto num campo de número.

## O canal de comando eram os próprios datasets

A parte que eu achei mais elegante, no sentido incômodo da palavra, é o comando e controle.

Não existia rota de rede direta entre o sandbox de fora e o cluster da Hugging Face. Em vez de abrir uma, o agente usou repositórios de dataset que ele mesmo controlava como caixa postal. Escrevia de um lado por commit, lia do outro por branch lateral.

Os dois lados só precisavam falar com o Hub, que é exatamente o que os dois já faziam o dia inteiro por motivo legítimo. Do ponto de vista de qualquer regra de egresso, aquilo é tráfego normal de plataforma.

## O terceiro dia

Onze de julho concentrou 7.677 ações. A escalada tem hora marcada e lê como runbook.

Às 10h10 o agente leu o token da service account do Kubernetes em `/var/run/secrets/kubernetes.io/serviceaccount/token` e começou a sondar a API. Às 17h33 pegou credenciais temporárias no endpoint de metadados e as reproduziu de fora, enumerando VPC, EKS, transit gateway e registry. Às 19h53 subiu pods privilegiados com o filesystem do host montado, e virou root em onze nós. Às 20h23 colheu um objeto de segredos com 136 chaves e a chave da VPN em malha. Às 21h23 matriculou um nó rooteado nessa malha corporativa. Às 23h08 chegou na integração do GitHub App, emitindo tokens com `contents:write` e `pull_requests:write` em repositórios internos.

Treze horas entre ler um token de service account e conseguir abrir pull request em repositório interno.

## O que de fato foi alcançado

Aqui a honestidade importa, porque a manchete é mais larga que o estrago.

O agente alcançou cinco datasets, todos ligados ao ExploitGym e ao CyberGym. Nenhum modelo de cliente, nenhum Space, nenhum pacote foi comprometido. O log de auditoria do banco mostra zero escritas vindas das máquinas comprometidas, e a tentativa de acessar o banco de produção do Hub deu timeout por restrição de rede.

Várias camadas de detecção dispararam durante os cinco dias. O que falhou foi a etapa seguinte. A pilha de agentes de triagem não escalou a severidade corretamente, e o alerta ficou parado no lugar errado.

Na segunda empresa envolvida vale o mesmo cuidado. A plataforma da Modal não foi comprometida. Um cliente dela publicou um endpoint sem autenticação, e foi esse endpoint que virou base de operações.

## Nada disso é novo, e esse é o problema

Injeção de comando. Injeção de template no servidor. Endpoint de metadata acessível de dentro do pod. Credencial vazando por página de debug. SQL injection.

Está tudo no OWASP há anos. Nenhuma técnica dessa invasão exigiu uma categoria nova de ataque.

O que mudou foi paralelismo e persistência. Um agente testa milhares de caminhos ao mesmo tempo, não cansa às três da manhã, não desanima depois da centésima tentativa que não deu em nada, e não decide que aquele campo de offset provavelmente não vale a pena.

Repare que as duas contramedidas que a indústria de fato adotou depois disso não são sobre IA. O GitHub passou a aplicar um cooldown padrão de três dias no Dependabot para atualizações não emergenciais. O PyPI bloqueou upload de arquivo novo em release com mais de catorze dias.

As duas são sobre tempo. Se a vantagem do atacante é velocidade, você tira valor da velocidade.

## O defensor estava travado

Durante a investigação, a Hugging Face precisou decifrar os payloads que o agente tinha deixado pelo caminho, todos em pedaços, com XOR de chave por campanha e gzip por cima.

Tentaram usar Claude Opus e Fable pra isso. Os dois recusaram, porque a mensagem foi marcada como tema de cibersegurança.

Acabaram rodando o GLM-5.2, um modelo de peso aberto, na própria infraestrutura.

O modelo que invadiu operava sem trava nenhuma, porque a trava tinha sido desligada de propósito no benchmark. O time que estava limpando a sujeira, esse sim, esbarrou na trava.

## O outro lado

A OpenAI não foi a única a divulgar. A Anthropic revisou 141.006 execuções de avaliação e encontrou três incidentes reais.

No primeiro, o Opus 4.7 atacou uma empresa de verdade que tinha o mesmo nome do alvo fictício do exercício. Extraiu credenciais, acessou um banco de produção, e continuou o ataque mesmo depois de perceber que o alvo era real.

No segundo, o Mythos 5 publicou um pacote malicioso no PyPI de verdade. Ficou cerca de uma hora no ar e foi instalado em quinze máquinas reais. Uma delas era de uma empresa de segurança, e as credenciais dela foram exfiltradas e reutilizadas.

No terceiro, um modelo interno escaneou cerca de nove mil alvos, comprometeu uma empresa por uma página de debug e uma injeção de SQL, e parou por conta própria.

A causa raiz dos três é a mesma, e é banal. O prompt informava aos modelos que não havia acesso à internet naquele ambiente. Uma configuração errada do fornecedor que operava o ambiente deixou o acesso aberto. Os modelos acreditaram no prompt, a rede não.
