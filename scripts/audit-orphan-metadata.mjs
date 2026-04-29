#!/usr/bin/env node
// Audit orphans in src/newblog/data/metadata/index.json relative to src/newblog/data/posts/*.json
//
// - orphans         = metadata entries pointing to a slug whose post file is missing
// - reverse-orphans = post files whose slug has no metadata entry
//
// Usage: node scripts/audit-orphan-metadata.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/newblog/data/posts')
const METADATA_PATH = join(ROOT, 'src/newblog/data/metadata/index.json')

if (!existsSync(POSTS_DIR)) {
  console.error(`Posts dir missing: ${POSTS_DIR}`)
  process.exit(2)
}
if (!existsSync(METADATA_PATH)) {
  console.error(`Metadata file missing: ${METADATA_PATH}`)
  process.exit(2)
}

const postSlugs = new Set(
  readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '')),
)

const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8'))
if (!Array.isArray(metadata)) {
  console.error('Metadata index.json is not an array')
  process.exit(2)
}

const metadataSlugs = new Set(metadata.map((e) => e.slug))

const orphans = metadata
  .filter((e) => !postSlugs.has(e.slug))
  .map((e) => e.slug)

const reverseOrphans = [...postSlugs].filter((s) => !metadataSlugs.has(s))

const slugCounts = new Map()
for (const e of metadata) slugCounts.set(e.slug, (slugCounts.get(e.slug) ?? 0) + 1)
const duplicateSlugs = [...slugCounts.entries()]
  .filter(([, n]) => n > 1)
  .map(([s, n]) => ({ slug: s, count: n }))

console.log(`Posts on disk:       ${postSlugs.size}`)
console.log(`Metadata entries:    ${metadata.length}`)
console.log(`Orphans (meta→file): ${orphans.length}`)
console.log(`Reverse-orphans:     ${reverseOrphans.length}`)
console.log(`Duplicate slugs:     ${duplicateSlugs.length}`)

if (orphans.length) {
  console.log('\nOrphans (metadata entries with no post file):')
  for (const s of orphans) console.log(`  - ${s}`)
}

if (reverseOrphans.length) {
  console.log('\nReverse-orphans (post files with no metadata entry):')
  for (const s of reverseOrphans) console.log(`  - ${s}`)
}

if (duplicateSlugs.length) {
  console.log('\nDuplicate slugs in metadata:')
  for (const d of duplicateSlugs) console.log(`  ~ ${d.slug} (${d.count}x)`)
}

if (orphans.length || reverseOrphans.length || duplicateSlugs.length) process.exit(1)
console.log('\nClean.')
