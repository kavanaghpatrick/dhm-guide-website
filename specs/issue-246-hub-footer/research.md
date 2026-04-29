---
spec: issue-246-hub-footer
phase: research
created: 2026-04-28
---

# Research: issue-246-hub-footer

## Executive Summary

Append a "Continue Your Research" markdown footer (4 hub links) to the `content` field of all 197 blog post JSONs via an idempotent, dry-run-default ESM script in `scripts/`. Verified: 0 posts have the heading, 0 have a curated hub block (4 links within proximity), 16 have all 4 hub links scattered across body text — none of those constitute an existing footer, so the simple heading-presence check is sufficient for idempotency. Footer reaches crawlers because `prerender-blog-posts-enhanced.js` (run during `npm run build`) renders `post.content` through micromark into the prerendered HTML at `/dist/never-hungover/<slug>.html`.

## Current State Verification

| Metric | Value | How verified |
|--------|-------|--------------|
| Total post JSONs in `src/newblog/data/posts/*.json` | **197** | `ls *.json \| wc -l` |
| Posts whose `content` contains "Continue Your Research" | **0** | `grep -l "Continue Your Research" *.json` |
| Posts linking to `/guide` anywhere | 39 | `grep -lE "\\(/guide\\)" *.json` |
| Posts linking to `/compare` anywhere | 26 | `grep -lE "\\(/compare\\)" *.json` |
| Posts linking to `/reviews` anywhere | 31 | `grep -lE "\\(/reviews\\)" *.json` |
| Posts linking to `/research` anywhere | 17 | `grep -lE "\\(/research\\)" *.json` |
| Posts containing all 4 hub links anywhere | **16** | Node script counting `]( /hub )` markers per file |
| Posts where all 4 hub links cluster within 500 chars | **0** | Min/max position span ≤ 500 |
| Posts where all 4 cluster within 3000 chars | **0** | Min/max position span ≤ 3000 |

**Conclusion**: No post currently has a curated hub footer. The 16 posts with all 4 links scatter them across thousands of characters of body prose (e.g., `dhm-japanese-raisin-tree-complete-guide.json` has them at offsets 51, 6519, 9429, 11521 — span 11,470 chars). These represent contextual inline links that complement, not duplicate, an end-of-post footer.

## Idempotency Heuristic (Strict Definition)

**Skip rule** (single, sufficient check):
- If `post.content.includes("Continue Your Research")` → skip; do not re-append.

**Why proximity check is unnecessary**: The 16 posts with all 4 links scattered have NO span ≤ 3000 chars. There is no risk of mistaking inline contextual links for a curated block. The 800-char proximity heuristic returned 0 hits even before this work.

**Defensive secondary check** (belt-and-suspenders, cheap to add):
- If `content` already contains the exact sentinel `<!-- hub-footer:auto -->` (which the script writes alongside the heading) → skip. Sentinel-comment idiom matches `cluster-formalize.mjs` and `orphan-post-link-injector.mjs`.

**Use BOTH checks** in the script — heading match (catches manual edits, future hand-typed footers) and sentinel match (catches script-managed footers). Either match → skip.

## Footer Template (Exact Text)

The script appends this block verbatim to `post.content` (after `.trimEnd()`):

```
\n\n<!-- hub-footer:auto -->\n\n---\n\n## Continue Your Research\n\n- **[Complete DHM Guide →](/guide)** - Dosage, timing, and how DHM works\n- **[Compare Supplements →](/compare)** - Side-by-side product comparison\n- **[Product Reviews →](/reviews)** - In-depth reviews of 7 tested supplements\n- **[Clinical Research →](/research)** - 11 peer-reviewed DHM studies\n
```

Rendered in the JSON as a single string with `\n` escapes (since `content` is a JSON string, all newlines are JSON-escaped). This matches issue #246 body verbatim except adds the `<!-- hub-footer:auto -->` HTML comment sentinel above the `---` separator. Markdown comments are stripped by micromark and don't appear in rendered HTML, so they're invisible to readers and crawlers.

**Note on line-break style**: cluster-formalize.mjs detects two flavors (real `\n` vs literal backslash-n) — but a sample of 5 post JSONs confirms real `\n` is universal here. Use `\n` directly.

## Safety / Risk Register

