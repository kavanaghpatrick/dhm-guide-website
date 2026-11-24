#!/usr/bin/env node

/**
 * Generate a clean, accurate sitemap.xml
 * Fixes duplicates, includes all valid blog posts, and proper formatting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDateModified } from './lib/get-date-modified.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/newblog/data/posts');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://www.dhmguide.com';

// Main site pages. No priority/changefreq: Google ignores both tags.
const MAIN_PAGES = [
  '/',
  '/guide',
  '/reviews',
  '/never-hungover',
  '/dhm-dosage-calculator',
  '/compare',
  '/research',
  '/about'
];

function generateSitemap() {
  console.log('Generating clean sitemap...');
  
  const today = new Date().toISOString().split('T')[0];
  const blogPosts = [];
  const processedSlugs = new Set(); // Track processed slugs to avoid duplicates
  
  try {
    // Read all JSON files in the blog directory
    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      try {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(content);
        
        if (post.slug && !processedSlugs.has(post.slug)) {
          processedSlugs.add(post.slug);

          // Resolve dateModified: explicit override -> git commit date -> post.date
          const resolvedDateModified = getDateModified(post, filePath) || today;
          const lastmodDate = resolvedDateModified.split('T')[0]; // YYYY-MM-DD for sitemap

          blogPosts.push({
            loc: `/never-hungover/${post.slug}`,
            lastmod: lastmodDate
          });

          console.log(`  ✓ ${post.slug}`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
        // A malformed post JSON must fail the build, not silently drop the
        // post from the sitemap.
        process.exitCode = 1;
      }
    });
    
    // Sort blog posts by slug for consistent ordering
    blogPosts.sort((a, b) => a.loc.localeCompare(b.loc));
    
    // Generate the sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Main Site Pages -->`;
    
    // Add main pages. No <lastmod>: stamping the build date on unchanged pages is a
    // false freshness signal that erodes Google's trust in our lastmod values.
    MAIN_PAGES.forEach(loc => {
      xml += `
  <url>
    <loc>${BASE_URL}${loc}</loc>
  </url>`;
    });
    
    xml += `

  <!-- Blog Posts (${blogPosts.length} total) -->`;
    
    // Add blog posts
    blogPosts.forEach(post => {
      xml += `
  <url>
    <loc>${BASE_URL}${post.loc}</loc>
    <lastmod>${post.lastmod}</lastmod>
  </url>`;
    });
    
    xml += `

</urlset>`;
    
    // Write the sitemap
    fs.writeFileSync(OUTPUT_FILE, xml);
    
    console.log(`\n✅ Generated sitemap with:`);
    console.log(`   - ${MAIN_PAGES.length} main pages`);
    console.log(`   - ${blogPosts.length} blog posts`);
    console.log(`   - ${MAIN_PAGES.length + blogPosts.length} total URLs`);
    console.log(`📁 Output saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
generateSitemap();