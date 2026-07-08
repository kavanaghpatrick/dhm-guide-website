# Plan: Restyle the rest of the site to the modern design system

## Executive summary

The 6 primary pages (Home, Reviews, Guide, Research, Compare, Never-Hungover hub) **plus the blog *listing* page** shipped on the modern 2026 design system (`.theme-modern`: warm paper background `#FAF8F4`, self-hosted Fraunces display + Inter body, border-first cards, orange `#F97316` reserved strictly for affiliate/buy CTAs, deeper brand green `#15803d` as a trust accent, solid non-gradient headings, 8px radius, 4/8 spacing). Everything else still runs the retired language and now visibly clashes: green→blue/purple page gradients, gradient clip-text headings, drop-shadow/`rounded-xl` cards, a rainbow of CTA colors, and — on the shared chrome — a cold `gray-900` footer meeting the warm-paper body on every frame.

The single biggest un-migrated surface is the blog **POST** template (`NewBlogPost.jsx`, ~197 posts — our largest organic entry point), and the shared **header + footer** render on 100% of pageviews including every already-modern page, so the mismatch is maximally seen there.

### Recommended sequencing (highest-traffic / most-visible first)

| # | Issue | Priority | Effort | Why here |
|---|-------|----------|--------|----------|
| 0 | Shared UI foundation (reuse map + form/callout primitives) | p1 | M | Unblocks the rest; makes each restyle a cheap wrapper+class-swap |
| 1 | Header / nav / chrome | p0 | M | 100% of pages, every user |
| 2 | Global footer | p1 | S | 100% of pages; quick win |
| 3 | Blog post template (~197 posts) | p1 (p0-adjacent) | XL | Biggest organic surface; split into stacked PRs |
| 4 | Dosage Calculator | p1 | L | Loudest legacy page |
| 5 | About | p2 | M | Lower-traffic trust page |
| 6 | 404 / NotFound | p2 | S | Quick win |

Mobile/responsive + accessibility remediation (44px targets, no horizontal overflow, WCAG-AA contrast, clean heading order, `aria-hidden` icons, gradient-clip-text removal) is **folded into each surface issue's scope + acceptance criteria** rather than living as a separate cross-cutting issue, because it touches the exact same files. The two "foundations" drafts and the "shared components" draft are **consolidated into the single foundation issue (#0)** — buttons/cards/badges/product-table components are already 100% reusable, so the only genuine build-new work is scoped form-element rules + one `CalloutModern` component.

---

## Epic (tracking issue)

**Epic: Restyle the rest of the site to the modern design system (chrome, blog template, tools, secondary pages)**

Frames the whole effort, lists the 7 child issues as a checklist, states the shared adopt-the-shipped-mechanism recipe, and records the constraints (mass-edit moratorium until 2026-07-15; no new tokens; control pages must stay pixel-identical).

---

## Child issues (de-duplicated set)

