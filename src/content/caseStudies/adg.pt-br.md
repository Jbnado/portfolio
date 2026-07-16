---
slug: "adg"
locale: "pt-br"
title: "ADG — Arena Draft Guide"
summary: "Tracker de estatísticas de League of Legends (Arena e ARAM: Mayhem) e Valorant para uma turma de amigos, com rankings e conquistas. Contribuí com a infraestrutura de produção self-hosted e com o app companion que captura dados que a API pública da Riot não expõe."
---

## O Problema

A Riot não expõe os dados de ARAM: Mayhem (fila 2400) na API pública — logo, era impossível ranquear as partidas desse modo, justo o que a turma mais jogava. Em paralelo, o projeto precisava sair de serviços gerenciados caros e ganhar uma infra de produção confiável, observável e barata.

## A Solução

Ataquei por duas frentes. (1) Um companion desktop em Tauri + Rust que lê o cliente local da Riot (APIs LCU e LiveClient) para capturar as partidas de Mayhem que a API pública esconde, com padrão outbox offline para entrega confiável e credenciais guardadas no Windows Credential Manager. (2) Uma infra self-hosted no Oracle Cloud Free Tier (VM ARM sempre-gratuita) orquestrada com Docker Swarm: API Express em 2 réplicas com rolling update sem downtime, Postgres 16, Traefik cuidando do ingress com TLS automático (Let's Encrypt), deploy GitOps via Portainer (o compose é lido direto do Git e o redeploy dispara por webhook) e observabilidade completa com Grafana + Loki + Prometheus. Backups a cada 6h para dois destinos remotos, como seguro contra perda da conta.

## O Resultado

Deploy contínuo com zero downtime: push na main constrói a imagem arm64 no GHCR e dispara o redeploy automático. Dashboards de API, Postgres e infra no Grafana, com alertas sobre a saúde do serviço. Custo de servidor: zero, no Free Tier da Oracle. E o principal: os dados de ARAM: Mayhem — invisíveis pela API pública — passaram a ser capturados e ranqueados.