| Risk | Mitigation |
|------|------------|
| **JSON corruption** from string-concat write | Use `JSON.parse` → mutate object → `JSON.stringify(obj, null, 2)` only. Never concatenate JSON text. |
| **Trailing-whitespace double-newline** | Call `post.content = post.content.trimEnd() + footer`. Footer begins with `\n\n` → guarantees exactly one blank line before `---`. |
| **Trailing-newline on file** | All 197 existing files have NO trailing file newline. Write with `JSON.stringify(...)` only (no `+ '\n'`). This DEVIATES from cluster-formalize/orphan-injector convention but matches the 197 actual files — minimizes diff churn. Document in script header. |
| **Indent regression** | Use `JSON.stringify(obj, null, 2)` matching existing 2-space indent. |
| **Double injection on re-run** | Two-layer idempotency check (heading + sentinel comment). Re-run after live: 197 skipped, 0 written. |
| **Markdown break inside JSON string** | Footer contains only safe ASCII; no embedded backticks, no `"` chars, no nested JSON. JSON.stringify escapes correctly. |
| **Pre-existing curated footers (manual)** | Heading-substring check catches any future manual footer with that heading. |
| **Hub URL drift** | Hardcoded `/guide`, `/compare`, `/reviews`, `/research` — these are stable site routes (verified live). If they change, that's a separate migration. |
| **Comparison post duplication** | Decision: include comparison posts (49 of them). Their current end-of-post sections are affiliate CTAs, NOT navigation. Hub footer adds cluster signal without replacing affiliate content. (See "Out of Scope" for explicit decision.) |

## Pattern #11 Verification: Prerender Reaches Crawlers

`scripts/prerender-blog-posts-enhanced.js` (line 311) reads `post.content`, runs it through `micromark()` with GFM extensions, and writes the resulting HTML into `<div id="prerender-content">` inside `dist/never-hungover/<slug>.html`. Because the footer is in the `content` field (not a React component or runtime hook), it ships into prerendered HTML and is visible to Google, Twitter, Facebook crawlers, and AI bots that don't execute JS.

`package.json` build chain confirms the prerender step runs on every Vercel build:
```
"build": "... && vite build && ... && node scripts/prerender-blog-posts-enhanced.js && ..."
```

**Verification step** (post-deploy): `curl -s https://www.dhmguide.com/never-hungover/<slug> | grep -c "Continue Your Research"` should return ≥1.

## Verification Approach

1. **Dry-run output** — `node scripts/add-hub-footer.mjs` (no flag) prints "would update 197" + lists 5 sample slugs + diff preview. Default = dry run.
2. **Live run** — `node scripts/add-hub-footer.mjs --apply` writes all 197 posts; reports `updated: 197, skipped: 0`.
3. **Idempotency proof** — Re-run with `--apply` immediately after; expected `updated: 0, skipped: 197`.
4. **JSON integrity** — `node scripts/validate-posts.js` (already in `prebuild`) parses every JSON; non-zero exit = corruption.
5. **Build pass** — `npm run build` succeeds end-to-end (validates JSON, builds Vite, runs prerender).
6. **Prerender HTML grep** — Sample 5 random `dist/never-hungover/<slug>.html` files; each must contain literal string "Continue Your Research" and 4 anchor tags `href="/guide"`, `href="/compare"`, `href="/reviews"`, `href="/research"`.
7. **Production smoke test** (post-deploy) — `curl -s https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | grep -c 'Continue Your Research'` returns ≥1.

## Realistic Expectations (per ultrathink reset)

The issue title claims "+30-50% indexing improvement" and "10x SEO" — this is unsupported marketing copy. The site has operated 6+ months with zero hub footers and is mostly indexed already (197 posts in sitemap, almost all returning HTTP 200 with proper canonical + structured data). Realistic outcomes:

