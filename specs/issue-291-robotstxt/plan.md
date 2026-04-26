# [Phase 2] Robots.txt: explicit Allow rules for AI bots

Refs #283.

## Fix (~15 min)
Add to public/robots.txt explicit allow lines for: GPTBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, OAI-SearchBot.

Wildcard already covers them, but explicit allows make intent unambiguous and survive future restrictive defaults.

Source: 06-ai-search.md, 08-technical-seo.md quick win #5.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
