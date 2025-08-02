const fs = require('fs').promises;
const path = require('path');

async function verifyBlogFixes() {
  const postsDir = './src/newblog/data/posts';
  const publicDir = './public';
  
  // Posts we've worked on today
  const verifyPosts = [
    // Posts with content converted from array to markdown
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
  
  console.log('🔍 Verifying blog post fixes...\n');
  console.log('Checking: Content format, Image field format, Image file existence\n');
  
  let allGood = true;
  let missingImages = [];
  
  for (const filename of verifyPosts) {
    const filepath = path.join(postsDir, filename);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`📄 ${filename}:`);
      
      // Check content format
      let contentStatus = '❌ Missing';
      if (typeof data.content === 'string') {
        contentStatus = data.content.trim() ? '✅ String with content' : '⚠️ Empty string';
      } else if (Array.isArray(data.content)) {
        contentStatus = '❌ Still array format!';
        allGood = false;
      }
      
      // Check image format
      let imageStatus = '❌ Missing';
      let imagePath = null;
      if (typeof data.image === 'string') {
        imageStatus = '✅ String format';
        imagePath = data.image;
      } else if (typeof data.image === 'object') {
        imageStatus = '❌ Still object format!';
        allGood = false;
      }
      
      // Check image file
      let fileStatus = '❌ Not checked';
      if (imagePath) {
        const fullImagePath = path.join(publicDir, imagePath);
        try {
          await fs.access(fullImagePath);
          fileStatus = '✅ File exists';
        } catch (error) {
          fileStatus = '❌ File missing';
          missingImages.push({
            post: filename,
            path: imagePath
          });
        }
      }
      
      console.log(`  Content: ${contentStatus}`);
      console.log(`  Image field: ${imageStatus}${imagePath ? ` (${imagePath})` : ''}`);
      console.log(`  Image file: ${fileStatus}`);
      console.log('');
      
    } catch (error) {
      console.error(`  ⚠️ Error reading ${filename}:`, error.message);
      allGood = false;
    }
  }
  
  console.log('\n📊 SUMMARY:');
  if (allGood && missingImages.length === 0) {
    console.log('✅ All posts have correct content and image formats!');
    console.log('✅ All image files exist!');
  } else {
    if (!allGood) {
      console.log('❌ Some posts still have format issues');
    }
    if (missingImages.length > 0) {
      console.log(`\n❌ Missing image files (${missingImages.length}):`);
      missingImages.forEach(item => {
        console.log(`  - ${item.post}: ${item.path}`);
      });
    }
  }
  
  console.log('\n💡 To test rendering:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:5173/blog');
  console.log('3. Check these specific posts for content and hero images');
}

verifyBlogFixes().catch(console.error);