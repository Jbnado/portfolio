---
slug: "gather-bots"
locale: "en"
title: "gather-bots"
summary: "Feeds Gather's Smart Objects with your actual work. A PR waiting on you, a red pipeline, a task in progress, a meeting about to start, all on your desk in the virtual office. A personal project of mine, open source under MIT, ports and adapters end to end."
highlights:
  - { value: "0 req", label: "what a minute with no news costs" }
  - { value: "130", label: "test cases, pure domain with no network" }
  - { value: "~1 MB", label: "what the image adds on top of node:24-alpine" }
meta:
  - { label: "ROLE", value: "Developer (solo)" }
  - { label: "TYPE", value: "Project" }
  - { label: "PERIOD", value: "2026" }
  - { label: "STACK", value: "TypeScript · Node 24 · Docker" }
---

In Gather, the virtual office, everyone gets a desk. You can decorate it with objects, and some of those are Smart Objects, which accept commands over a webhook. In practice, almost everyone uses them as decoration.

Knowing what's waiting on me, on an ordinary day, means opening four tools. A PR asking for review in one, a red pipeline in another, a task in progress in a third, a meeting starting in ten minutes in the fourth. None of them talk to each other, and the desk just sits there doing nothing.

gather-bots wires one into the other. Three objects, and each one answers a question.

```
INBOX          [8]  what's waiting on me
                    PR #101 · fix shipping calculation
                    Bug · Doing · rounding on invoices

BOT STATUS   alert   what runs without me
                    svc-orders · main   ← red pipeline

LIGHTBULB      off   can you interrupt me?
                    "In a meeting: Weekly"
```

Nothing you don't configure runs. One object and one integration is already a useful system, and whatever isn't configured stays quiet, switched off.

## Ports and adapters, and why it isn't decoration

The core knows nothing about Azure DevOps, Google, Microsoft, or Gather itself. That usually sounds like architecture for architecture's sake, so it's worth saying what it actually buys. Three things can be added without touching the middle.

A new source, say Jira, GitHub, Linear, or PagerDuty, implements a port and gets one line in a registry. A new surface is a pure function from signals to object state. And a destination that isn't Gather implements the other port, and everything else keeps working, whether that's a Philips Hue bulb, a Slack status, or an LED strip on the wall.

The decision that paid off most was separating who reports from who presents. A source reports the fact and carries no routing, so it never decides that something "goes in the Inbox". If it did, the product decision would leak into the adapter, and changing what an object means would mean touching every source. Since Google and Outlook emit exactly the same kind of signal, the second calendar provider cost nothing on the surfaces, and both can run together.

## The diff that keeps the cost at zero

Gather's rate limit is per space, not per object. That changes everything, because each command is a POST and the SDK doesn't batch. Three objects with twenty items each, every minute, would abuse the whole space's limit, and the space is shared with the rest of the company.

The dispatcher computes the desired state, compares it against the last one it sent, and emits only the difference. In steady state, a minute with no news costs zero requests. First boot is the exception, and it sends everything spaced out rather than in a burst.

## The things that bite

This is where the real work lives, and the README has a section by that name.

`activity.clear` is forbidden in the code. One object carries entries from several sources at once, and clearing would erase the other sources' entries. I didn't trust discipline for that, so the `Command` type omits the event and the compiler refuses before I can even write the call.

An integration going down doesn't wipe your feed. The last good result holds for up to fifteen minutes, and after that the items disappear, because a meeting that ended an hour ago is worse than no meeting at all. But if every source fails at once, nothing is written, because that's a network outage and not your entire day emptying out simultaneously.

The feed shows at most fifteen items, and above that a "+N more" line goes in. The counter still shows the real total. A badge of twenty-three over a feed of fifteen is UI that lies, and UI that lies about how much work is waiting is worse than no UI.

And there's the limit that isn't technical. The feed is visible to every Member and Guest in the space, which sets the ceiling on what can go in it. PR and task titles are the limit. PR bodies and client names don't go in.

## The checkup

`pnpm checkup` works before you've configured anything, and that's exactly the point. It never fails for lack of configuration, it just tells you what's missing and which variable would turn it on.

Each object and each integration falls into one of three states. Working, not configured, or configured and broken. Only the third deserves attention, and that distinction is the difference between a diagnosis and a wall of red you learn to ignore.

## The design doc came first

This project shipped in two days, with agents writing the code, and the proof that it wasn't improvised is committed. The design document was written before a single line existed, with decisions numbered D1 through D7, and the commits came out in the order of the build sequence it defines.

Before the decisions, the document has a section of discovered constraints, read out of the SDK's documentation. Authentication via Standard Webhooks, the URL and secret pair being per object, the table of which capabilities each preset has, the size limits on each field, and the per-space rate limit. Half the design decisions fell straight out of that table.

The document also records something I like more than the decisions, which is where it forced me to stop and go look. Gather's support documentation describes the lightbulb changing between green, yellow, and red. I went to check against the real space and the behavior doesn't match. Neither the SDK nor the reference exposes any field, event, or capability that sets color, because appearance is Gather's rendering decision and the API only picks state. The consequence is that the production versus develop distinction went to live on the status object, rather than on a colored bulb I'd have discovered didn't exist after building on top of it.

That's what I think changes when you build with agents. AI writes far faster than I do, and what decides the result is how many of those questions got answered before starting.

What holds it up afterward is the tests. There are 130 cases, and the surfaces are pure functions from signals to state, tested with no network at all. The Gather adapter has a fake counterpart so the suite can run without POSTing into a real space.

## Where it stands today

Public on GitHub under MIT, with CI passing on Linux, Windows, and macOS. It runs as a container, as a rootless user systemd service, or as a scheduled task on Windows. The image is built in two stages and carries neither TypeScript nor tsx, so the layers the project adds come to about 1 MB on top of `node:24-alpine`, capped at 128 MB of memory. A monitor that gets in the way of the machine it monitors has failed at its job.
