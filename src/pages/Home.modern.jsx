import React, { useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import {
  Star,
  Shield,
  Brain,
  Check,
  ArrowRight,
  SearchCheck,
  FlaskConical,
  MessagesSquare,
} from 'lucide-react'
import topProductsData from '@/data/topProducts.json'
import ProductCardModern from '../components/modern/ProductCardModern.jsx'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import '../styles/theme-modern.css'

/**
 * Home.modern — the "modern" A/B variant of the homepage (flag "home-modern-v1").
 *
 * A flag-gated restyle of the homepage hero + key sections in the approved 2026
 * design language (docs/design-modernization-2026-06-25): warm paper palette,
 * Fraunces display + Inter text, border-first cards, and a single saturated
 * orange reserved for conversion. Built ONLY from the scoped `.theme-modern`
 * classes in src/styles/theme-modern.css — no new design tokens, no Tailwind
 * z-* classes, no gradient headings, no parallax.
 *
 * Shared/control surfaces (Home.jsx, Reviews.jsx, Layout.jsx, ui/* primitives,
 * InlineComparisonTable) are NOT touched. This file is additive.
 *
 * Conversion contract: affiliate CTAs live inside ProductCardModern, which
 * emits the plain <a> + data-* attributes the global click listener
 * (src/hooks/useAffiliateTracking.js) reads to fire `affiliate_link_click`.
 * There is intentionally NO onClick — adding one would double-count.
 */

const EXPERIMENT_KEY = 'home-modern-v1'

export default function HomeModern() {
  // Reuse the canonical homepage SEO (same title/description/schema as control).
  useSEO(generatePageSEO('home'))

  // Only the variant arm pays the preload cost (control never imports this).
  useEffect(() => {
    preloadModernFonts()
  }, [])

  // Top-3 picks reuse the SAME canonical data as control (no new data).
  // Mirror Home.jsx's selection: ids 1, 2, 5 (editor's pick, value, best blend).
  const topProductsById = Object.fromEntries(topProductsData.map((p) => [p.id, p]))
  const topProducts = [1, 2, 5]
    .map((id) => topProductsById[id])
    .filter(Boolean)

  return (
    <div className="theme-modern">
      {/* ===================================================================
          HERO — editorial headline, trust row, orange CTA + ghost secondary,
          dual-pathway as two border-first cards (NOT a gradient banner).
          Solid-ink Fraunces H1 with exactly ONE brand-green accent word.
          No parallax, no gradient clip-text.
          =================================================================== */}
      <section className="hero surface-wash" data-testid="home-hero-modern">
        <div className="container">
          <div className="hero__grid">

            {/* LEFT: headline, lead, CTAs, trust signals */}
            <div>
              <span className="eyebrow">UCLA-discovered · clinically studied</span>

              <h1 className="hero__title">
                Never wake up <span className="accent">hungover</span> again.
              </h1>

              <p className="lead hero__lead">
                DHM is the plant flavonoid that supports your body&rsquo;s natural
                alcohol metabolism &mdash; clearing the toxin that causes the morning
                after before it starts. We test the brands so you don&rsquo;t have to
                guess.
              </p>

              <div className="hero__actions">
                {/* Primary CTA — the single orange focal point. Internal link to
                    the reviews hub (conversion path), not affiliate. */}
                <Link className="btn btn-cta btn-lg" to="/reviews">
                  <SearchCheck aria-hidden="true" />
                  Find My Supplement
                </Link>
                {/* Ghost secondary — stays neutral so it never competes with the CTA. */}
                <Link className="btn btn-ghost btn-lg" to="/guide">
                  Read the science
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>

              <div className="trust-row">
                <span className="trust-row__item">
                  <span
                    className="stars"
                    role="img"
                    aria-label="Rated 4.4 out of 5"
                  >
                    {[true, true, true, true, false].map((filled, i) => (
                      <Star
                        key={i}
                        aria-hidden="true"
                        className={filled ? undefined : 'is-empty'}
                        style={
                          filled
                            ? {
                                width: '1.05em',
                                height: '1.05em',
                                fill: 'currentColor',
                                stroke: 'currentColor',
                              }
                            : {
                                width: '1.05em',
                                height: '1.05em',
                                fill: 'none',
                                color: 'var(--color-border)',
                              }
                        }
                      />
                    ))}
                  </span>
                  <strong>4.4</strong>&nbsp;avg rating
                </span>
                <span className="trust-row__divider" aria-hidden="true"></span>
                <span className="trust-row__item">
                  <FlaskConical aria-hidden="true" />
                  <strong>20+</strong>&nbsp;brands tested
                </span>
                <span className="trust-row__divider" aria-hidden="true"></span>
                <span className="trust-row__item">
                  <MessagesSquare aria-hidden="true" />
                  <strong>5,000+</strong>&nbsp;reviews analyzed
                </span>
              </div>
            </div>

            {/* RIGHT: dual-pathway as TWO tier-0 bordered cards (no gradient banner) */}
            <div>
              <p className="eyebrow" style={{ color: 'var(--color-ink-soft)' }}>
                How it protects you
              </p>
              <div className="pathways">
                <article className="card pathway">
                  <span className="pathway__icon">
                    <Shield
                      aria-hidden="true"
                      style={{ width: '22px', height: '22px' }}
                    />
                  </span>
                  <h3 className="pathway__title">Liver protection</h3>
                  <p className="pathway__body">
                    Supports the enzymes (ADH &amp; ALDH) that break alcohol down, so
                    acetaldehyde &mdash; the toxin behind nausea and headaches &mdash;
                    is cleared faster.
                  </p>
                </article>
                <article className="card pathway">
                  <span className="pathway__icon">
                    <Brain
                      aria-hidden="true"
                      style={{ width: '22px', height: '22px' }}
                    />
                  </span>
                  <h3 className="pathway__title">Brain protection</h3>
                  <p className="pathway__body">
                    Helps restore GABA receptor balance after drinking, so you wake up
                    clear-headed and focused instead of foggy and rattled.
                  </p>
                </article>
              </div>
              <p className="pathways__note">
                <Check
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '1em',
                    height: '1em',
                    verticalAlign: '-0.12em',
                    color: 'var(--color-brand)',
                  }}
                />{' '}
                Two pathways, one supplement &mdash; the dual-action approach backed by
                clinical research.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================
          TOP PICKS — reuse the canonical top-3 products via ProductCardModern.
          Affiliate CTAs inside each card follow the attribution contract with
          experimentKey="home-modern-v1".
          =================================================================== */}
      <section className="section">
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">Editor&rsquo;s top picks · 2026</span>
            <h2>
              The 3 DHM supplements <span className="accent">actually</span> worth
              buying
            </h2>
            <p className="lead">
              Ranked by per-serving DHM dose, third-party lab results, and 5,000+ real
              reviews. Every pick is independently tested &mdash; no pay-to-rank.
            </p>
          </header>

          <div className="picks-grid">
            {topProducts.map((product, index) => (
              <ProductCardModern
                key={product.id}
                product={product}
                index={index}
                experimentKey={EXPERIMENT_KEY}
                isWinner={index === 0}
              />
            ))}
          </div>

          <div
            className="cluster"
            style={{ justifyContent: 'center', marginTop: 'var(--space-12)' }}
          >
            <Link className="btn btn-secondary btn-lg" to="/reviews">
              See full comparison
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FINAL CTA BAND — calm brand surface, primary orange CTA to reviews,
          neutral secondary to the dosage calculator. Keeps internal
          conversion links to /reviews and /dhm-dosage-calculator.
          =================================================================== */}
      <section className="section surface-brand">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Ready to skip the hangover?</span>
            <h2>Find the right DHM supplement in 60&nbsp;seconds.</h2>
            <p className="lead">
              Compare doses, prices, and lab results side by side &mdash; or calculate
              the dose that fits how you actually drink.
            </p>
            <div className="cta-band__actions">
              <Link className="btn btn-cta btn-lg" to="/reviews">
                <SearchCheck aria-hidden="true" />
                Find My Supplement
              </Link>
              <Link className="btn btn-secondary btn-lg" to="/dhm-dosage-calculator">
                Calculate your dosage
              </Link>
            </div>
            <p className="cta-band__reassure">
              Independent rankings &mdash; we may earn a commission, at no cost to you.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
