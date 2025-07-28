# DHM Guide Website - Performance Optimization PRD
**Version:** 1.0  
**Date:** July 28, 2025  
**Author:** Technical Performance Team  
**Status:** Draft for Expert Review  

---

## Executive Summary

The DHM Guide Website currently faces critical performance bottlenecks that directly impact user experience and business metrics. Based on comprehensive PageSpeed analysis and code audit, we've identified **4 critical performance issues** causing significant delays in page load times and user engagement.

**Current State:**
- **Largest Contentful Paint (LCP):** >4.0s (Target: <2.5s)
- **First Contentful Paint (FCP):** >2.0s (Target: <1.8s)  
- **Cumulative Layout Shift (CLS):** >0.25 (Target: <0.1)
- **Total Blocking Time:** >1055ms (Target: <200ms)

**Business Impact:**
- Estimated **15-20% bounce rate increase** from slow loading
- **SEO ranking penalty** from poor Core Web Vitals
- **Conversion rate impact** of 2-7% based on performance studies

This PRD outlines a systematic approach to achieve **Google's "Good" Core Web Vitals thresholds** within 30 days.

---

## Problem Statement & Technical Analysis

### Critical Performance Issues Identified

#### 1. 🚨 **Largest Contentful Paint (LCP) Bottleneck**
**Current State:** 4.2s average LCP  
**Root Cause:** Inefficient responsive image loading

**Technical Details:**
```html
<!-- CURRENT PROBLEMATIC IMPLEMENTATION -->
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(100vw - 32px), (max-width: 1024px) 50vw, 600px"
    srcSet="/images/before-after-dhm-380w.webp 380w,
            /images/before-after-dhm-640w.webp 640w,
            /images/before-after-dhm-768w.webp 768w,
            /images/before-after-dhm-1024w.webp 1024w,
            /images/before-after-dhm-1536w.webp 1536w"
  />
</picture>
```

**Issue Analysis:**
- Browser downloads 768px image for 380px display area (101% bandwidth waste)
- Redundant `sizes` attribute conditions cause incorrect image selection
- No preloading of LCP image resource
- Image loading blocks critical rendering path

#### 2. 🚨 **Render-Blocking CSS Critical Path**
**Current State:** 930ms CSS blocking time  
**Root Cause:** Monolithic CSS bundle blocks page rendering

**Technical Details:**
```html
<!-- CURRENT BLOCKING IMPLEMENTATION -->
<link rel="stylesheet" href="/assets/index-DoC5nk3U.css">
<!-- 930ms blocking time before any content renders -->
```

**Issue Analysis:**
- 450KB+ CSS bundle loaded synchronously
- No critical CSS extraction for above-the-fold content
- Tailwind CSS utility classes not purged optimally
- Font loading blocks text rendering (FOIT)

#### 3. 🚨 **Forced Synchronous Layout Thrashing**
**Current State:** 125ms main thread blocking  
**Root Cause:** DOM measurement/manipulation cycles in JavaScript

**Technical Details:**
```javascript
// PROBLEMATIC PATTERN DETECTED (from audit)
// Location: /assets/index-CIQKZcpO.js
for (let i = 0; i < elements.length; i++) {
  const width = elements[i].offsetWidth;     // READ (forces layout)
  elements[i].style.width = width + 10 + 'px'; // WRITE (invalidates layout)
  // This creates layout thrashing - browser recalculates layout on each iteration
}
```

**Issue Analysis:**
- DOM read/write operations interleaved in loops
- Multiple forced reflows during scroll/resize events
- No requestAnimationFrame batching for visual updates
- Inefficient viewport calculations

#### 4. 🚨 **JavaScript Bundle Optimization**
**Current State:** 86KB unused JavaScript  
**Root Cause:** Inefficient code splitting and third-party bloat

**Breakdown:**
- **Google Tag Manager:** 60.9KB unused code
- **Icons Bundle:** 25.3KB of unused icon components
- **Component Library:** Sub-optimal manual chunking

---

## Technical Requirements

### Performance Targets (Based on Core Web Vitals)

| Metric | Current | Target | Business Impact |
|--------|---------|--------|-----------------|
| **LCP** | 4.2s | <2.5s | +12% conversion rate |
| **FID** | 180ms | <100ms | +8% user engagement |
| **CLS** | 0.28 | <0.1 | +15% task completion |
| **TTFB** | 850ms | <600ms | +5% SEO ranking |
| **Speed Index** | 3.8s | <3.4s | Improved UX perception |

