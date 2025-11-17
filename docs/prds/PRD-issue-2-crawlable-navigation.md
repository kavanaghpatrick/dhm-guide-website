# PRD: Fix Non-Crawlable Navigation (Issue #2)

## Problem Statement
Header and footer navigation uses `<button>` elements instead of semantic `<a href>` tags, making 169+ pages non-crawlable by search engines and blocking PageRank flow.

## Current State (Evidence)
- **File**: `src/components/layout/Layout.jsx`
- **Lines affected**: 42-77 (header nav), 111-118 (mobile nav), 164-179 (footer nav)
- **Total buttons**: ~24 navigation elements
- **Crawlable links**: 0 in navigation (only 4 in noscript tag)
- **Impact**: Google can't discover pages through site navigation

**Code pattern (current):**
```jsx
<button onClick={() => handleNavigation('/guide')}>
  Hangover Relief
</button>
```

## Proposed Solution (One Sentence)
**Replace all navigation buttons with semantic anchor tags while preserving SPA behavior via onClick + preventDefault.**

**Code pattern (fixed):**
```jsx
<a
  href="/guide"
  onClick={(e) => {
    // Allow Ctrl/Cmd+click for "open in new tab"
    if (e.metaKey || e.ctrlKey) return;

    e.preventDefault();
    handleNavigation('/guide');
  }}
>
  Hangover Relief
</a>
```

## Expected Outcome
- ✅ 24 crawlable `<a href>` links in header/footer navigation
- ✅ 169 blog posts discoverable through site navigation
- ✅ PageRank flows through internal link structure
- ✅ SPA navigation preserved (no page reloads)
- ✅ Accessibility improved (keyboard nav, right-click "open in new tab")

## Implementation Details

### Files to Modify
1. `src/components/layout/Layout.jsx` - Single file change

### Changes Required
**Header Desktop Nav (lines ~55-65):**
```jsx
// BEFORE
{navItems.map((item) => (
  <button onClick={() => handleNavigation(item.href)}>
    {item.name}
  </button>
))}

// AFTER
{navItems.map((item) => (
  <a
    href={item.href}
    className={/* keep existing button classes */}
    onClick={(e) => {
      // Allow Ctrl/Cmd+click for "open in new tab"
      if (e.metaKey || e.ctrlKey) return;

      e.preventDefault();
      handleNavigation(item.href);
    }}
  >
    {item.name}
  </a>
))}
```

**Repeat pattern for:**
- Header logo (line ~42)
- Mobile navigation (lines ~111-118)
- Footer quick links (lines ~164-170)
- Footer resources (lines ~171-179)
- Header CTA button (line ~75)

### CSS Considerations
- Anchor tags inherit existing button styling (classes remain)
- Add `text-decoration: none` if needed
- May need `cursor: pointer` (usually default for anchors)

## Time Estimate
- **Code changes**: 30 minutes (24 button→anchor conversions)
- **Testing**: 15 minutes (SPA nav, crawl verification)
- **Total**: 45 minutes

## Testing Checklist
- [ ] SPA navigation still works (no page reloads on normal click)
- [ ] Links appear in "View Page Source"
- [ ] Right-click "Open in New Tab" works
- [ ] Ctrl+click (Windows) and Cmd+click (Mac) open in new tab
- [ ] Middle-click opens in new tab
- [ ] Keyboard navigation (Tab key) works
- [ ] Mobile navigation unchanged
- [ ] External links (if any) still work without preventDefault
- [ ] `curl https://www.dhmguide.com/ | grep '<a href'` shows navigation links

## Simplicity Check
- ✅ "Can I explain this in one sentence?" YES - Replace buttons with anchors
- ✅ "Does this solve a problem we actually have?" YES - Zero crawlable nav links
- ✅ "Can we ship without this?" NO - Critical for SEO
- ✅ "Is there a 10x simpler solution?" NO - This IS the simplest solution
- ✅ "Does this add more than 20 lines of code?" NO - Net zero (replace, don't add)

## Risks
- ❌ **None** - This is a standard pattern for SPA navigation
- ✅ Preserves existing behavior while adding SEO benefit
- ✅ No new dependencies or complexity

## Success Metrics
- Navigation links visible in View Source
- Google Search Console shows increased internal links discovered
- PageRank flows to previously isolated blog posts
