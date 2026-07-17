---
slug: "alethe"
locale: "es"
title: "Alethe"
summary: "Alethe es un workspace de escritorio para ejecutar y retomar varios agentes de código y terminales en paralelo, creado por Kauã (Kc1t). Lo uso todos los días y contribuí de vuelta con tres PRs merged, del fix de scroll en TUIs al auto-update in-app con el updater de Tauri."
highlights:
  - { value: "3", label: "PRs merged (scroll, kill/pause, auto-update)" }
  - { value: "2–3", label: "proyectos que corro en él a la vez" }
  - { value: "Tauri", label: "Rust + React, app local-first" }
meta:
  - { label: "ROL", value: "Contribuidor" }
  - { label: "TIPO", value: "Contribución" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · React" }
---

Trabajo en dos o tres proyectos casi al mismo tiempo, y tengo seis o siete más en fila, creciendo. Eso se vuelve un montón de terminales abiertas, un agente de código corriendo acá, docker allá, un node y un python por acá. Alethe es donde junto todo eso. Es un workspace de escritorio para ejecutar y retomar varios agentes y terminales reales en paralelo, con los proyectos en la sidebar y un atajo para reabrir cada terminal rápido. Eso es lo que me mantiene en él. Una interfaz agradable, atajos fáciles, y el foco en los agentes.

Alethe no es mío. Es un proyecto open-source de Kauã, Kc1t, que además es mi compañero de trabajo, mi socio, y alguien que considero un amigo. Entro como usuario pesado que decidió devolver algo. Tres PRs míos entraron al proyecto, y es sobre ellos que escribo acá. No construí el motor de PTY, ni la integración con Spotify, ni los paneles divididos, eso es de Kauã. Pero las tres cosas que mandé las hice enteras, y cada una me enseñó una parte de cómo funciona por debajo.

## El bug que me metió adentro

Usando Alethe al límite, con Claude corriendo, vi la memoria de la app subir sin parar. Fui a investigar y el subtree de procesos estaba en unos 3,5 GB repartidos en 65 procesos. La causa era sutil. Al matar un PTY, la señal iba solo al hijo directo, el shell, y no al process group entero. Claude y los scripts de node abren varios subprocesos, y cuando el shell moría, los nietos quedaban huérfanos, sin nadie que los limpiara. Abrí la issue con ese análisis, y fue eso lo que me hizo abrir el capó del proyecto. Reportar un bug bien, con causa raíz y pasos para reproducir, ya es media contribución.

## Las tres cosas que mandé

La primera fue un fix de scroll. La terminal no hacía scroll con la rueda del mouse cuando estabas dentro de un TUI de pantalla completa, como el propio Claude. Para ver lo que había subido, tenías que arrastrar una selección de texto. El detalle es que, en un buffer alternativo, no existe scrollback del host para scrollear, así que interceptar la rueda solo se tragaba el evento. La salida fue dejar el evento pasar a xterm en ese caso, y mantener el Shift más rueda forzando el scrollback del host, que es la convención de iTerm y Windows Terminal. Lo extraje en una función pura solo para poder testearla.

```ts
export function shouldScrollHostScrollback(bufferType: 'normal' | 'alternate', shiftKey: boolean): boolean {
  if (shiftKey) return true
  return bufferType !== 'alternate'
}
```

La segunda fue arreglar el ciclo de vida de la terminal en la sidebar. Antes, "cerrar" hacía demasiadas cosas a la vez. Lo separé en tres acciones claras. Pausar mata el PTY y libera la RAM, pero guarda el `sessionId`, así que se puede retomar donde quedó. Kill mata el árbol de procesos entero y descarta la sesión, pero mantiene el atajo en la sidebar. Borrar es la eliminación definitiva, con confirmación. La parte importante fue entender el modelo de retomada de la app antes de tocar, para no romper la sesión que el usuario quiere mantener viva.

La tercera, y la más grande, fue el auto-update in-app. Antes, te enterabas de una versión nueva yendo a GitHub a mano. Puse el plugin de updater de Tauri 2 corriendo de punta a punta. Un chequeo silencioso en el boot, un chip discreto al pie de la sidebar cuando hay versión nueva, sin popup en tu cara, y un modal con las notas de la release, una barra de progreso, descarga, instalación y reinicio. Dos decisiones de ahí me enorgullecen. Una fue mantener el objeto nativo del update fuera del store de Zustand, porque tiene métodos nativos y no es serializable. La otra fue tratar toda falla, el build de dev sin clave de firma, el estar offline, el endpoint caído, como si no hubiera update, para que la feature nunca moleste en un contexto donde no corre. Y dejé en el PR las instrucciones de lo que Kauã necesitaba hacer para activar la firma, generar la clave y cambiar la pubkey, para que no tuviera que adivinar.

## Lo que todavía quiero mandar

Hay una issue mía abierta que es la que más quiero construir. Mi flujo es abrir Alethe en una carpeta que contiene varios repositorios, y quería que cada terminal entendiera el proyecto en el que está. Subir el árbol hasta encontrar el `.git`, leer los scripts del `package.json`, detectar el package manager por el lockfile, encontrar el Dockerfile y el compose, y transformar todo eso en un atajo. El punto es que el atajo es punto de partida, no comando fijo. Escribe el comando en la terminal para que yo ajuste el parámetro antes de mandar. Es exactamente el dolor de quien tiene siete proyectos y escribe el mismo `pnpm dev` y `docker compose up` todo el día.
