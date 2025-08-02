const fs = require('fs').promises;
const path = require('path');

async function fixMissingImagePaths() {
  const postsDir = './src/newblog/data/posts';
  
  // Posts with missing images that need path updates
  const updates = [
    {
      file: 'dhm-vs-prickly-pear-hangovers.json',
      currentPath: '/images/dhm-vs-prickly-pear.jpg',
      newPath: '/images/dhm-vs-prickly-pear-hangovers-hero.webp'
    },
    {
      file: 'dhm-vs-zbiotics.json',
      currentPath: '/images/dhm-vs-zbiotics-comparison.jpg',
      newPath: '/images/dhm-vs-zbiotics-hero.webp'
    },
    {
      file: 'flyby-vs-fuller-health-complete-comparison.json',
      currentPath: '/images/flyby-vs-fuller-health-hero.jpg',
      newPath: '/images/flyby-vs-fuller-health-complete-comparison-hero.webp'
    }
  ];
  
  console.log('🔧 Updating image paths to match standard pattern...\n');
  
  for (const update of updates) {
    const filepath = path.join(postsDir, update.file);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`📄 ${update.file}:`);
      console.log(`  Current: ${data.image}`);
      console.log(`  New: ${update.newPath}`);
      
      // Update the image path
      data.image = update.newPath;
      
      // Save the updated file
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`  ✅ Updated!\n`);
      
    } catch (error) {
      console.error(`  ⚠️ Error processing ${update.file}:`, error.message);
    }
  }
  
  console.log('✅ Image paths updated to standard .webp format');
  console.log('\n📝 Images to create:');
  updates.forEach(update => {
    console.log(`  - ${update.newPath}`);
  });
}

fixMissingImagePaths().catch(console.error);