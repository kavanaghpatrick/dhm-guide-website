# 🚀 DHM Guide Blog - Deployment & Recovery Guide

## 📦 Deployment Process

### Understanding the Deployment Pipeline

The DHM Guide blog uses an automated deployment pipeline:

```
Local Changes → Git Push → GitHub → CI/CD → Build → Deploy → Live Site
```

### Deployment Workflow

1. **Local Development** → Test changes locally
2. **Git Push** → Triggers automated deployment
3. **Build Process** → Validates and bundles content
4. **Deployment** → Updates live site
5. **Cache Invalidation** → Ensures fresh content

### Monitoring Deployment

After pushing changes:

```bash
# 1. Check GitHub Actions (if configured)
# Visit: https://github.com/[your-org]/dhm-guide-website/actions

# 2. Monitor build logs for errors

# 3. Verify live site (usually 2-5 minutes)
# Visit: https://www.dhmguide.com/never-hungover/your-post-slug

# 4. Check browser console for errors
# Open DevTools (F12) and check Console tab
```

### Common Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Invalid JSON | Run validation locally first |
| 404 on live site | Missing registry entry | Check all 3 sync points |
| Old content showing | Cache not cleared | Hard refresh (Ctrl+Shift+R) |
| Images not loading | Wrong path or missing file | Verify image exists in public/images |

## 🔄 Recovery Procedures

### 1. Reverting a Bad Commit

If you pushed broken changes:

```bash
# Option 1: Revert the last commit
git revert HEAD
git push

# Option 2: Reset to previous commit (careful!)
git reset --hard HEAD~1
git push --force

# Option 3: Create a fix commit
# Edit the broken files
git add .
git commit -m "Fix: Correct blog post errors"
git push
```

### 2. Recovering Deleted Content

If you accidentally deleted a post:

```bash
# 1. Find the commit where it existed
git log --all --full-history -- "src/newblog/data/posts/deleted-post.json"

# 2. Restore the file
git checkout <commit-hash> -- "src/newblog/data/posts/deleted-post.json"

# 3. Also restore registry and metadata entries
# Then commit the restoration
git add .
git commit -m "Restore: Bring back deleted post"
git push
```

### 3. Fixing Sync Issues

When the three-tier system is out of sync:

```bash
# 1. Run the sync checker
node scripts/check-blog-sync.js

# 2. For missing registry entries
# Edit src/newblog/data/postRegistry.js
# Add: 'your-slug': () => import('./posts/your-slug.json'),

# 3. For missing metadata
# Edit src/newblog/data/metadata/index.json
# Add the metadata object

# 4. Regenerate sitemap
node scripts/generate-sitemap.js

# 5. Commit all fixes together
git add .
git commit -m "Fix: Synchronize blog system components"
git push
```

### 4. Emergency Rollback

If the site is completely broken:

```bash
# 1. Find the last known good commit
git log --oneline -20

# 2. Create a new branch from that commit
git checkout -b emergency-fix <good-commit-hash>

# 3. Force push to main (requires admin rights)
git push --force origin emergency-fix:main

# 4. Later, properly fix the issues
git checkout main
git pull
# Fix issues properly...
```

## 💾 Backup Strategies

### 1. Automated Backups

```bash
# Create a backup script (backup-blog.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/blog_$DATE"

mkdir -p $BACKUP_DIR
cp -r src/newblog/data/posts $BACKUP_DIR/
cp src/newblog/data/postRegistry.js $BACKUP_DIR/
cp src/newblog/data/metadata/index.json $BACKUP_DIR/
cp -r public/images/*hero* $BACKUP_DIR/

echo "Backup created: $BACKUP_DIR"
```

### 2. Git-Based Backups

```bash
# Tag important states
git tag -a "blog-backup-2025-07-29" -m "Backup before major changes"
git push --tags

# Create backup branch
git checkout -b backup/2025-07-29
git push -u origin backup/2025-07-29
git checkout main
```

### 3. Export All Content

```bash
# Create export script (export-blog.js)
import fs from 'fs';
import path from 'path';

const posts = fs.readdirSync('src/newblog/data/posts');
const exportData = {
  posts: [],
  metadata: JSON.parse(fs.readFileSync('src/newblog/data/metadata/index.json')),
  registry: fs.readFileSync('src/newblog/data/postRegistry.js', 'utf8'),
  exportDate: new Date().toISOString()
};

posts.forEach(file => {
  if (file.endsWith('.json')) {
    const content = fs.readFileSync(path.join('src/newblog/data/posts', file));
    exportData.posts.push(JSON.parse(content));
  }
});

fs.writeFileSync('blog-export.json', JSON.stringify(exportData, null, 2));
console.log('Blog exported to blog-export.json');
```

## 🚨 Disaster Recovery Plan

### If Everything is Broken

1. **Don't Panic** - Git has your history
2. **Check GitHub** - Is the repo still intact?
3. **Clone Fresh** - Start with a clean copy
4. **Check Backups** - Use tagged versions or backup branches
5. **Rebuild Incrementally** - Test each change

### Recovery Checklist

- [ ] Identify the last working state
- [ ] Create a recovery branch
- [ ] Restore files one by one
- [ ] Test locally after each restoration
- [ ] Run validation scripts
- [ ] Deploy to staging first (if available)
- [ ] Monitor error logs during deployment
- [ ] Verify all posts are accessible
- [ ] Document what went wrong

## 🔍 Debugging Deployment Issues

### Check Build Logs

Look for these common errors:

```
❌ "Cannot find module './posts/new-post.json'"
→ Missing from postRegistry.js

❌ "Unexpected token < in JSON at position 0"
→ Invalid JSON syntax

❌ "ENOENT: no such file or directory"
→ Referenced file doesn't exist

❌ "Build exceeded maximum time"
→ Too many large images or infinite loop
```

### Verify Deployment

```bash
# 1. Check if post appears in sitemap
curl https://www.dhmguide.com/sitemap.xml | grep "your-post-slug"

# 2. Test direct URL
curl -I https://www.dhmguide.com/never-hungover/your-post-slug

# 3. Check image loading
curl -I https://www.dhmguide.com/images/your-post-hero.webp
```

## 📊 Performance Monitoring

After deployment, monitor:

1. **Page Load Time** - Should be < 3 seconds
2. **Image Load Time** - Should be < 1 second
3. **Build Time** - Should be < 5 minutes
4. **Error Rate** - Should be 0%

### Performance Checklist

- [ ] Images optimized (< 200KB)
- [ ] JSON files valid
- [ ] No console errors
- [ ] All links working
- [ ] Metadata properly indexed

## 🆘 Getting Emergency Help

If you can't resolve issues:

1. **Document the problem**:
   - Error messages (exact text)
   - Steps that led to the issue
   - What you've tried
   - Current Git commit hash

2. **Create a GitHub issue** with:
   - Clear title
   - Full error logs
   - Steps to reproduce
   - Expected vs actual behavior

3. **Emergency contacts**:
   - Check repository README for maintainer contacts
   - Use GitHub issues for non-urgent matters
   - Tag with `urgent` for critical issues

---

*Remember: Version control means nothing is truly lost. Stay calm and use Git's power!*