# Content Refresh Workflow — Quarterly Cadence Runbook

> **Refs #283. Source:** `docs/traffic-growth-2026-04-26/09-content-freshness.md` §6.

This is a runbook, not an essay. Use it to refresh existing content on a sustained cadence.

---

## 1. Why this matters

Per T9 freshness analysis (Apr 2026):

> "Refresh strategy alone could 1.8x to 2.6x site traffic in 9 months with no new content created. This is the cheapest leverage available. Refreshing 5 posts beats writing 50 new ones."

Google's freshness signal is weighted heavily for YMYL (Your Money or Your Life) topics — health content like ours. Expected uplift per refreshed top-traffic post: **+20-40% PV within 60-90 days** of reindex.

Stale signals that hurt rankings today:
- 94% of posts emit `dateModified == datePublished` in JSON-LD (fixed by #286 — git commit date now flows through automatically)
- Visible "Last Updated: January 2025" lines in body copy
- Slug year stamps (`-2025`) freeze content in time
- Product comparisons referencing discontinued SKUs or stale prices

**Top 5 posts = 47.7% of traffic. Top 30 = 81.7%.** Refresh ROI is wildly concentrated. Focus quarterly effort on the top 10 — it's where the lift is.

---

## 2. Quarterly refresh cycle (~30 min × top-10 = ~5 hrs/quarter)

### When

Once per calendar quarter. Suggested first-week-of-quarter slots: early Jan, early Apr, early Jul, early Oct.

### Identify the top-10

```bash
./scripts/posthog-query.sh top-pv
```

Take the top 10 paths under `/never-hungover/`. (Skip `/`, `/reviews`, `/never-hungover/` index — those refresh on their own cadence.) The set typically rotates 1-2 posts per quarter, so don't assume last quarter's list still applies.

### Per-post checklist (~30 min)

For each of the top 10:

- [ ] Read existing post; identify thin sections, year-stamped lines, stale claims
- [ ] Update `"dateModified"` field to today's date (ISO format: `YYYY-MM-DD`)
  - **Note:** Per `scripts/lib/get-date-modified.js` (#286), the dateModified flows from explicit field → git commit date → publish date. If you commit a JSON edit, git commit date works automatically. Set the explicit field only when you want a different value (e.g., backdating a tiny copyedit you don't want to claim as a refresh).
- [ ] Add 1-2 new citations from 2024-2026 PubMed/PMC research
  - Search: `https://pubmed.ncbi.nlm.nih.gov/?term=dihydromyricetin&filter=years.2024-2026`
  - **Always verify the PMC ID resolves via WebFetch before adding.** Check the title and authors match what you're claiming.
  - **NEVER use these banned PMC IDs** (see §7 — they were verified broken in #299/#300/#301)
- [ ] Update product comparisons:
  - Spot-check current Amazon prices on top 3 products mentioned
  - Verify brands haven't been discontinued (cross-reference `/reviews`)
  - Add any new entrants released in the last quarter
- [ ] Refresh Quick Answer (top-of-post box) if new research has shifted the dosage/timing/mechanism understanding. Otherwise leave it.
- [ ] Verify no broken internal/external links (quick visual scan for redirects, 404s)
- [ ] Run `npm run build` — confirm 0 errors
- [ ] Spot-check one prerendered HTML in `dist/never-hungover/<slug>/index.html` for the new dateModified
- [ ] Commit + PR with title `refresh: <slug> Q<#> 2026`
- [ ] Squash-merge

### Why 30 min per post

Beyond 30 min, you're rewriting — that's an expansion (Phase 3), not a refresh. If a post genuinely needs 60+ min, file it as a separate "expand" issue and skip it from the quarterly batch.

---

## 3. Year transition (December → January)

Run **once per year** in late December. Budget: ~6 hours.

### What breaks at year transition

- 137 posts (per April 2026 audit) have `-2025` in slug
- Body content has hardcoded year strings: "Last Updated: January 2025", "Best DHM 2025", "[2025 Updated]"
- Title fields say `"... 2025"`
- Search queries with the year ("DHM dosage 2026") return our 2025-stamped pages — competitors with 2026-fresh content outrank

### Decision rule per post

For every `-2025` slug, pick one of three:

1. **Evergreen content (dosage, timing, safety, mechanism)** → strip year from slug. Add 301. Result: stable URL forever.
2. **Recurring annual content (best supplements roundup, year-in-review)** → rotate to `-2026` with 301 from `-2025`.
3. **Locked-to-year content (clinical trials 2024, etc.)** → leave slug alone, add a "Most recent research" section with 2025-2026 citations.

**Default for new posts going forward: year-agnostic slugs.** "DHM dosage guide" beats "DHM dosage guide 2025" long-term. Yearly slug rotation creates redirect chains and dilutes link equity.

### Bulk script template

Pattern from #288 (dhm-randomized-controlled-trials-2024 → dhm-randomized-controlled-trials):

```bash
# 1. Rename JSON file
git mv src/newblog/data/posts/<slug>-2025.json src/newblog/data/posts/<slug>.json

# 2. Update slug field inside the JSON (search for the old slug string)
#    Edit the "slug": "<old>" line to match the new filename

# 3. Add 301 to vercel.json under "redirects":
#    {
#      "source": "/never-hungover/<slug>-2025",
#      "destination": "/never-hungover/<slug>",
#      "permanent": true
#    }

# 4. Update internal links sitewide
grep -rn "<slug>-2025" src/ scripts/ docs/
# Edit each match to drop -2025

# 5. Build + spot-check
npm run build
curl -I https://www.dhmguide.com/never-hungover/<slug>-2025  # expect 308 redirect
```

### Search-and-destroy hardcoded year strings in body content

```bash
# Find every body-text year string
grep -rn '"Last Updated: \(January\|February\|March\|April\|May\|June\|July\|August\|September\|October\|November\|December\) 2025"' src/newblog/data/posts/
grep -rn '\[2025\]' src/newblog/data/posts/
grep -rn 'Best.*2025' src/newblog/data/posts/
```

Edit each match. For evergreen posts, drop the year. For annual roundups, swap to 2026.

---

## 4. Annual full review (every April or September)

Run **once per year** for every health-related post (the entire `/never-hungover/` directory). Budget: ~40 hours, batched across 2-3 weeks.

### Goals

- YMYL compliance: every medical claim has a citation; no contradicting recent research
- Outdated medical claims removed or qualified
- Every PMC/DOI link still resolves
- Product reviews re-verified (brands change, formulations change)

### Per-post audit (~10 min, ~189 posts × 10 min = ~32 hrs)

- [ ] Skim post for medical claims; flag anything without a citation
- [ ] WebFetch each PMC ID — confirm 200 + title matches what we cite
  - If broken, swap for current equivalent or remove the claim
- [ ] If post mentions a specific product, verify it's still on `/reviews`
- [ ] Update copyright/footer year if hardcoded

### When to escalate

If audit reveals a post is fundamentally outdated (e.g., 2024 mechanism explanation that 2026 research has overturned), file as "expand or retire" issue. Don't try to patch in the annual sweep.

---

## 5. Refresh trigger signals (refresh BEFORE the quarterly cycle)

Don't always wait for the quarterly slot. Refresh sooner when:

### Signal 1: Per-page PV decay

```bash
./scripts/posthog-query.sh top-pv
```

If a post that was top-10 last quarter has dropped out of top-20, it's decaying. Refresh it next.

### Signal 2: Search-position drop

Manual GSC check. Filter to last 90 days vs prior 90 days. If a top post's average position has worsened by ≥3 ranks, refresh now.

### Signal 3: New primary research published

If a major 2024-2026 study lands in the post's domain (e.g., a new DHM RCT), refresh that post within a week. Use `scholar.google.com` alerts on key terms.

### Signal 4: Competitor outranks us with newer content

If Healthline / Cleveland Clinic / ZBiotics-blog publishes something newer on the exact head term we hold, refresh within a week.

---

## 6. Refresh checklist template (copy-paste for executor)

```markdown
## Refresh: <slug> — Q<#> 2026

- [ ] Read existing post; identify thin sections
- [ ] Set "dateModified" = today's ISO date (or rely on git commit date via #286 helper)
- [ ] Add 1-2 new citations (verify PMC IDs via WebFetch)
- [ ] Update product/brand mentions per /reviews
- [ ] Update Quick Answer if mechanism understanding evolved
- [ ] Run `npm run build`; confirm 0 errors
- [ ] Spot-check dist HTML for new dateModified
- [ ] Commit + PR + merge with title `refresh: <slug> Q<#> 2026`
```

PR body template:

```
Refreshes <slug> for Q<#> 2026 cadence (refs #283).

- dateModified bumped to <date>
- Added 2024-2026 citations: <PMC IDs>
- Product/price updates: <one-line summary>
- Quick Answer: <unchanged / updated to reflect X>

Verified PMC IDs resolve. Build passes.
```

---

## 7. Banned PMC IDs (DO NOT use)

These were verified broken via WebFetch during #299/#300/#301 work. Future refreshes must NOT propagate them — they show up in older drafts and need to stay gone:

| PMC ID | Why banned |
|---|---|
| `PMC4082193` | Norway terror research — wrong topic |
| `PMC8429066` | Transdermal alcohol biosensor — broken/wrong topic |
| `PMC8259720` | Gut microbiome / autoimmune — broken/wrong topic |

If you see any of these in an existing post during a refresh, **remove and replace** with a verified current citation. Always WebFetch a PMC ID before adding it to confirm the title matches what you're citing.

---

## 8. Cadence metrics (track quarterly)

After each quarterly batch, snapshot these to validate ROI:

### Per-refreshed-post: PV delta (90d before vs 90d after)

Pull from `top-pv` query, filtered to the slugs you refreshed, comparing two windows. Expected: +20-40% PV per post by day 60-90 post-refresh.

### Aggregate site traffic

```bash
./scripts/posthog-query.sh daily-pv
```

Compare 30-day rolling average pre-refresh vs 30-day rolling average 60 days post-refresh. T9 target: 1.8-2.6x site traffic over 9 months of sustained cadence.

### Position changes

Manual GSC check on the refreshed slugs. Position improvement should appear within 30-60 days of reindex.

### Track-quarterly summary (suggested)

Keep a running log: `docs/refresh-log.md` (one row per refreshed post — slug, refresh date, before-PV, after-PV, position before, position after). Lets you spot which kinds of refreshes work and which don't.

---

## 9. Related infrastructure (don't recreate)

| Need | Use this |
|---|---|
| Resolve `dateModified` automatically from git | `scripts/lib/get-date-modified.js` (#286) |
| Identify top-PV pages this period | `./scripts/posthog-query.sh top-pv` (#308) |
| Daily PV trend, last 90d | `./scripts/posthog-query.sh daily-pv` |
| AI-search referrer growth | `./scripts/posthog-query.sh ai-search` |
| Affiliate CTR per page | `./scripts/posthog-query.sh top-ctr` |
| Slug rename + 301 pattern | See PR #288 (dhm-randomized-controlled-trials) |
| Cite a new PubMed paper | Search `pubmed.ncbi.nlm.nih.gov`, then WebFetch the PMC URL to verify before pasting |

This doc is the checklist. Everything else already exists.
