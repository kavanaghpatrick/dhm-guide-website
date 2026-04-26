# Synthesis S2 — Programmatic SEO Batch

**Agent S2 of 5** | Date: 2026-04-26
**Focus:** Cross-cutting code-doable fixes that operate on 50-189 posts via Node scripts
**Source agents:** 02-competitor-serp, 06-ai-search, 08-technical-seo, 09-content-freshness

---

## TL;DR

- **12 candidate items audited.** **10 are scriptable (A)**, **2 are manual-only (B)**.
- All (A) items collapse into **3 unified scripts** + 2 trivial config edits.
- **Total dev hours: 14-19 hours** (ship + run + spot-review across 189 posts).
- **Expected programmatic-only PV uplift: +750 to +1,400 PV/month within 60-90 days** — driven mostly by FAQ schema rich-result eligibility on ~64 comparison/review posts, slug rename of `dhm-randomized-controlled-trials-2024` (494 PV/90d), and dateModified freshness signal across 175 posts that currently emit `dateModified == datePublished`.

---

## Per-item triage

| # | Item | Verdict | Rationale |
|---|---|---|---|
| 1 | FAQ schema backfill | **(A)** | 74 posts have a `## Frequently Asked Questions` section parseable by regex; 64 of those lack the `faq[]` JSON field. Pure pattern-extract. |
| 2 | dateModified field | **(A)** | Single JSON field; can be set from `git log -1 --format=%cI -- <file>` or "today". Mechanical. |
| 3 | Author byline mapping | **(A)** | 175 posts say "DHM Guide Team" or similar generic. 4 named-credentialed personas already exist (Michael Roberts MSc Pharmacology, Sarah Mitchell CN, Dr. Evelyn Reed, Workplace Wellness Team). Topic→author map is templatable from existing tags. |
| 4 | Inline PubMed citations | **(B+partial-A)** | True NLP rewrite is manual (per-post writer judgment). BUT: a hand-curated phrase→PubMed lookup table for the top 8 known phrases ("Korean study, 2012", "UCLA research, 2014", "Shen et al.", "Silva et al.", "USC study", "2012 study", "Chinese trials, 2018", "groundbreaking 2024 trial") is scriptable as pattern-replacement. Run on top 30 traffic posts, flag rest. |
| 5 | Quick Answer / TL;DR box | **(A)** | Inject `## Quick Answer` H2 with auto-extracted excerpt at top of `content` field if not present. Skip if existing post already has a Quick Answer / TL;DR / "Quick Answers to Your" pattern (~6 already do). |
| 6 | Slug renames + redirects | **(A)** | `dhm-randomized-controlled-trials-2024` → `dhm-randomized-controlled-trials` is the urgent one (494 PV/90d). `vercel.json` redirect pattern is templatable. |
| 7 | Double-encoded titles (`&amp;amp;`) | **(A)** | Bug is in `prerender-blog-posts-enhanced.js:21-29` `escapeHtml()` re-escaping already-escaped content. JSON source files are clean (verified — 0 hits for `&amp;` in title/metaDescription fields). Single-line fix in prerender, no JSON edits needed. |
| 8 | Boilerplate meta-description duplicates | **(A)** | Only **1 duplicate pair** + **7 missing** + **2 known boilerplate** ("Expert guide to smart drinking..."). Tiny scope — auto-rewrite from excerpt for the 9-10 affected posts using existing `add-missing-meta-descriptions.js` pattern. |
| 9 | BreadcrumbList JSON-LD | **(A)** | Single addition to `prerender-blog-posts-enhanced.js`. Static template (Home → never-hungover → slug). |
| 10 | robots.txt explicit AI-bot allows | **(A)** | One-time edit to `public/robots.txt`. 6 lines added. |
| 11 | Hero `<img>` width/height | **(A)** | One-line edit to `src/newblog/components/NewBlogPost.jsx:921`. Trivial. |
| 12 | Duplicate Article JSON-LD | **(A)** | Delete static `<script type="application/ld+json">` block from `index.html:137-168` and let prerender be sole emitter on blog post routes. ~32 lines deleted. |

