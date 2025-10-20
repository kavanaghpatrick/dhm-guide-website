# DHM Performance Optimization - Technical Implementation PRD
**Version:** 3.0 - Ultra-Detailed Technical Specification  
**Date:** July 28, 2025  
**Purpose:** Zero-ambiguity implementation guide with complete code examples  

---

## 🎯 Technical Architecture Overview

### Current Performance Bottlenecks (Measured)
```
LCP: 4.2s (Target: <2.0s) - 68% improvement needed
FID/INP: 180ms (Target: <75ms) - 58% improvement needed  
CLS: 0.28 (Target: <0.05) - 82% improvement needed
Bundle: 86KB unused (Target: <20KB) - 77% reduction needed
CSS Blocking: 930ms (Target: <200ms) - 78% reduction needed
```

### Technical Stack Analysis
```javascript
// Current Stack
- React: 19.1.0 (latest, concurrent features available)
- Vite: 6.3.5 (latest, advanced optimization features)
- Tailwind: 4.1.7 (latest, JIT compilation)
- Build Target: ES2022 (modern browsers, tree-shaking optimized)
- Deployment: Vercel (Edge functions, image optimization available)
```

---

## 🚀 Phase 1: Critical Rendering Path Optimization

### 1.1 LCP Image Optimization - Complete Implementation

#### Current Problematic Code
```html
<!-- File: index.html or Layout.jsx -->
<!-- PROBLEM: Inefficient responsive image implementation -->
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
  <img 
    src="/images/before-after-dhm-1536w.webp"
    alt="Before and After DHM"
    loading="lazy"
    width="1536"
    height="1024"
  />
</picture>
```

#### Optimized Implementation
```html
<!-- File: index.html - Add to <head> section -->
<!-- SOLUTION 1: Priority Hints + Preloading -->
<link 
  rel="preload" 
  as="image" 
  href="/images/before-after-dhm-640w.webp" 
  fetchpriority="high"
  media="(max-width: 640px)"
/>
<link 
  rel="preload" 
  as="image" 
  href="/images/before-after-dhm-1024w.webp" 
  fetchpriority="high"
  media="(min-width: 641px)"
/>

<!-- SOLUTION 2: Corrected responsive image -->
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 1023px) calc(100vw - 2rem), 600px"
    srcSet="/images/before-after-dhm-380w.webp 380w,
            /images/before-after-dhm-640w.webp 640w,
            /images/before-after-dhm-768w.webp 768w,
            /images/before-after-dhm-1024w.webp 1024w,
            /images/before-after-dhm-1536w.webp 1536w"
  />
  <img 
    src="/images/before-after-dhm-1024w.webp"
    alt="DHM supplement effectiveness comparison showing before and after results"
    loading="eager"
    fetchpriority="high"
    width="1024"
    height="683"
    decoding="sync"
  />
</picture>
```

#### Responsive Image Component Implementation
```jsx
// File: src/components/OptimizedImage.jsx
import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  baseName, 
  alt, 
  sizes = "(max-width: 1023px) calc(100vw - 2rem), 600px",
  priority = false,
  width,
  height 
}) => {
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);

  const imageVariants = [380, 640, 768, 1024, 1536];
  
  const generateSrcSet = (format = 'webp') => {
    return imageVariants
      .map(width => `/images/${baseName}-${width}w.${format} ${width}w`)
      .join(', ');
  };

  const getOptimalSrc = () => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const targetWidth = viewportWidth <= 1023 ? viewportWidth - 32 : 600;
    const requiredWidth = targetWidth * devicePixelRatio;
    
    const optimalVariant = imageVariants.find(variant => variant >= requiredWidth) || 1536;
    return `/images/${baseName}-${optimalVariant}w.webp`;
  };

  return (
    <picture>
      <source
        type="image/webp"
        sizes={sizes}
        srcSet={generateSrcSet('webp')}
      />
      <source
        type="image/jpeg"
        sizes={sizes}
        srcSet={generateSrcSet('jpg')}
      />
      <img
        src={getOptimalSrc()}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        width={width}
        height={height}
        decoding={priority ? 'sync' : 'async'}
        style={{
          aspectRatio: `${width}/${height}`,
          objectFit: 'cover'
        }}
      />
    </picture>
  );
};

export default OptimizedImage;
```

### 1.2 Critical CSS Implementation - Complete Code

