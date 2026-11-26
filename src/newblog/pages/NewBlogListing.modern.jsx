import React, { useEffect, useState, useMemo } from 'react';
import { Search, ArrowRight, Star } from 'lucide-react';
import {
  getAllPostsMetadata,
  searchPostsMetadata,
  preloadPost,
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';
import { Link as CustomLink } from '../../components/CustomLink';
import { buildAffiliateUrl } from '../../lib/utm-builder.js';
import { preloadModernFonts } from '../../lib/preloadModernFonts.js';
import topProductsData from '../../data/topProducts.json';
import '../../styles/theme-modern.css';
import '../../styles/blog-listing.css';

/**
 * NewBlogListing.modern — the /never-hungover library index (shipped arm of
 * flag "site-modern-v1").
 *
 * Editorial layout (blog design brief, Nov 2026): one paper ground, ink
 * headings, one green accent, orange only on the single buy button. The post
 * list is text-first (only ~1 in 5 posts has a hero image, so image cards were
 * mostly placeholders): a 3-column index on desktop that collapses to a
 * hairline-separated list on phones. Styles live in src/styles/blog-listing.css,
 * scoped to [data-blog="listing"].
 *
 * Contracts kept:
 *   - data sources: getAllPostsMetadata / searchPostsMetadata (no new pipeline)
 *   - SEO: useSEO(generatePageSEO('never-hungover'))
 *   - every card links to /never-hungover/<slug>
 *   - [data-testid="never-hungover-hero-modern"] on the page header
 *   - the rail CTA is a plain <a> with the data-* attributes the global
 *     affiliate listener reads; NO onClick (it would double-count)
 *   - list windowed to 60 cards with Load More; counts use the deduped total
 *   - design-spec hooks: [data-blog="listing"], .blog-card, .blog-card__title,
 *     .blog-card__excerpt
 */

const EXPERIMENT_KEY = 'site-modern-v1';
const PAGE_SIZE = 60;

// Topic filters: the most-used tags, merged case-insensitively. A tag that is on
// more than half of all posts ("DHM") filters nothing, so it is left out.
const TOPICS_SHOWN = 10;
const TOPICS_MORE = 30;

// readTime is a mix of integers, "18 min read", "Estimated 30-40 minutes", etc.
// Take the first positive integer; null when nothing usable is present.
const parseReadMinutes = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? Math.round(value) : null;
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      const minutes = parseInt(match[0], 10);
      return minutes > 0 ? minutes : null;
    }
  }
  return null;
};

// Preferred slugs for the single "Start here" feature, in priority order
// (CTA-bearing evergreen guides). Falls back to the newest post.
const FEATURED_SLUGS = [
  'dhm-dosage-guide-2025',
  'hangover-supplements-complete-guide-what-actually-works-2025',
  'dhm-safety-complete-guide-2025',
];

// Dates in words, day first ("29 July 2025"), per the brief.
const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

const titleCase = (tag) =>
  (tag.charAt(0).toUpperCase() + tag.slice(1)).replace(/\b(dhm|nad|aldh2|gaba)\b/gi, (m) => m.toUpperCase());

// The card's small label is its first tag that is one of the library's topics
// (a category such as "Medication safety"), not its own keyword, which would
// just repeat the title.
const topicLabel = (post, topics) => {
  const tag = (post.tags || []).find((t) => topics.includes(String(t).trim().toLowerCase()));
  return tag ? titleCase(String(tag).trim().toLowerCase()) : null;
};

const Meta = ({ post }) => {
  const minutes = parseReadMinutes(post.readTime);
  return (
    <p className="blog-meta">
      <time dateTime={post.date.toISOString().slice(0, 10)}>{formatDate(post.date)}</time>
      {minutes !== null && (
        <>
          <span aria-hidden="true"> · </span>
          {minutes}&nbsp;min read
        </>
      )}
    </p>
  );
};