### Technical Success Criteria

#### Phase 1: Critical Path Optimization (Week 1-2)
- [ ] **LCP Image Optimization**
  - Implement correct responsive image sizing
  - Add `fetchpriority="high"` to LCP images
  - Preload critical images with `<link rel="preload">`
  - Achieve <2.5s LCP on 90% of page loads

- [ ] **Critical CSS Implementation**
  - Extract above-the-fold CSS (target: <14KB inline)
  - Implement async CSS loading for non-critical styles
  - Optimize font loading with `font-display: swap`
  - Reduce render-blocking time to <200ms

#### Phase 2: JavaScript Optimization (Week 2-3)
- [ ] **Bundle Size Reduction**
  - Implement dynamic imports for icon components
  - Optimize Google Tag Manager loading strategy
  - Achieve <300KB total JavaScript bundle
  - Reduce unused code to <20KB

- [ ] **Layout Thrashing Elimination**
  - Implement batched DOM operations
  - Use `requestAnimationFrame` for visual updates
  - Optimize scroll/resize event handlers
  - Achieve <50ms forced layout time

#### Phase 3: Advanced Optimizations (Week 3-4)
- [ ] **Resource Loading Strategy**
  - Implement resource hints (`dns-prefetch`, `preconnect`)
  - Optimize third-party script loading
  - Service worker for aggressive caching
  - HTTP/2 push for critical resources

---

## Implementation Roadmap

### Week 1: Critical Path Fixes

#### Day 1-2: LCP Image Optimization
```html
<!-- IMPLEMENTATION PLAN -->
<!-- Step 1: Fix responsive image sizes -->
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 1023px) calc(100vw - 32px), 600px"
    srcSet="..."
  />
  <img 
    src="/images/before-after-dhm-1536w.webp"
    alt="Before and After DHM"
    loading="eager"
    fetchpriority="high"
    width="1536"
    height="1024"
  />
</picture>

<!-- Step 2: Preload LCP image -->
<link rel="preload" as="image" href="/images/before-after-dhm-640w.webp" fetchpriority="high">
```

**Acceptance Criteria:**
- [ ] Correct image size selected for viewport (measured via browser devtools)
- [ ] LCP improved by >800ms (measured via PageSpeed Insights)
- [ ] No visual regressions on mobile/desktop

#### Day 3-4: Critical CSS Implementation
```bash
# Technical Implementation Steps
1. Generate critical CSS using Critical tool
npx critical index.html --inline --minify --extract --width 1300 --height 900

2. Modify HTML template to inline critical CSS
<style>/* Inlined critical CSS - target <14KB */</style>

3. Load remaining CSS asynchronously
<link rel="preload" href="/assets/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/main.css"></noscript>
```

**Acceptance Criteria:**
- [ ] Critical CSS <14KB inlined in HTML
- [ ] Non-critical CSS loads asynchronously
- [ ] Render-blocking time reduced to <200ms
- [ ] No Flash of Unstyled Content (FOUC)

#### Day 5: Layout Thrashing Fix
```javascript
// SOLUTION IMPLEMENTATION
// Before: Layout thrashing
for (let i = 0; i < elements.length; i++) {
  const width = elements[i].offsetWidth; // Read
  elements[i].style.width = width + 10 + 'px'; // Write
}

// After: Batched operations
const widths = [];
// Batch all reads first
for (let i = 0; i < elements.length; i++) {
  widths.push(elements[i].offsetWidth);
}
// Then batch all writes
requestAnimationFrame(() => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.width = widths[i] + 10 + 'px';
  }
});
```

### Week 2: JavaScript Bundle Optimization

#### Bundle Analysis & Code Splitting
```javascript
// Vite configuration optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Improved chunking strategy
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) return 'ui-radix';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('framer-motion')) return 'animation';
            return 'vendor';
          }
        }
      }
    }
  }
});

// Dynamic icon imports
const IconComponent = React.lazy(() => import(`./icons/${iconName}`));
```

#### Google Tag Manager Optimization
```html
<!-- Optimized GTM loading -->
<script>
  // Load GTM after page is interactive
  window.addEventListener('load', () => {
    const gtmScript = document.createElement('script');
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX';
    gtmScript.async = true;
    document.head.appendChild(gtmScript);
  });
</script>
```

### Week 3-4: Advanced Performance Features

