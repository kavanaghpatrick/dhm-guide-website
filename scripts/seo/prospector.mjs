// scripts/seo/prospector.mjs
// THE PROSPECTOR — the standing cluster-discovery engine, for dhmguide.com.
//
// Ported 2026-11-23 from arcompare-fable/scripts/seo/prospector.mjs. What
// changed for dhmguide: catalog = src/data/topProducts.json (no
// dataset/products.csv here); sitemap dedupe = https://www.dhmguide.com/sitemap.xml;
// page sketches live under /never-hungover/<slug>; the gate adds the
// WALLED-AUTHORITY wall (medical-authority SERPs) next to the verbatim
// shopping wall. All paths below resolve against the dhm repo ROOT.
//
// REQUIRED ENV (paid stages only: expand, gate, run):
//   DFSEO_AUTH_B64  base64 of "login:password" for DataForSEO. Same variable
//                   arcompare uses; it lives in ~/wechat/.env. Export just
//                   that one line, e.g.
//     export DFSEO_AUTH_B64="$(grep '^DFSEO_AUTH_B64=' ~/wechat/.env | cut -d= -f2-)"
//   seed / cluster / adjacent / ingest / report need no credentials and
//   make no paid calls. Free tests: node --test scripts/seo/prospector/smoke.test.mjs
//
// Original arcompare notes follow (paths/flags unchanged unless noted).
// seed → expand → cluster → gate → queue, as a permanent repo tool
// (owner order 2026-10-07: systematic discovery of adjacent clusters
// using all SEO data as an opportunity map; the path to shipping at
// scale is growing the LICENSED terrain daily).
//
// It automates the manual process of reports/cluster-map-2026-10-06.md:
//   SEED    free — gather candidates from docs/seo/gsc-queries-latest.csv
//           ([OWN] receipts, new-entrant flagged), src/data/topProducts.json
//           (names/brands/category stubs), docs/seo/rank-history.jsonl,
//           docs/seo/launch-calendar.md (optional, re-verify caveat), and
//           docs/seo/prospector-seeds.json (explicit starters incl.
//           adjacent-category stubs; suggest:true buys a full-text fan-out).
//   EXPAND  paid — DataForSEO Labs keyword_ideas (batched) +
//           keyword_suggestions (suggest-flagged seeds), budget-capped via
//           --budget (default $2/run, 20% reserved for pricing); kill-listed
//           seeds never fan out. Unpriced ingested candidates price in one
//           google_ads search_volume batch when budget remains.
//   CLUSTER free — intent clusters (vs/alternatives/which/specs/use-case/
//           explainer; heads recorded, never built), est-unique dedupe at
//           MAX volume, catalog entity anchoring, one page class per cluster.
//   GATE    paid — one live SERP per cluster head (depth-30 advanced, the
//           rank-tracker convention) scored by the MEASURED wall law
//           (first shopping unit at absolute position ≤3, or ≤6 with 2+
//           units = WALLED; top-of-page grids only), kill-ledger filter
//           (docs/seo/prospector-killed.jsonl — §E classes, nothing
//           re-litigates), dedupe against the live sitemap + built content,
//           verdict memory with the 30-day shelf-life (Recipe 2 G5).
//           Pair sides RESOLVE before anything spends (lane10-verify bounce
//           2026-10-07): elliptical sides map via brand siblings, bare
//           brands canonicalize to their single available model, brand-vs
//           clusters sketch the registered HUB slug so hub dedupe fires,
//           and one canonical pair/hub never spends twice in a run. A vs
//           phrasing with an unmappable side lands UNRESOLVED — it
//           licenses nothing and spends nothing. Every row also joins the
//           fence/claims layer (docs/seo/prospector-fences.jsonl + the
//           arm-pages fixture): frozen-slug pairs, reads-doc deferred
//           queues, and open lane claims travel on the row as ⚠ notes.
//   OUTPUT  docs/seo/prospector-queue.jsonl (append-only machine rows) +
//           docs/seo/PROSPECTOR_QUEUE.md (rebuilt from full history) + every
//           raw API response under docs/seo/prospector-raws/<date>/
//           (admission evidence outlives the session).
//
// Usage (on demand):
//   DFSEO_AUTH_B64=... node scripts/seo/prospector.mjs run --budget 5 --summary
//   node scripts/seo/prospector.mjs run --market jp --budget 2      JP lane
//   node scripts/seo/prospector.mjs seed                            free, no API
//   node scripts/seo/prospector.mjs adjacent --out pack.json        emit the agent prompt pack
//   node scripts/seo/prospector.mjs ingest reply.json               validate + merge agent JSON
//   node scripts/seo/prospector.mjs report                          rebuild the MD from history
//   node scripts/seo/prospector.mjs regenerate --date YYYY-MM-DD    re-decide a run from its
//                                                                   committed raws at $0 (replaces
//                                                                   the queue; exits 1 on conflicts)
// Weekly wiring (arcompare only; not wired in dhmguide): weekly-tracking.sh
// runs `run --budget 2 --summary` as a counted leg.
//
// The agentic adjacency loop (LLM candidates are generated by Claude
// agents, never by this tool):
//   1. node scripts/seo/prospector.mjs adjacent --market us --out pack.json
//   2. hand pack.json to an agent; it replies with JSON matching the
//      pack's reply_contract (persona × use-case × product-class × market
//      crossings, rationale REQUIRED per candidate)
//   3. node scripts/seo/prospector.mjs ingest reply.json --market us
//   4. node scripts/seo/prospector.mjs run ... — ingested candidates are
//      priced, clustered and gated like any other pool row
//
// Flags: --market us|jp (default us) · --budget USD (default 2) · --top N
// (max NEW gate pulls/run, default 25) · --date YYYY-MM-DD (run-dir
// override) · --sitemap-file <path> (offline dedupe; default = live
// sitemap fetch) · --refresh (re-gate stale >30d verdicts) · --fresh-first
// (gate receipt-less clusters first, by volume) · --out <file>
// (adjacent) · --summary (weekly log line).
//
// Spend discipline: every paid call lands in the run dir's
// spend-ledger.json with task.cost actuals; stages stop BEFORE exceeding
// --budget. Gate pulls ~$0.005-0.006; expansion calls ~$0.02-0.08.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MARKETS, ROOT, normalizeKeyword, parseJsonl, rawSlug, todayISO } from "./prospector/lib.mjs";
import {
  mergeSeeds,
  parseGscCsv,
  parseLaunchCalendar,
  parseTopProductsJson,
  productSeeds,
  rankHistorySeeds,
  validateSeedsFile,
} from "./prospector/seed.mjs";
import {
  buildAdjacencyPack,
  parseExpansion,
  planExpansionCalls,
  validateIngest,
} from "./prospector/expand.mjs";
import { clusterKeywords, entityLexicon } from "./prospector/cluster.mjs";
import {
  decideCluster,
  killMatch,
  loadFences,
  loadKilled,
  scoreSerp,
} from "./prospector/gate.mjs";
import { buildQueueRow, queueConsistency, renderQueue, walledLaunchHeads } from "./prospector/output.mjs";

