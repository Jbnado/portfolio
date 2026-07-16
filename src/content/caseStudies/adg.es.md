---
slug: "adg"
locale: "es"
title: "ADG — Arena Draft Guide"
summary: "Tracker de estadísticas de League of Legends (Arena y ARAM: Mayhem) y Valorant para un grupo de amigos, con rankings y logros. Contribuí con la infraestructura de producción self-hosted y con la app companion que captura datos que la API pública de Riot no expone."
---

## El Problema

Riot no expone los datos de ARAM: Mayhem (cola 2400) en su API pública — así que rankear las partidas de ese modo era imposible, y era justo lo que el grupo más jugaba. En paralelo, el proyecto necesitaba salir de servicios gestionados caros hacia una infraestructura de producción confiable, observable y barata.

## La Solución

Lo ataqué por dos frentes. (1) Un companion desktop en Tauri + Rust que lee el cliente local de Riot (APIs LCU y LiveClient) para capturar las partidas de Mayhem que la API pública esconde, con patrón outbox offline para entrega confiable y credenciales guardadas en el Windows Credential Manager. (2) Una infraestructura self-hosted en Oracle Cloud Free Tier (VM ARM siempre-gratuita) orquestada con Docker Swarm: API Express en 2 réplicas con rolling update sin downtime, Postgres 16, Traefik gestionando el ingress con TLS automático (Let's Encrypt), deploy GitOps vía Portainer (el compose se lee directo del Git y el redeploy se dispara por webhook) y observabilidad completa con Grafana + Loki + Prometheus. Backups cada 6h a dos destinos remotos, como seguro contra la pérdida de la cuenta.

## El Resultado

Deploy continuo con cero downtime: un push a main construye la imagen arm64 en GHCR y dispara el redeploy automático. Dashboards de API, Postgres e infra en Grafana, con alertas sobre la salud del servicio. Costo de servidor: cero, en el Free Tier de Oracle. Y lo principal: los datos de ARAM: Mayhem — invisibles por la API pública — pasaron a capturarse y rankearse.
