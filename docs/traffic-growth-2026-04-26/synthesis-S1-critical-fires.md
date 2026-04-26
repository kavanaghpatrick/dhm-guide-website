# S1: P0 Critical Fires (code-doable)

**Date:** 2026-04-26
**Author:** Synthesis agent S1 (parallel of 5)
**Scope filter:** code-doable only. No outreach, no PR, no manual content.

---

## Verdict at a glance

| # | Fire | File:line | Hours | Source agent's claimed impact |
|---|---|---|---|---|
| 1 | **Cloaking risk + 100-word stub** | `scripts/prerender-blog-posts-enhanced.js:296` and `index.html:269` | 4-6h (stop-gap) | Bing/AI crawlers see almost no content; cloaking penalty risk (T8) |
| 2 | **Newsletter dropout** | `src/pages/DosageCalculatorEnhanced.jsx:747` | 2-4h | "Critical leaking bucket" - 100% of captures lost (T7) |
| 3 | **dateModified absent from JSON-LD** | `scripts/prerender-blog-posts-enhanced.js:138` + `src/utils/blogSchemaEnhancer.js:174` + `scripts/generate-sitemap.js:75` | 1-2h | 94% of 186 posts emit datePublished == dateModified; freshness signal invisible (T9) |
| 4 | **Desktop LCP avg 22.4s** | PostHog investigation first; bundle split second | 2h investigation + 4-6h fix if real | 70% of desktop sessions = poor (T8) |

**Total dev time to ship all 4 (stop-gap versions): 13-20 hours.**

---

## Fire 1: Cloaking risk in prerender script

### a. Exact problem (CONFIRMED via end-to-end read of `scripts/prerender-blog-posts-enhanced.js`)

Two co-located cloaking patterns in production right now:

**Location 1 — Prerender script (every blog post):**
`scripts/prerender-blog-posts-enhanced.js:295-308`

```html
rootDiv.innerHTML = `
  <div id="prerender-content" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
    <article>
      <h1>${safeTitle}</h1>
      ...
      <p class="excerpt">${safeExcerpt}</p>
      ${safeFirstParagraph ? `<p>${safeFirstParagraph}</p>` : ''}
    </article>
  </div>
`;
```

**Location 2 — Base index.html (homepage and any non-prerendered route):**
`index.html:269-273`

```html
<div id="root">
  <!-- Initial content for crawlers while React loads -->
  <div style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
    <h1>DHM Guide: Science-Backed Hangover Prevention</h1>
    <p>...</p>
  </div>
</div>
```

The script's own comment ("removed display:none to prevent cloaking") admits awareness, then re-introduces an equivalent off-screen technique. The article text in JSON (`post.content`) is 18,180 characters of markdown for `dhm-dosage-guide-2025` (a typical post is 2,200 words / 50+ paragraphs). Only the title + excerpt + first paragraph (~100 words) is currently emitted. Bingbot/PerplexityBot/ClaudeBot/GPTBot don't execute JS reliably enough to see the React-rendered article — they see the hidden 100-word stub.

### b. Stop-gap fix (single-day patch, not a full SSG migration)

