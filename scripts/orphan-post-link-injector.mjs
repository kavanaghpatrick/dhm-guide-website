#!/usr/bin/env node
/**
 * Orphan Post Link Injector — issue #296
 *
 * Reads scripts/orphan-injection-plan.json and surgically inserts contextual
 * markdown links from hub posts to high-PV orphan posts.
 *
 * Sentinel-based: each row specifies an exact, unique substring in the source
 * hub's `content` field. The script verifies uniqueness, idempotency, and target
 * existence before mutating.
 *
 * Usage:
 *   node scripts/orphan-post-link-injector.mjs            # dry-run (default)
 *   node scripts/orphan-post-link-injector.mjs --apply    # write changes
 *   node scripts/orphan-post-link-injector.mjs --plan=path/to/other-plan.json
 *   node scripts/orphan-post-link-injector.mjs --audit-out=path/audit.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/newblog/data/posts');
const DEFAULT_PLAN = path.join(ROOT, 'scripts/orphan-injection-plan.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const planArg = args.find(a => a.startsWith('--plan='));
const PLAN_PATH = planArg ? path.resolve(planArg.split('=')[1]) : DEFAULT_PLAN;
const auditArg = args.find(a => a.startsWith('--audit-out='));
const AUDIT_OUT = auditArg ? path.resolve(auditArg.split('=')[1]) : null;

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(p, obj) {
  // Preserve original 2-space pretty-print + trailing newline (matches existing posts)
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function postPath(slug) {
  return path.join(POSTS_DIR, `${slug}.json`);
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const found = haystack.indexOf(needle, idx);
    if (found === -1) break;
    count++;
    idx = found + needle.length;
  }
  return count;
}

function main() {
  if (!fs.existsSync(PLAN_PATH)) {
    console.error(`ERROR: plan file not found: ${PLAN_PATH}`);
    process.exit(1);
  }
  const plan = readJSON(PLAN_PATH);
  const rows = Array.isArray(plan) ? plan : (plan.rows || []);

  console.log('=== Orphan Post Link Injector ===');
  console.log(`Plan: ${PLAN_PATH}`);
  console.log(`Posts dir: ${POSTS_DIR}`);
  console.log(`Mode: ${APPLY ? 'APPLY (writing files)' : 'DRY-RUN'}`);
  console.log(`Rows: ${rows.length}`);
  console.log('');

  const audit = [];
  const stats = {
    total: rows.length,
    written: 0,
    dry_run_ok: 0,
    skipped_by_plan: 0,
    already_linked: 0,
    sentinel_not_found: 0,
    ambiguous_sentinel: 0,
    hub_not_found: 0,
    target_not_found: 0,
    other: 0,
  };

  // Group rows by hub so we mutate a hub's JSON once with all its injections.
  const byHub = new Map();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const idx = i + 1;
    if (row.skip) {
      audit.push({ idx, status: 'SKIPPED_BY_PLAN', source_hub: row.source_hub, target_orphan: row.target_orphan, reason: row.skip_reason });
      stats.skipped_by_plan++;
      continue;
    }
    if (!row.source_hub || !row.target_orphan || !row.sentinel_phrase || !row.rewrite) {
      audit.push({ idx, status: 'INVALID_ROW', row });
      stats.other++;
      continue;
    }
    if (!byHub.has(row.source_hub)) byHub.set(row.source_hub, []);
    byHub.get(row.source_hub).push({ idx, row });
  }

  for (const [hubSlug, hubRows] of byHub.entries()) {
    const hubFile = postPath(hubSlug);
    if (!fs.existsSync(hubFile)) {
      for (const { idx, row } of hubRows) {
        audit.push({ idx, status: 'HUB_NOT_FOUND', source_hub: hubSlug, target_orphan: row.target_orphan });
        stats.hub_not_found++;
      }
      continue;
    }
    const post = readJSON(hubFile);
    let content = post.content || '';
    let hubModified = false;

    for (const { idx, row } of hubRows) {
      const targetFile = postPath(row.target_orphan);
      if (!fs.existsSync(targetFile)) {
        audit.push({ idx, status: 'TARGET_NOT_FOUND', source_hub: hubSlug, target_orphan: row.target_orphan });
        stats.target_not_found++;
        continue;
      }

      // Idempotency
      const linkSubstr = `/never-hungover/${row.target_orphan}`;
      if (content.includes(linkSubstr)) {
        audit.push({ idx, status: 'ALREADY_LINKED', source_hub: hubSlug, target_orphan: row.target_orphan });
        stats.already_linked++;
        continue;
      }

      const occ = countOccurrences(content, row.sentinel_phrase);
      if (occ === 0) {
        audit.push({ idx, status: 'SENTINEL_NOT_FOUND', source_hub: hubSlug, target_orphan: row.target_orphan, sentinel_preview: row.sentinel_phrase.slice(0, 80) });
        stats.sentinel_not_found++;
        continue;
      }
      if (occ > 1) {
        audit.push({ idx, status: 'AMBIGUOUS_SENTINEL', source_hub: hubSlug, target_orphan: row.target_orphan, occurrences: occ, sentinel_preview: row.sentinel_phrase.slice(0, 80) });
        stats.ambiguous_sentinel++;
        continue;
      }

      // Apply: plain string replace (first/only occurrence). No regex special-char traps.
      const before = content;
      content = content.replace(row.sentinel_phrase, row.rewrite);
      if (content === before) {
        // Defensive: shouldn't happen, but log and continue
        audit.push({ idx, status: 'NO_CHANGE_AFTER_REPLACE', source_hub: hubSlug, target_orphan: row.target_orphan });
        stats.other++;
        continue;
      }
      hubModified = true;
      const previewWindow = row.rewrite.slice(0, 160) + (row.rewrite.length > 160 ? '...' : '');
      if (APPLY) {
        audit.push({ idx, status: 'WRITTEN', source_hub: hubSlug, target_orphan: row.target_orphan, anchor: row.anchor_text, preview: previewWindow });
        stats.written++;
      } else {
        audit.push({ idx, status: 'DRY_RUN_OK', source_hub: hubSlug, target_orphan: row.target_orphan, anchor: row.anchor_text, preview: previewWindow });
        stats.dry_run_ok++;
      }
    }

    if (hubModified && APPLY) {
      post.content = content;
      writeJSON(hubFile, post);
    }
  }

  // Print audit
  console.log('--- Audit ---');
  for (const a of audit) {
    const tag = a.status.padEnd(22);
    const where = `${a.source_hub || '?'} -> ${a.target_orphan || '?'}`;
    let extra = '';
    if (a.status === 'DRY_RUN_OK' || a.status === 'WRITTEN') {
      extra = `\n     anchor: "${a.anchor}"\n     preview: ${a.preview}`;
    } else if (a.status === 'SKIPPED_BY_PLAN' && a.reason) {
      extra = `\n     reason: ${a.reason}`;
    } else if (a.status === 'AMBIGUOUS_SENTINEL') {
      extra = ` (occurrences=${a.occurrences})`;
    }
    console.log(`  [${a.idx?.toString().padStart(2) ?? '??'}] ${tag} ${where}${extra}`);
  }

  console.log('\n--- Summary ---');
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k.padEnd(22)} ${v}`);
  }

  if (AUDIT_OUT) {
    fs.writeFileSync(AUDIT_OUT, JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', stats, audit }, null, 2) + '\n', 'utf8');
    console.log(`\nAudit JSON written to: ${AUDIT_OUT}`);
  }

  if (!APPLY) {
    console.log('\n(dry-run — re-run with --apply to write changes)');
  }
}

main();
