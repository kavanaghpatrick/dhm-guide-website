# DHM Guide — Shared Modern Design Language (2026)

*Status: design-lead spec for the 6-page modernization sprint. Evolution of the current look, not a teardown. Buildable in Tailwind v4 (@theme in `src/App.css`) + shadcn/Radix + CVA + Framer Motion + Lucide. Every token below is A/B-isolatable and CWV-conscious.*

---

## North Star
Make DHM Guide read as the most **credible, premium voice in hangover prevention** — an editorial science desk that happens to sell, not an affiliate page that happens to cite studies. Green keeps its brand equity but stops shouting; a warm paper-neutral foundation and a real editorial type voice do the modernizing; **orange stays the single, unmissable conversion accent.** Modern here = trust you can see + a CTA you can't miss.

---

## 1. Typography (the #1 lever — and #1 LCP risk)
**Retire Georgia.** It's the most "browser-default / generic" signal on the site.

- **Display (headings/hero):** Fraunces Variable (high-contrast editorial serif, optical-size axis) — self-hosted woff2.
- **Text (body/UI):** Inter Variable — self-hosted woff2.
- **Scale (fluid, `clamp()`):**
  - h1 `clamp(2.5rem,5vw,4rem)` / line-height 1.05 / tracking −0.02em
  - h2 `clamp(1.75rem,3vw,2.5rem)`
  - h3 `1.5rem`
  - body **1.0625rem (17px)** / 1.6  ← up from 16px
  - small `0.875rem`
- Headings: tight tracking, line-height 1.05–1.15. Body: relaxed 1.6.
- Tokens: `--font-display`, `--font-sans` in `@theme`; expose as `font-display` / `font-sans`.

**CWV rules (mandatory):**
1. **Self-host** subset variable woff2 (glyphhanger/fonttools). Two files only (~80–140KB total). **Never the Google CDN.**
2. `<link rel=preload>` the **text** font only (it paints LCP). `font-display: swap`.
3. **Kill the swap reflow:** set `size-adjust` + `ascent-override`/`descent-override`/`line-gap-override` in `@font-face` and use a metric-matched local fallback → **CLS 0** on font arrival.
4. **Measure before/after** (Lighthouse + PostHog). If the display serif regresses hero LCP, set it `font-display: optional`.
5. Fallback path: if CWV can't be guaranteed, ship the **refined-system-stack** variant (tighter scale + 17px body, no web fonts) — CWV-free.

---

## 2. Color — evolve green/blue/orange
**Keep green (brand equity), demote it from "fills everything" → "mark + trust accent." Warm paper foundation. Orange = the ONE conversion color.**

Add to `@theme` (alongside existing OKLch base):

| Token | Value | Role |
|---|---|---|
| `--color-paper` | `#FAF8F4` | page background (warm, not stark white) |
| `--color-surface` | `#FFFFFF` | cards |
| `--color-ink` | `#1A1D1A` | text |
| `--color-ink-soft` | `#4A4E48` | secondary text |
| `--color-border` | `#E7E3DB` | warm hairline borders |
| `--color-brand` | `#15803d` | green: mark + trust (slightly deeper, less neon) |
| `--color-brand-strong` | `#166534` | emphasis |
| `--color-brand-soft` | `#ECF3EE` | trust chips/badges |
| `--color-cta` | `#F97316` | **conversion accent (protected, singular)** |
| `--color-cta-hover` | `#EA580C` | CTA hover |
| `--color-info` | `#1D4ED8` | blue: links / "science" callouts ONLY (not a co-brand) |

- **Drop ALL gradient heading text** → solid `--color-ink`, optionally one accent word in `--color-brand`. (Gradient text is a 2021 tell.)
- Pros/cons: keep green-check / red-x but **desaturate the reds** so cons read "honest," not "alarming."
- **Conversion guardrail:** orange is the only fully-saturated color allowed on a page → the "Check Price on Amazon" button becomes the natural focal point. Calm neutrals *raise* CTA salience.

---

## 3. Spacing & Shape
- **Rhythm:** strict 4/8px base. Use only 4,8,12,16,24,32,48,64,96.
- **Sections:** `py-20` desktop / `py-12` mobile (fixes uneven rhythm).
- **Card padding:** `p-6` desktop / `p-5` mobile. No ad-hoc values.
- **Containers (two widths):**
  - `max-w-3xl` (~720px / ~66ch) → editorial/long-form "science" reading measure.
  - `max-w-6xl` (1152px) → app/comparison layouts (home grids, reviews table).
  - `mx-auto px-4 sm:px-6`.
