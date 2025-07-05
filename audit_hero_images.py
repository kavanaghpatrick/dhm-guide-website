#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

# Directory containing blog posts
posts_dir = Path("/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts")

# Patterns to detect hero images or image references in content
image_patterns = [
    r'hero[- _]?image',
    r'banner[- _]?image',
    r'featured[- _]?image',
    r'cover[- _]?image',
    r'main[- _]?image',
    r'header[- _]?image',
    r'<img\s+',
    r'!\[.*?\]\(.*?\)',  # Markdown image syntax
    r'src\s*=\s*["\'].*\.(jpg|jpeg|png|gif|webp|svg)',
    r'/images/',
    r'/assets/',
    r'image:\s*["\']',
    r'thumbnail:\s*["\']',
]

# Compile regex patterns
compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in image_patterns]

# Results
posts_missing_image_field = []
posts_with_image_field = []
posts_with_image_references = []

# Analyze each JSON file
for json_file in posts_dir.glob("*.json"):
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            post_data = json.load(f)
        
        # Check if 'image' field exists in metadata
        has_image_field = 'image' in post_data
        
        # Get content
        content = post_data.get('content', '')
        
        # Search for image references in content
        image_references = []
        for pattern in compiled_patterns:
            matches = pattern.findall(content)
            if matches:
                image_references.extend(matches)
        
        # Extract actual image paths from content
        image_paths = []
        # Look for markdown images
        md_images = re.findall(r'!\[.*?\]\((.*?)\)', content)
        image_paths.extend(md_images)
        
        # Look for HTML img src
        html_images = re.findall(r'<img[^>]+src\s*=\s*["\']([^"\']+)["\']', content, re.IGNORECASE)
        image_paths.extend(html_images)
        
        # Look for any other image references
        other_images = re.findall(r'(?:image|thumbnail|banner|hero|cover):\s*["\']([^"\']+)["\']', content, re.IGNORECASE)
        image_paths.extend(other_images)
        
        # Store results
        post_info = {
            'file': json_file.name,
            'title': post_data.get('title', 'Unknown'),
            'slug': post_data.get('slug', 'Unknown'),
            'has_image_field': has_image_field,
            'image_field_value': post_data.get('image', None),
            'has_image_references': len(image_references) > 0,
            'image_paths': list(set(image_paths))  # Unique paths
        }
        
        if has_image_field:
            posts_with_image_field.append(post_info)
        else:
            posts_missing_image_field.append(post_info)
        
        if len(image_references) > 0:
            posts_with_image_references.append(post_info)
    
    except Exception as e:
        print(f"Error processing {json_file.name}: {e}")

# Print results
print("=" * 80)
print("BLOG POST HERO IMAGE AUDIT RESULTS")
print("=" * 80)

print(f"\nTotal posts analyzed: {len(list(posts_dir.glob('*.json')))}")
print(f"Posts with 'image' field: {len(posts_with_image_field)}")
print(f"Posts missing 'image' field: {len(posts_missing_image_field)}")
print(f"Posts with image references in content: {len(posts_with_image_references)}")

print("\n" + "=" * 80)
print("POSTS MISSING 'IMAGE' FIELD BUT WITH IMAGE REFERENCES IN CONTENT:")
print("=" * 80)

missing_but_has_images = []
for post in posts_missing_image_field:
    if post['has_image_references'] or post['image_paths']:
        missing_but_has_images.append(post)

if missing_but_has_images:
    for i, post in enumerate(missing_but_has_images, 1):
        print(f"\n{i}. {post['title']}")
        print(f"   File: {post['file']}")
        print(f"   Slug: {post['slug']}")
        if post['image_paths']:
            print(f"   Image paths found in content:")
            for path in post['image_paths']:
                print(f"      - {path}")
else:
    print("\nNo posts found that are missing the 'image' field but have image references.")

print("\n" + "=" * 80)
print("ALL POSTS MISSING 'IMAGE' FIELD:")
print("=" * 80)

for i, post in enumerate(posts_missing_image_field, 1):
    print(f"{i}. {post['title']} ({post['file']})")

print("\n" + "=" * 80)
print("SUMMARY OF IMAGE PATHS FOUND IN CONTENT:")
print("=" * 80)

all_image_paths = set()
for post in posts_with_image_references:
    all_image_paths.update(post['image_paths'])

if all_image_paths:
    print("\nUnique image paths found across all posts:")
    for path in sorted(all_image_paths):
        print(f"  - {path}")
else:
    print("\nNo image paths found in post content.")