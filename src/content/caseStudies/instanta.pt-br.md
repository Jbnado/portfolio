---
slug: "instanta"
locale: "pt-br"
title: "Instanta"
summary: "Feed colaborativo de fotos por evento: os convidados alimentam um mural ao vivo com as fotos da festa. App 100% edge-native rodando em Cloudflare Workers, com autenticação forte (Argon2 no edge + 2FA) e suporte offline. Projeto pessoal em desenvolvimento."
---

## O Problema

Todo evento espalha fotos por dezenas de celulares e grupos de mensagem — nunca existe um álbum único, vivo e compartilhado. Eu queria algo instantâneo, mobile-first, que funcionasse até com o wi-fi ruim de um salão de festa.

## A Solução

Arquitetura edge-native: Hono rodando em Cloudflare Workers + D1 (SQLite no edge) via Drizzle, então a API fica a milissegundos de qualquer usuário. Front em React 19 + TanStack Router. Arquitetura limpa imposta por regras de fronteira no ESLint — os serviços de domínio não podem importar o framework, ficando testáveis sem subir um Worker. Segurança levada a sério mesmo sendo projeto pessoal: hash de senha com Argon2 em WASM no edge, 2FA por TOTP e força de senha com zxcvbn (dicionário pt-BR). Offline-first com IndexedDB e compressão de imagem no cliente antes do upload.

## O Resultado

Front e API sobem juntos pro mesmo Worker, com HMR abaixo de 500ms no dev. Qualidade garantida por testes baseados em propriedades (fast-check), testes de acessibilidade (axe-core) e portões de cobertura e tamanho de bundle no CI. Em desenvolvimento ativo.
