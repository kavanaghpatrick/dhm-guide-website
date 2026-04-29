---
spec: issue-364-hub-promotion
phase: research
created: 2026-04-29
mode: quick
issue: 364
parent_issue: 362
---

# Research: issue-364-hub-promotion

## Executive Summary

Promote 2 hub JSON posts to actual cluster pillars by adding 2 entries to `scripts/cluster-config.json` (the mega-menu auto-renders from this), rewriting 112 `/blog/` markdown links → `/never-hungover/` in the science hub, and skipping the `pillar: true` registry flag (no consumer exists). The mega-menu is **fully data-driven**, eliminating Layout.jsx refactor risk. Biggest gotcha: 7 of 112 `/blog/` links point to non-existent slugs — bare regex rewrite leaves dead links.

## 1. Hub Content Audit

| Metric | Safety Hub | Science Hub |
|---|---|---|
| Slug | `ultimate-dhm-safety-guide-hub-2025` | `complete-hangover-science-hub-2025` |
| Word count (`content` field) | 1,728 | 1,737 |
| Schema `@type` (prerendered) | `Article` (NOT `CollectionPage`) | `Article` (NOT `CollectionPage`) |
| Inbound `relatedPosts` mentions | 3 | 7 |
| Inbound **body content** links | **0** | **0** |
| `/blog/*` markdown links in content | 0 | **112** |
| `/never-hungover/*` markdown links in content | 11 | 0 |
| Total `/blog/` strings | 0 | 113 (1 = `mainEntityOfPage @id`) |

**Important correction to issue #364**: It claims "12 inbound contextual body links each." Verified directly: **zero body-content links exist** to either hub. The 12 figure must have been confusing `relatedPosts` array entries (3 + 7 = 10, close to 12) with body links. This makes the structural-prominence problem worse than #364 stated, not better — every "inbound" mention is just a JSON array reference, not a real anchor in prose.

**Schema observation**: Both hubs emit `Article` schema (verified in `dist/never-hungover/{slug}/index.html`). Issue #364 mentions a "5.6: optional CollectionPage schema" but the in-scope task list (1–4 in `.progress.md`) does not include it. We honor scope and leave schema as `Article`.

## 2. Mega-Menu Structure Analysis

**Location**: `src/components/layout/Layout.jsx` lines 379–462 (desktop), 273–315 (mobile).

**Structure: FULLY DATA-DRIVEN** from `scripts/cluster-config.json`:

```jsx
{clusterConfig.clusters.map((cluster) => {
  const pillarHref = `/never-hungover/${cluster.pillar}`
  return (
    <div key={cluster.name}>
      <a href={pillarHref}>{clusterLabel(cluster.name)} →</a>
      <ul>
        {cluster.spokes.slice(0, SPOKES_PER_CLUSTER).map(spoke => ...)}
      </ul>
    </div>
  )
})}
```

**Implication**: Adding 2 entries to `cluster-config.json` automatically promotes both hubs to mega-menu pillars in BOTH desktop and mobile menus. Zero JSX changes required. This removes the "hardcoded JSX" risk from the planning #362 list.

**Label generation**: `clusterLabel(name)` (lines 19–24) converts kebab-case cluster name → human-readable. Hardcoded special-cases: `'dhm-master'→'DHM Master'`, `'health-impact'→'Alcohol & Health'`. New cluster names will need either matching kebab-case that auto-titlecases nicely, or one-line additions to `clusterLabel`.

**Spoke title generation**: `slugToSpokeTitle(slug)` (lines 26–35) strips `-2025` and `-complete-guide` suffixes, capitalizes, caps at 6 tokens. Works automatically for any spoke slug.

**Display cap**: `SPOKES_PER_CLUSTER = 5` — only the first 5 spokes per cluster appear in the menu. Order matters.

## 3. postRegistry Pillar Flag

`src/newblog/data/postRegistry.js` is a pure import map: `{slug: () => import('./posts/X.json')}`. **No `pillar`, `featured`, `isHub`, or any flag field exists.**

