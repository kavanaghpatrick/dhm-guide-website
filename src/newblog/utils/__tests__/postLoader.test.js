import { describe, it, expect } from 'vitest';
import { getRelatedPostsMetadata, getAllPostsMetadata } from '../postLoader';

describe('getRelatedPostsMetadata', () => {
  const [a, b, c] = getAllPostsMetadata();

  it('puts curated post.relatedPosts first, in order', () => {
    const post = { slug: 'x', tags: [], relatedPosts: [c.slug, a.slug] };
    expect(getRelatedPostsMetadata(post, 3).map((p) => p.slug).slice(0, 2)).toEqual([c.slug, a.slug]);
  });

  it('skips unknown curated slugs and fills the rest from tag overlap', () => {
    const post = { slug: 'x', tags: b.tags, relatedPosts: ['no-such-post', a.slug] };
    const slugs = getRelatedPostsMetadata(post, 3).map((p) => p.slug);
    expect(slugs[0]).toBe(a.slug);
    expect(slugs).toHaveLength(3);
    expect(new Set(slugs).size).toBe(3);
  });

  it('falls back to tag overlap when no curated list exists', () => {
    const post = { slug: 'x', tags: b.tags };
    expect(getRelatedPostsMetadata(post, 3).length).toBeGreaterThan(0);
  });
});