const PATHS = {
  gsc: resolve(ROOT, "docs/seo/gsc-queries-latest.csv"),
  products: resolve(ROOT, "src/data/topProducts.json"),
  rankHistory: resolve(ROOT, "docs/seo/rank-history.jsonl"),
  calendar: resolve(ROOT, "docs/seo/launch-calendar.md"),
  seedsFile: resolve(ROOT, "docs/seo/prospector-seeds.json"),
  killed: resolve(ROOT, "docs/seo/prospector-killed.jsonl"),
  fences: resolve(ROOT, "docs/seo/prospector-fences.jsonl"),
  armPages: resolve(ROOT, "tests/fixtures/fences/arm-pages.txt"),
  brandHubRegistry: resolve(ROOT, "src/utils/brand-hub-registry.ts"),
  queueJsonl: resolve(ROOT, "docs/seo/prospector-queue.jsonl"),
  queueMd: resolve(ROOT, "docs/seo/PROSPECTOR_QUEUE.md"),
  rawsRoot: resolve(ROOT, "docs/seo/prospector-raws"),
};
// dhmguide serves one flat sitemap (no index); fetchSitemapLocs falls back
// to reading the locs of this file directly when it lists no child .xml.
const SITEMAP_INDEX = "https://www.dhmguide.com/sitemap.xml";

// ---------------------------------------------------------------------------
// CLI plumbing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--market") args.market = argv[++i];
    else if (a === "--budget") args.budget = Number.parseFloat(argv[++i]);
    else if (a === "--top") args.top = Number.parseInt(argv[++i], 10);
    else if (a === "--date") args.date = argv[++i];
    else if (a === "--sitemap-file") args.sitemapFile = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--refresh") args.refresh = true;
    else if (a === "--summary") args.summary = true;
    else if (a === "--fresh-first") args.freshFirst = true;
    else args._.push(a);
  }
  args.market = args.market ?? "us";
  if (!MARKETS[args.market]) {
    console.error(`unknown market "${args.market}" — use us|jp`);
    process.exit(1);
  }
  args.budget = Number.isFinite(args.budget) ? args.budget : 2;
  args.top = Number.isFinite(args.top) ? args.top : 25;
  args.date = args.date ?? todayISO();
  return args;
}

const read = (p) => readFileSync(p, "utf-8");
const readIf = (p) => (existsSync(p) ? read(p) : null);
const readJsonIf = (p) => {
  const t = readIf(p);
  return t == null ? null : JSON.parse(t);
};

