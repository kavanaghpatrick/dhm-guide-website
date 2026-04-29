#!/usr/bin/env node
/**
 * Audit broken internal `/never-hungover/<slug>` links across post JSONs.
 *
 * Walks every post in src/newblog/data/posts/, scans the `content` field
 * (and any other string field) for `/never-hungover/<slug>` references,
 * and reports references whose <slug> does not exist as a post file.
 *
 * Exits non-zero when broken refs are found so CI / pre-commit hooks
 * can gate on it.
 *
 * Usage:
 *   node scripts/check-broken-internal-links.mjs
 *   node scripts/check-broken-internal-links.mjs --json   # machine-readable output
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const POSTS_DIR = join(REPO_ROOT, 'src', 'newblog', 'data', 'posts')

// Match /never-hungover/<slug>. Slug chars are a-z, 0-9, hyphen, and `%`.
// One legitimate post slug contains a literal `%` (gen-z…why-58%…); the
// router and registry use that raw form, so we treat `%` as part of the slug.
// Bound at any other non-slug char so trailing punctuation/markdown is ignored.
const LINK_RE = /\/never-hungover\/([a-z0-9%-]+)/g

const args = process.argv.slice(2)
const asJson = args.includes('--json')

function loadAllPostSlugs() {
  return new Set(
    readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
  )
}

/**
 * Recursively collect string values from any nested JSON shape so we don't
 * miss links buried in arrays, FAQ blocks, related-post sections, etc.
 */
function* walkStrings(node, path = '$') {
  if (node == null) return
  if (typeof node === 'string') {
    yield { value: node, path }
    return
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      yield* walkStrings(node[i], `${path}[${i}]`)
    }
    return
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      yield* walkStrings(v, `${path}.${k}`)
    }
  }
}

function findBrokenRefs(postFile, postJson, validSlugs) {
  const broken = []
  for (const { value, path } of walkStrings(postJson)) {
    LINK_RE.lastIndex = 0
    let match
    while ((match = LINK_RE.exec(value)) !== null) {
      const slug = match[1]
      if (!validSlugs.has(slug)) {
        // Capture a small context window for human triage
        const start = Math.max(0, match.index - 40)
        const end = Math.min(value.length, match.index + match[0].length + 40)
        const context = value.slice(start, end).replace(/\s+/g, ' ').trim()
        broken.push({
          post_file: postFile,
          broken_link: match[0],
          slug,
          field: path,
          context,
        })
      }
    }
  }
  return broken
}

function main() {
  const validSlugs = loadAllPostSlugs()
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.json'))

  const allBroken = []
  for (const file of files) {
    const fullPath = join(POSTS_DIR, file)
    let json
    try {
      json = JSON.parse(readFileSync(fullPath, 'utf8'))
    } catch (err) {
      console.error(`! Failed to parse ${file}: ${err.message}`)
      process.exitCode = 2
      continue
    }
    const broken = findBrokenRefs(file, json, validSlugs)
    if (broken.length > 0) allBroken.push(...broken)
  }

  if (asJson) {
    console.log(JSON.stringify(allBroken, null, 2))
  } else if (allBroken.length === 0) {
    console.log(`OK: 0 broken /never-hungover/ links across ${files.length} posts.`)
  } else {
    // Group by post for readable output
    const byPost = new Map()
    for (const b of allBroken) {
      if (!byPost.has(b.post_file)) byPost.set(b.post_file, [])
      byPost.get(b.post_file).push(b)
    }
    console.log(
      `BROKEN: ${allBroken.length} broken /never-hungover/ link(s) across ${byPost.size} post(s).\n`
    )
    for (const [file, refs] of byPost) {
      console.log(`  ${file}  (${refs.length})`)
      for (const r of refs) {
        console.log(`    - ${r.broken_link}`)
        console.log(`        field:   ${r.field}`)
        console.log(`        context: ${r.context}`)
      }
      console.log('')
    }
  }

  if (allBroken.length > 0) process.exitCode = 1
}

main()
