---
slug: "upwatch"
locale: "es"
title: "UpWatch"
summary: "Monitoreo de disponibilidad en Go que cabe en un binario y muestra latencia junto al estado. Proyecto mío, open source bajo AGPL, con la interfaz embebida en el ejecutable y una suite de conformidad que corre idéntica en SQLite y PostgreSQL."
highlights:
  - { value: "1 binario", label: "interfaz embebida por go:embed" }
  - { value: "12k/27k", label: "líneas de test sobre líneas de Go" }
  - { value: "2 bases", label: "la misma batería de conformidad en las dos" }
meta:
  - { label: "ROL", value: "Desarrollador (solo)" }
  - { label: "TIPO", value: "Proyecto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Go · SQLite · Postgres · React" }
---

Casi todo incidente que vi de cerca empezó con el servicio poniéndose lento, no cayéndose. La latencia sube, alguien se queja de que está trabado, y solo mucho después algo efectivamente deja de responder. Un monitor que solo sabe decir arriba o abajo llega al final de esa historia, cuando ya no queda mucho por hacer.

UpWatch muestra las dos cosas en el mismo lugar. Verifica por HTTP, TCP, ICMP, DNS, TLS y por señal del propio servicio, esa última para tareas programadas y procesos sin puerto expuesto. El intervalo arranca en cinco segundos y sube, por monitor.

Instalarlo es un comando.

```bash
docker run -d --name upwatch -p 8080:8080 -v upwatch:/data \
  ghcr.io/jbnado/upwatch:latest
```

Lo abrís en el 8080, creás la cuenta de administración, y el registro se cierra detrás de ella. Es la única cuenta que nace sin autenticación.

## Un binario

La interfaz vive dentro del ejecutable, por `go:embed`. No hay nginx al lado, no hay carpeta de archivos estáticos, y no existe la situación clásica de la interfaz estando en una versión y el servidor que la entrega en otra. El precio es que compilar la interfaz se volvió prerrequisito de compilar el binario, y `make build` se encarga del orden.

El almacenamiento es enchufable entre SQLite y PostgreSQL. Eso es fácil de escribir en un README y difícil de sostener, porque la diferencia entre los dos vive en los rincones, en el tipo de fecha, en el comportamiento de conflicto, en la semántica de transacción. Por eso la suite de conformidad corre la misma batería contra las dos bases, sin ningún caso salteado. Es lo que impide que base enchufable se vuelva fachada.

Guardar meses de historial sin guardar meses de dato crudo también estaba en el diseño desde el principio. Los latidos duran una semana y después se agregan por hora y por día. El percentil sale siempre del dato crudo, nunca percentil de percentil, que es el atajo que hace que el p99 del mes parezca bastante mejor de lo que fue. Una instalación con cinco objetivos verificando cada minuto ocupó 2,6 MB después de treinta días.

## El centinela que necesita probar que funciona

Cuando las verificaciones empiezan a fallar en serie, hay dos explicaciones, y piden reacciones opuestas. O los objetivos se cayeron, o la red desde donde UpWatch mira se cayó. Tratar la segunda como si fuera la primera llena la guardia de alertas falsas en la madrugada en que la red del servidor osciló.

Entonces hay una sonda independiente. Cuando las verificaciones fallan, ella confirma si la red local todavía responde. Si no responde, los resultados de ese momento pasan a ser "sin medición" en vez de "fuera de servicio".

La parte que me parece más interesante es la traba. Esa sonda solo gana el poder de silenciar después de probar que funciona. Una sonda bloqueada por firewall respondería siempre que la red está caída, y UpWatch pasaría a tragarse todas las alertas para siempre, sin avisarle a nadie. Un monitor que nunca alerta se parece bastante a un monitor que nunca tuvo que hacerlo.

La misma preocupación aparece en `/metrics`. En `upwatch_monitor_status`, 1 es arriba, 0 es abajo, 2 es degradado, y "sin medición" es `-1`, no cero. Si fuera cero, todo monitor recién creado dispararía una alerta antes incluso de su primera verificación. Y la dirección del objetivo nunca se vuelve etiqueta. Además de describir la topología interna a quien lee el Prometheus, una dirección en etiqueta es cardinalidad alta, y cardinalidad alta es como se tumba un Prometheus.

## El webhook es de quien lo recibe

El canal de webhook empezó entregando un sobre mío, con los campos en los nombres que yo elegí. Funciona bien hasta que intentás conectarlo a un destino que ya existe y que espera los campos con los nombres de él. No siempre se puede cambiar a quien recibe.

