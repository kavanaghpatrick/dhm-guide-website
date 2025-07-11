import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Images to optimize
const images = [
  {
    input: '../src/assets/02_liver_protection_infographic.webp',
    outputBase: '02_liver_protection_infographic',
    outputDir: '../src/assets'
  },
  {
    input: '../src/assets/04_gaba_receptor_mechanism.webp',
    outputBase: '04_gaba_receptor_mechanism',
    outputDir: '../src/assets'
  }
];

// Sizes to generate
const sizes = [
  { width: 380, suffix: '380w' },
  { width: 760, suffix: '760w' },
  { width: 1536, suffix: '1536w' }
];

async function optimizeImages() {
  console.log('🎨 Optimizing infographic images for responsive loading...\n');
  
  for (const image of images) {
    const inputPath = path.join(__dirname, image.input);
    const outputDir = path.join(__dirname, image.outputDir);
    
    console.log(`📸 Processing ${image.outputBase}...`);
    
    try {
      // Get original image metadata
      const metadata = await sharp(inputPath).metadata();
      console.log(`   Original size: ${metadata.width}x${metadata.height}`);
      
      // Create placeholder for blur-up effect
      const placeholder = await sharp(inputPath)
        .resize(20, Math.round(20 * metadata.height / metadata.width))
        .blur(10)
        .webp({ quality: 20 })
        .toBuffer();
      
      const placeholderBase64 = `data:image/webp;base64,${placeholder.toString('base64')}`;
      console.log(`   ✅ Placeholder created (${Buffer.byteLength(placeholderBase64)} bytes)`);
      
      // Generate responsive versions
      for (const { width, suffix } of sizes) {
        const outputPath = path.join(outputDir, `${image.outputBase}-${suffix}.webp`);
        
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
        
        const stats = fs.statSync(outputPath);
        const sizeInKB = (stats.size / 1024).toFixed(1);
        console.log(`   ✅ Created ${suffix} version (${sizeInKB} KB)`);
      }
      
      // Save placeholder data
      const placeholderData = {
        [image.outputBase]: {
          base64: placeholderBase64,
          width: metadata.width,
          height: metadata.height
        }
      };
      
      const placeholderPath = path.join(outputDir, `${image.outputBase}-placeholder.json`);
      fs.writeFileSync(placeholderPath, JSON.stringify(placeholderData, null, 2));
      console.log(`   ✅ Saved placeholder data\n`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${image.outputBase}:`, error);
    }
  }
  
  console.log('🚀 Infographic optimization complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Update Home.jsx to use ResponsiveImage component');
  console.log('2. Import and use the placeholder data for instant loading');
  console.log('3. Test responsive loading at different viewport sizes');
}

optimizeImages();