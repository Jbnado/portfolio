---
slug: "adg"
locale: "en"
title: "ADG — Arena Draft Guide"
summary: "Stats tracker for League of Legends (Arena and ARAM: Mayhem) and Valorant among a friend group, with rankings and achievements. I contributed the self-hosted production infrastructure and the companion app that captures data Riot's public API doesn't expose."
---

## The Problem

Riot doesn't expose ARAM: Mayhem data (queue 2400) in its public API — so ranking that mode's matches was impossible, and it was exactly what the group played most. In parallel, the project needed to move off expensive managed services onto reliable, observable, cheap production infrastructure.

## The Solution

I tackled it on two fronts. (1) A Tauri + Rust desktop companion that reads the local Riot client (LCU and LiveClient APIs) to capture the Mayhem matches the public API hides, with an offline outbox pattern for reliable delivery and credentials stored in Windows Credential Manager. (2) Self-hosted infrastructure on Oracle Cloud Free Tier (an always-free ARM VM) orchestrated with Docker Swarm: an Express API scaled to 2 replicas with zero-downtime rolling updates, Postgres 16, Traefik handling ingress with automatic TLS (Let's Encrypt), GitOps deploys via Portainer (compose read straight from Git, redeploy triggered by webhook), and full observability with Grafana + Loki + Prometheus. Backups every 6h to two remote destinations, as insurance against losing the account.

## The Result

Continuous, zero-downtime deploys: a push to main builds the arm64 image on GHCR and triggers an automatic redeploy. Grafana dashboards for API, Postgres, and infra, with alerts on service health. Server cost: zero, on Oracle's Free Tier. And the headline: ARAM: Mayhem data — invisible through the public API — is now captured and ranked.
