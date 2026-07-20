---
slug: "portfolio-jb"
locale: "es"
title: "Este Portfolio"
seoTitle: "Este portfolio por dentro — teardown técnico en Astro y Preact | João Bernardo"
summary: "El sitio que estás navegando, abierto por dentro. Un teardown con código de verdad, desde las dos paletas en variables CSS hasta las islas Preact hidratadas bajo demanda, desde los eyebrows que se vuelven comando de shell en el modo oscuro y papelería de ingeniería en el claro, desde la statusline que escribe al hacer clic, desde el SEO y hreflang escritos a mano hasta las trampas de content collections y de deploy que me costaron un rato."
highlights:
  - { value: "0 JS", label: "por defecto; islas Preact hidratadas bajo demanda" }
  - { value: "2", label: "paletas intercambiadas en variables CSS" }
  - { value: "3", label: "idiomas con hreflang y SEO a mano" }
meta:
  - { label: "ROL", value: "Diseño y desarrollo (solo)" }
  - { label: "TIPO", value: "Proyecto" }
  - { label: "PERÍODO", value: "2025 – 2026" }
  - { label: "STACK", value: "Astro · Preact · Tailwind 4" }
---

Esta página que estás leyendo está hecha por el propio sistema que describe. Así que, en vez de hablar del concepto, déjame abrir el capó. El sitio tiene dos personalidades. En el claro es una mesa de ingeniería, papel manila y líneas de blueprint. En el oscuro es una terminal punk, verde fósforo brillando en el CRT. Lo que sigue es cómo funciona cada parte de esto, con el código de verdad que está en el aire ahora mismo.

## Dos paletas, un solo conjunto de clases

El truco de las dos personalidades es que no existen dos sitios. Existe uno, y el tema es un puñado de variables CSS que se intercambian en la etiqueta `<html>`. Cada paleta es un bloque de custom properties.

```css
.light {
  --color-bg-primary: #f2efe4;   /* papel manila */
  --color-text-primary: #22242b; /* tinta casi negra */
  --color-accent: #8f2d24;       /* oxblood de sello */
}
.dark {
  --color-bg-primary: #0a0f0c;   /* negro verdoso de CRT */
  --color-text-primary: #7cf5ad; /* verde fósforo */
  --color-accent: #42f59b;       /* verde ácido */
}
```

Tailwind 4 entra por encima. Declaro el modo oscuro como una variante de clase y mapeo cada variable a una utility en el bloque `@theme`.

```css
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-bg-primary: var(--color-bg-primary);
  --color-text-primary: var(--color-text-primary);
  --color-accent: var(--color-accent);
}
```

En la práctica escribo `bg-bg-primary` una vez en el HTML y nunca más pienso en eso. Cambiar la clase `light` por `dark` en el `<html>` reescribe la paleta entera por debajo. El color no queda pegado al componente, vive en el tema.

## El tema no parpadea al cargar

El problema clásico del tema oscuro es el flash. La página nace clara, el JavaScript carga, se da cuenta de que quieres oscuro, y lo cambia en tu cara. Feo. La salida es decidir el tema antes del primer paint, con un script inline en la parte superior del `<head>`, antes de las hojas de estilo.

```html
<script is:inline>
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(t);
</script>
```

Son dos líneas. Como se ejecutan de forma síncrona antes del CSS, cuando el navegador dibuja el primer pixel la clase correcta ya está en la etiqueta `<html>`. El `is:inline` es lo que le dice a Astro que no procese ni mueva ese script, que lo deje ahí en crudo. Sin eso, no hay forma de que el tema no parpadee.

## Cada tema en su universo

Las dos personalidades no se quedan en el color. Cada sección tiene una línea decorativa encima del título, y esa línea es algo distinto en cada tema. En el oscuro es un comando de shell de verdad. En el claro, es la papelería de un tablero de ingeniería.

Encima de "Proyectos", el modo oscuro muestra `jbnado@rp:~$ cd ~/projetos && ls -la`. El modo claro muestra `HOJA 04/06 · MEMORIA DESCRIPTIVA`. Encima del contacto, el oscuro lanza un `ping -c 1 bernardo` que responde desde Ribeirão Preto, y el claro muestra `FIRMA DEL RESPONSABLE`. Son comandos reales, que existen en man page, y no adorno fingiendo ser terminal.

La forma de hacer esto sin JavaScript y sin parpadear al cambiar de tema es el mismo truco de los colores. Cada uno de estos puntos renderiza dos spans, los dos `aria-hidden`, y el CSS decide cuál aparece.

