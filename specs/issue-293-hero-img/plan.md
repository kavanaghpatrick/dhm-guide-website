# [Phase 2] Hero img width/height + adopt unused Picture.jsx component

Refs #283. Two related fixes.

## Bug 1: missing img dims
src/newblog/components/NewBlogPost.jsx:921 — hero img has no width/height. Causes layout shift on first paint.

## Bug 2: Picture.jsx never imported
src/components/Picture.jsx exists with proper webp/lazy/fallback logic but is never imported. Adopt it for hero (and gradually for in-content images).

Fix (~1 hr): add dims, replace hero img with <Picture>, verify CLS in PostHog 24h post-deploy.

Source: 08-technical-seo.md quick win #1, dead-weight finding.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
