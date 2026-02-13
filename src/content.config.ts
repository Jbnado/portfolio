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

export const collections = { stats, timeline, projects };
