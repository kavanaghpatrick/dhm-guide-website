// scripts/seo/prospector/lib.mjs
// Shared primitives for THE PROSPECTOR — the standing cluster-discovery
// engine (seed → expand → cluster → gate → queue). See
// scripts/seo/prospector.mjs for the CLI and the pipeline wiring.
//
// Conventions carried from the house instruments (rank-tracker.mjs,
// riser-watch.mjs, reports/cluster-map-2026-10-06.md):
//   - markets are the research lanes' codes: US = 2840/en, JP = 2392/ja
//   - keywords are compared in NORMALIZED space (lowercase, punctuation →
//     space, CJK preserved) — every kill-list pattern and dedupe key runs
//     on normalized text, never on raw queries
//   - est-unique keys collapse close variants ("a vs b" ≡ "b vs a"):
//     [EXT] volumes are close-variant inflated, so variant groups price at
//     MAX, never SUM

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/** Research-lane market codes (lane-demand / lane-japan conventions). */
export const MARKETS = {
  us: { location_code: 2840, language_code: "en", label: "US" },
  jp: { location_code: 2392, language_code: "ja", label: "JP" },
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** JSONL text → rows (append order preserved; house parseHistory pattern). */
export function parseJsonl(text) {
  return String(text ?? "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/**
 * Normalized keyword space: lowercase, every non-letter/digit run becomes
 * one space, CJK preserved. All matching (kill list, dedupe, clustering)
 * happens here.
 */
export function normalizeKeyword(kw) {
  return String(kw ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Order-insensitive close-variant key: normalized tokens, sorted. "xreal
 * one pro vs rayneo" and "rayneo vs xreal one pro" share one key — one
 * canonical SERP, one page, one [EXT] volume (the MAX of the group).
 */
export function estUniqueKey(kw) {
  return normalizeKeyword(kw).split(" ").filter(Boolean).sort().join(" ");
}

/** market+keyword → raw-file slug (gate fetch-serps convention, CJK-safe). */
export function rawSlug(market, kw) {
  const s = String(kw ?? "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${String(market).toLowerCase()}-${s}`;
}

/**
 * Minimal quoted-field CSV parser (Search Console + catalog exports).
 * Handles quoted fields, embedded commas, doubled quotes and CRLF.
 * @returns {string[][]} rows of cells
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const src = String(text ?? "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}
