import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the original posts data
import { posts } from '../src/blog/data/posts.js';

const OUTPUT_DIR = path.join(__dirname, '../src/newblog/data');
const POSTS_DIR = path.join(OUTPUT_DIR, 'posts');
const METADATA_DIR = path.join(OUTPUT_DIR, 'metadata');

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(METADATA_DIR)) {
  fs.mkdirSync(METADATA_DIR, { recursive: true });
}

console.log(`Processing ${posts.length} blog posts...`);

// Extract metadata and save individual posts
const metadata = [];

posts.forEach((post, index) => {
  // Create metadata entry (no content)
  const metaEntry = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    date: post.date,
    author: post.author,
    tags: post.tags,
    image: post.image,
    readTime: Math.ceil(post.content.split(' ').length / 200) // Calculate read time
  };
  
  metadata.push(metaEntry);
  
  // Save individual post with full content
  const postData = {
    ...metaEntry,
    content: post.content
  };
  
  const filename = `${post.slug}.json`;
  const filepath = path.join(POSTS_DIR, filename);
  
  try {
    fs.writeFileSync(filepath, JSON.stringify(postData, null, 2));
    if (index % 10 === 0) {
      console.log(`Processed ${index + 1}/${posts.length} posts...`);
    }
  } catch (error) {
    console.error(`Error writing post ${post.slug}:`, error);
  }
});

// Sort metadata by date (newest first)
metadata.sort((a, b) => new Date(b.date) - new Date(a.date));

// Save metadata index
const metadataFile = path.join(METADATA_DIR, 'index.json');
fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

// Create statistics
const stats = {
  totalPosts: posts.length,
  totalTags: [...new Set(posts.flatMap(post => post.tags))].length,
  averageReadTime: Math.round(metadata.reduce((sum, post) => sum + post.readTime, 0) / metadata.length),
  dateRange: {
    earliest: metadata[metadata.length - 1]?.date,
    latest: metadata[0]?.date
  },
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(path.join(METADATA_DIR, 'stats.json'), JSON.stringify(stats, null, 2));

console.log('\n✅ Blog data extraction complete!');
console.log(`📊 Stats:`);
console.log(`   - ${stats.totalPosts} posts extracted`);
console.log(`   - ${stats.totalTags} unique tags`);
console.log(`   - Average read time: ${stats.averageReadTime} minutes`);
console.log(`   - Date range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}`);
console.log(`\n📁 Files created:`);
console.log(`   - ${POSTS_DIR}/ (${posts.length} individual post files)`);
console.log(`   - ${metadataFile}`);
console.log(`   - ${path.join(METADATA_DIR, 'stats.json')}`);