- **Radius (tighten + unify):** cards/buttons **8px** (`--radius 0.5rem`, down from 10); chips/badges `rounded-full`; inputs 8px; hero/feature panels 12–16px max. Never mix 3+ radii on one surface.
- **Density principle:** editorial sections **airy**; decision tools (comparison table, product cards) **tight & efficient** — do not loosen the table.

---

## 4. Elevation & Depth — border-first, not shadow-on-everything
Replace card monotony (white box + soft drop shadow, everywhere) with **role-based depth**. A surface gets **at most one** primary depth cue.

- **Tier 0 — Flat:** most content sits on paper with a **1px warm border**, no shadow. *(This border-first move is the biggest modern tell.)*
- **Tier 1 — Raised** (interactive cards): two-layer warm soft shadow
  `0 1px 2px rgb(26 29 26 / .04), 0 8px 24px -8px rgb(26 29 26 / .08)` + 1px border. Never the default gray Tailwind shadow.
- **Tier 2 — Overlay** (modals/dropdowns/sticky bar): real shadow (`shadow-xl` ok).
- **Tinted surfaces:** use desaturated `--color-brand-soft` / amber-soft as deliberate **section surfaces** (with borders) to break monotony — not random card fills.
- **Hero:** kill the green→blue **two-hue gradient banner** → solid brand surface or subtle paper→brand-soft vertical wash.
- **Z-INDEX: do not break the scale.** Never style `header`/`main`/`footer`/`App` with `transform`/`filter`/`opacity`/`backdrop-filter` that create stacking contexts (CLAUDE.md Patterns #14–#16).

---

## 5. Motion
**Principle:** motion clarifies or rewards, never decorates. 150–250ms, ease-out enters, gate ALL variants behind `prefers-reduced-motion`.

**Keep / add (polish):**
- One-shot scroll reveals on editorial sections (opacity + y 12→0, `viewport once`). Not parallax.
- Card hover lift (existing `translateY(-4px)`) paired with the new border/shadow tiers.
- Button press `scale(0.97)` + active opacity (good tactile CTA feedback).
- Accordion/FAQ height reveals (Radix + Framer).
- **Count-up on trust stats** ("20+ brands", "5000+ reviews") on scroll-in — cheap, high-credibility polish.

**Remove (noise):**
- **Hero scroll parallax** (`useScroll`/`useTransform`) — 2021 tell, main-thread cost, CLS risk on the LCP element. Replace with a static, confident hero.
- Decorative `shimmer`/`float`/`pulse-glow` keyframes on primary pages — erodes the "credible science desk" tone.

**Conversion rule:** never animate the CTA in a way that delays its paint or moves it. Orange "Check Price" is instantly present and **stationary** above the fold; one subtle entrance OK, looping attention-motion is not (reads spammy). Mobile sticky bar slides up once, then stays.

---

## 6. Three Reference Lanes (each page picks one)
1. **Clinical-Editorial** — authoritative science desk: paper, `max-w-3xl` measure, Fraunces over Inter, airy spacing, flat border-first depth, near-zero motion. → *The Science, long-form research.*
2. **Warm-Premium-Wellness** — lifestyle-premium: warmer tints, soft bordered section surfaces, larger display type, gentle reveals + stat count-ups. → *Home, About/Heritage.*
3. **Modern-Performance** — dense decision tool: tight 8px rhythm, `max-w-6xl`, zebra-striped scannable tables + compact cards, raised-tier shadows only, orange CTA as the sole saturated focal point. → *Reviews/Best-Supplements, Compare.*

---

## Build order (lowest risk → highest lever)
1. **Warm paper foundation + solid (de-gradiented) headings + border-first depth** — aesthetic/trust lift, near-zero CTR risk. *Isolate from any CTA change.*
2. **Spacing/radius unification + section rhythm.**
3. **Remove parallax + decorative keyframes; add one-shot reveals + stat count-ups.**
4. **Self-hosted Fraunces + Inter** — highest lever, highest scrutiny; ship only after CLS-0 / LCP-neutral is proven, else ship the refined-system-stack variant.

*Keep orange CTA hue/size/copy constant across foundation experiments — change it only in its own isolated variant.*

---

### Sources (2026 trend grounding)
- [Figma — Web Design Trends](https://www.figma.com/resource-library/web-design-trends/)
- [Wix — 11 Biggest Web Design Trends of 2026](https://www.wix.com/blog/web-design-trends)
- [Lounge Lizard — 2026 Web Design Color Trends](https://www.loungelizard.com/blog/web-design-color-trends/)
- [Designity — Typography Trends 2026](https://www.designity.com/blog/typography-trends)
- [Clarkston Consulting — 2026 Vitamins, Minerals & Supplements Trends](https://clarkstonconsulting.com/insights/2026-vitamins-minerals-supplements-trends/)
- [Elementor — Web Design Trends 2026](https://elementor.com/blog/web-design-trends-2026/)