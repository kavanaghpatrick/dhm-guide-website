# 07 — /compare Recovery Check

**Agent A7 of 10. Pulled 2026-05-12 UTC. Windows: current_14d = 2026-04-29 → 2026-05-12 (Apr 29 partial-late, May 12 partial-early); prior_14d = 2026-04-15 → 2026-04-28.**

---

## 1. TL;DR — STILL FLAT, IN FACT WORSE

`/compare` did **not** recover. It got worse on the headline number: **34 PV → 6 PV (−82%)** raw, or **17 PV → 6 PV (−65%)** after excluding prior-window bot-spike days (Apr 17/19/20). However — and this is the same caveat the prior RCA flagged — **n=6 vs n=17 is Poisson noise on top of a sitewide organic collapse** (sitewide Google referrer PV is down −68% in parallel, see §3). `/compare` did not break independently; it was carried down by a sitewide organic-search drop. Zero Google referrer hits in 14 days on `/compare` is the new headline — every single one of the 6 PV is `$direct`.

**Verdict: STILL FLAT — but the diagnosis has shifted.** Prior RCA correctly identified that `/compare` PV was bot-inflated. The structural weakness it described (organic-only, 1-PV-per-day-when-it-ranks, almost no internal funnel) is now exposed at full magnitude because the bot inflation is gone and organic itself has receded. There is no `/compare`-specific bug — it is a faithful mirror of sitewide organic decline.

---

## 2. Headline `/compare` table

| Metric | prior_14d (raw) | prior_14d (botless¹) | current_14d | Δ raw | Δ botless |
|---|---:|---:|---:|---:|---:|
| Pageviews | 34 | 17 | **6** | **−82%** | **−65%** |
| Unique sessions | 34 | 17 | 6 | −82% | −65% |
| Unique users | 33 | 17 | 6 | −82% | −65% |
| pv/session ratio | 1.00 | 1.00 | 1.00 | — | — |
| Time on page p50 (s) | 60 | — | 30 | −50%² | — |
| Time on page p75 (s) | 120 | — | 90 | −25%² | — |
| Scroll @ 25%³ | 8 sessions | — | 0 | — | — |
| Scroll @ 50%³ | 1 session | — | 0 | — | — |
| Scroll @ 75%/90% | 0 | 0 | 0 | — | — |
| `element_clicked` | 26 events / 6 sessions | — | 1 / 1 | — | — |
| `affiliate_link_click` | **0** | 0 | **1** | **+1** | +1 |
| Affiliate CTR (clicks/PV) | 0/34 = 0% | 0/17 = 0% | 1/6 = 16.7% | — | — |
| Exit rate⁴ | 100% (34/34) | — | 100% (6/6) | flat | — |

¹ Botless excludes Apr 17 (11 PV, 100% Chrome, 0 scrolls = bot-shaped per `posthog-2026-04-30/05-integrity.md`), Apr 19 (1 PV), Apr 20 (5 PV, 100% Chrome).
² On n=10→7 events — meaningless statistically.
³ Note: PR #269 (Apr 26) removed 10% sampling gate on engagement events, so post-Apr-26 scroll/time volumes are 10× pre-Apr-26 at the same user behavior. Prior_14d data is mostly pre-gate-removal; current_14d is fully post-removal. The fact that prior_14d shows MORE scroll events than current despite the gate working AGAINST it is a real engagement signal — but n is tiny.
⁴ Sessions where `/compare` is the last `$pageview` of the session. 100% in both windows = `/compare` is a terminal page. No downstream funnel.

Daily distribution shows the structural change cleanly. Prior 14d had Apr 17 cluster (11 PV in one day, bot-shaped). Current 14d has 6 PV spread across 6 different days, 1 PV each:

```
Apr 29 → 1   May 05 → 1   May 06 → 1   May 07 → 1   May 08 → 1   May 11 → 1
```

That is 1 user per day on average. This is the floor of `/compare` traffic with zero organic and zero internal-funnel referrals.

---

## 3. Referrer / source composition

| Bucket | prior_14d PV | current_14d PV | Δ |
|---|---:|---:|---:|
| `https://www.google.com/` (organic) | **25** (74%) | **0** (0%) | **−25 PV / −100%** |
| `$direct` | 9 (26%) | 6 (100%) | −33% |
| Reddit / Bing / internal / other | 0 | 0 | — |
| UTM source set | 0 | 0 | — |

