# Internal Linking Code Examples

Quick reference for implementing internal linking features on the DHM Guide website.

---

## 1. Breadcrumbs Component

### Basic Implementation

```jsx
// File: /src/newblog/components/Breadcrumbs.jsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import categoryTaxonomy from '../data/categoryTaxonomy.json';

const Breadcrumbs = ({ post, onNavigate }) => {
  const category = getCategoryForPost(post.slug);
  const categoryPath = buildCategoryPath(category);

  const breadcrumbs = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Never Hungover', url: '/never-hungover' },
    ...categoryPath.map(cat => ({
      name: cat.name,
      url: `/never-hungover/category/${cat.slug}`
    })),
    { name: truncateTitle(post.title), url: null }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url ? `https://dhmguide.com${crumb.url}` : undefined
    }))
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            {crumb.url ? (
              <button
                onClick={() => onNavigate(crumb.url)}
                className="hover:text-green-600 transition-colors"
              >
                {index === 0 && crumb.icon && <crumb.icon className="w-4 h-4 inline mr-1" />}
                {crumb.name}
              </button>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

const getCategoryForPost = (slug) => {
  const { categories, slugPatterns } = categoryTaxonomy;

  for (const { pattern, category } of slugPatterns) {
    if (new RegExp(pattern, 'i').test(slug)) {
      return categories.find(cat => cat.id === category);
    }
  }
  return null;
};

const buildCategoryPath = (category) => {
  if (!category) return [];

  const path = [category];
  const { categories } = categoryTaxonomy;

  let current = category;
  while (current.parent) {
    const parent = categories.find(cat => cat.id === current.parent);
    if (parent) {
      path.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  return path;
};

const truncateTitle = (title, maxLength = 50) => {
  if (title.length <= maxLength) return title;
  if (title.includes(':')) {
    const mainTitle = title.split(':')[0];
    if (mainTitle.length <= maxLength) return mainTitle;
  }
  return title.substring(0, maxLength) + '...';
};

export default Breadcrumbs;
```

### Usage in NewBlogPost.jsx

```jsx
import Breadcrumbs from './components/Breadcrumbs';

// Replace lines 643-661 with:
<Breadcrumbs post={post} onNavigate={handleNavigation} />
```

---

## 2. Enhanced Related Posts

### Enhanced Algorithm

```javascript
// File: /src/newblog/utils/postLoader.js

export const getRelatedPostsMetadata = (currentPost, limit = 3) => {
  if (!currentPost || !currentPost.tags) return [];

  const allPosts = getAllPostsMetadata();
  const currentCategory = extractCategory(currentPost.slug);
  const now = new Date();

  const scoredPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      let score = 0;

      // Tag similarity (10 points per shared tag)
      const commonTags = post.tags?.filter(tag => currentPost.tags.includes(tag)) || [];
      score += commonTags.length * 10;

      // Category match (15 points)
      const postCategory = extractCategory(post.slug);
      if (postCategory === currentCategory && currentCategory !== 'general') {
        score += 15;
      }

      // Recency bonus (5 points if < 30 days old)
      const daysSincePublish = Math.floor((now - post.date) / (1000 * 60 * 60 * 24));
      if (daysSincePublish <= 30) {
        score += 5;
      }

      // Read time similarity (3 points if within 5 minutes)
      const readTimeDiff = Math.abs(post.readTime - currentPost.readTime);
      if (readTimeDiff <= 5) {
        score += 3;
      }

      return { ...post, score, commonTags };
    })
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score || b.date - a.date);

  return scoredPosts.slice(0, limit);
};

const extractCategory = (slug) => {
  if (slug.includes('dhm-') && (slug.includes('guide') || slug.includes('review'))) {
    return 'dhm-guides';
  }
  if (slug.includes('alcohol-') && (slug.includes('health') || slug.includes('impact'))) {
    return 'health-impact';
  }
  if (slug.includes('hangover')) {
    return 'hangover-prevention';
  }
  if (slug.includes('liver')) {
    return 'liver-health';
  }
  return 'general';
};
```

### Component Implementation

```jsx
// File: /src/newblog/components/RelatedPosts.jsx
import React from 'react';
import { Clock, TrendingUp, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const RelatedPosts = ({ currentPost, relatedPosts, onNavigate }) => {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Based on <span className="font-semibold text-green-700">{currentPost.title}</span>
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => onNavigate(`/never-hungover/${post.slug}`)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
          >
            {post.image && (
              <div className="h-40 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700 uppercase">
                  Related
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                {post.title}
              </h3>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};

export default RelatedPosts;
```

---

## 3. Contextual Link Injection

### Core Logic

```javascript
// File: /src/newblog/utils/contextualLinks.js
import linkSuggestions from '../data/linkSuggestions.json';

export class ContextualLinkInjector {
  constructor(content, currentSlug) {
    this.content = content;
    this.currentSlug = currentSlug;
    this.rules = linkSuggestions.rules;
    this.keywords = linkSuggestions.keywords;
    this.injectedLinks = new Map();
  }

  process() {
    const relevantKeywords = this.keywords.filter(
      kw => kw.targetSlug !== this.currentSlug
    );

    const blocks = this.parseBlocks(this.content);
    const processedBlocks = blocks.map((block) => {
      if (block.type !== 'paragraph') return block.content;
      if (this.rules.skipExistingLinks && block.content.includes('[')) {
        return block.content;
      }
      return this.injectLinksInBlock(block.content, relevantKeywords);
    });

    return processedBlocks.join('\n\n');
  }

  parseBlocks(content) {
    const lines = content.split('\n');
    const blocks = [];
    let currentBlock = { type: 'paragraph', content: '' };

    lines.forEach((line) => {
      if (line.startsWith('#')) {
        if (currentBlock.content) blocks.push(currentBlock);
        blocks.push({ type: 'heading', content: line });
        currentBlock = { type: 'paragraph', content: '' };
      } else if (line.startsWith('```')) {
        if (currentBlock.content) blocks.push(currentBlock);
        blocks.push({ type: 'code', content: line });
        currentBlock = { type: 'paragraph', content: '' };
      } else if (line.trim() === '') {
        if (currentBlock.content) {
          blocks.push(currentBlock);
          currentBlock = { type: 'paragraph', content: '' };
        }
      } else {
        currentBlock.content += (currentBlock.content ? '\n' : '') + line;
      }
    });

    if (currentBlock.content) blocks.push(currentBlock);
    return blocks;
  }

  injectLinksInBlock(text, keywords) {
    let processedText = text;
    const sortedKeywords = [...keywords].sort((a, b) => b.priority - a.priority);

    for (const keyword of sortedKeywords) {
      const currentCount = this.injectedLinks.get(keyword.term) || 0;
      if (currentCount >= keyword.maxLinksPerPost) continue;

      const totalLinks = Array.from(this.injectedLinks.values()).reduce((a, b) => a + b, 0);
      if (totalLinks >= this.rules.maxLinksPerPost) break;

      const matchPattern = this.buildMatchPattern(keyword);
      const match = processedText.match(matchPattern);

      if (match) {
        const matchedText = match[0];
        const link = `[${keyword.displayText}](/never-hungover/${keyword.targetSlug})`;
        processedText = processedText.replace(matchedText, link);
        this.injectedLinks.set(keyword.term, currentCount + 1);
      }
    }

    return processedText;
  }

  buildMatchPattern(keyword) {
    const terms = [keyword.term, ...(keyword.variations || [])];
    const pattern = terms
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'i');
  }
}

export const enhanceContentWithLinks = (content, currentSlug) => {
  const injector = new ContextualLinkInjector(content, currentSlug);
  return injector.process();
};
```

### Integration

```jsx
// In NewBlogPost.jsx, update renderContent() function:

const renderContent = (post) => {
  let rawContent = '';

  if (Array.isArray(post.content)) {
    rawContent = post.content
      .map(section => {
        switch (section.type) {
          case 'section':
            return `## ${section.heading}\n\n${section.content}`;
          case 'callout':
            return `**${section.title}**: ${section.content}`;
          default:
            return section.content || '';
        }
      })
      .join('\n\n');
  } else {
    rawContent = (post.content || '').replace(/\\n/g, '\n');
  }

  // Enhance with contextual links
  const enhancedContent = enhanceContentWithLinks(rawContent, post.slug);
  return enhancedContent;
};
```

---

## 4. Topic Cluster Widget

### Component

```jsx
// File: /src/newblog/components/TopicCluster.jsx
import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPostsMetadata } from '../utils/postLoader';
import topicClusters from '../data/topicClusters.json';

const TopicCluster = ({ clusterId, currentSlug, onNavigate }) => {
  const cluster = topicClusters.clusters.find(c => c.id === clusterId);
  const [pillarPost, setPillarPost] = useState(null);
  const [supportingPosts, setSupportingPosts] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const metadata = getAllPostsMetadata();
    const pillar = metadata.find(p => p.slug === cluster.pillarSlug);
    setPillarPost(pillar);

    const supporting = cluster.supportingPosts
      .map(slug => metadata.find(p => p.slug === slug))
      .filter(Boolean);
    setSupportingPosts(supporting);
  }, [clusterId]);

  if (!cluster || !pillarPost) return null;

  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' }
  }[cluster.color] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 my-8`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className={`w-6 h-6 ${colors.text}`} />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{cluster.name}</h3>
            <p className="text-sm text-gray-600">{cluster.description}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}>
          <motion.div animate={{ rotate: expanded ? 0 : -90 }}>
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Pillar Content */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Complete Guide
              </span>
              <div
                onClick={() => onNavigate(`/never-hungover/${pillarPost.slug}`)}
                className={`${pillarPost.slug === currentSlug ? 'ring-2 ring-green-500' : ''}
                  bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-all mt-2`}
              >
                <h4 className={`font-bold ${colors.text} mb-1`}>{pillarPost.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{pillarPost.excerpt}</p>
              </div>
            </div>

            {/* Supporting Content */}
            <div className="grid md:grid-cols-2 gap-3">
              {supportingPosts.map((post) => (
                <div
                  key={post.slug}
                  onClick={() => onNavigate(`/never-hungover/${post.slug}`)}
                  className={`${post.slug === currentSlug ? 'ring-2 ring-green-500' : ''}
                    bg-white rounded-lg p-3 cursor-pointer hover:bg-green-50 transition-all`}
                >
                  <h5 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {post.title}
                  </h5>
                  <span className="text-xs text-gray-500">{post.readTime} min</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TopicCluster;
```

