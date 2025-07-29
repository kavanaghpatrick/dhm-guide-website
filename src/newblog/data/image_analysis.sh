#!/bin/bash

# Script to analyze image path mismatches
METADATA_FILE="/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/metadata/index.json"
IMAGES_DIR="/Users/patrickkavanagh/dhm-guide-website/public/images"

echo "=== IMAGE PATH ANALYSIS ==="
echo "Date: $(date)"
echo ""

echo "1. SYSTEMATIC PATTERN ISSUES:"
echo "=============================="

# Get all missing images
echo "Missing images with suggested fixes:"
grep '"image":' "$METADATA_FILE" | sed 's/.*"image": "\/images\///; s/",.*$//' | while read img; do
    if [ ! -f "$IMAGES_DIR/$img" ]; then
        echo "MISSING: $img"
        
        # Try to find the correct filename using different strategies
        
        # Strategy 1: Remove long descriptive parts
        corrected=$(echo "$img" | sed 's/-complete-.*-2025-hero\.webp$/-hero.webp/')
        corrected=$(echo "$corrected" | sed 's/-advanced-.*-2025-hero\.webp$/-hero.webp/')
        corrected=$(echo "$corrected" | sed 's/-high-.*-2025-hero\.webp$/-hero.webp/')
        corrected=$(echo "$corrected" | sed 's/-sport-.*-2025-hero\.webp$/-hero.webp/')
        corrected=$(echo "$corrected" | sed 's/-comprehensive-.*-2025-hero\.webp$/-hero.webp/')
        
        # Special case: pregnant-women-and-alcohol -> pregnant-women-alcohol
        corrected=$(echo "$corrected" | sed 's/pregnant-women-and-alcohol/pregnant-women-alcohol/')
        
        # Strategy 2: Remove blog/ prefix
        if [[ "$img" == blog/* ]]; then
            no_blog=$(echo "$img" | sed 's/^blog\///')
            # Try to find webp version instead of jpg
            webp_version=$(echo "$no_blog" | sed 's/\.jpg$/.webp/')
            if [ -f "$IMAGES_DIR/$webp_version" ]; then
                echo "  → FOUND: $webp_version (remove blog/ prefix and change to .webp)"
            elif [ -f "$IMAGES_DIR/$no_blog" ]; then
                echo "  → FOUND: $no_blog (remove blog/ prefix)"
            else
                echo "  → NO MATCH for blog/ prefix removal"
            fi
        else
            # Try the corrected version
            if [ -f "$IMAGES_DIR/$corrected" ]; then
                echo "  → FOUND: $corrected"
            else
                # Try to find by keyword matching
                keywords=$(echo "$img" | cut -d'-' -f1-3)
                match=$(ls "$IMAGES_DIR" | grep "^$keywords" | head -1)
                if [ -n "$match" ]; then
                    echo "  → POSSIBLE: $match"
                else
                    echo "  → NO MATCH FOUND"
                fi
            fi
        fi
        echo ""
    fi
done

echo ""
echo "2. STATISTICS:"
echo "=============="
total_images=$(grep '"image":' "$METADATA_FILE" | wc -l)
missing_images=$(grep '"image":' "$METADATA_FILE" | sed 's/.*"image": "\/images\///; s/",.*$//' | while read img; do if [ ! -f "$IMAGES_DIR/$img" ]; then echo "1"; fi; done | wc -l)

echo "Total images in metadata: $total_images"
echo "Missing images: $missing_images"
echo "Percentage missing: $(echo "scale=2; $missing_images * 100 / $total_images" | bc)%"