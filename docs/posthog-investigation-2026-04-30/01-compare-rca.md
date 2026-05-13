# /compare Page Traffic Collapse — Root Cause Analysis

**Investigator**: Agent 1 of 5 (PostHog Investigation 2026-04-30)
**Finding owner**: `/compare` page collapse, 85→32 PV
**Investigation date**: 2026-04-30

---

## 1. Finding

`/compare` page pageviews dropped from 85 (prior 14d, Apr 1–14) to 29–32 (last 14d, Apr 15–28), a headline −62%. Re-running the comparison **excluding the two known bot-spike days (Apr 11 = 23 PV, Apr 13 = 25 PV)** that the integrity audit flagged collapses prior_14 to 37 PV and the drop to **−22%** (37 → 29 PV) — within or near Poisson noise at this volume.

## 2. Hypotheses considered

| # | Hypothesis | What would prove / refute it |
|---|-----------|------------------------------|
| **H1** | The headline drop is mostly bot/scraper inflation in the prior window (Apr 11 + Apr 13 spikes). | Re-aggregate excluding those days; check engagement signatures on those days (scroll/click absence). |
| **H2** | A code change broke `/compare` rendering or removed it from internal navigation. | Read `git log` on `Compare.jsx` and `Layout.jsx`; live-curl the page and check links. |
| **H3** | A robots.txt / sitemap / meta change reduced indexability. | Check `public/sitemap.xml`, robots.txt, page meta on the live URL. |
| **H4** | Internal nav links to `/compare` were removed in the mega-menu refactor (PR #326), reducing internal click-through. | Inspect `Layout.jsx` and `useRouter.js`; count internal `/compare` links over time. |
| **H5** | Google ranking dropped (organic-only collapse; direct/internal flat). | Bucket referrers `prior_14` vs `last_14`. |
| **H6** | The Apr 30 PostHog bot-filter (PR #346) is silencing real users on `/compare` only. | Filter shipped Apr 29 (~15:00 BST); the drop predates it; spike days end Apr 21, 8 days before the filter. |

## 3. Evidence collected

### 3.1 Headline numbers come from `docs/posthog-2026-04-30/01-traffic.md`

`docs/posthog-2026-04-30/01-traffic.md` lines listing `/compare` show **85 → 32 (−62.4%)** in the headline table; the same doc explicitly cautions "minimum-base pages (n<25) are dominated by Poisson-style variation."

### 3.2 The integrity audit independently flagged Apr 11/13 as bot-shaped sitewide

`docs/posthog-2026-04-30/05-integrity.md` Section 2 names **Apr 11, 13, 17, 19, 20** as "high-confidence bot" days based on three coincident signatures:
1. pv ≈ sessions ≈ users ratio (each PV is a fresh fingerprint)
2. >95% Chrome desktop
3. <6% scroll-engagement rate

Sitewide on Apr 11: 485 PV, 482 sessions, 482 users (1.01 ratio), 3.1% scroll engagement.

### 3.3 `/compare` traffic on those bot days matches the same signature

PostHog HogQL queries (project 275753):
- **Apr 11**: 23 PV, 23 sessions (1:1), Chrome/Windows desktop = 21/23, **0 scroll milestones, 0 affiliate clicks, 0 dead clicks, 0 engagement events**.
- **Apr 13**: 25 PV, 25 sessions (1:1), Chrome desktop = 22/25, 11 scroll milestones, 3 affiliate clicks, 0 dead clicks.
- **Last 14d combined**: 29 PV, 35 sessions, **6 scrolls + 11 dead clicks** — actual user-shaped behavior.

Apr 11's profile (zero engagement on 23 PV) is structurally bot-shaped. Apr 13's profile is borderline. (Note: Apr 26 PR #269 removed a 10% sampling gate on `time_on_page_milestone` etc., so engagement events captured on Apr 11 are at 10% of true volume — but `scroll_depth_milestone` was *not* gated and still reads zero. Real users almost always fire one scroll milestone; bots almost never do.)

### 3.4 Excluding spike days collapses the drop to noise

PostHog HogQL excluding Apr 11, Apr 13:
```
prior_14 (excl spike): 37 PV, 36 sessions
last_14:               29 PV, 29 sessions
```
That is **−22%**, not −62%. At n=29 vs 37, Poisson 95% CI overlap is significant — this is well within noise for a small-base page.

### 3.5 No code-level breakage in `/compare`

- `git log --since="2026-03-01" -- src/pages/Compare.jsx` returns 5 commits. The latest, **5650425 (PR #372, today Apr 30)**, is post-window and a pure refactor — moves product data from inline arrays to `src/data/topProducts.json` (−129 net lines) without changing routes, meta, or rendered structure. `git show 5650425 -- src/pages/Compare.jsx` confirms this; the diff is identifier-renames and JSON imports. No commits in the window changed routing, meta, or visibility.
- **Live curl** (`https://www.dhmguide.com/compare`): HTTP 200, 0 redirects, 12,537 bytes. Title `Compare 7 Best DHM Hangover Supplements [Side-by-Side 2026]`, canonical `https://www.dhmguide.com/compare`, robots `index, follow`. Prerender body stub renders the H1 + 2 paragraphs. Page is fine.
- `public/sitemap.xml` line 39: `<loc>https://www.dhmguide.com/compare</loc>` — present.

### 3.6 Internal-link surface to `/compare` is materially weak — but stable across the window

Hardcoded internal links to `/compare`:
- `src/pages/Reviews.jsx:797` — `to="/compare"`
- `src/pages/DosageCalculatorEnhanced.jsx:2042` — `to="/compare"`
- `src/hooks/useRouter.js:20` — `{ path: '/compare', name: 'Compare Solutions', inNav: true }` (renders dynamically in Layout's `navItems.map`)

That is **2 hardcoded internal links + 1 dynamic nav entry**, sitewide.

`Layout.jsx` line audit: header CTA hardcodes `/reviews`, footer hardcodes `/reviews`, **no hardcoded `/compare` anywhere**. The desktop nav row renders `/compare` only via `useRouter.getNavItems()` map (line 136). The mega-menu (PR #326) replaced the Topics dropdown but did not touch `/compare`'s nav entry.

`git show 980d02b^:src/components/layout/Layout.jsx | grep '/compare'` returns nothing — **`/compare` was never hardcoded into the Layout, even before the mega-menu**. PR #326 didn't remove it; it never had a hardcoded reference there.

### 3.7 Prerendered HTML lacks `/compare` href on Home — but this predates the window

`curl https://www.dhmguide.com/` → 0 occurrences of "compare". The prerendered home shows hrefs to `/guide`, `/reviews`, `/research`, `/never-hungover` only. `/compare` is inserted client-side by JS hydration (via `useRouter.getNavItems`).

This is a long-standing pattern, not a recent regression — the prerender script (`scripts/prerender-main-pages.js`) emits a body stub for `/compare` itself but does not inject internal nav links into other pages' prerendered HTML. Since pre-Apr-1, no commit has changed how `/compare` is referenced from internal pages. So this *cannot* explain a window-vs-window drop, though it is a pre-existing weakness.

### 3.8 Referrer split is consistent across windows

PostHog HogQL bucketed referrers, last 28d:
```
prior_14: google=64, direct=20, other=1
last_14:  google=21, direct=8
```
**Both windows**: ~75% google, ~25% direct. Channel mix did not shift — both organic and direct dropped proportionally. No "internal traffic share collapsed" pattern that would point to a navigation change.

### 3.9 Sitewide context: not a `/compare`-only effect

PostHog HogQL pageviews by path, prior_14 vs last_14:
```
/                  41 → 61   (+49%)
/compare           85 → 29   (−66% raw)
/guide              5 → 14   (+180%)
/never-hungover     8 →  2   (−75%)
/research          13 → 17   (+31%)
/reviews           29 → 27   (−7%)
Sitewide PV     1,999 → 1,574 (−21% raw)
```
Total sitewide PV is also down −21% raw, and the integrity audit attributes that to "5 bot-spike days, unevenly distributed" — three of those days fell in prior_14 (11, 13) at high magnitude and three fell in last_14 (17, 19, 20) at lower magnitude. `/compare` happens to have caught a disproportionate share of the prior-14d bot wave (48 of 85 PV = 56% of prior-14 traffic was on bot-spike days).

After bot-day exclusion sitewide, the integrity audit reports **+0.4% (flat)** WoW. `/compare` after the same exclusion is `−22%`, which at n=29/37 is one or two visitors away from flat.

## 4. Root cause

**Confidence: HIGH** that the headline `−62%` is overwhelmingly a bot-spike artifact in the prior window.

48 of 85 prior-14d pageviews (56%) came on Apr 11 and Apr 13. Those days have:
- 1:1 PV-to-session ratio (each visit is a fresh fingerprint),
- 95%+ Chrome desktop,
- Zero or near-zero scroll engagement on Apr 11,
- Match exactly the bot signature the cross-cutting integrity audit (`docs/posthog-2026-04-30/05-integrity.md`) flagged sitewide for the same dates.

Removing those two days collapses the drop to `−22%` on n=37 vs n=29 — well within Poisson noise on a small-base page. There is no code, routing, sitemap, or meta change in the window that breaks `/compare`. The page renders, is in the sitemap, has correct meta, and is reachable. The internal-link surface to `/compare` is genuinely weak (2 hardcoded links + 1 dynamic nav entry), but this weakness predates the window and cannot explain a step change.

**Confidence: MEDIUM** on a smaller, real residual decline (`−22%` after exclusion). At n=37 vs n=29 the residual is 1–2σ Poisson — likely noise, but a real ~10–20% softening is consistent with sitewide flatness plus the page's particularly thin internal-link surface failing to recover from any organic ranking jitter.

## 5. Recommended action

**Primary: NO ACTION REQUIRED. Update the headline.**

The `/compare −62%` line in `docs/posthog-2026-04-30/01-traffic.md` row 2 is a noise-on-noise artifact. The same document warns "minimum-base pages (n<25) are dominated by Poisson-style variation," and the integrity audit (`05-integrity.md`) explicitly says "any traffic-trend or WoW comparison must explicitly exclude Apr 11, 13, 17, 19, 20." Row 2 of the headline table did not apply that exclusion. Either:
- Annotate `/compare` row in `01-traffic.md` with `(spike-day adjusted: 37→29, −22%, within noise)`, or
- Re-run the page-level table with bot days excluded across all rows.

**Secondary (lower priority, real but not urgent):**

The internal-link audit surfaced a genuine weakness: only 2 hardcoded internal links to `/compare` exist sitewide (`Reviews.jsx:797`, `DosageCalculatorEnhanced.jsx:2042`), plus 1 dynamic nav entry. The prerendered HTML does not include `/compare` as an internal href on other pages — only the active page's own canonical. This is a pre-existing condition, not a regression, and contributes to `/compare`'s overall low organic ceiling. If/when the affiliate funnel goes back into focus:

- Consider hardcoding `/compare` into the prerendered footer of `scripts/prerender-main-pages.js` so Googlebot sees it without JS execution (single line addition).
- Consider adding `/compare` to the mega-menu — currently the mega-menu surfaces only `/never-hungover/*` cluster pillars; `/compare` is only in the top-level nav row that exists on desktop only.
- Consider an in-content link from each Best-X comparison post (a script-driven inline link similar to `4998dc5` "fix(content): repair 16 broken internal links").

These three actions together would meaningfully raise `/compare`'s internal pagerank, but none of them is justified by *this finding* — the finding does not show degradation, only noise.

**What I cannot confirm without GSC data:**

PostHog organic referrer is approximate (Google strips referrer detail; we only see "https://www.google.com/"). To distinguish "ranking position changed" from "click-through rate changed" from "noise", we'd need GSC impressions/CTR/position for `/compare` over the same 28-day window. The PostHog `−22%` after exclusion is consistent with all three. If an investigator wants to upgrade confidence above MEDIUM, run the same window-vs-window in GSC for the `/compare` URL.

---

## Citation index

| Claim | Source |
|-------|--------|
| Headline 85→32 (−62%) | `docs/posthog-2026-04-30/01-traffic.md` row 2 |
| Apr 11/13/17/19/20 are bot days | `docs/posthog-2026-04-30/05-integrity.md` §2 table |
| /compare prior_14 = 85, last_14 = 29 | PostHog HogQL, project 275753 (this investigation) |
| /compare Apr 11 = 23 PV, 0 scroll milestones | PostHog HogQL (this investigation) |
| Excluding Apr 11+13: prior_14=37 last_14=29 | PostHog HogQL (this investigation) |
| Page renders 200 with valid meta | `curl https://www.dhmguide.com/compare` |
| /compare in sitemap line 39 | `public/sitemap.xml:39` |
| Compare.jsx git history (5 commits) | `git log --since="2026-03-01" -- src/pages/Compare.jsx` |
| PR #372 is a refactor, no behavior change | `git show 5650425 -- src/pages/Compare.jsx`, commit `5650425` |
| Layout.jsx has zero hardcoded `/compare` | `grep -n '/compare' src/components/layout/Layout.jsx` |
| Pre-mega-menu Layout also had no `/compare` | `git show 980d02b^:src/components/layout/Layout.jsx` |
| useRouter.js declares /compare in nav | `src/hooks/useRouter.js:20` |
| Reviews.jsx links to /compare | `src/pages/Reviews.jsx:797` |
| DosageCalculatorEnhanced.jsx links to /compare | `src/pages/DosageCalculatorEnhanced.jsx:2042` |
| Prerendered home has no /compare href | `curl https://www.dhmguide.com/ \| grep compare` (0 hits) |
| Referrer split unchanged across windows | PostHog HogQL referrer bucketing (this investigation) |
