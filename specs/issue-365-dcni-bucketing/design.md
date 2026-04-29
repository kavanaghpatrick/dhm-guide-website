---
spec: issue-365-dcni-bucketing
phase: design
created: 2026-04-29
mode: quick
issue: 365
parent_issue: 362
---

# Design: issue-365-dcni-bucketing

## Overview

Single ESM script `scripts/dcni-bucket.mjs` (~250 LOC, stdlib only) that joins a GSC CSV against repo state (post JSONs, cluster config, orphan plan, git first-commit dates, computed inbound body links) and emits a deterministic Save / Merge / Delete / Review decision per slug at `docs/dcni-2026-04-29/buckets.{json,md}` plus a `README.md` deployment-gating warning. Zero behavior changes — pure tooling. Total file impact: 7 files (1 script + 1 fixture + 3 sample outputs + 4 spec artifacts already exist).

## Architecture

```mermaid
graph TB
    subgraph Inputs["Inputs (read-only)"]
        GSC[GSC CSV<br/>data/gsc-pages-*.csv]
        POSTS[Post JSONs<br/>src/newblog/data/posts/*.json]
        CLUSTER[cluster-config.json]
        ORPHAN[orphan-injection-plan.json]
        GIT[git log first-commit dates]
    end

    subgraph Script["scripts/dcni-bucket.mjs"]
        PARSE[parseCsv<br/>strict header validation]
        LOAD[loadPosts<br/>enumerate + parse]
        INDEX[buildInboundIndex<br/>O(N) regex pass]
        DECIDE[decide(slug)<br/>9-step decision tree]
        EMIT[writeOutputs<br/>JSON + MD + README]
    end

    subgraph Outputs["Outputs (new files only)"]
        BJ[buckets.json]
        BM[buckets.md]
        RM[README.md]
    end

    GSC --> PARSE
    POSTS --> LOAD
    POSTS --> INDEX
    CLUSTER --> DECIDE
    ORPHAN --> DECIDE
    GIT --> DECIDE
    PARSE --> DECIDE
    LOAD --> DECIDE
    INDEX --> DECIDE
    DECIDE --> EMIT
    EMIT --> BJ
    EMIT --> BM
    EMIT --> RM
```

## Decisions Resolved

| ID | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | CSV parsing | Stdlib only — line-split + quote-aware tokenizer (~25 LOC) | GSC URL column never contains commas in practice; header validation catches drift; zero deps per NFR-2 |
| D2 | Off-strategy regex | Single `OFF_STRATEGY_PATTERNS` array, evaluated AFTER cluster + allowlist short-circuits | Order is mandatory per AC-3.6; encoding as array keeps additions trivial |
| D3 | Output paths | `docs/dcni-2026-04-29/{buckets.json, buckets.md, README.md}`; `--output-dir` overrides default | Date-stamped dir per research §5; README warns about moratorium gate per AC-4.2 spirit |
| D4 | MERGE detection | Hardcoded `KNOWN_MERGE_GROUPS` array (cultural-drinking only in v1) | Only confirmed group from #362 audit; future groups added with explicit human signoff per research risk register |
| D5 | Inbound link compute | Single-pass O(N) regex extraction across all post `content` fields, accumulating per-target counts | 202 posts × ~5KB avg content = ~1MB total work, <1s; far simpler than per-post grep |

## Module Shape

