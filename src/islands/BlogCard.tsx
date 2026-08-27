import type { BlogIndexEntry } from '../utils/blog';

export interface BlogCardLabels {
  typeStamp: string;
  readMore: string;
  minutes: string;
  thumbAlt: string;
}

interface Props {
  post: BlogIndexEntry;
  /** Número impresso no cabeçalho do punch-card. O post mais recente leva o maior. */
  number: number;
  labels: BlogCardLabels;
}

export default function BlogCard({ post, number, labels }: Props) {
  return (
    <article class="blog-card vintage-card card-edge-holes">
      <div class="blog-card-head">
        <div class="blog-card-holes" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} class="punch-hole" />
          ))}
        </div>
        <span class="blog-card-num">#{String(number).padStart(3, '0')}</span>
      </div>

      <div class="blog-card-thumb">
        <img
          src={post.thumbnail}
          alt={`${labels.thumbAlt}: ${post.thumbAlt}`}
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
        />
        <span class="blog-card-play" aria-hidden="true" />
      </div>

      <div class="blog-card-body">
        <div class="blog-card-meta">
          <time datetime={post.date}>{post.dateLabel}</time>
          <span class="ink-stamp blog-card-stamp">{labels.typeStamp}</span>
        </div>

        <h2 class="blog-card-title crt-glow">
          <a href={post.href} class="blog-card-link">{post.title}</a>
        </h2>

        <p class="blog-card-summary">{post.summary}</p>

        {post.tags.length > 0 && (
          <ul class="blog-card-tags" role="list">
            {post.tags.map((tag) => (
              <li key={tag} class="blog-card-tag">#{tag}</li>
            ))}
          </ul>
        )}
      </div>

      <div class="blog-card-foot">
        <span>{post.readingMinutes} {labels.minutes}</span>
        <span class="blog-card-cta" aria-hidden="true">{labels.readMore} →</span>
      </div>
    </article>
  );
}
