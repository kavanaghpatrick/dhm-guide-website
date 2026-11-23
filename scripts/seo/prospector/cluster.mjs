// scripts/seo/prospector/cluster.mjs
// CLUSTER stage: group the expanded keyword pool into intent clusters —
// one buildable page class per cluster (cluster map convention).
//
// House intent classes: vs / alternatives / which / specs / use-case /
// explainer. Heads are recorded as "head" (they gate, usually WALLED, and
// NEVER sketch a build — heads earn via existing hubs); anything else is
// "other". Close variants collapse through the est-unique key at MAX
// volume ([EXT] volumes are close-variant inflated — never SUM a variant
// group).
//
// Ported from arcompare-fable 2026-11-23. dhmguide changes: supplement
// vocabulary (GENERIC, specs/explainer patterns, product-name suffixes) and
// page sketches under /never-hungover/<slug> (the site's article path).

import { estUniqueKey, normalizeKeyword } from "./lib.mjs";

export const INTENT_CLASSES = [
  "vs",
  "alternatives",
  "which",
  "specs",
  "use-case",
  "explainer",
  "head",
  "other",
];

/** The six classes a cluster may actually build toward. */
export const BUILDABLE_CLASSES = INTENT_CLASSES.filter((c) => c !== "head" && c !== "other");

const PATTERNS = {
  vs: /\bvs\b|\bversus\b|違い|比較/u,
  alternatives: /\balternatives?\b|\binstead of\b|代替/u,
  which: /\bwhich\b|\bshould i\b|どっち|どれ/u,
  specs:
    /\breviews?\b|\blegit\b|\bworth it\b|\bdosage\b|\bdose\b|\bmg\b|\bingredients?\b|\bserving\b|\bpurity\b|\blab test/u,
  "use-case":
    /\bfor\b\s+\S|\bprescription\b|\bwithout\b|度付き|代わり|向け|プレスクリプション|カメラなし/u,
  explainer: /^(what|how|why|can|does|do|is|are|when|should)\b|\bside effects?\b|\bmeaning\b|\bexplained\b|\bwork\b/u,
};

/**
 * One keyword → one house intent class. Decision tails win over spec
 * fragments (vs is checked first); unmatched short queries are heads.
 */
export function classifyIntent(keyword, _market = "us") {
  const n = normalizeKeyword(keyword);
  for (const cls of ["vs", "alternatives", "which", "specs", "use-case", "explainer"]) {
    if (PATTERNS[cls].test(n)) return cls;
  }
  return n.split(" ").filter(Boolean).length <= 4 ? "head" : "other";
}

