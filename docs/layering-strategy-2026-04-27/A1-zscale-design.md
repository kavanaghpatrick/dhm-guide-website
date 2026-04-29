# A1 — Canonical Z-Index Scale Design (DHM Guide 2026-04-27)

**Author:** Layering Strategy WG
**Status:** Proposed (supersedes the post-PR #341 ad-hoc scale)
**Horizon:** 6–12 months
**Constraint that drives every decision:** Radix/shadcn primitives in `src/components/ui/*` (21 files) hard-code `z-50`. We **cannot** renumber them without forking. Therefore **`z-50` is the immovable anchor** and the rest of the scale must be designed around it.

---

## 1. Industry references (what we benchmarked)

| System | Anchor values | Notable patterns |
|---|---|---|
| **Bootstrap 5.3** | dropdown 1000 / sticky 1020 / fixed 1030 / offcanvas-bd 1040 / offcanvas 1045 / modal-bd 1050 / modal 1055 / popover 1070 / tooltip 1080 / toast 1090 | Pairs each overlay with a backdrop layer 5 below; toast above tooltip. |
| **Material UI** | mobileStepper 1000 / fab 1050 / appBar 1100 / drawer 1200 / modal 1300 / snackbar 1400 / tooltip 1500 | 100-step gaps; "modify all or none." |
| **Chakra UI** | hide -1 / base 0 / docked 10 / dropdown 1000 / sticky 1100 / banner 1200 / overlay 1300 / modal 1400 / popover 1500 / **skipLink 1600** / toast 1700 / tooltip 1800 | Explicit `skipLink` and `banner` semantic tokens. |
| **Mantine** | app 100 / modal 200 / popover 300 / overlay 400 / max 9999 | Reserves `max` as escape hatch. |
| **Shoelace** | drawer 700 / dialog 800 / dropdown 900 / toast 950 / tooltip 1000 | Smallest scale (5 tokens). |
| **MS Atlas** | dropdown 1000 / sticky 1020 / fixed 1030 / modal-bd 1040 / modal 1050 / popover 1060 / tooltip 1070 + interactive 1–4 | Splits "interactive states" (1–4) from "overlays" (1000+). |
| **USWDS** | bottom -100 / 0 / 100 / 200 / 300 / 400 / 500 / **top 99999** | Reserves a literal `top` token for must-be-on-top. |

**Convergent patterns we adopt:**
1. Three-band architecture: **content (0–99) → fixed/sticky chrome (100s) → overlays (1000s+) → ceiling (max)**.
2. Reserve a "**ceiling**" token (Mantine `max`, USWDS `top`, Chakra `skipLink`+`toast`) for absolute must-be-on-top elements.
3. Pair backdrops with content (Bootstrap modal-bd 1050 / modal 1055).
4. **Toast above modal, tooltip above toast** — this is universal.
5. Gaps of ≥10 between adjacent semantic layers, ≥50 between bands. No tied values.

**Patterns we deliberately reject:**
- 4-digit values everywhere (Bootstrap, MUI). They look authoritative but they make `z-9999` syndrome inevitable because devs feel "1500" is "low" and reach higher. Two-digit values inside the chrome band keep developers honest.
- Putting nav dropdown at the *same* numeric value as modal (Mantine's app=100/modal=200 collapses the chrome/overlay distinction).

---

## 2. Why the post-#341 scale needs a redesign (the 3 latent issues)

The current scale shipped in PR #341 as an emergency fix. It works for the bug it was sized to fix (mega-menu overlap), but inspection of live components reveals three concrete bugs and one structural risk:

| # | Element | Token used | Resolves to | Bug |
|---|---|---|---|---|
| 1 | `ComparisonWidget` (fixed bottom-right tray, `src/components/ComparisonWidget.jsx:60`) | `z-comparison` | **35** | Below `z-header (40)`. Header overlaps it on small viewports. Author intent comment in old L5 plan: "above page chrome, below modals." |
| 2 | Blog reading-progress bar (`src/newblog/components/NewBlogPost.jsx:719`) | `z-sticky` | **20** | Bar is `position:fixed` with `top: var(--header-height)` — it sits *just below* the header. With `z-20` it gets clipped under the header's `backdrop-blur` haze on Safari. Should be **above** header. |
| 3 | Reviews sticky banner (`src/pages/Reviews.jsx:1139`) | raw `z-40` | **40** | Ties with `z-header (40)`. Stack order is then DOM-order-dependent → flaky. Also bypasses the token system (raw Tailwind literal). |

**Plus structural problem:** `--z-index-modal: 50` is a *good* value (matches Radix), but `overlay: 45` is below it. A "modal backdrop" naturally wants to be paired *5 below* the modal content (Bootstrap pattern) — `overlay: 45` accidentally satisfies that, but it's never used that way; it's an orphan token.

---

## 3. Proposed canonical scale

### 3.1 The scale (semantic name → numeric → use case)

```
─── BAND A: behind / base ──────────────────────────────────────
behind            -1   Decorative under-flow (gradients, blobs)
base               0   Default document flow
─── BAND B: in-page elevated content ───────────────────────────
content           10   Promoted in-page elements (badges, focus rings,
                       resizer handles, sidebar rails, calendar dates)
                       — replaces all bare `z-10` / `z-20` literals.
─── BAND C: site chrome (sub-50, below Radix overlays) ─────────
sticky            20   In-page sticky UI (e.g. sticky table headers)
fixed-low         30   Fixed page-level UI under the header
                       (e.g. floating action buttons inside main content,
                       affiliate-disclosure sticky bars)
header            40   The site header. Anchor for the whole nav band.
banner            45   Promotional sticky banners that *replace* the
                       header's bottom edge (Reviews top-pick bar);
                       must be above header so border doesn't double.
─── BAND D: Radix / shadcn overlays (immovable, anchored at 50) ─
modal-backdrop    49   Modal backdrop (paired with modal-content;
                       used only by code we own, not Radix).
modal             50   ★ Radix Dialog/Sheet/Drawer/AlertDialog content,
                       Popover, DropdownMenu, ContextMenu, NavigationMenu
                       MegaMenu, HoverCard, Tooltip arrow, Select.
                       ★ ALL 21 shadcn ui/* files use this. IMMOVABLE.
comparison        55   Floating comparison widget — above modal so it
                       remains visible while a Radix popover/dropdown
                       opens (the widget is non-blocking, popovers are
                       transient). FIXES LATENT ISSUE #1.
─── BAND E: app-wide notifications & guidance ──────────────────
popover-elevated  60   Reserved: any custom popover that must sit
                       above `comparison` (e.g. "remove from compare"
                       confirmation). Currently unused — exists so a
                       future custom popover doesn't need an arbitrary
                       value.
toast             70   Sonner Toaster (currently uses Sonner's default
                       2147483647 internally — we set the wrapper
                       offset CSS var so visual stack matches).
tooltip           80   Custom tooltips that aren't Radix Tooltip.
                       (Radix Tooltip itself is at modal:50; that's a
                       quirk of the library and is fine because
                       tooltips don't co-exist with Radix overlays.)
progress-bar      90   Reading-progress bar / scroll indicators.
                       Above tooltip because users tracking progress
                       shouldn't have a tooltip occlude it.
                       FIXES LATENT ISSUE #2.
─── BAND F: ceiling (must-be-on-top, escape hatch) ─────────────
skip-link        100   Accessibility skip link on focus. WCAG-required;
                       must paint above any UI to be reachable.
                       Replaces magic-number `z-9999` patterns.
debug            999   Reserved for dev-only debug overlays
                       (PostHog session-replay markers, Vercel
                       speed-insights overlay, in-page outliner).
                       Ships in dev builds only; production strips it.
```

### 3.2 Visual band map

```
   value │ band │ role
   ──────┼──────┼─────────────────────────
     -1  │  A   │ behind
      0  │  A   │ base
     10  │  B   │ content (in-page elevated)
     20  │  C   │ sticky
     30  │  C   │ fixed-low
     40  │  C   │ header
     45  │  C   │ banner
     49  │  D   │ modal-backdrop
   ★ 50  │  D   │ modal  (Radix anchor — IMMOVABLE)
     55  │  D   │ comparison
     60  │  E   │ popover-elevated
     70  │  E   │ toast
     80  │  E   │ tooltip
     90  │  E   │ progress-bar
    100  │  F   │ skip-link
    999  │  F   │ debug
```

### 3.3 Why these specific numbers

- **Anchored at 50.** Every value above is *relative to* the immovable Radix anchor. This guarantees we never need to renumber when shadcn ships an update.
- **Two-digit values throughout** (except ceiling). Keeps z-index look small so developers don't reach for `z-9999`.
- **Gaps grow at band boundaries.** 10→20 (10 gap, same band) but 45→49→50 (tight, paired backdrop/content) and 55→60 (5 gap because comparison is a one-off; 60+ are independent).
- **No ties.** Every active token has a unique value. Inactive reserved tokens (`popover-elevated`, `debug`) are pre-numbered so the next dev doesn't invent a value.
- **No 4-digit values in production code.** `debug:999` is the highest production-callable token. Anything above is unreachable and that is the point.

---

## 4. The full `@theme` block to ship (paste-ready)

Replace `App.css` lines 31–42 with:

```css
@theme inline {
  /* --- Z-INDEX SCALE (canonical 2026-04-27) -----------------------------
     Anchored at modal=50 to match Radix/shadcn ui/* primitives (21 files
     hard-code z-50). DO NOT change `modal` without forking shadcn.
     Tailwind v4 generates `z-<name>` utilities from --z-index-<name> keys.
     Keep this block as the single source of truth — tailwind.config.js
     is silently ignored in v4.

     Bands: A=behind/base · B=content · C=chrome · D=overlays · E=notify
            · F=ceiling. See docs/layering-strategy-2026-04-27/A1.md.   */

  /* Band A — under/at flow */
  --z-index-behind:           -1;
  --z-index-base:              0;

  /* Band B — in-page elevated content */
  --z-index-content:          10;

  /* Band C — site chrome (below Radix anchor) */
  --z-index-sticky:           20;
  --z-index-fixed-low:        30;
  --z-index-header:           40;
  --z-index-banner:           45;

  /* Band D — Radix/shadcn overlays (anchored at 50) */
  --z-index-modal-backdrop:   49;
  --z-index-modal:            50;   /* ★ IMMOVABLE — matches stock z-50 */
  --z-index-comparison:       55;

  /* Band E — notifications & guidance */
  --z-index-popover-elevated: 60;
  --z-index-toast:            70;
  --z-index-tooltip:          80;
  --z-index-progress-bar:     90;

  /* Band F — ceiling */
  --z-index-skip-link:       100;
  --z-index-debug:           999;
}
```

This generates the following Tailwind utilities automatically: `z-behind`, `z-base`, `z-content`, `z-sticky`, `z-fixed-low`, `z-header`, `z-banner`, `z-modal-backdrop`, `z-modal`, `z-comparison`, `z-popover-elevated`, `z-toast`, `z-tooltip`, `z-progress-bar`, `z-skip-link`, `z-debug`.

---

## 5. Migration delta vs. current scale

| Current token | Current value | Action | New value | Why |
|---|---|---|---|---|
| `behind` | -1 | **stay** | -1 | unchanged |
| `base` | 0 | **stay** | 0 | unchanged |
| `dropdown` | 10 | **rename** → `content` | 10 | "dropdown" is misleading — Radix dropdown is at 50. The bucket is for in-page elevated content. |
| `sticky` | 20 | **stay** | 20 | unchanged |
| `fixed` | 30 | **rename** → `fixed-low` | 30 | "fixed" was ambiguous (header is also fixed). New name signals "fixed but below header." |
| `comparison` | 35 | **change** → 55 | 55 | Was below header, intent was above. **FIXES ISSUE #1.** |
| `header` | 40 | **stay** | 40 | unchanged (but no longer ties with anything). |
| `overlay` | 45 | **rename** → `banner` | 45 | Repurposed for sticky banners (Reviews bar). Backdrop role moves to `modal-backdrop:49`. |
| `modal` | 50 | **stay** | 50 | ★ Anchor. Cannot move. |
| `popover` | 60 | **rename** → `popover-elevated` | 60 | Clarifies it's *elevated* above modal (60≠50). Most "popovers" are actually Radix and stay at 50. |
| `notification` | 65 | **rename + bump** → `toast` | 70 | "notification" is vague; "toast" matches Sonner + every other library. Bumped to 70 to give the band more breathing room. |
| `tooltip` | 70 | **bump** → 80 | 80 | Tooltip > toast (universal). Was tied with `notification` ordering. |
| **NEW** `modal-backdrop` | — | **add** | 49 | Future-proofing for in-house modals that need a paired backdrop. Pattern from Bootstrap. |
| **NEW** `progress-bar` | — | **add** | 90 | **FIXES ISSUE #2.** Above tooltip because reading progress is informational and shouldn't be occluded. |
| **NEW** `skip-link` | — | **add** | 100 | A11y must-be-on-top. Ceiling token. |
| **NEW** `debug` | — | **add** | 999 | Dev-only escape hatch; prevents `z-9999` invention. |

**Net change:** 12 active tokens → 16 active tokens. 3 renames, 3 value changes, 4 new, 0 deletions.

---

## 6. Per-element reassignments (fixing the 3 latent issues + cleanup)

| # | File | Line | Before | After | Effect |
|---|---|---|---|---|---|
| 1 | `src/components/ComparisonWidget.jsx` | 60 | `z-comparison` (=35) | `z-comparison` (=55) | Token unchanged; **value changes via `@theme` update**. Now stacks above header. **FIXES ISSUE #1.** |
| 1b | `src/components/MobileComparisonWidget.jsx` | 61 | `z-comparison` (=35) | `z-comparison` (=55) | Same — token-level fix. |
| 2 | `src/newblog/components/NewBlogPost.jsx` | 719 | `z-sticky` (=20) | `z-progress-bar` (=90) | Reading progress bar moves to its own ceiling layer. **FIXES ISSUE #2.** |
| 3 | `src/pages/Reviews.jsx` | 1139 | raw `z-40` (tied with header) | `z-banner` (=45) | Removes raw literal, tie-break, and adopts semantic token. **FIXES ISSUE #3.** |
| 4 | `src/pages/DosageCalculatorEnhanced.jsx` | 802 | raw `z-50` (progress bar) | `z-progress-bar` (=90) | Same fix as #2 for the calculator's scroll indicator. |
| 5 | `src/pages/DosageCalculatorEnhanced.jsx` | 377 | raw `z-40` (FAB) | `z-fixed-low` (=30) | FAB inside content area, not chrome — should sit below header, not tie with it. |
| 6 | `src/components/StickyMobileCTA.jsx` | 72 | raw `z-50` | `z-modal` (=50) | Functionally identical, but tokenized. (Mobile sticky CTA legitimately stacks at the modal layer because it must beat the comparison widget and Radix popovers when active.) Add a code comment explaining why — this is the one production element that *intentionally* uses `z-modal` for non-Radix UI. |
| 7 | Skip-link CSS at `src/styles/calculator-enhancements.css:136` | 136–149 | no z-index | `z-index: var(--z-index-skip-link);` | Currently relies on stacking-context luck; the new ceiling token guarantees correctness. |

**Total file edits:** 7 files, ~10 lines changed. All are 1-line swaps; no logic changes.

---

## 7. Stock `z-50` elements we DESIGN AROUND (do not change)

These 21 files in `src/components/ui/*` hard-code `z-50` and **must not be edited** (they are shadcn/Radix primitives we don't fork):

| File | Component | What sits at `z-50` |
|---|---|---|
| `ui/dialog.jsx` | Dialog | overlay + content |
| `ui/alert-dialog.jsx` | AlertDialog | overlay + content |
| `ui/sheet.jsx` | Sheet | overlay + content |
| `ui/drawer.jsx` | Drawer | overlay + content |
| `ui/dropdown-menu.jsx` | DropdownMenu | content + sub-content |
| `ui/context-menu.jsx` | ContextMenu | content + sub-content |
| `ui/menubar.jsx` | Menubar | content + sub-content |
| `ui/select.jsx` | Select | content |
| `ui/popover.jsx` | Popover | content |
| `ui/hover-card.jsx` | HoverCard | content |
| `ui/tooltip.jsx` | Tooltip | content + arrow |
| `ui/navigation-menu.jsx` | NavigationMenu | viewport |

**Plus 1 in-house element that intentionally aligns with Radix's z-50:**
- `src/components/layout/Layout.jsx:398` — Topics mega-menu (portaled to body so it escapes the header's stacking context; uses raw `z-50` to stack at the same layer as Radix popovers, which is correct).

**Implication:** the entire scale is anchored at 50. Our chrome (band C) lives below; our notifications/ceiling (bands E, F) live above. We never assign a custom token to any value `≤ 50` that needs to outrank Radix overlays — if we need to, we use `z-comparison` (55) or above.

---

## 8. Anti-patterns the scale makes impossible

### 8.1 No more `z-9999` syndrome
The ceiling is `z-debug: 999`. There is no production reason to exceed it because:
- **A11y must-be-on-top → `z-skip-link` (100).**
- **Dev tooling → `z-debug` (999).**
- Sonner's internal `z-index: 2147483647` is a library implementation detail, not application code; we don't fight it. (We *could* override with `:root { --sonner-toast-z: 70; }` — recommended footgun-prevention but not strictly necessary.)

If a future dev reaches for `z-[1000]` or `z-9999`, they must explain why bands E/F are insufficient — the scale has 5 dedicated layers between toast and skip-link. PR review should reject any new arbitrary literal.

### 8.2 No tied z-indexes
Every active token has a **unique** numeric value. Tied values (which currently affect `header:40` and the Reviews banner using raw `z-40`) make stack order DOM-dependent and therefore flaky. The new scale has no values tied across active tokens.

### 8.3 No implicit dependence on stacking-context membership
This is the lesson from PR #341 (mega-menu overlap): a child's z-index is meaningless if the parent creates a stacking context (opacity<1, transform, filter, backdrop-filter, will-change, isolation: isolate). The scale itself can't prevent this, but we add three structural guards:

1. **Lint rule (eslint or codemod):** flag any element that uses both `backdrop-blur*` *and* contains z-tokened children. (The header is the canonical violator — `backdrop-blur-md` makes it a stacking-context root, trapping the dropdown's `z-50`. Resolved by portaling the dropdown to `document.body`.)
2. **Docs:** every `z-modal`, `z-toast`, `z-tooltip`, `z-skip-link`, `z-progress-bar` element **must** be either at `<body>` direct child level, or rendered through `createPortal(..., document.body)`. This is documented inline as a comment next to each token.
3. **Architectural rule:** the only `position: fixed` ancestor allowed to wrap z-tokened descendants is the page root `<div>` in `Layout.jsx`. Any other fixed wrapper that gets a z-class must portal its children to body.

### 8.4 No raw Tailwind z-literals in app code
Currently 7+ uses of `z-10`, `z-40`, `z-50` outside `ui/*`. Codemod after migration should replace all with semantic tokens (see §6). Going forward, lint rule disallows `z-\d+` outside `src/components/ui/*` (Radix) and `src/styles/` (utility CSS).

### 8.5 No "future-proofing" tokens with no current owner
Every reserved token (`modal-backdrop`, `popover-elevated`, `debug`) has a *concrete* future use case documented above. No `z-future-1`, no `z-misc`. If a use case can't be named, the token isn't added.

---

## 9. Migration sequence (suggested PR shape)

1. **PR-A (token-only, zero behavior change):** ship the new `@theme` block. Old token names that are removed (`dropdown`, `fixed`, `overlay`, `popover`, `notification`) are temporarily *aliased* to the new values for 1 release.
2. **PR-B (per-element reassignments):** apply the 7 file edits in §6. This is when the 3 latent issues actually get fixed. Verify in Vercel preview.
3. **PR-C (cleanup):** remove the temporary aliases from PR-A. Add the eslint rule for raw `z-\d+` literals.

Each PR is <30 lines of diff. Total effort: ~90 minutes including preview verification.

---

## 10. Summary

- **Scale anchored at `modal: 50`** because Radix/shadcn forces it.
- **16 semantic tokens across 6 bands** (behind→base→content→chrome→overlays→notify→ceiling) with no ties and clear gaps.
- **3 latent issues from PR #341 fixed** by token-value changes (1 file: `@theme`) + 7 element reassignments.
- **`z-9999` eliminated** by reserving `skip-link: 100` and `debug: 999` as the only ceiling tokens.
- **Stable for 6–12 months** because all values are *relative* to the immovable Radix anchor; shadcn updates can't break us.
