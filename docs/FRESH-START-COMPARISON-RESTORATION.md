# Fresh Start: Comparison Post Restoration Project

## Quick Context (Read This First)

**Project**: DHM Guide Website (dhmguide.com) - health/supplement site about DHM for hangover prevention

**Problem**: On October 20, 2025, we deleted 23 "Product A vs Product B" comparison posts. This was a mistake:
- These posts drove **21.6% of ALL site traffic** (42 of 194 clicks)
- They had **60% better CTR** than site average (6.07% vs 3.8%)
- The replacement strategy (static table on /reviews) got **0 impressions in 3 months**
- 27 orphaned metadata entries now cause 404 errors

**Decision**: RESTORE ALL 23 posts with proper hub-and-spoke internal linking architecture.

---

## Key Resources

| Resource | Location |
|----------|----------|
| **Full PRD** | `docs/PRD-COMPARISON-POST-RESTORATION.md` |
| **Phase 1 Issue** | https://github.com/kavanaghpatrick/dhm-guide-website/issues/83 |
| **Phase 2 Issue** | https://github.com/kavanaghpatrick/dhm-guide-website/issues/84 |
| **Phase 3 Issue** | https://github.com/kavanaghpatrick/dhm-guide-website/issues/85 |
| **Phase 4 Issue** | https://github.com/kavanaghpatrick/dhm-guide-website/issues/86 |
| **Phase 5 Issue** | https://github.com/kavanaghpatrick/dhm-guide-website/issues/87 |

---

## Key File Locations

```
encoding-backup/              # 23 comparison posts to restore (source)
src/newblog/data/posts/       # Active posts directory (destination)
src/newblog/data/metadata/index.json  # Has 27 orphaned entries to clean
src/newblog/data/postRegistry.js      # Post import registry (auto-generated)
scripts/generate-post-registry.js     # Regenerates postRegistry.js
docs/PRD-COMPARISON-POST-RESTORATION.md  # Full PRD with all details
```

---

## The 23 Files to Restore

**Flyby Comparisons (8):**
- flyby-vs-cheers-complete-comparison-2025.json
- flyby-vs-dhm1000-complete-comparison-2025.json
- flyby-vs-double-wood-complete-comparison-2025.json
- flyby-vs-fuller-health-complete-comparison.json (note: no -2025)
- flyby-vs-good-morning-pills-complete-comparison-2025.json
- flyby-vs-no-days-wasted-complete-comparison-2025.json
- flyby-vs-nusapure-complete-comparison-2025.json
- flyby-vs-toniiq-ease-complete-comparison-2025.json

**Double Wood Comparisons (8):**
- double-wood-dhm-vs-dhm1000-comparison-2025.json (note: dhm-vs not vs)
- double-wood-vs-cheers-restore-dhm-comparison-2025.json
- double-wood-vs-dhm-depot-comparison-2025.json
- double-wood-vs-fuller-health-after-party-comparison-2025.json
- double-wood-vs-good-morning-hangover-pills-comparison-2025.json
- double-wood-vs-no-days-wasted-dhm-comparison-2025.json
- double-wood-vs-nusapure-dhm-comparison-2025.json
- double-wood-vs-toniiq-ease-dhm-comparison-2025.json

**No Days Wasted Comparisons (7):**
- no-days-wasted-vs-cheers-restore-dhm-comparison-2025.json
- no-days-wasted-vs-dhm-depot-comparison-2025.json
- no-days-wasted-vs-dhm1000-comparison-2025.json
- no-days-wasted-vs-fuller-health-after-party-comparison-2025.json
- no-days-wasted-vs-good-morning-hangover-pills-comparison-2025.json
- no-days-wasted-vs-nusapure-dhm-comparison-2025.json
- no-days-wasted-vs-toniiq-ease-dhm-comparison-2025.json

---

## Phase Overview

| Phase | Task | Est. Time | Status |
|-------|------|-----------|--------|
| 1 | Restore 23 posts from backup | 2-3 hours | Not started |
| 2 | Clean up orphaned metadata | 45 min | Not started |
| 3 | Implement hub-and-spoke linking | 3.5 hours | Not started |
| 4 | Fix broken internal links | 1 hour | Not started |
| 5 | Monitor & optimize (60 days) | 8-10 hours | Not started |

---

## To Start Phase 1

```bash
# 1. Create feature branch
git checkout -b feature/restore-comparison-posts

# 2. Verify backup files exist (should be 23)
ls encoding-backup/*-vs-*.json | wc -l

# 3. Copy files to posts directory
cp encoding-backup/flyby-vs-*.json src/newblog/data/posts/
cp encoding-backup/double-wood-vs-*.json src/newblog/data/posts/
cp encoding-backup/no-days-wasted-vs-*.json src/newblog/data/posts/
cp encoding-backup/double-wood-dhm-vs-*.json src/newblog/data/posts/

# 4. Regenerate post registry
node scripts/generate-post-registry.js

# 5. Build and test
npm run build
npm run preview

# 6. Verify posts are accessible (check a few URLs)
```

---

## Important Gotchas

1. **File naming inconsistency**: One file is `double-wood-dhm-vs-*` not `double-wood-vs-*`
2. **One file missing -2025**: `flyby-vs-fuller-health-complete-comparison.json`
3. **Test locally first**: Use `npm run preview`, NOT production URLs
4. **Backup metadata before cleaning**: Always backup `index.json` before Phase 2

---

## Prompt to Continue

Copy this to start a new session:

```
I'm working on the DHM Guide comparison post restoration project.

Please read these files to get context:
1. docs/PRD-COMPARISON-POST-RESTORATION.md (full PRD)
2. docs/FRESH-START-COMPARISON-RESTORATION.md (this overview)

Then check GitHub issues #83-87 for current status.

I want to [START PHASE 1 / CONTINUE FROM WHERE WE LEFT OFF / specific task].
```

---

## Research Summary (Why We're Restoring)

**8 parallel research agents + Grok API + Gemini CLI all concluded: RESTORE ALL**

Key findings:
- Comparison keywords have 2-10x higher conversion rates
- Posts averaged 7,000-13,000 words of substantive content (not thin)
- Google has NO duplicate content penalty for legitimate comparisons
- Hub-and-spoke model requires spoke pages to work
- The deletion rationale was theoretically sound but empirically wrong

The data is clear: 21.6% of traffic from 23 posts > 0 impressions from replacement strategy.
