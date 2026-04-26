# [Phase 5] Clean up 71 unused PNGs (~110MB) and other dead weight

Refs #283. Dead weight identified by T8.

## Tasks (~2 hrs)
1. Identify the 71 PNG files >1MB in /public/ that no source/post references (T8 audit found ~110MB total). Delete.
2. Remove canonical-fix.js orphan reference (already addressed in PR #271 but verify)
3. Audit other unreferenced files in /public/

## Verification
- npm run build still succeeds
- All blog posts still render images
- dist/ size reduced by ~100MB

Source: 08-technical-seo.md dead-weight findings.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
