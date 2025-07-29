#!/usr/bin/env node
/**
 * DHM Guide Blog Synchronization Checker
 * Ensures all blog posts are properly synchronized across the three-tier system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkBlogSync() {
  log('🔍 DHM Guide Blog Synchronization Checker', 'cyan');
  log('==========================================\n', 'cyan');

  const issues = [];
  const stats = {
    postFiles: 0,
    registryEntries: 0,
    metadataEntries: 0,
    validPosts: 0,
    orphanedRegistry: 0,
    orphanedMetadata: 0,
    missingImages: 0
  };

  // Get all post files
  const postsDir = path.join('src', 'newblog', 'data', 'posts');
  const postFiles = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('backup') && !f.includes('original') && !f.includes('enhanced'))
    .filter(f => !f.match(/^[0-9a-f-]{36}\.json$/)); // Skip UUID files

  stats.postFiles = postFiles.length;

  // Get registry entries
  const registryPath = path.join('src', 'newblog', 'data', 'postRegistry.js');
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  const registryMatches = [...registryContent.matchAll(/'([^']+)':\s*\(\)/g)];
  const registrySlugs = registryMatches.map(m => m[1]);
  stats.registryEntries = registrySlugs.length;

  // Get metadata entries
  const metadataPath = path.join('src', 'newblog', 'data', 'metadata', 'index.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const metadataSlugs = metadata.map(m => m.slug || m.id);
  stats.metadataEntries = metadataSlugs.length;

  log('📁 Checking Post Files...', 'blue');
  
  // Check each post file
  postFiles.forEach(file => {
    const slug = file.replace('.json', '');
    const filePath = path.join(postsDir, file);
    let hasIssue = false;
    
    // Check if in registry
    if (!registrySlugs.includes(slug)) {
      issues.push({
        type: 'missing_registry',
        message: `${slug} is missing from postRegistry.js`,
        fix: `Add: '${slug}': () => import('./posts/${slug}.json'),`
      });
      hasIssue = true;
    }
    
    // Check if in metadata
    if (!metadataSlugs.includes(slug)) {
      issues.push({
        type: 'missing_metadata',
        message: `${slug} is missing from metadata/index.json`,
        fix: 'Add metadata entry with id, title, slug, excerpt, date, author, tags, image, readTime'
      });
      hasIssue = true;
    }

    // Check JSON validity and content
    try {
      const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check slug matches
      if (post.slug && post.slug !== slug) {
        issues.push({
          type: 'slug_mismatch',
          message: `${slug} has mismatched slug in JSON: "${post.slug}"`,
          fix: `Change JSON slug to: "${slug}"`
        });
        hasIssue = true;
      }

      // Check required fields
      const requiredFields = ['title', 'slug', 'excerpt', 'metaDescription', 'date', 'author', 'tags', 'readTime', 'content'];
      const missingFields = requiredFields.filter(field => !post[field]);
      
      if (missingFields.length > 0) {
        issues.push({
          type: 'missing_fields',
          message: `${slug} is missing required fields: ${missingFields.join(', ')}`,
          fix: 'Add all required fields to the JSON file'
        });
        hasIssue = true;
      }

      // Check image exists
      if (post.image) {
        const imagePath = path.join('public', post.image);
        if (!fs.existsSync(imagePath)) {
          issues.push({
            type: 'missing_image',
            message: `${slug} references missing image: ${post.image}`,
            fix: `Add image file to: public${post.image}`
          });
          stats.missingImages++;
          hasIssue = true;
        }
      }

      // Check date format
      if (post.date && !post.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        issues.push({
          type: 'invalid_date',
          message: `${slug} has invalid date format: "${post.date}"`,
          fix: 'Use ISO format: YYYY-MM-DD'
        });
        hasIssue = true;
      }
      
      if (!hasIssue) {
        stats.validPosts++;
      }
    } catch (e) {
      issues.push({
        type: 'invalid_json',
        message: `${slug} has invalid JSON syntax`,
        fix: `Validate with: python3 -m json.tool ${filePath}`
      });
    }
  });

  log('\n📋 Checking Registry Entries...', 'blue');
  
  // Check for orphaned registry entries
  registrySlugs.forEach(slug => {
    if (!postFiles.includes(`${slug}.json`)) {
      issues.push({
        type: 'orphaned_registry',
        message: `${slug} in registry but file doesn't exist`,
        fix: `Remove from postRegistry.js or create file: src/newblog/data/posts/${slug}.json`
      });
      stats.orphanedRegistry++;
    }
  });

  log('\n📊 Checking Metadata Entries...', 'blue');
  
  // Check for orphaned metadata entries
  metadataSlugs.forEach(slug => {
    if (!postFiles.includes(`${slug}.json`)) {
      issues.push({
        type: 'orphaned_metadata',
        message: `${slug} in metadata but file doesn't exist`,
        fix: `Remove from metadata/index.json or create file: src/newblog/data/posts/${slug}.json`
      });
      stats.orphanedMetadata++;
    }
  });

  // Check for duplicate metadata entries
  const slugCounts = {};
  metadataSlugs.forEach(slug => {
    slugCounts[slug] = (slugCounts[slug] || 0) + 1;
  });
  Object.entries(slugCounts).forEach(([slug, count]) => {
    if (count > 1) {
      issues.push({
        type: 'duplicate_metadata',
        message: `${slug} appears ${count} times in metadata`,
        fix: 'Remove duplicate entries from metadata/index.json'
      });
    }
  });

  // Report results
  log('\n📈 Summary', 'cyan');
  log('==========================================', 'cyan');
  
  console.log(`Total post files:        ${stats.postFiles}`);
  console.log(`Registry entries:        ${stats.registryEntries}`);
  console.log(`Metadata entries:        ${stats.metadataEntries}`);
  console.log(`Valid posts:             ${stats.validPosts}`);
  console.log(`Orphaned registry:       ${stats.orphanedRegistry}`);
  console.log(`Orphaned metadata:       ${stats.orphanedMetadata}`);
  console.log(`Missing images:          ${stats.missingImages}`);
  
  if (issues.length === 0) {
    log('\n✅ All blog posts are properly synchronized!', 'green');
  } else {
    log(`\n❌ Found ${issues.length} synchronization issue(s):`, 'red');
    
    // Group issues by type
    const issuesByType = {};
    issues.forEach(issue => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });
    
    // Display issues grouped by type
    Object.entries(issuesByType).forEach(([type, typeIssues]) => {
      console.log(`\n${getIssueTypeLabel(type)}:`);
      typeIssues.forEach(issue => {
        log(`  ❌ ${issue.message}`, 'red');
        log(`     Fix: ${issue.fix}`, 'yellow');
      });
    });
    
    log('\n💡 Run validation on individual posts:', 'cyan');
    log('   ./scripts/validate-blog-post.sh <slug>', 'cyan');
  }
}

function getIssueTypeLabel(type) {
  const labels = {
    'missing_registry': '📝 Missing from Registry',
    'missing_metadata': '📊 Missing from Metadata',
    'slug_mismatch': '🔀 Slug Mismatches',
    'missing_fields': '⚠️  Missing Required Fields',
    'missing_image': '🖼️  Missing Images',
    'invalid_date': '📅 Invalid Date Formats',
    'invalid_json': '❗ Invalid JSON',
    'orphaned_registry': '👻 Orphaned Registry Entries',
    'orphaned_metadata': '👻 Orphaned Metadata Entries',
    'duplicate_metadata': '👥 Duplicate Metadata Entries'
  };
  return labels[type] || type;
}

// Run the checker
try {
  checkBlogSync();
} catch (error) {
  log('❌ Error running sync checker:', 'red');
  console.error(error);
  process.exit(1);
}