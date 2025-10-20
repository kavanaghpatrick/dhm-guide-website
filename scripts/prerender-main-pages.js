import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Main pages to prerender with their unique meta data
const pages = [
  {
    route: '/',
    title: 'DHM Guide: Prevent 87% of Hangovers with Science-Backed Supplements | 11 Clinical Studies',
    description: '✅ Clinically proven to prevent 87% of hangovers. UCLA research + 11 studies confirm DHM effectiveness. Independent reviews, dosage guides & 500+ success stories. Never wake up hungover again.',
    ogImage: '/og-image.jpg'
  },
  {
    route: '/guide',
    title: 'Complete DHM Guide 2025 | Science-Backed Hangover Prevention',
    description: 'Evidence-based guide to DHM (Dihydromyricetin) supplements. Learn about mechanism of action, optimal dosage, clinical research, and safety profile for hangover prevention.',
    ogImage: '/guide-og.jpg'
  },
  {
    route: '/reviews',
    title: 'DHM Supplement Reviews 2025 | Tested & Ranked',
    description: 'Comprehensive reviews of top DHM supplements. Independent testing, purity analysis, effectiveness ratings, and value comparisons to help you choose the best hangover prevention supplement.',
    ogImage: '/reviews-og.jpg'
  },
  {
    route: '/research',
    title: 'DHM Clinical Research | 11+ Scientific Studies on Hangover Prevention',
    description: 'Complete analysis of DHM (Dihydromyricetin) clinical research. UCLA studies, meta-analysis, safety data, and scientific evidence for hangover prevention and liver protection.',
    ogImage: '/research-og.jpg'
  },
  {
    route: '/about',
    title: 'About DHM Guide | Evidence-Based Hangover Prevention Resource',
    description: 'Learn about DHM Guide: your trusted resource for science-backed hangover prevention information. Our mission, methodology, and commitment to evidence-based health information.',
    ogImage: '/about-og.jpg'
  },
  {
    route: '/dhm-dosage-calculator',
    title: 'DHM Dosage Calculator | Personalized Hangover Prevention Guide',
    description: 'Calculate your optimal DHM dosage based on weight, drinks consumed, and alcohol tolerance. Science-backed recommendations for maximum hangover prevention effectiveness.',
    ogImage: '/calculator-og.jpg'
  },
  {
    route: '/compare',
    title: 'Compare DHM Supplements | Side-by-Side Product Analysis',
    description: 'Compare top DHM supplements side-by-side. Analyze purity, dosage, price per serving, third-party testing, and user ratings to find the best hangover prevention supplement for you.',
    ogImage: '/compare-og.jpg'
  }
];

/**
 * Prerender main pages with unique meta tags for SEO and social sharing
 *
 * This script:
 * 1. Reads the base dist/index.html
 * 2. Updates meta tags (title, description, OG tags, Twitter cards, canonical)
 * 3. Saves static HTML for each route
 *
 * Benefits:
 * - Social media crawlers see proper OG tags (no JS execution required)
 * - Faster Google indexing (no rendering queue)
 * - Better Core Web Vitals (faster FCP/LCP)
 */
async function prerenderMainPages() {
  const distDir = './dist';
  const baseHtmlPath = path.join(distDir, 'index.html');

  // Check if dist directory and base HTML exist
  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Run `vite build` first.');
    process.exit(1);
  }

  if (!fs.existsSync(baseHtmlPath)) {
    console.error('❌ Error: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  let successCount = 0;
  let errorCount = 0;

  console.log('\n🎨 Prerendering main pages with unique meta tags...\n');

  for (const page of pages) {
    try {
      const dom = new JSDOM(baseHtml);
      const { document } = dom.window;

      // Update page title
      document.title = page.title;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.description);
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', page.title);

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute('content', page.description);

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `https://www.dhmguide.com${page.route}`);

      // Update Twitter Card tags
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', page.title);

      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) twitterDescription.setAttribute('content', page.description);

      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      if (twitterImage) twitterImage.setAttribute('content', `https://www.dhmguide.com${page.ogImage}`);

      // Update canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://www.dhmguide.com${page.route}`);
      }

      // Determine output directory and file path
      const outputDir = page.route === '/' ? distDir : path.join(distDir, page.route);

      // Create directory if needed (for non-root routes)
      if (page.route !== '/') {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save prerendered HTML
      const outputPath = path.join(
        page.route === '/' ? distDir : outputDir,
        'index.html'
      );

      fs.writeFileSync(outputPath, dom.serialize());

      console.log(`  ✓ ${page.route}`);
      successCount++;

    } catch (error) {
      console.error(`  ✗ ${page.route} - Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n✅ Generated ${successCount} prerendered pages`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} pages failed`);
  }
  console.log('📁 Output saved to: dist/*/index.html\n');
}

// Run the prerendering
prerenderMainPages().catch(error => {
  console.error('\n❌ Prerendering failed:', error);
  process.exit(1);
});
