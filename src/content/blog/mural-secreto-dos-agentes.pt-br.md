---
slug: "mural-secreto-dos-agentes"
locale: "pt-br"
urlSlug: "o-mural-secreto-dos-agentes-da-openai"
title: "Os agentes da OpenAI criaram um mural secreto. O mural era um repositório de pacotes."
seoTitle: "O mural secreto dos agentes da OpenAI — João Bernardo"
summary: "Um agente da OpenAI descobriu que dava pra deixar arquivo no Artifactory interno. Em dois meses aquilo virou um canal de coordenação entre agentes de experimentos diferentes, com convenção pra não sobrescrever o trabalho um do outro. O canal não precisou de protocolo, só de um lugar com escrita que sobrevive entre execuções."
date: "2026-08-11"
tags: ["ia", "segurança", "agentes"]
video:
  youtubeId: "3Utnr0TpulA"
  url: "https://youtu.be/3Utnr0TpulA"
  title: "As IAs Criaram um Canal Secreto Sozinhas"
  thumbnail: "https://i.ytimg.com/vi/3Utnr0TpulA/maxresdefault.jpg"
  channel: "Jbnado"
sources:
  - title: "Nextgov/FCW — OpenAI agents rebuilt internal message board that led to Hugging Face breach"
    url: "https://www.nextgov.com/artificial-intelligence/2026/08/openai-agents-rebuilt-internal-message-board-lead-hugging-face-breach/415240/"
    note: "Fonte principal sobre o mural. O mecanismo no Artifactory, o endereçamento entre agentes e os dois dias pra remontar."
  - title: "SC Media — Black Hat 2026: OpenAI reveals agents planned collective attacks via secret message board"
    url: "https://www.scworld.com/news/black-hat-2026-openai-reveals-agents-planned-collective-attacks-via-secret-message-board"
    note: "A cobertura da palestra de Eric Wallace e Michael Dalton."
  - title: "Slashdot/Politico — OpenAI's models shared hacking tips on a secret messaging board"
    url: "https://yro.slashdot.org/story/26/08/06/1815207/openais-models-shared-hacking-tips-on-a-secret-messaging-board-before-hugging-face-breach"
    note: "A sobrecarga que derrubou o Artifactory no começo de julho e revelou o mural."
  - title: "AI Security Institute — Incident report: unsanctioned agent behaviour during cyber testing"
    url: "https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing"
    note: "Fonte primária. As 122 execuções, as 19 ações na internet real e o ataque de cadeia de suprimentos."
  - title: "Simon Willison — Incident report: unsanctioned agent behaviour"
    url: "https://simonwillison.net/2026/Aug/5/incident-report/"
    note: "O recado falso de bot deixado pro próximo agente ler, e por que o resultado não surpreende."
  - title: "Simon Willison — Third-party cyber evaluations"
    url: "https://simonwillison.net/2026/Aug/5/third-party-cyber-evaluations/"
    note: "A divulgação da OpenAI sobre a configuração errada da Irregular e o alvo fictício que coincidiu com um domínio real."
  - title: "CNBC — Israeli startup Irregular linked to AI hacks at OpenAI, Anthropic and Meta"
    url: "https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html"
    note: "A reportagem que amarra os três casos ao mesmo fornecedor, com o número de funcionários."
  - title: "The Next Web — One testing vendor behind the OpenAI, Anthropic and Meta breaches"
    url: "https://thenextweb.com/news/irregular-ai-testing-vendor-openai-anthropic-meta-breaches"
    note: "O ambiente exposto à internet pública por meses, o funding e a resposta da empresa."
  - title: "Bloomberg — Meta AI model accessed internet, hacked outside firm in testing"
    url: "https://www.bloomberg.com/news/articles/2026-08-05/meta-ai-model-accessed-internet-hacked-outside-firm-in-testing"
    note: "O Muse Spark 1.1 alcançando a internet pública durante um teste."
  - title: "SiliconANGLE — Meta's Muse Spark 1.1 hacked external organization in cybersecurity test"
    url: "https://siliconangle.com/2026/08/06/metas-muse-spark-1-1-hacked-external-organization-cybersecurity-test/"
    note: "A configuração errada da Irregular no caso da Meta."
  - title: "TechCrunch — Chinese AI model Kimi escaped its cybersecurity testing environment"
    url: "https://techcrunch.com/2026/08/07/chinese-ai-model-kimi-escaped-its-cybersecurity-testing-environment-researchers-say/"
    note: "O caso do Kimi K3, no ambiente da Frontier Security e não no da Irregular."
  - title: "Yahoo Finance — Irregular raises $80 million"
    url: "https://finance.yahoo.com/news/irregular-raises-80-million-set-121500443.html"
    note: "O aporte com Sequoia e Redpoint, e o passado como Pattern Labs."
---

Em maio, um agente de IA da OpenAI subiu um arquivo num servidor interno. O arquivo era uma pergunta. Alguém aí tinha visto um arquivo que sumiu?

