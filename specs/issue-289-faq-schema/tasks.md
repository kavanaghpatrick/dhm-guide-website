# Tasks — Issue #289: FAQ schema backfill

- [x] T1. Research — schema emission path, field shape, markdown formats
- [x] T2. Requirements
- [x] T3. Design
- [x] T4. Implement `scripts/posts-faq-backfill.mjs`
- [x] T5. Dry-run, eyeball top candidates
- [x] T6. Apply: 62 posts backfilled (10 → 72 with `faq` field)
- [x] T7. `npm run build` — 189 posts prerendered successfully
- [x] T8. Verified FAQPage emission: 72/189 posts now emit FAQPage JSON-LD (up from 10)
- [ ] T9. Commit, push, PR, squash-merge --admin

## Outcome
- **Before**: 10/189 posts (5.3%) emit FAQPage schema
- **After**:  72/189 posts (38.1%) emit FAQPage schema
- **Posts backfilled**: 62
- **Formats handled**: H3 questions, `**Q: ... **` / `A: ...`, bare bold-question
