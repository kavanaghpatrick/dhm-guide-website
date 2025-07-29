# 🚀 DHM Guide Blog Publishing - Quick Reference

## 🎯 Quick Command Reference

```bash
# Create new blog post (interactive)
node scripts/create-blog-post.js

# Validate a specific post
./scripts/validate-blog-post.sh your-post-slug

# Check all posts synchronization
node scripts/check-blog-sync.js

# Generate sitemap after changes
node scripts/generate-sitemap.js

# Test locally
npm run dev
```

## ✅ Publishing Checklist

```bash
# 1. Create post structure
node scripts/create-blog-post.js

# 2. Add hero image
cwebp -q 80 original.jpg -o public/images/your-slug-hero.webp

# 3. Edit content
code src/newblog/data/posts/your-slug.json

# 4. Validate
./scripts/validate-blog-post.sh your-slug

# 5. Test locally
npm run dev
# Visit: http://localhost:5173/never-hungover/your-slug

# 6. Generate sitemap
node scripts/generate-sitemap.js

# 7. Commit
git add .
git commit -m "Add blog post: Your Title"
git push
```

## 📁 File Locations

```
📦 DHM Guide Website
├── 📄 src/newblog/data/posts/[slug].json      ← Your blog post
├── 📄 src/newblog/data/postRegistry.js        ← Add import here
├── 📄 src/newblog/data/metadata/index.json    ← Add metadata here
├── 🖼️ public/images/[slug]-hero.webp          ← Hero image
└── 📄 public/sitemap.xml                       ← Auto-generated
```

## 🔧 JSON Template

```json
{
  "title": "Your Title (60-80 chars)",
  "slug": "url-friendly-slug-2025",
  "excerpt": "Brief summary for listings (150-160 chars)",
  "metaDescription": "SEO description (150-160 chars)",
  "date": "2025-07-29",
  "author": "DHM Guide Team",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "readTime": 10,
  "image": "/images/your-slug-hero.webp",
  "content": "# Your Markdown Content\n\n..."
}
```

## 🚨 Common Fixes

| Issue | Fix |
|-------|-----|
| Post not showing | Add to `metadata/index.json` |
| 404 error | Add to `postRegistry.js` |
| Image broken | Check path: `/images/slug-hero.webp` |
| Invalid JSON | Run: `python3 -m json.tool file.json` |

## 🛠️ Emergency Commands

```bash
# Fix all synchronization issues
node scripts/check-blog-sync.js

# Validate JSON syntax
python3 -m json.tool src/newblog/data/posts/your-slug.json

# Find missing images
ls -la public/images/*hero* | grep -v webp

# Check git status
git status
```

## 📞 Need Help?

1. Run `node scripts/check-blog-sync.js` to diagnose
2. Check `BLOG_PUBLISHING_GUIDE.md` for detailed instructions
3. Validate individual posts with `./scripts/validate-blog-post.sh`
4. Test locally before pushing

---

*Remember: The three-tier system (JSON, Registry, Metadata) must always be in sync!*