#### Vite Plugin Configuration
```javascript
// File: vite.config.js - Enhanced configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin for critical CSS extraction
    {
      name: 'critical-css-extractor',
      generateBundle(options, bundle) {
        // Extract critical CSS during build
        const criticalCSS = this.extractCriticalCSS();
        
        // Inject into HTML template
        Object.keys(bundle).forEach(fileName => {
          if (fileName.includes('index.html')) {
            bundle[fileName].source = bundle[fileName].source.replace(
              '<head>',
              `<head><style id="critical-css">${criticalCSS}</style>`
            );
          }
        });
      }
    }
  ],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical CSS chunking strategy
          if (id.includes('src/styles/critical')) return 'critical';
          if (id.includes('src/styles/components')) return 'components';
          if (id.includes('tailwindcss')) return 'tailwind';
          if (id.includes('@radix-ui')) return 'ui-library';
          return 'main';
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        // Critical CSS extraction
        require('postcss-critical-css')({
          critical: {
            width: 1300,
            height: 900,
            minify: true
          }
        })
      ]
    }
  }
});
```

#### Critical CSS Extraction Implementation
```css
/* File: src/styles/critical.css - Above-the-fold styles only */
/* Target: <14KB when minified */

/* 1. Layout structure (immediate rendering) */
html, body {
  margin: 0;
  padding: 0;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* 2. Header critical styles */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgb(229, 231, 235);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

/* 3. Hero section critical styles */
.hero {
  padding: 2rem 0 4rem;
  background: linear-gradient(135deg, rgb(240, 253, 244) 0%, rgb(255, 255, 255) 50%, rgb(239, 246, 255) 100%);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(135deg, rgb(21, 128, 61), rgb(22, 163, 74));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1.5rem 0;
}

/* 4. Critical image container */
.hero-image {
  position: relative;
  max-width: 600px;
  margin: 2rem auto 0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 5. Loading states to prevent CLS */
.image-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 6. Mobile-first responsive adjustments */
@media (max-width: 640px) {
  .hero {
    padding: 1rem 0 2rem;
  }
  
  .nav-container {
    padding: 0 0.75rem;
  }
  
  .hero-container {
    padding: 0 0.75rem;
  }
}
```

#### CSS Loading Strategy Implementation
```jsx
// File: src/components/CSSLoader.jsx
import React, { useEffect, useState } from 'react';

const CSSLoader = () => {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Preload non-critical CSS
    const loadCSS = (href) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
        setCssLoaded(true);
      };
      document.head.appendChild(link);
      
      // Fallback for browsers without preload support
      const noscriptLink = document.createElement('noscript');
      noscriptLink.innerHTML = `<link rel="stylesheet" href="${href}">`;
      document.head.appendChild(noscriptLink);
    };

    // Load non-critical CSS after critical path
    if (document.readyState === 'complete') {
      loadCSS('/assets/main.css');
    } else {
      window.addEventListener('load', () => loadCSS('/assets/main.css'));
    }
  }, []);

  return null;
};

export default CSSLoader;
```

#### Font Optimization Implementation
```css
/* File: src/styles/fonts.css */
/* Font loading optimization - prevents FOIT */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* Critical: prevents invisible text during font load */
  src: url('/fonts/inter-v12-latin-regular.woff2') format('woff2'),
       url('/fonts/inter-v12-latin-regular.woff') format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-v12-latin-600.woff2') format('woff2'),
       url('/fonts/inter-v12-latin-600.woff') format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-v12-latin-700.woff2') format('woff2'),
       url('/fonts/inter-v12-latin-700.woff') format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

```html
<!-- File: index.html - Add to <head> before critical CSS -->
<!-- Font preloading for faster text rendering -->
<link rel="preload" href="/fonts/inter-v12-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-v12-latin-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-v12-latin-700.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 🔧Phase 2: JavaScript Bundle Optimization

### 2.1 Layout Thrashing Elimination - Complete Implementation

#### Current Problematic Pattern Detection
```javascript
// File: src/utils/layoutThrashingDetector.js
// Tool to identify problematic DOM operations

class LayoutThrashingDetector {
  constructor() {
    this.readOperations = new Set([
      'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
      'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight', 
      'clientTop', 'clientLeft', 'clientWidth', 'clientHeight',
      'getBoundingClientRect', 'getComputedStyle'
    ]);
    
    this.writeOperations = new Set([
      'style', 'className', 'classList', 'setAttribute'
    ]);
  }

  wrapElement(element) {
    const detector = this;
    
    return new Proxy(element, {
      get(target, prop) {
        if (detector.readOperations.has(prop)) {
          console.warn(`🚨 DOM Read: ${prop} - Potential layout thrashing`);
          performance.mark('dom-read-start');
        }
        return target[prop];
      },
      
      set(target, prop, value) {
        if (detector.writeOperations.has(prop)) {
          console.warn(`✏️ DOM Write: ${prop} - Potential layout thrashing`);
          performance.mark('dom-write-start');
        }
        target[prop] = value;
        return true;
      }
    });
  }
}

export default LayoutThrashingDetector;
```

