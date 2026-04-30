#!/usr/bin/env node
/**
 * scripts/posthog-create-recovery-dashboard.mjs
 *
 * Provisions the "DCNI Recovery Watchlist" dashboard in PostHog.
 *
 * Tracks human pageviews on URLs from the DCNI recovery strategy
 * (issues #362-#366):
 *   - 2 hubs promoted in #364
 *   - 3 URL bug-fix targets from #363
 *   - 10 cluster pillars + cluster spokes from scripts/cluster-config.json
 *
 * Idempotent: re-running PATCHes the existing dashboard rather than
 * creating duplicates. Insights are matched by exact name within the
 * dashboard's tiles.
 *
 * PostHog only sees human traffic — Googlebot is filtered out in
 * src/lib/posthog.js. For crawl/index status, use GSC.
 *
 * Usage:
 *   node scripts/posthog-create-recovery-dashboard.mjs            # live
 *   node scripts/posthog-create-recovery-dashboard.mjs --dry-run  # plan only
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
if (!API_KEY) {
  console.error('Error: POSTHOG_PERSONAL_API_KEY is not set in the environment.');
  console.error('See ~/.zshrc — same key used by scripts/posthog-query.sh.');
  process.exit(1);
}

// Personal API keys are scoped to specific projects, so the @current alias
// returns 403. Use the explicit project ID (matches docs/traffic-growth-2026-04-26).
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '275753';
const BASE_URL = `https://us.posthog.com/api/projects/${PROJECT_ID}`;
const DRY_RUN = process.argv.includes('--dry-run');

// === URL list assembly ===
//
// The recovery set is tighter than "all cluster URLs" — most cluster pages
// are already getting traffic and would only add noise. The actual set of
// pages that SHOULD START getting traffic from the #362-#366 work is:
//   - 2 hubs newly promoted in #364
//   - 3 bug-fix targets from #363
//   - 6 spokes that are NEW to the mega-menu (in #364's two new clusters
//     and NOT already living in any pre-existing OG cluster)
// Total: 11 URLs.
//
// Separately, the OG cluster pillars (8 of them — excluding the 2 new
// clusters) are tracked as a watchdog: we want to see if mass-edit waves
// erode their traffic. That tile's signal is INVERTED — drops are bad.

const HUB_URLS = [
  '/never-hungover/complete-hangover-science-hub-2025',
  '/never-hungover/ultimate-dhm-safety-guide-hub-2025',
];

const BUG_FIX_URLS = [
  '/never-hungover/gen-z-mental-health-revolution-58-percent-drinking-less-2025',
  '/never-hungover/social-medias-unseen-influence-navigating-alcohol-wellness-in-the-digital-age',
  '/dhm-dosage-calculator',
];

const clusterConfig = JSON.parse(
  readFileSync(join(__dirname, 'cluster-config.json'), 'utf-8')
);

// Clusters added in #364 (everything else is OG, pre-existing in mega-menu).
const NEW_CLUSTER_NAMES = new Set(['dhm-safety', 'hangover-science']);

const ogClusters = clusterConfig.clusters.filter(c => !NEW_CLUSTER_NAMES.has(c.name));
const newClusters = clusterConfig.clusters.filter(c => NEW_CLUSTER_NAMES.has(c.name));

const OG_PILLAR_URLS = ogClusters.map(c => `/never-hungover/${c.pillar}`);

// Slugs already living anywhere in an OG cluster (pillar or spoke).
const ogSlugs = new Set([
  ...ogClusters.map(c => c.pillar),
  ...ogClusters.flatMap(c => c.spokes),
]);

// Spokes from new clusters that are GENUINELY new to the mega-menu —
// excluding pillars (counted as hubs) and any slug that already lived
// in an OG cluster.
const NEW_CLUSTER_SPOKE_URLS = [...new Set(
  newClusters.flatMap(c => c.spokes).filter(s => !ogSlugs.has(s))
)].map(s => `/never-hungover/${s}`);

const RECOVERY_CANDIDATE_URLS = [...new Set([
  ...HUB_URLS,
  ...BUG_FIX_URLS,
  ...NEW_CLUSTER_SPOKE_URLS,
])];

console.log('Recovery URL counts:');
console.log(`  Hubs (#364):                 ${HUB_URLS.length}`);
console.log(`  Bug-fix targets (#363):      ${BUG_FIX_URLS.length}`);
console.log(`  Genuinely-new spokes (#364): ${NEW_CLUSTER_SPOKE_URLS.length}`);
console.log(`  Total recovery candidates:   ${RECOVERY_CANDIDATE_URLS.length}`);
console.log(`  Watchdog OG pillars:         ${OG_PILLAR_URLS.length}`);
console.log('');

// === API helpers ===

async function api(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) init.body = JSON.stringify(body);

  if (DRY_RUN && method !== 'GET') {
    console.log(`[DRY-RUN] ${method} ${path}`);
    return { id: `dry-run-${method}`, name: body?.name, tiles: [] };
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 800)}`);
  }
  return res.json();
}

// === Filter builder ===

function trendsFilter({ urls, breakdown = false, display = 'ActionsLineGraph', compare = true }) {
  const filter = {
    insight: 'TRENDS',
    events: [{
      id: '$pageview',
      name: '$pageview',
      type: 'events',
      math: 'total',
      order: 0,
    }],
    properties: [{
      key: '$pathname',
      value: urls,
      operator: 'exact',
      type: 'event',
    }],
    date_from: '-30d',
    interval: 'day',
    display,
    compare,
  };
  if (breakdown) {
    filter.breakdown = '$pathname';
    filter.breakdown_type = 'event';
    filter.breakdown_limit = 25;
  }
  return filter;
}

// === Dashboard + insight definitions ===

const DASHBOARD_NAME = 'DCNI Recovery Watchlist';
const DASHBOARD_DESC = [
  'Pages that should START getting traffic as the DCNI recovery strategy lands (issues #362-#366).',
  '',
  'Human pageviews only — PostHog filters Googlebot in src/lib/posthog.js.',
  'For Googlebot crawl/index status, use Google Search Console.',
  '',
  `Tiles 1-4 are the recovery candidates (${RECOVERY_CANDIDATE_URLS.length} URLs). They should TREND UP.`,
  `Tile 5 is the OG cluster watchdog (${OG_PILLAR_URLS.length} URLs). It should NOT regress —`,
  'a drop suggests mass-edit waves are eroding pre-existing traffic.',
  '',
  'Provisioned by scripts/posthog-create-recovery-dashboard.mjs (idempotent).',
  'Re-run that script to refresh URLs after cluster-config edits.',
].join('\n');

const INSIGHTS = [
  {
    name: 'Recovery — Total Pageviews (30d)',
    description: `Sum of pageviews on the ${RECOVERY_CANDIDATE_URLS.length} actual recovery candidates: ${HUB_URLS.length} hubs (#364) + ${BUG_FIX_URLS.length} bug-fix URLs (#363) + ${NEW_CLUSTER_SPOKE_URLS.length} genuinely-new mega-menu spokes (#364). Compare arrow shows vs previous 30-day window.`,
    filters: trendsFilter({ urls: RECOVERY_CANDIDATE_URLS, display: 'BoldNumber', compare: true }),
  },
  {
    name: 'Recovery — Hub Pages Daily (#364)',
    description: 'Daily pageviews on the 2 hubs promoted in #364: complete-hangover-science-hub and ultimate-dhm-safety-guide-hub. Broken down by path so each hub has its own line. Compare to previous 30d.',
    filters: trendsFilter({ urls: HUB_URLS, breakdown: true, compare: true }),
  },
  {
    name: 'Recovery — Bug-Fix URLs Daily (#363)',
    description: 'Daily pageviews on the 3 bug-fix targets from #363: gen-z slug rename, social-medias slug rename, /dhm-dosage-calculator (replacing the deleted -new route). Broken down by path.',
    filters: trendsFilter({ urls: BUG_FIX_URLS, breakdown: true, compare: true }),
  },
  {
    // Renamed from "Cluster Spokes Top 25 (30d)" — same tile, sharper meaning.
    name: 'Recovery — New-Cluster Spokes Daily (#364)',
    previousName: 'Recovery — Cluster Spokes Top 25 (30d)',
    description: `${NEW_CLUSTER_SPOKE_URLS.length} spokes that are NEW to the mega-menu (dhm-safety + hangover-science clusters from #364), excluding spokes that already lived in OG clusters. These should start gaining traffic from improved discoverability. Daily trend per URL.`,
    filters: trendsFilter({ urls: NEW_CLUSTER_SPOKE_URLS, breakdown: true, compare: true }),
  },
  {
    // Renamed from "Cluster Pillars (30d)" — purpose inverted from "should
    // grow" to "should NOT shrink".
    name: 'Watchdog — OG Cluster Pillars (do not regress)',
    previousName: 'Recovery — Cluster Pillars (30d)',
    description: `${OG_PILLAR_URLS.length} OG cluster pillars (everything except the 2 new clusters added in #364). Watchdog: monitor for traffic LOSS that would indicate mass-edit-wave damage. A row dropping is the alert signal. Sortable table.`,
    filters: trendsFilter({ urls: OG_PILLAR_URLS, breakdown: true, display: 'ActionsTable', compare: false }),
  },
];

// === Idempotent ensure ===

async function findDashboard() {
  const res = await api('GET', `/dashboards/?search=${encodeURIComponent(DASHBOARD_NAME)}&limit=20`);
  return (res.results || []).find(d => d.name === DASHBOARD_NAME);
}

async function getDashboardWithTiles(id) {
  return api('GET', `/dashboards/${id}/`);
}

async function ensureDashboard() {
  const existing = await findDashboard();
  if (existing) {
    console.log(`Existing dashboard found: id=${existing.id}`);
    if (!DRY_RUN) {
      await api('PATCH', `/dashboards/${existing.id}/`, {
        description: DASHBOARD_DESC,
        pinned: true,
        tags: ['dcni', 'seo', 'recovery'],
      });
    }
    // Fetch tiles even in dry-run so we can accurately preview PATCH/RENAME.
    return getDashboardWithTiles(existing.id);
  }
  console.log(`Creating dashboard: ${DASHBOARD_NAME}`);
  const created = await api('POST', '/dashboards/', {
    name: DASHBOARD_NAME,
    description: DASHBOARD_DESC,
    pinned: true,
    tags: ['dcni', 'seo', 'recovery'],
  });
  return DRY_RUN ? created : getDashboardWithTiles(created.id);
}

async function ensureInsight(definition, dashboard) {
  // Match by current name first, fall back to previousName so renames PATCH
  // the existing tile in place rather than creating an orphan.
  const candidateNames = [definition.name, definition.previousName].filter(Boolean);
  const tile = (dashboard.tiles || []).find(
    t => t.insight && candidateNames.includes(t.insight.name)
  );
  if (tile && tile.insight) {
    const isRename = tile.insight.name !== definition.name;
    console.log(`  ${isRename ? 'RENAME' : 'PATCH '} insight: ${definition.name}`);
    return api('PATCH', `/insights/${tile.insight.id}/`, {
      name: definition.name,
      description: definition.description,
      filters: definition.filters,
    });
  }
  console.log(`  POST   insight: ${definition.name}`);
  return api('POST', '/insights/', {
    name: definition.name,
    description: definition.description,
    filters: definition.filters,
    dashboards: [dashboard.id],
  });
}

// === Main ===

async function main() {
  console.log(`PostHog API: ${BASE_URL}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  const dashboard = await ensureDashboard();
  console.log(`Dashboard ID: ${dashboard.id}`);
  console.log('');
  console.log('Provisioning insights...');

  for (const def of INSIGHTS) {
    await ensureInsight(def, dashboard);
  }

  console.log('');
  console.log('=== Done ===');
  if (!DRY_RUN) {
    console.log(`Dashboard URL: https://us.posthog.com/project/${PROJECT_ID}/dashboard/${dashboard.id}`);
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