### Cluster Detection

```javascript
// File: /src/newblog/utils/clusterDetection.js
import topicClusters from '../data/topicClusters.json';

export const detectPostClusters = (postSlug) => {
  const clusters = [];

  for (const cluster of topicClusters.clusters) {
    if (cluster.pillarSlug === postSlug) {
      clusters.push(cluster.id);
      continue;
    }
    if (cluster.supportingPosts.includes(postSlug)) {
      clusters.push(cluster.id);
    }
  }

  return clusters;
};
```

### Integration

```jsx
// In NewBlogPost.jsx, add after related posts:

import TopicCluster from './components/TopicCluster';
import { detectPostClusters } from '../utils/clusterDetection';

// Inside component:
{(() => {
  const clusters = detectPostClusters(post.slug);
  return clusters.map(clusterId => (
    <TopicCluster
      key={clusterId}
      clusterId={clusterId}
      currentSlug={post.slug}
      onNavigate={handleNavigation}
    />
  ));
})()}
```

---

## 5. Data Files

### linkSuggestions.json

```json
{
  "keywords": [
    {
      "term": "DHM",
      "variations": ["dihydromyricetin", "dhm supplement", "dhm supplements"],
      "targetSlug": "dhm-science-explained",
      "displayText": "DHM",
      "priority": 10,
      "maxLinksPerPost": 2
    },
    {
      "term": "hangover prevention",
      "variations": ["prevent hangovers", "preventing hangovers", "avoid hangovers"],
      "targetSlug": "complete-hangover-science-hub-2025",
      "displayText": "hangover prevention",
      "priority": 9,
      "maxLinksPerPost": 1
    },
    {
      "term": "liver health",
      "variations": ["liver protection", "liver function", "hepatic health"],
      "targetSlug": "liver-health-complete-guide-optimal-liver-function-protection-2025",
      "displayText": "liver health",
      "priority": 8,
      "maxLinksPerPost": 2
    }
  ],
  "rules": {
    "minWordDistance": 100,
    "skipHeadings": true,
    "skipCodeBlocks": true,
    "skipExistingLinks": true,
    "maxLinksPerPost": 5
  }
}
```