const cleanName = (name) =>
  String(name ?? "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Catalog → entity lexicon for anchoring: product names + aliases
 * (kind "product"/"alias") and brands (kind "brand"), longest-norm first.
 */
export function entityLexicon(products) {
  const entries = [];
  const push = (slug, norm, brand, kind, status) => {
    if (norm && !entries.some((e) => e.slug === slug && e.norm === norm)) {
      entries.push({ slug, norm, brand, kind, ...(status ? { status } : {}) });
    }
  };
  // A "+" in a model name is stripped by normalizeKeyword, so "XREAL 1 Pro+"
  // would normalize to "xreal 1 pro", which is the XREAL One Pro's recorded
  // alias (content wave 5, 2026-11-17). When the stripped name is another
  // record's name or alias, the "+" record keys on its spelled-out form
  // ("xreal 1 pro plus") instead, so the older receipts keep their meaning.
  const claimedBy = new Map();
  const sharedAliasBrands = new Map(); // alias norm → brand
  const aliasOwners = new Map(); // alias norm → slugs carrying it as an alias
  for (const p of products ?? []) {
    for (const a of p.aliases ?? []) {
      const k = normalizeKeyword(a);
      if (k) aliasOwners.set(k, new Set([...(aliasOwners.get(k) ?? []), p.slug]));
    }
  }
  for (const p of products ?? []) {
    for (const n of [cleanName(p.name), ...(p.aliases ?? [])]) {
      const k = normalizeKeyword(n);
      if (k && !claimedBy.has(k)) claimedBy.set(k, new Set());
      if (k) claimedBy.get(k).add(p.slug);
    }
  }
  for (const p of products ?? []) {
    let norm = normalizeKeyword(cleanName(p.name));
    if (/\+/.test(cleanName(p.name)) && [...(claimedBy.get(norm) ?? [])].some((s) => s !== p.slug)) {
      norm = normalizeKeyword(cleanName(p.name).replace(/\+/g, " plus"));
    }
    push(p.slug, norm, p.brand, "product", p.status);
    for (const a of p.aliases ?? []) {
      // An alias several records share ("Virtue" on three VITURE records,
      // "Nreal" on several XREAL ones) is a brand spelling, not a model name:
      // it joins the brand entries below instead of picking one product.
      const k = normalizeKeyword(a);
      if ((aliasOwners.get(k)?.size ?? 0) > 1) {
        sharedAliasBrands.set(k, p.brand);
        continue;
      }
      push(p.slug, k, p.brand, "alias", p.status);
    }
    // Query-shaped variants (live 2026-10-07 calibration: "brilliant labs
    // halo vs ..." misses "Brilliant Labs Halo AI Glasses"; "luma pro vs
    // ..." misses "VITURE Luma Pro"):
    //   1. strip the trailing generic suffix ("... AR/AI/Smart Glasses")
    //   2. strip the leading brand when ≥2 tokens remain (queries drop it)
    // Full names outrank variants in extractEntities (longest match wins).
    // A variant must keep at least one NON-generic token (live 2026-10-07
    // regression: "Samsung Smart Glasses" must never mint "smart glasses").
    const hasSpecific = (s) => s.split(" ").some((t) => !GENERIC.has(t) && !/^\d+$/.test(t));
    // XR/VR included (bounce B1: "VITURE Beast XR Glasses" never matched
    // "viture beast vs ..." — the champion-pair ADMITS/BUILT contradiction),
    // and qualifier RUNS consumed ("VITURE Luma Ultra XR/AR Glasses" →
    // "viture luma ultra" — the 2026-10-07 regeneration catch: one-qualifier
    // stripping left the 1,597i luma-ultra family UNRESOLVED).
    // dhmguide: strip trailing generic product words ("... DHM Detox",
    // "... Supplements DHM", "... 1 000mg").
    const noSuffix = norm.replace(/(?: (?:dhm|dihydromyricetin|detox|supplements?|pills?|capsules|tablets|\d+mg|\d+ \d+mg))+$/u, "");
    // A variant equal to the bare brand would turn brand queries into
    // catalog entities; brands are anchored by the brand entries below.
    if (noSuffix !== norm && noSuffix.includes(" ") && hasSpecific(noSuffix) && noSuffix !== normalizeKeyword(p.brand)) {
      push(p.slug, noSuffix, p.brand, "variant", p.status);
    }
    const brandNorm = normalizeKeyword(p.brand);
    for (const base of new Set([norm, noSuffix])) {
      if (brandNorm && base.startsWith(`${brandNorm} `)) {
        const rest = base.slice(brandNorm.length + 1);
        if (rest.split(" ").length >= 2 && hasSpecific(rest)) push(p.slug, rest, p.brand, "variant", p.status);
      }
    }
  }
  const brands = new Map();
  for (const p of products ?? []) {
    const bn = normalizeKeyword(p.brand);
    if (bn && !brands.has(bn)) {
      brands.set(bn, {
        slug: `brand:${bn.replace(/ /g, "-")}`,
        norm: bn,
        brand: p.brand,
        kind: "brand",
      });
    }
  }
  for (const [norm, brand] of sharedAliasBrands) {
    if (!brands.has(norm) && !entries.some((e) => e.norm === norm)) {
      brands.set(norm, { slug: `brand:${normalizeKeyword(brand).replace(/ /g, "-")}`, norm, brand, kind: "brand" });
    }
  }
  entries.push(...brands.values());
  return entries.sort((a, b) => b.norm.length - a.norm.length);
}

/** Line qualifiers that never name one model on their own ("pro", "ultra"). */
const ELLIPTICAL_TOKENS = new Set(["pro", "ultra", "max", "plus", "lite", "mini", "se"]);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Every catalog entity present in a keyword, longest-match greedy,
 * non-overlapping, returned in keyword order. Boundaries are unicode-safe
 * (a brand never matches inside another word).
 */
export function extractEntities(keyword, lexicon) {
  const n = normalizeKeyword(keyword);
  const candidates = [];
  for (const e of lexicon ?? []) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(e.norm)}(?![\\p{L}\\p{N}])`, "gu");
    for (const m of n.matchAll(re)) {
      candidates.push({ start: m.index, end: m.index + e.norm.length, entry: e });
    }
  }
  candidates.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const chosen = [];
  for (const c of candidates) {
    if (chosen.some((x) => c.start < x.end && x.start < c.end)) continue;
    chosen.push(c);
  }
  chosen.sort((a, b) => a.start - b.start);
  const out = [];
  for (const c of chosen) {
    if (!out.some((e) => e.slug === c.entry.slug)) out.push(c.entry);
  }
  return out;
}

// Filler tokens tolerated inside a pair side ("lenovo legion glasses GEN 2"
// still resolves to lenovo-legion-glasses-2).
const FILLER = new Set(["gen", "generation", "series", "edition", "the", "new"]);

const brandSlugOf = (brand) => normalizeKeyword(brand).replace(/ /g, "-");

/**
 * Resolve the sides of an explicit "A vs B" keyword to catalog entities
 * (bounce B1/B3, lane10-verify 2026-10-07). Elliptical sides resolve via
 * brand siblings ("xreal 1s vs ONE" → xreal-one; "viture luma ultra vs
 * BEAST" → viture-beast): a side matches a product when the product's
 * model tokens (name minus brand) all appear in the side and every
 * leftover side token is brand/filler/generic. Ambiguous sibling matches
 * narrow by the context brands already named in the keyword; still
 * ambiguous → unresolved. A bare-brand side canonicalizes to the brand's
 * single NON-discontinued product when exactly one exists ("vs halliday"
 * → halliday-g2); multi-model brands stay brands (hub terrain).
 *
 * @returns {null | { sides: Array<{text, slug, brand, via}>, resolved:
 *   boolean, pair: [string,string]|null, hub: [string,string]|null }}
 *   null when the keyword carries no explicit vs/versus split (JP 違い/比較
 *   tails are legitimate non-pair vs intents and are NOT unresolved).
 */
export function resolvePairSides(keyword, lexicon) {
  const n = normalizeKeyword(keyword);
  const parts = n
    .split(/\s(?:vs|versus)\s/u)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;

  const byBrand = new Map(); // brand norm → product/alias/variant entries
  for (const e of lexicon ?? []) {
    if (e.kind === "brand") continue;
    const bn = normalizeKeyword(e.brand ?? "");
    if (!bn) continue;
    byBrand.set(bn, [...(byBrand.get(bn) ?? []), e]);
  }

  const sides = parts.map((text) => ({ text, slug: null, brand: null, via: null }));

  // Pass 1 — direct entity extraction per side.
  for (const side of sides) {
    const ents = extractEntities(side.text, lexicon);
    const prod = ents.find((e) => e.kind !== "brand");
    if (prod) {
      Object.assign(side, { slug: prod.slug, brand: prod.brand, via: "entity" });
    } else {
      const brand = ents.find((e) => e.kind === "brand");
      if (brand) Object.assign(side, { brand: brand.brand, via: "brand" });
    }
  }

  // Pass 2 — brand-sibling resolution for still-naked sides, over ALL
  // brands (the leftover rule disambiguates: "even g2" only fits the Even
  // Realities sibling because "even" is a brand token there), narrowed by
  // the keyword's context brands when more than one sibling fits.
  // TWO SWEEPS (inventory fix 2026-10-07, frozen spec §5.3): the sibling
  // pass itself creates brand context — "even g1 vs g2" resolves side 1
  // via the Even sibling fit, and only THAT brand can narrow the
  // ambiguous bare "g2" (Even G2 vs Halliday G2). Context recomputes at
  // the top of each sweep; a sweep that resolves nothing ends the loop,
  // so a side no product fits stays honestly unresolved — never guessed.
  for (let sweep = 0; sweep < 2; sweep++) {
    const contextBrands = new Set(
      sides.filter((s) => s.brand).map((s) => normalizeKeyword(s.brand)),
    );
    let progressed = false;
    for (const side of sides) {
      if (side.slug || side.via === "brand") continue;
      const sideToks = new Set(side.text.split(" ").filter(Boolean));
      const fits = new Map(); // slug → entry
      for (const [bn, entries] of byBrand) {
        const brandToks = new Set(bn.split(" "));
        for (const e of entries) {
          const modelNorm = e.norm.startsWith(`${bn} `) ? e.norm.slice(bn.length + 1) : e.norm;
          const modelToks = modelNorm.split(" ").filter(Boolean);
          if (modelToks.length === 0) continue;
          // An alias that is only "<brand> <one word>" ("XREAL Pro") never
          // answers a bare one-word side: that is the elliptical case the
          // stay-by-design ledger keeps unresolved (content wave 5).
          if (e.kind === "alias" && modelNorm !== e.norm && modelToks.length === 1 && ELLIPTICAL_TOKENS.has(modelToks[0])) continue;
          if (!modelToks.every((t) => sideToks.has(t))) continue;
          const leftovers = [...sideToks].filter(
            (t) => !modelToks.includes(t) && !brandToks.has(t) && !FILLER.has(t) && !GENERIC.has(t),
          );
          if (leftovers.length === 0) fits.set(e.slug, e);
        }
      }
      let matches = [...fits.values()];
      // Context also narrows a SINGLE-TOKEN side's lone fit (wave-2
      // 2026-11-14): Captify Pro made bare "pro" an out-of-context single fit
      // ("xreal 1s vs pro" -> Captify Pro), which the stay-by-design ledger
      // forbids. Multi-token sides ("even g2") keep cross-brand fits.
      if (contextBrands.size > 0 && (matches.length > 1 || sideToks.size === 1)) {
        matches = matches.filter((e) => contextBrands.has(normalizeKeyword(e.brand)));
      }
      if (matches.length === 1) {
        Object.assign(side, { slug: matches[0].slug, brand: matches[0].brand, via: "sibling" });
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  // Bare-brand canonicalization: exactly one non-discontinued product.
  for (const side of sides) {
    if (side.slug || side.via !== "brand") continue;
    const bn = normalizeKeyword(side.brand);
    const products = (byBrand.get(bn) ?? []).filter(
      (e) => e.kind === "product" && e.status !== "discontinued",
    );
    if (products.length === 1) {
      Object.assign(side, { slug: products[0].slug, via: "single-available" });
    }
  }

  const resolved = sides.every((s) => s.slug || s.brand);
  const productSlugs = sides.filter((s) => s.slug).map((s) => s.slug);
  let pair = null;
  let hub = null;
  if (resolved && sides.length === 2) {
    if (productSlugs.length === 2 && productSlugs[0] !== productSlugs[1]) {
      pair = [...productSlugs].sort();
    } else {
      const brandSlugs = [...new Set(sides.map((s) => brandSlugOf(s.brand)))];
      if (brandSlugs.length === 2) hub = brandSlugs.sort();
    }
  }
  return { sides, resolved, pair, hub };
}

// Anchor fallback vocabulary: function words never anchor; category-generic
// tokens anchor only when nothing else is left ("ai glasses" stays "ai
// glasses", but "best teleprompter glasses" anchors on "teleprompter").
const QUALIFIERS = new Set([
  "best", "top", "the", "a", "an", "for", "to", "of", "in", "on", "with",
  "and", "or", "vs", "versus", "buy", "review", "reviews", "should", "i",
  "my", "me", "you", "it", "what", "how", "why", "can", "does", "do", "is",
  "are", "which", "2024", "2025", "2026", "2027",
]);
const GENERIC = new Set([
  "dhm", "dihydromyricetin", "supplement", "supplements", "pill", "pills",
  "capsules", "tablets", "hangover", "detox",
]);

function fallbackAnchor(norm) {
  const toks = norm.split(" ").filter(Boolean);
  const content = toks.filter((t) => !QUALIFIERS.has(t));
  // Pure numbers never anchor ("top 10 ar glasses" anchors on the
  // category, not on "10"); generic category tokens anchor only when
  // nothing more specific is left.
  const nonNumeric = content.filter((t) => !/^\d+$/.test(t));
  const nonGeneric = nonNumeric.filter((t) => !GENERIC.has(t));
  const pick = (nonGeneric.length ? nonGeneric : nonNumeric.length ? nonNumeric : content).slice(0, 2);
  return pick.join(" ") || norm;
}

/**
 * Pool rows → intent clusters.
 * @param {Array<{keyword: string, volume?: number, src?: string, own?: object}>} rows
 * @param {{ lexicon?: object[], market?: string }} opts
 * @returns clusters sorted by [EXT] volume desc, each: { key, anchor,
 *   class, market, members, est_unique (close variants collapsed at MAX),
 *   volume, own, head, entities, brands }
 */
export function clusterKeywords(rows, { lexicon = [], market = "us" } = {}) {
  const clusters = new Map();
  (rows ?? []).forEach((row, order) => {
    const norm = normalizeKeyword(row.keyword);
    if (!norm) return;
    const cls = classifyIntent(norm, market);
    const ents = extractEntities(norm, lexicon);
    const prods = ents.filter((e) => e.kind !== "brand");
    // vs keywords anchor through side RESOLUTION (bounce B3): every
    // phrasing of one canonical pair/hub lands in ONE cluster — one pull.
    const resolution = cls === "vs" ? resolvePairSides(norm, lexicon) : null;
    let anchor;
    if (resolution?.pair) {
      anchor = resolution.pair.join("+");
    } else if (resolution?.hub) {
      anchor = resolution.hub.join("+");
    } else if (cls === "vs" && prods.length >= 2) {
      // Pair clusters anchor on the SORTED pair: "a vs b" ≡ "b vs a".
      anchor = prods
        .map((e) => e.slug)
        .sort()
        .slice(0, 2)
        .join("+");
    } else if (prods.length > 0) {
      anchor = prods[0].slug;
    } else if (ents.length > 0) {
      anchor = ents[0].slug.replace(/^brand:/, "");
    } else {
      anchor = fallbackAnchor(norm);
    }
    const key = `${anchor}::${cls}`;
    const c =
      clusters.get(key) ??
      {
        key,
        anchor,
        class: cls,
        market,
        members: [],
        entities: [],
        brands: [],
        _groups: new Map(),
      };
    c.members.push({ ...row, keyword: norm, order });
    for (const e of ents) {
      if (!c.entities.some((x) => x.slug === e.slug)) c.entities.push(e);
      if (e.brand && !c.brands.includes(e.brand)) c.brands.push(e.brand);
    }
    if (resolution) {
      if (resolution.pair && !c.pair) c.pair = resolution.pair;
      if (resolution.hub && !c.hub) c.hub = resolution.hub;
      // An explicit vs phrasing with an unmappable side taints the
      // cluster: UNRESOLVED licenses nothing until the side is mapped.
      if (!resolution.resolved) c.unresolved = true;
    }
    const ek = estUniqueKey(norm);
    const g = c._groups.get(ek) ?? [];
    g.push({ keyword: norm, volume: row.volume ?? 0, imps: row.own?.impressions ?? 0, order });
    c._groups.set(ek, g);
    clusters.set(key, c);
  });

  const out = [];
  for (const c of clusters.values()) {
    const est = [];
    for (const group of c._groups.values()) {
      // Volume first; among unpriced receipt rows, the phrasing with the
      // most [OWN] impressions represents the group.
      const rep = [...group].sort(
        (a, b) =>
          b.volume - a.volume ||
          b.imps - a.imps ||
          a.keyword.split(" ").length - b.keyword.split(" ").length ||
          a.order - b.order,
      )[0];
      est.push({
        keyword: rep.keyword,
        volume: Math.max(...group.map((x) => x.volume)),
        ...(rep.imps ? { imps: rep.imps } : {}),
      });
    }
    est.sort((a, b) => b.volume - a.volume || (b.imps ?? 0) - (a.imps ?? 0) || a.keyword.localeCompare(b.keyword));
    c.est_unique = est;
    c.volume = est.reduce((a, e) => a + e.volume, 0);
    const withOwn = c.members.filter((m) => m.own);
    c.own = withOwn.length
      ? {
          clicks: withOwn.reduce((a, m) => a + (m.own.clicks ?? 0), 0),
          impressions: withOwn.reduce((a, m) => a + (m.own.impressions ?? 0), 0),
        }
      : null;
    c.head = { keyword: est[0].keyword, volume: est[0].volume };
    delete c._groups;
    out.push(c);
  }
  return out.sort((a, b) => b.volume - a.volume || a.key.localeCompare(b.key));
}

const slugify = (s) => String(s).trim().replace(/\s+/g, "-");

/**
 * One buildable page sketch per cluster. Heads NEVER sketch a build —
 * they earn via existing hubs (house law; the map gates heads only to
 * record the wall). Paths are sketches: canonical slugs/ordering finalize
 * at build time.
 * @returns {{ pages: string[], note: string }}
 */
export function sketchPages(cluster, { brandHubSlugs = [] } = {}) {
  const prods = (cluster.entities ?? []).filter((e) => e.kind !== "brand");
  switch (cluster.class) {
    case "vs": {
      if (cluster.pair) {
        const [a, b] = cluster.pair;
        return {
          pages: [`/never-hungover/${a}-vs-${b}/`],
          note: "sketch — canonical pair order finalizes at build time",
        };
      }
      if (cluster.hub) {
        // Brand-vs clusters sketch the HUB URL so hub dedupe fires
        // (bounce B1). Registered hubs keep their intent-order slug.
        const [a, b] = cluster.hub;
        const registered = brandHubSlugs.find((s) => s === `${a}-vs-${b}` || s === `${b}-vs-${a}`);
        return {
          pages: [`/never-hungover/${registered ?? `${a}-vs-${b}`}/`],
          note: registered
            ? "brand-vs-brand hub (registered slug, intent order)"
            : "brand-vs-brand hub candidate (intent order finalizes at build)",
        };
      }
      if (cluster.unresolved) {
        return {
          pages: [],
          note: "unresolved pair side — map it to the catalog before any build (licenses nothing)",
        };
      }
      if (prods.length >= 2) {
        const [a, b] = prods.map((e) => e.slug).sort();
        return {
          pages: [`/never-hungover/${a}-vs-${b}/`],
          note: "sketch — canonical pair order finalizes at build time",
        };
      }
      return { pages: [], note: "vs pair — map both sides to catalog slugs before build" };
    }
    case "alternatives":
      return prods.length
        ? { pages: [`/never-hungover/${prods[0].slug}-alternatives/`], note: "" }
        : { pages: [], note: "alternatives — anchor product not in catalog yet" };
    case "which":
      return { pages: [`/never-hungover/which-${slugify(cluster.anchor)}/`], note: "" };
    case "specs":
      return prods.length
        ? {
            pages: [`/never-hungover/${prods[0].slug}-review/`],
            note: "product review / dosage surface for the catalog product",
          }
        : { pages: [], note: "specs/review — map to a catalog product before build" };
    case "use-case":
      return { pages: [`/never-hungover/best-${slugify(cluster.anchor)}/`], note: "" };
    case "explainer":
      return { pages: [`/never-hungover/${slugify(cluster.anchor)}/`], note: "" };
    case "head":
      return { pages: [], note: "head — earns via existing hubs; no head build (house law)" };
    default:
      return { pages: [], note: "needs a manual page sketch" };
  }
}
