# PRD: Comparison Post Restoration Project

## Executive Summary

This document outlines the complete restoration of 23 deleted product comparison posts to recover 21.6% of lost site traffic. The project is divided into 5 phases with specific deliverables and success metrics.

## External Review Status

- [x] **Grok API Review**: NEEDS REVISION → Issues addressed below
- [x] **Gemini CLI Review**: NEEDS REVISION → Issues addressed below
- [x] **Revisions Applied**: Version 2.0

## Key Reviewer Feedback Addressed

| Issue | Source | Resolution |
|-------|--------|------------|
| Missing version control | Both | Added git branch workflow to all phases |
| File naming inconsistency (double-wood-dhm-vs-*) | Both | Added explicit file list + verification |
| Pre-flight file verification | Gemini | Added backup verification step |
| Local testing (not production URLs) | Gemini | Changed to localhost:4173 |
| Backup before metadata modification | Grok | Added backup step to Phase 2 |
| Phase 3 relationship logic undefined | Gemini | Added explicit mapping strategy |
| Phase 5 truncated | Grok | Completed full monitoring plan |
| Error handling in scripts | Grok | Added try-catch and validation |

---

## Prerequisites (CRITICAL)

Before starting ANY phase:

```bash
# 1. Create feature branch
git checkout -b feature/restore-comparison-posts

# 2. Verify backup files exist (expect 23)
ls encoding-backup/*-vs-*.json | wc -l

# 3. Verify specific files exist (naming inconsistency check)
ls encoding-backup/double-wood-dhm-vs-dhm1000-comparison-2025.json
ls encoding-backup/flyby-vs-fuller-health-complete-comparison.json

# 4. Ensure clean working directory
git status  # Should show no uncommitted changes
```

**ABORT if any verification fails.**

---

# Phase 1: Restore 23 Comparison Posts from Backup

## Problem Statement

On October 20, 2025, 23 product comparison posts were deleted from DHM Guide. These posts:
- Drove 21.6% of all site traffic (42 of 194 clicks)
- Had 60% better CTR than site average (6.07% vs 3.8%)
- Averaged 7,000-13,000 words of high-quality content
- Targeted high-intent "Product A vs Product B" keywords

The replacement strategy (static table on /reviews) failed:
- Comparison hub page received 0 impressions in 3 months
- 27 orphaned metadata entries now cause 404 errors
- Internal links point to non-existent pages

## Proposed Solution

Restore all 23 comparison posts from the `encoding-backup/` directory to `src/newblog/data/posts/`.

## Success Metrics

- [ ] All 23 JSON files restored to posts directory
- [ ] All 23 posts accessible via their original URLs
- [ ] Build completes without errors
- [ ] Sitemap includes all 23 restored URLs
- [ ] GSC shows restored URLs as "Discovered" within 7 days

## Technical Requirements

### Files to Restore (23 total)

**Flyby Comparisons (8):**
1. flyby-vs-cheers-complete-comparison-2025.json
2. flyby-vs-dhm1000-complete-comparison-2025.json
3. flyby-vs-double-wood-complete-comparison-2025.json
4. flyby-vs-fuller-health-complete-comparison.json
5. flyby-vs-good-morning-pills-complete-comparison-2025.json
6. flyby-vs-no-days-wasted-complete-comparison-2025.json
7. flyby-vs-nusapure-complete-comparison-2025.json
8. flyby-vs-toniiq-ease-complete-comparison-2025.json

**Double Wood Comparisons (8):**
1. double-wood-dhm-vs-dhm1000-comparison-2025.json
2. double-wood-vs-cheers-restore-dhm-comparison-2025.json
3. double-wood-vs-dhm-depot-comparison-2025.json
4. double-wood-vs-fuller-health-after-party-comparison-2025.json
5. double-wood-vs-good-morning-hangover-pills-comparison-2025.json
6. double-wood-vs-no-days-wasted-dhm-comparison-2025.json
7. double-wood-vs-nusapure-dhm-comparison-2025.json
8. double-wood-vs-toniiq-ease-dhm-comparison-2025.json

**No Days Wasted Comparisons (7):**
1. no-days-wasted-vs-cheers-restore-dhm-comparison-2025.json
2. no-days-wasted-vs-dhm-depot-comparison-2025.json
3. no-days-wasted-vs-dhm1000-comparison-2025.json
4. no-days-wasted-vs-fuller-health-after-party-comparison-2025.json
5. no-days-wasted-vs-good-morning-hangover-pills-comparison-2025.json
6. no-days-wasted-vs-nusapure-dhm-comparison-2025.json
7. no-days-wasted-vs-toniiq-ease-dhm-comparison-2025.json

