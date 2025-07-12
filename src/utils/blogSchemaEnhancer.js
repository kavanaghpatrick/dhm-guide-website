/**
 * Blog Schema Enhancer
 * Adds product structured data to blog posts
 */

import { generateProductSchema, generateArticleSchema, extractProductDataFromContent } from './structuredDataHelpers.js';

// Product database with accurate information
export const productDatabase = {
  'dhm-depot': {
    name: 'DHM Depot',
    brand: 'Double Wood Supplements',
    sku: 'DWS-DHM-300',
    description: 'High-potency DHM supplement with 300mg pure dihydromyricetin per capsule',
    image: 'https://www.dhmguide.com/images/dhm-depot-bottle.webp'
  },
  'dhm1000': {
    name: 'DHM1000',
    brand: 'DHM1000',
    sku: 'DHM1000-60',
    description: 'Premium DHM supplement with 1000mg dihydromyricetin per serving',
    image: 'https://www.dhmguide.com/images/dhm1000-bottle.webp'
  },
  'double-wood': {
    name: 'Double Wood Supplements DHM',
    brand: 'Double Wood Supplements',
    sku: 'DWS-DHM-120',
    description: 'Pure DHM supplement with 300mg dihydromyricetin, 120 capsules',
    image: 'https://www.dhmguide.com/images/double-wood-dhm-bottle.webp'
  },
  'flyby': {
    name: 'Flyby Recovery',
    brand: 'Flyby',
    sku: 'FLY-REC-90',
    description: 'Comprehensive hangover prevention formula with DHM, milk thistle, and vitamins',
    image: 'https://www.dhmguide.com/images/flyby-recovery-bottle.webp'
  },
  'cheers': {
    name: 'Cheers Restore',
    brand: 'Cheers',
    sku: 'CHR-RST-36',
    description: 'After-alcohol aid with DHM, L-cysteine, and patented liver support blend',
    image: 'https://www.dhmguide.com/images/cheers-restore-bottle.webp'
  },
  'no-days-wasted': {
    name: 'No Days Wasted DHM Detox',
    brand: 'No Days Wasted',
    sku: 'NDW-DHM-15',
    description: 'Science-backed formula with 1000mg DHM plus L-Cysteine and electrolytes',
    image: 'https://www.dhmguide.com/images/no-days-wasted-bottle.webp'
  },
  'toniiq': {
    name: 'Toniiq Ease',
    brand: 'Toniiq',
    sku: 'TNQ-EASE-60',
    description: 'Ultra-pure DHM supplement with 98%+ purity guaranteed',
    image: 'https://www.dhmguide.com/images/toniiq-ease-bottle.webp'
  },
  'nusapure': {
    name: 'NusaPure DHM',
    brand: 'NusaPure',
    sku: 'NSP-DHM-180',
    description: 'High-strength DHM 500mg per capsule, 180 count value pack',
    image: 'https://www.dhmguide.com/images/nusapure-dhm-bottle.webp'
  },
  'fuller-health': {
    name: 'Fuller Health After Party',
    brand: 'Fuller Health',
    sku: 'FH-AP-30',
    description: 'Natural hangover prevention with DHM, ginger, and B-vitamins',
    image: 'https://www.dhmguide.com/images/fuller-health-bottle.webp'
  },
  'good-morning': {
    name: 'Good Morning Hangover Pills',
    brand: 'Good Morning',
    sku: 'GM-HP-42',
    description: 'Hangover relief formula with DHM, activated charcoal, and herbs',
    image: 'https://www.dhmguide.com/images/good-morning-pills-bottle.webp'
  }
};

/**
 * Identify product from slug or title
 */
export const identifyProduct = (slug, title) => {
  const searchText = (slug + ' ' + title).toLowerCase();
  
  for (const [key, product] of Object.entries(productDatabase)) {
    if (searchText.includes(key.replace('-', ' ')) || 
        searchText.includes(product.brand.toLowerCase()) ||
        searchText.includes(product.name.toLowerCase())) {
      return { key, ...product };
    }
  }
  
  return null;
};

/**
 * Enhance blog post with product structured data
 */
export const enhanceBlogPostSchema = (blogPost) => {
  const { slug, title, content, metadata } = blogPost;
  
  // Check if this is a product review or comparison
  const isReview = slug.includes('review') || title.includes('Review');
  const isComparison = slug.includes('vs') || slug.includes('comparison');
  
  if (!isReview && !isComparison) {
    return null;
  }
  
  const schemas = [];
  
  // For single product reviews
  if (isReview && !isComparison) {
    const product = identifyProduct(slug, title);
    if (product) {
      const extractedData = extractProductDataFromContent(content, metadata);
      
      schemas.push(generateProductSchema({
        name: product.name,
        brand: product.brand,
        description: product.description,
        image: product.image,
        sku: product.sku,
        rating: extractedData.rating,
        reviewCount: extractedData.reviewCount,
        price: extractedData.price,
        url: `https://www.dhmguide.com/never-hungover/${slug}`,
        reviews: [] // TODO: Extract individual reviews from content
      }));
    }
  }
  
  // For comparison pages - add multiple products
  if (isComparison) {
    const products = [];
    
    // Find all products mentioned
    for (const [key, product] of Object.entries(productDatabase)) {
      const searchText = (slug + ' ' + title).toLowerCase();
      if (searchText.includes(key.replace('-', ' ')) || 
          searchText.includes(product.brand.toLowerCase())) {
        products.push({ key, ...product });
      }
    }
    
    // Add schema for each product
    products.forEach(product => {
      const extractedData = extractProductDataFromContent(content, metadata);
      
      schemas.push(generateProductSchema({
        name: product.name,
        brand: product.brand,
        description: product.description,
        image: product.image,
        sku: product.sku,
        rating: extractedData.rating,
        reviewCount: extractedData.reviewCount,
        price: extractedData.price,
        url: `https://www.dhmguide.com/never-hungover/${slug}`,
        reviews: []
      }));
    });
  }
  
  // Always add Article schema for blog posts
  schemas.push(generateArticleSchema({
    headline: title,
    description: metadata.excerpt || metadata.description,
    image: metadata.image || 'https://www.dhmguide.com/blog-default.webp',
    datePublished: metadata.date,
    dateModified: metadata.lastModified || metadata.date,
    author: metadata.author || 'DHM Guide Team',
    url: `https://www.dhmguide.com/never-hungover/${slug}`,
    keywords: metadata.tags || []
  }));
  
  return schemas;
};