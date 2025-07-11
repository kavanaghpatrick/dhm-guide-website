import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Responsive image widths
const WIDTHS = [640, 768, 1024, 1536];
const QUALITY = 85;

// Specific images mentioned in PageSpeed report
const TARGET_IMAGES = [
  'images/before-after-dhm-1536w.webp',
  'assets/02_liver_*.webp',
  'assets/04_gaba_*.webp',
  'assets/05_traditional_heritage-*.webp'
];

console.log('🚀 Generating responsive images...\n');

async function ensureDirectory(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateResponsiveImage(imagePath, outputDir) {
  const fileName = path.basename(imagePath);
  const nameWithoutExt = fileName.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  const ext = path.extname(fileName);
  
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    console.log(`Processing ${fileName} (${metadata.width}x${metadata.height})...`);
    
    const results = [];
    
    for (const width of WIDTHS) {
      // Skip if the original is smaller than target width
      if (metadata.width < width) continue;
      
      const outputFileName = `${nameWithoutExt}-${width}w${ext}`;
      const outputPath = path.join(outputDir, outputFileName);
      
      await image
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: QUALITY })
        .toFile(outputPath);
      
      const size = (await fs.stat(outputPath)).size;
      results.push({ width, path: outputPath, size });
      console.log(`  ✅ Generated ${width}w version (${(size / 1024).toFixed(1)}KB)`);
    }
    
    return results;
  } catch (error) {
    console.error(`  ❌ Error processing ${fileName}:`, error.message);
    return [];
  }
}

async function findTargetImages() {
  const images = [];
  
  // Check images directory
  try {
    const files = await fs.readdir(IMAGES_DIR);
    for (const file of files) {
      if (file.includes('before-after-dhm') && file.endsWith('.webp')) {
        images.push(path.join(IMAGES_DIR, file));
      }
    }
  } catch (error) {
    console.log('Images directory not found');
  }
  
  // Check assets directory
  try {
    const files = await fs.readdir(ASSETS_DIR);
    for (const file of files) {
      if ((file.includes('02_liver') || file.includes('04_gaba') || file.includes('05_traditional_heritage')) 
          && file.endsWith('.webp')) {
        images.push(path.join(ASSETS_DIR, file));
      }
    }
  } catch (error) {
    console.log('Assets directory not found');
  }
  
  return images;
}

async function updateImageComponent() {
  const componentPath = path.join(__dirname, '..', 'src', 'components', 'ResponsiveImage.jsx');
  
  const componentContent = `import React from 'react';

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
    const basePath = imagePath.replace(/(-\\d+w)?\\.webp$/, '');
    return [640, 768, 1024, 1536]
      .map(w => \`\${basePath}-\${w}w.webp \${w}w\`)
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
`;

  await ensureDirectory(path.dirname(componentPath));
  await fs.writeFile(componentPath, componentContent);
  console.log('✅ Created ResponsiveImage component');
}

async function updateLazyLoadComponent() {
  const componentPath = path.join(__dirname, '..', 'src', 'components', 'LazyImage.jsx');
  
  const componentContent = `import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = 'blur',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div 
      ref={imgRef}
      className={\`relative \${className}\`}
      style={{ backgroundColor: isLoaded ? 'transparent' : '#f3f4f6' }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={\`transition-opacity duration-300 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
`;

  await ensureDirectory(path.dirname(componentPath));
  await fs.writeFile(componentPath, componentContent);
  console.log('✅ Created LazyImage component');
}

async function main() {
  try {
    // Ensure directories exist
    await ensureDirectory(IMAGES_DIR);
    await ensureDirectory(ASSETS_DIR);
    
    // Find target images
    console.log('🔍 Finding target images...');
    const images = await findTargetImages();
    console.log(`Found ${images.length} images to process\n`);
    
    // Generate responsive versions
    for (const imagePath of images) {
      const outputDir = path.dirname(imagePath);
      await generateResponsiveImage(imagePath, outputDir);
      console.log('');
    }
    
    // Create React components
    console.log('\n📝 Creating React components...');
    await updateImageComponent();
    await updateLazyLoadComponent();
    
    console.log('\n🎉 Responsive image generation complete!');
    console.log('\nNext steps:');
    console.log('1. Import and use ResponsiveImage component for critical images');
    console.log('2. Use LazyImage component for below-the-fold images');
    console.log('3. Update image references in your components');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();