**No UTM tagging is in use on `/compare`** (`utm_source` is NULL on every single row in both windows). That means we can't separately attribute social/newsletter/paid — but there isn't any (all referrers are either Google or empty).

**Sitewide context (§ for comparison)**: sitewide Google referrer PV is **882 → 282 (−68%)**, sitewide total PV **1641 → 671 (−59%)**. `/compare`'s `−100%` Google drop is the small-base extreme of a sitewide organic regression. This is NOT a `/compare`-specific event.

---

## 4. Internal-link funnel (blog → /compare)

Sessions that had at least one `$pageview` on `/never-hungover/*` *before* a `$pageview` on `/compare`:

| Window | Sessions blog→/compare |
|---|---:|
| prior_14d | 1 |
| current_14d | **0** |

Of all 6 sessions that hit `/compare` in current_14d, **6 of 6 entered the site directly on `/compare`** (`first_path = '/compare'`). Zero of them arrived via blog. This matches prior 14d (33 of 34 sessions entered directly on `/compare`).

**The internal-link funnel into `/compare` does not exist as a meaningful traffic source.** It contributed 1 session in 14 days at peak; it now contributes 0. The prior RCA flagged this as a pre-existing structural weakness — confirmed.

---

## 5. Hypothesis — why hasn't it recovered?

The prior RCA's primary conclusion was correct and still holds: **the `−62%` (now `−82%`) headline is overwhelmingly a base-rate artifact on a tiny page**. The new wrinkles in this window:

1. **`/compare` was never organic-strong; the prior 25 google PV were inflated by Apr 17 and Apr 20 bot waves.** Apr 17 alone contributed 11 of the prior window's 25 google referrer PV (44%). That day matches every bot signature in the integrity audit (100% Chrome, 0 scrolls). Strip Apr 17/19/20: prior organic = 8 PV in 11 days. Current organic = 0 PV in 14 days. The "decline" is `8 → 0` on n=8 — within Poisson at this volume.

2. **No internal-nav driver exists.** `/compare` has 2 hardcoded internal links sitewide (`Reviews.jsx:797`, `DosageCalculatorEnhanced.jsx:2042`) plus the dynamic nav entry from `useRouter.js:20`. None of these surfaces in prerendered HTML on other pages. PR #298/#326 mega-menu landed Apr 26 and surfaces `/never-hungover/*` cluster pillars — **`/compare` was not added to the mega-menu**. The CTA work in PR #277 added `/reviews` template CTAs to 188 blog posts but explicitly *did not* add `/compare`. So in the same window where every blog post got new internal CTAs to `/reviews`, `/compare` got nothing.

