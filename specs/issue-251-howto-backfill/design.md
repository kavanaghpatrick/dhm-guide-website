# Design — Issue #251

## Approach

Pure data change. No code edits. The prerender pipeline already reads
`post.howTo` and the helper already emits valid `HowTo` JSON-LD; we only
need to populate the field on 4 specific post JSONs.

## Edit strategy per file

Each of the 4 target JSONs gets a new top-level `howTo` key inserted near
the end of the object (after `id`/`relatedPosts`/`faq`, before the closing
brace). Position within the object doesn't matter for parsing; we choose
end-of-object purely for diff readability.

The shape (matched to existing pattern in `dhm-dosage-guide-2025.json`):

```json
"howTo": {
  "name": "<HowTo title>",
  "description": "<1-2 sentence summary>",
  "totalTime": "<ISO 8601 duration>",
  "supply": ["item 1", "item 2", "..."],
  "steps": [
    { "name": "Step 1 short name", "text": "Step 1 instruction text." },
    { "name": "Step 2 short name", "text": "Step 2 instruction text." }
  ]
}
```

## Authoring tool: `node -e` round-trip

To minimize risk of malformed JSON, each edit is performed by:

1. Reading the file with `JSON.parse`.
2. Setting the `howTo` field.
3. Writing back with `JSON.stringify(obj, null, 2) + "\n"`.

This guarantees clean JSON output and matches the existing 2-space indent
used elsewhere in `src/newblog/data/posts/`.

The `Edit` tool is also viable for adding a single new key block, but
`node -e` round-trip is safer for nested structures because it eliminates
the risk of comma/whitespace mistakes.

We will use `Edit` here (small, well-defined inserts) but verify each edit
with `node -e "JSON.parse(...)"` immediately after.

## Per-post content plan

### 1. how-to-cure-a-hangover-complete-science-guide

Source: "Tier 1 DHM-Based Prevention Protocol" + "Tier 2 Enhanced Recovery"
sections of the post.

- `name`: "How to Manage Hangover Symptoms"
- `totalTime`: `"PT1H"` (initial protocol; recovery continues but first
  hour is the active intervention window)
- `supply`: DHM (300-600mg), electrolyte solution, water, B-complex,
  vitamin C, light easy-to-digest food
- 6 steps:
  1. Take DHM with water (300-600mg)
  2. Hydrate with electrolyte solution (16-20oz)
  3. Add antioxidant + B-complex support
  4. Eat light digestible food
  5. Manage headache (ibuprofen with food, NOT acetaminophen)
  6. Continue hydration through the day

### 2. how-to-get-rid-of-hangover-fast

Source: "15-Minute Emergency Protocol" — already structured as Step 1 / 2 / 3.

- `name`: "How to Get Fast Hangover Relief in Under 60 Minutes"
- `totalTime`: `"PT1H"` (matches the post's own timeline)
- `supply`: DHM (800-1000mg), electrolyte powder, NAC (600mg), vitamin C
  (1000mg), B-complex, magnesium glycinate (400mg)
- 6 steps from the post's emergency protocol (immediate dose, stabilize,
  hydrate, eat light protein, get fresh air, monitor + redose if needed)

### 3. hangover-headache-fast-relief-methods-2025

Source: "15-Minute Emergency Hangover Headache Relief Protocol" — already
4 named steps; add 1 from the supplementation tier.

- `name`: "How to Relieve a Hangover Headache Fast"
- `totalTime`: `"PT15M"` (matches post's title promise)
- `supply`: water + sea salt, magnesium glycinate (400mg), cold compress,
  ibuprofen (400-600mg with food), B-complex, optional DHM (300mg)
- 5 steps: hydrate with electrolytes; rest in dark room; pressure-point
  relief; targeted supplementation; avoid acetaminophen warning included
  in supplementation step

### 4. hangover-nausea-complete-guide-fast-stomach-relief-2025

Source: "5-Minute Nausea Relief Technique" + Tier 1 remedies (ginger, B6,
controlled hydration).

- `name`: "How to Relieve Hangover Nausea Fast"
- `totalTime`: `"PT30M"`
- `supply`: room-temp water, fresh ginger or ginger tea, vitamin B6
  (25-50mg), peppermint tea, electrolyte powder
- 6 steps: sit upright + sip water; apply P6 acupressure; ginger
  intervention; B6 supplement; controlled hydration with electrolytes;
  introduce easy-digest food (bananas, toast, broth)

## Medical-claim language rules

- Use "manage", "relieve", "help reduce", "support recovery"
- Avoid "cure", "fix", "eliminate"
- Always pair NSAID mention with the "with food, NOT acetaminophen" caveat
  from the source content (the post already says this — preserve it)
- Quantities are extracted directly from the post; do not invent dosages

## Verification

After all 4 edits:

```bash
# JSON validity
for f in src/newblog/data/posts/{how-to-cure-a-hangover-complete-science-guide,how-to-get-rid-of-hangover-fast,hangover-headache-fast-relief-methods-2025,hangover-nausea-complete-guide-fast-stomach-relief-2025}.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('OK $f')"
done

# Build
npm run build

# Schema emission
for slug in how-to-cure-a-hangover-complete-science-guide how-to-get-rid-of-hangover-fast hangover-headache-fast-relief-methods-2025 hangover-nausea-complete-guide-fast-stomach-relief-2025; do
  echo "=== $slug ==="
  grep -oE '"@type":"HowTo"' "dist/never-hungover/$slug/index.html" | head -1
done
```

All 4 must print `"@type":"HowTo"`.

## Failure recovery

If any JSON fails to parse: `git restore <file>` and re-apply the edit
using `node -e` round-trip. Do NOT commit malformed JSON.