function runDir(date) {
  const dir = resolve(PATHS.rawsRoot, date);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function ledgerOf(dir, cap) {
  const p = resolve(dir, "spend-ledger.json");
  const cur = readJsonIf(p) ?? { cap_usd: cap, total_usd: 0, items: [] };
  cur.cap_usd = cap;
  return {
    ...cur,
    add(name, path, cost, status, message) {
      cur.items.push({ name, path, cost, status, message });
      cur.total_usd = +(cur.total_usd + (cost ?? 0)).toFixed(6);
      writeFileSync(p, JSON.stringify(cur, null, 1));
      this.total_usd = cur.total_usd;
    },
  };
}

// ---------------------------------------------------------------------------
// Fetchers (paid where marked). Raw envelopes are ALWAYS saved — the
// admission-evidence-outlives-the-session convention.
// ---------------------------------------------------------------------------

function requireAuth() {
  const auth = process.env.DFSEO_AUTH_B64;
  if (!auth) {
    console.error("Set DFSEO_AUTH_B64 (base64 login:password for DataForSEO; it lives in ~/wechat/.env — see the header)");
    process.exit(1);
  }
  return auth;
}

async function dfseoPost(auth, path, payload) {
  const res = await fetch(`https://api.dataforseo.com/v3/${path}`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify([payload]),
  });
  return res.json();
}

/**
 * One live advanced SERP (depth 30 — at depth 30 the advanced payload
 * returns the ai_overview item synchronously, house-verified; same
 * conventions as rank-tracker.mjs fetchSerp, duplicated here only so the
 * FULL raw envelope can be saved as the receipt).
 */
async function fetchSerpEnvelope(auth, keyword, market) {
  const loc = MARKETS[market];
  return dfseoPost(auth, "serp/google/organic/live/advanced", {
    keyword,
    location_code: loc.location_code,
    language_code: loc.language_code,
    depth: 30,
  });
}

async function fetchSitemapLocs(sitemapFile) {
  if (sitemapFile) {
    const text = read(sitemapFile);
    return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  }
  const locsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const idx = await fetch(SITEMAP_INDEX).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))));
  const children = locsOf(idx).filter((u) => u.endsWith(".xml"));
  const all = [];
  for (const child of children.length ? children : [SITEMAP_INDEX]) {
    try {
      const xml = await fetch(child).then((r) => (r.ok ? r.text() : ""));
      all.push(...locsOf(xml).filter((u) => !u.endsWith(".xml")));
    } catch {
      /* child fetch failure degrades to fewer locs */
    }
  }
  return all;
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

function loadCatalog() {
  return parseTopProductsJson(read(PATHS.products));
}

function loadKilledRows() {
  return loadKilled(readIf(PATHS.killed) ?? "");
}

function loadSeedsFile() {
  const raw = readJsonIf(PATHS.seedsFile);
  if (!raw) return { seeds: [], errors: ["docs/seo/prospector-seeds.json missing"] };
  const v = validateSeedsFile(raw);
  if (!v.ok) {
    console.error("seeds file INVALID:\n  " + v.errors.join("\n  "));
    process.exit(1);
  }
  return { seeds: v.seeds, errors: [] };
}

function stageSeed({ market, date }) {
  const dir = runDir(date);
  const products = loadCatalog();
  const gscText = readIf(PATHS.gsc);
  const calendarText = readIf(PATHS.calendar);
  const seeds = mergeSeeds(
    {
      gsc: gscText ? parseGscCsv(gscText) : [],
      products: productSeeds(products),
      rankHistory: existsSync(PATHS.rankHistory) ? rankHistorySeeds(read(PATHS.rankHistory)) : [],
      calendar: calendarText ? parseLaunchCalendar(calendarText) : [],
      seedsFile: loadSeedsFile().seeds,
    },
    { market },
  );
  const out = resolve(dir, `seeds-${market}.json`);
  writeFileSync(out, JSON.stringify({ date, market, count: seeds.length, seeds }, null, 1));
  const by = {};
  for (const s of seeds) for (const src of s.sources) by[src] = (by[src] ?? 0) + 1;
  console.log(
    `seed[${market}]: ${seeds.length} seeds (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(" · ")})${calendarText ? "" : " · launch calendar absent (optional)"} → ${out}`,
  );
  return seeds;
}

function loadPool(dir, market) {
  return readJsonIf(resolve(dir, `pool-${market}.json`))?.rows ?? [];
}

function writePool(dir, market, rows) {
  writeFileSync(resolve(dir, `pool-${market}.json`), JSON.stringify({ market, count: rows.length, rows }, null, 1));
  const csv = ["keyword,volume,cpc,competition,src"];
  for (const r of rows) {
    csv.push(`"${String(r.keyword).replace(/"/g, '""')}",${r.volume ?? ""},${r.cpc ?? ""},${r.competition ?? ""},${r.src ?? ""}`);
  }
  writeFileSync(resolve(dir, `pool-${market}.csv`), csv.join("\n") + "\n");
}