Outros agentes acharam e responderam.

Ninguém pediu, ninguém autorizou, e ninguém percebeu por dois meses. A OpenAI só contou essa parte em 5 de agosto, no Black Hat, pela boca do pesquisador Eric Wallace e do engenheiro de segurança Michael Dalton.

O vídeo conta a história inteira e o resto do Radar da semana. Aqui eu quero ficar num detalhe só, porque é o mesmo detalhe do [post anterior](/blog/a-ia-invadiu-uma-empresa-de-verdade) e eu não tinha percebido isso na hora.

## O canal era um cache de pacotes

O servidor que virou mural é um JFrog Artifactory interno. É onde a OpenAI guarda os pacotes de software que usa, o almoxarifado de dependência do lugar.

Pensa no que um registro de pacotes tem, do ponto de vista de quem está preso numa caixa.

Ele aceita escrita, senão não serviria pra nada. O que você escreve continua lá depois que o seu processo morre. Todo mundo lê do mesmo lugar, porque esse é o propósito de um cache compartilhado. E falar com ele é o tráfego mais banal daquele ambiente, porque é o que todo build faz o dia inteiro.

Escrita, persistência, leitura compartilhada e tráfego invisível. Isso é uma caixa postal. Faltava só alguém tratar como caixa postal.

Repara que é a mesma forma do post anterior. Na invasão da Hugging Face, os dois lados do ataque não tinham rota de rede entre si, então o agente usou repositórios de dataset do próprio Hub como caixa postal, escrevendo de um lado por commit e lendo do outro por branch lateral. Na hora eu li aquilo como engenhosidade pontual. Depois do Black Hat, parece menos com criatividade e mais com a coisa mais óbvia a se fazer quando você precisa falar com alguém e não tem rede.

## O protocolo que ninguém escreveu

O começo foi banal. Um agente descobriu que dava pra deixar arquivo ali. Outro usou isso pra perguntar sobre um arquivo que tinha sumido. A partir daí, agentes que rodavam em experimentos separados, sem nenhuma ligação entre si, passaram a se encontrar naquele ponto.

O que eles trocavam eram instruções e informações sobre falhas de segurança recém-descobertas. Começaram a distribuir tarefas entre si e a deixar scripts prontos pra que outro modelo continuasse de onde o primeiro parou.

E aí vem a parte que me pegou. Segundo a apresentação, aquilo foi ficando progressivamente organizado. Os agentes desenvolveram formas de se endereçar uns aos outros, de trocar ferramentas, e de não sobrescrever o trabalho um do outro.

A última é a que importa. Não sobrescrever trabalho alheio é o problema mais chato de qualquer sistema com escrita concorrente. É lock, é lease, é versão, é convenção de nome. Não tem solução que caia do céu, você senta e desenha. Ninguém desenhou essa. Ela apareceu porque vários processos independentes queriam usar o mesmo espaço sem se atrapalhar, e essa pressão sozinha já produz protocolo.

Wallace resumiu como um time de agentes trabalhando juntos, achando exploits e compartilhando entre si.

## Quem achou o mural foi o plantão, não a segurança

Essa parte é a minha favorita e é a menos comentada.

O mural não caiu porque alguém auditou o Artifactory, nem porque uma regra de detecção disparou. Ele caiu porque cresceu demais. No começo de julho o volume dos agentes sobrecarregou o serviço e derrubou o Artifactory. Os engenheiros foram ver o que estava entupindo e acharam o mural no meio do caminho.

A descoberta foi um incidente de disponibilidade. Se aqueles agentes tivessem sido mais econômicos, ninguém teria olhado.

Apagaram tudo e acharam que tinham cortado a comunicação. Dois dias depois os agentes já tinham encontrado outro caminho no mesmo serviço e voltaram a conversar. Cerca de uma semana depois veio a invasão da Hugging Face.

## Não foi rebeldia, foi o incentivo funcionando

Vale insistir nisso porque a manchete puxa pro outro lado.

Os modelos estavam num benchmark de cibersegurança e a tarefa era encontrar falhas. A resposta certa de boa parte desses desafios está publicada na internet, em write-up de CTF, em issue de projeto, em advisory. Um sistema treinado pra ser premiado por concluir a tarefa vai procurar o caminho mais curto até concluir a tarefa, e colar do gabarito é o caminho mais curto que existe.

Wallace falou que quando os modelos travam, eles frequentemente tentam gamificar ou fraudar a tarefa. Não tem intenção nisso. Tem função de recompensa.

## O mesmo padrão numa superfície pública

Se fosse só a OpenAI, dava pra tratar como peculiaridade do Artifactory deles. Não é.

