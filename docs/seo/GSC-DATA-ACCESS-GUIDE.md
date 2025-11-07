# Google Search Console Data Access Guide
**Project:** DHM Guide Website
**Purpose:** Extract traffic data for prioritizing thin content expansion
**Date:** 2025-11-07

---

## Executive Summary

**Current Status:** ✅ Manual GSC exports already available
**Latest Export:** November 6, 2025 (last 3 months of data)
**No API Setup Required:** Manual CSV exports are sufficient for this analysis
**Target:** Get traffic data for 9 specific thin content posts to prioritize which 2-3 to expand first

---

## Available Data Sources

### 1. Recent GSC Performance Export (READY TO USE)
**Location:** `/Users/patrickkavanagh/Downloads/dhmguide.com-Performance-on-Search-2025-11-06/`

**Files Available:**
- `Pages.csv` - 133 pages with clicks, impressions, CTR, position (Last 3 months)
- `Queries.csv` - Search queries driving traffic
- `Countries.csv` - Geographic performance
- `Devices.csv` - Desktop vs mobile performance
- `Dates.csv` - Daily performance trends
- `Search appearance.csv` - Rich snippet performance

**Date Range:** Last 3 months (Aug 6 - Nov 6, 2025)

**Data Structure (Pages.csv):**
```csv
Top pages,Clicks,Impressions,CTR,Position
https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025,99,1507,6.57%,5.61
```

**Total Pages:** 133 URLs tracked

---

### 2. Coverage Export (For Indexing Issues)
**Location:** `/Users/patrickkavanagh/Downloads/dhmguide.com-Coverage-Drilldown-2025-10-20/`

**Files:**
- `Table.csv` - List of 103 "crawled not indexed" URLs
- `Chart.csv` - Indexing trends over time
- `Metadata.csv` - Export details

**Use Case:** Identify which thin posts are NOT indexed vs. indexed

---

## The 9 Thin Content Posts (Target for Analysis)

Based on `/Users/patrickkavanagh/dhm-guide-website/docs/seo/BLOG-INDEXING-ANALYSIS.md`:

| Post Slug | Word Count | Severity | Priority for Data |
|-----------|------------|----------|------------------|
| `alcohol-kidney-disease-renal-function-impact-2025` | 119 words | CRITICAL | HIGH |
| `alcohol-mitochondrial-function-cellular-energy-recovery-2025` | 119 words | CRITICAL | HIGH |
| `dhm-supplements-comparison-center-2025` | 113 words | CRITICAL | HIGH |
| `alcohol-stem-cell-regenerative-health-2025` | 480 words | Medium | MEDIUM |
| `ai-powered-alcohol-health-optimization-machine-learning-guide-2025` | 389 words | Medium | MEDIUM |
| `alcohol-and-bone-health-complete-skeletal-impact-analysis` | 610 words | Medium | MEDIUM |
| `how-long-does-hangover-last` | 691 words | Medium | MEDIUM |
| `festival-season-survival-dhm-guide-concert-music-festival-recovery` | 992 words | Low | LOW |
| `how-to-get-over-hangover` | 954 words | Low | LOW |

---

## Step-by-Step Data Extraction (SIMPLEST APPROACH)

### Method 1: Manual CSV Search (FASTEST - 5 minutes)

**Step 1:** Open the Pages.csv file
```bash
cd /Users/patrickkavanagh/Downloads/dhmguide.com-Performance-on-Search-2025-11-06
open Pages.csv
```

**Step 2:** Search for each thin content post slug in the CSV

**Command-line alternative:**
```bash
# Search for all 9 posts at once
grep -E "kidney-disease|mitochondrial-function|dhm-supplements-comparison|stem-cell|ai-powered-alcohol|bone-health|how-long-does-hangover|festival-season|how-to-get-over-hangover" Pages.csv
```

**Expected Output Format:**
```
URL,Clicks,Impressions,CTR,Position
```

---

### Method 2: Python Script for Automated Analysis (15 minutes to create)

**Create:** `/Users/patrickkavanagh/dhm-guide-website/scripts/analyze-thin-content-traffic.js`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GSC export path (update as needed)
const GSC_PAGES_CSV = '/Users/patrickkavanagh/Downloads/dhmguide.com-Performance-on-Search-2025-11-06/Pages.csv';

