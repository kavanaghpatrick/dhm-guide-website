// scripts/seo/prospector/gate.mjs
// GATE stage: the MEASURED wall law + kill-list filter + dedupe memory.
//
// Ported 2026-11-23 from arcompare-fable/scripts/seo/prospector/gate.mjs for
// dhmguide.com. The shopping wall law below is KEPT VERBATIM. dhmguide adds a
// second wall, WALLED-AUTHORITY (see AUTHORITY_HOSTS / authorityWall): in
// the DHM / hangover / liver-supplement niche, SERPs held by medical
// authorities (and AI Overviews over them) are unwinnable for a small
// affiliate site; forum/Reddit-shaped and small-brand-blog SERPs are
// winnable. Domain lists below are re-cut for the supplement niche.
//
// The wall law is a verbatim port of the 2026-10-06 winnability-gate
// scorer (reports/cluster-map-2026-10-06.md, Conventions; calibrated on
// 63 live SERPs): the "shopping wall" binds to TOP-OF-PAGE grids, never to
// mid-page popular_products interleaves — arcompare holds live organic
// 5/9/10 today on SERPs whose first shopping module sits at ra≥7, and
// holds zero top-10s on any SERP whose grid opens at ra≤6.
//
// Verdicts: ADMITS / MIXED / WALLED (the map's language; the gate CSVs'
// "ADMITS-US" is the same verdict). Composition verdicts carry a 30-day
// shelf-life (GROWTH_PLAYBOOK Recipe 2, guard G5) — carryVerdict flags
// stale rows instead of silently trusting them, and KILLED/BUILT rows
// never re-litigate.

import { estUniqueKey, normalizeKeyword, parseJsonl } from "./lib.mjs";
import { sketchPages } from "./cluster.mjs";

export const WALL_LAW_TEXT =
  "Wall law (measured, 2026-10-06 calibration): first shopping unit at absolute position ≤3, or ≤6 with 2+ units = WALLED — the wall binds to top-of-page grids; mid-page shopping interleaves do not wall (arcompare holds live top-10s on SERPs whose grid opens at ra≥7).";

/** Every SERP item type that counts as a shopping unit (verbatim port). */
export const SHOPPING_TYPES = new Set([
  "shopping",
  "popular_products",
  "product_considerations",
  "commercial_units",
  "immersive_products",
  "explore_brands",
  "refine_products",
]);

const SITE = "dhmguide.com";

/**
 * Medical-authority hosts for the WALLED-AUTHORITY wall (dhmguide addition).
 * Matched as substrings of the result domain, so "nih.gov" also covers
 * pubmed.ncbi.nlm.nih.gov and "clevelandclinic.org" covers my.clevelandclinic.org.
 */
export const AUTHORITY_HOSTS = [
  "mayoclinic.org",
  "clevelandclinic.org",
  "healthline.com",
  "webmd.com",
  "medicalnewstoday.com",
  "nih.gov",
  "medlineplus.gov",
  "health.harvard.edu",
  "hopkinsmedicine.org",
  "verywellhealth.com",
];

export const AUTHORITY_WALL_TEXT =
  "Authority wall (dhmguide addition): ≥3 medical-authority hosts in organic top-5, or an AI Overview with ≥2 authority hosts in top-5 = WALLED (basis WALLED-AUTHORITY).";

const isAuthority = (domain) => {
  const d = String(domain ?? "").toLowerCase();
  return AUTHORITY_HOSTS.some((h) => d.includes(h));
};

/**
 * The WALLED-AUTHORITY wall over one SERP's items. Pure; checked AFTER the
 * shopping wall in scoreSerp.
 * @returns {{ walled: boolean, authority_top5: number, ai_overview: boolean }}
 */
export function authorityWall(items) {
  const list = items ?? [];
  const aio = list.some((i) => i.type === "ai_overview");
  const top5 = list.filter((i) => i.type === "organic" && i.rank_group && i.rank_group <= 5);
  const n = top5.filter((i) => isAuthority(i.domain)).length;
  return { walled: n >= 3 || (aio && n >= 2), authority_top5: n, ai_overview: aio };
}

