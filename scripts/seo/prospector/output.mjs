// scripts/seo/prospector/output.mjs
// OUTPUT stage: machine rows (docs/seo/prospector-queue.jsonl, append-only)
// + the human table (docs/seo/PROSPECTOR_QUEUE.md, rebuilt from the FULL
// history every run — the house report-from-history pattern, so a partial
// run never clobbers the table).
//
// Conventions carried verbatim from the cluster map: [EXT]/[OWN]
// stamping, the measured wall law, the monetization A/B/C grades with the
// stamp-before-valuing caveat, the lottery caveat on every band, and the
// G5 30-day composition shelf-life.
//
// Ported from arcompare-fable 2026-11-23. dhmguide changes: arcompare's
// brand monetization receipts (the 1.0% flagship bucket) do NOT carry over —
// every dhmguide row is UNSTAMPED until a real Amazon/brand rate receipt
// exists. The release-status join reads src/content/products, which dhmguide
// does not have, so it degrades to "no preorder annotations".

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { AUTHORITY_WALL_TEXT, WALL_LAW_TEXT } from "./gate.mjs";
import { normalizeKeyword } from "./lib.mjs";

const PRODUCTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../src/content/products");

// Class prior RANKING for queue ordering (C9, 2026-11-23): hub > guide >
// PDP > pair — the rank ORDER of the measured age-matched per-class
// clicks/page priors. The measured values themselves live in
// docs/seo/prospector-value-table.json (C13) and are deliberately NOT
// hard-coded here: November-tide calibration numbers never get baked into
// code or test pins before their post-tide read (guardrail #10). Classes
// that sketch no buildable page (head, other) rank 0 — no measured prior.
export const CLASS_PRIOR_RANK = [
  { label: "hub", rank: 4, classes: ["use-case"] },
  { label: "guide", rank: 3, classes: ["alternatives", "which", "explainer"] },
  { label: "pdp", rank: 2, classes: ["specs"] },
  { label: "pair", rank: 1, classes: ["vs"] },
];

/** @returns {{ label: string, rank: number }} the class-prior rank a cluster class sorts under */
export function classPriorOf(cls) {
  const hit = CLASS_PRIOR_RANK.find((r) => r.classes.includes(cls));
  return hit ? { label: hit.label, rank: hit.rank } : { label: "none", rank: 0 };
}

// Monetization heuristics (cluster map Conventions + §1 receipts):
//   A   = brand-direct program candidates (counter-lever to the 1.0% bucket)
//   A/B = accessory classes (pay above the flagship bucket)
//   C   = flagship 1.0%-bucket brands (owner export receipt: the $399
//         flagship pays exactly 1.0%) — traffic/authority plays
//   B/C = default wearable-electronics assumption, UNVERIFIED until the
//         live category rate is stamped
// dhmguide: no brand-direct programs or owner rate receipts on file yet —
// add brands here only with a receipt.
const A_BRANDS = [];
const C_BRANDS = [];
const ACCESSORY = /(?!)/u; // no accessory class in the supplement niche

/** @returns {{ grade: "A"|"A/B"|"B"|"B/C"|"C", note: string }} */
export function monetizationGrade(cluster) {
  const brands = cluster?.brands ?? [];
  const probe = normalizeKeyword(`${cluster?.head?.keyword ?? ""} ${cluster?.anchor ?? ""}`);
  if (brands.some((b) => A_BRANDS.includes(b))) {
    return { grade: "A", note: "brand-direct program candidate — verify the program before valuing" };
  }
  if (ACCESSORY.test(probe)) {
    return {
      grade: "A/B",
      note: "accessory class — pays above the flagship bucket; stamp the live category rate",
    };
  }
  if (brands.some((b) => C_BRANDS.includes(b))) {
    return {
      grade: "C",
      note: "flagship 1.0% bucket (owner export receipt) — traffic/authority play; stamp before valuing",
    };
  }
  return {
    grade: "B/C",
    note: "Amazon health/supplement rate UNVERIFIED — stamp the live category rate before valuing",
  };
}

