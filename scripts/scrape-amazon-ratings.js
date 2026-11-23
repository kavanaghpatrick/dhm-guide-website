/**
 * Amazon Product Rating Scraper
 *
 * Uses Playwright in headed mode to scrape current ratings and reviews
 * from Amazon.com product pages for DHM supplements.
 *
 * Usage: node scripts/scrape-amazon-ratings.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

// Products with their actual affiliate links - visiting directly for accuracy
const products = [
  { id: 3, name: "Toniiq Ease", affiliateLink: "https://amzn.to/44E95Gi" },
  { id: 4, name: "NusaPure DHM 1,000mg", affiliateLink: "https://amzn.to/44znXFU" },
  { id: 6, name: "Flyby Recovery", affiliateLink: "https://amzn.to/4kjCRVw" },
  { id: 10, name: "DHM Depot", affiliateLink: "https://amzn.to/4l1ZoqN" },
];

async function scrapeAmazonProduct(page, product) {
  console.log(`\n📦 Scraping: ${product.name}`);
  console.log(`   Link: ${product.affiliateLink}`);

  try {
    // Go directly to the affiliate link
    await page.goto(product.affiliateLink, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Check for CAPTCHA
    const captcha = await page.locator('form[action*="validateCaptcha"]').count();
    if (captcha > 0) {
      console.log('   ⚠️  CAPTCHA detected - please solve manually...');
      await page.waitForURL(/amazon\.com\//, { timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }

    const currentUrl = page.url();
    console.log(`   Product URL: ${currentUrl}`);

    // Try multiple selectors for rating
    let rating = null;
    let reviews = null;
    let price = null;

    // Rating selectors
    const ratingSelectors = [
      '#acrPopover',
      '[data-hook="rating-out-of-text"]',
      '#averageCustomerReviews .a-icon-alt',
      'i.a-icon-star span.a-icon-alt',
      '.a-icon-star-medium span.a-icon-alt',
    ];

    for (const selector of ratingSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.getAttribute('title') || await element.textContent();
          if (text) {
            const match = text.match(/(\d+\.?\d*)\s*out of\s*5/i) || text.match(/^(\d+\.?\d*)/);
            if (match) {
              rating = parseFloat(match[1]);
              console.log(`   ⭐ Rating: ${rating}`);
              break;
            }
          }
        }
      } catch (e) {}
    }

    // Review count selectors
    const reviewSelectors = [
      '#acrCustomerReviewText',
      '[data-hook="total-review-count"]',
      '#acrCustomerReviewLink span',
    ];

    for (const selector of reviewSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
          if (text) {
            const match = text.replace(/,/g, '').match(/(\d+)/);
            if (match) {
              reviews = parseInt(match[1]);
              console.log(`   📝 Reviews: ${reviews}`);
              break;
            }
          }
        }
      } catch (e) {}
    }

    // Price selectors
    const priceSelectors = [
      '.a-price .a-offscreen',
      '#corePrice_feature_div .a-offscreen',
      '.priceToPay .a-offscreen',
      '#apex_offerDisplay_desktop .a-offscreen',
    ];

    for (const selector of priceSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
          if (text && text.includes('$')) {
            price = text.trim();
            console.log(`   💰 Price: ${price}`);
            break;
          }
        }
      } catch (e) {}
    }

    // Fallback text search
    if (!rating || !reviews) {
      console.log('   🔍 Trying text search...');
      const pageText = await page.textContent('body');

      if (!rating) {
        const ratingMatch = pageText.match(/(\d\.\d)\s*out of\s*5\s*stars?/i);
        if (ratingMatch) {
          rating = parseFloat(ratingMatch[1]);
          console.log(`   ⭐ Rating (text): ${rating}`);
        }
      }

      if (!reviews) {
        const reviewMatch = pageText.match(/([\d,]+)\s*(?:global\s*)?ratings?/i);
        if (reviewMatch) {
          reviews = parseInt(reviewMatch[1].replace(/,/g, ''));
          console.log(`   📝 Reviews (text): ${reviews}`);
        }
      }
    }

    return {
      id: product.id,
      name: product.name,
      rating: rating,
      reviews: reviews,
      price: price,
      url: currentUrl,
      success: rating !== null && reviews !== null
    };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      id: product.id,
      name: product.name,
      rating: null,
      reviews: null,
      price: null,
      url: null,
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Starting Amazon.com Product Scraper');
  console.log('   Mode: Headed (visible browser)');
  console.log('   Method: Direct search on amazon.com');
  console.log('   Products: 10\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Visit amazon.com first
  console.log('📍 Opening Amazon.com...');
  await page.goto('https://www.amazon.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Product ${i + 1} of ${products.length}`);

    const result = await scrapeAmazonProduct(page, product);
    results.push(result);

    if (i < products.length - 1) {
      const delay = 3000 + Math.random() * 3000;
      console.log(`   ⏳ Waiting ${(delay/1000).toFixed(1)}s...`);
      await page.waitForTimeout(delay);
    }
  }

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SCRAPING RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success);
  console.log(`✅ Successful: ${successful.length}/${results.length}\n`);

  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('ID | Name                              | Rating | Reviews  | Price');
  console.log('─────────────────────────────────────────────────────────────────────');

  for (const r of results) {
    const name = r.name.substring(0, 33).padEnd(33);
    const rating = r.rating ? r.rating.toFixed(1).padStart(6) : '  N/A ';
    const reviews = r.reviews ? r.reviews.toString().padStart(8) : '    N/A ';
    const price = r.price ? r.price.padStart(9) : '     N/A ';
    console.log(`${r.id.toString().padStart(2)} | ${name} | ${rating} | ${reviews} | ${price}`);
  }

  console.log('─────────────────────────────────────────────────────────────────────\n');

  // Save results
  const outputPath = './scripts/amazon-ratings-output.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: ${outputPath}`);

  await browser.close();
  console.log('\n✨ Done!');

  return results;
}

main().catch(console.error);
