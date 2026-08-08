import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { t } from '../i18n/utils';
import { getBlogPosts } from '../utils/blog-content';
import { SITE_URL, caseStudyUrl, blogPostUrl, blogUrl, rssUrl } from '../utils/constants';

const LOCALE = 'pt-br' as const;

/**
 * Índice do site em texto, na convenção llms.txt.
 *
 * Gerado a partir das mesmas collections que alimentam as páginas, nunca
 * escrito à mão. Um arquivo estático aqui envelheceria na primeira publicação
 * e passaria a mentir sobre o que o site tem.
 */
export const GET: APIRoute = async () => {
  const projectEntries = await getCollection('projects');
  const items = projectEntries[0].data.items;
  const posts = await getBlogPosts(LOCALE);

  const lines: string[] = [];

  lines.push('# João Bernardo — Fullstack Developer');
  lines.push('');
  lines.push(`> ${t('hero.description', LOCALE)}`);
  lines.push('');
  lines.push(
    'Portfolio pessoal e blog técnico. O site existe em três idiomas: português do Brasil ' +
    `em ${SITE_URL}/, inglês em ${SITE_URL}/en/ e espanhol em ${SITE_URL}/es/. ` +
    'As páginas abaixo são as versões em português; cada uma declara suas traduções por hreflang.',
  );
  lines.push('');

  const bySection = [
    { type: 'project' as const, heading: '## Projetos' },
    { type: 'contribution' as const, heading: '## Contribuições' },
  ];

  for (const { type, heading } of bySection) {
    const group = items.filter((i) => i.type === type);
    if (group.length === 0) continue;
    lines.push(heading);
    lines.push('');
    for (const item of group) {
      const entry =
        (await getEntry('caseStudies', `${item.id}.${LOCALE}`)) ??
        (await getEntry('caseStudies', `${item.id}.pt-br`));
      const url = `${SITE_URL}${caseStudyUrl(type, item.id, LOCALE)}`;
      const summary = entry?.data.summary ?? item.description[LOCALE];
      lines.push(`- [${entry?.data.title ?? item.title[LOCALE]}](${url}): ${summary}`);
      lines.push(`  Stack: ${item.techStack.join(', ')}.`);
    }
    lines.push('');
  }

  lines.push('## Blog');
  lines.push('');
  lines.push(
    `Cada vídeo do canal Jbnado vira um texto aqui, mais técnico que o vídeo e com as fontes. ` +
    `Índice em ${SITE_URL}${blogUrl(LOCALE)}, feed RSS em ${SITE_URL}${rssUrl(LOCALE)}.`,
  );
  lines.push('');
  if (posts.length === 0) {
    lines.push('- Nenhum post publicado ainda.');
  } else {
    for (const post of posts) {
      const url = `${SITE_URL}${blogPostUrl(post.data.urlSlug, LOCALE)}`;
      lines.push(`- [${post.data.title}](${url}) — ${post.data.date}: ${post.data.summary}`);
    }
  }
  lines.push('');

  lines.push('## Links');
  lines.push('');
  lines.push('- [GitHub](https://github.com/Jbnado)');
  lines.push('- [LinkedIn](https://linkedin.com/in/jbnado)');
  lines.push('- [Canal no YouTube](https://www.youtube.com/@jbnad)');
  lines.push(`- [Currículo em PDF](${SITE_URL}/Bernardo-CV.pdf)`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