/** Merge rows into the pool keyed by normalized keyword (max volume wins). */
function mergeIntoPool(pool, rows) {
  const byKw = new Map(pool.map((r) => [normalizeKeyword(r.keyword), r]));
  for (const r of rows) {
    const k = normalizeKeyword(r.keyword);
    if (!k) continue;
    const cur = byKw.get(k);
    if (!cur) {
      byKw.set(k, { ...r, keyword: k });
    } else {
      if ((r.volume ?? -1) > (cur.volume ?? -1)) cur.volume = r.volume;
      if (r.own && !cur.own) cur.own = r.own;
      if (r.src && !String(cur.src ?? "").includes(r.src)) cur.src = cur.src ? `${cur.src}+${r.src}` : r.src;
      // launch/ship_date: calendar-seed provenance (spec C6, 2026-11-23) —
      // rides pool rows into cluster members, re-attached on queue rows.
      for (const extra of ["intent_class", "rationale", "persona", "crossing", "expected_page", "launch", "ship_date"]) {
        if (r[extra] && !cur[extra]) cur[extra] = r[extra];
      }
    }
  }
  return [...byKw.values()];
}

async function stageExpand({ market, date, budget }, seeds) {
  const auth = requireAuth();
  const dir = runDir(date);
  const ledger = ledgerOf(dir, budget);
  const killedRows = loadKilledRows();
  const remaining = Math.max(0, budget - ledger.total_usd);
  // Fan-out selection: deliberate seeds (seeds-file / catalog / calendar)
  // always fan out; GSC receipts fan out top-120 by impressions. The FULL
  // seed pool still clusters below — fan-out only decides where the paid
  // ideas/suggestions calls aim.
  const isDeliberate = (s) => s.sources.some((x) => ["seeds-file", "catalog", "calendar"].includes(x));
  const fanout = [
    ...seeds.filter(isDeliberate),
    ...seeds
      .filter((s) => s.sources.includes("gsc") && !isDeliberate(s))
      .sort((a, b) => (b.own?.impressions ?? 0) - (a.own?.impressions ?? 0))
      .slice(0, 120),
  ];
  const calls = planExpansionCalls(fanout, { market, budget: remaining, killedRows, ideasChunk: 50 });

  let pool = loadPool(dir, market);
  // Seeds themselves enter the pool (volume null) so own-receipt seeds
  // cluster even when no API row prices them.
  pool = mergeIntoPool(
    pool,
    seeds
      .filter((s) => !killMatch(s.keyword, killedRows, market))
      .map((s) => ({ keyword: s.keyword, volume: null, src: `seed:${s.sources.join("+")}`, own: s.own ?? undefined, launch: s.launch ?? undefined, ship_date: s.ship_date ?? undefined })),
  );

  let hardErrors = 0;
  for (const call of calls) {
    if (ledger.total_usd + call.est_cost > budget) {
      console.error(`  expand STOP: $${ledger.total_usd.toFixed(4)} spent, next call est $${call.est_cost} would break the $${budget} cap`);
      break;
    }
    try {
      const data = await dfseoPost(auth, call.path, call.payload);
      writeFileSync(resolve(dir, `expand-${call.name}.json`), JSON.stringify(data, null, 1));
      const { rows, cost, status } = parseExpansion(data, call.name);
      ledger.add(call.name, call.path, cost, status, data?.tasks?.[0]?.status_message);
      if (status !== 20000) {
        console.error(`  ERR expand ${call.name}: status ${status} ${data?.tasks?.[0]?.status_message ?? ""}`);
        hardErrors += 1;
        continue;
      }
      pool = mergeIntoPool(pool, rows);
      console.log(`  expand ${call.name}: ${rows.length} rows ($${cost.toFixed(4)}, total $${ledger.total_usd.toFixed(4)})`);
    } catch (e) {
      hardErrors += 1;
      console.error(`  NET expand ${call.name}: ${e.message}`);
    }
  }

  // Price unpriced ingested/adjacent rows in one google_ads batch if
  // budget remains (the reserved 20%).
  const unpriced = pool.filter((r) => r.volume == null && String(r.src ?? "").includes("adjacent:"));
  if (unpriced.length > 0 && ledger.total_usd + 0.05 <= budget) {
    const loc = MARKETS[market];
    try {
      const data = await dfseoPost(auth, "keywords_data/google_ads/search_volume/live", {
        keywords: unpriced.slice(0, 1000).map((r) => r.keyword),
        location_code: loc.location_code,
        language_code: loc.language_code,
      });
      writeFileSync(resolve(dir, `pricing-adjacent-${market}.json`), JSON.stringify(data, null, 1));
      const task = data?.tasks?.[0];
      ledger.add(`pricing-adjacent (${unpriced.length} kws)`, "keywords_data/google_ads/search_volume/live", task?.cost ?? 0, task?.status_code, task?.status_message);
      const vols = new Map();
      for (const it of task?.result ?? []) {
        if (it?.keyword) vols.set(normalizeKeyword(it.keyword), it.search_volume ?? 0);
      }
      for (const r of pool) {
        if (r.volume == null && vols.has(normalizeKeyword(r.keyword))) r.volume = vols.get(normalizeKeyword(r.keyword));
      }
      console.log(`  priced ${vols.size}/${unpriced.length} adjacency candidates ($${(task?.cost ?? 0).toFixed(4)})`);
    } catch (e) {
      console.error(`  NET pricing: ${e.message}`);
      hardErrors += 1;
    }
  }

  writePool(dir, market, pool);
  console.log(`expand[${market}]: pool ${pool.length} keywords · spent $${ledger.total_usd.toFixed(4)} of $${budget} → pool-${market}.csv`);
  return { pool, hardErrors };
}