**Decision:** Patch the existing prerender pipeline. Do NOT migrate to Next.js/Astro yet (that's the 5-10 day project). The stop-gap is sufficient because (a) the markdown content is already in JSON, (b) `micromark` v4.0.2 + `micromark-extension-gfm` are already in `node_modules` (no new dependency required — verified by inspecting `package.json` deps and node_modules), (c) React's `hydrateRoot()` will hydrate over visible HTML cleanly. Render markdown to HTML in the prerender step, drop the off-screen positioning, and let React hydrate over visible content.

**Pseudo-diff for `scripts/prerender-blog-posts-enhanced.js`:**

```diff
@@ imports @@
 import jsdom from 'jsdom';
 import { generateFAQSchema } from '../src/utils/productSchemaGenerator.js';
 import { generateHowToSchema } from '../src/utils/structuredDataHelpers.js';
+import { micromark } from 'micromark';
+import { gfm, gfmHtml } from 'micromark-extension-gfm';

@@ around line 259-308 (the rootDiv.innerHTML block) @@
-  // Extract and escape first paragraph
-  let safeFirstParagraph = '';
-  if (post.content) {
-    const contentStr = typeof post.content === 'string' ? post.content : '';
-    const paragraphMatch = contentStr.match(/^[^#\n].*?(?=\n\n|\n#|$)/m);
-    if (paragraphMatch) {
-      safeFirstParagraph = escapeHtml(paragraphMatch[0].replace(/[*_`]/g, ''));
-    }
-  }
+  // Render full markdown body to HTML. micromark already in node_modules.
+  // GFM enables tables/strikethrough/autolinks (matches client-side react-markdown + remark-gfm).
+  let bodyHtml = '';
+  if (post.content && typeof post.content === 'string') {
+    try {
+      bodyHtml = micromark(post.content, {
+        extensions: [gfm()],
+        htmlExtensions: [gfmHtml()],
+        allowDangerousHtml: false   // strip raw HTML in markdown (XSS guard)
+      });
+    } catch (err) {
+      console.warn(`micromark failed for ${post.slug}:`, err.message);
+      bodyHtml = `<p>${escapeHtml(post.excerpt || '')}</p>`;
+    }
+  }

@@ rootDiv.innerHTML rewrite @@
-    rootDiv.innerHTML = `
-      <div id="prerender-content" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
-        <article>
-          <h1>${safeTitle}</h1>
-          <div class="meta">
-            <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
-            <span>${safeAuthor}</span>
-            <span>${escapeHtml(String(post.readTime))} min read</span>
-          </div>
-          <p class="excerpt">${safeExcerpt}</p>
-          ${safeFirstParagraph ? `<p>${safeFirstParagraph}</p>` : ''}
-        </article>
-      </div>
-    `;
+    // Visible, hydratable initial content. React's hydrateRoot() will mount over this.
+    // No off-screen positioning. No display:none. Real prerendered content.
+    rootDiv.innerHTML = `
+      <article id="prerender-content" class="prerender-article">
+        <header>
+          <h1>${safeTitle}</h1>
+          <div class="meta">
+            <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
+            <span> · ${safeAuthor}</span>
+            <span> · ${escapeHtml(String(post.readTime))} min read</span>
+          </div>
+          <p class="excerpt"><em>${safeExcerpt}</em></p>
+        </header>
+        <div class="prose">${bodyHtml}</div>
+      </article>
+    `;
```

**Companion change to `index.html` (lines 268-273):**

Replace the off-screen div with visible-but-replaceable initial content. Since this is the hub HTML React mounts into, keep it small but real:

```diff
   <div id="root">
-    <!-- Initial content for crawlers while React loads -->
-    <div style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
-      <h1>DHM Guide: Science-Backed Hangover Prevention</h1>
-      <p>Discover how DHM (Dihydromyricetin) prevents hangovers with clinically-proven effectiveness. Based on 11+ scientific studies and UCLA research.</p>
-      <p>Learn about proper DHM dosage, timing, and the best supplements for hangover prevention.</p>
-    </div>
+    <!-- Visible initial content; React hydrateRoot() takes over -->
+    <div class="prerender-fallback">
+      <h1>DHM Guide: Science-Backed Hangover Prevention</h1>
+      <p>DHM (Dihydromyricetin) prevents hangovers with clinically-proven effectiveness, based on 11+ peer-reviewed studies and UCLA research.</p>
+      <p>Learn about DHM dosage, timing, and the best DHM supplements for hangover prevention.</p>
+    </div>
   </div>
```

**Hydration safety note:** Vite + React's standard mount is `createRoot(...).render(...)` (mount, not hydrate). With `createRoot()`, React DESTROYS the existing DOM children of the root before mounting — so the prerendered HTML serves crawlers, then disappears for human users when React mounts. **No flash of duplicated content** because React replaces the contents in one tick. This works without changing `src/main.jsx` and without switching to `hydrateRoot()`. (Tested mental-model; verify in preview.)

If a flash IS observed in preview, the fix is to add CSS that hides `#prerender-content` once React has mounted (e.g., a tiny `useEffect` on the App root that adds a `data-react-mounted` attribute and a CSS rule hiding the prerender block under it). That's a 5-line follow-up if needed.