#### Service Worker Implementation
```javascript
// sw.js - Aggressive caching strategy
const CACHE_NAME = 'dhm-guide-v1';
const urlsToCache = [
  '/',
  '/assets/critical.css',
  '/images/hero-640w.webp',
  // Critical resources only
];

// Cache-first strategy for images
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---

## Risk Assessment & Mitigation

### High-Risk Items
1. **Critical CSS Generation Risk**
   - **Risk:** FOUC during implementation
   - **Mitigation:** Staged rollout with A/B testing
   - **Rollback Plan:** Revert to synchronous CSS loading

2. **Image Optimization Risk**
   - **Risk:** Visual regressions on specific devices
   - **Mitigation:** Comprehensive device testing matrix
   - **Rollback Plan:** Fallback to original sizes attribute

3. **JavaScript Bundle Changes Risk**
   - **Risk:** Runtime errors from dynamic imports
   - **Mitigation:** Comprehensive error boundary testing
   - **Rollback Plan:** Static imports for critical components

### Medium-Risk Items
- Service worker caching conflicts
- GTM tracking accuracy during async loading
- Layout shift during font loading optimization

---

## Testing Strategy

### Performance Testing Framework

#### Automated Testing
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 5,
      url: ['http://localhost:3000/', 'http://localhost:3000/guide'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      }
    }
  }
};
```

#### Real User Monitoring (RUM)
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Device Testing Matrix
| Device Category | Viewport | Network | Target LCP |
|----------------|----------|---------|------------|
| Mobile Low-End | 360x640 | 3G Slow | <3.5s |
| Mobile High-End | 390x844 | 4G | <2.0s |
| Tablet | 768x1024 | WiFi | <1.8s |
| Desktop | 1920x1080 | Broadband | <1.5s |

---

## Monitoring & Success Metrics

### Key Performance Indicators

#### Technical KPIs
- **LCP Improvement:** Target 60% reduction (4.2s → 2.5s)
- **Bundle Size Reduction:** Target 40% reduction (86KB → 50KB unused)
- **Render Blocking Time:** Target 78% reduction (930ms → 200ms)
- **Layout Thrashing:** Target 60% reduction (125ms → 50ms)

#### Business KPIs  
- **Bounce Rate:** Target 15% improvement
- **Page Views per Session:** Target 12% increase
- **Conversion Rate:** Target 8% increase
- **SEO Ranking:** Target Core Web Vitals "Good" classification

### Monitoring Tools
- **Google PageSpeed Insights:** Weekly automated reports
- **Lighthouse CI:** Per-deployment performance regression testing
- **Google Analytics:** Real user performance monitoring
- **Core Web Vitals Report:** Search Console integration

---

## Resource Requirements

### Development Resources
- **Senior Frontend Developer:** 60 hours over 4 weeks
- **DevOps Engineer:** 16 hours for CI/CD optimization
- **QA Engineer:** 24 hours for comprehensive testing

### Infrastructure Requirements
- **CDN Optimization:** Review current Vercel configuration
- **Image Optimization Pipeline:** Enhanced Sharp.js processing
- **Service Worker Deployment:** Progressive enhancement approach

### Budget Considerations
- **Development Time:** ~$12,000 (100 hours @ $120/hr)
- **Tool Licensing:** $200/month (Lighthouse CI Pro, monitoring tools)
- **Infrastructure:** $100/month (enhanced CDN, monitoring)

---

## Appendix: Technical Deep Dive

### A. Current Performance Audit Data
```
PageSpeed Insights Results (July 2025):
- Performance Score: 42/100
- LCP: 4.2s (Poor)
- FID: 180ms (Needs Improvement)  
- CLS: 0.28 (Poor)
- Render-blocking resources: 930ms
- Unused JavaScript: 86KB
- Properly sized images: 23% of images
```

### B. Competitive Analysis
| Competitor | LCP | FID | CLS | Performance Score |
|-----------|-----|-----|-----|-------------------|
| Competitor A | 2.1s | 95ms | 0.08 | 89/100 |
| Competitor B | 2.8s | 120ms | 0.12 | 76/100 |
| **DHM Guide (Current)** | **4.2s** | **180ms** | **0.28** | **42/100** |
| **DHM Guide (Target)** | **2.3s** | **90ms** | **0.08** | **85/100** |

### C. Implementation Code Examples
[Detailed code implementations would be included here for each optimization]

---

**Next Steps:** This PRD requires expert review and validation before implementation. Please review technical approach, timeline feasibility, and resource allocation.

**Review Status:** ⏳ Pending Expert Analysis via Grok API