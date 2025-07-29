#!/usr/bin/env node
/**
 * DHM Guide Blog Post Creator
 * Interactive CLI tool to create properly formatted blog posts
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const q = defaultValue ? `${question} (${colorize(defaultValue, 'yellow')}): ` : `${question}: `;
    rl.question(q, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

async function createBlogPost() {
  console.log(colorize('\n📝 DHM Guide Blog Post Creator', 'cyan'));
  console.log(colorize('================================\n', 'cyan'));

  try {
    // Gather information
    console.log(colorize('Step 1: Basic Information', 'blue'));
    const title = await prompt('Title (60-80 chars)');
    
    // Auto-generate slug from title
    const autoSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-2025';
    const slug = await prompt('Slug', autoSlug);
    
    const excerpt = await prompt('Excerpt (150-160 chars)');
    const metaDescription = await prompt('Meta Description (150-160 chars)', excerpt);
    const author = await prompt('Author', 'DHM Guide Team');
    
    console.log(colorize('\nStep 2: Tags (comma-separated)', 'blue'));
    const tagsInput = await prompt('Tags (e.g., dhm, hangover prevention, supplements)');
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    
    const readTimeStr = await prompt('Read time (minutes)', '10');
    const readTime = parseInt(readTimeStr) || 10;
    
    console.log(colorize('\nStep 3: Initial Content', 'blue'));
    const contentSummary = await prompt('Brief content summary (for starter content)');
    
    // Get current date
    const date = new Date().toISOString().split('T')[0];
    const imagePath = `/images/${slug}-hero.webp`;

    // Create starter content
    const starterContent = `# ${title}

${contentSummary || 'Your introduction here...'}

## Quick Answers

**Key Point 1**: Answer here
**Key Point 2**: Answer here
**Key Point 3**: Answer here

## Section 1 Title

Content for section 1...

## Section 2 Title

Content for section 2...

## Section 3 Title

Content for section 3...

## Key Takeaways

- Important point 1
- Important point 2
- Important point 3

## Frequently Asked Questions

### Question 1?

Answer 1...

### Question 2?

Answer 2...

### Question 3?

Answer 3...

## Conclusion

Wrap up your post here...`;

    // Create post object
    const post = {
      title,
      slug,
      excerpt,
      metaDescription,
      date,
      author,
      tags,
      readTime,
      image: imagePath,
      content: starterContent
    };

    // Confirm before creating
    console.log(colorize('\n📋 Post Preview:', 'cyan'));
    console.log('-------------------');
    console.log(`Title: ${colorize(title, 'bright')}`);
    console.log(`Slug: ${colorize(slug, 'bright')}`);
    console.log(`Date: ${date}`);
    console.log(`Author: ${author}`);
    console.log(`Tags: ${tags.join(', ')}`);
    console.log(`Read Time: ${readTime} minutes`);
    console.log(`Image Path: ${imagePath}`);
    console.log('-------------------');
    
    const confirm = await prompt('\nCreate this blog post? (y/n)', 'y');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log(colorize('\n❌ Blog post creation cancelled', 'yellow'));
      rl.close();
      return;
    }

    console.log(colorize('\n🚀 Creating blog post...', 'cyan'));

    // Create directories if they don't exist
    const postsDir = path.join('src', 'newblog', 'data', 'posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // 1. Write JSON file
    const postPath = path.join(postsDir, `${slug}.json`);
    fs.writeFileSync(postPath, JSON.stringify(post, null, 2));
    console.log(colorize(`✅ Created post file: ${postPath}`, 'green'));

    // 2. Update registry
    const registryPath = path.join('src', 'newblog', 'data', 'postRegistry.js');
    let registry = fs.readFileSync(registryPath, 'utf8');
    
    // Find the last entry before the closing brace
    const importLine = `  '${slug}': () => import('./posts/${slug}.json'),`;
    const lastBraceIndex = registry.lastIndexOf('};');
    
    // Check if post already exists
    if (registry.includes(`'${slug}':`)) {
      console.log(colorize('⚠️  Post already exists in registry', 'yellow'));
    } else {
      // Insert the new import before the last brace
      registry = registry.slice(0, lastBraceIndex) + importLine + '\n' + registry.slice(lastBraceIndex);
      fs.writeFileSync(registryPath, registry);
      console.log(colorize('✅ Updated postRegistry.js', 'green'));
    }

    // 3. Update metadata
    const metadataPath = path.join('src', 'newblog', 'data', 'metadata', 'index.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Check if already exists
    const exists = metadata.some(m => m.slug === slug || m.id === slug);
    if (exists) {
      console.log(colorize('⚠️  Post already exists in metadata', 'yellow'));
    } else {
      metadata.push({
        id: slug,
        title,
        slug,
        excerpt,
        date,
        author,
        tags: tags.slice(0, 5), // Limit tags in metadata
        image: imagePath,
        readTime: `${readTime} min read`
      });
      
      // Sort by date (newest first)
      metadata.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(colorize('✅ Updated metadata/index.json', 'green'));
    }

    // Success message
    console.log(colorize('\n🎉 Blog post created successfully!', 'green'));
    console.log(colorize('\n📝 Next Steps:', 'cyan'));
    console.log(`1. ${colorize('Add hero image:', 'yellow')} public${imagePath}`);
    console.log(`   Convert image to WebP: cwebp -q 80 input.jpg -o ${slug}-hero.webp`);
    console.log(`2. ${colorize('Edit content:', 'yellow')} ${postPath}`);
    console.log(`3. ${colorize('Test locally:', 'yellow')} npm run dev`);
    console.log(`   Preview at: http://localhost:5173/never-hungover/${slug}`);
    console.log(`4. ${colorize('Validate:', 'yellow')} ./scripts/validate-blog-post.sh ${slug}`);
    console.log(`5. ${colorize('Generate sitemap:', 'yellow')} node scripts/generate-sitemap.js`);
    console.log(`6. ${colorize('Commit changes:', 'yellow')} git add . && git commit -m "Add blog post: ${title}"`);

  } catch (error) {
    console.error(colorize('\n❌ Error creating blog post:', 'red'));
    console.error(error);
  } finally {
    rl.close();
  }
}

// Handle interruption
rl.on('SIGINT', () => {
  console.log(colorize('\n\n❌ Blog post creation cancelled', 'yellow'));
  process.exit(0);
});

// Run the creator
createBlogPost().catch(console.error);