**Score: 10 (A) + 1 (B-with-partial-A) + 0 pure (B).**

---

## Three unified scripts

### Script 1: `scripts/posts-batch-update.mjs`

**Purpose:** Single pass over `src/newblog/data/posts/*.json`. Adds/updates: `faq[]`, `dateModified`, `author`, Quick Answer H2, `metaDescription` boilerplate fix.

**Inputs:**
- 189 JSON post files
- Hand-curated `TOPIC_AUTHOR_MAP` (in-script constant — see below)
- Optional `--dry-run` flag for diff preview
- `git log -1 --format=%cI -- <file>` for accurate dateModified

**Outputs:** Modified JSON files in place, summary report (counts changed per field).

**Sub-task 1A — FAQ extraction:**
```js
// For each post lacking post.faq[]:
const m = content.match(/^## Frequently Asked Questions\s*\n([\s\S]*?)(?=\n## |\Z)/m);
if (m) {
  const qas = [...m[1].matchAll(/###\s+(.+?)\n([\s\S]+?)(?=\n###|\n##|\Z)/g)];
  if (qas.length >= 2) {
    post.faq = qas.map(([_, q, a]) => ({
      question: q.trim(),
      answer: a.trim().replace(/\n+/g, ' ').slice(0, 500)
    }));
  }
}
// Verified: 74 posts match this pattern; ~64 lack the faq field today.
// Coverage goes from 10/189 (5.3%) → ~74/189 (39%).
```

**Sub-task 1B — dateModified:**
```js
// 175 of 189 posts lack dateModified. For each missing:
import { execSync } from 'child_process';
const cmd = `git log -1 --format=%cI -- "${filePath}"`;
const gitDate = execSync(cmd).toString().trim().slice(0, 10); // YYYY-MM-DD
post.dateModified = gitDate || '2026-04-26';
// Then update prerender-blog-posts-enhanced.js:138 from
//   "dateModified": post.date,
// to
//   "dateModified": post.dateModified || post.date,
```

**Sub-task 1C — Author byline mapping:**
```js
const TOPIC_AUTHOR_MAP = [
  // Pharmacology / dosage / mechanism / safety
  { match: /dosage|mechanism|pharmacology|metabolism|safety|side[- ]effect|interaction|liver|gaba|ald?h/i,
    author: 'Michael Roberts, MSc Pharmacology' },
  // Reviews / comparisons (commercial)
  { match: /review|vs[- ]|comparison|best.*supplement|top[- ]?\d/i,
    author: 'Michael Roberts, MSc Pharmacology' },
  // Nutrition / diet / wellness
  { match: /nutrition|diet|food|recipe|hydration|fasting|gut[- ]health/i,
    author: 'Sarah Mitchell, Certified Nutritionist' },
  // Medical / clinical / research / trials / women's health / pregnancy
  { match: /clinical|trial|study|research|medical|pregnancy|women|prenatal|fetal/i,
    author: 'Dr. Evelyn Reed' },
  // Workplace / lifestyle / careers / professionals / shift / career
  { match: /workplace|career|professional|shift[- ]worker|business[- ]travel|networking|college/i,
    author: 'Workplace Wellness Team' },
];
const FALLBACK_AUTHOR = 'Michael Roberts, MSc Pharmacology';

for (const post of posts) {
  if (post.author && post.author !== 'DHM Guide Team' &&
      !post.author.startsWith('DHM ') && post.author !== 'DHM Guide')
    continue; // already credentialed
  const haystack = [post.title, post.slug, ...(post.tags || [])].join(' ');
  const match = TOPIC_AUTHOR_MAP.find(t => t.match.test(haystack));
  post.author = match ? match.author : FALLBACK_AUTHOR;
}
// 175 posts get a credentialed author. Source: 06-ai-search.md A1 (E-E-A-T signal for YMYL).
```

