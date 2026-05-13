# Affiliate CTR — Last 14d vs Prior 14d (Agent A3)

**Generated**: 2026-05-12 (May 12 partial; ~30% of day captured)
**Windows (UTC)**: Last = 2026-04-29 → 2026-05-12 · Prior = 2026-04-15 → 2026-04-28

**Confounders** (from docs/posthog-2026-04-30/05-integrity.md):
- Prior window: 3 bot-suspect days (Apr 17, 19, 20: 670 PV, scroll <6%).
- Current window: zero bot-suspect days (PR #346 bot-UA filter active throughout; pv/user 1.00-1.28, scroll ≥8.4% all days).
- `affiliate_link_click` is NOT affected by PR #269 sampling-gate change — window-vs-window comparison is valid.

---

## 1. TL;DR

**Affiliate CTR is genuinely up — this is NOT another composition shuffle.** Raw clicks 26 → 38 (+12) clears the >5-click materiality bar. Botless (drop bot days from prior) widens to **+19 clicks (19 → 38, +100%)**. Last time, `/reviews` +10 was offset by `/compare` −10 (net null). This time, `/compare` was already at 0 (no offset possible). The mechanism: **PR #352 (hide mobile secondary cols) + PR #358 (Best-For button row), both shipped Apr 29 ~15:40 BST**. Mobile /reviews clicks tripled (6 → 20) on flat mobile /reviews PV (9 → 7). Desktop /reviews flat. Chronic 0% CTR on top content posts (dosage/supplements/RCT) persists — still the biggest gap on the site.

---

## 2. Overall Table (raw + botless)

| Window | PV | Clicks | CTR |
|---|---:|---:|---:|
| Prior 14d (raw) | 1,641 | 26 | 1.58% |
| Prior 14d (botless: −Apr 17/19/20) | 971 | 19 | 1.96% |
| Last 14d (no exclusions) | 671 | **38** | **5.66%** |
| **Δ vs raw prior** | **−970 PV** | **+12** | **+4.08 pp** |
| **Δ vs botless prior** | **−300 PV** | **+19** | **+3.70 pp** |

---

## 3. Per-Page Table (≥30 PV either window OR any clicks; top 14)

| Path | Prior PV | Last PV | Prior clicks | Last clicks | Δ |
|---|---:|---:|---:|---:|---:|
| /never-hungover/dhm-dosage-guide-2025 | 235 | 161 | 0 | 0 | 0 |
| /never-hungover/hangover-supplements-complete-guide-... | 183 | 70 | 0 | 0 | 0 |
| /never-hungover/dhm-randomized-controlled-trials-2024 | 114 | 0 | 0 | 0 | 0 |
| /never-hungover/dhm-rct (renamed Apr 26 PR #316) | 2 | 44 | 0 | 0 | 0 |
| /never-hungover/flyby-vs-cheers-complete-comparison-2025 | 93 | 6 | 0 | 0 | 0 |
| /never-hungover/when-to-take-dhm-timing-guide-2025 | 62 | 29 | 0 | 0 | 0 |
| / (homepage) | 48 | 33 | 1 | 1 | 0 |
| /never-hungover/complete-guide-asian-flush-comprehensive | 42 | 7 | 0 | 0 | 0 |
| /compare | 34 | 6 | 0 | 1 | +1 |
| **/reviews** | **29** | **32** | **23** | **36** | **+13** |
| /never-hungover/no-days-wasted-vs-dhm1000-comparison-2025 | 11 | 1 | 2 | 0 | −2 |

Notes: /reviews >100% CTR is multi-product table tracking; use raw counts. Chronic 0-click monetization on dosage/supplements/RCT (combined ~807 PV across 28d → 0 clicks). Only one page cleared the 5-click bar: /reviews.

---

## 4. Per-Placement Table

| Placement | Prior clicks | Last clicks | Δ |
|---|---:|---:|---:|
| **comparison_table** | 19 | **30** | **+11** |
| product_card | 2 | 4 | +2 |
| hero | 2 | 2 | 0 |
| home_product_card | 1 | 1 | 0 |
| compare_table (/compare) | 0 | 1 | +1 |
| unknown_placement | 2 | 0 | −2 |
| **Total** | **26** | **38** | **+12** |

The +11 on comparison_table is the entire story. Everything else nets to +1.

---

## 5. Per-Product Table

| Product | Prior | Last | Δ |
|---|---:|---:|---:|
| **Double Wood Supplements DHM** | 6 | 11 | **+5** |
| No Days Wasted DHM Detox | 11 | 12 | +1 |
| Flyby Recovery | 0 | 3 | +3 |
| NusaPure DHM 1,000mg | 1 | 3 | +2 |
| DHM1000 | 1 | 3 | +2 |
| Toniiq Ease | 1 | 3 | +2 |
| DHM Depot | 1 | 2 | +1 |
| Cheers Restore | 0 | 1 | +1 |
| Fuller Health After Party | 2 | 0 | −2 |
| Good Morning Hangover Pills | 1 | 0 | −1 |
| Other (alt naming) | 2 | 0 | −2 |
| **Total** | **26** | **38** | **+12** |

Broad gain across 8 products (not concentrated). Only Double Wood (+5) individually approaches materiality. The breadth suggests UX-level uplift, not single-product CRO.

---

## 6. Per-Device

| Device | Prior PV | Last PV | Prior clicks | Last clicks | Prior CTR | Last CTR |
|---|---:|---:|---:|---:|---:|---:|
| **Mobile** | 296 | 265 | 7 | **22** | 2.36% | **8.30%** |
| Desktop | 1,335 | 403 | 18 | 16 | 1.35% | 3.97% |
| Tablet | 10 | 3 | 1 | 0 | — | — |

**Mobile clicks +15 (+214%) on −10% PV. Desktop clicks essentially flat (18→16).** Desktop CTR rise is mostly bot-day deflation of denominator; mobile rise is real behavior.

**/reviews mobile specifically:** PV 9 → 7 (flat). Clicks **6 → 20 (+233%)**. Clicks/PV 0.67 → **2.86**. This is the PR #352/#358 fingerprint.

---

## 7. Composition Check / Net Deltas (>5 clicks bar)

| Path | Δ | Clears bar? |
|---|---:|---|
| /reviews | +13 | YES |
| All other paths combined | −1 | No |

**Critical contrast vs prior period**: Last time `/reviews` +10 was offset by `/compare` −10 (net null). This time `/compare` was already at 0 in prior — there is no offsetting negative. The +13 is a net gain.

Where the +13 came from on /reviews: comparison_table +11, product_card +2, hero 0.

---

## 8. Source / Link-Position / Hour

**Referrer**: www.google.com clicks +10 (15 → 25). Internal+direct unchanged.

**link_position** breakdown:

| Position | Prior | Last | Δ |
|---|---:|---:|---:|
| top | 19 | **32** | **+13** |
| upper_middle | 3 | 4 | +1 |
| middle | 2 | 2 | 0 |
| lower_middle | 2 | 0 | −2 |

All +13 concentrated at `link_position=top` — precisely where the Best-For button row + simplified mobile table live.

**Hour-of-day**: n=38 is too small for confident pattern, but last-period shows evening (19-22 = 11 clicks) and late-night (0-2 = 11 clicks) clusters — consistent with mobile drinking-decision use case.

---

## 9. Bot-Filter Re-Check (current window)

All 13 complete days in current window pass the heuristic (pv≈sess≈users but scroll-rate ≥8.4%). Lowest-scroll day is Apr 29 (110 PV, 8.4%, borderline) — kept in. No exclusions needed in current window. PR #346's UA filter appears to be doing its job.

Prior-window exclusions: Apr 17, 19, 20 (same as baseline doc).

---

## 10. Signal vs Noise

Deltas clearing the >5-click materiality bar:

| Slice | Δ | Cleared? |
|---|---:|---|
| Site-wide raw | +12 | YES |
| Site-wide botless | +19 | YES (stronger) |
| /reviews page | +13 | YES |
| comparison_table placement | +11 | YES |
| Mobile total | +15 | YES |
| /reviews mobile | +14 | YES |
| link_position=top | +13 | YES |
| Double Wood product | +5 | Borderline |
| All other per-product moves | ≤+3 | No individually |
| /compare collapse | already at 0 | Floor |

**Six independent slices clear the bar — same story, six angles.** This is materially different from the prior 14d when nothing cleared.

---

## 11. Plausible Mechanism (Attribution)

- **PR #352** (`be73cfd`, Apr 29 15:41 BST): hide 3 secondary cols on mobile comparison table → readable on 360px screens.
- **PR #358** (`45dc946`, Apr 29 15:48 BST): replace native `<select>` with Best-For button row → reduces decision paralysis.

Both shipped within 7 minutes of each other, both target /reviews mobile UX. Analytic signature matches exactly: mobile /reviews clicks tripled, desktop /reviews unchanged. The device-selectivity is the attribution evidence — if this were generic mobile-traffic growth or seasonality, desktop would have moved too.

**Caveat**: n=38 clicks is tiny. Treat +233% magnitude as directional; the directional claim (mobile /reviews monetization is materially up, rest of site unchanged) is robust to ±30% sampling wobble.

---

## 12. Confidence: 4 / 5

- +1: delta clears materiality bar twice over (+12 raw, +19 botless).
- +1: clean causal story (PRs target /reviews mobile; only /reviews mobile moved).
- −1: n=38 total is still small; one weird day could swing 10-20%.
- 0: no measurement-pipeline change for `affiliate_link_click` between windows.

---

## 13. Action Items

1. **Ship more /reviews mobile UX wins.** PR #352/#358 demonstrably moved clicks. Candidates: sticky Best-For pills on scroll, sticky top product card, swipeable comparison rows.
2. **Attack the chronic 0% CTR on top content posts.** Dosage guide (161 last-14d PV), supplements guide (70), RCT (44), timing guide (29), Asian Flush (7) = ~311 PV → 0 clicks. Even 2% CTR adds ~6 clicks/week, ~+15-20% site-wide. The "Continue Your Research" footer (PR #359) does not appear to be helping monetization — replace/augment with a 2-3 product CTA strip on these specific high-traffic posts.
3. **Re-measure on May 26** with 28 days of post-#352/#358 data to confirm lift sticks past the novelty window.
4. **Investigate /compare deindexing.** /compare went 87 PV → 34 PV → 6 PV across three windows; clicks 10 → 0 → 1. Lost the site's second-best monetizing page. Hand to channels/recovery agent.
5. **Fix dashboard product attribution.** `properties.product` is null on all 64 events — `properties.product_name` carries the value. Update any tile querying `product` to `product_name`.

---

## Appendix: Daily-rate sanity check

Daily-mean clicks: prior 1.86/day → last 2.92/day (excl. May 12 partial) = +57% on daily-rate basis. Three days last window cleared 5 clicks (Apr 29, May 5, May 7); none in prior window. Shift dispersed across days — not one outlier.