```js
#!/usr/bin/env node
/**
 * DCNI Bucketing — issue #365
 * Reads GSC CSV + repo state, emits Save/Merge/Delete/Review decisions per slug.
 * NO MUTATIONS to post JSONs, sitemap, or vercel.json. Pure tooling.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/newblog/data/posts');
const CLUSTER_PATH = path.join(ROOT, 'scripts/cluster-config.json');
const ORPHAN_PATH = path.join(ROOT, 'scripts/orphan-injection-plan.json');

// --- Constants (decision policy) ---

const URL_PREFIX = 'https://www.dhmguide.com/never-hungover/';

const OFF_STRATEGY_PATTERNS = [
  /^alcohol-and-/,
  /^advanced-.*-2025$/,
  /^adaptogenic-/,
  /^quantum-/,
  /^bachelor-bachelorette/,
  /^business-dinner-networking/,
  /^executive-/,
  /^college-student/,
  /^greek-life/,
  /^music-festival/,
  /^social-media-influencer-party/,
  /^pre-game-party/,
  /^bachelor-/,
  /^corporate-/,
  /^consultant-/,
  /^study-abroad/,
  /^spring-break/,
  /^british-pub-culture/,
  /^french-wine-culture/,
  /^german-beer-culture/,
  /^spanish-drinking-culture/,
];

const EXPLICIT_KEEPS = new Set([
  'italian-drinking-culture-guide', // AC-3.7 allowlist
]);

const KNOWN_MERGE_GROUPS = [
  {
    pattern: /^(british|french|german|spanish)-(pub-culture|wine-culture|beer-culture|drinking-culture)-guide$/,
    mergeTarget: 'italian-drinking-culture-guide',
    reason: 'duplicate-template:cultural-drinking',
  },
];

// --- CLI ---

function parseArgs(argv) {
  const args = { gscCsv: null, dryRun: false, outputDir: null, threshold: 160, deleteThreshold: 30, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--gsc-csv') args.gscCsv = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--output-dir') args.outputDir = argv[++i];
    else if (a === '--threshold-impressions') args.threshold = parseInt(argv[++i], 10);
    else if (a === '--delete-threshold') args.deleteThreshold = parseInt(argv[++i], 10);
    else if (a === '--verbose') args.verbose = true;
  }
  if (!args.gscCsv) { console.error('ERROR: --gsc-csv <path> required'); process.exit(1); }
  return args;
}

// --- CSV (D1) ---

function parseCsv(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip BOM
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  const header = tokenizeRow(lines[0]).map(s => s.trim());
  const expected = ['URL', 'Impressions', 'Clicks', 'CTR', 'Position'];
  for (const col of expected) {
    if (!header.includes(col) && !header.includes(col === 'URL' ? 'Top pages' : col)) {
      throw new Error(`GSC CSV header drift: missing "${col}". Got: ${header.join(', ')}`);
    }
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const t = tokenizeRow(lines[i]);
    rows.push({
      url: t[0],
      impressions: parseInt(t[1], 10) || 0,
      clicks: parseInt(t[2], 10) || 0,
      ctr: t[3],
      position: parseFloat(t[4]) || null,
    });
  }
  return rows;
}

function tokenizeRow(line) {
  // Quote-aware splitter; tolerates quoted commas
  const out = []; let cur = ''; let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; continue; }
    if (c === ',' && !inQuote) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

// --- Data load ---

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  const posts = new Map();
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    const post = readJSON(path.join(POSTS_DIR, f));
    const content = post.content || '';
    posts.set(slug, {
      slug,
      title: post.title || '',
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      dateModified: post.dateModified || post.date || null,
      tags: post.tags || [],
    });
  }
  return posts;
}

function loadClusterMembers() {
  const cfg = readJSON(CLUSTER_PATH);
  const members = new Map(); // slug -> { cluster, role }
  for (const cluster of cfg.clusters || []) {
    members.set(cluster.pillar, { cluster: cluster.name, role: 'pillar' });
    for (const spoke of cluster.spokes || []) {
      members.set(spoke, { cluster: cluster.name, role: 'spoke' });
    }
  }
  return members;
}

// --- Inbound link index (D5) ---

function buildInboundIndex(posts) {
  const counts = new Map(); // target slug -> count
  const re = /\(\/never-hungover\/([a-z0-9-]+)\)/g;
  for (const post of posts.values()) {
    let m;
    while ((m = re.exec(post.content)) !== null) {
      const target = m[1];
      if (target === post.slug) continue; // exclude self-references
      counts.set(target, (counts.get(target) || 0) + 1);
    }
  }
  return counts;
}

// --- First-commit dates (batch) ---

function loadFirstCommitDates(slugs) {
  const dates = new Map();
  for (const slug of slugs) {
    try {
      const out = execSync(
        `git log --diff-filter=A --format=%ai --reverse -- "src/newblog/data/posts/${slug}.json" | head -1`,
        { cwd: ROOT, encoding: 'utf8' }
      ).trim();
      if (out) dates.set(slug, new Date(out));
    } catch { /* file may be untracked */ }
  }
  return dates;
}

function ageInDays(date) {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

// --- Decision tree (see Decision Tree section) ---

function decide(ctx) {
  const { slug, post, gsc, cluster, inboundLinks, age, threshold, deleteThreshold } = ctx;

  // 1. Cluster member → SAVE
  if (cluster) {
    return { bucket: 'save', reason: `cluster-${cluster.role}:${cluster.cluster}` };
  }
  // 2. Italian allowlist → SAVE
  if (EXPLICIT_KEEPS.has(slug)) {
    return { bucket: 'save', reason: 'allowlist:cultural-drinking-canonical' };
  }
  // 3. Known MERGE group sibling → MERGE
  for (const grp of KNOWN_MERGE_GROUPS) {
    if (grp.pattern.test(slug) && slug !== grp.mergeTarget) {
      return { bucket: 'merge', reason: grp.reason, mergeTarget: grp.mergeTarget };
    }
  }
  // 4. High traffic → SAVE
  if (gsc && gsc.impressions >= threshold) {
    return { bucket: 'save', reason: `high-traffic:${gsc.impressions}-impressions` };
  }
  // 5. Well-linked → SAVE
  if (inboundLinks >= 3) {
    return { bucket: 'save', reason: `well-linked:${inboundLinks}-inbound-body-links` };
  }
  // 6. Currently ranking → SAVE (if Position data exists)
  if (gsc && gsc.position !== null && gsc.position <= 50 && gsc.impressions > 0) {
    return { bucket: 'save', reason: `ranking-position:${gsc.position}` };
  }
  // 7. Off-strategy + dead + old → DELETE
  const impressions = gsc ? gsc.impressions : 0;
  const offStrategy = OFF_STRATEGY_PATTERNS.find(p => p.test(slug));
  if (offStrategy && impressions <= deleteThreshold && inboundLinks === 0 && age !== null && age > 90) {
    return { bucket: 'delete', reason: `off-strategy:${offStrategy.source}+no-traffic+no-links+age-${age}d` };
  }
  // 8. Off-strategy but ambiguous → REVIEW
  if (offStrategy) {
    return { bucket: 'review', reason: `borderline-off-strategy:${offStrategy.source}`, flags: [`pattern:${offStrategy.source}`, `impressions:${impressions}`, `age:${age}d`] };
  }
  // 9. Otherwise → REVIEW (catch-all, includes CNI default per AC-3.5)
  return { bucket: 'review', reason: 'borderline:no-clear-signal', flags: [`impressions:${impressions}`, `inbound:${inboundLinks}`] };
}

// --- Output (writeOutputs assembles JSON + MD + README) ---

function main() {
  const args = parseArgs(process.argv.slice(2));
  const posts = loadPosts();
  const clusterMembers = loadClusterMembers();
  const inbound = buildInboundIndex(posts);
  const firstCommits = loadFirstCommitDates([...posts.keys()]);
  const gscRows = parseCsv(args.gscCsv);

  // Build slug -> gsc lookup; classify non-blog URLs
  const gscBySlug = new Map();
  let nonBlogIgnored = 0;
  for (const row of gscRows) {
    if (!row.url || !row.url.startsWith(URL_PREFIX)) { nonBlogIgnored++; continue; }
    const slug = row.url.slice(URL_PREFIX.length).replace(/\/$/, '');
    gscBySlug.set(slug, row);
  }

  // Decide for each post
  const buckets = { save: [], merge: [], delete: [], review: [], missing: [] };
  for (const [slug, post] of posts.entries()) {
    const decision = decide({
      slug, post,
      gsc: gscBySlug.get(slug) || null,
      cluster: clusterMembers.get(slug) || null,
      inboundLinks: inbound.get(slug) || 0,
      age: ageInDays(firstCommits.get(slug)),
      threshold: args.threshold,
      deleteThreshold: args.deleteThreshold,
    });
    buckets[decision.bucket].push({
      slug,
      ...decision,
      impressions: gscBySlug.get(slug)?.impressions || 0,
      position: gscBySlug.get(slug)?.position ?? null,
      wordCount: post.wordCount,
      inboundBodyLinks: inbound.get(slug) || 0,
      cluster: clusterMembers.get(slug)?.cluster || null,
      ageInDays: ageInDays(firstCommits.get(slug)),
    });
  }

  // GSC slugs with no post JSON → MISSING
  for (const [slug, row] of gscBySlug.entries()) {
    if (!posts.has(slug)) {
      buckets.missing.push({ slug, impressions: row.impressions, note: 'GSC has URL but post JSON not found' });
    }
  }

  const summary = {
    save: buckets.save.length,
    merge: buckets.merge.length,
    delete: buckets.delete.length,
    review: buckets.review.length,
    missing: buckets.missing.length,
    totalBucketed: buckets.save.length + buckets.merge.length + buckets.delete.length + buckets.review.length,
  };

  const output = {
    generatedAt: new Date().toISOString(),
    gscCsvPath: args.gscCsv,
    totalPostsScanned: posts.size,
    totalGscRows: gscRows.length,
    nonBlogUrlsIgnored: nonBlogIgnored,
    buckets,
    summary,
  };

  if (args.dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const outDir = args.outputDir || path.join(ROOT, 'docs/dcni-2026-04-29');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'buckets.json'), JSON.stringify(output, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'buckets.md'), renderMarkdown(output));
  fs.writeFileSync(path.join(outDir, 'README.md'), renderReadme());
  console.log(`Wrote ${outDir}/buckets.{json,md} + README.md`);
  console.log(JSON.stringify(summary, null, 2));
}

main();
```