### categoryTaxonomy.json

```json
{
  "categories": [
    {
      "id": "dhm-guides",
      "name": "DHM Guides",
      "slug": "dhm-guides",
      "parent": null,
      "description": "Comprehensive guides about Dihydromyricetin",
      "icon": "BookOpen"
    },
    {
      "id": "product-reviews",
      "name": "Product Reviews",
      "slug": "product-reviews",
      "parent": "dhm-guides",
      "description": "DHM supplement reviews",
      "icon": "Star"
    },
    {
      "id": "health-impact",
      "name": "Health Impact",
      "slug": "health-impact",
      "parent": null,
      "description": "How alcohol affects health",
      "icon": "Heart"
    }
  ],
  "slugPatterns": [
    {
      "pattern": "^dhm-(dosage|safety|science)",
      "category": "dhm-guides"
    },
    {
      "pattern": "review|comparison",
      "category": "product-reviews"
    },
    {
      "pattern": "^alcohol-(liver|brain|heart)",
      "category": "health-impact"
    }
  ]
}
```

### topicClusters.json

```json
{
  "clusters": [
    {
      "id": "dhm-essentials",
      "name": "DHM Essentials",
      "pillarSlug": "dhm-science-explained",
      "description": "Everything you need to know about DHM",
      "icon": "BookOpen",
      "supportingPosts": [
        "dhm-dosage-guide-2025",
        "is-dhm-safe-science-behind-side-effects-2025",
        "when-to-take-dhm-timing-guide-2025",
        "can-you-take-dhm-every-day-long-term-guide-2025"
      ],
      "color": "green"
    },
    {
      "id": "liver-protection",
      "name": "Liver Health Mastery",
      "pillarSlug": "liver-health-complete-guide-optimal-liver-function-protection-2025",
      "description": "Comprehensive liver protection strategies",
      "icon": "Activity",
      "supportingPosts": [
        "fatty-liver-disease-complete-guide-causes-symptoms-natural-treatment-2025",
        "liver-inflammation-causes-symptoms-natural-treatment-2025",
        "best-liver-detox-science-based-methods-vs-marketing-myths-2025"
      ],
      "color": "blue"
    }
  ]
}
```

