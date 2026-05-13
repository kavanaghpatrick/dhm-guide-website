# Dead Clicks RCA — 2026-04-29

**Agent**: 4 of 5 (PostHog dead-click investigation)
**Investigation date**: 2026-04-30
**Source data**: PostHog project 275753, `$dead_click` events on `toDate(timestamp) = '2026-04-29'`

---

## 1. Finding

**44 dead-click events fired from 5 sessions across 4 distinct users on 2026-04-29.**

| Metric | Value |
|---|---|
| Total events | 44 |
| Unique users | 4 |
| Unique sessions | 5 |
| Distinct (path, target) groups | 29 |
| Dead clicks on `<a>` tags (affiliate false-positives) | **0** |

**Concentration**: One user (`019dc7ea-1db0-7133-9947-ca1bb82edcb0`, session `d6fbbb57`) generated **34 of 44 dead clicks (77%)** in a single session that traversed `/`, `/research`, and the supplements blog. This is not noise — it's one frustrated user repeatedly clicking elements that look interactive.

| Path | Clicks | Sessions |
|---|---|---|
| `/` (homepage) | 22 | 2 |
| `/research` | 14 | 3 |
| `/never-hungover/hangover-supplements-complete-guide-what-actually-works-2025` | 8 | 3 |

**False-positive filter applied**: The `posthog-query.sh dead-clicks-real` heuristic excludes amzn.to/amazon URLs. None of the 44 events on 2026-04-29 fired on an `<a>` element — the affiliate-link false-positive case does not apply here. **All 44 are real dead clicks.**

**Unifying pattern**: Every hotspot is a Tailwind/shadcn `<Card>` or styled-as-card `<div>` on which the user expects a click to do something (open a study, expand a row, anchor-scroll a heading) — but the entire interactive surface is a non-interactive `<div>` with no `onClick` or `<a>` ancestor. Hover styles (`hover:shadow-lg`, `hover:bg-gray-50`, `transition-all`) are present, which strongly signals "click me," but no handler is wired.

---

## 2. Top Dead-Click Selectors (real, not false-positive)

Order: count desc. All 29 (path, target) groups summed below; only the load-bearing rows shown.

| # | Path | Tag | Visible text | Class signature | Count | False-pos? |
|---|---|---|---|---|---|---|
| 1 | `/` | `div` | (empty) | `flex items-center justify-between mb-2` (inside `radix-«rr»-content-studies` tab) | 4 | No |
| 2 | `/` | `div` | (empty card body) | `p-4 border rounded-lg` (Studies-tab supplement card) | 3+3+2+2 = 10 cumulative | No |
| 3 | `/` | `span` | "3 trials" | `inline-flex items-center ... px-2 py-0.5 ... w-fit` (`data-slot="badge"`) | 3 | No |
| 4 | `/` | `div` | "NAC (N-Acetylcysteine)" | `font-semibold text-gray-900` (table cell on `tr.hover:bg-gray-50`) | 3 | No |
| 5 | `/research` | `div` (`data-slot="card"`) | (empty) | `text-card-foreground ... border-green-200` (RCT Results / Key Findings cards) | 3 | No |
| 6 | `/` | `span` | "Quality Score:" | `text-gray-600` (Studies-tab metric label) | 2 | No |
| 7 | `/` | `div` | (empty hover row) | `flex flex-col items-center` (table cell with progress bar) | 1 | No |
| 8 | `/research` | `h3` | "Filter Studies" | `text-lg font-semibold text-gray-800` (filter section heading) | 1 | No |
| 9 | `/research` | `div` | "2026 RCT Results" | `leading-none font-semibold text-green-800` (`data-slot="card-title"`) | 1 | No |
| 10 | `/research` | `div` | "Efficacy of Hovenia dulcis Fruit Extract..." | `font-semibold text-xl text-gray-900 mb-2` (`data-slot="card-title"` of study Card) | 1 | No |
| 11 | `/research` | `p` | "First rigorous human clinical trial demonstrating hangover prevention efficacy" | `text-blue-700 text-sm` (Significance panel) | 1 | No |
| 12 | `/research` | `strong` | "Randomized, double-blind design" | (no class — bullet text) | 1 | No |
| 13 | `/research` | `li` | "•" | (no class — bullet pseudo) | 1 | No |
| 14 | `/research` | `span` | "UCLA 2012" | `inline-flex ... w-fit ...` (`data-slot="badge"`) | 1 | No |
| 15 | `/research` | `section` | (empty) | `py-16 px-4 bg-white` (timeline section background) | 1 | No |
| 16 | `/never-hungover/hangover-supplements...` | `span` | "3. Morning Recovery" / "By Category" / "6. More Labs Morning Recovery" | `relative z-10 bg-white pr-4` (NewBlogPost h3 wrapper span) | 3 | No |
| 17 | `/never-hungover/hangover-supplements...` | `p` | (empty paragraph) | `text-gray-700 leading-relaxed mb-4 text-lg` (prose paragraph) | 2 | No |
| 18 | `/never-hungover/hangover-supplements...` | `strong` | "DHM Depot" | `font-bold text-gray-900 bg-green-50 px-1 py-0.5 rounded` | 1 | No |
| 19 | `/never-hungover/hangover-supplements...` | `span` | "best hangover prevention supplement 2026" | `inline-flex ... bg-green-100 text-green-700 rounded-full` (tag pill) | 1 | No |
| 20 | `/` | `div` (testimonial "Before DHM" block) | (empty) | `bg-red-50 rounded-lg p-6 border border-red-200` (inside `aria-label="Customer testimonials"` carousel) | 1 | No |

