#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing JSON posts
const postsDir = '/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts';

// Generate SEO-optimized excerpts based on title and content
function generateExcerpt(post) {
  const title = post.title || '';
  const slug = post.slug || '';
  
  // Generate excerpt based on title and slug patterns
  const excerpts = {
    // Alcohol interaction posts
    'alcohol-and-nootropics-cognitive-enhancement-interactions-2025': 'Discover safe nootropic + alcohol interactions. Expert guide on cognitive enhancement while drinking. Science-backed DHM solutions. Shop supplements now!',
    'alcohol-hypertension-blood-pressure-management-2025': 'Manage blood pressure while drinking. Evidence-based strategies for hypertension + alcohol. DHM protects cardiovascular health. Get 15% off today!',
    'alcohol-ketogenic-diet-ketosis-impact-analysis-2025': 'Stay in ketosis while drinking! Complete keto + alcohol guide. DHM preserves metabolic state. Science-backed supplements. Free shipping over $50!',
    'alcohol-kidney-disease-renal-function-impact-2025': 'Protect kidney function from alcohol damage. Expert renal health strategies + DHM benefits. Doctor-recommended supplements. Order risk-free today!',
    'alcohol-mitochondrial-function-cellular-energy-recovery-2025': 'Restore cellular energy after drinking. DHM boosts mitochondrial function 40% faster. Science-proven recovery supplements. Limited time offer!',
    
    // Hub pages
    'complete-hangover-science-hub-2025': 'Ultimate hangover prevention resource. 50+ science-backed strategies, DHM guides, product reviews. Never suffer again. Shop top-rated supplements!',
    'dhm-supplements-comparison-center-2025': 'Compare 20+ DHM brands side-by-side. Expert reviews, lab tests, best prices. Find your perfect hangover prevention supplement. Save up to 30%!',
    
    // Product comparisons
    'double-wood-dhm-vs-dhm1000-comparison-2025': 'Double Wood vs DHM1000 detailed comparison. Dosage, pricing, effectiveness analyzed. Find the best DHM supplement for you. Exclusive discounts inside!',
    'double-wood-vs-cheers-restore-dhm-comparison-2025': 'Double Wood vs Cheers Restore head-to-head. Lab-tested potency, value comparison. Save money on premium DHM. Best price guarantee!',
    'double-wood-vs-dhm-depot-comparison-2025': 'Double Wood vs DHM Depot comprehensive review. Quality, pricing, user results compared. Get the best DHM deal. Free shipping available!',
    'double-wood-vs-fuller-health-after-party-comparison-2025': 'Double Wood vs Fuller Health detailed analysis. Which DHM supplement works better? Real user reviews. Special bundle pricing today!',
    'double-wood-vs-good-morning-hangover-pills-comparison-2025': 'Double Wood vs Good Morning Pills tested. Effectiveness, value, ingredients compared. Choose the right DHM. Save 20% on first order!',
    'double-wood-vs-no-days-wasted-dhm-comparison-2025': 'Double Wood vs No Days Wasted review. Price, potency, results analyzed. Expert DHM recommendations. Best deals + free shipping!',
    'double-wood-vs-nusapure-dhm-comparison-2025': 'Double Wood vs NusaPure DHM comparison. Quality, dosage, value breakdown. Find your ideal supplement. Exclusive coupon codes inside!',
    'double-wood-vs-toniiq-ease-dhm-comparison-2025': 'Double Wood vs Toniiq Ease head-to-head. Purity, pricing, effectiveness tested. Top DHM picks revealed. Limited time discounts!',
    
    // More comparisons
    'flyby-vs-cheers-complete-comparison-2025': 'Flyby vs Cheers ultimate showdown. Which hangover pill works better? Real test results + best prices. Save up to 25% today!',
    'flyby-vs-dhm1000-complete-comparison-2025': 'Flyby vs DHM1000 comprehensive review. Ingredients, dosing, value compared. Expert recommendations + exclusive deals. Order now!',
    'flyby-vs-double-wood-complete-comparison-2025': 'Flyby vs Double Wood DHM tested. Quality, price, effectiveness analyzed. Find your perfect match. Bundle deals available!',
    'flyby-vs-fuller-health-complete-comparison-2025': 'Flyby vs Fuller Health comparison guide. Which supplement prevents hangovers better? Lab results + discounts. Shop smart!',
    'flyby-vs-good-morning-pills-complete-comparison-2025': 'Flyby vs Good Morning detailed analysis. Ingredients, pricing, results compared. Best DHM for your needs. Special offers!',
    'flyby-vs-no-days-wasted-complete-comparison-2025': 'Flyby vs No Days Wasted review. Performance, value, quality tested. Expert picks + coupon codes. Free shipping deals!',
    'flyby-vs-nusapure-complete-comparison-2025': 'Flyby vs NusaPure DHM comparison. Potency, pricing, user reviews analyzed. Smart shopping guide. Save on bundles!',
    'flyby-vs-toniiq-ease-complete-comparison-2025': 'Flyby vs Toniiq Ease head-to-head test. Which DHM supplement wins? Real results + best prices. Order today!',
    
    // No Days Wasted comparisons
    'no-days-wasted-vs-cheers-restore-dhm-comparison-2025': 'No Days Wasted vs Cheers Restore analysis. Quality, effectiveness, value compared. Top hangover pills ranked. Exclusive discounts!',
    'no-days-wasted-vs-dhm-depot-comparison-2025': 'No Days Wasted vs DHM Depot review. Ingredients, pricing, results tested. Find your best DHM match. Special pricing today!',
    'no-days-wasted-vs-dhm1000-comparison-2025': 'No Days Wasted vs DHM1000 showdown. Potency, value, user reviews compared. Expert recommendations + deals. Shop now!',
    'no-days-wasted-vs-fuller-health-after-party-comparison-2025': 'No Days Wasted vs Fuller Health tested. Which prevents hangovers better? Complete comparison + savings. Order risk-free!',
    'no-days-wasted-vs-good-morning-hangover-pills-comparison-2025': 'No Days Wasted vs Good Morning Pills. Effectiveness, ingredients, pricing analyzed. Best DHM picks + coupons. Free shipping!',
    'no-days-wasted-vs-nusapure-dhm-comparison-2025': 'No Days Wasted vs NusaPure comparison. Quality, dosage, value breakdown. Smart DHM shopping guide. Bundle deals inside!',
    'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025': 'No Days Wasted vs Toniiq Ease review. Lab tests, pricing, results compared. Choose the right DHM. Save up to 30%!',
    
    // Health guides
    'alcohol-seasonal-affective-disorder-light-therapy-integration-2025': 'Beat winter blues while drinking. SAD + alcohol management with light therapy & DHM. Mood-boosting supplements. Feel better today!',
    'biohacking-longevity-alcohol-optimization-maximum-lifespan': 'Biohack drinking for longevity. Optimize alcohol consumption for maximum lifespan. DHM + anti-aging stack. Live longer, drink smarter!',
    'climate-change-alcohol-how-environmental-stress-affects-drinking-patterns': 'Climate change impacts drinking habits. Environmental stress + alcohol patterns explained. Adaptive DHM strategies. Stay healthy!',
    'creative-professionals-alcohol-optimizing-artistic-performance-without-compromise': 'Artists: optimize creativity + drinking. Maintain artistic flow with smart alcohol use. DHM preserves inspiration. Create freely!',
    'executive-cognitive-performance-how-alcohol-impacts-business-decision-making': 'Executives: protect decision-making while networking. Alcohol\'s impact on business performance + DHM solutions. Lead effectively!',
    'festival-season-survival-dhm-guide-concert-music-festival-recovery': 'Festival survival guide! Multi-day events + alcohol recovery. DHM strategies for non-stop partying. Rage responsibly!',
    'fraternity-formal-hangover-prevention-complete-dhm-guide-2025': 'Greek formal hangover prevention. Complete DHM guide for fraternity events. Party harder, recover faster. Brotherhood approved!',
    'greek-week-champion-recovery-guide-dhm-competition-success-2025': 'Win Greek Week with DHM! Competition recovery strategies. Maintain peak performance all week. Champion-level supplements!',
    'hangxiety-2025-dhm-prevents-post-drinking-anxiety': 'Stop hangxiety before it starts! DHM prevents post-drinking anxiety. Science-backed calm after partying. Feel confident again!',
    'liver-health-alcohol-supplements-dhm-2025': 'Protect your liver while drinking. Top supplements + DHM for liver health. Doctor-recommended protection. Order today!',
    'neurodivergent-adults-alcohol-adhd-autism-mindful-drinking-strategies': 'ADHD/Autism alcohol guide. Mindful drinking strategies for neurodivergent adults. DHM + sensory support. Drink comfortably!',
    'nootropics-vs-alcohol-smart-cognitive-enhancement-modern-professionals': 'Smart drugs + alcohol guide. Cognitive enhancement for modern professionals. Safe nootropic + DHM stacks. Think clearly!',
    'post-dry-january-smart-drinking-strategies-2025': 'Post-Dry January success! Smart strategies to maintain mindful drinking. DHM supports balanced lifestyle. Stay on track!',
    'professional-hangover-free-networking-guide-2025': 'Network without hangovers! Professional drinking strategies + DHM protection. Close deals, feel great. Career insurance!',
    'remote-work-alcohol-managing-home-based-drinking-peak-productivity': 'Remote work drinking guide. Manage home alcohol use for peak productivity. DHM + WFH wellness. Stay focused!',
    'rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025': 'Survive sorority rush! DHM strategies for recruitment week. Look fresh, feel amazing. Sisterhood success guide!',
    'social-media-drinking-how-digital-culture-shapes-alcohol-wellness': 'Social media + drinking wellness. How digital culture impacts alcohol habits. DHM for influencer lifestyle. Stay photogenic!',
    'spring-break-2025-cancun-survival-guide-dhm': 'Cancun Spring Break survival! Beach parties + DHM recovery. Party like a pro in paradise. Sun, fun, no hangovers!',
    'traditional-mexican-hangover-remedies-vs-modern-supplements': 'Mexican hangover cures tested! Traditional remedies vs modern DHM. What really works? Scientific comparison + deals!',
    'ultimate-mexico-travel-hangover-prevention-guide-2025': 'Mexico travel without hangovers! Tequila, mezcal, cerveza + DHM guide. Vacation recovery secrets. Enjoy every moment!',
    'viral-hangover-cures-tested-science-2025': 'TikTok hangover cures tested! Viral remedies vs proven DHM science. What actually works? Truth revealed + discounts!',
    'wearable-technology-alcohol-2025-guide-smart-health-monitoring': 'Smart wearables + alcohol tracking. Monitor drinking impact in real-time. DHM + tech optimization. Data-driven health!',
    'zebra-striping-drinking-trend-2025': 'Master zebra striping! Alternate alcohol + water like a pro. DHM enhances this trending technique. Drink smarter!'
  };

  // Return specific excerpt if available
  if (excerpts[slug]) {
    return excerpts[slug];
  }

  // Generate default excerpt based on title patterns
  if (title.toLowerCase().includes('dhm') && title.toLowerCase().includes('review')) {
    return `${title.split(' ')[0]} DHM review: ingredients, effectiveness, pricing analyzed. Is it worth it? Expert verdict + exclusive discounts. Shop smart!`;
  } else if (title.toLowerCase().includes('comparison') || title.toLowerCase().includes(' vs ')) {
    return 'Complete supplement comparison guide. Which DHM brand works best? Side-by-side analysis + exclusive deals. Find your perfect match!';
  } else if (title.toLowerCase().includes('guide')) {
    return 'Expert guide to smart drinking & hangover prevention. Science-backed DHM strategies + top supplements. Feel great tomorrow!';
  } else if (title.toLowerCase().includes('alcohol') && title.toLowerCase().includes('health')) {
    return 'Protect your health while drinking. Evidence-based strategies + DHM benefits. Doctor-approved supplements. Order risk-free!';
  } else {
    // Generic but compelling excerpt
    return 'Science-backed hangover prevention guide. DHM supplements, expert tips, exclusive deals. Never suffer again. Shop top-rated products!';
  }
}

