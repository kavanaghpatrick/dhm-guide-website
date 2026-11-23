# Reads Ledger

`reads-ledger.jsonl` holds one JSON object per line, one row per shipped page:

    {"url": "/never-hungover/slug", "shipped": "2026-11-23", "read_day7": "2026-11-30", "read_day21": "2026-12-14", "read_week6": "2027-01-04", "clicks": 0, "impressions": 0, "verdict": "pending"}

`shipped` and the `read_*` fields are ISO dates (the read dates are when each check is due).
`clicks` and `impressions` come from GSC at the latest read; `verdict` is `pending`, `keep`, `iterate`, or `prune`.
Append a row when a page ships and update it in place at each read. Never derive these numbers from PostHog referrers.
