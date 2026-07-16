---
slug: "instanta"
locale: "en"
title: "Instanta"
summary: "Collaborative per-event photo feed: guests fill a live wall with the party's photos. A fully edge-native app running on Cloudflare Workers, with strong auth (edge Argon2 + 2FA) and offline support. Personal project in progress."
---

## The Problem

Every event scatters photos across dozens of phones and chat groups — there's never one shared, living album. I wanted something instant, mobile-first, that works even on a venue's flaky wi-fi.

## The Solution

Edge-native architecture: Hono on Cloudflare Workers + D1 (SQLite at the edge) via Drizzle, so the API sits milliseconds from any user. React 19 + TanStack Router front end. Clean architecture enforced by ESLint boundary rules — domain services can't import the framework, staying testable without spinning up a Worker. Security taken seriously even for a personal project: Argon2 password hashing in WASM at the edge, TOTP 2FA, and zxcvbn password strength (pt-BR dictionary). Offline-first with IndexedDB and client-side image compression before upload.

## The Result

Front end and API deploy together to the same Worker, with sub-500ms HMR in dev. Quality backed by property-based tests (fast-check), accessibility tests (axe-core), and coverage + bundle-size gates in CI. Under active development.