### Implementation Steps

```bash
# Step 0: Create branch (if not already done)
git checkout -b feature/restore-comparison-posts

# Step 1: Verify all 23 source files exist BEFORE copying
echo "=== Verifying source files ==="
EXPECTED_FILES=(
  "flyby-vs-cheers-complete-comparison-2025.json"
  "flyby-vs-dhm1000-complete-comparison-2025.json"
  "flyby-vs-double-wood-complete-comparison-2025.json"
  "flyby-vs-fuller-health-complete-comparison.json"
  "flyby-vs-good-morning-pills-complete-comparison-2025.json"
  "flyby-vs-no-days-wasted-complete-comparison-2025.json"
  "flyby-vs-nusapure-complete-comparison-2025.json"
  "flyby-vs-toniiq-ease-complete-comparison-2025.json"
  "double-wood-dhm-vs-dhm1000-comparison-2025.json"
  "double-wood-vs-cheers-restore-dhm-comparison-2025.json"
  "double-wood-vs-dhm-depot-comparison-2025.json"
  "double-wood-vs-fuller-health-after-party-comparison-2025.json"
  "double-wood-vs-good-morning-hangover-pills-comparison-2025.json"
  "double-wood-vs-no-days-wasted-dhm-comparison-2025.json"
  "double-wood-vs-nusapure-dhm-comparison-2025.json"
  "double-wood-vs-toniiq-ease-dhm-comparison-2025.json"
  "no-days-wasted-vs-cheers-restore-dhm-comparison-2025.json"
  "no-days-wasted-vs-dhm-depot-comparison-2025.json"
  "no-days-wasted-vs-dhm1000-comparison-2025.json"
  "no-days-wasted-vs-fuller-health-after-party-comparison-2025.json"
  "no-days-wasted-vs-good-morning-hangover-pills-comparison-2025.json"
  "no-days-wasted-vs-nusapure-dhm-comparison-2025.json"
  "no-days-wasted-vs-toniiq-ease-dhm-comparison-2025.json"
)

MISSING=0
for file in "${EXPECTED_FILES[@]}"; do
  if [ ! -f "encoding-backup/$file" ]; then
    echo "MISSING: $file"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo "ERROR: $MISSING files missing. ABORTING."
  exit 1
fi
echo "All 23 files verified."

# Step 2: Copy files from backup (explicit patterns to handle naming inconsistency)
cp encoding-backup/flyby-vs-*.json src/newblog/data/posts/
cp encoding-backup/double-wood-vs-*.json src/newblog/data/posts/
cp encoding-backup/double-wood-dhm-vs-*.json src/newblog/data/posts/  # Note: different pattern!
cp encoding-backup/no-days-wasted-vs-*.json src/newblog/data/posts/

# Step 3: Verify copy succeeded (expect 23 comparison files)
COPIED=$(ls src/newblog/data/posts/*-vs-*.json 2>/dev/null | wc -l)
echo "Copied $COPIED comparison files"
if [ "$COPIED" -lt 23 ]; then
  echo "WARNING: Expected 23 files, got $COPIED"
fi

# Step 4: Regenerate post registry
node scripts/generate-post-registry.js

# Step 5: Verify registry was updated
git diff src/newblog/data/postRegistry.js | head -50

# Step 6: Build and test locally
npm run build
npm run preview &
sleep 5

# Step 7: Test URLs locally (NOT production!)
curl -s -o /dev/null -w "%{http_code}" "http://localhost:4173/never-hungover/flyby-vs-cheers-complete-comparison-2025"
# Should return 200

# Step 8: Commit changes
git add src/newblog/data/posts/*-vs-*.json
git add src/newblog/data/postRegistry.js
git commit -m "feat: Restore 23 comparison posts from backup (Phase 1)"
```

### Files to Modify

1. `src/newblog/data/postRegistry.js` - Add 23 new imports
2. `public/sitemap.xml` - Will be auto-generated with new URLs

### Verification Checklist

- [ ] `ls src/newblog/data/posts/*-vs-*.json | wc -l` returns 23+
- [ ] `npm run build` completes without errors
- [ ] Each URL returns 200 status: `curl -s -o /dev/null -w "%{http_code}" https://www.dhmguide.com/never-hungover/[slug]`
- [ ] Sitemap contains all 23 new URLs

## Rollback Plan

