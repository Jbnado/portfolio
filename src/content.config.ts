import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const i18nText = z.object({
  'pt-br': z.string(),
  en: z.string(),
  es: z.string(),
});

const stats = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/stats' }),
  schema: z.object({
    items: z.array(z.object({
      value: z.number(),
      suffix: z.string(),
      label: z.string(),
    })),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/timeline' }),
  schema: z.object({
    items: z.array(z.object({
      type: z.enum(['career', 'project']),
      date: z.string(),
      title: i18nText,
      description: i18nText,
      tech: z.array(z.string()).optional(),
      href: z.string().optional(),
    })),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    items: z.array(z.object({
      id: z.string(),
      type: z.enum(['project', 'contribution']).default('project'),
      title: i18nText,
      description: i18nText,
      techStack: z.array(z.string()),
      startDate: z.string(),
      isFeatured: z.boolean(),
      links: z.object({
        github: z.string().url().optional(),
        demo: z.string().url().optional(),
      }),
      caseStudy: z.object({
        problem: i18nText,
        decision: i18nText,
        result: i18nText,
      }),
    })),
  }),
});

const caseStudies = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/caseStudies',
    // Default id generation uses frontmatter `slug` as-is, which collides
    // across locales (each project has one .md per locale, same `slug`).
    // Combine slug + locale so all 18 entries load as distinct entries.
    generateId: ({ data }) => `${data.slug}.${data.locale}`,
  }),
  schema: z.object({
    slug: z.string(),
    locale: z.enum(['pt-br', 'en', 'es']),
    title: z.string(),
    summary: z.string(),
    seoTitle: z.string().optional(),
    highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    meta: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { stats, timeline, projects, caseStudies };