```astro
<span class="term-line" aria-hidden="true">{term}</span>
<span class="paper-tag" aria-hidden="true">{paper}</span>
```

```css
.light .term-line { display: none; }
.dark  .paper-tag { display: none; }
```

El `aria-hidden` en los dos importa. Quien usa lector de pantalla no quiere oír "jbnado arroba rp" antes de cada sección. El título de verdad, el `<h2>`, sigue ahí, limpio y legible para la máquina. El comando es adorno para quien ve, y desaparece para quien no lo necesita.

## La statusline que escribe el comando

Ese fue el detalle con el que más me divertí. En el modo oscuro, cuando haces clic en un enlace, una barra fina aparece en el pie y escribe el comando equivalente antes de llevarte a la página. Hacer clic en "leer case study" escribe `cd /projeto/instanta`. Un enlace externo escribe `xdg-open`. La descarga del CV escribe `scp jbnado.dev:cv.pdf ~/Downloads/`.

Parece una tontería, pero hay un montón de reglas para que esto no le estorbe a nadie. La barra solo existe en el oscuro. Si marcaste "reducir movimiento" en el sistema, igual aparece, solo que con el comando entero de una vez, sin la escritura, y luego navega. Un clic con ctrl o con el botón del medio, para abrir en una pestaña nueva, pasa directo sin que yo lo toque. Un enlace que abre en otra pestaña, un correo y una descarga corren la animación en paralelo, sin retener la acción. Solo la navegación normal, en la misma pestaña, es la que retengo para escribir, con un tope de 300 milisegundos para que nunca se convierta en espera.

```tsx
// solo en el universo del terminal (oscuro)
if (!isDark()) return;
// ctrl/cmd/shift/alt o el botón del medio nunca se interceptan
if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

e.preventDefault();
type(command, () => { window.location.href = dest; });
// type() respeta "reducir movimiento": muestra el comando entero,
// sin escribir, y luego sigue.
```

Si el JavaScript no carga, los enlaces funcionan normal, porque el `preventDefault` solo se ejecuta dentro de la isla, que puede ni haber subido. Es adorno encima de un enlace que ya funcionaba solo. Y el correo nunca va a la barra, ni en el comando de mandar mensaje, porque la dirección queda ofuscada en el sitio y no iba a mostrarla en la pantalla en un easter egg.

## Islas Preact y la hidratación bajo demanda

El sitio es Astro, así que por defecto manda HTML y cero JavaScript. Donde necesito interacción uso una isla de Preact, y el detalle que importa es elegir cuándo cobra vida cada isla. Astro tiene una directiva para cada urgencia.

```astro
<ThemeToggle client:load />      <!-- esencial, hidrata ya -->
<ScrollSpy client:idle />        <!-- puede esperar a que el navegador respire -->
<StatsCounter client:visible />  <!-- solo cuando llegues a él al hacer scroll -->
```

El botón de tema tiene que funcionar al primer toque, así que `client:load`. El scroll spy que enciende el ítem del menú a medida que lees no tiene prisa, `client:idle` lo guarda para cuando el hilo principal esté libre. Y el contador de estadísticas solo tiene sentido cuando aparece en la pantalla, `client:visible` ni siquiera descarga su JavaScript hasta que llegues ahí con el scroll. La regla que sigo es casar el costo de la hidratación con lo mucho que eso importa. La statusline que escribe entra aquí también, con `client:idle`, porque puede esperar.

## SEO escrito a mano

Nada de plugin mágico de SEO. Cada página arma sus propias tags, y las que más pesan en un sitio en tres idiomas son las de hreflang, que le avisan a Google que esa página tiene hermanas en otras lenguas.

```astro
<link rel="alternate" hreflang="pt-BR" href={links['pt-br']} />
<link rel="alternate" hreflang="en" href={links['en']} />
<link rel="alternate" hreflang="es" href={links['es']} />
<link rel="alternate" hreflang="x-default" href={links['pt-br']} />
```

