const fs = require('fs').promises;
const path = require('path');

async function fixHeroImages() {
  const postsDir = './src/newblog/data/posts';
  const publicDir = './public';
  
  // Posts identified with image issues
  const postsToFix = [
    // Object format issues
    'activated-charcoal-hangover.json',
    'complete-guide-hangover-types-2025.json',
    'dhm-vs-prickly-pear-hangovers.json',
    'dhm-vs-zbiotics.json',
    'flyby-vs-fuller-health-complete-comparison.json',
    'fraternity-formal-hangover-prevention-complete-dhm-guide-2025.json',
    'greek-week-champion-recovery-guide-dhm-competition-success-2025.json',
    'hangxiety-2025-dhm-prevents-post-drinking-anxiety.json',
    'post-dry-january-smart-drinking-strategies-2025.json',
    'professional-hangover-free-networking-guide-2025.json',
    'rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025.json'
  ];
  
  const fixes = [];
  const missingImages = [];
  
  console.log('🔧 Fixing hero image formats...\n');
  
  for (const filename of postsToFix) {
    const filepath = path.join(postsDir, filename);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`\n📄 Processing: ${filename}`);
      console.log(`  Current image field type: ${typeof data.image}`);
      
      if (!data.image) {
        console.log('  ❌ No image field - skipping');
        continue;
      }
      
      let newImagePath = null;
      let needsFix = false;
      
      // Handle different object formats
      if (typeof data.image === 'object') {
        // Case 1: {image: path, alt: text}
        if (data.image.image && typeof data.image.image === 'string') {
          newImagePath = data.image.image;
          needsFix = true;
          console.log(`  📷 Found path in image.image: ${newImagePath}`);
        }
        // Case 2: {src: path, alt: text}
        else if (data.image.src && typeof data.image.src === 'string') {
          newImagePath = data.image.src;
          needsFix = true;
          console.log(`  📷 Found path in image.src: ${newImagePath}`);
        }
        // Case 3: Nested {image: {src: path}}
        else if (data.image.image && typeof data.image.image === 'object' && data.image.image.src) {
          newImagePath = data.image.image.src;
          needsFix = true;
          console.log(`  📷 Found path in image.image.src: ${newImagePath}`);
        }
        // Case 4: No image path, just metadata
        else if (data.image.heading || data.image.title || data.image.description) {
          // Generate a default image path based on slug
          newImagePath = `/images/${data.slug}-hero.webp`;
          needsFix = true;
          console.log(`  ⚠️ No image path found - generating: ${newImagePath}`);
        }
      }
      
      if (needsFix && newImagePath) {
        // Update the image field to be a simple string
        data.image = newImagePath;
        
        // Save the updated file
        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`  ✅ Fixed: image field now = "${newImagePath}"`);
        
        fixes.push({
          file: filename,
          path: newImagePath
        });
        
        // Check if image exists
        const fullImagePath = path.join(publicDir, newImagePath);
        try {
          await fs.access(fullImagePath);
          console.log(`  ✅ Image file exists`);
        } catch (error) {
          console.log(`  ❌ Image file NOT FOUND`);
          missingImages.push({
            file: filename,
            path: newImagePath,
            fullPath: fullImagePath
          });
        }
      }
      
    } catch (error) {
      console.error(`  ⚠️ Error processing ${filename}:`, error.message);
    }
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log(`✅ Fixed ${fixes.length} posts with object format issues`);
  
  if (missingImages.length > 0) {
    console.log(`\n❌ Missing image files (${missingImages.length}):`);
    missingImages.forEach(item => {
      console.log(`  - ${item.file}`);
      console.log(`    Path: ${item.path}`);
    });
    
    // Generate missing images list
    const missingImagesList = missingImages.map(item => ({
      file: item.file,
      expectedPath: item.path,
      slug: item.file.replace('.json', '')
    }));
    
    await fs.writeFile(
      'missing-hero-images.json',
      JSON.stringify(missingImagesList, null, 2),
      'utf8'
    );
    
    console.log('\n💾 Missing images list saved to missing-hero-images.json');
  }
  
  // Also check the posts we optimized earlier for missing images
  console.log('\n\n🔍 Checking previously optimized posts for missing images...');
  
  const optimizedPosts = [
    'dhm-japanese-raisin-tree-complete-guide.json',
    'how-long-does-hangover-last.json',
    'summer-alcohol-consumption-dhm-safety-guide.json',
    'how-to-get-over-hangover.json'
  ];
  
  for (const filename of optimizedPosts) {
    const filepath = path.join(postsDir, filename);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      if (data.image && typeof data.image === 'string') {
        const fullImagePath = path.join(publicDir, data.image);
        try {
          await fs.access(fullImagePath);
        } catch (error) {
          console.log(`\n❌ Missing image for ${filename}: ${data.image}`);
          missingImages.push({
            file: filename,
            path: data.image,
            fullPath: fullImagePath
          });
        }
      }
    } catch (error) {
      console.error(`Error checking ${filename}:`, error.message);
    }
  }
  
  console.log('\n✅ Hero image format fixes complete!');
}

fixHeroImages().catch(console.error);