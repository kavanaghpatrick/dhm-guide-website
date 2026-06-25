# DHM Hangover Relief Guide — Modernization Recommendations

- Route: `/guide`
- Source: see manifest
- Screenshots: `../screenshots/guide/`

## /guide — Modernization Plan

**Page role:** Long-form, trust-driven affiliate funnel. The reader arrives to learn *how* to take DHM and should leave by clicking through to `/reviews`. Five desktop frames deep — credibility and a persistent CTA are the whole game.

### What feels dated (grounded in the frames)

| Signal | Where | Why it dates the page |
|---|---|---|
| Gradient-clipped H1 | desktop-01 (`Guide.jsx` L148) | The single most 2021 tell; reads decorative, not editorial |
| Page-wide green→blue wash | desktop-01/02 (L131, L333, L487, L529) | Classic affiliate-site ambient tint; source of card monotony |
| Rainbow tint-coding (6+ hues) | hero red+green (L162/L173), protocol blue/orange/green (L232/255/278), scenarios blue/green/orange (L399/421/439), testimonials green/blue/**purple** (L615/625/635) | No dominant color; nothing reads as hierarchy |
| **Orange CTA accent missing** | desktop-01/03/05 | Every money button is green/white-on-green; orange only appears decoratively → no trained focal color for "act" |
| Georgia + system fonts | all frames | Browser-default voice on a page selling on credibility |
| Emoji + unicode stars | desktop-01/03/04 (😵✨🍻 / ⭐⭐⭐⭐⭐) | Low-effort signals where trust must be highest |
| Shadow-on-every-card | ~30 surfaces | Flat-2018 monotony; depth decorates instead of signaling role |

### Prioritized moves (before → after)

1. **Orange becomes the only CTA color (S, CTR↑).** *Before:* green/white-on-green buttons compete with green washes. *After:* all primary CTAs orange (#F97316) on calm fields; secondary actions go quiet outline. This is the conversion lever — Pattern #12 saw +21% from exactly this green→orange swap.
2. **Editorial H1 + Fraunces/Inter, drop Georgia (M, trust↑).** *Before:* green→green gradient-clip, Georgia headings. *After:* solid-ink H1 with one brand-green emphasis word; self-hosted variable serif. Highest-scrutiny change — preload text font only, size-adjust metric overrides, CLS = 0.
3. **Warm paper foundation (M, low risk).** *Before:* green→blue ambient wash. *After:* #FAF8F4 page + white cards + selective brand-soft section surfaces with 1px stone borders.
4. **De-rainbow to a 2-tone system (M).** Collapse 6+ hues to neutral surfaces + green (trust/info) + orange (action only). Delete the purple testimonial card.
5. **Border-first 3-tier elevation (M).** Flat content on paper with hairline borders; raised shadow only on interactive cards; radius 10px→8px.
6. **Persistent mobile orange CTA bar (M, CTR↑).** Slide-up-once sticky bar so the action survives the long scroll; then cut redundant full-width CTA bands from five to two. Respect z-index scale (Patterns #14–16).
7. **Lucide icons + designed stat chips replace emoji/unicode stars (M, trust↑).** Count-up "11 studies / 70% / 20+ brands" chips, animated once on scroll-in.
8. **Static confident hero, motion gated on reduced-motion (S).** No entrance translate on the LCP H1; keep one-shot reveals + button press feedback only.

### Highest-value A/B variant
**`guide-editorial-modern-v1`** — full-page `Guide.modern.jsx` via `useExperiment(...)`, gated on `isLoading`. Bundles warm paper + editorial H1 + de-rainbowed border-first surfaces + **single orange CTA + sticky mobile bar**. Control = current green page. **Primary metric:** `affiliate_link_click` (secondary: scroll-depth, time-on-page). The neutral foundation and the lone orange CTA are deliberately tested together — the calm field is what makes the orange button unmissable. Guardrail: hold CTA copy/size constant vs control; only hue + foundation change, so the lift is attributable.

### Guardrails honored
Buildable on Tailwind v4 + shadcn/CVA + Framer + Lucide (no new deps). Z-index scale untouched — sticky bar reuses the existing pattern; no transform/opacity on header/main/footer. Fonts self-hosted with metric overrides to protect LCP/CLS; display serif falls back to `font-display:optional` if it regresses hero LCP. Every move is isolatable as a flag-gated variant with the control untouched.


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Convert all primary CTAs from green to the single protected orange accent (the proven conversion lever — Pattern #12 +21%; pure class swap, zero CWV risk)
- Warm paper foundation (#FAF8F4) replacing the green→blue gradient wash — the calm field that makes the lone orange CTA unmissable (low risk, tokens go in @theme not tailwind.config.js)
- Retire the gradient-clip H1 to solid ink with one green emphasis word (1-line win, zero font cost) — ship even before any web font
- Mobile sticky orange CTA bar reusing the existing proven sticky-bar + z-index token (highest-ROI mobile move; never restyle header/main)
- Static hero (remove y:30 translate on the LCP H1) + reduced-motion gating — protects LCP/CLS for the whole variant
- Emoji→Lucide icons and unicode-stars→Lucide Star fills (icons already imported; cheap credibility polish)
- Kill the purple testimonial card + unify the 3 protocol circles to one tonal ramp (the unarguable de-rainbow wins)
- Static designed stat chips (11 studies / 70% / 20+ brands) WITHOUT scroll count-up animation


**Top A/B pick (build first):** `guide-editorial-modern-v1` — Full-page Guide.modern.jsx rendered via useExperiment('guide-editorial-modern-v1') gated on isLoading, control untouched. Bundle the four trust+conversion levers that reinforce each other: (1) warm paper foundation replacing the green→blue wash; (2) solid-ink editorial H1 (gradient-clip retired, one green emphasis word) with Fraunces behind font-display:optional so a font regression can never hurt LCP; (3) de-rainbowed 2-tone surfaces + border-first 2-tier elevation (kill purple card, unify protocol circles, 8px radius); and CRITICALLY (4) every primary CTA recolored green→orange #F97316 plus a mobile sticky orange CTA bar reusing the existing sticky pattern + z-token. Static hero (no LCP-H1 translate) and reduced-motion gating protect Core Web Vitals. Primary metric affiliate_link_click via trackAffiliateClick({experimentKey, variant}).
- Primary metric: affiliate_link_click | Effort: M
- Why high value: The orange-CTA swap is the proven conversion lever (Pattern #12 saw +21% from exactly this green→orange change) and the calm paper foundation is precisely what makes the single orange button the page's unmistakable focal point — so shipping the conversion lever and the trust lever together is synergistic, not just convenient. Every component is buildable with the current stack (Tailwind v4 @theme tokens, shadcn Button/CVA, existing sticky-bar + useExperiment hook, Lucide already imported). All four bundled changes are class-only or reuse-existing — zero new dependencies, near-zero CWV risk when fonts stay on font-display:optional and the LCP H1 paints stationary.


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Make orange the single conversion accent — convert all primary CTAs from green to orange | keep | True | VERIFIED: every money button is green/white-on-green (L191, L305, L472, L656, L705); orange appears only decoratively in the Step-2 protocol circle (L255) and Scenario-3 tint. This is the single highest-leverage, lowest-risk move and directly aligns with CLAUDE.md Pattern #12 (green→orange = +21% CTR). Keep the core: re-skin primary CTAs to bg-orange-500/hover-orange-600 white text; keep Calculate-Dosage as ghost/outline. SIMPLIFY one sub-part: demoting the four full green CTA bands (L185/295/465/671) to a calm surface is optional polish — do the button hue swap first since that's the proven lever; band-surface change pairs naturally with the color/wash opportunity and should not block the CTA swap. |
| Replace gradient clipped H1 + Georgia headings with editorial display serif in solid ink | simplify | True | VERIFIED: H1 uses green→green bg-clip-text gradient (L148) and brief confirms Georgia headings + no web fonts. The gradient-clip retirement to solid --color-ink with one green emphasis word is a 1-line win with ZERO font cost — do that unconditionally. SIMPLIFY the font half: do NOT block the variant on shipping Fraunces on the LCP H1. Keep font-display:optional (not the fragile size-adjust/ascent-override metric-matching the proposal specifies — that's the over-engineered part) and preload only the subset. If Fraunces regresses hero LCP at all, the H1 falls back to system serif and the rest of the page still gets the editorial heading. Test fonts as a separable layer, not coupled to the LCP paint. |
| Kill the page-wide green→blue gradient wash; move to warm paper foundation | keep | True | VERIFIED: page bg from-green-50 via-white to-blue-50 (L131) plus section washes (L333, L487, L529). This is the classic affiliate-tell and the cheapest 'premium' lever. Keep as proposed but with a token caveat: Tailwind v4 tokens live in @theme in src/App.css (NOT tailwind.config.js, per brief + Pattern #15) — --color-paper/--color-brand-soft/--color-stone must be added there or the classes won't emit. Pure aesthetic, near-zero CTR risk, ideal calm field that makes the lone orange CTA pop. |
| De-rainbow the tint-coded blocks into one restrained 2-tone system | simplify | True | VERIFIED: genuine rainbow — red (L162), green (L173), blue/yellow-orange/green protocol circles (L232/255/278), blue/green/orange scenarios (L399/421/439), and a green/blue/PURPLE testimonial set (L615/625/635) with no brand basis. Right instinct. SIMPLIFY scope: the highest-value, unarguable wins are (a) kill the purple card (L635 → neutral/paper) and (b) unify the 3 protocol circles to one tonal ramp. Recoloring every scenario/testimonial block to paper+border is more churn for less marginal payoff and overlaps heavily with the elevation opportunity — fold it in there rather than enumerating each block separately. Keep red as a muted stone+red-marker 'problem' state (honest, not alarming) as proposed. |
| Move from shadow-on-every-card to a border-first 3-tier elevation system | simplify | True | VERIFIED monotony: benefit cards use bg-white/80 backdrop-blur + hover:shadow-lg (L361), mechanism rows use shadow-sm (L512), FAQ/scenario cards are flat tint+border. A 3-TIER named-token elevation system is over-engineered for one page — that's a design-system-wide effort, not a Guide A/B variant. SIMPLIFY to a 2-tier rule of thumb: flat content = 1px warm border, no shadow; interactive cards (4 benefit cards, testimonials) = one soft shadow + border. Tighten radius 10px→8px globally via the existing --radius token. 'One depth cue per surface, never shadow+tint+border stacked' is the keep-able principle; the formal Tier-0/1/2 token taxonomy is the cut-able part. |
| Add a sticky/persistent affiliate CTA so the action survives the long scroll | keep | True | VERIFIED: 5-frame page with primary CTA only in big stacked bands (L185/295/465/653/671/701) and no persistent anchor. The mobile sticky orange bar pattern is already proven on the site (homepage-mobile-cta-v1 per A/B brief) — reuse it, do not rebuild. Keep the mobile sticky bar (highest-ROI mobile conversion move). SIMPLIFY: drop the 'reduce 5 bands to 2' sub-task from THIS variant — removing CTA bands changes scroll/section structure and confounds the clean affiliate_link_click read; isolate band-pruning as a later test. The optional desktop inline CTA is fine but secondary. Hard guardrail: slide-up on scroll must use a fixed-position bar with the existing z-token, never restyle header/main. |
| Replace emoji headings and unicode stars with Lucide icons + designed trust elements | simplify | True | VERIFIED: emoji-as-UI throughout (😵✨⚡✅🍻🍷🎉❓💊🍺🤔💰📦🚀, L163/174/186/297/400/422/440/543+/711) and ⭐⭐⭐⭐⭐ unicode strings (L617/627/637). Lucide (CheckCircle, Zap, Shield, Star) is already imported (L8-23) so emoji→icon and unicode-star→Star-fill is cheap, on-brand, and a real credibility upgrade — KEEP that. SIMPLIFY/scope-out the count-up animated stat strip: scroll-triggered count-up is the over-built part (Framer viewport-once animation near trust claims, extra JS, CLS risk on number reflow). A static designed stat chip row ('11 studies / 70% / 20+ brands') on brand-soft with hairline borders delivers the same credibility with zero motion cost — ship static, skip the count-up. |
| Replace hero entrance animation with confident static hero; gate all motion on reduced-motion | keep | True | VERIFIED: hero wrapper animates initial opacity:0/y:30 (L135-138) on the LCP H1, and every section repeats the y:30 reveal. Making the LCP H1 paint stationary is a pure CWV win and reads more premium for a science guide — keep. Retain subtle one-shot opacity reveals lower down (already viewport:once) and the existing button scale(0.97)/card hover lift. Gating Framer variants on prefers-reduced-motion is a small, correct accessibility add. This is a guardrail that protects the variant's LCP, especially important if the Fraunces H1 ships — do it as part of the bundle. |


**Red flags:**
- CONVERSION (confound risk): keep the variant clean by holding CTA structure constant — do NOT prune the 5 CTA bands to 2 inside this experiment; band removal changes scroll/section structure and muddies the affiliate_link_click read. Test band-pruning separately later.
- LCP: the H1 is the LCP element. Fraunces must ship behind font-display:optional (NOT the proposed size-adjust/ascent-override metric-matching, which is fragile over-engineering) so a font load can never regress hero paint; the solid-ink gradient-clip removal needs no font and should ship regardless.
- CLS: removing the y:30 entrance translate on the LCP H1 is mandatory in the variant — animating the LCP element risks perceived jank above the fold. Drop the proposed scroll count-up stat animation; ship static stat chips to avoid number-reflow CLS.
- Z-INDEX / STACKING CONTEXT (Patterns #14-16): the mobile sticky CTA must be a fixed-position bar using the existing z-index token and reuse the proven sticky-bar component. Never add transform/opacity/filter to <header>/<main>/<App> to achieve the slide-up — that traps the stacking context.
- TAILWIND v4 TOKENS (Pattern #15): new tokens (--color-paper, --color-brand-soft, --color-stone, radius) MUST be added to the @theme block in src/App.css — tailwind.config.js is a stub and v4 silently ignores it (no class emitted, silent regression). Verify emitted CSS in dist after build.
- SEO/SCOPE: this is a page-level visual/CTA variant — no copy, headings text, links, or schema change; the H1 string and internal links stay identical so organic ranking and indexability are untouched.