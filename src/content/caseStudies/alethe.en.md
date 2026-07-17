---
slug: "alethe"
locale: "en"
title: "Alethe"
summary: "Alethe is a desktop workspace for running and resuming multiple coding agents and real terminals in parallel, created by Kauã (Kc1t). I use it every day and contributed back with three merged PRs, from a scroll fix in TUIs to an in-app auto-update with the Tauri updater."
highlights:
  - { value: "3", label: "merged PRs (scroll, kill/pause, auto-update)" }
  - { value: "2–3", label: "projects I run in it at once" }
  - { value: "Tauri", label: "Rust + React, local-first app" }
meta:
  - { label: "ROLE", value: "Contributor" }
  - { label: "TYPE", value: "Contribution" }
  - { label: "PERIOD", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · React" }
---

I work on two or three projects almost at the same time, and I have six or seven more lined up, growing. That turns into a pile of open terminals, a coding agent running here, docker there, a node and a python over here. Alethe is where I bring all that together. It's a desktop workspace for running and resuming multiple agents and real terminals in parallel, with the projects in the sidebar and a shortcut to reopen each terminal fast. That's what keeps me on it. A pleasant interface, easy shortcuts, and a focus on the agents.

Alethe isn't mine. It's an open-source project by Kauã, Kc1t, who happens to be my coworker, my partner, and someone I consider a friend. I come in as a heavy user who decided to give something back. Three of my PRs went into the project, and those are what I write about here. I didn't build the PTY engine, the Spotify integration, or the split panes, that's Kauã's. But the three things I sent I did in full, and each one taught me a piece of how it works underneath.

## The bug that pulled me in

Using Alethe hard, with Claude running, I watched the app's memory climb without stopping. I went digging and the process subtree was at about 3.5 GB spread across 65 processes. The cause was subtle. When you kill a PTY, the signal goes only to the direct child, the shell, and not to the whole process group. Claude and the node scripts spawn several subprocesses, and when the shell died, the grandchildren were left orphaned, with nobody to clean them up. I opened the issue with that analysis, and it was that which got me under the hood. Reporting a bug properly, with a root cause and steps to reproduce, is already half a contribution.

## The three things I sent

The first was a scroll fix. The terminal didn't scroll with the mouse wheel when you were inside a full-screen TUI, like Claude itself. To see what had scrolled up, you had to drag a text selection. The detail is that, in an alternate buffer, there's no host scrollback to scroll, so intercepting the wheel just swallowed the event. The fix was to let the event through to xterm in that case, and keep Shift plus wheel forcing the host scrollback, which is the iTerm and Windows Terminal convention. I pulled it into a pure function just so it could be tested.

```ts
export function shouldScrollHostScrollback(bufferType: 'normal' | 'alternate', shiftKey: boolean): boolean {
  if (shiftKey) return true
  return bufferType !== 'alternate'
}
```

The second was fixing the terminal's lifecycle in the sidebar. Before, "close" did too many things at once. I split it into three clear actions. Pause kills the PTY and frees the RAM, but keeps the `sessionId`, so you can resume where you left off. Kill kills the whole process tree and discards the session, but keeps the shortcut in the sidebar. Delete is permanent removal, with a confirmation. The important part was understanding the app's resume model before touching it, so as not to break the session the user wants to keep alive.

The third, and the biggest, was the in-app auto-update. Before, you'd find out about a new version by going to GitHub by hand. I got the Tauri 2 updater plugin running end to end. A silent check on boot, a discreet chip at the bottom of the sidebar when there's a new version, no popup in your face, and a modal with the release notes, a progress bar, download, install, and restart. Two decisions there I'm proud of. One was keeping the native update object out of the Zustand store, because it has native methods and isn't serializable. The other was treating every failure, the dev build with no signing key, being offline, the endpoint down, as if there were no update, so the feature never nags in a context where it doesn't run. And I left in the PR the instructions for what Kauã needed to do to turn signing on, generate the key, and swap the pubkey, so he wouldn't have to guess.

## What I still want to send

There's an open issue of mine that's the one I most want to build. My workflow is opening Alethe in a folder that holds several repositories, and I wanted each terminal to understand the project it's in. Walk up the tree to the `.git`, read the `package.json` scripts, detect the package manager from the lockfile, find the Dockerfile and the compose, and turn all of that into a shortcut. The point is that the shortcut is a starting point, not a fixed command. It writes the command into the terminal for me to adjust the parameter before sending. It's exactly the pain of someone with seven projects who types the same `pnpm dev` and `docker compose up` all day long.
