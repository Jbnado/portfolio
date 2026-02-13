import { DEFAULT_LOCALE, LOCALES, type Locale } from '../utils/constants';

import ptBr from './pt-br.json';
import en from './en.json';
import es from './es.json';

const CV_PATHS: Record<string, string> = {
  'pt-br': '/Bernardo-CV.pdf',
  en: '/Bernardo-CV-en.pdf',
  es: '/Bernardo-CV-es.pdf',
};

export function getCvPath(locale: string = DEFAULT_LOCALE): string {
  return CV_PATHS[locale] ?? CV_PATHS[DEFAULT_LOCALE];
}

const translations: Record<string, Record<string, unknown>> = {
  'pt-br': ptBr,
  en,
  es,
};

/**
 * Get translation by dot-notation key.
 * Falls back to key itself if not found.
 */
export function t(key: string, locale: string = DEFAULT_LOCALE): string {
  const lang = translations[locale] ?? translations[DEFAULT_LOCALE];
  const keys = key.split('.');
  let value: unknown = lang;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Extract locale from URL path.
 * Returns DEFAULT_LOCALE if no locale prefix found.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLang] = url.pathname.split('/');
  if (LOCALES.includes(maybeLang as Locale) && maybeLang !== DEFAULT_LOCALE) {
    return maybeLang as Locale;
  }
  return DEFAULT_LOCALE;
}
