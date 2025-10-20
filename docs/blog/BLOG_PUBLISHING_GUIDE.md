# 📝 DHM Guide Blog Publishing Guide

## Table of Contents
1. [Quick Start Checklist](#quick-start-checklist)
2. [Understanding the Blog System](#understanding-the-blog-system)
3. [Step-by-Step Publishing Process](#step-by-step-publishing-process)
4. [Image Guidelines](#image-guidelines)
5. [JSON Structure Reference](#json-structure-reference)
6. [Git Workflow](#git-workflow)
7. [Testing & Validation](#testing--validation)
8. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
9. [Automation Scripts](#automation-scripts)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Checklist

Before publishing a new blog post, ensure you have:

- [ ] Written content in Markdown format
- [ ] Created a URL-friendly slug
- [ ] Prepared a hero image (WebP format, ~1920x1080)
- [ ] Written meta description (150-160 chars)
- [ ] Written excerpt (150-160 chars)
- [ ] Calculated read time
- [ ] Selected relevant tags
- [ ] Access to the GitHub repository

---

## 🏗️ Understanding the Blog System

The DHM Guide blog uses a **three-tier architecture** that requires synchronization:

### 1. **Individual Post Files** (`src/newblog/data/posts/[slug].json`)
- Contains the full blog post content and metadata
- Each post is a separate JSON file
- File name must match the slug exactly

### 2. **Post Registry** (`src/newblog/data/postRegistry.js`)
- Maps post slugs to dynamic imports
- Enables code-splitting and lazy loading
- Must be updated manually when adding posts

### 3. **Metadata Index** (`src/newblog/data/metadata/index.json`)
- Contains lightweight metadata for all posts
- Powers the blog listing page
- Enables fast search and filtering

**⚠️ CRITICAL**: All three must be synchronized or the post won't work!

---

## 📋 Step-by-Step Publishing Process

### Step 1: Prepare Your Content

1. **Write your blog post** in Markdown format
2. **Choose a slug** (URL-friendly version):
   - Use lowercase letters only
   - Replace spaces with hyphens
   - No special characters
   - Include year if relevant
   - Example: `dhm-dosage-guide-2025`

3. **Prepare metadata**:
   - Title (60-80 characters)
   - Meta description (150-160 characters)
   - Excerpt (150-160 characters)
   - Tags (5-15 relevant keywords)

### Step 2: Create the Hero Image

1. **Create or source** a high-quality image (1920x1080 recommended)
2. **Convert to WebP format** using:
   ```bash
   # Using cwebp (install with: brew install webp)
   cwebp -q 80 original-image.jpg -o slug-name-hero.webp
   ```
3. **Name the file**: `[slug]-hero.webp`
4. **Place in**: `/public/images/`

### Step 3: Create the JSON File

1. **Create new file**: `src/newblog/data/posts/[slug].json`
2. **Use this template**:

```json
{
  "title": "Your Blog Post Title Here",
  "slug": "your-url-friendly-slug-2025",
  "excerpt": "Brief, compelling summary of your post in 150-160 characters.",
  "metaDescription": "SEO-optimized description with keywords. Keep it 150-160 characters.",
  "date": "2025-07-29",
  "author": "DHM Guide Team",
  "tags": [
    "primary keyword",
    "secondary keyword",
    "topic category",
    "content type",
    "related topic"
  ],
  "readTime": 12,
  "image": "/images/your-slug-hero.webp",
  "content": "# Your Markdown Content Here\n\nStart with an engaging introduction...\n\n## Section Header\n\nYour content continues..."
}
```

### Step 4: Update the Post Registry

1. **Open**: `src/newblog/data/postRegistry.js`
2. **Add your post** to the `postModules` object:
   ```javascript
   const postModules = {
     // ... existing posts ...
     'your-url-friendly-slug-2025': () => import('./posts/your-url-friendly-slug-2025.json'),
   };
   ```
3. **Important**: Place it alphabetically or at the end before the closing brace

### Step 5: Update the Metadata Index

1. **Open**: `src/newblog/data/metadata/index.json`
2. **Add your post metadata** to the array:
   ```json
   {
     "id": "your-url-friendly-slug-2025",
     "title": "Your Blog Post Title Here",
     "slug": "your-url-friendly-slug-2025",
     "excerpt": "Brief, compelling summary of your post in 150-160 characters.",
     "date": "2025-07-29",
     "author": "DHM Guide Team",
     "tags": ["primary keyword", "secondary keyword"],
     "image": "/images/your-slug-hero.webp",
     "readTime": "12 min read"
   }
   ```

### Step 6: Test Locally

```bash
# Start the development server
npm run dev

# Visit these URLs:
# 1. Blog listing: http://localhost:5173/never-hungover
# 2. Your new post: http://localhost:5173/never-hungover/your-url-friendly-slug-2025
```

### Step 7: Generate Updated Sitemap

```bash
# Run the sitemap generator
node scripts/generate-sitemap.js
```

### Step 8: Commit and Push

```bash
# Create a new branch
git checkout -b add-blog-post-your-slug

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add blog post: Your Post Title

- Add new post JSON file
- Update postRegistry.js
- Update metadata index
- Add hero image
- Regenerate sitemap"

# Push to GitHub
git push -u origin add-blog-post-your-slug
```

---

## 🖼️ Image Guidelines

### Hero Image Requirements

- **Format**: WebP (primary), PNG (fallback)
- **Dimensions**: 1920x1080 (16:9 ratio) recommended
- **File size**: < 200KB after optimization
- **Location**: `/public/images/`
- **Naming**: `[slug]-hero.webp`

### Image Optimization Commands

```bash
# Convert to WebP with quality 80
cwebp -q 80 input.jpg -o output.webp

# Resize if needed (using ImageMagick)
convert input.jpg -resize 1920x1080^ -gravity center -crop 1920x1080+0+0 output.jpg

# Optimize PNG (using pngquant)
pngquant --quality=80-90 input.png -o output.png
```

### In-Content Images

For images within the blog content:
```markdown
![Alt text description](/images/image-name.webp)
```

---

## 📄 JSON Structure Reference

### Required Fields

| Field | Type | Description | Character Limit |
|-------|------|-------------|-----------------|
| `title` | string | Blog post title | 60-80 chars |
| `slug` | string | URL-friendly identifier | Must match filename |
| `excerpt` | string | Brief summary for listings | 150-160 chars |
| `metaDescription` | string | SEO meta description | 150-160 chars |
| `date` | string | ISO format date (YYYY-MM-DD) | - |
| `author` | string | Author name | - |
| `tags` | array | Keywords and categories | 5-15 tags |
| `readTime` | number | Minutes to read | Integer only |
| `content` | string | Full post in Markdown | - |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `image` | string | Hero image path |
| `id` | string | Unique identifier (usually same as slug) |

### Content Formatting

```markdown
# H1 Header (use once at the beginning)

## H2 Section Headers

### H3 Subsection Headers

**Bold text** and *italic text*

- Unordered list item
- Another item
  - Nested item

1. Ordered list
2. Second item

[Internal link](/path/to/page)
[External link](https://example.com)

> Blockquote for important callouts

`inline code` and code blocks:

```javascript
const example = "code block";
```

| Table Header | Another Header |
|--------------|----------------|
| Cell content | More content   |
```

---

## 🔀 Git Workflow

### Best Practices

1. **Always create a new branch** for blog posts
2. **Use descriptive branch names**: `add-blog-post-[slug]`
3. **Write clear commit messages** explaining what was added
4. **Test locally** before pushing
5. **Create a pull request** for review

### Example Workflow

```bash
# 1. Start from main branch
git checkout main
git pull origin main

# 2. Create new branch
git checkout -b add-blog-post-dhm-timing-guide-2025

# 3. Make your changes
# ... add files, edit registry, etc ...

# 4. Stage changes
git add src/newblog/data/posts/dhm-timing-guide-2025.json
git add src/newblog/data/postRegistry.js
git add src/newblog/data/metadata/index.json
git add public/images/dhm-timing-guide-hero.webp
git add public/sitemap.xml

# 5. Commit
git commit -m "Add blog post: DHM Timing Guide 2025

- Create new post about optimal DHM timing
- Add hero image
- Update registry and metadata
- Regenerate sitemap

Closes #123"

# 6. Push
git push -u origin add-blog-post-dhm-timing-guide-2025
```

---

## ✅ Testing & Validation

### Pre-Publish Checklist

1. **Validate JSON syntax**:
   ```bash
   # Check JSON is valid
   python3 -m json.tool src/newblog/data/posts/your-post.json
   ```

2. **Check image exists**:
   ```bash
   ls -la public/images/*your-slug*
   ```

3. **Verify slug consistency**:
   - Filename matches slug in JSON
   - Registry key matches slug
   - Metadata slug matches

4. **Test locally**:
   - Blog listing page loads
   - Individual post loads
   - Images display correctly
   - No console errors

### Validation Script

Create `validate-blog-post.sh`:

```bash
#!/bin/bash

SLUG=$1

if [ -z "$SLUG" ]; then
    echo "Usage: ./validate-blog-post.sh <slug>"
    exit 1
fi

echo "🔍 Validating blog post: $SLUG"

# Check JSON file exists
if [ ! -f "src/newblog/data/posts/$SLUG.json" ]; then
    echo "❌ JSON file not found: src/newblog/data/posts/$SLUG.json"
    exit 1
fi

# Check JSON is valid
python3 -m json.tool "src/newblog/data/posts/$SLUG.json" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Invalid JSON syntax"
    exit 1
fi

# Check registry entry
grep -q "'$SLUG':" src/newblog/data/postRegistry.js
if [ $? -ne 0 ]; then
    echo "❌ Missing from postRegistry.js"
    exit 1
fi

# Check metadata entry
grep -q "\"$SLUG\"" src/newblog/data/metadata/index.json
if [ $? -ne 0 ]; then
    echo "❌ Missing from metadata/index.json"
    exit 1
fi

# Extract image path from JSON
IMAGE=$(grep -o '"image":[[:space:]]*"[^"]*"' "src/newblog/data/posts/$SLUG.json" | cut -d'"' -f4)

# Check image exists
if [ ! -z "$IMAGE" ]; then
    if [ ! -f "public$IMAGE" ]; then
        echo "❌ Image not found: public$IMAGE"
        exit 1
    fi
fi

echo "✅ All checks passed!"
```

---

## ⚠️ Common Pitfalls & Solutions

### 1. **Post Not Appearing in Listing**

**Symptoms**: Post created but doesn't show on blog page

**Causes & Solutions**:
- ❌ Forgot to add to `metadata/index.json`
  - ✅ Add metadata entry with all required fields
- ❌ Invalid date format
  - ✅ Use ISO format: `"2025-07-29"`
- ❌ JSON syntax error in metadata
  - ✅ Validate with `python3 -m json.tool`

### 2. **Post Returns 404 Error**

**Symptoms**: Clicking post shows 404 or error

**Causes & Solutions**:
- ❌ Missing from `postRegistry.js`
  - ✅ Add import mapping with exact slug match
- ❌ Slug mismatch between files
  - ✅ Ensure filename, registry key, and JSON slug all match
- ❌ Typo in import path
  - ✅ Double-check the import path in registry

### 3. **Images Not Loading**

**Symptoms**: Broken image icon or missing hero image

**Causes & Solutions**:
- ❌ Wrong image path in JSON
  - ✅ Use absolute path: `/images/slug-hero.webp`
- ❌ Image file doesn't exist
  - ✅ Check file is in `/public/images/`
- ❌ Wrong file extension
  - ✅ Ensure JSON references actual file extension

### 4. **Duplicate Posts**

**Symptoms**: Same post appears multiple times

**Causes & Solutions**:
- ❌ Duplicate entries in metadata
  - ✅ Search for duplicate slugs and remove
- ❌ Multiple JSON files with similar names
  - ✅ Use exact, unique slugs

### 5. **Build Failures**

**Symptoms**: Site won't build or deploy

**Causes & Solutions**:
- ❌ Invalid JSON syntax
  - ✅ Validate all JSON files
- ❌ Missing comma in registry
  - ✅ Ensure proper JavaScript syntax
- ❌ Circular imports
  - ✅ Check for typos in import paths

---

## 🤖 Automation Scripts

### 1. **Blog Post Creator Script**

Create `create-blog-post.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createBlogPost() {
  console.log('📝 DHM Guide Blog Post Creator\n');

  // Gather information
  const title = await prompt('Title: ');
  const slug = await prompt('Slug (leave empty to auto-generate): ') || 
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const excerpt = await prompt('Excerpt (150-160 chars): ');
  const metaDescription = await prompt('Meta Description (150-160 chars): ');
  const author = await prompt('Author (default: DHM Guide Team): ') || 'DHM Guide Team';
  const tags = (await prompt('Tags (comma-separated): ')).split(',').map(t => t.trim());
  const readTime = parseInt(await prompt('Read time (minutes): ')) || 10;

  const date = new Date().toISOString().split('T')[0];
  const imagePath = `/images/${slug}-hero.webp`;

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
    content: `# ${title}\n\nYour content here...`
  };

  // Write JSON file
  const postPath = path.join('src/newblog/data/posts', `${slug}.json`);
  fs.writeFileSync(postPath, JSON.stringify(post, null, 2));
  console.log(`✅ Created post file: ${postPath}`);

  // Update registry
  const registryPath = 'src/newblog/data/postRegistry.js';
  let registry = fs.readFileSync(registryPath, 'utf8');
  const importLine = `  '${slug}': () => import('./posts/${slug}.json'),`;
  registry = registry.replace(/};\s*$/, `${importLine}\n};`);
  fs.writeFileSync(registryPath, registry);
  console.log('✅ Updated postRegistry.js');

  // Update metadata
  const metadataPath = 'src/newblog/data/metadata/index.json';
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
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
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('✅ Updated metadata/index.json');

  console.log('\n🎉 Blog post created successfully!');
  console.log('\nNext steps:');
  console.log(`1. Add hero image: public${imagePath}`);
  console.log(`2. Edit content in: ${postPath}`);
  console.log('3. Run: npm run dev to test');
  console.log('4. Run: node scripts/generate-sitemap.js');

  rl.close();
}

createBlogPost().catch(console.error);
```

### 2. **Sync Checker Script**

Create `check-blog-sync.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkBlogSync() {
  console.log('🔍 Checking blog synchronization...\n');

  // Get all post files
  const postsDir = 'src/newblog/data/posts';
  const postFiles = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.json') && !f.includes('backup'));

  // Get registry entries
  const registry = fs.readFileSync('src/newblog/data/postRegistry.js', 'utf8');
  const registryMatches = [...registry.matchAll(/'([^']+)':/g)];
  const registrySlugs = registryMatches.map(m => m[1]);

  // Get metadata entries
  const metadata = JSON.parse(fs.readFileSync('src/newblog/data/metadata/index.json', 'utf8'));
  const metadataSlugs = metadata.map(m => m.slug);

  // Check for issues
  const issues = [];

  // Check each post file
  postFiles.forEach(file => {
    const slug = file.replace('.json', '');
    
    if (!registrySlugs.includes(slug)) {
      issues.push(`❌ ${slug} missing from postRegistry.js`);
    }
    
    if (!metadataSlugs.includes(slug)) {
      issues.push(`❌ ${slug} missing from metadata/index.json`);
    }

    // Check JSON validity
    try {
      const post = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
      
      // Check slug matches
      if (post.slug !== slug) {
        issues.push(`❌ ${slug} has mismatched slug in JSON: ${post.slug}`);
      }

      // Check image exists
      if (post.image) {
        const imagePath = path.join('public', post.image);
        if (!fs.existsSync(imagePath)) {
          issues.push(`❌ ${slug} references missing image: ${post.image}`);
        }
      }
    } catch (e) {
      issues.push(`❌ ${slug} has invalid JSON`);
    }
  });

  // Check for orphaned registry entries
  registrySlugs.forEach(slug => {
    if (!postFiles.includes(`${slug}.json`)) {
      issues.push(`❌ ${slug} in registry but file doesn't exist`);
    }
  });

  // Check for orphaned metadata entries
  metadataSlugs.forEach(slug => {
    if (!postFiles.includes(`${slug}.json`)) {
      issues.push(`❌ ${slug} in metadata but file doesn't exist`);
    }
  });

  // Report results
  if (issues.length === 0) {
    console.log('✅ All blog posts are properly synchronized!');
    console.log(`\n📊 Stats:`);
    console.log(`  - Post files: ${postFiles.length}`);
    console.log(`  - Registry entries: ${registrySlugs.length}`);
    console.log(`  - Metadata entries: ${metadataSlugs.length}`);
  } else {
    console.log(`❌ Found ${issues.length} synchronization issues:\n`);
    issues.forEach(issue => console.log(`  ${issue}`));
  }
}

checkBlogSync();
```

---

## 🔧 Troubleshooting

### Debug Checklist

When a post isn't working:

1. **Check browser console** for errors
2. **Verify JSON syntax**: `python3 -m json.tool <file>`
3. **Check network tab** for 404s
4. **Run sync checker**: `node check-blog-sync.js`
5. **Test image paths**: Manually visit image URLs
6. **Check for typos** in slugs across all three files

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch dynamically imported module" | Missing registry entry | Add to postRegistry.js |
| "Unexpected token < in JSON" | 404 error, HTML returned | Check file path and slug |
| "Cannot read property 'title' of undefined" | Malformed JSON | Validate JSON syntax |
| "Image not found" | Wrong path or missing file | Check image exists in public folder |

### Getting Help

1. **Check existing posts** for examples
2. **Run validation scripts** before committing
3. **Test locally** before pushing
4. **Create detailed commit messages** for debugging
5. **Ask for code review** on complex posts

---

## 📚 Additional Resources

### Markdown Reference
- [CommonMark Spec](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

### Image Optimization Tools
- [Squoosh](https://squoosh.app/) - Online image optimizer
- [ImageOptim](https://imageoptim.com/) - Mac app
- [WebP Converter](https://developers.google.com/speed/webp)

### SEO Best Practices
- Keep titles under 60 characters
- Meta descriptions: 150-160 characters
- Use keywords naturally
- Include internal links
- Optimize images with alt text

### Git Resources
- [Git Branching](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎯 Final Tips

1. **Always test locally first** - Never push untested changes
2. **Keep slugs consistent** - This is the #1 cause of issues
3. **Optimize images** - Large images slow down the site
4. **Write descriptive commits** - Help future maintainers
5. **Update the sitemap** - Don't forget this step!
6. **Check your work** - Use the validation scripts

Remember: The three-tier system (JSON files, Registry, Metadata) must always be in sync!

---

*Last updated: July 29, 2025*