#!/usr/bin/env python3
import json
import os
from collections import defaultdict

def analyze_specific_issues():
    """
    Detailed analysis of specific issues found in blog posts.
    """
    posts_dir = "/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts"
    
    # Categorize issues
    issue_categories = {
        'missing_fields': [],
        'content_format_errors': [],
        'image_missing': [],
        'slug_mismatches': [],
        'incomplete_content': [],
        'format_issues': []
    }
    
    # Files with severe issues
    severely_broken = []
    
    # Get all S-Z files
    all_files = []
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json') and filename[0].lower() in 'stuvwxyz':
            all_files.append(os.path.join(posts_dir, filename))
    
    for filepath in all_files:
        filename = os.path.basename(filepath)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except:
            severely_broken.append(filename)
            continue
        
        # Check for missing core fields
        required_fields = ['id', 'title', 'slug', 'excerpt', 'date', 'author', 'tags', 'image', 'readTime', 'content']
        missing_count = 0
        for field in required_fields:
            if field not in data or not data[field]:
                missing_count += 1
        
        if missing_count >= 4:  # Severely incomplete
            severely_broken.append((filename, f"Missing {missing_count} required fields"))
        
        # Content format issues
        if 'content' in data and not isinstance(data['content'], str):
            issue_categories['content_format_errors'].append((filename, type(data['content']).__name__))
        
        # Image missing
        if 'image' in data:
            image_path = data['image']
            full_image_path = f"/Users/patrickkavanagh/dhm-guide-website/public{image_path}"
            if not os.path.exists(full_image_path):
                issue_categories['image_missing'].append((filename, image_path))
        
        # Slug mismatches
        if 'slug' in data and 'id' in data:
            if data['slug'] != data['id']:
                issue_categories['slug_mismatches'].append((filename, data['slug'], data['id']))
        
        # Incomplete content
        if 'content' in data and isinstance(data['content'], str):
            if len(data['content']) < 500 or 'being updated' in data['content'].lower():
                issue_categories['incomplete_content'].append((filename, len(data['content'])))
    
    return issue_categories, severely_broken

def main():
    print("DETAILED BLOG POST QUALITY CONTROL ANALYSIS")
    print("=" * 60)
    
    issues, broken = analyze_specific_issues()
    
    print("\n🚨 SEVERELY BROKEN FILES:")
    print("-" * 40)
    for item in broken:
        if isinstance(item, tuple):
            print(f"❌ {item[0]} - {item[1]}")
        else:
            print(f"❌ {item} - JSON parsing failed")
    
    print(f"\n📊 CONTENT FORMAT ERRORS ({len(issues['content_format_errors'])}):")
    print("-" * 40)
    for filename, content_type in issues['content_format_errors']:
        print(f"⚠️  {filename} - Content is {content_type}, should be string")
    
    print(f"\n🖼️  MISSING IMAGES ({len(issues['image_missing'])}):")
    print("-" * 40)
    for filename, image_path in issues['image_missing']:
        print(f"📷 {filename} - Missing: {image_path}")
    
    print(f"\n🔗 SLUG MISMATCHES ({len(issues['slug_mismatches'])}):")
    print("-" * 40)
    for filename, slug, id_field in issues['slug_mismatches']:
        print(f"🏷️  {filename}")
        print(f"   Slug: '{slug}'")
        print(f"   ID:   '{id_field}'")
        print()
    
    print(f"\n📝 INCOMPLETE CONTENT ({len(issues['incomplete_content'])}):")
    print("-" * 40)
    for filename, length in issues['incomplete_content']:
        print(f"📄 {filename} - Only {length} characters")
    
    # Recommendations
    print("\n💡 PRIORITY RECOMMENDATIONS:")
    print("-" * 40)
    print("1. URGENT: Fix severely broken files (missing core fields)")
    print("2. HIGH: Convert list content to string format")
    print("3. HIGH: Create missing hero images")
    print("4. MEDIUM: Fix slug/ID mismatches")
    print("5. LOW: Complete placeholder content")
    
    print(f"\n📈 SUMMARY STATISTICS:")
    total_issues = sum(len(category) for category in issues.values()) + len(broken)
    print(f"- Total files with severe issues: {len(broken)}")
    print(f"- Total categorized issues: {sum(len(category) for category in issues.values())}")
    print(f"- Most common issue: Content format errors ({len(issues['content_format_errors'])})")
    print(f"- Files needing immediate attention: {len(broken) + len(issues['content_format_errors'])}")

if __name__ == "__main__":
    main()