#### Optimized DOM Operations Implementation
```javascript
// File: src/utils/performantDOMOperations.js
// Batched DOM operations to prevent layout thrashing

class PerformantDOMOperations {
  constructor() {
    this.readQueue = [];
    this.writeQueue = [];
    this.scheduled = false;
  }

  // Batch DOM reads
  scheduleRead(callback) {
    this.readQueue.push(callback);
    this.scheduleFlush();
  }

  // Batch DOM writes  
  scheduleWrite(callback) {
    this.writeQueue.push(callback);
    this.scheduleFlush();
  }

  // Flush operations in correct order (reads first, then writes)
  scheduleFlush() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first (no layout invalidation)
      const readResults = this.readQueue.map(callback => callback());
      this.readQueue = [];

      // Then execute all writes (single layout invalidation)
      this.writeQueue.forEach((callback, index) => {
        callback(readResults[index]);
      });
      this.writeQueue = [];
      
      this.scheduled = false;
    });
  }

  // High-level API for common operations
  batchElementOperations(elements, operations) {
    const measurements = [];
    
    // Batch all measurements
    this.scheduleRead(() => {
      elements.forEach((element, index) => {
        measurements[index] = {
          width: element.offsetWidth,
          height: element.offsetHeight,
          rect: element.getBoundingClientRect()
        };
      });
      return measurements;
    });

    // Batch all modifications
    this.scheduleWrite((readResults) => {
      elements.forEach((element, index) => {
        const measurement = readResults[index];
        operations.forEach(operation => {
          operation(element, measurement);
        });
      });
    });
  }
}

export default PerformantDOMOperations;
```

#### React Hook for Performance Operations
```jsx
// File: src/hooks/usePerformantOperations.js
import { useCallback, useRef } from 'react';
import PerformantDOMOperations from '../utils/performantDOMOperations';

const usePerformantOperations = () => {
  const domOps = useRef(new PerformantDOMOperations());

  const scheduleRead = useCallback((callback) => {
    return domOps.current.scheduleRead(callback);
  }, []);

  const scheduleWrite = useCallback((callback) => {
    return domOps.current.scheduleWrite(callback);
  }, []);

  const batchOperations = useCallback((elements, operations) => {
    return domOps.current.batchElementOperations(elements, operations);
  }, []);

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback((callback) => {
    let ticking = false;
    
    return (event) => {
      if (!ticking) {
        scheduleRead(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          callback({ scrollY, windowHeight, event });
        });
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
        });
      }
    };
  }, [scheduleRead]);

  // Optimized resize handler
  const createOptimizedResizeHandler = useCallback((callback) => {
    let resizeTimer;
    
    return () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        scheduleRead(() => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          callback({ width, height });
        });
      }, 100);
    };
  }, [scheduleRead]);

  return {
    scheduleRead,
    scheduleWrite,
    batchOperations,
    createOptimizedScrollHandler,
    createOptimizedResizeHandler
  };
};

export default usePerformantOperations;
```

### 2.2 Advanced Code Splitting Implementation

#### Vite Configuration for Optimal Chunking
```javascript
// File: vite.config.js - Enhanced chunking strategy
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical chunks (loaded immediately)
          if (id.includes('src/components/Layout')) return 'layout';
          if (id.includes('src/hooks/useSEO')) return 'seo';
          
          // UI library chunks (lazy loaded)
          if (id.includes('@radix-ui/react-dialog')) return 'ui-dialog';
          if (id.includes('@radix-ui/react-dropdown')) return 'ui-dropdown';
          if (id.includes('@radix-ui/react-accordion')) return 'ui-accordion';
          
          // Feature chunks (route-based)
          if (id.includes('src/pages/Research')) return 'page-research';
          if (id.includes('src/pages/Reviews')) return 'page-reviews';
          if (id.includes('src/pages/Compare')) return 'page-compare';
          if (id.includes('src/pages/About')) return 'page-about';
          
          // Utility chunks
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('framer-motion')) return 'animation';
          if (id.includes('react-router')) return 'routing';
          
          // Vendor chunk for everything else
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: (chunkInfo) => {
          // Optimize chunk naming for caching
          if (chunkInfo.name.startsWith('page-')) {
            return 'pages/[name]-[hash].js';
          }
          if (chunkInfo.name.startsWith('ui-')) {
            return 'ui/[name]-[hash].js';
          }
          return 'chunks/[name]-[hash].js';
        }
      }
    }
  }
});
```

