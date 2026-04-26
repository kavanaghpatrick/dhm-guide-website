#!/usr/bin/env node
/**
 * Cluster Formalize — issue #297
 *
 * Reads scripts/cluster-config.json (6 topic clusters, 51 posts) and:
 *   1. Ensures every spoke has an inline contextual link UP to its cluster pillar
 *      (markdown blockquote callout inserted after the first paragraph).
 *   2. Ensures every pillar has inline links DOWN to all its spokes
 *      (single auto-managed "Related Topics in This Series" section guarded
 *      by a sentinel comment; only spokes not already linked are listed).
 *   3. Augments each spoke's `relatedPosts` array with the pillar + sibling
 *      spokes (capped at 5; preserves existing curated entries first).
 *
 * Idempotent: re-running produces zero changes after a successful apply.
 *
 * CLI:
 *   node scripts/cluster-formalize.mjs              # dry-run (default)
 *   node scripts/cluster-formalize.mjs --apply      # write changes
 *   node scripts/cluster-formalize.mjs --audit-out=path/audit.json
 *   node scripts/cluster-formalize.mjs --only=<cluster-name>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/newblog/data/posts');
const CLUSTER_CONFIG_PATH = path.join(ROOT, 'scripts/cluster-config.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const auditArg = args.find(a => a.startsWith('--audit-out='));
const AUDIT_OUT = auditArg ? path.resolve(auditArg.split('=')[1]) : null;
const onlyArg = args.find(a => a.startsWith('--only='));
const ONLY_CLUSTER = onlyArg ? onlyArg.split('=')[1] : null;

const RELATED_POSTS_CAP = 5;
const PILLAR_LINK_SENTINEL = '<!-- cluster-pillar-link:auto -->';
const CLUSTER_INDEX_SENTINEL = '<!-- cluster-index:auto -->';

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(p, obj) {
  // Match orphan-link-injector convention: 2-space + trailing newline
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function postPath(slug) {
  return path.join(POSTS_DIR, `${slug}.json`);
}
function postExists(slug) {
  return fs.existsSync(postPath(slug));
}
function loadPost(slug) {
  return readJSON(postPath(slug));
}

/**
 * Detect the dominant line-break style used in a content blob.
 * Some posts store actual `\n` newline characters; others store the literal
 * two-character sequence `\\n` (backslash + n) as paragraph separators.
 * Returns { sep, fenceFor } where `sep` is the canonical separator for the
 * post and `fenceFor(n)` repeats it n times.
 */
function detectLineBreakStyle(content) {
  const realNewlines = (content.match(/\n/g) || []).length;
  const literalNewlines = (content.match(/\\n/g) || []).length;
  if (literalNewlines > realNewlines * 2) {
    // Dominantly literal-`\n` style.
    return { sep: '\\n', isLiteral: true };
  }
  return { sep: '\n', isLiteral: false };
}

/**
 * Insert content after the first paragraph (after H1 + first body paragraph).
 * Handles both real-newline and literal-`\n` content styles by splitting on
 * the dominant separator detected from the post.
 */
function insertAfterFirstParagraph(content, block) {
  if (!content) return block.trim();
  const { sep, isLiteral } = detectLineBreakStyle(content);

  const lines = content.split(sep);
  let cursor = 0;

  // Skip leading blank lines.
  while (cursor < lines.length && lines[cursor].trim() === '') cursor++;

  // If first non-empty line is H1, advance past it.
  if (cursor < lines.length && /^# [^#]/.test(lines[cursor])) {
    cursor++;
  }
  // Skip any immediately following blank lines.
  while (cursor < lines.length && lines[cursor].trim() === '') cursor++;
  // Skip italicized subtitle line if present (e.g. "*A complete guide to ...*")
  if (cursor < lines.length && /^[*_].*[*_]\s*$/.test(lines[cursor].trim())) {
    cursor++;
    while (cursor < lines.length && lines[cursor].trim() === '') cursor++;
  }
  // Skip optional H2 "Introduction" heading + its body paragraph (some posts
  // open with `## Introduction` immediately after H1).
  if (cursor < lines.length && /^##\s+/i.test(lines[cursor])) {
    cursor++;
    while (cursor < lines.length && lines[cursor].trim() === '') cursor++;
  }
  // Now we're at the first body paragraph. Walk to the end of that paragraph
  // (next blank line) and insert after it.
  while (cursor < lines.length && lines[cursor].trim() !== '') cursor++;

  // cursor now points at blank line (or end). Insert block here.
  const before = lines.slice(0, cursor).join(sep);
  const after = lines.slice(cursor).join(sep);

  // Use the post's native separator throughout the inserted block.
  const blockLines = block.trim().split('\n');
  const blockNative = blockLines.join(sep);
  const sepDouble = sep + sep;
  const afterPrefix = after.startsWith(sep) ? '' : sep;
  return `${before}${sepDouble}${blockNative}${sep}${afterPrefix}${after}`;
}

