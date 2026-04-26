#!/usr/bin/env node
// Generate relatedPosts fields for posts using a 3-tier fallback:
//   Tier 1: cluster siblings + pillar (from scripts/cluster-config.json)
//   Tier 2: tag overlap (existing logic)
//   Tier 3: title-token Jaccard similarity
// Plus an optional reciprocity pass (--write-reciprocal).
//
// Backward compatible: posts that already have relatedPosts.length >= 3 are skipped.
// Idempotent: rerunning produces stable output.
//
// CLI flags:
//   --dry-run             Print proposed updates, write nothing
//   --only=<slug>         Process a single post by slug (also useful for spot-checks)
//   --write-reciprocal    After main pass, ensure A->B implies B->A (cap at 5)
//
// Outputs which tier each chosen related slug came from.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.resolve(__dirname, '../src/newblog/data/posts');
const CLUSTER_CONFIG_PATH = path.resolve(__dirname, './cluster-config.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const WRITE_RECIPROCAL = args.includes('--write-reciprocal');
const ONLY = (args.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;

// Min count to consider a post adequately related-linked.
const TARGET_RELATED = 3;
// Reciprocity cap (don't bloat well-curated lists).
const RECIPROCAL_CAP = 5;
// Title-token Jaccard threshold for tier 3.
const TITLE_SIM_THRESHOLD = 0.2;

// English stop words for title tokenization
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','if','of','to','in','on','at','by','for','with','as',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'this','that','these','those','it','its','from','about','into','through','during',
  'how','what','when','where','why','your','my','our','their','his','her','vs','versus',
  'complete','guide','2024','2025','best','science','based','review','reviews',
  'comparison','analysis'
]);

function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3 && !STOP_WORDS.has(t))
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function normalizeTag(t) {
  return (t || '').toLowerCase().trim();
}

function loadAllPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    return { ...data, _file: file };
  });
}

function loadClusterConfig() {
  if (!fs.existsSync(CLUSTER_CONFIG_PATH)) {
    console.warn('cluster-config.json missing; tier-1 fallback disabled');
    return { clusters: [] };
  }
  return JSON.parse(fs.readFileSync(CLUSTER_CONFIG_PATH, 'utf8'));
}

function buildClusterIndex(config) {
  // slug -> { cluster, role, pillar, siblings: [slug...] }
  const idx = {};
  for (const c of config.clusters || []) {
    const all = [c.pillar, ...c.spokes];
    for (const s of all) {
      const role = s === c.pillar ? 'pillar' : 'spoke';
      const siblings = all.filter(x => x !== s);
      idx[s] = { cluster: c.name, role, pillar: c.pillar, siblings };
    }
  }
  return idx;
}

function dedupeByMaxScore(candidates) {
  const map = new Map();
  for (const c of candidates) {
    const prev = map.get(c.slug);
    if (!prev || c.score > prev.score) map.set(c.slug, c);
  }
  return [...map.values()];
}

function pickRelated(post, allPosts, slugToCluster) {
  const candidates = [];

  // Tier 1: cluster membership
  const myCluster = slugToCluster[post.slug];
  if (myCluster) {
    if (myCluster.role === 'spoke') {
      candidates.push({ slug: myCluster.pillar, score: 100, source: 'cluster:pillar' });
    }
    for (const sib of myCluster.siblings) {
      if (sib === myCluster.pillar && myCluster.role === 'spoke') continue; // already added above
      candidates.push({ slug: sib, score: 80, source: `cluster:${myCluster.cluster}` });
    }
  }

  // Tier 2: tag overlap (whole-tag match)
  const myTags = (post.tags || []).map(normalizeTag).filter(Boolean);
  if (myTags.length) {
    for (const other of allPosts) {
      if (other.slug === post.slug) continue;
      const otherTags = (other.tags || []).map(normalizeTag);
      const overlap = myTags.filter(t => otherTags.includes(t)).length;
      if (overlap > 0) {
        candidates.push({
          slug: other.slug,
          score: 30 + overlap * 10,
          source: `tag:${overlap}`,
        });
      }
    }
  }

  // Tier 2.5: tag-token overlap (catches posts with unique multi-word tags)
  // e.g. "bachelor party hangover prevention" -> tokens overlap with "hangover prevention" tags
  if (myTags.length) {
    const myTagTokens = new Set();
    for (const t of myTags) for (const tok of tokenize(t)) myTagTokens.add(tok);
    if (myTagTokens.size) {
      for (const other of allPosts) {
        if (other.slug === post.slug) continue;
        const otherTagTokens = new Set();
        for (const t of (other.tags || []).map(normalizeTag)) {
          for (const tok of tokenize(t)) otherTagTokens.add(tok);
        }
        if (!otherTagTokens.size) continue;
        let inter = 0;
        for (const t of myTagTokens) if (otherTagTokens.has(t)) inter++;
        if (inter >= 2) {
          candidates.push({
            slug: other.slug,
            score: 20 + inter * 5,
            source: `tagtok:${inter}`,
          });
        }
      }
    }
  }

  // Tier 3: title Jaccard
  const myTokens = tokenize(post.title);
  if (myTokens.size) {
    for (const other of allPosts) {
      if (other.slug === post.slug) continue;
      const sim = jaccard(myTokens, tokenize(other.title));
      if (sim >= TITLE_SIM_THRESHOLD) {
        candidates.push({
          slug: other.slug,
          score: sim * 50,
          source: `title:${sim.toFixed(2)}`,
        });
      }
    }
  }

  return dedupeByMaxScore(candidates).sort((a, b) => b.score - a.score);
}