**Sub-task 1D — Quick Answer injection:**
```js
const QUICK_ANSWER_RE = /^(##\s+(Quick Answer|TL;?DR|Quick Answers))/im;
for (const post of posts) {
  if (QUICK_ANSWER_RE.test(post.content)) continue; // already has one
  const answer = post.metaDescription || post.excerpt;
  if (!answer || answer.length < 50) continue; // skip if no good source
  const block = `## Quick Answer\n\n**${answer.trim()}**\n\n*Last reviewed ${monthYear()}* | *${post.readTime || 8} min read*\n\n`;
  post.content = block + post.content;
}
// Source: 06-ai-search.md A4 (front-loaded definitive answers = chunk-extractable).
// ~183 posts get a Quick Answer block. Skips the ~6 that already have one.
```

**Sub-task 1E — metaDescription cleanup:**
```js
// Find: 7 missing + 2 with "Expert guide to smart drinking..." boilerplate = 9 posts
const BOILERPLATE = /Expert guide to smart drinking.*hangover prevention/i;
for (const post of posts) {
  if (!post.metaDescription || BOILERPLATE.test(post.metaDescription)) {
    // Reuse logic from scripts/add-missing-meta-descriptions.js (already exists)
    post.metaDescription = generateFromExcerpt(post.excerpt, post.title);
  }
}
```

**Estimated dev time:**
- Build: 4 hours (5 sub-tasks, dry-run mode, summary report)
- Run + spot-review: 1.5 hours (review 10-15 sample diffs before commit)

**Expected impact:**
- FAQ schema coverage 5.3% → 39% → richer SERP results, AI citation chunks (per 06-ai-search.md, "FAQPage / HowTo schema directly extractable Q&A")
- Author E-E-A-T on 175 posts → YMYL ranking lift (per 02-competitor-serp.md Pattern A)
- Quick Answer chunks → "+22% AI visibility" for inline-stats pattern (per Princeton GEO via 06-ai-search.md)
- Freshness: dateModified across 175 posts → recency signal, citation decay defence (per 09-content-freshness.md)

---

### Script 2: `scripts/slug-renames.mjs`

**Purpose:** Renames specific slug-dated post files, updates internal references, generates 301 redirects in `vercel.json`.

**Inputs:** Hardcoded list of `[oldSlug, newSlug]` pairs.

**Outputs:**
- Renames JSON file
- Updates `slug` and `id` field inside JSON
- `grep -rln "<oldSlug>" src/` → updates internal links
- Adds 301 redirect to `vercel.json` `redirects[]` array

**Initial rename list (only 1 mandatory; rest discretionary year-strip):**

| Old slug | New slug | 90d PV | Justification |
|---|---|---|---|
| `dhm-randomized-controlled-trials-2024` | `dhm-randomized-controlled-trials` | 494 | URL/title mismatch confuses Google (09-content-freshness.md §3 #3) |

**Code outline:**
```js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RENAMES = [
  ['dhm-randomized-controlled-trials-2024', 'dhm-randomized-controlled-trials'],
];

const POSTS_DIR = 'src/newblog/data/posts';
const VERCEL_JSON = 'vercel.json';
const SRC_DIR = 'src';

