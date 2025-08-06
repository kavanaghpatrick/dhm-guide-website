# Product Requirements Document: Fix 40 Never-Crawled URLs

## Executive Summary
40 blog posts published in late July 2025 have never been crawled by Google, showing a "1970-01-01" timestamp in Search Console. This represents 20% of our content library that's completely invisible to search engines.

## Problem Statement
Despite having a comprehensive sitemap and proper SEO infrastructure, 40 recent blog posts are not being discovered by Google's crawler, resulting in zero search visibility for high-value health content.

## Success Metrics
- **Primary**: 100% of affected URLs crawled within 7 days
- **Secondary**: 90%+ indexed within 14 days  
- **Long-term**: New posts crawled within 48 hours of publishing

## Root Cause Investigation Plan

### Phase 1: Discovery Verification (Day 1)
1. **Sitemap Analysis**
   - Verify all 40 URLs are in sitemap.xml
   - Check sitemap last modified date
   - Validate sitemap submission in Search Console
   - Test sitemap accessibility (curl https://www.dhmguide.com/sitemap.xml)

2. **Internal Linking Audit**
   - Check if posts appear in /never-hungover listing page
   - Verify navigation links from homepage
   - Analyze internal link depth (clicks from homepage)
   - Review related posts linking

3. **Crawlability Testing**
   - Test each URL with Google's URL Inspection tool
   - Check for robots.txt blocks
   - Verify no noindex tags
   - Test JavaScript rendering

### Phase 2: Technical Investigation (Day 2)
1. **Publishing Process Review**
   - Analyze what happened July 27-31
   - Check deployment logs for that period
   - Review any code changes to blog system
   - Verify build process includes new posts

2. **Server & Performance Analysis**
   - Check server logs for Googlebot visits
   - Review 500/404 errors during that period
   - Analyze Core Web Vitals for blog posts
   - Test page load times

3. **Content Delivery Verification**
   - Ensure posts render without JavaScript
   - Check for cloaking or user-agent issues
   - Verify CDN/cache configuration
   - Test international accessibility

### Phase 3: Immediate Fixes (Day 3-4)

#### Fix 1: Force Discovery
```bash
# Manual sitemap resubmission
- Google Search Console > Sitemaps > Resubmit
- Bing Webmaster Tools > Submit sitemap

# Request indexing for each URL
- Use URL Inspection tool
- Click "Request Indexing" for all 40 URLs
- Document submission timestamps
```

#### Fix 2: Improve Internal Discovery
```javascript
// Add recent posts section to homepage
const RecentPosts = () => {
  const posts = getLatestPosts(10);
  return (
    <section className="recent-posts">
      <h2>Latest Research & Guides</h2>
      {posts.map(post => (
        <a href={`/never-hungover/${post.slug}`}>
          {post.title}
        </a>
      ))}
    </section>
  );
};

// Enhance blog listing page
- Add pagination to show all posts
- Include publish dates prominently
- Add "New" badges for recent posts
```

#### Fix 3: Create Discovery Signals
```javascript
// Generate RSS feed
const generateRSSFeed = () => {
  const feed = new RSS({
    title: 'DHM Guide Blog',
    site_url: 'https://www.dhmguide.com',
    feed_url: 'https://www.dhmguide.com/rss.xml'
  });
  
  posts.forEach(post => {
    feed.item({
      title: post.title,
      url: `https://www.dhmguide.com/never-hungover/${post.slug}`,
      date: post.publishDate,
      description: post.excerpt
    });
  });
  
  return feed.xml();
};

// Add to build process
"build": "npm run generate-rss && npm run generate-sitemap && vite build"
```

### Phase 4: Monitoring & Prevention (Day 5-7)

#### Monitoring Setup
1. **Automated Crawl Monitoring**
   ```javascript
   // Daily check for uncrawled posts
   const checkCrawlStatus = async () => {
     const posts = await getAllPosts();
     const uncrawled = [];
     
     for (const post of posts) {
       const status = await checkSearchConsole(post.url);
       if (status.lastCrawled === null) {
         uncrawled.push(post);
       }
     }
     
     if (uncrawled.length > 0) {
       await sendAlert(`${uncrawled.length} posts not crawled`);
     }
   };
   ```

2. **Publishing Checklist**
   - [ ] Post appears in sitemap.xml
   - [ ] Post linked from listing page
   - [ ] Internal links added
   - [ ] URL submitted to Search Console
   - [ ] Social media shared (creates backlinks)

3. **Weekly Health Checks**
   - Review Search Console coverage report
   - Check new post crawl rates
   - Monitor indexing percentage
   - Track organic traffic growth

## Technical Implementation

### Immediate Actions (Priority 1)
1. **Sitemap Enhancement**
   ```xml
   <!-- Add lastmod dates for all posts -->
   <url>
     <loc>https://www.dhmguide.com/never-hungover/[slug]</loc>
     <lastmod>2025-07-31T00:00:00Z</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.8</priority>
   </url>
   ```

2. **Structured Data Enhancement**
   ```json
   {
     "@type": "BlogPosting",
     "datePublished": "2025-07-31T00:00:00Z",
     "dateModified": "2025-07-31T00:00:00Z",
     "mainEntityOfPage": {
       "@type": "WebPage",
       "@id": "https://www.dhmguide.com/never-hungover/[slug]"
     }
   }
   ```

3. **Internal Linking Boost**
   - Add "Recent Posts" widget to all blog posts
   - Create topic clusters with hub pages
   - Implement breadcrumb navigation
   - Add previous/next post navigation

### Long-term Solutions (Priority 2)
1. **API Integration**
   - Google Indexing API for instant submission
   - Search Console API for monitoring
   - Automated alerts for crawl issues

2. **Content Distribution**
   - RSS feed generation
   - JSON feed for modern readers
   - Email newsletter with new posts
   - Social media auto-posting

## Risk Mitigation
- **Risk**: URLs remain uncrawled after fixes
  - **Mitigation**: Create external backlinks via social media, forums
  
- **Risk**: Future posts face same issue
  - **Mitigation**: Automated monitoring and alerting system

- **Risk**: Manual indexing requests hit quota
  - **Mitigation**: Prioritize highest-value content first

## Timeline
- Day 1-2: Investigation and root cause analysis
- Day 3-4: Implement immediate fixes
- Day 5-7: Monitor results and adjust
- Week 2: Long-term solutions implementation
- Week 3-4: Full recovery verification

## Resources Required
- Engineering: 20 hours
- SEO specialist: 10 hours
- Content team: 5 hours (for any content updates)

## Acceptance Criteria
- [ ] All 40 URLs show crawled status in Search Console
- [ ] Sitemap properly reflects all blog posts with dates
- [ ] Internal linking improved with recent posts sections
- [ ] Monitoring system alerts for future uncrawled posts
- [ ] Documentation updated with new publishing checklist
- [ ] RSS/JSON feeds implemented and submitted