| Effect | Likelihood | Magnitude |
|--------|------------|-----------|
| Site-wide indexing rate change | Low | Probably <5% (most posts already indexed) |
| Internal PageRank distribution shift toward 4 hub URLs | High | Modest but real — 197 new inbound links per hub (787 total). Helps hubs outrank long-tail spokes for hub-intent queries. |
| Cluster-signal strength (Google's topic-cluster heuristics) | High | Each post now signals "I belong to a 4-hub cluster" via consistent footer. Topic-modeling boost. |
| Direct ranking change for `/guide`, `/compare`, `/reviews`, `/research` | Medium | 4-8 weeks observable in GSC. Track: avg position for hub URLs, impressions, clicks. |
| User UX (clearer next-action paths from end of post) | High | Readers who finish a post get 4 hub options vs current dead-end / affiliate-only ending. |
| Affiliate revenue | Neutral to Slight Positive | Footer doesn't block existing affiliate CTAs; some traffic flows to `/reviews` which IS affiliate hub. |

**Honest framing**: hygiene with positive ROI, not a transformative lever. Track 4-8 weeks; if no movement on hub-URL impressions in GSC by week 8, footer is purely cosmetic and that's still fine because the build cost is ~3 hours one-time.

## Out of Scope (Explicit Decisions)

| Item | Decision | Reason |
|------|----------|--------|
| Comparison posts (49 of 197, names contain `vs-`/`comparison`/`review`) | **Include** in footer rollout | Their current end-of-post is affiliate CTAs (e.g., "Check Flyby Recovery Price"), not hub navigation. Footer adds cluster signal without replacing revenue content. Issue #246 explicitly says "ALL posts" and audit approved. |
| Modify `relatedPosts` field | Out of scope | Issue #246 only edits `content`. relatedPosts is curated and managed by separate scripts (`generate-related-posts.mjs`, `cluster-formalize.mjs`). |
| Modify `seo`, `faq`, `quickAnswer`, `metaDescription` fields | Out of scope | Touch only `content`. |
| Reorder existing content | Out of scope | Pure append at the end after `.trimEnd()`. |
| Add hub footer to non-blog routes (`/guide`, `/compare`, etc. themselves) | Out of scope | Those are hub pages; they don't link to themselves. |
| Personalize footer per cluster | Out of scope | Issue #246 specifies "Same template for ALL posts" per audit. Reduces complexity; no per-post mapping needed. |
| Add tracking parameters to hub URLs | Out of scope | Internal links don't need UTMs; PostHog already attributes via referrer + `link_clicked` event hook. |
| Move hub footer to React component | Out of scope | Would require runtime hook + prerender script update; defeats the simple "write to JSON, micromark renders, ships in prerender" pipeline. |
| Hub-link-anchor-text variation testing | Out of scope | Single template per audit. A/B testing is a future issue. |

## Existing Patterns Found in Codebase

| Pattern | File | Reuse |
|---------|------|-------|
| ESM script in `scripts/`, dry-run default + `--apply` flag | `cluster-formalize.mjs`, `orphan-post-link-injector.mjs`, `posts-quick-answer-backfill.mjs` | **Mirror this exactly** |
| `JSON.parse` → mutate → `JSON.stringify(obj, null, 2)` | All backfill scripts | **Mirror** |
| Audit log JSON output (`--audit-out=path.json`) | `cluster-formalize.mjs`, `orphan-post-link-injector.mjs` | **Mirror** (optional but cheap) |
| Sentinel HTML comment for auto-managed sections | `<!-- cluster-pillar-link:auto -->`, `<!-- cluster-index:auto -->` | **Mirror as `<!-- hub-footer:auto -->`** |
| `validate-posts.js` runs in `prebuild` and at start of `build` | `package.json` scripts | **Rely on it** for JSON integrity check |
| Prerender renders full `content` via micromark | `scripts/prerender-blog-posts-enhanced.js:311` | **No change needed** — footer ships automatically |

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Lint | `npm run lint` | package.json scripts.lint |
| Validate JSON | `node scripts/validate-posts.js` | package.json prebuild + build chain |
| Build (full, includes prerender) | `npm run build` | package.json scripts.build |
| Dry-run script | `node scripts/add-hub-footer.mjs` | New script (default = dry run) |
| Live run | `node scripts/add-hub-footer.mjs --apply` | New script |

**Local CI**: `npm run lint && npm run build` — covers JSON validity, prerender, and z-class verification.

## Verification Tooling

| Tool | Command | Detected From |
|------|---------|---------------|
| Dev Server | `npm run dev` | package.json scripts.dev (Vite) |
| Build | `npm run build` | package.json scripts.build |
| Prerender (already in build) | `node scripts/prerender-blog-posts-enhanced.js` | package.json |
| JSON validation | `node scripts/validate-posts.js` | package.json prebuild |
| Browser automation | None needed for this issue | N/A — content-only change |
| Production smoke test | `curl -s https://www.dhmguide.com/never-hungover/<slug> \| grep -c "Continue Your Research"` | Post-deploy |

**Project Type**: Vite + React content site with JSON-driven blog + Node prerender pipeline.
**Verification Strategy**: Dry-run script → review diff → apply → re-run for idempotency proof → `npm run build` → grep dist HTML → deploy → curl prod.

## Sources

- GitHub issue #246: `gh issue view 246 --repo kavanaghpatrick/dhm-guide-website`
- `/Users/patrickkavanagh/dhm-guide-website/.progress.md` (Pattern #11 — prerender vs runtime)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/cluster-formalize.mjs` (sentinel + idempotency idiom)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/orphan-post-link-injector.mjs` (dry-run + audit pattern)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/posts-quick-answer-backfill.mjs` (simple bulk-edit ESM script)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/prerender-blog-posts-enhanced.js` (line 311 — micromark renders post.content into prerendered HTML)
- `/Users/patrickkavanagh/dhm-guide-website/package.json` (build chain confirms prerender step)
- Sample post: `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/activated-charcoal-hangover.json`

## Recommendations for Requirements

1. Single new file: `scripts/add-hub-footer.mjs`. No package.json changes required.
2. Default mode = dry-run. `--apply` flag triggers writes. `--audit-out=` writes per-file decisions.
3. Two-layer idempotency: heading substring check + sentinel comment check. Either match → skip.
4. Write JSONs WITHOUT trailing file newline (matches all 197 existing files; minimizes diff noise).
5. Use `content.trimEnd()` before appending; footer begins with `\n\n` and ends with `\n`.
6. Comparison posts included (single template, no per-cluster variation).
7. Verification: dry-run → apply → re-run (idempotency) → `npm run build` → grep 5 sample dist HTMLs → deploy → curl prod.
8. Track post-launch: GSC avg-position for `/guide`, `/compare`, `/reviews`, `/research` over 4-8 weeks. Don't expect dramatic change; this is hygiene.

## Open Questions

None blocking. All decisions made above based on codebase evidence and issue audit.
