---
spec: issue-364-hub-promotion
phase: requirements
created: 2026-04-29
mode: quick
issue: 364
parent_issue: 362
---

# Requirements: issue-364-hub-promotion

## Feature

Promote 2 hub posts (`ultimate-dhm-safety-guide-hub-2025`, `complete-hangover-science-hub-2025`) to actual cluster pillars by adding 2 new clusters to `scripts/cluster-config.json` (auto-promotes both hubs into the desktop and mobile mega-menu via the existing data-driven iteration in Layout.jsx — no JSX edits). Concurrently rewrite the 112 `/blog/` markdown links in the science hub's content field to canonical `/never-hungover/` paths to eliminate the 308-redirect chain. Handle the 7 dead-link targets (slugs not in postRegistry) explicitly via nearest-slug match where one exists or line removal where it does not. Skip the originally-planned `pillar: true` flag on postRegistry.js (no consumer in the codebase — would be inert metadata per CLAUDE.md Pattern #10) and skip Layout.jsx edits (mega-menu is fully data-driven).

## Goal

Move both hubs from Discovered Currently Not Indexed (DCNI) to indexed by adding sitewide structural prominence (mega-menu inbound links from every page) and eliminating the redirect-chain crawl-budget tax inside the science hub's content.

## User Stories

### US-1: Search engine receives sitewide nav inbound to hubs
**As a** search engine crawler (Googlebot)
**I want to** find both hub URLs in sitewide navigation (mega-menu)
**So that** they accumulate authority signals from every page on the site and exit DCNI

**Acceptance Criteria:**
- [ ] AC-1.1: Both hub URLs appear in prerendered desktop and mobile mega-menu HTML after build
- [ ] AC-1.2: Mega-menu emits 10 cluster sections (was 8); 2 new sections render with hub pillar slugs as their `→` link targets

### US-2: Search engine sees canonical-path internal links from hub content
**As a** search engine
**I want to** follow `/never-hungover/` (200 OK) links inside hub content
**So that** I don't waste crawl budget on `/blog/` → `/never-hungover/` 308 hops

**Acceptance Criteria:**
- [ ] AC-2.1: Science hub content field has 0 markdown links pointing to `/blog/`
- [ ] AC-2.2: ≥105 of 112 original `/blog/` link openings rewritten to `/never-hungover/`
- [ ] AC-2.3: 7 dead-link targets handled per design.md decisions (replaced or removed; no broken `/never-hungover/` 404s introduced)

### US-3: Future maintainer sees clean broken-link audit
**As a** future maintainer
**I want to** run the broken-internal-link audit and see 0 broken refs in the science hub
**So that** signal stays clean and regressions are easy to catch

**Acceptance Criteria:**
- [ ] AC-3.1: `scripts/check-broken-internal-links.mjs` returns 0 broken refs in `complete-hangover-science-hub-2025.json` after PR

