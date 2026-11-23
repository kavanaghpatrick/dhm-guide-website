// scripts/seo/indexnow-submit.mjs
// Push URLs to IndexNow (Bing, DuckDuckGo, and every engine on the protocol)
// instead of waiting for a crawl. Ported 2026-11-23 from arcompare-fable for
// www.dhmguide.com. The key file lives at public/<key>.txt and must be LIVE on
// production (deployed) before any submission — engines verify ownership by
// fetching it; the script checks that and refuses otherwise. No env needed.
//
// Modes:
//   node scripts/seo/indexnow-submit.mjs --all            submit every URL in the live sitemap
//   node scripts/seo/indexnow-submit.mjs --recent <days>  only URLs whose sitemap <lastmod> is within N days (weekly-cron mode)
//   node scripts/seo/indexnow-submit.mjs --urls <u1> <u2> explicit URLs
//   add --dry-run to print the payload without sending
//
// Every submission appends one line to docs/seo/indexnow-log.jsonl.
// IndexNow allows up to 10,000 URLs per request; the whole site is ~200, so
// one POST always suffices. A 200/202 response means "accepted for
// processing", not "indexed" — Bing Webmaster Tools is the read for that.

import { appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LOG = resolve(ROOT, "docs/seo/indexnow-log.jsonl");

const KEY = "750ef536075c994387cadda67b52a7b8";
const HOST = "www.dhmguide.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function sitemapEntries() {
  const res = await fetch(SITEMAP, { headers: { "User-Agent": "dhmguide-indexnow/1.0" } });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const entries = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
    if (loc) entries.push({ loc, lastmod });
  }
  if (entries.length === 0) throw new Error("sitemap parsed to zero URLs — refusing to submit");
  return entries;
}

async function main() {
  let urls;
  let mode;
  if (args.includes("--all")) {
    mode = "all";
    urls = (await sitemapEntries()).map((e) => e.loc);
  } else if (args.includes("--recent")) {
    mode = "recent";
    const days = parseInt(args[args.indexOf("--recent") + 1], 10) || 8;
    const cutoff = Date.now() - days * 86_400_000;
    urls = (await sitemapEntries())
      .filter((e) => e.lastmod && new Date(e.lastmod).getTime() >= cutoff)
      .map((e) => e.loc);
    if (urls.length === 0) {
      console.log(`indexnow: no sitemap URLs with lastmod in the last ${days} days — nothing to submit`);
      return;
    }
  } else if (args.includes("--urls")) {
    mode = "urls";
    urls = args.slice(args.indexOf("--urls") + 1).filter((u) => u.startsWith("http"));
  } else {
    console.error("usage: indexnow-submit.mjs --all | --recent <days> | --urls <url...> [--dry-run]");
    process.exit(2);
  }

  const offHost = urls.filter((u) => new URL(u).host !== HOST);
  if (offHost.length) throw new Error(`refusing: ${offHost.length} URLs not on ${HOST} (e.g. ${offHost[0]})`);

  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
  if (dryRun) {
    console.log(`indexnow DRY RUN (${mode}): ${urls.length} URLs`);
    console.log(urls.slice(0, 5).join("\n") + (urls.length > 5 ? `\n… +${urls.length - 5} more` : ""));
    return;
  }

  // Sanity: the key file must be live before engines will trust the submission.
  const keyRes = await fetch(KEY_LOCATION);
  const keyBody = (await keyRes.text()).trim();
  if (!keyRes.ok || keyBody !== KEY) {
    throw new Error(`key file not live at ${KEY_LOCATION} (HTTP ${keyRes.status}) — deploy it first`);
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const ok = res.status === 200 || res.status === 202;
  appendFileSync(
    LOG,
    JSON.stringify({
      date: new Date().toISOString(),
      mode,
      submitted: urls.length,
      status: res.status,
      ok,
    }) + "\n",
  );
  console.log(`indexnow: submitted ${urls.length} URLs (${mode}) → HTTP ${res.status}${ok ? " ✓" : " — NOT accepted"}`);
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(`indexnow: ${e.message}`);
  process.exit(1);
});
