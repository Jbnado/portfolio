---
slug: "portfolio-jb"
locale: "en"
title: "This Portfolio"
seoTitle: "This portfolio from the inside — a technical teardown in Astro and Preact | João Bernardo"
summary: "The site you're browsing, opened up from the inside. A teardown with real code, from the two palettes in CSS variables to the Preact islands hydrated on demand, from the eyebrows that turn into shell commands in the dark and engineering paperwork in the light, to the statusline that types when you click, from the hand-written SEO and hreflang to the content collections and deploy gotchas that cost me some time."
highlights:
  - { value: "0 JS", label: "by default; Preact islands hydrated on demand" }
  - { value: "2", label: "palettes swapped in CSS variables" }
  - { value: "3", label: "languages with hand-written hreflang and SEO" }
meta:
  - { label: "ROLE", value: "Design and development (solo)" }
  - { label: "TYPE", value: "Project" }
  - { label: "PERIOD", value: "2025 – 2026" }
  - { label: "STACK", value: "Astro · Preact · Tailwind 4" }
---

This page you're reading is built by the very system it describes. So instead of talking about the concept, let me pop the hood. The site has two personalities. In the light it's an engineering desk, manila paper and blueprint lines. In the dark it's a punk terminal, phosphor green glowing on a CRT. What follows is how each part of it works, with the real code that's live right now.

## Two palettes, one set of classes

The trick behind the two personalities is that there aren't two sites. There's one, and the theme is a handful of CSS variables swapped on the `<html>` tag. Each palette is a block of custom properties.

```css
.light {
  --color-bg-primary: #f2efe4;   /* manila paper */
  --color-text-primary: #22242b; /* near-black ink */
  --color-accent: #8f2d24;       /* stamp oxblood */
}
.dark {
  --color-bg-primary: #0a0f0c;   /* CRT greenish black */
  --color-text-primary: #7cf5ad; /* phosphor green */
  --color-accent: #42f59b;       /* acid green */
}
```

Tailwind 4 sits on top. I declare dark mode as a class variant and map each variable to a utility in the `@theme` block.

```css
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-bg-primary: var(--color-bg-primary);
  --color-text-primary: var(--color-text-primary);
  --color-accent: var(--color-accent);
}
```

In practice I write `bg-bg-primary` once in the HTML and never think about it again. Swapping the `light` class for `dark` on `<html>` rewrites the whole palette underneath. The color isn't glued to the component, it lives in the theme.

## The theme doesn't flash on load

The classic dark-theme problem is the flash. The page loads light, JavaScript kicks in, realizes you want dark, and switches right in your face. Ugly. The way out is to decide the theme before the first paint, with an inline script at the top of the `<head>`, before the stylesheets.

```html
<script is:inline>
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(t);
</script>
```

It's two lines. Because they run synchronously before the CSS, by the time the browser paints the first pixel the right class is already on the `<html>` tag. The `is:inline` is what tells Astro not to process or move this script, to leave it there raw. Without it, there's no way to keep the theme from flashing.

## Each theme in its own universe

The two personalities don't stop at color. Each section has a decorative line above its title, and that line is something different in each theme. In the dark it's a real shell command. In the light, it's the paperwork of an engineering drafting board.

Above "Projects", dark mode shows `jbnado@rp:~$ cd ~/projetos && ls -la`. Light mode shows `SHEET 04/06 · SPECIFICATION REPORT`. Above the contact section, dark gives a `ping -c 1 bernardo` that answers from Ribeirão Preto, and light shows `SIGNATURE OF RECORD`. These are real commands, the kind that have a man page, not decoration pretending to be a terminal.

The way to do this without JavaScript and without flashing on theme switch is the same trick as the colors. Each of these spots renders two spans, both `aria-hidden`, and the CSS decides which one shows.

```astro
<span class="term-line" aria-hidden="true">{term}</span>
<span class="paper-tag" aria-hidden="true">{paper}</span>
```

```css
.light .term-line { display: none; }
.dark  .paper-tag { display: none; }
```

The `aria-hidden` on both matters. Someone using a screen reader doesn't want to hear "jbnado at rp" before every section. The real title, the `<h2>`, is still there, clean and machine-readable. The command is decoration for people who can see it, and it disappears for anyone who doesn't need it.

## The statusline that types the command

This was the detail I had the most fun building. In dark mode, when you click a link, a thin bar appears at the bottom and types the equivalent command before taking you to the page. Clicking "read case study" types `cd /projeto/instanta`. An external link types `xdg-open`. The CV download types `scp jbnado.dev:cv.pdf ~/Downloads/`.

It sounds silly, but there are a ton of rules so it never gets in anyone's way. The bar only exists in the dark. If you've set "reduce motion" in your system, it still appears, just with the whole command at once, without the typing, and then navigates. A ctrl-click or a middle-click, to open in a new tab, passes straight through untouched. A link that opens in another tab, email, and downloads run the animation in parallel, without holding up the action. Only normal navigation, in the same tab, is what I hold back to type, with a 300-millisecond ceiling so it never turns into waiting.

```tsx
// terminal universe only (dark)
if (!isDark()) return;
// ctrl/cmd/shift/alt or middle button are never intercepted
if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

e.preventDefault();
type(command, () => { window.location.href = dest; });
// type() respects "reduce motion": shows the whole command,
// without typing, then moves on.
```

