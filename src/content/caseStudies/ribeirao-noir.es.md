---
slug: "ribeirao-noir"
locale: "es"
title: "Ribeirão Noir"
summary: "Juego investigativo noir en los años 1950 de Ribeirão Preto, protagonizado por Dandara, como herramienta de educación antirracista. Me encargué de todo el desarrollo en Godot, del motor de narrativa orientado a datos al sistema de dados y guardado, con arquitectura SOLID. Validado por tres doctores y lanzado en la Feria Internacional del Libro."
highlights:
  - { value: "9", label: "lugares de Ribeirão para investigar" }
  - { value: "6", label: "finales decididos por tus pruebas" }
  - { value: "3", label: "doctores lo validaron · USP, Metodista, UFTM" }
meta:
  - { label: "ROL", value: "Desarrollador (solo)" }
  - { label: "TIPO", value: "Proyecto" }
  - { label: "PERÍODO", value: "2025" }
  - { label: "STACK", value: "Godot · GDScript" }
---

La protagonista del juego es Dandara. Una investigadora negra, en los años 1950 de Ribeirão Preto, tras quien robó la estatua de São Sebastião para liberar a un inocente. Y no está ahí por casualidad. Ribeirão Noir es un juego de educación antirracista, pensado para ayudar a la escuela a cumplir las leyes 10.639 y 11.645, que volvieron obligatoria la enseñanza de historia y cultura afrobrasileña e indígena. Poner a una mujer negra como protagonista, con agencia histórica, en un país donde los datos del IBGE muestran que las personas negras son el 87,8% de las muertes por intervención policial, no es un detalle de guion. Es el punto del juego.

Ribeirão Noir lo hizo un equipo. La narrativa, el arte y el diseño vinieron de Ramon y de la producción de Palimpsesto Produções. Yo me encargué del desarrollo, así que es de la ingeniería detrás del juego que hablo acá, el motor que interpreta la narrativa, el sistema de dados, el guardado, la arquitectura. Fueron seis meses, financiados por la Ley Paulo Gustavo, y el trabajo se volvió mi tesis, sobre aplicar SOLID y patrones de diseño en un juego que carga peso social.

## Es una investigación de verdad

Ribeirão Noir es un RPG narrativo en texto. Eliges una de tres profesiones, detective, periodista o abogada, y cada una abre una forma distinta de investigar. Recorres nueve lugares del Ribeirão Preto de los años 50, buena parte de ellos históricos de verdad, como el Theatro Pedro II, la Praça XV, el Palacete Camilo de Mattos y la Choperia Pinguim, cada uno con su propia historia en vez de un escenario genérico. Hablas con 32 personajes, juntas pistas, y al final señalas al culpable. Hay seis finales posibles, y a cuál llegas depende de las pruebas que lograste reunir en el camino.

Lo que le da unión a todo esto es el sistema por debajo, y tiene tres piezas que vale contar. Cómo la narrativa está hecha de datos y no de código, cómo el riesgo de cada elección se resuelve en el dado, y cómo el juego recuerda todo lo que hiciste.

## La narrativa es dato, no código

Si hubiera escrito la historia dentro del código, Ramon no podría escribir ni cambiar nada sin llamarme, y yo me volvería el cuello de botella del proyecto entero. Entonces toda la narrativa vive en JSON. Son 17 archivos, casi 27 mil líneas, uno por acto y por lugar, y el código solo interpreta.

Cada archivo es un grafo de nodos. Un nodo lleva las líneas de ese momento, las opciones de elección (cada una apuntando al próximo nodo, algunas con una condición para aparecer), un bloque de tirada de dado y los resultados posibles, separados en éxito total, éxito parcial y fracaso.

El intérprete carga el archivo del acto, empieza por el nodo inicial y va dibujando cada línea, cada elección y cada tirada, siguiendo los enlaces de un nodo al otro. Cuando eliges una opción, un motor de efectos aplica los modificadores de ese nodo, que quitan o dan vida, ajustan una postura, liberan un lugar nuevo, entregan una pista o presentan un personaje. Agregar una mecánica nueva, una profesión, un ítem, un comportamiento, es escribir en el JSON, no tocar el núcleo. Así el juego crece sin que el equipo quede rehén del código.

## Dado, postura y riesgo

El corazón del RPG es la tirada. Son dos dados de seis, y el resultado no es solo suerte. A la suma de los dos dados entran varios modificadores, y el total cae en una de tres franjas, éxito total, éxito parcial o fracaso.

