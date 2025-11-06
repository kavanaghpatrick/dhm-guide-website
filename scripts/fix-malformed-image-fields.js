#!/usr/bin/env node

/**
 * Fix 8 posts with malformed image field (dict instead of string)
 * Issue #38: Fixes prerendering errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '../src/newblog/data/posts');

// 8 posts with malformed image fields
const postsToFix = {
  // Posts with extractable image paths (2)
  'tequila-hangover-truth.json': 'EXTRACT',
  'wine-hangover-guide.json': 'EXTRACT',

  // Posts with no valid path - set to null (6)
  'festival-season-survival-dhm-guide-concert-music-festival-recovery.json': 'NULL',
  'spring-break-2025-cancun-survival-guide-dhm.json': 'NULL',
  'traditional-mexican-hangover-remedies-vs-modern-supplements.json': 'NULL',
  'ultimate-mexico-travel-hangover-prevention-guide-2025.json': 'NULL',
  'viral-hangover-cures-tested-science-2025.json': 'NULL',
  'zebra-striping-drinking-trend-2025.json': 'NULL'
};

let extracted = 0;
let nulled = 0;
let errors = 0;

console.log(`🔧 Fixing 8 posts with malformed image fields...\n`);

for (const [filename, action] of Object.entries(postsToFix)) {
  const filePath = path.join(postsDir, filename);

  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const oldImage = data.image;

    if (typeof oldImage !== 'object' || oldImage === null) {
      console.log(`⏭️  ${data.slug} - already fixed (type: ${typeof oldImage})`);
      continue;
    }

    if (action === 'EXTRACT') {
      // Extract nested image path
      if (oldImage.image && typeof oldImage.image === 'string') {
        data.image = oldImage.image;
        console.log(`✅ ${data.slug}`);
        console.log(`   Extracted: ${oldImage.image}`);
        console.log(`   From: ${JSON.stringify(oldImage).substring(0, 60)}...`);
        extracted++;
      } else {
        // Fallback to null if extraction fails
        data.image = null;
        console.log(`⚠️  ${data.slug}`);
        console.log(`   No extractable path found, set to null`);
        nulled++;
      }
    } else if (action === 'NULL') {
      // Set to null
      data.image = null;
      console.log(`✅ ${data.slug}`);
      console.log(`   Set to null (no valid path in dict)`);
      console.log(`   Was: ${JSON.stringify(oldImage).substring(0, 60)}...`);
      nulled++;
    }

    // Write back with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log();

  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    errors++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Extracted paths: ${extracted} posts`);
console.log(`   ✅ Set to null: ${nulled} posts`);
console.log(`   ❌ Errors: ${errors} posts`);
console.log(`   📈 Total fixed: ${extracted + nulled} posts`);
console.log(`\n🎉 Done! Malformed image fields fixed.`);
console.log(`\nNext steps:`);
console.log(`   1. Test: npm run build`);
console.log(`   2. Verify: Should see 0 prerendering errors (was 8)`);
console.log(`   3. Commit: git add . && git commit`);
