# Modern restyle REUSE MAP — shared chrome + About + 404

**Issue #381 (foundation), chrome+About+404 batch.** This is the recipe implementers
follow to restyle the **shared header/footer (`Layout.jsx`)**, the **About page**, and
the **404 page** onto the already-shipped modern design system by REUSE — swapping old
Tailwind/shadcn primitives for the scoped `.theme-modern` classes and tokens.

**You do not invent styles.** Everything below already exists in
`src/styles/theme-modern.css` (scoped under `.theme-modern`). Only chrome needed two new
scoped primitives (`.nav-link*`, `.footer-modern` — added in this batch); every other
surface is 100% existing classes.

---

## 0. The wrapper rule (READ FIRST — chrome is special)

`<Layout>` wraps EVERY page. Its `.theme-modern` scope does **not** exist on the header or
footer today: the modern page wrapper lives *inside* `<main>`, so `<header>` and
`<footer>` are **outside** any `.theme-modern` ancestor. Two consequences:

- **Chrome (header + footer):** add `className="theme-modern"` **to the `<header>` and
  `<footer>` elements themselves** (or a shared chrome wrapper) so the scoped classes and
  tokens resolve. Do NOT wrap the whole `<div className="min-h-screen …">` root — that
  would leak the paper background onto control pages. Wrap the two chrome elements.
  - Import the stylesheet once in `Layout.jsx`: `import '../styles/theme-modern.css'`.
  - Header keeps its existing `z-header` class and its `position: fixed` +
    `backdrop-filter` — do NOT add/remove z-* classes, and do NOT add
    `opacity/transform/filter` to the header (Pattern #14: it traps the portaled Topics
    dropdown's stacking context). The Topics mega-menu is portaled to `document.body`;
    if you want it themed, wrap the portaled panel's root in `theme-modern` too.
- **About / 404 (page bodies):** wrap the page's top-level `<div>` in
  `className="theme-modern"` exactly like `src/pages/Reviews.modern.jsx:144`, and
  `import '../styles/theme-modern.css'` at the top of the file.

**Delete on sight (all three surfaces):** every `bg-gradient-to-*`, `bg-clip-text` +
`text-transparent`, `from-green*|blue*|purple*|pink*` gradient stop, `rounded-2xl|3xl`,
`shadow-xl|2xl`, and the cold `bg-gray-900` footer. These are the visual clash.

---

## 1. Primitive → modern class map (all surfaces)

| Old primitive / pattern | Modern replacement | Notes |
|---|---|---|
| `Button` (green gradient) — internal nav CTA | `.btn .btn-secondary` (or `.btn` default) | **NEVER `.btn-cta`** — orange is reserved for affiliate/buy CTAs. None of chrome/About/404 CTAs are affiliate, so **none use orange.** |
| `Button variant="outline"` | `.btn .btn-secondary` | 1px border, warm hover |
| `Button variant="ghost"` / quiet link-button | `.btn .btn-ghost` | brand-soft hover |
| `Button size="lg"` | add `.btn-lg` | 52px min-height |
| `Card` / `CardContent` (flat) | `.card` | elev-0, border-first |
| `Card … hover:shadow-*` (interactive) | `.card-raised` | elev-1 + hover lift; use for 404 helper-link cards + About value/achievement cards |
| `CardTitle` | `.card-title` | Fraunces, -0.01em |
| `Badge` (green/blue pill) | `.badge` / `.badge-brand` / `.badge-info` | trust chips |
| Badge w/ icon (e.g. "DHM Guide Team") | `.chip` | brand-soft pill, green icon |
| `bg-gradient-to-r … bg-clip-text text-transparent` heading | plain `<h1>`/`<h2>` (solid ink) + `.accent` on the ONE emphasis word | base `h*` rule already gives Fraunces + solid ink; **no gradient text anywhere** |
| Section wash `bg-gradient-to-br from-green-50 … to-blue-50` | `.section` (paper) or `.section.surface-brand` (brand-soft tinted) or `.surface-wash` (hero paper→brand-soft) | pick per section; break monotony with `surface-brand` |
| Green "Why DHM exists" info box (`bg-green-50 p-8 rounded-lg`) | `.card` (on a `.surface-brand` section) or `.card` alone | border-first, no flat green fill |
| Green contact band (`bg-gradient-to-r from-green-700 to-green-800 text-white`) | `.section.surface-brand` + `.cta-band` | calm brand-soft band, not a saturated green slab |
| Eyebrow / small-caps label | `.eyebrow` | uppercase, brand-strong |
| Lead paragraph | `.lead` | fluid, ink-soft |
| Stat number ("50+ Studies") | `.stat` / `.stat-value` / `.stat-label` | optional upgrade for About achievements |
| Gold icon circle (404 amber `bg-amber-100`) | `.chip` or a `.badge` with a star/gold accent, OR a bordered brand-soft circle using `--color-brand-soft` + `--color-brand` | avoid raw amber; use gold `--color-star` only for star ratings |

---

## 2. Chrome-specific primitives (NEW this batch — `theme-modern.css` §14)

The base `a` rule paints links **blue** (`--color-info`, for editorial/science links).
Nav and footer links are **chrome**, not editorial — do not let them go blue. Use:

| Chrome element | Class | Behavior |
|---|---|---|
| Header desktop nav link (`<a>`/Topics `<button>`) | `.nav-link` (+ `.is-active` or `[aria-current="page"]`) | quiet ink-soft → **brand green** on hover; active = brand-strong + weight 600 |
| Active-tab underline marker (the `motion.div` bar) | `.nav-marker` | `--color-brand` fill (replaces `bg-green-600`) |
| Header **mobile** nav row + mobile Topics rows | `.nav-link-block` (+ `.is-active`) | full-width, `min-height:44px`, brand-soft fill on hover/active (replaces `bg-green-100`/`hover:bg-green-50`) |
| Footer `<footer>` element | `.footer-modern` | warm green-tinted ink surface (**replaces `bg-gray-900`**); headings white, hairline top border |
| Footer quick-links / resource links | `.footer-link` (inside `.footer-modern`) | quiet light ink → white on hover (replaces `text-gray-300 hover:text-white`) |
| Footer disclosure / © text | `.footer-muted` (inside `.footer-modern`) | muted light ink (replaces `text-gray-400`) |

Header CTA (`data-track="nav-cta"` → `/reviews`): this is an **internal nav CTA, not
affiliate** → render **brand green**, not orange. The Layout already computes a modern
class (`isModern` → `bg-green-700 …`); align it to `.btn .btn-secondary` **or** keep a
green fill via tokens (`background: var(--color-brand)`), but **never `.btn-cta`**.
Preserve `data-track`, `data-cta-variant`, and the A/B `navCtaCopy` logic verbatim.

Logo wordmark ("DHM Guide", currently `bg-clip-text` green gradient): make it **solid**
— `color: var(--color-brand-strong)` (or ink) on the text, keep the Leaf mark. The
`whileHover rotate` on the leaf tile is fine, but drop the green `bg-gradient-to-br`
tile fill in favor of a solid `--color-brand` / brand-soft tile. No gradient text.

---

## 3. Per-surface recipe

**Header + Footer (`src/components/layout/Layout.jsx`)** — chrome, shared by ALL pages
incl. flag-gated modern pages:
1. `import '../styles/theme-modern.css'`.
2. Add `className="theme-modern"` to the `<header>` and to the `<footer>` (not the root).
3. Header: nav `<a>`/Topics `<button>` → `.nav-link` (+ `.is-active`); active bar →
   `.nav-marker`; mobile rows → `.nav-link-block`; logo → solid; CTA → green
   `.btn-secondary`/token green, never orange.
4. Footer: `<footer>` → `.footer-modern`; links → `.footer-link`; ©/disclosure →
   `.footer-muted`; keep the 4-column grid + Leaf mark.
5. **Preserve every** `href`, `onClick` navigation handler, `data-track`, `aria-*`,
   `aria-expanded`/`aria-controls`, the portal + outside-click/Escape logic, and the
   full nav/footer link set. The mega-menu and hamburger must still open and list the
   same links. Do NOT touch `src/components/ui/*`.

**About (`src/pages/About.jsx`):**
1. Wrap the root `<div>` in `.theme-modern`; `import '../styles/theme-modern.css'`.
2. Hero: `.chip` badge; `<h1>` solid + `.accent` on "never wake up hungover again";
   `.lead`; CTAs → `.btn .btn-secondary .btn-lg` (green, **See Tested Products** is
   internal nav → NOT orange); hero section → `.surface-wash`.
3. Mission/Values/Expertise/Achievements/Methodology: `<h2>` solid; card grids →
   `.card` / `.card-raised`; alternate section surfaces with `.section` and
   `.section.surface-brand`; drop all `from-blue*`/`from-green*` gradients and
   `rounded-2xl shadow-2xl` on the image (use `.card` / token radius).
4. Contact band: `.section.surface-brand` + `.cta-band`; buttons `.btn-secondary`.
   Keep `data-track="cta"`, `data-cta-*`, and the `mailto:` + `/research` targets.
5. Preserve `useSEO(generatePageSEO('about'))`, single `<h1>`, heading order.

**404 (`src/pages/NotFound.jsx`):**
1. Wrap root `<div>` in `.theme-modern`; `import '../styles/theme-modern.css'`.
2. Icon circle → brand-soft bordered circle (or `.chip`), not raw amber; `<h1>` solid;
   `.lead` subhead.
3. Quick-action buttons → `.btn .btn-secondary .btn-lg` (internal nav, green, NOT
   orange). Helper-link cards → `.card-raised`; card title `.card-title`; icon tiles →
   brand-soft.
4. Keep the `trackEvent('page_not_found', …)` effect, all `href` targets, and the
   `mailto:contact@dhmguide.com` link.

---

## 4. Guardrails (tests assert these)

- **Orange discipline:** `--color-cta` (#F97316) / `.btn-cta` appears on affiliate/buy
  CTAs ONLY. Chrome/About/404 have zero affiliate CTAs → **zero orange** on these three
  surfaces. Every internal nav CTA is brand green or secondary.
- **No gradient text:** no `bg-clip-text`/`text-transparent`, no multi-stop TEXT gradient
  (logo, headings). Solid ink + single `.accent` word only.
- **No section/page gradient washes:** backgrounds resolve to paper/white/brand-soft
  tokens; footer is warm (`.footer-modern`), never `bg-gray-900`/#111.
- **Fonts:** headings Fraunces (base `h*` rule), body Inter — both come free once wrapped.
- **Preserve behavior:** every nav/footer/logo link + href, every `data-testid`/`data-*`/
  `id`/`aria-*`/SEO hook, the mega-menu + hamburger. Affiliate anchors (none here) stay
  plain `<a>` + `data-*` + `rel="nofollow sponsored …"`, never an `onClick`.
- **A11y/responsive:** no horizontal overflow at 375/414px; nav/footer targets ≥44px
  (`.nav-link-block` / `.btn` enforce this); AA contrast; visible `:focus-visible`
  (base rule provides a 2px `--color-info` outline); single `<h1>`, clean heading order.
- **Do NOT** add Tailwind `z-*` utilities (header keeps `z-header`), edit
  `src/components/ui/*`, or introduce new `--tokens`. All new CSS is scoped under
  `.theme-modern` and uses existing `--color-*` / `--radius*` / `--space-*` / `--font-*`.

---

## 5. What this batch added to `theme-modern.css`

Section **§14 SHARED CHROME** (scoped under `.theme-modern`, existing tokens only, no
z-*): `.nav-link` (+ `.is-active`/`[aria-current]`), `.nav-marker`, `.nav-link-block`
(+ `.is-active`), `.footer-modern` (+ `h3`, `.footer-link`, `.footer-muted`). These fill
the only genuine gap for chrome — the base `a` rule paints links blue, which is wrong for
nav/footer chrome, and there was no warm footer surface. Everything else (buttons, cards,
badges, chips, eyebrows, leads, stats, sections, cta-band, surface-wash/brand) already
existed and is reused as mapped above. Build (incl. `verify-z-classes.mjs`) passes.