If issues occur:
```bash
# Remove restored files
rm src/newblog/data/posts/flyby-vs-*.json
rm src/newblog/data/posts/double-wood-vs-*.json
rm src/newblog/data/posts/no-days-wasted-vs-*.json
rm src/newblog/data/posts/double-wood-dhm-vs-*.json

# Regenerate registry and rebuild
node scripts/generate-post-registry.js
npm run build
```

## Estimated Effort

- Implementation: 1-2 hours
- Testing: 30 minutes
- Deployment: 15 minutes
- **Total: 2-3 hours**

---

# Phase 2: Clean Up Orphaned Metadata Entries

## Problem Statement

The `src/newblog/data/metadata/index.json` file contains 27 orphaned entries - slugs that reference posts which no longer exist. This causes:
- Blog listing showing posts that 404 when clicked
- Potential SEO issues from linking to non-existent pages
- Confusing user experience

## Proposed Solution

After Phase 1 restores 23 posts, only 4 orphaned entries should remain. Remove these 4 entries from metadata.

## Expected Orphaned Entries After Phase 1

Based on analysis, these 4 non-product comparisons should remain deleted:
1. `smart-sleep-tech-alcohol-circadian-optimization-guide-2025` (redirects to different URL)
2. `quantum-health-monitoring-alcohol-guide-2025` (empty content)
3. `alcohol-hormones-complete-endocrine-impact-guide-2025` (never existed)
4. `cold-therapy-alcohol-recovery-complete-guide-2025` (duplicate of existing post)

## Technical Requirements

### Implementation Steps

```javascript
// scripts/clean-orphaned-metadata.js
// Script to remove orphaned metadata entries with safety checks

const fs = require('fs');
const path = require('path');

const metadataPath = './src/newblog/data/metadata/index.json';
const backupPath = './src/newblog/data/metadata/index.json.backup-' + Date.now();
const postsDir = './src/newblog/data/posts';

// DRY RUN MODE - set to false to actually modify files
const DRY_RUN = process.argv.includes('--dry-run');

try {
  // Step 1: Verify files exist
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata file not found: ${metadataPath}`);
  }
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }

  // Step 2: Create backup BEFORE any modifications
  console.log(`Creating backup at: ${backupPath}`);
  fs.copyFileSync(metadataPath, backupPath);
  console.log('Backup created successfully');

  // Step 3: Load metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  console.log(`Loaded ${metadata.length} metadata entries`);

  // Step 4: Get actual post files
  const actualPosts = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('archived'))
    .map(f => f.replace('.json', ''));
  console.log(`Found ${actualPosts.length} actual post files`);

  // Step 5: Identify orphans
  const orphans = metadata.filter(entry => !actualPosts.includes(entry.slug));
  console.log(`\n=== ORPHANED ENTRIES (${orphans.length}) ===`);
  orphans.forEach(o => console.log(`  - ${o.slug}`));

  // Step 6: Filter to only existing posts
  const cleanedMetadata = metadata.filter(entry => actualPosts.includes(entry.slug));

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would remove ${orphans.length} orphaned entries`);
    console.log('[DRY RUN] Run without --dry-run to apply changes');
  } else {
    // Step 7: Write back
    fs.writeFileSync(metadataPath, JSON.stringify(cleanedMetadata, null, 2));
    console.log(`\n✅ Removed ${orphans.length} orphaned entries`);
    console.log(`Metadata now has ${cleanedMetadata.length} entries`);
    console.log(`Backup preserved at: ${backupPath}`);
  }

} catch (error) {
  console.error(`\n❌ ERROR: ${error.message}`);
  console.error('No changes made. Check the error and retry.');
  process.exit(1);
}
```

**Usage:**
```bash
# First, run in dry-run mode to verify
node scripts/clean-orphaned-metadata.js --dry-run

# If output looks correct, run for real
node scripts/clean-orphaned-metadata.js

# Commit the change
git add src/newblog/data/metadata/index.json
git commit -m "fix: Remove orphaned metadata entries (Phase 2)"
```

### Verification Checklist

- [ ] Run orphan detection script - should return 0 orphans
- [ ] Blog listing page shows no broken posts
- [ ] All listed posts are clickable and load correctly

## Success Metrics

- [ ] 0 orphaned metadata entries
- [ ] Blog listing shows only valid posts
- [ ] No 404 errors from internal navigation

## Estimated Effort

- Implementation: 30 minutes
- Testing: 15 minutes
- **Total: 45 minutes**

---

# Phase 3: Implement Hub-and-Spoke Internal Linking

## Problem Statement

Research revealed that before deletion, comparison posts were "dead ends" with:
- 0 internal links to other blog content
- Only external links to Amazon/product pages
- No link equity distribution to rest of site

