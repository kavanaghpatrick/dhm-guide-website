// scripts/seo/prospector/smoke.test.mjs
// Run: node --test scripts/seo/prospector/
// Free, offline: no DataForSEO calls, no network.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { AUTHORITY_HOSTS, authorityWall, scoreSerp, inCategory } from "./gate.mjs";
import { mergeSeeds, parseGscCsv, parseTopProductsJson, productSeeds } from "./seed.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const org = (rank, domain) => ({ type: "organic", rank_group: rank, rank_absolute: rank + 1, domain });

// 1. Authority-walled: Mayo, Cleveland Clinic, Healthline in organic top-5, no shopping grid.
const AUTHORITY_SERP = {
  items: [
    org(1, "www.mayoclinic.org"),
    org(2, "my.clevelandclinic.org"),
    org(3, "www.healthline.com"),
    org(4, "www.reddit.com"),
    org(5, "smallsupplementblog.com"),
    org(6, "anotherblog.net"),
  ],
};

// 1b. AI Overview + only 2 authority hosts in top-5 also walls.
const AIO_AUTHORITY_SERP = {
  items: [
    { type: "ai_overview", rank_group: 1, rank_absolute: 1 },
    org(1, "www.webmd.com"),
    org(2, "smallsupplementblog.com"),
    org(3, "pubmed.ncbi.nlm.nih.gov"),
    org(4, "anotherblog.net"),
    org(5, "thirdblog.org"),
  ],
};

// 2. Shopping-walled: popular_products grid at absolute position 2.
const SHOPPING_SERP = {
  items: [
    { type: "popular_products", rank_group: 1, rank_absolute: 2 },
    org(1, "www.amazon.com"),
    org(2, "smallsupplementblog.com"),
    org(3, "www.walmart.com"),
  ],
};

// 3. Admits: forum-heavy, small blogs, no authority wall, no grid.
const ADMITS_SERP = {
  items: [
    { type: "discussions_and_forums", rank_group: 1, rank_absolute: 1 },
    org(1, "www.reddit.com"),
    org(2, "smallsupplementblog.com"),
    org(3, "www.quora.com"),
    org(4, "www.healthline.com"),
    org(5, "anotherblog.net"),
  ],
};

test("authority host list is an exported top-level const with the medical authorities", () => {
  assert.ok(Array.isArray(AUTHORITY_HOSTS));
  for (const h of ["mayoclinic.org", "healthline.com", "nih.gov", "verywellhealth.com"]) {
    assert.ok(AUTHORITY_HOSTS.includes(h), `${h} missing`);
  }
});

test("authority-walled SERP → WALLED by the authority wall", () => {
  const w = authorityWall(AUTHORITY_SERP.items);
  assert.equal(w.walled, true);
  assert.equal(w.authority_top5, 3);
  const s = scoreSerp(AUTHORITY_SERP);
  assert.equal(s.verdict, "WALLED");
  assert.equal(s.basis, "WALLED-AUTHORITY");
});

test("AI Overview + 2 authority hosts in top-5 → WALLED-AUTHORITY", () => {
  const s = scoreSerp(AIO_AUTHORITY_SERP);
  assert.equal(s.verdict, "WALLED");
  assert.equal(s.basis, "WALLED-AUTHORITY");
  assert.equal(s.authority_top5, 2);
});

test("shopping-walled SERP → WALLED by the shopping wall (law kept verbatim)", () => {
  const s = scoreSerp(SHOPPING_SERP);
  assert.equal(s.verdict, "WALLED");
  assert.equal(s.basis, "top-grid");
  assert.equal(authorityWall(SHOPPING_SERP.items).walled, false);
});

test("forum-heavy SERP with one authority host → ADMITS", () => {
  const w = authorityWall(ADMITS_SERP.items);
  assert.equal(w.walled, false);
  assert.equal(w.authority_top5, 1);
  const s = scoreSerp(ADMITS_SERP);
  assert.equal(s.verdict, "ADMITS");
});

