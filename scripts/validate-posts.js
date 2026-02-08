#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates all blog posts for content quality and completeness
 * Prevents empty or thin content from being published
 */

const POSTS_DIR = path.join(__dirname, '../src/newblog/data/posts');
const MIN_CONTENT_LENGTH = 500; // Minimum characters required
const MIN_WORD_COUNT = 100; // Minimum word count

function validateAllPosts() {
  console.log('🔍 Validating blog posts...\n');
  
  const errors = [];
  const warnings = [];
  let totalPosts = 0;
  let validPosts = 0;
  
  // Read all JSON files in posts directory
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.json'));
  
  files.forEach(file => {
    totalPosts++;
    const filePath = path.join(POSTS_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const issues = validatePost(content, file);
      
      if (issues.errors.length > 0) {
        errors.push({ file, errors: issues.errors });
      } else {
        validPosts++;
      }
      
      if (issues.warnings.length > 0) {
        warnings.push({ file, warnings: issues.warnings });
      }
    } catch (e) {
      errors.push({ 
        file, 
        errors: [`Failed to parse JSON: ${e.message}`] 
      });
    }
  });
  
  // Report results
  console.log(`📊 Validation Results:`);
  console.log(`   Total posts: ${totalPosts}`);
  console.log(`   Valid posts: ${validPosts}`);
  console.log(`   Posts with errors: ${errors.length}`);
  console.log(`   Posts with warnings: ${warnings.length}\n`);
  
  // Display errors
  if (errors.length > 0) {
    console.error('❌ ERRORS (must be fixed):\n');
    errors.forEach(({ file, errors }) => {
      console.error(`  📄 ${file}:`);
      errors.forEach(error => console.error(`     - ${error}`));
    });
    console.error('');
  }
  
  // Display warnings
  if (warnings.length > 0) {
    console.warn('⚠️  WARNINGS (should be reviewed):\n');
    warnings.forEach(({ file, warnings }) => {
      console.warn(`  📄 ${file}:`);
      warnings.forEach(warning => console.warn(`     - ${warning}`));
    });
    console.warn('');
  }
  
  // Check for critical errors (empty content)
  const criticalErrors = errors.filter(e => 
    e.errors.some(err => err.includes('Content field is empty'))
  );
  
  // Exit with error code if validation failed
  if (errors.length > 0) {
    console.error('❌ Validation failed. See errors above.');
    process.exit(1);
  }

  if (criticalErrors.length > 0) {
    console.error('❌ CRITICAL: Post validation failed! Empty content detected.\n');
    console.error('The following posts have no content and will cause SEO penalties:\n');
    criticalErrors.forEach(({ file }) => {
      console.error(`  - ${file}`);
    });
    console.error('\nPlease add content to these posts or remove them from the site.\n');
  } else if (warnings.length > 0) {
    console.warn('⚠️  Some posts have warnings. Build will continue.\n');
  } else {
    console.log('✅ All posts validated successfully!\n');
  }
}

function validatePost(post, filename) {
  const errors = [];
  const warnings = [];
  
  // Critical: Check for empty content
  if (!post.content || post.content.trim().length === 0) {
    errors.push('Content field is empty');
  } else {
    const contentLength = post.content.length;
    const wordCount = post.content.split(/\s+/).length;
    
    // Check minimum content length
    if (contentLength < MIN_CONTENT_LENGTH) {
      errors.push(`Content too short: ${contentLength} characters (minimum: ${MIN_CONTENT_LENGTH})`);
    }
    
    // Check minimum word count
    if (wordCount < MIN_WORD_COUNT) {
      errors.push(`Content has too few words: ${wordCount} words (minimum: ${MIN_WORD_COUNT})`);
    }
    
    // Warning for potentially thin content
    if (wordCount < 300) {
      warnings.push(`Low word count: ${wordCount} words (recommended: 300+)`);
    }
  }
  
  // Check required metadata fields
  const requiredFields = ['title', 'slug', 'excerpt', 'metaDescription', 'date'];
  requiredFields.forEach(field => {
    if (!post[field] || (typeof post[field] === 'string' && post[field].trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate slug matches filename
  const expectedSlug = filename.replace('.json', '');
  if (post.slug && post.slug !== expectedSlug) {
    errors.push(`Slug mismatch: "${post.slug}" doesn't match filename "${expectedSlug}"`);
  }
  
  // Image alt text
  if (post.image && (!post.alt_text || post.alt_text.trim() === '')) {
    errors.push('Missing alt_text for image');
  }
  
  // Check for duplicate content warning
  if (post.content && post.content.includes('Lorem ipsum')) {
    warnings.push('Contains placeholder text (Lorem ipsum)');
  }
  
  // Check meta description length (SEO best practice)
  if (post.metaDescription && post.metaDescription.length > 160) {
    warnings.push(`Meta description too long: ${post.metaDescription.length} characters (recommended: <160)`);
  }
  
  // Check for proper date format
  if (post.date) {
    const date = new Date(post.date);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: ${post.date}`);
    } else if (date.getFullYear() === 1970) {
      errors.push(`Date appears to be Unix epoch default: ${post.date}`);
    }
  }
  
  return { errors, warnings };
}

// Run validation
validateAllPosts();