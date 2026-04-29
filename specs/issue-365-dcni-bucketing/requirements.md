---
spec: issue-365-dcni-bucketing
phase: requirements
created: 2026-04-29
mode: quick
issue: 365
parent_issue: 362
---

# Requirements: issue-365-dcni-bucketing

## Goal

Ship `scripts/dcni-bucket.mjs` — an ESM script that consumes a GSC CSV export + repo state (post JSONs, cluster config, orphan plan) and outputs a deterministic Save / Merge / Delete / Review bucketing decision per URL. Tooling for a future deletion PR; this spec ships **zero behavior changes** (no deletions, no JSON mutations, no redirects, no sitemap edits).

## User Stories

### US-1: Maintainer ships deletions confidently
**As a** maintainer
**I want to** generate a deterministic decision-table-per-URL keyed off real 16-month GSC traffic + cluster membership + inbound link counts
**So that** a future deletion PR can ship 410s/301s with traceable reasoning, not gut feel

**Acceptance Criteria:**
- [ ] AC-1.1, AC-2.x, AC-3.x, AC-4.x apply

### US-2: Validate before real-data run
**As a** maintainer
**I want to** dry-run the script against a 18-row fixture CSV
**So that** I can verify decision-rule correctness BEFORE the real GSC export lands

**Acceptance Criteria:**
- [ ] AC-5.x apply

### US-3: Re-run with refreshed data
**As a** future contributor (post mid-July moratorium)
**I want to** re-run the script with a freshly exported GSC CSV
**So that** the bucket can be refreshed against current traffic and cluster state

**Acceptance Criteria:**
- [ ] AC-1.4 (configurable output dir), AC-2.x, AC-6.3 (no side effects)

### US-4: Future contributor reads decisions safely
**As a** future contributor
**I want to** read `buckets.md` (human-readable) before any deletion ships
**So that** REVIEW bucket items get human eyes and cluster-overrides are visible

**Acceptance Criteria:**
- [ ] AC-4.2, AC-3.5, AC-3.6, AC-3.7

## Acceptance Criteria

### AC-1: Script exists + runs
| ID | Criterion |
|---|---|
| AC-1.1 | `scripts/dcni-bucket.mjs` exists; ESM (`.mjs`); zero new npm deps; uses stdlib only |
| AC-1.2 | Supports `--gsc-csv <path>` flag (REQUIRED) |
| AC-1.3 | Supports `--dry-run` flag (prints summary; no files written) |
| AC-1.4 | Supports `--output-dir <path>` flag (default `docs/dcni-2026-04-29/`) |
| AC-1.5 | Supports `--threshold-impressions <N>` flag (default 160 per research §3) |

### AC-2: Data joining
| ID | Criterion |
|---|---|
| AC-2.1 | Reads all 202 post JSONs from `src/newblog/data/posts/` (enumerated, not hardcoded) |
| AC-2.2 | Reads `scripts/cluster-config.json` and computes cluster membership (8 clusters, 60 slugs) |
| AC-2.3 | Computes inbound contextual body link count via grep across all post `content` fields (regex `\\(/never-hungover/<slug>\\)`) |
| AC-2.4 | Joins GSC CSV data on slug extracted from URL column (strip `https://www.dhmguide.com/never-hungover/`) |
| AC-2.5 | Handles GSC URLs not matching `/never-hungover/`: skip with `non-blog-url` note in summary |
| AC-2.6 | Tolerates missing GSC rows for posts with 0 impressions (assigns `impressions: 0`) |

