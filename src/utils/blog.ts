import type { Locale } from './constants';

export const POSTS_PER_PAGE = 10;

/** Um post como ele aparece na listagem. Nunca carrega o corpo do markdown. */
export interface BlogIndexEntry {
  urlSlug: string;
  /** Caminho já com prefixo de idioma, pronto pro href. */
  href: string;
  title: string;
  summary: string;
  /** ISO YYYY-MM-DD, pro atributo datetime. */
  date: string;
  /** Já formatado no idioma do índice, porque o card também renderiza no navegador. */
  dateLabel: string;
  tags: string[];
  thumbnail: string;
  thumbAlt: string;
  readingMinutes: number;
  /** Título, resumo e tags concatenados, sem acento e em minúscula. */
  search: string;
}

/** Minúscula e sem acento, pra quem digita "seguranca" achar "segurança". */
export function normalizeSearch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const MONTHS_SHORT: Record<Locale, string[]> = {
  'pt-br': ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
};

const MONTHS_LONG: Record<Locale, string[]> = {
  'pt-br': ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

/**
 * Formata a partir dos pedaços da string, sem passar por Date.
 * `new Date('2026-08-04')` é meia-noite UTC, e em UTC-3 imprimiria 03/08.
 */
export function formatDateShort(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split('-');
  const name = MONTHS_SHORT[locale][Number(month) - 1];
  return locale === 'en' ? `${name} ${day}, ${year}` : `${day} ${name} ${year}`;
}

export function formatDateLong(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split('-');
  const name = MONTHS_LONG[locale][Number(month) - 1];
  const d = String(Number(day));
  return locale === 'en' ? `${name} ${d}, ${year}` : `${d} de ${name} de ${year}`;
}

export function matchesQuery(entry: BlogIndexEntry, query: string): boolean {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every((term) => entry.search.includes(term));
}

export function paginate<T>(items: T[], page: number, perPage: number = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    total: items.length,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}
