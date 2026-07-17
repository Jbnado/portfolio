---
slug: "adg"
locale: "es"
title: "ADG — Arena Draft Guide"
summary: "Tracker de estadísticas de League of Legends (Arena y ARAM: Mayhem) y Valorant para un grupo de amigos. Contribuí con la infraestructura de producción self-hosted y con la app companion que captura datos que la API pública de Riot no expone."
highlights:
  - { value: "$0", label: "costo mensual · Oracle Free Tier" }
  - { value: "2×", label: "réplicas · deploy sin downtime" }
  - { value: "0", label: "partidas perdidas · outbox offline" }
meta:
  - { label: "ROL", value: "Infra + Companion (solo)" }
  - { label: "TIPO", value: "Contribución" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Tauri · Rust · Swarm" }
record:
  label: "Stats finales · top 1 vs yo"
  cards:
    - champ: "Cho'gath"
      who: "hokko tarumae · #1 del top bugs"
      kda: "29/4/12"
      stats:
        - { k: "Vida", v: "16.496.110" }
        - { k: "Poder de Habilidad", v: "693.745" }
        - { k: "Daño", v: "1.350.568" }
        - { k: "Mitigado", v: "33.628.504" }
    - champ: "Sion"
      who: "yo (Jbnado) · #4"
      kda: "29/7/8"
      stats:
        - { k: "Vida", v: "4.379.066" }
        - { k: "Daño", v: "693.589" }
        - { k: "Mitigado", v: "4.756.934" }
---

¿Juegas Arena, el modo de LoL? Si lo juegas, conoces la meta boba y adictiva que viene con él: ganar con la mayor cantidad de campeones posible. Mis amigos vivían en esa cacería. El problema es que LoL tiene una interfaz pésima para seguirle el rastro. Con quién ya ganaste, quién falta, quién quedó segundo o tercero. Nada de eso es fácil de ver en el cliente. Así que decidimos resolverlo.

Al principio fue rápido. Pegándole a la API pública de Riot, armamos una pantalla para ver con qué campeones ya había ganado cada uno, quién faltaba, quién había quedado segundo y tercero. Simple y satisfactorio. Pero después vino la percepción que corre el proyecto de lugar: la API era riquísima, y con ese dato se podía hacer mucho más que una lista. Así que ADG fue creciendo. Nació el top bugs, que rankea las partidas más absurdas por daño, daño mitigado y curación. Nacieron ranking de jugadores, builds, tier lists. Cada dato nuevo se volvía una pantalla nueva.

Pero la parte que quiero contar acá es otra. Hay un modo que me parece demasiado divertido, el ARAM: Mayhem, y Riot simplemente no lo entrega en la API pública. La cola 2400 responde 403, y no es un olvido. Riot sacó el Mayhem de la API a propósito, para mantener el modo experimental e impedir que los sitios agregadores publiquen estadísticas y "resuelvan" la meta. La ironía es buena, porque el agregador que ellos no querían es justamente el que yo iba a querer armar. Para Arena el dato venía gratis. Para Mayhem, no venía de ninguna manera. Como todo dev que se precie, iba a necesitar un hack para llegar a ese dato. Y me quedó una pregunta rondando el proyecto entero: si el hack funciona, es lindo y está bien hecho, ¿sigue siendo un hack?

ADG hoy es un tracker de Arena, ARAM y Valorant, y tiene potencial de sobra para crecer más. Fue creado por dos amigos míos. Yo amé la idea, entré a ayudar en lo que pudiera, y terminé enfocándome en dos cosas: el Mayhem, el modo que más quería ver en el aire, y la infra, para que ellos nunca tuvieran costo. Es sobre esas dos que escribo acá.

## Leyendo el cliente de LoL

El dato del Mayhem no está en la API pública, pero existe. Está en tu propio cliente de LoL, que lo necesita para dibujar la pantalla de post-juego. Toda la idea del companion es ir a buscarlo justo ahí. Es una app de escritorio en Tauri + Rust que lee el League client local y manda las partidas de Mayhem a ADG.

El cliente de League expone una API HTTP local, la LCU (League Client Update, la API interna del propio client). Levanta en un puerto aleatorio cada vez que abres el juego, y protege todo con un token que rota junto. La forma común de descubrir esas credenciales es leer un `lockfile` que el client deja en el disco. Yo fui por otro camino, uno que rompe menos. Recorro los procesos con `sysinfo` buscando el `LeagueClientUx.exe` y leo el puerto y el token directo de su línea de comandos, que es donde Riot también los pone.

```rust
if let Some(v) = arg.strip_prefix("--app-port=") { port = v.parse().ok(); }
else if let Some(v) = arg.strip_prefix("--remoting-auth-token=") { token = Some(v.to_string()); }
```

Con el puerto y el token, levanto un cliente HTTPS a `127.0.0.1`, autentico con Basic `riot:{token}` y acepto el certificado self-signed que el propio client usa. De ahí en adelante es conversar. Pregunto quién es el invocador en `/lol-summoner/v1/current-summoner`, el `gameId` de la partida en curso en `/lol-gameflow/v1/session`, y el juego completo en `/lol-match-history/v1/games/{gameId}`, que devuelve los cerca de 118 campos de stats de cada uno de los diez jugadores. Ese último es el dato rico, el que alimenta el ranking.

Pero la LCU sola no ve todo lo que necesito. Me da el marcador final, pero no lo que pasó durante la partida. Para eso hay una segunda API local, la LiveClient Data API, en `127.0.0.1:2999`. Solo responde mientras estás en juego, ni pide autenticación, y es la que me dice, en vivo, si el modo es Mayhem. Riot llama al Mayhem `KIWI` internamente (el Arena es `CHERRY`), así que basta mirar el `gameMode` en `/liveclientdata/gamestats`. Las dos se completan. LiveClient tiene el estado en vivo pero no el `gameId`, que recién aparece cuando la partida indexa. La LCU tiene el `gameId` correcto pero solo después del juego. Necesito las dos al mismo tiempo, y eso es lo que resuelve la captura en vivo.

## Capturando mientras la partida sucede

En el `setup` de Tauri levanto tres tareas `tokio` que corren toda la vida de la app.

La primera es la captura en vivo, con un poll cada 3 segundos. Mientras hay una partida de Mayhem en curso, lee el `championStats` del jugador en LiveClient y va guardando dos recortes. Uno es el build final, el último valor que apareció antes de que la partida terminara. El otro es el pico de nueve atributos a lo largo del juego: daño de ataque, poder de habilidad, armadura, resistencia mágica, vida máxima, velocidad de ataque, velocidad de movimiento, robo de vida y omnivamp. Ese pico es lo que se vuelve los récords de "mayor X" en el sitio. También es acá donde capturo el `gameId` de la partida, sacado del gameflow todavía dentro del juego, para no depender de que la partida indexe después.

La segunda tarea es el sync en segundo plano, cada 20 segundos. Si estás logueado, hace el backfill una vez por sesión del client (la ventana de historial por defecto, las últimas partidas) y después vacía el outbox. La tercera es un drenaje en el arranque, que tira para afuera lo que quedó pendiente de una ejecución anterior de la app.

Vale separar dos cosas que suelen confundirse. La captura no necesita login. Si jugaste Mayhem con la app abierta, el snapshot en vivo se guarda incluso deslogueado. El login solo se exige en el upload, a la hora de mandar al servidor. Eso importa porque desacopla "no perder el dato" de "estar autenticado ahora", y lleva directo a la parte que más disfruté.

## El outbox, o cómo no perder una partida

La regla que quería garantizar era fácil de enunciar y molesta de cumplir. Nada de lo capturado puede perderse si el servidor cae, la internet oscila o la app se cierra a mitad del envío. La forma de cumplirla es no confiar en la red en ningún momento. Todo lo que capturo va primero a un archivo JSON en disco, antes de cualquier intento de envío, y solo sale de ahí después de un `2xx` confirmado.

El archivo guarda tres tipos de ítem. Un `PendingMatch`, que es solo un `gameId` esperando ser resuelto en el detalle rico vía `/games/{id}`. Un `Snapshot`, que es el build final más el pico de atributos de esa captura en vivo. Y el `MatchPayload`, que es el `PendingMatch` ya resuelto, listo para subir. Un loop de drenaje recorre la cola y trata de entregar cada ítem.

Lo que le da liga es la política de retry, tipada por la naturaleza del error en vez de un "reintentá" ciego.

```
Transitorio (5xx, red, LCU caído)    reintenta para siempre
Permanente (4xx)                     se descarta tras 5 fallas
UpdateRequired (426)                 nunca se descarta, retiene hasta actualizar
```

Cada una de esas líneas resuelve un problema real. El transitorio es el caso común, un servidor reiniciando o el wi-fi cayéndose, y la respuesta correcta es insistir. El permanente es cuando el servidor rechaza ese dato de una, e insistir para siempre solo tapa la cola, así que tras cinco intentos el ítem se descarta. El `426` es el más interesante. Cada request lleva un header `x-companion-version`, y el servidor puede rechazar un cliente viejo. Cuando eso pasa, el outbox entero se congela hasta que el usuario actualice. A propósito. Prefiero retener el dato antes que empujarlo en un formato que el backend ya no habla y corromper el ranking de todos.

Fuera de la política de retry, el outbox tiene algunos cuidados que solo aparecen cuando ya te quemaste con una cola persistente antes. Deduplica por `gameId`, así el mismo juego no entra dos veces. Si el archivo en disco se corrompe, carga como cola vacía en vez de tumbar la app. Y el loop de drenaje nunca sostiene el mutex atravesando un `await`. Toma una foto de la cola, suelta el lock, hace la llamada de red, y recién ahí agarra el lock de nuevo para remover lo que entregó. Es el tipo de detalle que no cambia nada cuando sale bien y evita un deadlock cuando sale mal. Al final son cinco tests cubriendo los casos molestos: persistir y recargar, reemplazar preservando el id, descartar permanente en el límite, transitorio que nunca descarta, y el dedup. Es poco código para una garantía grande.

Hay un efecto secundario lindo en todo esto. Como `/games/{gameId}` devuelve los diez jugadores de una, el upload de cualquiera de la partida ya rellena el dato rico de los otros nueve. Basta con que un amigo del lobby tenga la app abierta para que toda esa partida aparezca en el ranking con stats completos.

Aquella pregunta del principio ya tenía respuesta acá. Leer el cliente del juego por debajo es un hack, sin dudas. Pero un hack con outbox en disco, retry tipado y test automatizado deja de parecer chapuza y se vuelve solo la forma correcta de resolver un problema torcido.

## Levantándolo en una VPS gratis

Toda esta parte del servidor corre en una VPS que cuesta cero por mes. Es una VM ARM de la capa siempre-gratuita de Oracle Cloud, con 2 OCPU (el OCPU de Oracle equivale a un core físico con hyperthreading, así que en la práctica son unos dos cores) y 12 GB de RAM. Hay un truco acá que vale contar. La capacidad ARM del free tier vive agotada para las cuentas trial, y Oracle a veces recupera VMs ociosas de cuenta gratuita. La salida fue subir la cuenta a Pay-As-You-Go manteniendo el uso dentro de lo que es siempre-gratuito. El costo sigue en cero, pero la cuenta deja de ser trial, lo que destraba la capacidad ARM y saca el riesgo de perder la máquina por ociosidad. Junto a eso, una IP pública reservada, también gratis, para que la VM sobreviva a una recreación sin que yo tenga que actualizar DNS.

La orquesté con Docker Swarm de un solo nodo. Es una elección que suele levantar una ceja, así que vale el porqué. Quería las primitivas de verdad de un orquestador: rolling update, réplicas, secrets, healthcheck. Kubernetes entrega todo eso y mucho más, pero el "mucho más" cobra caro en CPU y en operación en una máquina de dos cores. Swarm da exactamente esas primitivas con un YAML que es casi el compose que ya sé escribir, y sin un control plane pesado comiéndose la máquina. Para un solo nodo, es el punto justo de la curva.

## La dependencia circular del edge

La infra está dividida en dos stacks, y el motivo es una dependencia circular que aparece cuando quieres hacer deploy por la interfaz. Portainer es quien hace el deploy de todo vía GitOps. Solo que Portainer, para que yo abra su panel, necesita estar arriba y ruteado. Y quien rutea es Traefik. Entonces Traefik y Portainer tienen que existir antes que cualquier cosa que vayan a servir, incluso antes que ellos mismos. Como no pueden depender del resto, viven en una stack `edge` que levanto una vez, a mano. Todo el resto vive en la stack `adg`, con la API en dos réplicas, Postgres, Redis, backup y la observabilidad, y ahí sí es Portainer el que la sube vía GitOps.

Traefik se encarga del ingress y emite y renueva el TLS solo vía ACME (el protocolo de Let's Encrypt). Por eso lo preferí a nginx, que me iba a obligar a mantener certbot con un cron de renovación. Los puertos 80 y 443 se publican en `mode: host` a propósito. En ese modo Traefik ve la IP real del cliente, en vez de la IP interna de la red del Swarm, y la API necesita esa IP real para que el rate limiting funcione. También hubo un bug que documenté en el camino: Traefik v3.1 fijaba la versión 1.24 de la API de Docker en el provider de Swarm, que Docker 25+ rechaza, y el resultado era Traefik levantando sin ninguna ruta. La corrección fue la v3.7, que negocia la versión de la API.

Un detalle que me gusta es la compresión en el edge. Las respuestas agregadas del ranking son JSON grande, del orden de 68 KB, y comprimir corta un 80% de eso, lo que hace una diferencia real para quien abre en 4G. Pero la compresión excluye explícitamente el `text/event-stream`. Comprimir un stream bufferiza la respuesta, y bufferizar mata los eventos en tiempo real. Así que la ganancia de banda vale para el JSON y se sale del camino de lo que tiene que llegar a tiempo.

## El deploy que garantiza el pull

El deploy es todo automático. Un merge a `main` dispara GitHub Actions, que buildea la imagen arm64 con QEMU y buildx, la publica en GHCR y golpea un webhook de Portainer para que haga `git pull` del compose y vuelva a subir. Un filtro decide si rebuildea la imagen de la API, la del backup, o ninguna, mirando lo que cambió en `server/**` e `infra/**`.

El detalle que vale contar es un comportamiento de Swarm que agarra a mucha gente. Solo cambia la imagen en ejecución cuando el spec del servicio cambia. Con `image: ...:latest` fijo, el spec no cambia entre deploys, así que Swarm ni intenta un nuevo pull. La imagen vieja sigue corriendo, creyendo que todo está bien, mientras la nueva está en el registry sin que nadie la busque. La salida fue que el propio CI fije el digest `@sha256` de la imagen recién buildeada dentro del compose y lo commitee de vuelta con `[skip ci]`.

```yaml
sed -i -E "s#(image:...)${IMAGE_API}[^ ]*#\1${IMAGE_API}@${API_DIGEST}#" infra/docker-compose.yml
git commit -m "chore(deploy): fixa digest [skip ci]"
```

Como el digest cambia en cada deploy, el spec cambia junto, y el pull pasa a estar garantizado. El rolling en sí es sin downtime porque la API corre en dos réplicas con `order: start-first`, que sube la réplica nueva antes de matar la vieja, y `failure_action: rollback`, que revierte solo si la imagen nueva sube rota. Los secrets nunca pasan por el CI. JWT, contraseña de la base y claves de Riot viven en las variables de la stack, que edito por la interfaz de Portainer sin abrir SSH. Rotar una clave de Riot es un clic, no un deploy.

El build arm64 también tuvo su aprendizaje. Al principio `bcrypt` compilaba C++ bajo emulación QEMU y cada build tardaba unos diez minutos. Lo cambié por `@node-rs/bcrypt`, que tiene binario arm64 precompilado, y sumé cache de build en Actions. Los diez minutos se volvieron segundos.

## Ver qué está pasando

Para no enterarme de que se cayó por un amigo quejándose en el grupo, metí observabilidad de verdad. Hay Grafana con Loki y Promtail para los logs, y Prometheus con node-exporter, cAdvisor, postgres-exporter y un blackbox-exporter que le pega al `/health` de la API desde afuera cada 15 segundos. Esa sonda externa es la que enciende el "arriba / caído" en la home de Grafana, porque prueba el servicio como lo prueba un usuario, y no desde adentro. Son cuatro dashboards, uno de home, uno de la API, uno de Postgres y uno de la infra.

Acá aparece un gotcha de Swarm que hace juego con el del deploy. Las configs de Swarm son inmutables. Si cambio el `prometheus.yml` y hago redeploy, rompe con un "config already exists", porque Swarm no deja sobrescribir una config existente. La vuelta es versionarla en el nombre, renombrar `prometheus_config` a `prometheus_config_v2` en los dos lugares, y Swarm crea una nueva. Grafana escapa a esto porque sus dashboards se montan por bind mount en vez de una config de Swarm. Editar un panel es cambiar un `.json` en el repo y hacer `git pull` en la VM, y Grafana recarga sin redeploy.

## Postgres y Redis, cada uno en su lugar

Postgres es el único servicio que trato con regla dura. Queda fijado al nodo manager, con una sola réplica y volumen local. La regla es escalar la API a gusto y nunca la base. Dos réplicas de Postgres apuntando al mismo lugar es un problema, no redundancia. Se publica en la 5432 en `mode: host`, pero solo es alcanzable si la Security List de la VCN abre el puerto a IPs `/32` específicas del grupo, nunca a `0.0.0.0/0`.

El tuning de Postgres también dejó un aprendizaje. Tenía un `idle_session_timeout` configurado, y estaba matando las conexiones ociosas del pool de Prisma y llenando el log de reconexiones. Lo cambié por TCP keepalives, que solo tiran al cliente que realmente murió, en vez de matar una conexión sana solo por estar quieta un instante.

Redis entró tarde, y por un motivo específico. Con la API en dos réplicas, un WebSocket conectado a una réplica no veía a los usuarios conectados en la otra, así que la presencia en tiempo real se rompía según dónde cayeras. Redis guarda esa presencia compartida entre las réplicas, vía pub/sub. Es efímero a propósito, sin volumen y con un tope de memoria, porque es estado de sesión, no dato que necesite persistir.

## Backups en los que confío

El backup es un `pg_dump` cada 6 horas, con 14 días de retención, mandado a dos nubes distintas. Una es el Object Storage de la propia Oracle. La otra vive fuera de Oracle, en un R2, y existe justamente por si algún día reclaman la cuenta. Una falla al mandar a un destino no frena al otro. Y pruebo el restore de vez en cuando, porque un backup que nunca restauraste no es un backup, es esperanza.

## El rey del top bugs

Al final, ADG es un rincón para guardar los propios números con los amigos, sea en Arena o en Mayhem. Y registra cada barbaridad que ya hicimos. El rey de nuestro top bugs hoy es un Cho'gath que terminó una partida de Arena con 16,5 millones de vida y casi 700 mil de poder de habilidad. Yo estoy cuarto, con un Sion de 4,4 millones de vida, y no bugueé más porque tenía que salir e ir al médico.

Si juegas Arena o ARAM, entra a [adg.gg](https://adg.gg), sincroniza tus partidas y súmate a nuestro Discord. Aparece en el ranking y ven a romper ese número. Te reto.
