// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://jbnado.dev',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // O padrao do Astro e o tema github-dark, que injeta a propria paleta em
    // style inline: violeta #B392F0, azul #79B8FF, um slab #24292e. Isso e uma
    // TERCEIRA paleta, que nao e a mesa de engenharia nem o terminal, e no
    // turno claro aterrissa um bloco escuro no meio do papel manila. Com
    // css-variables o Shiki emite var(--astro-code-*) e quem decide a cor
    // passa a ser o sistema, turno a turno.
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  integrations: [
    preact(),
    sitemap({
      // O índice de busca é dado de máquina, não página. Fora do sitemap.
      filter: (page) => !page.includes('/blog-index/'),
    }),
  ],
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
