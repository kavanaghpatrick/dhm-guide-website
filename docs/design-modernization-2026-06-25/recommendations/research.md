# The Science Behind DHM — Modernization Recommendations

- Route: `/research`
- Source: see manifest
- Screenshots: `../screenshots/research/`

## The Science Behind DHM (/research) — Modernization Recommendations

### Current read (grounded in the frames)
This is the site's **credibility engine** — 25 studies, RCT highlights, an institution-stamped timeline, APA-citation buttons — but it's styled as "green health-SaaS circa 2023," which undercuts the authority it's selling. Stacked dated tells:

- **Gradient green clip-text hero h1 in Georgia/system fonts** (desktop-01) — reads as a browser default.
- **Green-tinted page wash** (`from-green-50 via-white to-blue-50`) across the whole page (desktop-01, 07-09) — the "supplement-affiliate" tell.
- **Four competing hues**: green headings/cards + blue badges & "significance" boxes + a **bright purple gradient timeline button** (desktop-02, mobile-03) + orange only on the mobile sticky bar — no single focal point.
- **Key Findings = four identical green-gradient cards** with green circular icons (desktop-02, mobile-03/04) — card monotony.
- **Filter row uses two active colors** — green "All Studies" pill + blue "All Years" pill (desktop-02, mobile-04).
- **Long-form study cards run full container width** (desktop-03-09) — dense science prose reads like an unstyled wiki.
- **No body affiliate CTA at all** — footer offers only two *internal* links (/reviews, /guide) in a green banner (desktop-10, mobile-05). A convinced desktop reader has nowhere to buy.

Reference lane: **Clinical-Editorial**.

---

### Prioritized moves (before → after)

