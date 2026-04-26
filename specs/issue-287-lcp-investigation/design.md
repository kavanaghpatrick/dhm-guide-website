# Design — Issue #287: `lcp-real` Subcommand

## Approach
Add a single `case` branch to `scripts/posthog-query.sh` that runs a HogQL query splitting desktop `$web_vitals` events into `bot` and `real` cohorts, then printing a small comparison table.

Follow the existing pattern (cf. `dead-clicks-real`): one HogQL query, a python3 one-liner to format output, no new dependencies.

## HogQL Query
```sql
SELECT
  CASE
    WHEN properties.$raw_user_agent LIKE '%Chrome/145.0.0.0%'
         AND properties.$screen_width = 800
         AND properties.$screen_height = 600
         AND properties.$viewport_width = 1920
    THEN 'bot_chrome145_800x600'
    ELSE 'real_user'
  END AS cohort,
  count() AS samples,
  avg(properties.$web_vitals_LCP_value) AS avg_lcp_ms,
  quantile(0.5)(properties.$web_vitals_LCP_value) AS p50_ms,
  quantile(0.75)(properties.$web_vitals_LCP_value) AS p75_ms,
  quantile(0.95)(properties.$web_vitals_LCP_value) AS p95_ms
FROM events
WHERE event = '$web_vitals'
  AND timestamp > now() - INTERVAL 7 DAY
  AND properties.$device_type = 'Desktop'
  AND properties.$web_vitals_LCP_value IS NOT NULL
GROUP BY cohort
```

## Why this filter (and not something tighter/looser)
- **UA + screen-size combo** = three independent signals all matching uniformly across 154 samples. Almost zero false-positive risk on real users (the 800×600 screen with 1920 viewport is impossible on a real Windows desktop).
- Filtering by UA alone (`Chrome/145`) might catch a small number of real users on stale Chrome — adding the screen-size guard prevents that.
- Filtering by referrer (`www.google.com`) would over-block real Google-organic users.

## Output Format
```
=== Desktop LCP — real users vs suspect bot (last 7 days) ===
cohort                          samples    avg_s    p50_s    p75_s    p95_s
real_user                            35     2.28     1.99     2.84     5.75
bot_chrome145_800x600               154    20.88    21.70    34.25    45.95
```

## Risk
Low. Pure additive change to a CLI helper. No production code path touched. If the bot's UA changes (e.g., Chrome 146 next month), the filter goes stale — that's fine; the script just stops cleanly separating cohorts and we update the version string.

## Files Touched
- `scripts/posthog-query.sh` — add `lcp-real)` case + line in help.

That's it. ~20 lines of bash.