### AC-3: Decision rules
| ID | Criterion |
|---|---|
| AC-3.1 | SAVE if ANY: cluster member OR ≥160 16mo impressions OR ≥3 inbound body links OR position ≤50 |
| AC-3.2 | MERGE if ≥4 near-duplicate template siblings detected (cultural-drinking pattern from research §3) |
| AC-3.3 | DELETE if ALL: ≤30 16mo impressions AND 0 inbound links AND no cluster AND >90 days old AND matches off-strategy pattern |
| AC-3.4 | REVIEW for any URL that doesn't cleanly fit SAVE/MERGE/DELETE |
| AC-3.5 | ALL 57 CNI URLs default to REVIEW (not auto-delete) per research learning #53 |
| AC-3.6 | Cluster membership ALWAYS overrides off-strategy pattern (cluster check fires FIRST as short-circuit) |
| AC-3.7 | `italian-drinking-culture-guide` is explicit allowlist (never enters DELETE bucket) |

### AC-4: Output format
| ID | Criterion |
|---|---|
| AC-4.1 | Writes `<output-dir>/buckets.json` with shape `{generatedAt, totalUrls, buckets, summary}` per research §7 |
| AC-4.2 | Writes `<output-dir>/buckets.md` (human-readable; one section per bucket; markdown table) |
| AC-4.3 | Each entry includes: slug, bucket, reason, impressions (raw 16mo), wordCount, inboundLinks, clusterMembership, ageInDays |
| AC-4.4 | Summary shows count per bucket: save / merge / delete / review |

### AC-5: Fixture testing
| ID | Criterion |
|---|---|
| AC-5.1 | `data/gsc-pages-fixture.csv` exists with ~18 representative rows |
| AC-5.2 | Fixture includes ≥2 SAVE, ≥2 DELETE, ≥2 REVIEW, ≥2 edge cases (cluster-override, allowlist, non-blog URL, missing post) |
| AC-5.3 | `node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run` produces deterministic output (same input → byte-identical output) |
| AC-5.4 | Fixture-driven decisions match expected per research §6 table |

### AC-6: Build + integration
| ID | Criterion |
|---|---|
| AC-6.1 | `npm run build` exits 0 (script not in build chain; verify nothing else broke) |
| AC-6.2 | Script does NOT modify any post JSONs, sitemap.xml, or vercel.json |
| AC-6.3 | `git status` after fixture run shows only NEW `docs/dcni-2026-04-29/buckets.{json,md}` files |

## Functional Requirements

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-1 | ESM CLI at `scripts/dcni-bucket.mjs` | High | AC-1.1 |
| FR-2 | CLI flags per spec | High | AC-1.2 through AC-1.5 |
| FR-3 | Multi-source data join (posts + cluster + orphan + GSC + git) | High | AC-2.1 through AC-2.6 |
| FR-4 | Deterministic bucketing rules | High | AC-3.1 through AC-3.7 |
| FR-5 | Dual output (JSON + MD) | High | AC-4.1, AC-4.2 |
| FR-6 | Fixture for offline testing | High | AC-5.1 through AC-5.4 |
| FR-7 | Zero side effects on repo | High | AC-6.2, AC-6.3 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|---|---|---|---|
| NFR-1 | Module format | ESM | `.mjs` extension; matches repo convention |
| NFR-2 | Dependencies | New npm deps | 0 (stdlib only: `node:fs`, `node:path`, `node:child_process`) |
| NFR-3 | Execution speed | Wall-clock for 202 posts + fixture | <5s |
| NFR-4 | Determinism | Same input → same output | Byte-identical JSON + MD |
| NFR-5 | JSON format | Indent | 2-space (matches repo style) |
| NFR-6 | CSV tolerance | Robustness | Handle UTF-8 BOM, CRLF, quoted columns (use proper CSV parsing, not naive `split(',')`) |
| NFR-7 | Header validation | Schema drift detection | Validate header row up front; clear error message |

## Glossary