### 0. Shared UI foundation — modern `.theme-modern` reuse map + form/callout primitives — `p1 / M`
Documents the reuse map in `src/components/modern/README.md`, adds scoped `input`/`select`/`textarea`/`input[type=range]`/`progress` rules to `theme-modern.css` (so the Calculator's shadcn controls theme for free), and adds a `CalloutModern` component for the blog's Info/Pro/Warning boxes. No new tokens; all additions scoped under `.theme-modern`.

### 1. Header / nav / chrome — `p0 / M`
`Layout.jsx` + `StickyMobileCTA.jsx`. Kills the wrapper green→blue gradient, the gradient clip-text wordmark, the green hairline, the 360° logo spin, and the neon-green nav/active states; border-first mega-menu; recolors the sticky rank badge off orange and the star to `--color-star`. Preserves the already-correct `isModern` header-CTA gating.

### 2. Global footer — `p1 / S`
`Layout.jsx` footer (485-588). Light warm surface instead of `bg-gray-900`, solid brand logo chip, Fraunces headings, ink/ink-soft text with AA contrast, no orange. Reuses the in-file `isModern`.

### 3. Blog post template (~197 posts) — `p1 (p0-adjacent) / XL`
`NewBlogPost.jsx` + `KeyTakeaways.jsx` + `InlineComparisonTable.jsx`. Paper bg, Fraunces headings, Inter 17px/1.6 body at a 45rem measure, border-first cards/TOC/related, modern `.compare` table (green winner marker, orange only on buy CTA), `CalloutModern` callouts, quiet `strong` (no `gradient-text-green`), clean h1→h2→h3 outline. **Split into 3 stacked PRs.** Template files only — unaffected by the post-JSON moratorium.

### 4. Dosage Calculator — `p1 / L`
`DosageCalculatorEnhanced.jsx`. Wrap + retheme visual pass (not a rewrite): paper bg, solid Fraunces headings, `.btn-cta` on the two real CTAs (orange off the stat + tolerance tile), unify the five-hue input rainbow, border-first cards, remove infinite/360° motion, `.faq` accordion. Fixes real mobile defects: clipped full-width CTA, FAB overlap, sub-44px targets, low-contrast small text.

### 5. About — `p2 / M`
`About.jsx`. Paper bg, solid Fraunces hero, `.section-head`/`.eyebrow`/`.lead` clusters, border-first cards, `.stat` metrics (no decorative blue), `.cta-band` contact section, `.btn-cta` primary CTAs. Self-contained single file.

### 6. 404 / NotFound — `p2 / S`
`NotFound.jsx`. Wrapper + import brings paper bg and Fraunces H1; neutral `.btn`/`.btn-secondary` (no green primary, no orange — these are navigation not affiliate); `.card-raised` link cards with brand-soft icon tiles; token colors. Preserves the `page_not_found` event.

---

## Cross-cutting rules (baked into every child's acceptance criteria)

- No `bg-clip-text text-transparent` / multi-stop gradient text on any restyled surface.
- No `bg-gradient-to-*` page/section backgrounds; page resolves to `--color-paper`.
- Border-first cards (1px `--color-border`, 8px `--radius`, `--elev-0/1`) — no `shadow-2xl`, no `rounded-3xl`.
- Orange only on affiliate/buy CTAs; no decorative orange, no green/blue/purple/pink primary buttons.
- Mobile/a11y: zero horizontal scroll at 320/375/414px, ≥44px touch targets, WCAG-AA contrast, clean h1→h2→h3, `aria-hidden` decorative icons, visible `:focus-visible`.
- Preserve all behavior: PostHog `data-*`, the affiliate-click contract (plain `<a>` + `data-*`, **no** added onClick), `rel="nofollow sponsored"`, SEO hooks, calculator/TOC logic.
- No new design tokens; reuse `src/styles/theme-modern.css` as-is (foundation issue may add scoped element rules + `CalloutModern` only).
- Control pages remain visually unchanged; `npm run build` + z-class verify must pass.

## Constraints & notes

- **Mass-edit moratorium** (CLAUDE.md, active until 2026-07-15, issue #366): the blog restyle touches COMPONENT files, not the ~197 `posts/*.json` bodies — not affected by the >20-post-JSON guardrail. Do not batch post-content edits in.
- Verified against the codebase (2026-07-08): all target files and modern references exist; gradient clip-text confirmed at `About.jsx:129`, `DosageCalculatorEnhanced.jsx:854`, `Layout.jsx:141`; page/footer gradients confirmed; `useModernExperiment`/`isModern` already present in `Layout.jsx:86-87`; the blog *listing* already has a `.modern` variant, so the blog *post* template is genuinely the last major un-migrated blog surface. Correction vs one draft: `NewBlogPost.jsx` has **0** `bg-clip-text` (its dated emphasis is the inline `gradient-text-green` CSS class at line 1344, handled in scope).