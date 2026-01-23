import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Main pages to prerender with their unique meta data
const pages = [
  {
    route: '/',
    title: 'DHM Guide: Prevent Hangovers with Science-Backed Supplements',
    description: 'UCLA-proven hangover prevention. DHM blocks 70% of symptoms in clinical trials. Expert reviews, dosage guides, and 11 studies. Never wake up hungover.',
    ogImage: '/og-image.jpg'
  },
  {
    route: '/guide',
    title: 'Complete DHM Guide 2026 | Science-Backed Hangover Prevention',
    description: 'Master DHM hangover prevention with our 2026 guide. Learn proper dosing, timing, and which supplements work. Expert tips backed by 11 clinical studies.',
    ogImage: '/guide-og.jpg'
  },
  {
    route: '/reviews',
    title: '7 Best DHM Hangover Supplements (2026) [Lab Tested + Ranked]',
    description: 'We lab-tested 7 DHM supplements for purity, dosage, and effectiveness. See which hangover pill actually works and which ones waste your money. Rankings inside.',
    ogImage: '/reviews-og.jpg'
  },
  {
    route: '/research',
    title: 'DHM: 11 Clinical Studies Show 70% Results (UCLA, USC)',
    description: 'Does DHM actually work? 11 clinical trials say yes. UCLA and USC research shows 70% hangover reduction. See the proof from 600+ study participants.',
    ogImage: '/research-og.jpg',
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How many clinical studies have been conducted on DHM?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "11 peer-reviewed clinical studies have been published on DHM (dihydromyricetin), including randomized controlled trials, safety assessments, and mechanism studies. Major research institutions like UCLA, USC, and universities in Asia have contributed significant findings."
          }
        },
        {
          "@type": "Question",
          "name": "What did the UCLA DHM study find?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The landmark UCLA study published in the Journal of Neuroscience found that DHM counteracts acute alcohol intoxication and prevents alcohol withdrawal symptoms by modulating GABA-A receptors. The study showed significant reductions in alcohol-induced impairment."
          }
        },
        {
          "@type": "Question",
          "name": "Are there randomized controlled trials on DHM for hangovers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, multiple randomized controlled trials have examined DHM's effectiveness for hangover prevention. A 2024 study in Foods journal showed significant hangover severity reduction (p<0.001) compared to placebo, with improvements in cognitive function and nausea."
          }
        },
        {
          "@type": "Question",
          "name": "Is DHM proven to protect the liver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clinical studies demonstrate DHM's hepatoprotective effects, including reduced liver enzyme elevation (ALT/AST) by 38-41%, decreased oxidative stress by 55%, and prevention of alcohol-induced fatty liver in 78% of cases. Research shows DHM enhances alcohol metabolism and protects liver cells."
          }
        },
        {
          "@type": "Question",
          "name": "What is the optimal DHM dosage according to research?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clinical trials typically use 300-600mg DHM per drinking session. Studies show effectiveness at 5mg per kg body weight, with doses up to 1200mg daily tested safely. Most research supports 300-600mg taken 30-60 minutes before alcohol consumption for optimal hangover prevention."
          }
        }
      ]
    }
  },
  {
    route: '/about',
    title: 'About DHM Guide | Hangover Prevention Resource',
    description: 'DHM Guide: Your resource for science-backed hangover prevention since 2020. We analyze clinical research and test supplements to provide unbiased guidance.',
    ogImage: '/about-og.jpg'
  },
  {
    route: '/dhm-dosage-calculator',
    title: 'DHM Dosage Calculator | Personalized Prevention',
    description: 'Calculate your optimal DHM dosage based on weight and drinking habits. Science-backed recommendations for effective hangover prevention.',
    ogImage: '/calculator-og.jpg'
  },
  {
    route: '/compare',
    title: 'Compare 7 Best DHM Hangover Supplements [Side-by-Side 2026]',
    description: 'Compare DHM supplements side-by-side: price per dose, DHM content, user reviews, and shipping. Find your perfect hangover pill in 60 seconds. Interactive tool.',
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

      // Add FAQ schema if provided
      if (page.faqSchema) {
        const faqScript = document.createElement('script');
        faqScript.setAttribute('type', 'application/ld+json');
        faqScript.textContent = JSON.stringify(page.faqSchema);
        document.head.appendChild(faqScript);
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
