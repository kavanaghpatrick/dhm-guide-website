// Internal link-graph gate over the BUILT site (dist/). Run after build:
//   npm run test:dist
// Builds the crawler-visible link graph from rendered <a href> tags (no JS),
// so money pages can't silently fall back into orphan status.
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST = path.resolve(__dirname, '../dist');
const SITE = 'https://www.dhmguide.com';
const MONEY_PAGES = [
  '/reviews',
  '/never-hungover/best-liver-supplements',
  '/never-hungover/best-liver-detox-supplements',
  '/never-hungover/best-hangover-recovery-drinks',
  '/never-hungover/best-fatty-liver-supplements',
];

const htmlFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name === 'index.html' ? [p] : [];
  });
const routeOf = (file) => '/' + path.relative(DIST, path.dirname(file)).split(path.sep).join('/');
const normalize = (href) => {
  let h = href.startsWith(SITE) ? href.slice(SITE.length) : href;
  if (!h.startsWith('/') || h.startsWith('//')) return null;
  h = h.split(/[?#]/)[0];
  if (/\.[a-z0-9]+$/i.test(h)) return null; // assets
  return h.length > 1 ? h.replace(/\/$/, '') : h;
};

// route -> [{ href (raw, normalized), target }]
const graph = new Map();
if (fs.existsSync(DIST)) {
  for (const f of htmlFiles(DIST)) {
    const html = fs.readFileSync(f, 'utf8');
    const links = [...html.matchAll(/<a\b[^>]*?\bhref="([^"]*)"/g)]
      .map((m) => normalize(m[1]))
      .filter(Boolean);
    graph.set(routeOf(f).replace(/^\/$/, '/'), links);
  }
}

// Exact + prefix redirect sources from vercel.json (skip regex/host rules).
const redirects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../vercel.json'), 'utf8')).redirects
  .filter((r) => !r.has && !r.source.includes('('))
  .map((r) => decodeURIComponent(r.source));
const isRedirected = (p) =>
  redirects.some((src) => {
    const m = src.match(/^(.*?)\/?:\w+\*$/);
    return m ? p === m[1] || p.startsWith(m[1] + '/') : p === src;
  });

describe('dist internal link graph', () => {
  it('dist/ has been built', () => {
    expect(graph.size).toBeGreaterThan(100);
  });

  it.each(MONEY_PAGES)('%s has >=3 inbound internal links from other pages', (page) => {
    const sources = [...graph].filter(([src, links]) => src !== page && links.includes(page)).map(([s]) => s);
    expect(sources.length, `inbound sources: ${sources.join(', ')}`).toBeGreaterThanOrEqual(3);
  });

  it('every money page is <=3 clicks from home', () => {
    const depth = new Map([['/', 0]]);
    const queue = ['/'];
    while (queue.length) {
      const cur = queue.shift();
      for (const next of graph.get(cur) || []) {
        if (!depth.has(next)) { depth.set(next, depth.get(cur) + 1); queue.push(next); }
      }
    }
    const tooDeep = MONEY_PAGES.filter((p) => !(depth.get(p) <= 3)).map((p) => `${p} (${depth.get(p) ?? 'unreachable'})`);
    expect(tooDeep).toEqual([]);
  });

  it('no internal link points at a redirected URL', () => {
    const bad = [];
    for (const [src, links] of graph) for (const l of links) if (isRedirected(l)) bad.push(`${src} -> ${l}`);
    expect([...new Set(bad)]).toEqual([]);
  });

  it('redirected posts are fully retired: target is live, no built page, not in sitemap', () => {
    const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
    const bad = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../vercel.json'), 'utf8')).redirects
      .filter((r) => !r.has && /^\/never-hungover\/[^:(]+$/.test(r.source))
      .flatMap((r) => [
        !graph.has(r.destination) && `${r.destination} (target not built)`,
        graph.has(r.source) && `${r.source} (still built)`,
        sitemap.includes(`${SITE}${r.source}<`) && `${r.source} (still in sitemap)`,
      ])
      .filter(Boolean);
    expect(bad).toEqual([]);
  });

  it('cluster-config (mega-menu) references only live, non-redirected posts', () => {
    const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scripts/cluster-config.json'), 'utf8'));
    const bad = cfg.clusters
      .flatMap((c) => [c.pillar, ...c.spokes])
      .filter((s) => isRedirected(`/never-hungover/${s}`) || !graph.has(`/never-hungover/${s}`));
    expect(bad).toEqual([]);
  });
});
