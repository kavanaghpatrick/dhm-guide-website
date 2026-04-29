---
spec: issue-246-hub-footer
phase: requirements
created: 2026-04-28
---

# Requirements: issue-246-hub-footer

## Goal

Build an idempotent ESM script (`scripts/add-hub-links.mjs`) that appends a verbatim 4-link "Continue Your Research" footer to the `content` field of every blog post JSON in `src/newblog/data/posts/` (197 files). Idempotency relies on TWO sufficient checks: heading-substring match (`"Continue Your Research"`) OR sentinel HTML comment (`<!-- hub-footer:auto -->`). Footer reaches crawlers via the existing prerender pipeline (Pattern #11 verified — micromark renders `content` into `dist/never-hungover/<slug>/index.html`). Zero new npm dependencies. Default mode = dry-run; `--apply` writes.

## User Stories

### US-1: Search-engine crawler signal
**As a** search-engine crawler
**I want to** see consistent links from every blog post to the 4 hub pages (`/guide`, `/compare`, `/reviews`, `/research`)
**So that** topic-cluster signal strengthens and PageRank flows toward hub URLs

**Acceptance Criteria:**
- [ ] AC-1.1: Each of the 197 post JSONs has exactly one footer block in `content`
- [ ] AC-1.2: Each footer renders 4 anchor tags pointing to `/guide`, `/compare`, `/reviews`, `/research` in prerendered HTML

### US-2: Reader next-action paths
**As a** returning reader who reaches the end of an article
**I want to** see clear next-action paths to authoritative hubs
**So that** I can deepen my research without backtracking to nav

**Acceptance Criteria:**
- [ ] AC-2.1: Footer appears at the end of post content (after `.trimEnd()` on existing content)
- [ ] AC-2.2: Footer uses descriptive anchor text ("Complete DHM Guide", "Compare Supplements", "Product Reviews", "Clinical Research") with brief value-prop suffix

### US-3: Safely re-runnable script
**As a** future contributor
**I want to** re-run the script after partial corpus updates without double-injecting
**So that** the corpus can be incrementally maintained as new posts are added

**Acceptance Criteria:**
- [ ] AC-3.1: Re-running `--apply` immediately after a successful run reports `updated: 0, skipped: 197`
- [ ] AC-3.2: Idempotency check passes on heading match OR sentinel-comment match (either is sufficient)

### US-4: Zero new dependencies
**As a** maintainer
**I want to** add no new npm packages
**So that** supply-chain surface and bundle size stay constant

**Acceptance Criteria:**
- [ ] AC-4.1: `package.json` `dependencies` and `devDependencies` unchanged before vs after this work
- [ ] AC-4.2: Script uses only Node built-ins (`fs`, `path`, `url`)

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AC-1 | Script `scripts/add-hub-links.mjs` exists, ESM, no new deps | High | File exists; `package.json` deps unchanged |
| AC-2 | Script supports `--dry-run` flag; prints diff for first 3 changed files + total counts; writes nothing | High | Run `node scripts/add-hub-links.mjs --dry-run` → stdout shows 3 sample diffs + `would update N` totals; no file mtimes change |
| AC-3 | Script is idempotent (re-run reports 0 updated, all skipped) — match by heading "Continue Your Research" OR sentinel `<!-- hub-footer:auto -->` | High | Re-run after live: `updated: 0, skipped: 197` |
| AC-4 | After live run, all 197 post JSONs have footer text in their `content` field | High | `grep -lc "Continue Your Research" src/newblog/data/posts/*.json \| wc -l` = 197 |
| AC-5 | After live run + `npm run build`, prerendered HTML at `dist/never-hungover/<slug>/index.html` contains literal "Continue Your Research" for ≥5 sampled posts | High | Manually grep 5 sample dist HTMLs |
| AC-6 | After live run + build, prerendered HTML contains links to `/guide`, `/compare`, `/reviews`, `/research` in the footer location for the 5 sampled posts | High | Each sample HTML contains all 4 `href="/<hub>"` strings near the "Continue Your Research" heading |
| AC-7 | All 4 hub-page routes return 200 / are valid SPA routes | High | Verify routes at design phase; spot-check at execution |
| AC-8 | `npm run build` exits 0 post-script (no JSON parse errors; `validate-posts.js` passes) | High | `npm run build` exit code = 0 |
| AC-9 | Each modified post JSON has exactly 1 modification (the appended footer); no other fields touched | High | `git diff` per file shows changes ONLY to `content` field, only at end-of-string |
| AC-10 | The 16 posts with scattered inline hub links (per research.md) ALSO get the footer | High | Footer appended to all 197 regardless of inline link presence; inline links preserved |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | No new npm dependencies | `package.json` deps + devDeps diff | Zero net additions |
| NFR-2 | JSON indent matching existing files | Indent style | 2-space (`JSON.stringify(obj, null, 2)`) |
| NFR-3 | No trailing file newline | Last byte of each modified `.json` | Last byte = `}`, not `\n` |
| NFR-4 | Real `\n` line endings inside `content` string | Newlines | JSON-escaped real `\n`, not literal `\\n` |
| NFR-5 | Backward-compatible prerender chain | Prerender script unchanged | `scripts/prerender-blog-posts-enhanced.js` not modified |
| NFR-6 | Build remains green | `npm run build` exit code | 0 |

## Footer Template (Verbatim, per Issue #246)

Appended to `post.content.trimEnd()`:

```
\n\n<!-- hub-footer:auto -->\n\n---\n\n## Continue Your Research\n\n- **[Complete DHM Guide →](/guide)** - Dosage, timing, and how DHM works\n- **[Compare Supplements →](/compare)** - Side-by-side product comparison\n- **[Product Reviews →](/reviews)** - In-depth reviews of 7 tested supplements\n- **[Clinical Research →](/research)** - 11 peer-reviewed DHM studies\n
```

Anchor text and arrows (`→`) match issue #246 body verbatim. No emoji.

## Glossary

- **Hub page**: One of `/guide`, `/compare`, `/reviews`, `/research` — the 4 authoritative top-level pages this footer links to
- **Sentinel comment**: `<!-- hub-footer:auto -->` — HTML comment marker placed above the footer's `---` separator; identifies script-managed sections (mirrors `cluster-pillar-link:auto`, `cluster-index:auto` patterns)
- **Idempotent**: Re-running script produces zero new changes (no double-injection)
- **Prerender pipeline**: `scripts/prerender-blog-posts-enhanced.js` reads `post.content`, runs micromark with GFM extensions, writes HTML to `dist/never-hungover/<slug>/index.html` during `npm run build`
- **Pattern #11**: Documented learning that prerendered HTML is a separate SEO source from client-side JS — this work uses only the `content` field which IS prerendered, so footer ships to crawlers automatically

## Scope

### In Scope
- 197 blog post JSONs in `src/newblog/data/posts/`
- New script: `scripts/add-hub-links.mjs`
- Modifications to `content` field only

### Out of Scope (Explicit)
- Main pages (handled by mega-menu nav and breadcrumbs already)
- `metadata/index.json`
- Any field other than `content` (no `seo`, `faq`, `quickAnswer`, `metaDescription`, `relatedPosts`)
- Comparison-post inline link audit
- Hub-page content edits (`/guide`, `/compare`, `/reviews`, `/research` themselves)
- `relatedPosts` field
- Prerender script modifications
- React component changes
- A/B testing of anchor text variations
- Personalization per cluster

## Edge Cases

| Case | Behavior |
|------|----------|
| Post has empty/missing `content` field | Skip with warning (`skipped: empty-content`); no write |
| Post `content` already ends with the exact sentinel `<!-- hub-footer:auto -->` | Skip (`skipped: sentinel-match`) |
| Post `content` contains "Continue Your Research" anywhere (even as different heading or in body text) | Skip (`skipped: heading-match`) — conservative; better to skip 1-2 false positives than double-inject |
| Re-run after partial completion | All already-updated → skipped; only fresh posts updated |
| Future post added | Run script once; footer appears |

## Risks

| Risk | Mitigation |
|------|------------|
| JSON corruption from concat-write | Use `JSON.parse` → mutate object → `JSON.stringify(obj, null, 2)`. Never concatenate JSON text. `validate-posts.js` prebuild check catches any breakage. |
| Footer doesn't reach prerendered HTML | Pattern #11 path verified in research.md — `prerender-blog-posts-enhanced.js:311` micromarks `content` field directly. AC-5 + AC-6 verify post-build. |
| Script bug writes broken JSON to all 197 posts simultaneously | (a) Default = dry-run; review 3 sample diffs before `--apply`. (b) Working tree on `cleanup/issue-246-hub-footer` branch — `git checkout` reverts on failure. (c) `validate-posts.js` runs at start of `npm run build` and fails the build if any JSON is malformed. |

## Constraints

- No new npm packages
- No edits to the 4 hub pages
- No edits to `scripts/prerender-blog-posts-enhanced.js`
- Footer template MUST match issue #246 body verbatim (anchor text, arrows, no emoji)

## Success Criteria

- 197 post JSONs contain footer in `content`
- 5 sampled `dist/never-hungover/<slug>/index.html` files contain literal "Continue Your Research" + 4 hub anchor hrefs
- `npm run build` exits 0
- Re-running script reports `updated: 0, skipped: 197`
- `package.json` deps unchanged
- All 197 modified files have NO trailing newline (matches existing convention)

## Unresolved Questions

None. All design decisions resolved in research.md based on codebase evidence and issue audit.

## Next Steps

1. Generate technical design (`design.md`) — script structure, CLI flag handling, JSON read/write helpers, idempotency check ordering, audit-log shape
2. Decompose into implementation tasks (`tasks.md`) — script skeleton, dry-run output, write logic, sample-grep verification, build pass
3. Execute via implementation loop — write script → dry-run → review 3 sample diffs → apply → re-run for idempotency proof → `npm run build` → grep 5 dist HTMLs
