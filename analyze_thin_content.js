const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'src/newblog/data/posts');

// Get all JSON files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

const thinPosts = [];

files.forEach(file => {
  try {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const post = JSON.parse(content);
    
    // Count words in content field
    const contentText = post.content || '';
    const wordCount = contentText.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 1000) {
      thinPosts.push({
        slug: file.replace('.json', ''),
        wordCount: wordCount,
        title: post.title || 'No title',
        date: post.date || 'No date',
        fileName: file
      });
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

// Sort by word count (ascending)
thinPosts.sort((a, b) => a.wordCount - b.wordCount);

// Print as table
console.log(`\nFound ${thinPosts.length} posts with <1,000 words:\n`);
console.log('SLUG | WORDS | TITLE | DATE');
console.log('----------------------------------------');

thinPosts.forEach(post => {
  console.log(`${post.slug} | ${post.wordCount} | ${post.title} | ${post.date}`);
});

// Output JSON for further analysis
fs.writeFileSync('thin_posts.json', JSON.stringify(thinPosts, null, 2));
console.log(`\nData saved to thin_posts.json`);
