#!/usr/bin/env node

/**
 * Remove hero image references for posts with missing image files
 * Issue #30: Fixes 404 errors from 40 blog posts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '../src/newblog/data/posts');

// List of 40 posts with missing images (generated from analysis)
const postsWithMissingImages = [
  'alcohol-and-cognitive-decline-2025-brain-research-reveals-hidden-risks.json',
  'alcohol-and-metabolic-flexibility-energy-system-optimization-2025.json',
  'alcohol-and-nootropics-cognitive-enhancement-interactions-2025.json',
  'alcohol-ketogenic-diet-ketosis-impact-analysis-2025.json',
  'alcohol-kidney-disease-renal-function-impact-2025.json',
  'can-you-take-dhm-every-day-long-term-guide-2025.json',
  'dhm-availability-worldwide-guide-2025.json',
  'dhm-japanese-raisin-tree-complete-guide.json',
  'dhm-supplements-comparison-center-2025.json',
  'dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025.json',
  'dhm-vs-prickly-pear-hangovers.json',
  'dhm-vs-zbiotics.json',
  'does-dhm-work-honest-science-review-2025.json',
  'fatty-liver-disease-diet-complete-nutrition-guide-2025.json',
  'gaba-gamma-aminobutyric-acid-complete-guide-benefits-dosage-natural-sources-2025.json',
  'greek-life-success-dhm-2025.json',
  'gut-health-alcohol-microbiome-protection.json',
  'hangover-career-impact-dhm-solution-2025.json',
  'hangover-nausea-complete-guide-fast-stomach-relief-2025.json',
  'hangover-supplements-complete-guide-what-actually-works-2025.json',
  'heavy-drinking-maximum-protection-dhm-2025.json',
  'how-long-does-hangover-last.json',
  'how-to-cure-a-hangover-complete-science-guide.json',
  'how-to-get-over-hangover.json',
  'international-business-success-2025.json',
  'liver-health-complete-guide-optimal-liver-function-protection-2025.json',
  'liver-health-supplements-complete-guide-evidence-based-options-2025.json',
  'longevity-biohacking-dhm-liver-protection.json',
  'mindful-drinking-wellness-warrior-dhm-2025.json',
  'nac-vs-dhm-which-antioxidant-better-liver-protection-2025.json',
  'natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025.json',
  'non-alcoholic-fatty-liver-disease-nafld-prevention-management-guide-2025.json',
  'organic-natural-hangover-prevention-clean-living-2025.json',
  'pre-game-party-strategy-dhm-2025.json',
  'salary-negotiation-performance-dhm-2025.json',
  'sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025.json',
  'study-abroad-international-student-dhm-2025.json',
  'summer-alcohol-consumption-dhm-safety-guide.json',
  'ultimate-dhm-safety-guide-hub-2025.json',
  'work-life-balance-dhm-2025.json'
];

let updatedCount = 0;
let skippedCount = 0;

console.log(`🔍 Removing hero image references from ${postsWithMissingImages.length} posts...\n`);

postsWithMissingImages.forEach(filename => {
  const filePath = path.join(postsDir, filename);

  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.image) {
      const oldImage = data.image;

      // Set image to null
      data.image = null;

      // Write back to file with pretty formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

      console.log(`✅ ${data.slug}`);
      console.log(`   Removed: ${oldImage}\n`);
      updatedCount++;
    } else {
      console.log(`⏭️  ${filename} - already null/missing`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount} posts`);
console.log(`   ⏭️  Skipped: ${skippedCount} posts (already null)`);
console.log(`\n🎉 Done! Hero image references removed.`);
console.log(`\nNext steps:`);
console.log(`   1. Test: npm run build`);
console.log(`   2. Commit: git add . && git commit -m "Fix: Remove 40 missing hero image references (Issue #30)"`);
console.log(`   3. Deploy: Create PR`);
