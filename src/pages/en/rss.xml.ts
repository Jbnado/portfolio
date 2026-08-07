import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { t } from '../../i18n/utils';
import { getBlogPosts } from '../../utils/blog-content';
import { SITE_URL, blogPostUrl } from '../../utils/constants';

const LOCALE = 'en' as const;

export const GET: APIRoute = async () => {
  const posts = await getBlogPosts(LOCALE);
  return rss({
    title: t('blog.seoTitle', LOCALE),
    description: t('blog.seoDescription', LOCALE),
    site: SITE_URL,
    trailingSlash: false,
    customData: '<language>en</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      // pubDate exige Date. Fixamos meio-dia UTC pra a data não escorregar
      // pro dia anterior em nenhum fuso do hemisfério ocidental.
      pubDate: new Date(`${post.data.date}T12:00:00Z`),
      link: blogPostUrl(post.data.urlSlug, LOCALE),
      categories: post.data.tags,
    })),
  });
};
