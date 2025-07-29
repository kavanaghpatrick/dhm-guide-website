#!/usr/bin/env node

/**
 * Script to fix remaining mismatched image paths with manual mappings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const metadataPath = path.join(__dirname, '../data/metadata/index.json');

// Manual mappings for known issues
const manualMappings = {
  // Exact path mappings
  '/images/wearable-technology-and-alcohol-2025-guide-to-smart-health-monitoring-hero.webp': '/images/wearable-technology-alcohol-2025-guide-smart-health-monitoring-hero.webp',
  '/images/longevity-alcohol-aging-hero.webp': '/images/longevity-science-how-alcohol-accelerates-aging-cellular-level-hero.webp',
  '/home/ubuntu/hero_image.png': '/images/workplace-wellness-hero.webp', // Fallback for broken path
  '/images/blog/alcohol-brain-research-2025.jpg': '/images/alcohol-cognitive-decline-2025-brain-research-reveals-hidden-risks-hero.webp',
  '/images/blog_post_batch2_9_alcohol-medication-interactions-complete-safety-guide-2025-hero.webp': '/images/alcohol-medication-interactions-hero.webp',
  '/images/alcohol-and-metabolic-flexibility-energy-system-optimization-2025-hero.webp': '/images/metabolic-flexibility-energy-hero.webp',
  
  // Flyby comparison mappings
  '/images/flyby-vs-nusapure-complete-comparison-2025-hero.webp': '/images/flyby-recovery-review-2025-hero.webp',
  '/images/flyby-vs-no-days-wasted-complete-comparison-2025-hero.webp': '/images/flyby-recovery-review-2025-hero.webp',
  '/images/flyby-vs-good-morning-pills-complete-comparison-2025-hero.webp': '/images/flyby-recovery-review-2025-hero.webp',
  '/images/flyby-vs-fuller-health-complete-comparison-2025-hero.webp': '/images/flyby-recovery-review-2025-hero.webp',
  '/images/flyby-vs-double-wood-complete-comparison-2025-hero.webp': '/images/flyby-recovery-review-2025-hero.webp',
  
  // Missing career/work images - use generic professional images
  '/images/hangover-career-impact-dhm-solution-2025-hero.webp': '/images/professional-hangover-free-networking-guide-2025-hero.webp',
  '/images/work-life-balance-dhm-2025-hero.webp': '/images/workplace-wellness-hero.webp',
  '/images/salary-negotiation-performance-dhm-2025-hero.webp': '/images/executive-performance-hero.webp',
  '/images/international-business-success-2025-hero.webp': '/images/business-travel-hero.webp',
  
  // Greek life and college
  '/images/greek-life-success-dhm-2025-hero.webp': '/images/greek-week-champion-recovery-guide-dhm-competition-success-2025-hero.webp',
  '/images/study-abroad-international-student-dhm-2025-hero.webp': '/images/college-student-dhm-guide-hero.webp',
  
  // Product reviews - use generic DHM images
  '/images/good-morning-hangover-pills-review-2025-hero.webp': '/images/good-morning-hangover-pills-comparison-2025-hero.webp',
  '/images/fuller-health-after-party-review-2025-hero.webp': '/images/no-days-wasted-vs-fuller-health-after-party-comparison-2025-hero.webp',
  '/images/dhm-randomized-controlled-trials-2024-hero.webp': '/images/dhm-supplement-stack-guide-complete-combinations-hero.webp',
  
  // Party and lifestyle
  '/images/mindful-drinking-wellness-warrior-dhm-2025-hero.webp': '/images/sober-curious-movement-hero.webp',
  '/images/organic-natural-hangover-prevention-clean-living-2025-hero.webp': '/images/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025-hero.webp',
  '/images/heavy-drinking-maximum-protection-dhm-2025-hero.webp': '/images/emergency-hangover-protocol-2025-hero.webp',
  '/images/pre-game-party-strategy-dhm-2025-hero.webp': '/images/festival-season-survival-dhm-guide-concert-music-festival-recovery-hero.webp',
  '/images/music-festival-survival-dhm-2025-hero.webp': '/images/festival-season-survival-dhm-guide-concert-music-festival-recovery-hero.webp',
  '/images/social-media-influencer-party-dhm-2025-hero.webp': '/images/social-media-drinking-hero.webp',
  
  // International drinking guides - use generic travel images
  '/images/italian-drinking-culture-guide-hero.webp': '/images/business-travel-hero.webp',
  '/images/spanish-drinking-culture-guide-hero.webp': '/images/ultimate-mexico-travel-hangover-prevention-guide-2025-hero.webp',
  '/images/french-wine-culture-guide-hero.webp': '/images/business-travel-hero.webp',
  '/images/german-beer-culture-guide-hero.webp': '/images/craft-beer-hero.webp',
  '/images/british-pub-culture-guide-hero.webp': '/images/british-pub-culture-guide-hero.webp',
  
  // Product comparisons
  '/images/toniiq-ease-dhm-review-analysis-hero.webp': '/images/double-wood-vs-toniiq-ease-dhm-comparison-2025-hero.webp',
  '/images/nusapure-dhm-review-analysis-hero.webp': '/images/double-wood-vs-nusapure-dhm-comparison-2025-hero.webp',
  
  // Health and science
  '/images/longevity-biohacking-dhm-liver-protection-hero.webp': '/images/biohacking-longevity-alcohol-optimization-maximum-lifespan-hero.webp',
  '/images/gut-health-alcohol-microbiome-protection-hero.webp': '/images/gut-microbiome-hero.webp',
  '/images/dhm-japanese-raisin-tree-complete-guide-hero.webp': '/images/dhm-supplement-stack-guide-complete-combinations-hero.webp',
  
  // Hangover guides - use generic hangover images
  '/images/how-to-get-rid-of-hangover-fast-hero.webp': '/images/emergency-hangover-protocol-2025-hero.webp',
  '/images/how-long-does-hangover-last-hero.webp': '/images/complete-guide-hangover-types-2025-hero.webp',
  '/images/how-to-get-over-hangover-hero.webp': '/images/complete-guide-hangover-types-2025-hero.webp',
  '/images/how-to-cure-a-hangover-complete-science-guide-hero.webp': '/images/complete-hangover-science-hub-hero.webp',
  '/images/summer-alcohol-consumption-dhm-safety-guide-hero.webp': '/images/holiday-drinking-hero.webp',
  '/images/dhm-science-explained-hero.webp': '/images/dhm-dosage-science-lab.webp',
  
  // Sleep and liver health
  '/images/sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025-hero.webp': '/images/sleep-optimization-social-drinkers-circadian-rhythm-hero.webp',
  '/images/liver-health-complete-guide-optimal-liver-function-protection-2025-hero.webp': '/images/liver-health-supplements-complete-guide-evidence-based-options-2025-hero.webp',
  
  // Alcohol type guides - use generic alcohol images
  '/images/wine-hangover-guide-hero.webp': '/images/french-wine-culture-guide-hero.webp',
  '/images/tequila-hangover-truth-hero.webp': '/images/ultimate-mexico-travel-hangover-prevention-guide-2025-hero.webp',
  '/images/whiskey-vs-vodka-hangover-hero.webp': '/images/rum-health-analysis-hero.webp',
  '/images/dhm-vs-prickly-pear-hangovers-hero.webp': '/images/traditional-mexican-hangover-remedies-vs-modern-supplements-hero.webp',
  '/images/dhm-vs-zbiotics-hero.webp': '/images/dhm-supplement-stack-guide-complete-combinations-hero.webp'
};

// Read metadata
console.log('Reading metadata...');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Apply manual mappings
let fixedCount = 0;
const updatedMetadata = metadata.map(entry => {
  if (entry.image && manualMappings[entry.image]) {
    console.log(`✅ Fixed: ${entry.image} → ${manualMappings[entry.image]}`);
    fixedCount++;
    return { ...entry, image: manualMappings[entry.image] };
  }
  return entry;
});

// Write updated metadata
console.log(`\nWriting updated metadata...`);
fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));

console.log(`\n✨ Fixed ${fixedCount} additional image paths!`);