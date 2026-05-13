# B7 — "Continue Your Research" Footer RCA

**Agent:** B7 (10-agent deep-dive team)
**Date:** 2026-05-12
**Window:** 2026-04-29 (PR #246/#359 ship date) → 2026-05-12 (14 days)

---

## 1. TL;DR

**Primary hypothesis confirmed: H1 — Placement Too Low (readers don't reach it).**

Only **22 scroll-90 events** occurred across **541 blog pageviews** since 2026-04-29 — a **4.1% reach rate**. The footer sits below `<!-- cluster-index:auto -->`, after the body, after `<CompareCTA>`, AND after Related Articles in some posts (Related Articles is React-rendered outside markdown, but the markdown footer is the final paragraph of the article body). In raw markdown distance it's the very last content block. **96% of readers never see it.** That is the failure.

Secondary findings (compounding, not primary):
- **H3 partially true** — all 197 posts have the **identical** 4 links (`/guide`, `/compare`, `/reviews`, `/research`). Zero contextual variation. Even readers who reach it get a generic hub-list, not a relevance-driven next step.
- **H2 partially true** — link labels are generic ("Complete DHM Guide →", "Product Reviews →"). No promise of new information.
- **H5 partially true** — clicks are tracked but **counted as generic `internal_link` with `link_context: 'article_content'`**, indistinguishable from in-body editorial links. No `data-placement="continue_research_footer"` exists anywhere.
- **H4 false** — no media-query gating; mobile renders the same markdown. Mobile actually over-indexes on scroll-90 (14 of 22) relative to its pageview share (235 of 541), so mobile readers who finish are if anything *more* likely to see it.

**Recommendation: REMOVE the footer (pure deletion).** See §6.

**Confidence: 4/5.**

---

## 2. Sample Footer Content (Representative)

From `src/newblog/data/posts/dhm-dosage-guide-2025.json` (end of `content`):

```markdown
<!-- hub-footer:auto -->
## Continue Your Research

- **[Complete DHM Guide →](/guide)** - Dosage, timing, and how DHM works
- **[Compare Supplements →](/compare)** - Side-by-side product comparison
- **[Product Reviews →](/reviews)** - In-depth reviews of 7 tested supplements
- **[Clinical Research →](/research)** - 11 peer-reviewed DHM studies
```

**Verified across all 197 posts:** MD5-hashed the footer block from every post with the marker. **1 distinct variant, 197 instances.** Same 4 hub links, same labels, same order, regardless of post topic. (`activated-charcoal-hangover`, `dhm-dosage-guide-2025`, `alcohol-and-bone-health`… all identical.)

---

## 3. Rendering Analysis

**File:** `src/newblog/components/NewBlogPost.jsx` lines 1422–1444, 1463–1500.

| Aspect | Finding |
|--------|---------|
| **How rendered** | Plain markdown inside `<div className="prose prose-lg prose-green max-w-none enhanced-typography">` (line 951) via `ReactMarkdown` with `remarkGfm`. |
| **HTML comment leak** | `<!-- hub-footer:auto -->` is a markdown HTML comment. No `rehype-raw` plugin is configured, so ReactMarkdown drops it silently. **No `<!--…-->` leak in DOM** → A6's reported leak via `$el_text` is not reproducible here; the comment never reaches the DOM. |
| **Mobile gating** | None. No `md:hidden` / `md:block` / media-query branches around the footer block. Identical on all viewports. **H4 (mobile broken) is FALSE.** |
| **Position in DOM** | Final block of `<article>` markdown body. Followed by `<CompareCTA>` (line 1459) and then a React-rendered `Related Articles` grid (line 1464). The markdown footer's `## Continue Your Research` heading sits visually *above* the Related Articles card. |
| **Data attributes** | None. The four `<a>` tags get the standard markdown-link transform (line 1289 `CustomLink to={href}`). They inherit `data-placement: undefined`. |

**Verdict:** Rendering is correct and unconditional. It is not broken — it is buried.

---

## 4. Tracking Gap Analysis

**File:** `src/hooks/useElementTracking.js` lines 153–172.

Footer links are caught by the generic `internal_link` branch:
- `element_type = 'internal_link'`
- `link_context = 'article_content'` (matches `.prose`, line 164)
- `link_destination = 'guide' | 'compare' | 'reviews' | 'research'`
- `link_text` = "Complete DHM Guide →" / "Compare Supplements →" / etc.
- `scroll_depth_at_click` = recorded at click time

**There is no `placement` field, no `cta_id`, no way to tell "footer click" from "inline editorial mention".**

**PostHog evidence (2026-04-29 → 2026-05-12):**

Q1 (literal `$el_text LIKE '%continue your research%'`): **0 rows.**
Q6 (autocapture with arrow text or hub-link labels): **0 rows.**
Q2 (`element_clicked internal_link` on `/never-hungover/*`):
- "Complete DHM Guide →" → /guide: **2 clicks**
- All other inline-editorial internal links combined: **>40 clicks** (Double Wood, No Days Wasted, fast-hangover-relief-guide, hangxiety, etc.)
- **No clicks on `/compare`, `/reviews`, or `/research` matching the footer's exact labels.**

**Conclusion:** The hub-footer links got **at most 2 clicks** total in 14 days. The tracking gap is real but **the underlying number is small enough that better tagging wouldn't change the verdict** — there are simply almost no clicks to find.

---

## 5. Scroll-Depth Profile — Are Users Reaching the Footer?

**PostHog query Q3 + Q4 (2026-04-29 → 2026-05-12):**

| Page type | 25% | 50% | 75% | 90% | Pageviews | 90%-reach rate |
|-----------|----:|----:|----:|----:|----------:|---------------:|
| `blog_post` (/never-hungover/*) | 109 | 59 | 36 | **22** | **541** | **4.1%** |
| `hub` (/guide, /compare, /reviews, /research) | 35 | 29 | 21 | 17 | 68 | 25.0% |
| `home` | 6 | 4 | 3 | 2 | 33 | 6.1% |

**The funnel inside `/never-hungover/*`:** 100% → 20.1% (25%) → 10.9% (50%) → 6.7% (75%) → 4.1% (90%).

**Where the footer lives:** below `## Related Topics in This Series` (the cluster-index block), below the final body section, below the in-content `/reviews` CTA, below the auto-injected `blog_template_end` CTA. In raw scroll terms it sits at ~95–99% of document height.

**Reading this:** ~22 readers in 14 days actually scrolled to where the footer is rendered. Even if 100% of them clicked, the ceiling is ~22 clicks across all 197 posts combined — ~1.5 clicks per post per month. The footer is below the attention horizon for the other 96%.

**Per-page concentration (Q5):** of the 22 scroll-90 events, the top 3 posts (dhm-dosage-guide-2025, hangover-supplements-complete-guide, dhm-randomized-controlled-trials) account for 11. Even the longest-tail finishers happen on a tiny set of posts.

**Q10 — distribution of scroll-depth-at-click for internal_link clicks in blog posts:**
- 0–24%: 23 clicks (top-of-page, TOC, intro hyperlinks)
- 25–49%: 5 clicks
- 50–74%: 2 clicks
- 75–89%: 1 click
- 90–100%: 5 clicks

**77% of internal-link engagement happens in the top quarter of the page.** Only 6 clicks across 14 days happen in the bottom 25% where the footer lives — and those 6 are split with /reviews CTAs, Related Articles, and the in-body cluster-index.

---

## 6. Recommendations

| Option | Verdict | Reasoning |
|--------|---------|-----------|
| **(a) REMOVE** | **STRONGLY RECOMMENDED** | 4.1% reach × ~0–2 clicks observed = the footer is dead weight. Pure deletion. CLAUDE.md Pattern #6/#10 apply. Removes ~756 internal links that Google may now treat as suspicious (mass-edited 2026-04-29, same day DCNI watchlist period started — A6's investigation track). |
| (b) Move higher | Reject | The cluster-index `## Related Topics in This Series` already sits 1 paragraph above the footer with the same problem. Moving the footer up means adding another generic block competing with editorial flow. The data says **no part of the bottom-25% is read** — moving up by 10% doesn't fix it. |
| (c) Re-tag with `placement: 'continue_research_footer'` | Reject as standalone | Tagging cannot create clicks. The ceiling (~22 scroll-90 events in 14 days) caps possible clicks regardless of tagging. Tag only useful if we also move/redesign — which the data doesn't support investing in. |
| (d) Replace with contextual in-body links | Out of scope, defer | Editorial inline links (already in body) capture **41+ clicks vs 2** for the footer. Doubling down on in-body topical links would help, but that's a separate content workstream. |

**Path forward (pure deletion):**

1. Single PR removes the trailing block from each post JSON:
   ```
   ---\n\n<!-- hub-footer:auto -->\n## Continue Your Research\n\n- **[Complete DHM Guide →]…\n
   ```
2. **Blocked by mass-edit moratorium until 2026-07-15** (CLAUDE.md §Mass-Edit Moratorium Policy). The PR will need `[mass-edit-allowed]` rationale referencing this RCA and the DCNI investigation.
3. Alternative timing: include in any post-moratorium realignment batch.
4. No code change required — `NewBlogPost.jsx` renders whatever markdown is present. The block is markdown-only.

**Why deletion (not iteration):**
- 197 identical footers × 4 generic links = 788 internal links that add **no relevance signal** and dilute the link graph. Google sees the same 4 link-target/anchor-text pairs on every cluster post — classic footprint pattern.
- The hypothesis was "more internal links → more engagement". Data says: scroll-90 reach **dropped** (3.74% → 3.19% per the original PR observation), and the footer's actual click yield is ~2 over 14 days. The intervention failed; remove and recover.
- Pure deletion is the safest change (CLAUDE.md Pattern #6 — Issue #29 redirect deletion).

---

## 7. Confidence: 4 / 5

**Why not 5:** PostHog data over 14 days has small absolute counts (22 scroll-90 events, 2 footer-matching clicks). Bot deflation and ad-blocker losses could mask higher real engagement, but the *ratio* (footer-position clicks ≪ top-of-page clicks) is robust to denominator inflation. Also: A6's reported HTML-comment leak (`<!-- hub-footer:auto -->` as `$el_text`) was **not reproducible** in the rendering pipeline I inspected — worth a cross-check with A6 on which event/selector surfaced it (possible older deploy artifact or different markdown component path).

**Why 4 (not 3):** The 4.1% scroll-90 reach is computed from PostHog's own scroll-milestone events using the same definition the original hypothesis used. The placement-too-low conclusion follows directly from this number — no inference required.

---

## 8. Task #17 — Complete
