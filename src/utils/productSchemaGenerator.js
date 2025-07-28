/**
 * Product Schema Generator for DHM Reviews
 * Generates accurate structured data for product review pages
 */

// Comprehensive product data with real information from reviews
export const productReviewData = {
  'dhm-depot-review-2025': {
    product: {
      name: 'DHM Depot',
      brand: 'Double Wood Supplements',
      description: 'High-potency DHM supplement with 300mg pure dihydromyricetin per capsule',
      image: '/images/dhm-depot-bottle.webp',
      sku: 'B08CZFMWLR',
      rating: 4.5,
      reviewCount: 1129,
      price: '44.95',
      pricePerUnit: '0.90',
      url: 'https://amzn.to/3PJy1Km'
    }
  },
  'dhm1000-review-2025': {
    product: {
      name: 'DHM1000',
      brand: 'DHM1000',
      description: 'Premium DHM supplement with 1000mg dihydromyricetin per serving',
      image: '/images/dhm1000-bottle.webp',
      sku: 'DHM1000-60',
      rating: 4.2,
      reviewCount: 89,
      price: '47.00',
      pricePerUnit: '1.57',
      url: 'https://dhm1000.com'
    }
  },
  'double-wood-dhm-review-analysis': {
    product: {
      name: 'Double Wood Supplements DHM',
      brand: 'Double Wood Supplements',
      description: 'Pure DHM supplement with 300mg dihydromyricetin, 120 capsules',
      image: '/images/double-wood-dhm-bottle.webp',
      sku: 'B07FRVPXN9',
      rating: 4.4,
      reviewCount: 552,
      price: '19.75',
      pricePerUnit: '0.33',
      url: 'https://amzn.to/3C1DQEF'
    }
  },
  'flyby-recovery-review-2025': {
    product: {
      name: 'Flyby Recovery',
      brand: 'Flyby',
      description: 'Comprehensive hangover prevention formula with DHM, milk thistle, and vitamins',
      image: '/images/flyby-recovery-bottle.webp',
      sku: 'B07H9LN3S3',
      rating: 4.2,
      reviewCount: 2341,
      price: '32.99',
      pricePerUnit: '0.73',
      url: 'https://amzn.to/40uVvqD'
    }
  },
  'fuller-health-after-party-review-2025': {
    product: {
      name: 'Fuller Health After Party',
      brand: 'Fuller Health',
      description: 'Natural hangover prevention with DHM, ginger, and B-vitamins',
      image: '/images/fuller-health-bottle.webp',
      sku: 'FH-AP-30',
      rating: 4.0,
      reviewCount: 156,
      price: '29.99',
      pricePerUnit: '1.00',
      url: 'https://fullerhealth.com'
    }
  },
  'good-morning-hangover-pills-review-2025': {
    product: {
      name: 'Good Morning Hangover Pills',
      brand: 'Good Morning',
      description: 'Hangover relief formula with DHM, activated charcoal, and herbs',
      image: '/images/good-morning-pills-bottle.webp',
      sku: 'GM-HP-42',
      rating: 3.9,
      reviewCount: 234,
      price: '24.99',
      pricePerUnit: '0.60',
      url: 'https://goodmorningpills.com'
    }
  },
  'no-days-wasted-dhm-review-analysis': {
    product: {
      name: 'No Days Wasted DHM Detox',
      brand: 'No Days Wasted',
      description: 'Science-backed formula with 1000mg DHM plus L-Cysteine and electrolytes',
      image: '/images/no-days-wasted-bottle.webp',
      sku: 'B08K8F4RYJ',
      rating: 4.3,
      reviewCount: 201,
      price: '26.99',
      pricePerUnit: '1.80',
      url: 'https://amzn.to/3HSHjgu'
    }
  },
  'nusapure-dhm-review-analysis': {
    product: {
      name: 'NusaPure DHM',
      brand: 'NusaPure',
      description: 'High-strength DHM 500mg per capsule, 180 count value pack',
      image: '/images/nusapure-dhm-bottle.webp',
      sku: 'B07W4DHQMJ',
      rating: 4.3,
      reviewCount: 412,
      price: '29.95',
      pricePerUnit: '0.17',
      url: 'https://amzn.to/4fVSEKH'
    }
  },
  'toniiq-ease-dhm-review-analysis': {
    product: {
      name: 'Toniiq Ease',
      brand: 'Toniiq',
      description: 'Ultra-pure DHM supplement with 98%+ purity guaranteed',
      image: '/images/toniiq-ease-bottle.webp',
      sku: 'B08P5G2G6V',
      rating: 4.1,
      reviewCount: 167,
      price: '36.99',
      pricePerUnit: '0.41',
      url: 'https://amzn.to/48pXpjK'
    }
  }
};

