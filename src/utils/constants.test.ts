import { describe, it, expect } from 'vitest';
import {
  localePrefix,
  blogUrl,
  blogPostUrl,
  blogPageUrl,
  blogIndexUrl,
  rssUrl,
} from './constants';

describe('localePrefix', () => {
  it('nao prefixa o idioma padrao', () => {
    expect(localePrefix('pt-br')).toBe('');
  });

  it('prefixa os demais idiomas', () => {
    expect(localePrefix('en')).toBe('/en');
    expect(localePrefix('es')).toBe('/es');
  });
});

describe('blogUrl', () => {
  it('monta a raiz do blog em cada idioma', () => {
    expect(blogUrl('pt-br')).toBe('/blog');
    expect(blogUrl('en')).toBe('/en/blog');
    expect(blogUrl('es')).toBe('/es/blog');
  });

  it('usa pt-br quando o idioma nao e informado', () => {
    expect(blogUrl()).toBe('/blog');
  });
});

describe('blogPostUrl', () => {
  it('usa o urlSlug daquele idioma', () => {
    expect(blogPostUrl('meu-post', 'pt-br')).toBe('/blog/meu-post');
    expect(blogPostUrl('my-post', 'en')).toBe('/en/blog/my-post');
    expect(blogPostUrl('mi-post', 'es')).toBe('/es/blog/mi-post');
  });
});

describe('blogPageUrl', () => {
  it('devolve a raiz do blog na pagina 1, sem /pagina/1', () => {
    expect(blogPageUrl(1, 'pt-br')).toBe('/blog');
    expect(blogPageUrl(1, 'en')).toBe('/en/blog');
  });

  it('trata pagina 0 e negativa como pagina 1', () => {
    expect(blogPageUrl(0, 'pt-br')).toBe('/blog');
    expect(blogPageUrl(-3, 'pt-br')).toBe('/blog');
  });

  it('usa o segmento traduzido a partir da pagina 2', () => {
    expect(blogPageUrl(2, 'pt-br')).toBe('/blog/pagina/2');
    expect(blogPageUrl(3, 'en')).toBe('/en/blog/page/3');
    expect(blogPageUrl(2, 'es')).toBe('/es/blog/pagina/2');
  });
});

describe('blogIndexUrl e rssUrl', () => {
  it('monta o indice de busca por idioma', () => {
    expect(blogIndexUrl('pt-br')).toBe('/blog-index/pt-br.json');
    expect(blogIndexUrl('en')).toBe('/blog-index/en.json');
  });

  it('monta o rss por idioma', () => {
    expect(rssUrl('pt-br')).toBe('/rss.xml');
    expect(rssUrl('en')).toBe('/en/rss.xml');
    expect(rssUrl('es')).toBe('/es/rss.xml');
  });
});
