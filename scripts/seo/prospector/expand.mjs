// scripts/seo/prospector/expand.mjs
// EXPAND stage: DataForSEO Labs fan-out (budget-capped) plus the
// LLM-adjacency hook.
//
// Paid fan-out mirrors the lane-demand conventions (keyword_ideas for
// batched category-mates, keyword_suggestions for full-text long tails of
// suggest-flagged seeds; every raw response saved; task.cost summed into
// the run ledger). The planner never fans out a kill-listed seed and
// reserves 20% of the budget for pricing ingested adjacency candidates.
//
// The adjacency hook is agentic by design: `--adjacent` emits a
// structured prompt pack (seed context + the reply contract) for a Claude
// agent to generate candidate intents — persona × use-case ×
// product-class × market crossings no keyword instrument surfaces.
// `--ingest <file>` validates the agent's JSON back against the contract
// (version, market, buildable class, rationale required, kill-list and
// est-unique dedupe) before anything enters the pool.
//
// Ported from arcompare-fable 2026-11-23; the adjacency prompt is rewritten
// for the dhmguide.com catalog (DHM supplements, hangovers, liver health,
// alcohol metabolism). Nothing in this file makes a network call; the paid
// calls happen in scripts/seo/prospector.mjs (stageExpand).

import { MARKETS, estUniqueKey, normalizeKeyword } from "./lib.mjs";
import { BUILDABLE_CLASSES } from "./cluster.mjs";
import { killMatch } from "./gate.mjs";

export const ADJACENCY_CONTRACT_VERSION = 1;

/** Conservative per-call estimate (observed $0.016-0.08 at limit ≤700). */
export const EST_CALL_COST = 0.08;
/** Share of the budget the expansion plan may consume (rest = pricing). */
export const EXPAND_BUDGET_SHARE = 0.8;

/**
 * One Labs response envelope → priced pool rows.
 * @returns {{ rows: Array<{keyword, volume, cpc, competition, src}>, cost: number, status: number|null }}
 */
export function parseExpansion(response, src) {
  const task = response?.tasks?.[0];
  const items = task?.result?.[0]?.items ?? [];
  const rows = [];
  for (const it of items) {
    if (!it?.keyword) continue;
    const ki = it.keyword_info ?? {};
    rows.push({
      keyword: it.keyword,
      volume: ki.search_volume ?? null,
      cpc: ki.cpc ?? null,
      competition: ki.competition_level ?? null,
      src,
    });
  }
  return { rows, cost: task?.cost ?? 0, status: task?.status_code ?? null };
}

const nameSlug = (s) =>
  normalizeKeyword(s).replace(/ /g, "-").slice(0, 60) || "seed";

/**
 * Deterministic, budget-capped expansion plan:
 *   - one keyword_suggestions call per suggest-flagged seed (full-text tail)
 *   - keyword_ideas calls over the remaining seeds, chunked
 *   - kill-listed seeds never fan out (the ledger fences spend, not just builds)
 *   - total estimated spend ≤ budget × EXPAND_BUDGET_SHARE
 * @returns {Array<{path, name, payload, est_cost}>}
 */
export function planExpansionCalls(
  seeds,
  { market = "us", budget = 2, killedRows = [], ideasChunk = 10, suggestLimit = 300, ideasLimit = 500 } = {},
) {
  const loc = MARKETS[market] ?? MARKETS.us;
  const base = { location_code: loc.location_code, language_code: loc.language_code };
  const live = (seeds ?? []).filter((s) => s?.keyword && !killMatch(s.keyword, killedRows, market));
  const suggest = live.filter((s) => s.suggest === true);
  const ideas = live.filter((s) => s.suggest !== true);

  const calls = [];
  for (const s of suggest) {
    calls.push({
      path: "dataforseo_labs/google/keyword_suggestions/live",
      name: `suggest-${market}-${nameSlug(s.keyword)}`,
      payload: {
        keyword: s.keyword,
        ...base,
        limit: suggestLimit,
        order_by: ["keyword_info.search_volume,desc"],
      },
      est_cost: EST_CALL_COST,
    });
  }
  for (let i = 0; i < ideas.length; i += ideasChunk) {
    calls.push({
      path: "dataforseo_labs/google/keyword_ideas/live",
      name: `ideas-${market}-${i / ideasChunk + 1}`,
      payload: {
        keywords: ideas.slice(i, i + ideasChunk).map((s) => s.keyword),
        ...base,
        limit: ideasLimit,
        order_by: ["keyword_info.search_volume,desc"],
      },
      est_cost: EST_CALL_COST,
    });
  }

  const maxSpend = budget * EXPAND_BUDGET_SHARE;
  const capped = [];
  let est = 0;
  for (const c of calls) {
    if (est + c.est_cost > maxSpend) break;
    est += c.est_cost;
    capped.push(c);
  }
  return capped;
}

/**
 * The prompt pack a Claude agent consumes to generate adjacency
 * candidates. The pack is self-describing: context, the rules, and the
 * exact reply contract `--ingest` will validate.
 */
