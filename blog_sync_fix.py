#!/usr/bin/env python3
"""
Blog System Synchronization Fix
Resolves discrepancies between post files, registry, and metadata
"""

import json
import os
import re
from pathlib import Path

def get_post_files():
    """Get all actual post JSON files"""
    posts_dir = Path("src/newblog/data/posts")
    files = []
    for f in posts_dir.glob("*.json"):
        # Skip backup files
        if any(suffix in f.name for suffix in ['.bak', '.backup', '.tmp', '-backup', '-enhanced', '-original']):
            continue
        # Skip UUID file
        if re.match(r'^[0-9a-f-]{36}\.json$', f.name):
            continue
        files.append(f.stem)  # Remove .json extension
    return sorted(files)

def get_registry_posts():
    """Get posts from postRegistry.js"""
    registry_path = Path("src/newblog/data/postRegistry.js")
    with open(registry_path, 'r') as f:
        content = f.read()
    
    # Extract post keys from registry
    import re
    pattern = r"'([^']+)':\s*\(\)\s*=>\s*import\("
    matches = re.findall(pattern, content)
    return sorted(set(matches))  # Remove duplicates

def get_metadata_posts():
    """Get posts from metadata/index.json"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    with open(metadata_path, 'r') as f:
        data = json.load(f)
    return sorted([post.get('id', post.get('slug', '')) for post in data])

def fix_sitemap_date():
    """Fix malformed date in sitemap.xml"""
    sitemap_path = Path("public/sitemap.xml")
    with open(sitemap_path, 'r') as f:
        content = f.read()
    
    # Fix malformed date
    fixed_content = content.replace(
        '<lastmod>July 28, 2025</lastmod>',
        '<lastmod>2025-07-28</lastmod>'
    )
    
    with open(sitemap_path, 'w') as f:
        f.write(fixed_content)
    
    return content != fixed_content

def add_missing_to_registry(missing_posts):
    """Add missing posts to postRegistry.js"""
    registry_path = Path("src/newblog/data/postRegistry.js")
    with open(registry_path, 'r') as f:
        content = f.read()
    
    # Find the insertion point (before the closing brace)
    insertion_point = content.rfind('};')
    
    # Generate new entries
    new_entries = []
    for post in missing_posts:
        entry = f"  '{post}': () => import('./posts/{post}.json'),"
        new_entries.append(entry)
    
    # Insert new entries
    new_content = (
        content[:insertion_point] + 
        '\n' + '\n'.join(new_entries) + '\n' + 
        content[insertion_point:]
    )
    
    with open(registry_path, 'w') as f:
        f.write(new_content)
    
    return len(new_entries)

def remove_orphaned_metadata(orphaned_posts):
    """Remove posts from metadata that don't have files"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    with open(metadata_path, 'r') as f:
        data = json.load(f)
    
    # Filter out orphaned posts
    original_count = len(data)
    data = [post for post in data if post.get('id', post.get('slug', '')) not in orphaned_posts]
    
    with open(metadata_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return original_count - len(data)

def main():
    print("🔧 Starting Blog System Synchronization Fix...")
    
    # Get current state
    post_files = get_post_files()
    registry_posts = get_registry_posts()
    metadata_posts = get_metadata_posts()
    
    print(f"📊 Current Status:")
    print(f"  Post Files: {len(post_files)}")
    print(f"  Registry: {len(registry_posts)}")
    print(f"  Metadata: {len(metadata_posts)}")
    
    # Find discrepancies
    missing_from_registry = set(post_files) - set(registry_posts)
    orphaned_in_metadata = set(metadata_posts) - set(post_files)
    
    print(f"\n🎯 Issues Found:")
    print(f"  Missing from registry: {len(missing_from_registry)}")
    print(f"  Orphaned in metadata: {len(orphaned_in_metadata)}")
    
    # Fix sitemap date issue
    print(f"\n🗓️ Fixing sitemap date format...")
    date_fixed = fix_sitemap_date()
    if date_fixed:
        print("  ✅ Fixed malformed date in sitemap.xml")
    else:
        print("  ℹ️ No date issues found in sitemap")
    
    # Add missing posts to registry
    if missing_from_registry:
        print(f"\n📝 Adding {len(missing_from_registry)} posts to registry...")
        for post in sorted(missing_from_registry)[:10]:  # Show first 10
            print(f"  + {post}")
        if len(missing_from_registry) > 10:
            print(f"  ... and {len(missing_from_registry) - 10} more")
        
        added_count = add_missing_to_registry(missing_from_registry)
        print(f"  ✅ Added {added_count} posts to registry")
    
    # Remove orphaned metadata
    if orphaned_in_metadata:
        print(f"\n🧹 Removing {len(orphaned_in_metadata)} orphaned metadata entries...")
        for post in sorted(orphaned_in_metadata):
            print(f"  - {post}")
        
        removed_count = remove_orphaned_metadata(orphaned_in_metadata)
        print(f"  ✅ Removed {removed_count} orphaned entries")
    
    print(f"\n🎉 Blog system synchronization complete!")
    print(f"  📈 Accessibility improved: +{len(missing_from_registry)} posts now accessible")
    print(f"  🧹 Metadata cleaned: -{len(orphaned_in_metadata)} invalid entries")

if __name__ == "__main__":
    main()