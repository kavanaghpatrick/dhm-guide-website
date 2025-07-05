# Product Requirements Document: Performance Optimization - Data Management

## 1. Problem Statement

### Current State
Large product data arrays are embedded directly within React components (Compare.jsx and Reviews.jsx), creating several performance and maintainability issues:
- Initial JavaScript bundle includes all product data (~200KB+ of JSON)
- Components are difficult to read and maintain with 500+ lines of data
- No code splitting for data that could be lazy-loaded
- Memory usage increases with each component mount
- Build times are slower due to large component files
- No caching strategy for static product data
- Framer Motion animations on scroll in Layout.jsx may cause performance issues

### Impact
- **Performance**: Larger bundle size increases Time to Interactive (TTI)
- **User Experience**: Slower initial page loads, especially on mobile
- **Developer Experience**: Hard to find logic among data, slow hot reload
- **Maintainability**: Product updates require modifying component files
- **SEO**: Larger bundles negatively impact Core Web Vitals
- **Scalability**: Adding more products worsens all issues

## 2. Objectives

- Reduce initial JavaScript bundle size by 50%+
- Improve component readability and maintainability  
- Enable code splitting and lazy loading for product data
- Implement efficient caching strategies
- Optimize animation performance
- Improve build and development performance
- Create scalable architecture for future growth

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Data Separation
- Product data MUST be extracted from component files
- Data MUST be organized in a logical structure
- Components MUST remain functional during migration
- Data updates MUST not require component changes

#### FR2: Loading Strategy
- Critical data MUST be available immediately
- Non-critical data MUST be lazy-loaded
- Loading states MUST be implemented
- Failed loads MUST be handled gracefully

#### FR3: Caching Implementation  
- Static data MUST be cached effectively
- Cache MUST be invalidated when data updates
- Browser cache MUST be leveraged
- Memory usage MUST be optimized

#### FR4: Animation Optimization
- Scroll animations MUST maintain 60fps
- Animations MUST be GPU-accelerated
- Low-end devices MUST be considered
- Reduced motion preferences MUST be respected

### 3.2 Non-Functional Requirements

#### NFR1: Performance Targets
- Initial bundle size reduction of 50%
- TTI improvement of 30%
- 60fps scroll performance
- Memory usage < 50MB

#### NFR2: Developer Experience
- Hot reload time < 1 second
- Clear data structure documentation
- Easy product data updates
- Type safety maintained

#### NFR3: Scalability
- Support for 1000+ products
- Efficient search/filter operations
- Pagination support
- Progressive data loading

## 4. Technical Specification

### 4.1 Data Architecture

```
src/
  data/
    products/
      index.js         // Main export with lazy loading
      supplements.json // Core supplement data
      reviews.json     // Review data
      metadata.json    // Lightweight metadata
    schemas/
      product.schema.js // Data validation
    utils/
      dataLoader.js    // Loading utilities
```

### 4.2 Data Loading Implementation

```javascript
// data/products/index.js
export const productMetadata = {
  totalProducts: 24,
  categories: ['DHM', 'Hangover Pills', 'Liver Support'],
  brands: ['Flyby', 'Cheers', 'DHM Depot', ...]
};

// Lazy load full product data
export const loadProductData = async () => {
  const { default: products } = await import(
    /* webpackChunkName: "product-data" */
    './supplements.json'
  );
  return products;
};

// Load specific product
export const loadProduct = async (productId) => {
  const products = await loadProductData();
  return products.find(p => p.id === productId);
};

// Cached loader with memory management
class ProductCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  async get(key, loader) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const data = await loader();
    
    // LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, data);
    return data;
  }

  clear() {
    this.cache.clear();
  }
}

export const productCache = new ProductCache();
```

### 4.3 Component Refactoring

```jsx
// pages/Compare.jsx
import { useState, useEffect } from 'react';
import { loadProductData, productMetadata } from '@/data/products';

function Compare() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await loadProductData();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <ProductLoadingSkeleton count={productMetadata.totalProducts} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return <CompareTable products={products} />;
}
```

### 4.4 Animation Optimization

```jsx
// components/layout/Layout.jsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function Layout({ children }) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Optimize transform with will-change and GPU acceleration
  const headerOpacity = useTransform(
    scrollY,
    [0, 100],
    [0.95, 1],
    { clamp: true } // Prevent unnecessary calculations
  );

  return (
    <div>
      <motion.header
        style={{ 
          opacity: prefersReducedMotion ? 1 : headerOpacity,
          willChange: 'opacity'
        }}
        className="fixed top-0 left-0 right-0 z-header"
      >
        {/* Header content */}
      </motion.header>
      
      {children}
    </div>
  );
}
```

### 4.5 Build Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'product-data': ['./src/data/products/supplements.json'],
          'vendor-animation': ['framer-motion'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
        }
      }
    }
  },
  // Optimize JSON imports
  json: {
    stringify: true
  }
}
```

### 4.6 Progressive Loading Strategy

```jsx
// hooks/useProgressiveData.js
export const useProgressiveData = (loader, options = {}) => {
  const [data, setData] = useState(options.initialData || []);
  const [loading, setLoading] = useState(!options.initialData);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const newData = await loader(page, options.pageSize || 20);
      setData(prev => [...prev, ...newData]);
      setHasMore(newData.length === (options.pageSize || 20));
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, loader, options.pageSize]);

  return { data, loading, hasMore, loadMore };
};
```

## 5. Testing Requirements

### 5.1 Performance Testing
- Bundle size analysis before/after
- TTI measurements
- Memory profiling
- Animation frame rate testing

### 5.2 Load Testing
- Test with 1000+ products
- Concurrent user simulation
- Cache effectiveness metrics
- CDN performance testing

### 5.3 Error Handling
- Network failure scenarios
- Partial data loading
- Cache corruption handling
- Fallback UI testing

## 6. Migration Plan

### Phase 1: Data Extraction (Day 1-2)
1. Create data directory structure
2. Extract product data to JSON files
3. Create loading utilities
4. Test data integrity

### Phase 2: Component Updates (Day 3-4)
1. Update Compare.jsx to use data loader
2. Update Reviews.jsx to use data loader
3. Add loading states
4. Implement error handling

### Phase 3: Optimization (Day 5-6)
1. Implement caching layer
2. Add progressive loading
3. Optimize animations
4. Configure build chunking

### Phase 4: Testing & Deployment (Day 7)
1. Performance testing
2. Cross-browser testing
3. Staged rollout
4. Monitor metrics

## 7. Success Metrics

- Initial bundle size reduced by 50%+
- TTI improved by 30%+
- Build time reduced by 40%
- Hot reload time < 1 second
- 60fps scroll performance achieved
- Memory usage < 50MB
- Zero data-related errors in production

## 8. Monitoring & Alerts

- Bundle size tracking in CI/CD
- Performance budget alerts
- Error rate monitoring
- Cache hit rate tracking
- User timing API metrics
- Core Web Vitals monitoring

## 9. Future Enhancements

- GraphQL integration for dynamic queries
- Edge caching with Cloudflare Workers
- WebAssembly for data processing
- Service Worker caching
- Incremental Static Regeneration
- Real-time product updates via WebSocket

## 10. Documentation

### Developer Guide
- Data structure documentation
- Loading pattern examples
- Cache strategy explanation
- Performance best practices

### Operations Guide  
- Cache invalidation procedures
- Data update workflows
- Monitoring setup
- Troubleshooting guide