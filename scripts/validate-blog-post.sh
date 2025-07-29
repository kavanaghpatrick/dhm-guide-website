#!/bin/bash
# DHM Guide Blog Post Validator
# Usage: ./validate-blog-post.sh <slug>

SLUG=$1

if [ -z "$SLUG" ]; then
    echo "Usage: ./validate-blog-post.sh <slug>"
    echo "Example: ./validate-blog-post.sh dhm-dosage-guide-2025"
    exit 1
fi

echo "🔍 Validating blog post: $SLUG"
echo "================================"

ERRORS=0

# Check JSON file exists
echo -n "Checking JSON file exists... "
if [ ! -f "src/newblog/data/posts/$SLUG.json" ]; then
    echo "❌ NOT FOUND"
    echo "  Expected: src/newblog/data/posts/$SLUG.json"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found"
    
    # Check JSON is valid
    echo -n "Checking JSON syntax... "
    python3 -m json.tool "src/newblog/data/posts/$SLUG.json" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ INVALID"
        echo "  Run: python3 -m json.tool src/newblog/data/posts/$SLUG.json"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Valid"
        
        # Check slug matches in JSON
        echo -n "Checking slug consistency in JSON... "
        JSON_SLUG=$(python3 -c "import json; print(json.load(open('src/newblog/data/posts/$SLUG.json'))['slug'])" 2>/dev/null)
        if [ "$JSON_SLUG" != "$SLUG" ]; then
            echo "❌ MISMATCH"
            echo "  File slug: $SLUG"
            echo "  JSON slug: $JSON_SLUG"
            ERRORS=$((ERRORS + 1))
        else
            echo "✅ Matches"
        fi
        
        # Extract and check image
        IMAGE=$(python3 -c "import json; data=json.load(open('src/newblog/data/posts/$SLUG.json')); print(data.get('image', ''))" 2>/dev/null)
        if [ ! -z "$IMAGE" ]; then
            echo -n "Checking hero image exists... "
            if [ ! -f "public$IMAGE" ]; then
                echo "❌ NOT FOUND"
                echo "  Expected: public$IMAGE"
                ERRORS=$((ERRORS + 1))
            else
                echo "✅ Found"
                
                # Check image size
                IMAGE_SIZE=$(du -h "public$IMAGE" | cut -f1)
                echo "  Image size: $IMAGE_SIZE"
            fi
        fi
    fi
fi

# Check registry entry
echo -n "Checking postRegistry.js entry... "
grep -q "'$SLUG':" src/newblog/data/postRegistry.js
if [ $? -ne 0 ]; then
    echo "❌ MISSING"
    echo "  Add: '$SLUG': () => import('./posts/$SLUG.json'),"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found"
fi

# Check metadata entry
echo -n "Checking metadata/index.json entry... "
python3 -c "
import json
metadata = json.load(open('src/newblog/data/metadata/index.json'))
slugs = [m.get('slug', m.get('id', '')) for m in metadata]
exit(0 if '$SLUG' in slugs else 1)
" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ MISSING"
    echo "  Add metadata entry for: $SLUG"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Found"
fi

# Check sitemap entry
echo -n "Checking sitemap.xml entry... "
if [ -f "public/sitemap.xml" ]; then
    grep -q "never-hungover/$SLUG</loc>" public/sitemap.xml
    if [ $? -ne 0 ]; then
        echo "⚠️  Not in sitemap"
        echo "  Run: node scripts/generate-sitemap.js"
    else
        echo "✅ Found"
    fi
else
    echo "⚠️  Sitemap not found"
fi

echo "================================"

if [ $ERRORS -eq 0 ]; then
    echo "✅ All validation checks passed!"
    echo ""
    echo "Blog post URL will be:"
    echo "https://www.dhmguide.com/never-hungover/$SLUG"
else
    echo "❌ Found $ERRORS validation error(s)"
    echo ""
    echo "Please fix the errors above before publishing."
    exit 1
fi