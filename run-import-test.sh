#!/bin/bash

# Import Resolution Test Runner
# This script provides easy access to test the import resolution

echo "🔍 DHM Guide Website - Import Resolution Test"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    exit 1
fi

echo "📋 Available Test Options:"
echo ""
echo "1. File System Diagnostic  - Check if all image files exist"
echo "2. Build Test              - Test Vite import processing"
echo "3. Development Server      - Start dev server to test imports live"
echo "4. Browser Test            - Open test page in browser"
echo ""
echo "Choose an option (1-4) or press Enter to see instructions:"
read -r choice

case $choice in
    1)
        echo "🔍 Running file system diagnostic..."
        node test-import-resolution.js
        ;;
    2)
        echo "🏗️ Running build test..."
        node test-build-imports.js
        ;;
    3)
        echo "🚀 Starting development server..."
        echo "Once started, visit: http://localhost:5173/test-imports"
        echo "Press Ctrl+C to stop the server"
        npm run dev
        ;;
    4)
        echo "🌐 Opening browser test..."
        if command -v open &> /dev/null; then
            # macOS
            open "http://localhost:5173/test-imports"
        elif command -v xdg-open &> /dev/null; then
            # Linux
            xdg-open "http://localhost:5173/test-imports"
        else
            echo "Please manually open: http://localhost:5173/test-imports"
        fi
        ;;
    *)
        echo ""
        echo "📚 How to Test Import Resolution:"
        echo ""
        echo "1. Start the development server:"
        echo "   npm run dev"
        echo ""
        echo "2. Open your browser to:"
        echo "   http://localhost:5173/test-imports"
        echo ""
        echo "3. Check the browser console and network tab for:"
        echo "   • Image load success/failure"
        echo "   • 404 errors for missing files"
        echo "   • SrcSet generation issues"
        echo ""
        echo "4. Compare behavior between Original and Fixed components"
        echo ""
        echo "📁 Test Files Created:"
        echo "   • /test-imports - Live test page in browser"
        echo "   • import-resolution-report.md - Diagnostic findings"
        echo "   • ResponsiveImageFixed.jsx - Improved component"
        echo ""
        echo "🔧 Quick Fix:"
        echo "Replace ResponsiveImage imports with ResponsiveImageFixed"
        echo "to handle Vite-processed imports correctly."
        ;;
esac