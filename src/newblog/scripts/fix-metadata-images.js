#!/usr/bin/env node

/**
 * Script to fix mismatched image paths in metadata/index.json
 * Matches metadata image paths to actual files in public/images/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const metadataPath = path.join(__dirname, '../data/metadata/index.json');
const imagesDir = path.join(__dirname, '../../../public/images');

// Read all image files
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'))
  .map(file => file.toLowerCase());

// Create a mapping function to find the best match
function findBestImageMatch(metadataImage) {
  // Extract the filename from the path
  const filename = metadataImage.split('/').pop();
  const baseNameNoExt = filename.replace(/\.(jpg|png|webp)$/, '');
  
  // Remove "blog/" prefix if present
  const cleanPath = metadataImage.replace('/images/blog/', '/images/');
  
  // Try different strategies to find a match
  const strategies = [
    // 1. Direct match (just different extension)
    () => imageFiles.find(img => img === baseNameNoExt + '.webp'),
    
    // 2. Add -hero suffix
    () => imageFiles.find(img => img === baseNameNoExt + '-hero.webp'),
    
    // 3. Remove descriptive parts and add -hero
    () => {
      // Remove common descriptive patterns
      const simplified = baseNameNoExt
        .replace(/-complete-[^-]+-guide/, '')
        .replace(/-advanced-[^-]+-science/, '')
        .replace(/-high-[^-]+-safety/, '')
        .replace(/-sport-specific-[^-]+-guide/, '')
        .replace(/-complete-[^-]+-analysis/, '')
        .replace(/-and-/, '-')
        .replace(/-2025$/, '');
      
      return imageFiles.find(img => 
        img === simplified + '-hero.webp' || 
        img === simplified + '-2025-hero.webp'
      );
    },
    
    // 4. Fuzzy match - find images that start with the first few words
    () => {
      const words = baseNameNoExt.split('-').slice(0, 3).join('-');
      const candidates = imageFiles.filter(img => img.startsWith(words));
      
      // Prefer -hero versions
      const heroCandidate = candidates.find(c => c.includes('-hero'));
      return heroCandidate || candidates[0];
    },
    
    // 5. Check for specific known mappings
    () => {
      const knownMappings = {
        'social-media-alcohol-wellness': 'social-media-drinking-hero.webp',
        'alcohol-digestive-health-guide': 'alcohol-digestive-health-hero.webp',
        'smart-social-drinking': 'smart-social-drinking-hero.webp',
        'alcohol-work-performance': 'alcohol-work-performance-hero.webp',
      };
      
      return knownMappings[baseNameNoExt];
    }
  ];
  
  // Try each strategy in order
  for (const strategy of strategies) {
    const match = strategy();
    if (match) {
      return '/images/' + match;
    }
  }
  
  // If no match found, return original (will be logged as unmatched)
  return metadataImage;
}

// Read and parse metadata
console.log('Reading metadata from:', metadataPath);
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

console.log(`\nProcessing ${metadata.length} entries...\n`);

let fixedCount = 0;
let unmatchedCount = 0;
const unmatched = [];

// Process each entry
const updatedMetadata = metadata.map(entry => {
  if (!entry.image) {
    return entry;
  }
  
  const originalImage = entry.image;
  const newImage = findBestImageMatch(originalImage);
  
  if (newImage !== originalImage) {
    // Check if the new image actually exists
    const imagePath = path.join(imagesDir, newImage.replace('/images/', ''));
    if (fs.existsSync(imagePath)) {
      console.log(`✅ Fixed: ${originalImage} → ${newImage}`);
      fixedCount++;
      return { ...entry, image: newImage };
    } else {
      console.log(`❌ No match found for: ${originalImage}`);
      unmatchedCount++;
      unmatched.push({
        slug: entry.slug,
        original: originalImage
      });
      return entry;
    }
  }
  
  // Check if original image exists
  const imagePath = path.join(imagesDir, originalImage.replace('/images/', ''));
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ Image not found: ${originalImage}`);
    unmatchedCount++;
    unmatched.push({
      slug: entry.slug,
      original: originalImage
    });
  }
  
  return entry;
});

// Write updated metadata
const backupPath = metadataPath.replace('.json', '.backup.json');
console.log(`\nCreating backup at: ${backupPath}`);
fs.writeFileSync(backupPath, JSON.stringify(metadata, null, 2));

console.log(`Writing updated metadata to: ${metadataPath}`);
fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));

// Summary
console.log('\n=== Summary ===');
console.log(`Total entries processed: ${metadata.length}`);
console.log(`Images fixed: ${fixedCount}`);
console.log(`Images still unmatched: ${unmatchedCount}`);

if (unmatched.length > 0) {
  console.log('\n=== Unmatched Images ===');
  unmatched.forEach(({ slug, original }) => {
    console.log(`Slug: ${slug}`);
    console.log(`Image: ${original}\n`);
  });
  
  // Save unmatched report
  const reportPath = path.join(__dirname, '../data/unmatched-images-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(unmatched, null, 2));
  console.log(`\nUnmatched images report saved to: ${reportPath}`);
}

console.log('\n✨ Metadata image paths have been updated!');