const NewBlogListingModern = () => {
  useSEO(generatePageSEO('never-hungover'));

  useEffect(() => {
    preloadModernFonts();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]); // lower-case keys
  const [showMoreTopics, setShowMoreTopics] = useState(false);

  // Deduped once: the metadata index has had duplicate slugs before, which
  // would double-render a card and inflate the count.
  const allPosts = useMemo(() => {
    const seen = new Set();
    return getAllPostsMetadata().filter((post) => {
      const id = post.slug ?? post.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, []);

  const topics = useMemo(() => {
    const counts = new Map();
    for (const post of allPosts) {
      const keys = new Set((post.tags || []).map((t) => String(t).trim().toLowerCase()));
      for (const k of keys) {
        if (!k || /\d{4}/.test(k)) continue;
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 3 && n <= allPosts.length / 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOPICS_MORE)
      .map(([key]) => key);
  }, [allPosts]);

  const featuredPost = useMemo(() => {
    for (const slug of FEATURED_SLUGS) {
      const match = allPosts.find((p) => p.slug === slug);
      if (match) return match;
    }
    return allPosts[0];
  }, [allPosts]);

  const query = searchQuery.trim();

  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (query) {
      const hits = new Set(searchPostsMetadata(query).map((p) => p.slug));
      posts = posts.filter((p) => hits.has(p.slug));
    }
    if (selectedTopics.length > 0) {
      posts = posts.filter((post) =>
        (post.tags || []).some((t) => selectedTopics.includes(String(t).trim().toLowerCase()))
      );
    }
    return posts;
  }, [allPosts, query, selectedTopics]);

  const isBrowsing = !query && selectedTopics.length === 0;

  // Window the list: rendering all ~800 cards at once made the page ~480k px.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, selectedTopics]);
  const shown = Math.min(visibleCount, filteredPosts.length);
  const remaining = filteredPosts.length - shown;

  const toggleTopic = (key) => {
    setSelectedTopics((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopics([]);
  };

  const railProduct = topProductsData[0];
  const railComponentId = 'never-hungover-modern-hub-rail-cta';
  const railRating = Number(railProduct?.rating) || 0;

  const visibleTopics = topics.slice(0, showMoreTopics ? TOPICS_MORE : TOPICS_SHOWN);
  // A selected topic always stays visible, even when the list is collapsed.
  for (const key of selectedTopics) if (!visibleTopics.includes(key)) visibleTopics.push(key);

  const total = allPosts.length;

  return (
    <div className="theme-modern blog-listing" data-blog="listing">
      {/* ================================ HEADER ================================ */}
      <header data-testid="never-hungover-hero-modern" className="blog-listing__head">
        <div className="blog-listing__wrap">
          <p className="blog-label">The DHM Guide library</p>
          <h1 className="blog-listing__title">Never Hungover</h1>
          <p className="blog-listing__lead">
            Plain-English guides to hangovers, DHM and drinking more safely, checked against the
            published research.
          </p>
          <p className="blog-listing__count">
            <strong>{total.toLocaleString('en-US')}</strong> articles
          </p>

          {/* ============================ SEARCH + TOPICS ============================ */}
          <div className="blog-filters" role="search">
            <label htmlFor="blog-search" className="blog-filters__label">
              Search the library
            </label>
            <div className="blog-search">
              <Search aria-hidden="true" className="blog-search__icon" />
              <input
                id="blog-search"
                type="search"
                placeholder="Try “sleep”, “ibuprofen” or “DHM dosage”"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search__input"
                autoComplete="off"
              />
            </div>

            <p className="blog-filters__label" id="blog-topics-label">
              Popular topics
            </p>
            <div
              className={`blog-topics${showMoreTopics ? ' is-open' : ''}`}
              role="group"
              aria-labelledby="blog-topics-label"
            >
              {visibleTopics.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="blog-topic"
                  aria-pressed={selectedTopics.includes(key)}
                  onClick={() => toggleTopic(key)}
                >
                  {titleCase(key)}
                </button>
              ))}
              {topics.length > TOPICS_SHOWN && (
                <button
                  type="button"
                  className="blog-topic blog-topic--quiet"
                  aria-expanded={showMoreTopics}
                  onClick={() => setShowMoreTopics((v) => !v)}
                >
                  {showMoreTopics ? 'Fewer topics' : 'More topics'}
                </button>
              )}
            </div>

            <div className="blog-results" aria-live="polite">
              {!isBrowsing && (
                <>
                  <span>
                    {filteredPosts.length.toLocaleString('en-US')}{' '}
                    {filteredPosts.length === 1 ? 'article' : 'articles'}
                    {query && <> matching “{query}”</>}
                    {selectedTopics.length > 0 && (
                      <> in {selectedTopics.map(titleCase).join(', ')}</>
                    )}
                  </span>
                  <button type="button" className="blog-link-button" onClick={clearFilters}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================ START HERE ============================ */}
      {isBrowsing && featuredPost && (
        <section className="blog-section" aria-labelledby="blog-start-here">
          <div className="blog-listing__wrap">
            <h2 id="blog-start-here" className="blog-section__title">Start here</h2>
            <CustomLink
              to={`/never-hungover/${featuredPost.slug}`}
              className={`blog-feature${featuredPost.image ? '' : ' blog-feature--text'}`}
              onMouseEnter={() => preloadPost(featuredPost.slug)}
            >
              {featuredPost.image && (
                <div className="blog-feature__media">
                  <img
                    src={featuredPost.image}
                    alt=""
                    width="1200"
                    height="675"
                    fetchPriority="high"
                  />
                </div>
              )}
              <div className="blog-feature__body">
                {topicLabel(featuredPost, topics) && (
                  <p className="blog-label">{topicLabel(featuredPost, topics)}</p>
                )}
                <h3 className="blog-feature__title">{featuredPost.title}</h3>
                <p className="blog-feature__excerpt">{featuredPost.excerpt}</p>
                <Meta post={featuredPost} />
                <span className="blog-feature__more">
                  Read the guide <ArrowRight aria-hidden="true" />
                </span>
              </div>
            </CustomLink>
          </div>
        </section>
      )}

      {/* ============================ PRODUCT RAIL ============================
          The one buy button on the page. In-flow, never sticky; browse state only. */}
      {isBrowsing && railProduct && (
        <aside className="blog-section blog-section--tight" aria-label="Our top-rated DHM supplement">
          <div className="blog-listing__wrap">
            <div className="blog-rail">
              <div className="blog-rail__text">
                <p className="blog-label">Our top-rated DHM supplement</p>
                <h3 className="blog-rail__name">{railProduct.name}</h3>
                <p className="blog-rail__meta">
                  <span className="stars" role="img" aria-label={`Rated ${railRating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => i < Math.round(railRating)).map((filled, i) => (
                      <Star
                        key={i}
                        aria-hidden="true"
                        style={
                          filled
                            ? { fill: 'currentColor', stroke: 'currentColor' }
                            : { fill: 'none', color: 'var(--color-rule, #E7E3DB)' }
                        }
                      />
                    ))}
                  </span>
                  <span>
                    {railRating} from {(railProduct.reviews ?? 0).toLocaleString('en-US')} reviews ·{' '}
                    {railProduct.price}
                  </span>
                </p>
              </div>
              <a
                className="btn btn-cta btn-lg"
                href={buildAffiliateUrl(railProduct.affiliateLink, {
                  componentId: railComponentId,
                  experimentKey: EXPERIMENT_KEY,
                  variant: 'modern',
                })}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                data-experiment-key={EXPERIMENT_KEY}
                data-variant="modern"
                data-component-id={railComponentId}
                data-placement="hub_product_rail"
                data-product-name={railProduct.name}
              >
                Check Price on Amazon
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* ============================== ALL ARTICLES ============================== */}
      <section
        className={`blog-section${isBrowsing ? '' : ' blog-section--tight'}`}
        aria-labelledby="blog-all"
      >
        <div className="blog-listing__wrap">
          <h2 id="blog-all" className={isBrowsing ? 'blog-section__title' : 'sr-only'}>
            {isBrowsing ? 'All articles' : 'Results'}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <p className="blog-empty__title">
                {query ? <>Nothing in the library matches “{query}”.</> : 'No articles in that combination of topics.'}
              </p>
              <p className="blog-empty__text">
                Try a shorter word, check the spelling, or start from one of these.
              </p>
              <ul className="blog-empty__links">
                {FEATURED_SLUGS.map((slug) => allPosts.find((p) => p.slug === slug))
                  .filter(Boolean)
                  .map((post) => (
                    <li key={post.slug}>
                      <CustomLink to={`/never-hungover/${post.slug}`}>{post.title}</CustomLink>
                    </li>
                  ))}
              </ul>
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                Show all {total.toLocaleString('en-US')} articles
              </button>
            </div>
          ) : (
            <ul className="blog-grid">
              {filteredPosts.slice(0, shown).map((post) => {
                const label = topicLabel(post, topics);
                return (
                  <li key={post.slug ?? post.id} className="blog-card">
                    <CustomLink
                      to={`/never-hungover/${post.slug}`}
                      className="blog-card__link"
                      onMouseEnter={() => preloadPost(post.slug)}
                    >
                      {label && <p className="blog-label">{label}</p>}
                      <h3 className="blog-card__title">{post.title}</h3>
                      {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
                      <Meta post={post} />
                    </CustomLink>
                  </li>
                );
              })}
            </ul>
          )}

          {filteredPosts.length > 0 && (
            <div className="blog-more">
              <p className="blog-more__count">
                Showing {shown.toLocaleString('en-US')} of {filteredPosts.length.toLocaleString('en-US')}{' '}
                {filteredPosts.length === 1 ? 'article' : 'articles'}
              </p>
              {remaining > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Load more articles ({remaining.toLocaleString('en-US')} remaining)
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewBlogListingModern;
