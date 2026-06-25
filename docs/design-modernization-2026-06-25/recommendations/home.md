# Homepage — Modernization Recommendations

- Route: `/`
- Source: see manifest
- Screenshots: `../screenshots/home/`

## Homepage (/) — Modernization Plan

**Read of the current page (grounded in frames):** Competent, converting, but dated in five concrete ways — Georgia + gradient-fill headings (desktop-01/02/03), an off-palette gradient rainbow (green→blue desktop-03, purple→blue desktop-05/06, multicolor stats desktop-06), shadow-on-every-card monotony (desktop-02/04/05), a stark gray→white base, and a heritage parallax that visibly **fails to load on mobile** (mobile-05). The conversion layer (orange Amazon CTAs desktop-05, mobile sticky bar mobile-01) is healthy and must be left untouched.

**Guiding lane:** Warm-Premium-Wellness (per design lead) — emotional trust and brand warmth before the CTA.

---

### Prioritized moves (before → after)

**1. Editorial type system (M, CWV: medium, A/B ✓)**
- Before: every heading is Georgia; "Hungover Again" (L180-182) and "Modern Science Proved" (L623-625) use green/amber gradient-fill text.
- After: self-hosted Fraunces (display) + Inter (text), 17px body. All headings solid `--color-ink`, optional one accent word in solid brand. Preload Inter only; Fraunces `font-display:optional` so hero LCP never blocks.
- Why: typography is the #1 lever; gradient text is a 2021 tell.

**2. Warm paper foundation + demote green (M, CWV: low, A/B ✓)**
- Before: hero on `from-gray-50 to-white` (L128); green-50/blue-50 washes everywhere.
- After: `--color-paper #FAF8F4` base; green → brand mark + trust chips only; **orange CTAs unchanged**. Calm base makes orange pop harder.

**3. Recolor the 3 off-palette gradient bands + monochrome stats (S, CWV: none, A/B ✓)**
- Before: green→blue "Dual-Pathway" (L553), purple→blue CTA + indigo testimonial (desktop-05/06), 4-color stat row (desktop-06).
- After: one solid `--color-brand-strong` surface; stats in solid ink with one accent. Orange becomes the only saturated color on the page.

**4. Border-first elevation (M, CWV: none, A/B ✓)**
- Before: white/white-80 `rounded-2xl` + soft shadow on nearly every block (six identical benefit cards desktop-04).
- After: flat content cards (1px `--color-border`, no shadow); raised product cards keep a warm two-layer shadow + hover lift; overlay shadow only on modals/sticky bar. Unify radius to 8px / `rounded-full` chips.

**5. Kill the heritage parallax — fixes the mobile bug (S, CWV: low, A/B ✓)**
- Before: `useScroll`/`useTransform` parallax (L57-59, L577-598); **"Image failed to load" on mobile (mobile-05)**.
- After: static paper/brand-soft section, normal lazy `<img>`, one-shot reveal. Removes a trust-eroding defect on a credibility section.

**6. De-emoji headline/badges/CTAs (S, CWV: none, A/B ✓)**
- Before: "🚀 Stop Your Next Hangover" (L229), "🛡️ Find Best Supplements" (L242), "🧬"/"⚡" badges.
- After: Lucide icons where meaningful (already imported), none where decorative. Reads science-desk, not deal-blog.

**7. Spacing rhythm + reading measure (M, CWV: low, A/B ✓)**
- Before: ad-hoc `pt-8 pb-16 / py-16 / py-20 / py-32`; wiki-wide science prose.
- After: `py-20` / `py-12` sections, `p-6` / `p-5` cards; science prose `max-w-3xl` (~66ch), grids `max-w-6xl`.

**8. One-shot stat count-up (S, CWV: none, A/B ✓)**
- 350K+, 4.4/5, 92% animate once on view (reduced-motion gated). Cheap credibility polish for the Warm-Premium lane.

---

