import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  Search,
  Filter,
  ArrowRight,
  FlaskConical,
  BookOpen,
  Sparkles,
  ShoppingCart,
  Star,
} from 'lucide-react';
import {
  getAllPostsMetadata,
  getAllTags,
  searchPostsMetadata,
  preloadPost,
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';
import { Link as CustomLink } from '../../components/CustomLink';
import { buildAffiliateUrl } from '../../lib/utm-builder.js';
import { preloadModernFonts } from '../../lib/preloadModernFonts.js';
import topProductsData from '../../data/topProducts.json';
import '../../styles/theme-modern.css';

/**
 * NewBlogListing.modern — the "modern" arm of the /never-hungover A/B test
 * (flag key: "never-hungover-modern-v1"). A flag-gated restyle of the CONTROL
 * hub page (src/newblog/pages/NewBlogListing.jsx), built on the approved 2026
 * design language (docs/design-modernization-2026-06-25/recommendations/
 * never-hungover.md): warm paper palette, Fraunces display headings in SOLID
 * ink (no gradient clip-text), border-first cards, and a single saturated orange
 * reserved exclusively for the affiliate CTA.
 *
 * Reuse contract with CONTROL:
 *   - Same data sources (getAllPostsMetadata / getAllTags / searchPostsMetadata)
 *     — no new data pipeline.
 *   - Same state + filter/search logic copied verbatim from NewBlogListing.jsx.
 *   - Same SEO: useSEO(generatePageSEO('never-hungover')).
 *   - Same internal links (/never-hungover/<slug>) preserved on every card.
 *
 * Isolation contract:
 *   - The ENTIRE page body is wrapped in <div className="theme-modern"> and the
 *     scoped stylesheet src/styles/theme-modern.css is imported here so the
 *     modern CSS is code-split into this chunk — CONTROL users pay nothing.
 *   - preloadModernFonts() runs on mount (variant arm only).
 *
 * Page-specific modernization moves applied (per the recommendation doc, v1
 * bundle only — fonts/count-up/virtualization deliberately excluded):
 *   #1 Foundation: warm paper + solid-ink H1 with ONE green accent word.
 *   #2 Featured hero: ONE editor's-pick card routing to a CTA-bearing article.
 *   #3 Card re-tier: border-first cards, hover-only lift, neutral/brand-soft chips.
 *   #6 Desktop product rail: ONE orange "Check Price on Amazon" module above the
 *      grid — net-new DESKTOP affiliate surface (control has none; the sticky bar
 *      is md:hidden). Reuses topProducts[0] + buildAffiliateUrl.
 *
 * Affiliate CTA contract: the rail CTA is a plain <a> with the
 * data-experiment-key / data-variant / data-component-id attributes the global
 * listener (src/hooks/useAffiliateTracking.js) reads. There is NO onClick — the
 * listener fires affiliate_link_click, so adding one would double-count.
 */

const EXPERIMENT_KEY = 'never-hungover-modern-v1';

// Preferred slugs for the single Editor's Pick hero, in priority order. These are
// CTA-bearing evergreen articles (the conversion job of the hub is to route
// readers into pages where the sticky CTA lives). Falls back to the newest post
// if none of these exist in the corpus, so the hero can never render empty.
const FEATURED_SLUGS = [
  'dhm-dosage-guide-2025',
  'hangover-supplements-complete-guide-what-actually-works-2025',
  'dhm-safety-complete-guide-2025',
];

const NewBlogListingModern = () => {
  // SEO optimization — same source of truth as CONTROL.
  useSEO(generatePageSEO('never-hungover'));

  // Variant arm only: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts();
  }, []);

  // State management (copied verbatim from CONTROL).
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Load metadata instantly (no dynamic imports needed) — same data source.
  const allPosts = useMemo(() => getAllPostsMetadata(), []);
  const allTags = useMemo(() => getAllTags(), []);

  // Featured Editor's Pick — derived from the SAME metadata source (no new
  // pipeline). Pick the first preferred CTA-bearing slug present, else newest.
  const featuredPost = useMemo(() => {
    for (const slug of FEATURED_SLUGS) {
      const match = allPosts.find((p) => p.slug === slug);
      if (match) return match;
    }
    return allPosts[0];
  }, [allPosts]);

  // Filter posts based on search and tags (copied verbatim from CONTROL).
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    if (searchQuery.trim()) {
      posts = searchPostsMetadata(searchQuery.trim());
    }

    if (selectedTags.length > 0) {
      posts = posts.filter((post) =>
        selectedTags.some((tag) => post.tags?.includes(tag))
      );
    }

    // Dedupe by slug: the metadata index contains a few duplicate entries, which
    // would otherwise render the same article twice and trigger duplicate React keys.
    const seen = new Set();
    return posts.filter((post) => {
      const id = post.slug ?? post.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [allPosts, searchQuery, selectedTags]);

  // Whether the hub is in its "browsing" (unfiltered) state — the featured hero
  // + product rail only show when the reader hasn't started searching/filtering,
  // so a narrowed result set isn't visually buried under promo blocks.
  const isBrowsing = !searchQuery.trim() && selectedTags.length === 0;

  // Preload post on hover (copied verbatim from CONTROL).
  const handlePostHover = (slug) => {
    preloadPost(slug);
  };

  // Tag management (copied verbatim from CONTROL).
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // The single product surfaced in the desktop rail — reuse the #1 pick from the
  // shared topProducts data (same source the sticky bar uses). One product only.
  const railProduct = topProductsData[0];
  const railComponentId = 'never-hungover-modern-hub-rail-cta';
  const railRating = Number(railProduct?.rating) || 0;

  return (
    <div
      className="theme-modern"
      style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {/* ============================ HERO / HEADER ============================ */}
      <section
        data-testid="never-hungover-hero-modern"
        className="surface-wash"
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingBlock: 'var(--section-y)',
        }}
      >
        <div className="container">
          <header className="section-head section-head--center" style={{ marginBottom: 'var(--space-12)' }}>
            <span className="eyebrow">The Never Hungover library</span>

            {/* #1 — solid-ink H1 (no gradient clip-text), ONE green accent word. */}
            <h1 style={{ marginBottom: 'var(--space-4)' }}>
              Never <span className="accent">Hungover</span>
            </h1>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Master the science of hangover prevention. Expert guides, proven
              strategies, and cutting-edge research to help you never wake up
              hungover again.
            </p>

            {/* #5 (simplified) — designed trust strip, no looping pulse dot. */}
            <div
              className="trust-row"
              style={{ justifyContent: 'center', marginTop: 'var(--space-8)' }}
            >
              <span className="trust-row__item">
                <BookOpen aria-hidden="true" />
                <strong>{allPosts.length}</strong>&nbsp;expert articles
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <Clock aria-hidden="true" />
                <strong>12&nbsp;min</strong>&nbsp;average read
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <FlaskConical aria-hidden="true" />
                Science-backed content
              </span>
            </div>
          </header>

          {/* ===================== SEARCH + FILTERS ===================== */}
          <div style={{ maxWidth: '56rem', marginInline: 'auto' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
              <Search
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 'var(--space-4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.125rem',
                  height: '1.125rem',
                  color: 'var(--color-ink-soft)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingBlock: '0.75rem',
                  paddingLeft: '2.75rem',
                  paddingRight: 'var(--space-4)',
                  fontSize: 'var(--text-body)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-ink)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Tag Filters */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div
                className="cluster"
                style={{ justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}
              >
                <span
                  className="cluster"
                  style={{ gap: 'var(--space-2)', color: 'var(--color-ink-soft)', fontWeight: 600 }}
                >
                  <Filter aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                  Filter by topic
                </span>
                {(selectedTags.length > 0 || searchQuery) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* #3/#7 — neutral default chips, ONE brand-soft active state.
                  Green stops being a page-wide haze; orange stays the only
                  saturated thing (reserved for the affiliate CTA). */}
              <div className="cluster" style={{ gap: 'var(--space-2)' }}>
                {allTags.slice(0, showAllFilters ? allTags.length : 12).map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-pressed={active}
                      className="btn btn-sm"
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--color-brand)',
                              borderColor: 'var(--color-brand)',
                              color: 'var(--color-on-brand)',
                            }
                          : undefined
                      }
                    >
                      {tag}
                    </button>
                  );
                })}

                {allTags.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="btn btn-sm btn-ghost"
                  >
                    {showAllFilters ? 'Show less' : `+${allTags.length - 12} more`}
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {(searchQuery || selectedTags.length > 0) && (
              <p
                className="text-soft"
                style={{ fontSize: 'var(--text-small)', margin: 0 }}
              >
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                {selectedTags.length > 0 && <span> in: {selectedTags.join(', ')}</span>}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===================== DESKTOP PRODUCT RAIL (#6) =====================
          Net-new DESKTOP affiliate surface — the control hub has NONE (sticky bar
          is md:hidden). In-flow (never fixed/sticky), one product, stationary, the
          single orange CTA on the page. Only shows in the unfiltered browse state. */}
      {isBrowsing && railProduct && (
        <section className="section surface-brand">
          <div className="container">
            <div
              className="card-raised"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 'var(--space-6)',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: '1 1 22rem', minWidth: 0 }}>
                <span className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
                  Editor&rsquo;s #1 DHM supplement
                </span>
                <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: 'var(--space-2)' }}>
                  {railProduct.name}
                </h2>
                <div
                  className="cluster"
                  style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}
                >
                  <span
                    className="stars"
                    role="img"
                    aria-label={`Rated ${railRating} out of 5`}
                  >
                    {Array.from({ length: 5 }, (_, i) => i < Math.round(railRating)).map(
                      (filled, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={filled ? undefined : 'is-empty'}
                          style={
                            filled
                              ? { fill: 'currentColor', stroke: 'currentColor' }
                              : { fill: 'none', color: 'var(--color-border)' }
                          }
                        />
                      )
                    )}
                  </span>
                  <span className="rating-meta">
                    <strong>{railRating}</strong>
                    {' · '}
                    {(railProduct.reviews ?? 0).toLocaleString()} reviews ·{' '}
                    {railProduct.price}
                  </span>
                </div>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                  <strong>Best for:</strong> {railProduct.bestFor}
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
                style={{ flex: '0 0 auto' }}
              >
                <ShoppingCart aria-hidden="true" />
                Check Price on Amazon
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ===================== FEATURED EDITOR'S PICK (#2) =====================
          ONE wide featured card breaks the ~169-card monotony and routes readers
          to a CTA-bearing evergreen article. Reuses existing post metadata. */}
      {isBrowsing && featuredPost && (
        <section className="section">
          <div className="container">
            <header className="section-head" style={{ marginBottom: 'var(--space-8)' }}>
              <span className="eyebrow">
                <Sparkles aria-hidden="true" style={{ width: '0.9em', height: '0.9em', display: 'inline', verticalAlign: '-0.1em' }} />{' '}
                Editor&rsquo;s pick
              </span>
              <h2>Start here</h2>
            </header>

            <CustomLink
              to={`/never-hungover/${featuredPost.slug}`}
              className="card-raised"
              onMouseEnter={() => handlePostHover(featuredPost.slug)}
              style={{ display: 'block', textDecoration: 'none', padding: 0, overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', alignItems: 'stretch' }}>
                {featuredPost.image && (
                  <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      width="1200"
                      height="675"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      fetchPriority="high"
                    />
                  </div>
                )}
                <div style={{ padding: 'var(--space-8)' }}>
                  <span className="badge badge-brand" style={{ marginBottom: 'var(--space-4)' }}>
                    Featured guide
                  </span>
                  <div
                    className="cluster"
                    style={{ gap: 'var(--space-4)', color: 'var(--color-ink-soft)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-3)' }}
                  >
                    <span className="cluster" style={{ gap: 'var(--space-1)' }}>
                      <Calendar aria-hidden="true" style={{ width: '0.9rem', height: '0.9rem' }} />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="cluster" style={{ gap: 'var(--space-1)' }}>
                      <Clock aria-hidden="true" style={{ width: '0.9rem', height: '0.9rem' }} />
                      {featuredPost.readTime} min read
                    </span>
                  </div>
                  <h3
                    className="card-title"
                    style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}
                  >
                    {featuredPost.title}
                  </h3>
                  <p className="text-soft" style={{ marginBottom: 'var(--space-4)' }}>
                    {featuredPost.excerpt}
                  </p>
                  <span
                    className="cluster"
                    style={{ gap: 'var(--space-1)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
                  >
                    Read the full guide
                    <ArrowRight aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                  </span>
                </div>
              </div>
            </CustomLink>
          </div>
        </section>
      )}

      {/* ===================== BLOG POSTS GRID (#3 re-tier) ===================== */}
      <section className="section">
        <div className="container">
          {isBrowsing && (
            <header className="section-head" style={{ marginBottom: 'var(--space-8)' }}>
              <span className="eyebrow">All articles</span>
              <h2>Browse the full library</h2>
            </header>
          )}

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', paddingBlock: 'var(--space-16)' }}>
              <Search
                aria-hidden="true"
                style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto var(--space-4)', color: 'var(--color-ink-soft)' }}
              />
              <h3 style={{ marginBottom: 'var(--space-2)' }}>No articles found</h3>
              <p className="text-soft">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="picks-grid">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug ?? post.id}
                  className="card-raised"
                  style={{ padding: 0, overflow: 'hidden', height: '100%' }}
                >
                  <CustomLink
                    to={`/never-hungover/${post.slug}`}
                    onMouseEnter={() => handlePostHover(post.slug)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    {/* Post Image */}
                    {post.image && (
                      <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        padding: 'var(--space-6)',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1 1 auto',
                      }}
                    >
                      {/* Post Meta */}
                      <div
                        className="cluster"
                        style={{ gap: 'var(--space-4)', color: 'var(--color-ink-soft)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-3)' }}
                      >
                        <span className="cluster" style={{ gap: 'var(--space-1)' }}>
                          <Calendar aria-hidden="true" style={{ width: '0.9rem', height: '0.9rem' }} />
                          {formatDate(post.date)}
                        </span>
                        <span className="cluster" style={{ gap: 'var(--space-1)' }}>
                          <Clock aria-hidden="true" style={{ width: '0.9rem', height: '0.9rem' }} />
                          {post.readTime} min read
                        </span>
                      </div>

                      {/* Post Title */}
                      <h3
                        className="card-title"
                        style={{ color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}
                      >
                        {post.title}
                      </h3>

                      {/* Post Excerpt */}
                      <p
                        className="text-soft"
                        style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)' }}
                      >
                        {post.excerpt}
                      </p>

                      {/* Tags — neutral/brand-soft chips, NOT green-on-green. */}
                      {post.tags && post.tags.length > 0 && (
                        <div
                          className="cluster"
                          style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
                        >
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={`${tag}-${i}`} className="chip" style={{ fontSize: 'var(--text-eyebrow)', padding: '0.25rem 0.5rem' }}>
                              <Tag aria-hidden="true" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Author — pinned to the bottom for aligned card feet. */}
                      <p
                        className="text-soft"
                        style={{ fontSize: 'var(--text-small)', margin: 'auto 0 0' }}
                      >
                        By {post.author}
                      </p>
                    </div>
                  </CustomLink>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewBlogListingModern;