This architectural flaw reduced SEO value. When restoring posts, we must fix this.

## Proposed Solution

Implement proper hub-and-spoke internal linking:
1. **Hub** = `/reviews` page links to top comparison posts
2. **Spokes** = Each comparison post links back to `/reviews` and to 2-3 related comparisons
3. **Cross-links** = Related comparisons link to each other

## Technical Requirements

### Hub Page Updates (`src/pages/Reviews.jsx`)

Add "Popular Comparisons" section:

```jsx
const popularComparisons = [
  { title: "DHM vs Milk Thistle", slug: "dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025", clicks: 9 },
  { title: "NAC vs DHM", slug: "nac-vs-dhm-which-antioxidant-better-liver-protection-2025", clicks: 6 },
  { title: "No Days Wasted vs Good Morning", slug: "no-days-wasted-vs-good-morning-hangover-pills-comparison-2025", clicks: 5 },
  { title: "Flyby vs Cheers", slug: "flyby-vs-cheers-complete-comparison-2025", clicks: 4 },
  { title: "DHM vs ZBiotics", slug: "dhm-vs-zbiotics", clicks: 3 },
];

// Add section after product table
<section className="mt-12">
  <h2>Popular Product Comparisons</h2>
  <p>Can't decide between two specific products? Check out our detailed head-to-head comparisons:</p>
  <ul>
    {popularComparisons.map(comp => (
      <li key={comp.slug}>
        <Link to={`/never-hungover/${comp.slug}`}>{comp.title}</Link>
      </li>
    ))}
  </ul>
</section>
```

### Spoke Post Updates (23 comparison posts)

Add to each comparison post JSON:

```json
{
  "relatedComparisons": [
    "flyby-vs-cheers-complete-comparison-2025",
    "no-days-wasted-vs-cheers-restore-dhm-comparison-2025"
  ],
  "hubLink": "/reviews",
  "internalLinks": {
    "reviews": "/reviews",
    "dosageGuide": "/never-hungover/dhm-dosage-guide-2025",
    "scienceExplained": "/never-hungover/dhm-science-explained"
  }
}
```

### Link Equity Flow (Target Architecture)

```
/reviews (Hub)
    ↓ links to
[Top 10 Comparison Posts]
    ↓ each links to
- /reviews (back to hub)
- 2-3 related comparisons (cross-links)
- 2-3 supporting content pieces (dosage guide, science explained)
    ↓ distributes equity to
[Entire site benefits]
```

### Implementation Steps

1. Update Reviews.jsx with "Popular Comparisons" section
2. Create script to add `relatedComparisons` field to each comparison post
3. Update NewBlogPost.jsx to render related comparison links
4. Verify all links work

## Success Metrics

- [ ] /reviews page links to 10+ comparison posts
- [ ] Each comparison post links back to /reviews
- [ ] Each comparison post links to 2-3 related comparisons
- [ ] Internal link count increases from ~7 to 100+

## Estimated Effort

- Reviews.jsx update: 1 hour
- Script to update posts: 1 hour
- Component updates: 1 hour
- Testing: 30 minutes
- **Total: 3.5 hours**

---

# Phase 4: Fix Broken Internal Links in Existing Posts

## Problem Statement

3 existing posts contain broken internal links to deleted comparison posts:
1. `complete-hangover-science-hub-2025.json` - 23 broken links
2. `fuller-health-after-party-review-2025.json` - uses deleted comparison image
3. `good-morning-hangover-pills-review-2025.json` - uses deleted comparison image

After Phase 1 restores the comparison posts, these links will work again. However, we should verify and potentially enhance the links.

## Proposed Solution

1. After Phase 1, verify all internal links in hub post work
2. Check image references in review posts
3. Add any missing cross-links

## Technical Requirements

### Verification Script

```javascript
const fs = require('fs');
const path = require('path');

const postsDir = './src/newblog/data/posts';
const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

const allSlugs = posts.map(f => f.replace('.json', ''));

posts.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
  const post = JSON.parse(content);

  // Check for internal links in content
  const linkMatches = content.match(/\/never-hungover\/[a-z0-9-]+/g) || [];
  const brokenLinks = linkMatches.filter(link => {
    const slug = link.replace('/never-hungover/', '');
    return !allSlugs.includes(slug);
  });

  if (brokenLinks.length > 0) {
    console.log(`${file}: ${brokenLinks.length} broken links`);
    brokenLinks.forEach(link => console.log(`  - ${link}`));
  }
});
```