---

## 6. Testing Examples

### Unit Tests

```javascript
// File: /src/newblog/__tests__/contextualLinks.test.js
import { describe, it, expect } from 'vitest';
import { ContextualLinkInjector } from '../utils/contextualLinks';

describe('ContextualLinkInjector', () => {
  it('should inject links for matching keywords', () => {
    const content = 'DHM is effective for liver health.';
    const injector = new ContextualLinkInjector(content, 'test-slug');
    const enhanced = injector.process();

    expect(enhanced).toContain('[DHM]');
    expect(enhanced).toContain('[liver health]');
  });

  it('should respect maxLinksPerPost limit', () => {
    const content = 'DHM '.repeat(20);
    const injector = new ContextualLinkInjector(content, 'test-slug');
    const enhanced = injector.process();

    const linkCount = (enhanced.match(/\[/g) || []).length;
    expect(linkCount).toBeLessThanOrEqual(5);
  });

  it('should not link to current page', () => {
    const content = 'Learn about DHM dosage.';
    const injector = new ContextualLinkInjector(content, 'dhm-dosage-guide-2025');
    const enhanced = injector.process();

    expect(enhanced).not.toContain('dhm-dosage-guide-2025');
  });
});
```

---

## 7. Analytics Tracking

```javascript
// Add to all link click handlers:

const trackInternalLink = (linkType, fromSlug, toSlug) => {
  if (window.gtag) {
    gtag('event', 'internal_link_click', {
      event_category: 'Navigation',
      event_label: linkType,
      link_type: linkType,
      from_slug: fromSlug,
      to_slug: toSlug,
      timestamp: new Date().toISOString()
    });
  }
};

// Usage:
<button onClick={() => {
  trackInternalLink('breadcrumb', post.slug, '/never-hungover');
  handleNavigation('/never-hungover');
}}>
  Never Hungover
</button>
```

---

## Quick Reference Summary

| Feature | File Location | Main Function |
|---------|---------------|---------------|
| Breadcrumbs | `components/Breadcrumbs.jsx` | `getCategoryForPost()` |
| Related Posts | `components/RelatedPosts.jsx` | `getRelatedPostsMetadata()` |
| Contextual Links | `utils/contextualLinks.js` | `enhanceContentWithLinks()` |
| Topic Clusters | `components/TopicCluster.jsx` | `detectPostClusters()` |

**Total Code Added**: ~800 lines
**Bundle Impact**: ~29KB gzipped
**Performance Impact**: Negligible (<0.1s LCP)
