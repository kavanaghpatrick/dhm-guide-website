// scripts/seo/prospector/seed.mjs
// SEED stage: gather candidate keywords from every opportunity surface we
// already own — the GSC export ([OWN] receipts), the catalog
// (dhmguide: src/data/topProducts.json; arcompare used dataset/products.csv),
// the rank-tracker history, an optional launch calendar, and the explicit
// seeds file (docs/seo/prospector-seeds.json). Ported from arcompare-fable
// 2026-11-23.
//
// Seeds are free. Everything paid happens downstream (expand/gate), which
// is why this stage is maximal: a seed costs nothing until the planner
// decides to fan it out under the budget cap.

import { normalizeKeyword, parseCsv, parseJsonl } from "./lib.mjs";

/**
 * GSC "Queries" export → [OWN] receipt rows.
 * Header convention (docs/seo/gsc-queries-latest.csv):
 *   Top queries,Clicks,Impressions,CTR,Position
 */
export function parseGscCsv(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  // Header: the UI export says "Top queries"; scripts/seo/gsc.py --csv says "query".
  const start = /^(top )?quer/i.test((rows[0][0] ?? "").trim()) ? 1 : 0;
  const out = [];
  for (const r of rows.slice(start)) {
    const keyword = (r[0] ?? "").trim();
    if (!keyword) continue;
    out.push({
      keyword,
      clicks: Number.parseInt(r[1] ?? "0", 10) || 0,
      impressions: Number.parseInt(r[2] ?? "0", 10) || 0,
      position: Number.parseFloat(r[4] ?? "") || null,
    });
  }
  return out;
}

const cleanProductName = (name) =>
  String(name ?? "")
    .replace(/\([^)]*\)/g, " ") // strip "(3rd Gen)" style qualifiers
    .replace(/\s+/g, " ")
    .trim();

/** dataset/products.csv → catalog rows (named columns, alias-split). */
export function parseProductsCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const [iSlug, iName, iBrand, iAliases, iCategory, iStatus] = [
    col("slug"),
    col("name"),
    col("brand"),
    col("aliases"),
    col("category"),
    col("status"),
  ];
  const out = [];
  for (const r of rows.slice(1)) {
    const slug = (r[iSlug] ?? "").trim();
    if (!slug) continue;
    out.push({
      slug,
      name: cleanProductName(r[iName]),
      brand: (r[iBrand] ?? "").trim(),
      aliases: (r[iAliases] ?? "")
        .split(/[;|]/)
        .map((a) => a.trim())
        .filter(Boolean),
      category: (r[iCategory] ?? "").trim(),
      status: (r[iStatus] ?? "").trim(),
    });
  }
  return out;
}

/**
 * dhmguide catalog (src/data/topProducts.json: [{ name, brand, category, ... }])
 * → the same row shape parseProductsCsv returns. The JSON has no slug,
 * aliases or status, so slug = kebab of the cleaned name, aliases = [].
 */
export function parseTopProductsJson(text) {
  const data = JSON.parse(String(text ?? "[]"));
  const out = [];
  for (const p of Array.isArray(data) ? data : []) {
    const name = cleanProductName(p?.name);
    const slug = normalizeKeyword(name).replace(/ /g, "-");
    if (!slug) continue;
    out.push({
      slug,
      name,
      brand: String(p?.brand ?? "").replace(/[®™]/g, "").trim(),
      aliases: [],
      category: String(p?.category ?? "").trim(),
      status: "",
    });
  }
  return out;
}

/** topProducts.json category → a seedable shopper phrasing. */
const CATEGORY_SEEDS = {
  premium: "best dhm supplement",
  budget: "cheap dhm supplement",
  comprehensive: "hangover prevention supplement",
  convenience: "hangover pills",
};

/** Catalog → seeds: product names, brands, category stubs. */
export function productSeeds(products) {
  const seeds = new Map();
  const add = (keyword, why) => {
    const norm = normalizeKeyword(keyword);
    if (norm && !seeds.has(norm)) seeds.set(norm, { keyword: norm, why });
  };
  for (const p of products) {
    add(p.name, `catalog product: ${p.slug}`);
    for (const a of p.aliases) add(a, `catalog alias of ${p.slug}`);
  }
  for (const p of products) add(p.brand, `catalog brand: ${p.brand}`);
  for (const p of products) {
    const cat = CATEGORY_SEEDS[p.category] ?? (p.category ? `${p.category.replace(/-/g, " ")} dhm supplement` : "");
    if (cat) add(cat, `catalog category stub: ${p.category}`);
  }
  return [...seeds.values()];
}

/** docs/seo/rank-history.jsonl → the distinct tracked keywords. */
export function rankHistorySeeds(text) {
  const seen = new Set();
  for (const row of parseJsonl(text)) {
    if (row?.keyword) seen.add(String(row.keyword));
  }
  return [...seen];
}

