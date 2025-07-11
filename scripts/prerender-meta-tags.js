import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: 'https://www.dhmguide.com',
  metadataPath: path.join(__dirname, '../src/newblog/data/metadata/index.json'),
  indexPath: path.join(__dirname, '../index.html'),
  distIndexPath: path.join(__dirname, '../dist/index.html'),
  backupPath: path.join(__dirname, '../index.html.backup')
};

/**
 * Generate meta tags for a blog post
 */
function generateBlogPostMetaTags(post, baseUrl) {
  const url = `${baseUrl}/never-hungover/${post.slug}`;
  const title = `${post.title} | DHM Guide`;
  
  return {
    canonical: url,
    title: title,
    description: post.excerpt,
    ogUrl: url,
    ogTitle: title,
    ogDescription: post.excerpt,
    ogImage: post.image ? `${baseUrl}${post.image}` : `${baseUrl}/blog-default.webp`
  };
}

/**
 * Create a middleware script that handles routing-based meta tags
 */
function createMetaTagMiddleware(metadata, baseUrl) {
  const blogMetaData = {};
  
  // Generate meta data for all blog posts
  metadata.forEach(post => {
    blogMetaData[`/never-hungover/${post.slug}`] = generateBlogPostMetaTags(post, baseUrl);
  });
  
  return `
    <!-- SEO Meta Tag Management for SPA -->
    <script id="seo-meta-manager">
      (function() {
        'use strict';
        
        // Blog post meta data
        const blogMeta = ${JSON.stringify(blogMetaData, null, 2)};
        
        // Static page meta data
        const staticMeta = {
          '/': {
            canonical: '${baseUrl}',
            title: 'DHM Guide: Prevent 87% of Hangovers with Science-Backed Supplements | 11 Clinical Studies',
            description: '✅ Clinically proven to prevent 87% of hangovers. UCLA research + 11 studies confirm DHM effectiveness. Independent reviews, dosage guides & 500+ success stories.'
          },
          '/guide': {
            canonical: '${baseUrl}/guide',
            title: 'The Complete DHM Guide: Never Wake Up Hungover Again',
            description: 'Complete 2025 DHM guide: Achieve 85% hangover reduction with proper dosing, timing, and supplements. Expert tips backed by clinical science.'
          },
          '/reviews': {
            canonical: '${baseUrl}/reviews',
            title: 'Best Hangover Pills: Lab-Tested Supplements That Work',
            description: 'Expert reviews of hangover pills that actually work. Lab-tested supplements ranked by effectiveness. Find your perfect anti-hangover solution today.'
          },
          '/research': {
            canonical: '${baseUrl}/research',
            title: 'Dihydromyricetin Randomized Controlled Trial Results 2024: DHM Hangover Studies',
            description: '23 clinical studies prove DHM reduces hangovers by 85%. FDA-recognized research on dihydromyricetin\\'s liver protection and alcohol metabolism.'
          },
          '/compare': {
            canonical: '${baseUrl}/compare',
            title: 'Compare Hangover Pills: Find Your Perfect Supplement',
            description: 'Compare top DHM supplements side-by-side. Unbiased analysis of ingredients, pricing, effectiveness. Save 40% with expert recommendations.'
          },
          '/never-hungover': {
            canonical: '${baseUrl}/never-hungover',
            title: 'Never Hungover: Master Science-Backed Hangover Prevention',
            description: 'Learn how to never wake up hungover again. Expert guides on DHM, proven prevention strategies, and cutting-edge research. Master the hangover-free lifestyle.'
          },
          '/about': {
            canonical: '${baseUrl}/about',
            title: 'About DHM Guide: Hangover Prevention Experts',
            description: 'Trusted DHM authority since 2020. Expert team analyzes clinical research, tests supplements, provides unbiased hangover prevention guidance.'
          }
        };
        
        // Function to update meta tags
        function updateMetaTags() {
          const path = window.location.pathname;
          const metaData = blogMeta[path] || staticMeta[path];
          
          if (!metaData) return;
          
          // Update or create canonical
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
          }
          canonical.setAttribute('href', metaData.canonical);
          
          // Update title
          document.title = metaData.title;
          
          // Helper to update meta tags
          function updateMeta(selector, content) {
            if (!content) return;
            const element = document.querySelector(selector);
            if (element) {
              element.setAttribute('content', content);
            } else {
              const meta = document.createElement('meta');
              if (selector.includes('property=')) {
                meta.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
              } else {
                meta.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
              }
              meta.setAttribute('content', content);
              document.head.appendChild(meta);
            }
          }
          
          // Update all meta tags
          updateMeta('meta[name="description"]', metaData.description);
          updateMeta('meta[property="og:url"]', metaData.ogUrl || metaData.canonical);
          updateMeta('meta[property="og:title"]', metaData.ogTitle || metaData.title);
          updateMeta('meta[property="og:description"]', metaData.ogDescription || metaData.description);
          
          if (metaData.ogImage) {
            updateMeta('meta[property="og:image"]', metaData.ogImage);
          }
          
          // Update Twitter tags
          updateMeta('meta[name="twitter:title"]', metaData.title);
          updateMeta('meta[name="twitter:description"]', metaData.description);
          if (metaData.ogImage) {
            updateMeta('meta[name="twitter:image"]', metaData.ogImage);
          }
        }
        
        // Update on initial load
        updateMetaTags();
        
        // Listen for navigation changes
        let lastPath = window.location.pathname;
        const checkForRouteChange = () => {
          if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            updateMetaTags();
          }
        };
        
        // Check periodically for route changes (fallback for popstate)
        setInterval(checkForRouteChange, 100);
        
        // Also listen to popstate
        window.addEventListener('popstate', updateMetaTags);
        
        // Expose function for manual updates
        window.__updateSEOTags = updateMetaTags;
      })();
    </script>`;
}

