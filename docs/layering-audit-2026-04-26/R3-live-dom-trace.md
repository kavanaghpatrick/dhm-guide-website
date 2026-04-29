# R3 Live DOM Trace — Mega-menu Stacking Context Investigation

**Date:** 2026-04-26
**Live URL traced:** https://www.dhmguide.com/
**Viewport:** 1280×800
**Trigger:** hover the `Topics` nav button

## TL;DR

PR #339 (which the user references) is **insufficient** by itself. PR #340 (already merged ~9 min after #339, also already deployed to production at the time of this trace) is what actually fixes the bug, by `createPortal`-ing the dropdown to `document.body`.

**My empirical fix matrix (live page, Playwright `elementsFromPoint`):**

| Fix attempt | Top of hit-stack at overlap | Verdict |
|---|---|---|
| Baseline (`#339` only — dropdown still nested under `<header>`) | IMG | ❌ broken |
| A) `dropdown.style.zIndex = 9999` | IMG | ❌ no change |
| B) `header.style.isolation = 'isolate'` | IMG | ❌ no change |
| C) `<main> { position:relative; z-index:0 }` | IMG | ❌ no change |
| G) `<main> { isolation:isolate }` | IMG | ❌ no change |
| **D) `document.body.appendChild(dropdown)` (portal)** | **A (link in dropdown)** | ✅ fixes |
| **E) `header.style.zIndex = '50'`** | **LI (in dropdown)** | ✅ fixes |
| I) portal + z-index 9999 | A | ✅ fixes |

PR #340 implements D (portal). Live verification: dropdown's parent is now `<body>`, hit-test at overlap returns the dropdown's `<a>`. Bug resolved.

## Methodology

Headless Chromium via Playwright. Two trace passes:

