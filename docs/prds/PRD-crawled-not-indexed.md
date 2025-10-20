# Product Requirements Document: Fix Crawled But Not Indexed Pages

## Executive Summary
23 blog posts have been crawled by Google but were not selected for indexing, indicating content quality, relevance, or technical SEO issues that need investigation and resolution.

## Problem Statement
Despite successful crawling, Google has chosen not to include 23 pages in its index, suggesting:
- Content doesn't meet quality thresholds
- Duplicate or similar content exists
- Technical issues preventing proper evaluation
- Low page authority or relevance signals

## Success Metrics
- **Primary**: 80% of affected pages indexed within 14 days
- **Secondary**: Identify and document specific rejection reasons
- **Long-term**: Prevent future crawled-but-not-indexed issues

## Investigation Framework

### Phase 1: Content Quality Audit (Day 1-2)

#### Content Depth Analysis
```javascript
const analyzeContentQuality = (posts) => {
  const metrics = posts.map(post => ({
    slug: post.slug,
    wordCount: post.content.split(' ').length,
    headingCount: (post.content.match(/^#{1,6} /gm) || []).length,
    imageCount: (post.content.match(/!\[.*?\]/g) || []).length,
    linkCount: (post.content.match(/\[.*?\]\(.*?\)/g) || []).length,
    uniqueScore: calculateUniqueness(post.content),
    readabilityScore: calculateReadability(post.content)
  }));
  
  return metrics.filter(m => 
    m.wordCount < 800 || 
    m.headingCount < 3 || 
    m.uniqueScore < 0.7
  );
};
```

#### Duplicate Content Detection
```javascript
const findDuplicateContent = async () => {
  const posts = await loadAllPosts();
  const similarities = [];
  
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const similarity = calculateSimilarity(posts[i].content, posts[j].content);
      if (similarity > 0.6) {
        similarities.push({
          post1: posts[i].slug,
          post2: posts[j].slug,
          similarity: similarity
        });
      }
    }
  }
  
  return similarities;
};
```

#### E-E-A-T Assessment
Evaluate Expertise, Experience, Authoritativeness, and Trustworthiness:

1. **Expertise Signals**
   - Author credentials
   - Citation quality
   - Technical accuracy
   
2. **Experience Indicators**
   - First-hand accounts
   - Original research
   - Unique insights

3. **Authority Markers**
   - External references
   - Brand mentions
   - Social proof

4. **Trust Factors**
   - Medical disclaimer
   - Source citations
   - Update frequency

### Phase 2: Technical SEO Validation (Day 2-3)

#### Rendering Analysis
```bash
# Check if content renders without JavaScript
curl -A "Googlebot" https://www.dhmguide.com/never-hungover/[slug] | grep -c "main-content"

# Validate structured data
curl -X POST https://validator.schema.org/validate \
  -H "Content-Type: application/json" \
  -d '{"html": "[page-html]"}'
```

#### Canonical & Duplicate Detection
```javascript
const technicalAudit = {
  async checkCanonicals() {
    const issues = [];
    
    for (const post of affectedPosts) {
      const response = await fetch(post.url);
      const html = await response.text();
      
      // Check canonical tag
      const canonical = html.match(/<link rel="canonical" href="(.*?)"/);
      if (!canonical || canonical[1] !== post.url) {
        issues.push({
          url: post.url,
          issue: 'Incorrect canonical',
          found: canonical?.[1]
        });
      }
      
      // Check for noindex
      if (html.includes('noindex')) {
        issues.push({
          url: post.url,
          issue: 'Noindex tag found'
        });
      }
    }
    
    return issues;
  }
};
```

#### Core Web Vitals Check
```javascript
const checkWebVitals = async (urls) => {
  const results = [];
  
  for (const url of urls) {
    const metrics = await getWebVitals(url);
    results.push({
      url,
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      passed: metrics.lcp < 2500 && metrics.fid < 100 && metrics.cls < 0.1
    });
  }
  
  return results.filter(r => !r.passed);
};
```

### Phase 3: Competitive Analysis (Day 3-4)

