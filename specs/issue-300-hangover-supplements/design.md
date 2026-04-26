# Design — Issue #300

## Architecture Overview

This is a **content-only** rewrite of a single JSON post. **Zero code changes** to React components, hooks, or build scripts. The existing prerender pipeline already:

- Reads JSON post fields and emits Article JSON-LD
- Auto-emits FAQPage JSON-LD from `faq[]` array (verified — see other recent posts that grew their FAQ count)
- Includes `dateModified` in JSON-LD when the field is present (verified by issue #286 — `dateModified` infrastructure)
- Renders markdown body to HTML (including markdown tables)

So this spec leverages **only data changes**, exactly per Pattern #7 ("Trust Existing Code") in the project CLAUDE.md.

## Field-Level Changes to Post JSON

`src/newblog/data/posts/hangover-supplements-complete-guide-what-actually-works-2025.json`:

| Field | Change | Old → New |
|---|---|---|
| `title` | UPDATE | "20+ Hangover Supplements Tested: What Actually Works [2025]" (53) → "Best Hangover Prevention Supplements 2026: 7 Tested" (51) |
| `slug` | KEEP | unchanged |
| `excerpt` | UPDATE | (existing 188-char) → tighter head-term-aware excerpt (140-160 chars) |
| `quickAnswer` | UPDATE | (currently duplicate of excerpt) → definitive 1-2 sentence answer mentioning DHM ≥300mg |
| `metaDescription` | UPDATE | refresh to 2026 + head-term focused, 150-160 chars |
| `date` | KEEP | "2025-07-09" |
| `dateModified` | ADD | "2026-04-26" |
| `author` | KEEP | "DHM Guide Team" |
| `tags` | UPDATE | replace "hangover cure supplements" with "best hangover prevention supplement 2026" (head term as a tag) |
| `readTime` | UPDATE | 12 → 16 (reflecting expansion) |
| `content` | OVERHAUL | 3,014 words → 3,500-4,000 words |
| `image` | KEEP | null |
| `id` | KEEP | unchanged |
| `faq` | EXPAND | 5 → 15-17 entries |
| `relatedPosts` | KEEP | unchanged |

## Content Body Restructure

### Removed
- Line 1: `**Last Updated:** January 2025 | **Reading Time:** 15 minutes` (hardcoded date)
- Three broken PMC links: `pmc.ncbi.nlm.nih.gov/articles/PMC4082193/` (×2), `pmc.ncbi.nlm.nih.gov/articles/PMC8429066/`

### Added (in order, top to bottom)

**1. Hero paragraph** — direct head-term answer (~80 words)
```
The hangover supplement market is flooded with $2.8B in claims, but the science is brutal: a 2022 systematic review of 21 placebo-controlled trials found "only very low quality evidence" for any hangover product. We tested 12 of the most popular supplements against the published clinical literature. Three actually contain ingredients at doses backed by peer-reviewed human or robust animal evidence. The other nine are underdosed, unproven, or both. Here's the breakdown.
```

**2. Comparison table** (top, before first H2):
```markdown
| # | Product | DHM Dose | Price | Per Serving | Rating | Score |
|---|---------|----------|-------|-------------|--------|-------|
| 1 | [No Days Wasted DHM Detox](/reviews) | 1000mg | $24.64 | $1.64 | 4.3 (359) | 9.5 |
| 2 | [Double Wood DHM](/reviews) | 1000mg | $19.95 | $0.66 | 4.4 (1,145) | 9.2 |
... (7 rows)
```

**3. Existing "How We Evaluated" section** — KEEP

**4. NEW H2: "Why Most Hangover Supplements Fail"** (~250 words)
- Cite 2022 systematic review (no PMC; cite Verster 2025 SAGE if available)
- Cite Skotnicová 2020 negative result [PMC8603706]
- Frame: honest expectations, why DHM stands out

**5. Existing "Science Behind Hangovers" section** — KEEP, refresh citations:
- Replace `[Liver protection](https://pmc.ncbi.nlm.nih.gov/articles/PMC4082193/)` → `[Liver protection](https://pmc.ncbi.nlm.nih.gov/articles/PMC9905036/)` (milk thistle silymarin review)
- Add new citation for inflammation: `[Hangover-induced inflammation](https://pmc.ncbi.nlm.nih.gov/articles/PMC10481966/)` (Janilkarn-Urena 2023)

**6. NEW H2: "The 2024 Hovenia Human RCT — What Actually Got Measured"** (~300 words)
- Cite [PMC11675335](https://pmc.ncbi.nlm.nih.gov/articles/PMC11675335/) — n=25 crossover human trial
- Discuss: HD+Pueraria reduced GI hangover symptoms (p<0.05); lower BAC at 0.25/0.5h; faster acetaldehyde clearance at 6h
- Frame: "First peer-reviewed human RCT on Hovenia/DHM-class compounds with crossover design"
- Internal link: `/never-hungover/dhm-randomized-controlled-trials-2024`

**7. Existing "Top 20 Hangover Supplements" reviews** — CONDENSE from 20 to 12 (cut weakest 8: PartySmart, RU-21, Zaca patches, Survivor, Toast gummies, Liquid IV, Drinkwel, Rally — these are the lowest-evidence-rated and least-DHM-relevant):
- Keep DHM-focused: DHM Depot, Cheers, Morning Recovery, Flyby, No Days Wasted, More Labs, H-Proof, DHM Warehouse, AfterDrink, Life Happns, Purple Tree, Blowfish (12 total)
- Update USC reference (currently broken PMC4082193) → cite PMC7211127 (Silva 2020) for "USC follow-up"
- Update Hovenia reference (currently broken PMC8429066) → cite PMC7914479 (Sferrazza 2021)

**8. Existing "Ingredient Analysis Guide"** — KEEP, add new citations:
- Tier 1 DHM: link `[15+ studies](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033337/)` (He 2024 Hovenia ALD review)
- Tier 1 NAC: add link `[Strong antioxidant research](https://pmc.ncbi.nlm.nih.gov/articles/PMC6875727/)`
- Tier 1 Milk Thistle: link `[Liver protection](https://pmc.ncbi.nlm.nih.gov/articles/PMC9905036/)`

**9. Existing "Red Flags"** — KEEP

**10. Existing "Price Comparison"** — KEEP

**11. Existing "Buying Guide"** — KEEP, add internal links:
- Add link to `/compare` ("Use our compare tool")
- Add link to `/never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025`
- Add link to `/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025`

**12. NEW H2: "How DHM Stacks Up: Mechanism in 3 Sentences"** (~200 words)
- GABA-A: cite [PMC3292407](https://pmc.ncbi.nlm.nih.gov/articles/PMC3292407/) (already exists, keep)
- Liver enzymes: cite [PMC7211127](https://pmc.ncbi.nlm.nih.gov/articles/PMC7211127/) (NEW)
- ALDH2 / Asian flush: cite [PMC2680547](https://pmc.ncbi.nlm.nih.gov/articles/PMC2680547/) (NEW)
- Internal link: `/never-hungover/dhm-science-explained` (deep-dive)

**13. Existing "DHM Advantage" section** — KEEP, replace broken links:
- "USC Research (2020)" with PMC7211127 (replacing PMC4082193)
- "GABA Receptor Protection" already PMC3292407 (keep)
- Add: "Negative result honest disclosure" with PMC8603706 (already in body, but make explicit)

**14. NEW H2: "How to Use Hangover Supplements (Timing Matters)"** — bridge to existing buying guide
- Internal link: `/never-hungover/when-to-take-dhm-timing-guide-2025` (already exists, reinforce)
- Internal link: `/never-hungover/dhm-dosage-guide-2025` (already exists, reinforce)

**15. Existing "FAQs" section** — EXPAND from 5 → 15-17:
- New questions per research.md outline
- Each answer 30-100 words
- Each answer includes ≥1 inline link or citation where natural

**16. Existing "Final Recommendations"** — KEEP

**17. Existing "Conclusion"** — KEEP

**18. Existing "Disclaimer"** — KEEP

## Inline PubMed Citation Plan (Final State)

| # | PMC ID | Anchor in body | Status |
|---|---|---|---|
| 1 | PMC8603706 | "Dihydromyricetin (DHM)" / negative-result section | EXISTING — keep |
| 2 | PMC3292407 | "[GABA Receptor](...)" / "DHM Advantage" | EXISTING — keep |
| 3 | PMC7211127 | "USC Research (2020)" — REPLACES PMC4082193 | NEW |
| 4 | PMC9905036 | "Liver protection" milk thistle — REPLACES PMC4082193 | NEW |
| 5 | PMC7914479 | Hovenia Dulcis — REPLACES PMC8429066 | NEW |
| 6 | PMC11033337 | "15+ studies" DHM tier-1 | NEW |
| 7 | PMC10481966 | "Hangover-induced inflammation" / Tier 1 Janilkarn 2023 | NEW |
| 8 | PMC11675335 | "2024 Hovenia Human RCT" section | NEW |
| 9 | PMC2680547 | "ALDH2 deficiency" / Asian flush | NEW |
| 10 | PMC6875727 | "Strong antioxidant research" / NAC tier 1 | NEW (bonus) |

**Final count: 10 inline PubMed citations (2 existing valid + 8 new). Net new: 8.**

## Internal Link Plan (Final State)

Existing 9 (kept):
1. `/never-hungover/functional-medicine-hangover-prevention-2025` (cluster pillar)
2. `/guide`
3. `/reviews` (top recommendation)
4. `/never-hungover/dhm-vs-zbiotics-hangover-comparison`
5. `/never-hungover/dhm-vs-prickly-pear-hangover-prevention`
6. `/never-hungover/does-activated-charcoal-help-hangovers`
7. `/never-hungover/when-to-take-dhm-timing-guide-2025`
8. `/never-hungover/dhm-dosage-guide-2025`
9. `/reviews` (final CTA)

NEW (target +8):
10. `/never-hungover/dhm-randomized-controlled-trials-2024` (Hovenia RCT section)
11. `/never-hungover/dhm-science-explained` (mechanism section)
12. `/never-hungover/double-wood-vs-no-days-wasted-dhm-comparison-2025` (top-2 head-to-head)
13. `/never-hungover/dhm-vs-milk-thistle-which-liver-supplement-more-effective-2025` (buying guide)
14. `/never-hungover/nac-vs-dhm-which-antioxidant-better-liver-protection-2025` (buying guide)
15. `/compare` (compare tool)
16. `/never-hungover/is-dhm-safe-science-behind-side-effects-2025` (safety FAQ)
17. `/reviews` (comparison table rows)

**Final count: ~17 internal links** (well over 12 target).

## FAQ Expansion Plan

Existing 5 (kept verbatim):
1. Do hangover supplements actually work?
2. What is the best hangover supplement?
3. When should I take hangover pills?
4. Are hangover supplements safe?
5. How much DHM should a hangover supplement contain?

NEW (12 new = 17 total):
6. Are hangover supplements scientifically proven?
7. What's the difference between DHM and milk thistle?
8. Can I combine DHM with NAC and milk thistle?
9. Do hangover supplements work for tequila / wine / beer hangovers?
10. How is DHM different from ZBiotics?
11. Why don't activated charcoal pills work for hangovers?
12. Are hangover supplements FDA-approved?
13. What's the best hangover supplement for women?
14. Do hangover patches work as well as pills?
15. What's the cheapest effective hangover supplement?
16. Can I take hangover supplements every day?
17. Do hangover supplements work the morning after?

**Final count: 17 FAQ entries.**

## Schema Emission Flow (Existing Pipeline — Verified)

1. JSON post is read by `src/newblog/data/blogPosts.js` loader
2. Prerender script reads `dateModified` and emits in Article JSON-LD `dateModified` property (per Issue #286)
3. Prerender script reads `faq[]` and emits FAQPage JSON-LD (per Issue #289)
4. Markdown content rendered to HTML, including tables

**No code changes needed.** All four schema additions (title in `<title>` and `og:title`; `dateModified`; `quickAnswer` in QuickAnswer component or `description`; FAQPage from `faq[]`) flow through existing infrastructure.

## Risk Analysis

| Risk | Severity | Mitigation |
|---|---|---|
| Broken slug → loss of 504 PV | HIGH | Slug field locked, verified unchanged in tasks |
| FAQPage schema fails validation | LOW | Existing pipeline already emits FAQPage from posts with smaller `faq[]` arrays; we're just adding rows |
| Word count too high → bounce up | LOW | Target 3,500-4,000 (not 6,000+); content is structured with TOC |
| Title >65 chars | LOW | Chosen title is 51 chars; verify in tasks |
| Link rot to internal posts | LOW | All link targets pre-validated against `src/newblog/data/posts/` listing |
| Cite a PMC that's now retracted | LOW | All cited PMC IDs verified active by either Phase 1.5 WebFetch (3 verified broken excluded) or Issue #299 prior verification |
| Build fails | LOW | Pure JSON change; existing build pipeline tested daily |

## Rollback

Single PR revert (`git revert <merge-sha>`) restores prior post JSON. No migrations, no schema versioning, no cache invalidation. Vercel auto-redeploys on revert.

## Verification Approach

After implementation:
1. `npm run build` → exit 0
2. Word count: extract `content` field, count words → 3,500 ≤ N ≤ 4,000
3. FAQ count: `jq '.faq | length' post.json` → 15 ≤ N ≤ 17
4. Inline citation count: count occurrences of `pmc.ncbi.nlm.nih.gov/articles/PMC` in `content` → ≥8
5. Internal link count: count occurrences of `(/never-hungover/`, `(/guide`, `(/reviews`, `(/compare` in `content` → ≥12
6. Title char count: `jq -r '.title | length'` → ≤65
7. Broken PMC scan: grep for PMC4082193, PMC8429066, PMC8259720 → 0 results
8. Slug scan: `jq -r '.slug'` → matches existing slug exactly
9. dist HTML check: `grep -c '"@type":"FAQPage"' dist/.../index.html` → ≥1
10. dist HTML check: `grep -c '"dateModified":"2026-04-26"'` → ≥1
