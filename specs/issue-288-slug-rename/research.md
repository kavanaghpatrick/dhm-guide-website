# Research: Issue #288 — Slug rename `dhm-randomized-controlled-trials-2024` → year-agnostic

## Year-mismatch confirmation
- **JSON title**: `"DHM Clinical Trials 2026: The Science Behind 70% Hangover Prevention"`
- **JSON slug/id**: `dhm-randomized-controlled-trials-2024`
- **Body**: opens with `"A groundbreaking 2024 clinical trial..."` (content references multiple years 2023/2024/2025) — body itself is fine, the **URL slug** is the SEO bleed.
- 494 PV/90d page; mismatch hurts CTR and trust.

## Files containing `dhm-randomized-controlled-trials-2024` (live source/public, excluding generated/backup/docs)

### Source — must update
1. `src/newblog/data/posts/dhm-randomized-controlled-trials-2024.json` — JSON file itself (rename + internal `id`/`slug` fields)
2. `src/newblog/data/posts/index.js` — line 24: `export { default as post21 } from './dhm-randomized-controlled-trials-2024.json';`
3. `src/newblog/data/postRegistry.js` — line 74: `"dhm-randomized-controlled-trials-2024": () => import("./posts/dhm-randomized-controlled-trials-2024.json"),`
4. `src/newblog/data/metadata/index.json` — lines 1858, 1860 (`id` + `slug` fields in metadata entry)
5. `src/newblog/data/posts/complete-hangover-science-hub-2025.json` — `.content` markdown link `/blog/dhm-randomized-controlled-trials-2024`
6. `src/newblog/data/posts/does-dhm-work-honest-science-review-2025.json` — `.content` markdown link `/never-hungover/dhm-randomized-controlled-trials-2024` + `.relatedPosts[1]`
7. `src/newblog/data/posts/dhm-dosage-guide-2025.json` — `.relatedPosts[1]`
8. `src/newblog/data/posts/when-to-take-dhm-timing-guide-2025.json` — `.relatedPosts[1]`
9. `src/newblog/data/posts/dhm-science-explained.json` — `.relatedPosts[0]`

### Public — must update
10. `public/blog-canonicals.json` — lines 347-348 key + canonical URL
11. `public/sitemap.xml` — line 473 `<loc>` entry

### Skip (intentionally NOT updating)
- `public/sitemap-backup.xml`, `public/sitemap.xml.backup-*`, `public/sitemap.xml.bak` — explicit backups
- `src/newblog/data/metadata/index.backup.json` — backup file
- `backups/`, `encoding-backup*/`, `.specs/`, `WEEK_1_*`, `comprehensive_*`, `linking-analysis.json` — historical/snapshot artifacts
- `docs/**` — historical docs/analysis (will reference the old slug intentionally to record what changed)
- `gsc_analysis/**` — analysis snapshots
- `src/newblog/scripts/fix-remaining-images.js` — historical migration script

## vercel.json redirect format
Existing pattern (line 28-32):
```json
{
  "source": "/never-hungover/smart-sleep-tech-alcohol-circadian-optimization-guide-2025",
  "destination": "/never-hungover/smart-sleep-technology-and-alcohol-circadian-optimization-guide-2025",
  "permanent": true
}
```
Will follow this exact pattern for the new redirect.

## Risk assessment
- **Pure rename + redirect** = low risk; SEO equity preserved via 301
- React import structure unchanged (only the import target filename changes in `index.js` + `postRegistry.js`)
- `id`/`slug` JSON fields drive routing — must be updated together
- `relatedPosts` references in 4 sibling posts must match new slug or links break
