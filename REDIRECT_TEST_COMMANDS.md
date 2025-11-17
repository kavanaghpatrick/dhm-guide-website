# Redirect Rules - Test Commands (Reproducible)

This document contains all curl commands used to test the redirect rules. Any developer can reproduce these tests at any time.

**Test Date:** November 7, 2025
**Test Time:** 01:07-01:08 UTC
**Website:** https://www.dhmguide.com

---

## How to Run Tests

```bash
# Run individual test
curl -I -L "https://www.dhmguide.com/blog/activated-charcoal-hangover"

# Run all tests (using bash parallel)
bash redirect_test_all.sh  # See script below
```

---

## Individual Test Commands

### Test 1: /blog/activated-charcoal-hangover redirect

**Rule:** _redirects line 12
**Purpose:** Test if /blog/* redirects work
**Command:**
```bash
curl -I -L "https://www.dhmguide.com/blog/activated-charcoal-hangover"
```

**Expected:** 308 → 200 (redirect to /never-hungover/activated-charcoal-hangover)
**Actual:** WORKS (via vercel.json, not _redirects)

**Verbose output:**
```bash
curl -v -L "https://www.dhmguide.com/blog/activated-charcoal-hangover"
```

---

### Test 2: Non-www domain redirect (HTTPS)

**Rule:** _redirects line 6
**Purpose:** Test if https://dhmguide.com/* redirects to www
**Command:**
```bash
curl -I -L "https://dhmguide.com/never-hungover/activated-charcoal-hangover"
```

**Expected:** 307 → 200 (domain + path redirect)
**Actual:** WORKS (via platform, not _redirects)

**Verbose output:**
```bash
curl -v -L "https://dhmguide.com/never-hungover/activated-charcoal-hangover"
```

---

### Test 3: Non-www domain redirect (HTTP)

**Rule:** _redirects line 5
**Purpose:** Test if http://dhmguide.com/* redirects
**Command:**
```bash
curl -I -L "http://dhmguide.com/blog/dhm-science-explained"
```

**Expected:** 308 (HTTP→HTTPS) → 307 (non-www→www) → 308 (/blog/*) → 200
**Actual:** Chain works but _redirects not involved

**Note:** HTTP upgrade to HTTPS happens at platform level before _redirects is evaluated.

---

### Test 4: Root-level slug redirect

**Rule:** _redirects line 13
**Purpose:** Test if /activated-charcoal-hangover (without /blog/) redirects
**Command:**
```bash
curl -I -L "https://www.dhmguide.com/activated-charcoal-hangover"
```

**Expected:** 301 → 200 (redirect to /never-hungover/activated-charcoal-hangover)
**Actual:** 200 OK (rewritten to index.html, NO redirect)
**Status:** BROKEN - _redirects rule completely ignored

**Verbose output:**
```bash
curl -v -L "https://www.dhmguide.com/activated-charcoal-hangover" 2>&1 | grep -E "HTTP|Location|filename"
```

---

### Test 5: Another root-level slug

**Rule:** _redirects line 187
**Purpose:** Test another root-level redirect
**Command:**
```bash
curl -I -L "https://www.dhmguide.com/longevity-biohacking-dhm-liver-protection"
```

**Expected:** 301 → 200 (redirect to /never-hungover/longevity-biohacking-dhm-liver-protection)
**Actual:** 200 OK (rewritten to index.html)
**Status:** BROKEN - same as Test 4

---

### Test 6: Soft 404 fix redirect

**Rule:** _redirects line 8
**Purpose:** Test if soft 404 fixes work
**Command:**
```bash
curl -I -L "https://www.dhmguide.com/blog/longevity-biohacking-2025-dhm-liver-protection"
```

**Expected:** 308 (/blog/* redirect) → 301 (soft 404 fix) → 200
**Actual:** 308 → 404 (soft 404 fix doesn't work)
**Status:** BROKEN - _redirects soft 404 rule ignored

**Breaking down the chain:**
```bash
# First request goes to /blog/*
curl -I "https://www.dhmguide.com/blog/longevity-biohacking-2025-dhm-liver-protection"
# Response: 308 Location: /never-hungover/longevity-biohacking-2025-dhm-liver-protection

# Second request to redirected URL
curl -I "https://www.dhmguide.com/never-hungover/longevity-biohacking-2025-dhm-liver-protection"
# Response: 404 NOT FOUND
# Expected: 301 to /never-hungover/longevity-biohacking-dhm-liver-protection (but _redirects rule ignored)
```

---

### Test 7: /blog/* with date slug (verification)

**Rule:** _redirects line 58
**Purpose:** Verify /blog/* pattern works
**Command:**
```bash
curl -I -L "https://www.dhmguide.com/blog/dhm-dosage-guide-2025"
```

**Expected:** 308 → 200 (redirect to /never-hungover/dhm-dosage-guide-2025)
**Actual:** WORKS

---

## Additional Manual Tests

### Check that _redirects file exists but isn't used

```bash
# Verify the file exists
ls -lh public/_redirects

# Check its size
wc -l public/_redirects  # Should be 264 lines

# View first 20 lines
head -20 public/_redirects

# Grep for specific rules
grep "activated-charcoal-hangover" public/_redirects
```

---

### Verify vercel.json is being used

```bash
# Check vercel.json exists
ls -lh vercel.json

# View the active redirects
cat vercel.json | jq '.redirects'

# Count total rules
cat vercel.json | jq '.redirects | length'
```

---

### Get detailed HTTP headers

To see all HTTP headers (helpful for debugging):

```bash
# Test 1: Show all headers
curl -v "https://www.dhmguide.com/blog/activated-charcoal-hangover" 2>&1 | head -30

# Test 3: Show redirect chain
curl -v -L "https://www.dhmguide.com/activated-charcoal-hangover" 2>&1 | grep -E "^<|^>|HTTP"

# Test 6: Show 404 error
curl -v "https://www.dhmguide.com/never-hungover/longevity-biohacking-2025-dhm-liver-protection" 2>&1 | head -20
```

---

## Batch Test Script

Save this as `redirect_test_all.sh`:

```bash
#!/bin/bash

echo "======================================"
echo "Redirect Rules Test - Batch Execution"
echo "======================================"
echo "Date: $(date)"
echo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test redirect
test_redirect() {
    local test_num=$1
    local url=$2
    local rule=$3
    local expected=$4

    echo -e "${YELLOW}Test $test_num: $url${NC}"
    echo "Rule: _redirects $rule"
    echo "Expected: $expected"
    echo "Response:"
    curl -s -I -L "$url" | head -3
    echo
}

# Run all tests
test_redirect 1 \
    "https://www.dhmguide.com/blog/activated-charcoal-hangover" \
    "line 12" \
    "308 → 200 (via vercel.json)"

test_redirect 2 \
    "https://dhmguide.com/never-hungover/activated-charcoal-hangover" \
    "line 6" \
    "307 → 200 (platform handles)"

test_redirect 3 \
    "https://www.dhmguide.com/activated-charcoal-hangover" \
    "line 13" \
    "301 → 200 (BROKEN - returns 200 OK to home page)"

test_redirect 4 \
    "https://www.dhmguide.com/blog/dhm-dosage-guide-2025" \
    "line 58" \
    "308 → 200 (via vercel.json)"

test_redirect 5 \
    "https://www.dhmguide.com/longevity-biohacking-dhm-liver-protection" \
    "line 187" \
    "301 → 200 (BROKEN - returns 200 OK to home page)"

test_redirect 6 \
    "https://www.dhmguide.com/blog/longevity-biohacking-2025-dhm-liver-protection" \
    "line 8" \
    "308 → 301 → 200 (BROKEN - returns 404)"

echo "======================================"
echo "Test Complete"
echo "======================================"
```

**Run the script:**
```bash
chmod +x redirect_test_all.sh
./redirect_test_all.sh
```

---

## Curl Tips & Tricks

### Follow redirects and show status codes
```bash
curl -L -w "\nStatus: %{http_code}\n" "https://www.dhmguide.com/blog/test"
```

### Show redirect location without following
```bash
curl -I "https://www.dhmguide.com/blog/test" | grep -i location
```

### Test multiple URLs in sequence
```bash
for url in \
    "https://www.dhmguide.com/blog/activated-charcoal-hangover" \
    "https://www.dhmguide.com/activated-charcoal-hangover" \
    "https://www.dhmguide.com/longevity-biohacking-dhm-liver-protection"
do
    echo "Testing: $url"
    curl -s -o /dev/null -w "Status: %{http_code}\n" "$url"
done
```

### Check redirect chain step-by-step
```bash
curl -v -L "https://www.dhmguide.com/blog/test" 2>&1 | grep -E "< HTTP|< Location"
```

### Measure redirect time
```bash
curl -w "Time: %{time_total}s\n" "https://www.dhmguide.com/blog/test"
```

---

## What to Look For

When running tests, look for these indicators that _redirects is NOT being used:

1. **HTTP Status Codes:**
   - _redirects specifies 301, but results show 308 (Vercel format)
   - This indicates vercel.json is handling it instead

2. **Response Headers:**
   - Look for `x-vercel-id` header (proves Vercel is responding)
   - If using _redirects, would use different redirect mechanism

3. **Content Served:**
   - If root-level URL returns 200 OK with `filename="index.html"`, that's a rewrite (not a _redirects redirect)
   - _redirects redirects would change the HTTP status code

4. **Location Header:**
   - `Location: /never-hungover/...` with status 308 = vercel.json
   - _redirects would use 301 or 302

---

## Regression Testing

To verify nothing broke in the future, periodically run:

```bash
# Quick sanity check
curl -I -L "https://www.dhmguide.com/blog/test-post" | grep -E "HTTP|Location"

# Full test suite
./redirect_test_all.sh

# Check for 404s on common posts
for post in activated-charcoal-hangover longevity-biohacking-dhm-liver-protection dhm-dosage-guide-2025
do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.dhmguide.com/never-hungover/$post")
    echo "$post: $status"
done
```

---

## Monitoring Tools

Use these to track redirect health over time:

### Google Search Console
1. Go to https://search.google.com/search-console
2. Check "Coverage" for redirect errors
3. Look for "Crawled - currently not indexed" (soft 404 indicator)

### Vercel Analytics
1. Log in to Vercel dashboard
2. Check deployment analytics for redirect performance
3. Monitor 301/308 redirect rates

### Command-line monitoring
```bash
# Watch for 404s
curl -s "https://www.dhmguide.com/activated-charcoal-hangover" | grep -q "404" && echo "BROKEN" || echo "OK"

# Compare old vs new URL
echo "Old URL:"; curl -I "https://www.dhmguide.com/activated-charcoal-hangover" | head -1
echo "New URL:"; curl -I "https://www.dhmguide.com/never-hungover/activated-charcoal-hangover" | head -1
```

---

## File Locations for Testing

```bash
# These files are in the project root:
/Users/patrickkavanagh/dhm-guide-website/public/_redirects
/Users/patrickkavanagh/dhm-guide-website/vercel.json

# Test reports created:
/Users/patrickkavanagh/dhm-guide-website/REDIRECT_RULES_TEST_REPORT.md
/Users/patrickkavanagh/dhm-guide-website/REDIRECT_COMPARISON.md
/Users/patrickkavanagh/dhm-guide-website/REDIRECT_TEST_EVIDENCE.md
/Users/patrickkavanagh/dhm-guide-website/REDIRECT_FINDINGS_EXECUTIVE_SUMMARY.md
/Users/patrickkavanagh/dhm-guide-website/REDIRECT_TEST_COMMANDS.md
```

---

## Troubleshooting Test Issues

### If curl isn't installed
```bash
brew install curl  # macOS
apt-get install curl  # Linux
```

### If you get SSL certificate errors
```bash
# Disable SSL verification (not recommended for production)
curl -k -I "https://www.dhmguide.com/blog/test"
```

### If you're behind a proxy
```bash
curl -x "proxy.example.com:8080" "https://www.dhmguide.com/blog/test"
```

### If you want to test locally
1. Start the Vercel dev server: `vercel dev`
2. Run tests against localhost: `curl -I "http://localhost:3000/blog/test"`
3. Compare with production results

---

## Final Verification Checklist

Run this checklist periodically to verify redirect behavior:

- [ ] `/blog/test` → `/never-hungover/test` (working via vercel.json)
- [ ] `/test` (root level) → rewrites to index.html (expected behavior with vercel.json)
- [ ] `https://dhmguide.com/...` → `https://www.dhmguide.com/...` (working via platform)
- [ ] HTTP response codes for /blog/* are 308 (Vercel format, not 301 from _redirects)
- [ ] _redirects file still exists but unused (ready for deletion)
- [ ] No 404s on live post URLs
- [ ] Google Search Console shows no excessive redirect errors

---

## Summary

These test commands prove that:
1. _redirects file is completely ignored
2. vercel.json rules are in effect
3. Root-level redirects are broken
4. Tests can be reproduced at any time

Run any of these commands to verify the current state of redirects on the live site.
