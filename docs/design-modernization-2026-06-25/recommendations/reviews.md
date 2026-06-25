# Best DHM Supplements (Reviews) — Modernization Recommendations

- Route: `/reviews`
- Source: see manifest
- Screenshots: `../screenshots/reviews/`

## /reviews — Modernization Recommendations

**Page role:** highest-intent, highest-converting surface (Modern-Performance / dense decision-tool lane). The whole game here is speed-to-decision and affiliate CTR, so every move below isolates the trust/aesthetic uplift from anything that touches the orange CTA, table density, or winner emphasis.

### What feels dated (grounded in the frames)
- **Gradient green heading text** on the H1 (desktop-01, mobile-02) — the single most 2021 tell.
- **Green-tinted page background** + green stat numbers — the "green everywhere" supplement-affiliate look.
- **Comparison table** (desktop-01): solid green-700 header and an *identical orange button in every row* — a column of ~10 orange CTAs destroys the salience of the one protected accent.
- **Card monotony** (desktop-02→05): every non-winner card is white + green-100 border + the same soft shadow.
- **System/Georgia typography** with no editorial voice.
- **Cons as hollow red circles** (desktop-02/03, mobile-03) read like empty checkboxes; blue "Best For" box adds a third competing hue.

### What already works — PROTECT IT
- Orange **winner-card emphasis** (desktop-02 #1 card: orange border + orange-50 tint) correctly draws the eye.
- Dense scannable table, **mobile table-first ordering**, **mobile sticky bottom CTA** (mobile-01), per-card orange CTA + Free Shipping pill, trust microcopy.

---

### Prioritized moves (before → after)

**1. Warm-paper foundation + solid ink headings (M, CWV none)**
Before: `bg-gradient-to-br from-green-50 via-white to-blue-50` page + gradient-clip green H1.
After: flat `--color-paper #FAF8F4` page, solid `--color-ink` H1 (optional one green emphasis word), stat numbers in ink. → Premium/credible instead of deal-site; calmer field makes the orange CTA *more* salient. Highest leverage, near-zero CTR risk.

**2. De-orange the comparison table (M, CWV low)**
Before: green-700 header, orange filled button in every row.
After: neutral ink/paper header + hairline border + zebra striping in paper, right-aligned Price/Score; **only the #1 winner row keeps the filled orange button**, other rows become compact `Check Price →` outline/text links. → Concentrates the single accent on the recommended (highest-converting) pick. This is the variant that most needs a clean A/B read — isolate it.

**3. Border-first 3-tier elevation (M, CWV none)**
Before: every card = white + green-100 border + soft shadow.
After: non-winner cards sit flat on paper with a 1px warm border, shadow only on hover; winner card keeps its orange tint + shadow as the single raised surface. Same treatment for the head-to-head cards (desktop-06). → Depth signals hierarchy, not decoration; reinforces the winner.

**4. Self-hosted editorial type — Fraunces display + Inter text (L, CWV medium)**
Add `--font-display`/`--font-sans` `@theme` tokens, self-host subset variable woff2 (~80–140KB). Body → 17px/1.6. **Mandatory zero-CLS hygiene:** preload only the text font, `size-adjust`/ascent/descent overrides + metric-matched fallback; if Fraunces regresses hero LCP, set display to `font-display: optional`. → Editorial credibility; the risk is technical (CLS/LCP), not behavioral. **Test separately** from move 1–3 so font CLS never contaminates the foundation read.

**5. Fix cons affordance + calm the accent hues (S, CWV none)**
Hollow red circles → Lucide `Minus`/`MinusCircle` in slightly desaturated red (honest minuses, not empty checkboxes). Convert the blue "Best For" box → `--color-brand-soft #ECF3EE` chip with hairline border; reserve blue for inline science links only. → Honest-looking cons *raise* review credibility → conversion.

**6. Spacing rhythm + radius cleanup (M, CWV low)**
Standardize section padding `py-20`/`py-12`, card padding `p-6`/`p-5`; `--radius` 10px → 8px (chips stay `rounded-full`); constrain intro copy to ~66ch. → "Designed," not assembled.

**7. One-shot reveals + stat count-up; no looping motion near CTA (S, CWV low)**
Keep `once:true` reveals (gate all behind `prefers-reduced-motion`); add a count-up on 20+/5000+/6 trust stats. Audit that no shimmer/float/pulse-glow touches the orange CTA — it must paint instantly and stay stationary; mobile sticky bar slides up once.

---

### Highest-value A/B variant

**`reviews-modern-foundation-v1`** — *Reviews — Warm Editorial Decision Tool*
Full-page `Reviews.modern.jsx` via `useExperiment('reviews-modern-foundation-v1')`, gated on `isLoading`. Bundles moves **1 + 2 + 3** (warm paper foundation, solid headings, border-first elevation, de-orange table with winner-only orange button). **Keeps orange CTA hue/size/copy, winner emphasis, table density, and mobile sticky bar identical to control** for a clean read. **Excludes** the web-font swap (ship that as `reviews-editorial-type-v1` after zero-CLS metrics are verified).
**Primary metric:** `affiliate_link_click` rate. **Secondary:** scroll depth, time-on-page, click share to the #1 product.
**Hypothesis:** a calmer warm-neutral foundation that concentrates the single orange accent on the recommended product raises perceived credibility and CTA salience, holding or lifting affiliate CTR while improving scroll depth.

**Build order:** (1) `reviews-modern-foundation-v1` first — biggest perceived-modern jump, lowest CWV risk, cleanest read. (2) `reviews-editorial-type-v1` second — gated on verified zero-CLS @font-face. (3) Moves 5–7 fold into the winning foundation variant.


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Warm-paper foundation + solid ink headings (page bg line 167, H1 line 179, stats lines 192/197/201)
- De-orange the comparison table so only the winner row keeps the filled orange button (InlineComparisonTable Action column + mobile price-cell pill) — gated to the Reviews placement
- Border-first review-card elevation keeping the winner card as the only tinted/raised surface (line 442 ternary)
- Fix cons affordance + demote blue Best For box (line 578 hollow circle → Lucide minus; lines 590-595 blue → green-soft) — separate small experiment
- Constrain editorial intro copy to ~66ch (the only safe slice of the spacing proposal; line 183) + stat count-up gated behind prefers-reduced-motion


**Top A/B pick (build first):** `reviews-modern-foundation-v1` — Full-page Reviews.modern.jsx rendered via useExperiment('reviews-modern-foundation-v1'), gated on isLoading to prevent above-the-fold flicker, bundling the three lowest-risk highest-trust moves: (1) warm paper #FAF8F4 page foundation replacing the green/blue gradient bg; (2) solid ink H1 + ink stats replacing the green gradient-clip headings; (3) border-first review-card elevation keeping the #1 winner card as the only tinted/shadowed surface; (4) de-orange the comparison table (gated to this placement) so only the winner row keeps a filled orange button, with neutral header and right-aligned numerics. CTA hue/size/copy, winner emphasis, table density, and the mobile sticky bar stay IDENTICAL to control. Deliberately EXCLUDES the web-font swap (own later experiment) so font CLS never contaminates the aesthetic/trust read.
- Primary metric: affiliate_link_click | Effort: M
- Why high value: It packages exactly the changes I verified as buildable-with-no-CWV-risk into one clean, isolated variant against an untouched control, and it targets the page's two biggest 'supplement-affiliate' tells confirmed in the source: green-as-background-fill and a column of repeated orange buttons. By calming the neutral base and concentrating the single orange accent on the recommended product, it should raise perceived credibility AND CTA salience together — a hold-or-lift on the primary conversion metric with upside on scroll depth. Correctly fences out the only medium-risk item (web fonts).


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Warm-paper foundation + solid ink headings (retire green gradient bg and gradient heading text) | keep | True | Highest-leverage, lowest-risk modernization move and verified buildable: swap line 167 to a flat paper surface, line 179 H1 from gradient-clip to solid ink, stats from green-700 to ink with a small accent. Add the paper/ink colors as @theme tokens in src/App.css (NOT tailwind.config.js — v4 ignores it). Keep orange CTA and amber winner emphasis untouched. This is the spine of the v1 bundle. |
| De-orange the comparison table: neutral header + restrain row CTAs so only the winner row keeps the filled orange button | keep | True | Confirmed: the live table renders a saturated orange Check Price button in EVERY row (Action column + the mobile price-cell pill), which directly violates the single-orange-accent discipline. Winner row already has bg-amber-50 (line 107), so concentrating orange there is consistent. IMPORTANT: this component is shared with other pages (dosage/supplements guides) and the docstring claims byte-identical DOM — gate the restyle to the Reviews placement (e.g. a variant/placement prop) so other pages and the clean A/B read aren't contaminated. This is the variant most needing an isolated conversion read: monitor lower-row affiliate_link_click, not just the winner. |
| Border-first 3-tier elevation; keep winner card as the only tinted+raised surface | keep | True | Verified card monotony: non-winner cards are bg-white border-green-100 hover:shadow-lg; winner is border-2 border-orange-400 bg-orange-50 ring-1 shadow-md. Border-first non-winners + reserving tint/shadow for the winner reinforces the recommended pick at near-zero risk. Skip the head-to-head comparison-card half (lines 730-733) from v1 — those are below the fold and not load-bearing for conversion; fold them in later only if the foundation wins. Leaner = just the review-card line 442 ternary. |
| Self-hosted editorial type pairing (Fraunces display + Inter text) with zero-CLS @font-face metrics | simplify | True | Good lever (typography is the brief's #1 modernization weakness) but proposed too heavy AND correctly excluded from the foundation bundle by the concept itself. Simplify to a separate, later experiment (reviews-editorial-type-v1): test ONE display serif on H1/H2 only with font-display:optional first (zero LCP risk, no preload), keep Inter/body deferred. Do not block the foundation read on font CLS. Two-font + preload + size-adjust/ascent/descent overrides is the right hygiene IF it ships, but it is L-effort and must never ride in v1. |
| Fix cons affordance + soften pro/con and Best For colors (minus glyph, calm tints, demote blue) | keep | True | Verified: cons use an ambiguous w-4 h-4 border-2 border-red-600 rounded-full hollow circle that reads like an empty checkbox; Best For is a blue-50 box acting as a third brand hue against green+orange. A clear minus glyph plus demoting blue to inline science links only enforces the single-accent discipline and raises review credibility. S-effort, no conversion risk — strong candidate but test SEPARATELY from the foundation bundle (it is not part of reviews-modern-foundation-v1) to keep each read clean. |
| Standardize spacing rhythm and tighten radii to a calmer editorial scale | simplify | True | Mixed bag. The radius/padding renumber is the over-engineered part: --radius is a shared @theme token, so changing it bleeds off /reviews and breaks isolation for a clean A/B read. Cut the global token edits. Keep only the cheap, page-local win: constrain the editorial intro copy to ~66ch (line 183 paragraph) while keeping table/cards at max-w-6xl — that improves scannability with zero global blast radius. Defer the rest to a design-system pass, not a page experiment. |
| One-shot scroll reveals + stat count-up; remove looping motion near CTA | simplify | True | Two of three items are already done or trivial: reveals are already once:true; the 'audit no shimmer/float touches the orange CTA' is a verification chore, not a build (no looping keyframe is currently on the CTA per the source). Keep only the small count-up on the 20+/5000+/6 stats (lines 192-201) gated behind prefers-reduced-motion, as a tiny standalone polish — NOT in the foundation bundle. The reduced-motion universal gate is good hygiene to apply opportunistically. Low priority overall. |


**Red flags:**
- Isolation/contamination: InlineComparisonTable.jsx is SHARED across pages and its docstring claims byte-identical DOM. De-orange MUST be gated to the Reviews placement (variant/placement prop), or you dirty other pages and break the clean A/B read.
- CLS/LCP: keep the web-font swap OUT of v1 (correctly excluded). It is the only medium-risk item — no web fonts load today, so any added font is the page's biggest CLS/LCP exposure on an SEO-sensitive page. Test it separately with font-display:optional.
- Global token blast radius (Pattern #16): do NOT renumber the shared --radius token or other @theme tokens for a single-page experiment — it bleeds off /reviews and breaks variant isolation. Define NEW paper/ink tokens in src/App.css @theme (v4 ignores tailwind.config.js) rather than editing shared ones.
- Z-index: the page relies on the custom z-scale (mobile sticky top z-30 line 367, sticky recommendation bar z-40 line 817). Background/card restyles must not introduce transform/opacity/filter on ancestors that create new stacking contexts (Pattern #14).
- Conversion read: de-orange the table could shift clicks toward the #1 winner and away from lower rows — instrument and watch per-row affiliate_link_click (component_id rollup), not just total, before declaring a win.
- Flicker: gate the full-page Reviews.modern.jsx swap on isLoading from useExperiment, or the above-the-fold paper/ink foundation will flash control colors first.