import React from 'react'

/**
 * Responsive <picture> with webp source + original fallback.
 *
 * - If `src` ends in .webp, emits a single webp <source> + <img src={webp}>.
 *   (We don't synthesize a .png/.jpg fallback because those files don't exist
 *   on disk for our webp-native heroes — would 404 on browsers without webp,
 *   though all modern browsers support it.)
 * - If `src` ends in .png/.jpg/.jpeg, emits a webp <source> (assumed to exist
 *   alongside) + an original-format <source> + <img> fallback.
 *
 * Pass `width` and `height` to prevent CLS — browser uses them to compute
 * the layout box before the image loads.
 */
export default function Picture({
  src,
  alt,
  className,
  loading = "lazy",
  sizes,
  priority = false,
  width,
  height,
  ...props
}) {
  const loadingStrategy = priority ? "eager" : loading;
  const decoding = priority ? "sync" : "async";

  const isWebp = /\.webp$/i.test(src);
  const basePath = src.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  const originalExtMatch = src.match(/\.(png|jpg|jpeg)$/i);
  const originalExt = originalExtMatch?.[0];

  if (isWebp) {
    // Native webp: just one source + img, no synthetic fallback.
    return (
      <picture>
        <source srcSet={src} type="image/webp" sizes={sizes} />
        <img
          src={src}
          alt={alt}
          className={className}
          loading={loadingStrategy}
          decoding={decoding}
          sizes={sizes}
          width={width}
          height={height}
          {...props}
        />
      </picture>
    );
  }

  // PNG/JPG source: emit webp companion (if it exists on disk) + original.
  return (
    <picture>
      <source srcSet={`${basePath}.webp`} type="image/webp" sizes={sizes} />
      {originalExt && (
        <source
          srcSet={src}
          type={`image/${originalExt.slice(1).replace('jpg', 'jpeg')}`}
          sizes={sizes}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loadingStrategy}
        decoding={decoding}
        sizes={sizes}
        width={width}
        height={height}
        {...props}
      />
    </picture>
  );
}