// The 9 thin content posts to analyze
const THIN_CONTENT_POSTS = [
  'alcohol-kidney-disease-renal-function-impact-2025',
  'alcohol-mitochondrial-function-cellular-energy-recovery-2025',
  'dhm-supplements-comparison-center-2025',
  'alcohol-stem-cell-regenerative-health-2025',
  'ai-powered-alcohol-health-optimization-machine-learning-guide-2025',
  'alcohol-and-bone-health-complete-skeletal-impact-analysis',
  'how-long-does-hangover-last',
  'festival-season-survival-dhm-guide-concert-music-festival-recovery',
  'how-to-get-over-hangover'
];

// Read and parse CSV
const csvData = fs.readFileSync(GSC_PAGES_CSV, 'utf-8');
const lines = csvData.split('\n');
const headers = lines[0].split(',');

// Find traffic data for each thin post
const results = THIN_CONTENT_POSTS.map(slug => {
  const matchingLine = lines.find(line => line.includes(slug));

  if (!matchingLine) {
    return {
      slug,
      url: `https://www.dhmguide.com/never-hungover/${slug}`,
      clicks: 0,
      impressions: 0,
      ctr: '0%',
      position: 'Not ranked',
      priority: 'TIER 3 - Consider delete/redirect'
    };
  }

  const [url, clicks, impressions, ctr, position] = matchingLine.split(',');
  const clicksNum = parseInt(clicks) || 0;
  const impressionsNum = parseInt(impressions) || 0;

  // Prioritization logic
  let priority;
  if (impressionsNum >= 10 && clicksNum < 5) {
    priority = 'TIER 1 - HIGH ROI (ranking but not converting)';
  } else if (impressionsNum >= 5 && impressionsNum < 10) {
    priority = 'TIER 2 - MEDIUM ROI (borderline indexing)';
  } else {
    priority = 'TIER 3 - LOW ROI (consider delete/redirect)';
  }

  return {
    slug,
    url,
    clicks: clicksNum,
    impressions: impressionsNum,
    ctr,
    position,
    priority
  };
});

// Sort by impressions (descending)
results.sort((a, b) => b.impressions - a.impressions);

// Output results
console.log('\n=== THIN CONTENT TRAFFIC ANALYSIS ===\n');
console.log('Date Range: Last 3 months (Aug 6 - Nov 6, 2025)');
console.log('Source: Google Search Console\n');

console.log('TIER 1 (EXPAND FIRST - High Traffic Potential):');
results.filter(r => r.priority.includes('TIER 1')).forEach(r => {
  console.log(`  - ${r.slug}`);
  console.log(`    Impressions: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${r.ctr} | Position: ${r.position}`);
  console.log(`    Action: Expand to 1,200-1,500 words\n`);
});

console.log('\nTIER 2 (EXPAND SECOND - Medium Potential):');
results.filter(r => r.priority.includes('TIER 2')).forEach(r => {
  console.log(`  - ${r.slug}`);
  console.log(`    Impressions: ${r.impressions} | Clicks: ${r.clicks} | CTR: ${r.ctr} | Position: ${r.position}`);
  console.log(`    Action: Monitor for 4-6 weeks after Tier 1 expansion\n`);
});

console.log('\nTIER 3 (CONSIDER DELETE/REDIRECT):');
results.filter(r => r.priority.includes('TIER 3')).forEach(r => {
  console.log(`  - ${r.slug}`);
  console.log(`    Impressions: ${r.impressions} | Clicks: ${r.clicks} | Position: ${r.position}`);
  console.log(`    Action: Consider 301 redirect to related authoritative content\n`);
});

