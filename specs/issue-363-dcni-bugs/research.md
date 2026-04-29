---
spec: issue-363-dcni-bugs
phase: research
created: 2026-04-29
---

# Research: issue-363-dcni-bugs

## Executive Summary

Four pure mechanical bugs from issue #363 confirmed. All four are reproducible right now. Fixes are: rename 2 JSON files (drop `%` and `'`), add 1 `vercel.json` host-predicate redirect (force 308 for non-www → www), delete 1 stray route + Rewrite directory. Largest hidden landmine: the slug rename touches **9 files per slug** including the runtime-loaded `metadata/index.json` and a generator-input `cluster-config.json` — drift between any of them and prerender breaks.

## Bugs Confirmed (Live)

| Bug | Verification | Confirmed |
|-----|--------------|-----------|
| 1: `%` slug | `ls -la 'src/newblog/data/posts/gen-z-...58%-...'` returns the file | Yes, 47909 bytes |
| 2: `'` slug | `ls -la "src/newblog/data/posts/social-media's-..."` returns the file | Yes, 35419 bytes |
| 3: 307 redirect | `curl -sI https://dhmguide.com/research` → `HTTP/2 307` (NOT 308) | Yes, server: Vercel |
| 4: stray route | `curl -sI https://www.dhmguide.com/dhm-dosage-calculator-new` → 200, `<meta name="robots" content="index, follow">`, canonical points to homepage | Yes, indexable + miscanonical |

## Bug 1 — `%` character in slug

**File**: `src/newblog/data/posts/gen-z-mental-health-revolution-why-58%-are-drinking-less-for-wellness-in-2025.json`

**JSON metadata (healthy except slug)**:
- `id`: same string (must change to match new slug)
- `slug`: same string (must change)
- `title`: `Gen Z Mental Health Revolution: Why 58% Are Drinking Less for Wellness in 2025` (no change)
- `image`: `/images/gen-z-mental-health-revolution-why-58-percent-drinking-less-wellness-2025-hero.webp` (already a clean path; no change)
- `dateModified`, `datePublished`: both `null` (untouched by this work)
- `relatedPosts`: 4 entries, none reference this slug — no self-edit needed

**Live behavior**: encoded form (`%25`) returns 200 with `content-disposition: inline; filename="gen-z-...58%-..."` — Vercel literally serves a directory named with raw `%`.

**All references that must update on rename** (9 files):

| # | File | Line | Reference type |
|---|------|------|----------------|
| 1 | `src/newblog/data/posts/<filename>.json` | n/a | rename file + edit `id` + `slug` fields |
| 2 | `src/newblog/data/postRegistry.js` | 117 | dynamic-import key + path |
| 3 | `src/newblog/data/metadata/index.json` | 252 | runtime-loaded, `slug` field |
| 4 | `src/newblog/data/metadata/index.backup.json` | 252 | backup file (sync to keep authoritative) |
| 5 | `scripts/cluster-config.json` | 170 | cluster-config consumed by orphan-injector + sitemap |
| 6 | `src/newblog/data/posts/smart-sleep-technology-and-alcohol-circadian-optimization-guide-2025.json` | 23 | `relatedPosts` entry |
| 7 | `src/newblog/data/posts/hangxiety-complete-guide-2026-supplements-research.json` | n/a (in `relatedPosts` array, exact line varies) | `relatedPosts` entry |
| 8 | `public/sitemap.xml` | 731 | **auto-regenerated** by `scripts/generate-sitemap.js` from JSON `slug` — will fix itself on `npm run build` |
| 9 | `public/blog-canonicals.json` | 562-563 | **auto-regenerated** by `scripts/generate-blog-canonicals.js` — will fix itself on `npm run build` |

**Non-issue**: items 8 and 9 only need `npm run build` to regenerate. Items 1-7 are source edits.

**Recommended new slug**: `gen-z-mental-health-revolution-58-percent-drinking-less-2025`

Reasoning: drops `why-`, `are-drinking-less-for-wellness-in` → simpler `drinking-less`, replaces `58%` → `58-percent`. Result is 56 chars (down from 81), all `[a-z0-9-]`, RFC-3986 unreserved.

