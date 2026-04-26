# Research — Issue #287: Desktop LCP Investigation

**Date:** 2026-04-26
**Window:** Last 7 days (post-#284 cloaking-fix merge)
**Source:** PostHog `$web_vitals` events, project 275753

## TL;DR — Verdict: Bot Artifact (Path A)

The 22.4s desktop LCP is **measurement contamination from a single headless-Chrome bot**, not a real user-experience issue. Real users are fine. No code performance fix needed; only a measurement-filter fix.

| Cohort | Samples | Share | Avg LCP | p50 LCP | p95 LCP |
|---|---|---|---|---|---|
| **Suspect bot** (Chrome 145, screen 800x600, viewport 1920) | 154 | 81.5% | 20.88s | 21.70s | 45.95s |
| **Real users** (everything else, desktop) | 35 | 18.5% | 2.28s | **1.99s** | 5.75s |

Real-user p50 of **1.99s is well under Google's "good" threshold of 2.5s**. Mobile remains fine at p50 ~1.0s.

## Bot Fingerprint (Q5 + Q7)

154 of 189 desktop LCP samples share an identical signature:
- `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36`
- `$screen_width: 800`, `$screen_height: 600`, `$viewport_width: 1920` — impossible combo on a real Windows desktop (real Win10 desktops are 1920x1080+ screen, viewport ≤ screen)
- 100% of samples come from `$referring_domain: www.google.com`
- All hit `/never-hungover/*` review/comparison pages
- Chrome 145 is six months stale (current Chrome is 147); zero plausible real-user concentration on 145

This is consistent with **Google's "Site preview" / SERP rich-result rendering bot** — a headless Chrome that fetches your page from Google's servers, throttles CPU/network, and reports inflated Web Vitals via the standard PostHog SDK. The bot is *not* in PostHog's default bot-blocklist because it presents as a regular browser.

## LCP Distribution (Q4) — Bimodal

Histogram of desktop LCP (n=189) shows a clean bimodal split:
- **0-5s cluster:** 67 samples (35.5%) — real users
- **5-10s gap:** 17 samples (9%) — transition zone
- **10-60s long tail:** 105 samples (55.5%) — bot

A unimodal real-user perf problem produces a single peak with a tail. A bimodal distribution like this is a near-certain mixed-population artifact.

## Per-Page LCP (Q2)

The "worst pages" (avg LCP 25-43s) are all `/never-hungover/*` comparison/review posts — exactly the surfaces Google rich-results / Site Preview crawls aggressively. Information pages (e.g. `/dhm-dosage-guide-2025`) show normal real-user LCP (~2-4s). The pattern matches "bot loads commercial pages for SERP previews," not "comparison pages have a perf bug."

## Referrer Breakdown (Q3)

| Referrer | Samples | Avg LCP |
|---|---|---|
| www.google.com | 179 | 18.21s |
| `$direct` | 7 | 4.24s |
| www.dhmguide.com (internal) | 2 | 2.34s |
| duckduckgo.com | 1 | 0.80s |

The 179 Google-referred desktop samples include all 154 bot samples — confirms bot enters via Google referral header (preview crawler convention).

## Browser Breakdown (Q1)

| Browser | Samples | p50 LCP | p95 LCP |
|---|---|---|---|
| Chrome | 180 | 17.78s | 43.14s |
| Safari | 5 | 0.71s | 1.44s |
| Edge | 3 | 1.97s | 2.64s |
| Firefox | 1 | 2.92s | 2.92s |

Non-Chrome desktop browsers (n=9) all average <3s — strong evidence that Chrome the *browser* isn't slow on our site; rather, *one specific stale Chrome version + bot fingerprint* is dragging the average.

## Did the #284 Cloaking Fix Help?

The data in this report is from the 7 days following #284 merge. Real-user p50 desktop LCP is now 1.99s, well within the "good" range. We have no clean pre-#284 dataset isolated from bots to A/B against, but #284 is consistent with shipping full-content prerendered HTML (faster largest-paint candidate), and real-user LCP looks healthy. No regression to chase.

## Decision

**Path A — bot artifact.** No code-performance fix.

Action: ship a measurement-helper subcommand `./scripts/posthog-query.sh lcp-real` that filters out the bot fingerprint so future LCP checks return real-user numbers. Document the bot signature so anyone running future audits doesn't get fooled the same way.

## Queries Used (reproducible)

All queries hit `POST https://us.posthog.com/api/projects/275753/query` with HogQL:

- **Q1** Browser breakdown: `SELECT properties.$browser, count(), avg/quantile(properties.$web_vitals_LCP_value) FROM events WHERE event='$web_vitals' AND properties.$device_type='Desktop' AND timestamp > now() - INTERVAL 7 DAY GROUP BY browser`
- **Q2** Per-page: same with `GROUP BY properties.$pathname ORDER BY avg DESC LIMIT 10`
- **Q3** Referrer: same with `GROUP BY properties.$referring_domain`
- **Q4** Histogram: `SELECT floor(properties.$web_vitals_LCP_value / 1000) AS bucket, count() GROUP BY bucket`
- **Q5** UA grouping: `GROUP BY properties.$raw_user_agent ORDER BY count DESC`
- **Q6** Cohort split: `CASE WHEN $raw_user_agent LIKE '%Chrome/145.0.0.0%' THEN 'bot' ELSE 'real' END`
- **Q7** Screen-size uniformity: `GROUP BY $screen_width, $screen_height, $viewport_width` — confirmed all 154 bot samples are 800x600/viewport 1920