- **DCNI**: Discovered–Currently Not Indexed (Google Search Console verdict)
- **CNI**: Crawled–Currently Not Indexed (stricter Google verdict; defaults to REVIEW)
- **Cluster**: Pillar + spokes group from `scripts/cluster-config.json`; cluster members never DELETE
- **Off-strategy**: Programmatic AI-batch slug pattern (`^alcohol-and-.*-2025$`, `^advanced-.*-2025$`, `^adaptogenic-`, `^quantum-`, lifestyle/persona, cultural-drinking — except Italian)
- **Bucket**: One of `save`, `merge`, `delete`, `review` (mutually exclusive per slug)
- **Moratorium**: Action 4 freeze on post mutations until mid-July 2026 (#366)

## Out of Scope

- Actual deletions (no 410 redirects)
- 301 merge redirects
- Post JSON modifications (no `dateModified` updates, no content changes)
- Sitemap regeneration
- `vercel.json` changes
- `postRegistry.js` edits
- GSC API calls (user provides CSV)
- Scheduled re-runs (manual invocation only)
- Cluster config edits (handled by sibling spec #364)
- Integration with build chain (script is standalone CLI)
- Test runner / unit-test framework setup (no jest/vitest in repo; verification = fixture run + diff)

## Dependencies

- `src/newblog/data/posts/*.json` (202 files; enumerated at runtime)
- `scripts/cluster-config.json` (existing; 8 clusters, 60 slugs)
- `scripts/orphan-injection-plan.json` (existing; 30 rows)
- `scripts/orphan-post-link-injector.mjs` (existing; ESM idiom to mirror)
- Node ≥18 (matches `package.json` `"type": "module"`)
- Eventual real GSC CSV export (provided by maintainer at run-time; not committed)

## Edge Cases

| Case | Handling |
|---|---|
| GSC CSV not yet provided | Script errors with clear message + path to fixture (`data/gsc-pages-fixture.csv`) |
| Slug appears in GSC CSV but post JSON deleted | Flag as `MISSING` bucket (not error; future deletion may have already run) |
| Slug in posts but absent from GSC CSV | Assume `impressions: 0` (legitimate; URL never had traffic) |
| Non-`/never-hungover/` URLs in GSC CSV (e.g., `/`, `/guide`, `/reviews`) | Skip with note in summary `nonBlogUrlsIgnored: N` |
| Cluster pillar matches off-strategy regex (`advanced-liver-detox-…-2025`) | Cluster check short-circuits FIRST → SAVE (research §3 critical guard) |
| `italian-drinking-culture-guide` in DCNI list | Explicit allowlist → SAVE (acts as merge target for siblings) |
| GSC CSV with UTF-8 BOM | Strip BOM; continue parsing |
| GSC CSV with quoted columns / commas in URLs | Use proper CSV parsing |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Off-strategy regex over-flags real content | **M** | Cluster-override + Italian allowlist + REVIEW catch-all + manual review before any deletion ships |
| User runs script and ships 410s during moratorium → another DCNI wave | **M** | README in `docs/dcni-2026-04-29/` explicitly states deployment gated on moratorium expiry mid-July 2026 |
| GSC CSV format changes between exports | **L** | Validate header row; tolerate BOM/CRLF/quoted cols; clear error on drift |
| Word count differs from existing scripts | **L** | Use `content.split(/\\s+/).length` (matches `analyze-internal-links.js` convention) |
| 57 CNI URLs default to REVIEW → noisy output | **L** | Acceptable; CNI is stricter Google verdict; matches #365 acceptance criteria |
| Inbound link grep counts false positives | **L** | Regex matches markdown link `\\(/never-hungover/<slug>\\)` only, not bare URLs |

## Success Criteria

- Script runs against fixture in <5s with deterministic output
- All 202 posts resolved into exactly one bucket (or `MISSING` flag)
- Summary counts: save + merge + delete + review = total bucketed posts
- `git status` after fixture run shows only the two new output files
- `npm run build` still exits 0
- `buckets.md` header explicitly states deployment-gating reminder

## Unresolved Questions

None blocking. Borderline cases route to REVIEW bucket by design.

## Next Steps

1. Generate `design.md` (architecture, data shapes, algorithm pseudocode, file boundaries)
2. Generate `tasks.md` (atomic implementation steps + VE tasks)
3. Execute tasks; verify against fixture
4. Open PR `cleanup/issue-365-dcni-bucketing` with script + fixture + spec artifacts only
