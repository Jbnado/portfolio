---
slug: "gather-bots"
locale: "es"
title: "gather-bots"
summary: "Alimenta los Smart Objects de Gather con el trabajo de verdad. Un PR esperando review, un pipeline rojo, una tarea en curso y una reunión a punto de empezar, en el escritorio de la oficina virtual. Proyecto mío, open source bajo MIT, ports and adapters de punta a punta."
highlights:
  - { value: "0 req", label: "lo que cuesta un minuto sin novedad" }
  - { value: "130", label: "casos de prueba, dominio puro sin red" }
  - { value: "~1 MB", label: "lo que la imagen agrega sobre node:24-alpine" }
meta:
  - { label: "ROL", value: "Desarrollador (solo)" }
  - { label: "TIPO", value: "Proyecto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "TypeScript · Node 24 · Docker" }
---

En Gather, la oficina virtual, cada persona tiene un escritorio. Se puede decorar con objetos, y algunos de ellos son Smart Objects, que aceptan comandos por webhook. En la práctica, casi todo el mundo los usa de adorno.

Saber qué está esperando por mí, en un día normal, exige abrir cuatro herramientas. Un PR pidiendo review en una, un pipeline rojo en otra, una tarea en curso en una tercera, una reunión empezando en diez minutos en la cuarta. Ninguna habla con las otras, y el escritorio queda ahí sin hacer nada.

gather-bots conecta una cosa con la otra. Tres objetos, y cada uno responde una pregunta.

```
INBOX          [8]  qué espera por mí
                    PR #101 · corrige cálculo de envío
                    Bug · Doing · redondeo en las facturas

BOT STATUS   alert   qué corre sin mí
                    svc-orders · main   ← pipeline rojo

LIGHTBULB      off   ¿pueden interrumpirme?
                    "En reunión: Weekly"
```

Nada que no configures corre. Un objeto y una integración ya es un sistema útil, y lo que no esté configurado se queda callado, apagado.

## Ports and adapters, y por qué no es adorno

El núcleo no conoce Azure DevOps, Google, Microsoft, ni el propio Gather. Eso suele sonar a arquitectura por la arquitectura, así que vale decir qué compra en la práctica. Tres cosas se agregan sin tocar el medio.

Una fuente nueva, tipo Jira, GitHub, Linear o PagerDuty, implementa un puerto y gana una línea en un registro. Una superficie nueva es una función pura de señales a estado del objeto. Y un destino que no es Gather implementa el otro puerto, y todo el resto sigue funcionando, sea una lámpara Philips Hue, un estado en Slack o una tira de LED en la pared.

La decisión que más rindió fue separar a quien reporta de quien presenta. La fuente reporta el hecho y no carga ruteo, así que nunca decide que algo "va en el Inbox". Si lo decidiera, la decisión de producto se filtraría al adaptador, y cambiar el significado de un objeto exigiría tocar todas las fuentes. Como Google y Outlook emiten exactamente el mismo tipo de señal, el segundo proveedor de agenda no costó nada en las superficies, y los dos pueden correr juntos.

## El diff que mantiene el costo en cero

El rate limit de Gather es por space, no por objeto. Eso lo cambia todo, porque cada comando es un POST y el SDK no agrupa. Tres objetos con veinte ítems cada uno, cada minuto, abusarían del límite del space entero, y el space se comparte con el resto de la empresa.

El despachante calcula el estado deseado, lo compara con el último que envió y emite solo la diferencia. En régimen estable, un minuto sin novedad cuesta cero peticiones. El primer arranque es la excepción, y manda todo espaciado en vez de en ráfaga.

## Las cosas que muerden

Acá vive el trabajo de verdad, y el README tiene una sección con ese nombre.

`activity.clear` está prohibido en el código. Un objeto carga entradas de varias fuentes al mismo tiempo, y limpiar borraría las de las otras. No confié en la disciplina para eso, así que el tipo `Command` omite el evento y el compilador se niega antes de que yo llegue a escribir la llamada.

Una integración caída no borra tu feed. El último resultado bueno vale hasta quince minutos, y después de eso los ítems desaparecen, porque una reunión que terminó hace una hora es peor que ninguna reunión. Pero si todas las fuentes fallan a la vez, no se escribe nada, porque eso es una caída de red y no tu día entero vaciándose al mismo tiempo.

El feed muestra como máximo quince ítems, y por encima de eso entra una línea de "+N más". El contador sigue mostrando el total real. Un badge de veintitrés sobre un feed de quince es interfaz que miente, e interfaz que miente sobre cuánto trabajo hay esperando es peor que ninguna interfaz.

Y está el límite que no es técnico. El feed es visible para todos los Members y Guests del space, lo que fija el techo de lo que puede entrar ahí. Títulos de PR y de tarea son el límite. Cuerpo de PR y nombres de cliente no entran.

## El checkup

`pnpm checkup` funciona antes de que hayas configurado nada, y ese es justamente el objetivo. Nunca falla por falta de configuración, solo dice qué falta y qué variable lo encendería.

Cada objeto y cada integración cae en tres estados. Funcionando, no configurado, o configurado y roto. Solo el tercero merece atención, y esa distinción es la diferencia entre un diagnóstico y una pared de rojo que aprendés a ignorar.

## El design doc vino antes

Este proyecto salió en dos días, con agentes escribiendo el código, y la prueba de que no fue improvisación está commiteada. El documento de diseño fue escrito antes de que existiera una línea, con las decisiones numeradas de D1 a D7, y los commits salieron en el orden de la secuencia de build que él define.

Antes de las decisiones, el documento tiene una sección de restricciones descubiertas, leída de la documentación del SDK. Autenticación por Standard Webhooks, el par de URL y secreto siendo por objeto, la tabla de qué capabilities tiene cada preset, los límites de tamaño de cada campo, y el rate limit por space. La mitad de las decisiones de diseño cayó directo de esa tabla.

El documento también registra algo que me gusta más que las decisiones, que es dónde me obligó a parar e ir a mirar. La documentación de soporte de Gather describe la lámpara cambiando entre verde, amarillo y rojo. Fui a verificar contra el space de verdad y el comportamiento no coincide. Ni el SDK ni la referencia exponen ningún campo, evento o capability que defina color, porque la apariencia es decisión de renderizado de Gather y la API solo elige estado. La consecuencia es que la distinción entre producción y develop pasó a vivir en el objeto de estado, y no en una lámpara de colores que habría descubierto que no existía después de construir encima de ella.

Eso es lo que creo que cambia cuando se construye con agentes. La IA escribe mucho más rápido que yo, y lo que decide el resultado es cuántas de esas preguntas se respondieron antes de empezar.

Lo que lo sostiene después son los tests. Son 130 casos, y las superficies son funciones puras de señales a estado, testeadas sin nada de red. El adaptador de Gather tiene un par falso para que la suite pueda correr sin postear en un space de verdad.

## Dónde está hoy

Público en GitHub bajo MIT, con CI pasando en Linux, Windows y macOS. Corre como contenedor, como servicio systemd de usuario sin root, o como tarea programada en Windows. La imagen se construye en dos etapas y no carga TypeScript ni tsx, así que las capas que el proyecto agrega suman cerca de 1 MB sobre `node:24-alpine`, con memoria limitada a 128 MB. Un monitor que estorba a la máquina que monitorea falló en su trabajo.
