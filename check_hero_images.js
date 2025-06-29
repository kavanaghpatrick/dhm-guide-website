#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Directories to check
const newBlogPostsDir = 'src/newblog/data/posts';
const oldBlogPostsFile = 'src/blog/data/posts.js';
const publicImagesDir = 'public/images';
const publicRootDir = 'public';

// Results storage
const results = {
  newBlogPosts: [],
  oldBlogPosts: [],
  missingImages: [],
  brokenPaths: [],
  needsImages: []
};

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Function to read JSON file safely
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to extract image path from various formats
function extractImagePath(imageField) {
  if (!imageField) return null;
  
  if (typeof imageField === 'string') {
    return imageField;
  }
  
  if (typeof imageField === 'object' && imageField.src) {
    return imageField.src;
  }
  
  return null;
}

// Function to resolve public path
function resolvePublicPath(imagePath) {
  if (!imagePath) return null;
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check if it starts with 'images/' or add it
  if (cleanPath.startsWith('images/')) {
    return path.join(publicRootDir, cleanPath);
  } else {
    // Try both with and without images/ prefix
    const withImagesPrefix = path.join(publicRootDir, 'images', cleanPath);
    const withoutImagesPrefix = path.join(publicRootDir, cleanPath);
    
    if (fileExists(withImagesPrefix)) {
      return withImagesPrefix;
    } else if (fileExists(withoutImagesPrefix)) {
      return withoutImagesPrefix;
    }
  }
  
  return path.join(publicRootDir, cleanPath);
}

// Check new blog posts
console.log('Checking new blog posts...');
const newBlogFiles = fs.readdirSync(newBlogPostsDir)
  .filter(file => file.endsWith('.json') && file !== 'index.js');

for (const file of newBlogFiles) {
  const filePath = path.join(newBlogPostsDir, file);
  const post = readJsonFile(filePath);
  
  if (!post) continue;
  
  const imagePath = extractImagePath(post.image);
  const publicPath = resolvePublicPath(imagePath);
  const imageExists = publicPath && fileExists(publicPath);
  
  const postInfo = {
    slug: post.slug || post.id || file.replace('.json', ''),
    title: post.title || 'No title',
    imagePath: imagePath,
    publicPath: publicPath,
    imageExists: imageExists,
    excerpt: post.excerpt || post.description || 'No description',
    filePath: filePath
  };
  
  results.newBlogPosts.push(postInfo);
  
  if (!imagePath) {
    results.needsImages.push({
      ...postInfo,
      reason: 'No image field'
    });
  } else if (!imageExists) {
    results.missingImages.push({
      ...postInfo,
      reason: 'Image file not found'
    });
  }
}

// Check old blog posts
console.log('Checking old blog posts...');
try {
  const oldBlogContent = fs.readFileSync(oldBlogPostsFile, 'utf8');
  
  // Extract posts array from the JS file
  const postsMatch = oldBlogContent.match(/export const posts = \[([\s\S]*?)\];/);
  if (postsMatch) {
    // This is a simplified extraction - in a real scenario, you might want to use a proper JS parser
    const postsString = postsMatch[1];
    
    // Find individual post objects
    const postMatches = postsString.match(/\{[\s\S]*?\}/g);
    
    if (postMatches) {
      for (const postMatch of postMatches.slice(0, 10)) { // Check first 10 posts as sample
        try {
          // Extract basic information using regex
          const idMatch = postMatch.match(/id:\s*['"]([^'"]+)['"]/);
          const titleMatch = postMatch.match(/title:\s*['"]([^'"]+)['"]/);
          const imageMatch = postMatch.match(/image:\s*['"]([^'"]+)['"]/);
          const excerptMatch = postMatch.match(/excerpt:\s*['"]([^'"]+)['"]/);
          
          if (idMatch && titleMatch) {
            const imagePath = imageMatch ? imageMatch[1] : null;
            const publicPath = resolvePublicPath(imagePath);
            const imageExists = publicPath && fileExists(publicPath);
            
            const postInfo = {
              slug: idMatch[1],
              title: titleMatch[1],
              imagePath: imagePath,
              publicPath: publicPath,
              imageExists: imageExists,
              excerpt: excerptMatch ? excerptMatch[1] : 'No excerpt available',
              filePath: oldBlogPostsFile
            };
            
            results.oldBlogPosts.push(postInfo);
            
            if (!imagePath) {
              results.needsImages.push({
                ...postInfo,
                reason: 'No image field'
              });
            } else if (!imageExists) {
              results.missingImages.push({
                ...postInfo,
                reason: 'Image file not found'
              });
            }
          }
        } catch (error) {
          console.error('Error parsing post:', error.message);
        }
      }
    }
  }
} catch (error) {
  console.error('Error reading old blog posts:', error.message);
}

// Generate report
console.log('\n=== HERO IMAGE ANALYSIS REPORT ===\n');

console.log(`Total new blog posts: ${results.newBlogPosts.length}`);
console.log(`Total old blog posts checked: ${results.oldBlogPosts.length}`);
console.log(`Posts needing images: ${results.needsImages.length}`);
console.log(`Posts with missing image files: ${results.missingImages.length}`);

if (results.needsImages.length > 0) {
  console.log('\n=== POSTS NEEDING HERO IMAGES ===\n');
  
  results.needsImages.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Reason: ${post.reason}`);
    console.log(`   Current image path: ${post.imagePath || 'None'}`);
    console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...`);
    console.log('   ---');
    console.log('');
  });
}

if (results.missingImages.length > 0) {
  console.log('\n=== POSTS WITH MISSING IMAGE FILES ===\n');
  
  results.missingImages.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Image path: ${post.imagePath}`);
    console.log(`   Expected file: ${post.publicPath}`);
    console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...`);
    console.log('   ---');
    console.log('');
  });
}

// Save detailed results to JSON file
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    totalNewPosts: results.newBlogPosts.length,
    totalOldPosts: results.oldBlogPosts.length,
    needsImages: results.needsImages.length,
    missingImages: results.missingImages.length
  },
  postsNeedingImages: results.needsImages,
  postsWithMissingImages: results.missingImages,
  allNewPosts: results.newBlogPosts,
  allOldPosts: results.oldBlogPosts
};

fs.writeFileSync('hero_image_report.json', JSON.stringify(reportData, null, 2));
console.log('\nDetailed report saved to: hero_image_report.json');