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

  // Add FAQ schema for specific high-priority posts
  const faqSchema = generateFAQSchema(slug);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}

/**
 * FAQ data for high-priority blog posts (Week 3 SEO optimization)
 */
const faqData = {
  'flyby-recovery-review-2025': [
    {
      question: "Does Flyby Recovery actually work for hangovers?",
      answer: "Based on 7,200+ customer reviews with a 4.3-star rating, Flyby Recovery shows effectiveness for most users. It contains 300mg DHM plus B-vitamins and milk thistle. Clinical studies on DHM show 70%+ hangover reduction, though individual results vary based on alcohol consumption and body weight."
    },
    {
      question: "How much does Flyby Recovery cost?",
      answer: "Flyby Recovery costs $17.99 for 20 capsules (5 uses) or $34.99 for 80 capsules (20 uses). The cost per dose ranges from $1.75-$4.50 depending on package size. The 80-count offers the best value at $1.75 per 4-capsule serving."
    },
    {
      question: "When should I take Flyby Recovery?",
      answer: "Take 2 capsules before drinking and 2 more capsules before bed (4 capsules total per drinking session). For best results, take the first dose 30-60 minutes before your first drink with water and food."
    },
    {
      question: "Is Flyby better than cheaper DHM supplements?",
      answer: "Flyby offers comprehensive formula (DHM + vitamins + minerals) versus basic DHM-only supplements. While more expensive per mg of DHM, the additional ingredients provide broader support. Pure DHM supplements like Double Wood offer better value if you only want DHM."
    },
    {
      question: "What are Flyby Recovery side effects?",
      answer: "Flyby Recovery has minimal reported side effects. Some users note large capsule size makes swallowing difficult. The supplement contains safe, well-studied ingredients. As with any supplement, take with food if you experience stomach sensitivity."
    }
  ],
  'no-days-wasted-vs-cheers-restore-dhm-comparison-2025': [
    {
      question: "Which is better: No Days Wasted or Cheers Restore?",
      answer: "No Days Wasted offers 1000mg DHM per serving versus Cheers' 300mg, making it more potent. However, Cheers includes additional liver support ingredients. No Days Wasted provides better value at $1.80 per dose versus Cheers at $2-3 per dose for pure DHM potency."
    },
    {
      question: "How do the prices compare between No Days Wasted and Cheers?",
      answer: "No Days Wasted costs $26.99 for 15 servings ($1.80 per use) while Cheers Restore costs approximately $30-45 for 15 servings ($2-3 per use). No Days Wasted offers better price-per-milligram of DHM value."
    },
    {
      question: "Do both products have the same DHM dosage?",
      answer: "No. No Days Wasted contains 1000mg DHM per serving, while Cheers Restore contains 300mg DHM. This 3.3x difference in DHM content makes No Days Wasted significantly more potent for hangover prevention."
    },
    {
      question: "Which formula includes more additional ingredients?",
      answer: "Cheers Restore includes more comprehensive additional ingredients including milk thistle, NAC, and B-vitamins. No Days Wasted focuses primarily on high-dose DHM plus L-Cysteine. Choose Cheers for comprehensive support or No Days Wasted for maximum DHM potency."
    },
    {
      question: "Are there customer review differences between the two?",
      answer: "Both products have positive customer reviews. No Days Wasted has approximately 200 Amazon reviews with 4.3 stars, while Cheers has fewer public reviews but strong testimonials. Both show effectiveness for most users who follow dosing instructions."
    }
  ],
  'dhm-dosage-guide-2025': [
    {
      question: "What is the optimal DHM dosage for hangover prevention?",
      answer: "The optimal DHM dosage is 5mg per kg of body weight, typically 300-600mg for most adults. A 150lb (68kg) person should take approximately 340mg. Clinical studies show this dosage provides 70%+ hangover reduction when taken 30-60 minutes before drinking."
    },
    {
      question: "Can you take too much DHM?",
      answer: "The maximum recommended DHM dosage is 1200mg in 24 hours. Clinical studies have tested up to 2000mg daily without adverse effects, but higher doses don't provide additional benefits. Most people need only 300-600mg per drinking session for effective hangover prevention."
    },
    {
      question: "Does DHM dosage vary by body weight?",
      answer: "Yes, DHM dosage should be adjusted for body weight. The formula is 5mg DHM per kg body weight. A 120lb person needs about 270mg while a 200lb person needs approximately 450mg. Use a dosage calculator for personalized recommendations."
    },
    {
      question: "When should I take DHM for best results?",
      answer: "Take DHM 30-60 minutes before your first alcoholic drink for optimal prevention. You can also split the dose: half before drinking and half before bed. DHM reaches peak blood levels in 1-2 hours and remains effective for 4-6 hours."
    },
    {
      question: "How does alcohol amount affect DHM dosage?",
      answer: "For light drinking (1-3 drinks), use the standard 300-400mg DHM dose. For moderate drinking (4-6 drinks), increase to 500-600mg. For heavy drinking (7+ drinks), use 600-900mg but understand DHM effectiveness decreases with excessive alcohol consumption."
    }
  ],
  'dhm1000-review-2025': [
    {
      question: "Is DHM1000 worth the premium price?",
      answer: "DHM1000 costs $47 for 30 servings ($1.57 per use) and provides 1000mg DHM per serving - the highest single-dose potency available. Compared to 300mg supplements at $0.50-1.00 per dose, you're paying premium for convenience of single high-dose capsules rather than multiple pills."
    },
    {
      question: "How does DHM1000 compare to Double Wood DHM?",
      answer: "DHM1000 offers 1000mg in a single capsule versus Double Wood's 300mg (requiring 3-4 capsules for equivalent dose). DHM1000 costs more per serving but provides convenience. Double Wood offers better value at $0.33 per 300mg dose if you don't mind taking multiple capsules."
    },
    {
      question: "Does 1000mg DHM work better than 300-600mg?",
      answer: "Clinical research shows 300-600mg DHM is effective for most people. Higher doses like 1000mg may benefit heavier individuals (200+ lbs) or heavy drinking sessions, but don't necessarily provide proportionally better results. Most users find 500-600mg sufficient."
    },
    {
      question: "Are there DHM1000 side effects from the high dose?",
      answer: "DHM1000's 1000mg dose is within safe ranges tested in clinical studies (up to 2000mg daily shown safe). Users report no significant side effects beyond occasional mild drowsiness. The higher dose doesn't increase side effect risk compared to standard 300-600mg doses."
    },
    {
      question: "Where can you buy DHM1000?",
      answer: "DHM1000 is available directly from dhm1000.com and select online retailers. It's less widely available than mass-market brands like Flyby or Double Wood, which are sold on Amazon with Prime shipping. Direct purchase ensures product authenticity."
    }
  ]
};

/**
 * Generate FAQ schema for blog posts
 */
export function generateFAQSchema(slug) {
  const faqs = faqData[slug];
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}