#### SERP Competition Review
```javascript
const analyzeCompetition = async (keyword) => {
  // Get top 10 results for target keyword
  const topResults = await searchGoogle(keyword);
  
  return {
    avgWordCount: average(topResults.map(r => r.wordCount)),
    avgBacklinks: average(topResults.map(r => r.backlinks)),
    commonTopics: extractCommonTopics(topResults),
    contentGaps: identifyGaps(ourContent, topResults)
  };
};
```

#### Content Gap Analysis
1. **Topic Coverage**
   - Missing subtopics competitors cover
   - Depth of information comparison
   - Unique value proposition

2. **Format Analysis**
   - Content structure comparison
   - Media usage (images, videos)
   - Interactive elements

### Phase 4: Content Enhancement (Day 4-7)

#### Content Improvement Framework
```javascript
const enhanceContent = (post) => {
  const improvements = [];
  
  // Add comprehensive introduction
  if (post.content.indexOf('## ') < 200) {
    improvements.push({
      type: 'add_introduction',
      content: generateIntroduction(post.title, post.topic)
    });
  }
  
  // Add FAQ section
  if (!post.content.includes('## FAQ') && !post.content.includes('## Frequently')) {
    improvements.push({
      type: 'add_faq',
      content: generateFAQ(post.topic)
    });
  }
  
  // Add expert quotes
  if (!post.content.includes('"') || post.content.match(/"/g).length < 4) {
    improvements.push({
      type: 'add_expertise',
      content: addExpertQuotes(post.topic)
    });
  }
  
  // Enhance with statistics
  if (post.content.match(/\d+%/g)?.length < 3) {
    improvements.push({
      type: 'add_statistics',
      content: addRelevantStats(post.topic)
    });
  }
  
  return improvements;
};
```