/**
 * Pick an anchor phrase for a spoke deterministically (so re-runs are stable).
 * Hash the spoke slug into the anchor list index.
 */
function pickAnchor(spokeSlug, anchorPhrases) {
  if (!anchorPhrases || anchorPhrases.length === 0) {
    return 'complete pillar guide';
  }
  let h = 0;
  for (let i = 0; i < spokeSlug.length; i++) {
    h = (h * 31 + spokeSlug.charCodeAt(i)) >>> 0;
  }
  return anchorPhrases[h % anchorPhrases.length];
}

function buildPillarLinkBlock(pillarSlug, pillarTitle, anchor) {
  return [
    PILLAR_LINK_SENTINEL,
    `> **Related pillar guide:** [${anchor}](/never-hungover/${pillarSlug}) — ${pillarTitle}`,
  ].join('\n');
}

function buildClusterIndexSection(spokeEntries, sep = '\n') {
  // spokeEntries: [{ slug, title, anchor }]
  const items = spokeEntries
    .map(e => `- [${e.anchor}](/never-hungover/${e.slug}) — ${e.title}`)
    .join(sep);
  return [
    '',
    CLUSTER_INDEX_SENTINEL,
    '## Related Topics in This Series',
    '',
    items,
    '',
  ].join(sep);
}

/**
 * Update the cluster-index section in a pillar. Strategy:
 *  - If sentinel doesn't exist: append a fresh section (only if any spokes
 *    are not yet inline-linked in the existing content).
 *  - If sentinel exists: rebuild that section (idempotent — same input ->
 *    same output).
 * Returns { newContent, changed, addedSpokeLinks }.
 */
function updatePillarClusterIndex(pillarContent, pillarSlug, cluster, allPosts) {
  const content = pillarContent || '';
  const { sep } = detectLineBreakStyle(content);
  // Determine which spokes are NOT already inline-linked anywhere in pillar
  // content (so we don't double-link them; they only land in the auto section
  // if missing organically).
  const sentinelIdx = content.indexOf(CLUSTER_INDEX_SENTINEL);
  // For "missing" detection, look at content *outside* our auto section so we
  // don't mistake auto-section links for organic ones.
  let organicContent = content;
  if (sentinelIdx !== -1) {
    organicContent = content.slice(0, sentinelIdx);
  }

  const missingSpokes = cluster.spokes.filter(spokeSlug => {
    if (!postExists(spokeSlug)) return false;
    return !organicContent.includes(`/never-hungover/${spokeSlug}`);
  });

  if (missingSpokes.length === 0) {
    // Nothing to add. If sentinel exists with stale entries, prune by removing
    // the entire section so no dead auto-section lingers.
    if (sentinelIdx !== -1) {
      // Replace existing auto section with empty (idempotent end-state: no
      // section needed because all spokes already linked organically).
      const trimmed = content.slice(0, sentinelIdx).replace(/(\s|\\n)+$/, '') + sep;
      // But only do this if it actually changes content — i.e. there's a
      // non-empty auto section to remove.
      if (trimmed !== content) {
        return { newContent: trimmed, changed: true, addedSpokeLinks: 0, removedSection: true };
      }
    }
    return { newContent: content, changed: false, addedSpokeLinks: 0 };
  }

  const spokeEntries = missingSpokes.map(spokeSlug => {
    const spoke = loadPost(spokeSlug);
    return {
      slug: spokeSlug,
      title: spoke.title || spokeSlug,
      anchor: pickAnchor(spokeSlug, cluster.anchor_phrases),
    };
  });

  const newSection = buildClusterIndexSection(spokeEntries, sep);

  if (sentinelIdx === -1) {
    // Append fresh.
    const trimmed = content.replace(/(\s|\\n)+$/, '');
    const newContent = `${trimmed}${sep}${newSection}`;
    return { newContent, changed: newContent !== content, addedSpokeLinks: missingSpokes.length };
  }

  // Replace existing auto section (everything from sentinel to end of file).
  const beforeSentinel = content.slice(0, sentinelIdx).replace(/(\s|\\n)+$/, '');
  const newContent = `${beforeSentinel}${sep}${newSection}`;
  return { newContent, changed: newContent !== content, addedSpokeLinks: missingSpokes.length };
}

function mergeRelatedPosts(existing, desired, cap) {
  const seen = new Set();
  const out = [];
  // Preserve existing order first (curated entries take priority).
  for (const slug of (existing || [])) {
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
    if (out.length >= cap) return out;
  }
  for (const slug of (desired || [])) {
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
    if (out.length >= cap) return out;
  }
  return out;
}

