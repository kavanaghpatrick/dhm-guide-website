#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SRC_DIR = path.join(__dirname, '..', 'src');

console.log('🚀 Starting comprehensive image optimization...\n');

// Check if cwebp is installed
const checkWebpInstalled = () => {
  try {
    execSync('which cwebp', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Find all image files
const findImages = (dir, extensions = ['.png', '.jpg', '.jpeg']) => {
  const images = [];
  
  const walk = (currentDir) => {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        walk(filePath);
      } else if (extensions.some(ext => file.toLowerCase().endsWith(ext))) {
        images.push({
          path: filePath,
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2),
          name: file
        });
      }
    });
  };
  
  walk(dir);
  return images;
};

// Convert image to WebP
const convertToWebP = (imagePath, quality = 80) => {
  const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  try {
    // Skip if WebP already exists and is newer
    if (fs.existsSync(webpPath)) {
      const imgStat = fs.statSync(imagePath);
      const webpStat = fs.statSync(webpPath);
      if (webpStat.mtime > imgStat.mtime) {
        return { success: true, skipped: true, webpPath };
      }
    }
    
    // Convert to WebP
    execSync(`cwebp -q ${quality} "${imagePath}" -o "${webpPath}"`, { stdio: 'ignore' });
    
    const originalSize = fs.statSync(imagePath).size;
    const webpSize = fs.statSync(webpPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    return { success: true, webpPath, originalSize, webpSize, savings };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update image references in source files
const updateImageReferences = () => {
  const updates = [];
  
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walk(filePath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace image extensions with .webp
        const newContent = content.replace(
          /(['"`])([^'"`]+)\.(png|jpg|jpeg)(['"`])/gi,
          (match, quote1, path, ext, quote2) => {
            // Skip if already .webp or if it's a URL
            if (path.includes('http://') || path.includes('https://')) {
              return match;
            }
            modified = true;
            return `${quote1}${path}.webp${quote2}`;
          }
        );
        
        if (modified) {
          fs.writeFileSync(filePath, newContent);
          updates.push(filePath);
        }
      }
    });
  };
  
  walk(SRC_DIR);
  return updates;
};

// Main optimization process
const main = async () => {
  // Check WebP support
  if (!checkWebpInstalled()) {
    console.log('❌ cwebp is not installed!');
    console.log('📦 Please install it first:');
    console.log('   - Mac: brew install webp');
    console.log('   - Ubuntu/Debian: sudo apt-get install webp');
    console.log('   - Windows: Download from https://developers.google.com/speed/webp/download');
    process.exit(1);
  }
  
  // Find all images
  console.log('🔍 Finding images...');
  const images = findImages(PUBLIC_DIR);
  const largeImages = images.filter(img => img.size > 300 * 1024);
  
  console.log(`Found ${images.length} images total`);
  console.log(`Found ${largeImages.length} images over 300KB\n`);
  
  // Convert images
  console.log('🎨 Converting images to WebP...');
  let totalSaved = 0;
  let converted = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const img of images) {
    const relPath = path.relative(PUBLIC_DIR, img.path);
    process.stdout.write(`Converting ${relPath}... `);
    
    // Use higher compression for larger images
    const quality = img.size > 1024 * 1024 ? 75 : 80;
    const result = convertToWebP(img.path, quality);
    
    if (result.success) {
      if (result.skipped) {
        process.stdout.write('⏭️  Skipped (already exists)\n');
        skipped++;
      } else {
        process.stdout.write(`✅ Saved ${result.savings}%\n`);
        totalSaved += result.originalSize - result.webpSize;
        converted++;
      }
    } else {
      process.stdout.write('❌ Failed\n');
      failed++;
    }
  }
  
  console.log('\n📊 Conversion Summary:');
  console.log(`   ✅ Converted: ${converted} images`);
  console.log(`   ⏭️  Skipped: ${skipped} images`);
  console.log(`   ❌ Failed: ${failed} images`);
  console.log(`   💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB\n`);
  
  // Update references
  console.log('📝 Updating image references in source files...');
  const updatedFiles = updateImageReferences();
  console.log(`   Updated ${updatedFiles.length} files\n`);
  
  // Create picture component for fallback support
  const pictureComponent = `import React from 'react'

export default function Picture({ src, alt, className, loading = "lazy", ...props }) {
  // Extract base path and extension
  const basePath = src.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const originalExt = src.match(/\.(png|jpg|jpeg)$/i)?.[0] || '.png';
  
  return (
    <picture>
      <source srcSet={\`\${basePath}.webp\`} type="image/webp" />
      <source srcSet={\`\${basePath}\${originalExt}\`} type={\`image/\${originalExt.slice(1)}\`} />
      <img 
        src={\`\${basePath}\${originalExt}\`} 
        alt={alt} 
        className={className}
        loading={loading}
        {...props}
      />
    </picture>
  );
}`;
  
  const picturePath = path.join(SRC_DIR, 'components', 'Picture.jsx');
  fs.writeFileSync(picturePath, pictureComponent);
  console.log('✅ Created Picture component for WebP fallback support');
  
  console.log('\n🎉 Image optimization complete!');
  console.log('📌 Next steps:');
  console.log('   1. Test the website to ensure all images load correctly');
  console.log('   2. Use the Picture component for critical images that need fallback');
  console.log('   3. Consider lazy loading for below-fold images');
  console.log('   4. Commit the changes and deploy');
};

main().catch(console.error);