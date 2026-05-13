# B1 — GABA / Natural-Anxiety URL Redirect Verification

**Slug:** `/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025`
**Reported symptom (A9):** 19 PV → 1 PV (−95%) over last 14d. Shape = collapse.
**Investigation date:** 2026-05-12
**Confidence:** 5 / 5 — no redirect bug exists.

---

## 1. TL;DR

**No redirect bug.** The URL resolves to a clean HTTP/2 200 from both www and non-www. There is no chain, no soft 404, canonical and `robots` are correct, the post JSON ships in the bundle, and the slug is in the sitemap and metadata index. PR #367's redirects do **not** touch this slug — they only rename two unrelated slugs (gen-z, social-media), kill `/dhm-dosage-calculator-new`, and add a non-www → www catch-all. The −95% PV drop has a non-technical cause (most likely SERP ranking loss or query-level cannibalization — not a delivery-layer problem).

---

## 2. Redirect chains (live, 2026-05-12)

### Subject URL (from www)
```
$ curl -sIL https://www.dhmguide.com/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025

HTTP/2 200
content-type: text/html; charset=utf-8
x-vercel-cache: HIT
content-length: 55311
etag: "fa7b2481d60712e372033dd4007b7ad8"
```
Single hop. No redirects. Page is fully prerendered (55 KB HTML).

### Subject URL (from non-www, exercising PR #367 bug 3)
```
$ curl -sIL https://dhmguide.com/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025

HTTP/2 308
location: https://www.dhmguide.com/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025
↓
HTTP/2 200
content-length: 55311
```
Exactly **one** 308 redirect to canonical www host, then 200. This is the intended PR #367 behavior. No chain.

### Healthy sibling (`/never-hungover/dhm-vs-zbiotics`)
```
$ curl -sIL https://www.dhmguide.com/never-hungover/dhm-vs-zbiotics

HTTP/2 200
content-length: 44499
x-vercel-cache: HIT
```
Identical pattern. Subject URL is actually **larger** (55 KB vs 44 KB).

### Prerendered SEO metadata (subject URL)
```html
<title>Natural Anxiety Relief: GABA Supplements vs. DHM for Stress Management (2025) | DHM Guide</title>
<meta name="description" content="Natural anxiety relief: Compare GABA vs DHM supplements...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.dhmguide.com/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025">
<meta property="og:url" content="https://www.dhmguide.com/never-hungover/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025">
```
Canonical is self-referential. `robots` is `index, follow`. Title matches the JSON.

---

## 3. PR #367 (commit `2937fba`) actually changed

Per `git show 2937fba -- vercel.json`, the 4 redirects added were:

| # | Source | Destination | Touches subject? |
|---|---|---|---|
| 1 | `/never-hungover/gen-z-mental-health-revolution-why-58%25-...-2025` | gen-z (clean slug) | No |
| 2 | `/never-hungover/social-media's-unseen-influence-...` | social-medias (clean slug) | No |
| 3 | `/dhm-dosage-calculator-new` | `/dhm-dosage-calculator` | No |
| 4 | `/(.*)` w/ host `dhmguide.com` | `https://www.dhmguide.com/$1` | Yes (host-level, expected) |

Rule 4 fires for non-www visitors and is **working as designed** (308, single hop). Nothing in PR #367 touches the `natural-anxiety` or `gaba` slug.

`grep -n "natural-anxiety\|gaba" vercel.json` → **0 matches**.

---

## 4. Other plumbing verified

| Check | Result |
|---|---|
| `src/newblog/data/posts/natural-anxiety-relief-gaba-supplements-vs-dhm-stress-management-2025.json` | Exists, 22,595 bytes |
| `src/newblog/data/postRegistry.js` line 150 | Lazy-import wired correctly |
| `src/newblog/data/metadata/index.json` lines 2875, 2877 | `id` and `slug` present |
| `public/sitemap.xml` line 929 | URL listed (www, https) |
| `src/App.jsx` | `/never-hungover/:slug` route registered (line 23) |
| Git log for the JSON file 2026-04-25 → 2026-05-12 | **No commits** touching this file in window |
| Vercel cache | HIT (page is hot, not cold-loading) |

---

## 5. Root cause

**Not a delivery-layer bug.** Likely causes for the 19 → 1 PV drop:

1. **SERP ranking decay.** A9 noted the rest of the corpus is mostly flat, but a single long-tail post can lose its main query at any time. PR #367 (2026-04-29) did force a recrawl wave — see #366 moratorium — which can re-evaluate posts at the current quality bar (DCNI Save/Merge/Delete bucketing, #365). This post may have been re-bucketed by Google.
2. **Query cannibalization.** Two sibling slugs both rank for "GABA + DHM" queries: `/never-hungover/gaba-gamma-aminobutyric-acid-complete-guide-...-2025` (sitemap line 725) and `/never-hungover/sleep-optimization-gaba-dhm-improve-sleep-quality-naturally-2025` (line 1085). Google may have re-promoted one of them and demoted the subject.
3. **Statistical noise on small N.** 19 PV/14d is a 1.4 PV/day baseline. A 1-PV measurement could simply be a slow week, not a collapse — though A9 flagged the shape as collapse, this should be confirmed with a 28-day or 56-day window before action.

**Recommended next step (not this agent's job):** Pull GSC for this URL — impressions, clicks, position, top query — for 2026-03-01 → 2026-05-12. If impressions held but clicks dropped → SERP feature loss. If impressions also collapsed → ranking loss. If neither → measurement noise.

---

## 6. Proposed patch

**None.** No code change indicated.

```diff
(no patch — the redirect/route layer is correct)
```

If, after GSC analysis, you find this is ranking loss and want to consolidate GABA traffic onto one canonical post, that becomes a content/IA decision (which of the 3 GABA-mentioning posts is the canonical hub?), not a `vercel.json` patch. Do not preemptively 301 this slug — it is still indexed and the live page is healthy.

---

## 7. Confidence: 5 / 5

Direct evidence from live HTTP, the PR diff, vercel.json, App.jsx routing, sitemap, metadata index, postRegistry, and the on-disk JSON all agree. The URL works. The traffic-drop hypothesis "PR #367 redirect-chain bug" is **falsified**.

Task #11 (B1 — GABA redirect verification): **completed**.