`grep -rE "\.pillar\b|\.featured\b|isHub\b" src/` returns **only** the two `Layout.jsx` lines that read `cluster.pillar` from `clusterConfig`. **Nothing in the codebase consumes a per-post pillar flag.**

**Recommendation: SKIP step 2 from `.progress.md`.** Adding `pillar: true` to entries in postRegistry.js would be inert metadata. The `pillar` concept already lives in `cluster-config.json`. Adding a flag with no consumer is dead weight per CLAUDE.md Pattern #10 (Dead Code Costs More Than Disk Space). If we want a per-post hub flag for future UI, the simplest place is the post JSON itself (`"pillar": true`), not the registry import map.

**Alternative interpretation**: If "pillar flag in registry" was intended as semantic markup ("declarative source of truth"), adding it to the post JSON files (rather than postRegistry.js) is cleaner — the JSON is already the data, the registry is just a Vite import shim. But still: no consumer, no value, defer.

## 4. cluster-config.json Structure

**Schema** (verified):
```json
{
  "version": 1,
  "clusters": [
    {
      "name": "kebab-case-id",
      "pillar": "post-slug",
      "spokes": ["post-slug", ...],
      "keywords": ["..."],
      "anchor_phrases": ["..."]
    }
  ]
}
```

**Existing clusters (8 total)**: `dhm-master`, `liver-health`, `health-impact`, `alcohol-science`, `hangover-prevention`, `product-reviews`, `spirit-specific-hangovers`, `hangxiety-mental-health`.

**Verified**: Neither `ultimate-dhm-safety-guide-hub-2025` nor `complete-hangover-science-hub-2025` appears anywhere in cluster-config (not as pillar, not as spoke, in any cluster). **Zero conflicts.**

**Cluster-formalize implications** (from reading `scripts/cluster-formalize.mjs`):
- The script auto-injects `<!-- cluster-pillar-link:auto -->` blockquotes in spokes pointing to their pillar.
- It also auto-builds `<!-- cluster-index:auto -->` "Related Topics" sections in pillars listing all spokes.
- **If we register the hubs as pillars, running `cluster-formalize.mjs --apply` will auto-mutate both hubs' content** (add cluster-index sections) AND mutate every spoke's content (add pillar-link blockquotes).
- This is desired — that IS what "promote to pillar" means structurally. But should be a deliberate, separate task.

**Placement decision**:

Two viable approaches:

**Option A — Two NEW clusters (recommended)**:
- `dhm-safety` cluster with `ultimate-dhm-safety-guide-hub-2025` as pillar; spokes = the 6 safety posts already linked in the hub's body (`is-dhm-safe-science-behind-side-effects-2025`, `dhm-medication-interactions-safety-guide-2025`, `dhm-women-hormonal-considerations-safety-2025`, `dhm-adults-over-50-age-related-safety-2025`, `can-you-take-dhm-every-day-long-term-guide-2025`, `dhm-dosage-guide-2025`).
- `hangover-science` cluster with `complete-hangover-science-hub-2025` as pillar; spokes = top science posts from the hub's body (`how-to-cure-a-hangover-complete-science-guide`, `how-long-does-hangover-last`, `dhm-science-explained`, `dhm-randomized-controlled-trials`, `dhm-japanese-raisin-tree-complete-guide`).

**Option B — Reorganize existing clusters**:
- Demote `dhm-dosage-guide-2025` from `dhm-master` pillar → spoke; promote safety hub to pillar.
- Demote `functional-medicine-hangover-prevention-2025` from `hangover-prevention` pillar → spoke; promote science hub to pillar.

**Recommend Option A.** Option B forces re-running cluster-formalize which mutates content of all 17 spokes in those two existing clusters (extra blast radius). Option A is purely additive: 2 new clusters appear in the mega-menu (going from 8 → 10), 11 existing posts gain an additional `relatedPosts` mention. Mega-menu grid is currently `grid-cols-3`, so 10 clusters renders as 4 rows (3+3+3+1). Acceptable; alternatively widen to `grid-cols-4` (out of scope).

