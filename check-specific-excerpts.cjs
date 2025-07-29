#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing JSON posts
const postsDir = '/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts';

// Files specifically mentioned in the task
const targetFiles = [
  'alcohol-and-nootropics-cognitive-enhancement-interactions-2025.json',
  'alcohol-hypertension-blood-pressure-management-2025.json',
  'alcohol-ketogenic-diet-ketosis-impact-analysis-2025.json',
  'alcohol-kidney-disease-renal-function-impact-2025.json',
  'alcohol-mitochondrial-function-cellular-energy-recovery-2025.json',
  'complete-hangover-science-hub-2025.json',
  'dhm-supplements-comparison-center-2025.json'
];

console.log('Checking specific files for excerpt fields...\n');

targetFiles.forEach(filename => {
  const filepath = path.join(postsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const post = JSON.parse(content);
    
    if (!post.excerpt || post.excerpt.trim() === '') {
      console.log(`❌ Missing excerpt: ${filename}`);
      console.log(`   Title: ${post.title || 'No title'}`);
    } else {
      console.log(`✓ Has excerpt: ${filename}`);
      console.log(`   Excerpt: ${post.excerpt.substring(0, 80)}...`);
    }
  } catch (e) {
    console.log(`❌ Error reading ${filename}: ${e.message}`);
  }
  console.log('');
});