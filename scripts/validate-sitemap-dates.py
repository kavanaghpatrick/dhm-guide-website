#!/usr/bin/env python3
"""
Validate and fix date formats in blog posts and sitemap
Ensures all dates are in ISO 8601 format (YYYY-MM-DD)
"""

import json
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime

def is_valid_iso_date(date_str):
    """Check if date string is in valid ISO format (YYYY-MM-DD)"""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def parse_natural_date(date_str):
    """Try to parse natural language date and convert to ISO format"""
    # Common date formats to try
    formats = [
        '%B %d, %Y',     # July 28, 2025
        '%b %d, %Y',     # Jul 28, 2025
        '%m/%d/%Y',      # 07/28/2025
        '%d/%m/%Y',      # 28/07/2025
        '%Y/%m/%d',      # 2025/07/28
        '%d-%m-%Y',      # 28-07-2025
        '%d.%m.%Y',      # 28.07.2025
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None

def validate_json_dates(posts_dir):
    """Validate and fix dates in all JSON post files"""
    issues = []
    fixed = []
    
    posts_path = Path(posts_dir)
    for json_file in posts_path.glob('*.json'):
        # Skip backup files
        if any(suffix in json_file.name for suffix in ['.bak', '.backup', '.tmp', '-backup', '-enhanced', '-original']):
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'date' in data and not is_valid_iso_date(data['date']):
                old_date = data['date']
                new_date = parse_natural_date(old_date)
                
                if new_date:
                    data['date'] = new_date
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    fixed.append({
                        'file': json_file.name,
                        'old': old_date,
                        'new': new_date
                    })
                else:
                    issues.append({
                        'file': json_file.name,
                        'date': old_date,
                        'error': 'Could not parse date format'
                    })
                    
        except Exception as e:
            issues.append({
                'file': json_file.name,
                'error': str(e)
            })
    
    return issues, fixed

def validate_sitemap_dates(sitemap_path):
    """Validate dates in sitemap.xml"""
    issues = []
    
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        
        # Handle namespace
        ns = {'': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        for i, url in enumerate(root.findall('url', ns)):
            lastmod = url.find('lastmod', ns)
            if lastmod is not None and lastmod.text:
                if not is_valid_iso_date(lastmod.text):
                    # Try to find line number (approximate)
                    line_num = (i * 6) + 10  # Rough estimate based on XML structure
                    issues.append({
                        'line': line_num,
                        'url': url.find('loc', ns).text if url.find('loc', ns) is not None else 'Unknown',
                        'date': lastmod.text,
                        'error': 'Invalid date format'
                    })
    
    except Exception as e:
        issues.append({'error': f'Failed to parse sitemap: {str(e)}'})
    
    return issues

def main():
    print("🔍 Validating Blog Date Formats")
    print("================================\n")
    
    # Check if running from project root
    if not os.path.exists('src/newblog/data/posts'):
        print("❌ Error: Must run from project root directory")
        return 1
    
    # Validate JSON files
    print("📄 Checking blog post JSON files...")
    json_issues, json_fixed = validate_json_dates('src/newblog/data/posts')
    
    if json_fixed:
        print(f"\n✅ Fixed {len(json_fixed)} invalid dates in JSON files:")
        for fix in json_fixed:
            print(f"   - {fix['file']}: '{fix['old']}' → '{fix['new']}'")
    
    if json_issues:
        print(f"\n❌ Found {len(json_issues)} unresolvable issues in JSON files:")
        for issue in json_issues:
            print(f"   - {issue['file']}: {issue.get('error', issue.get('date'))}")
    
    # Validate sitemap
    print("\n📋 Checking sitemap.xml...")
    sitemap_path = 'public/sitemap.xml'
    
    if os.path.exists(sitemap_path):
        sitemap_issues = validate_sitemap_dates(sitemap_path)
        
        if sitemap_issues:
            print(f"\n❌ Found {len(sitemap_issues)} invalid dates in sitemap:")
            for issue in sitemap_issues:
                if 'line' in issue:
                    print(f"   - Line ~{issue['line']}: '{issue['date']}' (URL: {issue['url']})")
                else:
                    print(f"   - {issue['error']}")
            print("\n💡 Run 'node scripts/generate-sitemap.js' to regenerate sitemap with fixed dates")
        else:
            print("✅ All sitemap dates are valid!")
    else:
        print("⚠️  Sitemap not found at public/sitemap.xml")
    
    # Summary
    total_issues = len(json_issues) + (len(sitemap_issues) if 'sitemap_issues' in locals() else 0)
    total_fixed = len(json_fixed)
    
    print(f"\n📊 Summary:")
    print(f"   - Fixed: {total_fixed} date(s)")
    print(f"   - Remaining issues: {total_issues}")
    
    if total_fixed > 0:
        print("\n🔄 Next steps:")
        print("   1. Run: node scripts/generate-sitemap.js")
        print("   2. Commit the fixes")
    
    return 0 if total_issues == 0 else 1

if __name__ == "__main__":
    exit(main())