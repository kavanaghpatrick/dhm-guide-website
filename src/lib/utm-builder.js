/**
 * UTM Builder for outbound affiliate URLs (P0.1)
 *
 * Wraps Amazon (and other) affiliate URLs with utm_* params so we can
 * attribute clicks to specific components and A/B variants downstream
 * in Amazon Associates reporting + our analytics.
 *
 * IMPORTANT: This DOES NOT touch `tag=` (Amazon Associates ID). That
 * parameter is the source of revenue attribution and must stay exactly
 * as embedded in the source URL. We only add utm_* params alongside it.
 *
 * NOTE: Written as .js (with JSDoc types) so it works in both Vite
 * (browser) and Node ESM (prerender pipeline imports productSchema-
 * Generator, which imports this).
 */

/**
 * @typedef {Object} BuildAffiliateUrlOptions
 * @property {string} componentId - Stable component identifier
 * @property {string|null} [experimentKey] - Active experiment key (null when not in experiment)
 * @property {string|null} [variant] - Variant name ('control' if omitted with experimentKey set)
 */

/**
 * Build an outbound affiliate URL with utm_* attribution params.
 *
 * - Sets utm_source=dhmguide, utm_medium=affiliate, utm_content=<componentId>
 * - If experimentKey: utm_campaign=<experimentKey>__<variant ?? 'control'>
 * - Preserves all existing query params (including `tag=`)
 * - On parse failure (relative URL, junk input): returns rawUrl unchanged
 *
 * Safe to call with any string — never throws.
 *
 * @param {string} rawUrl
 * @param {BuildAffiliateUrlOptions} opts
 * @returns {string}
 */
export function buildAffiliateUrl(rawUrl, opts) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    // Relative URL or garbage — return unmodified rather than crash
    return rawUrl;
  }

  url.searchParams.set('utm_source', 'dhmguide');
  url.searchParams.set('utm_medium', 'affiliate');
  url.searchParams.set('utm_content', opts.componentId);

  if (opts.experimentKey) {
    const variantPart = opts.variant ?? 'control';
    url.searchParams.set(
      'utm_campaign',
      `${opts.experimentKey}__${variantPart}`
    );
  }

  return url.toString();
}

/**
 * Canonical source-of-truth IDs for INTERNAL link UTMs (e.g. CTAs pointing
 * to /reviews, /compare, /guide). Use these as `utm_source` when building
 * internal cross-page tracking URLs. NOTE: these are utm_SOURCE values, not
 * componentIds — keep them stable since they appear in PostHog filters.
 *
 * @type {Readonly<{
 *   BLOG_FOOTER_CTA: 'blog-footer-cta',
 *   BLOG_INLINE_CTA: 'blog-inline-cta',
 *   STICKY_BAR: 'sticky-bar',
 *   HUB_NAV: 'hub-nav',
 *   MEGA_MENU_FEATURED: 'mega-menu-featured',
 *   QUIZ_RESULT: 'quiz-result',
 *   RETURN_VISITOR_RECALL: 'return-visitor-recall',
 * }>}
 */
export const INTERNAL_UTM_SOURCES = Object.freeze({
  BLOG_FOOTER_CTA: 'blog-footer-cta',
  BLOG_INLINE_CTA: 'blog-inline-cta',
  STICKY_BAR: 'sticky-bar',
  HUB_NAV: 'hub-nav',
  MEGA_MENU_FEATURED: 'mega-menu-featured',
  QUIZ_RESULT: 'quiz-result',
  RETURN_VISITOR_RECALL: 'return-visitor-recall',
});

/**
 * @typedef {typeof INTERNAL_UTM_SOURCES[keyof typeof INTERNAL_UTM_SOURCES]} InternalUtmSource
 */