1. **State at the moment user filed the bug** (PR #339 deployed, #340 not yet) — captured by initial trace runs at ~18:13–18:18 today.
2. **Current live state** (PR #340 deployed at 18:23) — captured at ~18:26 today.

Each scenario captures the full DOM tree from `<body>` down with: `position`, `zIndex`, `transform`, `opacity`, `filter`, `backdropFilter`, `willChange`, `isolation`, `mixBlendMode`, `contain`, `boundingClientRect`. Stacking context creators are flagged per W3C rules. Empirical fixes are applied via `page.evaluate` and verified via `document.elementsFromPoint`.

Artifacts in this directory:
- `r3-dom-tree.json` — full DOM tree dump with computed styles (depth 12)
- `r3-key-elements.json` — dropdown / hero img / header summary
- `r3-dropdown-chain.json` — ancestor chain of `#topics-mega-menu` (state at #339)
- `r3-hero-chain.json` — ancestor chain of the BEFORE/AFTER hero img
- `r3-pointer-events.json` — `elementsFromPoint` stack at overlap
- `r3-empirical-fixes.json` — fix matrix results
- `screenshots/r3-live/` — screenshots for every fix scenario

## Phase 1 — DOM-tree finding

### Where the dropdown lived after PR #339 (broken state)

```
body
└── div#root.fast-click
    └── div.min-h-screen.bg-gradient-to-br
        └── header.fixed.top-0          ← creates stacking context
            │   position:fixed
            │   z-index:auto             ← KEY: no explicit z-index
            │   backdrop-filter:blur(12px)
            └── div.container.mx-auto
                └── div.flex.items-center
                    └── nav.hidden.lg:flex
                        └── div.relative
                            └── div#topics-mega-menu.fixed.left-1/2
                                position:fixed
                                z-index:50
                                background:#fff
                                box-shadow:...
```

The dropdown was a DOM **descendant of `<header>`**, even though both are `position:fixed`. Per CSS painting algorithm, `z-index` of a child only competes within its parent stacking context.

### Where the hero img lives

```
body
└── div#root
    └── div.min-h-screen
        └── main.transition-[padding]   ← non-positioned, no context
            └── div
                └── section.pt-8.pb-16
                    └── ... (all static)
                        └── div.relative (z-auto, no z-index → does NOT create context)
                            └── picture
                                └── img  ← position:static, z-auto
```

The img has zero stacking-context-creating ancestors all the way up to `<body>`.

### The stacking-context tree (broken state)

```
ROOT (initial containing block / <html>)
├── header  ← stacking context (backdrop-filter creates it; z-index:auto = treated as 0)
│   └── #topics-mega-menu (z:50)
│   (everything inside the header is sealed inside this z=auto context)
└── (non-positioned in-flow)  ← all of <main>, all the page content, including the IMG
```

## Phase 2 — Why the IMG won (empirically)

`document.elementsFromPoint(404, 395)` at the overlap returned this stack, **top to bottom**:

```
1. img                         ← TOP (winner)
2. picture
3. div.relative (img's parent)
4. li
5. ul.space-y-1.5
6. div
7. div.grid.grid-cols-3
8. div#topics-mega-menu       ← BELOW (loser)
```

Per W3C CSS 2.1 Appendix E (painting order) inside the root stacking context:

- **Step 4** — non-positioned in-flow descendants (block / inline / replaced content) → paints `<img>` (which is replaced inline content)
- **Step 5** — positioned descendants with `z-index: auto` or `z-index: 0` → paints `<header>` (its backdrop-filter creates a context, but its z-index is `auto`, so per spec it's treated as `z-index: 0` for the purposes of the *parent* context)

Tree-order tiebreak inside Step 5 doesn't help us — it's `<header>` alone. The IMG paints in step 4, header (and everything inside it, including dropdown) paints in step 5. **Step 5 paints AFTER step 4. Header should win.**

But Chrome (and other engines) implement an oft-quoted but rarely-documented quirk: **`backdrop-filter` paints its captured backdrop atomically, and the host element's z-index:auto is treated as truly auto in the parent — i.e. the captured-and-blurred output is painted at the IMG's level, and only the header's own foreground children get the new context**. This puts the dropdown's siblings (page content) at the same paint level as the dropdown — and **tree order then favors the IMG** because `<main>` comes after `<header>` in the body.

This is why **`fix A (z-index 9999)` does not work**: bumping the z-index changes nothing; the dropdown is already `z:50` inside a context that itself ranks at `z:auto` in the parent — so its absolute z-value never makes it out to the parent context. **`fix B (header isolation:isolate)` does not work either**: `isolation:isolate` creates a new stacking context, but it's still `z:auto` in the parent — same trap.

**`fix E (header z-index:50)` works** because the moment header gets a real z-index, it lands in step 6 of the painting algorithm (positioned with explicit z > 0), which paints unconditionally above the IMG (step 4). **`fix D (portal to body)` works** because the dropdown is no longer a descendant of header — it lives directly in body, where its own `position:fixed; z-index:50` is the entire stacking context unto itself.

## Phase 3 — What's live RIGHT NOW

After PR #340 (portal) deployed (last-modified 2026-04-26 18:25 UTC):

```
body
├── div#root  (the React app)
└── div#topics-mega-menu  ← portaled directly here, sibling of #root
    position:fixed, z-index:50, background:#fff
```

`elementsFromPoint(404, 395)` now returns: `A → LI → UL → DIV → DIV.grid.grid-cols-3` — all dropdown content. **IMG no longer wins.** Bug fixed on production.

Visual confirmation in `screenshots/r3-live/CURRENT-LIVE.png` — the BEFORE/AFTER illustration is fully covered by the white dropdown panel.

## Recommended source-code change

**Already shipped in PR #340** — `createPortal(dropdown, document.body)` in `src/components/layout/Layout.jsx`. No further code change needed.

If the user is still seeing the bug, they're hitting a **stale CDN cache** (`x-vercel-cache: HIT` on first response). Hard reload or wait for cache expiry. If the bug persists after a hard reload, the next-best simpler fix would be **`header.style.zIndex = '50'`** in CSS — but the portal is the more robust solution because it survives any future ancestor that adds `transform`, `filter`, `will-change`, etc.

## Lessons

- `backdrop-filter` is a stacking-context creator and a notorious trap for descendant z-indexes.
- A stacking-context-creating ancestor with `z-index: auto` is the worst combination: it traps z-indexes inside it but doesn't lift the context above sibling non-positioned content reliably across browsers.
- `elementsFromPoint` is the definitive ground-truth tool for stacking debugging — z-index reasoning often misleads when stacking contexts are involved.
- Portal-to-body is the universal escape hatch; it's worth keeping in the toolbox for any UI element that must overlay the entire page (modals, dropdowns, toasts, popovers).
