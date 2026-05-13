# B3 — `/guide` Dead-Click Hotspot (keyBenefits Card)

**Agent**: B3 of 10 deep-dive | **Date**: 2026-05-12 | **Task #13**

---

## 1. TL;DR

- **File:line**: `src/pages/Guide.jsx:361`
- **Anti-pattern confirmed**: **YES** — `<Card>` with `hover:shadow-lg transition-all duration-300` (interactivity cues) but NO `onClick`, NO `to`, NO anchor wrapper, NO `cursor-pointer`. Pure presentational content.
- **Proposed fix**: **Option B (Pure Deletion)** — strip the lying hover/transition affordance. `keyBenefits` items have no `url`/`href` field, no logical destination, and the section is already followed by inline `<Link>`s in the section intro (lines 346–347). Wrapping in a link would invent a destination that doesn't exist.
- **Effort**: 1-line edit, near-zero risk (pure deletion per CLAUDE.md Pattern 6).

---

## 2. Current code (lines 351–375)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {keyBenefits.map((benefit, index) => (
    <motion.div
      key={benefit.title}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
            {benefit.icon}
          </div>
          <CardTitle className="text-lg text-gray-900">{benefit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-gray-600">
            {benefit.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  ))}
</div>
```

`keyBenefits` (lines 39–60) is `[{ icon, title, description }, ...]` — **no `url`/`href`/`link`/`to` field anywhere**. Items: Fast Acting, Liver Protection, Mental Clarity, Overall Wellness.

---

## 3. PostHog click-text confirmation

Query (2026-05-01 → 2026-05-12, project 275753):

```sql
SELECT properties.$el_text, count()
FROM events
WHERE event = '$dead_click' AND properties.$pathname = '/guide' AND timestamp > '2026-05-01'
GROUP BY 1 ORDER BY 2 DESC
```

Result:

| `$el_text` | count |
|---|---|
| **`Mental Clarity`** | **3** |
| `(null)` | 1 |
| `• Anxiety and regret the next day` | 1 |

`Mental Clarity` is the 3rd keyBenefit (line 53). **Confirms** the line 361 Card is the culprit. (The 3 events are all from one mobile user May 10 ~3s apart — classic rage-click pattern A6 noted PostHog isn't tagging as `$rageclick`.)

---

## 4. Proposed patch (UNIFIED DIFF — DO NOT APPLY)

```diff
--- a/src/pages/Guide.jsx
+++ b/src/pages/Guide.jsx
@@ -358,7 +358,7 @@
                 viewport={{ once: true }}
                 className="text-center"
               >
-                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
+                <Card className="h-full bg-white/80 backdrop-blur-sm border-green-100">
                   <CardHeader className="text-center">
                     <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                       {benefit.icon}
```

**Why Option B (delete) over Option A (wrap in anchor)**:
1. No data field for a destination exists in `keyBenefits` — wrapping in `<Link>` requires inventing a target per item (extra design decision, risk of broken/arbitrary links).
2. The section intro at lines 346–347 already has two inline `<Link>`s (`/never-hungover/dhm-japanese-raisin-tree-complete-guide`, `/reviews`) — users have explicit, labeled routes.
3. Pure deletion aligns with CLAUDE.md Pattern 6 ("Pure Deletion Is the Safest Change") — zero new code, zero new edge cases.
4. Note: prior RCA for `/research:505` (Hotspot D) recommended Option A there because each `study` has `pubmedUrl`. `keyBenefits` doesn't. Different data shape → different fix.

---

## 5. Same-class anti-patterns elsewhere (`Card` + `hover:shadow-lg` without anchor/onClick)

Found by `grep -rn "hover:shadow-lg" src/pages src/components src/newblog`. After excluding correctly-wired Cards (RelatedCalculators.jsx:121 has `cursor-pointer` + onClick, NewBlogPost.jsx:158/1135 wrap interactive content), **the following are likely same-class offenders**:

| File:line | Section | Has destination data? | Suggested fix |
|---|---|---|---|
| `src/pages/Research.jsx:505` | study list | YES (`study.pubmedUrl`) | **Option A** (deferred RCA P0 — wrap in `<a>`). Still unfixed; 3 dead clicks this window. |
| `src/pages/Research.jsx:355` | DHM stats | No | Option B |
| `src/pages/Research.jsx:416` | benefit cards | No | Option B |
| `src/pages/Home.jsx:692` | feature/benefit | No (verify) | Option B |
| `src/pages/Home.jsx:823` | feature/benefit | No (verify) | Option B |
| `src/pages/About.jsx:318` | team/value cards | No | Option B |
| `src/pages/About.jsx:441` | mission/story cards | No | Option B |
| `src/pages/Reviews.jsx:507` | content card | No (verify) | Option B |
| `src/pages/DosageCalculatorEnhanced.jsx:1780` | info card | No | Option B |
| `src/pages/DosageCalculatorEnhanced.jsx:1812` | info card | No | Option B |
| `src/components/UserTestimonials.jsx:234` | testimonial | No | Option B |

**Recommendation for follow-up batch PR**: apply Option B (delete `hover:shadow-lg transition-all duration-300`) to all the "No destination" rows in one sweep. ~11 single-line edits. Pair with Option A on Research.jsx:505 (the one with `study.pubmedUrl`). Total batch: ~12 lines changed, all minimal-risk.

---

## 6. Confidence: **5/5**

- Exact line confirmed by direct file read.
- Anti-pattern confirmed by direct code inspection (no onClick/to/anchor).
- PostHog confirms `Mental Clarity` = 3 dead clicks (the 3rd keyBenefit).
- A6's report (`06-dead-rage.md` lines 41, 79) independently flagged this same location.
- Fix follows established project Pattern 6 (Pure Deletion); risk profile matches Issue #29 ("near-zero risk, no new code, no edge cases").

**Task #13 completed.**
