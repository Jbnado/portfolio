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
