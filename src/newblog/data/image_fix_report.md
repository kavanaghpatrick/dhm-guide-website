# Image Path Analysis Report

**Date:** July 29, 2025  
**Analysis of:** `/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/metadata/index.json`

## Executive Summary

Found **77 out of 119 image paths (64.7%)** in the metadata that don't match actual files in `public/images/`. This indicates a systematic issue with image path generation.

## Issue Categories

### 1. Long Descriptive Paths Pattern
**Issue:** Metadata contains overly long, descriptive filenames that don't match the actual shorter filenames.

**Examples:**
- `rum-health-analysis-complete-spirits-impact-study-2025-hero.webp` → `rum-health-analysis-hero.webp`
- `alcohol-pharmacokinetics-advanced-absorption-science-2025-hero.webp` → `alcohol-pharmacokinetics-hero.webp`
- `altitude-alcohol-high-elevation-drinking-safety-2025-hero.webp` → `altitude-alcohol-hero.webp`
- `pregnant-women-and-alcohol-complete-fetal-impact-guide-2025-hero.webp` → `pregnant-women-alcohol-hero.webp`
- `athletes-alcohol-sport-specific-performance-guide-2025-hero.webp` → `athletes-alcohol-hero.webp`

**Pattern:** The metadata paths contain descriptive phrases like "-complete-", "-advanced-", "-high-elevation-", "-fetal-impact-", "-sport-specific-" etc. that are removed in the actual filenames.

### 2. Blog/ Directory Prefix Issue
**Issue:** Some metadata entries include a "blog/" directory prefix that doesn't exist in the actual file structure.

**Examples:**
- `blog/alcohol-digestive-health-guide.jpg` → `alcohol-digestive-health-hero.webp`
- `blog/smart-social-drinking.jpg` → `smart-social-drinking-hero.webp`
- `blog/alcohol-work-performance.jpg` → `alcohol-work-performance-hero.webp`

**Pattern:** Files have "blog/" prefix in metadata but actual files are in root of images/ directory, also with "-hero" suffix and .webp extension instead of .jpg.

### 3. File Extension Issues
**Issue:** Metadata specifies .jpg extensions but actual files are .webp

**Pattern:** Many files in metadata have .jpg extensions but the actual files are .webp format.

### 4. Missing "-hero" Suffix
**Issue:** Some metadata paths don't include the "-hero" suffix that exists in actual filenames.

## Systematic Root Cause

The image path generation appears to be using the full post slug/title for the filename, but the actual image files were created with:
1. Shortened, simplified names
2. Consistent "-hero" suffix
3. .webp format (not .jpg)
4. No subdirectory structure (no "blog/" prefix)

## High-Priority Fixes Needed

### Confirmed Long Path Issues (5 posts):
1. `rum-health-analysis-complete-spirits-impact-study-2025` 
2. `alcohol-pharmacokinetics-advanced-absorption-science-2025`
3. `altitude-alcohol-high-elevation-drinking-safety-2025`
4. `pregnant-women-and-alcohol-complete-fetal-impact-guide-2025`
5. `athletes-alcohol-sport-specific-performance-guide-2025`

### Blog/ Prefix Issues (9+ posts):
All posts with `"image": "/images/blog/..."` need to be corrected to remove the blog/ prefix and update extensions.

## Recommendation

1. **Immediate Fix:** Correct the 77 mismatched image paths in metadata/index.json
2. **Root Cause Fix:** Update the image path generation logic to match the actual file naming convention
3. **Validation:** Implement a check to verify image paths exist before adding to metadata

## Next Steps

The specific posts that need fixing are identifiable by searching the metadata for:
- Paths containing multiple descriptive hyphens
- Paths with "blog/" prefix  
- Paths with .jpg extensions that should be .webp
- Paths missing the "-hero" suffix