import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
} from '../src/utils/structuredDataHelpers.js';

// Shared product data — same JSON imported by src/pages/Reviews.jsx so the
// ItemList schema on /reviews stays in sync with the visible ranked list.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const topProducts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/data/topProducts.json'), 'utf-8')
);

// Main pages to prerender with their unique meta data
const pages = [
  {
    route: '/',
    title: 'DHM Guide: Prevent Hangovers with Science-Backed Supplements',
    description: 'UCLA-proven hangover prevention. DHM blocks 70% of symptoms in clinical trials. Expert reviews, dosage guides, and 11 studies. Never wake up hungover.',
    ogImage: '/og-image.jpg',
    bodyStub: '<h1>DHM Guide: Science-Backed Hangover Prevention</h1><p>UCLA-proven DHM (Dihydromyricetin) blocks up to 70% of hangover symptoms in clinical trials. Expert reviews, dosage guides, and analysis of 11 peer-reviewed studies.</p><p>Discover proper DHM dosing, timing, and the best supplements for hangover prevention. Never wake up hungover again.</p>'
  },
  {
    route: '/guide',
    title: 'Complete DHM Guide 2026 | Science-Backed Hangover Prevention',
    description: 'Master DHM hangover prevention with our 2026 guide. Learn proper dosing, timing, and which supplements work. Expert tips backed by 11 clinical studies.',
    ogImage: '/guide-og.jpg',
    bodyStub: '<h1>Complete DHM Guide 2026</h1><p>Master DHM hangover prevention with our comprehensive 2026 guide. Learn proper dosing, optimal timing, and which supplements actually work.</p><p>Expert tips backed by 11 clinical studies covering DHM mechanisms, GABA-A receptor modulation, and liver protection benefits.</p>',
    // FAQPage schema — text MUST match Guide.jsx visible "Quick FAQ" section
    // (~lines 528-571). Decorative emoji prefixes in the visible h3 headers
    // (❓ 💊 🍺 🤔 💰 📦) are stripped from schema names; question/answer
    // text is otherwise verbatim. Anchor links inside answers (e.g. emergency
    // hangover protocol, top picks, Flyby Recovery analysis) are reproduced
    // as plain text since schema does not carry HTML.
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How fast does DHM work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DHM starts working within 30 minutes. Peak effects occur 1-2 hours after taking it."
          }
        },
        {
          "@type": "Question",
          "name": "Can I take too much DHM?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DHM is very safe. Studies show no serious side effects at doses up to 1,200mg daily."
          }
        },
        {
          "@type": "Question",
          "name": "Does it work with all alcohol?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes - beer, wine, liquor, cocktails. DHM works by helping your liver process alcohol faster."
          }
        },
        {
          "@type": "Question",
          "name": "What if I forget to take it before?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Take it as soon as you remember, even while drinking. Late is better than never. For emergency situations, see our emergency hangover protocol."
          }
        },
        {
          "@type": "Question",
          "name": "Is DHM expensive?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Quality DHM costs $20-35/month. Compare that to weekend hangover recovery costs."
          }
        },
        {
          "@type": "Question",
          "name": "Where do I buy good DHM?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We've tested 10+ brands. See our top picks → or read specific reviews like our Flyby Recovery analysis."
          }
        }
      ]
    }
  },
  {
    route: '/reviews',
    title: 'Best DHM Supplements 2026: We Tested 7 Hangover Pills',
    description: 'Lab-tested 7 DHM supplements for purity and effectiveness. See which hangover pills work and which waste money. #1 pick costs $0.50/dose.',
    ogImage: '/reviews-og.jpg',
    bodyStub: '<h1>Best DHM Supplements 2026</h1><p>We lab-tested 7 of the top DHM supplements for purity, dosage accuracy, and effectiveness. See which hangover pills actually work and which waste your money.</p><p>Independent analysis with our #1 pick costing just $0.50 per dose. Side-by-side comparisons of price, DHM content, and user outcomes.</p>',
    // ItemList schema for product carousel rich result. Order MUST mirror the
    // visible ranking in src/pages/Reviews.jsx (which imports the same JSON
    // from src/data/topProducts.json) — single source of truth, no drift.
    itemListSchema: generateItemListSchema({
      name: 'Best DHM Supplements 2026',
      description: 'Top 10 DHM supplements tested and ranked for hangover prevention',
      itemUrlBase: 'https://www.dhmguide.com/reviews',
      products: topProducts
    })
  },
  {
    route: '/research',
    title: 'Does DHM Work? 11 Studies Prove 70% Hangover Reduction',
    description: 'UCLA and USC clinical trials prove DHM reduces hangovers 70%. See evidence from 11 peer-reviewed studies and 600+ participants.',
    ogImage: '/research-og.jpg',
    bodyStub: '<h1>Does DHM Work? 11 Clinical Studies</h1><p>UCLA and USC clinical trials prove DHM reduces hangover symptoms by up to 70%. Evidence from 11 peer-reviewed studies covering 600+ participants.</p><p>Detailed breakdowns of randomized controlled trials, mechanism research, and liver protection findings from major research institutions.</p>',
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
    ogImage: '/about-og.jpg',
    bodyStub: '<h1>About DHM Guide</h1><p>DHM Guide has been your resource for science-backed hangover prevention since 2020. We analyze peer-reviewed clinical research and lab-test supplements.</p><p>Our mission is unbiased, expert guidance: clear dosing recommendations, honest product reviews, and accessible explanations of the science behind DHM.</p>'
  },
  {
    route: '/dhm-dosage-calculator',
    title: 'DHM Dosage Calculator | Personalized Prevention',
    description: 'Calculate your optimal DHM dosage based on weight and drinking habits. Science-backed recommendations for effective hangover prevention.',
    ogImage: '/calculator-og.jpg',
    bodyStub: '<h1>DHM Dosage Calculator</h1><p>Calculate your personalized optimal DHM dosage based on body weight and drinking habits. Science-backed recommendations for effective hangover prevention.</p><p>Get tailored timing and dose guidance derived from clinical trial data — typically 5mg per kg body weight, 30-60 minutes before drinking.</p>',
    // FAQPage schema — text MUST match DosageCalculatorEnhanced.jsx visible
    // FAQ section (~lines 1864-1928). Source array there is plain
    // {question,answer} objects so this schema reproduces them verbatim.
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much DHM should I take for hangover prevention?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The optimal DHM dosage for hangover prevention depends on your body weight, alcohol consumption, and tolerance. Most people need 300-600mg of dihydromyricetin, calculated at 5mg per kg of body weight. Our DHM dosage calculator provides personalized mg recommendations based on clinical research."
          }
        },
        {
          "@type": "Question",
          "name": "What is the correct dihydromyricetin dosage by weight?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The standard dihydromyricetin dosage is 5mg per kg of body weight. For a 150lb (68kg) person, this equals approximately 340mg of DHM. Heavier individuals may need up to 600-800mg, while lighter people may only need 250-400mg for effective hangover prevention."
          }
        },
        {
          "@type": "Question",
          "name": "When should I take DHM for best results?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For hangover prevention, take DHM 30-60 minutes before drinking. For recovery, take it immediately after drinking or before bed. DHM works best when taken with plenty of water."
          }
        },
        {
          "@type": "Question",
          "name": "Is DHM safe to take daily?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DHM is generally well-tolerated with no serious side effects reported in clinical studies. However, it's designed for occasional use with alcohol consumption. Don't exceed 1200mg in 24 hours."
          }
        },
        {
          "@type": "Question",
          "name": "How effective is DHM for hangover prevention?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clinical studies demonstrate DHM's effectiveness in reducing hangover symptoms and blood alcohol levels. A 2024 randomized controlled trial showed significant reductions in blood alcohol and gastrointestinal hangover symptoms compared to placebo."
          }
        },
        {
          "@type": "Question",
          "name": "Can I take DHM with other supplements?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DHM works well with electrolytes, B vitamins, and NAC (N-acetylcysteine). Avoid taking with blood thinners or if you have liver disease. Consult your healthcare provider for specific medication interactions."
          }
        }
      ]
    }
  },
  {
    route: '/compare',
    title: 'Compare 7 Best DHM Hangover Supplements [Side-by-Side 2026]',
    description: 'Compare DHM supplements side-by-side: price per dose, DHM content, user reviews, and shipping. Find your perfect hangover pill in 60 seconds. Interactive tool.',
    ogImage: '/compare-og.jpg',
    bodyStub: '<h1>Compare 7 Best DHM Hangover Supplements</h1><p>Compare the top DHM hangover supplements side-by-side: price per dose, DHM content per serving, verified user reviews, and shipping speed.</p><p>Interactive comparison tool helps you find your perfect hangover pill in 60 seconds. Filter by budget, dose strength, and shipping options.</p>'
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

      // Add ItemList schema if provided (e.g. /reviews product carousel).
      // Mirrors the FAQ pattern: schema is precomputed on the page entry
      // from shared product data; loop just appends.
      if (page.itemListSchema) {
        const itemListScript = document.createElement('script');
        itemListScript.setAttribute('type', 'application/ld+json');
        itemListScript.textContent = JSON.stringify(page.itemListSchema);
        document.head.appendChild(itemListScript);
      }

      // Add BreadcrumbList schema (eligible for Google breadcrumb rich result).
      // Helper handles the home page case (single Home item) and named segments
      // ('reviews' → 'Reviews', 'guide' → 'DHM Guide', etc.).
      const breadcrumbSchema = generateBreadcrumbSchema({ path: page.route });
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('type', 'application/ld+json');
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);

      // Inject per-route body stub (off-screen prerender content for crawlers).
      // Preserves PR #343 FOUC fix — the div's inline off-screen styling stays untouched;
      // only the innerHTML is rewritten so each route shows distinct H1 + paragraphs to crawlers.
      const stub = document.getElementById('prerender-main-stub');
      if (stub && page.bodyStub) {
        stub.innerHTML = page.bodyStub;
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