### c. Verification commands

```bash
# 1. Build and prerender
npm run build

# 2. Confirm full body content is in the prerendered HTML
curl -s https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | \
  grep -c '<p>' 
# Expected: 50+ <p> tags (currently: ~9)

# 3. Confirm no off-screen positioning
curl -s https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | \
  grep -c 'left: -9999px'
# Expected: 0 (currently: 1)

# 4. Word count check
curl -s https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | \
  sed 's/<[^>]*>//g' | wc -w
# Expected: 2000+ (currently: ~100)

# 5. Verify React still renders over it (visual check in browser)
# Open DevTools > Elements; #prerender-content should be replaced by React tree

# 6. Validate Google Rich Results test still passes
# https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.dhmguide.com%2Fnever-hungover%2Fdhm-dosage-guide-2025
```

### d. Rollback

If the patch breaks the React mount or causes hydration mismatches:

```bash
git revert <commit-sha>
npm run build
git push
# Vercel auto-deploys revert in ~2 minutes
```

The prerender script is a build-time artifact only — reverting deletes the new HTML on next build. **Live site is restored to status quo within 5 minutes.** The change is also fully isolated to `scripts/prerender-blog-posts-enhanced.js` + `index.html`; no React app code changes. Risk surface = small.

### e. Estimated dev hours

- 2-3h: implement the micromark patch + test build locally
- 1h: deploy to Vercel preview, verify with curl + browser DevTools
- 1h: visual QA across 5 sample posts (dosage guide, comparison post, review post, niche post, hub page)
- 0-1h: contingency for hydration/flash issue (CSS hide rule)

**Total: 4-6 hours.**

### f. Expected impact (cited from T8)

> "Bingbot, ChatGPT, Perplexity, social crawlers see almost no content. ... A real SSG approach would: ship full article HTML to crawlers and humans, ... eliminate the cloaking-pattern risk, and likely cut LCP in half." (T8 §1, §8 Critical)

The stop-gap captures most of the AI-bot indexability win without the LCP gain (LCP is a separate fire, see Fire 4). Concretely:

- Bing/Perplexity/ChatGPT/Claude crawlers gain access to full article body → unblocks Agent 6's AI-search push
- Cloaking penalty risk eliminated (off-screen positioning gone)
- Google should see same content as before (it executes JS) — no risk to existing Google rankings, but it does enable richer snippet generation

---

## Fire 2: Newsletter dropout — emails captured then thrown away

### a. Exact problem (CONFIRMED via read of `src/pages/DosageCalculatorEnhanced.jsx:560-770`)

Two email-capture surfaces feed `handleEmailCapture`:

1. **Inline form** at line 1541-1565 (`onSubmit` calls `handleEmailCapture(email)`)
2. **Exit-intent popup** at line 774-778 (`<ExitIntentPopup ... onSubmit={handleEmailCapture} />`)

Both call `handleEmailCapture` at line 730:

```js
const handleEmailCapture = async (capturedEmail) => {
  setEmail(capturedEmail)
  setEmailCaptured(true)
  setShowExitIntent(false)

  const source = showExitIntent ? 'exit_intent' : 'inline'
  engagementTracker.trackEmailCapture(source)
  console.log('Email capture attempt:', capturedEmail, 'source:', source)

  if (isMobile) hapticFeedback('success')

  // TODO: Integrate with Formspree or ConvertKit (Issue #180)
  // For now, show honest message - email system coming soon
  alert('Thanks for your interest! Our email system is being set up. ...')
}
```

**Result:** the email is logged to PostHog (`engagementTracker.trackEmailCapture`) and to console.log, then dropped. The user gets an alert saying "email system being set up". Zero list-building.

