import React from 'react'
import { buildAffiliateUrl } from '../../lib/utm-builder.js'

const EXPERIMENT_KEY = 'site-modern-v1'

/**
 * A plain Amazon affiliate <a> for the money pages.
 *
 * Tracking contract: NO onClick. The global listener (src/hooks/useAffiliateTracking.js)
 * fires affiliate_link_click from these data-* attributes; a handler here would
 * double-count. The tag=dhmguide-20 in product.affiliateLink is left untouched.
 */
export default function AmazonLink({ product, componentId, placement, position, className, children }) {
  return (
    <a
      href={buildAffiliateUrl(product.affiliateLink, {
        componentId,
        experimentKey: EXPERIMENT_KEY,
        variant: 'modern',
      })}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={className}
      data-experiment-key={EXPERIMENT_KEY}
      data-variant="modern"
      data-component-id={componentId}
      data-position-index={position}
      data-placement={placement}
      data-product-name={product.name}
    >
      {children}
    </a>
  )
}