**Spoke conflict tolerance**: Same slug appearing as spoke in multiple clusters is **already common** in the existing config (e.g., `dhm-women-hormonal-considerations-safety-2025` is a spoke in `hangxiety-mental-health` and we'd add it to `dhm-safety`). Verified `cluster-formalize.mjs` handles this — `relatedPosts` is capped at 5 with merge logic.

## 5. The 112 Redirect-Chain Fix

**Verified count**: `complete-hangover-science-hub-2025.json` content has **112** `/blog/` markdown links (issue #364 said 107 — close but undercount). All 112 are inside markdown link parens `(/blog/...)`. The 113th `/blog/` string is `"@id":"https://yoursite.com/blog/complete-hangover-science-hub-2025"` in the embedded schema (a placeholder URL — separate cleanup, out of scope).

**Sample before/after**:
```
- [How to Cure a Hangover](/blog/how-to-cure-a-hangover-complete-science-guide)
- [How Long Does a Hangover Last?](/blog/how-long-does-hangover-last)
- [DHM Science Explained](/blog/dhm-science-explained)
```
becomes
```
- [How to Cure a Hangover](/never-hungover/how-to-cure-a-hangover-complete-science-guide)
- [How Long Does a Hangover Last?](/never-hungover/how-long-does-hangover-last)
- [DHM Science Explained](/never-hungover/dhm-science-explained)
```

**Substring-replace safety check**: `grep -oE "[^(]/blog/" complete-hangover-science-hub-2025.json` returns only the schema `mainEntityOfPage @id` URL (clearly not a markdown link). Using a regex anchored to the markdown-link-open paren is safe:

```js
content = content.replace(/\(\/blog\//g, '(/never-hungover/')
```

This precisely matches the 112 markdown links and ignores the schema URL. The vercel.json rule `"source": "/blog/:slug*"` → `"destination": "/never-hungover/:slug*"` (308 permanent) is the redirect being short-circuited; eliminating these 112 hops directly is a clean SEO win.

**CRITICAL DISCOVERY — broken slugs**: 7 of the 112 `/blog/` link targets do NOT exist in `postRegistry.js`. Sample missing slugs:
- `complete-guide-hangover-types-2025`
- `whiskey-vs-vodka-hangover`
- `hangxiety-2025-dhm-prevents-post-drinking-anxiety`
- `flyby-vs-fuller-health-complete-comparison-2025`
- `professional-hangover-free-networking-guide-2025`

These 7 links are currently 404s under `/never-hungover/*` (and presumably also under `/blog/*` after the 308). Bare `/blog/` → `/never-hungover/` rewrite leaves 7 dead links pointing at the same 404. **Mitigation needed**: either (a) verify if these slugs were renamed and find replacements, (b) delete the 7 dead links from the hub content entirely, or (c) leave as-is (they're 404s either way). Recommend (a)+(b): try to resolve via similar-slug lookup, delete unresolvable ones. This is a content-quality task that the requirements/design phases must specify.

## 6. Verification Approach

| Acceptance criterion | Verification command |
|---|---|
| Both hubs in mega-menu | After deploy: `curl -s https://www.dhmguide.com/ \| grep -E "ultimate-dhm-safety-guide-hub\|complete-hangover-science-hub"` (mega-menu links pre-render in HTML) |
| Both as cluster pillars | `node -e "console.log(require('./scripts/cluster-config.json').clusters.filter(c=>c.pillar.includes('hub')).map(c=>c.pillar))"` shows both |
| Science hub `/blog/` links eliminated | `grep -c '(/blog/' src/newblog/data/posts/complete-hangover-science-hub-2025.json` returns `0` |
| Build passes | `npm run build` exits 0 (includes `validate-posts`, `verify-z-classes`, prerender-blog-posts-enhanced) |
| Both hub HTMLs render | `ls dist/never-hungover/{ultimate-dhm-safety-guide-hub-2025,complete-hangover-science-hub-2025}/index.html` |
| Both schemas correct (Article — unchanged) | `grep -oE '"@type":"Article"' dist/never-hungover/ultimate-dhm-safety-guide-hub-2025/index.html` returns ≥1 |
| GSC URL Inspection submitted | Manual user step post-deploy (out of automated verification) |

## 7. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Mega-menu Layout.jsx is hardcoded JSX | **NONE** | Mega-menu is fully data-driven from cluster-config.json. Verified. |
| Hub slugs already exist as pillar/spoke (conflict) | **NONE** | Verified neither slug appears anywhere in cluster-config.json. |
| `/blog/` substring matches non-link prose | **LOW** | Regex `\(\/blog\//g` precisely targets markdown-link-open paren. Verified only 1 non-link `/blog/` string (schema URL) — and that one starts with `m` not `(`. |
| **7 of 112 `/blog/` links target non-existent slugs** | **MEDIUM** | Bare rewrite leaves 7 dead links pointing at 404s. Requirements phase must specify: resolve to nearest-match slug OR delete the line entirely. |
| Issue #364 over-claims 12 inbound body links | **MEDIUM** | Reality: zero body links inbound to either hub. The "structural prominence" problem is worse than #364 said. Mega-menu addition is even more justified. |
| Adding 2 clusters expands mega-menu from 8→10 | **LOW** | Grid is `grid-cols-3`; 10 renders as 4 rows (3+3+3+1). Visually acceptable. Out-of-scope to widen grid. |
| `cluster-formalize.mjs --apply` will auto-mutate hub content | **LOW (and likely desired)** | Per the script's design, registering as a pillar invites auto-injection of cluster-index sections. The implementation phase should decide: run formalize OR don't. Recommend not running it in this PR — keep diff minimal, ship just config + link rewrite. |
| Skipping the `pillar: true` registry flag deviates from #364 | **NONE** | No consumer exists. Adding it would create dead weight (CLAUDE.md Pattern #10). Document the deviation in requirements.md. |
| Post-deploy DCNI exit fails (4-8 weeks) | **CONTENT-BOUND** | If both hubs remain DCNI 6+ weeks after this ships, the issue is content (the science hub is 64% link-list aggregator), not discoverability — escalates to Action 3 (#364 §2.5). Defer per `.progress.md` scope. |

## 8. Out-of-Scope Confirmations

Per `.progress.md`:
- **NOT** adding 1,500+ words of original content to either hub (deferred — Action 3 territory).
- **NOT** renaming `-hub-2025` slug suffix (deferred 4-6 weeks post-ship if URLs remain DCNI).
- **NOT** touching other DCNI URLs (those are #365).
- **NOT** programmatic GSC submission (manual user step).
- **NOT** adding `pillar: true` to postRegistry.js (no consumer; per simplicity rule).
- **NOT** changing schema from `Article` → `CollectionPage` (issue #364 §2.5 mentions it as alternative; not in the in-scope task list).
- **NOT** running `cluster-formalize.mjs --apply` to auto-inject pillar/spoke link blocks (separate concern; keep this PR's diff minimal).
- **NOT** widening mega-menu grid from `grid-cols-3` to accommodate 10 clusters (visual concern; current 4-row layout is fine).

## Sources

- `.progress.md` — spec scope decisions
- GitHub issue #364 (`gh issue view 364 --repo kavanaghpatrick/dhm-guide-website`) — original task definition
- `src/newblog/data/posts/ultimate-dhm-safety-guide-hub-2025.json` — direct read
- `src/newblog/data/posts/complete-hangover-science-hub-2025.json` — direct read
- `src/components/layout/Layout.jsx` lines 1–90, 379–462 — mega-menu rendering logic
- `src/newblog/data/postRegistry.js` — verified no flag fields exist
- `scripts/cluster-config.json` — schema and existing 8 clusters
- `scripts/cluster-formalize.mjs` lines 1–50, 280–430 — pillar/spoke side effects
- `scripts/generate-related-posts.mjs` — pillar role consumption
- `package.json` `scripts.build` — build pipeline (validate-posts → vite build → verify-z-classes → prerender)
- `vercel.json` — `/blog/:slug*` → `/never-hungover/:slug*` 308 redirect rule (the chain we're eliminating)
- `dist/never-hungover/{hub}/index.html` — verified `Article` schema in current prerendered output
