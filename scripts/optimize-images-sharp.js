import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_WIDTH = 1920; // Max width for hero images
const QUALITY = 80; // WebP quality

console.log('🚀 Starting image optimization with Sharp...\n');

async function findImages(dir, extensions = ['.png', '.jpg', '.jpeg']) {
  const images = [];
  
  async function walk(currentDir) {
    const files = await fs.readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        await walk(filePath);
      } else if (extensions.some(ext => file.toLowerCase().endsWith(ext))) {
        images.push({
          path: filePath,
          size: stat.size,
          sizeMB: (stat.size / 1024 / 1024).toFixed(2),
          name: file
        });
      }
    }
  }
  
  await walk(dir);
  return images;
}

async function optimizeImage(imagePath) {
  const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  try {
    // Check if WebP already exists
    try {
      await fs.access(webpPath);
      const imgStat = await fs.stat(imagePath);
      const webpStat = await fs.stat(webpPath);
      if (webpStat.mtime > imgStat.mtime) {
        return { success: true, skipped: true, webpPath };
      }
    } catch {
      // WebP doesn't exist, continue
    }
    
    // Read and optimize image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Resize if too large
    if (metadata.width > MAX_WIDTH) {
      image.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Convert to WebP
    await image
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    const originalSize = (await fs.stat(imagePath)).size;
    const webpSize = (await fs.stat(webpPath)).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    return { success: true, webpPath, originalSize, webpSize, savings };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateImageReferences() {
  const SRC_DIR = path.join(__dirname, '..', 'src');
  const updates = [];
  
  async function walk(dir) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        await walk(filePath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        let content = await fs.readFile(filePath, 'utf8');
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
          await fs.writeFile(filePath, newContent);
          updates.push(filePath);
        }
      }
    }
  }
  
  await walk(SRC_DIR);
  return updates;
}

async function main() {
  try {
    // Find all images
    console.log('🔍 Finding images...');
    const images = await findImages(PUBLIC_DIR);
    const largeImages = images.filter(img => img.size > 300 * 1024);
    
    console.log(`Found ${images.length} images total`);
    console.log(`Found ${largeImages.length} images over 300KB\n`);
    
    // Optimize images
    console.log('🎨 Optimizing images...');
    let totalSaved = 0;
    let converted = 0;
    let skipped = 0;
    let failed = 0;
    
    // Process in batches of 5 to avoid memory issues
    const batchSize = 5;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const promises = batch.map(async (img) => {
        const relPath = path.relative(PUBLIC_DIR, img.path);
        console.log(`Converting ${relPath}...`);
        
        const result = await optimizeImage(img.path);
        
        if (result.success) {
          if (result.skipped) {
            console.log(`  ⏭️  Skipped (already exists)`);
            skipped++;
          } else {
            console.log(`  ✅ Saved ${result.savings}% (${(result.originalSize / 1024).toFixed(0)}KB → ${(result.webpSize / 1024).toFixed(0)}KB)`);
            totalSaved += result.originalSize - result.webpSize;
            converted++;
          }
        } else {
          console.log(`  ❌ Failed: ${result.error}`);
          failed++;
        }
        
        return result;
      });
      
      await Promise.all(promises);
    }
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   ✅ Converted: ${converted} images`);
    console.log(`   ⏭️  Skipped: ${skipped} images`);
    console.log(`   ❌ Failed: ${failed} images`);
    console.log(`   💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB\n`);
    
    // Update references
    console.log('📝 Updating image references in source files...');
    const updatedFiles = await updateImageReferences();
    console.log(`   Updated ${updatedFiles.length} files\n`);
    
    console.log('🎉 Image optimization complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();