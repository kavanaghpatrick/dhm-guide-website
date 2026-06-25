import React from 'react'
import { Star, Check, Minus, ShoppingCart } from 'lucide-react'
import { buildAffiliateUrl } from '../../lib/utm-builder.js'

/**
 * ProductCardModern — the "money component" for the /reviews modern A/B variant.
 *
 * Translates the approved demo `.product-card` markup
 * (docs/design-modernization-2026-06-25/demo/index.html) into a React component
 * built ONLY from the scoped `.theme-modern` classes in
 * src/styles/theme-modern.css. No new design tokens, no new Tailwind z-* classes.
 *
 * Conversion contract (from SHARED): the affiliate CTA is a plain <a> with the
 * data-* attributes the global click listener (src/hooks/useAffiliateTracking.js)
 * reads to fire `affiliate_link_click`. There is intentionally NO onClick handler
 * — adding one would double-count the click.
 *
 * Alignment fix (user-reported): the card is a full-height flex column
 * (`h-full flex flex-col`) and the CTA is pinned to the bottom with `mt-auto`, so
 * "Check Price on Amazon" buttons line up across cards of unequal content height.
 *
 * @param {object}  props
 * @param {object}  props.product        - one entry from src/data/topProducts.json
 * @param {number}  props.index          - 0-based position in the rendered list
 * @param {string}  props.experimentKey  - active flag key, e.g. "reviews-modern-v1"
 * @param {boolean} [props.isWinner]     - true for the #1 / editor's pick card
 */
export default function ProductCardModern({ product, index, experimentKey, isWinner = false }) {
  const componentId = `reviews-modern-card-cta-${index}`

  // Star rating: round to nearest whole for the filled/empty split (5-star scale).
  const rating = Number(product.rating) || 0
  const filledStars = Math.round(rating)
  const stars = Array.from({ length: 5 }, (_, i) => i < filledStars)
  // Always display one decimal so a whole-number rating (e.g. 4) never renders a
  // bare "4" next to its peers' "4.3" (finding #4).
  const ratingLabel = rating.toFixed(1)

  // Pros / cons: keep the card scannable, but NEVER silently drop a con — the
  // cons are the deciding information (finding #28). Show up to 3 pros and ALL
  // cons (each product has only 2–3), then a single "+N more" that accounts for
  // any hidden pros so the count is honest and card heights stay even.
  const allPros = product.pros ?? []
  const allCons = product.cons ?? []
  const pros = allPros.slice(0, 3)
  const cons = allCons
  const hiddenCount = allPros.length - pros.length

  // Winner emphasis (finding #27): orange is reserved for the ONE conversion
  // element (the CTA). The winner gets a GREEN brand edge + brand border + a
  // green "Editor's pick" badge, so the card reads as "trusted" without stacking
  // three orange signals against the single orange buy button. No new tokens.
  const winnerStyle = isWinner
    ? {
        boxShadow:
          'inset 4px 0 0 0 var(--color-brand), var(--elev-2)',
        borderColor: 'var(--color-brand)',
      }
    : undefined

  return (
    <article
      className="card-raised product-card h-full flex flex-col"
      style={winnerStyle}
      data-track="product"
      data-product-position={index + 1}
      data-product-name={product.name}
      data-testid={isWinner ? 'reviews-winner-card' : undefined}
    >
      {isWinner && (
        <span className="badge badge-brand" style={{ alignSelf: 'flex-start' }}>
          Editor&rsquo;s pick
        </span>
      )}

      <div className="stack" style={{ '--stack-gap': 'var(--space-2)' }}>
        <p className="product-value" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {product.brand}
        </p>
        <h3 className="product-brand">{product.name}</h3>

        <div className="cluster" style={{ gap: 'var(--space-3)' }}>
          <span
            className="stars"
            role="img"
            aria-label={`Rated ${ratingLabel} out of 5`}
          >
            {stars.map((filled, i) => (
              <Star
                key={i}
                aria-hidden="true"
                className={filled ? undefined : 'is-empty'}
                style={filled
                  ? { fill: 'currentColor', stroke: 'currentColor' }
                  : { fill: 'none', color: 'var(--color-border)' }}
              />
            ))}
          </span>
          <span className="rating-meta">
            <strong>{ratingLabel}</strong>
            {' · '}
            {(product.reviews ?? 0).toLocaleString()} reviews
          </span>
        </div>

        <div className="product-price">
          <span className="product-price__amount">{product.price}</span>
          <span className="product-price__unit">
            {product.pricePerServing} / serving · {product.servings} servings
          </span>
        </div>
      </div>

      <ul className="proscons">
        {pros.map((pro, i) => (
          <li key={`pro-${i}`} className="pro">
            <Check aria-hidden="true" /> {pro}
          </li>
        ))}
        {cons.map((con, i) => (
          <li key={`con-${i}`} className="con">
            <Minus aria-hidden="true" /> {con}
          </li>
        ))}
        {hiddenCount > 0 && (
          <li
            className="product-value"
            style={{ gridColumn: '1 / -1', fontSize: 'var(--text-small)' }}
          >
            +{hiddenCount} more {hiddenCount === 1 ? 'benefit' : 'benefits'}
          </li>
        )}
      </ul>

      <p className="product-value">
        <strong>Best for:</strong> {product.bestFor}
      </p>

      <a
        className="btn btn-cta btn-block mt-auto"
        href={buildAffiliateUrl(product.affiliateLink, {
          componentId,
          experimentKey,
          variant: 'modern',
        })}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        data-experiment-key={experimentKey}
        data-variant="modern"
        data-component-id={componentId}
        data-position-index={index}
        data-placement="product_card"
        data-product-name={product.name}
      >
        <ShoppingCart aria-hidden="true" />
        Check Price on Amazon
      </a>
    </article>
  )
}
