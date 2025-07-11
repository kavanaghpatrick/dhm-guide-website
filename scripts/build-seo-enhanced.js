#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting SEO-enhanced build process...\n');

try {
  // Step 1: Run the normal Vite build
  console.log('📦 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Generate sitemap
  console.log('\n🗺️  Generating sitemap...');
  execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
  
  // Step 3: Inject meta tag management into the built index.html
  console.log('\n🏷️  Injecting SEO meta tag management...');
  execSync('node scripts/prerender-meta-tags.js', { stdio: 'inherit' });
  
  // Step 4: Create a _redirects file for Netlify (if not exists)
  const redirectsPath = path.join(__dirname, '../dist/_redirects');
  if (!fs.existsSync(redirectsPath)) {
    console.log('\n🔄 Creating _redirects file for SPA routing...');
    fs.writeFileSync(redirectsPath, '/*    /index.html   200');
  }
  
  // Step 5: Copy robots.txt to dist
  const robotsSource = path.join(__dirname, '../public/robots.txt');
  const robotsDest = path.join(__dirname, '../dist/robots.txt');
  if (fs.existsSync(robotsSource)) {
    console.log('\n🤖 Copying robots.txt to dist...');
    fs.copyFileSync(robotsSource, robotsDest);
  }
  
  console.log('\n✅ SEO-enhanced build completed successfully!');
  console.log('\n📋 Build Summary:');
  console.log('- Application built with Vite');
  console.log('- Sitemap generated with all blog posts');
  console.log('- Meta tags injected for immediate SEO availability');
  console.log('- SPA routing configured');
  console.log('- Ready for deployment!');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}