export function buildAdjacencyPack({
  market = "us",
  date,
  seeds = [],
  brands = [],
  categories = [],
  killedRows = [],
} = {}) {
  const killClasses = [];
  for (const row of killedRows) {
    if (row?.class && !killClasses.some((k) => k.class === row.class)) {
      killClasses.push({ class: row.class, why: row.why ?? "" });
    }
  }
  return {
    prospector_adjacency_pack: ADJACENCY_CONTRACT_VERSION,
    market,
    date,
    instructions: [
      "You are generating candidate search intents ADJACENT to the dhmguide.com catalog: DHM / dihydromyricetin supplements, hangover prevention and recovery, liver-health supplements, and alcohol metabolism (an independent supplement review and comparison site, Amazon-affiliate monetized).",
      "Write the way shoppers and sufferers actually type: the person hungover on Sunday morning, the person planning a wedding or a bachelor party, the person who flushes red after one drink, the person comparing two hangover pills on Amazon, the person worried about their liver after a heavy month. NOT medical-research language (no 'pharmacokinetics of dihydromyricetin', no 'hepatoprotective efficacy') — those SERPs belong to Mayo Clinic, Healthline and NIH and are walled for this site.",
      "Cross persona × occasion × product × question: name intents real buyers type that no keyword instrument surfaces (product-vs-product, '<product> alternatives', 'does <product> work reddit', occasion-specific 'best hangover pills for <occasion>', timing and stacking questions like 'dhm with electrolytes').",
      "Prefer phrasings whose results would be forums, Reddit threads and small brand blogs (winnable) over head terms owned by medical authorities or AI Overviews (walled).",
      "Every candidate MUST carry a rationale — why this intent exists and what receipt or mechanism suggests it (receipts culture; no rationale, no ingest).",
      "intent_class must be one of the house page classes listed in house_page_classes; heads and nav queries are not buildable and will be rejected.",
      "Respect kill_classes; candidates matching them are rejected at ingest. Make no medical treatment or cure claims in the keywords themselves beyond what people actually search.",
      "Keywords: natural search phrasings, 2-80 characters, one intent each, in the pack's market language. Do NOT invent volumes — the tool prices candidates itself.",
      "Reply with JSON only, matching reply_contract exactly (fill generator with your agent/model name).",
    ],
    house_page_classes: BUILDABLE_CLASSES,
    kill_classes: killClasses,
    seed_context: {
      top_seeds: seeds.slice(0, 40).map((s) => s.keyword),
      catalog_brands: brands,
      catalog_categories: categories,
      market_codes: MARKETS[market] ?? MARKETS.us,
    },
    reply_contract: {
      version: ADJACENCY_CONTRACT_VERSION,
      market,
      generator: "<your agent/model name>",
      candidates: [
        {
          keyword: "<search phrasing, 2-80 chars>",
          intent_class: BUILDABLE_CLASSES.join("|"),
          persona: "<optional — who is searching>",
          crossing: "<optional — e.g. persona×product-class>",
          rationale: "<REQUIRED — why this intent exists / the receipt behind it>",
          expected_page: "<optional — /never-hungover/<slug> sketch>",
        },
      ],
    },
  };
}

/**
 * Validate an agent's adjacency reply against the ingest contract.
 * Fatal errors (ok:false): wrong shape/version/market, empty candidates.
 * Per-candidate rejects (ok stays true): bad keyword, non-buildable
 * intent_class, missing rationale, kill-list match, est-unique duplicate
 * (against the existing pool and within the file).
 * @returns {{ ok, errors: string[], accepted: object[], rejected: Array<{keyword, reason}> }}
 */
export function validateIngest(data, { market = "us", killedRows = [], existing = [] } = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: ["ingest file must be a JSON object"], accepted: [], rejected: [] };
  }
  const errors = [];
  if (data.version !== ADJACENCY_CONTRACT_VERSION) {
    errors.push(`version must be ${ADJACENCY_CONTRACT_VERSION} (got ${JSON.stringify(data.version)})`);
  }
  if (data.market !== market) {
    errors.push(`market mismatch: pack is ${JSON.stringify(data.market)}, this run is ${market}`);
  }
  if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
    errors.push("candidates must be a non-empty array");
  }
  if (errors.length > 0) return { ok: false, errors, accepted: [], rejected: [] };

  const generator =
    typeof data.generator === "string" && data.generator.trim() ? data.generator.trim() : "agent";
  const seen = new Set((existing ?? []).map((k) => estUniqueKey(k)));
  const accepted = [];
  const rejected = [];

  for (const c of data.candidates) {
    const raw = typeof c?.keyword === "string" ? c.keyword.trim() : "";
    const norm = normalizeKeyword(raw);
    if (!raw || raw.length > 80 || norm.length < 2) {
      rejected.push({ keyword: raw, reason: "keyword required (2-80 chars)" });
      continue;
    }
    if (!BUILDABLE_CLASSES.includes(c.intent_class)) {
      rejected.push({
        keyword: raw,
        reason: `intent_class must be one of ${BUILDABLE_CLASSES.join("|")} (got ${JSON.stringify(c.intent_class)})`,
      });
      continue;
    }
    if (typeof c.rationale !== "string" || !c.rationale.trim()) {
      rejected.push({ keyword: raw, reason: "rationale required (receipts culture)" });
      continue;
    }
    const killed = killMatch(norm, killedRows, market);
    if (killed) {
      rejected.push({ keyword: raw, reason: `kill-list: ${killed.class} — ${killed.why}` });
      continue;
    }
    const ek = estUniqueKey(norm);
    if (seen.has(ek)) {
      rejected.push({ keyword: raw, reason: "duplicate (est-unique collision with the pool)" });
      continue;
    }
    seen.add(ek);
    const row = {
      keyword: norm,
      volume: null,
      src: `adjacent:${generator}`,
      intent_class: c.intent_class,
      rationale: c.rationale.trim(),
    };
    if (typeof c.persona === "string" && c.persona.trim()) row.persona = c.persona.trim();
    if (typeof c.crossing === "string" && c.crossing.trim()) row.crossing = c.crossing.trim();
    if (typeof c.expected_page === "string" && c.expected_page.trim()) {
      row.expected_page = c.expected_page.trim();
    }
    accepted.push(row);
  }
  return { ok: true, errors: [], accepted, rejected };
}
