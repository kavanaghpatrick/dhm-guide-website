# Research — Issue #309 Dead Asset Cleanup

## Inputs
- T8 audit (08-technical-seo.md): "71 unused PNG files >1MB (~110 MB total) in /public/"
- canonical-fix.js orphan referenced from index.html (per spec)
- Goal: identify TRULY-UNREFERENCED files in /public/ and delete

## Method
Built `scripts/audit-unused-public-assets.mjs`:
- Walks `public/` for files >= 100 KB (broader than the >1 MB starting point — catches duplicate `.webp` companions and infographics in the 100–999 KB range)
- For each candidate, runs `git grep -F` for both the full filename and the basename-without-extension across `src/`, `scripts/`, `docs/`, `index.html`, `vite.config.js`, `vercel.json`, `package.json`
- Filters out hits in **stale paths** (otherwise everything looks "referenced"):
  - `docs/archive/**` (old planning docs)
  - `docs/traffic-growth-2026-04-26/**` (the very audit that *named* the unused files)
  - `*.backup.json`, `*.backup2`, `*.bak`, `*.tmp` (stale metadata snapshots)
  - `src/newblog/data/image_fix_report.md`, `missing_images_report.md` (historical reports)
  - `audit/**` and the audit script itself
- Outputs `audit/audit-public-assets.csv` (all 311 candidates) and `audit/unused-public-assets.txt` (the unused subset)
- Idempotent — safe to re-run

## Results

| Bucket | Count | Size |
|---|---|---|
| Total files >= 100 KB in public/ | 311 | 218.9 MB |
| Truly referenced (active code/data) | 152 | 76.8 MB |
| **Unreferenced (delete candidates)** | **159** | **108.0 MB** |

Filetype breakdown of the 159 unused:
- Root-level `.png` files: 50 (mostly old hero PNGs — successors live at `public/images/*.webp`)
- Root-level `.webp` companions: 7 (the legacy webp pair to the old root PNGs)
- `public/images/*.webp`: ~96 (legacy duplicates with `-hero-hero.webp` doubled-suffix typos, or old name variants)
- `public/images/*.jpg`: 6 (old hero JPEGs whose posts now use webp)

## Validation: spot checks
- Picked 4 random unused candidates: `circadian-rhythm-protection.png`, `dhm-clinical-trials-2024-hero.png`, `fast-hangover-relief-hero.png`, `music-festival-survival-hero.png`
- Searched active `src/newblog/data/metadata/index.json` and all `src/newblog/data/posts/*.json` → 0 hits
- The matching post `music-festival-survival-dhm-2025` exists, but its active `image` field is `/images/business-travel-dhm-survival-kit-2025-hero.webp` (subdir, different file). Old root PNG is dead.

Verified Picture.jsx synthesizes a `.webp` companion path when given a `.png/.jpg` src. The audit handles this correctly via stem-grep — if a stem is referenced anywhere, both extensions are kept.

## Other large files in /public/
Searched for `.jpg`, `.jpeg`, `.mp4`, `.pdf`, `.webm`, `.mov` files >1 MB:
- 4 large `.jpg` files in `public/images/`. Three are unused (in the unused list); one (`dhm-adults-over-50…hero.jpg`) is genuinely unused per audit (post now uses `…2025-hero.webp`).
- No `.mp4`, `.pdf`, `.webm`, `.mov` files in `public/`. Nothing else of substance.

## canonical-fix.js orphan
- `find . -name 'canonical-fix*'` returns 0 hits in tracked code
- `grep -rln "canonical-fix" --include='*.html'` returns 0 hits
- Already addressed by PR #271. Nothing to do.

## Decision
- DELETE the 159 files in `audit/unused-public-assets.txt`
- Expected reduction: ~108 MB from `public/`, similar from `dist/`
- Build + 3-5 random post spot-checks must succeed before commit
