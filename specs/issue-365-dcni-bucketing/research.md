---
spec: issue-365-dcni-bucketing
phase: research
created: 2026-04-29
mode: quick
issue: 365
parent_issue: 362
---

# Research: issue-365-dcni-bucketing

## Executive Summary

Build `scripts/dcni-bucket.mjs` (ESM) that joins a user-provided GSC CSV against post JSONs (197), `cluster-config.json` (8 clusters / 60 slugs), `orphan-injection-plan.json` (28 active rows + 2 skipped), and grep-derived inbound body-link counts to emit a deterministic Save / Merge / Delete / Review decision table at `docs/dcni-<date>/buckets.json` + `.md`. **No deletions, no JSON mutations, no `vercel.json` edits** — pure tooling. Biggest risk: off-strategy slug heuristic over-flags real content; mitigation = explicit `review` bucket for borderline cases + manual sign-off before any deletion ships in a future PR.

## 1. Available Data Sources

| Source | Path | Shape | Joinable On |
|---|---|---|---|
| Post JSONs | `src/newblog/data/posts/*.json` | 202 files (verified `ls \| wc -l`); fields: `slug`, `title`, `dateModified`, `date`, `content`, `tags`, `relatedPosts`, `image`, `faq`, `id` | filename stem ↔ slug |
| Cluster config | `scripts/cluster-config.json` | 8 clusters, each with `pillar` (string) + `spokes` (string[]); 60 unique slugs total | slug literal match |
| Orphan injection plan | `scripts/orphan-injection-plan.json` | 30 rows (28 active + 2 skipped); `source_hub`, `target_orphan`, `anchor_text`, `sentinel_phrase` | both `source_hub` and `target_orphan` ↔ slug |
| Inbound body links | grep `(/never-hungover/<slug>)` across all post `content` fields | int per slug | computed |
| First-commit date | `git log --diff-filter=A --format=%ai -- <path>` | ISO timestamp | post path |
| GSC CSV (external) | `data/gsc-pages-<date>.csv` | rows: `URL, Impressions, Clicks, CTR, Position` | URL → strip prefix → slug |

**Note**: 202 post files vs. issue text's 197 — discrepancy is 5 posts that landed after parent #362 was filed. Script must enumerate `posts/` directly, not trust hardcoded counts.

**Note**: Existing precedent for ESM script lives at `scripts/orphan-post-link-injector.mjs` — reuse its `readJSON` / `__dirname` / argv-parsing pattern for consistency.

## 2. GSC CSV Format Expectations

Per Google Search Console UI: Performance report → Pages tab → 16-month range → Export → CSV.

| Column | Type | Notes |
|---|---|---|
| URL (or `Top pages`) | string | Full URL e.g. `https://www.dhmguide.com/never-hungover/<slug>` — script strips `https://www.dhmguide.com/never-hungover/` prefix |
| Impressions | int | 16-month total |
| Clicks | int | 16-month total |
| CTR | percentage string ("3.5%") | Parse, strip `%`, divide by 100 (or skip if not used) |
| Position | float | Average position over period |

Header row included. Missing rows = URLs that earned 0 impressions in the period — treat as `impressions: 0`. Non-`/never-hungover/` URLs (e.g. `/`, `/guide`, `/reviews`) flow through as pass-through (skipped from bucketing; reported in summary as "non-blog URLs ignored: N").

**Tolerance rules**:
- Tolerate UTF-8 BOM at start of file (GSC sometimes includes it)
- Tolerate trailing whitespace / CRLF
- Tolerate quoted columns (use a small CSV parser; do not naively `split(',')` because URLs can contain commas in query strings)
- Validate header row up front; clear error message on schema drift

## 3. Decision Rule Logic

Per #365 acceptance criteria, distilled into deterministic predicates evaluated per slug:

### SAVE (any one is sufficient)

```
slug ∈ pillar OR slug ∈ spokes      // cluster member
OR impressions16mo ≥ 160             // ≈ 30/30d uniform; conservative threshold from issue
OR inboundBodyLinks ≥ 3              // computed via grep
OR position ≤ 50 AND impressions16mo > 0  // currently ranking
```

