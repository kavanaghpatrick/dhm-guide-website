#!/usr/bin/env node

/**
 * Sync Metadata Images Script
 * Updates the metadata index to match the image paths from individual post files
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'src/newblog/data/posts');
const METADATA_PATH = path.join(__dirname, 'src/newblog/data/metadata/index.json');

console.log('🔄 Syncing metadata image paths with individual post files...\n');

// Load current metadata
const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
console.log(`Found ${metadata.length} entries in metadata index`);

let updatedCount = 0;
let errors = 0;

// Update each metadata entry
metadata.forEach((entry, index) => {
  const postFile = path.join(POSTS_DIR, `${entry.slug}.json`);
  
  if (fs.existsSync(postFile)) {
    try {
      const postData = JSON.parse(fs.readFileSync(postFile, 'utf8'));
      
      if (entry.image !== postData.image) {
        console.log(`📝 Updating ${entry.slug}:`);
        console.log(`   Old: ${entry.image}`);
        console.log(`   New: ${postData.image}`);
        
        metadata[index].image = postData.image;
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error reading ${entry.slug}: ${error.message}`);
      errors++;
    }
  } else {
    console.warn(`⚠️  Post file not found: ${entry.slug}.json`);
  }
});

// Save updated metadata
fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));

console.log('\n📊 Sync Summary:');
console.log(`   Updated: ${updatedCount} entries`);
console.log(`   Errors: ${errors} entries`);
console.log(`   Total: ${metadata.length} entries`);

if (updatedCount > 0) {
  console.log('\n✅ Metadata index updated successfully!');
  console.log('   Hero images should now display correctly on the live site.');
} else {
  console.log('\n✅ No updates needed - metadata already in sync.');
}

console.log('\n💡 Next steps:');
console.log('   1. Commit and push the updated metadata');
console.log('   2. Deploy to production');
console.log('   3. Verify images display on live site');