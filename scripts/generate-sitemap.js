#!/usr/bin/env node

/**
 * Generate a clean, accurate sitemap.xml
 * Fixes duplicates, includes all valid blog posts, and proper formatting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/newblog/data/posts');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://www.dhmguide.com';

// Main site pages with their priorities
const MAIN_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/guide', priority: '0.9', changefreq: 'weekly' },
  { loc: '/reviews', priority: '0.9', changefreq: 'weekly' },
  { loc: '/never-hungover', priority: '0.9', changefreq: 'weekly' },
  { loc: '/dhm-dosage-calculator', priority: '0.9', changefreq: 'weekly' },
  { loc: '/compare', priority: '0.8', changefreq: 'weekly' },
  { loc: '/research', priority: '0.8', changefreq: 'monthly' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' }
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
      // Skip backup/draft files
      if (file.includes('-original') || file.includes('-backup') || file.includes('-enhanced') || file.includes('-broken')) {
        console.log(`  ⏭️  Skipping backup/draft file: ${file}`);
        return;
      }
      
      try {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(content);
        
        if (post.slug && !processedSlugs.has(post.slug)) {
          processedSlugs.add(post.slug);
          
          // Determine priority based on content type
          let priority = '0.8'; // Default for blog posts
          
          // Trust-building content and hub pages get higher priority
          if (post.slug.includes('is-dhm-safe') || 
              post.slug.includes('does-dhm-work') || 
              post.slug.includes('can-you-take-dhm-every-day') ||
              post.slug.includes('-hub-') ||
              post.slug.includes('-center-')) {
            priority = '0.9';
          }
          // Cultural guides get lower priority
          else if (post.slug.includes('-culture-guide')) {
            priority = '0.6';
          }
          
          blogPosts.push({
            loc: `/never-hungover/${post.slug}`,
            lastmod: post.date || today,
            changefreq: 'weekly',
            priority: priority
          });
          
          console.log(`  ✓ ${post.slug}`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
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
    
    // Add main pages
    MAIN_PAGES.forEach(page => {
      xml += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
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