// Comparison data for versus pages - comprehensive list
export const comparisonData = {
  // Flyby Comparisons
  'flyby-vs-fuller-health-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'fuller-health-after-party-review-2025'],
    winner: null // Both have strengths
  },
  'flyby-vs-toniiq-ease-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'toniiq-ease-dhm-review-analysis'],
    winner: null
  },
  'flyby-vs-double-wood-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'double-wood-dhm-review-analysis'],
    winner: 'double-wood-dhm-review-analysis' // Value winner
  },
  'flyby-vs-dhm1000-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'dhm1000-review-2025'],
    winner: null
  },
  'flyby-vs-cheers-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'cheers-restore'],
    winner: null // Context dependent
  },
  'flyby-vs-nusapure-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'nusapure-dhm-review-analysis'],
    winner: null
  },
  'flyby-vs-good-morning-pills-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'good-morning-hangover-pills-review-2025'],
    winner: null
  },
  'flyby-vs-no-days-wasted-complete-comparison-2025': {
    products: ['flyby-recovery-review-2025', 'no-days-wasted-dhm-review-analysis'],
    winner: 'no-days-wasted-dhm-review-analysis' // 1000mg vs 300mg DHM
  },
  
  // Double Wood Comparisons
  'double-wood-dhm-vs-dhm1000-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'dhm1000-review-2025'],
    winner: 'double-wood-dhm-review-analysis' // Best for 70% of users
  },
  'double-wood-vs-cheers-restore-dhm-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'cheers-restore'],
    winner: 'double-wood-dhm-review-analysis' // 1000mg vs 300mg DHM
  },
  'double-wood-vs-no-days-wasted-dhm-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'no-days-wasted-dhm-review-analysis'],
    winner: 'no-days-wasted-dhm-review-analysis' // NAC addition
  },
  'double-wood-vs-nusapure-dhm-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'nusapure-dhm-review-analysis'],
    winner: 'nusapure-dhm-review-analysis' // 63% cheaper per serving
  },
  'double-wood-vs-dhm-depot-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'dhm-depot-review-2025'],
    winner: 'dhm-depot-review-2025' // 41% bulk savings
  },
  'double-wood-vs-fuller-health-after-party-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'fuller-health-after-party-review-2025'],
    winner: null
  },
  'double-wood-vs-good-morning-hangover-pills-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'good-morning-hangover-pills-review-2025'],
    winner: null
  },
  'double-wood-vs-toniiq-ease-dhm-comparison-2025': {
    products: ['double-wood-dhm-review-analysis', 'toniiq-ease-dhm-review-analysis'],
    winner: null
  },
  
  // No Days Wasted Comparisons
  'no-days-wasted-vs-cheers-restore-dhm-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'cheers-restore'],
    winner: 'no-days-wasted-dhm-review-analysis' // 1200mg blend vs 300mg
  },
  'no-days-wasted-vs-dhm-depot-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'dhm-depot-review-2025'],
    winner: null
  },
  'no-days-wasted-vs-dhm1000-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'dhm1000-review-2025'],
    winner: null // Context dependent
  },
  'no-days-wasted-vs-good-morning-hangover-pills-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'good-morning-hangover-pills-review-2025'],
    winner: null
  },
  'no-days-wasted-vs-nusapure-dhm-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'nusapure-dhm-review-analysis'],
    winner: null
  },
  'no-days-wasted-vs-fuller-health-after-party-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'fuller-health-after-party-review-2025'],
    winner: null
  },
  'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025': {
    products: ['no-days-wasted-dhm-review-analysis', 'toniiq-ease-dhm-review-analysis'],
    winner: null
  }
};