(Helpers `renderMarkdown` and `renderReadme` follow same pattern — ~30 LOC each emitting deterministic strings.)

## Decision Tree

Evaluated in strict order; FIRST match wins (short-circuits remaining checks):

```
For each post slug:
  1. Cluster member?              → SAVE  (reason: cluster-pillar:{name} | cluster-spoke:{name})
  2. Italian allowlist?           → SAVE  (reason: allowlist:cultural-drinking-canonical)
  3. Known MERGE group sibling?   → MERGE (mergeTarget: italian-drinking-culture-guide)
  4. ≥160 16mo impressions?       → SAVE  (reason: high-traffic:{N}-impressions)
  5. ≥3 inbound body links?       → SAVE  (reason: well-linked:{N}-inbound-body-links)
  6. Position ≤50 (any query)?    → SAVE  (reason: ranking-position:{P})
  7. Off-strategy + ≤30 imp + 0 inbound + >90d? → DELETE (reason: off-strategy:{regex}+no-traffic+no-links+age-{D}d)
  8. Off-strategy but ambiguous?  → REVIEW (flags: pattern, impressions, age)
  9. Otherwise (default)          → REVIEW (flags: impressions, inbound)
```

CNI URLs without cluster membership default to step 9 → REVIEW per AC-3.5.