If JavaScript doesn't load, the links work normally, because the `preventDefault` only runs inside the island, which may not even have come up. It's decoration on top of a link that already worked on its own. And the email never goes to the bar, not even in the send-a-message command, because the address is obfuscated on the site and I wasn't about to throw it on screen in an easter egg.

## Preact islands and hydration on demand

The site is Astro, so by default it ships HTML and zero JavaScript. Where I need interaction I use a Preact island, and the detail that matters is choosing when each island comes to life. Astro has a directive for every level of urgency.

```astro
<ThemeToggle client:load />      <!-- essential, hydrate now -->
<ScrollSpy client:idle />        <!-- can wait for the browser to breathe -->
<StatsCounter client:visible />  <!-- only when you scroll to it -->
```

The theme button needs to work on the first tap, so `client:load`. The scroll spy that lights up the menu item as you read is in no hurry, `client:idle` holds it back until the main thread is free. And the stats counter only makes sense when it shows up on screen, `client:visible` doesn't even download its JavaScript until you scroll to it. The rule I follow is to match the cost of hydration to how much it matters. The typing statusline goes here too, with `client:idle`, because it can wait.

## SEO written by hand

No magic SEO plugin. Each page assembles its own tags, and the ones that carry the most weight on a three-language site are the hreflang tags, which tell Google that page has siblings in other languages.

```astro
<link rel="alternate" hreflang="pt-BR" href={links['pt-br']} />
<link rel="alternate" hreflang="en" href={links['en']} />
<link rel="alternate" hreflang="es" href={links['es']} />
<link rel="alternate" hreflang="x-default" href={links['pt-br']} />
```

The `x-default` points to the default version for anyone who doesn't match any language in the list. And each case study also emits a JSON-LD, the structured data that tells the search engine this is authored work, not just loose text on a page.

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

Since Astro generates all of this as static HTML at build time, Google's crawler receives the tags ready-made, without having to run anything to see the content.

## The multi-language content collections gotcha

This one cost me some time, so here's the tip. Each case study is a markdown file, one file per language, like `instanta.pt-br.md` and `instanta.en.md`. Both have the same `slug` in the frontmatter. Astro's glob loader, by default, uses that `slug` as the entry id. The result, the languages collide and one overwrites the other.

The way out is to generate the id by hand, combining slug and locale.

```ts
loader: glob({
  pattern: '*.md',
  base: './src/content/caseStudies',
  // the default id is the frontmatter slug, which collides across locales.
  // combining slug + locale makes the entries load as distinct.
  generateId: ({ data }) => `${data.slug}.${data.locale}`,
}),
```

After that, getting the right version is just asking for `getEntry('caseStudies', 'instanta.pt-br')`. If you ever build a multilingual site with content collections, it's the first place I'd look.

## The Sharp gotcha at deploy

This one caught me after a deploy I was sure would pass. The build broke on Vercel with `MissingSharp: Could not find Sharp`, and the most annoying part is that the log showed Sharp being installed right above the error. Locally it passed, on Vercel it didn't.

Sharp is what Astro uses to optimize images at build time. It came installed, but only as a transitive dependency of Astro itself. With pnpm, a transitive dependency doesn't get hoisted to the root `node_modules`, it stays nested. Locally the build reused cached images and didn't even call Sharp, so the problem never showed up. On Vercel, with a clean build and no cache, Astro tried to load Sharp from the root and couldn't find it.

The fix is to declare Sharp as a direct dependency, so it gets hoisted to the root and the import resolves.

```jsonc
// package.json
"dependencies": {
  "sharp": "^0.34.0"  // matches the range Astro asks for
}
```

With Sharp now resolved, I took advantage of it to generate the site's own social preview image, the one that shows up when you send the link on WhatsApp. A script takes an SVG in the terminal look and rasterizes it into a 1200-by-630 PNG. Before that, the preview was a plain orange placeholder rectangle that had nothing to do with the site.

## Accessibility the user controls

Good accessibility isn't just contrast, it's respecting what the person has already configured in their system. Three media queries do almost all the work here.

```css
/* whoever asked for less motion, gets less motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* whoever asked for more contrast, gets stronger colors */
@media (prefers-contrast: high) {
  .dark { --color-text-primary: #b6ffd6; --color-border: currentColor; }
}

/* focus outline only for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

The glitch and the CRT glow, which are the whole charm of dark mode, disappear entirely for anyone who checked "reduce motion". The `:focus-visible` shows the outline for people navigating by keyboard without cluttering the screen for anyone using a mouse. None of this shows up in a pretty demo, but it's what makes the site work for people who don't browse the way I do.

## A few build details

Two things in the config are worth their weight in gold. The first is setting `site` in `astro.config`. Without that absolute URL, the sitemap and the canonical tags come out broken. The second is i18n with the default language unprefixed, so Portuguese lives at the root and only en and es get their own folder.

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

And the fonts are all self-hosted, served from the domain itself, as variable fonts subset by `unicode-range` to download only the characters the site uses. The two most critical for the first paint I also preload in the `<head>`. A font coming from a third party is one more network request and a slow point I don't want on a site that sells itself on speed.

```html
<link rel="preload" as="font" href="/fonts/inter-variable.woff2"
      type="font/woff2" crossorigin />
```

In the end it's my personal site, but I didn't treat it like a business card. I treated it like a product, and the code itself is part of the portfolio. It's all open on GitHub for anyone who wants to read it in full, not just the pieces that fit here.
