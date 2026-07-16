---
slug: "alethe"
locale: "es"
title: "Alethe"
summary: "Un workspace de escritorio local-first y open source para ejecutar y retomar varios agentes de código (Claude Code, Codex, OpenCode) y terminales reales en paralelo. Contribuí al proyecto del mantenedor, trabajando en el backend en Rust y en la experiencia de terminales."
---

## El Problema

Ejecutar varios agentes de código y terminales a la vez se vuelve un caos de ventanas — y peor, cerrar una pestaña mata el proceso por debajo, tirando la sesión del agente y todo el contexto acumulado.

## La Solución

Un backend de PTY real en Rust (portable-pty), con la clave de desacoplar el proceso del container visual: cerrar una pestaña en la interfaz no mata el terminal por debajo. Encima de eso, un sistema de paneles divididos con varios layouts, sub-pestañas por terminal para apilar agentes y shells, suspensión de grupos para liberar memoria y persistencia de scrollback y sesión para retomar el contexto donde se dejó.

## El Resultado

Instaladores firmados para Windows, macOS (Apple Silicon e Intel) y Linux, generados por un pipeline en GitHub Actions. Terminales que siguen vivos al cambiar de layout o cerrar containers visuales, sin perder la sesión.