## File Structure

| File | Action | Purpose |
|---|---|---|
| `scripts/dcni-bucket.mjs` | Create | ESM bucketing script (~250 LOC) |
| `data/gsc-pages-fixture.csv` | Create | 18-row test fixture |
| `docs/dcni-2026-04-29/buckets.json` | Create | Sample machine-readable output (committed for reviewer visibility) |
| `docs/dcni-2026-04-29/buckets.md` | Create | Sample human-readable output |
| `docs/dcni-2026-04-29/README.md` | Create | Deployment-gating warning (moratorium expiry mid-July 2026) |
| `specs/issue-365-dcni-bucketing/{research,requirements,design,tasks}.md` | Create | Spec artifacts |
| Total | 7 source files + 4 spec files | Net additions only; zero modifications |

## Fixture CSV Shape

`data/gsc-pages-fixture.csv` — 18 rows exercising every code path:

```csv
URL,Impressions,Clicks,CTR,Position
https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025,12000,89,0.74%,5.2
https://www.dhmguide.com/never-hungover/activated-charcoal-hangover,800,42,5.25%,18.0
https://www.dhmguide.com/never-hungover/alcohol-eye-health-vision-impact-2025,1200,28,2.33%,22.0
https://www.dhmguide.com/never-hungover/liver-health-alcohol-supplements-dhm-2025,250,15,6.00%,35.0
https://www.dhmguide.com/never-hungover/british-pub-culture-guide,5,0,0.00%,95.0
https://www.dhmguide.com/never-hungover/french-wine-culture-guide,3,0,0.00%,99.0
https://www.dhmguide.com/never-hungover/german-beer-culture-guide,0,0,0.00%,
https://www.dhmguide.com/never-hungover/spanish-drinking-culture-guide,1,0,0.00%,98.0
https://www.dhmguide.com/never-hungover/italian-drinking-culture-guide,180,8,4.44%,42.0
https://www.dhmguide.com/never-hungover/business-dinner-networking-dhm-guide-2025,2,0,0.00%,92.0
https://www.dhmguide.com/never-hungover/bachelor-bachelorette-party-dhm-2025,0,0,0.00%,
https://www.dhmguide.com/never-hungover/executive-cognitive-performance-alcohol-2025,1,0,0.00%,100.0
https://www.dhmguide.com/never-hungover/quantum-health-monitoring-alcohol-2025,8,0,0.00%,88.0
https://www.dhmguide.com/never-hungover/adaptogenic-beverages-ancient-wisdom-2025,4,0,0.00%,85.0
https://www.dhmguide.com/never-hungover/advanced-liver-detox-science-vs-marketing-myths-2025,95,5,5.26%,28.0
https://www.dhmguide.com/never-hungover/alcohol-and-autophagy-cellular-renewal-2025,18,0,0.00%,65.0
https://www.dhmguide.com/never-hungover/nonexistent-slug-foo,50,2,4.00%,30.0
https://www.dhmguide.com/guide,9000,580,6.44%,3.1
```