function main() {
  if (!fs.existsSync(CLUSTER_CONFIG_PATH)) {
    console.error(`ERROR: ${CLUSTER_CONFIG_PATH} not found`);
    process.exit(1);
  }
  const config = readJSON(CLUSTER_CONFIG_PATH);
  const clusters = (config.clusters || []).filter(c => !ONLY_CLUSTER || c.name === ONLY_CLUSTER);

  console.log('=== Cluster Formalize ===');
  console.log(`Posts dir: ${POSTS_DIR}`);
  console.log(`Mode: ${APPLY ? 'APPLY (writing files)' : 'DRY-RUN'}`);
  console.log(`Clusters: ${clusters.length}${ONLY_CLUSTER ? ` (filtered to "${ONLY_CLUSTER}")` : ''}`);
  console.log('');

  const audit = {
    clusters: [],
    totals: {
      spoke_to_pillar_inline_added: 0,
      spoke_to_pillar_inline_already: 0,
      pillar_to_spoke_links_added_via_section: 0,
      pillar_to_spoke_links_already: 0,
      sibling_relatedPosts_entries_added: 0,
      pillar_in_relatedPosts_added: 0,
      relatedPosts_entries_added_total: 0,
      files_modified: 0,
      missing_spokes: 0,
    },
  };

  const filesToWrite = new Map(); // path -> obj

  for (const cluster of clusters) {
    const cAudit = {
      name: cluster.name,
      pillar: cluster.pillar,
      spoke_to_pillar_inline_added: 0,
      spoke_to_pillar_inline_already: 0,
      pillar_to_spoke_links_added_via_section: 0,
      pillar_to_spoke_links_already_organic: 0,
      sibling_relatedPosts_entries_added: 0,
      pillar_in_relatedPosts_added: 0,
      missing_spokes: [],
      details: [],
    };

    // ---- Pillar load ----
    if (!postExists(cluster.pillar)) {
      cAudit.details.push({ status: 'PILLAR_NOT_FOUND', slug: cluster.pillar });
      audit.clusters.push(cAudit);
      continue;
    }
    const pillarFile = postPath(cluster.pillar);
    let pillar = filesToWrite.get(pillarFile) || readJSON(pillarFile);
    let pillarChanged = false;

    // ---- Spoke loop: inject inline pillar link + relatedPosts merge ----
    for (const spokeSlug of cluster.spokes) {
      if (!postExists(spokeSlug)) {
        cAudit.missing_spokes.push(spokeSlug);
        audit.totals.missing_spokes++;
        cAudit.details.push({ status: 'SPOKE_NOT_FOUND', slug: spokeSlug });
        continue;
      }
      const spokeFile = postPath(spokeSlug);
      let spoke = filesToWrite.get(spokeFile) || readJSON(spokeFile);
      let spokeChanged = false;

      const spokeContent = spoke.content || '';
      const spokeDetail = { spoke: spokeSlug, actions: [] };

      // 1. Inline spoke -> pillar link
      const pillarUrl = `/never-hungover/${cluster.pillar}`;
      if (spokeContent.includes(pillarUrl)) {
        cAudit.spoke_to_pillar_inline_already++;
        spokeDetail.actions.push('pillar_link_already_present');
      } else {
        const anchor = pickAnchor(spokeSlug, cluster.anchor_phrases);
        const block = buildPillarLinkBlock(cluster.pillar, pillar.title || cluster.pillar, anchor);
        spoke.content = insertAfterFirstParagraph(spokeContent, block);
        cAudit.spoke_to_pillar_inline_added++;
        spokeChanged = true;
        spokeDetail.actions.push(`pillar_link_added (anchor: "${anchor}")`);
      }

      // 2. relatedPosts merge: pillar + sibling spokes
      const existingRP = Array.isArray(spoke.relatedPosts) ? spoke.relatedPosts.slice() : [];
      const siblings = cluster.spokes.filter(s => s !== spokeSlug && postExists(s));
      const desired = [cluster.pillar, ...siblings];
      const mergedRP = mergeRelatedPosts(existingRP, desired, RELATED_POSTS_CAP);

      let pillarAdded = 0;
      let siblingsAdded = 0;
      if (!existingRP.includes(cluster.pillar) && mergedRP.includes(cluster.pillar)) {
        pillarAdded = 1;
      }
      for (const sib of siblings) {
        if (!existingRP.includes(sib) && mergedRP.includes(sib)) {
          siblingsAdded++;
        }
      }
      const arraysEqual = existingRP.length === mergedRP.length &&
        existingRP.every((v, i) => v === mergedRP[i]);
      if (!arraysEqual) {
        spoke.relatedPosts = mergedRP;
        spokeChanged = true;
        cAudit.pillar_in_relatedPosts_added += pillarAdded;
        cAudit.sibling_relatedPosts_entries_added += siblingsAdded;
        spokeDetail.actions.push(`relatedPosts merged: +${pillarAdded} pillar, +${siblingsAdded} siblings (now ${mergedRP.length}/${RELATED_POSTS_CAP})`);
      } else {
        spokeDetail.actions.push('relatedPosts already complete');
      }

      cAudit.details.push(spokeDetail);

      if (spokeChanged) {
        filesToWrite.set(spokeFile, spoke);
      }
    }

    // ---- Pillar: cluster-index section ----
    const pillarUpdate = updatePillarClusterIndex(pillar.content || '', cluster.pillar, cluster, null);
    // Count "already organic" pillar->spoke links
    const organicForCount = pillar.content || '';
    const sentIdx = organicForCount.indexOf(CLUSTER_INDEX_SENTINEL);
    const organicSlice = sentIdx === -1 ? organicForCount : organicForCount.slice(0, sentIdx);
    for (const spokeSlug of cluster.spokes) {
      if (postExists(spokeSlug) && organicSlice.includes(`/never-hungover/${spokeSlug}`)) {
        cAudit.pillar_to_spoke_links_already_organic++;
      }
    }

    if (pillarUpdate.changed) {
      pillar.content = pillarUpdate.newContent;
      pillarChanged = true;
      cAudit.pillar_to_spoke_links_added_via_section = pillarUpdate.addedSpokeLinks;
      if (pillarUpdate.removedSection) {
        cAudit.details.push({ pillar: cluster.pillar, action: 'removed_stale_auto_section' });
      } else {
        cAudit.details.push({
          pillar: cluster.pillar,
          action: `cluster_index_section_updated (added ${pillarUpdate.addedSpokeLinks} spoke links)`,
        });
      }
    } else {
      cAudit.details.push({ pillar: cluster.pillar, action: 'pillar_already_complete' });
    }

    if (pillarChanged) {
      filesToWrite.set(pillarFile, pillar);
    }

    // Roll-up cluster
    audit.totals.spoke_to_pillar_inline_added += cAudit.spoke_to_pillar_inline_added;
    audit.totals.spoke_to_pillar_inline_already += cAudit.spoke_to_pillar_inline_already;
    audit.totals.pillar_to_spoke_links_added_via_section += cAudit.pillar_to_spoke_links_added_via_section;
    audit.totals.pillar_to_spoke_links_already += cAudit.pillar_to_spoke_links_already_organic;
    audit.totals.sibling_relatedPosts_entries_added += cAudit.sibling_relatedPosts_entries_added;
    audit.totals.pillar_in_relatedPosts_added += cAudit.pillar_in_relatedPosts_added;
    audit.clusters.push(cAudit);
  }

  // Write files (or just count)
  audit.totals.files_modified = filesToWrite.size;
  audit.totals.relatedPosts_entries_added_total =
    audit.totals.sibling_relatedPosts_entries_added + audit.totals.pillar_in_relatedPosts_added;

  if (APPLY) {
    for (const [p, obj] of filesToWrite.entries()) {
      writeJSON(p, obj);
    }
  }

  // ---- Print summary ----
  console.log('--- Per-cluster summary ---');
  for (const c of audit.clusters) {
    console.log(`\n[${c.name}] pillar=${c.pillar}`);
    console.log(`  spoke→pillar inline links:   added=${c.spoke_to_pillar_inline_added} already=${c.spoke_to_pillar_inline_already}`);
    console.log(`  pillar→spoke links:          added_via_section=${c.pillar_to_spoke_links_added_via_section} already_organic=${c.pillar_to_spoke_links_already_organic}`);
    console.log(`  spoke relatedPosts entries:  +${c.sibling_relatedPosts_entries_added} siblings, +${c.pillar_in_relatedPosts_added} pillar`);
    if (c.missing_spokes.length) console.log(`  missing spoke files:         ${c.missing_spokes.join(', ')}`);
  }

  console.log('\n--- TOTALS ---');
  for (const [k, v] of Object.entries(audit.totals)) {
    console.log(`  ${k.padEnd(50)} ${v}`);
  }

  if (AUDIT_OUT) {
    fs.writeFileSync(AUDIT_OUT, JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', ...audit }, null, 2) + '\n', 'utf8');
    console.log(`\nAudit JSON written to: ${AUDIT_OUT}`);
  }

  if (!APPLY) {
    console.log('\n(dry-run — re-run with --apply to write changes)');
  }
}

main();
