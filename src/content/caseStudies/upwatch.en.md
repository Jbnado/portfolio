---
slug: "upwatch"
locale: "en"
title: "UpWatch"
summary: "Uptime monitoring in Go that fits in one binary and shows latency next to state. A personal project of mine, open source under AGPL, with the UI embedded in the executable and a conformance suite that runs identically on SQLite and PostgreSQL."
highlights:
  - { value: "1 binary", label: "UI embedded via go:embed" }
  - { value: "12k/27k", label: "lines of test over lines of Go" }
  - { value: "2 databases", label: "the same conformance battery on both" }
meta:
  - { label: "ROLE", value: "Developer (solo)" }
  - { label: "TYPE", value: "Project" }
  - { label: "PERIOD", value: "2026" }
  - { label: "STACK", value: "Go · SQLite · Postgres · React" }
---

Almost every incident I've watched up close started with a service getting slow, not going down. Latency climbs, someone says it's hanging, and only much later does something actually stop responding. A monitor that only knows up or down shows up at the end of that story, when there isn't much left to do.

UpWatch puts both things in the same place. It checks over HTTP, TCP, ICMP, DNS, TLS, and a signal from the service itself, that last one for scheduled jobs and processes with no exposed port. The interval starts at five seconds and goes up, per monitor.

Installing it is one command.

```bash
docker run -d --name upwatch -p 8080:8080 -v upwatch:/data \
  ghcr.io/jbnado/upwatch:latest
```

You open it on 8080, create the admin account, and signup closes behind it. That's the only account born without authentication.

## One binary

The UI lives inside the executable, via `go:embed`. No nginx alongside it, no folder of static files, and none of the classic situation where the UI is on one version and the server handing it out is on another. The price is that building the UI became a prerequisite for building the binary, and `make build` handles the order.

Storage is pluggable across SQLite and PostgreSQL. That's easy to write in a README and hard to hold up, because the difference between the two lives in the corners, in date types, in conflict behavior, in transaction semantics. So the conformance suite runs the same battery against both databases, with nothing skipped. That's what keeps pluggable database from becoming a facade.

Keeping months of history without keeping months of raw data was in the design from the start too. Beats last a week and then roll up into hourly and daily aggregates. Percentiles always come from the raw data, never a percentile of percentiles, which is the shortcut that makes the month's p99 look a lot better than it was. An install with five targets checking every minute took 2.6 MB after thirty days.

## The sentinel that has to prove it works

When checks start failing in a row, there are two explanations, and they call for opposite reactions. Either the targets went down, or the network UpWatch is watching from went down. Treating the second like the first fills the on-call rotation with false alarms on the night the server's network flapped.

So there's an independent probe. When checks fail, it verifies that the local network still answers. If it doesn't, those results become "no measurement" instead of "down".

The part I find most interesting is the lock. That probe only earns the power to silence after proving it works. A probe blocked by a firewall would always report that the network is out, and UpWatch would start swallowing every alert forever, without telling anyone. A monitor that never alerts looks an awful lot like a monitor that never had to.

The same concern shows up in `/metrics`. In `upwatch_monitor_status`, 1 is up, 0 is down, 2 is degraded, and "no measurement" is `-1`, not zero. If it were zero, every freshly created monitor would fire an alert before its first check even ran. And the target's address never becomes a label. Beyond describing the internal topology to whoever reads the Prometheus, an address in a label is high cardinality, and high cardinality is how you take a Prometheus down.

## The webhook belongs to whoever receives it

The webhook channel started out delivering an envelope of mine, with the fields named the way I chose. That works fine until you try to wire it into a destination that already exists and expects the fields named its way. You can't always change the receiver.

Today you declare the shape of the body and the placeholders get substituted.

```json
{
  "url": "https://automation.example/alerts",
  "headers": { "X-Key": "…" },
  "body_template": {
    "event": "$status",
    "service": { "name": "$monitor", "id": "$monitor_id" },
    "outage_seconds": "$duration_seconds",
    "summary": "[$status] $monitor"
  }
}
```

Two decisions there matter more than the feature itself.

Substitution happens over the already-decoded JSON, and the result is serialized back. Never by string concatenation. It sounds like fussiness until you picture a monitor with quotes in its name, or an error cause with a line break, producing a malformed body the destination rejects. You'd lose the outage notification because of the outage itself.

And an unknown placeholder is rejected when the channel is saved, not at delivery time. Finding the typo during the incident is finding it too late.

## The public page that doesn't give away what it shouldn't

The public status page follows the format Anthropic, Cloudflare, and Google settled on. Verdict at the top, components grouped, ninety bars of history, past incidents with a timeline.

What it does on purpose is not publish the cause. The cause the probe detects is literal and internal, something like `dial tcp 10.0.3.7:5432: connect: connection refused`, and it would hand over the address, port, and technology of a service nobody outside should be able to see. The bars are automatic, the write-up is written by hand. A freshly deployed install shows the bars and "no incidents reported".

Each component also gets its own public label. The monitor can be called `api-prod-us-east-1` in operations and show up as "API" for whoever's reading, without forcing you to rename anything or hand over your naming convention.

## How this got built in three days

Thirty-seven commits between July 29 and 31. It's worth saying how, because the speed isn't the interesting part.

The `git log` is the plan, executed. Foundation, storage, scheduler, checkers, rollups, authentication, API, UI, incident engine, notification channels, public page, PostgreSQL, metrics, release. Vertical slices, each with its intent stated in the commit subject. *"feat(metrics): Prometheus exposure, and the composition that was hiding it"*. *"feat(status): public screen, and what survived the intrusion attempt"*.

I wrote the design first and ran the execution with agents working in parallel in Alethe, in short cycles, each with its own planning document. AI writes far faster than I type, and there's no point pretending otherwise. What I bring is what it doesn't decide on its own, which is the constraints.

Every decision I described above is that. The sentinel's lock exists because I asked what would happen if the probe itself got blocked. The Prometheus `-1` exists because I thought about the freshly created monitor. Substitution over decoded JSON exists because I pictured the name with quotes in it. None of those came from a requirement written down anywhere.

And what holds the result up is the tests. The project is written in TDD, and the suite is the main design artifact it has. Twelve of the twenty-seven thousand lines of Go are test, across 651 functions. Storage conformance runs the same battery on both databases. A drift test checks the OpenAPI spec against the real routes, in both directions, so the documentation has no way to age on its own.

And there's a battery built only to attack the one surface that asks for no credentials, the public page. Path traversal in nine shapes, SQL injection in the slug, page enumeration, hostile text, a forged `Host` header. One of them found a real defect during development.

## Where it stands today

Public on GitHub under AGPL-3.0, with an image on GHCR, a static binary in the releases, and a compose file with PostgreSQL for when the monitor's own availability matters. It has a project site live, CI with the race detector, and Dependabot has already opened, and I've already merged, the first dependency bumps.

The API is first class rather than an accessory to the UI, so the screen consumes exactly the same endpoints any script of yours would. Anyone already running Prometheus wires up `/metrics` and lets the alerting live where the rest of it already lives.
