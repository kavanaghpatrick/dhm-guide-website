/**
 * Shared OG image fallback resolver for blog posts.
 *
 * Consumed by:
 *   - src/hooks/useSEO.js (client-side runtime SEO)
 *   - scripts/prerender-blog-posts-enhanced.js (build-time prerender)
 *
 * Both must produce the same URL for the same post — see issue #344 AC-4.4.
 */

export const DEFAULT_OG_IMAGE = '/og-image.jpg';

const RULES = [
  {
    matchTags: ['hangover-prevention', 'hangover-cure', 'hangover prevention', 'hangover cure'],
    image: '/dhm-hangover-prevention.webp',
  },
];

/**
 * Returns the OG image path for a post.
 * - If post has an explicit `image`, returns it (caller is responsible for prepending baseUrl).
 * - Else matches post.tags against RULES (case-insensitive substring match, first match wins).
 * - Else returns DEFAULT_OG_IMAGE.
 *
 * @param {{image?: string|null, tags?: string[]}} post
 * @returns {string}
 */
export function getOgImageForPost(post) {
  if (post && typeof post.image === 'string' && post.image.length > 0) {
    return post.image;
  }
  const tags = Array.isArray(post?.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];
  for (const rule of RULES) {
    for (const matchTag of rule.matchTags) {
      const needle = matchTag.toLowerCase();
      if (tags.some(t => t.includes(needle))) {
        return rule.image;
      }
    }
  }
  return DEFAULT_OG_IMAGE;
}
