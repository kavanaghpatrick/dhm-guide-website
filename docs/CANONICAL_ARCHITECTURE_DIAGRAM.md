# Canonical Tags - Architecture Diagram

## Current Multi-Layer System

```
┌─────────────────────────────────────────────────────────────────┐
│ BROWSER REQUEST (e.g., /guide)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Server Returns Initial HTML                             │
│                                                                  │
│ <link rel="canonical" href="https://www.dhmguide.com" />        │
│                                                                  │
│ ⚠️  WRONG FOR /guide - should be /guide                         │
│ 📊 THIS IS WHAT GOOGLE CRAWLER CAPTURES                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ GOOGLE CRAWLER       │  │ BROWSER PARSING      │
        │ Records canonical:   │  │ Loads JavaScript     │
        │ https://dhmguide     │  │ Files                │
        │                      │  │                      │
        │ (Already indexed!)   │  │ <script src="/      │
        │ ⚠️ DUPLICATE OF HOME │  │  canonical-fix.js">  │
        └──────────────────────┘  └──────────┬───────────┘
                                             │
                                             ▼
                        ┌────────────────────────────────────────┐
                        │ LAYER 1: canonical-fix.js              │
                        │ (Runs EARLY - before React)            │
                        │                                        │
                        │ Updates canonical to:                  │
                        │ https://dhmguide.com/guide ✓ CORRECT  │
                        └────────────────┬───────────────────────┘
                                         │
                                         ▼
                        ┌────────────────────────────────────────┐
                        │ LAYER 2: React Loading                 │
                        │ (Hydration in progress)                │
                        │                                        │
                        │ - Downloads JS bundles                 │
                        │ - Parses route: /guide                 │
                        │ - Mounts Guide component               │
                        └────────────────┬───────────────────────┘
                                         │
                                         ▼
                        ┌────────────────────────────────────────┐
                        │ LAYER 3: useSEO Hook                   │
                        │ (Runs AFTER component mount)           │
                        │                                        │
                        │ Updates canonical again to:            │
                        │ https://dhmguide.com/guide ✓ CORRECT  │
                        │                                        │
                        │ (Redundant - already fixed by Layer 1) │
                        └────────────────────────────────────────┘

⏰ TIMELINE:
   T=0ms    Google crawler gets initial HTML (canonical = home) ❌
   T=50ms   canonical-fix.js runs (canonical = /guide) ✓
   T=200ms  React loads
   T=500ms  useSEO hook runs (canonical = /guide) ✓

📊 PROBLEM: Google indexed at T=0ms with wrong canonical
```

---

## Blog Posts (Working Correctly)

```
┌─────────────────────────────────────────────────────────────────┐
│ BUILD TIME: Prerendering                                        │
│                                                                  │
│ scripts/prerender-blog-posts.js                                 │
│ - Reads: /src/newblog/data/posts/example.json                   │
│ - Extracts: slug = "example-post"                               │
│ - Creates: /dist/never-hungover/example-post/index.html         │
│                                                                  │
│ <link rel="canonical"                                           │
│       href="https://www.dhmguide.com/never-hungover/            │
│            example-post" /> ✓ BAKED INTO INITIAL HTML           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ DEPLOYMENT TO VERCEL                                            │
│                                                                  │
│ /dist/never-hungover/example-post/index.html                    │
│ (Contains correct canonical in static file)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ GOOGLE CRAWL                                                     │
│                                                                  │
│ Requests: /never-hungover/example-post                          │
│ Receives: Static HTML with canonical already set ✓              │
│ Indexes: Correct canonical immediately                          │
│ No JavaScript needed!                                           │
└─────────────────────────────────────────────────────────────────┘

⏰ TIMELINE:
   T=0ms    Google gets static HTML (canonical = /never-hungover/example-post) ✓
   ✅ WORKS PERFECTLY
```

---

## Competing Implementations (Redundant)

```
LAYER 3a: useSEO Hook (/src/hooks/useSEO.js:79-88)
  └─ Document.querySelector('link[rel="canonical"]')
     └─ Update href via DOM manipulation
        └─ Only works AFTER React component mounts
           └─ Too late for Google's initial crawl ❌

LAYER 3b: canonical-fix.js (Early competitor)
  └─ Also queries 'link[rel="canonical"]'
     └─ Updates same element
        └─ Runs earlier, but still JavaScript ⚠️
           └─ Race condition with useSEO hook ❌

LAYER 3c: prerender-meta-tags.js (100KB+ script)
  └─ Generates HUGE embedded inline script
     └─ Contains all blog post metadata duplicated
        └─ Still JavaScript execution required ❌
           └─ Redundant with prerender-blog-posts.js ❌
              └─ File: /scripts/prerender-meta-tags.js

LAYER 3d: inject-canonical-tags.js (Duplicate)
  └─ Same as prerender-meta-tags.js
     └─ Also embedded inline script
        └─ Also blog posts only
           └─ DUPLICATE - should delete ❌
              └─ File: /scripts/inject-canonical-tags.js

RESULT: 4 competing systems trying to update the same <link> tag
        All JavaScript-based (all too slow for Google)
```