Expected counts (when fixture is sole input + posts present):
- SAVE ≥ 5 (cluster + allowlist + advanced-liver via cluster override + high-traffic italian + ≥160 cluster spokes)
- MERGE = 4 (british, french, german, spanish)
- DELETE ≥ 4 (business-dinner, bachelor, executive, quantum, adaptogenic — those without cluster + age >90d)
- MISSING = 1 (nonexistent-slug-foo)
- nonBlogUrlsIgnored = 1 (`/guide`)

## Technical Decisions Table

| Decision | Options Considered | Choice | Rationale |
|---|---|---|---|
| CSV parser | (A) Stdlib quote-aware split, (B) `node:readline` regex, (C) `csv-parse` dep | (A) | Zero deps per NFR-2; GSC format well-defined; ~25 LOC sufficient |
| Off-strategy encoding | Hardcoded array vs. JSON config | Array literal in script | Single source of truth; PR review surfaces additions; no extra file to forget |
| MERGE detection | Heuristic clustering vs. hardcoded groups | Hardcoded `KNOWN_MERGE_GROUPS` | Only one confirmed group exists; heuristic risks false positives; future groups added with explicit signoff |
| Inbound link compute | Per-post grep vs. single-pass index | Single-pass index | O(N) vs O(N²); deterministic; matches research §3 §5 |
| Output dir naming | Static `dcni/` vs. dated dir | Dated `dcni-2026-04-29/` (override flag) | Re-runs preserve history; matches research §7 |
| Decision tree style | Predicate functions vs. inline if-cascade | Inline cascade in `decide()` | Linear top-to-bottom matches AC ordering; no abstraction overhead |
| First-commit dates | Single batch git command vs. per-file invocation | Per-file invocation (cached) | Robust to renames; ~200 invocations <2s acceptable per NFR-3 |

## Error Handling

| Scenario | Strategy | User Impact |
|---|---|---|
| `--gsc-csv` missing | `console.error` + `process.exit(1)` with message | Clear CLI error |
| GSC CSV file not found | `fs.readFileSync` throws; caught, exit 1 with path | Clear path error |
| GSC header schema drift | Validate header, throw with diff | Halt with explicit "missing X column" |
| GSC row with non-blog URL | Skip; increment `nonBlogUrlsIgnored` counter | Reported in summary |
| GSC URL with no matching post JSON | Add to `missing` bucket | Visible in JSON output |
| Post slug absent from GSC | Treat as `impressions: 0` | Flows through normal decision tree |
| `git log` fails (untracked file) | Catch; `age = null` | Skips age check at step 7 (post stays in REVIEW) |
| Output dir already exists | `mkdirSync({recursive: true})` no-op | Overwrites prior outputs (dated dir prevents collisions) |

## Verification Commands

