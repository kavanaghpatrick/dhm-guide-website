# A5: Native Popover API + CSS Anchor Positioning Migration Viability

**Date:** 2026-04-27
**Context:** PR #340 ships `createPortal(<div>, document.body)` for Topics mega-menu. Investigating viability of replacing with native HTML Popover API + CSS Anchor Positioning.
**Stack:** React 19.1, Vite 6.3, Tailwind v4, Radix UI primitives (popover/hover-card/navigation-menu/dropdown-menu installed).

---

## 1. Browser Support (April 2026)

| Feature | Global Support | Chrome | Safari | Firefox | iOS Safari |
|---|---|---|---|---|---|
| `popover` attribute | **91.76%** | 114+ | 17.0+ | 125+ | 17.0+ |
| `popovertarget` button | ~91% | 114+ | 17.0+ | 125+ | 17.0+ |
| CSS Anchor Positioning (`anchor-name`, `position-anchor`, `anchor()`) | **76-85%** | 125+ | **26.0+** | 147+ | **26.0+** |
| `@position-try` fallbacks | ~76% | 125+ | 26.0+ (full in 26.1) | 147+ | 26.0+ |
| `popover="hint"` | ~75% | 133+ | not yet | not yet | not yet |
| Interest invokers (`interesttarget`, `:interest-source`) | <30% (Chrome 139 experimental) | 139+ flag | no | no | no |

**Critical gap:** Anchor positioning requires Safari **26.0+ (Sept 2025)**. iOS users on iOS 17/18 (still ~15-20% of mobile traffic in early 2026) get *no* anchor positioning — only the popover top-layer behavior. Without `@supports` fallback they'd see un-positioned popovers centered in the viewport.

The popover attribute itself (top-layer + light-dismiss + Esc) is essentially universal at 91.76% — the only feature that's truly safe to ship without a fallback.

---

## 2. Pattern Comparison

| | A: Native popover + anchor | B: createPortal (current) | C: Floating UI | D: Radix UI |
|---|---|---|---|---|
| JS for positioning | None | Manual/none | Full JS positioning | Internal JS (Floating UI) |
| Escapes stacking contexts | Top-layer (always) | DOM-level (most cases) | DOM-level | DOM-level |
| Light-dismiss/Esc/focus trap | Built-in | Manual (we built it) | Manual | Built-in |
| Hover-keep-open | Needs JS | Needs JS (we have it) | Needs JS | Built-in |
| SSR/prerender safe | Yes (HTML-native) | Needs `mounted` flag (we have it) | Needs mount guard | Yes |
| Bundle cost | 0 | 0 (uses react-dom) | ~10KB | ~6-8KB (already bundled) |
| Browser fallback risk | Safari <26 needs `@supports` | None | None | None |

---

## 3. Specific Use Case: Topics Mega-Menu