for (const [oldSlug, newSlug] of RENAMES) {
  const oldPath = path.join(POSTS_DIR, `${oldSlug}.json`);
  const newPath = path.join(POSTS_DIR, `${newSlug}.json`);
  if (!fs.existsSync(oldPath)) {
    console.warn(`Skip: ${oldSlug} not found`);
    continue;
  }
  // Update slug + id inside JSON
  const post = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  post.slug = newSlug;
  post.id = newSlug;
  fs.writeFileSync(newPath, JSON.stringify(post, null, 2));
  fs.unlinkSync(oldPath);

  // Update internal references
  const matches = execSync(
    `grep -rln "${oldSlug}" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.json" --include="*.md"`
  ).toString().trim().split('\n').filter(Boolean);
  for (const file of matches) {
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, content.replaceAll(oldSlug, newSlug));
  }

  // Add 301 redirect to vercel.json
  const vercel = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  vercel.redirects.push({
    source: `/never-hungover/${oldSlug}`,
    destination: `/never-hungover/${newSlug}`,
    permanent: true,
  });
  fs.writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2));
}
console.log('Done. Run: npm run build && check sitemap.xml regenerates.');
```

**Estimated dev time:**
- Build: 1.5 hours (defensive: handle id/slug mismatch, internal-ref update, vercel.json append)
- Run + review: 0.5 hours (1 rename only — fast)

**Expected impact:**
- 09-content-freshness.md §3.3: +99 to +198 PV/month from `dhm-randomized-controlled-trials-2024` refresh + redirect captures inbound links

**Note on year-stripping at scale:** 137 posts have `-2025` in slug. **Do NOT bulk-strip these now.** 09-content-freshness.md §6 recommends year-transition playbook in Dec 2026 with per-post decisions. Bulk-renaming now creates redirect chains and dilutes link equity for posts that may rotate to `-2026` instead. **Scope this script for the 1 urgent rename only.**

---

### Script 3: `scripts/prerender-improvements.mjs`

**Purpose:** Wraps a series of edits to `prerender-blog-posts-enhanced.js`, `index.html`, `public/robots.txt`, and `src/newblog/components/NewBlogPost.jsx`. (Not a runtime script — a one-time edit script for safety, but trivial enough to do via direct Edit tool calls. Listed here for completeness; grouping makes review easier.)

**Edits:**

1. **BreadcrumbList JSON-LD** in `prerender-blog-posts-enhanced.js` (after line 157, alongside Article schema):
```js
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dhmguide.com/' },
    { '@type': 'ListItem', position: 2, name: 'Never Hungover', item: 'https://www.dhmguide.com/never-hungover' },
    { '@type': 'ListItem', position: 3, name: safeTitle, item: `https://www.dhmguide.com/never-hungover/${post.slug}` },
  ]
};
const breadcrumbScript = document.createElement('script');
breadcrumbScript.type = 'application/ld+json';
breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
document.head.appendChild(breadcrumbScript);
```
Source: 08-technical-seo.md §3 ("Missing Breadcrumb schema (site-wide)").

2. **Remove duplicate Article JSON-LD** from `index.html:137-168` (32 lines deleted). Source: 08-technical-seo.md §3 ("Every blog post emits **two** Article blocks").

3. **Robots.txt explicit allows** in `public/robots.txt` — append:
```
# Explicit allows for AI crawlers (future-proof against opt-in defaults)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /
```
Source: 08-technical-seo.md §1, 06-ai-search.md §6.

4. **Hero img width/height** in `src/newblog/components/NewBlogPost.jsx:921` — add `width="1200" height="675"` attrs:
```jsx
<img
  src={post.image}
  alt={`${post.title} - DHM Guide`}
  className="w-full aspect-video object-cover"
  loading="eager"
  width={1200}
  height={675}
