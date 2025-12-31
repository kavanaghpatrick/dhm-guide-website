import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({
  src,
  alt,
  className = '',
  aspectRatio = '16/9', // Default aspect ratio to prevent CLS
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = 'blur',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const currentElement = imgRef.current;
    
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current = observer;
    observer.observe(currentElement);

    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = (e) => {
    console.error('❌ Image failed to load:', src, e);
    setHasError(true);
    setIsLoaded(false);
  };

  // Show background until image is loaded OR we have an error
  const showBackground = !isLoaded && !hasError;

  return (
    <div
      ref={imgRef}
      className="relative w-full"
      style={{
        backgroundColor: showBackground ? '#f3f4f6' : 'transparent',
        aspectRatio: aspectRatio, // Use aspect-ratio instead of minHeight to prevent CLS
      }}
    >
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded z-10">
          InView: {isInView ? '✅' : '❌'} | Loaded: {isLoaded ? '✅' : '❌'} | Error: {hasError ? '❌' : '✅'}
        </div>
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image failed to load</div>
            <div className="text-xs mt-1 opacity-75">{src}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