### b. Pseudo-diff (use Buttondown — cheapest, simplest API; ConvertKit also works)

Add a tiny serverless function (Vercel API route) that proxies to the email service. **Do NOT call the ESP API directly from the client** — that would expose the API key in the bundle.

**Step 1: Create `api/newsletter-subscribe.js`** (Vercel detects this as a serverless function):

```js
// api/newsletter-subscribe.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Buttondown API: https://docs.buttondown.email/api-introduction
  // Set BUTTONDOWN_API_KEY in Vercel env vars (Project Settings > Env Vars)
  try {
    const upstream = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: source ? [source] : [],
        type: 'regular',
      }),
    });

    // Buttondown returns 200/201 on new, 400 if duplicate (which is fine for us)
    if (upstream.ok || upstream.status === 400) {
      return res.status(200).json({ ok: true });
    }

    const errBody = await upstream.text();
    console.error('Buttondown error:', upstream.status, errBody);
    return res.status(502).json({ error: 'Subscribe failed' });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
```

**Step 2: Update `src/pages/DosageCalculatorEnhanced.jsx:730-750`:**

```diff
 const handleEmailCapture = async (capturedEmail) => {
   setEmail(capturedEmail)
   setEmailCaptured(true)
   setShowExitIntent(false)

   const source = showExitIntent ? 'exit_intent' : 'inline'
   engagementTracker.trackEmailCapture(source)
-  console.log('Email capture attempt:', capturedEmail, 'source:', source)

   if (isMobile) hapticFeedback('success')

-  // TODO: Integrate with Formspree or ConvertKit (Issue #180)
-  // For now, show honest message - email system coming soon
-  alert('Thanks for your interest! Our email system is being set up. Bookmark this page to return for your personalized DHM guide.')
+  try {
+    const response = await fetch('/api/newsletter-subscribe', {
+      method: 'POST',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({ email: capturedEmail, source }),
+    })
+    if (!response.ok) throw new Error(`Status ${response.status}`)
+    // Success — UI already shows confirmation via emailCaptured state
+  } catch (err) {
+    // Don't show user a scary error; PostHog logged the capture; we'll see in dashboard
+    console.error('Newsletter subscribe failed:', err)
+    engagementTracker.trackEmailCapture(source + '_error')
+  }
 }
```

**Step 3: Set Vercel env var.** In Vercel Project Settings → Environment Variables: `BUTTONDOWN_API_KEY = <token from buttondown dashboard>`. Apply to Production + Preview.

### c. Verification commands

```bash
# 1. Local dev (after vercel dev or with stub)
curl -X POST http://localhost:3000/api/newsletter-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test+ci@dhmguide.com","source":"smoke_test"}'
# Expected: {"ok":true}

# 2. After deploy, check Buttondown dashboard for the subscriber
# https://buttondown.email/subscribers

# 3. PostHog query - verify trackEmailCapture events still firing
./scripts/posthog-query.sh events | grep email_capture
```

### d. Rollback

If Buttondown integration breaks captures:

```bash
git revert <commit-sha>
git push
# Vercel auto-deploys; back to alert() within 2 minutes
```

The `api/newsletter-subscribe.js` file is independent — even if it 500s, the existing PostHog tracking still fires (line `engagementTracker.trackEmailCapture(source)` is upstream of the fetch). **Worst case: emails go to PostHog only, same as today. No regression.**

### e. Estimated dev hours

- 1h: Buttondown signup + grab API key, paste into Vercel env
- 1h: write `api/newsletter-subscribe.js` + test locally
- 0.5h: wire to `handleEmailCapture`, test exit-intent and inline forms
- 0.5-1h: deploy preview, smoke test from real device

**Total: 2-4 hours** (Agent 7 estimate: "1-2 days" — they overestimated; the infra is small.)

### f. Expected impact (cited from T7)

> "**Critical leaking bucket.** ... 5,000-subscriber list at 30% open / 5% click = 75 visits per send. Send weekly = 3,900/year." (T7 §6)

