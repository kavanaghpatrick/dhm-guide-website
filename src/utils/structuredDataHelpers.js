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
 * Generate ItemList schema for ranked product carousel.
 *
 * Mirrors the visible ranked product list 1:1, including order. Each list
 * entry wraps a Product with the minimum fields Google needs for a product
 * carousel rich result: name, url, aggregateRating, offers.
 *
 * @param {Object} options
 * @param {string} options.name - Carousel display name (e.g. "Best DHM Supplements 2026")
 * @param {string} [options.description] - Optional carousel description
 * @param {string} [options.itemUrlBase] - Base URL for per-item anchor links (e.g. "https://www.dhmguide.com/reviews")
 * @param {Array<Object>} options.products - Source array. Each entry needs: name, brand, rating, reviews, price, affiliateLink, [id].
 * @returns {Object} ItemList schema
 */
export const generateItemListSchema = ({
  name,
  description,
  itemUrlBase,
  products
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    ...(description ? { description } : {}),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const position = index + 1;
      const productUrl = itemUrlBase
        ? `${itemUrlBase}#product-${product.id || position}`
        : product.affiliateLink;

      const item = {
        '@type': 'Product',
        name: product.name,
        url: productUrl,
        brand: {
          '@type': 'Brand',
          name: product.brand
        }
      };

      if (typeof product.rating === 'number' && typeof product.reviews === 'number') {
        item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews,
          bestRating: '5',
          worstRating: '1'
        };
      }

      if (product.price && product.affiliateLink) {
        item.offers = {
          '@type': 'Offer',
          url: product.affiliateLink,
          priceCurrency: 'USD',
          price: String(product.price).replace(/[$,]/g, ''),
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Amazon'
          }
        };
      }

      return {
        '@type': 'ListItem',
        position,
        item
      };
    })
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
 * Generate ScholarlyArticle schema for one DHM clinical/preclinical study.
 *
 * Required fields always present: headline, name, author[], datePublished,
 * publisher, isAccessibleForFree, sameAs, about.
 *
 * Optional fields included only when source data is present:
 *   - identifier: PMID string ("PMID:12345") OR PropertyValue (DOI)
 *   - isPartOf: PublicationVolume (when study.volume present), nested in Periodical
 */
export const generateScholarlyArticleSchema = (study) => {
  const authorsArr = Array.isArray(study.authors)
    ? study.authors.map((s) => String(s).trim()).filter(Boolean)
    : (study.authors || '').split(',').map((s) => s.trim()).filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: study.title,
    name: study.title,
    author: authorsArr.map((name) => ({ '@type': 'Person', name })),
    datePublished: String(study.year),
    publisher: { '@type': 'Organization', name: study.journal },
    isAccessibleForFree: false,
    sameAs: study.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`,
    about: { '@type': 'Thing', name: 'Dihydromyricetin' }
  };

  if (study.pmid) {
    schema.identifier = `PMID:${study.pmid}`;
  }
  if (study.doi) {
    // PropertyValue is more granular than identifier string; both valid.
    // DOI takes precedence over the PMID identifier when both present.
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: study.doi
    };
  }
  if (study.volume) {
    schema.isPartOf = {
      '@type': 'PublicationVolume',
      volumeNumber: study.volume,
      ...(study.issue && { issueNumber: study.issue }),
      isPartOf: { '@type': 'Periodical', name: study.journal }
    };
  }
  return schema;
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
 * Generate BreadcrumbList schema for navigation hierarchy
 *
 * @param {Object} options - Configuration options
 * @param {string} options.path - Current page path (e.g., '/never-hungover/dhm-vs-nac')
 * @param {string} [options.pageTitle] - Title of the current page (for blog posts)
 * @returns {Object} BreadcrumbList schema
 */
export const generateBreadcrumbSchema = ({ path, pageTitle }) => {
  const baseUrl = 'https://www.dhmguide.com';
  const items = [];

  // Always start with Home
  items.push({
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: baseUrl
  });

  // Handle different page types based on path
  const pathSegments = path.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    // Home page - just return home breadcrumb without item on last element
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Home'
      }]
    };
  }

  // Map path segments to readable names
  const segmentNames = {
    'guide': 'DHM Guide',
    'reviews': 'Reviews',
    'research': 'Research',
    'compare': 'Compare',
    'about': 'About',
    'never-hungover': 'Never Hungover',
    'dhm-dosage-calculator': 'Dosage Calculator'
  };

  // Build breadcrumb trail
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLastSegment = index === pathSegments.length - 1;

    // Determine the display name
    let displayName;
    if (isLastSegment && pageTitle) {
      // Use provided page title for the last segment (blog posts)
      displayName = pageTitle;
    } else {
      // Use mapped name or format slug as title
      displayName = segmentNames[segment] || formatSlugAsTitle(segment);
    }

    const breadcrumbItem = {
      '@type': 'ListItem',
      position: items.length + 1,
      name: displayName
    };

    // Only include 'item' URL if not the last breadcrumb (per Google guidelines)
    if (!isLastSegment) {
      breadcrumbItem.item = `${baseUrl}${currentPath}`;
    }

    items.push(breadcrumbItem);
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
};

/**
 * Format a URL slug as a readable title
 * E.g., 'dhm-vs-nac' -> 'DHM vs NAC'
 */
const formatSlugAsTitle = (slug) => {
  // Common abbreviations that should be uppercase
  const uppercaseWords = ['dhm', 'nac', 'ucla', 'usc', 'faq', 'vs', 'dna', 'rna'];

  return slug
    .split('-')
    .map(word => {
      if (uppercaseWords.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
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