test("seed parser reads the 3-row GSC fixture (quoted comma field, header skipped)", () => {
  const rows = parseGscCsv(readFileSync(resolve(HERE, "fixtures/gsc-queries-3row.csv"), "utf-8"));
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { keyword: "dhm before or after drinking", clicks: 15, impressions: 147, position: 2.6 });
  assert.equal(rows[1].keyword, "how much dhm to take, per drink");
  assert.equal(rows[1].clicks, 10);
  assert.equal(rows[2].impressions, 412);
});

test("seed parser also accepts gsc.py's own 'query,clicks,...' header", () => {
  const rows = parseGscCsv("query,clicks,impressions,ctr,position\ndhm dosage,3,40,0.075,4.1\n");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].keyword, "dhm dosage");
});

test("topProducts.json catalog → product + brand seeds; merged pool carries [OWN] receipts", () => {
  const catalog = parseTopProductsJson(
    JSON.stringify([
      { name: "No Days Wasted DHM Detox", brand: "No Days Wasted", category: "premium" },
      { name: "Toniiq Ease", brand: "Toniiq", category: "comprehensive" },
    ]),
  );
  assert.equal(catalog[0].slug, "no-days-wasted-dhm-detox");
  const seeds = productSeeds(catalog).map((s) => s.keyword);
  assert.ok(seeds.includes("toniiq ease"));
  assert.ok(seeds.includes("no days wasted"));
  assert.ok(!seeds.some((k) => k.includes("glasses")));
  const gsc = parseGscCsv(readFileSync(resolve(HERE, "fixtures/gsc-queries-3row.csv"), "utf-8"));
  const pool = mergeSeeds({ gsc, products: productSeeds(catalog) });
  const hit = pool.find((p) => p.keyword === "dhm before or after drinking");
  assert.deepEqual(hit.own, { clicks: 15, impressions: 147, position: 2.6 });
});

test("in-category gate admits niche phrasings and drops off-niche ones", () => {
  const c = (kw) => ({ members: [{ keyword: kw }], entities: [] });
  assert.equal(inCategory(c("best liver supplement")).ok, true);
  assert.equal(inCategory(c("dhm before or after drinking")).ok, true);
  assert.equal(inCategory(c("hangover cure reddit")).ok, true);
  assert.equal(inCategory(c("best smart glasses")).ok, false);
  // Store-product + alcohol questions (previously judged winnable terrain).
  assert.equal(inCategory(c("pepto bismol alcohol")).ok, true);
  assert.equal(inCategory(c("can you drink alcohol with tylenol")).ok, true);
  assert.equal(inCategory(c("electrolyte alcohol drink")).ok, true);
  assert.equal(inCategory(c("electrolyte powder")).ok, false);
});

// DataForSEO (Nov 2026) returns organic rows as google.com/goto redirects with
// domain "google.com"; the real host only survives in the breadcrumb.
const gotoOrg = (rank, host) => ({
  type: "organic", rank_group: rank, rank_absolute: rank + 1, domain: "google.com",
  url: "https://google.com/goto?url=CAES", breadcrumb: `https://${host} › some-path`,
});
test("google.com/goto organic rows score by their breadcrumb host", () => {
  const s = scoreSerp({ items: [
    { type: "ai_overview", rank_group: 1 },
    gotoOrg(1, "www.mayoclinic.org"), gotoOrg(2, "www.webmd.com"), gotoOrg(3, "www.reddit.com"),
  ] });
  assert.equal(s.basis, "WALLED-AUTHORITY");
  assert.equal(s.top3[0].domain, "mayoclinic.org");
});
test("masked domain with a real url scores by the url host", () => {
  const org = (rank, url) => ({ type: "organic", rank_group: rank, rank_absolute: rank + 1, domain: "google.com", url });
  const w = authorityWall([
    { type: "ai_overview", rank_group: 1 },
    org(1, "https://www.mayoclinic.org/x"), org(2, "https://my.clevelandclinic.org/y"), org(3, "https://www.reddit.com/z"),
  ]);
  assert.equal(w.authority_top5, 2);
  assert.equal(w.walled, true);
});