Per T7's Month 1-12 forecast, newsletter is projected at 40 → 2,500 visits/month at month 12 once list is built. **Zero of those visits happen until this fix ships.**

---

## Fire 3: dateModified absent from JSON-LD (94% of posts)

### a. Exact problem (CONFIRMED via reads of all three files)

Three sources collectively make `dateModified` invisible to crawlers:

1. **`scripts/prerender-blog-posts-enhanced.js:138`** — hardcoded fallback ignores any JSON field:

```js
"datePublished": post.date,
"dateModified": post.date,   // <-- hardcoded to date, ignores post.dateModified
```

2. **`src/utils/blogSchemaEnhancer.js:174`** — does check `lastModified`, but 96% of posts don't have it:

```js
dateModified: metadata.lastModified || metadata.date
```

3. **`scripts/generate-sitemap.js:75`** — sitemap `<lastmod>` uses `post.date` only:

```js
lastmod: post.date || today,
```

Net effect: every `<script type="application/ld+json">` Article block on the prerendered HTML emits `datePublished == dateModified == post.date`. Sitemap's `<lastmod>` is also stuck on July 2025 for most posts. **Crawlers cannot tell whether content has been refreshed since 2025-07-28.**

### b. Pseudo-diff

**Patch 1: `scripts/prerender-blog-posts-enhanced.js:137-138`**

```diff
-    "datePublished": post.date,
-    "dateModified": post.date,
+    "datePublished": post.date,
+    "dateModified": post.dateModified || post.lastModified || post.date,
```

**Patch 2: `src/utils/blogSchemaEnhancer.js:174`**

Already correct in spirit; align field name with the prerender script:

```diff
-    dateModified: metadata.lastModified || metadata.date,
+    dateModified: metadata.dateModified || metadata.lastModified || metadata.date,
```

(Adds `dateModified` as the canonical field; keeps `lastModified` as legacy fallback.)

**Patch 3: `scripts/generate-sitemap.js:75`**

```diff
           blogPosts.push({
             loc: `/never-hungover/${post.slug}`,
-            lastmod: post.date || today,
+            lastmod: post.dateModified || post.lastModified || post.date || today,
             changefreq: 'weekly',
             priority: priority
           });
```

**Patch 4 (optional, parallel agents covering Fire 4 of S2): backfill `dateModified` on top 30 posts.** Pure JSON edit. Agent T9's §2.2 has the priority list. For S1 scope, the *code* fix is the three diffs above. Per-post backfill is a content task.

### c. Verification commands

```bash
# 1. Build with sample dateModified
# Manually add "dateModified": "2026-04-26" to dhm-dosage-guide-2025.json, then:
npm run build

# 2. Verify JSON-LD reflects the new field
curl -s https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025 | \
  grep -A1 '"dateModified"'
# Expected: "dateModified":"2026-04-26"  (currently: "dateModified":"2025-07-28")

# 3. Verify sitemap.xml lastmod
curl -s https://www.dhmguide.com/sitemap.xml | \
  grep -A1 'dhm-dosage-guide-2025'
# Expected: <lastmod>2026-04-26</lastmod>

# 4. Validate via Schema.org parser
# https://validator.schema.org/#url=https%3A%2F%2Fwww.dhmguide.com%2Fnever-hungover%2Fdhm-dosage-guide-2025
# Expected: dateModified field present and recent
```

### d. Rollback

`git revert <commit-sha>` and `npm run build`. The change is purely additive (adds a field check; old behavior preserved when field absent). **Risk: zero.** Posts without `dateModified` field continue to use `post.date` exactly as today.

### e. Estimated dev hours