---

## Decision Tree: Which Canonical Gets Used?

```
                           ┌─ Browser Request
                           │
                    ┌──────┴──────┐
                    │             │
         Static?    ▼             ▼    Dynamic?
                 Index.html    React Page
         (Blog post or main)
                 │                │
                 ▼                ▼
        Prerendered HTML      Initial HTML
        (Canonical baked      (Base canonical:
         in static file)       home page)
                 │                │
                 ▼                ▼
        ✅ Google sees        ⏰ Race condition:
        correct canonical     - canonical-fix.js tries to fix
        on first crawl        - useSEO hook tries to fix
                              - Multiple scripts compete
                              ❌ Too late usually
```

---

## File Organization

```
/Users/patrickkavanagh/dhm-guide-website/
│
├── index.html
│   └── Base canonical: https://www.dhmguide.com (WRONG for most pages)
│       └── <script src="/canonical-fix.js"></script>
│
├── canonical-fix.js
│   └── Early client-side fix (still JavaScript ⚠️)
│
├── src/
│   └── hooks/
│       └── useSEO.js
│           └── useSEO hook (lines 79-88)
│               └── generatePageSEO function (lines 120-359)
│                   └── Defines all canonical URLs
│
├── scripts/
│   ├── prerender-main-pages.js ✅ WORKS (static)
│   │   └── Creates /dist/{route}/index.html with canonical
│   │
│   ├── prerender-blog-posts.js ✅ WORKS (static)
│   │   └── Creates /dist/never-hungover/{slug}/index.html
│   │
│   ├── prerender-meta-tags.js ⚠️ REDUNDANT (100KB+ JS)
│   │   └── Generates inline script (embedded in HTML)
│   │
│   ├── inject-canonical-tags.js ⚠️ DUPLICATE (inline JS)
│   │   └── Another inline script (overlaps above)
│   │
│   └── generate-blog-canonicals.js ❌ UNUSED (output ignored)
│       └── Creates /public/blog-canonicals.json
│
└── dist/
    ├── index.html (prerendered with canonical=home)
    ├── guide/
    │   └── index.html (prerendered with canonical=/guide) ✓
    ├── reviews/
    │   └── index.html (prerendered with canonical=/reviews) ✓
    ├── never-hungover/
    │   ├── post1/
    │   │   └── index.html (prerendered with correct canonical) ✓
    │   ├── post2/
    │   │   └── index.html (prerendered with correct canonical) ✓
    │   └── ...
```

---

## Reliability Matrix

```
                    When Does Google     Is It
                    See Canonical?       Reliable?
────────────────────────────────────────────────────
Prerendered HTML    T=0ms (initial)      ✅ HIGH
(blog posts, main)
────────────────────────────────────────────────────
useSEO Hook         T=500ms+ (JS)        ❌ LOW
(React component)
────────────────────────────────────────────────────
canonical-fix.js    T=50ms (early JS)    ⚠️ MEDIUM
(early but still JS)
────────────────────────────────────────────────────
Embedded scripts     T=0ms (inline)       ⚠️ MEDIUM
(prerender-meta,    but still JS
inject-canonical)
```

---

## Conclusion: Why Blog Posts Work, Dynamic Pages Don't

```
BLOG POSTS (prerendered at build time):
┌─────────────────────────────────┐
│ /dist/never-hungover/post/      │
│ index.html                      │
│                                 │
│ Contains:                       │
│ <link rel="canonical"           │
│  href="https://dhmguide.com/    │
│       never-hungover/post" />   │ ✅ IN INITIAL HTML
│                                 │
│ Google crawls static file       │
│ Sees correct canonical at T=0ms │
│ Indexes correctly              │
└─────────────────────────────────┘

DYNAMIC PAGES (React-rendered):
┌─────────────────────────────────┐
│ /index.html (from server)       │
│                                 │
│ Contains:                       │
│ <link rel="canonical"           │
│  href="https://dhmguide.com" /> │ ❌ BASE URL IN INITIAL HTML
│                                 │
│ Google crawls at T=0ms          │
│ Records wrong canonical         │
│ JavaScript updates later (T=50ms) │
│ Too late - already indexed      │
│                                 │
│ Result: Page appears as         │
│ duplicate of home page          │
└─────────────────────────────────┘
```