const FORUM_HOSTS = [
  "reddit.com", "quora.com", "stackexchange", "discord.com", "bluelight.org",
  "drugs-forum.com", "mumsnet.com", "patient.info/forums",
];
const FORUM_SUBSTR = ["forum", "community."];
const UGC_SOCIAL = [
  "youtube.com", "tiktok.com", "instagram.com", "facebook.com", "x.com",
  "twitter.com", "threads.net", "medium.com", "linkedin.com", "pinterest.com",
];
// Big general/health-lifestyle editorial (non-medical-authority; those sit in
// AUTHORITY_HOSTS and classify as "authority").
const STRONG = [
  "forbes.com", "nytimes.com", "wsj.com", "businessinsider.com", "theguardian.com",
  "usatoday.com", "time.com", "cnn.com", "nbcnews.com", "bbc.co.uk", "bbc.com",
  "menshealth.com", "womenshealthmag.com", "goodhousekeeping.com", "health.com",
  "prevention.com", "everydayhealth.com", "self.com", "eatingwell.com", "shape.com",
  "byrdie.com", "mindbodygreen.com", "garagegymreviews.com", "wirecutter",
  "consumerreports.org", "wikipedia.org", "examine.com", "sciencedaily.com",
  "psychologytoday.com", "drinkaware.co.uk", "cdc.gov", "nhs.uk",
];
// Retailers + supplement brand-direct sites (catalog brands; verify domains
// when a row depends on them).
const BRAND = [
  "amazon.", "walmart.com", "target.com", "ebay.", "costco.com", "iherb.com",
  "gnc.com", "vitaminshoppe.com", "cvs.com", "walgreens.com", "riteaid.com",
  "thorne.com", "gardenoflife.com", "naturemade.com", "nowfoods.com",
  "nodayswasted.com", "doublewoodsupplements.com", "toniiq.com", "nusapure.com",
  "cheers.com", "cheershealth.com", "flybyrecovery.com", "flyby.co", "dycetin.com",
  "fullerhealth.com", "dhmdepot.com", "zbiotics.com", "liquid-iv.com", "liquidiv.com",
  "drinklmnt.com", "dripdrop.com", "afterdrink", "goodmorningpills",
];

/**
 * One result domain → composition class, in the scorer's precedence order
 * (ours → authority → forum → ugc → editorial-strong → brand → editorial-weak).
 * "authority" (dhmguide addition) is a locked class: it never counts as a
 * weak slot.
 */
export function classifyDomain(domain) {
  const d = String(domain ?? "").toLowerCase();
  if (d.includes(SITE)) return "ours";
  if (isAuthority(d)) return "authority";
  if (FORUM_HOSTS.some((h) => d.includes(h)) || FORUM_SUBSTR.some((s) => d.includes(s))) return "forum";
  if (UGC_SOCIAL.some((h) => d.includes(h))) return "ugc";
  if (STRONG.some((h) => d.includes(h))) return "editorial-strong";
  if (BRAND.some((h) => d.includes(h))) return "brand";
  return "editorial-weak";
}

/**
 * One advanced SERP result → the gate verdict + composition receipts.
 * Verbatim decision chain from the house scorer, plus the dhmguide
 * authority wall in second place:
 *   top-grid wall → WALLED; authority wall → WALLED; forum-heavy → ADMITS; weak-editorial top-3 or
 *   arcompare already top-10 → ADMITS; locked brand/strong/UGC top-3 with
 *   no weak slot → WALLED; 2+ forums or 3+ weak in top-10 → ADMITS;
 *   else MIXED.
 */