// Save to file
const outputPath = path.join(__dirname, '../docs/seo/thin-content-traffic-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n✅ Results saved to: ${outputPath}\n`);
```

**Usage:**
```bash
cd /Users/patrickkavanagh/dhm-guide-website
node scripts/analyze-thin-content-traffic.js
```

---

## Quick Manual Analysis (DO THIS NOW)

I'll do the quick CSV search for you:

```bash
cd /Users/patrickkavanagh/Downloads/dhmguide.com-Performance-on-Search-2025-11-06

# Search for thin content posts
grep -i "kidney-disease\|mitochondrial\|supplements-comparison\|stem-cell\|ai-powered\|bone-health\|how-long-does-hangover\|festival-season\|how-to-get-over" Pages.csv
```

---

## Alternative: Manual GSC Export for Specific URLs

If you want FRESH data (last 28 days instead of 3 months):

### Steps in Google Search Console:

1. **Go to:** https://search.google.com/search-console
2. **Select property:** dhmguide.com
3. **Navigate to:** Performance → Search Results
4. **Set Date Range:** Last 28 days
5. **Add URL Filter:**
   - Click "+ NEW" filter
   - Select "Page"
   - Choose "Custom (regex)"
   - Enter pattern: `kidney-disease|mitochondrial|supplements-comparison|stem-cell|ai-powered|bone-health|how-long-does-hangover|festival-season|how-to-get-over`
6. **Export:**
   - Click "Export" button (top right)
   - Choose "Pages" tab
   - Download CSV

**Time Required:** 2-3 minutes

---

## Expected Outcomes from Analysis

### Scenario 1: Posts Have 10+ Impressions
**Action:** Expand top 2-3 posts with highest impressions
**Reasoning:** Already ranking but not converting (CTR optimization opportunity)

### Scenario 2: Posts Have 5-10 Impressions
**Action:** Expand 1-2 posts as pilot test
**Reasoning:** Borderline indexing - expansion may push them over threshold

### Scenario 3: Posts Have 0-2 Impressions
**Action:** Consider 301 redirect to stronger content
**Reasoning:** No ranking signals - expanding may waste effort

---

## Next Steps After Data Collection

1. **Prioritize Top 2-3 Posts** based on GSC data
2. **Analyze SERP Competitors** for those 2-3 posts:
   - Google the target keyword
   - Check word count of top 10 results
   - Set data-driven word count target (not arbitrary 1,200)
3. **Expand Pilot Posts** (1.5-2 hours total)
4. **Measure for 4-6 Weeks** in GSC
5. **Calculate ROI** - If 25%+ click increase, expand remaining posts

---

## No API Setup Required (For Now)

**Why Manual Exports Are Sufficient:**
- One-time analysis for 9 posts
- Manual export takes 2-3 minutes
- API setup takes 1-2 hours (OAuth, credentials, testing)
- ROI: Not worth API setup for single use case

**When to Set Up API:**
- If doing weekly/monthly automated reporting
- If analyzing 100+ URLs regularly
- If integrating with other analytics tools

---

## GSC API Setup (Future Reference)

**If you decide to automate later:**

### Prerequisites:
1. Google Cloud Console account
2. Enable Search Console API
3. Create OAuth 2.0 credentials
4. Install Google API client: `npm install googleapis`

### Script Path (Planned):
`/Users/patrickkavanagh/dhm-guide-website/scripts/export-gsc-metrics.js`

**Status:** Not yet implemented (see scripts/README.md line 118)

---

## Summary: What to Do Right Now

### Immediate Action (5 minutes):
```bash
# 1. Navigate to GSC export folder
cd /Users/patrickkavanagh/Downloads/dhmguide.com-Performance-on-Search-2025-11-06

# 2. Search for thin content posts
grep -iE "kidney-disease|mitochondrial|supplements-comparison|stem-cell|ai-powered|bone-health|how-long.*hangover|festival|get-over-hangover" Pages.csv > /Users/patrickkavanagh/dhm-guide-website/thin-posts-traffic.txt

# 3. View results
cat /Users/patrickkavanagh/dhm-guide-website/thin-posts-traffic.txt
```

### Expected Output:
```
URL,Clicks,Impressions,CTR,Position
[Traffic data for each matching post]
```

### Analysis (2 minutes):
- **Tier 1 (Expand first):** Posts with 10+ impressions
- **Tier 2 (Monitor):** Posts with 5-10 impressions
- **Tier 3 (Delete/redirect):** Posts with 0-2 impressions

---

## Related Documentation

- **Thin Content Analysis:** `/Users/patrickkavanagh/dhm-guide-website/docs/seo/BLOG-INDEXING-ANALYSIS.md`
- **Expert Review (Issue #31):** `/Users/patrickkavanagh/dhm-guide-website/docs/seo/ISSUE-31-EXPERT-REVIEW.md`
- **Traffic Maximization PRD:** `/Users/patrickkavanagh/dhm-guide-website/docs/seo/PRD-MAXIMIZE-TRAFFIC-FROM-GSC-DATA.md`
- **Crawled Not Indexed Analysis:** `/Users/patrickkavanagh/dhm-guide-website/docs/seo/GSC-CRAWLED-NOT-INDEXED-ANALYSIS.md`

---

**Created:** 2025-11-07
**Last Updated:** 2025-11-07
**Maintainer:** Patrick Kavanagh
