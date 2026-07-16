---
slug: "instanta"
locale: "es"
title: "Instanta"
summary: "Feed colaborativo de fotos por evento: los invitados alimentan un muro en vivo con las fotos de la fiesta. App 100% edge-native en Cloudflare Workers, con autenticación fuerte (Argon2 en el edge + 2FA) y soporte offline. Proyecto personal en desarrollo."
---

## El Problema

Cada evento dispersa fotos entre decenas de celulares y grupos de mensajes — nunca existe un álbum único, vivo y compartido. Quería algo instantáneo, mobile-first, que funcionara hasta con el wi-fi malo de un salón de fiestas.

## La Solución

Arquitectura edge-native: Hono en Cloudflare Workers + D1 (SQLite en el edge) vía Drizzle, así la API queda a milisegundos de cualquier usuario. Front en React 19 + TanStack Router. Arquitectura limpia impuesta por reglas de frontera en ESLint — los servicios de dominio no pueden importar el framework, quedando testeables sin levantar un Worker. Seguridad tomada en serio aun siendo proyecto personal: hash de contraseña con Argon2 en WASM en el edge, 2FA por TOTP y fuerza de contraseña con zxcvbn (diccionario pt-BR). Offline-first con IndexedDB y compresión de imagen en el cliente antes del upload.

## El Resultado

Front y API suben juntos al mismo Worker, con HMR por debajo de 500ms en dev. Calidad respaldada por tests basados en propiedades (fast-check), tests de accesibilidad (axe-core) y controles de cobertura y tamaño de bundle en el CI. En desarrollo activo.
