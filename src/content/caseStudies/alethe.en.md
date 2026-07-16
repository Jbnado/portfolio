---
slug: "alethe"
locale: "en"
title: "Alethe"
summary: "A local-first, open-source desktop workspace for running and resuming multiple coding agents (Claude Code, Codex, OpenCode) and real terminals in parallel. I contributed to the maintainer's project, working on the Rust backend and the terminal experience."
---

## The Problem

Running several coding agents and terminals at once becomes a chaos of windows — and worse, closing a tab kills the underlying process, throwing away the agent's session and all its accumulated context.

## The Solution

A real PTY backend in Rust (portable-pty), with the key move of decoupling the process from the visual container: closing a tab in the UI doesn't kill the terminal underneath. On top of that, a split-pane system with multiple layouts, per-terminal sub-tabs to stack agents and shells, group suspension to free memory, and scrollback + session persistence to resume context right where you left off.

## The Result

Signed installers for Windows, macOS (Apple Silicon and Intel), and Linux, built by a GitHub Actions pipeline. Terminals that stay alive when switching layouts or closing visual containers, without losing the session.
