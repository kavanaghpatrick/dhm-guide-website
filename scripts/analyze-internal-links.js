#!/usr/bin/env node

/**
 * Internal Link Analysis Script
 *
 * Purpose: Analyze internal linking structure across all blog posts
 * Output: JSON metrics file + human-readable report
 * Schedule: Run weekly (every Monday at 9am)
 *
 * Usage:
 *   node scripts/analyze-internal-links.js
 *   node scripts/analyze-internal-links.js --format=json
 *   node scripts/analyze-internal-links.js --output=docs/seo/metrics/
 *
 * Author: DHM Guide SEO Team
 * Created: October 21, 2025
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  postsDir: path.join(__dirname, '../src/newblog/data/posts'),
  outputDir: path.join(__dirname, '../docs/seo/metrics'),
  siteUrl: 'https://www.dhmguide.com',
  blogBasePath: '/never-hungover',
  mainPages: ['/guide', '/compare', '/research', '/reviews', '/calculator']
};

// Metrics structure
const metrics = {
  timestamp: new Date().toISOString(),
  totalPosts: 0,
  internalLinks: {
    blogToBlog: 0,
    toMainPages: 0,
    external: 0,
    total: 0
  },
  avgLinksPerPost: 0,
  orphanedPosts: 0,
  bidirectionalPairs: 0,
  topicClusters: [],
  linkDistribution: {
    "0-links": 0,
    "1-2-links": 0,
    "3-5-links": 0,
    "6-10-links": 0,
    "10plus-links": 0
  },
  topLinkedPosts: [], // Top 10 by incoming links
  mostIsolatedPosts: [], // Top 10 with fewest links
  postDetails: []
};

// Link graph for bidirectional analysis
const linkGraph = new Map();

/**
 * Main execution function
 */
async function analyzePosts() {
  console.log('🔍 Starting internal link analysis...\n');

  // Step 1: Read all blog posts
  const posts = await loadAllPosts();
  metrics.totalPosts = posts.length;
  console.log(`📚 Found ${posts.length} blog posts\n`);

  // Step 2: Analyze links in each post
  console.log('🔗 Analyzing internal links...');
  for (const post of posts) {
    analyzePostLinks(post);
  }

  // Step 3: Calculate metrics
  calculateMetrics();

  // Step 4: Identify topic clusters
  identifyTopicClusters(posts);

  // Step 5: Find bidirectional relationships
  findBidirectionalPairs();

  // Step 6: Generate report
  const report = generateReport();

  // Step 7: Save outputs
  saveOutputs(report);

  console.log('\n✅ Analysis complete!');
  console.log(`📄 Report saved to: ${CONFIG.outputDir}`);
}

/**
 * Load all blog posts from JSON files
 */
