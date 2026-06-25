import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonTableModern from '../ComparisonTableModern.jsx';
import { buildAffiliateUrl } from '../../../lib/utm-builder.js';

const EXPERIMENT_KEY = 'reviews-modern-v1';

// Minimal topProducts.json-shaped fixtures (no new data; just the fields the
// table reads). Order matters — index 0 is the winner.
const products = [
  {
    id: 1,
    name: 'No Days Wasted DHM Detox',
    rating: 4.3,
    dhm: '1000mg',
    pricePerServing: '$1.93',
    affiliateLink: 'https://amzn.to/3HSHjgu',
  },
  {
    id: 2,
    name: 'Double Wood Supplements DHM',
    rating: 4.4,
    dhm: '1000mg',
    pricePerServing: '$0.80',
    affiliateLink: 'https://amzn.to/double-wood',
  },
  {
    id: 3,
    name: 'Cheers Restore',
    rating: 4.1,
    dhm: '300mg',
    pricePerServing: '$2.92',
    affiliateLink: 'https://amzn.to/cheers',
  },
];

function setup() {
  return render(
    <ComparisonTableModern products={products} experimentKey={EXPERIMENT_KEY} />
  );
}

describe('ComparisonTableModern', () => {
  it('renders a <table id="comparison-table"> with the theme .compare styling', () => {
    const { container } = setup();
    const table = container.querySelector('table#comparison-table');
    expect(table).not.toBeNull();
    expect(table).toHaveClass('compare');
  });

  it('marks the first row as the winner via data-testid="comparison-winner-row"', () => {
    setup();
    const winnerRow = screen.getByTestId('comparison-winner-row');
    expect(winnerRow).toBeInTheDocument();
    // It is the winner row → carries the theme row-winner class and the first product.
    expect(winnerRow).toHaveClass('row-winner');
    expect(winnerRow).toHaveTextContent('No Days Wasted DHM Detox');
  });

  it('renders exactly one winner row (testids are unique)', () => {
    setup();
    expect(screen.getAllByTestId('comparison-winner-row')).toHaveLength(1);
  });

  it('renders one Action CTA per product with the affiliate tracking contract', () => {
    const { container } = setup();
    const ctas = container.querySelectorAll('a[data-placement="product_card"]');
    expect(ctas).toHaveLength(products.length);

    ctas.forEach((cta, index) => {
      const product = products[index];
      const componentId = `reviews-modern-table-cta-${index}`;

      // Visible label per the CTA contract.
      expect(cta).toHaveTextContent('Check Price on Amazon');

      // href is built with buildAffiliateUrl (utm_* + experiment campaign params).
      const expectedHref = buildAffiliateUrl(product.affiliateLink, {
        componentId,
        experimentKey: EXPERIMENT_KEY,
        variant: 'modern',
      });
      expect(cta).toHaveAttribute('href', expectedHref);

      // Security / SEO attributes.
      expect(cta).toHaveAttribute('target', '_blank');
      expect(cta).toHaveAttribute('rel', 'nofollow sponsored noopener noreferrer');

      // Tracking data-* the global affiliate listener reads.
      expect(cta).toHaveAttribute('data-experiment-key', EXPERIMENT_KEY);
      expect(cta).toHaveAttribute('data-variant', 'modern');
      expect(cta).toHaveAttribute('data-component-id', componentId);
      expect(cta).toHaveAttribute('data-position-index', String(index));
      expect(cta).toHaveAttribute('data-product-name', product.name);

      // NO onClick — the global listener fires the event (avoids double-count).
      expect(cta).not.toHaveAttribute('onclick');
      expect(cta.onclick).toBeNull();
    });
  });

  it('keeps the winner CTA href anchored to componentId index 0', () => {
    const { container } = setup();
    const winnerCta = container.querySelector(
      'a[data-component-id="reviews-modern-table-cta-0"]'
    );
    expect(winnerCta).not.toBeNull();
    expect(winnerCta).toHaveAttribute('data-position-index', '0');
    expect(winnerCta.getAttribute('href')).toContain('utm_content=reviews-modern-table-cta-0');
  });

  it('renders the comparison column headers (Product, Rating, DHM, Price / serving, Action)', () => {
    setup();
    ['Product', 'Rating', 'DHM', 'Price / serving', 'Action'].forEach((label) => {
      expect(
        screen.getByRole('columnheader', { name: label })
      ).toBeInTheDocument();
    });
  });

  it('returns null when given no products', () => {
    const { container } = render(
      <ComparisonTableModern products={[]} experimentKey={EXPERIMENT_KEY} />
    );
    expect(container.querySelector('table#comparison-table')).toBeNull();
  });
});
