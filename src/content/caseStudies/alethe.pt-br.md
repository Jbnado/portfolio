---
slug: "alethe"
locale: "pt-br"
title: "Alethe"
summary: "Workspace desktop local-first e open source para rodar e retomar vários agentes de código (Claude Code, Codex, OpenCode) e terminais reais em paralelo. Contribuí com o projeto do mantenedor, mexendo no backend em Rust e na experiência de terminais."
---

## O Problema

Rodar vários agentes de código e terminais ao mesmo tempo vira um caos de janelas — e, pior, fechar uma aba mata o processo por baixo, jogando fora a sessão do agente e todo o contexto acumulado.

## A Solução

Backend de PTY real em Rust (portable-pty), com a sacada de desacoplar o processo do container visual: fechar a aba na interface não mata o terminal por baixo. Em cima disso, um sistema de painéis divididos com vários layouts, sub-abas por terminal para empilhar agentes e shells, suspensão de grupos para liberar memória e persistência de scrollback e sessão para retomar o contexto de onde parou.

## O Resultado

Instaladores assinados para Windows, macOS (Apple Silicon e Intel) e Linux, gerados por um pipeline no GitHub Actions. Terminais que continuam vivos ao trocar de layout ou fechar containers visuais, sem perder sessão.