// Process all JSON files
let processedCount = 0;
let skippedCount = 0;
const filesToUpdate = [];

fs.readdirSync(postsDir).forEach(filename => {
  if (!filename.endsWith('.json')) return;
  
  const filepath = path.join(postsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  
  try {
    const post = JSON.parse(content);
    
    // Check if excerpt is missing or empty
    if (!post.excerpt || post.excerpt.trim() === '') {
      const excerpt = generateExcerpt(post);
      post.excerpt = excerpt;
      
      // Write updated file
      fs.writeFileSync(filepath, JSON.stringify(post, null, 2));
      
      filesToUpdate.push({
        file: filename,
        title: post.title,
        excerpt: excerpt
      });
      
      processedCount++;
      console.log(`✓ Added excerpt to: ${filename}`);
    } else {
      skippedCount++;
    }
  } catch (e) {
    console.error(`Error processing ${filename}:`, e.message);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files updated: ${processedCount}`);
console.log(`Files skipped (already have excerpt): ${skippedCount}`);

if (filesToUpdate.length > 0) {
  console.log(`\n=== Updated Files ===`);
  filesToUpdate.forEach(update => {
    console.log(`\nFile: ${update.file}`);
    console.log(`Title: ${update.title}`);
    console.log(`Excerpt: ${update.excerpt}`);
  });
}