function stageAdjacent({ market, date, out }) {
  const dir = runDir(date);
  const products = loadCatalog();
  const seedsJson = readJsonIf(resolve(dir, `seeds-${market}.json`));
  const seeds = seedsJson?.seeds ?? stageSeed({ market, date });
  const pack = buildAdjacencyPack({
    market,
    date,
    seeds: [...seeds].sort((a, b) => (b.own?.impressions ?? 0) - (a.own?.impressions ?? 0)),
    brands: [...new Set(products.map((p) => p.brand).filter(Boolean))],
    categories: [...new Set(products.map((p) => p.category).filter(Boolean))],
    killedRows: loadKilledRows(),
  });
  const packPath = resolve(dir, `adjacency-pack-${market}.json`);
  writeFileSync(packPath, JSON.stringify(pack, null, 1));
  if (out) writeFileSync(out, JSON.stringify(pack, null, 1));
  console.log(JSON.stringify(pack, null, 1));
  console.error(`adjacent[${market}]: pack written to ${out ?? packPath} — hand it to an agent, then ingest the reply JSON`);
}

function stageIngest({ market, date }, file) {
  if (!file) {
    console.error("usage: prospector.mjs ingest <reply.json> [--market us|jp]");
    process.exit(1);
  }
  const dir = runDir(date);
  const data = JSON.parse(read(resolve(file)));
  const pool = loadPool(dir, market);
  const prior = readJsonIf(resolve(dir, `ingested-${market}.json`))?.accepted ?? [];
  const existing = [...pool.map((r) => r.keyword), ...prior.map((r) => r.keyword)];
  const v = validateIngest(data, { market, killedRows: loadKilledRows(), existing });
  if (!v.ok) {
    console.error("ingest REJECTED:\n  " + v.errors.join("\n  "));
    process.exit(1);
  }
  const accepted = [...prior, ...v.accepted];
  writeFileSync(
    resolve(dir, `ingested-${market}.json`),
    JSON.stringify({ market, date, accepted, rejected: v.rejected }, null, 1),
  );
  writePool(dir, market, mergeIntoPool(pool, v.accepted));
  console.log(`ingest[${market}]: accepted ${v.accepted.length}, rejected ${v.rejected.length} → ingested-${market}.json`);
  for (const r of v.rejected) console.log(`  rejected "${r.keyword}": ${r.reason}`);
}

function stageCluster({ market, date }) {
  const dir = runDir(date);
  let pool = loadPool(dir, market);
  if (pool.length === 0) {
    const seeds = stageSeed({ market, date });
    const killedRows = loadKilledRows();
    pool = seeds
      .filter((s) => !killMatch(s.keyword, killedRows, market))
      .map((s) => ({ keyword: s.keyword, volume: null, src: `seed:${s.sources.join("+")}`, own: s.own ?? undefined, launch: s.launch ?? undefined, ship_date: s.ship_date ?? undefined }));
    writePool(dir, market, pool);
  }
  const ingested = readJsonIf(resolve(dir, `ingested-${market}.json`))?.accepted ?? [];
  pool = mergeIntoPool(pool, ingested);
  const lexicon = entityLexicon(loadCatalog());
  const clusters = clusterKeywords(pool, { lexicon, market });
  writeFileSync(resolve(dir, `clusters-${market}.json`), JSON.stringify({ market, count: clusters.length, clusters }, null, 1));
  console.log(`cluster[${market}]: ${pool.length} keywords → ${clusters.length} clusters → clusters-${market}.json`);
  for (const c of clusters.slice(0, 12)) {
    console.log(`  ${String(c.volume ?? 0).padStart(7)}  ${c.key}  (${c.est_unique.length} kws${c.own ? ` · [OWN] ${c.own.impressions}i/${c.own.clicks}c` : ""})`);
  }
  return clusters;
}

/** Hub slugs parsed from the registry source — single source of truth,
 * no TS import needed (the tool only needs the slug list). */
function loadBrandHubSlugs() {
  const text = readIf(PATHS.brandHubRegistry) ?? "";
  return [...text.matchAll(/slug:\s*"([a-z0-9-]+-vs-[a-z0-9-]+)"/g)].map((m) => m[1]);
}

function loadRunFences() {
  return loadFences({
    armPagesText: readIf(PATHS.armPages) ?? "",
    fencesText: readIf(PATHS.fences) ?? "",
  });
}

/** Offline raw lookup: the committed envelope for any phrasing this
 * cluster contains (regeneration consumes the existing receipts, $0). */
