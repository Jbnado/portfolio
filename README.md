# JB Portfolio (Next.js)

Personal portfolio for João Bernardo (JB), built with Next.js 15, React 19 and Tailwind CSS.

## Quick start

```powershell
npm install ; npm run dev
```

Open http://localhost:3000

## Content structure

- Hero text: `src/components/Hero.tsx`
- About section: `src/components/About.tsx`
- Experience data: `src/app/experience.json`
- Skills data: `src/app/skills.json`
- Featured project (Ribeirão Noir): `src/components/FeaturedProject.tsx`
- Navigation/Footer: `src/components/Navbar.tsx`, `src/components/Footer.tsx`

## How to update

- Update experiences: edit `src/app/experience.json` (company, role, period, highlights, logo filename under `public/images/logos/`)
- Update skills: edit `src/app/skills.json` (keep only key technologies to keep the section compact)
- Update featured project links: edit `FeaturedProject.tsx`
- Update CV: replace `public/Bernardo-CV.pdf`

## Accessibility conventions

- Skip link in `app/layout.tsx` points to `#main-content`
- Buttons/links include `aria-label` where icon-only
- Semantic landmarks: `<main role="main" id="main-content">`, section headings with `aria-labelledby`

## Build

```powershell
npm run lint ; npm run build
```

Deployed on Vercel or any Node-compatible hosting.
