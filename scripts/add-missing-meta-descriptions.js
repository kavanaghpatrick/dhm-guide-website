#!/usr/bin/env node

/**
 * Add missing meta descriptions to blog posts
 *
 * This script:
 * 1. Finds all blog posts missing metaDescription field
 * 2. Generates meta descriptions from excerpt or content
 * 3. Ensures 120-160 character range for SEO best practices
 * 4. Strips HTML/markdown formatting
 * 5. Updates JSON files preserving existing formatting
 *
 * SEO Requirements:
 * - Length: 120-160 characters (optimal for Google snippets)
 * - No HTML tags or markdown syntax
 * - Proper sentence truncation (no mid-word cuts)
 * - Add ellipsis if truncated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/newblog/data/posts');
const MIN_LENGTH = 120;
const MAX_LENGTH = 160;
const TARGET_LENGTH = 155;

/**
 * Strip HTML tags from string
 */
function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Strip markdown formatting from string
 */
function stripMarkdown(text) {
  return text
    // Remove headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (**text** or __text__)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    // Remove italic (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks ```
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text to target length at word boundary
 */
function truncateAtWordBoundary(text, maxLength = TARGET_LENGTH) {
  if (text.length <= maxLength) {
    return text;
  }

  // Find last space before maxLength
  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // Only truncate at word boundary if we have enough content
  if (lastSpace > MIN_LENGTH) {
    truncated = truncated.substring(0, lastSpace);
  }

  // Add ellipsis if truncated
  return truncated.trim() + '...';
}

/**
 * Generate meta description from post content
 */
function generateMetaDescription(post) {
  let source = '';

  // Priority 1: Use excerpt if available and reasonable length
  if (post.excerpt && post.excerpt.trim().length > 50) {
    source = post.excerpt.trim();
  }
  // Priority 2: Extract from content
  else if (post.content) {
    // Take first paragraph or first 500 chars of content
    const firstParagraph = post.content.split('\n\n')[0];
    source = firstParagraph || post.content.substring(0, 500);
  }
  // Priority 3: Use title as last resort
  else if (post.title) {
    source = post.title;
  }

  // Clean the source text
  let cleaned = stripHtml(source);
  cleaned = stripMarkdown(cleaned);

  // Truncate to appropriate length
  const metaDesc = truncateAtWordBoundary(cleaned, TARGET_LENGTH);

  // Validate length
  if (metaDesc.length < MIN_LENGTH) {
    console.warn(`  ⚠️  Warning: Generated description too short (${metaDesc.length} chars)`);
  }

  return metaDesc;
}

/**
 * Process a single blog post file
 */
function processPost(filename) {
  const filePath = path.join(POSTS_DIR, filename);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const post = JSON.parse(content);

    // Check if metaDescription is missing or empty
    if (!post.metaDescription || post.metaDescription.trim() === '') {
      const metaDesc = generateMetaDescription(post);
      post.metaDescription = metaDesc;

      // Write back to file with proper formatting
      const updated = JSON.stringify(post, null, 2) + '\n';
      fs.writeFileSync(filePath, updated, 'utf8');

      return {
        updated: true,
        filename,
        length: metaDesc.length,
        description: metaDesc
      };
    }

    return { updated: false, filename };
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}: ${error.message}`);
    return { updated: false, filename, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Adding missing meta descriptions to blog posts...\n');

  // Get all JSON files
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('.bak') && !f.includes('.backup'));

  // Check for archived directory
  const archivedDir = path.join(POSTS_DIR, 'archived');
  let archivedFiles = [];
  if (fs.existsSync(archivedDir)) {
    archivedFiles = fs.readdirSync(archivedDir)
      .filter(f => f.endsWith('.json'))
      .map(f => `archived/${f}`);
  }

  const allFiles = [...files, ...archivedFiles];

  console.log(`📊 Total blog posts found: ${allFiles.length}\n`);

  // Process all files
  const results = allFiles.map(file => {
    const fullPath = path.join(POSTS_DIR, file);
    if (fs.existsSync(fullPath)) {
      return processPost(file);
    }
    return { updated: false, filename: file, error: 'File not found' };
  });

  // Generate report
  const updated = results.filter(r => r.updated);
  const errors = results.filter(r => r.error);

  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY\n');
  console.log(`Total files processed: ${results.length}`);
  console.log(`✅ Updated: ${updated.length}`);
  console.log(`⏭️  Skipped (already had metaDescription): ${results.length - updated.length - errors.length}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (updated.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('✅ UPDATED FILES\n');

    // Group by length category
    const optimal = updated.filter(u => u.length >= MIN_LENGTH && u.length <= MAX_LENGTH);
    const tooShort = updated.filter(u => u.length < MIN_LENGTH);
    const tooLong = updated.filter(u => u.length > MAX_LENGTH);

    console.log(`Optimal length (${MIN_LENGTH}-${MAX_LENGTH} chars): ${optimal.length}`);
    console.log(`Too short (<${MIN_LENGTH} chars): ${tooShort.length}`);
    console.log(`Too long (>${MAX_LENGTH} chars): ${tooLong.length}`);

    // Show first 10 examples
    console.log('\nFirst 10 examples:');
    updated.slice(0, 10).forEach(u => {
      console.log(`\n  📄 ${u.filename}`);
      console.log(`     Length: ${u.length} chars`);
      console.log(`     "${u.description}"`);
    });

    if (updated.length > 10) {
      console.log(`\n  ... and ${updated.length - 10} more files updated`);
    }
  }

  if (errors.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ ERRORS\n');
    errors.forEach(e => {
      console.log(`  ${e.filename}: ${e.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Meta description generation complete!\n');

  if (updated.length > 0) {
    console.log('Next steps:');
    console.log('  1. Review generated descriptions (especially any warnings)');
    console.log('  2. Run: npm run build');
    console.log('  3. Test locally');
    console.log('  4. Commit and deploy\n');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
