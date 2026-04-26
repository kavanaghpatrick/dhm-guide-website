# Requirements: Issue #286

## Problem statement
JSON-LD `Article` schema and sitemap.xml `<lastmod>` both emit `datePublished` as `dateModified` for 93% of posts. Google cannot detect freshness, hurting refresh-driven ranking lifts.

## User stories

1. **As Google's crawler**, when I parse a blog post's JSON-LD, I want `dateModified` to reflect the actual last edit date so I can surface refreshed content in SERPs.
2. **As Google's sitemap parser**, when I read `<lastmod>` for a URL, I want it to reflect the last edit, not the original publish date, so I prioritize re-crawling refreshed posts.
3. **As a content editor**, when I update a post's body, I want the freshness signal updated automatically without manually editing a `dateModified` field.
4. **As a developer**, when I want to override the auto-derived date (e.g., for backdating), I want to set `"dateModified"` in the post JSON and have it take precedence.

## Quality requirements

- `npm run build` succeeds with no new errors
- All 189 prerendered HTML files contain `dateModified` distinct from `datePublished` for posts whose latest commit ≠ original publish date
- `dist/sitemap.xml` `<lastmod>` reflects auto-derived dateModified
- Posts with explicit `"dateModified"` in JSON keep their override (the 14 that have it)
- Schema validators (Google Rich Results Test) still parse Article schema as valid
- No runtime crashes from missing git history (graceful fallback to `post.date`)

## Success criteria
- Pick `activated-charcoal-hangover`: prerendered HTML shows `"dateModified":"2026-02-01..."` (git mtime), `"datePublished":"2025-01-10"`
- `dist/sitemap.xml` line for the same post shows `<lastmod>2026-02-01</lastmod>`
