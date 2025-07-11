#!/usr/bin/env node

/**
 * Generate canonical URLs for all blog posts
 * This helps with SEO by ensuring Google can see the canonical tags
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/newblog/data/posts');
const OUTPUT_FILE = path.join(__dirname, '../public/blog-canonicals.json');
const BASE_URL = 'https://www.dhmguide.com';

function generateCanonicals() {
  console.log('Generating canonical URLs for blog posts...');
  
  const canonicals = {};
  
  try {
    // Read all JSON files in the blog directory
    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      try {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(content);
        
        if (post.slug) {
          const canonicalUrl = `${BASE_URL}/never-hungover/${post.slug}`;
          canonicals[`/never-hungover/${post.slug}`] = {
            canonical: canonicalUrl,
            title: post.title,
            description: post.excerpt || post.metaDescription
          };
          console.log(`  ✓ ${post.slug}`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
      }
    });
    
    // Write the canonical map to a JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(canonicals, null, 2));
    console.log(`\n✅ Generated ${Object.keys(canonicals).length} canonical URLs`);
    console.log(`📁 Output saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error generating canonicals:', error);
    process.exit(1);
  }
}

// Run the script
generateCanonicals();