# Modern Variant Visual Audit — Synthesized Fix List (2026-06-25)

**Scope:** Deployed modern A/B variant across Home, /reviews, /guide, /research, /compare, /never-hungover (desktop + mobile). De-duplicated from 9 auditors (many independently flagged the same comparison-table, head-to-head-card, and green-header issues).

## Executive Summary

The modern layout is design-system-coherent within each page, but three bug-classes — confirmed against source and screenshots — must be fixed before the experiment can measure *design* rather than *defects*:

1. **Content/data contradictions** on the highest-intent surfaces: two per-serving prices on one card, a bare "4" rating, "Best value indicator" under all columns, prose in a numeric DHM column, 35/197 garbled blog read-times, a placeholder author on the flagship clinical trial.
2. **A critical mobile conversion breakage**: the /reviews quick-comparison table clips Rating/DHM/Price **and the Amazon CTA** off-screen with no scroll cue.
3. **A repeated shared-component inconsistency**: head-to-head cards float the chart icon above wrapping titles (owner issue #2), on both /reviews and /compare.

Crosscutting: the shared legacy header shows a saturated **green CTA** above every modern page, contradicting the variant's "orange is the one conversion color" thesis. Most high-value fixes are tiny (data edits, `.toFixed(1)`, one conditional, swapping a wrapping flex class).

---

## CRITICAL

- **#1 — Mobile /reviews table hides Rating/DHM/Price + Amazon CTA off-screen** (`ComparisonTableModern.jsx` + `theme-modern.css` .compare/.product-cell). 5-col table in `overflow-x:auto` with `white-space:nowrap` product cells; on 390px only the Product column shows, no scroll affordance. **Fix:** stacked per-product card layout below ~640px (reuse Compare.modern's `lg:hidden` cards) with a full-width orange CTA per card. *Confirmed in reviews/mobile-01.png.*

## HIGH

- **#2 — "Best value indicator" hardcoded under all Value columns** (owner #1) — `Compare.modern.jsx:580` & `:793`. Gate the caption on `isWinner`.
- **#3 — Head-to-head icon jumps above wrapping titles** (owner #2) — `Reviews.modern.jsx:313` + `Compare.modern.jsx:1049`, root cause `.cluster` (flex-wrap) at `theme-modern.css:469`. Use `flex:0 0 auto` icon + non-wrapping flex; apply to both files. *Confirmed in reviews/desktop-04.png.*
- **#4 — Cheers rating renders bare "4"** — `ProductCardModern.jsx:91` + `ComparisonTableModern` rating cell. `Number(rating).toFixed(1)`.
- **#5 — Double Wood card shows $0.80 and $0.66 per serving** — stale pro string `topProducts.json` id 2.
- **#6 — Blog read-time renders prose ("Estimated 30-40 minutes min read")** — `NewBlogListing.modern.jsx:464/558`; 35/197 non-integer. Render guard + data cleanup.
- **#7 — DHM column mixes "1000mg" with prose** ("Most DHM per dose", "DHM + Milk Thistle Blend") — `topProducts.json` (Cheers, Good Morning) + sort logic `Reviews.modern.jsx:107-111`.
- **#8 — Placeholder author "Research Team (2024)" on the only human RCT** — `research-studies.js:195`.
- **#9 — Top ~21 blog cards text-only, rest imaged** — `NewBlogListing.modern.jsx:528` or post image data. Backfill images or branded placeholder.
- **#10 — Participants/Duration use .stat styling for prose values** — `Research.modern.jsx:578-587`. Use a plain label:value meta pair.
- **#11 — Shared header green CTA above every modern page** — `Layout.jsx` (gate on modern flag). A/B-owner decision.
- **#12 — Reviews winner emphasis bound to `index===0`** — sort/filter moves Editor's Pick — `Reviews.modern.jsx:283`. Bind to a stable product property.
- **#13 — Two unrelated comparison-table designs** (light brand-soft vs black-header) — `ComparisonTableModern.jsx` vs `Compare.modern.jsx:506/513`. Drop the black-header override.

## MEDIUM

- **#14 — Guide hero accents a full 4-word phrase green** vs one-word discipline — `Guide.modern.jsx:125-130`.
- **#15 — Guide before/after hero pair: disc bullets vs check icons + borderless vs bordered card** — `Guide.modern.jsx:172-177, 180-183`.
- **#16 — Guide scenario/mechanism icons mid-height on wrapping mobile titles** (.cluster family) — `Guide.modern.jsx:373/405/430`.
- **#17 — Hero "12 min average read" contradicts 18-35 min cards** — `NewBlogListing.modern.jsx:206-208`.
- **#18 — Unstandardized blog author byline** (3+ variants) — `posts/*.json`.
- **#19 — Significance callout is green-on-green body copy** — `Research.modern.jsx:632-633`.
- **#20 — Compare hero stats cramped 2x2 on desktop** — `Compare.modern.jsx:382`.
- **#21 — Overall Score crown keyed off effectivenessScore but cell shows product.score** — `Compare.modern.jsx:528 vs 533`.
- **#22 — DHM tie (1000=1000) arbitrarily crowns one** — `Compare.modern.jsx` getWinner 302-321.
- **#23 — Compare header truncates names to 3 words** (drops "DHM Detox") — `Compare.modern.jsx:517`.
- **#24 — Global mobile sticky bar = 2nd orange CTA + overlaps last card** — global component + page CTA.
- **#25 — Reviews sort `<select>` keeps OS chevron; Best-For pills wrap raggedly on mobile** — `Reviews.modern.jsx:199-254`.
- **#26 — Home "How it protects you" eyebrow overridden grey** — `Home.modern.jsx:144` (delete inline style).
- **#27 — Winner card stacks 3 orange elements** — `ProductCardModern.jsx:44-50, 62`.
- **#28 — Pros/cons truncation drops the deciding con + uneven heights** — `ProductCardModern.jsx:38-39` + data curation.

## LOW

- **#29 — "Price" header is actually per-serving** — `ComparisonTableModern` header → "Price / serving".
- **#30 — Table rating uses hollow outline star** vs filled gold on cards — `ComparisonTableModern` rating cell.
- **#31 — Compare orange winner-edge on a non-CTA + hardcoded star gold** — `theme-modern.css:811` (→ green) + add `--color-star`.
- **#32 — Compare/Research stat clusters put words in big numeric .stat-value** — `Compare.modern.jsx:386-398`.
- **#33 — Mixed secondary-button affordances + hero 4-star icons for a 4.4 label** — `Home.modern.jsx:91, 104`.
- **#34 — Guide final-CTA "Free shipping/returns" on a non-commerce page + repeated proof copy** — `Guide.modern.jsx:732-742`.
- **#35 — Polish batch** (trust-row label drift, link-dense Guide hero, James in-byline blue link, divergent Research CTA-bands, unstyled "+N more", mobile trust-row dividers) — Guide/Research/NewBlogListing/theme-modern.css.

---

### Quick Wins (cheap + high-impact)
`.toFixed(1)` rating fix (kills the bare "4" on cards + table) · fix one Double Wood pro string · wrap "Best value indicator" in `isWinner` (2 edits) · "Price" → "Price / serving" header · delete the Home eyebrow inline grey · replace the Research placeholder author · normalize the two prose DHM values · 1-line readTime render guard.