## Functional Requirements

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| FR-1 | Add `dhm-safety` cluster to `scripts/cluster-config.json` | High | `node -e "console.log(require('./scripts/cluster-config.json').clusters.find(c=>c.name==='dhm-safety').pillar)"` returns `ultimate-dhm-safety-guide-hub-2025` |
| FR-2 | Add `hangover-science` cluster to `scripts/cluster-config.json` | High | Same query returns `complete-hangover-science-hub-2025` |
| FR-3 | Each new cluster has ≥4 spokes drawn from existing indexed posts | High | `clusters.find(...).spokes.length >= 4`; each spoke slug exists in postRegistry.js |
| FR-4 | Each new cluster matches existing schema shape (`name`, `pillar`, `spokes`, `keywords`, `anchor_phrases`) | High | JSON validates against same key set as existing 8 clusters |
| FR-5 | Rewrite all 112 `(/blog/<slug>)` openings to `(/never-hungover/<slug>)` in science hub content | High | `grep -cE '\(/blog/' src/newblog/data/posts/complete-hangover-science-hub-2025.json` returns `0` |
| FR-6 | Handle 7 dead-link targets per design.md per-link decision | High | After rewrite, every `/never-hungover/<slug>` link in hub content has matching slug in postRegistry.js |
| FR-7 | Build passes with new config + content | High | `npm run build` exits 0 (validate-posts → vite → verify-z-classes → prerender) |
| FR-8 | Both hubs prerender as before, no schema regression | Medium | `dist/never-hungover/{both-slugs}/index.html` exist; `<meta name="robots" content="index, follow">` present |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | JSON style consistency | Indent | 2-space, matching existing cluster-config style |
| NFR-2 | Build pipeline gate | Exit code | `npm run build` returns 0 |
| NFR-3 | Internal link audit gate | Broken refs in hub | 0 from `scripts/check-broken-internal-links.mjs` |
| NFR-4 | PR scope discipline | Files changed | ≤3 (cluster-config.json, hub JSON, spec scaffold) |
| NFR-5 | Single PR, logical commits | Commits | 1 commit per concern (cluster-config / hub content rewrite / spec) |

## Glossary

- **DCNI**: Discovered Currently Not Indexed — Google found the URL but chose not to index it.
- **Hub**: A long-form post acting as a topic-cluster pillar (entry point + branching to specialist posts).
- **Cluster pillar**: An entry in `scripts/cluster-config.json` whose `pillar` slug becomes the cluster's mega-menu link.
- **Spoke**: A post listed in a cluster's `spokes` array; appears in mega-menu (top 5) and gets `relatedPosts` injection.
- **Mega-menu**: Site-wide nav dropdown; data-driven from `cluster-config.json` (Layout.jsx lines 401–444 desktop, 275–315 mobile).
- **Redirect chain**: `/blog/X` (308 → `/never-hungover/X` 200). Internal links pointing at `/blog/` waste a hop and crawl budget.
- **Dead-link target**: A slug referenced in hub content that does not exist in `postRegistry.js` (returns 404 under either `/blog/` or `/never-hungover/`).

## Scope

### In Scope
- `scripts/cluster-config.json` — add 2 new clusters (Option A from research; purely additive, 8 → 10 clusters)
- `src/newblog/data/posts/complete-hangover-science-hub-2025.json` — rewrite 112 `/blog/` markdown links and handle 7 dead targets
- Spec scaffold under `specs/issue-364-hub-promotion/`