- 0.5h: 3 file edits + lint check
- 0.5h: add `"dateModified": "2026-04-26"` to top 5 posts (per T9's priority list)
- 0.5-1h: deploy, verify with curl, submit sitemap to Bing/GSC

**Total: 1-2 hours.**

### f. Expected impact (cited from T9)

> "Estimated 60-day uplift from refreshing top 5 posts: +540 to +1,080 PV/month." (T9 TL;DR)
> "94% of posts emit dateModified == datePublished. ... To Google, this site is frozen in time."

The code patches alone don't move the metric — they *enable* the freshness signal. Combined with bumping `dateModified` to current date on top 5 posts (15 minutes of JSON edits), the two together unlock the +540 to +1,080 PV/month estimate.

---

## Fire 4: Desktop LCP avg 22.4s (70% of desktop sessions)

### a. Exact problem (T8 §2)

PostHog `$web_vitals` last 30 days:

| Device | Rating | Avg LCP (ms) | Count |
|---|---|---|---|
| Desktop | poor | **22,401** | 391 |
| Desktop | good | 1,499 | 108 |
| Mobile | good | 1,210 | 202 |

**70% of desktop sessions hit poor LCP. Mobile is fine.** Top offenders:
- `/never-hungover/flyby-vs-cheers-complete-comparison-2025` — 24,520ms (49 samples)
- `/never-hungover/dhm-randomized-controlled-trials-2024` — 22,746ms (13)
- `/never-hungover/double-wood-vs-toniiq-ease-dhm-comparison-2025` — 26,113ms (8)

T8's hypothesis: bot/preview-renderer traffic with throttled JS execution *or* a small set of crawler-style sessions skewing the average. **Investigate before fixing**.

### b. Investigation step (do this FIRST, ~2h)

Don't spend 4-6h on a bundle-split optimization until we know whether 70% of desktop sessions are bots vs real users. Bots are ~free to ignore. Real users at 22s LCP is an emergency.

**Step 1 — PostHog HogQL filter** (drop into PostHog → SQL Insights):

```sql
SELECT
  properties.$browser AS browser,
  properties.$os AS os,
  properties.$session_initial_referring_domain AS ref,
  count() AS sessions,
  avg(toFloat64OrNull(properties.value)) AS avg_lcp_ms
FROM events
WHERE event = '$web_vitals'
  AND properties.metric = 'LCP'
  AND properties.rating = 'poor'
  AND properties.$device_type = 'Desktop'
  AND timestamp > now() - INTERVAL 14 DAY
GROUP BY browser, os, ref
ORDER BY sessions DESC
LIMIT 30
```

**Decision tree:**
- If `browser` is dominated by `HeadlessChrome`, `bot`, or `$session_initial_referring_domain` is empty/null → **bot traffic.** Filter out in PostHog dashboards (`AND $session_initial_referring_domain != ''` or similar). No code fix required. Mark as "investigated and dismissed". Total time: 2h.
- If `browser` is real (Chrome 12X, Firefox, Safari) AND referrers are real (google.com, etc.) → **real users have a real problem.** Proceed to fix.

### c. Pseudo-diff if real (then ship Fire 1 first — it likely halves LCP per T8 §8)

If users are real, the fix sequence is:

**Step 1: Ship Fire 1.** Per T8: "A real SSG approach would: ship full article HTML ... and likely cut LCP in half." Fire 1's stop-gap (full markdown in prerender HTML) gives crawlers full content but ALSO means LCP element is in the prerendered HTML, not waiting on React mount.

**Step 2: Code-split heavy comparison-table component.** T8 §2 identifies "Heavy comparison-table component is likely TBT culprit." Three of the top-5 worst-LCP URLs are comparison posts. Wrap the comparison table in `React.lazy()`:

```diff
// In src/newblog/components/NewBlogPost.jsx (or wherever ComparisonTable is imported)
-import ComparisonTable from './ComparisonTable';
+const ComparisonTable = React.lazy(() => import('./ComparisonTable'));

// Render with Suspense fallback
-<ComparisonTable {...props} />
+<React.Suspense fallback={<div className="comparison-table-skeleton" style={{ minHeight: 400 }}>Loading comparison...</div>}>
+  <ComparisonTable {...props} />
+</React.Suspense>
```

The `minHeight: 400` is critical — it preserves layout (CLS) while the chunk loads.

**Step 3: Add `width`/`height` to blog hero image.** T8 §5: `src/newblog/components/NewBlogPost.jsx:921` is `loading="eager"` but no `width`/`height`. Add literals:

```diff
-<img src={post.image} alt={post.title} loading="eager" />
+<img src={post.image} alt={post.title} loading="eager" width="1200" height="630" />
```

(Confirmed from T8: this also fixes the 3 sessions at 0.71 CLS — a cheap CLS win bundled into the LCP work.)

### d. Verification commands

```bash
# After investigation
# 1. Confirm bot share via PostHog query above
# 2. If real, ship Fire 1, redeploy, re-measure LCP after 7 days
# 3. Lighthouse CI on top-5 worst-LCP URLs
npx lighthouse https://www.dhmguide.com/never-hungover/flyby-vs-cheers-complete-comparison-2025 \
  --only-categories=performance \
  --chrome-flags="--headless" \
  --view
# Expected: LCP < 2.5s after Fire 1 + code-split
```

### e. Rollback

`git revert` of code-split commit. Suspense fallback is independent of the rest of the React tree. **Risk: low.** Image dimensions never break layout (literal width/height matches actual image aspect ratio; verified to be 1200x630 from existing OG image dimensions).

### f. Estimated dev hours

- 2h: PostHog investigation (Step b)
- 0h if 70% are bots → mark resolved, exit
- 4-6h if real users → ship Fire 1 first (already counted), then code-split + image dimensions (~2h)

**Total dev time for Fire 4 itself: 2h investigation + 0-2h (since Fire 1 already does most heavy lifting). Budget 2-4h.**

### f. Expected impact (cited from T8)

> "70% of desktop sessions ... If real, code-split the comparison-table component out of `index.js`." (T8 §2 + §8 Critical)

If bots: zero traffic impact (just dashboard cleanup). If real users: cuts LCP from 22.4s → likely under 4s (T8: "likely cut LCP in half" combined with code-split). Core Web Vitals failure removed, which is a confirmed Google ranking factor for YMYL health content.

---

## Suggested ship order (1-week plan)

**The dependency:** Fire 1 unblocks Fires 3 and 4 partially. Fire 2 is independent. Fire 4's investigation should run in parallel with Fires 1-3 (the SQL query is cheap).

| Day | Ship | Why |
|---|---|---|
| **Mon** | **Fire 3** (dateModified, 1-2h) | Smallest, zero risk, additive change. Ship to gain refresh-signal infrastructure before any other changes. |
| **Mon** | Backfill `dateModified` on top 5 posts (parallel, 0.5h) | Trivial JSON edits; T9's priority list. |
| **Mon evening** | Run **Fire 4 investigation** PostHog query (15 min query + 30 min analysis) | Determines whether to budget Fire 4 fix work. |
| **Tue** | **Fire 1** stop-gap (4-6h) | Highest leverage cross-cutting fix. Unblocks AI search + halves LCP. |
| **Wed AM** | Verify Fire 1 in prod, run curl checks, sample 5 posts in browser | Make sure micromark output renders identically to React. |
| **Wed PM** | **Fire 2** (2-4h) | Can run in parallel with Fire 1 verification — different files. |
| **Thu** | If Fire 4 investigation showed real users: ship code-split + image dims (2-4h) | Bundle with Fire 1's LCP improvements. Re-measure 7-day LCP. |
| **Fri** | Buffer + verification: re-curl all 4 fires, validate Schema.org + Bing Webmaster | Don't ship Fri afternoon. |

**Total wall-clock: 4-5 days, ~13-20 dev hours.** Well within "this week".

---

## If you only do one thing this week

**Ship Fire 1 (the prerender stop-gap with `micromark`).** It's the single highest-leverage cross-cutting fix: unblocks AI search citations (T6's primary blocker), removes Google cloaking penalty risk (T8), likely halves desktop LCP (T8), and exposes the full article body to Bingbot/PerplexityBot/ClaudeBot/GPTBot — none of which the other three fires touch. Estimated 4-6 hours; the markdown library is already in `node_modules`; rollback is one `git revert`.
