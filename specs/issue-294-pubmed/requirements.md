# Requirements — Issue #294

## Functional
1. Backfill inline PubMed citations to top 30 traffic posts.
2. Substitute 5–8 generic study phrases per post with `[phrase](https://pmc.ncbi.nlm.nih.gov/articles/PMCxxxx/)` markdown links.
3. Use a hand-curated phrase→PMC URL map; do NOT auto-guess PMC IDs.
4. Skip phrases that already have a markdown link.
5. Skip phrases inside code blocks, headings, and bare-URL reference lists.
6. Provide dry-run mode (default) and `--apply` flag to write.
7. Output per-post substitution counts.

## Non-functional
8. Conservative — under-cite is better than mis-cite. If unsure, skip.
9. Reversible — single-pass replace (idempotent because markdown link replacement is detectable).
10. Build must pass after `--apply`.
