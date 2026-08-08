import type { APIRoute } from 'astro';
import { LOCALES, type Locale } from '../../utils/constants';
import { getBlogPosts, toIndexEntry } from '../../utils/blog-content';

export function getStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale as Locale;
  const posts = await getBlogPosts(locale);
  const index = posts.map((post) => toIndexEntry(post, locale));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