/**
 * Main function to inject the meta tag management script
 */
async function injectMetaTagManagement() {
  try {
    // Read metadata
    const metadata = JSON.parse(fs.readFileSync(CONFIG.metadataPath, 'utf-8'));
    console.log(`📚 Loaded ${metadata.length} blog posts`);
    
    // Read index.html
    let indexContent = fs.readFileSync(CONFIG.indexPath, 'utf-8');
    
    // Create backup
    fs.writeFileSync(CONFIG.backupPath, indexContent);
    console.log(`💾 Created backup at ${CONFIG.backupPath}`);
    
    // Remove any existing SEO meta manager script
    indexContent = indexContent.replace(
      /<!-- SEO Meta Tag Management for SPA -->[\s\S]*?<\/script>/g,
      ''
    );
    
    // Generate the new script
    const metaTagScript = createMetaTagMiddleware(metadata, CONFIG.baseUrl);
    
    // Find the best insertion point (after the existing canonical tag)
    const canonicalMatch = indexContent.match(/<link rel="canonical"[^>]*>/);
    if (canonicalMatch) {
      const insertIndex = indexContent.indexOf(canonicalMatch[0]) + canonicalMatch[0].length;
      indexContent = 
        indexContent.slice(0, insertIndex) + 
        '\n' + metaTagScript + 
        indexContent.slice(insertIndex);
    } else {
      // If no canonical found, insert before closing head tag
      indexContent = indexContent.replace('</head>', metaTagScript + '\n  </head>');
    }
    
    // Write updated index.html
    fs.writeFileSync(CONFIG.indexPath, indexContent);
    console.log('✅ Meta tag management script injected successfully!');
    
    // Also update dist/index.html if it exists (for production builds)
    if (fs.existsSync(CONFIG.distIndexPath)) {
      let distContent = fs.readFileSync(CONFIG.distIndexPath, 'utf-8');
      distContent = distContent.replace(
        /<!-- SEO Meta Tag Management for SPA -->[\s\S]*?<\/script>/g,
        ''
      );
      
      const distCanonicalMatch = distContent.match(/<link rel="canonical"[^>]*>/);
      if (distCanonicalMatch) {
        const insertIndex = distContent.indexOf(distCanonicalMatch[0]) + distCanonicalMatch[0].length;
        distContent = 
          distContent.slice(0, insertIndex) + 
          '\n' + metaTagScript + 
          distContent.slice(insertIndex);
      } else {
        distContent = distContent.replace('</head>', metaTagScript + '\n  </head>');
      }
      
      fs.writeFileSync(CONFIG.distIndexPath, distContent);
      console.log('✅ Also updated dist/index.html');
    }
    
    console.log('\n📋 Summary:');
    console.log(`- Added meta tag mappings for ${metadata.length} blog posts`);
    console.log('- Script runs immediately on page load (before React)');
    console.log('- Updates canonical, title, description, and OG tags');
    console.log('- Monitors route changes to keep tags in sync');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
injectMetaTagManagement();