El `x-default` apunta a la versión por defecto para quien no coincide con ningún idioma de la lista. Y cada case study además emite un JSON-LD, los datos estructurados que le dicen al buscador que eso es un trabajo de autoría, y no un texto suelto en la página.

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  headline: entry.data.title,
  inLanguage: LOCALE,
  url: canonical,
  author: { '@type': 'Person', name: 'João Bernardo' },
};
```

Como Astro genera todo esto como HTML estático en el build, el robot de Google recibe las tags listas, sin necesidad de ejecutar nada para ver el contenido.

## La trampa de content collections multi-idioma

Esta me costó un rato, así que ahí va el tip. Cada case study es un markdown, un archivo por idioma, tipo `instanta.pt-br.md` e `instanta.en.md`. Los dos tienen el mismo `slug` en el frontmatter. El loader de glob de Astro, por defecto, usa ese `slug` como id de la entrada. Resultado, los idiomas colisionan y uno sobrescribe al otro.

La salida es generar el id a mano, combinando slug y locale.

```ts
loader: glob({
  pattern: '*.md',
  base: './src/content/caseStudies',
  // el id por defecto es el slug del frontmatter, que colisiona entre locales.
  // combinar slug + locale hace que las entradas se carguen distintas.
  generateId: ({ data }) => `${data.slug}.${data.locale}`,
}),
```

Después de eso, tomar la versión correcta es solo pedir `getEntry('caseStudies', 'instanta.pt-br')`. Si algún día armas un sitio multilingüe con content collections, es el primer lugar donde yo miraría.

## La trampa de Sharp en el deploy

Esta me agarró después de un deploy que juraba que iba a pasar. El build se rompió en Vercel con `MissingSharp: Could not find Sharp`, y lo más irritante es que el log mostraba a Sharp siendo instalado justo encima del error. Localmente pasaba, en Vercel no.

Sharp es lo que Astro usa para optimizar las imágenes en el build. Venía instalado, pero solo como dependencia transitiva del propio Astro. Con pnpm, una dependencia transitiva no sube al `node_modules` de la raíz, queda anidada. Localmente el build reaprovechaba imágenes del cache y ni llamaba a Sharp, así que el problema no aparecía. En Vercel, con build limpio y sin cache, Astro intentaba cargar Sharp desde la raíz y no lo encontraba.

La corrección es declarar Sharp como dependencia directa, para que suba a la raíz y el import resuelva.

```jsonc
// package.json
"dependencies": {
  "sharp": "^0.34.0"  // coincide con el range que pide Astro
}
```

Aproveché que Sharp ya estaba resuelto para generar la imagen de preview social del propio sitio, esa que aparece cuando mandas el enlace por WhatsApp. Un script toma un SVG con el visual del terminal y lo rasteriza en un PNG de 1200 por 630. Antes de eso, el preview era un rectángulo naranja liso de placeholder, que no tenía nada que ver con el sitio.

## Accesibilidad que el usuario controla

Una buena accesibilidad no es solo contraste, es respetar lo que la persona ya configuró en su sistema. Tres media queries hacen casi todo el trabajo aquí.

```css
/* quien pidió menos movimiento, recibe menos movimiento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* quien pidió más contraste, recibe colores más fuertes */
@media (prefers-contrast: high) {
  .dark { --color-text-primary: #b6ffd6; --color-border: currentColor; }
}

/* contorno de foco solo para quien navega con el teclado */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

El glitch y el brillo de CRT, que son la gracia del modo oscuro, desaparecen por completo para quien marcó "reducir movimiento". El `:focus-visible` muestra el contorno para quien se mueve con el teclado sin ensuciar la pantalla de quien usa mouse. Nada de esto aparece en una demo bonita, pero es lo que hace que el sitio funcione para quien no navega igual que yo.

## Unos detalles de build

Dos cosas en la configuración que valen oro. La primera es setear el `site` en el `astro.config`. Sin esa URL absoluta, el sitemap y las tags de canónico salen rotos. La segunda es el i18n con el idioma por defecto sin prefijo, así que el portugués vive en la raíz y solo en y es tienen carpeta propia.

```js
export default defineConfig({
  site: 'https://jbnado.dev',
  integrations: [preact(), sitemap()],
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
});
```

Y las fuentes son todas self-hosted, servidas desde el propio dominio, como fuentes variables subseteadas por `unicode-range` para descargar solo los caracteres que el sitio usa. A las dos más críticas para el primer paint además les doy preload en el `<head>`. Una fuente que viene de un tercero es un pedido de red de más y un punto de lentitud que no quiero en un sitio que se vende por la velocidad.

```html
<link rel="preload" as="font" href="/fonts/inter-variable.woff2"
      type="font/woff2" crossorigin />
```

Al final es mi sitio personal, pero no lo traté como una tarjeta de presentación. Lo traté como un producto, y el propio código es parte del portfolio. Está todo abierto en GitHub para quien quiera leerlo entero, no solo los pedazos que cupieron aquí.
