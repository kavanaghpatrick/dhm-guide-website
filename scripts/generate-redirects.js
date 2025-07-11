#!/usr/bin/env node

/**
 * Generate a comprehensive list of redirects for old URLs
 * This helps identify any other URLs that need redirecting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/newblog/data/posts');
const OUTPUT_FILE = path.join(__dirname, '../public/_redirects');

function generateRedirects() {
  console.log('Generating comprehensive redirects file...');
  
  let redirects = '';
  
  // Add static redirects first
  redirects += '# Redirect old blog URLs to new structure\n';
  redirects += '/blog/* /never-hungover/:splat 301\n\n';
  
  // Add www redirects (backup for Vercel config)
  redirects += '# Redirect non-www to www\n';
  redirects += 'http://dhmguide.com/* https://www.dhmguide.com/:splat 301\n';
  redirects += 'https://dhmguide.com/* https://www.dhmguide.com/:splat 301\n\n';
  
  // Generate specific blog post redirects for common variations
  redirects += '# Specific blog post redirects\n';
  
  try {
    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      try {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(content);
        
        if (post.slug) {
          // Add redirect for /blog/ version
          redirects += `/blog/${post.slug} /never-hungover/${post.slug} 301\n`;
          
          // Add redirect for direct slug (in case it was used)
          redirects += `/${post.slug} /never-hungover/${post.slug} 301\n`;
        }
      } catch (error) {
        // Skip files with errors
      }
    });
    
    // Write the redirects file
    fs.writeFileSync(OUTPUT_FILE, redirects);
    console.log(`✅ Generated redirects file: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error generating redirects:', error);
  }
}

// Run the script
generateRedirects();