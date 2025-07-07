#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_IMAGE_SIZE = 300 * 1024; // 300KB max for hero images

console.log('🖼️  Starting image optimization...\n');

// Find all PNG files
const findLargeImages = (dir) => {
  const files = fs.readdirSync(dir);
  const largeImages = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      largeImages.push(...findLargeImages(filePath));
    } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      if (stat.size > MAX_IMAGE_SIZE) {
        largeImages.push({
          path: filePath,
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2)
        });
      }
    }
  });
  
  return largeImages;
};

const largeImages = findLargeImages(PUBLIC_DIR);

if (largeImages.length === 0) {
  console.log('✅ All images are already optimized!');
  process.exit(0);
}

console.log(`Found ${largeImages.length} images that need optimization:\n`);

largeImages.forEach(img => {
  console.log(`📁 ${path.relative(PUBLIC_DIR, img.path)}`);
  console.log(`   Size: ${img.sizeMB}MB (${(img.size / 1024).toFixed(0)}KB)`);
});

console.log('\n⚠️  These images are slowing down your page load significantly!');
console.log('📝 To optimize them, you can:');
console.log('\n1. Install cwebp for WebP conversion:');
console.log('   brew install webp\n');
console.log('2. Run these commands:\n');

largeImages.slice(0, 5).forEach(img => {
  const relPath = path.relative(PUBLIC_DIR, img.path);
  const webpPath = relPath.replace(/\.(png|jpg|jpeg)$/, '.webp');
  console.log(`   cwebp -q 80 public/${relPath} -o public/${webpPath}`);
});

if (largeImages.length > 5) {
  console.log(`   ... and ${largeImages.length - 5} more files`);
}

console.log('\n3. Or use an online tool like https://squoosh.app/');
console.log('\n💡 Target: Keep hero images under 300KB for optimal performance');