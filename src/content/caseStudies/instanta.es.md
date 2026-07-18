---
slug: "instanta"
locale: "es"
title: "Instanta"
summary: "Un feed colaborativo de fotos por evento, con un muro en vivo y un modo pantalla grande para el salón. Es un proyecto mío, solo, edge-native en Cloudflare (Workers, D1, R2, Durable Objects), con una postura de seguridad y arquitectura más seria de la que un app de fiesta pediría."
highlights:
  - { value: "edge", label: "Workers + D1 + R2 + Durable Objects" }
  - { value: "solo", label: "proyecto personal, hecho solo" }
  - { value: "workerd", label: "tests de integración en el runtime real" }
meta:
  - { label: "ROL", value: "Desarrollador (solo)" }
  - { label: "TIPO", value: "Proyecto" }
  - { label: "PERÍODO", value: "2026" }
  - { label: "STACK", value: "Hono · Workers · D1 · React" }
---

Todo evento hoy dispersa sus fotos entre veinte celulares y tres grupos de WhatsApp. Al final nadie tiene el álbum entero, y las buenas fotos se pierden en medio de la conversación. Instanta es mi intento de resolver eso. Es un feed colaborativo de fotos por evento. Los invitados entran, mandan foto a un muro que se actualiza en vivo, y podés tirar todo en una pantalla grande en el salón de la fiesta.

Entrar es sin registro. El invitado entra escribiendo solo un nombre y ya publica. Si después quiere, ese nombre se convierte en una cuenta de verdad sin perder nada de lo que ya subió. Hay reacciones, comentarios, stories, unas "misiones" para dar un empujón a que la gente publique, y el modo pantalla grande mostrando el feed ahí mismo, en el lugar. Las fotos son efímeras, se borran solas treinta días después del evento.

Es un proyecto mío, solo. Entré en él queriendo construir algo genuinamente edge-native, y tratar la parte de seguridad y arquitectura con el cuidado que le daría a un producto, y no a un fin de semana.

## Edge-native de verdad

Instanta corre entero en el edge de Cloudflare. El backend es Hono en un único Worker, con la base en D1, el SQLite de ellos que vive en el edge, accedido con Drizzle. Las fotos quedan en R2 y se sirven a través del propio Worker. El rate limit vive en un Durable Object, y hay cinco crons encargándose de limpieza, backup y monitoreo.

El front es React 19 con TanStack Router. Lo que más me gusta del setup es que, en dev, el front y el Worker levantan en el mismo proceso con HMR por debajo de 500ms, y en producción los dos suben juntos en un único deploy. La API queda a milisegundos de cualquier invitado, y mantenerlo en el aire cuesta casi nada.

Voy a ser honesto sobre en qué punto está. Hoy sube a una dirección workers.dev. El dominio propio ya está en el código, pero apagado, esperando que yo migre el DNS a Cloudflare. El email transaccional todavía es un stub. Es un proyecto personal en construcción, no un producto en el aire.

## Seguridad

Tomé la seguridad mucho más en serio de lo que un muro de fotos de fiesta exige. Hay 2FA, el cuidado de no revelar si un email existe o no en un intento de login, rate limit que aprieta con quien insiste, y un manejo de sesión que se da cuenta cuando un token fue robado y baja las sesiones de esa cuenta. Un app de fiesta no me pediría nada de esto. Este era el lugar donde yo quería ejercitar seguridad en serio, así que la ejercité.

## Arquitectura

La parte que más me gusta no aparece en la pantalla. La capa donde vive la lógica de negocio tiene prohibido, por una regla de ESLint, importar Hono, el runtime de Cloudflare, las rutas o los middlewares. Si me choco con esa frontera, el lint se rompe al instante. El efecto es que esa capa no sabe que hay un Worker debajo, así que puedo testear la lógica de negocio entera sin levantar nada.

## Tests corriendo en el runtime de verdad

Los tests de integración no corren contra un mock de Cloudflare. Corren dentro de workerd, el runtime real de los Workers, con D1, R2 y Durable Object de verdad, cada test con su base aislada de la del otro. Son 78 archivos de test que cubren registro, login, permisos, el borrado de datos por LGPD, moderación, upload y los crons. Hay también test de accesibilidad con axe-core en Playwright y un piso de cobertura en el CI.

## El offline que existe de verdad

Instanta no es un PWA, no se instala y no abre sin internet, y no voy a fingir que abre. Pero el upload aguanta una conexión mala, y esa parte es real. Cada foto, ya comprimida en el propio celular, entra en una cola en el navegador antes de intentar subir. Si la red se cae o cerrás la pestaña a la mitad, no se pierde, y cuando la conexión vuelve la cola drena sola. La compresión además borra los metadatos de EXIF y GPS de la imagen, así que dónde fue tomada la foto no viaja con ella.

Hoy Instanta es un proyecto personal de unas tres semanas de trabajo, hecho solo, y todavía no lanzado. Lo que falta para ponerlo en el aire es mundano. Migrar el DNS del dominio, conectar el email de verdad en lugar del stub, y apuntarlo al primer evento real.
