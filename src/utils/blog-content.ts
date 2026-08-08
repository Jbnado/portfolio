import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, SITE_URL, blogPostUrl, type Locale } from './constants';
import {
  formatDateShort,
  normalizeSearch,
  readingMinutes,
  type BlogIndexEntry,
} from './blog';

export type BlogEntry = CollectionEntry<'blog'>;

/** Posts publicados daquele idioma, do mais novo pro mais velho. */
export async function getBlogPosts(locale: Locale = DEFAULT_LOCALE): Promise<BlogEntry[]> {
  const posts = await getCollection('blog', ({ data }) => data.locale === locale && !data.draft);
  // Data é YYYY-MM-DD, então ordem alfabética já é ordem cronológica.
  return posts.sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<BlogEntry | undefined> {
  const posts = await getCollection('blog', ({ data }) => data.slug === slug && data.locale === locale);
  return posts[0];
}

/** URLs absolutas das 3 traduções, pro hreflang e pro seletor de idioma. */
export async function getPostAlternates(slug: string): Promise<Record<string, string>> {
  const siblings = await getCollection('blog', ({ data }) => data.slug === slug);
  const out: Record<string, string> = {};
  for (const sibling of siblings) {
    out[sibling.data.locale] = `${SITE_URL}${blogPostUrl(sibling.data.urlSlug, sibling.data.locale)}`;
  }
  return out;
}

export function toIndexEntry(entry: BlogEntry, locale: Locale): BlogIndexEntry {
  const { data, body } = entry;
  return {
    urlSlug: data.urlSlug,
    href: blogPostUrl(data.urlSlug, locale),
    title: data.title,
    summary: data.summary,
    date: data.date,
    dateLabel: formatDateShort(data.date, locale),
    tags: data.tags,
    thumbnail: data.video.thumbnail,
    thumbAlt: data.video.title,
    readingMinutes: readingMinutes(body ?? ''),
    search: normalizeSearch([data.title, data.summary, ...data.tags].join(' ')),
  };
}