async function loadAllPosts() {
  const posts = [];

  function readDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDirectory(fullPath);
      } else if (item.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const post = JSON.parse(content);
          post._filePath = fullPath;
          posts.push(post);
        } catch (error) {
          console.warn(`⚠️  Failed to parse ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  readDirectory(CONFIG.postsDir);
  return posts;
}

/**
 * Analyze links within a single post
 */
function analyzePostLinks(post) {
  const postSlug = post.slug || extractSlug(post._filePath);
  const content = post.content || '';

  // Initialize link graph entry
  if (!linkGraph.has(postSlug)) {
    linkGraph.set(postSlug, {
      slug: postSlug,
      title: post.title || 'Untitled',
      outgoingLinks: [],
      incomingLinks: [],
      category: post.category || 'Uncategorized',
      tags: post.tags || []
    });
  }

  // Find all markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  const links = {
    blogToBlog: [],
    toMainPages: [],
    external: []
  };

  while ((match = linkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];

    // Categorize link
    if (isBlogLink(linkUrl)) {
      const targetSlug = extractSlugFromUrl(linkUrl);
      links.blogToBlog.push({ text: linkText, url: linkUrl, targetSlug });
      linkGraph.get(postSlug).outgoingLinks.push(targetSlug);

      // Update incoming links for target
      if (!linkGraph.has(targetSlug)) {
        linkGraph.set(targetSlug, {
          slug: targetSlug,
          title: 'Unknown',
          outgoingLinks: [],
          incomingLinks: [],
          category: 'Unknown',
          tags: []
        });
      }
      linkGraph.get(targetSlug).incomingLinks.push(postSlug);

    } else if (isMainPageLink(linkUrl)) {
      links.toMainPages.push({ text: linkText, url: linkUrl });
    } else if (isExternalLink(linkUrl)) {
      links.external.push({ text: linkText, url: linkUrl });
    }
  }

  // Update global metrics
  metrics.internalLinks.blogToBlog += links.blogToBlog.length;
  metrics.internalLinks.toMainPages += links.toMainPages.length;
  metrics.internalLinks.external += links.external.length;
  metrics.internalLinks.total += links.blogToBlog.length + links.toMainPages.length;

  // Track post details
  const totalLinks = links.blogToBlog.length + links.toMainPages.length;
  metrics.postDetails.push({
    slug: postSlug,
    title: post.title || 'Untitled',
    category: post.category || 'Uncategorized',
    blogLinks: links.blogToBlog.length,
    mainPageLinks: links.toMainPages.length,
    externalLinks: links.external.length,
    totalInternalLinks: totalLinks,
    isOrphaned: totalLinks === 0
  });

  // Update link distribution
  if (totalLinks === 0) {
    metrics.linkDistribution["0-links"]++;
  } else if (totalLinks <= 2) {
    metrics.linkDistribution["1-2-links"]++;
  } else if (totalLinks <= 5) {
    metrics.linkDistribution["3-5-links"]++;
  } else if (totalLinks <= 10) {
    metrics.linkDistribution["6-10-links"]++;
  } else {
    metrics.linkDistribution["10plus-links"]++;
  }
}

/**
 * Calculate derived metrics
 */
function calculateMetrics() {
  // Average links per post
  metrics.avgLinksPerPost = (metrics.internalLinks.total / metrics.totalPosts).toFixed(2);

  // Orphaned posts (no internal links)
  metrics.orphanedPosts = metrics.linkDistribution["0-links"];

  // Top linked posts (by incoming links)
  const postsByIncoming = Array.from(linkGraph.values())
    .map(node => ({
      slug: node.slug,
      title: node.title,
      incomingLinks: node.incomingLinks.length,
      outgoingLinks: node.outgoingLinks.length
    }))
    .sort((a, b) => b.incomingLinks - a.incomingLinks)
    .slice(0, 10);

  metrics.topLinkedPosts = postsByIncoming;

  // Most isolated posts (fewest total links)
  const postsByIsolation = metrics.postDetails
    .sort((a, b) => a.totalInternalLinks - b.totalInternalLinks)
    .slice(0, 10);

  metrics.mostIsolatedPosts = postsByIsolation;
}

/**
 * Identify topic clusters based on link relationships
 */
function identifyTopicClusters(posts) {
  const clusters = new Map();

  // Group by category first
  for (const post of posts) {
    const category = post.category || 'Uncategorized';
    if (!clusters.has(category)) {
      clusters.set(category, {
        name: category,
        posts: [],
        internalLinks: 0,
        externalLinks: 0
      });
    }

    const postSlug = post.slug || extractSlug(post._filePath);
    const node = linkGraph.get(postSlug);

    clusters.get(category).posts.push(postSlug);
    clusters.get(category).internalLinks += node?.outgoingLinks.length || 0;
  }

  // Convert to array and calculate cluster density
  metrics.topicClusters = Array.from(clusters.values()).map(cluster => ({
    name: cluster.name,
    postCount: cluster.posts.length,
    totalInternalLinks: cluster.internalLinks,
    avgLinksPerPost: (cluster.internalLinks / cluster.posts.length).toFixed(2),
    density: (cluster.internalLinks / (cluster.posts.length * (cluster.posts.length - 1))).toFixed(3)
  }));
}

/**
 * Find bidirectional link pairs
 */
function findBidirectionalPairs() {
  const pairs = [];

  for (const [slugA, nodeA] of linkGraph.entries()) {
    for (const slugB of nodeA.outgoingLinks) {
      const nodeB = linkGraph.get(slugB);
      if (nodeB && nodeB.outgoingLinks.includes(slugA)) {
        // Found bidirectional pair (only add once)
        if (slugA < slugB) { // Prevent duplicates
          pairs.push({ postA: slugA, postB: slugB });
        }
      }
    }
  }

  metrics.bidirectionalPairs = pairs.length;
}

/**
 * Helper: Check if URL is a blog post link
 */
function isBlogLink(url) {
  return url.includes('/never-hungover/') ||
         url.includes('/blog/') ||
         (url.startsWith('/') && !url.startsWith('http') && !isMainPageLink(url));
}

/**
 * Helper: Check if URL is a main page link
 */
function isMainPageLink(url) {
  return CONFIG.mainPages.some(page => url.includes(page));
}

/**
 * Helper: Check if URL is external
 */
function isExternalLink(url) {
  return url.startsWith('http') && !url.includes(CONFIG.siteUrl);
}

/**
 * Helper: Extract slug from file path
 */
function extractSlug(filePath) {
  const filename = path.basename(filePath, '.json');
  return filename;
}

/**
 * Helper: Extract slug from URL
 */
function extractSlugFromUrl(url) {
  const match = url.match(/\/never-hungover\/([^\/\?#]+)/);
  return match ? match[1] : url;
}

/**
 * Generate human-readable report
 */
function generateReport() {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `# Internal Linking Analysis Report
**Generated**: ${date}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Blog Posts | ${metrics.totalPosts} |
| Blog-to-Blog Links | ${metrics.internalLinks.blogToBlog} |
| Links to Main Pages | ${metrics.internalLinks.toMainPages} |
| External Links | ${metrics.internalLinks.external} |
| Average Links per Post | ${metrics.avgLinksPerPost} |
| Orphaned Posts | ${metrics.orphanedPosts} (${((metrics.orphanedPosts/metrics.totalPosts)*100).toFixed(1)}%) |
| Bidirectional Pairs | ${metrics.bidirectionalPairs} |

## Link Distribution

| Link Count | Posts | Percentage |
|------------|-------|------------|
| 0 links | ${metrics.linkDistribution["0-links"]} | ${((metrics.linkDistribution["0-links"]/metrics.totalPosts)*100).toFixed(1)}% |
| 1-2 links | ${metrics.linkDistribution["1-2-links"]} | ${((metrics.linkDistribution["1-2-links"]/metrics.totalPosts)*100).toFixed(1)}% |
| 3-5 links | ${metrics.linkDistribution["3-5-links"]} | ${((metrics.linkDistribution["3-5-links"]/metrics.totalPosts)*100).toFixed(1)}% |
| 6-10 links | ${metrics.linkDistribution["6-10-links"]} | ${((metrics.linkDistribution["6-10-links"]/metrics.totalPosts)*100).toFixed(1)}% |
| 10+ links | ${metrics.linkDistribution["10plus-links"]} | ${((metrics.linkDistribution["10plus-links"]/metrics.totalPosts)*100).toFixed(1)}% |

## Top 10 Most Linked Posts (by incoming links)

${metrics.topLinkedPosts.map((post, i) =>
  `${i+1}. **${post.title}** (${post.incomingLinks} incoming, ${post.outgoingLinks} outgoing)`
).join('\n')}

## Top 10 Most Isolated Posts

${metrics.mostIsolatedPosts.map((post, i) =>
  `${i+1}. **${post.title}** (${post.totalInternalLinks} total links)`
).join('\n')}

## Topic Clusters

${metrics.topicClusters.map(cluster =>
  `### ${cluster.name}\n- Posts: ${cluster.postCount}\n- Total Links: ${cluster.totalInternalLinks}\n- Avg Links/Post: ${cluster.avgLinksPerPost}\n- Density: ${cluster.density}\n`
).join('\n')}

## Health Assessment

${getHealthAssessment()}

---

**Next Steps**: Review orphaned posts and add internal links to improve site structure.
`;
}

/**
 * Generate health assessment
 */
function getHealthAssessment() {
  const avgLinks = parseFloat(metrics.avgLinksPerPost);
  const orphanedRate = (metrics.orphanedPosts / metrics.totalPosts) * 100;

  let assessment = '';

  if (avgLinks >= 3.5) {
    assessment += '✅ **Excellent**: Average links per post meets industry standard (3-5 links)\n';
  } else if (avgLinks >= 2.0) {
    assessment += '🟡 **Good**: Making progress, but room for improvement\n';
  } else if (avgLinks >= 1.0) {
    assessment += '🟡 **Fair**: Internal linking structure is developing\n';
  } else {
    assessment += '🔴 **Poor**: Critical lack of internal links\n';
  }

  if (orphanedRate < 10) {
    assessment += '✅ **Excellent**: Very few orphaned posts\n';
  } else if (orphanedRate < 25) {
    assessment += '🟡 **Good**: Manageable number of orphaned posts\n';
  } else if (orphanedRate < 50) {
    assessment += '🟡 **Fair**: Many posts need internal links\n';
  } else {
    assessment += '🔴 **Poor**: Majority of posts are orphaned\n';
  }

  if (metrics.bidirectionalPairs >= 50) {
    assessment += '✅ **Excellent**: Strong bidirectional linking\n';
  } else if (metrics.bidirectionalPairs >= 20) {
    assessment += '🟡 **Good**: Some reciprocal relationships established\n';
  } else {
    assessment += '🔴 **Poor**: Few bidirectional links\n';
  }

  return assessment;
}

/**
 * Save outputs to files
 */
function saveOutputs(report) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];

  // Save JSON metrics
  const jsonPath = path.join(CONFIG.outputDir, `internal-links-${dateStr}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));
  console.log(`\n📊 Metrics saved: ${jsonPath}`);

  // Save markdown report
  const mdPath = path.join(CONFIG.outputDir, `internal-links-report-${dateStr}.md`);
  fs.writeFileSync(mdPath, report);
  console.log(`📝 Report saved: ${mdPath}`);

  // Also update the latest report (for easy reference)
  const latestPath = path.join(CONFIG.outputDir, 'internal-links-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(metrics, null, 2));

  const latestMdPath = path.join(CONFIG.outputDir, 'internal-links-latest.md');
  fs.writeFileSync(latestMdPath, report);

  console.log(`\n✨ Latest reports updated`);
}

// Run the analysis
analyzePosts().catch(error => {
  console.error('❌ Error during analysis:', error);
  process.exit(1);
});
