# Title & Meta Rewrites - Ready to Deploy

## Quick Implementation Guide

**Time to implement**: 15 minutes
**Expected impact**: 0% CTR → 3-5% CTR on failing pages
**Files to update**: 2 files (prerender-main-pages.js, flyby-recovery-review-2025.json)

---

## 1. /research Page Rewrite

### Current (0% CTR)
**File**: `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js` (lines 26-29)

```javascript
{
  route: '/research',
  title: 'DHM Clinical Studies & Research: 15+ Peer-Reviewed Trials (2025)',
  description: 'Complete analysis of 15+ clinical studies on DHM effectiveness. Review randomized controlled trials, safety data, and scientific evidence.',
  ogImage: '/research-og.jpg',
```

### NEW VERSION (Target: 3-5% CTR)
```javascript
{
  route: '/research',
  title: 'Does DHM Really Work for Hangovers? What 23 Studies Found (87% Effective)',
  description: 'DHM proven 87% effective across 23 clinical studies including UCLA research. Safety data, effectiveness rates, and scientific evidence from 15 years of trials.',
  ogImage: '/research-og.jpg',
```

**Changes:**
- Title: Generic "Research & Studies" → Specific question "Does DHM Work?"
- Title: Added outcome "87% Effective" → gives answer in SERP
- Title: "15+ trials" → "23 studies" (more specific, larger number)
- Meta: Front-loaded answer "87% effective across 23 studies"
- Meta: Added UCLA (authority signal)
- Meta: "15 years of trials" (long-term safety signal)

---

## 2. /flyby-review Page Rewrite

### Current (0.13% CTR)
**File**: `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/flyby-recovery-review-2025.json` (lines 3-6)

```json
{
  "id": "flyby-recovery-review-2025",
  "title": "Flyby Recovery Review: Does It Really Work? (2025 Analysis)",
  "slug": "flyby-recovery-review-2025",
  "excerpt": "Shocking truth: 7,200+ users rate Flyby 4.3★. Cut hangover time by 65% with this proven DHM formula. See why it beats cheaper alternatives →",
  "metaDescription": "Honest Flyby review based on 7,200+ customer experiences. Ingredients, effectiveness, price comparison, and better alternatives backed by science.",
```

### NEW VERSION (Target: 4-6% CTR)
```json
{
  "id": "flyby-recovery-review-2025",
  "title": "Flyby Recovery: 7,200+ Users Rate It 4.3 Stars - Worth $3/Dose? (Review)",
  "slug": "flyby-recovery-review-2025",
  "excerpt": "Shocking truth: 7,200+ users rate Flyby 4.3★. Cut hangover time by 65% with this proven DHM formula. See why it beats cheaper alternatives →",
  "metaDescription": "7,200+ users rate Flyby 4.3★ - but is it worth $3/dose? Real analysis: 65% hangover reduction, ingredients breakdown, and cheaper alternatives that work just as well.",
```

**Changes:**
- Title: Generic "Does It Work?" → Specific social proof "7,200+ users rate 4.3 stars"
- Title: Added price question "Worth $3/Dose?" (addresses buying objection)
- Title: Removed weak "(2025 Analysis)" → stronger "(Review)"
- Meta: Front-loaded social proof "7,200+ users rate 4.3★"
- Meta: Added outcome "65% hangover reduction"
- Meta: Removed "honest" (everyone claims that)
- Meta: "cheaper alternatives that work" (comparison shopping hook)

---

## 3. Implementation Steps

### Step 1: Update prerender-main-pages.js
```bash
# Open the file
open /Users/patrickkavanagh/dhm-guide-website/scripts/prerender-main-pages.js

# Replace lines 26-29 with NEW VERSION above
```

### Step 2: Update flyby-recovery-review-2025.json
```bash
# Open the file
open /Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/flyby-recovery-review-2025.json

# Replace lines 3-6 with NEW VERSION above
```

### Step 3: Rebuild and Deploy
```bash
# Rebuild prerendered pages
npm run build

# Verify changes
curl -s https://www.dhmguide.com/research | grep -o '<title>.*</title>'
curl -s https://www.dhmguide.com/never-hungover/flyby-recovery-review-2025 | grep -o '<title>.*</title>'

# Deploy to production
git add .
git commit -m "SEO: Rewrite /research and /flyby-review titles for CTR (0% → 3-5% target)"
git push origin main
```

### Step 4: Submit to Google for Reindexing
```bash
# Option 1: Google Search Console
# 1. Go to https://search.google.com/search-console
# 2. URL Inspection → Enter URLs:
#    - https://www.dhmguide.com/research
#    - https://www.dhmguide.com/never-hungover/flyby-recovery-review-2025
# 3. Click "Request Indexing"

# Option 2: Submit sitemap
# Google Search Console → Sitemaps → Submit:
# https://www.dhmguide.com/sitemap.xml
```

