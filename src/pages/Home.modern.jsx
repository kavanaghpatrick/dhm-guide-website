import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import topProductsData from '@/data/topProducts.json'
import ProductCardModern from '../components/modern/ProductCardModern.jsx'
import '../styles/theme-modern.css'

/**
 * Home (modern). The shortest buy path on the site: a short hero, the same top
 * three as /reviews, then the calculator. Built from the scoped `.theme-modern`
 * classes in src/styles/theme-modern.css.
 *
 * Orange means "buy on Amazon", so only the product cards use .btn-cta; the
 * internal CTAs use the brand-green primary or the bordered secondary.
 *
 * Conversion contract: affiliate CTAs live inside ProductCardModern, which
 * emits the plain <a> + data-* attributes the global click listener
 * (src/hooks/useAffiliateTracking.js) reads to fire `affiliate_link_click`.
 * There is intentionally NO onClick, since adding one would double-count.
 */

const EXPERIMENT_KEY = 'site-modern-v1'

// Same order as /reviews under its default "Our Pick" sort (score, high to low),
// so a reader who clicks through sees the same top three.
const topProducts = [...topProductsData].sort((a, b) => b.score - a.score).slice(0, 3)

const primary = {
  backgroundColor: 'var(--color-brand)',
  borderColor: 'var(--color-brand)',
  color: 'var(--color-on-brand)',
}

export default function HomeModern() {
  useSEO(generatePageSEO('home'))

  return (
    <div className="theme-modern">
      <section className="hero" data-testid="home-hero-modern" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container">
          <div style={{ maxWidth: '40rem' }}>
            <h1 className="hero__title">
              DHM supplements, compared on dose, price and evidence.
            </h1>

            <p className="lead hero__lead">
              DHM is a plant compound sold to prevent hangovers. Most of what is known comes
              from rats and mice, and no trial has tested DHM capsules on hangovers.
            </p>

            <div className="hero__actions" style={{ alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <Link className="btn btn-lg" style={primary} to="/reviews">
                See all eight ranked
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/guide"
                style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, paddingInline: 'var(--space-2)', color: 'var(--color-accent)', fontWeight: 600 }}
              >
                Read the guide
              </Link>
            </div>

            <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
              We earn a commission if you buy through our links, at no cost to you.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section-head">
            <h2>The three we rank highest</h2>
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
              Compare all eight
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Dose</span>
            <h2>Work out how much to take</h2>
            <p className="lead">
              The calculator gives a starting dose from your weight and what you plan to drink,
              then shows the cheapest product that delivers it.
            </p>
            <div className="cta-band__actions">
              <Link className="btn btn-lg" style={primary} to="/dhm-dosage-calculator">
                Calculate your dose
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
