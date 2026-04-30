# Amazon Price Refresh Pipeline

## What this is

A four-step pipeline that refreshes Amazon prices for every product on the DHM Guide site. Step 1 resolves the `amzn.to` short links in `src/data/topProducts.json` to canonical ASINs and writes `data/amazon-asin-map.json`. Step 2 launches **visible (non-headless) Chrome** via Playwright with a persistent profile and scrapes the current price for each ASIN, writing `data/amazon-prices.json`. Step 3 prompts for confirmation, then merges the scraped prices into `src/data/topProducts.json` in place. Step 4 prints a `git diff` summary so you can review before committing. Visible Chrome is used because Amazon detects headless automation aggressively; a real browser window with a persistent profile (cookies, session state) gets through more often, and when a CAPTCHA does appear you can solve it manually in the window.

## How to run

```bash
./scripts/refresh-amazon-prices.sh
```

Total run time: roughly **1-3 minutes**, dominated by Amazon page loads and the random delays the scraper inserts to look human. If a CAPTCHA appears the run gets longer in proportion to how fast you solve it.

To skip the shortlink-resolution step (useful when the ASIN map is already current and you just want to refresh prices):

```bash
./scripts/refresh-amazon-prices.sh --skip-resolve
```

## CAPTCHA handling

If Amazon shows the "Enter the characters you see below" page in the visible Chrome window:

1. Look at the Chrome window the script opened (do **not** close it).
2. Type the characters into Amazon's CAPTCHA form and submit.
3. Switch back to the terminal where the script is paused and press Enter.
4. The pipeline will retry the same ASIN and continue.

The persistent Chrome profile lives in `.playwright-userdata/` (gitignored) so cookies and session state survive between runs — once you have solved one CAPTCHA the same IP often stays clear for a while.

## Cadence

**Weekly is the recommended floor.** Running more often risks IP-level rate limiting from Amazon, after which CAPTCHAs and outright blocks get more frequent and the scraper becomes useless until your IP cools off. Consider running this pipeline:

- Once a week, just to keep prices fresh.
- Before any major content push (a new comparison post, a homepage refresh, or a paid-traffic campaign) so the prices visitors see match what Amazon is actually charging.
- After Amazon-side events (Prime Day, Black Friday) where prices move sharply.

## Mass-edit moratorium (issue #366)

The active **mass-edit moratorium** (in `CLAUDE.md`, valid until **2026-07-15**, tracked under issue #366) blocks PRs that modify more than 20 files in `src/newblog/data/posts/`. This pipeline does **not** touch any blog post JSON. It writes to:

- `src/data/topProducts.json` (1 file — the canonical product data)
- `src/pages/Home.jsx` and `src/pages/Compare.jsx` are unchanged by this pipeline; agent 4 refactored them to read directly from `src/data/topProducts.json`, so their visible prices update on rebuild as a side effect.

That's well below the 20-file threshold, and none of the changed files live in the moratorium-protected directory. **No `[mass-edit-allowed]` override is needed.**

## Files this pipeline writes

| Step | Script                                | Reads                                                            | Writes                                                           |
|------|---------------------------------------|------------------------------------------------------------------|------------------------------------------------------------------|
| 1    | `scripts/resolve-amzn-shortlinks.mjs` | `src/data/topProducts.json`                                      | `data/amazon-asin-map.json`                                      |
| 2    | `scripts/scrape-amazon-prices.mjs`    | `data/amazon-asin-map.json`                                      | `data/amazon-prices.json` (Playwright, **non-headless** Chrome)  |
| 3    | `scripts/apply-amazon-prices.mjs`     | `data/amazon-asin-map.json`, `data/amazon-prices.json`, `src/data/topProducts.json` | updates `src/data/topProducts.json` in place                     |

`data/amazon-asin-map.json` **is committed** — it's stable, manually reviewable, and useful for debugging when a product mysteriously stops resolving. `data/amazon-prices.json` and the Playwright profile dir `.playwright-userdata/` are gitignored.

## Limitations

- **`amzn.to` short links can rotate.** Amazon occasionally retargets a short link to a new ASIN (or kills it entirely). If a product mysteriously starts failing during scraping, re-run with the resolve step (the default) to refresh `data/amazon-asin-map.json`.
- **ASINs can be discontinued.** If a product is delisted, Amazon serves a "Currently unavailable" page or a soft 404. The scraper logs these as failures non-fatally and moves on; the applier leaves that product's price untouched.
- **CAPTCHA frequency varies by IP and time of day.** Residential IPs running during US daytime hours tend to fare best. Hosted IPs and Tor exits get blocked almost immediately — don't try to run this from a server.
- **Amazon TOS gray area.** This script is intended **only for affiliate-relationship maintenance** (keeping the prices we display in sync with reality so we don't mislead readers). It is not a price-tracking service, a bulk crawl, or a competitive-intelligence tool. Run it at the recommended weekly cadence and don't redistribute the scraped prices.

## What to do when a product is delisted

1. Check the scraper output (`data/amazon-prices.json`) — the failed ASIN will be logged.
2. The applier leaves that product's price unchanged in `src/data/topProducts.json` (so the site doesn't display a stale "0" or "—").
3. Manually edit `src/data/topProducts.json`:
   - **Replacing** the product? Update the row's `name`, `asin`, `amznShortlink`, image, and any copy fields. Re-run the pipeline (without `--skip-resolve`) so the new ASIN gets picked up.
   - **Removing** the product? Delete the row. Re-run the pipeline so the (now-empty) ASIN map row goes away.
4. Rebuild the site (`npm run build`) and verify Home + Compare pages render correctly without the removed product.
