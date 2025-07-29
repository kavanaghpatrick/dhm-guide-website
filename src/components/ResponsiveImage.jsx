import React from 'react';

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loading = 'lazy',
  fetchpriority,
  sizes = '(max-width: 380px) 380px, (max-width: 760px) 760px, 1536px',
  availableSizes = [380, 760, 1536] // Default to actual available sizes
}) => {
  // Generate srcSet based on the original image path and available sizes
  const generateSrcSet = (imagePath) => {
    const basePath = imagePath.replace(/(-\d+w)?\.webp$/, '');
    return availableSizes
      .map(w => `${basePath}-${w}w.webp ${w}w`)
      .join(', ');
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchpriority}
    />
  );
};

export default ResponsiveImage;