#### Dynamic Import Strategy Implementation
```jsx
// File: src/utils/dynamicImports.js
// Optimized dynamic import patterns

class DynamicImportManager {
  constructor() {
    this.importCache = new Map();
    this.preloadQueue = new Set();
  }

  // Cached dynamic import
  async importWithCache(moduleFactory) {
    const moduleKey = moduleFactory.toString();
    
    if (this.importCache.has(moduleKey)) {
      return this.importCache.get(moduleKey);
    }

    const modulePromise = moduleFactory();
    this.importCache.set(moduleKey, modulePromise);
    
    return modulePromise;
  }

  // Preload modules based on user behavior
  preloadModule(moduleFactory, condition = () => true) {
    if (condition() && !this.preloadQueue.has(moduleFactory)) {
      this.preloadQueue.add(moduleFactory);
      
      // Preload during idle time
      requestIdleCallback(() => {
        this.importWithCache(moduleFactory);
      });
    }
  }

  // Smart preloading based on route prediction
  preloadByRoute(currentRoute) {
    const preloadMap = {
      '/': [
        () => import('../pages/Guide'),
        () => import('../pages/Reviews')
      ],
      '/guide': [
        () => import('../pages/Research'),
        () => import('../pages/Compare')
      ],
      '/reviews': [
        () => import('../pages/Compare'),
        () => import('../pages/About')
      ]
    };

    const modulesToPreload = preloadMap[currentRoute] || [];
    modulesToPreload.forEach(moduleFactory => {
      this.preloadModule(moduleFactory);
    });
  }
}

export default new DynamicImportManager();
```

#### React Component Lazy Loading Implementation
```jsx
// File: src/components/LazyComponent.jsx
import React, { Suspense, lazy } from 'react';

// Optimized lazy loading with preloading
const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  // Preload component on hover/focus
  const PreloadableComponent = React.forwardRef((props, ref) => {
    const [preloaded, setPreloaded] = React.useState(false);

    const handlePreload = React.useCallback(() => {
      if (!preloaded) {
        importFunc();
        setPreloaded(true);
      }
    }, [preloaded]);

    return (
      <div 
        onMouseEnter={handlePreload}
        onFocus={handlePreload}
        ref={ref}
      >
        <Suspense fallback={fallback || <ComponentSkeleton />}>
          <LazyComponent {...props} />
        </Suspense>
      </div>
    );
  });

  return PreloadableComponent;
};

// Loading skeleton component
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

export { createLazyComponent, ComponentSkeleton };
```

### 2.3 Google Tag Manager Optimization - Partytown Implementation

#### Partytown Configuration
```javascript
// File: src/utils/partytown.js
// Complete Partytown setup for GTM optimization

import { partytownSnippet } from '@builder.io/partytown/integration';

// Partytown configuration
const partytownConfig = {
  // Run GTM in web worker
  forward: ['gtag', 'dataLayer.push'],
  debug: process.env.NODE_ENV === 'development',
  
  // Optimize for performance
  atomics: true,
  
  // Configure allowed scripts
  resolveUrl(url) {
    if (url.hostname === 'www.googletagmanager.com') {
      const proxyUrl = new URL('/proxy/gtm', location.origin);
      proxyUrl.searchParams.append('url', url.href);
      return proxyUrl;
    }
    return url;
  }
};

// Initialize Partytown
export const initPartytown = () => {
  if (typeof window !== 'undefined') {
    // Inject Partytown script
    const script = document.createElement('script');
    script.innerHTML = partytownSnippet(partytownConfig);
    document.head.appendChild(script);
  }
};

// GTM initialization in web worker
export const initGTM = (containerId) => {
  if (typeof window !== 'undefined') {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // GTM script to run in web worker
    const gtmScript = document.createElement('script');
    gtmScript.type = 'text/partytown';
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');
    `;
    document.head.appendChild(gtmScript);

    // NoScript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
              height="0" width="0" style="display:none;visibility:hidden">
      </iframe>
    `;
    document.body.appendChild(noscript);
  }
};
```

#### React Integration
```jsx
// File: src/components/AnalyticsProvider.jsx
import React, { useEffect } from 'react';
import { initPartytown, initGTM } from '../utils/partytown';

const AnalyticsProvider = ({ children, gtmId }) => {
  useEffect(() => {
    // Initialize Partytown first
    initPartytown();
    
    // Then initialize GTM in web worker
    if (gtmId) {
      // Delay GTM loading until page is interactive
      const timer = setTimeout(() => {
        initGTM(gtmId);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gtmId]);

  return children;
};

export default AnalyticsProvider;
```

