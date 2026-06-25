import React, { useEffect, useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import {
  Award,
  Filter,
  TrendingUp,
  FlaskConical,
  MessagesSquare,
  Truck,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import ProductCardModern from '../components/modern/ProductCardModern.jsx'
import ComparisonTableModern from '../components/modern/ComparisonTableModern.jsx'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import topProductsData from '../data/topProducts.json'
import '../styles/theme-modern.css'

/**
 * Reviews.modern — the "modern" arm of the /reviews A/B test
 * (flag key: "site-modern-v1"). A flag-gated restyle of the CONTROL page
 * (src/pages/Reviews.jsx), built on the approved 2026 design language
 * (docs/design-modernization-2026-06-25/): warm paper palette, Fraunces display
 * headings in SOLID ink (no gradient), border-first cards, a single saturated
 * orange reserved for conversion CTAs.
 *
 * Reuse contract with CONTROL:
 *   - Same data source (src/data/topProducts.json) — no new data.
 *   - Same sort + "Best For" filter logic (copied verbatim from Reviews.jsx).
 *   - Same SEO: useSEO(generatePageSEO('reviews')).
 *   - Same conversion testids preserved for the A/B harness:
 *       reviews-byline, lab-tested-link, free-shipping-badge,
 *       the H1 containing "June 2026", and a green active "Best For" filter.
 *
 * Isolation contract:
 *   - The ENTIRE page body is wrapped in <div className="theme-modern"> and the
 *     scoped stylesheet src/styles/theme-modern.css is imported here so the
 *     modern CSS is code-split into this chunk — CONTROL users pay nothing.
 *   - preloadModernFonts() runs on mount (variant arm only).
 *
 * Affiliate CTA contract: ALL product/table CTAs render through
 * ProductCardModern / ComparisonTableModern, which emit a plain <a> with the
 * data-experiment-key / data-variant / data-component-id attributes the global
 * listener (src/hooks/useAffiliateTracking.js) reads. There is NO onClick — the
 * listener fires affiliate_link_click, so adding one would double-count.
 */

const EXPERIMENT_KEY = 'site-modern-v1'

export default function ReviewsModern() {
  useSEO(generatePageSEO('reviews'))

  // Variant arm only: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts()
  }, [])

  const [sortBy, setSortBy] = useState('score')
  const [filterBy, setFilterBy] = useState('all')

  // Single source of truth — shared with scripts/prerender-main-pages.js so the
  // ItemList schema on /reviews stays in sync with visible content.
  const topProducts = topProductsData

  // "Best For" quick-filter buttons — copied verbatim from the control page
  // (Issue #209). Each filter applies a case-insensitive substring predicate to
  // product.bestFor.
  const bestForFilters = [
    { id: 'all', label: 'All Products', match: null },
    { id: 'overall', label: 'Best Overall', match: (p) => /\b(best|trusted)\b/i.test(p.bestFor) },
    { id: 'value', label: 'Best Value', match: (p) => /value/i.test(p.bestFor) },
    { id: 'heavy', label: 'Heavy Drinkers', match: (p) => /(party|weekend|high-performer)/i.test(p.bestFor) },
    { id: 'health', label: 'Health-Conscious', match: (p) => /(health|liver)/i.test(p.bestFor) },
  ]

  const handleFilterClick = (id) => {
    // Toggle: clicking the active non-default button clears back to 'all'.
    const next = filterBy === id && id !== 'all' ? 'all' : id
    setFilterBy(next)
  }

  const sortOptions = [
    { value: 'score', label: 'Our Pick' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price', label: 'Best Value' },
    { value: 'dhm', label: 'Highest DHM' },
    { value: 'reviews', label: 'Most Reviews' },
  ]

  const activeFilter = bestForFilters.find((f) => f.id === filterBy)
  const filteredProducts = activeFilter?.match
    ? topProducts.filter(activeFilter.match)
    : topProducts

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score
      case 'rating':
        return b.rating - a.rating
      case 'price':
        return (
          parseFloat(a.pricePerServing.replace('$', '')) -
          parseFloat(b.pricePerServing.replace('$', ''))
        )
      case 'dhm':
        return (
          parseInt(b.dhm.replace(/[^\d]/g, '')) -
          parseInt(a.dhm.replace(/[^\d]/g, ''))
        )
      case 'reviews':
        return b.reviews - a.reviews
      default:
        return 0
    }
  })

  // Head-to-head comparison posts — same set the control links to.
  const comparisons = [
    { title: 'No Days Wasted vs NusaPure', slug: 'no-days-wasted-vs-nusapure-dhm-comparison-2025', desc: 'Premium brand vs budget bulk value' },
    { title: 'Double Wood vs No Days Wasted', slug: 'double-wood-vs-no-days-wasted-dhm-comparison-2025', desc: 'Best value vs premium effectiveness' },
    { title: 'Flyby vs No Days Wasted', slug: 'flyby-vs-no-days-wasted-complete-comparison-2025', desc: 'Two premium alternatives compared' },
    { title: 'Double Wood vs Toniiq Ease', slug: 'double-wood-vs-toniiq-ease-dhm-comparison-2025', desc: 'Value leaders go head-to-head' },
    { title: 'Flyby vs Double Wood', slug: 'flyby-vs-double-wood-complete-comparison-2025', desc: 'Two top-rated supplements tested' },
    { title: 'No Days Wasted vs Good Morning', slug: 'no-days-wasted-vs-good-morning-hangover-pills-comparison-2025', desc: 'Premium hangover pill showdown' },
  ]

  const winner = topProducts?.[0]

  return (
    <div className="theme-modern" style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      {/* ============================ HERO ============================ */}
      <section data-testid="reviews-hero-modern" className="surface-wash" style={{ paddingBlock: 'var(--section-y)' }}>
        <div className="container">
          <header className="section-head section-head--center" style={{ marginInline: 'auto' }}>
            <Link to="/guide" data-testid="lab-tested-link" style={{ textDecoration: 'none' }}>
              <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
                <Award aria-hidden="true" />
                2026 Lab-Tested Reviews
              </span>
            </Link>

            {/* H1 must contain the "June 2026" month text (conversion testid parity). */}
            <h1 style={{ marginTop: 'var(--space-4)' }}>
              Best DHM Supplements <span className="accent">(June 2026)</span>
            </h1>

            <p className="lead">
              Expert reviews of hangover prevention supplements that actually work —
              stop hangovers before they start.
            </p>

            <p data-testid="reviews-byline" className="text-soft" style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-2)' }}>
              Reviewed by the DHM Guide editorial team · Updated June 2026
            </p>

            {/* Inline trust-signal row (paper, brand-green icons, no saturated color). */}
            <div className="trust-row" style={{ justifyContent: 'center', marginTop: 'var(--space-8)' }}>
              <span className="trust-row__item">
                <FlaskConical aria-hidden="true" />
                <strong>20+</strong>&nbsp;brands tested
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <MessagesSquare aria-hidden="true" />
                <strong>5,000+</strong>&nbsp;reviews analyzed
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <Award aria-hidden="true" />
                <strong>6</strong>&nbsp;months testing
              </span>
            </div>
          </header>
        </div>
      </section>

      {/* ===================== QUICK COMPARISON TABLE ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">At a glance</span>
            <h2>Quick comparison table</h2>
            <p className="lead">
              Compare all DHM supplements side-by-side — dose, rating, and price per serving.
            </p>
          </header>

          <ComparisonTableModern products={topProducts} experimentKey={EXPERIMENT_KEY} />

          <p className="text-soft" style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-small)' }}>
            Scroll down for detailed reviews with pros, cons, and buying recommendations.
          </p>
        </div>
      </section>

      {/* ===================== FILTER + SORT ===================== */}
      <section className="section">
        <div className="container">
          <div
            className="cluster"
            style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-6)' }}
          >
            {/* Best For filter — active button uses brand GREEN (testid/visual parity). */}
            <div className="cluster" style={{ gap: 'var(--space-2)' }}>
              <span className="cluster" style={{ gap: 'var(--space-2)', color: 'var(--color-ink-soft)', fontWeight: 600 }}>
                <Filter aria-hidden="true" style={{ width: '1.125rem', height: '1.125rem' }} />
                Best For:
              </span>
              {bestForFilters.map((f) => {
                const active = filterBy === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFilterClick(f.id)}
                    aria-pressed={active}
                    data-filter-id={f.id}
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
                    {f.label}
                  </button>
                )
              })}
            </div>

            {/* Sort control */}
            <label className="cluster" style={{ gap: 'var(--space-2)', color: 'var(--color-ink-soft)', fontWeight: 600 }}>
              <TrendingUp aria-hidden="true" style={{ width: '1.125rem', height: '1.125rem' }} />
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="btn btn-sm"
                style={{ fontWeight: 500, cursor: 'pointer' }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* ===================== PRODUCT REVIEWS GRID ===================== */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">Editor&rsquo;s top picks · June 2026</span>
            <h2>Detailed reviews</h2>
            {/* free-shipping-badge testid parity — surfaces the winner's free-shipping
                signal (the control attached this testid to the #1 CTA). */}
            {winner && winner.freeShipping !== false && (
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                <span data-testid="free-shipping-badge" className="chip">
                  <Truck aria-hidden="true" />
                  Free shipping on our #1 pick
                </span>
              </p>
            )}
          </header>

          <div className="picks-grid">
            {sortedProducts.map((product, index) => (
              <ProductCardModern
                key={product.id}
                product={product}
                index={index}
                experimentKey={EXPERIMENT_KEY}
                isWinner={index === 0}
              />
            ))}
          </div>

          <p className="text-soft" style={{ textAlign: 'center', marginTop: 'var(--space-8)', fontSize: 'var(--text-small)' }}>
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </section>

      {/* ===================== HEAD-TO-HEAD COMPARISONS ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Side by side</span>
            <h2>Head-to-head product comparisons</h2>
            <p className="lead">
              Detailed analysis comparing these supplements one against another.
            </p>
          </header>

          <div className="grid-auto">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                to={`/never-hungover/${comparison.slug}`}
                className="card-raised"
                style={{ display: 'block', textDecoration: 'none', height: '100%' }}
              >
                <h3 className="card-title cluster" style={{ gap: 'var(--space-2)', color: 'var(--color-ink)' }}>
                  <BarChart3 aria-hidden="true" style={{ width: '1.125rem', height: '1.125rem', color: 'var(--color-brand)' }} />
                  {comparison.title}
                </h3>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                  {comparison.desc}
                </p>
                <span
                  className="cluster"
                  style={{ gap: 'var(--space-1)', marginTop: 'var(--space-3)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
                >
                  Read full comparison
                  <ArrowRight aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                </span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <Link to="/compare" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
              <BarChart3 aria-hidden="true" />
              Compare products side-by-side
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== BUYING GUIDE CTA BAND ===================== */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Need help choosing?</span>
            <h2>Read our comprehensive buying guide</h2>
            <p className="lead">
              Understand exactly what to look for in a quality DHM supplement before you buy.
            </p>
            <div className="cta-band__actions">
              <Link to="/guide" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                Read buying guide
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/research" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
                See research data
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
