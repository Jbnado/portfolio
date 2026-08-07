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

/** Segmento de paginação por idioma. `/blog/pagina/2` em pt-br, `/en/blog/page/2` em en. */
export const PAGE_SEGMENTS: Record<Locale, string> = {
  'pt-br': 'pagina',
  en: 'page',
  es: 'pagina',
};

/** Prefixo de URL do idioma. Vazio no idioma padrão, que não tem prefixo. */
export function localePrefix(locale: Locale = DEFAULT_LOCALE): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

export function blogUrl(locale: Locale = DEFAULT_LOCALE): string {
  return `${localePrefix(locale)}/blog`;
}

export function blogPostUrl(urlSlug: string, locale: Locale = DEFAULT_LOCALE): string {
  return `${blogUrl(locale)}/${urlSlug}`;
}

/** Página 1 é a própria raiz do blog. Não existe `/blog/pagina/1`, que duplicaria conteúdo. */
export function blogPageUrl(page: number, locale: Locale = DEFAULT_LOCALE): string {
  if (page <= 1) return blogUrl(locale);
  return `${blogUrl(locale)}/${PAGE_SEGMENTS[locale]}/${page}`;
}

export function blogIndexUrl(locale: Locale = DEFAULT_LOCALE): string {
  return `/blog-index/${locale}.json`;
}

export function rssUrl(locale: Locale = DEFAULT_LOCALE): string {
  return `${localePrefix(locale)}/rss.xml`;
}