/**
 * Monetization provenance (spec C18, 2026-11-23): a numeric rate rides a
 * row ONLY where an owner receipt exists — the 2026-09-30 owner export
 * pinned the Meta/Samsung/Apple/Google/Snap flagship bucket at exactly
 * 1.0%. Every other row is rate: null, rate_basis: "UNSTAMPED" — a true
 * statement of ignorance. No invented rates, ever. Additive beside the
 * A/B/C grades (which stay; their conventions are pinned).
 * @returns {{ rate: number | null, rate_basis: string }}
 */
export function monetizationRate(cluster) {
  const brands = cluster?.brands ?? [];
  if (brands.some((b) => C_BRANDS.includes(b))) {
    return { rate: 0.01, rate_basis: "owner-export-2026-09-30" };
  }
  return { rate: null, rate_basis: "UNSTAMPED" };
}

/**
 * Catalog release-status join for the preorder annotation (spec C17,
 * 2026-11-23): slug → { status, releaseDate } from the product JSONs —
 * the same files that anchor slugs come from via dataset/products.csv.
 * An unreadable product file never blocks a queue row.
 */
export function loadReleaseStatus(dir = PRODUCTS_DIR) {
  const map = new Map();
  let files = [];
  try {
    files = readdirSync(dir);
  } catch {
    return map;
  }
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const j = JSON.parse(readFileSync(resolve(dir, f), "utf-8"));
      map.set(f.replace(/\.json$/, ""), { status: j.status ?? null, releaseDate: j.releaseDate ?? null });
    } catch {
      /* skip — never invent a status */
    }
  }
  return map;
}

/**
 * Preorder annotation (spec C17, 2026-11-23): rows whose anchor product
 * is unreleased (catalog status "upcoming"/"announced") carry
 * `preorder: true` + `recheck_at: <ship date>` so the refresh pass can
 * re-read them once shipped. ORDERING ANNOTATION ONLY — never a score
 * multiplier and never a gate. recheck_at stays null when the catalog
 * has no release date (unknown ≠ invented); pair anchors ("a+b") flag on
 * either side, recheck_at = the latest known ship date among them.
 * @returns {{ preorder: true, recheck_at: string | null } | null}
 */
export function preorderAnnotation(cluster, statusBySlug) {
  if (!statusBySlug) return null;
  const hits = String(cluster?.anchor ?? "")
    .split("+")
    .map((s) => statusBySlug.get(s))
    .filter(Boolean);
  const unreleased = hits.filter((p) => p.status === "upcoming" || p.status === "announced");
  if (unreleased.length === 0) return null;
  const ships = unreleased.map((p) => p.releaseDate).filter(Boolean).sort();
  return { preorder: true, recheck_at: ships.at(-1) ?? null };
}

let releaseStatusCache = null;

/**
 * One gated cluster → one machine queue row (JSONL). Every row carries
 * its receipts paths — admission evidence outlives the session.
 * `releaseStatus` (slug → {status, releaseDate}) is injectable for tests;
 * by default the catalog is loaded once per process.
 */