#### Content Freshness Update
```javascript
const refreshContent = {
  updateDates: (post) => {
    post.lastModified = new Date().toISOString();
    post.content = post.content.replace(/2024/g, '2025');
    return post;
  },
  
  addCurrentEvents: (post) => {
    const recentNews = getRecentNews(post.topic);
    if (recentNews) {
      post.content = `## Latest Updates (${new Date().toLocaleDateString()})\n\n${recentNews}\n\n${post.content}`;
    }
    return post;
  },
  
  updateStatistics: (post) => {
    const outdatedStats = post.content.match(/\d{4} study|\d{4} research/gi);
    if (outdatedStats) {
      // Flag for manual review
      post.needsStatUpdate = true;
    }
    return post;
  }
};
```

### Phase 5: Technical Optimizations (Day 7-10)

#### Page Speed Optimization
```javascript
const optimizePageSpeed = {
  // Lazy load images
  lazyLoadImages: (content) => {
    return content.replace(
      /<img src="/g,
      '<img loading="lazy" src="'
    );
  },
  
  // Optimize image sizes
  optimizeImages: async (images) => {
    for (const img of images) {
      await compressImage(img, { quality: 85 });
      await generateWebP(img);
      await generateSrcSet(img, [400, 800, 1200]);
    }
  },
  
  // Minimize JavaScript
  reduceJSPayload: () => {
    // Code split non-critical JS
    // Tree shake unused code
    // Defer non-critical scripts
  }
};
```

#### Internal Linking Enhancement
```javascript
const improveInternalLinks = (post) => {
  const relatedPosts = findRelatedPosts(post, 5);
  
  // Add contextual links
  relatedPosts.forEach(related => {
    const anchor = findRelevantAnchor(post.content, related.keywords);
    if (anchor) {
      post.content = post.content.replace(
        anchor,
        `[${anchor}](/never-hungover/${related.slug})`
      );
    }
  });
  
  // Add related posts section
  const relatedSection = `
## Related Articles

${relatedPosts.map(p => 
  `- [${p.title}](/never-hungover/${p.slug}): ${p.excerpt}`
).join('\n')}
`;
  
  post.content += relatedSection;
  return post;
};
```

### Phase 6: Re-indexing Strategy (Day 10-14)

#### Batch Re-indexing Process
```javascript
const reindexingStrategy = {
  async priority1_DirectRequest() {
    // Use URL Inspection API
    const results = [];
    for (const url of affectedUrls) {
      const result = await searchConsole.urlInspection.inspect({
        inspectionUrl: url,
        siteUrl: 'https://www.dhmguide.com'
      });
      
      if (result.status === 'OK') {
        await searchConsole.urlInspection.requestIndexing({
          url: url
        });
        results.push({ url, status: 'requested' });
      }
    }
    return results;
  },
  
  async priority2_SitemapPing() {
    // Ping search engines with updated sitemap
    const engines = [
      'https://www.google.com/ping?sitemap=',
      'https://www.bing.com/ping?sitemap='
    ];
    
    for (const engine of engines) {
      await fetch(`${engine}https://www.dhmguide.com/sitemap.xml`);
    }
  },
  
  async priority3_SocialSignals() {
    // Create social signals to encourage crawling
    for (const post of enhancedPosts) {
      await shareOnSocial(post);
      await submitToReddit(post);
      await addToMedium(post);
    }
  }
};
```

## Implementation Checklist

### Week 1: Analysis & Quick Fixes
- [ ] Run content quality audit on all 23 pages
- [ ] Identify and fix any technical SEO issues
- [ ] Update meta descriptions and titles
- [ ] Fix any duplicate content issues
- [ ] Add missing structured data

### Week 2: Content Enhancement
- [ ] Enhance content depth (minimum 1500 words)
- [ ] Add expert quotes and citations
- [ ] Include relevant statistics and data
- [ ] Create custom graphics or infographics
- [ ] Add comprehensive FAQ sections

### Week 3: Technical Optimization
- [ ] Improve Core Web Vitals scores
- [ ] Enhance internal linking structure
- [ ] Optimize images and media
- [ ] Implement content freshness signals
- [ ] Add related posts sections

### Week 4: Re-indexing & Monitoring
- [ ] Submit enhanced pages for re-indexing
- [ ] Monitor Search Console for status changes
- [ ] Track ranking improvements
- [ ] Document successful patterns
- [ ] Create prevention guidelines

## Monitoring & Measurement

### KPIs to Track
```javascript
const metrics = {
  indexingRate: {
    baseline: 0,
    target: 80,
    measure: 'percentage of pages indexed'
  },
  
  avgTimeToIndex: {
    baseline: null,
    target: 7,
    measure: 'days from enhancement to indexing'
  },
  
  contentQualityScore: {
    baseline: null,
    target: 85,
    measure: 'composite score of word count, uniqueness, expertise'
  },
  
  organicTraffic: {
    baseline: current,
    target: '+50%',
    measure: 'organic sessions to enhanced pages'
  }
};
```

### Weekly Review Process
1. Check Search Console coverage report
2. Review indexing status of enhanced pages
3. Analyze organic traffic trends
4. Document successful improvements
5. Adjust strategy based on results

## Prevention Strategy

### Pre-publish Checklist
- [ ] Minimum 1500 words of unique content
- [ ] 5+ authoritative external links
- [ ] 10+ relevant internal links
- [ ] Comprehensive meta data
- [ ] Original images with alt text
- [ ] FAQ schema markup
- [ ] Expert quotes or citations
- [ ] Recent publication date
- [ ] Mobile-friendly formatting
- [ ] Core Web Vitals pass

### Automated Quality Gates
```javascript
const publishingGates = {
  contentLength: (post) => post.content.split(' ').length >= 1500,
  uniqueness: (post) => calculateUniqueness(post) >= 0.85,
  seoScore: (post) => calculateSEOScore(post) >= 80,
  internalLinks: (post) => countInternalLinks(post) >= 10,
  hasSchema: (post) => validateSchema(post.structuredData),
  
  canPublish(post) {
    const checks = [
      this.contentLength,
      this.uniqueness,
      this.seoScore,
      this.internalLinks,
      this.hasSchema
    ];
    
    return checks.every(check => check(post));
  }
};
```

## Success Criteria
- [ ] 18+ of 23 pages indexed within 14 days (80% success rate)
- [ ] Average content quality score above 85
- [ ] No new crawled-but-not-indexed issues for 30 days
- [ ] Documentation of specific rejection reasons
- [ ] Automated prevention system in place
- [ ] 25% increase in organic traffic to affected pages