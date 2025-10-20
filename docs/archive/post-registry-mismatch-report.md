# Post Registry Mismatch Report

## Summary
- **Total imports in postRegistry.js**: 202
- **Existing files**: 197
- **Missing files**: 5
- **Unregistered files**: 5

## Missing Files (Referenced in registry but don't exist)

### 1. Asian Flush Related Files
These files are referenced with "-original" suffix but the actual files don't have this suffix:

| Slug | Expected File | Actual File Exists |
|------|---------------|-------------------|
| `asian-flush-vs-alcohol-allergy-comparison` | `asian-flush-vs-alcohol-allergy-comparison-original.json` | `asian-flush-vs-alcohol-allergy-comparison.json` ✓ |
| `complete-guide-asian-flush-comprehensive` | `complete-guide-asian-flush-comprehensive-original.json` | `complete-guide-asian-flush-comprehensive.json` ✓ |
| `dhm-asian-flush-science-backed-solution` | `dhm-asian-flush-science-backed-solution-original.json` | `dhm-asian-flush-science-backed-solution.json` ✓ |

### 2. DHM Supplement Stack Guide
- **Slug**: `dhm-supplement-stack-guide-complete-combinations`
- **Expected**: `dhm-supplement-stack-guide-complete-combinations-backup.json`
- **Actual exists**: `dhm-supplement-stack-guide-complete-combinations.json` ✓

### 3. Flyby vs Fuller Health Comparison
- **Slug**: `flyby-vs-fuller-health-complete-comparison`
- **Expected**: `flyby-vs-fuller-health-complete-comparison-2025.json`
- **Actual exists**: `flyby-vs-fuller-health-complete-comparison.json` ✓

## Unregistered Files (Exist but not in registry)

These JSON files exist in the posts directory but are not registered:

1. `asian-flush-vs-alcohol-allergy-comparison.json`
2. `complete-guide-asian-flush-comprehensive.json`
3. `dhm-asian-flush-science-backed-solution.json`
4. `dhm-supplement-stack-guide-complete-combinations.json`
5. `flyby-vs-fuller-health-complete-comparison.json`

## Recommended Actions

### Fix Registry Imports
Update the following lines in `postRegistry.js`:

```javascript
// Line 45 - Change from:
"asian-flush-vs-alcohol-allergy-comparison": () => import("./posts/asian-flush-vs-alcohol-allergy-comparison-original.json"),
// To:
"asian-flush-vs-alcohol-allergy-comparison": () => import("./posts/asian-flush-vs-alcohol-allergy-comparison.json"),

// Line 64 - Change from:
"complete-guide-asian-flush-comprehensive": () => import("./posts/complete-guide-asian-flush-comprehensive-original.json"),
// To:
"complete-guide-asian-flush-comprehensive": () => import("./posts/complete-guide-asian-flush-comprehensive.json"),

// Line 71 - Change from:
"dhm-asian-flush-science-backed-solution": () => import("./posts/dhm-asian-flush-science-backed-solution-original.json"),
// To:
"dhm-asian-flush-science-backed-solution": () => import("./posts/dhm-asian-flush-science-backed-solution.json"),

// Line 80 - Change from:
"dhm-supplement-stack-guide-complete-combinations": () => import("./posts/dhm-supplement-stack-guide-complete-combinations-backup.json"),
// To:
"dhm-supplement-stack-guide-complete-combinations": () => import("./posts/dhm-supplement-stack-guide-complete-combinations.json"),

// Line 110 - Change from:
"flyby-vs-fuller-health-complete-comparison": () => import("./posts/flyby-vs-fuller-health-complete-comparison-2025.json"),
// To:
"flyby-vs-fuller-health-complete-comparison": () => import("./posts/flyby-vs-fuller-health-complete-comparison.json"),
```

## Additional Findings

- Found backup files: `dhm-supplement-stack-guide-complete-combinations.json.backup` and `complete-guide-hangover-types-2025.json.bak`
- Found non-post files in posts directory: `index.js`, `crosslink-summary.md`

## Script Output

The verification script (`check-post-registry.js`) has been created and can be run anytime to verify registry integrity:

```bash
node check-post-registry.js
```

This will check all imports and report any mismatches.