La parte que me parece elegante es cómo la postura entra en esa cuenta. Tus elecciones te van definiendo en cuatro posturas, temerario, sabio, prudente y evasivo, y cada tirada pide una de ellas. En una prueba sabia, es tu postura sabia la que pesa en el dado. O sea, quién decidiste ser cambia lo que puedes hacer. Y los modificadores solo cuentan si realmente los tienes. La habilidad solo entra si coincide con tu profesión, el ítem solo entra si lo llevas, el personaje solo entra si lo conoces.

La vida amarra el riesgo. Empiezas con 10 de vida, y puedes tirar de nuevo cuando fallas, pero cada nuevo intento cuesta 1 de vida, y se traba cuando llegas cerca de cero. Insistir tiene precio. Llegar a cero abre el final de game over. Es un sistema simple de enunciar y que genera tensión real a la hora de decidir si arriesgas una más.

## El guardado es un transcript, no un checkpoint

La mayoría de los juegos guarda un punto de retorno. Ribeirão Noir guarda la partida entera, jugada por jugada. En JSON, en el disco, guarda tres cosas, la ficha de Dandara, la posición actual en la narrativa, y el historial completo de lo que pasó.

La ficha guarda exactamente lo que importa. Vida, profesión, las cuatro posturas, qué pistas encontraste y dónde, los lugares visitados y liberados, ítems, y las personas que conociste. Pero lo bueno es el historial. Es una lista de momentos narrativos, y cada momento guarda los globos de diálogo con el tipo correcto (habla de la heroína, pensamiento, personaje, narrador, tirada). Cuando recargas, el juego no te deja en un punto seco. Reconstruye en pantalla cada globo que ya habías visto, el recorrido entero de la investigación. Y guarda de forma continua, en cada línea renderizada, así que no hay manera de perder progreso.

## SOLID, con una cicatriz honesta

La arquitectura fue el foco de la tesis, con la idea de aplicar SOLID de verdad, no de adorno. Un autoload central sostiene el estado del juego, pero no guarda nada solo. Delega a una clase de guardado, que delega a una de historial, que delega a los momentos narrativos. Cada una se ocupa de una sola cosa. La comunicación entre las pantallas pasa por un bus global de señales, donde quien emite y quien escucha nunca se conocen. Cuando Dandara recibe daño, el personaje emite una señal, y la barra de vida, el game over y el aviso en pantalla reaccionan solos, sin que nadie llame a nadie. La interfaz es compuesta, no heredada. Las pantallas de ítem, personaje y libreta son componentes montados y conectados al vuelo, no subclases de un árbol gigante.

Y acá viene la parte honesta, documentada en la tesis en vez de escondida. La escena principal, la que interpreta los actos, pasó de mil líneas. Acumula responsabilidades que, en un mundo ideal, estarían en clases separadas. Fue una elección consciente de plazo. Distribuir todo prolijamente habría consumido un tiempo que no tenía para entregar el juego en seis meses. Funciona, pero es una violación de responsabilidad única, y prefiero llamarlo cicatriz antes que fingir que no existe. Fue el aprendizaje más real del proyecto. En la vida profesional equilibras la arquitectura ideal con plazo, presupuesto y lo que se puede entregar.

## Los detalles de oficio

Fuera del núcleo, hubo cuidado con la experiencia. El juego exporta a web y Android, con el layout adaptándose al touch y al retrato del celular. Y la accesibilidad es un sistema de verdad, no un botón suelto, con una escala de fuente que se propaga por una señal a cada widget de la pantalla, y subtítulos para las pistas en audio.

## El equipo, el logro y la validación

Un juego de educación antirracista solo se vuelve herramienta de verdad si personas que entienden del tema dicen que funciona. Tres doctores lo evaluaron y recomendaron: Sérgio de Souza, posdoctor en Sociología de la Educación en la USP, que lo reconoció como instrumento de educación antirracista; José Lages, doctor por la Metodista, que lo validó como educación patrimonial, por resignificar los puntos históricos reales de Ribeirão; y Marcelo Silva, doctor en Historia Social y profesor de la licenciatura en Historia de la UFTM, que mapeó el juego a las competencias de la BNCC de 9º año y acuñó la idea de "mundos epistémicos", ambientes donde el jugador simula roles sociales e internaliza formas de pensar propias de ese contexto. Junto al juego salió un material pedagógico, "Racismo y Misoginia en Juego: ¿qué nos enseña Dandara?", porque, como reconocimos, jugar solo no garantiza impacto sin mediación en el aula.

El juego se lanzó en la Feria Internacional del Libro, es gratuito, y lleva la etiqueta "No AI", sin arte ni texto generado por IA.

Empecé a programar porque amaba los juegos y quería entender cómo estaban hechos. Ayudar a hacer uno que sirve para algo salió mejor de lo que esperaba. Como dice el material pedagógico, la idea no es "jugar y aprender", es jugar, reflexionar y debatir, para que la tecnología sirva a fines de liberación y transformación social.
