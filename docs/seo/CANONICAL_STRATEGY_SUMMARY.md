# Canonical URL Strategy: Executive Summary

## The Problem

12 blog posts show "Duplicate without user-selected canonical" in Google Search Console, meaning Google chose different canonicals than your site specified.

**Root Cause:** SPA with 4 URL variants pointing to identical content:
- `/never-hungover/post` 
- `/never-hungover/post/` ← trailing slash (DUPLICATE)
- `/newblog/post` → 301 to canonical (but duplicate signal sent)
- `/blog/post` → 301 to canonical (but duplicate signal sent)

---

## Recommended Canonical Strategy

### Goal: Single Source of Truth

**Canonical URL Format:**
```
https://www.dhmguide.com/never-hungover/{slug}
```

**Key Rules:**
1. **No trailing slashes** - All variants with `/` redirect to non-slash version
2. **No legacy paths** - `/blog/*` and `/newblog/*` are 301 redirected BEFORE rendering
3. **HTTPS only** - All HTTP requests upgrade to HTTPS
4. **www required** - Non-www domain redirects to www version
5. **Lowercase slugs** - All URLs lowercase with hyphens
6. **Single canonical tag** - Index.html canonical updated per page

---

## Quick Implementation (2 Hours)

### Step 1: Update vercel.json (15 min)

**Add this redirect FIRST (before all others):**

```json
"redirects": [
  {
    "source": "/((?!api/).*)/",
    "destination": "/$1",
    "permanent": true
  },
  // ... rest of redirects
]
```

This catches `/post/` → `/post` at HTTP layer before React.

### Step 2: Remove client-side redirect (10 min)

**Delete lines 55-62 in App.jsx:**
```javascript
// REMOVE THIS:
if (currentPath.startsWith('/newblog')) {
  window.history.replaceState({}, '', currentPath.replace('/newblog', '/never-hungover'));
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return null;
}
```

Reason: vercel.json 301 redirects already handle this.

### Step 3: Update canonical script (5 min)

**File: canonical-fix.js**

Change line 12:
```javascript
// FROM:
const canonicalUrl = `https://www.dhmguide.com${currentPath}`;

// TO (normalize trailing slashes):
const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/') 
  ? currentPath.slice(0, -1) 
  : currentPath;
const canonicalUrl = `https://www.dhmguide.com${normalizedPath}`;
```

### Step 4: Deploy & Verify (10 min)

```bash
# Test trailing slash handling
curl -I https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025/
# Should: 301 redirect to version without slash

# Test canonical tag
curl https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025 | grep canonical
# Should: <link rel="canonical" href="https://www.dhmguide.com/never-hungover/does-dhm-work-honest-science-review-2025" />
```

### Step 5: Google Search Console (5 min)

1. Coverage report → "Duplicate without user-selected canonical"
2. Request indexing for canonical URLs
3. Monitor for resolution over 1-2 weeks

---

## Why This Works

| Before | After |
|--------|-------|
| `/post` → canonical: `https://www.dhmguide.com/post` | `/post` → canonical: `https://www.dhmguide.com/post` ✓ |
| `/post/` → canonical: `https://www.dhmguide.com/post/` (CONFLICT!) | `/post/` → 301 to `/post` |
| `/newblog/post` → redirect but duplicate signal | `/newblog/post` → 301 redirect at HTTP layer |
| `/blog/post` → redirect but duplicate signal | `/blog/post` → 301 redirect at HTTP layer |

Result: **Single canonical, single content, no duplicates**

---

## Expected Impact

- **Immediate**: HTTP layer handles duplicates before React renders
- **Week 1-2**: Google recrawls and recognizes single canonical
- **Week 2-4**: Google consolidates duplicate entries to single canonical
- **Ongoing**: New blog posts auto-canonicalized correctly

---

## Detailed Implementation Files

See `DUPLICATE_CONTENT_ANALYSIS.md` for:
- Complete code examples
- Testing procedures
- Prevention strategies for future content
- Post-fix audit checklist

---

## Current Status: 202 Blog Posts

✓ 190 posts: Correct canonicals  
✗ 12 posts: Different Google-chosen canonicals (being fixed)

**Action:** Fix vercel.json today, monitor GSC for improvement.

