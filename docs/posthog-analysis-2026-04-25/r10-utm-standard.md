# R10 - UTM Tagging Standard for Owned Channels

**Date:** 2026-04-26
**Owner:** analytics hygiene
**Status:** Recommended convention (not yet enforced on existing links)

## Why this matters

PostHog traffic-source data shows the site receives ~60% Google-organic traffic, with the remaining 40% spread across direct, referral, and "other". There is **no meaningful UTM-tagged owned-channel traffic** - meaning we cannot answer simple questions like:

- How many newsletter subscribers actually read the latest comparison post?
- Which X/Twitter post drove the most affiliate clicks?
- Did our Reddit thread convert at all?
- Is LinkedIn worth posting to?

Without UTMs, all of this collapses into "direct" or "referrer = unknown" in PostHog.

## Convention

Every link we publish on a channel we own (newsletter, social, podcast description, etc.) MUST carry these three params:

```
?utm_source=<channel>&utm_medium=<medium>&utm_campaign=<campaign>
```

### Standard `utm_source` / `utm_medium` pairs

| Channel       | utm_source   | utm_medium |
| ------------- | ------------ | ---------- |
| Newsletter    | `newsletter` | `email`    |
| X / Twitter   | `x`          | `social`   |
| LinkedIn      | `linkedin`   | `social`   |
| Reddit        | `reddit`     | `social`   |
| Facebook      | `facebook`   | `social`   |
| YouTube       | `youtube`    | `video`    |
| Podcast notes | `podcast`    | `audio`    |

Use lowercase. No spaces. Use `x` (not `twitter`) going forward, but the helper accepts both.

### `utm_campaign`

Default to `YYYY-MM` (current month, e.g. `2026-04`). Override only when running a named launch:

- `launch-2026-q2` - quarterly product launch
- `dhm-vs-nac-deep-dive` - specific content campaign
- `black-friday-2026` - seasonal

Don't put PII or full post slugs in the campaign field - that's what the path is for.

## Concrete examples

| Channel    | Tagged URL                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Newsletter | `https://www.dhmguide.com/reviews?utm_source=newsletter&utm_medium=email&utm_campaign=2026-04`                   |
| X          | `https://www.dhmguide.com/never-hungover?utm_source=x&utm_medium=social&utm_campaign=2026-04`                    |
| LinkedIn   | `https://www.dhmguide.com/dhm-research?utm_source=linkedin&utm_medium=social&utm_campaign=2026-04`               |
| Reddit     | `https://www.dhmguide.com/nac-vs-dhm?utm_source=reddit&utm_medium=social&utm_campaign=dhm-vs-nac-deep-dive`      |

## Helper script

`scripts/utm-tag.sh` builds tagged URLs for you. Don't hand-craft these - typos break attribution silently.

```bash
./scripts/utm-tag.sh https://www.dhmguide.com/reviews newsletter
# -> https://www.dhmguide.com/reviews?utm_source=newsletter&utm_medium=email&utm_campaign=2026-04

./scripts/utm-tag.sh https://www.dhmguide.com/never-hungover x launch-2026-q2
# -> https://www.dhmguide.com/never-hungover?utm_source=x&utm_medium=social&utm_campaign=launch-2026-q2

./scripts/utm-tag.sh "https://www.dhmguide.com/page?ref=foo" reddit
# -> https://www.dhmguide.com/page?ref=foo&utm_source=reddit&utm_medium=social&utm_campaign=2026-04
```

The helper handles the `?` vs `&` separator automatically and defaults the campaign to the current month.

## HogQL queries to save in PostHog

Save these in PostHog -> SQL editor -> Save as. Owned-channel performance becomes a 1-click view.

### 1) Owned-channel traffic, last 30d

```sql
SELECT
  properties.utm_source AS source,
  properties.utm_medium AS medium,
  count() AS sessions
FROM events
WHERE event = '$pageview'
  AND properties.utm_source IS NOT NULL
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY source, medium
ORDER BY sessions DESC
```

### 2) Owned-channel affiliate conversions, last 30d

```sql
SELECT
  properties.utm_source AS source,
  properties.utm_campaign AS campaign,
  count() AS affiliate_clicks
FROM events
WHERE event = 'affiliate_link_click'
  AND properties.utm_source IS NOT NULL
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY source, campaign
ORDER BY affiliate_clicks DESC
```

### 3) Per-campaign funnel (pageview -> scroll 50 -> affiliate click)

```sql
SELECT
  properties.utm_campaign AS campaign,
  countIf(event = '$pageview') AS pageviews,
  countIf(event = 'scroll_depth_milestone' AND properties.depth_percentage >= 50) AS scrolled_50,
  countIf(event = 'affiliate_link_click') AS clicked_amazon
FROM events
WHERE properties.utm_campaign IS NOT NULL
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY campaign
ORDER BY pageviews DESC
```

## Scope: forward-only

We are **not** retro-tagging existing links. The cost (auditing newsletter archives, social post histories, etc.) outweighs the benefit (historical data is already noisy, and PostHog only retains 7-90d of detail anyway depending on plan).

**Going forward** - every new owned-channel post gets a tagged URL via `scripts/utm-tag.sh`. After ~30 days of consistent tagging, the HogQL queries above will give us real owned-channel ROI numbers.
