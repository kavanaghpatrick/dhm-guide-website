# Research: issue-291-robotstxt

## Summary
Trivial. `public/robots.txt` had `User-agent: */Allow: /` covering all bots implicitly. Added explicit Allow directives for the major AI crawlers per the issue.

## Bots added
- `GPTBot` — OpenAI training crawler
- `ChatGPT-User` — ChatGPT user-initiated browsing
- `OAI-SearchBot` — ChatGPT Search
- `ClaudeBot` — Anthropic training crawler
- `Claude-SearchBot` — Claude with web search
- `PerplexityBot` — Perplexity Search
- `Google-Extended` — Google Gemini training opt-in
- `CCBot` — Common Crawl (used by many AI training datasets)
- `Applebot-Extended` — Apple Intelligence training opt-in
- `Amazonbot` — Amazon Alexa / Rufus

## Why explicit allows matter
- Survives any future change in user-agent matching defaults
- Makes intent unambiguous to log-monitoring tools and SEO auditors
- Matches T6 / 06-ai-search.md recommendation

## Verification
`grep -c "User-agent" public/robots.txt` returns 12 (was 1).