### Out of Scope
- `src/components/layout/Layout.jsx` — data-driven; auto-handled by cluster-config additions
- `src/newblog/data/postRegistry.js` `pillar: true` flag — no consumer in codebase (CLAUDE.md Pattern #10)
- Schema swap from `Article` to `CollectionPage` (issue #364 §2.5; deferred)
- Adding 1,500+ words of original prose to either hub (deferred — Action 3 territory)
- Renaming `-hub-2025` slug suffix (deferred 4-6 weeks post-ship if URLs remain DCNI)
- Other DCNI URLs (issue #365)
- GSC URL Inspection / Request Indexing (manual user step post-deploy)
- Running `cluster-formalize.mjs --apply` (would auto-mutate hub + spoke content; out of this PR's diff)
- Widening mega-menu grid from `grid-cols-3` to `grid-cols-4` (visual concern; current 4-row layout acceptable)
- Cleaning up the schema `mainEntityOfPage @id` placeholder URL in hub JSON

## Dependencies

- Research phase (`research.md`) confirms zero conflicts in cluster-config (neither hub appears as pillar/spoke).
- Existing build pipeline (`validate-posts.js`, `verify-z-classes.mjs`, prerender) must remain green.
- All chosen spokes must already exist in `postRegistry.js` (avoid pulling DCNI URLs into clusters as spokes).

## Edge Cases

- **EC-1**: 7 dead-link targets in science hub. Per-link decision required in design.md: (a) replace with nearest-existing slug if topic match, (b) delete the markdown line if no match, (c) never leave a broken `/never-hungover/` reference. Sample dead targets: `complete-guide-hangover-types-2025`, `whiskey-vs-vodka-hangover`, `hangxiety-2025-dhm-prevents-post-drinking-anxiety`, `flyby-vs-fuller-health-complete-comparison-2025`, `professional-hangover-free-networking-guide-2025` (research.md §5).
- **EC-2**: Spoke slug appearing in 2 clusters (e.g., `dhm-women-hormonal-considerations-safety-2025` in both `dhm-safety` and existing `hangxiety-mental-health`). Already common pattern; `cluster-formalize.mjs` handles via 5-cap merge logic. No mitigation needed.
- **EC-3**: Mega-menu grid expansion from 8 → 10 clusters renders as 4 rows (3+3+3+1) under `grid-cols-3`. Visually acceptable; do not widen grid in this PR.
- **EC-4**: New cluster names (`dhm-safety`, `hangover-science`) must auto-titlecase or get one-line additions to `clusterLabel()` in Layout.jsx if pretty labels matter. Acceptable to use kebab-case that auto-titlecases; design.md decides.
- **EC-5**: Schema `mainEntityOfPage @id` URL inside hub JSON contains a `/blog/` substring — regex `\(/blog/` (with paren prefix) excludes it correctly. Verified in research.md §5.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| 7 dead-link replacements wrong-topic → soft 404 in Google's eyes | **HIGH** | Per-link decision documented in design.md. When in doubt, delete the line rather than guess a replacement. |
| Spoke choice pulls a DCNI URL into a cluster (dilutes pillar signal) | **Medium** | Spoke selection rule: every spoke must already exist in postRegistry.js AND not be on the issue #365 DCNI list. Verify before commit. |
| Cluster spoke conflict with existing cluster | **Low** | Verified in research.md: same slug across clusters is already tolerated by `cluster-formalize.mjs` 5-cap logic. |
| `cluster-formalize.mjs --apply` accidentally re-runs and mutates hub content | **Low** | Don't run that script in this PR; document as out-of-scope. |
| Build fails due to malformed JSON in cluster-config | **Low** | Validate JSON syntax pre-commit; build pipeline `validate-posts.js` runs first. |

## Unresolved Questions

- **UQ-1**: For each of the 7 dead-link targets, does a nearest-slug replacement exist in postRegistry.js, or must the line be deleted? **Resolution**: design.md Phase 1 task — per-link decision table.
- **UQ-2**: Final spoke selection for `dhm-safety` (6 candidates) and `hangover-science` (5+ candidates) — which 5 maximize topical authority? **Resolution**: design.md spoke-ordering rationale; first 5 appear in mega-menu.
- **UQ-3**: Does `clusterLabel()` need updates for `dhm-safety` → "DHM Safety" and `hangover-science` → "Hangover Science"? **Resolution**: design.md visual-rendering check (kebab-case auto-titlecase often suffices; verify against existing `'health-impact'→'Alcohol & Health'` precedent).

## Success Criteria

- Both hubs appear in mega-menu HTML on every prerendered page (ground truth: `curl <host>/ | grep <hub-slug>`).
- Science hub has 0 markdown `/blog/` links in content; 0 broken internal-link audit hits.
- `npm run build` exits 0; PR diff is ≤3 files; PR ships in single review pass.
- Post-deploy (4-8 weeks): both hub URLs exit DCNI per GSC URL Inspection. (Out of automated verification; manual user check.)

## Next Steps

1. Run `/ralph-specum:design` to create design.md with: per-link decision table for the 7 dead targets, spoke selection + ordering rationale per new cluster, `clusterLabel()` audit, build verification commands.
2. Run `/ralph-specum:tasks` to decompose into commit-sized work units.
3. Run `/ralph-specum:implement` to execute.
