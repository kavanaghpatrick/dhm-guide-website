import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../public/images/01_before_after_hangover.webp');
const outputDir = path.join(__dirname, '../public/images');

async function optimizeImage() {
  console.log('🎨 Optimizing LCP image for better performance...');
  
  try {
    // Create a tiny placeholder (base64 encoded)
    const placeholder = await sharp(inputPath)
      .resize(20, 13) // Maintain aspect ratio (1536:1024 = 1.5:1)
      .blur(10)
      .webp({ quality: 20 })
      .toBuffer();
    
    const placeholderBase64 = `data:image/webp;base64,${placeholder.toString('base64')}`;
    console.log('✅ Placeholder created (for instant loading)');
    console.log(`📏 Placeholder size: ${Buffer.byteLength(placeholderBase64)} bytes`);
    
    // Create responsive versions
    const sizes = [
      { width: 640, suffix: '640w' },
      { width: 768, suffix: '768w' },
      { width: 1024, suffix: '1024w' },
      { width: 1536, suffix: '1536w' } // Original size
    ];
    
    for (const { width, suffix } of sizes) {
      const outputPath = path.join(outputDir, `before-after-dhm-${suffix}.webp`);
      
      await sharp(inputPath)
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 85,
          effort: 6
        })
        .toFile(outputPath);
      
      console.log(`✅ Created ${suffix} version`);
    }
    
    // Create an AVIF version for modern browsers (smaller file size)
    await sharp(inputPath)
      .resize(1536, null, { withoutEnlargement: true })
      .avif({ quality: 80, effort: 6 })
      .toFile(path.join(outputDir, 'before-after-dhm.avif'));
    
    console.log('✅ Created AVIF version for modern browsers');
    
    // Save placeholder to a JSON file for import
    const placeholderData = {
      base64: placeholderBase64,
      width: 20,
      height: 13
    };
    
    await import('fs').then(fs => {
      fs.default.writeFileSync(
        path.join(__dirname, '../src/data/lcp-placeholder.json'),
        JSON.stringify(placeholderData, null, 2)
      );
    });
    
    console.log('\n🚀 LCP Image Optimization Complete!');
    console.log('📁 Files created in public/images/');
    console.log('\n💡 Next steps:');
    console.log('1. Update Home.jsx to use the new responsive images');
    console.log('2. Implement the placeholder for instant visual feedback');
    console.log('3. Use srcset for responsive loading');
    
  } catch (error) {
    console.error('❌ Error optimizing image:', error);
  }
}

optimizeImage();