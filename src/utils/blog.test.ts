import { describe, it, expect } from 'vitest';
import {
  POSTS_PER_PAGE,
  normalizeSearch,
  readingMinutes,
  formatDateShort,
  formatDateLong,
  matchesQuery,
  paginate,
  type BlogIndexEntry,
} from './blog';

describe('normalizeSearch', () => {
  it('tira acento e caixa', () => {
    expect(normalizeSearch('Segurança')).toBe('seguranca');
    expect(normalizeSearch('AÇÃO É ótimo')).toBe('acao e otimo');
  });

  it('tira espaco das pontas', () => {
    expect(normalizeSearch('  ia  ')).toBe('ia');
  });
});

describe('readingMinutes', () => {
  it('conta 200 palavras por minuto', () => {
    expect(readingMinutes(Array(400).fill('palavra').join(' '))).toBe(2);
  });

  it('nunca devolve menos de 1', () => {
    expect(readingMinutes('curto')).toBe(1);
    expect(readingMinutes('')).toBe(1);
  });
});

describe('formatDateShort', () => {
  it('nao desloca o dia por causa de fuso', () => {
    // O bug que isso previne: new Date('2026-08-04') vira meia-noite UTC,
    // e em UTC-3 o toLocaleDateString mostraria 03/08.
    expect(formatDateShort('2026-08-04', 'pt-br')).toBe('04 AGO 2026');
  });

  it('usa a ordem de cada idioma', () => {
    expect(formatDateShort('2026-08-04', 'en')).toBe('AUG 04, 2026');
    expect(formatDateShort('2026-01-31', 'es')).toBe('31 ENE 2026');
  });
});

describe('formatDateLong', () => {
  it('escreve por extenso sem zero a esquerda', () => {
    expect(formatDateLong('2026-08-04', 'pt-br')).toBe('4 de agosto de 2026');
    expect(formatDateLong('2026-08-04', 'en')).toBe('August 4, 2026');
    expect(formatDateLong('2026-08-04', 'es')).toBe('4 de agosto de 2026');
  });
});

const entry: BlogIndexEntry = {
  urlSlug: 'a-ia-invadiu-uma-empresa-de-verdade',
  href: '/blog/a-ia-invadiu-uma-empresa-de-verdade',
  title: 'IA Hackeou uma empresa sem ninguém pedir',
  summary: 'Oito zero-days encadeados e cinco dias dentro da infraestrutura.',
  date: '2026-08-04',
  dateLabel: '04 AGO 2026',
  tags: ['ia', 'segurança', 'agentes'],
  thumbnail: 'https://i.ytimg.com/vi/FUw31kGR3No/maxresdefault.jpg',
  thumbAlt: 'IA Hackeou uma empresa sem ninguem pedir',
  readingMinutes: 8,
  search: normalizeSearch(
    'IA Hackeou uma empresa sem ninguém pedir Oito zero-days encadeados e cinco dias dentro da infraestrutura. ia segurança agentes',
  ),
};

describe('matchesQuery', () => {
  it('acha sem acento o que foi escrito com acento', () => {
    expect(matchesQuery(entry, 'seguranca')).toBe(true);
  });

  it('acha por tag e por trecho do resumo', () => {
    expect(matchesQuery(entry, 'agentes')).toBe(true);
    expect(matchesQuery(entry, 'zero-days')).toBe(true);
  });

  it('exige que todos os termos casem', () => {
    expect(matchesQuery(entry, 'ia empresa')).toBe(true);
    expect(matchesQuery(entry, 'ia kubernetes')).toBe(false);
  });

  it('busca vazia casa com tudo', () => {
    expect(matchesQuery(entry, '')).toBe(true);
    expect(matchesQuery(entry, '   ')).toBe(true);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('usa 10 por pagina por padrao', () => {
    expect(POSTS_PER_PAGE).toBe(10);
    expect(paginate(items, 1).items).toHaveLength(10);
  });

  it('corta a ultima pagina no que sobra', () => {
    const p = paginate(items, 3);
    expect(p.items).toEqual([21, 22, 23, 24, 25]);
    expect(p.totalPages).toBe(3);
    expect(p.hasNext).toBe(false);
    expect(p.hasPrev).toBe(true);
  });

  it('prende a pagina dentro do intervalo valido', () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
  });

  it('lista vazia ainda tem 1 pagina', () => {
    const p = paginate([], 1);
    expect(p.totalPages).toBe(1);
    expect(p.total).toBe(0);
    expect(p.items).toEqual([]);
  });
});
