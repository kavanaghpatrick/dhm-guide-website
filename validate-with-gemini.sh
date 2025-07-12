#!/bin/bash

# Validate Structured Data with Gemini CLI
# This script checks if the Product schema is properly implemented

echo "🤖 Using Gemini CLI to validate structured data implementation..."
echo ""

# Test URLs
URLS=(
  "https://www.dhmguide.com/never-hungover/dhm-depot-review-2025"
  "https://www.dhmguide.com/never-hungover/flyby-recovery-review-2025"
  "https://www.dhmguide.com/never-hungover/no-days-wasted-vs-cheers-restore-dhm-comparison-2025"
)

# Create a prompt for Gemini to analyze the structured data
PROMPT="Please analyze the structured data (JSON-LD) on this webpage and validate:

1. Is there a Product schema present?
2. Does the Product schema include:
   - Product name and brand
   - AggregateRating with ratingValue and reviewCount
   - Offers with price and availability
   - Proper @context and @type declarations
3. Is the structured data valid according to Google's requirements?
4. Would this qualify for rich snippets in Google Search?

Provide a brief summary of findings and any issues that need to be fixed."

echo "Testing the following URLs:"
for URL in "${URLS[@]}"; do
  echo "- $URL"
done
echo ""

# Run Gemini validation for each URL
for URL in "${URLS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Validating: $URL"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Use Gemini to fetch and analyze the page
  gemini "$PROMPT" "$URL"
  
  echo ""
  echo ""
done

echo "✅ Validation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Fix any issues identified by Gemini"
echo "2. Test with Google's Rich Results Test: https://search.google.com/test/rich-results"
echo "3. Monitor Search Console for rich snippet eligibility"
echo "4. Track CTR improvements over the next 2-4 weeks"