The current implementation in `/Users/patrickkavanagh/dhm-guide-website/src/components/layout/Layout.jsx:389-462` does:
- `createPortal` to `document.body` (escapes header's `backdrop-filter` stacking context)
- Manual outside-click + Escape handler
- `onMouseEnter`/`onMouseLeave` on dropdown for hover-keep-open
- `left-1/2 -translate-x-1/2` for horizontal centering
- `top: headerHeight + 8` measured via `useHeaderHeight` hook

**What native popover would give us for free:**
- Top-layer (escapes ALL stacking contexts, including future `transform`/`filter` on header)
- Light-dismiss + Esc + focus management

**What native popover does NOT give us:**
- Hover-keep-open (still need `mouseenter`/`mouseleave` + `showPopover()`/`hidePopover()`)
- A clean migration path that works in Safari <26 without ugly fallback CSS

**`translateX(-50%)` centering:** Compatible with `popover` itself. With anchor positioning, prefer `justify-self: anchor-center` (cleaner, no UA-style conflicts). With anchor positioning, `inset: auto; margin: 0;` resets are mandatory — the UA stylesheet centers popovers in the viewport by default.

---

## 4. Migration Effort + Risks

| Component | Effort | Risk | Notes |
|---|---|---|---|
| Topics mega-menu (Layout.jsx) | **2-4 hours** | Medium | Hybrid: use `popover="manual"` + JS show/hide (preserves hover) + `position-anchor` with absolute-positioning fallback inside `@supports`. Removes ~30 lines of JS. |
| Radix dropdown-menu / popover / hover-card / navigation-menu | Block on upstream | High | shadcn wrappers around Radix. Radix has not migrated internally (issue #2941 open since June 2024, no milestone). Touching these breaks the abstraction. |
| Mobile menu | None needed | n/a | Not floating — inline expansion. No portal involved. |
| StickyMobileCTA | None | n/a | `position: fixed`, not a popover. |

**What breaks if we migrate the mega-menu:**
- Framer Motion exit animations: replace with CSS `@starting-style` + `transition-behavior: allow-discrete` (works in Chrome 117+, Safari 17.4+, Firefox 129+)
- React's `onMouseLeave` semantics still work — just call `hidePopover()` instead of setting state
- `useHeaderHeight` measurement still needed for top offset (anchor positioning can't read header height since dropdown anchors to *trigger button*, not header)
- TypeScript: `popover` attribute exists in `@types/react` 18.3+ / 19+. Ours is React 19.1 — fine.

**Prerender/SSR:** Native popover is HTML-native, no `mounted` flag needed. This is a clear win — removes the `useEffect(() => setMounted(true))` dance.

---

## 5. Recommendation: **Stay with `createPortal` for now. Migrate when iOS 26 reaches ~95% of our mobile traffic.**

**Why stay:**
1. Current implementation works. 91.76% native popover support sounds high, but the 76-85% anchor positioning support means ~15-20% of iOS visitors would hit the `@supports` fallback path — doubling our CSS surface area for a cosmetic gain.
2. PR #340's createPortal approach already escapes the header stacking context. The native top-layer is *technically* more bulletproof against future `transform`/`filter` on the header, but we control the header — we can just not add those properties.
3. Hover-keep-open still needs JS. Migration doesn't actually delete much code (~30 lines of `useEffect` + outside-click handler vs. ~15 lines of `showPopover`/`hidePopover` + still-required hover handlers).
4. Radix UI hasn't migrated internally (issue #2941 stalled). Mixing native popover for one component while keeping Radix popover/hover-card for others creates two mental models.
5. **The simplicity test fails:** the migration solves a problem we don't have (no broken stacking contexts in production), introduces fallback CSS for a non-trivial slice of iOS users, and saves <20 lines of code.

**Migrate when ALL of these are true** (likely Q4 2026 - Q1 2027):
- iOS 26+ adoption ≥ 95% of mobile traffic (check PostHog `$browser_version` for `Mobile Safari ≥ 26`)
- Radix UI ships native popover internally OR we decide to drop Radix for floating UI
- A new requirement appears that *needs* top-layer (e.g., we add `transform`/`filter` to the header for animation, or build a tooltip-on-popover scenario)

**If a new floating component is added before then:** use Radix popover/hover-card (already bundled, well-tested, handles all the edge cases). Don't roll a fresh native popover for one component.

---

## 6. Sample Code (For Future Reference)

If/when migration happens, this is the minimum-viable replacement for the mega-menu trigger + dropdown:

```jsx
// Trigger button — popovertargetaction="toggle" is the default
<button
  ref={topicsRef}
  popovertarget="topics-mega-menu"
  data-track="nav-topics-trigger"
  className="..."
  style={{ anchorName: '--topics-trigger' }}
>
  Topics <ChevronDown />
</button>

// Dropdown — popover="manual" (we control show/hide for hover semantics)
<div
  id="topics-mega-menu"
  popover="manual"
  ref={dropdownRef}
  onMouseEnter={() => dropdownRef.current?.showPopover()}
  onMouseLeave={() => dropdownRef.current?.hidePopover()}
  className="topics-popover ..."
>
  {/* clusters... */}
</div>
```

```css
.topics-popover {
  /* Reset UA defaults — critical */
  margin: 0;
  inset: auto;

  /* Fallback: simple fixed positioning matching current behavior */
  position: fixed;
  top: calc(var(--header-height) + 8px);
  left: 50%;
  transform: translateX(-50%);

  /* Progressive enhancement: tie to trigger button when supported */
  @supports (anchor-name: --x) {
    position-anchor: --topics-trigger;
    top: calc(anchor(bottom) + 8px);
    left: auto;
    transform: none;
    justify-self: anchor-center;
  }

  /* Discrete animation — no Framer Motion needed */
  opacity: 0;
  transition: opacity 200ms, display 200ms allow-discrete;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}
```

This deletes: `mounted` state + effect, outside-click handler, Escape handler, `createPortal`. Adds: ~25 lines of CSS.

---

## Sources
- [HTML popover global attribute — caniuse](https://caniuse.com/mdn-html_global_attributes_popover) (91.76% support)
- [CSS Anchor Positioning — caniuse](https://caniuse.com/css-anchor-positioning) (76-85% support, Safari 26+)
- [Using the Popover API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)
- [CSS Anchor Positioning API — Chrome for Developers](https://developer.chrome.com/docs/css-ui/anchor-positioning-api)
- [Radix issue #2941: Move components to popover API](https://github.com/radix-ui/primitives/issues/2941) (open since June 2024, no milestone)
- [@types/react popover support discussion](https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66550) (resolved in PR #69670)
- Current implementation: `/Users/patrickkavanagh/dhm-guide-website/src/components/layout/Layout.jsx:389-462`
