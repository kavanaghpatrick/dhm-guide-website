import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import {
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateHowToSchema,
  generateScholarlyArticleSchema,
} from '../src/utils/structuredDataHelpers.js';
import { researchStudies } from '../src/data/research-studies.js';

// Shared product data — same JSON imported by src/pages/Reviews.modern.jsx so the
// ItemList schema on /reviews stays in sync with the visible ranked list.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const topProducts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/data/topProducts.json'), 'utf-8')
);

// Main pages to prerender with their unique meta data
const pages = [
  {
    route: '/',
    title: 'DHM Guide: DHM Supplements Compared on Dose, Price and Evidence',
    description: 'What the research says about DHM for hangovers, and the three DHM supplements we rank highest, with the dose and price per serving of each.',
    ogImage: '/og-image.jpg',
    bodyStub: '<h1>DHM supplements, compared on dose, price and evidence.</h1><p>DHM is a plant compound sold to prevent hangovers. The animal research is promising and the human evidence is thin.</p><p>See the <a href="/reviews">eight products we compare</a>, read the <a href="/guide">DHM guide</a>, or work out a starting dose with the <a href="/dhm-dosage-calculator">dosage calculator</a>.</p>'
  },
  {
    route: '/guide',
    title: 'The Complete Guide to DHM: Dose, Timing and Evidence',
    description: 'How much DHM to take and when, what the rat, mouse and human studies found, who should skip it, and what a dose costs.',
    ogImage: '/guide-og.jpg',
    bodyStub: '<h1>The complete guide to DHM</h1><p>DHM is a plant compound sold as a hangover supplement. This guide covers what the studies found, how much people take and when, and what to buy if you want to try it.</p><p>Take 300 to 600 mg about 30 to 60 minutes before your first drink. The strong results come from rats and mice, and the one controlled human trial we know of tested a drink made with raisin-tree extract, not a DHM capsule.</p>',
    // FAQPage schema: text MUST match the "Common questions" section of
    // src/pages/Guide.modern.jsx (links are reproduced as plain text).
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does it matter what I drink?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not to DHM. Its proposed effects are on alcohol itself, so a beer and a shot are the same to it. Dark drinks such as bourbon and red wine tend to cause worse hangovers than clear ones for other reasons, and DHM does nothing about those."
          }
        },
        {
          "@type": "Question",
          "name": "What if I forgot to take it before drinking?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Take it when you remember. No study has tested a late dose, so expect less from it. If you have already woken up hungover, our emergency hangover protocol covers what helps."
          }
        },
        {
          "@type": "Question",
          "name": "Can I take DHM every day?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It is sold for nights out, not daily use, and no study has followed people taking it daily for months. We wouldn't."
          }
        },
        {
          "@type": "Question",
          "name": "How is DHM different from ZBiotics?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ZBiotics is a probiotic drink engineered to make an enzyme that breaks down acetaldehyde in the gut. DHM is a plant compound you swallow as a capsule. They work in different ways, and neither has strong human evidence. We set them side by side in DHM vs ZBiotics."
          }
        }
      ]
    },
    // HowTo schema mirroring the "When to take it" list on /guide
    // (src/pages/Guide.modern.jsx). Schema content must match on-page content.
    howToSchema: generateHowToSchema({
      name: 'How to Take DHM Before Drinking',
      description: 'When to take a 300 to 600 mg dose of DHM (dihydromyricetin) on a night out.',
      image: 'https://www.dhmguide.com/guide-og.jpg',
      totalTime: 'PT1H',
      supply: ['DHM supplement (300-600mg)', 'Water'],
      steps: [
        {
          name: 'Before your first drink',
          text: 'Take your dose 30 to 60 minutes before your first drink, with a glass of water.'
        },
        {
          name: 'Before bed, on a long night',
          text: 'On a long night, some people take a second dose before bed. No study has tested this either way.'
        },
        {
          name: 'Between drinks',
          text: 'Drink water between drinks. It slows you down, which does more for the morning than any supplement.'
        }
      ]
    })
  },
  {
    route: '/reviews',
    title: 'Best DHM Supplements 2026: 8 Compared on Dose and Price',
    description: 'Eight DHM supplements compared on dose, price per serving and Amazon ratings, with the one we would buy and the ones we would skip.',
    ogImage: '/reviews-og.jpg',
    bodyStub: '<h1>Best DHM Supplements of 2026</h1><p>We compared eight DHM supplements on dose, price per serving and Amazon ratings. This is what we would buy, and what we would skip.</p><p>Editor\u2019s pick: No Days Wasted DHM Detox, for one product with DHM and the usual add-ins. If you only want DHM, NusaPure and Double Wood give you the same 1,000 mg for less. <a href="/compare">Compare up to four side by side</a>.</p>' +
      // Mirrors the "More buying guides" links in Reviews.modern.jsx (crawler-visible internal links).
      '<p>More buying guides: <a href="/never-hungover/no-days-wasted-dhm-review-analysis">No Days Wasted Review 2026</a>, <a href="/never-hungover/best-liver-supplements">best liver supplements</a>, <a href="/never-hungover/best-liver-detox-supplements">best liver detox supplements</a>, <a href="/never-hungover/best-fatty-liver-supplements">best fatty liver supplements</a>, <a href="/never-hungover/best-hangover-recovery-drinks">best hangover recovery drinks</a>.</p>',
    // ItemList schema for product carousel rich result. Order mirrors the
    // visible ranking on /reviews (topProducts.json sorted by score, the
    // "Best overall" order in Reviews.modern.jsx).
    itemListSchema: generateItemListSchema({
      name: 'Best DHM Supplements 2026',
      description: 'Eight DHM supplements ranked on dose and price',
      itemUrlBase: 'https://www.dhmguide.com/reviews',
      products: [...topProducts].sort((a, b) => b.score - a.score)
    })
  },
  {
    route: '/research',
    title: 'Does DHM Work? What the Research Actually Shows',
    description: 'Most DHM research is in animals and cells. What the few human trials found, how big they were, and what is still unproven for hangovers.',
    ogImage: '/research-og.jpg',
    bodyStub: '<h1>Does DHM Work? What the Research Actually Shows</h1><p>Most DHM research has been done in animals and cells. The often-quoted "70%" figure comes from a 2012 UCLA study in rats, not people. Only a handful of small human trials exist, and none proves DHM prevents hangovers.</p><p>Below, each study is labelled by type (human trial, animal study, cell study or review) with its size and what it measured.</p>',
    // One ScholarlyArticle JSON-LD block per study — emitted into the
    // prerendered head so Google crawlers see structured data without
    // executing JavaScript (Pattern #11). Mirror of the faqSchema field
    // immediately below — same DOM-injection mechanism.
    scholarlyArticles: researchStudies.map(generateScholarlyArticleSchema),
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How many clinical studies have been conducted on DHM?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dozens of studies have looked at DHM (dihydromyricetin), but most were done in animals or cells. Only a few small human trials exist, and most of those measured liver or metabolic markers rather than hangovers. This page lists each study with its type and size."
          }
        },
        {
          "@type": "Question",
          "name": "What did the UCLA DHM study find?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The 2012 UCLA study (Shen and colleagues, Journal of Neuroscience) was done in rats. DHM shortened alcohol intoxication and reduced withdrawal signs by acting on GABA-A receptors in the brain. It did not test people, so it does not show that DHM prevents hangovers in humans."
          }
        },
        {
          "@type": "Question",
          "name": "Are there randomized controlled trials on DHM for hangovers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Very few. The closest is a 2024 trial in the journal Foods with 30 adults that tested a Hovenia dulcis fruit extract, which contains DHM along with other compounds. It found lower blood alcohol and fewer stomach symptoms than placebo. It did not test DHM on its own."
          }
        },
        {
          "@type": "Question",
          "name": "Is DHM proven to protect the liver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Animal studies consistently show liver-protective effects, and a few small human trials in people with fatty liver disease reported better liver enzyme readings with DHM. None has shown that DHM protects the liver of people who drink."
          }
        },
        {
          "@type": "Question",
          "name": "What DHM dose does the research support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "There is no proven dose. No human trial has tested DHM doses for hangovers. Supplements commonly contain 300 to 1,000 mg per serving. Our calculator starts at 5 mg per kilogram of body weight with a 300 mg minimum, as a starting point rather than an established dose."
          }
        }
      ]
    }
  },
  {
    route: '/about',
    title: 'About DHM Guide | Hangover Prevention Resource',
    description: 'Who runs DHM Guide, how we pick the studies we cite, how we compare supplements on dose and price, and how we make money from affiliate links.',
    ogImage: '/about-og.jpg',
    bodyStub: '<h1>About DHM Guide</h1><p>DHM Guide explains what the published research says about DHM (dihydromyricetin) and hangovers, and compares DHM supplements on dose, price per serving and Amazon ratings. We do not lab-test products.</p><p>We earn a commission when you buy through our Amazon links. That never changes how a product ranks.</p>'
  },
  {
    route: '/dhm-dosage-calculator',
    title: 'DHM Dosage Calculator: How Much DHM Should I Take?',
    description: 'Enter your weight and how much you plan to drink to get a starting DHM dose, when to take it, and the cheapest product that delivers it.',
    ogImage: '/calculator-og.jpg',
    bodyStub: '<h1>DHM dosage calculator</h1><p>Enter your weight and what you plan to drink. You get a starting dose, when to take it, and the cheapest product we track that delivers it.</p><p>The calculator starts at 5 mg per kilogram of body weight with a 300 mg minimum. No human trial has tested DHM doses, so treat the result as a starting point.</p>',
    // FAQPage schema: text MUST match the FAQ array in
    // src/pages/DosageCalculatorEnhanced.jsx, verbatim.
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much DHM should I take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most people take 300 to 600 mg. This calculator starts at 5 mg per kilogram of body weight with a 300 mg minimum, which puts a 150 lb person at 350 mg. No human trial has tested DHM doses, so treat any number, this one included, as a starting point."
          }
        },
        {
          "@type": "Question",
          "name": "When should I take it?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "30 to 60 minutes before your first drink, with water. The animal studies gave DHM around the time of drinking, and there is little evidence for taking it the morning after."
          }
        },
        {
          "@type": "Question",
          "name": "Is it safe?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The one small human trial (25 adults, 2024) reported no safety problems, which says little about regular use. Skip it, or ask a doctor first, if you are pregnant or breastfeeding, take prescription medication, or have liver disease. The 1,200 mg ceiling here is a cautious limit we chose, not a tested threshold."
          }
        },
        {
          "@type": "Question",
          "name": "Does DHM work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The evidence is thin. DHM counteracted alcohol intoxication in rats and protected the liver in mice, both given by injection. The one controlled human trial we know of tested a drink made with raisin-tree extract, not DHM capsules. It found lower blood alcohol in the first half hour and milder stomach symptoms than placebo."
          }
        }
      ]
    }
  },
  {
    route: '/never-hungover',
    title: 'Never Hungover: Articles on DHM, Hangovers and Drinking',
    description: 'Articles on DHM dosing and timing, what the hangover research found, supplement comparisons, and how alcohol affects sleep, the liver and mood.',
    ogImage: '/og-image.jpg',
    bodyStub: '<h1>Never Hungover</h1><p>Evidence-based articles on DHM, hangover prevention, liver health, and smarter drinking.</p><p>Guides on DHM dosing and timing, clinical research, supplement comparisons, and recovery strategies.</p>'
  },
  {
    route: '/compare',
    title: 'Compare DHM Supplements Side by Side (2026)',
    description: 'Put up to four DHM supplements side by side: dose, price per serving, the cost of a 1,000 mg dose, servings and Amazon ratings.',
    ogImage: '/compare-og.jpg',
    bodyStub: '<h1>Compare DHM supplements side by side</h1><p>Pick up to four products. The table lines them up on dose, price, the cost of a 1,000 mg dose and Amazon ratings.</p><p>For the product we would buy and why, see the <a href="/reviews">DHM supplement reviews</a>.</p>'
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

      // Add HowTo schema if provided (e.g. /guide). Mirrors the FAQ pattern
      // above: schema is precomputed on the page entry, loop just appends.
      if (page.howToSchema) {
        const howToScript = document.createElement('script');
        howToScript.setAttribute('type', 'application/ld+json');
        howToScript.textContent = JSON.stringify(page.howToSchema);
        document.head.appendChild(howToScript);
      }

      // Add one ScholarlyArticle schema per DHM study (only used on /research).
      // Same DOM-injection pattern as the FAQ block above; uses
      // .textContent (NOT innerHTML) to avoid any HTML-injection surface.
      if (page.scholarlyArticles && page.scholarlyArticles.length > 0) {
        page.scholarlyArticles.forEach((schema) => {
          const script = document.createElement('script');
          script.setAttribute('type', 'application/ld+json');
          script.textContent = JSON.stringify(schema);
          document.head.appendChild(script);
        });
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