### Expected Results After Phase 1

- Hub post: 0 broken links (all 23 comparisons restored)
- Review posts: Verify image paths exist

## Success Metrics

- [ ] 0 broken internal links site-wide
- [ ] All image references resolve to existing files
- [ ] Link checker passes with 100% success

## Estimated Effort

- Verification: 30 minutes
- Fixes (if needed): 30 minutes
- **Total: 1 hour**

---

# Phase 5: Monitor and Optimize Restored Posts

## Problem Statement

Restoring posts is only the first step. To maximize SEO recovery, we need to:
1. Submit URLs for reindexing
2. Monitor GSC for impressions/clicks
3. Optimize underperforming posts
4. Track conversion impact

## Proposed Solution

Implement a 60-day monitoring plan with weekly checkpoints.

## Technical Requirements

### Day 1: Submit for Reindexing

```bash
# Submit all 23 URLs to GSC for reindexing
# Use GSC URL Inspection API or manual submission

URLS=(
  "https://www.dhmguide.com/never-hungover/flyby-vs-cheers-complete-comparison-2025"
  "https://www.dhmguide.com/never-hungover/no-days-wasted-vs-cheers-restore-dhm-comparison-2025"
  # ... all 23 URLs
)

for url in "${URLS[@]}"; do
  echo "Submitting: $url"
  # Use GSC API or manual submission
done
```

### Week 1-2: Monitor Indexing

Track in GSC:
- [ ] URLs discovered
- [ ] URLs crawled
- [ ] URLs indexed
- [ ] Any errors or warnings

### Week 3-4: Analyze Initial Performance

Compare restored posts to baseline:
- Impressions vs pre-deletion
- CTR vs pre-deletion
- Average position vs pre-deletion

### Week 5-8: Optimize Underperformers

For posts with high impressions but low CTR:
1. Improve title tags
2. Enhance meta descriptions
3. Add FAQ schema for rich snippets

For posts with good CTR but low impressions:
1. Build backlinks
2. Add internal links from high-traffic pages
3. Share on social media

## Success Metrics

| Metric | Baseline (Pre-Deletion) | Target (Week 8) |
|--------|------------------------|-----------------|
| Comparison traffic | 42 clicks/month | 35+ clicks/month (83%+ recovery) |
| Average CTR | 6.07% | 6%+ |
| Average position | 8.79 | <10 |
| Total impressions | 1,932/month | 1,500+/month |

## Weekly Checkpoint Template

```markdown
## Week X Checkpoint

### Indexing Status
- Indexed: X/23
- Pending: X/23
- Errors: X

### Traffic Metrics
- Clicks: X (vs baseline 42)
- Impressions: X (vs baseline 1,932)
- CTR: X% (vs baseline 6.07%)

### Top Performers
1. [slug] - X clicks, X% CTR
2. [slug] - X clicks, X% CTR
3. [slug] - X clicks, X% CTR

### Action Items
- [ ] Optimize title for [slug]
- [ ] Build backlinks to [slug]
- [ ] Add internal links from [high-traffic page]
```

## Estimated Effort

- Initial submission: 1 hour
- Weekly monitoring: 30 minutes/week × 8 weeks = 4 hours
- Optimization work: 2-4 hours total
- **Total: 7-9 hours over 8 weeks**

---

# Project Summary

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 1 | Restore 23 comparison posts | 2-3 hours | None |
| 2 | Clean up orphaned metadata | 45 minutes | Phase 1 |
| 3 | Implement hub-and-spoke linking | 3.5 hours | Phase 1 |
| 4 | Fix broken internal links | 1 hour | Phase 1 |
| 5 | Monitor and optimize | 7-9 hours (8 weeks) | Phases 1-4 |

**Total Implementation: 7-8 hours**
**Total Monitoring: 7-9 hours over 8 weeks**

## Expected Outcomes

- **Traffic Recovery**: 83%+ of lost comparison traffic (35+ clicks/month)
- **SEO Improvement**: Proper hub-and-spoke architecture distributes link equity
- **User Experience**: No more 404s, better internal navigation
- **Competitive Position**: Regain comparison keyword rankings

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build failures | Low | High | Test locally before deploy |
| Duplicate content concerns | Very Low | Medium | Content is unique per post |
| Slow reindexing | Medium | Low | Submit to GSC, be patient |
| Lower traffic than expected | Low | Medium | Optimize titles/metas |

## Approval

- [ ] Technical review completed
- [ ] SEO strategy validated
- [ ] External AI review (Grok + Gemini) passed
- [ ] Ready for implementation
