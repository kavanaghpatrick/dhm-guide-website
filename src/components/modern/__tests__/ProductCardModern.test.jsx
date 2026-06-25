import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ProductCardModern from '../ProductCardModern.jsx'

// A representative product, shaped like one entry in src/data/topProducts.json.
const product = {
  id: 1,
  name: 'No Days Wasted DHM Detox',
  brand: 'No Days Wasted',
  rating: 4.3,
  reviews: 359,
  price: '$28.99',
  pricePerServing: '$1.93',
  servings: 15,
  dhm: '1000mg',
  purity: '98%+',
  badge: "Editor's Choice",
  score: 9.5,
  affiliateLink: 'https://amzn.to/3HSHjgu',
  pros: ['1000mg DHM + L-Cysteine', 'Wake up sharp', 'GMP certified'],
  cons: ['Higher price point', 'Only 15 servings'],
  bestFor: 'Weekend warriors who want the best',
  ingredients: ['DHM 1000mg'],
  freeShipping: true,
  category: 'premium',
}

const EXPERIMENT_KEY = 'reviews-modern-v1'

function renderCard(overrides = {}) {
  const props = { product, index: 0, experimentKey: EXPERIMENT_KEY, ...overrides }
  return render(<ProductCardModern {...props} />)
}

describe('ProductCardModern', () => {
  it('renders the product name', () => {
    renderCard()
    expect(screen.getByText(product.name)).toBeInTheDocument()
  })

  it('renders the affiliate CTA anchor with the correct rel + target', () => {
    renderCard()
    const anchor = screen.getByRole('link', { name: /check price on amazon/i })
    expect(anchor).toHaveAttribute('target', '_blank')
    expect(anchor).toHaveAttribute('rel', 'nofollow sponsored noopener noreferrer')
  })

  it('carries the three data-* tracking attributes the global listener reads', () => {
    renderCard({ index: 2 })
    const anchor = screen.getByRole('link', { name: /check price on amazon/i })
    expect(anchor).toHaveAttribute('data-experiment-key', EXPERIMENT_KEY)
    expect(anchor).toHaveAttribute('data-variant', 'modern')
    expect(anchor).toHaveAttribute('data-component-id', 'reviews-modern-card-cta-2')
  })

  it('builds the href via buildAffiliateUrl with utm_campaign carrying the key + variant', () => {
    renderCard()
    const anchor = screen.getByRole('link', { name: /check price on amazon/i })
    const href = anchor.getAttribute('href')

    // buildAffiliateUrl sets utm_campaign=<experimentKey>__<variant>
    const url = new URL(href)
    const campaign = url.searchParams.get('utm_campaign')
    expect(campaign).toContain('reviews-modern-v1')
    expect(campaign).toContain('modern')
    expect(campaign).toBe('reviews-modern-v1__modern')

    // The Amazon affiliate target (tag/shortlink) must be preserved.
    expect(href).toContain('amzn.to/3HSHjgu')
    // utm attribution params present.
    expect(url.searchParams.get('utm_content')).toBe('reviews-modern-card-cta-0')
  })

  it('has NO onclick handler on the anchor (global listener fires from data-*)', () => {
    renderCard()
    const anchor = screen.getByRole('link', { name: /check price on amazon/i })
    expect(anchor.onclick).toBeNull()
  })

  it('pins the CTA to the bottom with mt-auto for cross-card alignment', () => {
    renderCard()
    const anchor = screen.getByRole('link', { name: /check price on amazon/i })
    expect(anchor).toHaveClass('mt-auto')
  })

  it('adds the reviews-winner-card testid + emphasis when isWinner', () => {
    renderCard({ isWinner: true })
    const card = screen.getByTestId('reviews-winner-card')
    expect(card).toBeInTheDocument()
    // The winner CTA still lives inside the winner card.
    expect(
      within(card).getByRole('link', { name: /check price on amazon/i })
    ).toBeInTheDocument()
  })

  it('does NOT mark a non-winner card with the winner testid', () => {
    renderCard({ isWinner: false })
    expect(screen.queryByTestId('reviews-winner-card')).not.toBeInTheDocument()
  })
})
