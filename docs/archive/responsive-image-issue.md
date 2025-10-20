# Responsive Image Issue Analysis

## Problem
PageSpeed Insights reports that an image at `/images/before-after-dhm-1536w.webp` (61.1 KiB) is being served when the displayed dimensions are only 380x253 pixels, resulting in 57.4 KiB of wasted bandwidth.

## Current Implementation
```html
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
    srcSet="/images/before-after-dhm-640w.webp 640w,
            /images/before-after-dhm-768w.webp 768w,
            /images/before-after-dhm-1024w.webp 1024w,
            /images/before-after-dhm-1536w.webp 1536w"
  />
  <img 
    src="/images/before-after-dhm-1536w.webp"
    alt="Before and After DHM"
    loading="eager"
    fetchPriority="high"
    width="1536"
    height="1024"
  />
</picture>
```

## Test Environment
- Device: Moto G Power emulation
- Viewport: 412x823
- Device Pixel Ratio: 2.625
- Displayed size: 380x253 CSS pixels

## Question
Why is the browser selecting the 1536w image instead of a smaller one?