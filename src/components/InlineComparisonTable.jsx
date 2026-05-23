import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import topProductsData from '../data/topProducts.json';

/**
 * Reusable comparison table that can be dropped into any page (Reviews,
 * dosage guide, supplements guide, etc) to surface Amazon affiliate links.
 *
 * IMPORTANT: The `full` variant is byte-identical (in DOM output) to the
 * inline table currently living in src/pages/Reviews.jsx:362-490, so the
 * eventual Reviews.jsx swap is invisible to users and to GSC.
 *
 * The `compact` variant is a 4-column trimmed version designed for mid-article
 * placement inside markdown bodies, where horizontal scroll would be jarring.
 *
 * @param {object} props
 * @param {'compact'|'full'} props.variant   - required: 4 cols (compact) or 8 cols (full)
 * @param {number[]} [props.productIds]      - optional ordered ids; defaults to topProducts order
 * @param {string} props.placement           - PostHog data-placement value (passed verbatim)
 * @param {string} [props.heading]           - optional h3 above the table
 * @param {string} [props.subhead]           - optional subhead below the heading
 * @param {number} [props.mobilePillRowLimit] - full variant only: render a mobile-only "Check Price" pill inside the Price cell for the first N rows (default 0 = off). The CTA column already covers desktop; this surfaces the CTA in the Price cell on mobile where the rightmost Action column may be off-screen.
 */
export default function InlineComparisonTable({
  variant,
  productIds,
  placement,
  heading,
  subhead,
  mobilePillRowLimit = 0,
}) {
  if (variant !== 'compact' && variant !== 'full') {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(`[InlineComparisonTable] Unknown variant "${variant}"; expected "compact" or "full".`);
    }
    return null;
  }
  if (typeof placement !== 'string' || placement.length === 0) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn('[InlineComparisonTable] Missing required prop "placement".');
    }
    return null;
  }

  // Resolve products. When productIds is provided, preserve that order and
  // drop unknown ids silently. Otherwise use the full topProducts list as-is
  // (matches Reviews.jsx).
  let products;
  if (Array.isArray(productIds) && productIds.length > 0) {
    const byId = new Map(topProductsData.map((p) => [p.id, p]));
    products = productIds
      .map((id) => byId.get(id))
      .filter((p) => p !== undefined);
  } else {
    products = topProductsData;
  }
  if (products.length === 0) return null;

  // Shared CTA classes (kept in sync with Reviews.jsx tableCtaClasses).
  const tableCtaClasses =
    'inline-flex items-center gap-1 px-4 py-2.5 min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap';

  const renderHeader = () => {
    if (!heading && !subhead) return null;
    return (
      <div className="mb-4 text-center">
        {heading && (
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{heading}</h3>
        )}
        {subhead && <p className="text-gray-600 mt-1">{subhead}</p>}
      </div>
    );
  };

  if (variant === 'full') {
    // Byte-identical to src/pages/Reviews.jsx:379-483 (the inline table JSX).
    // Only difference: `data-placement` is the caller-supplied prop, and each
    // row carries a `data-component-id` for per-component CVR rollup.
    return (
      <div className="not-prose">
        {renderHeader()}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="py-3 px-4 text-left font-semibold">Brand</th>
                <th className="py-3 px-4 text-center font-semibold hidden md:table-cell">DHM</th>
                <th className="py-3 px-4 text-center font-semibold">Price</th>
                <th className="py-3 px-4 text-center font-semibold hidden md:table-cell">Per Serving</th>
                <th className="py-3 px-4 text-center font-semibold">Rating</th>
                <th className="py-3 px-4 text-center font-semibold hidden md:table-cell">Reviews</th>
                <th className="py-3 px-4 text-center font-semibold">Score</th>
                <th className="py-3 px-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const componentId = `${placement}-row-${index}`;
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="block hover:text-green-700 transition-colors"
                        data-placement={placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={componentId}
                      >
                        <div className="font-semibold text-gray-900 hover:text-green-700 hover:underline">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.brand}</div>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-green-700 hidden md:table-cell">{product.dhm}</td>
                    <td className="py-3 px-4 text-center min-h-[64px]">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="block hover:text-green-700"
                        data-placement={index < mobilePillRowLimit ? 'comparison_table_mobile_pricecell' : placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={index < mobilePillRowLimit ? `${placement}-pricecell-${index}` : componentId}
                      >
                        <span className="block font-semibold text-gray-900 hover:underline">{product.price}</span>
                        {index < mobilePillRowLimit && (
                          <span className="inline-flex md:hidden mt-1 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded items-center gap-1 min-h-[36px]">
                            Check Price <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="text-gray-700 hover:text-green-700 hover:underline"
                        data-placement={placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={componentId}
                      >
                        {product.pricePerServing}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="flex items-center justify-center space-x-1 hover:text-green-700"
                        data-placement={placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={componentId}
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium hover:underline">{product.rating}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 hidden md:table-cell">{product.reviews.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="font-bold text-green-700 hover:text-green-800 hover:underline"
                        data-placement={placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={componentId}
                      >
                        {product.score}/10
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={product.affiliateLink}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        data-placement={placement}
                        data-product-name={product.name}
                        data-ratings-version="2026-01-01"
                        data-component-id={componentId}
                        className={tableCtaClasses}
                      >
                        Check Price
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Compact variant: 4 columns (Product, Dose, Best For, Action).
  // Sized to fit mid-article placement on mobile without horizontal scroll.
  return (
    <div className="not-prose my-6">
      {renderHeader()}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="py-3 px-3 md:px-4 text-left font-semibold text-sm md:text-base">Product</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold text-sm md:text-base">Dose</th>
              <th className="py-3 px-2 md:px-4 text-left font-semibold text-sm md:text-base hidden sm:table-cell">Best For</th>
              <th className="py-3 px-3 md:px-4 text-center font-semibold text-sm md:text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const componentId = `${placement}-row-${index}`;
              return (
                <tr
                  key={product.id}
                  className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-3 md:px-4">
                    <a
                      href={product.affiliateLink}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="block hover:text-green-700 transition-colors"
                      data-placement={placement}
                      data-product-name={product.name}
                      data-ratings-version="2026-01-01"
                      data-component-id={componentId}
                    >
                      <div className="font-semibold text-gray-900 hover:text-green-700 hover:underline text-sm md:text-base">{product.brand}</div>
                      <div className="text-xs md:text-sm text-gray-600">{product.name}</div>
                    </a>
                  </td>
                  <td className="py-3 px-2 md:px-4 text-center font-medium text-green-700 text-sm md:text-base">{product.dhm}</td>
                  <td className="py-3 px-2 md:px-4 text-gray-700 text-xs md:text-sm hidden sm:table-cell">{product.bestFor}</td>
                  <td className="py-3 px-3 md:px-4 text-center">
                    <a
                      href={product.affiliateLink}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      data-placement={placement}
                      data-product-name={product.name}
                      data-ratings-version="2026-01-01"
                      data-component-id={componentId}
                      className={`${tableCtaClasses} min-h-[48px]`}
                    >
                      Check Price
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
