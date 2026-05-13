# UX Frustration Signals — Dead Clicks & Rage Clicks

**Agent**: A6 of 10
**Date**: 2026-05-12
**Source**: PostHog project 275753, events `$dead_click` and `$rageclick`
**Windows (UTC)**:
- **Current 14d**: 2026-04-29 → 2026-05-12 (partial — 14 days elapsed, today is end day)
- **Prior 14d**: 2026-04-15 → 2026-04-28

---

## 1. TL;DR

**Frustration is FLAT site-wide, but the picture splits sharply when you remove one outlier user.**

| View | Current 14d | Prior 14d | Δ | Verdict |
|---|---|---|---|---|
| Raw `$dead_click` | 100 | 99 | +1 (+1%) | Flat |
| Filtered (drop amzn/amazon/fullerhealth) | 81 | 84 | -3 (-4%) | Flat |
| Filtered, **excluding** user `019dc7ea-...d6fbbb57` | **41** | **82** | **-41 (-50%)** | **Significantly better** |
| `$rageclick` (raw, last 30d) | **0** | **0** | — | Not captured at all |

**Three headline findings:**

1. **The Apr 29 spike (44 events from one user/session) sits INSIDE the current window** — it isn't a new event, it's the same one already RCA'd. That single user (`019dc7ea-...d6fbbb57`, Mobile/Chrome/Android) generated 42 of their 42 lifetime dead clicks on Apr 28–29 and never returned. They're 49.4% of all filtered current-window dead clicks.
2. **Once that one user is excluded, real-world frustration dropped ~50%** (41 vs 82). Site-wide is genuinely *less* frustrating to actual users this fortnight.
3. **PostHog is not recording `$rageclick` at all** — 0 events across 30 days despite the `$dead_click` autocapture working. This is a measurement gap, not a UX victory. Action item.

**New issue introduced this window:** `/guide` page has the same `<Card hover:shadow-lg>` anti-pattern as `/research`. One mobile user fired 4 dead clicks on "Mental Clarity" within ~3 seconds on May 10 — classic rage-click behavior PostHog isn't tagging.

---

## 2. Site-wide counts

### Raw vs filtered (amzn/amazon/fullerhealth-affiliate links stripped)

| Metric | Current 14d | Prior 14d | Δ |
|---|---|---|---|
| Dead clicks (raw) | 100 | 99 | +1 |
| Dead clicks (filtered) | 81 | 84 | -3 |
| Unique sessions (filtered) | 28 | 34 | -6 |
| Unique users (filtered) | 26 | 32 | -6 |
| Rage clicks (raw) | 0 | 0 | 0 |

Daily totals (filtered): prior window avg 6.0/day; current window 4/29 = 44 (spike), then avg 3.5/day for 4/30–5/10 ten remaining days.

---

## 3. Per-page top 15 (filtered, current vs prior)

| Path | Current | Prior | Δ |
|---|---|---|---|
| `/never-hungover/hangover-supplements-complete-guide-...` | 14 | 42 | **-28** ✓ |
| `/` | 23 | 4 | **+19** (1 user / 21 = same Apr-29 user) |
| `/research` | 15 | 0 | **+15** (1 user / 12 = same Apr-29 user) |
| `/compare` | 0 | 15 | **-15** ✓ |
| `/never-hungover/dhm-dosage-guide-2025` | 8 | 10 | -2 |
| `/reviews` | 8 | 2 | +6 |
| `/guide` | 5 | 1 | **+4** (new hotspot) |
| `/never-hungover/dhm-randomized-controlled-trials` | 3 | 0 | +3 |
| `/never-hungover/when-to-take-dhm-timing-guide-2025` | 3 | 0 | +3 |
| `/never-hungover/flyby-recovery-review-2025` | 0 | 4 | -4 |
| `/never-hungover` | 0 | 2 | -2 |
| `/never-hungover/complete-guide-asian-flush-comprehensive` | 0 | 2 | -2 |
| `/never-hungover/flyby-vs-cheers-complete-comparison-2025` | 1 | 0 | +1 |
| `/never-hungover/what-to-eat-before-drinking-...` | 1 | 0 | +1 |
| `/never-hungover/nac-vs-dhm-which-antioxidant-better-...` | 0 | 1 | -1 |

**Wins**: `/compare` (15 → 0) — likely benefit of recent CompareCTA work (see git status). Supplements complete guide (-28). Flyby Recovery (-4).
**Net new**: `/guide` (+4), reviews (+6), research (+15 but 12 from outlier user).

---

## 4. Top elements clicked but not interactive

Current window, filtered (top 12):

| Clicks | Users | Page | Element text |
|---|---|---|---|
| 35 | 10 | various | `(no text)` — empty `<div>`/`<span>` |
| 3 | 1 | `/` | `'NAC (N-Acetylcysteine)'` (RCA hotspot B, unchanged) |
| 3 | 1 | `/guide` | `'Mental Clarity'` (**NEW — benefit Card without onClick**) |
| 3 | 1 | `/` | `'3 trials'` (Studies tab — RCA hotspot A) |
| 2 | 1 | `/reviews` | `'Brand'` (table header) |
| 2 | 1 | `/` | `'Quality Score:'` (RCA hotspot A) |
| 1 | 1 | `/research` | `'2026 RCT Results'` (RCA hotspot C) |
| 1 | 1 | `/research` | `'UCLA 2012'` (RCA hotspot D) |
| 1 | 1 | `/research` | `'Randomized, double-blind design'` (RCA hotspot D) |
| 1 | 1 | `/never-hungover/...complete-guide-...` | `'3. Morning Recovery'` (RCA hotspot F) |
| 1 | 1 | `/never-hungover/when-to-take-dhm-timing-guide-2025` | `'<!-- hub-footer:auto -->'` (HTML comment leak) |
| 1 | 1 | `/research` | `'Zobacz pełne badanie PubMed'` (Polish i18n hint) |

