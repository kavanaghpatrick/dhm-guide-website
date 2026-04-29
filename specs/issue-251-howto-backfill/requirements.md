# Requirements — Issue #251

## Goal

Add a `howTo` JSON field to 4 Tier-1 hangover guide post JSONs so the
prerender pipeline emits a valid `HowTo` JSON-LD block in each post's
prerendered `<head>`.

## Functional requirements

1. **Each of the 4 target posts MUST have a `howTo` field** with these keys:
   - `name` (string, ≤ 70 chars, descriptive title)
   - `description` (string, 1–2 sentences, ≤ 300 chars)
   - `totalTime` (ISO 8601 duration; e.g. `"PT15M"`, `"PT1H"`)
   - `supply` (array of plain strings; 3–6 items)
   - `steps` (array of `{name, text}` objects; 5–7 entries)

2. **Step content MUST be extracted from each post's existing `content`
   field**, not invented. Where the original content uses aggressive
   medical claim language ("cure", "fix"), step text rephrases to softer
   "manage symptoms", "support recovery", "help relieve" wording.

3. **Each step's `name` ≤ 60 chars; each step's `text` 1–3 sentences**
   (≤ 350 chars). Step text should be specific (quantities, timings) where
   the source content provides them.

4. **The 4 target posts MUST be the ONLY posts modified.** The 2 existing
   `howTo`-bearing posts (`dhm-dosage-guide-2025`,
   `when-to-take-dhm-timing-guide-2025`) MUST NOT be touched.

## Non-functional requirements

5. **Each post JSON MUST round-trip through `JSON.parse` cleanly** — no
   trailing commas, smart quotes, or unescaped chars. Verified via `node -e`.

6. **`npm run build` MUST exit 0** after the changes. The build runs the
   prerender step, which exercises the `howTo` emission path.

7. **All 4 prerendered HTML files MUST contain `"@type":"HowTo"`** in
   `dist/never-hungover/<slug>/index.html` after build.

## Explicitly out of scope

- Tier 2 / Tier 3 posts (the other 11 originally listed in PRD) — deferred.
- Code changes to `prerender-blog-posts-enhanced.js` or
  `structuredDataHelpers.js` — both already work; no edits needed.
- Modifying the existing 2 `howTo`-bearing posts.
- A `/guide` route HowTo (that's issue #154 — separate spec).

## Acceptance criteria

- 4 post JSONs modified, each with valid `howTo` block matching spec.
- 0 other files modified (other than spec dir).
- Build passes.
- Grep verification: all 4 emit `"@type":"HowTo"` in prerendered HTML.
- Existing 2 howTo posts unchanged (verify via `git diff --name-only main`).

## Reset expectations (from research.md)

Per Google's Sept 2023 removal of HowTo rich-result eligibility (esp. for
YMYL/health content), this work delivers **0–5% CTR uplift**, NOT the
PRD-quoted "+20-35%". Real value is **AI Overview / LLM-grounding step
extraction**. Frame any post-merge tracking accordingly.
