# C3 — Implementation of Top-of-Post Product Table for `dhm-dosage-guide-2025.json`

## 1. Design source

Used C2's design verbatim: `docs/posthog-2026-05-12/C2-table-design.md` (7275 bytes). Markdown block, product selection, dose-tier mapping, and insertion-point spec were applied without modification.

## 2. The exact edit

**File:** `src/newblog/data/posts/dhm-dosage-guide-2025.json`
**Field:** `content` (single JSON string on line 21)
**Tool:** `Edit` (single targeted insertion)

**`old_string` (first 100 chars, for location identification):**
```
**📅 Can you take DHM daily?** No - DHM is for occasional use (2-3 times per week max). It's designe
```
(full match continued: `... not daily supplementation.\n\n## DHM Dosage Calculator: Find Your Perfect Dose`)

**`new_string` (full insertion payload, JSON-escaped — `\n` = literal newline in the JSON source):**
```
**📅 Can you take DHM daily?** No - DHM is for occasional use (2-3 times per week max). It's designed for drinking occasions, not daily supplementation.\n\n## At a Glance: 4 Best DHM Products for Your Dose\n\nWe've independently tested 10+ DHM supplements. These four cover every dose tier and budget — pick the row that matches your weight and typical drinking session, then click through for the full review.\n\n| # | Product | DHM Dose | Best For | Per Serving |\n|---|---------|----------|----------|-------------|\n| 1 | [Toniiq Ease](/reviews) | 300mg | Under 130 lbs / light drinking | $0.62 |\n| 2 | [Double Wood Supplements DHM](/reviews) | 1000mg | 130-180 lbs / moderate drinking | $0.80 |\n| 3 | [No Days Wasted DHM Detox](/reviews) | 1000mg | Over 180 lbs / heavy sessions | $1.93 |\n| 4 | [Cheers Restore](/reviews) | Patented blend | Trusted brand / on-the-go | $2.92 |\n\n*Prices reflect current Amazon listings (May 2026). See the full breakdown on our [DHM supplement reviews](/reviews) page, then use the dose calculator below to refine by body weight and drinking intensity.*\n\n## DHM Dosage Calculator: Find Your Perfect Dose
```

The new block sits between the Quick Answers (final bullet) and the existing DHM Dosage Calculator H2. Calculator and its CTA remain untouched (SEO anchor preserved per C2 editorial note #1).

## 3. JSON validation

```
$ node -e "JSON.parse(require('fs').readFileSync('src/newblog/data/posts/dhm-dosage-guide-2025.json'))" && echo OK
OK
```

Parses cleanly.

## 4. Build result

```
$ npm run build
... (validate-posts, generate-canonicals, sitemap, vite build, verify-z-classes all pass) ...
✅ Successfully prerendered 197 blog posts with:
   • XSS protection (HTML escaping)
   • SEO-friendly visible content
   • Parallel processing for performance
   • Atomic file operations
   • Build dependency validation
📁 Static HTML files generated in: /Users/.../dist/never-hungover

🎨 Prerendering main pages with unique meta tags...
  ✓ /, /guide, /reviews, /research, /about, /dhm-dosage-calculator, /compare
✅ Generated 7 prerendered pages
```

Post-build verification of the prerendered target:
```
$ grep -c "At a Glance: 4 Best DHM Products" dist/never-hungover/dhm-dosage-guide-2025/index.html  →  1
$ grep -o "Toniiq Ease" dist/never-hungover/dhm-dosage-guide-2025/index.html | wc -l           →  1
```

The new H2 and the lead product name both appear in the static HTML, confirming crawlers will see the table.

## 5. `/reviews` link count delta

| State | Count |
|---|---|
| Before | 8 |
| After  | 13 |
| Delta  | **+5** |

**Note on delta:** C2's editorial note #6 predicted +4 (one per product row). Actual delta is +5 because C2's own ready-to-paste markdown also contains a fifth `[DHM supplement reviews](/reviews)` link inside the price-disclosure caption underneath the table. That link is part of the design as written; the +5 reflects the markdown faithfully, not an over-insertion. Verified by counting `[...](/reviews)` occurrences in the inserted block: rows 1-4 (4) + caption sentence (1) = 5.

## 6. Files touched

- `src/newblog/data/posts/dhm-dosage-guide-2025.json` — one insertion in the `content` field. No other JSONs modified (mass-edit moratorium respected).

## 7. Confidence

**5 / 5**

- C2's design applied verbatim (markdown, product picks, position).
- JSON parses, build succeeds (197 posts prerendered, no errors).
- New table visible in the prerendered HTML — Google crawlers will see it server-side, not just post-hydration.
- Pre-existing dose calculator and its `/reviews` CTA preserved (no SEO regression).
- `/reviews` delta (+5) matches the markdown C2 wrote; the prediction of +4 in their note #6 missed the caption link they themselves authored.

---

Task #23 complete.