export function buildQueueRow({ cluster, date, gate = {}, pages = { pages: [], note: "" }, built = [], fences = [], stale = false, releaseStatus = null }) {
  // Launch provenance, re-attached at output (spec C6, 2026-11-23 — the
  // reduced plumbing: the flag + ship date ride the cluster's member rows
  // from the calendar seed; cluster.mjs stays untouched).
  const launchMember = (cluster.members ?? []).find((m) => m.launch);
  const preorder = preorderAnnotation(cluster, releaseStatus ?? (releaseStatusCache ??= loadReleaseStatus()));
  const row = {
    date,
    market: cluster.market ?? "us",
    cluster_key: cluster.key,
    anchor: cluster.anchor,
    class: cluster.class,
    head_kw: cluster.head.keyword,
    members: cluster.members?.length ?? cluster.est_unique?.length ?? 1,
    est_unique_n: cluster.est_unique?.length ?? 1,
    volume_ext: cluster.volume ?? 0,
    own: cluster.own ?? null,
    // Ordering inputs at decision time (C9, 2026-11-23) — every row carries
    // the two terms it sorts by, so the queue order is auditable later.
    class_prior: classPriorOf(cluster.class),
    own_clicks_at_decision: cluster.own?.clicks ?? 0,
    top_members: (cluster.est_unique ?? []).slice(0, 8),
    verdict: gate.verdict,
    basis: gate.basis ?? null,
    gate: {
      keyword: gate.gate_keyword ?? null,
      first_shopping_ra: gate.first_shopping_ra ?? null,
      shopping_units: gate.shopping_units ?? 0,
      ai_overview: gate.ai_overview ?? null,
      our_rank: gate.our_rank ?? null,
      ...(gate.kill ? { kill: gate.kill } : {}),
      ...(stale ? { stale: true } : {}),
    },
    pages: pages.pages ?? [],
    pages_note: pages.note || null,
    built,
    ...(cluster.pair ? { pair: cluster.pair } : {}),
    ...(cluster.hub ? { hub: cluster.hub } : {}),
    ...(launchMember ? { launch: true, ...(launchMember.ship_date ? { ship_date: launchMember.ship_date } : {}) } : {}),
    ...(preorder ?? {}),
    fences,
    monetization: { ...monetizationGrade(cluster), ...monetizationRate(cluster) },
    receipts: { serp_raw: gate.raw_file ?? null },
    spend: gate.cost ?? 0,
  };
  return row;
}

const pageKey = (p) => (String(p).endsWith("/") ? String(p) : `${p}/`);

/**
 * Internal-consistency guard (bounce B1's contradiction: one surface sat
 * in both ADMITS and BUILT in one file). Over the LATEST rows: any
 * ADMITS/MIXED row sketching a surface that a BUILT row already serves is
 * a conflict. The regenerated queue must return [].
 * @returns {Array<{surface: string, admits_key: string, built_key: string}>}
 */
export function queueConsistency(rows) {
  const latest = latestRows(rows);
  const servedBy = new Map();
  for (const r of latest) {
    if (r.verdict !== "BUILT") continue;
    for (const p of [...(r.built ?? []), ...(r.pages ?? [])]) {
      servedBy.set(pageKey(p), r);
    }
  }
  const conflicts = [];
  for (const r of latest) {
    if (r.verdict !== "ADMITS" && r.verdict !== "MIXED") continue;
    for (const p of r.pages ?? []) {
      const b = servedBy.get(pageKey(p));
      if (b && b.cluster_key !== r.cluster_key) {
        conflicts.push({ surface: p, admits_key: r.cluster_key, built_key: b.cluster_key });
      }
    }
  }
  return conflicts;
}

/** Latest row per (market, cluster_key) — later date wins, later append breaks ties. */
export function latestRows(rows) {
  const byKey = new Map();
  for (const r of rows ?? []) {
    const k = `${r.market ?? "us"}::${r.cluster_key}`;
    const cur = byKey.get(k);
    if (!cur || r.date >= cur.date) byKey.set(k, r);
  }
  return [...byKey.values()];
}

/**
 * Launch-flagged WALLED heads, newest ship date first (spec C8,
 * 2026-11-23 — output-only code, NO in-run cluster synthesis). The run
 * summary names them so the weekly sweep can write the tail rows
 * (`<anchor> vs <top catalog sibling>` / `<anchor> alternatives` /
 * `<anchor> prescription`) into docs/seo/prospector-seeds.json for the
 * next run, each gated normally under the wall law.
 */
export function walledLaunchHeads(rows) {
  return latestRows(rows)
    .filter((r) => r.launch && r.verdict === "WALLED")
    .sort(
      (a, b) =>
        String(b.ship_date ?? "").localeCompare(String(a.ship_date ?? "")) ||
        a.cluster_key.localeCompare(b.cluster_key),
    );
}

const fmtDemand = (r) => {
  const ext = r.volume_ext ? `${r.volume_ext.toLocaleString("en-US")}/mo [EXT]` : "— [EXT]";
  const own = r.own ? ` · ${r.own.impressions}i/${r.own.clicks}c [OWN]` : "";
  return ext + own;
};