### Highest-value A/B variant
**`homepage-editorial-refresh-v1`** — a full `Home.modern.jsx` (gated on `isLoading`, no above-fold flicker) bundling moves 1-8 while keeping orange CTAs, copy, size, destinations, and the mobile sticky bar **byte-for-byte identical to control**. This isolates the question "does an editorial, warm, credible frame hold or raise affiliate CTR?" — the core bet for this page.
- **Primary metric:** `affiliate_link_click` (rate).
- **Secondary:** scroll-depth milestones, time-on-page, `/reviews` funnel step.
- **Guardrails honored:** Tailwind v4 `@theme` tokens only, no z-index changes (Patterns #14-16), LCP protected via Inter-only preload + Fraunces `font-display:optional`, CLS protected via `size-adjust`/ascent-override metric overrides, removes (not adds) main-thread parallax work.
- **Sequencing note:** if a cleaner read on each lever is wanted, ship move 2 (warm paper, near-zero CTR risk) as `homepage-warm-foundation-v1` first, then layer typography — but the bundled variant is the highest-value single test.


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Warm paper foundation + demote green to accent (the conversion-salience backbone; orange CTA pops against calm paper)
- Recolor the three off-palette gradient bands + monochrome stats to one brand surface (kills the template look, protects orange-is-conversion)
- Flatten the four gradient-fill headings to solid ink (highest-value, near-zero-risk half of the typography opportunity)
- Delete the heritage parallax for a static section (a deletion that also fixes the documented mobile broken-image bug)
- Strip decorative emoji from headline/badges/CTA labels (cheap deal-blog-to-science-desk cleanup)
- Border-first elevation: flat content cards vs raised product cards (separates read-this from click-this)


**Top A/B pick (build first):** `homepage-editorial-refresh-v1` — Full-page Home.modern.jsx variant behind useExperiment('homepage-editorial-refresh-v1'), rendered only after isLoading resolves to avoid above-fold flicker. Bundles the SIMPLIFIED, deletion-heavy refresh: warm paper foundation (#FAF8F4) replacing the gray/white hero and the green/blue section washes; the four gradient-fill headings flattened to solid --color-ink (one optional brand accent word); the three off-palette gradient bands (green->blue, purple->blue, indigo) recolored to one brand surface with monochrome stats; one display serif on h1/h2/h3 via font-display:optional with the EXISTING system sans kept for body (no self-hosted Inter, no hand-rolled metric overrides); border-first elevation (flat content cards, raised product cards); heritage parallax deleted for a static section (also fixes the mobile broken-image bug); decorative emoji stripped. Orange product CTAs and the mobile sticky Check-Price bar are byte-for-byte identical to control so any conversion delta is attributable to the frame, not the button. CUTS the stat count-up (adds motion that fights the calmer tone and confounds attribution) and defers global spacing-rhythm normalization to a non-experiment polish pass.
- Primary metric: affiliate_link_click | Effort: M
- Why high value: This is THE modernization bet for the homepage and the brief's stated top lever (typography) plus the dominant 2026 warm-premium move (paper base), bundled into one clean control-vs-variant test that leaves the conversion mechanism untouched. It isolates the core question 'does a credible editorial frame raise or hold affiliate CTR?' Because the orange CTAs are identical to control, affiliate_link_click delta is attributable to the frame alone. It is also low-risk: most of the change is deletion (parallax, gradient text, emoji, shadow-on-every-card) or pure CSS token swaps, and the one CWV-sensitive addition (a web font) is gated to font-display:optional so it can never block LCP or shift layout. The mechanism already exists in production (useExperiment + Home.modern.jsx pattern + trackAffiliateClick with experimentKey/variant), so no new framework is introduced.


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Adopt the editorial type system: Fraunces display + Inter text, kill all gradient-fill headings | simplify | True | The flatten-the-gradient-headings half is the highest-value, near-zero-risk move and is buildable today (swap the 4 gradient-fill spans at L180-182 + L623-625 for solid --color-ink with one optional brand accent word). Ship that unconditionally. For the fonts: do ONE display serif (Fraunces Variable, font-display:optional so it never blocks/shifts) on h1/h2/h3 only, and KEEP the existing system sans for body rather than self-hosting Inter too. System sans already passes CWV and the body is not where the dated signal lives. Drop the hand-rolled @font-face metric-override block; font-display:optional plus a system-sans fallback that never paints the wrong font avoids CLS without it. This cuts the change roughly in half while capturing ~90% of the perceived-premium lift. |
| Warm paper foundation + demote green from fill to accent | keep | True | Strongest single aesthetic lever for the conversion thesis: a calm warm-neutral base makes the lone orange Check-Price CTA the only saturated color, which should hold or raise affiliate salience. Add the 5 @theme tokens (paper/surface/ink/ink-soft/border) and swap the hero gradient + the three section washes to solid paper or a paper to brand-soft wash. Keep green as brand mark + trust chips and orange CTAs byte-for-byte. This is the backbone of the bundled variant. |
| Replace the three off-palette gradient bands with on-brand surfaces | keep | True | Confirmed against screenshots: desktop-03 green to blue banner, desktop-05 indigo testimonial card + rainbow stat row. Smallest-effort, highest-coherence win. Recolor all three two-hue bands to one --color-brand-strong surface and make the stat numbers monochrome ink with a single brand accent. This is what stops the page reading template, and it protects the orange-is-conversion signal. Pairs naturally with the paper foundation; ship together. |
| Border-first elevation: retire shadow-on-every-card | simplify | True | Good modern depth cue and it functionally separates read-this (flat) from click-this (raised product cards), which supports CTR. Simplify the bookkeeping: skip the formal 3-tier @theme elevation set and the global radius re-unification (rounded-3xl/2xl/xl audit touches many components and risks scope creep). Just do the two concrete swaps that carry the signal: flat 1px-border on the content cards, keep shadow + border + hover lift on the product cards. Defer radius unification to a later cleanup; it is polish, not the modernization bet. |
| Replace the heritage parallax with a static confident section (fixes the mobile load bug) | keep | True | Best simplicity-rule fit on the list: it is a deletion that fixes a real mobile bug AND removes a 2021 parallax tell. Render the heritage story as a static paper/brand-soft section with the image as a normal lazy <img> (or drop the image). Keep a single one-shot whileInView reveal. Low risk, clear engagement/trust upside. Include in the bundled variant. |
| Strip decorative emoji from headline, badges, and primary CTAs | keep | True | Cheap, on-brand credibility cleanup that reads less deal-blog. One caution: keep CTA destinations/sizes/orange identical and watch CTR closely in the variant, since emoji removal touches the green primary CTA label copy. Because the bundled A/B concept holds the orange CTAs byte-for-byte but these emoji live on the GREEN /guide and /reviews CTAs, this is a clean fit inside the frame variant; revert just the CTA-label emoji if CTR dips. |
| Standardize spacing rhythm and add an editorial reading measure | simplify | True | Real weakness (brief flags uneven rhythm) but a full strict-8px re-rhythm across every section is fiddly, hard to isolate cleanly, and dilutes the A/B signal. Simplify to the one high-value, low-risk piece: constrain the long-form science prose (L324-327, L478-481) to max-w-3xl (~66ch) for reading comfort. Defer the global py/p normalization to a non-experiment polish pass so it does not muddy attribution of the frame test. |
| Add a one-shot count-up on trust stats (350K+, 4.4/5, 92%) | cut | True | Cut from the first variant. It is the only opportunity that adds rather than deletes, and a count-up is itself a slightly gimmicky 2021-era flourish that works against the editorial/credible tone the rest of the refresh establishes. The monochrome-stat recolor (opportunity 3) already delivers the credibility upgrade on that row with zero motion. If desired, test count-up later as its own isolated micro-experiment; do not bundle it into the frame test where it confounds the result. |


**Red flags:**
- CLS (above the fold): the new display serif swaps H1/nav typography. Must use font-display:optional (never block, never repaint a different metric) with a system-sans fallback; do NOT also swap body font. Designer's claim that Inter 'paints LCP' is slightly off — the LCP element is the hero before/after image (fetchPriority=high, L153), so font choice affects CLS/perception, not LCP directly.
- CWV/LCP budget: keep it to ONE web font. Self-hosting both Fraunces AND Inter plus hand-rolled ascent/size-adjust overrides is the over-engineered path the brief warns against on an SEO-sensitive site.
- Conversion attribution: the orange product CTAs and mobile sticky Check-Price bar MUST be byte-for-byte identical to control. The emoji-strip touches the GREEN /guide and /reviews CTA labels (not orange) — acceptable inside the frame, but watch CTR on those and be ready to revert just the label emoji.
- Confounding: do NOT bundle the stat count-up (motion) or a global spacing re-rhythm into this variant — both add changes that muddy the frame-vs-button attribution. Test count-up separately if at all.
- Z-index: the heritage section uses backdrop-blur + a translucent card over a moving bg (L610) and the page has a CRITICAL custom z-scale (--z-index-header:40, modal 50; CLAUDE.md #14-16). Removing the parallax/backdrop-blur must not introduce a new stacking context on header/main/section wrappers — keep transform/opacity/filter off layout ancestors.
- Flicker: gate the whole Home.modern.jsx swap on isLoading (per posthog-ab-brief) so above-the-fold content does not flash control-then-variant.
- SEO: this is a visual/CSS reskin only — keep H1/H2 text content, heading hierarchy, internal links, and structured data identical to control so the experiment cannot move rankings.