**Recurring (all from Apr 30 RCA, still present):** Studies-tab cards on `/` (A); `<tr hover:bg-gray-50>` table rows on `/` (B); `<Card>` stat panels on `/research` (C); study list cards `/research` (D); h3 span in NewBlogPost (F).

**New this window:** `/guide` line 361 — `<Card hover:shadow-lg transition-all duration-300>` for `keyBenefits.map(...)` (Mental Clarity, Liver Protection, etc.). Same anti-pattern, same root cause as `/research`.

---

## 5. Concentration check (single-user-bias)

| Window | Top user | % of total | Top session | % of total |
|---|---|---|---|---|
| **Current** | `019dc7ea-...d6fbbb57` | **49.4%** (40/81) | `019dd6a4-...d6fbbb57` | **44.4%** (36/81) |
| Prior | `019dc7ec-...bb3ed` | 15.5% (13/84) | `019dd02e-...c68fd` | 14.3% (12/84) |

Apr 29's 77%-from-one-user incident sits at the top of the current window. The user generated 40 of their 42 dead clicks on 2026-04-29 (2 on 4/28, 0 after 4/29). Browser: Chrome / Mobile / Android. Not bot-like (varied paths) but extremely high frustration.

**With this user removed:** filtered current = 41 events / 26 sessions / 25 users vs prior 82 / 33 / 31. That's **-50% events**, **-21% sessions**, **-19% users**. Real-user signal is clearly better.

---

## 6. Status of Apr 29 / and /research hotspots

| | Current (all users) | Current (excl. outlier) | Prior |
|---|---|---|---|
| `/` events | 23 | **1** | 4 |
| `/` users | 2 | 1 | 3 |
| `/research` events | 15 | **3** | 0 |
| `/research` users | 3 | 2 | 0 |

**Verdict: the Apr 29 spike has fully normalized for everyone except the original user.** `/` from new users = 1 dead click in 14d. `/research` from new users = 3 dead clicks across 3 distinct elements (`'2026 RCT Results'`, `'UCLA 2012'`, `'Zobacz pełne badanie PubMed'`).

The RCA-recommended P0 fix (`src/pages/Research.jsx:505` — wrap `<Card>` in `<a href={study.pubmedUrl}>`) was **not implemented**. Current 3 `/research` events still trace to Hotspot D cards. Low volume, but the fix would close the loop.

---

## 7. Device breakdown

| Device | Current events | Current users | Prior events | Prior users |
|---|---|---|---|---|
| Mobile | **60 (74%)** | 13 | 20 (24%) | 13 |
| Desktop | 21 (26%) | 13 | 62 (74%) | 18 |
| Tablet | 0 | 0 | 2 | 1 |

**Mobile flipped to dominant frustration device.** Most of mobile current = the persistent user (Mobile/Chrome/Android, 40 events). Excluding them: Mobile = 20, Desktop = 21 — balanced.

---

## 8. Confidence: **4 / 5**

**High**: site-wide counts (deterministic HogQL); per-page rankings; persistent-user attribution; `$rageclick`=0 (30-day verified).
**Lower**: "real-user -50%" assumes the persistent user is a one-off; another similar outlier could flip the metric. `(no text)` events (35/81 = 43%) aren't decoded by `$elements_chain` — we sampled `/guide` only.

---

## 9. Action items

**Critical**
1. **`$rageclick` capture is broken.** 30 days, 0 events. The `/guide` Mental Clarity cluster (4 clicks in 2s, same element, same user) should have fired. Check `posthog.init({ rageclick: true })` in `src/lib/posthog.js`, and whether `<motion.div>` (Framer) wrappers are mutating click targets across successive clicks and defeating detection.

**High-leverage (file as bug)**
2. **`/guide` line 361** — `<Card hover:shadow-lg transition-all duration-300>` on `keyBenefits.map(...)`. Wrap each in `<a>` to a relevant subpage, or drop `hover:shadow-lg transition-all`. Same fix shape as RCA hotspot D.

**Medium**
3. **Carry over RCA P0** — `src/pages/Research.jsx:505` still unfixed; 3 dead clicks current window from 2 fresh users.
4. **Polish string `'Zobacz pełne badanie PubMed'`** — likely Chrome browser translation; flag for follow-up.
5. **HTML comments in `el_text`** (`<!-- hub-footer:auto -->`) — markdown renderer emitting comments as visible nodes, or autocapture including comment nodes. Low priority.

**Defer**: the Apr 29 persistent user did not return; no action.

---

## Appendix: Data provenance

All queries run against `https://us.posthog.com/api/projects/@current/query` via HogQL.

Filter clause for "real" dead clicks (matches `posthog-query.sh dead-clicks-real` heuristic):
```sql
AND coalesce(properties.$external_click_url, '') NOT LIKE '%amzn%'
AND coalesce(properties.$external_click_url, '') NOT LIKE '%amazon%'
AND coalesce(properties.$external_click_url, '') NOT LIKE '%fullerhealth%'
```

Persistent-user `distinct_id`: `019dc7ea-1db0-7133-9947-ca1bb82edcb0`
Persistent-user session (Apr 29 spike): `019dd6a4-4ad6-7384-ac82-1d94d6fbbb57`
Prior RCA reference: `docs/posthog-investigation-2026-04-30/04-dead-clicks-rca.md`