Hoy declarás la forma del cuerpo y los marcadores se sustituyen.

```json
{
  "url": "https://automatizacion.ejemplo/alertas",
  "headers": { "X-Clave": "…" },
  "body_template": {
    "event": "$status",
    "service": { "name": "$monitor", "id": "$monitor_id" },
    "outage_seconds": "$duration_seconds",
    "summary": "[$status] $monitor"
  }
}
```

Dos decisiones ahí valen más que la funcionalidad en sí.

La sustitución ocurre sobre el JSON ya decodificado, y el resultado se serializa de vuelta. Nunca por concatenación de texto. Suena a preciosismo hasta que te imaginás un monitor con comillas en el nombre, o una causa de error con salto de línea, produciendo un cuerpo malformado que el destino rechaza. Perderías el aviso de la caída por culpa de la propia caída.

Y un marcador desconocido se rechaza al guardar el canal, no en el momento de la entrega. Descubrir el error de tipeo durante el incidente es descubrirlo demasiado tarde.

## La página pública que no entrega lo que no debe

La página pública de estado sigue el formato que Anthropic, Cloudflare y Google consolidaron. Veredicto arriba, componentes agrupados, noventa barras de historial, incidentes anteriores con línea de tiempo.

Lo que hace a propósito es no publicar la causa. La causa que la sonda detecta es literal e interna, del tipo `dial tcp 10.0.3.7:5432: connect: connection refused`, y entregaría dirección, puerto y tecnología de un servicio que nadie de afuera debería ver. Las barras son automáticas, el relato se escribe a mano. Una instalación recién levantada muestra las barras y "ningún incidente reportado".

Cada componente además tiene su propia etiqueta pública. El monitor puede llamarse `api-prod-us-east-1` en la operación y aparecer como "API" para quien lee, sin obligarte a renombrar nada ni a entregar tu convención de nombres.

## Cómo se construyó esto en tres días

Treinta y siete commits entre el 29 y el 31 de julio. Vale decir cómo, porque la velocidad no es la parte interesante.

El `git log` es el plan, ejecutado. Fundación, almacenamiento, planificador, verificadores, agregación, autenticación, API, interfaz, motor de incidentes, canales de aviso, página pública, PostgreSQL, métricas, release. Rebanadas verticales, cada una con la intención declarada en el asunto del commit. *"feat(metrics): exposición Prometheus, y la composición que la escondía"*. *"feat(status): pantalla pública, y lo que sobrevivió al intento de intrusión"*.

Escribí el diseño antes y conduje la ejecución con agentes corriendo en paralelo en Alethe, en ciclos cortos, cada uno con su documento de planificación. La IA escribe mucho más rápido de lo que yo tipeo, y no tiene sentido fingir lo contrario. Lo que yo pongo sobre la mesa es lo que ella no decide sola, que son las restricciones.

Todas las decisiones que conté acá arriba son eso. La traba del centinela existe porque me pregunté qué pasaría si la propia sonda quedara bloqueada. El `-1` del Prometheus existe porque pensé en el monitor recién creado. La sustitución sobre JSON decodificado existe porque me imaginé el nombre con comillas. Ninguna de esas salió de un requisito escrito en ningún lado.

Y lo que sostiene el resultado son los tests. El proyecto está escrito en TDD, y la suite es el principal artefacto de diseño que tiene. Doce de las veintisiete mil líneas de Go son test, en 651 funciones. La conformidad del almacenamiento corre la misma batería en las dos bases. Un test de deriva confronta la especificación OpenAPI contra las rutas de verdad, en los dos sentidos, así que la documentación no tiene manera de envejecer sola.

Y existe una batería hecha solo para atacar la única superficie que no pide credencial, la página pública. Travesía de ruta en nueve formas, inyección de SQL en el slug, enumeración de páginas, texto hostil, cabecera `Host` forjada. Uno de ellos encontró un defecto real durante el desarrollo.

## Dónde está hoy

Público en GitHub bajo AGPL-3.0, con imagen en GHCR, binario estático en los releases y un compose con PostgreSQL para cuando la disponibilidad del propio monitor importa. Tiene página de proyecto en el aire, CI con detector de carrera, y Dependabot ya abrió, y yo ya mergeé, los primeros bumps de dependencia.

La API es de primera clase y no un accesorio de la interfaz, así que la pantalla consume exactamente los mismos endpoints que consumiría cualquier script tuyo. Quien ya tiene Prometheus conecta `/metrics` y deja que la alerta viva donde ya vive el resto.