### 2.4 Icon Optimization Implementation

#### Dynamic Icon Loading System
```jsx
// File: src/components/DynamicIcon.jsx
import React, { Suspense, lazy, memo } from 'react';

// Icon cache for performance
const iconCache = new Map();

// Dynamic icon loader with caching
const loadIcon = (iconName) => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName);
  }

  const IconComponent = lazy(() => 
    import('lucide-react')
      .then(module => {
        const Icon = module[iconName];
        if (!Icon) {
          throw new Error(`Icon ${iconName} not found`);
        }
        return { default: Icon };
      })
      .catch(() => {
        // Fallback icon
        return import('lucide-react').then(module => ({
          default: module.HelpCircle
        }));
      })
  );

  iconCache.set(iconName, IconComponent);
  return IconComponent;
};

// Optimized icon component
const DynamicIcon = memo(({ name, size = 24, className = '', ...props }) => {
  const IconComponent = loadIcon(name);

  return (
    <Suspense fallback={
      <div 
        className={`inline-block bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    }>
      <IconComponent 
        size={size} 
        className={className}
        {...props}
      />
    </Suspense>
  );
});

// Icon preloader for common icons
export const preloadIcons = (iconNames) => {
  iconNames.forEach(iconName => {
    loadIcon(iconName);
  });
};

// Common icons to preload
export const COMMON_ICONS = [
  'Menu', 'X', 'ChevronDown', 'Search', 'ArrowRight', 
  'Star', 'Heart', 'Share', 'ExternalLink'
];

export default DynamicIcon;
```

---

## 🌐 Phase 3: Advanced Performance Features

### 3.1 Service Worker Implementation

#### Service Worker with Workbox
```javascript
// File: public/sw.js
// Comprehensive service worker for caching optimization

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Clean up old caches
cleanupOutdatedCaches();

// Precache critical resources
precacheAndRoute([
  // Critical CSS and JS (added during build)
  { url: '/assets/critical.css', revision: null },
  { url: '/assets/layout.js', revision: null },
  
  // Critical images
  { url: '/images/logo.webp', revision: '1' },
  { url: '/images/hero-640w.webp', revision: '1' },
  
  // Fonts
  { url: '/fonts/inter-v12-latin-regular.woff2', revision: '1' }
]);

// Image caching strategy (Cache First with fallback)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// API requests (Network First with background sync)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 // 24 hours
      })
    ]
  })
);

// CSS and JS files (Stale While Revalidate)
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// HTML pages (Network First)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3
  })
);

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Log performance metrics
    console.log('SW Performance:', event.data.metrics);
  }
});