function findRawFor(dir, market, cluster, gateKeyword) {
  const candidates = [
    gateKeyword,
    ...(cluster.est_unique ?? []).map((e) => e.keyword),
    ...(cluster.members ?? []).map((m) => m.keyword),
  ].filter(Boolean);
  for (const kw of candidates) {
    const slug = rawSlug(market, kw);
    const p = resolve(dir, `serp-${slug}.json`);
    if (existsSync(p)) return { path: p, slug, keyword: kw };
  }
  return null;
}

async function stageGate({ market, date, budget, top, sitemapFile, refresh, freshFirst = false, offline = false, replaceQueue = false }) {
  const auth = offline ? null : requireAuth();
  const dir = runDir(date);
  const clusters = readJsonIf(resolve(dir, `clusters-${market}.json`))?.clusters ?? stageCluster({ market, date });
  const killedRows = loadKilledRows();
  const fences = loadRunFences();
  const brandHubSlugs = loadBrandHubSlugs();
  // Regeneration replaces the queue: history must be EMPTY or every
  // cluster would "carry" its own bounced verdict and emit nothing.
  const history = replaceQueue ? [] : existsSync(PATHS.queueJsonl) ? parseJsonl(read(PATHS.queueJsonl)) : [];
  const ledger = ledgerOf(dir, budget);

  // Sitemap locs: persisted run-dir snapshot first (offline determinism),
  // then --sitemap-file, then the live fetch (free) — persisted on success.
  const locsSnapshot = resolve(dir, `sitemap-locs.json`);
  let sitemapLocs = [];
  try {
    if (!sitemapFile && existsSync(locsSnapshot)) {
      sitemapLocs = JSON.parse(read(locsSnapshot)).locs;
    } else {
      sitemapLocs = await fetchSitemapLocs(sitemapFile);
      writeFileSync(locsSnapshot, JSON.stringify({ date, count: sitemapLocs.length, locs: sitemapLocs }));
    }
    console.log(`gate[${market}]: sitemap ${sitemapLocs.length} live URLs for dedupe`);
  } catch (e) {
    console.error(`  WARN sitemap fetch failed (${e.message}) — dedupe degraded to killed-ledger + history only`);
  }

  // Receipts-first ordering (C9, 2026-11-23): clusters carrying [OWN]
  // receipts gate first, by own.clicks desc — the only input that measured
  // predictive forward (ρ +0.34 vs realized clicks, n=187) — with
  // own.impressions as tie-break ONLY (−0.08 forward; never a primary key).
  // The receipt-less rest follow in cluster order, unsorted — the old
  // "then by [EXT] volume" comment was drift: they were never sorted here,
  // and volume_ext measured ρ +0.03, so no volume sort is added.
  const owned = clusters
    .filter((c) => c.own)
    .sort(
      (a, b) =>
        (b.own.clicks ?? 0) - (a.own.clicks ?? 0) ||
        (b.own.impressions ?? 0) - (a.own.impressions ?? 0),
    );
  // --fresh-first (dhmguide): spend on receipt-less terrain first, by volume.
  const fresh = clusters.filter((c) => !c.own);
  const ordered = freshFirst
    ? [...fresh.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)), ...owned]
    : [...owned, ...fresh];

  const newRows = [];
  const seenCanonical = new Set();
  let pulls = 0;
  let hardErrors = 0;
  const counts = {
    carried: 0, skipped: 0, stale: 0, killed: 0, built: 0, unresolved: 0,
    merged: 0, gated: 0, deferred: 0, thin: 0, offcat: 0,
  };
  // Off-category drops land in a committed run-dir table (frozen spec
  // 2026-10-07 §1: the $0 kill-filter's receipt), never in the queue.
  const offCategory = [];

  for (const cluster of ordered) {
    const d = decideCluster(cluster, {
      market, today: date, killedRows, history, sitemapLocs, fences,
      refresh, seenCanonical, brandHubSlugs,
    });

    if (d.action === "skip") { counts.skipped += 1; continue; }
    if (d.action === "carry") { counts.carried += 1; continue; }
    if (d.action === "stale-hold") { counts.stale += 1; continue; }
    if (d.action === "thin") { counts.thin += 1; continue; }
    if (d.action === "duplicate-serp") { counts.merged += 1; continue; }
    if (d.action === "off-category") {
      counts.offcat += 1;
      offCategory.push({
        key: cluster.key,
        class: cluster.class,
        head_kw: cluster.head.keyword,
        volume_ext: cluster.volume ?? 0,
        reason: "off-category — fails I1-I4 (docs/seo/sweep-gate-spec-2026-10-07.md §1)",
      });
      continue;
    }

    // A raw already on disk for this cluster is a paid receipt — it stays
    // attached (and its cost stays on a row) whatever the verdict, so the
    // rendered spend table keeps matching what was actually pulled.
    const attachRaw = () => {
      const existing = findRawFor(dir, market, cluster, d.gateKeyword);
      if (!existing) return { raw_file: null, cost: 0 };
      return {
        raw_file: `docs/seo/prospector-raws/${date}/serp-${existing.slug}.json`,
        cost: JSON.parse(read(existing.path))?.tasks?.[0]?.cost ?? 0,
      };
    };

    if (d.action === "killed") {
      newRows.push(buildQueueRow({
        cluster, date,
        gate: { verdict: "KILLED", basis: `kill-list: ${d.kill.class}`, kill: d.kill, ...attachRaw() },
        pages: d.pages, built: d.built, fences: d.fences,
      }));
      counts.killed += 1;
      continue;
    }
    if (d.action === "unresolved") {
      // Licenses nothing, spends nothing NEW.
      newRows.push(buildQueueRow({
        cluster, date,
        gate: { verdict: "UNRESOLVED", basis: "unmapped pair side", gate_keyword: d.gateKeyword, ...attachRaw() },
        pages: d.pages, built: d.built, fences: d.fences,
      }));
      counts.unresolved += 1;
      continue;
    }
    if (d.action === "built") {
      newRows.push(buildQueueRow({
        cluster, date,
        gate: {
          verdict: "BUILT",
          basis: d.builtVia === "keyword-join"
            ? "live URL serves the demand (keyword join)"
            : "every sketched page is live",
          ...attachRaw(),
        },
        pages: d.pages, built: d.built, fences: d.fences,
      }));
      counts.built += 1;
      continue;
    }

    // action === "pull"
    if (offline) {
      const existing = findRawFor(dir, market, cluster, d.gateKeyword);
      if (!existing) { counts.deferred += 1; continue; }
      const envelope = JSON.parse(read(existing.path));
      const task = envelope?.tasks?.[0];
      if (!task?.result?.[0]?.items) { counts.deferred += 1; continue; }
      const score = scoreSerp(task.result[0]);
      seenCanonical.add(d.canonicalKey);
      newRows.push(buildQueueRow({
        cluster, date,
        gate: {
          ...score, gate_keyword: existing.keyword,
          raw_file: `docs/seo/prospector-raws/${date}/serp-${existing.slug}.json`,
          cost: task?.cost ?? 0,
        },
        pages: d.pages, built: d.built, fences: d.fences, stale: d.stale,
      }));
      counts.gated += 1;
      console.log(`  ${score.verdict.padEnd(6)} ${cluster.key}  ("${existing.keyword}" ${score.basis}${score.our_rank ? ` · us #${score.our_rank}` : ""} · raw reused, $0 new)`);
      continue;
    }

    if (pulls >= top || ledger.total_usd + 0.01 > budget) {
      counts.deferred += 1;
      continue;
    }
    const slug = rawSlug(market, d.gateKeyword);
    const rawPath = `docs/seo/prospector-raws/${date}/serp-${slug}.json`;
    try {
      const envelope = await fetchSerpEnvelope(auth, d.gateKeyword, market);
      const task = envelope?.tasks?.[0];
      const cost = task?.cost ?? 0;
      ledger.add(`serp ${slug}`, "serp/google/organic/live/advanced", cost, task?.status_code, task?.status_message);
      pulls += 1;
      if (!task?.result?.[0]?.items) {
        writeFileSync(resolve(dir, `serp-${slug}.ERROR.json`), JSON.stringify(envelope, null, 1));
        console.error(`  ERR serp ${d.gateKeyword}: ${task?.status_message ?? "no result"}`);
        hardErrors += 1;
        continue;
      }
      writeFileSync(resolve(dir, `serp-${slug}.json`), JSON.stringify(envelope));
      seenCanonical.add(d.canonicalKey);
      const score = scoreSerp(task.result[0]);
      newRows.push(buildQueueRow({
        cluster, date,
        gate: { ...score, gate_keyword: d.gateKeyword, raw_file: rawPath, cost },
        pages: d.pages, built: d.built, fences: d.fences, stale: d.stale,
      }));
      counts.gated += 1;
      console.log(`  ${score.verdict.padEnd(6)} ${cluster.key}  ("${d.gateKeyword}" ${score.basis}${score.our_rank ? ` · us #${score.our_rank}` : ""} · $${cost.toFixed(4)})`);
    } catch (e) {
      hardErrors += 1;
      console.error(`  NET serp ${d.gateKeyword}: ${e.message}`);
    }
  }

  if (offCategory.length > 0) {
    writeFileSync(
      resolve(dir, `sweep-killfilter-${market}.json`),
      JSON.stringify(
        {
          date, market,
          rule: "in-category filter I1-I4, FROZEN before the first pull (docs/seo/sweep-gate-spec-2026-10-07.md §1)",
          count: offCategory.length,
          dropped: offCategory,
        },
        null, 1,
      ),
    );
  }

  if (replaceQueue) {
    writeFileSync(PATHS.queueJsonl, newRows.map((r) => JSON.stringify(r)).join("\n") + (newRows.length ? "\n" : ""));
  } else {
    for (const row of newRows) appendFileSync(PATHS.queueJsonl, JSON.stringify(row) + "\n");
  }
  const full = parseJsonl(read(PATHS.queueJsonl));
  writeFileSync(PATHS.queueMd, renderQueue(full));
  const conflicts = queueConsistency(full);
  if (conflicts.length > 0) {
    console.error(`  CONSISTENCY WARNING: ${conflicts.length} surface(s) sit in both ADMITS/MIXED and BUILT:`);
    for (const c of conflicts) console.error(`    ${c.surface} (${c.admits_key} vs ${c.built_key})`);
  }
  console.log(
    `gate[${market}]: gated ${counts.gated} (pulls ${pulls}, $${ledger.total_usd.toFixed(4)}/${budget}${offline ? ", offline — raws reused" : ""}) · killed ${counts.killed} · built ${counts.built} · unresolved ${counts.unresolved} · off-category ${counts.offcat} · merged ${counts.merged} · carried ${counts.carried} · stale-held ${counts.stale} · skipped ${counts.skipped} · thin ${counts.thin} · deferred ${counts.deferred} → ${PATHS.queueMd}`,
  );
  return { newRows, hardErrors, counts, spent: ledger.total_usd, conflicts };
}

function stageReport() {
  const rows = existsSync(PATHS.queueJsonl) ? parseJsonl(read(PATHS.queueJsonl)) : [];
  writeFileSync(PATHS.queueMd, renderQueue(rows));
  console.log(`report: ${rows.length} history rows → ${PATHS.queueMd}`);
}

function printSummary(result, market) {
  const latestByVerdict = { ADMITS: 0, MIXED: 0, WALLED: 0, UNRESOLVED: 0, KILLED: 0, BUILT: 0 };
  for (const r of result.newRows) latestByVerdict[r.verdict] = (latestByVerdict[r.verdict] ?? 0) + 1;
  console.log(
    `prospector[${market}]: +${result.newRows.length} queue rows this run — ADMITS ${latestByVerdict.ADMITS} · MIXED ${latestByVerdict.MIXED} · WALLED ${latestByVerdict.WALLED} · UNRESOLVED ${latestByVerdict.UNRESOLVED} · KILLED ${latestByVerdict.KILLED} · BUILT ${latestByVerdict.BUILT} · $${result.spent.toFixed(4)} spent`,
  );
  for (const r of result.newRows.filter((x) => x.verdict === "ADMITS").slice(0, 10)) {
    console.log(`  ADMITS ${r.cluster_key} — "${r.head_kw}" ${r.volume_ext ? `${r.volume_ext}/mo [EXT]` : ""}${r.own ? ` · ${r.own.impressions}i [OWN]` : ""} → ${r.pages.join(" ")}`);
  }
  // Walled launch heads (spec C8, 2026-11-23): named here so the weekly
  // sweep writes the tail-escalation rows (vs/alternatives/prescription)
  // into docs/seo/prospector-seeds.json — never synthesized in-run.
  for (const r of walledLaunchHeads(result.newRows)) {
    console.log(
      `  LAUNCH WALLED ${r.cluster_key} — "${r.head_kw}"${r.ship_date ? ` · ships ${r.ship_date}` : ""} → weekly sweep owes tail rows (vs / alternatives / prescription) in docs/seo/prospector-seeds.json`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [cmd = "run", ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (cmd) {
    case "seed":
      stageSeed(args);
      break;
    case "expand": {
      const seeds = readJsonIf(resolve(runDir(args.date), `seeds-${args.market}.json`))?.seeds ?? stageSeed(args);
      const { hardErrors } = await stageExpand(args, seeds);
      if (hardErrors > 0) process.exit(1);
      break;
    }
    case "adjacent":
      stageAdjacent(args);
      break;
    case "ingest":
      stageIngest(args, args._[0]);
      break;
    case "cluster":
      stageCluster(args);
      break;
    case "gate": {
      const result = await stageGate(args);
      if (args.summary) printSummary(result, args.market);
      if (result.hardErrors > 0) process.exit(1);
      break;
    }
    case "report":
      stageReport();
      break;
    case "regenerate": {
      // Rebuild the queue from the run dir's COMMITTED raws at $0 — no
      // API call is possible on this path. Used after a verdict-layer
      // fix (lane10-verify bounce 2026-10-07): re-cluster the committed
      // pool, re-decide every cluster (dedupe/fences/kill/merge), and
      // REPLACE docs/seo/prospector-queue.jsonl + the rendered table.
      stageCluster(args);
      const result = await stageGate({ ...args, offline: true, replaceQueue: true });
      if (args.summary) printSummary(result, args.market);
      if ((result.conflicts ?? []).length > 0) process.exit(1);
      break;
    }
    case "run": {
      const seeds = stageSeed(args);
      const { hardErrors: expandErrors } = await stageExpand(args, seeds);
      stageCluster(args);
      const result = await stageGate(args);
      if (args.summary) printSummary(result, args.market);
      // The paid legs are the leg: hard API errors mean the run did not deliver.
      if (expandErrors + result.hardErrors > 0) process.exit(1);
      break;
    }
    default:
      console.error(`unknown command "${cmd}" — use run|seed|expand|adjacent|ingest|cluster|gate|report|regenerate`);
      process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
