# C5 — QA verification of C1 + C3 + C4 implementation

## 1. TL;DR

**PASS-WITH-CAVEATS.** All three intended changes from C1/C3/C4 land cleanly, build succeeds, JSON parses, /reviews delta matches design, Playwright affiliate-regression spec is 8/8 green.

**Caveat (not a blocker):** The working tree also contains a pre-existing, untracked `src/components/CompareCTA.jsx` (Apr 30) plus a render-call for `<CompareCTA />` inside `NewBlogPost.jsx`. Neither was authored by C1/C3/C4 today — they predate this task chain. Whether they belong in the same commit as today's work, or get split into a separate commit, is a judgement call for the user (see §9).

## 2. Build status

**PASS.** `npm run build` completed cleanly. Full output in `docs/posthog-2026-05-12/data/C5-build.log` (1,456 lines).

- `prebuild`: 197 imports verified, post validation OK
- `validate-posts`: OK
- `generate-blog-canonicals`: 198 entries
- `generate-sitemap`: OK
- `vite build`: 4.6 MB bundle, no warnings related to our diff
- `verify-z-classes`: OK (3 z-* classes, 1 CSS bundle)
- `prerender-blog-posts-enhanced`: 197/197 posts in 20 batches
- `prerender-main-pages`: 7/7 (/, /guide, /reviews, /research, /about, /dhm-dosage-calculator, /compare)

Only pre-existing imagemin warnings on legacy hero PNGs — unchanged baseline.

## 3. JSON validity

**PASS.** `node -e "JSON.parse(...)"` returns `OK` for `dhm-dosage-guide-2025.json`.

## 4. Per-file diff summary

| File | Lines | Authored by | What changed |
|---|---|---|---|
| `src/App.jsx` | +14 / -2 | C1 | Adds `useRef`, imports `posthog-js`, gates manual `$pageview` capture on SPA route change with `isInitialRouteRef` to avoid double-firing on initial mount. |
| `src/newblog/components/NewBlogPost.jsx` | +14 / -9 | C4 (lines 24–32, 1406) + **pre-existing Apr 30 work** (lines 24, 1443–1453) | C4: removes `REVIEWS_CTA_SKIP_SLUGS` Set + its skip check. **Pre-existing**: imports `CompareCTA`, renders `<CompareCTA />` after body / before related-posts, gated on `!post.hideCompareCTA` and slug regex. |
| `src/newblog/data/posts/dhm-dosage-guide-2025.json` | +1 / -1 (content field, ~1.5 KB inserted) | C3 | Inserts "At a Glance: 4 Best DHM Products" table (4 product rows + caption) between Quick Answers and Dosage Calculator. |

Untracked new file: `src/components/CompareCTA.jsx` (Apr 30, pre-existing pillar of the work above).

## 5. /reviews link count — before / after

