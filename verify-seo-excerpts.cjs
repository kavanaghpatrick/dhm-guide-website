#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing JSON posts
const postsDir = '/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts';

// SEO criteria for good excerpts
function isGoodSEOExcerpt(excerpt) {
  if (!excerpt || excerpt.trim() === '') return false;
  
  const excerptLength = excerpt.length;
  const hasCallToAction = /shop|order|save|discount|deal|free|today|now|get|buy/i.test(excerpt);
  const hasBenefit = /prevent|protect|improve|boost|enhance|restore|recover|optimize|better|best/i.test(excerpt);
  const hasKeywords = /dhm|hangover|supplement|alcohol|liver|health|cognitive|brain/i.test(excerpt);
  
  return {
    length: excerptLength,
    hasCallToAction,
    hasBenefit,
    hasKeywords,
    isOptimal: excerptLength >= 150 && excerptLength <= 200 && hasCallToAction && hasBenefit && hasKeywords
  };
}

console.log('=== SEO Excerpt Verification Report ===\n');

let totalFiles = 0;
let filesWithExcerpt = 0;
let filesWithOptimalExcerpt = 0;
let filesToImprove = [];

fs.readdirSync(postsDir).forEach(filename => {
  if (!filename.endsWith('.json')) return;
  
  totalFiles++;
  const filepath = path.join(postsDir, filename);
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const post = JSON.parse(content);
    
    if (post.excerpt && post.excerpt.trim() !== '') {
      filesWithExcerpt++;
      
      const seoAnalysis = isGoodSEOExcerpt(post.excerpt);
      
      if (seoAnalysis.isOptimal) {
        filesWithOptimalExcerpt++;
      } else {
        filesToImprove.push({
          filename,
          title: post.title,
          excerpt: post.excerpt,
          analysis: seoAnalysis
        });
      }
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e.message);
  }
});

console.log(`Total JSON files: ${totalFiles}`);
console.log(`Files with excerpts: ${filesWithExcerpt} (${((filesWithExcerpt/totalFiles)*100).toFixed(1)}%)`);
console.log(`Files with SEO-optimal excerpts: ${filesWithOptimalExcerpt} (${((filesWithOptimalExcerpt/totalFiles)*100).toFixed(1)}%)`);
console.log(`Files that could be improved: ${filesToImprove.length}\n`);

// Show sample of files that could be improved
if (filesToImprove.length > 0) {
  console.log('=== Sample Files for Potential Improvement ===\n');
  
  filesToImprove.slice(0, 5).forEach(file => {
    console.log(`File: ${file.filename}`);
    console.log(`Title: ${file.title}`);
    console.log(`Current excerpt length: ${file.analysis.length} chars`);
    console.log(`Has CTA: ${file.analysis.hasCallToAction ? 'Yes' : 'No'}`);
    console.log(`Has benefits: ${file.analysis.hasBenefit ? 'Yes' : 'No'}`);
    console.log(`Has keywords: ${file.analysis.hasKeywords ? 'Yes' : 'No'}`);
    console.log(`Excerpt: ${file.excerpt.substring(0, 100)}...`);
    console.log('---\n');
  });
}

// Summary of key files from the task
console.log('=== Status of Key Files from Task ===\n');

const keyFiles = [
  'alcohol-and-nootropics-cognitive-enhancement-interactions-2025.json',
  'alcohol-hypertension-blood-pressure-management-2025.json',
  'alcohol-ketogenic-diet-ketosis-impact-analysis-2025.json',
  'alcohol-kidney-disease-renal-function-impact-2025.json',
  'alcohol-mitochondrial-function-cellular-energy-recovery-2025.json',
  'complete-hangover-science-hub-2025.json',
  'dhm-supplements-comparison-center-2025.json'
];

keyFiles.forEach(filename => {
  const filepath = path.join(postsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ ${filename} - File not found`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const post = JSON.parse(content);
    
    if (post.excerpt) {
      const seoAnalysis = isGoodSEOExcerpt(post.excerpt);
      console.log(`✓ ${filename}`);
      console.log(`  Excerpt: ${post.excerpt.substring(0, 80)}...`);
      console.log(`  SEO Optimal: ${seoAnalysis.isOptimal ? 'Yes' : 'Needs improvement'}`);
    } else {
      console.log(`❌ ${filename} - Missing excerpt`);
    }
  } catch (e) {
    console.log(`❌ ${filename} - Error: ${e.message}`);
  }
  console.log('');
});