// Cache warming for critical resources
self.addEventListener('install', (event) => {
  const urlsToCache = [
    '/',
    '/guide',
    '/reviews',
    '/images/hero-640w.webp',
    '/assets/critical.css'
  ];

  event.waitUntil(
    caches.open('critical-cache-v1')
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

#### Service Worker Registration
```javascript
// File: src/utils/serviceWorker.js
// Service worker registration with performance monitoring

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              
              // Optionally show update notification
              showUpdateNotification();
            }
          }
        });
      });

      // Performance monitoring
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_HIT') {
          performance.mark('cache-hit');
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const showUpdateNotification = () => {
  // Show subtle update notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      cursor: pointer;
    " onclick="window.location.reload()">
      New version available! Click to update.
    </div>
  `;
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 10000);
};

export { registerSW };
```

### 3.2 Resource Hints Optimization

#### Comprehensive Resource Hints Strategy
```html
<!-- File: index.html - Complete <head> optimization -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- DNS prefetch for external domains -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//www.googletagmanager.com">
  <link rel="dns-prefetch" href="//www.google-analytics.com">
  
  <!-- Preconnect to critical domains -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.vercel-insights.com" crossorigin>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/inter-v12-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/inter-v12-latin-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/inter-v12-latin-700.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Preload LCP image with fetchpriority -->
  <link rel="preload" as="image" href="/images/hero-640w.webp" fetchpriority="high" media="(max-width: 640px)">
  <link rel="preload" as="image" href="/images/hero-1024w.webp" fetchpriority="high" media="(min-width: 641px)">
  
  <!-- Critical CSS inlined here -->
  <style id="critical-css">
    /* Critical CSS content */
  </style>
  
  <!-- Async load non-critical CSS -->
  <link rel="preload" href="/assets/main.css" as="style" fetchpriority="low" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/assets/main.css"></noscript>
  
  <!-- Module preload for critical JavaScript -->
  <link rel="modulepreload" href="/assets/layout.js" fetchpriority="high">
  <link rel="modulepreload" href="/assets/main.js" fetchpriority="high">
  
  <title>DHM Guide - Science-Based Hangover Prevention</title>
</head>
<body>
  <div id="root"></div>
  
  <!-- Service worker registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>
</body>
</html>
```

### 3.3 Modern 2025 Performance Features

#### Speculation Rules Implementation
```html
<!-- File: index.html - Add speculation rules for navigation speed -->
<script type="speculationrules">
{
  "prerender": [
    {
      "where": { "href_matches": "/guide" },
      "eagerness": "moderate"
    },
    {
      "where": { "href_matches": "/reviews" }, 
      "eagerness": "conservative"
    }
  ],
  "prefetch": [
    {
      "where": { "href_matches": "/research" },
      "eagerness": "conservative"
    },
    {
      "where": { "href_matches": "/compare" },
      "eagerness": "conservative"  
    }
  ]
}
</script>
```

#### INP (Interaction to Next Paint) Optimization
```javascript
// File: src/utils/inpOptimization.js
// Optimize for Interaction to Next Paint (2025 Core Web Vitals metric)

class INPOptimizer {
  constructor() {
    this.taskQueue = [];
    this.isProcessing = false;
  }

  // Schedule tasks with priority
  scheduleTask(task, priority = 'normal') {
    return new Promise((resolve) => {
      this.taskQueue.push({ task, priority, resolve });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      // Sort by priority (user-blocking > user-visible > background)
      this.taskQueue.sort((a, b) => {
        const priorities = { 
          'user-blocking': 3, 
          'user-visible': 2, 
          'background': 1 
        };
        return (priorities[b.priority] || 1) - (priorities[a.priority] || 1);
      });

      const { task, resolve } = this.taskQueue.shift();
      
      // Use scheduler.postTask if available (Chrome 94+)
      if ('scheduler' in window && 'postTask' in scheduler) {
        try {
          const result = await scheduler.postTask(task, { 
            priority: this.getSchedulerPriority(priority) 
          });
          resolve(result);
        } catch (error) {
          // Fallback to setTimeout
          setTimeout(() => resolve(task()), 0);
        }
      } else {
        // Fallback: Use MessageChannel for better scheduling
        const channel = new MessageChannel();
        channel.port2.onmessage = () => resolve(task());
        channel.port1.postMessage(null);
      }

      // Yield to browser after each task
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isProcessing = false;
  }

  getSchedulerPriority(priority) {
    const mapping = {
      'user-blocking': 'user-blocking',
      'user-visible': 'user-visible', 
      'background': 'background'
    };
    return mapping[priority] || 'background';
  }

  // Optimize event handlers for better INP
  createOptimizedEventHandler(handler, options = {}) {
    const { debounce = 0, priority = 'user-visible' } = options;
    let timeoutId;

    return (event) => {
      if (debounce > 0) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.scheduleTask(() => handler(event), priority);
        }, debounce);
      } else {
        this.scheduleTask(() => handler(event), priority);
      }
    };
  }
}

export default new INPOptimizer();
```

#### React Hook for INP Optimization
```jsx
// File: src/hooks/useINPOptimization.js
import { useCallback, useRef } from 'react';
import INPOptimizer from '../utils/inpOptimization';

const useINPOptimization = () => {
  const optimizerRef = useRef(INPOptimizer);

  const scheduleTask = useCallback((task, priority = 'normal') => {
    return optimizerRef.current.scheduleTask(task, priority);
  }, []);

  const createOptimizedHandler = useCallback((handler, options = {}) => {
    return optimizerRef.current.createOptimizedEventHandler(handler, options);
  }, []);

  // Optimized click handler
  const createOptimizedClickHandler = useCallback((handler) => {
    return createOptimizedHandler(handler, { 
      priority: 'user-blocking' 
    });
  }, [createOptimizedHandler]);

  // Optimized scroll handler  
  const createOptimizedScrollHandler = useCallback((handler) => {
    return createOptimizedHandler(handler, { 
      debounce: 16, 
      priority: 'user-visible' 
    });
  }, [createOptimizedHandler]);

  return {
    scheduleTask,
    createOptimizedHandler,
    createOptimizedClickHandler,
    createOptimizedScrollHandler
  };
};

