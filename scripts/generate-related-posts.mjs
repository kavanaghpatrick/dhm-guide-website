#!/usr/bin/env node
// Generate relatedPosts fields for posts that don't have them
// Uses tag overlap scoring to find related content

import fs from 'fs';
import path from 'path';

const postsDir = './src/newblog/data/posts';

// Load all posts
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
const allPosts = files.map(file => {
  const data = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
  return { ...data, _file: file };
});

console.log(`Found ${allPosts.length} posts`);

let updatedCount = 0;
let skippedCount = 0;

// For each post without relatedPosts, generate them based on tag overlap
for (const post of allPosts) {
  // Skip if already has relatedPosts
  if (post.relatedPosts && post.relatedPosts.length > 0) {
    skippedCount++;
    continue;
  }

  const tags = post.tags || [];
  if (tags.length === 0) {
    console.log(`⚠️ No tags: ${post.slug}`);
    continue;
  }

  // Score other posts based on tag overlap
  const scored = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => {
      const otherTags = p.tags || [];
      const commonTags = tags.filter(t => otherTags.includes(t));
      return { slug: p.slug, score: commonTags.length };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length > 0) {
    // Remove internal _file property before writing
    const { _file, ...postData } = post;
    postData.relatedPosts = scored.map(p => p.slug);

    // Write back to file
    fs.writeFileSync(
      path.join(postsDir, _file),
      JSON.stringify(postData, null, 2)
    );
    updatedCount++;
  } else {
    console.log(`⚠️ No related posts found: ${post.slug}`);
  }
}

console.log(`\n✅ Updated ${updatedCount} posts with relatedPosts`);
console.log(`⏭️ Skipped ${skippedCount} posts (already had relatedPosts)`);