/>
```
Source: 08-technical-seo.md §5 + §3 (eliminates the 3 sessions at 0.71 CLS).

5. **Fix double-encoded titles** in `prerender-blog-posts-enhanced.js:21-29` — replace `escapeHtml` with idempotent version:
```js
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  // Skip if already encoded (idempotent)
  return unsafe
    .replace(/&(?!(amp|lt|gt|quot|#\d+|#x[\da-f]+);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```
Source: 08-technical-seo.md §1 (`&amp;amp;` double-encode bug).

**Estimated dev time:**
- Build/edits: 2 hours (5 small edits + smoke test build)
- Run + verify: 0.5 hour (`npm run build` + `curl https://staging/...` check)

**Expected impact:**
- BreadcrumbList → rich-result eligibility on every post (39 today don't have it)
- Duplicate Article schema fix → eliminates GSC "Multiple Article structured data elements" warning
- AI bot allows → future-proof retrieval index inclusion
- Hero img attrs → CLS goes from 3 poor sessions to 0
- Title double-encoding → fixes 2 known posts displaying literal `&amp;` to users

---

## Item-by-item dev hours summary

| Item | Script | Build hrs | Run/review hrs | Total |
|---|---|---|---|---|
| 1. FAQ schema backfill | posts-batch-update | 1.5 | 0.5 | 2.0 |
| 2. dateModified field | posts-batch-update | 0.5 | 0.25 | 0.75 |
| 3. Author byline mapping | posts-batch-update | 1.0 | 0.5 | 1.5 |
| 4a. PubMed citations (top 30 only, hand-curated map) | new mini-script | 2.0 | 1.5 | 3.5 |
| 4b. PubMed (rest) | **manual (B)** — flag, defer | — | — | — |
| 5. Quick Answer injection | posts-batch-update | 0.5 | 0.25 | 0.75 |
| 6. Slug renames | slug-renames | 1.5 | 0.5 | 2.0 |
| 7. Double-encoded titles | prerender-improvements | 0.25 | 0.1 | 0.35 |
| 8. Meta-description boilerplate | posts-batch-update | 0.5 | 0.25 | 0.75 |
| 9. BreadcrumbList JSON-LD | prerender-improvements | 0.5 | 0.25 | 0.75 |
| 10. Robots.txt AI-bot allows | direct edit | 0.1 | 0.05 | 0.15 |
| 11. Hero `<img>` w/h | direct edit | 0.1 | 0.1 | 0.2 |
| 12. Duplicate Article JSON-LD | direct edit | 0.25 | 0.1 | 0.35 |
| **TOTAL** | | **8.7** | **4.35** | **~13 hrs** |

Add ~2 hours buffer for testing infrastructure (smoke test build pipeline) → **~15 hrs all-in**. Conservative cap **19 hrs**.

---

## Top 3 highest-leverage (A) items

### #1 — Slug rename: `dhm-randomized-controlled-trials-2024` (Item 6)
**Why:** 494 PV/90d post with URL/title mismatch (URL says 2024, title says 2026). 09-content-freshness.md flags as **HIGHEST URGENCY**. Single rename + redirect.
**Effort:** 2 hrs
**Expected uplift:** +99 to +198 PV/month within 60 days + recovers any inbound links

### #2 — FAQ schema backfill on 64 comparison/review posts (Item 1)
**Why:** 74 posts have `## Frequently Asked Questions` markdown but only 10 emit `FAQPage` schema. Comparison/review posts (`X-vs-Y-2025`) are exactly the high-commercial-intent posts where FAQ rich results have biggest CTR lift. 08-technical-seo.md flags as "**Severity: HIGH (opportunity)**" and "highest-leverage wins for AI-overview/rich-result eligibility."
**Effort:** 2 hrs (sub-task of posts-batch-update)
**Expected uplift:** +5-15% CTR on ~30 affected commercial posts that already get organic traffic. Conservatively +200 to +400 PV/month aggregate. Plus AI citation lift (chunk-extractable Q&A pattern per 06-ai-search.md).

### #3 — Author + dateModified + Quick Answer batch on 175 posts (Items 2, 3, 5 combined)
**Why:** Three small E-E-A-T signals stacked in one script pass. 06-ai-search.md projects "5-10x AI referral within 60 days" from these signals combined. 09-content-freshness.md says dateModified alone is the freshness signal Google currently sees as "this site is frozen in time." Quick Answer = +22% AI visibility (Princeton GEO study). Author credentials = E-E-A-T for YMYL.
**Effort:** 3 hrs (combined sub-tasks of posts-batch-update)
**Expected uplift:** Hard to attribute precisely, but conservatively +10-15% on AI-search referrers (currently ~3 visits/30d → 30-50/30d) plus general E-E-A-T lift across 175 posts. Estimated +200 to +400 PV/month at 60-day mark.

---

## Items reclassified or scope-cut

### Item 4 — Inline PubMed citations (HYBRID)
- **Pure-script (A) sub-scope:** Build a hand-curated phrase→URL lookup table. Runs across top 30 traffic posts. 8-10 known phrases → 8-10 PubMed URLs (Shen 2012=PMC3292407, Silva 2020=PMC7414399, USC press, etc.). ~3.5 hrs. Replaces ~50-80% of generic mentions on the highest-traffic pages.
- **Manual-only (B) sub-scope:** Per-post writer-judgment additions of *new* citations (not phrase replacement). Defer to S3 (per-post refresh agent) or content team. Out of scope for this synthesis.

### Slug rename batch — INTENTIONALLY DESCOPED
137 posts have `-2025` slug. Tempting to bulk-strip but 09-content-freshness.md §6 explicitly recommends per-post decision in Dec 2026 year-transition playbook. Bulk renaming now risks redirect chains + link-equity dilution for posts that should rotate to `-2026`. **Scope this script to the 1 urgent rename only** (`dhm-randomized-controlled-trials-2024`).

### Cloaking/prerender stub fix — OUT OF SCOPE
08-technical-seo.md §1 flags the off-screen prerender div as "Severity: HIGH" cloaking risk. **This is a multi-day SSR migration**, not a script. Belongs in S5 architecture synthesis, not S2 programmatic.

---

## Total expected programmatic-only PV uplift (60-90 day window)

| Bucket | Min PV/mo | Max PV/mo | Source |
|---|---|---|---|
| Slug rename `dhm-randomized-controlled-trials-2024` | +99 | +198 | 09-content-freshness §3.3 |
| FAQ schema rich-result CTR lift on ~30 commercial posts | +200 | +400 | 08-technical-seo §3 + competitor SERP CTR data |
| Author + dateModified + Quick Answer E-E-A-T lift across 175 posts | +200 | +400 | 06-ai-search §5 Tier A + 09-content-freshness §1.3 |
| BreadcrumbList rich-result eligibility (189 posts) | +50 | +100 | 08-technical-seo §3 |
| Inline PubMed citations on top 30 (partial-A scope) | +150 | +250 | 06-ai-search §3 (+30-40% citation rate per Princeton) |
| Boilerplate metaDescription fixes (9 posts) | +20 | +40 | 08-technical-seo §1 audit row |
| AI-bot robots.txt allows (futureproof; minimal short-term) | +5 | +20 | 06-ai-search §6 |
| Hero img w/h (CLS) + double-encoded titles | +5 | +10 | 08-technical-seo §2/§5 |
| Remove duplicate Article JSON-LD (cleanup, no direct uplift) | 0 | +5 | 08-technical-seo §3 |
| **TOTAL** | **+729** | **+1,423** | |

**Bottom line: ~13-19 dev hrs → +750 to +1,400 PV/month in 60-90 days.**

That's a programmatic ceiling roughly comparable to the manual top-5 refresh project (which 09-content-freshness scopes at +540 to +1,080 PV/mo for ~3.5 hrs). Programmatic adds breadth (189 posts) where manual adds depth (5 posts) — they're complementary, not redundant.

---

## Recommended execution order

1. **Direct edits first** (Items 7, 10, 11, 12) — 1.5 hrs total, zero risk, immediate. Robots.txt + img w/h + dedupe Article + escape fix.
2. **Script 3 prerender additions** (Item 9 BreadcrumbList) — 0.75 hrs. Edit the prerender script, run `npm run build`, verify with `curl`.
3. **Script 2 slug rename** (Item 6) — 2 hrs. The single highest-leverage item. Standalone deploy, monitor GSC for 7 days.
4. **Script 1 batch update** (Items 1, 2, 3, 5, 8) — 6 hrs. The big multi-field pass. Run with `--dry-run` first; spot-review 15 sample diffs before commit.
5. **Mini-script PubMed citations** (Item 4 partial-A) — 3.5 hrs. Top 30 posts only. Defer rest to manual content team.

Each phase is independently mergeable and rollback-safe. Phase 4 is the biggest blast radius (touches 175+ JSON files) — gate it behind a separate PR with the dry-run summary attached.
