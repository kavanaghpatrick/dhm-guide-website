# [Phase 2] BreadcrumbList JSON-LD + dedupe Article schema

Refs #283.

## Tasks (~1 hr)
1. Add BreadcrumbList JSON-LD emission to scripts/prerender-blog-posts-enhanced.js (Home → Never Hungover → post)
2. Remove duplicate Article JSON-LD from index.html (prerender script already injects one)

Avoids GSC 'multiple Article' warnings + makes site eligible for breadcrumb rich result.

Source: synthesis-S2, 08-technical-seo.md quick wins #2-3.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
