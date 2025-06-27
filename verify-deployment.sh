#!/bin/bash

# DHM Guide Website - Deployment Verification Script
# This script ensures all changes are properly committed and pushed to GitHub

echo "🔍 DHM Guide Deployment Verification"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the DHM Guide website directory"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
    echo "⚠️  WARNING: Uncommitted changes detected:"
    git status --short
    echo ""
    echo "🔧 Committing changes..."
    git add .
    read -p "Enter commit message: " commit_msg
    git commit -m "$commit_msg"
else
    echo "✅ Working tree is clean"
fi

# Check if we're ahead of remote
echo ""
echo "📡 Checking remote sync status..."
git fetch
ahead=$(git rev-list --count HEAD ^origin/main)
behind=$(git rev-list --count origin/main ^HEAD)

if [ "$ahead" -gt 0 ]; then
    echo "⚠️  WARNING: $ahead commits ahead of remote"
    echo "🚀 Pushing to GitHub..."
    git push
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub"
    else
        echo "❌ Failed to push to GitHub"
        exit 1
    fi
elif [ "$behind" -gt 0 ]; then
    echo "⚠️  WARNING: $behind commits behind remote"
    echo "🔄 Pulling from GitHub..."
    git pull
else
    echo "✅ In sync with remote"
fi

# Verify specific critical files
echo ""
echo "🔍 Verifying critical files..."

critical_files=(
    "src/App.jsx"
    "src/blog/components/BlogPost.jsx"
    "src/components/ui/button.jsx"
    "src/pages/Compare.jsx"
    "src/pages/Reviews.jsx"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        # Check if file has React import (for JSX files)
        if [[ "$file" == *.jsx ]]; then
            if grep -q "import React" "$file"; then
                echo "✅ $file - React import present"
            else
                echo "⚠️  $file - Missing React import"
            fi
        else
            echo "✅ $file - Present"
        fi
    else
        echo "❌ $file - Missing"
    fi
done

# Show latest commit info
echo ""
echo "📝 Latest commit information:"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Message: $(git log -1 --pretty=%B)"
echo "Author: $(git log -1 --pretty=%an)"
echo "Date: $(git log -1 --pretty=%ad --date=short)"

# Show remote URL (without token)
echo ""
echo "🌐 Remote repository:"
remote_url=$(git remote get-url origin | sed 's/ghp_[^@]*@/***@/')
echo "$remote_url"

echo ""
echo "✅ Deployment verification complete!"
echo "🚀 Changes should be live on Vercel within 5-10 minutes"

