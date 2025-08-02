const fs = require('fs').promises;
const path = require('path');

async function auditHeroImages() {
  const postsDir = './src/newblog/data/posts';
  const publicDir = './public';
  
  // Posts we've recently edited
  const editedPosts = [
    // Posts we converted from array to markdown
    'activated-charcoal-hangover.json',
    'complete-guide-hangover-types-2025.json',
    'dhm-vs-prickly-pear-hangovers.json',
    'dhm-vs-zbiotics.json',
    'double-wood-vs-toniiq-ease-dhm-comparison-2025.json',
    'flyby-vs-cheers-complete-comparison-2025.json',
    'flyby-vs-dhm1000-complete-comparison-2025.json',
    'flyby-vs-fuller-health-complete-comparison.json',
    'flyby-vs-good-morning-pills-complete-comparison-2025.json',
    'fraternity-formal-hangover-prevention-complete-dhm-guide-2025.json',
    'greek-week-champion-recovery-guide-dhm-competition-success-2025.json',
    'hangxiety-2025-dhm-prevents-post-drinking-anxiety.json',
    'is-dhm-safe-science-behind-side-effects-2025.json',
    'post-dry-january-smart-drinking-strategies-2025.json',
    'professional-hangover-free-networking-guide-2025.json',
    'rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025.json',
    
    // Posts we optimized earlier
    'dhm-japanese-raisin-tree-complete-guide.json',
    'how-long-does-hangover-last.json',
    'summer-alcohol-consumption-dhm-safety-guide.json',
    'how-to-get-over-hangover.json',
    'alcohol-and-immune-system-complete-health-impact-2025.json',
    'sleep-optimization-social-drinkers-circadian-rhythm.json',
    'adaptogenic-beverages-ancient-wisdom-meets-modern-alcohol-alternatives.json'
  ];
  
  const results = {
    correct: [],
    missingImage: [],
    noImageField: [],
    wrongFormat: [],
    fileNotFound: []
  };
  
  console.log(`🔍 Auditing hero images for ${editedPosts.length} edited blog posts...\n`);
  
  for (const filename of editedPosts) {
    const filepath = path.join(postsDir, filename);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`\n📄 ${filename}:`);
      
      // Check if image field exists
      if (!data.image) {
        console.log(`  ❌ No image field`);
        results.noImageField.push(filename);
        continue;
      }
      
      // Check image field format
      let imagePath;
      if (typeof data.image === 'string') {
        imagePath = data.image;
        console.log(`  📷 Image path: ${imagePath}`);
      } else if (typeof data.image === 'object' && data.image.image) {
        imagePath = data.image.image;
        console.log(`  📷 Image path (object format): ${imagePath}`);
        console.log(`     Alt text: ${data.image.alt || 'None'}`);
        results.wrongFormat.push({
          file: filename,
          format: 'object',
          path: imagePath
        });
      } else {
        console.log(`  ❌ Unknown image format: ${typeof data.image}`);
        results.wrongFormat.push({
          file: filename,
          format: typeof data.image,
          data: data.image
        });
        continue;
      }
      
      // Check if image file exists
      if (imagePath) {
        const fullImagePath = path.join(publicDir, imagePath);
        try {
          await fs.access(fullImagePath);
          console.log(`  ✅ Image file exists`);
          results.correct.push({
            file: filename,
            path: imagePath,
            exists: true
          });
        } catch (error) {
          console.log(`  ❌ Image file NOT FOUND: ${imagePath}`);
          results.fileNotFound.push({
            file: filename,
            path: imagePath,
            expectedLocation: fullImagePath
          });
        }
      } else {
        console.log(`  ❌ No image path specified`);
        results.missingImage.push(filename);
      }
      
    } catch (error) {
      console.error(`  ⚠️ Error reading ${filename}:`, error.message);
    }
  }
  
  // Summary report
  console.log('\n\n📊 HERO IMAGE AUDIT SUMMARY:');
  console.log('='*50);
  
  console.log(`\n✅ Correct (${results.correct.length}):`);
  results.correct.forEach(item => {
    console.log(`  - ${item.file}: ${item.path}`);
  });
  
  if (results.wrongFormat.length > 0) {
    console.log(`\n⚠️ Wrong Format (${results.wrongFormat.length}) - Using object instead of string:`);
    results.wrongFormat.forEach(item => {
      console.log(`  - ${item.file}: ${item.format} format`);
      if (item.path) console.log(`    Path: ${item.path}`);
    });
  }
  
  if (results.fileNotFound.length > 0) {
    console.log(`\n❌ Image File Not Found (${results.fileNotFound.length}):`);
    results.fileNotFound.forEach(item => {
      console.log(`  - ${item.file}`);
      console.log(`    Expected: ${item.path}`);
    });
  }
  
  if (results.noImageField.length > 0) {
    console.log(`\n❌ No Image Field (${results.noImageField.length}):`);
    results.noImageField.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  if (results.missingImage.length > 0) {
    console.log(`\n❌ Missing Image Path (${results.missingImage.length}):`);
    results.missingImage.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalAudited: editedPosts.length,
    summary: {
      correct: results.correct.length,
      wrongFormat: results.wrongFormat.length,
      fileNotFound: results.fileNotFound.length,
      noImageField: results.noImageField.length,
      missingImage: results.missingImage.length
    },
    details: results
  };
  
  await fs.writeFile(
    'hero-image-audit-report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  console.log('\n\n💾 Detailed report saved to hero-image-audit-report.json');
  
  // Recommendations
  console.log('\n\n🔧 RECOMMENDATIONS:');
  if (results.wrongFormat.length > 0) {
    console.log(`1. Fix ${results.wrongFormat.length} posts with object format - should be string`);
  }
  if (results.fileNotFound.length > 0) {
    console.log(`2. Create or fix paths for ${results.fileNotFound.length} missing image files`);
  }
  if (results.noImageField.length > 0) {
    console.log(`3. Add image field to ${results.noImageField.length} posts`);
  }
}

auditHeroImages().catch(console.error);