**1. Warm-paper neutral + solid editorial headings — S, CWV: none**
Before: green/blue page wash, gradient green clip-text headings. After: `--color-paper` (#FAF8F4) foundation, solid `--color-ink` headings (one green emphasis word max), tinted section bands demoted to flat paper + 1px warm border. Highest-leverage, lowest-risk credibility lift; touches no CTA or geometry.

**2. Editorial type pairing (Fraunces + Inter), zero-CLS — M, CWV: medium**
Retire Georgia. Self-host subset variable woff2 via `@theme` tokens; preload **only** Inter (LCP text); set `size-adjust` + ascent/descent/line-gap-override + metric-matched local fallback so swap = 0 CLS. Body to 17px/1.6 for the dense study prose. Fraunces → `font-display: optional` if it regresses hero LCP.

**3. max-w-3xl reading measure on long-form prose — M, CWV: low**
Before: study "Key Findings" narrative + "Why RCTs Matter" + RCT intro run edge-to-edge. After: wrap editorial text in ~66ch `max-w-3xl mx-auto`; keep filters/stats at `max-w-6xl`. Standardize section `py-20`/`py-12` and card `p-6`. Fixes the brief's uneven-rhythm flag.

**4. Body-level affiliate CTA after the proof — S, CWV: low (HIGHEST conversion impact)**
Before: zero affiliate path mid-page; only internal footer links. After: one **orange** "Check Price on Amazon" block immediately after Key Findings + RCT highlight (peak conviction), wired through `trackAffiliateClick({experimentKey, variant})`. Captures high-intent readers who currently fall through.

**5. Collapse 4 hues → green-mark + orange-CTA + neutral — S, CWV: none**
Recolor the **purple** timeline button to neutral/ghost or brand-green; recolor blue "significance" boxes to desaturated `--color-brand-soft`/neutral + hairline border; single-color (green) filter active state for both rows. Makes the lone orange CTA the obvious focal point.

**6. Key Findings: border-first flat depth + scroll-in count-up — M, CWV: low**
Before: four matching green-gradient drop-shadow boxes. After: flat `--color-surface` + 1px warm border, one depth cue each; one-shot count-up on the 70/45/50/60% stats (`viewport once:true`, `prefers-reduced-motion` gated); institution badges as high-contrast trust chips.

**7. Tighten study-card motion + shared RAISED hover tier — S, CWV: none**
Cap the `index*0.1` stagger (slow on a 25-card list); swap `shadow-lg`-on-everything hover for the shared RAISED tier (1px border + warm two-layer soft shadow); gate all variants on `prefers-reduced-motion`.

---

### Highest-value A/B variant
**Research Editorial Re-skin + Proof-Point Affiliate CTA** — `research-editorial-cta-v1` — primary metric **`affiliate_link_click`**.
Full-page variant (`Research.modern.jsx`, gated on `isLoading`) bundling moves 1, 2, 3, 4, 5 against the current control. Hypothesis: a credible-looking editorial science page **plus** a reachable orange CTA at the proof moment converts an audience that is currently persuaded but has no body-level affiliate path. Isolate the type change's CWV metrics (LCP/CLS in PostHog + Lighthouse) before scaling; if the affiliate-CTA-add muddies attribution, split it into a second isolated experiment.

**Guardrails honored:** Tailwind v4 `@theme` + shadcn/CVA + Framer + Lucide only; no z-index/header restyle; one-time gated motion, no looping CTA animation; orange CTA paints stationary above any swap; control untouched.


---

## Feasibility review (simplicity / CWV / A/B-testability)

**Prioritized keep:**

- Add ONE orange body affiliate CTA after the Key Findings / RCT proof (closes the verified no-body-CTA gap — direct affiliate_link_click driver, highest value)
- Re-skin to warm-paper neutral + solid ink headings, killing the green wash and gradient clip-text (biggest credibility tell; use Tailwind utilities, not non-existent --color-* tokens)
- Collapse the 4-hue accents to green-mark + orange-CTA + neutral (recolor purple timeline button, desaturate blue significance boxes, single-color filter active state) — the salience mechanism that makes the lone orange CTA pop
- Constrain long-form study/RCT prose to a max-w-3xl reading measure (cheapest 'designed/authoritative' win, fixes spacing-rhythm flag)
- Flat border-first restyle of the 4 Key Findings stat cards (rides free on the re-skin; drop the count-up animation from v1)
- Cap study-card stagger delay and swap shadow-lg hover to a hairline-border + soft-shadow tier (one-line polish, free rider)


**Top A/B pick (build first):** `research-editorial-cta-v1` — One flag-gated full-page variant (src/pages/Research.modern.jsx, wrapper reads useExperiment, gated on isLoading) bundling ONLY the low-risk credibility re-skin plus the conversion gap-fill: warm-neutral page background replacing the green/blue wash, solid dark editorial headings replacing the green gradient clip-text, blue significance boxes + purple timeline button + split filter active states collapsed to a calm green-mark + neutral system, long-form study prose constrained to ~66ch (max-w-3xl), flat border-first Key Findings cards, and — critically — ONE orange 'Check Price on Amazon' affiliate CTA inserted right after the Key Findings / RCT proof sections, wired through trackAffiliateClick with experimentKey+variant. Control is the current page (no body affiliate path). EXCLUDES Fraunces/Inter web fonts and the stat count-up animation — those are CLS/attribution risks that belong in separate later tests.
- Primary metric: affiliate_link_click | Effort: M
- Why high value: It pairs the page's single biggest, verified conversion gap (zero mid-body affiliate path despite peak-conviction proof at 70%/600+/RCT) with the calm-neutral re-skin that makes that lone orange CTA the obvious focal point — so the re-skin and the CTA reinforce each other on the same primary metric. Every piece is buildable with the existing stack (Tailwind utilities, existing orange accent, Framer already imported, trackAffiliateClick already supports experimentKey+variant) and touches no z-index scale and no above-the-fold LCP-critical font. Dropping the web-font swap keeps attribution clean and CWV risk near zero.


### Verdicts
| Opportunity | Decision | Buildable | Note |
|---|---|---|---|
| Re-skin the page onto warm-paper neutral + solid editorial headings (kill the green wash and gradient text) | keep | True | Highest-credibility, lowest-risk lever and verified accurate: page bg is from-green-50 via-white to-blue-50 (line 179), hero h1 is green gradient clip-text (lines 194-196), section bands are blue/green washes (lines 226, 439). KEEP, but correct one false premise: --color-paper / --color-ink tokens do NOT exist (brief: pages use standard Tailwind utilities). Build with stone-50/neutral-50 bg + slate-900 solid headings (or add 2 @theme tokens in src/App.css), not an assumed token system. Solid ink headings + flat paper bands is the single biggest 'not-2021-affiliate' tell here. |
| Adopt the editorial type pairing (Fraunces display + Inter body) with zero-CLS self-hosting | cut | True | CUT from the first variant. The brief confirms no web fonts load today, so this is a from-zero font addition on an SEO/CWV-sensitive page — it conflates the test (was the lift from re-skin+CTA or from the font?) and adds the most engineering of any item for the least conversion proof. Solid-ink Georgia headings on warm paper already kill the 'gradient affiliate' look. If type ever gets tested, do it as its own isolated single-font variant later — never bundled into the proof-CTA experiment. |
| Constrain long-form study + RCT prose to a max-w-3xl reading measure | keep | True | Verified: study cards run full max-w-6xl with dense full-width prose (lines 495, 548, screenshots 03-05 read like an unstyled wiki). A ~66ch measure on the 'Key Findings' narrative column and the 'Why RCTs Matter' box is the cheapest 'designed/authoritative' win and fixes the brief's spacing-rhythm flag. KEEP, but simplify scope: wrap the editorial prose columns only, leave the participant/duration stat grids and filters at their current width. Standardizing padding is fine as a free rider; don't let it balloon. |
| Add a body-level affiliate CTA after the Key Findings / RCT proof (close the conversion gap) | keep | True | THE headline opportunity, and verified true: the page has NO body affiliate path — only PubMed external links (line 594) and footer internal CTAs to /reviews and /guide (lines 641, 655). Placing ONE orange 'Check Price on Amazon' CTA right after the 70%/600+/RCT proof (after Key Findings, line ~436) captures high-intent readers at peak conviction where nothing currently converts. This is the direct affiliate_link_click driver. Use orange-500/orange-600 (existing accent, not an invented --color-cta token). |
| Collapse the 4-hue accent system to green-mark + orange-CTA + neutral; recolor the purple timeline button | keep | True | Verified: purple gradient timeline button (lines 319-326) and purple badges are a genuine third hue with no brand equity; blue significance boxes (lines 582-583) and split green/blue filter active states (lines 455 vs 472) are the 'nothing is the focal point' problem. KEEP — recolor purple button to neutral/green-ghost, desaturate blue significance boxes to a neutral/green-soft surface, unify both filter rows to a single green active state. This is what makes the lone orange CTA pop, so it belongs IN the same variant as the CTA (it is the salience mechanism, not a separate test). |
| Rework Key Findings stat cards: border-first flat depth + scroll-in count-up | simplify | True | Verified: 4 identical green-gradient cards with uniform hover:shadow-lg (lines 416-431) are real card monotony. KEEP the border-first flat re-style (drop the green gradient + uniform shadow for flat surface on a 1px warm border) — that rides for free on the re-skin. SIMPLIFY by cutting the count-up animation from v1: it is the 'high-perceived-quality polish' that CLAUDE.md flags as nice-to-have, adds JS, and muddies attribution. Prove the re-skin+CTA first; add count-up only if a later polish pass wants it. |
| Tighten study-card entrance motion and standardize hover to the new elevation tier | simplify | True | Real issue confirmed: index*0.1 stagger on study reveals (line 502) and timeline (line 347) compounds badly on a 25-study list, and shadow-lg-on-everything hover is heavy. SIMPLIFY to the one-line wins only: cap the stagger (e.g. Math.min(index,6)*0.06 or drop per-card delay) and swap hover shadow-lg to a hairline-border + soft-shadow tier. There is no shared 'RAISED elevation tier' token in this codebase yet, so don't invent an abstraction — just set the two classes. Pure polish, negligible CTR effect; fine to fold into the re-skin variant as a free rider, not its own test. |


**Red flags:**
- CLS/LCP: the Fraunces+Inter font addition is from ZERO web fonts today (brief line 24) and the hero h1 is the LCP element — keep it OUT of v1; if tested, isolate it. Reserve a fixed min-height on the new CTA block so it doesn't shift content as it mounts.
- Non-existent tokens: proposals reference --color-paper / --color-ink / --color-cta / --color-brand-soft that do NOT exist in this codebase (brief: pages use standard Tailwind utilities; orange CTA is orange-500). Build with Tailwind utilities or add a small number of real @theme tokens in src/App.css — do not assume a token system that isn't there.
- Conversion/attribution: bundling the count-up animation and the web-font swap into the CTA experiment muddies whether any lift came from the CTA, the re-skin, or polish. Keep v1 to re-skin + accent-collapse + reading-measure + body CTA only.
- Conversion balance: new mid-body orange CTA must out-emphasize the footer internal CTAs (lines 641,655) without cannibalizing them — confirm the footer buttons stay visually secondary so the affiliate path is the dominant action.
- Z-index: no proposal here touches the critical z-scale (CLAUDE.md #14-16) — confirm the new CTA block introduces no fixed/sticky positioning or stacking-context creators (transform/opacity/filter) on ancestors.
- SEO: keep all current h1/h2 text content and PubMed external links intact through the re-skin; this page's ranking value is the study citations — restyle only, do not remove or restructure the cited content or links.
- Test isolation: control (Research.jsx) must remain byte-untouched; all changes live in Research.modern.jsx behind the flag (posthog-ab-brief pattern).