(See investigation notebook for the full 29-row table.)

---

## 3. Source identification

For each unique hotspot, the file:line where the looks-clickable-but-isn't element lives:

### A. Homepage `/` — `<CompetitorComparison>` Studies tab (≈15 dead clicks, single biggest hotspot)

`src/components/CompetitorComparison.jsx:493-520`
```jsx
<TabsContent value="studies" className="mt-6">
  <div className="space-y-4">
    {filteredCompetitors.map((comp, index) => (
      <div key={index} className="p-4 border rounded-lg">    {/* ← dead-click target #2 */}
        <div className="flex items-center justify-between mb-2">  {/* ← #1 */}
          <h4 className="font-semibold text-gray-900">{comp.name}</h4>
          <Badge variant={...}>{comp.clinicalTrials} trials</Badge>  {/* ← #3 */}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Quality Score:</span>  {/* ← #6 */}
            <span className="ml-2 font-medium">{comp.scientificEvidence}%</span>
          </div>
          ...
```
The card has `border` + `rounded-lg` styling — visually identical to clickable shadcn `<Card>` components elsewhere on the same page. No `onClick`, no `<a>` wrapper.

### B. Homepage `/` — Comparison table (3 dead clicks on "NAC (N-Acetylcysteine)")

`src/components/CompetitorComparison.jsx:262-271`
```jsx
<tr key={index} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>  {/* ← hover signals interactivity */}
  <td className="px-6 py-4">
    <div className="flex items-center">
      <div className={`w-3 h-3 bg-${comp.color}-500 rounded-full mr-3`}></div>
      <div>
        <div className="font-semibold text-gray-900">{comp.name}</div>  {/* ← dead-click #4: "NAC (N-Acetylcysteine)" */}
        <div className="text-sm text-gray-500">{comp.mechanism}</div>
      </div>
    </div>
  </td>
  ...
```
The `hover:bg-gray-50` on `<tr>` strongly signals "click me to drill in" but the row has no handler. User clicked the supplement name 3 times.

### C. `/research` — RCT Results / Key Findings Card pair (3 dead clicks)

`src/pages/Research.jsx:248-282`
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
  <Card className="bg-white border-green-200">       {/* ← dead-click #5 (data-slot="card") */}
    <CardHeader>
      <CardTitle className="text-green-800 flex items-center">
        <Beaker className="w-5 h-5 mr-2" />
        2026 RCT Results                              {/* ← #9 */}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-left space-y-2 text-gray-700">
        <li>• <strong>{humanTrialCount} human clinical trials</strong> completed</li>
        <li>• <strong>Randomized, double-blind design</strong></li>  {/* ← #12 */}
        ...