const fmtGate = (r) => {
  const bits = [r.basis, r.date].filter(Boolean).join(", ");
  const extra = [];
  if (r.gate?.first_shopping_ra != null) extra.push(`grid@ra${r.gate.first_shopping_ra}×${r.gate.shopping_units}`);
  if (r.gate?.our_rank != null) extra.push(`us #${r.gate.our_rank}`);
  if (r.gate?.ai_overview) extra.push("AIO");
  if (r.gate?.stale) extra.push("STALE >30d");
  if (r.launch) extra.push(r.ship_date ? `LAUNCH ships ${r.ship_date}` : "LAUNCH");
  return `${r.verdict} (${bits}${extra.length ? "; " + extra.join(" · ") : ""})`;
};

const fmtPages = (r) => {
  const built = new Set(r.built ?? []);
  const parts = (r.pages ?? []).map((p) => (built.has(p) ? `${p} (live)` : p));
  if (parts.length === 0 && r.pages_note) return `— ${r.pages_note}`;
  return parts.join("<br>") || "—";
};

function tableFor(rows) {
  const lines = [
    "| cluster | class | head keyword | pages sketch | demand | verdict | monet. | receipts |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) {
    const flag = (r.fences?.length ?? 0) > 0 ? "⚠ " : "";
    lines.push(
      `| ${flag}${r.anchor} | ${r.class} | ${r.head_kw} | ${fmtPages(r)} | ${fmtDemand(r)} | ${fmtGate(r)} | ${r.monetization?.grade ?? "?"} | ${r.receipts?.serp_raw ?? "—"} |`,
    );
  }
  lines.push("");
  // Fence notes (bounce B2): a fenced row licenses nothing until its
  // fence lifts — the note travels with the table it qualifies.
  const fenced = rows.filter((r) => (r.fences?.length ?? 0) > 0);
  if (fenced.length) {
    lines.push("Fences on rows above:", "");
    for (const r of fenced) {
      for (const f of r.fences) {
        lines.push(`- ⚠ **${r.anchor}** (${r.class}) — ${f.note} (${f.source})`);
      }
    }
    lines.push("");
  }
  return lines;
}

/**
 * Rebuild the whole PROSPECTOR_QUEUE.md from history rows. Deterministic:
 * "Updated" comes from the rows, never the clock.
 */