| Surface | Before | After |
|---|---|---|
| Raw JSON (`/reviews` substring) | 8 | **13** |
| Prerendered dist HTML | (n/a — Apr 30 build) | **14** (13 in body + 1 PR #277 auto-injected mid-content CTA, since C4 unblocked it) |

Delta +5 in raw JSON matches C3 report; +6 in prerendered HTML (5 from table + 1 auto-injected) is the expected combined effect of C3 + C4 working together. C4 predicted "11 total `/reviews` exposures after C4 only; 16 after C4 + C3"; observed 14 is between because C4's count includes the `<CompareCTA />` block (separate file, not counted in HTML-substring grep) and the hub footer.

## 6. Visual check

Dev server started cleanly on port 5173 (and 5174). `curl` of `/never-hungover/dhm-dosage-guide-2025` returns the SPA shell (1 `/reviews` reference — the bot-detection fallback), so substring counting against the dev server is meaningless for SPA pages. Confirmed against **prerendered dist HTML** instead (the actual surface Google crawls): 14 occurrences, as above. Dev server killed cleanly.

## 7. Playwright result

**PASS — 8/8 in 12.1 s.**

```
tests/affiliate-tracking.spec.js
  /reviews: first product card affiliate button (chromium, Mobile Chrome)  PASS
  /compare: affiliate button (chromium, Mobile Chrome)                     PASS
  /reviews mobile iPhone 13 (chromium, Mobile Chrome)                      PASS
  /compare mobile iPhone 13 (chromium, Mobile Chrome)                      PASS
```

No regressions in affiliate-link end-to-end behaviour from any of today's diffs.

## 8. Tracking check (C1's diff in detail)

- (a) **No double-fire on initial mount** — VERIFIED. `isInitialRouteRef.current` starts `true`, effect's first run sets it to `false` and returns early. PostHog's `capture_pageview:true` (confirmed at `src/lib/posthog.js:43`) handles the initial pageview.
- (b) **Import statement** — VERIFIED. `import posthog from 'posthog-js'` (line 6). Package is in `package.json` dependencies.
- (c) **Dependency array** — `[currentPath, resetMilestones]` is appropriate. `currentPath` is the route change trigger; `resetMilestones` is a stable memoized callback from `useScrollTracking`. Standard pattern.

Minor note: `posthog.__loaded` is an internal/undocumented property used to gate captures before init completes. Common in the wild and self-healing if the property name ever changes (capture just won't fire — fail-quiet), but worth a comment if we ever revisit.

## 9. Issues found

**No deploy blockers.**

Soft observations:
1. **Mixed-author commit risk.** The CompareCTA addition (component file + render call) is dated Apr 30 and predates this task chain. C4 did not author or describe it. Bundling it into a commit titled "fix SPA pageview + remove SKIP_SLUGS + add product table" misrepresents what landed. Recommend splitting into two commits OR rewriting the commit message to reflect both concerns honestly (option chosen in §10).
2. **`/reviews` bottom-stack fatigue.** C4's audit (§3) flagged that after this PR the dosage guide will have 5 `/reviews` touchpoints in the last 11% of body. C4 explicitly deferred the JSON cleanup to a follow-up. Not a blocker for this deploy but should be filed as a follow-up issue.
3. **Sitemap.xml is dirty** in working tree (`M public/sitemap.xml`). It will be regenerated by the build script on Vercel, so safe to commit as-is or leave out — doesn't affect today's behaviour.

## 10. Recommended commit message

Two options. Recommend option A (single honest commit) for simplicity; option B (split) if reviewers prefer cleaner history.

**Option A — single commit, accurately describes both concerns:**

```
fix(posthog): SPA pageview attribution + CTA wiring on dosage guide

* App.jsx: capture $pageview on SPA route change (skip initial mount;
  PostHog's auto-capture handles that). Fixes B5 finding that affiliate
  clicks on /reviews were being attributed to the previous blog-post URL
  because PostHog's pushState interceptor misses navigateWithScrollToTop.
* NewBlogPost.jsx: remove REVIEWS_CTA_SKIP_SLUGS exclusion so the PR #277
  auto-injected /reviews CTA renders on dhm-dosage-guide-2025; add the
  pre-existing CompareCTA block (component file from 2026-04-30) below
  every blog body except product-comparison slugs.
* dhm-dosage-guide-2025.json: insert "At a Glance: 4 Best DHM Products"
  table per C2 design (B8 conversion-variance investigation).

Refs: docs/posthog-2026-05-12/{B5,B8,C1,C2,C3,C4}*.md
```

**Option B — split into two commits:**

1. `fix(posthog): SPA pageview attribution on route change` — App.jsx only
2. `feat(reviews-cta): enable auto-CTA on dosage guide + top-of-post product table + global CompareCTA` — NewBlogPost.jsx + JSON + new CompareCTA component

Either way: **NO `--no-verify`**, commit normally so the mass-edit guardrail (touches only 1 file under `src/newblog/data/posts/`) and any other pre-commit hooks run.

## 11. Confidence

**4 / 5.**

Down one point because of the mixed-author issue (§9.1) — the CompareCTA work predates today and wasn't part of any spec I verified. Everything I CAN verify (build, JSON, diff, prerender HTML, Playwright, manual code review of C1) is green.

---

Task #25 (C5) complete.
