import React from 'react'

export default function Picture({ 
  src, 
  alt, 
  className, 
  loading = "lazy",
  sizes,
  priority = false,
  ...props 
}) {
  // Extract base path and extension
  const basePath = src.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const originalExt = src.match(/\.(png|jpg|jpeg)$/i)?.[0] || '.png';
  
  // Use eager loading for priority images
  const loadingStrategy = priority ? "eager" : loading;
  
  return (
    <picture>
      <source 
        srcSet={`${basePath}.webp`} 
        type="image/webp"
        sizes={sizes}
      />
      <source 
        srcSet={`${basePath}${originalExt}`} 
        type={`image/${originalExt.slice(1)}`}
        sizes={sizes}
      />
      <img 
        src={`${basePath}${originalExt}`} 
        alt={alt} 
        className={className}
        loading={loadingStrategy}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
}