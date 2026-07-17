---
slug: "adg"
locale: "en"
title: "ADG — Arena Draft Guide"
summary: "Stats tracker for League of Legends (Arena and ARAM: Mayhem) and Valorant for a group of friends. I contributed the self-hosted production infrastructure and the companion app that captures data Riot's public API doesn't expose."
highlights:
  - { value: "$0", label: "monthly cost · Oracle Free Tier" }
  - { value: "2×", label: "replicas · zero-downtime deploy" }
  - { value: "0", label: "matches lost · offline outbox" }
meta:
  - { label: "ROLE", value: "Infra + Companion (solo)" }
  - { label: "TYPE", value: "Contribution" }
  - { label: "PERIOD", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · Swarm" }
record:
  label: "Final stats · top 1 vs me"
  cards:
    - champ: "Cho'gath"
      who: "hokko tarumae · #1 in top bugs"
      kda: "29/4/12"
      stats:
        - { k: "HP", v: "16,496,110" }
        - { k: "Ability Power", v: "693,745" }
        - { k: "Damage", v: "1,350,568" }
        - { k: "Mitigated", v: "33,628,504" }
    - champ: "Sion"
      who: "me (Jbnado) · #4"
      kda: "29/7/8"
      stats:
        - { k: "HP", v: "4,379,066" }
        - { k: "Damage", v: "693,589" }
        - { k: "Mitigated", v: "4,756,934" }
---

Do you play Arena, the LoL mode? If you do, you know the silly, addictive meta that comes with it: win with as many champions as possible. My friends lived in that hunt. The problem is that LoL has a terrible interface for keeping track of it. Who you've already won with, who's left, who came second or third. None of that is easy to see in the client. So we decided to fix it.

At first it was quick. Hitting Riot's public API, we built a screen to see which champions each of us had already won with, who was missing, who'd come second and third. Simple and satisfying. But then came the realization that moves the whole project: the API was incredibly rich, and with that data you could do far more than a list. So ADG kept growing. Top bugs was born, ranking the most absurd matches by damage, damage mitigated, and healing. Player rankings, builds, tier lists. Every new piece of data turned into a new screen.

But the part I want to tell here is a different one. There's a mode I find way too fun, ARAM: Mayhem, and Riot simply doesn't serve it through the public API. Queue 2400 answers 403, and it's not an oversight. Riot pulled Mayhem from the API on purpose, to keep the mode experimental and stop aggregator sites from publishing stats and "solving" the meta. The irony is good, because the aggregator they didn't want is exactly the one I was going to want to build. For Arena the data came for free. For Mayhem, it didn't come at all. Like any self-respecting dev, I was going to need a hack to reach that data. And a question stuck with me through the whole project: if the hack works, and it's clean and well made, is it still a hack?

ADG today is a tracker for Arena, ARAM, and Valorant, with plenty of room to grow. It was created by two friends of mine. I loved the idea, jumped in to help however I could, and ended up focusing on two things: Mayhem, the mode I most wanted to see live, and the infrastructure, so they'd never have a bill. Those two are what I write about here.

## Reading the LoL client

The Mayhem data isn't in the public API, but it exists. It's in your own LoL client, which needs it to draw the post-game screen. The companion's whole idea is to go get it right there. It's a desktop app in Tauri + Rust that reads the local League client and sends the Mayhem matches to ADG.

The League client exposes a local HTTP API, the LCU (League Client Update, the client's own internal API). It comes up on a random port every time you open the game, and protects everything with a token that rotates along with it. The usual way to discover those credentials is reading a `lockfile` the client leaves on disk. I went another way, one that breaks less. I scan the processes with `sysinfo` looking for `LeagueClientUx.exe` and read the port and the token straight from its command line, which is where Riot also puts them.

```rust
if let Some(v) = arg.strip_prefix("--app-port=") { port = v.parse().ok(); }
else if let Some(v) = arg.strip_prefix("--remoting-auth-token=") { token = Some(v.to_string()); }
```

With the port and token, I spin up an HTTPS client to `127.0.0.1`, authenticate with Basic `riot:{token}`, and accept the self-signed certificate the client itself uses. From there it's a conversation. I ask who the summoner is at `/lol-summoner/v1/current-summoner`, the `gameId` of the match in progress at `/lol-gameflow/v1/session`, and the full game at `/lol-match-history/v1/games/{gameId}`, which returns the roughly 118 stat fields for each of the ten players. That last one is the rich data, the one that feeds the ranking.

But the LCU alone doesn't see everything I need. It gives me the final scoreboard, but not what happened during the match. For that there's a second local API, the LiveClient Data API, at `127.0.0.1:2999`. It only answers while you're in game, doesn't even ask for auth, and it's what tells me, live, whether the mode is Mayhem. Riot calls Mayhem `KIWI` internally (Arena is `CHERRY`), so I just check the `gameMode` at `/liveclientdata/gamestats`. The two complete each other. LiveClient has the live state but not the `gameId`, which only shows up once the match indexes. The LCU has the right `gameId` but only after the game. I need both at the same time, and that's what the live capture solves.

## Capturing while the match happens

In the Tauri `setup` I spin up three `tokio` tasks that run for the app's whole life.

The first is the live capture, polling every 3 seconds. While a Mayhem game is in progress, it reads the player's `championStats` from LiveClient and keeps two snapshots. One is the final build, the last value seen before the match ended. The other is the peak of nine attributes over the game: attack damage, ability power, armor, magic resistance, max health, attack speed, movement speed, life steal, and omnivamp. That peak is what becomes the "highest X" records on the site. It's also where I grab the match's `gameId`, taken from gameflow while still in game, so I don't depend on the match indexing later.

The second task is the background sync, every 20 seconds. If you're logged in, it runs the backfill once per client session (the default history window, the last matches) and then drains the outbox. The third is a boot drain, flushing whatever was left pending from a previous run of the app.

Two things are worth pulling apart because they tend to get mixed up. Capture doesn't need a login. If you played Mayhem with the app open, the live snapshot is saved even while logged out. Login is only required for the upload, when it's time to send to the server. That matters because it decouples "don't lose the data" from "be authenticated right now," and it leads straight into the part I most enjoyed.

## The outbox, or how not to lose a match

The rule I wanted to guarantee was easy to state and annoying to keep. Nothing captured can be lost if the server goes down, the internet flickers, or the app gets closed mid-send. The way to keep it is to not trust the network at any moment. Everything I capture goes first to a JSON file on disk, before any send attempt, and only leaves there after a confirmed `2xx`.

The file holds three kinds of item. A `PendingMatch`, which is just a `gameId` waiting to be resolved into the rich detail via `/games/{id}`. A `Snapshot`, which is the final build plus the attribute peak from that live capture. And the `MatchPayload`, which is the `PendingMatch` already resolved, ready to go up. A drain loop walks the queue and tries to deliver each item.

What ties it together is the retry policy, typed by the nature of the error instead of a blind "try again."

```
Transient (5xx, network, LCU down)   retries forever
Permanent (4xx)                      dropped after 5 failures
UpdateRequired (426)                 never dropped, held until update
```

Each of those lines solves a real problem. The transient one is the common case, a server restarting or wi-fi dropping, and the right answer is to insist. The permanent one is when the server refuses that data for good, and insisting forever just clogs the queue, so after five tries the item is dropped. The `426` is the most interesting. Every request carries an `x-companion-version` header, and the server can turn away an old client. When that happens, the whole outbox freezes until the user updates. On purpose. I'd rather hold the data than push it in a format the backend no longer speaks and corrupt everyone's ranking.

Beyond the retry policy, the outbox has a few cares that only show up once you've been burned by a persistent queue before. It deduplicates by `gameId`, so the same game doesn't go in twice. If the file on disk corrupts, it loads as an empty queue instead of taking down the app. And the drain loop never holds the mutex across an `await`. It takes a snapshot of the queue, releases the lock, makes the network call, and only then grabs the lock again to remove what it delivered. It's the kind of detail that changes nothing when it works and avoids a deadlock when it doesn't. In the end it's five tests covering the annoying cases: persist and reload, replace preserving the id, drop permanent at the limit, transient that never drops, and the dedup. It's little code for a big guarantee.

There's a nice side effect in all of this. Since `/games/{gameId}` returns all ten players at once, an upload from anyone in the match already fills in the rich data for the other nine. One friend in the lobby with the app open is enough for everyone in that match to show up on the ranking with full stats.

The question from the start already had its answer here. Reading the game client under the hood is a hack, no doubt. But a hack with a disk-backed outbox, typed retries, and automated tests stops looking like a kludge and becomes just the right way to solve a crooked problem.

## Standing it up on a free VPS

All of this server-side runs on a VPS that costs zero per month. It's an ARM VM from Oracle Cloud's always-free tier, with 2 OCPU (Oracle's OCPU is a physical core with hyperthreading, so in practice about two cores) and 12 GB of RAM. There's a trick here worth telling. ARM capacity on the free tier is perpetually out for trial accounts, and Oracle sometimes reclaims idle free-account VMs. The way out was to upgrade the account to Pay-As-You-Go while keeping usage within what's always-free. The cost stays zero, but the account stops being trial, which unlocks the ARM capacity and removes the risk of losing the machine to idleness. Alongside that, a reserved public IP, also free, so the VM survives a recreation without me having to update DNS.

I orchestrated it with single-node Docker Swarm. It's a choice that tends to raise an eyebrow, so it's worth the why. I wanted the real primitives of an orchestrator: rolling update, replicas, secrets, healthcheck. Kubernetes delivers all of that and much more, but the "much more" charges a lot in CPU and operation on a two-core machine. Swarm gives exactly those primitives with a YAML that's almost the compose I already know how to write, and without a heavy control plane eating the machine. For a single node, it's the right spot on the curve.

## The edge's circular dependency

The infra is split into two stacks, and the reason is a circular dependency that shows up when you want to deploy through the UI. Portainer is what deploys everything via GitOps. Except Portainer, for me to open its panel, needs to be up and routed. And what routes is Traefik. So Traefik and Portainer have to exist before anything they'll serve, including before themselves. Since they can't depend on the rest, they live in an `edge` stack that I bring up once, by hand. Everything else lives in the `adg` stack, with the API on two replicas, Postgres, Redis, backup, and the observability, and there Portainer is the one that brings it up via GitOps.

Traefik handles ingress and issues and renews the TLS on its own via ACME (the Let's Encrypt protocol). That's why I picked it over nginx, which would've forced me to keep certbot with a renewal cron. Ports 80 and 443 are published in `mode: host` on purpose. In that mode Traefik sees the client's real IP, instead of the internal Swarm network IP, and the API needs that real IP for rate limiting to work. There was also a bug I documented along the way: Traefik v3.1 pinned Docker API version 1.24 on the Swarm provider, which Docker 25+ rejects, and the result was Traefik coming up with no routes. The fix was v3.7, which negotiates the API version.

A detail I like is the edge compression. The ranking's aggregated responses are big JSON, around 68 KB, and compressing cuts about 80% of that, which makes a real difference for anyone opening on 4G. But the compression explicitly excludes `text/event-stream`. Compressing a stream buffers the response, and buffering kills the real-time events. So the bandwidth win applies to the JSON and gets out of the way of what needs to arrive on time.

## The deploy that guarantees the pull

The deploy is fully automated. A merge to `main` triggers GitHub Actions, which builds the arm64 image with QEMU and buildx, publishes it to GHCR, and hits a Portainer webhook to `git pull` the compose and bring it back up. A filter decides whether to rebuild the API image, the backup image, or neither, looking at what changed in `server/**` and `infra/**`.

The detail worth telling is a Swarm behavior that trips a lot of people. It only swaps the running image when the service spec changes. With `image: ...:latest` fixed, the spec doesn't change between deploys, so Swarm doesn't even try a new pull. The old image keeps running, thinking everything's fine, while the new one sits in the registry with nobody fetching it. The fix was to have the CI itself pin the freshly built image's `@sha256` digest into the compose and commit it back with `[skip ci]`.

```yaml
sed -i -E "s#(image:...)${IMAGE_API}[^ ]*#\1${IMAGE_API}@${API_DIGEST}#" infra/docker-compose.yml
git commit -m "chore(deploy): fixa digest [skip ci]"
```

Since the digest changes on every deploy, the spec changes with it, and the pull becomes guaranteed. The rolling update itself is zero-downtime because the API runs on two replicas with `order: start-first`, which brings the new replica up before killing the old, and `failure_action: rollback`, which reverts on its own if the new image comes up broken. The secrets never touch the CI. JWT, database password, and Riot keys live in the stack's variables, which I edit through Portainer's UI without opening SSH. Rotating a Riot key is a click, not a deploy.

The arm64 build had its own lesson too. At first `bcrypt` compiled C++ under QEMU emulation and each build took about ten minutes. I swapped it for `@node-rs/bcrypt`, which has a prebuilt arm64 binary, and added build cache on Actions. The ten minutes became seconds.

## Seeing what's going on

So I don't find out it went down from a friend complaining in the group chat, I put in real observability. There's Grafana with Loki and Promtail for the logs, and Prometheus with node-exporter, cAdvisor, postgres-exporter, and a blackbox-exporter that hits the API's `/health` from outside every 15 seconds. That external probe is what lights up the "up / down" on the Grafana home, because it tests the service the way a user does, not from the inside. There are four dashboards, one home, one for the API, one for Postgres, and one for the infra.

Here's a Swarm gotcha that pairs with the deploy one. Swarm configs are immutable. If I change `prometheus.yml` and redeploy, it breaks with a "config already exists," because Swarm won't let you overwrite an existing config. The way around is to version it in the name, rename `prometheus_config` to `prometheus_config_v2` in both places, and Swarm creates a new one. Grafana escapes this because its dashboards are mounted by bind mount instead of a Swarm config. Editing a panel is swapping a `.json` in the repo and running `git pull` on the VM, and Grafana reloads with no redeploy.

## Postgres and Redis, each in its place

Postgres is the only service I treat with a hard rule. It stays pinned to the manager node, with a single replica and a local volume. The rule is scale the API freely and never the database. Two Postgres replicas pointing at the same place is a problem, not redundancy. It's published on 5432 in `mode: host`, but only reachable if the VCN's Security List opens the port to specific `/32` IPs of the group, never to `0.0.0.0/0`.

The Postgres tuning also produced a lesson. I had an `idle_session_timeout` set, and it was killing the Prisma pool's idle connections and filling the log with reconnects. I swapped it for TCP keepalives, which only drop the client that actually died, instead of killing a healthy connection just for sitting still for a moment.

Redis came in late, and for a specific reason. With the API on two replicas, a WebSocket connected to one replica couldn't see the users connected to the other, so real-time presence broke depending on where you landed. Redis holds that shared presence across the replicas, via pub/sub. It's ephemeral on purpose, no volume and with a memory cap, because it's session state, not data I need to persist.

## Backups I trust

The backup is a `pg_dump` every 6 hours, with 14 days of retention, sent to two different clouds. One is Oracle's own Object Storage. The other lives outside Oracle, on an R2, and exists precisely in case the account ever gets reclaimed. A failure sending to one destination doesn't stop the other. And I test the restore now and then, because a backup you've never restored isn't a backup, it's hope.

## The king of top bugs

In the end, ADG is a little corner to keep our own numbers with friends, whether on Arena or Mayhem. And it records every absurd thing we've ever pulled off. The king of our top bugs right now is a Cho'gath that finished an Arena match with 16.5 million HP and nearly 700k ability power. I'm in fourth, with a Sion at 4.4 million HP, and I didn't bug it any further because I had to leave and go to the doctor.

If you play Arena or ARAM, jump into [adg.gg](https://adg.gg), sync your matches, and hop into our Discord. Show up on the ranking and come break that number. I dare you.
