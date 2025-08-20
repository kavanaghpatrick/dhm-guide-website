#!/usr/bin/env node

/**
 * Prerender Blog Posts Script
 * Generates static HTML files for all blog posts to ensure proper SEO indexing
 * This solves the client-side rendering issue that prevents Google from indexing content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the base HTML template
const indexHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

// Get all blog posts
const postsDir = path.join(__dirname, '..', 'src', 'newblog', 'data', 'posts');
const posts = [];

// Read all JSON files from posts directory
const files = fs.readdirSync(postsDir);
for (const file of files) {
  if (file.endsWith('.json') && !file.includes('.bak')) {
    const filePath = path.join(postsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const post = JSON.parse(content);
      if (post.slug && post.title) {
        posts.push(post);
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error.message);
    }
  }
}

console.log(`Found ${posts.length} blog posts to prerender`);

// Create directory for blog posts if it doesn't exist
const blogDistDir = path.join(__dirname, '..', 'dist', 'never-hungover');
if (!fs.existsSync(blogDistDir)) {
  fs.mkdirSync(blogDistDir, { recursive: true });
}

// Generate static HTML for each post
posts.forEach((post, index) => {
  const dom = new JSDOM(baseHtml);
  const document = dom.window.document;
  
  // Update meta tags
  document.title = `${post.title} | DHM Guide`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', post.title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  }
  
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && post.image) {
    ogImage.setAttribute('content', `https://www.dhmguide.com${post.image}`);
  }
  
  // Update Twitter tags
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', post.title);
  }
  
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', post.metaDescription || post.excerpt);
  }
  
  const twitterImage = document.querySelector('meta[property="twitter:image"]');
  if (twitterImage && post.image) {
    twitterImage.setAttribute('content', `https://www.dhmguide.com${post.image}`);
  }
  
  // Add canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://www.dhmguide.com/never-hungover/${post.slug}`);
  
  // Add structured data for article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author || "DHM Guide Team"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "publisher": {
      "@type": "Organization",
      "name": "DHM Guide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dhmguide.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.dhmguide.com/never-hungover/${post.slug}`
    },
    "image": post.image ? `https://www.dhmguide.com${post.image}` : "https://www.dhmguide.com/og-image.jpg"
  };
  
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/ld+json';
  scriptTag.textContent = JSON.stringify(structuredData);
  document.head.appendChild(scriptTag);
  
  // Add initial content for SEO (visible before JavaScript loads)
  // This ensures Google can see the content immediately
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    // Extract first paragraph of content for initial display
    let firstParagraph = '';
    if (post.content) {
      const contentStr = typeof post.content === 'string' ? post.content : '';
      const paragraphMatch = contentStr.match(/^[^#\n].*?(?=\n\n|\n#|$)/m);
      if (paragraphMatch) {
        firstParagraph = paragraphMatch[0].replace(/[*_`]/g, '');
      }
    }
    
    // Add noscript fallback and initial content
    const noscriptContent = `
      <noscript>
        <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1>${post.title}</h1>
          <p><strong>Published:</strong> ${post.date} | <strong>By:</strong> ${post.author || 'DHM Guide Team'}</p>
          <p>${post.excerpt}</p>
          ${firstParagraph ? `<p>${firstParagraph}</p>` : ''}
          <p><em>Please enable JavaScript for the full interactive experience.</em></p>
          <nav>
            <a href="/">Home</a> | 
            <a href="/never-hungover">All Articles</a> | 
            <a href="/guide">DHM Guide</a>
          </nav>
        </div>
      </noscript>
    `;
    
    // Insert noscript content after root div
    rootDiv.insertAdjacentHTML('afterend', noscriptContent);
    
    // Add initial content that will be replaced when React loads
    rootDiv.innerHTML = `
      <div id="prerender-content" style="display:none;">
        <article>
          <h1>${post.title}</h1>
          <div class="meta">
            <time datetime="${post.date}">${post.date}</time>
            <span>${post.author || 'DHM Guide Team'}</span>
            <span>${post.readTime} min read</span>
          </div>
          <p class="excerpt">${post.excerpt}</p>
          ${firstParagraph ? `<p>${firstParagraph}</p>` : ''}
        </article>
      </div>
    `;
  }
  
  // Write the HTML file
  const postDir = path.join(blogDistDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  
  const outputPath = path.join(postDir, 'index.html');
  fs.writeFileSync(outputPath, dom.serialize());
  
  if ((index + 1) % 10 === 0) {
    console.log(`Prerendered ${index + 1}/${posts.length} posts...`);
  }
});

console.log(`✅ Successfully prerendered ${posts.length} blog posts`);
console.log(`📁 Static HTML files generated in: ${blogDistDir}`);

// Also create a simple HTML file at the blog listing URL
const blogIndexHtml = baseHtml
  .replace('<title>DHM Guide: Prevent 87% of Hangovers with Science-Backed Supplements | 11 Clinical Studies</title>', 
           '<title>Never Hungover Blog - Science-Based Alcohol & DHM Articles | DHM Guide</title>')
  .replace('content="✅ Clinically proven to prevent 87% of hangovers', 
           'content="Explore 195+ evidence-based articles on DHM, hangover prevention, liver health, and smart drinking strategies');

fs.writeFileSync(path.join(blogDistDir, 'index.html'), blogIndexHtml);
console.log('✅ Created blog index page');