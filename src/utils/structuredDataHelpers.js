/**
 * Structured Data Helpers for DHM Guide
 * 
 * Best Practices:
 * 1. Always include required fields for each schema type
 * 2. Use actual data from content, not generic placeholders
 * 3. Validate with Google's Rich Results Test
 * 4. Include both Product and Article schemas for review pages
 * 5. Ensure prices are current and match affiliate links
 * 6. Use ISO 8601 format for dates
 * 7. Include high-quality images with proper dimensions
 */

/**
 * Generate Product schema for supplement reviews
 */
export const generateProductSchema = ({
  name,
  brand,
  description,
  image,
  sku,
  gtin,
  rating,
  reviewCount,
  price,
  priceCurrency = 'USD',
  availability = 'https://schema.org/InStock',
  seller = 'Amazon',
  url,
  reviews = []
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    image: Array.isArray(image) ? image : [image],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency,
      price: typeof price === 'string' ? price.replace(/[$,]/g, '') : price,
      availability,
      seller: {
        '@type': 'Organization',
        name: seller
      }
    }
  };

  // Add SKU if provided
  if (sku) schema.sku = sku;
  if (gtin) schema.gtin = gtin;

  // Add aggregate rating if available
  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1'
    };
  }

  // Add individual reviews if provided
  if (reviews.length > 0) {
    schema.review = reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.date,
      reviewBody: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1'
      }
    }));
  }

  return schema;
};

/**
 * Generate FAQ schema from Q&A content
 */
export const generateFAQSchema = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate HowTo schema for guides
 */
export const generateHowToSchema = ({
  name,
  description,
  image,
  totalTime,
  steps,
  supply = []
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    image,
    totalTime,
    supply: supply.map(item => ({
      '@type': 'HowToSupply',
      name: item
    })),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      position: index + 1
    }))
  };
};

/**
 * Generate Article schema with author and publisher info
 */
export const generateArticleSchema = ({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'DHM Guide Team',
  url,
  keywords = []
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: Array.isArray(image) ? image : [image],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'DHM Guide',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.dhmguide.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    keywords: keywords.join(', ')
  };
};

/**
 * Extract product data from review content
 */
export const extractProductDataFromContent = (content, metadata) => {
  // Extract rating from content using regex patterns
  const ratingMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:\/5|out of 5|stars?)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  // Extract review count
  const reviewCountMatch = content.match(/(\d+(?:,\d+)?)\+?\s*(?:reviews?|ratings?|customers?)/i);
  const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1].replace(/,/g, '')) : null;

  // Extract price
  const priceMatch = content.match(/\$(\d+(?:\.\d{2})?)/);
  const price = priceMatch ? priceMatch[1] : null;

  // Extract brand from title or content
  const brandPatterns = [
    'No Days Wasted',
    'Double Wood',
    'Flyby',
    'Cheers',
    'DHM Depot',
    'Toniiq',
    'NusaPure',
    'Fuller Health',
    'DHM1000',
    'Good Morning'
  ];
  
  let brand = null;
  for (const pattern of brandPatterns) {
    if (content.includes(pattern) || metadata.title.includes(pattern)) {
      brand = pattern;
      break;
    }
  }

  return {
    rating,
    reviewCount,
    price,
    brand
  };
};

/**
 * Validate structured data has required fields
 */
export const validateStructuredData = (schema, type) => {
  const requiredFields = {
    Product: ['name', 'offers'],
    Article: ['headline', 'datePublished', 'author'],
    FAQPage: ['mainEntity'],
    HowTo: ['name', 'step']
  };

  const required = requiredFields[type] || [];
  const missing = required.filter(field => !schema[field]);

  if (missing.length > 0) {
    console.warn(`Missing required fields for ${type} schema:`, missing);
    return false;
  }

  return true;
};