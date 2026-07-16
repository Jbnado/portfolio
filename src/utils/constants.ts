export const SITE_URL = 'https://jbnado.dev';
export const DEFAULT_LOCALE = 'pt-br';
export const LOCALES = ['pt-br', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const CASE_SEGMENTS: Record<'project' | 'contribution', Record<Locale, string>> = {
  project: { 'pt-br': 'projeto', en: 'project', es: 'proyecto' },
  contribution: { 'pt-br': 'contribuicao', en: 'contribution', es: 'contribucion' },
};

/** Path relativo (com prefixo de locale) para a página de case study. */
export function caseStudyUrl(
  type: 'project' | 'contribution',
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const seg = CASE_SEGMENTS[type][locale];
  return `${prefix}/${seg}/${slug}`;
}
