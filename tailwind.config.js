/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: '' },
            'code::after': { content: '' },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
            maxWidth: 'none',
            a: {
              color: '#0891b2',
              textDecoration: 'none',
              '&:hover': {
                color: '#0e7490',
              },
            },
            h1: {
              fontWeight: '700',
              color: '#ffffff',
            },
            h2: {
              fontWeight: '700',
              color: '#ffffff',
            },
            h3: {
              fontWeight: '600',
              color: '#ffffff',
            },
            pre: {
              backgroundColor: '#1e1e1e',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflowX: 'auto',
            },
            code: {
              backgroundColor: '#2d2d2d',
              color: '#ffffff',
              fontWeight: '400',
              fontSize: '0.875em',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
  darkMode: 'class',
}; 