### MERGE (heuristic — both required)

```
slug matches a "near-duplicate sibling" pattern (4+ siblings sharing template prefix)
AND wordCount within ±20% of siblings
```
Identified pattern groups (from #362 audit + filesystem scan):
- `british-pub-culture-guide`, `french-wine-culture-guide`, `german-beer-culture-guide`, `spanish-drinking-culture-guide` (4 siblings; `italian-drinking-culture-guide` is INDEXED → keep as canonical, fold others)
- Spirit-specific guides already in cluster (`vodka-`, `whiskey-`, `champagne-`, etc.) — NOT merge candidates; cluster keeps them all
- Programmatic `alcohol-and-X-2025` group (~22 slugs per #362) — most are DELETE candidates, not MERGE

MERGE bucket emits a `mergeTarget` field per row. Final merge decisions still need human review post-script.

### DELETE (all required)

```
impressions16mo ≤ 30                 // < 5 per 90d × 6 quarters = 30 conservative
AND inboundBodyLinks == 0
AND slug ∉ any cluster
AND firstCommitAge > 90 days
AND offStrategyPattern matches      // see §4
```

### REVIEW (catch-all for ambiguity)

If a slug satisfies SAVE for one rule but DELETE for the rest (e.g., position ≤ 50 but 0 inbound + off-strategy), flag as REVIEW with reasoning. **All 57 CNI slugs default to REVIEW** unless cluster-bound (Crawled-Not-Indexed is a stricter Google verdict; needs human sign-off, not script auto-decision).

**Rule precedence** (top wins): SAVE > REVIEW > MERGE > DELETE. A cluster member never lands in DELETE even if traffic-dead.

## 4. Off-Strategy Pattern Classification

From #362 audit and filesystem inspection. Pattern matchers (regex over slug):

| Pattern | Source | Examples in Repo |
|---|---|---|
| `^alcohol-and-.*-2025$` | Programmatic AI batch | `alcohol-and-autophagy-…-2025`, `alcohol-and-anxiety-…-2025` (verify NOT in cluster before flagging) |
| `^advanced-.*-2025$` | Programmatic AI batch | `advanced-liver-detox-…-2025` (BUT this IS a `liver-health` cluster pillar — cluster check overrides) |
| `^adaptogenic-` | AI batch | `adaptogenic-beverages-ancient-wisdom-…` |
| `^quantum-` | AI batch | `quantum-health-monitoring-alcohol-…-2025` |
| Lifestyle/persona | Manually curated list | `business-dinner-networking-dhm-guide-2025`, `bachelor-bachelorette-party-dhm-2025`, `executive-cognitive-performance-…`, `executive-travel-wellness-2025`, `business-travel-alcohol-executive-…`, `conference-networking-dhm-guide-2025` |
| Cultural drinking | Manually curated list (KEEP `italian-drinking-culture-guide`) | `british-pub-culture-guide`, `french-wine-culture-guide`, `german-beer-culture-guide`, `spanish-drinking-culture-guide` |

**Critical guard**: cluster membership ALWAYS overrides off-strategy match. `advanced-liver-detox-science-vs-marketing-myths-2025` matches `^advanced-.*-2025$` but IS the `liver-health` cluster pillar → SAVE, not DELETE.

**Output**: ship pattern list as a `const OFF_STRATEGY_PATTERNS` array at top of script + `const OFF_STRATEGY_EXPLICIT_KEEPS` for `italian-drinking-culture-guide` and any cluster-overridden slugs.

## 5. Script Architecture

**Location**: `scripts/dcni-bucket.mjs` (ESM, `node:fs` + `node:path` + `node:child_process` for git, no new deps — reuses `package.json` `"type": "module"`).

**Inputs**:
- `--gsc-csv <path>` (required) — e.g. `data/gsc-pages-2026-04-29.csv`
- Auto-detects: `src/newblog/data/posts/`, `scripts/cluster-config.json`, `scripts/orphan-injection-plan.json`

**Outputs**:
- `docs/dcni-<date>/buckets.json` (machine-readable; `<date>` derived from `--gsc-csv` filename or `--date` flag override)
- `docs/dcni-<date>/buckets.md` (human-readable markdown table; sections per bucket)

**Algorithm**:
1. Load cluster config → build `clusterMembers: Set<slug>` and `slug → clusterName` map
2. Load orphan plan → build `slug → orphanInboundCount` (each slug appearing as `target_orphan` gets +1 per active row; cap at active rows only)
3. Enumerate `posts/*.json` → parse each: extract `wordCount` (split content on whitespace), `dateModified`, `tags`
4. Run `git log --diff-filter=A --format=%ai -- <file>` once per post (stream stdout) → first-commit date
5. Compute inbound body links: read all post `content` fields, regex match `\(/never-hungover/(<slug>)\)` per slug, accumulate count → `bodyInboundCount` map (excludes orphan-plan injections by checking against plan rows? — no, both count; the issue's "≥3 contextual body inbound links" rule means ANY body link, including injected ones)
6. Parse GSC CSV → `slugMetrics: Map<slug, {impressions, clicks, position}>`
7. For each post slug, evaluate predicates in order: SAVE → REVIEW (CNI default) → MERGE → DELETE → fallback REVIEW
8. Emit JSON + MD

**Reuse pattern**: `scripts/orphan-post-link-injector.mjs` lines 19-45 (path setup, JSON I/O, argv parsing) — copy idiom directly.

## 6. Fixture for Testing

`data/gsc-pages-fixture.csv` — 18 representative rows:

| Slug | Impressions | Position | Expected Bucket | Reason |
|---|---|---|---|---|
| `dhm-dosage-guide-2025` | 12,000 | 5.2 | SAVE | cluster pillar + high traffic |
| `activated-charcoal-hangover` | 800 | 18 | SAVE | cluster spoke |
| `alcohol-eye-health-…-2025` | 1,200 | 22 | SAVE | cluster spoke (health-impact) |
| `liver-health-alcohol-supplements-dhm-2025` | 250 | 35 | SAVE | cluster spoke + orphan-plan target |
| `british-pub-culture-guide` | 5 | 95 | MERGE | merge into italian sibling |
| `french-wine-culture-guide` | 3 | 99 | MERGE | merge into italian sibling |
| `german-beer-culture-guide` | 0 | — | MERGE | merge into italian sibling |
| `italian-drinking-culture-guide` | 180 | 42 | SAVE | indexed; merge target for siblings |
| `business-dinner-networking-dhm-guide-2025` | 2 | 92 | DELETE | off-strategy + 0 traffic + no cluster |
| `bachelor-bachelorette-party-dhm-2025` | 0 | — | DELETE | off-strategy + missing from GSC |
| `executive-cognitive-performance-alcohol-…` | 1 | 100 | DELETE | off-strategy + 0 traffic |
| `quantum-health-monitoring-alcohol-…-2025` | 8 | 88 | DELETE | quantum- pattern + low traffic |
| `adaptogenic-beverages-ancient-wisdom-…` | 4 | 85 | DELETE | adaptogenic- pattern |
| `advanced-liver-detox-science-vs-marketing-myths-2025` | 95 | 28 | SAVE | matches off-strategy pattern BUT cluster pillar overrides |
| `alcohol-and-autophagy-…-2025` | 18 | 65 | REVIEW | low traffic, off-strategy, but in cluster (health-impact) → cluster overrides → SAVE; if NOT in cluster → DELETE |
| `nonexistent-slug-foo` | 50 | 30 | (skip) | URL in CSV but no post JSON → warn + skip |
| `https://www.dhmguide.com/guide` | 9,000 | 3.1 | (skip) | non-`/never-hungover/` URL → pass-through |
| `https://www.dhmguide.com/reviews` | 7,500 | 4.2 | (skip) | non-`/never-hungover/` URL → pass-through |

Script run against fixture must produce deterministic output: counts SAVE=5, MERGE=3, DELETE=5, REVIEW=0 (or 1 if `alcohol-and-autophagy` not in cluster — adjust based on actual cluster membership).

## 7. Output Format Spec

### `docs/dcni-<date>/buckets.json`

```json
{
  "generatedAt": "2026-04-29T18:30:00Z",
  "gscCsvPath": "data/gsc-pages-2026-04-29.csv",
  "totalPostsScanned": 202,
  "totalGscRows": 489,
  "nonBlogUrlsIgnored": 12,
  "buckets": {
    "save": [
      {
        "slug": "dhm-dosage-guide-2025",
        "reason": "cluster-pillar:dhm-master",
        "impressions": 12000,
        "position": 5.2,
        "wordCount": 4850,
        "inboundBodyLinks": 28,
        "cluster": "dhm-master"
      }
    ],
    "merge": [
      {
        "slug": "british-pub-culture-guide",
        "mergeTarget": "italian-drinking-culture-guide",
        "reason": "duplicate-template:cultural-drinking",
        "impressions": 5,
        "wordCount": 1820
      }
    ],
    "delete": [
      {
        "slug": "business-dinner-networking-dhm-guide-2025",
        "reason": "no-impressions+no-links+off-strategy:lifestyle-persona",
        "impressions": 2,
        "inboundBodyLinks": 0,
        "ageInDays": 280
      }
    ],
    "review": [
      {
        "slug": "some-borderline-slug",
        "reason": "borderline; matches off-strategy but has position<50",
        "flags": ["off-strategy:alcohol-and-pattern", "ranking-position:48"]
      }
    ]
  },
  "summary": { "save": 60, "merge": 4, "delete": 28, "review": 12, "totalBucketed": 104 }
}
```

### `docs/dcni-<date>/buckets.md`

Human-readable; sections per bucket; markdown table with `| slug | impressions | reason | wordCount |`.

## 8. CLI Flags

| Flag | Default | Purpose |
|---|---|---|
| `--gsc-csv <path>` | (required) | GSC CSV input |
| `--dry-run` | false | Print bucket counts to stdout; skip file writes |
| `--threshold-impressions <N>` | 160 | Override SAVE impression threshold |
| `--delete-threshold <N>` | 30 | Override DELETE max-impression threshold |
| `--output-dir <path>` | `docs/dcni-<dateFromCsv>/` | Override output dir |
| `--date <YYYY-MM-DD>` | parsed from CSV filename | Override date stamp |
| `--verbose` | false | Print per-slug decision trace (debug) |

## 9. Out of Scope (Hard Boundary)

- **No deletions** — script outputs DECISIONS only
- **No 410 redirects** in `vercel.json`
- **No 301 merge redirects**
- **No post JSON mutations** (no `dateModified` updates, no content changes)
- **No `postRegistry.js` edits**
- **No sitemap regeneration**
- **No GSC API fetching** — user provides CSV

A future PR consumes `docs/dcni-<date>/buckets.json` and ships actions, gated on:
1. GSC export landed
2. Action 4 moratorium expired (mid-July 2026 per #366)
3. Manual review of REVIEW bucket
4. Pilot of 10 lowest-impression DELETE candidates first

## 10. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| GSC CSV format drift between exports | M | Validate header row up front; clear error message; tolerate BOM/CRLF/quoted columns |
| Off-strategy heuristic flags real content for delete | **H** | Cluster membership always overrides off-strategy pattern; explicit `OFF_STRATEGY_EXPLICIT_KEEPS` allowlist; REVIEW bucket catches borderline cases; **manual review required before any deletion ships** |
| User runs script then immediately deploys 410s before moratorium expires | **H** (causes another DCNI wave) | Script outputs decisions ONLY; deletion is a separate manual PR step deferred to mid-July; document this gate in `buckets.md` header |
| Word count calc differs from existing scripts | L | Use `content.split(/\s+/).length` (matches `analyze-internal-links.js` convention); document in script comments |
| 57 CNI URLs default to REVIEW → noisy output | L | Acceptable; CNI is a stricter quality verdict and needs human eyes; matches #365 acceptance criteria |
| Inbound link grep counts false positives in code-block strings | L | Regex matches markdown link syntax `\((/never-hungover/<slug>)\)` only, not bare URLs; minimal false positive risk |
| Git first-commit date is slow (~200 git log invocations) | L | Acceptable for one-off script; can parallelize with `Promise.all` if it bites; or batch via single `git log --name-only` pass |

## 11. Quality Commands (this repo)

| Type | Command | Source |
|---|---|---|
| Lint | `npm run lint` | package.json `scripts.lint` |
| Build | `npm run build` | package.json `scripts.build` (validates posts, generates sitemap, builds, prerenders) |
| Validate posts | `npm run validate-posts` | package.json `scripts.validate-posts` |
| TypeCheck | Not found | (no TS config; project is plain JS/JSX) |
| Unit Tests | Not found | (no test runner configured) |
| E2E Tests | Playwright (`@playwright/test` in devDeps; `playwright.dropdown.config.js` only) | (E2E for verification work, not bucket script) |

**Local CI for this spec**: `npm run lint` + manual run of `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run` to verify deterministic output.

## 12. Verification Tooling

Web app prerendered SPA. **Not applicable to this spec** — script is a CLI tool, not a runtime feature. VE tasks for this spec verify:
- Script runs against fixture and produces expected counts
- Output JSON validates against schema
- Output MD renders correctly in GitHub preview

No dev-server / browser-automation needed.

## 13. Related Specs

| Spec | Relation | mayNeedUpdate |
|---|---|---|
| `issue-362-…` (parent) | Parent issue; #365 is Phase 3 of the recovery plan | No |
| `issue-363-dcni-bugs` | Sibling — DCNI Action 1 (technical fixes); ships before this | No |
| `issue-364-hub-promotion` | Sibling — DCNI Action 2 (hub cluster promotion); affects cluster-config.json | **Yes** — if #364 adds new clusters before this script runs, the cluster-membership check picks up new pillars/spokes automatically (good); but if #364 ships AFTER this script generates buckets.json, decisions could be stale |
| `issue-344-post-audit-cleanup` | Earlier post audit work | No |
| `issue-345-residual` | Residual cleanup | No |

**Coordination note**: When the user actually runs the bucket script (post-GSC export), they should re-run AFTER #364 ships to ensure latest cluster membership is reflected.

## 14. Recommendations for Requirements

1. Treat the script as deterministic infrastructure — no network calls, no LLM calls, fully reproducible from inputs
2. Ship a fixture (`data/gsc-pages-fixture.csv`) that exercises every code path — SAVE-by-cluster, SAVE-by-traffic, SAVE-by-links, MERGE, DELETE, REVIEW, non-blog-URL pass-through, missing-post-warning
3. Document in `buckets.md` header: "DECISIONS ONLY. No deletions. Gated on moratorium expiry mid-July 2026 and pilot of 10 lowest-impression DELETE candidates first."
4. Cluster check ALWAYS overrides off-strategy match — codify this with an explicit `if (clusterMembers.has(slug)) return 'SAVE'` short-circuit
5. Default 57 CNI slugs to REVIEW unless cluster-bound (per stricter Google quality verdict)
6. Reuse `scripts/orphan-post-link-injector.mjs` style for ESM bootstrap, JSON I/O, argv parsing
7. Output BOTH JSON (machine) and MD (human) — humans review the MD before any deletion PR

## 15. Open Questions

None blocking. Edge cases handled by REVIEW bucket. Final deletion decisions deferred to future PR + manual review per spec scope.

## Sources

- `gh issue view 365 --repo kavanaghpatrick/dhm-guide-website` (acceptance criteria)
- `gh issue view 362 --repo kavanaghpatrick/dhm-guide-website` (parent recovery plan + 10-agent audit findings)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/cluster-config.json` (8 clusters, 60 slugs)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/orphan-injection-plan.json` (30 rows)
- `/Users/patrickkavanagh/dhm-guide-website/scripts/orphan-post-link-injector.mjs` (ESM script idiom to reuse)
- `/Users/patrickkavanagh/dhm-guide-website/package.json` (Node ESM `"type": "module"`, no test runner, no TS)
- `/Users/patrickkavanagh/dhm-guide-website/specs/issue-364-hub-promotion/research.md` (sibling spec format)
- `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts/*.json` (202 files; sampled `activated-charcoal-hangover.json` for shape)
- Filesystem scan: cultural-drinking siblings, lifestyle/persona slugs, programmatic AI patterns
- Google Search Console UI documentation (Performance → Pages export format)
