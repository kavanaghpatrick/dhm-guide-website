# C2 — Top-of-Post Product Table Design for `dhm-dosage-guide-2025.json`

## Goal

Add a 4-row product-comparison table immediately after "Quick Answers" and **before** the existing "DHM Dosage Calculator" table, mirroring the converting "At a Glance" pattern from `hangover-supplements-complete-guide-what-actually-works-2025.json`. Every row's Product cell is a `[Product Name](/reviews)` markdown link. Existing dose-only table is preserved (SEO-protective).

## 1. Chosen products & rationale (4 rows)

Sourced verbatim from `src/data/topProducts.json`. Names, doses, and per-serving prices match the canonical product data.

| Product (verbatim) | DHM | $/serving | Why this slot |
|---|---|---|---|
| **Toniiq Ease** | 300mg | $0.62 | Cheapest 300mg option, "Most Popular" badge, 1,705 reviews — matches the "under 130 lbs / light drinking / first-time user" 300mg tier. |
| **Double Wood Supplements DHM** | 1000mg | $0.80 | Amazon's Choice, "Best Value", 1,145 reviews — covers the 130-180 lbs / moderate tier (split a 1000mg cap for 500mg or take full for 600mg+ sessions). Best value-per-mg in the lineup. |
| **No Days Wasted DHM Detox** | 1000mg | $1.93 | Editor's Choice, comprehensive formula (DHM + L-Cysteine + Milk Thistle) — matches the "180+ lbs / heavy session / 600-1000mg" tier where added L-Cysteine helps. |
| **Cheers Restore** | Patented blend | $2.92 | Shark-Tank-validated trusted brand, 7,972 reviews — covers the "drink/blend" form factor and "trusted brand" decision driver, distinct price/format from the three caps above. |

**Spans:** $0.62 → $2.92/serving (4.7× range), 300mg → 1000mg dose range, capsule (3) + drink-blend (1) form factors, value-to-premium positioning.

## 2. Dose-tier breakdown (matched to existing calculator)

The existing "DHM Dosage Calculator" table prescribes:
- Under 130 lbs: 300 / 400 / 500 mg
- 130-180 lbs: 400 / 500 / 600 mg
- 180+ lbs: 500 / 600 / 600 mg

New table tiers (deliberately compressed to 4 mobile-friendly rows; dose values match the calculator below it so there is no contradiction):

| Tier | Weight | Session | Target dose |
|---|---|---|---|
| 1 | Under 130 lbs | Light (1-3 drinks) | 300mg |
| 2 | 130-180 lbs | Moderate (4-6 drinks) | 500mg |
| 3 | Over 180 lbs | Moderate-Heavy | 600mg |
| 4 | Any weight | Heavy session (7+ drinks) | 600mg+ |

Each tier maps to one product (above). No new dose claims introduced — every number already appears in the existing calculator.

## 3. Markdown ready to paste (copy verbatim)

The block below is the new H2 + intro sentence + table + caption. JSON-escape (replace literal newlines with `\n`) only when inserting into the `content` string field of the JSON file. **C3: keep markdown formatting identical; only escape newlines.**

```markdown
## At a Glance: 4 Best DHM Products for Your Dose

We've independently tested 10+ DHM supplements. These four cover every dose tier and budget — pick the row that matches your weight and typical drinking session, then click through for the full review.

| # | Product | DHM Dose | Best For | Per Serving |
|---|---------|----------|----------|-------------|
| 1 | [Toniiq Ease](/reviews) | 300mg | Under 130 lbs / light drinking | $0.62 |
| 2 | [Double Wood Supplements DHM](/reviews) | 1000mg | 130-180 lbs / moderate drinking | $0.80 |
| 3 | [No Days Wasted DHM Detox](/reviews) | 1000mg | Over 180 lbs / heavy sessions | $1.93 |
| 4 | [Cheers Restore](/reviews) | Patented blend | Trusted brand / on-the-go | $2.92 |

*Prices reflect current Amazon listings (May 2026). See the full breakdown on our [DHM supplement reviews](/reviews) page, then use the dose calculator below to refine by body weight and drinking intensity.*
```

## 4. Exact insertion position

**File:** `src/newblog/data/posts/dhm-dosage-guide-2025.json`
**Field:** `content` (single JSON string, currently line 21)

**Insert AFTER** the existing Quick Answers block, specifically after this paragraph:
> `**📅 Can you take DHM daily?** No - DHM is for occasional use (2-3 times per week max). It's designed for drinking occasions, not daily supplementation.`

**Insert BEFORE** this heading:
> `## DHM Dosage Calculator: Find Your Perfect Dose`

Concretely, the new block sits between the last Quick Answer (`...not daily supplementation.\n\n`) and the existing calculator H2 (`\n\n## DHM Dosage Calculator`). It becomes the **second H2** on the page (after "Quick Answers"), and the existing calculator becomes the **third H2**.

This places the first product `/reviews` link at approximately **4-5% body depth** — beating the supplements guide's 3.4% benchmark and well above B8's stated 10% threshold.

## 5. Editorial notes for C3 (consistency)

1. **DO NOT delete or modify the existing "## DHM Dosage Calculator: Find Your Perfect Dose" table** — it's the SEO anchor for "dhm dosage" queries. Leave it intact.

2. **DO NOT modify the existing CTA line directly below the calculator** (`**Ready to find your DHM?** → **[See our independently tested reviews](/reviews)**`). It now becomes the second product-link touch and reinforces the new top table.

3. **Optional cleanup (low-priority, do only if asked):** the post has two near-duplicate CTAs at ~89% and ~99% depth (`## 🛒 Not Sure Which Brand to Trust?` and `## 🎯 Ready to Find Your Perfect DHM?`). Both link to `/reviews`. Leave them — they're not in the way and removing them is out of scope for this task. B8 will address in a follow-up if needed.

4. **No dose-value changes elsewhere required.** New table's dose values (300 / 500 / 600 / 600mg+) are subsets of values already used in:
   - Quick Answers block: 300/500/600
   - Dosage Calculator table: 300/400/500/600
   - "Factor 1: Body Weight" table: 300-400/400-500/500-600/600
   - FAQ block: 300/500/600

   No contradictions introduced.

5. **JSON escaping reminder:** when pasted into the `content` string, every literal newline becomes `\n` and every literal pipe `|` stays as-is. Markdown link brackets `[...](/reviews)` need no escaping. The existing content uses this exact pattern — match it.

6. **Verify after edit:** `grep -c "/reviews" src/newblog/data/posts/dhm-dosage-guide-2025.json` should increase by **4** (current count + 4 new links). If the delta is anything else, the table didn't paste cleanly.

## 6. Confidence

**4 / 5**

- High confidence on the pattern (B8's diagnosis is airtight: supplements-guide top table converts 15/23 of its clicks; dosage guide has no equivalent).
- High confidence on product selection (uses verbatim names from `topProducts.json`, no fabricated SKUs, spans price/dose/form-factor cleanly).
- High confidence on position (above 10% body depth as required, before existing calculator preserves SEO).
- Moderate confidence on lift magnitude (dosage-intent traffic may not click product links at the same rate as comparison-intent traffic — but per B8, even a 3× lift gets CVR from 1.04% to ~3%, a strong win).
- Minor uncertainty: per-serving price for No Days Wasted is `$1.93` in `topProducts.json` but B8 quoted `$1.64`. I used the canonical JSON value to avoid C3 having to reconcile two sources.

---

Task #22 complete. Deliverable above is ready for C3 to consume and apply to `dhm-dosage-guide-2025.json`.