```bash
# AC-1: script exists, runs against fixture
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --dry-run

# AC-3 + AC-5: fixture-driven decisions
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --output-dir /tmp/test-buckets
cat /tmp/test-buckets/buckets.json | python3 -c "import json,sys; d=json.load(sys.stdin); s=d['summary']; assert s['save']>=2, s; assert s['delete']>=1, s; print('PASS counts:', s)"

# AC-5.3: deterministic output (byte-identical re-run)
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --output-dir /tmp/run1
node scripts/dcni-bucket.mjs --gsc-csv data/gsc-pages-fixture.csv --output-dir /tmp/run2
diff -r /tmp/run1 /tmp/run2 && echo "PASS deterministic"

# AC-6.2 + AC-6.3: zero side effects on tracked files
git status --porcelain | grep -v '^??' | grep -v 'docs/dcni' && echo "FAIL side effects" || echo "PASS no mutations"

# AC-6.1: build green
npm run build && echo "PASS build"
```

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Off-strategy regex over-flags real content | M | Cluster + Italian-allowlist short-circuits FIRST (D2 ordering); REVIEW catch-all at step 8/9; manual review before any deletion ships in future PR |
| Manual deployment of 410s during moratorium | M | `docs/dcni-2026-04-29/README.md` warns explicitly: "DECISIONS ONLY — do not deploy until moratorium expires mid-July 2026 (#366)" |
| Future GSC CSV format change | L | Header validation up front; clear error message naming missing column |
| MERGE detection too aggressive | L | Hardcoded `KNOWN_MERGE_GROUPS` (cultural-drinking only) in v1; future groups added with explicit human review |
| `git log` slow on 200+ posts | L | <2s acceptable per NFR-3; can batch via single `git log --name-only --diff-filter=A` pass if needed |
| Inbound regex false positives in code blocks | L | Pattern matches markdown link syntax `(/never-hungover/<slug>)` only, not bare URLs |

## Test Strategy

### Unit-style (fixture-driven)
- Run script against `data/gsc-pages-fixture.csv`
- Assert summary counts match expected (SAVE ≥ 5, MERGE = 4, DELETE ≥ 4)
- Assert specific slug decisions: `dhm-dosage-guide-2025` → SAVE (cluster), `british-pub-culture-guide` → MERGE, `business-dinner-networking-dhm-guide-2025` → DELETE, `advanced-liver-detox-science-vs-marketing-myths-2025` → SAVE (cluster overrides off-strategy)

### Integration
- `npm run build` exits 0 (script is standalone; verify no breakage)
- `git status` after script run shows only new `docs/dcni-2026-04-29/*` files

### Determinism (NFR-4)
- Two consecutive runs produce byte-identical `buckets.json` and `buckets.md` (modulo `generatedAt` timestamp — exclude from diff or use fixed `--date` flag for tests)

## Existing Patterns to Follow

Based on `scripts/orphan-post-link-injector.mjs`:
- ESM imports: `node:fs`, `node:path`, `node:url` `fileURLToPath` for `__dirname`
- `ROOT = path.resolve(__dirname, '..')` then path-join from there
- Helper: `readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }`
- Argv parsing: simple `args.find(a => a.startsWith(...))` or positional loop
- Output: 2-space `JSON.stringify(obj, null, 2) + '\n'` (matches repo convention, per NFR-5)
- Word count: `content.split(/\s+/).filter(Boolean).length` (matches `analyze-internal-links.js`)

## PR Strategy

Two commits, each with `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer:

1. **`feat(scripts): add DCNI Save/Merge/Delete bucketing script + fixture (#365)`**
   - Stage: `scripts/dcni-bucket.mjs`, `data/gsc-pages-fixture.csv`, `docs/dcni-2026-04-29/{buckets.json, buckets.md, README.md}`

2. **`chore(spec): scaffold ralph spec artifacts for issue #365`**
   - Stage: `specs/issue-365-dcni-bucketing/{research,requirements,design,tasks}.md`

## Unresolved Questions

None blocking. All edge cases routed to REVIEW or MISSING bucket by design.

## Implementation Steps

1. Create `scripts/dcni-bucket.mjs` skeleton: ESM bootstrap, argv parsing, CSV parser with quote-aware tokenizer, header validation
2. Implement `loadPosts`, `loadClusterMembers`, `buildInboundIndex` (single-pass O(N) regex)
3. Implement `loadFirstCommitDates` (per-file `git log --diff-filter=A --reverse`)
4. Implement `decide()` with strict 9-step decision tree per AC ordering
5. Implement `renderMarkdown` (sections per bucket, markdown table with slug/impressions/reason/wordCount)
6. Implement `renderReadme` (deployment-gating warning + moratorium reminder + decision tree summary)
7. Wire `main()` end-to-end; emit JSON + MD + README
8. Create `data/gsc-pages-fixture.csv` with 18 representative rows
9. Run script against fixture; capture sample output; commit `docs/dcni-2026-04-29/{buckets.json, buckets.md, README.md}` for reviewer visibility
10. Verify `npm run build` exits 0 and `git status --porcelain` shows only new files
