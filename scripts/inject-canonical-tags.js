import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read metadata
const metadataPath = path.join(__dirname, '../src/newblog/data/metadata/index.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

const BASE_URL = 'https://www.dhmguide.com';

// Read the current index.html
const indexPath = path.join(__dirname, '../index.html');
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// Generate canonical tag script that will run immediately
const canonicalScript = `
    <!-- Dynamic Canonical Tag Injection for SEO -->
    <script>
      (function() {
        // Get the current path
        const path = window.location.pathname;
        
        // Map of blog post paths to their canonical URLs
        const blogCanonicals = {
${metadata.map(post => `          '/never-hungover/${post.slug}': '${BASE_URL}/never-hungover/${post.slug}'`).join(',\n')}
        };
        
        // Check if we're on a blog post page
        if (blogCanonicals[path]) {
          // Update existing canonical tag or create new one
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
          }
          canonical.setAttribute('href', blogCanonicals[path]);
          
          // Also update meta tags for blog posts
          const postSlug = path.replace('/never-hungover/', '');
          const postMeta = {
${metadata.map(post => `            '${post.slug}': {
              title: ${JSON.stringify(post.title + ' | DHM Guide')},
              description: ${JSON.stringify(post.excerpt)},
              ogUrl: '${BASE_URL}/never-hungover/${post.slug}'
            }`).join(',\n')}
          };
          
          if (postMeta[postSlug]) {
            // Update title
            document.title = postMeta[postSlug].title;
            
            // Update meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', postMeta[postSlug].description);
            }
            
            // Update OG tags
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) {
              ogUrl.setAttribute('content', postMeta[postSlug].ogUrl);
            }
            
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
              ogTitle.setAttribute('content', postMeta[postSlug].title);
            }
            
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
              ogDesc.setAttribute('content', postMeta[postSlug].description);
            }
          }
        }
      })();
    </script>
`;

// Find the right place to insert the script (right after the canonical link tag)
const canonicalLinkRegex = /<link rel="canonical" href="https:\/\/www\.dhmguide\.com" \/>/;
const insertPosition = indexContent.search(canonicalLinkRegex);

if (insertPosition !== -1) {
  // Find the end of the canonical link tag
  const endOfCanonical = indexContent.indexOf('>', insertPosition) + 1;
  
  // Insert the script after the canonical link
  indexContent = 
    indexContent.slice(0, endOfCanonical) + 
    '\n' + canonicalScript +
    indexContent.slice(endOfCanonical);
  
  // Write the updated index.html
  fs.writeFileSync(indexPath, indexContent);
  
  console.log('✅ Canonical tags script injected successfully!');
  console.log(`📊 Added canonical mappings for ${metadata.length} blog posts`);
  console.log('🔍 The script will run immediately on page load, before Google crawls the content');
} else {
  console.error('❌ Could not find the canonical link tag in index.html');
}