# Compare DHM Supplements — Modernization Recommendations

- Route: `/compare`
- Source: see manifest
- Screenshots: `../screenshots/compare/`

## Compare page (/compare) — Modernization Recommendations

### The read: a hard-working tool wearing a 2021 costume
The Compare page is functionally strong (dense table, winner logic, orange CTAs, mobile-first ordering) but visually it screams "supplement-affiliate landing page." Three things do most of the damage:
- **Gradient green heading text** on a **three-hue green→white→blue page wash** (desktop-01) — the most dated signal on the page.
- A **green-on-green comparison table** with **seven different accent-colored row icons** (desktop-02) — the orange CTA, the one thing that should pop, is drowned out.
- A **full-bleed saturated-green "Category Winners" band** (desktop-02 / mobile-05) that directly fights the mandate "orange is the only saturated color."

The fix is the shared **Modern-Performance lane**: warm paper foundation, ONE saturated accent (orange), dense scannable table, border-first depth. None of this requires touching the affiliate mechanics.

---

### Prioritized moves (before → after)

**1. Warm paper + solid headings — S, CWV none**
- Before: `bg-gradient-to-br from-green-50 via-white to-blue-50` + `h1` gradient `bg-clip-text` + blue badge + floating green stat numbers.
- After: solid `--color-paper #FAF8F4`; `h1` solid `--color-ink` with one brand-green emphasis word; neutral chip; stat strip on a `max-w-6xl` grid with a hairline top rule.
- Why it converts: a calm ground makes orange CTAs the focal point. The design lead's "test this first" lift.

**2. De-noise the table — M, CWV low**
- Before: `from-green-700 to-green-800` header; yellow/green/blue/purple/indigo/orange/teal row icons; faint green winner text.
- After: solid-ink flat header; all row icons one muted ink-soft; warm zebra striping; right-aligned numerics; winner cell gets a green-soft `#ECF3EE` pill + bold brand value.
- Why it converts: one accent funnels the eye to the orange "Check Price" row; clearer winner = faster decision.

**3. Re-skin Category Winners — M, CWV low**
- Before: saturated `from-green-700 to-green-800` band, `bg-white/10` glass cards, multicolor icons.
- After: paper section, white cards with 1px warm border + green-soft header strip, desaturated icons. **Orange buttons untouched.**
- Why it converts: the three winner CTAs currently clash green-on-orange; on paper they pop.

**4. Border-first elevation — M, CWV none**
- Before: `shadow-lg`/`shadow-md` on the table, FAQ cards, matchup cards uniformly.
- After: FLAT matchup/FAQ cards on paper with 1px border; RAISED tier (two-layer warm shadow + border) only on the table wrapper and mobile product cards; unify radius to 8px. One depth cue per surface.

**5. Editorial type pairing (deferred) — L, CWV medium**
- Retire Georgia → self-hosted Fraunces (display) + Inter (text), variable subset woff2, preload Inter only, `size-adjust`/ascent overrides for zero CLS. Body to 17px. Ship as a **separate** experiment so font LCP/CLS risk doesn't confound move #1–#4.

**6. Tighten mobile flow — S, CWV low**
- The table is correctly `order-first` on mobile, but the giant hero stats render *after* it as scroll filler. Collapse the mobile hero to a one-line value prop + compact trust row. Mobile converts ~2.9x desktop — kill the filler between table and CTA.

**7. Motion discipline — S, CWV low**
- Replace the `delay: index*0.1` matchup stagger (feels slow) with one-shot `once:true` section reveals; add a count-up on hero trust stats; gate everything behind `prefers-reduced-motion`. CTAs stay stationary and instant.

**8. Selector as designed chips — S, CWV none**
- Restyle gray radio boxes into green-soft selected / paper+border unselected chips; surface each product's "Editor's Choice"/"Best Value" badge at selection time to nudge winner selection.

---

### Highest-value A/B variant
**`compare-calm-foundation-v1`** — primary metric **`affiliate_link_click`**.