**Redirect to add (`vercel.json`)**:
```json
{
  "source": "/never-hungover/gen-z-mental-health-revolution-why-58%25-are-drinking-less-for-wellness-in-2025",
  "destination": "/never-hungover/gen-z-mental-health-revolution-58-percent-drinking-less-2025",
  "permanent": true
}
```
Note: `%25` (URL-encoded `%`) in the `source` because Vercel matches against the decoded path, but `%25` in JSON is what reaches Vercel as the literal `%` character. **Must verify post-deploy** that a literal-`%` URL hits this rule.

## Bug 2 — apostrophe in slug

**File**: `src/newblog/data/posts/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age.json`

**JSON metadata**:
- `id` and `slug`: same string (must change)
- `title`: `Social Media's Unseen Influence: Navigating Alcohol Wellness in the Digital Age` (no change)
- `image`: `/images/social-media-drinking-hero.webp` (no change)
- `relatedPosts`: 3 entries, none self-reference

**All references that must update on rename** (8 files):

| # | File | Line |
|---|------|------|
| 1 | `src/newblog/data/posts/<filename>.json` | rename + edit `id` + `slug` |
| 2 | `src/newblog/data/postRegistry.js` | 180 |
| 3 | `src/newblog/data/metadata/index.json` | 4 |
| 4 | `src/newblog/data/metadata/index.backup.json` | 4 |
| 5 | `src/newblog/data/posts/alcohol-and-anxiety-breaking-the-cycle-naturally-2025.json` | 20 (in `relatedPosts`) |
| 6 | `public/sitemap.xml` | 1115 — auto-regenerated |
| 7 | `public/blog-canonicals.json` | 877-878 — auto-regenerated |
| 8 | `cluster-config.json` | not present (this slug is NOT in any cluster) |

**Recommended new slug**: `social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age`

Reasoning: drop apostrophe (RFC-3986 sub-delim — technically valid but parser-unsafe in mixed-encoding pipelines). Result is 76 chars, all `[a-z0-9-]`.

**Redirect to add**:
```json
{
  "source": "/never-hungover/social-media's-unseen-influence-navigating-alcohol-wellness-in-the-digital-age",
  "destination": "/never-hungover/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age",
  "permanent": true
}
```

## Bug 3 — 307 redirect non-www → www

**Confirmed live**:
```
$ curl -sI 'https://dhmguide.com/' | grep -E 'HTTP|location'
HTTP/2 307
location: https://www.dhmguide.com/

$ curl -sI 'https://dhmguide.com/research' | grep -E 'HTTP|location'
HTTP/2 307
location: https://www.dhmguide.com/research
```

**Current `vercel.json` redirects (7 rules)**: NONE have a `host` predicate. The 307 is emitted by Vercel's dashboard "preferred domain" feature.

**Per official Vercel docs** (`/docs/project-configuration/vercel-json#redirects`):
> `permanent` — An optional boolean (default `true`). When `true`, the status code is 308. When `false` the status code is 307.

**Working host-predicate syntax** (confirmed from Vercel community thread + docs):
```json
{
  "source": "/(.*)",
  "has": [
    { "type": "host", "value": "dhmguide.com" }
  ],
  "destination": "https://www.dhmguide.com/$1",
  "permanent": true
}
```

**Critical sequencing**: After deploying this, the dashboard "Redirect to Preferred Domain" setting must be **disabled**. If both rules are active simultaneously, behavior is undefined (Vercel community confirms race conditions). The `vercel.json` rule alone gives us 308.

**Note re destination**: Using absolute URL (`https://www.dhmguide.com/$1`) — required when crossing hosts. Confirmed working in the Vercel community example for cross-domain redirects.

## Bug 4 — `/dhm-dosage-calculator-new` route

**Files involved**:
- `src/App.jsx:22` — `'/dhm-dosage-calculator-new': lazy(() => import('./pages/DosageCalculatorRewrite/index.jsx'))`
- `src/hooks/useRouter.js:27` — `{ path: '/dhm-dosage-calculator-new', name: 'Dosage Calculator (New)', inNav: false }`
- `src/pages/DosageCalculatorRewrite/` — 5 files (`index.jsx`, `CalculatorForm.jsx`, `CalculatorResults.jsx`, `EducationSection.jsx`, `utils.js`), 30KB total
  - Last meaningful modification: 2025-01-23 (over 1 year stale)
  - 3 of 5 files dated 2025-07-06 (likely just touched by mass-edit)

