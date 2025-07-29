import React from 'react';

/**
 * Enhanced ResponsiveImage component that correctly handles both:
 * 1. Vite-processed imports (with content hashes)
 * 2. Public directory paths
 */
const ResponsiveImageFixed = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loading = 'lazy',
  fetchpriority,
  sizes = '(max-width: 380px) 380px, (max-width: 760px) 760px, 1536px',
  availableSizes = [380, 760, 1536],
  // New prop to explicitly disable srcSet for Vite imports
  disableSrcSet = false
}) => {
  // Check if this is a Vite-processed import (contains content hash)
  const isViteProcessedImport = (imagePath) => {
    // Vite-processed imports typically have pattern: filename-hash.ext
    const viteHashPattern = /-[a-zA-Z0-9]{8,}\.webp$/;
    return viteHashPattern.test(imagePath);
  };

  // Generate srcSet based on the original image path and available sizes
  const generateSrcSet = (imagePath) => {
    // If explicitly disabled or it's a Vite-processed import, don't generate srcSet
    if (disableSrcSet || isViteProcessedImport(imagePath)) {
      console.log('ResponsiveImage: Skipping srcSet generation for Vite-processed import:', imagePath);
      return undefined;
    }

    // For public directory paths, generate srcSet normally
    const basePath = imagePath.replace(/(-\d+w)?\.webp$/, '');
    const srcSet = availableSizes
      .map(w => `${basePath}-${w}w.webp ${w}w`)
      .join(', ');
    
    console.log('ResponsiveImage: Generated srcSet:', srcSet);
    return srcSet;
  };

  const srcSet = generateSrcSet(src);

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined} // Only include sizes if we have srcSet
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchpriority}
      onError={(e) => {
        console.error('ResponsiveImage: Failed to load image:', src, e);
      }}
      onLoad={() => {
        console.log('ResponsiveImage: Successfully loaded image:', src);
      }}
    />
  );
};

export default ResponsiveImageFixed;