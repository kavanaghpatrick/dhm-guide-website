import React, { useState, useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import { buildAffiliateUrl } from '../lib/utm-builder.js'
import topProductsData from '@/data/topProducts.json'
import {
  Star,
  CheckCircle,
  Award,
  DollarSign,
  Shield,
  ArrowRight,
  Users,
  ExternalLink,
  X,
  Plus,
  Crown,
  Target,
  BarChart3,
  Microscope,
  Package,
  Truck,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import '../styles/theme-modern.css'

/**
 * Compare.modern — the "modern" arm of the /compare A/B test
 * (flag key: "site-modern-v1"). A flag-gated restyle of the CONTROL page
 * (src/pages/Compare.jsx), built on the approved 2026 design language
 * (docs/design-modernization-2026-06-25/recommendations/compare.md): warm paper
 * foundation, solid-ink headings (no gradient clip-text), de-noised single-accent
 * comparison table with a green-soft winner cell, paper-skinned "Category Winners"
 * section, border-first elevation. Orange is reserved exclusively for affiliate CTAs.
 *
 * Reuse contract with CONTROL:
 *   - Same data source (src/data/topProducts.json + the compareProductOverrides
 *     block) — copied VERBATIM from Compare.jsx, no new data.
 *   - Same selection/winner/URL-param logic (handleProductToggle, getWinner,
 *     useEffect auto-select) — copied verbatim.
 *   - Same SEO: useSEO(generatePageSEO('compare')).
 *   - Same conversion + tracking attributes preserved for the harness:
 *       data-track="product", data-product-name, data-product-position on selector
 *       cards and mobile product cards; data-placement="compare_table" +
 *       data-product-name on every affiliate CTA; data-track="cta" on the
 *       internal-link CTAs.
 *   - All internal links preserved: /reviews, /guide, /never-hungover/<slug>,
 *     /never-hungover?tag=comparison.
 *
 * Isolation contract:
 *   - The ENTIRE page body is wrapped in <div className="theme-modern"> and the
 *     scoped stylesheet src/styles/theme-modern.css is imported here so the modern
 *     CSS is code-split into this chunk — CONTROL users pay nothing.
 *   - preloadModernFonts() runs on mount (variant arm only).
 *
 * Affiliate CTA contract: every CTA is a plain <a> built with buildAffiliateUrl
 * + the data-experiment-key / data-variant / data-component-id attributes the
 * global listener (src/hooks/useAffiliateTracking.js) reads. There is NO onClick
 * — the listener fires affiliate_link_click, so adding one would double-count.
 */

const EXPERIMENT_KEY = 'site-modern-v1'

export default function CompareModern() {
  useSEO(generatePageSEO('compare'))

  // Variant arm only: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts()
  }, [])

  const [selectedProducts, setSelectedProducts] = useState([])

  // Product data: canonical fields (price, rating, reviews, affiliateLink, name,
  // brand, dhm, purity, badge, badgeColor, score, servings, category) come from
  // src/data/topProducts.json so a single price refresh propagates everywhere.
  // Only Compare-page-specific UI fields live here. Copied VERBATIM from Compare.jsx.
  const topProductsById = Object.fromEntries(topProductsData.map((p) => [p.id, p]))
  const compareProductOverrides = [
    {
      id: 1,
      dhmPerDollar: 37.0,
      additionalIngredients: ['L-Cysteine 200mg', 'Milk Thistle', 'Prickly Pear', 'B-Complex', 'Electrolytes'],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'FDA Registered'],
      bestForUseCase: 'Premium effectiveness',
      valueScore: 8.5,
      effectivenessScore: 9.5,
      safetyScore: 9.0,
      customerSatisfaction: 4.3,
      monthlyBuyers: '1K+',
    },
    {
      id: 2,
      dhmPerDollar: 50.6,
      additionalIngredients: ['Electrolytes', 'Essential Minerals'],
      thirdPartyTested: true,
      moneyBackGuarantee: false,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['Third-party tested'],
      bestForUseCase: 'Budget-conscious users',
      valueScore: 9.8,
      effectivenessScore: 9.0,
      safetyScore: 8.5,
      customerSatisfaction: 4.4,
      monthlyBuyers: '2K+',
    },
    {
      id: 3,
      dhmPerDollar: 12.0,
      additionalIngredients: ['Red Duanwood Reishi', 'Milk Thistle (80% Silymarin)'],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'Third-party tested'],
      bestForUseCase: 'Comprehensive liver support',
      valueScore: 9.0,
      effectivenessScore: 8.5,
      safetyScore: 9.2,
      customerSatisfaction: 4.3,
      monthlyBuyers: '500+',
    },
    {
      id: 4,
      dhmPerDollar: 50.1,
      additionalIngredients: [],
      thirdPartyTested: true,
      moneyBackGuarantee: false,
      shippingSpeed: 'Standard 3-5 days',
      manufacturingLocation: 'USA',
      certifications: ['FDA Registered'],
      bestForUseCase: 'Maximum DHM potency',
      valueScore: 9.5,
      effectivenessScore: 8.8,
      safetyScore: 8.0,
      customerSatisfaction: 4.2,
      monthlyBuyers: '100+',
    },
    {
      id: 5,
      dhmPerDollar: 8.6,
      additionalIngredients: ['L-Cysteine', 'Prickly Pear', 'B-Vitamins', 'Ginger', 'Vine Tea'],
      thirdPartyTested: false,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['Academic research backing'],
      bestForUseCase: 'Maximum DHM content',
      valueScore: 6.5,
      effectivenessScore: 8.8,
      safetyScore: 8.2,
      customerSatisfaction: 3.9,
      monthlyBuyers: 'Variable',
    },
    {
      id: 6,
      dhmPerDollar: 16.7,
      additionalIngredients: ['Milk Thistle', 'B-Vitamins (B1,B2,B6,B9,B12)', '18 Amino Acids', 'Vitamin C', 'Apple Cider Vinegar', 'Electrolytes'],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'Non-GMO', 'Gluten-Free'],
      bestForUseCase: 'Two-stage hangover protocol',
      valueScore: 7.0,
      effectivenessScore: 8.5,
      safetyScore: 9.0,
      customerSatisfaction: 4.3,
      monthlyBuyers: '1K+',
    },
    {
      id: 7,
      image: '/good-morning-hangover-pills-review-hero.webp',
      dhmPerDollar: 4.2,
      additionalIngredients: ['Electrolytes', 'Milk Thistle (80% Silymarin)', 'B-Vitamins', 'Vitamin C', 'Vitamin E', 'L-Cysteine', 'White Willow Bark'],
      thirdPartyTested: true,
      moneyBackGuarantee: false,
      shippingSpeed: 'Prime Overnight',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'Non-GMO'],
      bestForUseCase: 'Single-pill convenience',
      valueScore: 9.5,
      effectivenessScore: 8.0,
      safetyScore: 8.5,
      customerSatisfaction: 4.2,
      monthlyBuyers: '500+',
    },
    {
      id: 8,
      image: '/dhm1000-review-hero.webp',
      dhmPerDollar: 33.4,
      additionalIngredients: ['Electrolytes (Sodium, Potassium, Magnesium)'],
      thirdPartyTested: false,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'Non-GMO'],
      bestForUseCase: 'Maximum potency + flexibility',
      valueScore: 8.0,
      effectivenessScore: 9.0,
      safetyScore: 8.5,
      customerSatisfaction: 4.3,
      monthlyBuyers: '800+',
      category: 'high-potency',
    },
    {
      id: 9,
      image: '/fuller-health-after-party-review-hero.webp',
      affiliateLink: 'https://fullerhealth.com/products/after-party',
      dhmPerDollar: 13.0,
      additionalIngredients: ['GABA Support Mechanism'],
      thirdPartyTested: false,
      moneyBackGuarantee: true,
      shippingSpeed: 'Standard 3-5 days',
      manufacturingLocation: 'USA',
      certifications: ['Organic', 'Pure'],
      bestForUseCase: 'Premium purity + celebrity endorsement',
      valueScore: 6.5,
      effectivenessScore: 8.0,
      safetyScore: 9.0,
      customerSatisfaction: 4.0,
      monthlyBuyers: '200+',
    },
    {
      id: 10,
      image: '/dhm-depot-review-hero.webp',
      dhmPerDollar: 6.7,
      additionalIngredients: ['None - Pure DHM'],
      thirdPartyTested: true,
      moneyBackGuarantee: true,
      shippingSpeed: 'Prime 1-2 days',
      manufacturingLocation: 'USA',
      certifications: ['GMP', 'Non-GMO', 'Gluten-Free', 'Third-Party Tested'],
      bestForUseCase: 'Quality assurance + highest ratings',
      valueScore: 7.5,
      effectivenessScore: 8.5,
      safetyScore: 9.5,
      customerSatisfaction: 4.5,
      monthlyBuyers: '1.5K+',
      category: 'quality',
    },
  ]
  const allProducts = compareProductOverrides.map((local) => ({
    ...topProductsById[local.id],
    ...local,
  }))

  // Auto-select top 3 products by default or from URL params. Copied verbatim.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const productIds = urlParams.get('products')

    if (productIds) {
      const ids = productIds.split(',').map((id) => parseInt(id)).filter((id) => !isNaN(id))
      const validIds = ids.filter((id) => allProducts.find((p) => p.id === id))
      setSelectedProducts(validIds)
    } else {
      const topThree = allProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((p) => p.id)
      setSelectedProducts(topThree)
    }
    // Mount-only initialization. allProducts is derived from static data and is
    // rebuilt each render, so we intentionally do NOT depend on it (that would
    // reset the user's selection on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else if (prev.length < 4) {
        return [...prev, productId]
      }
      return prev
    })
  }

  const selectedProductsData = allProducts.filter((p) => selectedProducts.includes(p.id))

  // Numeric metric extractor per comparison field. Returns the value the table
  // CELL actually shows, so winner highlighting can never disagree with the cell
  // (e.g. Overall Score keys off product.score, the value rendered — #21).
  const metricValue = (field, product) => {
    switch (field) {
      case 'score':
        return Number(product.score) || 0
      case 'value':
        return Number(product.valueScore) || 0
      case 'effectiveness':
        return Number(product.effectivenessScore) || 0
      case 'dhm':
        return parseInt(String(product.dhm).replace(/[^\d]/g, '')) || 0
      case 'reviews':
        return Number(product.reviews) || 0
      case 'rating':
        return Number(product.rating) || 0
      case 'dhmPerDollar':
        return typeof product.dhmPerDollar === 'string' ? 0 : Number(product.dhmPerDollar) || 0
      default:
        return null
    }
  }

  const maxMetric = (field) => {
    if (selectedProductsData.length === 0) return null
    return Math.max(...selectedProductsData.map((p) => metricValue(field, p)))
  }

  // Single representative winner (first product at the max) — used by the
  // Category Winners cards where exactly one product must be named.
  const getWinner = (field) => {
    const max = maxMetric(field)
    if (max === null) return null
    return selectedProductsData.find((p) => metricValue(field, p) === max) ?? null
  }

  // ---- Modern style helpers (scoped to .theme-modern tokens) ----------------

  // Winner cell: green-soft fill + bold brand value (recommendation move #2).
  const winnerCellStyle = {
    backgroundColor: 'var(--color-brand-soft)',
  }
  const winnerValueStyle = { color: 'var(--color-brand-strong)', fontWeight: 700 }
  const baseValueStyle = { color: 'var(--color-ink)', fontWeight: 600 }

  // A single muted-ink row-label icon style (recommendation move #2: kill the
  // seven different accent hues; one muted-ink for ALL row icons).
  const rowIcon = { width: '1.125rem', height: '1.125rem', color: 'var(--color-ink-soft)', flex: '0 0 auto' }
  const rowLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontWeight: 600,
    color: 'var(--color-ink)',
    whiteSpace: 'nowrap',
  }

  // Tie-aware winner test: a product is a winner if it equals the max for the
  // field, so a true tie (e.g. DHM 1000 = 1000) marks BOTH as best rather than
  // arbitrarily crowning the first one (#22).
  const winner = (field, product) => {
    const max = maxMetric(field)
    return max !== null && metricValue(field, product) === max
  }

  return (
    <div className="theme-modern" style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      {/* ============================ HERO ============================ */}
      <section
        data-testid="compare-hero-modern"
        className="surface-wash"
        style={{ paddingBlock: 'var(--section-y)' }}
      >
        <div className="container">
          <header className="section-head section-head--center" style={{ marginInline: 'auto' }}>
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <BarChart3 aria-hidden="true" />
              Side-by-Side Comparison
            </span>

            {/* Solid-ink heading with ONE brand-green emphasis word — no gradient. */}
            <h1 style={{ marginTop: 'var(--space-4)' }}>
              Compare DHM Supplements <span className="accent">Side-by-Side</span>
            </h1>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Find your perfect <strong>hangover prevention solution</strong> with our comprehensive
              side-by-side comparison — analyze effectiveness, value, and ingredients to stop hangovers forever.
            </p>

            {/* Quick comparison stats — hairline-ruled strip, 4-across on desktop.
                Numeric stats keep the big .stat-value; word-valued stats use the
                smaller .stat-word treatment so prose never lands in the big
                numeric face (#20 grid, #32 no-words-in-stat-value). */}
            <div
              className="trust-band__stats compare-hero-stats"
              style={{
                marginTop: 'var(--space-12)',
                paddingTop: 'var(--space-8)',
                borderTop: '1px solid var(--color-border)',
                rowGap: 'var(--space-8)',
              }}
            >
              <div className="stat compare-hero-stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">{selectedProductsData.length}</span>
                <span className="stat-label">Products Selected</span>
              </div>
              <div className="stat compare-hero-stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">15+</span>
                <span className="stat-label">Comparison Points</span>
              </div>
              <div className="stat compare-hero-stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-word">Real-time</span>
                <span className="stat-label">Price Updates</span>
              </div>
              <div className="stat compare-hero-stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-word">Expert</span>
                <span className="stat-label">Analysis</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      {/* ===================== PRODUCT SELECTION ===================== */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">Build your comparison</span>
            <h2>Select products to compare</h2>
            <p className="lead">
              Choose up to 4 hangover prevention supplements for detailed comparison. Top 3 products are pre-selected.
            </p>
          </header>

          <div className="grid-auto">
            {allProducts.map((product, index) => {
              const isSelected = selectedProducts.includes(product.id)
              return (
                <button
                  key={product.id}
                  type="button"
                  className="card"
                  onClick={() => handleProductToggle(product.id)}
                  aria-pressed={isSelected}
                  data-track="product"
                  data-product-name={product.name}
                  data-product-position={index + 1}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color var(--transition), background-color var(--transition)',
                    ...(isSelected
                      ? { backgroundColor: 'var(--color-brand-soft)', borderColor: 'var(--color-brand)' }
                      : {}),
                  }}
                >
                  <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '1.0625rem', marginBottom: 'var(--space-1)' }}>
                        {product.name}
                      </h3>
                      <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                        {product.brand}
                      </p>
                      <div className="cluster" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <span className="cluster" style={{ gap: '0.25rem', color: '#E8A317' }}>
                          <Star aria-hidden="true" style={{ width: '1rem', height: '1rem', fill: 'currentColor', stroke: 'currentColor' }} />
                          <span className="text-soft" style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}>{product.rating}</span>
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{product.price}</span>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '1.5rem',
                        height: '1.5rem',
                        flex: '0 0 auto',
                        borderRadius: 'var(--radius-pill)',
                        border: `2px solid ${isSelected ? 'var(--color-brand)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--color-brand)' : 'transparent',
                      }}
                    >
                      {isSelected && <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-on-brand)' }} />}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================== DETAILED COMPARISON TABLE =====================
          order-first on mobile to front-load above hero (mobile CR 2.9x desktop). */}
      {selectedProductsData.length > 0 && (
        <section className="section" style={{ order: -1 }}>
          <div className="container" style={{ maxWidth: '80rem' }}>
            <header className="section-head section-head--center">
              <span className="eyebrow">Head to head</span>
              <h2>Detailed comparison</h2>
            </header>

            {/* Table wrapper — the one RAISED surface (two-layer warm shadow + border). */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--elev-2)',
                overflow: 'hidden',
              }}
            >
              {/* ---- Desktop table ---- */}
              <div className="hidden lg:block">
                <div className="compare-scroll">
                  <table className="compare" style={{ border: 0, borderRadius: 0, fontSize: 'var(--text-small)' }}>
                    <thead>
                      <tr>
                        {/* Light paper-palette header (default .compare thead th:
                            brand-soft fill, brand-strong text) — the black-header
                            override was dropped to match ComparisonTableModern (#13). */}
                        <th scope="col" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 'var(--text-small)' }}>
                          Comparison Factor
                        </th>
                        {selectedProductsData.map((product) => (
                          <th
                            key={product.id}
                            scope="col"
                            style={{ textTransform: 'none', letterSpacing: 'normal', textAlign: 'center', minWidth: '200px', whiteSpace: 'normal' }}
                          >
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: 'var(--text-eyebrow)', color: 'var(--color-ink-soft)', fontWeight: 500 }}>{product.brand}</span>
                              {/* Full product name — no 3-word truncation (#23). */}
                              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-ink)' }}>{product.name}</span>
                              <span className="badge badge-brand" style={{ marginTop: '0.25rem' }}>{product.badge}</span>
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Overall Score */}
                      <tr>
                        <td style={rowLabelStyle}><Award style={rowIcon} aria-hidden="true" />Overall Score</td>
                        {selectedProductsData.map((product) => {
                          // Crown keys off product.score — the value the cell shows (#21).
                          const isWinner = winner('score', product)
                          return (
                            <td key={product.id} className="num" style={{ textAlign: 'center', ...(isWinner ? winnerCellStyle : {}) }}>
                              <span style={{ fontSize: '1.25rem', ...(isWinner ? winnerValueStyle : baseValueStyle) }}>
                                {product.score}/10
                                {isWinner && <Crown style={{ width: '1.05rem', height: '1.05rem', display: 'inline', marginLeft: '0.375rem', color: 'var(--color-brand)' }} />}
                              </span>
                            </td>
                          )
                        })}
                      </tr>

                      {/* Price */}
                      <tr>
                        <td style={rowLabelStyle}><DollarSign style={rowIcon} aria-hidden="true" />Price</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} className="num" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.0625rem', ...baseValueStyle }}>{product.price}</div>
                            <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>{product.pricePerServing} per serving</div>
                          </td>
                        ))}
                      </tr>

                      {/* DHM Content */}
                      <tr>
                        <td style={rowLabelStyle}><Microscope style={rowIcon} aria-hidden="true" />DHM Content</td>
                        {selectedProductsData.map((product) => {
                          const isWinner = winner('dhm', product)
                          return (
                            <td key={product.id} className="num" style={{ textAlign: 'center', ...(isWinner ? winnerCellStyle : {}) }}>
                              <div style={isWinner ? winnerValueStyle : baseValueStyle}>
                                {product.dhm}
                                {isWinner && <Crown style={{ width: '0.95rem', height: '0.95rem', display: 'inline', marginLeft: '0.25rem', color: 'var(--color-brand)' }} />}
                              </div>
                              <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>{product.purity} purity</div>
                            </td>
                          )
                        })}
                      </tr>

                      {/* Value (DHM per Dollar) */}
                      <tr>
                        <td style={rowLabelStyle}><Target style={rowIcon} aria-hidden="true" />Value (mg DHM per $)</td>
                        {selectedProductsData.map((product) => {
                          const isWinner = winner('dhmPerDollar', product)
                          return (
                            <td key={product.id} className="num" style={{ textAlign: 'center', ...(isWinner ? winnerCellStyle : {}) }}>
                              <div style={isWinner ? winnerValueStyle : baseValueStyle}>
                                {product.dhmPerDollar.toFixed(1)} mg/$
                                {isWinner && <Crown style={{ width: '0.95rem', height: '0.95rem', display: 'inline', marginLeft: '0.25rem', color: 'var(--color-brand)' }} />}
                              </div>
                              {/* Caption only under the winning column (#2). */}
                              {isWinner && <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>Best value indicator</div>}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Customer Rating */}
                      <tr>
                        <td style={rowLabelStyle}><Star style={rowIcon} aria-hidden="true" />Customer Rating</td>
                        {selectedProductsData.map((product) => {
                          const isWinner = winner('rating', product)
                          return (
                            <td key={product.id} className="num" style={{ textAlign: 'center', ...(isWinner ? winnerCellStyle : {}) }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', ...(isWinner ? winnerValueStyle : baseValueStyle) }}>
                                <Star style={{ width: '1rem', height: '1rem', fill: '#E8A317', stroke: '#E8A317' }} aria-hidden="true" />
                                <span>{product.rating}</span>
                                {isWinner && <Crown style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-brand)' }} />}
                              </div>
                              <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>({product.reviews} reviews)</div>
                            </td>
                          )
                        })}
                      </tr>

                      {/* Servings */}
                      <tr>
                        <td style={rowLabelStyle}><Package style={rowIcon} aria-hidden="true" />Servings per Container</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} className="num" style={{ textAlign: 'center' }}>
                            <div style={baseValueStyle}>{product.servings}</div>
                            <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>servings</div>
                          </td>
                        ))}
                      </tr>

                      {/* Third-Party Testing */}
                      <tr>
                        <td style={rowLabelStyle}><Shield style={rowIcon} aria-hidden="true" />Third-Party Tested</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} style={{ textAlign: 'center' }}>
                            {product.thirdPartyTested
                              ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)', margin: '0 auto' }} aria-label="Yes" />
                              : <X style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-ink-soft)', opacity: 0.6, margin: '0 auto' }} aria-label="No" />}
                          </td>
                        ))}
                      </tr>

                      {/* Money Back Guarantee */}
                      <tr>
                        <td style={rowLabelStyle}><RefreshCw style={rowIcon} aria-hidden="true" />Money Back Guarantee</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} style={{ textAlign: 'center' }}>
                            {product.moneyBackGuarantee
                              ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)', margin: '0 auto' }} aria-label="Yes" />
                              : <X style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-ink-soft)', opacity: 0.6, margin: '0 auto' }} aria-label="No" />}
                          </td>
                        ))}
                      </tr>

                      {/* Shipping Speed */}
                      <tr>
                        <td style={rowLabelStyle}><Truck style={rowIcon} aria-hidden="true" />Shipping Speed</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} style={{ textAlign: 'center' }}>
                            <span className="text-soft" style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{product.shippingSpeed}</span>
                          </td>
                        ))}
                      </tr>

                      {/* Additional Ingredients */}
                      <tr>
                        <td style={rowLabelStyle}><Plus style={rowIcon} aria-hidden="true" />Additional Ingredients</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} style={{ textAlign: 'center' }}>
                            {product.additionalIngredients.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                                {product.additionalIngredients.slice(0, 2).map((ingredient, idx) => (
                                  <span key={idx} className="badge" style={{ textTransform: 'none', letterSpacing: 'normal' }}>{ingredient}</span>
                                ))}
                                {product.additionalIngredients.length > 2 && (
                                  <span className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>
                                    +{product.additionalIngredients.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-soft">DHM only</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Best For */}
                      <tr>
                        <td style={rowLabelStyle}><Users style={rowIcon} aria-hidden="true" />Best For</td>
                        {selectedProductsData.map((product) => (
                          <td key={product.id} style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{product.bestForUseCase}</span>
                          </td>
                        ))}
                      </tr>

                      {/* Purchase Links — orange CTA row (protected, byte-stable copy) */}
                      <tr>
                        <td style={rowLabelStyle}><ShoppingCart style={rowIcon} aria-hidden="true" />Get It Now</td>
                        {selectedProductsData.map((product, index) => {
                          const componentId = `compare-modern-table-cta-${product.id}`
                          return (
                            <td key={product.id} style={{ textAlign: 'center' }}>
                              <a
                                href={buildAffiliateUrl(product.affiliateLink, {
                                  componentId,
                                  experimentKey: EXPERIMENT_KEY,
                                  variant: 'modern',
                                })}
                                target="_blank"
                                rel="nofollow sponsored noopener noreferrer"
                                className="btn btn-cta btn-sm btn-block"
                                style={{ minHeight: '48px' }}
                                data-experiment-key={EXPERIMENT_KEY}
                                data-variant="modern"
                                data-component-id={componentId}
                                data-position-index={index}
                                data-placement="compare_table"
                                data-product-name={product.name}
                              >
                                <span>Check Price on Amazon</span>
                                <ExternalLink aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                              </a>
                              <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)', marginTop: 'var(--space-2)' }}>
                                {product.monthlyBuyers} monthly buyers
                              </div>
                              <p className="text-soft" style={{ fontSize: 'var(--text-eyebrow)', margin: '0.25rem 0 0' }}>
                                As an Amazon Associate I earn from qualifying purchases
                              </p>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---- Mobile card view ---- */}
              <div className="lg:hidden">
                <div className="stack" style={{ padding: 'var(--space-4)', '--stack-gap': 'var(--space-6)' }}>
                  {selectedProductsData.map((product, index) => {
                    // "Top Choice" + highlighted Overall Score box show product.score,
                    // so the highlight keys off the same value (#21).
                    const isTopChoice = winner('score', product)
                    const isBestValue = winner('dhmPerDollar', product)
                    const isHighestRated = winner('rating', product)
                    const isHighestDHM = winner('dhm', product)
                    const componentId = `compare-modern-card-cta-${product.id}`

                    return (
                      <article
                        key={product.id}
                        className="card-raised"
                        data-track="product"
                        data-product-name={product.name}
                        data-product-position={index + 1}
                        style={isTopChoice ? { borderColor: 'var(--color-brand)', backgroundColor: 'var(--color-brand-soft)' } : undefined}
                      >
                        <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap', marginBottom: 'var(--space-4)' }}>
                          <div>
                            <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>{product.brand}</p>
                            <h3 className="card-title" style={{ marginBottom: 0 }}>{product.name}</h3>
                          </div>
                          <span className="badge badge-brand">{product.badge}</span>
                        </div>
                        {isTopChoice && (
                          <div className="cluster" style={{ gap: 'var(--space-1)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)' }}>
                            <Crown style={{ width: '1rem', height: '1rem' }} aria-hidden="true" />
                            Top Choice
                          </div>
                        )}

                        <div className="stack" style={{ '--stack-gap': 'var(--space-3)' }}>
                          {/* Overall Score */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Award style={rowIcon} aria-hidden="true" />Overall Score</span>
                            <span style={{ fontSize: '1.125rem', ...(isTopChoice ? winnerValueStyle : baseValueStyle) }}>{product.score}/10</span>
                          </div>

                          {/* Price */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><DollarSign style={rowIcon} aria-hidden="true" />Price</span>
                            <span style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', ...baseValueStyle }}>{product.price}</span>
                              <span className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>{product.pricePerServing} per serving</span>
                            </span>
                          </div>

                          {/* DHM Content */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Microscope style={rowIcon} aria-hidden="true" />DHM Content</span>
                            <span style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', ...(isHighestDHM ? winnerValueStyle : baseValueStyle) }}>
                                {product.dhm}
                                {isHighestDHM && <Crown style={{ width: '0.95rem', height: '0.95rem', display: 'inline', marginLeft: '0.25rem', color: 'var(--color-brand)' }} />}
                              </span>
                              <span className="text-soft" style={{ fontSize: 'var(--text-eyebrow)' }}>{product.purity} purity</span>
                            </span>
                          </div>

                          {/* Value */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Target style={rowIcon} aria-hidden="true" />Value</span>
                            <span style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', ...(isBestValue ? winnerValueStyle : baseValueStyle) }}>
                                {product.dhmPerDollar.toFixed(1)} mg/$
                                {isBestValue && <Crown style={{ width: '0.95rem', height: '0.95rem', display: 'inline', marginLeft: '0.25rem', color: 'var(--color-brand)' }} />}
                              </span>
                              {/* Caption only on the best-value product (#2). */}
                              {isBestValue && <span className="text-soft" style={{ display: 'block', fontSize: 'var(--text-eyebrow)' }}>Best value indicator</span>}
                            </span>
                          </div>

                          {/* Customer Rating */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Star style={rowIcon} aria-hidden="true" />Customer Rating</span>
                            <span style={{ textAlign: 'right' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', ...(isHighestRated ? winnerValueStyle : baseValueStyle) }}>
                                <Star style={{ width: '1rem', height: '1rem', fill: '#E8A317', stroke: '#E8A317' }} aria-hidden="true" />
                                <span>{product.rating}</span>
                                {isHighestRated && <Crown style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-brand)' }} />}
                              </span>
                              <span className="text-soft" style={{ display: 'block', fontSize: 'var(--text-eyebrow)' }}>({product.reviews} reviews)</span>
                            </span>
                          </div>

                          {/* Servings */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Package style={rowIcon} aria-hidden="true" />Servings</span>
                            <span style={baseValueStyle}>{product.servings}</span>
                          </div>

                          {/* Features Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                              <Shield style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-ink-soft)', margin: '0 auto var(--space-1)' }} aria-hidden="true" />
                              <div style={{ fontSize: 'var(--text-eyebrow)', fontWeight: 600 }}>Third-Party Tested</div>
                              {product.thirdPartyTested
                                ? <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-brand)', margin: '0.25rem auto 0' }} aria-label="Yes" />
                                : <X style={{ width: '1rem', height: '1rem', color: 'var(--color-ink-soft)', opacity: 0.6, margin: '0.25rem auto 0' }} aria-label="No" />}
                            </div>
                            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                              <RefreshCw style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-ink-soft)', margin: '0 auto var(--space-1)' }} aria-hidden="true" />
                              <div style={{ fontSize: 'var(--text-eyebrow)', fontWeight: 600 }}>Money Back</div>
                              {product.moneyBackGuarantee
                                ? <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-brand)', margin: '0.25rem auto 0' }} aria-label="Yes" />
                                : <X style={{ width: '1rem', height: '1rem', color: 'var(--color-ink-soft)', opacity: 0.6, margin: '0.25rem auto 0' }} aria-label="No" />}
                            </div>
                          </div>

                          {/* Shipping */}
                          <div className="cluster" style={{ justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <span style={rowLabelStyle}><Truck style={rowIcon} aria-hidden="true" />Shipping</span>
                            <span style={{ color: 'var(--color-ink)', fontWeight: 500, fontSize: 'var(--text-small)' }}>{product.shippingSpeed}</span>
                          </div>

                          {/* Additional Ingredients */}
                          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <div style={{ ...rowLabelStyle, marginBottom: 'var(--space-2)' }}><Plus style={rowIcon} aria-hidden="true" />Additional Ingredients</div>
                            {product.additionalIngredients.length > 0 ? (
                              <div className="cluster" style={{ gap: '0.25rem' }}>
                                {product.additionalIngredients.map((ingredient, idx) => (
                                  <span key={idx} className="badge" style={{ textTransform: 'none', letterSpacing: 'normal' }}>{ingredient}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-soft">DHM only</span>
                            )}
                          </div>

                          {/* Best For */}
                          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
                            <div style={{ ...rowLabelStyle, marginBottom: 'var(--space-2)' }}><Users style={rowIcon} aria-hidden="true" />Best For</div>
                            <div style={{ color: 'var(--color-ink)', fontSize: 'var(--text-small)' }}>{product.bestForUseCase}</div>
                          </div>

                          {/* Purchase Button — orange CTA (protected copy) */}
                          <div style={{ paddingTop: 'var(--space-2)' }}>
                            <a
                              href={buildAffiliateUrl(product.affiliateLink, {
                                componentId,
                                experimentKey: EXPERIMENT_KEY,
                                variant: 'modern',
                              })}
                              target="_blank"
                              rel="nofollow sponsored noopener noreferrer"
                              className="btn btn-cta btn-lg btn-block"
                              style={{ minHeight: '48px' }}
                              data-experiment-key={EXPERIMENT_KEY}
                              data-variant="modern"
                              data-component-id={componentId}
                              data-position-index={index}
                              data-placement="compare_table"
                              data-product-name={product.name}
                            >
                              <span>Check Price on Amazon</span>
                              <ExternalLink aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                            </a>
                            <div className="text-soft" style={{ fontSize: 'var(--text-eyebrow)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                              {product.monthlyBuyers} monthly buyers
                            </div>
                            <p className="text-soft" style={{ fontSize: 'var(--text-eyebrow)', textAlign: 'center', margin: '0.25rem 0 0' }}>
                              As an Amazon Associate I earn from qualifying purchases
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CATEGORY WINNERS ===================== */}
      {selectedProductsData.length > 1 && (
        <section className="section surface-brand">
          <div className="container">
            <header className="section-head section-head--center">
              <h2 className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-2)' }}>
                <Crown aria-hidden="true" style={{ width: '1.75rem', height: '1.75rem', color: 'var(--color-brand)' }} />
                Category Winners
              </h2>
            </header>

            <div className="grid-auto" style={{ maxWidth: '64rem', marginInline: 'auto' }}>
              {/* Best Overall */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ borderTop: `3px solid var(--color-brand)`, marginTop: 'calc(-1 * var(--space-6))', marginInline: 'calc(-1 * var(--space-6))', marginBottom: 'var(--space-4)', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }} />
                <Award aria-hidden="true" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-brand)', margin: '0 auto var(--space-3)' }} />
                <h3 className="card-title">Best Overall</h3>
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>{getWinner('effectiveness')?.name}</p>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)' }}>Highest effectiveness score</p>
                {getWinner('effectiveness')?.affiliateLink && (
                  <a
                    href={buildAffiliateUrl(getWinner('effectiveness')?.affiliateLink, {
                      componentId: 'compare-modern-winner-overall',
                      experimentKey: EXPERIMENT_KEY,
                      variant: 'modern',
                    })}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="btn btn-cta"
                    data-experiment-key={EXPERIMENT_KEY}
                    data-variant="modern"
                    data-component-id="compare-modern-winner-overall"
                    data-placement="compare_table"
                    data-product-name={getWinner('effectiveness')?.name}
                  >
                    Check Price on Amazon <ExternalLink aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                  </a>
                )}
              </div>

              {/* Best Value */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ borderTop: `3px solid var(--color-brand)`, marginTop: 'calc(-1 * var(--space-6))', marginInline: 'calc(-1 * var(--space-6))', marginBottom: 'var(--space-4)', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }} />
                <DollarSign aria-hidden="true" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-brand)', margin: '0 auto var(--space-3)' }} />
                <h3 className="card-title">Best Value</h3>
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>{getWinner('dhmPerDollar')?.name}</p>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)' }}>Most DHM per dollar</p>
                {getWinner('dhmPerDollar')?.affiliateLink && (
                  <a
                    href={buildAffiliateUrl(getWinner('dhmPerDollar')?.affiliateLink, {
                      componentId: 'compare-modern-winner-value',
                      experimentKey: EXPERIMENT_KEY,
                      variant: 'modern',
                    })}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="btn btn-cta"
                    data-experiment-key={EXPERIMENT_KEY}
                    data-variant="modern"
                    data-component-id="compare-modern-winner-value"
                    data-placement="compare_table"
                    data-product-name={getWinner('dhmPerDollar')?.name}
                  >
                    Check Price on Amazon <ExternalLink aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                  </a>
                )}
              </div>

              {/* Most Popular */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ borderTop: `3px solid var(--color-brand)`, marginTop: 'calc(-1 * var(--space-6))', marginInline: 'calc(-1 * var(--space-6))', marginBottom: 'var(--space-4)', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }} />
                <Users aria-hidden="true" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-brand)', margin: '0 auto var(--space-3)' }} />
                <h3 className="card-title">Most Popular</h3>
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>{getWinner('reviews')?.name}</p>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)' }}>Most customer reviews</p>
                {getWinner('reviews')?.affiliateLink && (
                  <a
                    href={buildAffiliateUrl(getWinner('reviews')?.affiliateLink, {
                      componentId: 'compare-modern-winner-popular',
                      experimentKey: EXPERIMENT_KEY,
                      variant: 'modern',
                    })}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="btn btn-cta"
                    data-experiment-key={EXPERIMENT_KEY}
                    data-variant="modern"
                    data-component-id="compare-modern-winner-popular"
                    data-placement="compare_table"
                    data-product-name={getWinner('reviews')?.name}
                  >
                    Check Price on Amazon <ExternalLink aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
                  </a>
                )}
              </div>
            </div>

            <div className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-12)' }}>
              <Link
                to="/reviews"
                className="btn btn-secondary btn-lg"
                style={{ textDecoration: 'none' }}
                data-track="cta"
                data-cta-text="Read Full Product Analysis"
                data-cta-destination="/reviews"
              >
                Read Full Product Analysis
                <ArrowRight aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem' }} />
              </Link>
              <Link
                to="/guide"
                className="btn btn-ghost btn-lg"
                style={{ textDecoration: 'none' }}
                data-track="cta"
                data-cta-text="Read Buying Guide"
                data-cta-destination="/guide"
              >
                Read Buying Guide
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== POPULAR COMPARISON GUIDES ===================== */}
      <section className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <h2>Quick Head-to-Head Matchups</h2>
            <p className="lead">Detailed head-to-head analysis of popular DHM supplements</p>
          </header>

          <div className="grid-auto">
            {[
              { title: 'No Days Wasted vs NusaPure', slug: 'no-days-wasted-vs-nusapure-dhm-comparison-2025', desc: 'Premium vs budget DHM options' },
              { title: 'Double Wood vs No Days Wasted', slug: 'double-wood-vs-no-days-wasted-dhm-comparison-2025', desc: 'Value vs premium showdown' },
              { title: 'Flyby vs Double Wood', slug: 'flyby-vs-double-wood-complete-comparison-2025', desc: 'Two top-rated supplements' },
              { title: 'No Days Wasted vs Toniiq Ease', slug: 'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025', desc: 'Premium DHM face-off' },
              { title: 'Double Wood vs Cheers', slug: 'double-wood-vs-cheers-restore-dhm-comparison-2025', desc: 'Trusted brands compared' },
              { title: 'Flyby vs No Days Wasted', slug: 'flyby-vs-no-days-wasted-complete-comparison-2025', desc: 'Premium alternatives' },
              { title: 'No Days Wasted vs DHM Depot', slug: 'no-days-wasted-vs-dhm-depot-comparison-2025', desc: 'Brand vs bulk value' },
              { title: 'Double Wood vs Fuller Health', slug: 'double-wood-vs-fuller-health-after-party-comparison-2025', desc: 'Complete formulas compared' },
            ].map((comparison) => (
              <Link
                key={comparison.slug}
                to={`/never-hungover/${comparison.slug}`}
                className="card"
                style={{ display: 'block', textDecoration: 'none', height: '100%' }}
              >
                {/* Non-wrapping flex (not .cluster) so the icon stays beside a
                    wrapping title instead of floating above it; icon flex:0 0 auto,
                    top-aligned to the first line (#3). */}
                <h3 className="card-title" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--color-ink)', fontSize: '1.0625rem' }}>
                  <BarChart3 aria-hidden="true" style={{ width: '1.125rem', height: '1.125rem', flex: '0 0 auto', marginTop: '0.15em', color: 'var(--color-brand)' }} />
                  <span>{comparison.title}</span>
                </h3>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>{comparison.desc}</p>
                <span className="cluster" style={{ gap: 'var(--space-1)', marginTop: 'var(--space-3)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}>
                  Read comparison <ArrowRight aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }} />
                </span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link
              to="/never-hungover?tag=comparison"
              className="cluster"
              style={{ display: 'inline-flex', gap: 'var(--space-2)', color: 'var(--color-brand-strong)', fontWeight: 600, textDecoration: 'none' }}
            >
              Explore More Comparisons <ArrowRight aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <h2>Comparison FAQ</h2>
            <p className="lead">Common questions about comparing DHM supplements</p>
          </header>

          <div className="faq" style={{ maxWidth: '45rem', marginInline: 'auto' }}>
            <div className="faq-item" data-open="true">
              <div className="faq-q">How do you calculate the overall scores?</div>
              <div className="faq-a">
                <p>
                  Our overall scores are calculated using a weighted formula that considers effectiveness (40%),
                  value for money (25%), safety and quality (20%), and customer satisfaction (15%). Each factor
                  is scored based on scientific research, third-party testing results, and verified customer reviews.
                </p>
              </div>
            </div>

            <div className="faq-item" data-open="true">
              <div className="faq-q">What does "DHM per dollar" mean?</div>
              <div className="faq-a">
                <p>
                  This metric shows how many milligrams of DHM you get per dollar spent. It's calculated by
                  dividing the total DHM content per container by the product price. Higher values indicate
                  better value for money in terms of active ingredient content.
                </p>
              </div>
            </div>

            <div className="faq-item" data-open="true">
              <div className="faq-q">Why are some products more expensive?</div>
              <div className="faq-a">
                <p>
                  Price differences reflect factors like DHM concentration, additional beneficial ingredients,
                  manufacturing quality, third-party testing, brand reputation, and packaging. Premium products
                  often include complementary ingredients like L-Cysteine, Milk Thistle, or B-vitamins.
                </p>
              </div>
            </div>

            <div className="faq-item" data-open="true">
              <div className="faq-q">How often are prices and ratings updated?</div>
              <div className="faq-a">
                <p>
                  We update prices and customer ratings weekly to ensure accuracy. However, Amazon prices can
                  change frequently, so always check the current price on the product page before purchasing.
                  Our affiliate links always redirect to the most current pricing.
                </p>
              </div>
            </div>

            <div className="faq-item" data-open="true">
              <div className="faq-q">Which DHM supplement should I buy?</div>
              <div className="faq-a">
                <p>
                  For most people, we recommend No Days Wasted for its proven formula. Budget-conscious?
                  Double Wood offers pure DHM at the best price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