3. **The Apr 29 PostHog bot filter (PR #346/#344) silenced the inflated baseline but real users were always sparse.** The prior window's 25 google PV was already only ~8-14 real users after bot-stripping. With the bot filter active, current_14d's 6 PV is approximately the real-user floor for this page.

4. **Sitewide organic collapse compounds the small-base problem.** Sitewide google PV dropped 882 → 282 in the same window. `/compare`, with a real-user organic baseline near 0.5-1 PV/day, simply crossed zero on the noise floor.

5. **Confirmed NOT a code/page regression.** `Compare.jsx` git history: only commit in window is PR #372 (Apr 30, refactor — extracts product data to `topProducts.json`, no behavior change). Live curl Apr 30 returned HTTP 200 with correct meta. Sitemap entry present at line 39.

Specifically: prior RCA hypothesized the page was hurt by Apr 11/13 prior-prior-window bot spikes. **This time, prior_14d's Apr 17 bot spike (11 PV, all Google referrer, 100% Chrome desktop) is the new artifact.** Same bot pattern, different days.

---

## 6. Confidence: **3 / 5**

- HIGH confidence (`5/5`) that `/compare` has no code-level breakage, no indexability problem, no internal-link regression in window — same as prior RCA, and verified again.
- HIGH confidence (`5/5`) that the headline `−82%` overstates real change due to prior-window bot inflation (Apr 17 = 11 of 34 PV) and the new bot filter retroactively cleaning some of current_14d.
- MEDIUM confidence (`3/5`) that `/compare` real-user traffic genuinely softened ~30-50% in proportion to the sitewide organic decline. n is too small (6 vs ~8-14 real) to distinguish ranking drop from CTR drop from noise at this volume.
- LOW confidence (`2/5`) on attributing any *specific* delta to any *specific* PR. Sitewide organic is down −68% over the same window — `/compare`'s drop is consistent with being passively carried down, not separately hit.

Confidence ceiling = 3 because GSC data would be needed to separate ranking-position from CTR-change from organic-volume drift for the `/compare` URL specifically. PostHog can only show "no Google referrer events," not whether `/compare` is still ranking but not clicked vs. ranking lower vs. dropped from SERP.

---

## 7. Action items

**Primary recommendation: STILL no `/compare`-specific action. Investigate the SITEWIDE organic decline instead.** The headline `/compare −82%` is a mirror of the sitewide Google-referrer drop (`−68%`). Whatever investigation A2-A6 are doing on sitewide PV / channel / SEO should fully explain this number. Do not duplicate effort on `/compare` in isolation.

**If `/compare` traffic is a goal, fix the structural weakness — but only if sitewide organic recovers first:**

1. **Add `/compare` to the prerendered footer of `scripts/prerender-main-pages.js`** so Googlebot sees the internal link without JS execution. Single-line addition. (Recommended in prior RCA, still not implemented.)
2. **Add `/compare` to the mega-menu** (PR #298/#326). Currently only `/never-hungover/*` cluster pillars are surfaced. `/compare` lives only in the desktop top-nav row.
3. **Add `/compare` to PR #277's template CTA system.** The blog template CTAs target `/reviews`; adding a complementary `/compare` CTA on comparison-shaped posts would route blog readers into the funnel `/compare` currently lacks.
4. **Add UTM tagging to all internal `/compare` links** (`utm_source=internal&utm_medium=cta&utm_campaign=<source>`) so that future investigations can distinguish channel without guessing.
5. **Track this with GSC**: subscribe `dhmguide.com/compare` to its own GSC property view and pull impressions/CTR/position weekly. PostHog cannot answer "is `/compare` still ranking" — only GSC can.
6. **Working tree note**: `src/components/CompareCTA.jsx` is staged but un-shipped (per `git status`). If this is the intended `/compare` funnel CTA, shipping it during the next ship-cluster would close action item #3.

None of these are urgent. They are structural improvements with weeks-to-months payoff. The immediate signal — `/compare` `−82%` — is not a regression event; it is the small-base mirror of a sitewide condition.

---

## Citation index

| Claim | Source |
|---|---|
| 34→6 PV current vs prior | `q_compare_pv.sh` HogQL (project 275753, this investigation) |
| Daily PV breakdown (Apr 15 - May 12) | `q_compare_daily.sh` HogQL |
| Engagement event counts | `q_compare_eng.sh` HogQL |
| Scroll depth 25/50/75/90 | `q_compare_scroll.sh` HogQL |
| Time-on-page p50/p75 | `q_compare_time.sh` HogQL |
| Affiliate clicks 0→1 | `q_compare_affiliate.sh` HogQL |
| Exit rate 100% both windows | `q_compare_exit.sh` HogQL |
| Blog→/compare funnel 1→0 | `q_blog_to_compare.sh` HogQL |
| Landing analysis (6/6 directly enter on /compare) | `q_compare_landing.sh` HogQL |
| Referrer composition google 25→0, direct 9→6 | `q_compare_refs.sh` HogQL, raw rows in `q_dist_referrers.sh` |
| Apr 17 bot signature 100% Chrome 0 scrolls | `q_compare_bot_signal.sh` HogQL + `docs/posthog-2026-04-30/05-integrity.md` §2 |
| Sitewide Google PV 882→282 | `q_sitewide_refs.sh` HogQL |
| Sitewide total PV 1641→671 | `q_compare_sitewide.sh` HogQL |
| Mega-menu doesn't include /compare | `docs/posthog-2026-05-12/01-change-inventory.md` (PR #298) + prior RCA §3.6 |
| PR #277 blog CTAs target /reviews, not /compare | `docs/posthog-2026-05-12/01-change-inventory.md` PR #277 row |
| Bot filter PR #346 active Apr 29 | `01-change-inventory.md` row for PR #344/#346 |
| CompareCTA.jsx staged, not shipped | `git status` shows `?? src/components/CompareCTA.jsx` |
| Prior RCA conclusion | `docs/posthog-investigation-2026-04-30/01-compare-rca.md` |