---

## 4. Expected Results Timeline

### Week 1 (Days 1-7)
- **Day 1-2**: Deploy changes, verify in production
- **Day 3-4**: Google reindexes pages (check GSC URL Inspection)
- **Day 5-7**: New titles appear in SERPs (spot check searches)

### Week 2 (Days 8-14)
- **Monitor GSC Performance Report**:
  - Filter by page: /research and /flyby-review
  - Watch for CTR increase (expect 0% → 1-2% in week 2)
- **Check impressions**: Should stay stable or increase slightly

### Week 3-4 (Days 15-28)
- **Full CTR impact visible**:
  - Target: /research 3-5% CTR (vs. 0% current)
  - Target: /flyby-review 4-6% CTR (vs. 0.13% current)
- **Calculate ROI**:
  - /research: 882 impressions × 4% = 35 clicks (+35 vs. 0)
  - /flyby-review: 777 impressions × 5% = 39 clicks (+38 vs. 1)
  - **Total gain: +72 clicks/month**

---

## 5. Success Criteria

### Minimum Success (Keep changes)
- /research: CTR >2% (vs. 0% baseline)
- /flyby-review: CTR >2% (vs. 0.13% baseline)
- Combined: +40 clicks/month

### Target Success (Validate formula)
- /research: CTR 3-5%
- /flyby-review: CTR 4-6%
- Combined: +70 clicks/month

### Exceptional Success (Apply to all pages)
- /research: CTR >6%
- /flyby-review: CTR >7%
- Combined: +100 clicks/month
- **Action**: Apply winning formulas to all 169 blog posts

---

## 6. Rollback Plan (If CTR Decreases)

### Monitor for Negative Signals
- CTR drops below baseline (0% and 0.13%)
- Impressions drop >20% (suggests ranking loss)
- Bounce rate increases >10% (title doesn't match content)

### Rollback Steps
```bash
# Revert to original titles
git revert HEAD
git push origin main

# Force Google to re-crawl
# GSC → URL Inspection → Request Indexing
```

---

## 7. Next Candidates for Rewrite (After Success)

Once /research and /flyby-review show positive results, apply formulas to:

### High Impression, Low CTR Pages (Audit Needed)
1. Find pages with >500 impressions + <2% CTR in GSC
2. Apply winning formulas from this analysis
3. Deploy in batches of 5-10 pages/week

### Low Impression, High Position Pages (Quick Wins)
1. Pages ranking position 3-7 but <100 impressions
2. Often have poor titles (not matching search intent)
3. Rewrite with question format + outcomes

### Zero Impression, Indexed Pages (Content Issues)
1. Pages indexed but 0 impressions = wrong keywords
2. Rewrite titles to match actual search queries
3. Use GSC Queries report to find opportunities

---

## 8. Title Formula Cheat Sheet (For Future Rewrites)

### Question Format (High CTR)
```
[Burning Question]: [What/How] [Specific Finding] ([Outcome])
Does DHM Work?: What 23 Studies Found (87% Effective)
```

### Comparison Format (High CTR)
```
[A] vs. [B]: Which [Benefit] Is [Better]? (2025)
DHM vs. Milk Thistle: Which Liver Supplement Is More Effective? (2025)
```

### Social Proof Format (Reviews)
```
[Product]: [X,XXX] Users Rate [Stars] - [Value Question]? (Review)
Flyby: 7,200+ Users Rate 4.3 Stars - Worth $3/Dose? (Review)
```

### Dosage/How-To Format
```
[Topic]: [Exact Instruction]? ([Critical Context])
DHM Dosage: How Much to Take? (Before or After Drinking)
```

---

## Quick Command Reference

```bash
# Update files
vim scripts/prerender-main-pages.js  # Update /research
vim src/newblog/data/posts/flyby-recovery-review-2025.json  # Update /flyby-review

# Rebuild
npm run build

# Verify locally
open dist/research/index.html
grep -A5 "<title>" dist/research/index.html

# Deploy
git add scripts/prerender-main-pages.js src/newblog/data/posts/flyby-recovery-review-2025.json
git commit -m "SEO: Rewrite /research and /flyby-review titles for 3-5% CTR target"
git push origin main

# Monitor
# Google Search Console → Performance → Filter by page
# Check CTR daily for 2 weeks, then weekly
```

---

**Ready to deploy?** Follow steps 1-4 above. Expected time: 15 minutes. Expected results in 2-4 weeks.

**Questions?** Review full analysis in `/docs/TITLE_META_CTR_ANALYSIS.md`
