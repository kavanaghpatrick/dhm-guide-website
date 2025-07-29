# 📚 DHM Guide Blog Documentation Hub

Welcome to the comprehensive documentation for publishing content on the DHM Guide blog. This hub connects you to all the resources you need to successfully create, publish, and maintain blog posts.

## 🗺️ Documentation Overview

### Getting Started
1. **[Initial Setup & Prerequisites](BLOG_PUBLISHING_SETUP.md)** 📋
   - Software requirements
   - Repository access
   - Environment configuration
   - Security guidelines

### Core Guides
2. **[Comprehensive Publishing Guide](BLOG_PUBLISHING_GUIDE.md)** 📝
   - Complete step-by-step process
   - Three-tier architecture explanation
   - Image guidelines
   - JSON structure reference
   - Git workflow
   - Troubleshooting

3. **[Quick Reference](BLOG_PUBLISHING_QUICK_REFERENCE.md)** 🚀
   - Command cheat sheet
   - Publishing checklist
   - JSON template
   - Common fixes

### Advanced Topics
4. **[Deployment & Recovery Guide](BLOG_DEPLOYMENT_RECOVERY.md)** 🔄
   - Understanding deployment pipeline
   - Monitoring deployments
   - Recovery procedures
   - Backup strategies
   - Emergency response

## 🛠️ Available Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `create-blog-post.js` | Interactive post creator | `node scripts/create-blog-post.js` |
| `validate-blog-post.sh` | Validate single post | `./scripts/validate-blog-post.sh [slug]` |
| `check-blog-sync.js` | Check all posts sync | `node scripts/check-blog-sync.js` |
| `generate-sitemap.js` | Update sitemap | `node scripts/generate-sitemap.js` |

## 🎯 Quick Start Path

### For New Publishers
1. Read [Setup Guide](BLOG_PUBLISHING_SETUP.md) → Set up environment
2. Review [Quick Reference](BLOG_PUBLISHING_QUICK_REFERENCE.md) → Understand basics
3. Try `node scripts/create-blog-post.js` → Create test post
4. Follow [Publishing Guide](BLOG_PUBLISHING_GUIDE.md) → Learn full process

### For Experienced Users
- Jump to [Quick Reference](BLOG_PUBLISHING_QUICK_REFERENCE.md) for commands
- Use automation tools in `/scripts/`
- Refer to [Deployment Guide](BLOG_DEPLOYMENT_RECOVERY.md) for advanced topics

## 📊 System Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  JSON Files     │ ──> │ Post Registry │ ──> │  Metadata   │
│ (Full Content)  │     │  (Imports)    │     │  (Listings) │
└─────────────────┘     └──────────────┘     └─────────────┘
        ↓                       ↓                     ↓
        └───────────────────────┴─────────────────────┘
                               ↓
                        ┌─────────────┐
                        │  React App  │
                        │ (Frontend)  │
                        └─────────────┘
```

## ❓ Common Questions

### "Where do I start?"
→ Read [Setup Guide](BLOG_PUBLISHING_SETUP.md), then use `create-blog-post.js`

### "My post isn't showing up"
→ Run `node scripts/check-blog-sync.js` to diagnose

### "I made a mistake and pushed it"
→ See [Recovery Procedures](BLOG_DEPLOYMENT_RECOVERY.md#recovery-procedures)

### "How do I update an existing post?"
→ Edit the JSON file, keep the same slug, regenerate sitemap

### "What image format should I use?"
→ WebP format, under 200KB, see [Image Guidelines](BLOG_PUBLISHING_GUIDE.md#image-guidelines)

## 🚨 Critical Rules

1. **Always test locally** before pushing (`npm run dev`)
2. **Never change slugs** of published posts (breaks URLs)
3. **Keep all three tiers in sync** (JSON, Registry, Metadata)
4. **Run validation** before committing
5. **Use branches** for major changes

## 📈 Best Practices

- ✅ Use descriptive commit messages
- ✅ Validate JSON syntax before committing
- ✅ Optimize images before uploading
- ✅ Test on multiple devices/browsers
- ✅ Keep backups of important content
- ✅ Document any custom changes

## 🆘 Getting Help

1. **First**: Check the relevant guide above
2. **Second**: Run diagnostic tools (`check-blog-sync.js`)
3. **Third**: Search existing GitHub issues
4. **Finally**: Create a new issue with:
   - Clear problem description
   - Steps to reproduce
   - Error messages
   - What you've already tried

## 🔄 Documentation Updates

These guides are living documents. If you find issues or have improvements:

1. Note the problem/improvement
2. Test your solution
3. Submit a pull request
4. Update the "Last Updated" date

---

**Quick Links:**
- [Setup](BLOG_PUBLISHING_SETUP.md) | [Full Guide](BLOG_PUBLISHING_GUIDE.md) | [Quick Ref](BLOG_PUBLISHING_QUICK_REFERENCE.md) | [Deployment](BLOG_DEPLOYMENT_RECOVERY.md)

*Last Updated: July 29, 2025*