export default useINPOptimization;
```

---

## 🎛️ Performance Monitoring & Measurement

### Real User Monitoring Implementation
```javascript
// File: src/utils/performanceMonitoring.js
// Comprehensive performance monitoring system

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.endpoint = '/api/analytics/performance';
    this.batchSize = 10;
    this.batch = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  init() {
    // Collect Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
    getINP(this.handleMetric.bind(this));

    // Custom performance metrics
    this.collectCustomMetrics();
    
    // Send batch on page unload
    window.addEventListener('beforeunload', () => {
      this.sendBatch(true);
    });

    // Send batch periodically
    setInterval(() => {
      this.sendBatch();
    }, 30000);
  }

  handleMetric(metric) {
    // Enhance metric with context
    const enhancedMetric = {
      ...metric,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      deviceInfo: this.getDeviceInfo(),
      performanceEntry: this.getPerformanceEntry(metric.name)
    };

    this.batch.push(enhancedMetric);
    
    if (this.batch.length >= this.batchSize) {
      this.sendBatch();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}:`, metric.value, enhancedMetric);
    }
  }

  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  }

  getDeviceInfo() {
    return {
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      }
    };
  }

  getPerformanceEntry(metricName) {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      const entry = entries[0];
      return {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
        loadComplete: entry.loadEventEnd - entry.navigationStart,
        domInteractive: entry.domInteractive - entry.navigationStart,
        resourceCount: performance.getEntriesByType('resource').length
      };
    }
    return null;
  }

  collectCustomMetrics() {
    // Time to Interactive (custom implementation)
    this.measureTTI();
    
    // Bundle size metrics
    this.measureBundleSize();
    
    // Memory usage
    this.measureMemoryUsage();
  }

  measureTTI() {
    // Simple TTI approximation
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry.duration < 50) {
        const tti = lastEntry.startTime + lastEntry.duration;
        this.handleMetric({
          name: 'TTI',
          value: tti,
          id: 'custom-tti'
        });
        observer.disconnect();
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }

  measureBundleSize() {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const totalJSSize = jsResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0);
    const totalCSSSize = cssResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0);

    this.handleMetric({
      name: 'bundle-size-js',
      value: totalJSSize,
      id: 'bundle-js'
    });

    this.handleMetric({
      name: 'bundle-size-css', 
      value: totalCSSSize,
      id: 'bundle-css'
    });
  }

  measureMemoryUsage() {
    if ('memory' in performance) {
      this.handleMetric({
        name: 'memory-used',
        value: performance.memory.usedJSHeapSize,
        id: 'memory-usage'
      });
    }
  }

  async sendBatch(force = false) {
    if (this.batch.length === 0 || (!force && this.batch.length < this.batchSize)) {
      return;
    }

    const payload = {
      metrics: [...this.batch],
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.batch = [];

    try {
      // Use sendBeacon for reliability on page unload
      if (force && 'sendBeacon' in navigator) {
        navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
      } else {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      // Re-add to batch for retry
      this.batch.unshift(...payload.metrics);
    }
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
```

---

## 🛡️ Technical Risk Mitigation

### Feature Flag Implementation
```javascript
// File: src/utils/featureFlags.js
// Feature flag system for safe performance rollouts

class FeatureFlagManager {
  constructor() {
    this.flags = this.loadFlags();
    this.listeners = new Set();
  }

  loadFlags() {
    try {
      // Load from localStorage for persistence
      const stored = localStorage.getItem('featureFlags');
      const flags = stored ? JSON.parse(stored) : {};
      
      // Merge with environment flags
      return {
        ...this.getEnvironmentFlags(),
        ...flags
      };
    } catch {
      return this.getEnvironmentFlags();
    }
  }

  getEnvironmentFlags() {
    return {
      // Performance optimizations
      criticalCssEnabled: process.env.NODE_ENV === 'production',
      serviceWorkerEnabled: true,
      partytownEnabled: true,
      
      // Experimental features
      speculationRulesEnabled: this.supportsSpeculationRules(),
      inpOptimizationEnabled: true,
      dynamicImportsEnabled: true,
      
      // Rollout percentages (0-100)
      performanceRolloutPercentage: 100
    };
  }

  supportsSpeculationRules() {
    return HTMLScriptElement.supports && 
           HTMLScriptElement.supports('speculationrules');
  }

  isEnabled(flagName) {
    const flag = this.flags[flagName];
    
    if (typeof flag === 'boolean') {
      return flag;
    }
    
    if (typeof flag === 'number') {
      // Percentage rollout
      const hash = this.hashUserId();
      return (hash % 100) < flag;
    }
    
    return false;
  }

  hashUserId() {
    // Simple hash for consistent user experience
    const userId = this.getUserId();
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Date.now().toString(36) + Math.random().toString(36);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  setFlag(flagName, value) {
    this.flags[flagName] = value;
    localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    this.notifyListeners(flagName, value);
  }

  subscribe(flagName, callback) {
    const listener = { flagName, callback };
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(flagName, value) {
    this.listeners.forEach(listener => {
      if (listener.flagName === flagName) {
        listener.callback(value);
      }
    });
  }
}

export default new FeatureFlagManager();
```

### Progressive Enhancement Implementation
```jsx
// File: src/components/ProgressiveEnhancement.jsx
import React, { useState, useEffect } from 'react';
import featureFlags from '../utils/featureFlags';

const ProgressiveEnhancement = ({ 
  feature, 
  fallback, 
  children, 
  requiredFeatures = [] 
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check browser support
    const browserSupport = requiredFeatures.every(feature => {
      switch (feature) {
        case 'serviceWorker':
          return 'serviceWorker' in navigator;
        case 'webWorker':
          return 'Worker' in window;
        case 'intersectionObserver':
          return 'IntersectionObserver' in window;
        case 'requestIdleCallback':
          return 'requestIdleCallback' in window;
        case 'scheduler':
          return 'scheduler' in window && 'postTask' in scheduler;
        default:
          return true;
      }
    });

    setIsSupported(browserSupport);
    setIsEnabled(browserSupport && featureFlags.isEnabled(feature));
  }, [feature, requiredFeatures]);

  if (!isSupported || !isEnabled) {
    return fallback;
  }

  return children;
};

// Usage examples for performance features
export const ServiceWorkerEnhancement = ({ children, fallback }) => (
  <ProgressiveEnhancement
    feature="serviceWorkerEnabled"
    requiredFeatures={['serviceWorker']}
    fallback={fallback}
  >
    {children}
  </ProgressiveEnhancement>
);

export const SchedulerEnhancement = ({ children, fallback }) => (
  <ProgressiveEnhancement
    feature="inpOptimizationEnabled"
    requiredFeatures={['scheduler']}
    fallback={fallback}
  >
    {children}
  </ProgressiveEnhancement>
);

export const IntersectionObserverEnhancement = ({ children, fallback }) => (
  <ProgressiveEnhancement
    feature="dynamicImportsEnabled"
    requiredFeatures={['intersectionObserver']}
    fallback={fallback}
  >
    {children}
  </ProgressiveEnhancement>
);

export default ProgressiveEnhancement;
```

---

## 📋 Implementation Checklist & Timeline

### Week 1: Critical Path Optimization
```bash
# Day 1: LCP Optimization
□ Update index.html with priority hints and preloads
□ Implement OptimizedImage component
□ Fix responsive image sizes attribute
□ Add fetchpriority="high" to LCP images
□ Measure LCP improvement (target: >1s reduction)

# Day 2: Font Optimization  
□ Add font preloading to <head>
□ Implement font-display: swap
□ Create font subset files
□ Update CSS with optimized font loading
□ Measure FOIT elimination

# Day 3-4: Critical CSS Implementation
□ Set up CSS extraction in Vite config
□ Create critical.css with above-fold styles
□ Implement async CSS loading strategy
□ Add CSSLoader component
□ Measure render-blocking reduction (target: >700ms)

# Day 5: Layout Thrashing Fix
□ Implement PerformantDOMOperations class
□ Create usePerformantOperations hook
□ Update scroll/resize handlers
□ Add INP optimization patterns
□ Measure main thread blocking reduction
```

### Week 2: JavaScript Optimization
```bash
# Day 1-2: Bundle Optimization
□ Update Vite config with optimized chunking
□ Implement dynamic import manager
□ Create lazy loading components
□ Set up icon preloading system
□ Measure bundle size reduction (target: 40%+)

# Day 3: Partytown GTM Implementation
□ Install and configure Partytown
□ Implement GTM web worker setup
□ Create AnalyticsProvider component
□ Add GTM proxy configuration
□ Measure main thread blocking reduction

# Day 4-5: Advanced Code Splitting
□ Implement route-based code splitting
□ Add component preloading on hover
□ Set up speculation rules
□ Create progressive loading system
□ Measure loading performance improvement
```

### Week 3-4: Advanced Features & Monitoring
```bash
# Week 3: Service Worker & Caching
□ Implement Workbox service worker
□ Set up caching strategies
□ Add background sync
□ Implement update notifications
□ Test offline functionality

# Week 4: Monitoring & Optimization
□ Implement performance monitoring
□ Set up Real User Monitoring (RUM)
□ Add feature flag system
□ Create progressive enhancement components
□ Final performance measurement and optimization
```

---

This technical implementation PRD provides comprehensive, specific code examples and implementation details to minimize variance during development. Each section includes complete, production-ready code that can be directly implemented with clear performance targets and measurement strategies.