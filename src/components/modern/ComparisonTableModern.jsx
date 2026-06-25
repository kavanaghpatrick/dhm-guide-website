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
 * Columns: Product · Rating · DHM · Price · Action.
 *
 * @param {object} props
 * @param {Array<object>} props.products       - ordered product objects (topProducts.json shape)
 * @param {string} props.experimentKey         - active experiment flag key (e.g. "reviews-modern-v1")
 */
export default function ComparisonTableModern({ products, experimentKey }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <div className="compare-scroll">
      <table id="comparison-table" className="compare">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Rating</th>
            <th scope="col">DHM</th>
            <th scope="col">Price</th>
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
                    <Star aria-hidden="true" focusable="false" />
                    <strong>{product.rating}</strong>
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
  );
}
