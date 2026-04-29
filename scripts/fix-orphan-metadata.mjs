#!/usr/bin/env node
// One-shot fixer for issue #84:
//   - Removes orphan metadata entries (slug points to a missing post file)
//   - Adds metadata entries for reverse-orphan posts (post file with no metadata entry)
//
// Stable ordering: existing entries keep their position; new entries are appended
// in slug order at the end of the array. The companion audit script
// (audit-orphan-metadata.mjs) should report 0/0 after this runs.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const POSTS_DIR = join(ROOT, 'src/newblog/data/posts')
const METADATA_PATH = join(ROOT, 'src/newblog/data/metadata/index.json')

const postSlugs = new Set(
  readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '')),
)

const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8'))
if (!Array.isArray(metadata)) throw new Error('metadata index.json is not an array')

const removedSlugs = []
const dedupedSlugs = []
const seen = new Set()
const kept = metadata.filter((e) => {
  if (!postSlugs.has(e.slug)) {
    removedSlugs.push(e.slug)
    return false
  }
  if (seen.has(e.slug)) {
    dedupedSlugs.push(e.slug)
    return false
  }
  seen.add(e.slug)
  return true
})

const metadataSlugs = new Set(kept.map((e) => e.slug))
const reverseOrphans = [...postSlugs].filter((s) => !metadataSlugs.has(s)).sort()

const added = []
for (const slug of reverseOrphans) {
  const postPath = join(POSTS_DIR, `${slug}.json`)
  if (!existsSync(postPath)) continue
  const post = JSON.parse(readFileSync(postPath, 'utf8'))

  const entry = {
    id: post.id ?? slug,
    slug,
    title: post.title ?? slug,
    excerpt: post.excerpt ?? post.description ?? '',
    date: post.date ?? post.publishedAt ?? '',
    author: post.author ?? 'DHM Guide Team',
    image: post.image ?? null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    readTime: post.readTime ?? 10,
  }
  added.push(entry)
}

const next = [...kept, ...added]

writeFileSync(METADATA_PATH, JSON.stringify(next, null, 2) + '\n')

console.log(`Removed ${removedSlugs.length} orphan metadata entries:`)
for (const s of removedSlugs) console.log(`  - ${s}`)
console.log(`\nDeduplicated ${dedupedSlugs.length} duplicate metadata entries:`)
for (const s of dedupedSlugs) console.log(`  ~ ${s}`)
console.log(`\nAdded ${added.length} metadata entries for reverse-orphan posts:`)
for (const e of added) console.log(`  + ${e.slug}`)
console.log(`\nMetadata count: ${metadata.length} -> ${next.length}`)