function writePost(post) {
  const { _file, ...rest } = post;
  fs.writeFileSync(path.join(POSTS_DIR, _file), JSON.stringify(rest, null, 2));
}

// ----- Main -----

const allPosts = loadAllPosts();
const config = loadClusterConfig();
const slugToCluster = buildClusterIndex(config);
console.log(`Loaded ${allPosts.length} posts; ${Object.keys(slugToCluster).length} cluster-mapped`);

let updated = 0;
let skipped = 0;
let noCandidates = 0;
const tierStats = { 'cluster:pillar': 0, cluster: 0, tag: 0, tagtok: 0, title: 0 };
const tierOf = src => src.startsWith('cluster:pillar') ? 'cluster:pillar'
  : src.startsWith('cluster') ? 'cluster'
  : src.startsWith('tagtok') ? 'tagtok'
  : src.startsWith('tag') ? 'tag'
  : src.startsWith('title') ? 'title'
  : 'other';

for (const post of allPosts) {
  if (ONLY && post.slug !== ONLY) continue;

  // Backward-compat: skip well-curated lists
  if (Array.isArray(post.relatedPosts) && post.relatedPosts.length >= TARGET_RELATED) {
    skipped++;
    continue;
  }

  const ranked = pickRelated(post, allPosts, slugToCluster).slice(0, TARGET_RELATED);
  if (!ranked.length) {
    noCandidates++;
    console.log(`No candidates: ${post.slug}`);
    continue;
  }

  for (const r of ranked) tierStats[tierOf(r.source)]++;

  if (DRY_RUN) {
    console.log(`${post.slug} ->`, ranked.map(r => `${r.slug}[${r.source}]`).join(', '));
    continue;
  }

  post.relatedPosts = ranked.map(r => r.slug);
  writePost(post);
  updated++;
}

if (WRITE_RECIPROCAL && !DRY_RUN) {
  console.log('\nReciprocity pass...');
  // Reload with fresh writes
  const fresh = loadAllPosts();
  const slugToPost = Object.fromEntries(fresh.map(p => [p.slug, p]));
  let recipAdds = 0;

  for (const a of fresh) {
    if (!Array.isArray(a.relatedPosts)) continue;
    for (const bSlug of a.relatedPosts) {
      const b = slugToPost[bSlug];
      if (!b) continue;
      const bRel = Array.isArray(b.relatedPosts) ? b.relatedPosts : [];
      if (bRel.includes(a.slug)) continue;
      if (bRel.length >= RECIPROCAL_CAP) continue;
      bRel.push(a.slug);
      b.relatedPosts = bRel;
      recipAdds++;
    }
  }

  for (const p of fresh) writePost(p);
  console.log(`Reciprocity additions: ${recipAdds}`);
}

console.log(`\nUpdated: ${updated}`);
console.log(`Skipped (>=${TARGET_RELATED} existing): ${skipped}`);
console.log(`No candidates: ${noCandidates}`);
console.log(`Tier breakdown (chosen-link counts):`, tierStats);
