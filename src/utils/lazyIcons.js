import { lazy, Suspense } from 'react';

// Icon loading placeholder
const IconPlaceholder = () => (
  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
);

// Create lazy-loaded icon wrapper
export const createLazyIcon = (iconName) => {
  const LazyIcon = lazy(() => 
    import('lucide-react').then(module => ({
      default: module[iconName]
    }))
  );

  return (props) => (
    <Suspense fallback={<IconPlaceholder />}>
      <LazyIcon {...props} />
    </Suspense>
  );
};

// Pre-defined lazy icons for common use
export const LazyChevronDown = createLazyIcon('ChevronDown');
export const LazyBeaker = createLazyIcon('Beaker');
export const LazyShield = createLazyIcon('Shield');
export const LazyZap = createLazyIcon('Zap');
export const LazyStar = createLazyIcon('Star');
export const LazyArrowRight = createLazyIcon('ArrowRight');
export const LazyLeaf = createLazyIcon('Leaf');
export const LazyBrain = createLazyIcon('Brain');
export const LazyHeart = createLazyIcon('Heart');
export const LazyCheckCircle = createLazyIcon('CheckCircle');
export const LazyExternalLink = createLazyIcon('ExternalLink');
export const LazyAward = createLazyIcon('Award');