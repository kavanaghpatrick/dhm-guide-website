/**
 * Page Tracking Hook
 *
 * Enriches PostHog pageviews with content metadata (blog post info, page type, etc.)
 * Sets super properties that attach to all subsequent events on the page.
 */
import { useEffect } from 'react';
import { enrichPageview } from '../lib/posthog';

/**
 * Hook to enrich pageview with content metadata
 *
 * @param {Object} metadata - Content metadata to attach
 * @param {string} metadata.postSlug - Blog post slug (for blog pages)
 * @param {string} metadata.postCategory - Content category
 * @param {string[]} metadata.tags - Content tags
 * @param {number} metadata.wordCount - Approximate word count
 * @param {boolean} metadata.hasAffiliateLinks - Whether page has affiliate links
 */
export function usePageTracking(metadata = {}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Defer to next tick to ensure PostHog is initialized
    const timer = setTimeout(() => {
      try {
        enrichPageview({
          post_slug: metadata.postSlug,
          post_category: metadata.postCategory,
          tags: metadata.tags?.join(','),
          word_count: metadata.wordCount,
          has_affiliate_links: metadata.hasAffiliateLinks,
          referrer_domain: getReferrerDomain(),
          is_organic_search: isOrganicSearch()
        });
      } catch (error) {
        // Silently fail
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [
    metadata.postSlug,
    metadata.postCategory,
    metadata.wordCount,
    metadata.hasAffiliateLinks
  ]);
}

/**
 * Extract domain from referrer
 */
function getReferrerDomain() {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  try {
    const url = new URL(document.referrer);
    return url.hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Check if referrer is organic search
 */
function isOrganicSearch() {
  const referrer = getReferrerDomain();
  const searchEngines = ['google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'baidu.com'];
  return searchEngines.some(engine => referrer.includes(engine));
}

export default usePageTracking;
