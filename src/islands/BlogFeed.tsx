import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import BlogCard, { type BlogCardLabels } from './BlogCard';
import { matchesQuery, type BlogIndexEntry } from '../utils/blog';

export interface BlogFeedLabels extends BlogCardLabels {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  resultsOne: string;
  /** Contém o marcador {count}. */
  resultsMany: string;
  /** Contém o marcador {query}. */
  noResults: string;
  loadMore: string;
  loading: string;
  endOfList: string;
}

interface Props {
  /** Primeira página, já renderizada no HTML do build. */
  initial: BlogIndexEntry[];
  total: number;
  indexUrl: string;
  perPage: number;
  labels: BlogFeedLabels;
}

export default function BlogFeed({ initial, total, indexUrl, perPage, labels }: Props) {
  // Só vira true depois da hidratação. Antes disso o campo de busca fica escondido,
  // porque campo que não filtra nada é pior que campo nenhum.
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(initial.length);
  const [all, setAll] = useState<BlogIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery) setQuery(initialQuery);
  }, []);

  /** O índice completo só é buscado quando alguém digita ou rola. */
  const loadIndex = useCallback(async () => {
    if (all || loading) return;
    setLoading(true);
    try {
      const res = await fetch(indexUrl);
      if (!res.ok) throw new Error(String(res.status));
      setAll(await res.json());
    } catch {
      // Falhou a rede. Fica com o que já veio no HTML e com a paginação do rodapé.
      setAll(initial);
    } finally {
      setLoading(false);
    }
  }, [all, loading, indexUrl, initial]);

  // Busca o índice assim que a URL já chega com ?q=, senão a busca inicial
  // filtraria só a primeira página.
  useEffect(() => {
    if (ready && query.trim() && !all) void loadIndex();
  }, [ready, query, all, loadIndex]);

  // Sincroniza ?q= com a URL, sem empilhar histórico a cada tecla.
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  }, [query, ready]);

  const pool = all ?? initial;
  const searching = query.trim().length > 0;
  const results = searching ? pool.filter((p) => matchesQuery(p, query)) : pool;
  const shown = searching ? results : results.slice(0, visible);
  const hasMore = !searching && visible < total;

  const loadMore = useCallback(async () => {
    if (!all) await loadIndex();
    setVisible((v) => v + perPage);
  }, [all, loadIndex, perPage]);

  // Sentinela do scroll infinito.
  useEffect(() => {
    if (!ready || !hasMore || !sentinel.current) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const node = sentinel.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, hasMore, loadMore]);

  const onInput = (e: Event) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const countLabel = results.length === 1
    ? labels.resultsOne
    : labels.resultsMany.replace('{count}', String(results.length));

  return (
    <>
      <div class="blog-search" hidden={!ready}>
        <label class="blog-search-label" for="blog-search-input">{labels.searchLabel}</label>
        <div class="blog-search-field">
          <input
            id="blog-search-input"
            type="search"
            class="blog-search-input"
            placeholder={labels.searchPlaceholder}
            value={query}
            onInput={onInput}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              class="blog-search-clear"
              onClick={() => setQuery('')}
              aria-label={labels.clearSearch}
            >
              ×
            </button>
          )}
        </div>
        <p class="blog-search-count" aria-live="polite">{searching ? countLabel : ''}</p>
      </div>

      {shown.length === 0 ? (
        <p class="blog-empty">{labels.noResults.replace('{query}', query)}</p>
      ) : (
        <div class="blog-grid">
          {shown.map((post) => (
            <BlogCard
              key={post.urlSlug}
              post={post}
              number={total - pool.indexOf(post)}
              labels={labels}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div class="blog-more">
          <div ref={sentinel} aria-hidden="true" />
          <button
            type="button"
            class="blog-more-btn"
            onClick={() => void loadMore()}
            disabled={loading}
          >
            {loading ? labels.loading : labels.loadMore}
          </button>
        </div>
      )}

      {ready && !hasMore && !searching && total > perPage && (
        <p class="blog-end" aria-hidden="true">{labels.endOfList}</p>
      )}
    </>
  );
}
