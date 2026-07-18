---
slug: "instanta"
locale: "en"
title: "Instanta"
summary: "A collaborative per-event photo feed, with a live wall and a big-screen mode for the venue. My own solo project, edge-native on Cloudflare (Workers, D1, R2, Durable Objects), with a security and architecture posture more serious than a party app would ever ask for."
highlights:
  - { value: "edge", label: "Workers + D1 + R2 + Durable Objects" }
  - { value: "solo", label: "personal project, built alone" }
  - { value: "workerd", label: "integration tests in the real runtime" }
meta:
  - { label: "ROLE", value: "Developer (solo)" }
  - { label: "TYPE", value: "Project" }
  - { label: "PERIOD", value: "2026" }
  - { label: "STACK", value: "Hono · Workers · D1 · React" }
---

Every event today scatters its photos across twenty phones and three WhatsApp groups. In the end nobody has the whole album, and the good shots get lost in the chat. Instanta is my attempt to fix that. It's a collaborative per-event photo feed. Guests join, post photos to a wall that updates live, and you can throw the whole thing onto a big screen at the venue.

Joining has no signup. A guest types in just a name and posts. If they want, that name later becomes a real account without losing anything they already uploaded. There are reactions, comments, stories, a few "missions" to nudge people into posting, and the big-screen mode showing the feed right there in the room. The photos are ephemeral, they delete themselves thirty days after the event.

It's my own project, solo. I went into it wanting to build something genuinely edge-native, and to treat the security and architecture with the care I'd give a product, not a weekend.

## Genuinely edge-native

Instanta runs entirely on Cloudflare's edge. The backend is Hono in a single Worker, with the database on D1, their SQLite that lives at the edge, accessed through Drizzle. Photos sit in R2 and are served through the Worker itself. Rate limiting lives in a Durable Object, and five cron jobs handle cleanup, backup, and monitoring.

The front end is React 19 with TanStack Router. What I like most about the setup is that, in dev, the front end and the Worker come up in the same process with sub-500ms HMR, and in production the two ship together in a single deploy. The API sits milliseconds from any guest, and keeping it running costs next to nothing.

Let me be honest about where it stands. Today it ships to a workers.dev address. The custom domain is already in the code, but switched off, waiting for me to migrate the DNS to Cloudflare. Transactional email is still a stub. It's a personal project under construction, not a product that's live.

## Security

I took security far more seriously than a party photo wall demands. There's 2FA, the care not to reveal whether an email exists on a login attempt, rate limiting that tightens on whoever keeps hammering, and session handling that notices when a token has been stolen and drops that account's sessions. A party app would never ask any of this of me. This was the place where I wanted to exercise security for real, so I did.

## Architecture

The part I like best doesn't show up on screen. The layer that holds the business logic is forbidden, by an ESLint rule, from importing Hono, the Cloudflare runtime, the routes, or the middleware. If I bump into that boundary, the lint breaks on the spot. The effect is that this layer has no idea a Worker exists beneath it, so I can test the whole business logic without spinning anything up.

## Tests that run on the real runtime

The integration tests don't run against a Cloudflare mock. They run inside workerd, the real Workers runtime, with actual D1, R2, and Durable Object, each test with its database isolated from the next. There are 78 test files covering signup, login, permissions, LGPD data erasure, moderation, upload, and the crons. There's also accessibility testing with axe-core in Playwright and a coverage floor in CI.

## The offline that actually exists

Instanta isn't a PWA, it doesn't install and it doesn't open without internet, and I won't pretend it does. But the upload survives a bad connection, and that part is real. Each photo, already compressed on the phone itself, goes into a queue in the browser before it tries to upload. If the network drops or you close the tab midway, it isn't lost, and when the connection comes back the queue drains on its own. The compression also strips the image's EXIF and GPS metadata, so where the photo was taken doesn't travel with it.

Today Instanta is a personal project of about three weeks of work, built alone, and not yet launched. What's left to put it live is mundane. Migrate the domain's DNS, wire up real email instead of the stub, and point it at the first real event.