```
Two summary cards with no link. Users tried clicking expecting a drilldown into "the 11 trials" or "the methodology."

### D. `/research` — Study list cards (the big hotspot — many tail clicks)

`src/pages/Research.jsx:497-609`
```jsx
{filteredStudies.map((study, index) => (
  <motion.div ...>
    <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300">  {/* ← hover lift, but NO onClick */}
      <CardHeader>
        ...
        <CardTitle className="text-xl text-gray-900 mb-2">{study.title}</CardTitle>  {/* ← #10: "Efficacy of Hovenia dulcis..." */}
        ...
      </CardHeader>
      <CardContent>
        ...
        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <p className="text-blue-700 text-sm">{study.significance}</p>   {/* ← #11 */}
        </div>
        ...
        <Button asChild ...>
          <a href={study.pubmedUrl} target="_blank" ...>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full PubMed Study                    {/* the actual link is buried here */}
          </a>
        </Button>
        ...
      </CardContent>
    </Card>
  </motion.div>
))}
```
**This is the worst offender by design.** The card has `hover:shadow-lg transition-all duration-300` — a textbook "I'm clickable" affordance — but the only working link is the `View Full PubMed Study` button buried at the bottom of `<CardContent>`. Users click the title, the participants metric, the significance text, the bullet points (`<li>•</li>`), the badges ("UCLA 2012") — every dead-click on `/research` traces back here.

### E. `/research` — Filter Studies header (1 dead click)

`src/pages/Research.jsx:441-446`
```jsx
<div className="mb-6">
  <div className="flex items-center justify-center gap-2 mb-4">
    <Filter className="w-5 h-5 text-gray-600" />
    <h3 className="text-lg font-semibold text-gray-800">Filter Studies</h3>  {/* ← dead-click #8 */}
  </div>
```
User probably expected an expandable filter panel; the heading is just a label.

### F. `/never-hungover/hangover-supplements...` — Section heading wrappers (3 dead clicks: "3. Morning Recovery", "By Category", "6. More Labs Morning Recovery")

`src/newblog/components/NewBlogPost.jsx:986-989`
```jsx
return (
  <h3 id={id} className="text-xl font-bold text-gray-900 mt-8 mb-4 relative">
    <span className="relative z-10 bg-white pr-4">{children}</span>      {/* ← dead-click target */}
    <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-green-200 to-transparent -translate-y-1/2 -z-0"></div>
  </h3>
);
```
The h3 already gets an auto-generated `id` (e.g., `"3-morning-recovery"`). User clicks the heading expecting the standard "click heading to copy/anchor" UX or to scroll-to-top; nothing happens.

### G. Homepage `/` — UserTestimonials "Before DHM" panel (1 dead click)

`src/components/UserTestimonials.jsx:248-321`
```jsx
<Card
  ref={carouselRef}
  ...
  aria-roledescription="carousel"
  ...
  className="mb-12 overflow-hidden shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
>
  ...
  <div className="bg-red-50 rounded-lg p-6 border border-red-200">  {/* ← dead-click #20 */}
    <h5 className="font-semibold text-red-800 ...">Before DHM</h5>
    <p className="text-gray-700">{currentReview.beforeAfter.before}</p>
  </div>
  ...
```
Inside a card declared as `aria-roledescription="carousel"` — user expected the panel to flip/expand. Touch handlers on the parent (`onTouchStart`, `onTouchEnd`) reinforce the "swipe me" affordance; the inner panel has no click.

---

## 4. Recommended fixes

CLAUDE.md prefers **deletion over addition**. For each hotspot below, the simplest change is listed first.

### Hotspot A: Homepage Studies-tab supplement cards (≈15 of 44 events)

`src/components/CompetitorComparison.jsx:496` — change `<div className="p-4 border rounded-lg">` to remove the card-like styling so it doesn't read as clickable. Either:

- **Preferred (minimal addition):** wrap the visible content in `<a href={comp.amazonUrl || '/reviews'} ...>` so a click *does* drill into the supplement's review. Most of these competitors already have an Amazon affiliate URL field — confirm in the data structure.
- **Pure-deletion alternative:** drop `border rounded-lg` from line 496 so the block reads as a flat list item, not a card. (Keeps the data, removes the click-affordance lie.)

### Hotspot B: Homepage comparison table rows (3 events on "NAC")

`src/components/CompetitorComparison.jsx:262` — `<tr ... className={... 'hover:bg-gray-50'}>`. Two minimal options:

- **Pure deletion (preferred):** strip `hover:bg-gray-50`. The hover is the lie — no handler ever existed. One-class delete.
- **Or:** add an "Action" column with a `<Button asChild><a href={...}>Compare</a></Button>` per row (matches Pattern #12 in CLAUDE.md, which already added orange "Check Price" buttons to a similar table).

### Hotspot C: `/research` RCT Results / Key Findings Card pair (3 events)

`src/pages/Research.jsx:249, 266` — `<Card>` with no link. These are summary stat cards. **Pure-deletion fix**: these cards don't actually need to BE `<Card>` components if they're never going to link anywhere — replace `<Card>` with `<div className="rounded-lg border border-green-200 bg-white p-6">` and they'll look slightly less interactive without losing visual structure. (`<Card>` carries `data-slot="card"` and shadow defaults that strongly imply clickability.)

### Hotspot D: `/research` study list cards — the big design problem

`src/pages/Research.jsx:505` — `<Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300">`. This is the highest-leverage fix on the page.