export function renderQueue(rows) {
  // Queue order (C9, 2026-11-23): class prior rank desc (hub > guide >
  // PDP > pair), then own.clicks desc, then cluster_key for determinism.
  // volume_ext is display-only context — NEVER a sort key (ρ +0.03 vs
  // realized clicks). Historical rows without the stamped class_prior
  // field derive their rank from their class.
  const queueOrder = (a, b) =>
    (b.class_prior?.rank ?? classPriorOf(b.class).rank) -
      (a.class_prior?.rank ?? classPriorOf(a.class).rank) ||
    (b.own?.clicks ?? 0) - (a.own?.clicks ?? 0) ||
    a.cluster_key.localeCompare(b.cluster_key);
  const latest = latestRows(rows).sort(queueOrder);
  const updated = rows.map((r) => r.date).sort().at(-1) ?? null;
  const markets = [...new Set(latest.map((r) => r.market))].sort().join(", ") || "—";

  const admits = latest.filter((r) => r.verdict === "ADMITS");
  const mixed = latest.filter((r) => r.verdict === "MIXED");
  const walled = latest.filter((r) => r.verdict === "WALLED");
  const unresolved = latest.filter((r) => r.verdict === "UNRESOLVED");
  const killed = latest.filter((r) => r.verdict === "KILLED");
  const builtRows = latest.filter((r) => r.verdict === "BUILT");

  const lines = [
    "# Prospector Queue",
    "",
    "<!-- GENERATED by scripts/seo/prospector.mjs — do not hand-edit; data lives in docs/seo/prospector-queue.jsonl -->",
    "",
    "The standing cluster-discovery queue for dhmguide.com (seed → expand → cluster → gate; ported from the arcompare prospector). Conventions:",
    "",
    "- Volumes marked **[EXT]** are third-party DataForSEO estimates (close-variant inflated; est-unique deduped at MAX). Figures marked **[OWN]** are our GSC receipts (impressions/clicks from the committed export).",
    `- ${WALL_LAW_TEXT}`,
    `- ${AUTHORITY_WALL_TEXT}`,
    "- Verdicts carry a **30-day composition shelf-life** (Recipe 2, guard G5): stale rows are flagged, and any build wave re-pulls its heads under the 2-run rule first.",
    "- Lottery caveat on every band: the median new URL earns zero; one page historically carries 22-67% of a batch. Demand licenses pages one at a time, never carpets.",
    "- KILLED and BUILT verdicts never re-litigate; the kill ledger is docs/seo/prospector-killed.jsonl.",
    "",
    updated ? `Updated ${updated} · markets: ${markets} · ${latest.length} clusters on file.` : "_No runs recorded yet — see the script header for usage._",
    "",
  ];

  // Launch-flagged ADMITS render in their own section, newest ship date
  // first (spec C6, 2026-11-23) — the lane stays auditable in one query.
  const launchAdmits = admits
    .filter((r) => r.launch)
    .sort(
      (a, b) =>
        String(b.ship_date ?? "").localeCompare(String(a.ship_date ?? "")) ||
        a.cluster_key.localeCompare(b.cluster_key),
    );
  const otherAdmits = admits.filter((r) => !r.launch);
  if (launchAdmits.length) {
    lines.push(
      "## ADMITS — launch lane (launch-flagged, newest ship date first)",
      "",
      "Licensed under the law-7 launch carve-out (SKILL.md): wall law binding, launch claim official-source-verified, buildability law unchanged (3+ shipping comparators or skip).",
      "",
      ...tableFor(launchAdmits),
    );
  }
  if (otherAdmits.length) {
    lines.push("## ADMITS — build candidates (gate passed)", "", ...tableFor(otherAdmits));
  }
  if (mixed.length) {
    lines.push("## MIXED — judgment rows (gate neither admits nor walls)", "", ...tableFor(mixed));
  }
  if (walled.length) {
    lines.push(
      "## WALLED — recorded walls (no build; re-pull only on a named trigger)",
      "",
      ...tableFor(walled),
    );
  }
  if (unresolved.length) {
    lines.push(
      "## UNRESOLVED — unmapped pair sides (licenses nothing until mapped)",
      "",
      "A vs phrasing with a side the catalog cannot name yet. Real receipts, no buildable page: map the side (catalog add or alias) and the next run re-decides at $0.",
      "",
      ...tableFor(unresolved),
    );
  }
  lines.push("## KILLED / BUILT — nothing re-litigates", "");
  if (killed.length === 0 && builtRows.length === 0) {
    lines.push("_None recorded yet._", "");
  } else {
    for (const r of killed) {
      lines.push(`- KILLED · ${r.anchor} (${r.class}) — ${r.gate?.kill?.class ?? "ledger"}: ${r.gate?.kill?.why ?? ""}`);
    }
    for (const r of builtRows) {
      lines.push(`- BUILT · ${r.anchor} (${r.class}) — every sketched page is already live: ${(r.built ?? []).join(", ")}`);
    }
    lines.push("");
  }

  const paid = rows.filter((r) => (r.spend ?? 0) > 0);
  const byDate = new Map();
  for (const r of paid) {
    const cur = byDate.get(r.date) ?? { n: 0, usd: 0 };
    byDate.set(r.date, { n: cur.n + 1, usd: cur.usd + r.spend });
  }
  const total = paid.reduce((a, r) => a + r.spend, 0);
  lines.push(
    "## Spend (gate pulls recorded on queue rows; expansion spend lives in each run's raws ledger)",
    "",
    `Recorded on queue rows to date: **$${total.toFixed(4)}** across ${paid.length} paid pulls.`,
    "",
    "| run date | pulls | $ |",
    "|---|---|---|",
    ...[...byDate.entries()].map(([d, v]) => `| ${d} | ${v.n} | $${v.usd.toFixed(4)} |`),
    "",
  );
  return lines.join("\n");
}