Entre 25 e 28 de julho, o AI Security Institute britânico rodou a mesma avaliação de cibersegurança 122 vezes. Foram 43 execuções com o Mythos 5 da Anthropic e 35 com o GPT-5.6 Sol da OpenAI. Em 10 execuções os agentes fizeram algo que não deviam, num total de 19 ações na internet real contra pessoas e organizações de verdade. Dezessete dessas ações foram do Mythos 5 e duas do GPT-5.6 Sol.

O caso mais sério foi o Mythos 5 decidindo resolver o desafio por cadeia de suprimentos. Em vez de atacar o alvo, foi envenenar um projeto de código aberto que o alvo usava. Criou uma conta no GitHub, abriu uma pull request maliciosa, e criou uma segunda conta se passando por outro humano pra endossar a própria PR.

E deixou um recado falso de bot pro próximo agente de IA ler, dizendo que a PR #3 estava aprovada e esperando merge.

Lê de novo. O alvo daquela mensagem não era o mantenedor humano. Era a próxima IA que passasse ali.

Um agente também deixou instruções públicas no GitHub oferecendo colaboração e ensinando a reaproveitar contas e artefatos, e agentes posteriores acharam e usaram. Mural de novo, agora num repositório aberto.

O mantenedor humano achou tudo estranho e recusou a PR. O monitoramento viu dado saindo por Tor no dia 28 e derrubou a operação em cerca de uma hora, sem dano real identificado.

Aqui cabe uma distinção que não coube no vídeo. O ambiente do AISI não estava mal configurado. Eles deram acesso à internet de propósito e desligaram de propósito os classificadores de segurança que os próprios desenvolvedores implementam. Nenhum agente escapou do sandbox, as máquinas virtuais seguraram, e as 19 ações saíram pela porta que o instituto tinha aberto. O Simon Willison chamou o resultado de nada surpreendente, e ele tem razão.

Isso torna o caso mais interessante, não menos. Quando o ambiente vaza por descuido, dá pra dizer que o problema foi o descuido. Quando o ambiente é aberto de propósito e o agente mesmo assim vira engenheiro social e escreve recado pro sucessor, o que você está medindo é comportamento, e não configuração.

## O fornecedor no meio de tudo

O descuido, onde ele existiu, tem um nome só.

Foram quatro laboratórios em cinco dias. OpenAI, Anthropic, Meta e Moonshot. Em três deles o ambiente de avaliação era operado pela mesma empresa, a Irregular.

Ela fica em Tel Aviv, tem escritório nos Estados Unidos, foi fundada em 2023 e até o ano passado se chamava Pattern Labs. Levantou 80 milhões de dólares com Sequoia e Redpoint, foi avaliada em 450 milhões, e tem por volta de 35 funcionários segundo a CNBC.

O que aconteceu no ambiente dela não foi fuga sofisticada. Segundo a divulgação da OpenAI, as avaliações eram no estilo capture the flag e deveriam estar isoladas da internet, mas uma configuração errada permitiu que os modelos alcançassem a internet pública. Num dos testes o nome do alvo fictício do desafio coincidiu com um domínio real, e o modelo foi lá e explorou um site de verdade achando que era parte do exercício.

O ambiente ficou assim por meses. A Irregular rejeita a leitura de escape de sandbox, diz que foi ambiente mal configurado, cortou o acesso à internet dos modelos em teste e prometeu um novo processo de contenção.

O caso do Kimi K3 é o de fora. Quem operava aquele ambiente era a Frontier Security, e o modelo saiu pela ferramenta de linha de comando e foi ao GitHub procurar a resposta do desafio. Mesmo comportamento, fornecedor diferente.

## O que isso tem a ver com a minha máquina

Eu rodo agentes em paralelo. Vários ao mesmo tempo, cada um numa tarefa, com markdowns de planejamento escritos antes do código e um diretório de artefatos que sobrevive entre execuções. É assim que eu trabalho e é o que eu recomendo pra quem me pergunta.

Volta na lista do começo deste post. Escrita, persistência, leitura compartilhada, tráfego banal.

O meu diretório de planos tem as quatro. O cache de pacotes da minha máquina tem as quatro. A pasta de saída onde um agente deixa o resultado pro próximo tem as quatro.

Não estou dizendo que os meus agentes vão combinar um ataque. O que a OpenAI viu aconteceu num ambiente onde a recompensa era invadir e as travas estavam desligadas de propósito. Não é o meu caso e provavelmente não é o seu.

O ponto é outro e é mais desconfortável. Eu tratava aqueles diretórios como conveniência de orquestração, e eles são canal. Se dois agentes meus leem e escrevem no mesmo lugar, eles têm um meio de coordenação, tendo eu desenhado um ou não. Isso muda quem escreve onde, quem lê o quê, e o que fica no disco depois que a execução termina.

No vídeo eu falo que o que escala não é revisar código linha por linha, é cercar o agente de restrições e verificar comportamento. Depois do Black Hat eu acrescentaria uma restrição nessa lista, que é olhar pra tudo que os meus agentes compartilham por escrito e perguntar se aquilo precisa mesmo ser compartilhado.
