import React from 'react';

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loading = 'lazy',
  fetchpriority,
  sizes = '(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1536px'
}) => {
  // Generate srcSet based on the original image path
  const generateSrcSet = (imagePath) => {
    const basePath = imagePath.replace(/(-\d+w)?\.webp$/, '');
    return [640, 768, 1024, 1536]
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