- **Strong recommendation:** **wrap the entire `<Card>` in an `<a href={study.pubmedUrl} target="_blank" rel="noopener noreferrer">`**. Every signal already says "click the card" — finally make it true. The buried `View Full PubMed Study` button can stay (or even be removed) because the whole card now opens PubMed.
- Concrete edit at line 505: change `<Card ...>` to `<a href={study.pubmedUrl} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-xl"><Card ...>` and close with `</Card></a>`. ~2-line addition.
- **Tracking caveat:** make sure the existing `affiliate_link_click` / `external_link_click` tracking captures this. Add `data-track="research-study"` and `data-pubmed-url={study.pubmedUrl}` so PostHog can attribute.
- **Pure-deletion alternative:** drop `hover:shadow-lg transition-all duration-300` from line 505 so the card stops *promising* a click. Cheaper but worse UX outcome.

### Hotspot E: `/research` Filter Studies header (1 event)

`src/pages/Research.jsx:444` — `<h3>Filter Studies</h3>`. Single click, low priority. **No fix needed** until count grows. If it recurs, consider making it the trigger for collapsing the filter panel on mobile (collapsible saves screen real estate, and users are clearly clicking it anyway).

### Hotspot F: Blog post section heading wrappers (3 events on h3 spans)

`src/newblog/components/NewBlogPost.jsx:986-989` — the h3 already has an `id`; users are clicking expecting standard "anchor link" behavior.

- **Minimal addition (preferred):** make the h3 itself a permalink target. Wrap `<span className="relative z-10 bg-white pr-4">` in an `<a href={`#${id}`} className="no-underline hover:underline">`. ~3-line change. Matches the "click heading to copy URL" pattern users expect from GitHub/MDN/most docs.
- **Pure-deletion alternative:** none — the click-affordance is implicit in the heading style, not in any specific class we can drop.

### Hotspot G: UserTestimonials "Before DHM" panel (1 event)

`src/components/UserTestimonials.jsx:314` — `<div className="bg-red-50 rounded-lg p-6 border border-red-200">`. Single click, ambiguous intent. **No fix needed.** The user was likely trying to swipe the carousel; the dot indicators (line 348) already support that. Watch over time; if the panel attracts more clicks, consider making the entire `<Card>` carousel respond to inner-panel clicks as "next slide."

---

## Summary of recommended edits

| Priority | File:Line | Change | Effort |
|---|---|---|---|
| **P0** | `src/pages/Research.jsx:505` | Wrap `<Card>` in `<a href={study.pubmedUrl}>` | ~2 lines |
| P1 | `src/components/CompetitorComparison.jsx:262` | Delete `'hover:bg-gray-50'` (or add Action column with link) | 1 line delete |
| P1 | `src/components/CompetitorComparison.jsx:496` | Drop `border rounded-lg` (or wrap in affiliate `<a>`) | 1 line edit |
| P2 | `src/newblog/components/NewBlogPost.jsx:987` | Wrap h3 inner span in anchor `<a href="#id">` | ~3 lines |
| P3 | `src/pages/Research.jsx:249, 266` | Replace stat `<Card>` components with plain `<div>` | 2 line edits |
| P4 | (defer) | `Research.jsx:444` Filter Studies h3 — only 1 click | none |
| P4 | (defer) | `UserTestimonials.jsx:314` Before-DHM panel — only 1 click | none |

The single highest-leverage fix is **P0** — wrapping `/research` study cards in `<a>` links — because the dead-click signature on `/research` is dominated by clicks scattered across these cards (title, badges, body, list items, significance panel — all tracing to the same parent `<Card>` at line 505).