/**
 * Optional launch calendar (docs/seo/launch-calendar.md, markdown tables
 * in the C4 row format: Product | Brand | announced date | expected ship
 * date | source URL). Dates/claims there are re-verified before any build
 * — every derived seed carries the re-verify caveat (cluster map row 22
 * rule). Launch provenance (spec C6, 2026-11-23): every calendar seed
 * carries `launch: true`, plus `ship_date` when the row's expected-ship
 * cell is a real date — the flag and date ride the seed into the pool and
 * re-attach on queue rows at output; the 7-day launch verdict shelf
 * (gate.mjs) keys on the ship date.
 */
export function parseLaunchCalendar(md) {
  const seeds = [];
  for (const line of String(md ?? "").split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((c) => c.trim());
    const product = cells[1] ?? "";
    const brand = cells[2] ?? "";
    if (!product || /^-+$/.test(product) || /^product$/i.test(product)) continue;
    const cleaned = normalizeKeyword(product.replace(/\([^)]*\)/g, " ").replace(/["“”]/g, " "));
    if (!cleaned) continue;
    const brandNorm = normalizeKeyword(brand.split(/[/(]/)[0] ?? "");
    const keyword = brandNorm && !cleaned.includes(brandNorm) ? `${brandNorm} ${cleaned}` : cleaned;
    const shipCell = cells[4] ?? "";
    seeds.push({
      keyword,
      launch: true,
      ...(/^\d{4}-\d{2}-\d{2}$/.test(shipCell) ? { ship_date: shipCell } : {}),
      why: "launch-calendar row — third-party reporting; re-verify the row before arming any build",
    });
  }
  return seeds;
}

const SEED_MARKETS = new Set(["us", "jp", "all"]);

/**
 * The explicit seeds-file contract (docs/seo/prospector-seeds.json):
 *   { "version": 1, "seeds": [ { "keyword": "...", "market"?: "us"|"jp"|"all",
 *     "why"?: "...", "suggest"?: true } ] }
 * `suggest: true` asks the expansion planner for a full-text
 * keyword_suggestions fan-out of that exact phrase (one paid call) instead
 * of riding a batched keyword_ideas call.
 * @returns {{ ok: boolean, errors: string[], seeds: object[] }}
 */
export function validateSeedsFile(data) {
  const errors = [];
  const seeds = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: ["seeds file must be a JSON object"], seeds };
  }
  if (data.version !== 1) errors.push(`version must be 1 (got ${JSON.stringify(data.version)})`);
  if (!Array.isArray(data.seeds) || data.seeds.length === 0) {
    errors.push("seeds must be a non-empty array");
    return { ok: false, errors, seeds };
  }
  data.seeds.forEach((s, i) => {
    const at = `seeds[${i}]`;
    if (!s || typeof s !== "object") {
      errors.push(`${at}: must be an object`);
      return;
    }
    const keyword = typeof s.keyword === "string" ? s.keyword.trim() : "";
    if (keyword.length < 2 || keyword.length > 80) {
      errors.push(`${at}: keyword required (2-80 chars)`);
      return;
    }
    const market = s.market ?? "all";
    if (!SEED_MARKETS.has(market)) {
      errors.push(`${at}: market must be us|jp|all (got ${JSON.stringify(s.market)})`);
      return;
    }
    const seed = { keyword, market, why: s.why ?? "" };
    if (s.suggest === true) seed.suggest = true;
    seeds.push(seed);
  });
  return { ok: errors.length === 0, errors, seeds };
}

const setDefined = (target, extra) => {
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) target[k] = v;
};

/**
 * Merge every seed source into one deduped pool (normalized-keyword keyed):
 * sources union, [OWN] receipts attach from GSC, GSC queries absent from
 * the rank-tracker history flag as new entrants, seeds-file entries filter
 * by market.
 */
export function mergeSeeds(
  { gsc = [], products = [], rankHistory = [], calendar = [], seedsFile = [] } = {},
  { market = "us" } = {},
) {
  const tracked = new Set(rankHistory.map((k) => normalizeKeyword(k)));
  const pool = new Map();
  const add = (kw, source, extra = {}) => {
    const norm = normalizeKeyword(kw);
    if (!norm) return;
    const cur = pool.get(norm) ?? { keyword: norm, sources: [] };
    if (!cur.sources.includes(source)) cur.sources.push(source);
    setDefined(cur, extra);
    pool.set(norm, cur);
  };
  for (const g of gsc) {
    add(g.keyword, "gsc", {
      own: { clicks: g.clicks, impressions: g.impressions, position: g.position },
      new_entrant: !tracked.has(normalizeKeyword(g.keyword)),
    });
  }
  for (const p of products) add(p.keyword, "catalog", { why: p.why });
  for (const k of rankHistory) add(k, "rank-history", { new_entrant: false });
  for (const c of calendar) add(c.keyword, "calendar", { why: c.why, launch: c.launch, ship_date: c.ship_date });
  for (const s of seedsFile) {
    if (s.market !== "all" && s.market !== market) continue;
    add(s.keyword, "seeds-file", { why: s.why, suggest: s.suggest });
  }
  return [...pool.values()];
}