Bundle moves #1–#4 into `Compare.modern.jsx` (flag-gated on `isLoading`). **Hold the orange CTA hue/size/copy and the Georgia/system type byte-identical to control**, so the test cleanly answers: *does a calm warm-paper foundation that makes orange the only saturated color lift affiliate CTR?* Defer the Fraunces/Inter swap to a follow-up experiment to avoid confounding aesthetics with font CWV risk. Reuse `trackAffiliateClick({ experimentKey, variant })`; secondary metrics: scroll depth and time-to-first-CTA-click.


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Warm paper foundation + solid ink headings (kill the gradient text)
- Detable the noise: single-accent comparison table with strong winner cue
- Re-skin 'Category Winners' from saturated-green band to paper section with tinted cards
- Border-first elevation system replacing shadow-on-everything
- Selector cards as designed chips, not gray radio boxes


**Top A/B pick (build first):** `compare-calm-foundation-v1` — Full-page Compare.modern.jsx variant (flag-gated on isLoading via useExperiment) bundling the four lowest-risk, highest-leverage aesthetic moves into one coherent 'calm paper' treatment: (1) warm paper #FAF8F4 background with solid-ink headings and gradient text removed, (2) the comparison table de-noised to a single muted-ink rubric with zebra striping, right-aligned numerics, and a green-soft #ECF3EE winner-cell pill, (3) the Category Winners band re-skinned from saturated green to paper + tinted-border cards, and (4) border-first elevation across matchup/FAQ/table surfaces. The orange CTA hue (bg-orange-500 hover:bg-orange-600), button size, and 'Check Price on Amazon' + 'Free Shipping' copy stay byte-for-byte identical to control; typography stays system/Georgia in v1. Fraunces/Inter type swap, mobile-flow reorder, selector chips, and motion changes are all deliberately deferred to separate follow-up experiments to avoid confounding the aesthetic CTR read.
- Primary metric: affiliate_link_click | Effort: M
- Why high value: It tests the single cleanest hypothesis: does making orange the ONLY saturated color on the page (calm neutral ground) raise affiliate CTR? Every bundled change pushes the same direction — removing competing green/blue/multi-icon hues so the orange CTAs gain salience — so the variant is coherent rather than a grab-bag. All four moves are color/border-only with zero new assets and no font load, so CWV/LCP/CLS risk is near-zero and the result is interpretable. It also removes the three most dated tells at once (gradient heading text, multi-hue wash, saturated-green winner band) for an aesthetic + trust lift the design lead flagged as 'test first'.


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Warm paper foundation + solid ink headings (kill the gradient text) | keep | True | Verified: page bg is gradient-to-br from-green-50 via-white to-blue-50 (L308), h1 is green bg-clip-text gradient (L323), badge is blue (L318), four stat numbers green (L335-348). This is the highest-leverage lowest-risk move and the anchor of the variant. Keep as-is. One nit: the 'emphasis word in brand green' on the h1 requires splitting the heading into spans — keep that trivial, do not over-tokenize. Add the new color values (paper #FAF8F4, ink #1A1D1A, border #E7E3DB) as @theme tokens in App.css per the v4 brief, not via tailwind.config.js. |
| Detable the noise: single-accent comparison table with strong winner cue | keep | True | Verified all claims: green-gradient header (L420), seven distinct icon hues (yellow/green/blue/purple/indigo/orange/teal across L441-661), zebra bg-gray-50 (L438 etc.), faint green winner text + tiny Crown (L449-451). This is the core of the variant and directly serves the primary metric — a single accent funnels the eye to the orange 'Check Price' row and the winner pill speeds time-to-decision. Keep. Constraint: the orange CTA row (L667-678) stays byte-for-byte identical. The winner pill is the green-soft #ECF3EE cell background behind the winning value — do not add motion to it. |
| Re-skin 'Category Winners' from saturated-green band to paper section with tinted cards | keep | True | Verified: full-bleed from-green-700 to-green-800 band (L903) with three bg-white/10 glass cards (L917/936/955) holding orange CTAs. This is genuinely the worst 'orange-on-saturated-green' clash on the page — demoting green to paper lifts the three high-intent winner CTAs. Keep, and keep the orange CTAs and copy untouched (L929 etc.). Note: this band only renders when 2+ products selected (L902); default is 3, so it shows by default — worth including in v1. |
| Border-first elevation system replacing shadow-on-everything | keep | True | Verified: matchup cards bg-gray-50 rounded-xl shadow-md (L1045), FAQ Cards carry default shadow, table wrapper shadow-lg (L415). Border-first depth is a real 'modern' tell and is cheap. Keep, but apply the lean version: swap shadow-* for 1px border + warm paper on FLAT surfaces, give only the table wrapper + mobile product cards the two-layer soft shadow. Do NOT introduce a formal 3-tier token abstraction in App.css for one page — use the elevation values inline/via cn() and let it harden into a token only if it's reused across pages. Unify radius to 8px on cards within this variant; keep chips rounded-full. |
| Editorial type pairing: Fraunces display + Inter text, self-hosted, zero-CLS | cut | True | Good idea, wrong experiment. The A/B concept itself explicitly and correctly DEFERS this to a separate follow-up to avoid confounding the calm-foundation aesthetic result with LCP/CLS variance — bundling it would make a clean color test un-interpretable. Cut from v1. Run it as its own isolated typography experiment (compare-type-pairing-v1) AFTER the foundation variant resolves, so the LCP/CLS delta is measured in isolation with font-display:optional as the fallback. |
| Tighten the mobile flow: remove orphaned hero stats below the table | simplify | True | Verified: table is order-first md:order-none (L405) so on mobile the hero stats (L333-350) + long subhead render AFTER the table as filler. Real and high-leverage on the 2.9x-converting mobile surface. BUT this is a different lever (information architecture) than the calm-foundation color test — folding it into compare-calm-foundation-v1 confounds the result. Simplify by splitting it OUT into its own small mobile-only experiment (compare-mobile-flow-v1). Leaner version: just collapse the four stats to a single horizontal scannable row and drop the long subhead on mobile; don't restructure the selector. |
| One-shot scroll reveals + stat count-up, drop decorative motion | simplify | True | Verified: per-row stagger delay: index*0.1 on matchup cards (L1040) does read sluggish, and Framer variants aren't currently behind prefers-reduced-motion. The reduced-motion compliance + dropping the stagger are worth keeping. Simplify by CUTTING the stat count-up gimmick (it's decorative polish that adds JS and risks layout shift on the trust numbers for ~zero conversion value) and keeping only: (1) replace per-row stagger with one once:true section reveal, (2) gate all motion behind prefers-reduced-motion. Not part of v1 — ship as a tiny separate cleanup, not flag-gated, since it has no conversion hypothesis. |
| Selector cards as designed chips, not gray radio boxes | keep | True | Verified: selector cards are p-4 border-2 rounded-lg gray boxes with a radio dot (L366-394), and product.badge ('Editor's Choice'/'Best Value') currently only appears in the table header, not at selection. Surfacing the badge at selection time is a legitimate conversion nudge toward winners. Keep, but as a SEPARATE small experiment (compare-selector-chips-v1) OR a non-tested polish — do NOT bundle into the calm-foundation color variant, because adding a winner-selection nudge is a behavioral change that would confound the pure-aesthetic CTR read. Align chip styling (green-soft #ECF3EE selected fill, 1px warm border) with the rest of the system. |


**Red flags:**
- CONFOUNDING (the main risk): the proposed v1 concept is clean, but four of the eight opportunities (typography swap, mobile-flow reorder, selector-chip winner nudge, motion/count-up) are DIFFERENT levers — keep them OUT of compare-calm-foundation-v1 or the CTR delta becomes uninterpretable. The selector-chip badge surfacing in particular is a behavioral conversion nudge, not aesthetics, and must not be bundled.
- CTA isolation: orange CTAs (bg-orange-500 hover:bg-orange-600, 'Check Price on Amazon', 'Free Shipping' pill, min-h-[48px]) must be byte-for-byte identical between control and variant (L669, L671-677, L929) — any drift voids the experiment.
- Z-index: the variant must not add transform/opacity/filter/backdrop-filter to any ancestor of header/main, and must not touch the critical custom z-scale (CLAUDE.md #14-16). Color/border swaps don't normally create stacking contexts, but verify no motion wrapper is added around structural elements.
- Tailwind v4: new color tokens (paper/ink/border/green-soft) MUST go in the App.css @theme block, NOT tailwind.config.js (silently ignored in v4 — CLAUDE.md #15). Smoke-test the built CSS for the new utility classes before relying on them.
- CLS/LCP: avoid Fraunces/Inter in v1 (deferred). Even the kept moves: confirm the h1 (LCP candidate) stays plain text and the winner-pill background doesn't shift cell width. Gate the whole variant on isLoading per the PostHog brief to prevent above-the-fold flicker.
- SEO: no content/heading-text changes in the kept set, so no ranking risk; ensure the .modern.jsx variant keeps the same useSEO(generatePageSEO('compare')) call and identical copy so crawlers see one canonical page.