**Public exposure**:
- `curl -sI` → 200 OK
- `<meta name="robots" content="index, follow">` (yes, indexable)
- `<link rel="canonical" href="https://www.dhmguide.com/">` (canonical points to **homepage**, not to itself or to `/dhm-dosage-calculator`) — broken canonicalization
- `<title>DHM Guide: Prevent Hangovers with Science-Backed Supplements</title>` (homepage title leaked, NOT calculator-specific)

**Internal usage**:
- Cross-codebase grep for `dhm-dosage-calculator-new`: **only** the 2 source files above + 4 historical docs in `docs/prds/` and `gsc_analysis/` and `ROUTING_CONSOLIDATION_ANALYSIS.md`. **Zero** internal links use this route.
- NOT in `Layout.jsx`, `Header.jsx`, `Footer.jsx`, mega-menu, or any blog post.
- NOT in sitemap.xml.
- NOT in blog-canonicals.json.

**Comparison to canonical `/dhm-dosage-calculator`**:
- Canonical version (`pages/DosageCalculatorEnhanced.jsx`): live, has correct `<title>DHM Dosage Calculator | Personalized Prevention</title>`, correct canonical, no broken signals
- Rewrite version: experimental, broken canonical, no traffic, abandoned January 2025

**Recommendation**: **Delete entirely** (Pattern #6 — pure deletion is the safest change). No internal links to break, no users to migrate, the route is dead weight emitting wrong SEO signals.

Implementation:
1. Remove `src/App.jsx:22`
2. Remove `src/hooks/useRouter.js:27`
3. Delete `src/pages/DosageCalculatorRewrite/` directory (5 files)
4. Add `vercel.json` redirect: `/dhm-dosage-calculator-new → /dhm-dosage-calculator` (308)

**Optional — `noindex` instead**: Rejected. The Rewrite has been stale 15+ months. If a future redesign wants to use this route name, it can resurrect it from git history. Keeping dead code per CLAUDE.md Pattern #10 ("Dead Code Costs More Than Disk Space").

## Out-of-Scope Confirmations

| Item | Confirmed out of scope |
|------|------------------------|
| Other DCNI URLs (#364/#365) | Yes — only the 2 specific malformed slugs are this PR |
| Internal linking expansion (Phase 1 of #362) | Yes — separate work |
| `Cache-Control` header rules | Yes — debunked per #362 audit |
| `dateModified` mass-bumps | Yes — neither slug-rename file gets a date update; `dateModified: null` stays `null` |
| `relatedPosts` content surgery | No — only edit lines that contain the renamed slug exactly |

## Risk Register

| Bug | Risk | Mitigation |
|-----|------|------------|
| 1, 2 | **Slug-filename drift**: JSON `slug` field and on-disk filename must stay in sync. If they drift, prerender and dynamic import both break. | Single change: edit `slug` + `id` fields, then rename file. Run `node verify-registry.js` (existing) to confirm postRegistry imports resolve. Then `node scripts/validate-posts.js`. |
| 1, 2 | **`relatedPosts` orphan**: Other posts have the old slug in their `relatedPosts` array — if not updated, in-app "Related" rail will 404. | Grep before AND after edit; only 2 cross-post references confirmed (smart-sleep-tech, alcohol-and-anxiety). |
| 1, 2 | **`metadata/index.backup.json` drift**: Out-of-tree backup; if not updated, future restore brings back the bug. | Update backup in same commit as authoritative file. |
| 1, 2 | **Old URL no longer indexed**: After rename, sitemap drops old URL. Without 308 redirect, the URL becomes a 404 at the SPA level (Vercel rewrites unmatched paths to `/index.html`, then SPA shows "post not found"). | Add 308 redirect rule pointing old → new in `vercel.json`. Verify with curl post-deploy. |
| 3 | **Race with dashboard rule**: If `vercel.json` host predicate is added but dashboard "Preferred Domain" is left on, behavior is undefined per Vercel community reports. | After deploy, **manually disable** the dashboard preferred-domain setting. Document this step in tasks.md. |
| 3 | **Wrong destination format**: `host` predicate doesn't include hostname in `source` matching. Destination must be absolute URL with new host. | Use `https://www.dhmguide.com/$1`, not `/$1`, in destination. |
| 3 | **Catch-all order**: Vercel matches redirects top-to-bottom. The `(.*)` catch-all should be near the end of the array so specific redirects (blog → never-hungover, etc.) match first. | Place after the existing 7 rules, before any future deletes. |
| 4 | **Inbound link from external site**: External site (social, email, doc) might link to `-new`. Without 308, that link becomes a soft 404. | 308 redirect to `/dhm-dosage-calculator` covers this gracefully. |
| 4 | **Importer breakage**: If anything else imports from `DosageCalculatorRewrite/`, build will fail. | Pre-delete grep: `grep -rn 'DosageCalculatorRewrite' src/` — confirmed only `App.jsx:22` imports the index.jsx; nothing else. Safe to delete. |
| All | **Sitemap regeneration**: `npm run build` regenerates sitemap.xml. If the rename is committed but not built, sitemap stays stale. | Tasks must include `npm run build` and inspection of `public/sitemap.xml` for both new slugs and absence of old slugs. |

## Verification Approach

| Bug | Pre-fix verification (failure repro) | Post-fix verification (success proof) |
|-----|--------------------------------------|----------------------------------------|
| 1 | `curl -sI 'https://www.dhmguide.com/never-hungover/gen-z-mental-health-revolution-why-58%25-are-drinking-less-for-wellness-in-2025'` returns `200 OK`. `grep -c 'gen-z-mental-health-revolution-why-58%' public/sitemap.xml` returns `1`. | After deploy: same curl returns `308` with `location: ...gen-z-mental-health-revolution-58-percent-drinking-less-2025`. New URL returns `200 OK`. `grep -c '%' public/sitemap.xml` returns `0`. `npm run build` exits 0. |
| 2 | `curl -sI "https://www.dhmguide.com/never-hungover/social-media's-unseen-influence..."` returns `200 OK`. | After deploy: returns `308` to new URL. New URL returns `200 OK`. `grep "'" public/sitemap.xml` returns nothing. |
| 3 | `curl -sI 'https://dhmguide.com/research'` returns `307`. | `curl -sI 'https://dhmguide.com/research' \| grep HTTP` returns `HTTP/2 308`. `curl -sI 'https://dhmguide.com/'` returns `HTTP/2 308`. Same for `/guide`, `/never-hungover/<any-slug>`. |
| 4 | `curl -sI 'https://www.dhmguide.com/dhm-dosage-calculator-new'` returns `200`. `curl -s` shows canonical = homepage. | `curl -sI 'https://www.dhmguide.com/dhm-dosage-calculator-new'` returns `308` with `location: /dhm-dosage-calculator`. Following redirect shows canonical = `/dhm-dosage-calculator`. |

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Lint | `npm run lint` | package.json scripts.lint |
| Validation | `npm run validate-posts` | package.json scripts.validate-posts |
| Registry verify | `node verify-registry.js` | repo root |
| Build | `npm run build` (runs `validate-posts → generate-blog-canonicals → generate-sitemap → vite build → verify-z-classes → prerender × 2`) | package.json scripts.build |
| TypeCheck | Not found (JS-only project) | n/a |
| Unit Test | Not found | n/a |
| Integration Test | Not found | n/a |
| E2E Test | Not found (Playwright present for ad-hoc only) | n/a |

**Local CI (this PR)**: `npm run lint && npm run validate-posts && node verify-registry.js && npm run build`

## Verification Tooling

| Tool | Command | Detected From |
|------|---------|---------------|
| Dev Server | `npm run dev` | package.json scripts.dev |
| Browser Automation | playwright (devDep, ad-hoc) | package.json |
| E2E Config | None at root | n/a |
| Port | 5173 (Vite default) | n/a explicit |
| Health Endpoint | None (static SPA) | n/a |
| Docker | None | n/a |

**Project Type**: Prerendered Vite + React SPA (static deploy on Vercel)
**Verification Strategy**: Build + curl-based post-deploy live tests against `dhmguide.com` and `www.dhmguide.com`. No automated E2E required for this PR — bugs are HTTP-status-level, easily verified by curl headers.

## Related Specs

| Spec | Goal | Relationship | mayNeedUpdate |
|------|------|--------------|---------------|
| (Parent) #362 — DCNI investigation | Plan to resolve 102 DCNI URLs across 4 phases | This spec is Action 1 of #362's plan | No — this spec narrows the scope correctly |
| #364 (planned) — Save/Merge/Delete bucketing | Content audit | High — #364 will reference these renames | Yes — once renamed, #364's URL list updates |
| #365 (planned) — Internal linking | Phase 1 of #362 | Medium — #365's link-injector reads `metadata/index.json` | Yes — after rename, `metadata/index.json` slugs change |
| #366 (referenced) — Mass-recrawl moratorium | Avoid >20-file commits during moratorium | Low — this PR touches ~9 files per slug × 2 + vercel.json + 2 src files = within budget | No — well under threshold |

## Recommendations for Requirements

1. **Atomic per-slug rename**: each slug rename is one logical unit — file rename + JSON `id`/`slug` edit + 4-7 reference edits + 1 redirect. Do not split across multiple commits.
2. **Build-verify after each rename**: `npm run build && grep -c <new-slug> public/sitemap.xml && grep -c <old-slug> public/sitemap.xml` (expect `1` and `0` respectively).
3. **Manual dashboard step for Bug 3**: tasks.md must include "After deploy: log into Vercel dashboard, disable preferred-domain redirect for `dhmguide.com`."
4. **Pure deletion for Bug 4**: do NOT keep with noindex; remove route, hook entry, and full `DosageCalculatorRewrite/` directory.
5. **No `dateModified` bumps**: per #362 moratorium, do not modify any `dateModified` field on the renamed posts. Both currently are `null`; keep `null`.
6. **Redirect order**: append all 4 new redirects to the END of the existing 7-rule `vercel.json` `redirects` array. The non-www catch-all `(.*)` must come AFTER the slug-specific 308 redirects, otherwise it eats them when accessed via `dhmguide.com` (no www). Actually, since the catch-all has a `host: dhmguide.com` predicate and the slug-specific rules don't, ordering doesn't conflict — but place specific before catch-all as defensive convention.
7. **Out of scope but worth noting**: the existing 7 redirects use `permanent: true` consistently — good. No 307s in the JSON-defined rules.

## Open Questions

None blocking. All 4 bugs have unambiguous fixes.

(Minor) For Bug 3, the spec mentions "Vercel's dashboard `Redirect to Preferred Domain`" must be disabled. If the user does not have dashboard access at deploy time, the rule will still work but may emit two redirects in series (dashboard 307 → vercel.json 308) instead of one. This is suboptimal but functional. Tasks.md will include the manual step but the implementation is independent of it.

## Sources

External:
- [Vercel — Configuration Redirects](https://vercel.com/docs/routing/redirects/configuration-redirects)
- [Vercel — vercel.json `redirects` reference](https://vercel.com/docs/project-configuration/vercel-json#redirects) — confirms `permanent: true` ⇒ 308
- [Vercel community — host predicate working example](https://vercel.com/docs/redirects/configuration-redirects)
- [RFC 3986 §2.1 — percent-encoding requires `%` followed by exactly two hex digits](https://www.rfc-editor.org/rfc/rfc3986)
- [Wikipedia — Percent-encoding](https://en.wikipedia.org/wiki/Percent-encoding)

Internal (codebase):
- `vercel.json` (current 7 redirects, no host predicate)
- `src/App.jsx:22` (Bug 4 entry)
- `src/hooks/useRouter.js:27` (Bug 4 entry)
- `src/pages/DosageCalculatorRewrite/` (Bug 4 directory, 5 files)
- `src/newblog/data/posts/gen-z-...58%-...json` (Bug 1)
- `src/newblog/data/posts/social-media's-...json` (Bug 2)
- `src/newblog/data/postRegistry.js:117,180`
- `src/newblog/data/metadata/index.json:4,252` and `index.backup.json:4,252`
- `scripts/cluster-config.json:170`
- `src/newblog/data/posts/smart-sleep-technology-and-alcohol-circadian-optimization-guide-2025.json:23`
- `src/newblog/data/posts/alcohol-and-anxiety-breaking-the-cycle-naturally-2025.json:20`
- `src/newblog/data/posts/hangxiety-complete-guide-2026-supplements-research.json` (relatedPosts entry)
- `public/sitemap.xml:731,1115` (auto-regen)
- `public/blog-canonicals.json:562-563,877-878` (auto-regen)
- `scripts/generate-sitemap.js` — confirms slug emitted verbatim into `<loc>`
- `scripts/generate-blog-canonicals.js` — confirms slug emitted verbatim into canonical URL
- `scripts/prerender-blog-posts-enhanced.js:346` — uses `post.slug` as directory name
