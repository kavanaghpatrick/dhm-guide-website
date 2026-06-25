import React from 'react';
import { Star } from 'lucide-react';
import { buildAffiliateUrl } from '../../lib/utm-builder.js';

/**
 * ComparisonTableModern — the modern-variant ("reviews-modern-v1") comparison
 * table. Renders the SAME topProducts data the CONTROL table renders, restyled
 * with the approved `.theme-modern` `.compare` table styling (paper palette,
 * border-first, orange-only CTA). It is rendered INSIDE a `.theme-modern`
 * wrapper by the variant page, so the scoped CSS in src/styles/theme-modern.css
 * applies. No new data, no new design tokens.
 *
 * Parity contract with the control table (src/components/InlineComparisonTable.jsx):
 *   - <table id="comparison-table"> wrapper id is preserved.
 *   - The first/winner row carries data-testid="comparison-winner-row".
 *   - Each Action CTA is a plain <a> built with buildAffiliateUrl + the
 *     data-experiment-key / data-variant / data-component-id attributes the
 *     global affiliate click listener (src/hooks/useAffiliateTracking.js) reads.
 *     There is intentionally NO onClick — the global listener fires the event.
 *
 * Columns: Product · Rating · DHM · Price / serving · Action.
 *
 * Responsive (audit #1): the 5-column table is fine on >=640px but on a 390px
 * phone the `overflow-x:auto` table clipped Rating/DHM/Price AND the orange
 * Amazon CTA off-screen with no scroll cue. Below the `sm` breakpoint we hide
 * the table and render a stacked per-product card (same pattern as
 * Compare.modern's `lg:hidden` cards) so every field — and a full-width orange
 * CTA — is visible without horizontal scrolling.
 *
 * @param {object} props
 * @param {Array<object>} props.products       - ordered product objects (topProducts.json shape)
 * @param {string} props.experimentKey         - active experiment flag key (e.g. "reviews-modern-v1")
 */

// Warm gold review star — matches the filled gold star on ProductCardModern /
// Compare.modern cards (audit #30). Not the CTA orange.
const STAR_GOLD = '#E8A317';

function ratingLabel(rating) {
  // audit #4 — a bare "4" reads as unfinished; show one decimal place.
  const n = Number(rating);
  return Number.isFinite(n) ? n.toFixed(1) : rating;
}

export default function ComparisonTableModern({ products, experimentKey }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <>
      {/* ---- Desktop / tablet: the .compare table (>=640px) ---- */}
      <div className="compare-scroll hidden sm:block">
        <table id="comparison-table" className="compare">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Rating</th>
              <th scope="col">DHM</th>
              <th scope="col">Price / serving</th>
              <th scope="col" className="action-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const isWinner = index === 0;
              const componentId = `reviews-modern-table-cta-${index}`;
              return (
                <tr
                  key={product.id ?? index}
                  data-testid={isWinner ? 'comparison-winner-row' : undefined}
                  className={isWinner ? 'row-winner' : undefined}
                >
                  <td className="product-cell">
                    {product.name}
                    {isWinner && (
                      <span className="badge badge-brand" style={{ marginLeft: 'var(--space-2)' }}>
                        Best
                      </span>
                    )}
                  </td>
                  <td className="num">
                    <span className="rating-meta">
                      {/* filled gold star, matching the cards (audit #30) */}
                      <Star
                        aria-hidden="true"
                        focusable="false"
                        style={{ width: '1rem', height: '1rem', fill: STAR_GOLD, stroke: STAR_GOLD }}
                      />
                      <strong>{ratingLabel(product.rating)}</strong>
                    </span>
                  </td>
                  <td className="num">{product.dhm}</td>
                  <td className="num">{product.pricePerServing}</td>
                  <td
                    className="action-cell"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {/* Affiliate CTA contract — NO onClick; the global listener
                        (useAffiliateTracking) fires affiliate_link_click from the
                        data-* attributes. min-height 44px keeps a coarse-pointer
                        touch target on mobile. */}
                    <a
                      href={buildAffiliateUrl(product.affiliateLink, {
                        componentId,
                        experimentKey,
                        variant: 'modern',
                      })}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="btn btn-cta btn-sm"
                      style={{ minHeight: '44px' }}
                      data-experiment-key={experimentKey}
                      data-variant="modern"
                      data-component-id={componentId}
                      data-position-index={index}
                      data-placement="product_card"
                      data-product-name={product.name}
                    >
                      Check Price on Amazon
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile: stacked per-product cards (<640px) — audit #1 ----
          Mirrors the desktop table data so Rating / DHM / Price / serving AND a
          full-width orange CTA are all visible without horizontal scrolling.
          The CTA carries data-placement="product_card_mobile" so it does not
          collide with the desktop table's "product_card" CTAs. */}
      <div className="stack sm:hidden" style={{ '--stack-gap': 'var(--space-4)' }}>
        {products.map((product, index) => {
          const isWinner = index === 0;
          const componentId = `reviews-modern-table-card-cta-${index}`;
          return (
            <article
              key={product.id ?? index}
              className="card-raised"
              data-testid={isWinner ? 'comparison-winner-card' : undefined}
              style={
                isWinner
                  ? { borderColor: 'var(--color-brand)', backgroundColor: 'var(--color-brand-soft)' }
                  : undefined
              }
            >
              <div
                className="cluster"
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'nowrap',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <h3 className="card-title" style={{ marginBottom: 0 }}>{product.name}</h3>
                {isWinner && <span className="badge badge-brand">Best</span>}
              </div>

              <dl
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'var(--space-2) var(--space-3)',
                  margin: '0 0 var(--space-4)',
                }}
              >
                <dt className="text-soft" style={{ fontSize: 'var(--text-small)' }}>Rating</dt>
                <dd style={{ margin: 0, textAlign: 'right' }}>
                  <span className="rating-meta">
                    <Star
                      aria-hidden="true"
                      focusable="false"
                      style={{ width: '1rem', height: '1rem', fill: STAR_GOLD, stroke: STAR_GOLD }}
                    />
                    <strong>{ratingLabel(product.rating)}</strong>
                  </span>
                </dd>

                <dt className="text-soft" style={{ fontSize: 'var(--text-small)' }}>DHM</dt>
                <dd className="num" style={{ margin: 0, textAlign: 'right', color: 'var(--color-ink)' }}>
                  {product.dhm}
                </dd>

                <dt className="text-soft" style={{ fontSize: 'var(--text-small)' }}>Price / serving</dt>
                <dd className="num" style={{ margin: 0, textAlign: 'right', color: 'var(--color-ink)' }}>
                  {product.pricePerServing}
                </dd>
              </dl>

              {/* Full-width orange CTA — same affiliate contract as the table
                  (plain <a>, buildAffiliateUrl, data-* attrs, NO onClick). */}
              <a
                href={buildAffiliateUrl(product.affiliateLink, {
                  componentId,
                  experimentKey,
                  variant: 'modern',
                })}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="btn btn-cta btn-block"
                style={{ minHeight: '48px' }}
                data-experiment-key={experimentKey}
                data-variant="modern"
                data-component-id={componentId}
                data-position-index={index}
                data-placement="product_card_mobile"
                data-product-name={product.name}
              >
                Check Price on Amazon
              </a>
            </article>
          );
        })}
      </div>
    </>
  );
}