// DataForSEO now returns some organic rows as google.com/goto redirects with
// domain "google.com"; the real host is in the breadcrumb URL, or for social
// rows ("3K+ views · 4 years ago") in website_name ("YouTube · Channel").
export const realDomain = (i) => {
  if (i.type !== "organic" || !/google\.com\/goto/.test(i.url ?? "")) return i;
  const bc = i.breadcrumb ?? "";
  const domain = /^https?:\/\//.test(bc)
    ? bc.replace(/^https?:\/\//, "").split(/[\s›/]/)[0]
    : `${String(i.website_name ?? "").split(/\s*·\s*/)[0].trim().toLowerCase().replace(/\s+/g, "")}.com`;
  return { ...i, domain };
};

export function scoreSerp(result) {
  const items = (result?.items ?? []).map(realDomain);
  const shop = items.filter((i) => SHOPPING_TYPES.has(i.type));
  const firstRa = shop.length
    ? Math.min(...shop.map((i) => i.rank_absolute ?? 99))
    : null;
  const topGrid = firstRa != null && (firstRa <= 3 || (firstRa <= 6 && shop.length >= 2));

  const types = new Set(items.map((i) => i.type));
  const aio = types.has("ai_overview");
  const dnf = types.has("discussions_and_forums");

  const organic = items.filter((i) => i.type === "organic" && i.rank_group);
  const top10 = organic.filter((i) => i.rank_group <= 10);
  const top3 = organic.filter((i) => i.rank_group <= 3);
  const cls10 = top10.map((i) => classifyDomain(i.domain));
  const cls3 = top3.map((i) => ({ cls: classifyDomain(i.domain), domain: i.domain ?? "?" }));

  const forumCt = cls10.filter((c) => c === "forum").length;
  const weakCt = cls10.filter((c) => c === "editorial-weak" || c === "ours").length;
  const weak3 = cls3.filter((x) => x.cls === "editorial-weak" || x.cls === "ours").length;
  const locked3 = cls3.filter((x) => ["brand", "editorial-strong", "ugc", "authority"].includes(x.cls)).length;
  const ourRank = organic.find((i) => (i.domain ?? "").includes(SITE))?.rank_group ?? null;

  // dhmguide addition, checked right after the verbatim shopping wall.
  const auth = authorityWall(items);

  let verdict, basis;
  if (topGrid) {
    [verdict, basis] = ["WALLED", "top-grid"];
  } else if (auth.walled) {
    [verdict, basis] = ["WALLED", "WALLED-AUTHORITY"];
  } else if (forumCt >= 3 || (dnf && forumCt >= 2)) {
    [verdict, basis] = ["ADMITS", "forum-heavy"];
  } else if (weak3 >= 1 || (ourRank != null && ourRank <= 10)) {
    [verdict, basis] = ["ADMITS", "weak-editorial-top3"];
  } else if (locked3 === cls3.length && cls3.length === 3 && forumCt <= 1 && weakCt === 0) {
    [verdict, basis] = ["WALLED", "brand/UGC-lock"];
  } else if (forumCt >= 2 || weakCt >= 3) {
    [verdict, basis] = ["ADMITS", "forum+weak top10"];
  } else {
    [verdict, basis] = ["MIXED", "mixed-composition"];
  }

  return {
    verdict,
    basis,
    first_shopping_ra: firstRa,
    shopping_units: shop.length,
    shopping_types: [...new Set(shop.map((i) => i.type))].sort(),
    ai_overview: aio,
    forums_module: dnf,
    authority_top5: auth.authority_top5,
    forum_top10: forumCt,
    weak_top10: weakCt,
    top3: cls3,
    our_rank: ourRank,
    organic_n: organic.length,
  };
}

/** docs/seo/prospector-killed.jsonl text → ledger rows. */
export function loadKilled(text) {
  return parseJsonl(text);
}

/**
 * Kill-list check in NORMALIZED keyword space against the committed
 * ledger (docs/seo/prospector-killed.jsonl, seeded from the cluster map
 * §E). Rows: { kind: "pattern"|"keyword"|"note", scope: "us"|"jp"|"all",
 * class, why, source, pattern?|keyword? }. Note rows document policy
 * kills (programmatic grids, article farms, MT intl) and never match.
 * First matching row wins. Exception rows (kind: "exception", added
 * 2026-11-23 per spec C12) surgically re-open a micro-edge INSIDE one
 * kill class: when an exception's pattern matches the keyword, kill rows
 * of that exception's class are skipped for it. The ledger stays
 * append-only — the original kill rows are history and never edited.
 * @returns {{ class: string, why: string, source: string } | null}
 */
export function killMatch(keyword, killedRows, market = "us") {
  const n = normalizeKeyword(keyword);
  if (!n) return null;
  const excepted = new Set();
  for (const row of killedRows ?? []) {
    if (!row || row.kind !== "exception" || !row.pattern) continue;
    const scope = row.scope ?? "all";
    if (scope !== "all" && scope !== market) continue;
    try {
      if (new RegExp(row.pattern, "iu").test(n)) excepted.add(row.class ?? "all");
    } catch {
      continue;
    }
  }
  for (const row of killedRows ?? []) {
    if (!row || row.kind === "note" || row.kind === "exception") continue;
    const scope = row.scope ?? "all";
    if (scope !== "all" && scope !== market) continue;
    if (excepted.has(row.class)) continue;
    if (row.kind === "keyword") {
      if (normalizeKeyword(row.keyword) === n) {
        return { class: row.class, why: row.why, source: row.source };
      }
    } else if (row.kind === "pattern" && row.pattern) {
      let re;
      try {
        re = new RegExp(row.pattern, "iu");
      } catch {
        continue;
      }
      if (re.test(n)) return { class: row.class, why: row.why, source: row.source };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// IN-CATEGORY structural gate (inventory crew 2026-10-07; FROZEN in
// docs/seo/sweep-gate-spec-2026-10-07.md §1 before the first pull). The
// ideas fan-out mints off-category junk clusters (drills, motor oil,
// fashion eyewear — 758 of the 1,249 unchecked on the 2026-10-07 run);
// they must never spend and never mint queue rows. Four arms, any passes:
//   I1 own-receipt    — [OWN] GSC receipts are category evidence
//                       (own-data-first directive) at >=5 impressions or
//                       >=1 click; below that floor the cluster takes the
//                       no-receipt arms (I2-I4). Floor dated 2026-11-23:
//                       the Nov-23 run paid pulls on 1-impression noise
//                       ("رابط", "200 usd", "yes please")
//   I2 catalog-entity — a product/alias/variant entity (bare brands do
//                       NOT qualify)
//   I3 brand-hub      — a resolved brand-vs-brand hub
//   I4 category-phrase — the qualifier-bound niche regex below (bare
//                       "liver"/"drinking" stays out)
// The kill ledger KEEPS precedence: a fully ledger-killed cluster records
// its KILLED receipt before this gate is consulted.
// ---------------------------------------------------------------------------

// dhmguide niche: DHM, hangovers, liver-health supplements, alcohol
// metabolism. Qualifier-bound so bare "liver" or "drinking" stays out.
export const IN_CATEGORY_RE = new RegExp(
  [
    "\\b(?:dhm|dihydromyricetin|hovenia|japanese raisin tree|zbiotics)\\b",
    "\\bhangovers?\\b",
    "\\bhungover\\b",
    "\\bliver\\s+(?:supplements?|detox|cleanse|health|support|vitamins?|pills?|repair|protection|enzymes?|function)\\b",
    "\\bfatty liver\\b",
    "\\bmilk thistle\\b",
    "\\btudca\\b",
    "\\balcohol\\s+(?:metabolism|flush|tolerance|recovery|detox|intolerance|poisoning)\\b",
    "\\b(?:before|after)\\s+(?:drinking|a night out|alcohol)\\b",
    "\\basian (?:flush|glow)\\b",
    // Store products asked about alongside alcohol (either order).
    "\\b(?:pepto(?: bismol)?|pedialyte|gatorade|liquid i\\.?v|electrolytes?|tylenol|acetaminophen|ibuprofen|advil|aspirin)\\b.*\\b(?:alcohol|drinking|drunk|beer|wine)\\b",
    "\\b(?:alcohol|drinking|drunk|beer|wine)\\b.*\\b(?:pepto(?: bismol)?|pedialyte|gatorade|liquid i\\.?v|electrolytes?|tylenol|acetaminophen|ibuprofen|advil|aspirin)\\b",
  ].join("|"),
  "iu",
);

/** @returns {{ ok: boolean, reason: "own-receipt"|"catalog-entity"|"brand-hub"|"category-phrase"|null }} */
export function inCategory(cluster) {
  const own = cluster?.own;
  if (own && ((own.impressions ?? 0) >= 5 || (own.clicks ?? 0) >= 1)) {
    return { ok: true, reason: "own-receipt" };
  }
  if ((cluster?.entities ?? []).some((e) => e.kind !== "brand")) {
    return { ok: true, reason: "catalog-entity" };
  }
  if (cluster?.hub) return { ok: true, reason: "brand-hub" };
  for (const m of cluster?.members ?? []) {
    if (IN_CATEGORY_RE.test(m.keyword)) return { ok: true, reason: "category-phrase" };
  }
  return { ok: false, reason: null };
}

const escapeGateRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The SERP pull target for a cluster: its highest-volume est-unique member
 * that is NOT kill-listed and is itself in-category — it passes
 * IN_CATEGORY_RE, carries an [OWN] receipt (imps on the est-unique rep),
 * or names a resolved catalog entity. Only when no member qualifies does
 * it fall back to the highest-volume non-killed member (prior behavior).
 * 2026-11-23: without the in-category requirement, clusters licensed by
 * one in-category member were gated on a Pixel phone case (22,940/mo) and
 * a dartboard false-alias head — both junk pulls in the committed raws.
 * Null = the whole cluster is fenced — record KILLED, never spend.
 */
export function selectGateKeyword(cluster, killedRows, market = "us") {
  const entityRes = (cluster.entities ?? []).map(
    (e) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeGateRe(e.norm)}(?![\\p{L}\\p{N}])`, "u"),
  );
  const qualifies = (m) =>
    IN_CATEGORY_RE.test(m.keyword) || (m.imps ?? 0) > 0 || entityRes.some((re) => re.test(m.keyword));
  let fallback = null;
  for (const m of cluster.est_unique ?? []) {
    if (killMatch(m.keyword, killedRows, market)) continue;
    if (fallback == null) fallback = m.keyword;
    if (qualifies(m)) return m.keyword;
  }
  return fallback;
}

const withSlash = (p) => (String(p).endsWith("/") ? String(p) : `${p}/`);

/**
 * Sketched pages vs the live sitemap: which already exist (built) and
 * which are novel. all_built clusters re-litigate nothing.
 */
export function dedupePages(pages, { sitemapLocs = [] } = {}) {
  const livePaths = new Set(
    sitemapLocs.map((loc) => {
      try {
        return withSlash(new URL(loc).pathname);
      } catch {
        return withSlash(String(loc));
      }
    }),
  );
  const built = [];
  const novel = [];
  for (const p of pages ?? []) {
    (livePaths.has(withSlash(p)) ? built : novel).push(p);
  }
  return { built, novel, all_built: (pages ?? []).length > 0 && novel.length === 0 };
}

// ---------------------------------------------------------------------------
// Canonical keyword-join (row 7 of the 2026-10-07 panel board; frozen spec
// §4). The SKU-only join mislabeled SERVED demand as backlog: "birdbath vs
// waveguide" (44i/4c [OWN]) sat UNRESOLVED while /guides/birdbath-vs-
// waveguide/ is live, and the with-display hub never joined its head
// cluster. A cluster whose exact phrasing slug equals a live URL path is
// served demand and decides BUILT at $0 (dhmguide: /never-hungover/<slug>).
// EXACT slug equality only — "ar glasses vs vr" must NOT join the
// ar-glasses-vs-vr-headsets guide (no fuzzy matching, ever).
// ---------------------------------------------------------------------------

const kwSlug = (kw) =>
  String(kw ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

/** @returns {string[]} live paths an exact phrasing slug serves */
export function keywordJoin(cluster, sitemapLocs = []) {
  const livePaths = new Set(
    (sitemapLocs ?? []).map((loc) => {
      try {
        return withSlash(new URL(loc).pathname);
      } catch {
        return withSlash(String(loc));
      }
    }),
  );
  const phrasings = [
    cluster?.head?.keyword,
    ...(cluster?.est_unique ?? []).map((e) => e.keyword),
  ].filter(Boolean);
  const hits = [];
  for (const kw of phrasings) {
    const s = kwSlug(kw);
    if (!s) continue;
    // dhmguide: every article lives under /never-hungover/<slug>.
    for (const shape of [`/never-hungover/${s}/`]) {
      if (livePaths.has(shape) && !hits.includes(shape)) hits.push(shape);
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Fence/claims layer (bounce B2, lane10-verify 2026-10-07): before any row
// presents as a build candidate it joins against (a) the frozen-slug list
// and arm fence, (b) the reads-doc deferred queues, (c) open cluster
// PR/branch claims. Fences never change a verdict — they travel on the row
// as notes, so an ADMITS on fenced terrain licenses nothing until the
// fence lifts.
// ---------------------------------------------------------------------------

/**
 * Merge the arm-pages fixture (one path per line — the HARD experiment-arm
 * fence) with the prospector fences ledger
 * (docs/seo/prospector-fences.jsonl rows: kind frozen-slug|deferred-page|
 * claim, each with note + source; claims match by slug or
 * keyword_pattern).
 */
export function loadFences({ armPagesText = "", fencesText = "" } = {}) {
  const out = [];
  for (const line of String(armPagesText).split("\n")) {
    const path = line.trim();
    if (!path || path.startsWith("#")) continue;
    out.push({
      kind: "arm-path",
      path,
      note: "hard-fenced experiment arm until the Oct-12 read (arm fence)",
      source: "tests/fixtures/fences/arm-pages.txt",
    });
  }
  for (const row of parseJsonl(fencesText)) {
    // Aged-out rows stay in the ledger as history but fence nothing
    // (C10, 2026-11-23: the October read-hold fences expired with their
    // reads; rows are kept, marked aged, never deleted).
    if (row?.aged) continue;
    if (row?.kind && row?.note) out.push(row);
  }
  return out;
}

/**
 * Every fence a cluster's row must carry.
 * @param {{ cluster: object, pages?: string[], built?: string[], keywords?: string[] }} subject
 * @returns {Array<{kind, note, source}>}
 */
export function fencesFor(subject, fences, market = "us") {
  const { cluster = {}, pages = [], built = [], keywords = [] } = subject ?? {};
  const allPages = [...pages, ...built].map(withSlash);
  const slugs = new Set([
    ...(cluster.pair ?? []),
    ...(cluster.hub ?? []),
    ...(cluster.entities ?? [])
      .map((e) => e.slug)
      .filter((s) => s && !String(s).startsWith("brand:")),
  ]);
  for (const part of String(cluster.anchor ?? "").split("+")) {
    if (part) slugs.add(part);
  }
  const kwNorms = keywords.filter(Boolean).map((k) => normalizeKeyword(k));
  const hits = [];
  for (const f of fences ?? []) {
    const scope = f.scope ?? "all";
    if (scope !== "all" && scope !== market) continue;
    let hit = false;
    if ((f.kind === "arm-path" || f.kind === "deferred-page") && f.path) {
      hit = allPages.includes(withSlash(f.path));
    } else if (f.kind === "frozen-slug" && f.slug) {
      // The marshal rule fences NEW PAIRS featuring a frozen slug.
      hit =
        cluster.class === "vs" &&
        (slugs.has(f.slug) || allPages.some((p) => p.includes(`/${f.slug}`)));
    } else if (f.kind === "claim") {
      if (f.slug) hit = slugs.has(f.slug);
      if (!hit && f.keyword_pattern) {
        try {
          const re = new RegExp(f.keyword_pattern, "iu");
          hit = kwNorms.some((k) => re.test(k));
        } catch {
          /* bad pattern rows never match */
        }
      }
    }
    if (hit) hits.push({ kind: f.kind, note: f.note, source: f.source });
  }
  return hits;
}

/**
 * The gate's per-cluster decision as a PURE function (bounce fix: the
 * BUILT/dedupe/fence/duplicate logic must be unit-testable, not buried in
 * the CLI loop). Decision order:
 *   1. verdict memory (skip KILLED/BUILT · carry fresh · hold stale)
 *   2. kill ledger (no gate keyword left → killed, $0)
 *   3. UNRESOLVED vs clusters license nothing and never spend (B1)
 *   4. sitemap dedupe — a live sketched surface decides built, $0 (B1;
 *      specs clusters exempt: their sketch IS the live PDP by design)
 *   5. canonical-SERP dedupe — one canonical pair/hub/keyword never
 *      spends twice in a run (B3)
 *   6. zero-signal clusters never spend
 *   7. pull
 * Fences (B2) are computed for every outcome and travel on the row.
 * @returns {{ action: "skip"|"carry"|"stale-hold"|"killed"|"unresolved"|
 *   "built"|"duplicate-serp"|"thin"|"pull", ... }}
 */
export function decideCluster(cluster, ctx = {}) {
  const {
    market = "us",
    today,
    killedRows = [],
    history = [],
    sitemapLocs = [],
    fences = [],
    refresh = false,
    seenCanonical = new Set(),
    brandHubSlugs = [],
  } = ctx;

  // Launch shelf (spec C7, 2026-11-23): launch-flagged clusters re-read on
  // the 7-day shelf through the first month after ship date.
  const launchMember = (cluster.members ?? []).find((m) => m.launch);
  const memory = carryVerdict(cluster.key, market, history, {
    today,
    ...(launchMember ? { shelfLifeDays: launchShelfLifeDays(launchMember.ship_date, today) } : {}),
  });
  if (memory.action === "skip") return { action: "skip", memory };
  if (memory.action === "carry") return { action: "carry", memory };
  if (memory.action === "stale" && !refresh) return { action: "stale-hold", memory };

  const kill = killMatch(cluster.head.keyword, killedRows, market);
  const gateKeyword = kill ? selectGateKeyword(cluster, killedRows, market) : cluster.head.keyword;
  const pages = sketchPages(cluster, { brandHubSlugs });
  const dedupe = dedupePages(pages.pages, { sitemapLocs });
  const fenceHits = fencesFor(
    { cluster, pages: pages.pages, built: dedupe.built, keywords: [cluster.head.keyword, gateKeyword] },
    fences,
    market,
  );
  const base = {
    memory,
    pages,
    built: dedupe.built,
    fences: fenceHits,
    gateKeyword,
    stale: memory.action === "stale",
  };

  if (gateKeyword == null) return { ...base, action: "killed", kill };
  // IN-CATEGORY structural gate (frozen spec §1; the ledger branch above
  // keeps precedence): off-category clusters never spend, never mint rows.
  const cat = inCategory(cluster);
  if (!cat.ok) return { ...base, action: "off-category" };
  // Canonical keyword-join (frozen spec §4): an exact phrasing slug served
  // by a live URL decides BUILT at $0 — served demand is never backlog.
  // Specs clusters stay exempt: their sketch IS the live PDP by design.
  if (cluster.class !== "specs") {
    const served = keywordJoin(cluster, sitemapLocs);
    if (served.length > 0) {
      return {
        ...base,
        built: [...new Set([...dedupe.built, ...served])],
        action: "built",
        builtVia: "keyword-join",
      };
    }
  }
  if (cluster.class === "vs" && cluster.unresolved) return { ...base, action: "unresolved" };
  if (dedupe.all_built && cluster.class !== "specs") return { ...base, action: "built" };

  const canonicalKey = cluster.pair
    ? `pair:${cluster.pair.join("+")}`
    : cluster.hub
      ? `hub:${cluster.hub.join("+")}`
      : `kw:${estUniqueKey(gateKeyword)}`;
  if (seenCanonical.has(canonicalKey)) return { ...base, action: "duplicate-serp", canonicalKey };

  const deliberate =
    cluster.own != null ||
    (cluster.members ?? []).some((m) => /seeds-file|adjacent:|calendar/.test(String(m.src ?? "")));
  if ((cluster.volume ?? 0) === 0 && !deliberate) return { ...base, action: "thin", canonicalKey };
  return { ...base, action: "pull", canonicalKey };
}

const DAY_MS = 86_400_000;

/**
 * Launch verdict shelf (spec C7, 2026-11-23): launch-flagged rows carry a
 * 7-day shelf through the first month after ship date — launch-week SERPs
 * are the most churn-prone (walls flip: 6 of 7 desktop walls once softened
 * on mobile), so walls re-read inside the demand window. Past that month,
 * or with no ship date on the row, the normal 30-day default stands.
 */
export function launchShelfLifeDays(shipDate, today) {
  if (!shipDate || !today) return 30;
  const daysSinceShip = (new Date(today) - new Date(shipDate)) / DAY_MS;
  if (!Number.isFinite(daysSinceShip)) return 30;
  return daysSinceShip <= 30 ? 7 : 30;
}

/**
 * Verdict memory over the queue history (docs/seo/prospector-queue.jsonl):
 *   - no prior row            → { action: "gate" }           (pull it)
 *   - KILLED / BUILT          → { action: "skip", row }      (never re-litigate)
 *   - verdict ≤ shelfLifeDays → { action: "carry", row }     (no re-spend)
 *   - older                   → { action: "stale", row }     (re-gate only with --refresh)
 * Markets never cross. Shelf life defaults to 30 days (Recipe 2 G5:
 * composition pulls expire; re-pull under the 2-run rule before builds).
 */
export function carryVerdict(clusterKey, market, historyRows, { today, shelfLifeDays = 30 } = {}) {
  const mine = (historyRows ?? [])
    .filter((r) => r.cluster_key === clusterKey && (r.market ?? "us") === market)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const row = mine.at(-1) ?? null;
  if (!row) return { action: "gate" };
  if (row.verdict === "KILLED" || row.verdict === "BUILT") return { action: "skip", row };
  const age = (new Date(today) - new Date(row.date)) / DAY_MS;
  return age <= shelfLifeDays ? { action: "carry", row } : { action: "stale", row };
}