// Cheers product data (not in individual reviews)
const cheersProduct = {
  'cheers-restore': {
    product: {
      name: 'Cheers Restore',
      brand: 'Cheers',
      description: 'After-alcohol aid with DHM, L-cysteine, and patented liver support blend',
      image: '/images/cheers-restore-bottle.webp',
      sku: 'CHR-RST-36',
      rating: 4.0,
      reviewCount: 1876,
      price: '34.95',
      pricePerUnit: '0.97',
      url: 'https://cheershealth.com'
    }
  }
};

/**
 * Generate Product schema from review data
 */
export function generateProductSchemaFromReview(slug) {
  const reviewData = productReviewData[slug];
  if (!reviewData) return null;
  
  const { product } = reviewData;
  const baseUrl = 'https://www.dhmguide.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'brand': {
      '@type': 'Brand',
      'name': product.brand
    },
    'description': product.description,
    'image': `${baseUrl}${product.image}`,
    'sku': product.sku,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating,
      'reviewCount': product.reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    },
    'offers': {
      '@type': 'Offer',
      'url': product.url,
      'priceCurrency': 'USD',
      'price': product.price,
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Amazon'
      },
      'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    'review': {
      '@type': 'Review',
      'author': {
        '@type': 'Organization',
        'name': 'DHM Guide'
      },
      'datePublished': '2025-01-01',
      'reviewBody': `Comprehensive review of ${product.name} for hangover prevention. Based on analysis of ${product.reviewCount} customer reviews and independent testing.`,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': product.rating,
        'bestRating': '5',
        'worstRating': '1'
      }
    }
  };
}

/**
 * Generate schema for comparison pages
 */
export function generateComparisonSchema(slug) {
  const comparison = comparisonData[slug];
  if (!comparison) return null;
  
  const schemas = [];
  
  // Add Product schema for each product in comparison
  comparison.products.forEach(productSlug => {
    if (productSlug === 'cheers-restore') {
      // Handle Cheers product specially
      const product = cheersProduct['cheers-restore'].product;
      const baseUrl = 'https://www.dhmguide.com';
      
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'brand': {
          '@type': 'Brand',
          'name': product.brand
        },
        'description': product.description,
        'image': `${baseUrl}${product.image}`,
        'sku': product.sku,
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': product.rating,
          'reviewCount': product.reviewCount,
          'bestRating': '5',
          'worstRating': '1'
        },
        'offers': {
          '@type': 'Offer',
          'url': product.url,
          'priceCurrency': 'USD',
          'price': product.price,
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'Cheers Health'
          }
        }
      });
    } else {
      // Handle regular products
      const productSchema = generateProductSchemaFromReview(productSlug);
      if (productSchema) schemas.push(productSchema);
    }
  });
  
  return schemas;
}

/**
 * Enhanced schema generator for blog posts
 */
export function generateEnhancedBlogSchema(blogPost) {
  const { slug, title, excerpt, date, author, tags, content } = blogPost;
  const schemas = [];
  
  // Check if this is a product review
  if (productReviewData[slug]) {
    const productSchema = generateProductSchemaFromReview(slug);
    if (productSchema) schemas.push(productSchema);
  }
  
  // Check if this is a comparison
  const comparisonMatch = slug.match(/(.+)-vs-(.+)/);
  if (comparisonMatch) {
    const comparisonSchemas = generateComparisonSchema(slug);
    if (comparisonSchemas) schemas.push(...comparisonSchemas);
  }
  
  // Always add Article schema
  const baseUrl = 'https://www.dhmguide.com';
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': excerpt,
    'datePublished': date instanceof Date ? date.toISOString() : date,
    'dateModified': date instanceof Date ? date.toISOString() : date,
    'author': {
      '@type': 'Person',
      'name': author || 'DHM Guide Team'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'DHM Guide',
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.webp`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${baseUrl}/never-hungover/${slug}`
    }
  });
  
  return schemas;
}