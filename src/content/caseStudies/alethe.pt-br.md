---
slug: "alethe"
locale: "pt-br"
title: "Alethe"
summary: "Alethe é um workspace desktop pra rodar e retomar vários agentes de código e terminais em paralelo, criado pelo Kauã (Kc1t). Eu uso todo dia e contribuí de volta com três PRs merged, do fix de scroll em TUIs ao auto-update in-app com o Tauri updater."
highlights:
  - { value: "3", label: "PRs merged (scroll, kill/pause, auto-update)" }
  - { value: "2–3", label: "projetos simultâneos que rodo nele" }
  - { value: "Tauri", label: "Rust + React, app local-first" }
meta:
  - { label: "PAPEL", value: "Contribuidor" }
  - { label: "TIPO", value: "Contribuição" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · React" }
---

Eu trabalho em dois ou três projetos quase ao mesmo tempo, e tenho mais uns seis ou sete engatilhados, crescendo. Isso vira um monte de terminal aberto, um agente de código rodando aqui, docker ali, um node e um python acolá. O Alethe é onde eu junto tudo isso. É um workspace de desktop pra rodar e retomar vários agentes e terminais reais em paralelo, com os projetos na sidebar e atalho pra reabrir cada terminal rápido. O que me prende nele é isso. Interface agradável, atalho fácil, e o foco nos agentes.

O Alethe não é meu. É um projeto open-source do Kauã, o Kc1t, que por acaso é meu colega de trabalho, parceiro e amigo. Eu entro como usuário pesado que resolveu contribuir de volta. Três PRs meus entraram no projeto, e é sobre eles que eu escrevo aqui. Não construí o motor de PTY, nem a integração com Spotify, nem os painéis divididos, isso é do Kauã. Mas as três coisas que eu mandei eu fiz inteiras, e cada uma me ensinou um pedaço de como a coisa funciona por baixo.

## O bug que me botou pra dentro

Usando o Alethe no limite, com o Claude rodando, eu vi a memória do app subir sem parar. Fui investigar e o subtree de processos tava em uns 3,5 GB espalhado por 65 processos. A causa era sutil. Ao matar um PTY, o sinal ia só pro filho direto, o shell, e não pro process group inteiro. O Claude e os scripts de node abrem vários subprocessos, e quando o shell morria, os netos ficavam órfãos, sem ninguém pra limpar. Abri a issue com essa análise, e foi ela que me fez abrir o capô do projeto. Reportar um bug direito, com causa-raiz e passo a passo, já é meia contribuição.

## As três coisas que eu mandei

A primeira foi um fix de scroll. O terminal não rolava com a rodinha do mouse quando você estava dentro de um TUI de tela cheia, tipo o próprio Claude. Pra ver o que tinha subido, você precisava arrastar uma seleção de texto. O detalhe é que, num buffer alternativo, não existe scrollback do host pra rolar, então interceptar a rodinha só engolia o evento. A saída foi deixar o evento passar pro xterm nesse caso, e manter o Shift mais rodinha forçando o scrollback do host, que é a convenção do iTerm e do Windows Terminal. Extraí isso numa função pura só pra dar pra testar.

```ts
export function shouldScrollHostScrollback(bufferType: 'normal' | 'alternate', shiftKey: boolean): boolean {
  if (shiftKey) return true
  return bufferType !== 'alternate'
}
```

A segunda foi arrumar o ciclo de vida do terminal na sidebar. Antes, "fechar" fazia coisas demais de uma vez. Eu separei em três ações claras. Pausar mata o PTY e libera a RAM, mas guarda o `sessionId`, então dá pra retomar de onde parou. Kill mata a árvore de processos inteira e descarta a sessão, mas mantém o atalho na sidebar. Apagar é a remoção definitiva, com confirmação. A parte importante foi entender o modelo de retomada do app antes de mexer, pra não quebrar a sessão que o usuário quer manter viva.

A terceira, e a maior, foi o auto-update in-app. Antes, você descobria versão nova indo no GitHub na mão. Coloquei o plugin de updater do Tauri 2 rodando de ponta a ponta. Uma checagem silenciosa no boot, um chip discreto no rodapé da sidebar quando tem versão nova, sem popup no seu rosto, e um modal com as notas da release, barra de progresso, download, instalação e restart. Duas decisões dessa eu tenho orgulho. Uma foi manter o objeto nativo do update fora do store do Zustand, porque ele tem métodos nativos e não é serializável. A outra foi tratar toda falha, o build de dev sem chave de assinatura, o offline, o endpoint fora, como se não houvesse update, pra a feature nunca incomodar num contexto onde ela não roda. E deixei no PR as instruções do que o Kauã precisava fazer pra ligar a assinatura, gerar a chave e trocar a pubkey, pra ele não ter que adivinhar.

## O que eu ainda quero mandar

Tem uma issue minha aberta que é a que eu mais quero construir. Meu fluxo é abrir o Alethe numa pasta que segura vários repositórios, e eu queria que cada terminal entendesse o projeto onde está. Subir a árvore até achar o `.git`, ler os scripts do `package.json`, detectar o package manager pelo lockfile, achar o Dockerfile e o compose, e transformar tudo isso em atalho. O ponto é que o atalho é ponto de partida, não comando fixo. Ele escreve o comando no terminal pra eu ajustar o parâmetro antes de mandar. É exatamente a dor de quem tem sete projetos e digita o mesmo `pnpm dev` e `docker compose up` o dia inteiro.
