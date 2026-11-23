// SEO gate over the BUILT site (dist/). Run after `vite build` + prerender:
//   npm run test:dist
// Tests the output crawlers actually receive, not the source (CLAUDE.md #11, #15).
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST = path.resolve(__dirname, '../dist');
const SITE = 'https://www.dhmguide.com';
const MAIN_ROUTES = ['/', '/guide', '/reviews', '/research', '/compare', '/about', '/dhm-dosage-calculator', '/never-hungover'];

const htmlFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
const read = (route) => fs.readFileSync(path.join(DIST, route, 'index.html'), 'utf8');
const ldBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const attr = (html, re) => (html.match(re) || [])[1];
const canonical = (html) => attr(html, /<link rel="canonical" href="([^"]*)"/);
const title = (html) => attr(html, /<title>([^<]*)<\/title>/);
const description = (html) => attr(html, /<meta name="description" content="([^"]*)"/);

const files = fs.existsSync(DIST) ? htmlFiles(DIST) : [];

describe('dist SEO gate', () => {
  it('dist/ has been built', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('every ld+json block parses as JSON', () => {
    const bad = [];
    for (const f of files) {
      for (const block of ldBlocks(fs.readFileSync(f, 'utf8'))) {
        try { JSON.parse(block); } catch { bad.push(path.relative(DIST, f)); }
      }
    }
    expect(bad).toEqual([]);
  });

  it('no page carries the fabricated sitewide Product/AggregateRating schema', () => {
    const offenders = files.filter((f) =>
      ldBlocks(fs.readFileSync(f, 'utf8')).some((b) => {
        const s = JSON.parse(b);
        return s['@type'] === 'Product' && s.aggregateRating && Number(s.aggregateRating.reviewCount) === 1000;
      })
    );
    expect(offenders.map((f) => path.relative(DIST, f))).toEqual([]);
  });

  it('/never-hungover hub canonical is self-referencing', () => {
    const html = read('never-hungover');
    expect(canonical(html)).toBe(`${SITE}/never-hungover`);
    expect(attr(html, /<meta property="og:url" content="([^"]*)"/)).toBe(`${SITE}/never-hungover`);
  });

  it('main pages have non-empty, unique titles and meta descriptions', () => {
    const pages = MAIN_ROUTES.map((r) => read(r));
    const titles = pages.map(title);
    const descs = pages.map(description);
    titles.concat(descs).forEach((v) => expect(v && v.trim().length).toBeGreaterThan(10));
    expect(new Set(titles).size).toBe(MAIN_ROUTES.length);
    expect(new Set(descs).size).toBe(MAIN_ROUTES.length);
  });

  it('restored RCT evidence page is prerendered with a self canonical', () => {
    const html = read('never-hungover/dhm-randomized-controlled-trials');
    expect(canonical(html)).toBe(`${SITE}/never-hungover/dhm-randomized-controlled-trials`);
  });
});
