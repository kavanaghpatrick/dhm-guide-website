import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read metadata
const metadataPath = path.join(__dirname, '../src/newblog/data/metadata/index.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

const BASE_URL = 'https://www.dhmguide.com';
const TODAY = new Date().toISOString().split('T')[0];

// Define static pages
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/guide', priority: '0.9', changefreq: 'monthly' },
  { path: '/reviews', priority: '0.9', changefreq: 'weekly' },
  { path: '/compare', priority: '0.8', changefreq: 'weekly' },
  { path: '/research', priority: '0.8', changefreq: 'monthly' },
  { path: '/never-hungover', priority: '0.9', changefreq: 'daily' }, // Blog section
  { path: '/about', priority: '0.6', changefreq: 'monthly' }
];

// Generate sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

// Add static pages
staticPages.forEach(page => {
  sitemap += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
});

// Add all Never Hungover blog posts
console.log(`Adding ${metadata.length} Never Hungover posts to sitemap...`);
metadata.forEach((post, index) => {
  const priority = index < 10 ? '0.8' : '0.7'; // Higher priority for newer posts
  sitemap += `  <url>
    <loc>${BASE_URL}/never-hungover/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>

`;
});

// Legacy blog posts removed - all content now served through /never-hungover

sitemap += `</urlset>`;

// Write sitemap to public directory
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log('✅ Sitemap generated successfully!');
console.log(`📍 Location: ${sitemapPath}`);
console.log(`📊 Total URLs: ${staticPages.length + metadata.length}`);
console.log(`   - Static pages: ${staticPages.length}`);
console.log(`   - Never Hungover posts: ${metadata.length}`);

// Also create a robots.txt if it doesn't exist
const robotsPath = path.join(__dirname, '../public/robots.txt');
if (!fs.existsSync(robotsPath)) {
  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
  
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ robots.txt created!');
}