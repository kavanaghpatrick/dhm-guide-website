#!/usr/bin/env python3
"""
Comprehensive Image Path Fix Script
Fixes systematic image path mismatches between metadata/index.json and actual files
"""

import json
import os
import re
from pathlib import Path

def load_metadata():
    """Load the metadata/index.json file"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    with open(metadata_path, 'r') as f:
        return json.load(f)

def get_actual_images():
    """Get list of actual image files in public/images/"""
    images_dir = Path("public/images")
    return {f.name for f in images_dir.glob("*.webp")}

def create_path_mappings(metadata, actual_images):
    """Create mappings from incorrect paths to correct paths"""
    mappings = {}
    issues = []
    
    for post in metadata:
        if 'image' not in post:
            continue
            
        current_path = post['image']
        # Extract filename from path
        filename = current_path.split('/')[-1]
        
        # Check if file exists as-is
        if filename in actual_images:
            continue  # No fix needed
            
        # Pattern 1: Long descriptive paths - try to find shortened version
        if len(filename) > 50:  # Very long filename
            # Try various shortened versions
            post_id = post.get('id', post.get('slug', 'unknown'))
            potential_names = [
                f"{post_id.split('-')[0]}-{post_id.split('-')[1]}-hero.webp",  # first-second-hero.webp
                f"{post_id.split('-')[0]}-hero.webp",  # first-hero.webp
            ]
            
            # Also try common patterns
            if 'alcohol' in post_id:
                base = post_id.replace('-complete', '').replace('-guide', '').replace('-2025', '').replace('-analysis', '')
                potential_names.append(f"{base}-hero.webp")
            
            for potential in potential_names:
                if potential in actual_images:
                    mappings[current_path] = f"/images/{potential}"
                    break
            else:
                issues.append(f"No match found for long path: {current_path} (post: {post_id})")
        
        # Pattern 2: Blog/ directory prefix
        elif '/blog/' in current_path:
            # Remove blog/ prefix and try .webp extension
            clean_filename = filename.replace('.jpg', '-hero.webp').replace('.webp', '-hero.webp')
            if clean_filename in actual_images:
                mappings[current_path] = f"/images/{clean_filename}"
            else:
                issues.append(f"No match found for blog/ path: {current_path}")
        
        # Pattern 3: Extension issues
        elif filename.endswith('.jpg'):
            webp_name = filename.replace('.jpg', '.webp')
            if webp_name in actual_images:
                mappings[current_path] = f"/images/{webp_name}"
            else:
                # Try with -hero suffix
                base_name = filename.replace('.jpg', '-hero.webp')
                if base_name in actual_images:
                    mappings[current_path] = f"/images/{base_name}"
                else:
                    issues.append(f"No webp equivalent found for: {current_path}")
        
        else:
            post_id = post.get('id', post.get('slug', 'unknown'))
            issues.append(f"File not found: {current_path} (post: {post_id})")
    
    return mappings, issues

def apply_fixes(mappings):
    """Apply the path fixes to metadata/index.json"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    
    # Read file as text for replacements
    with open(metadata_path, 'r') as f:
        content = f.read()
    
    # Apply each mapping
    fixes_applied = 0
    for old_path, new_path in mappings.items():
        if old_path in content:
            content = content.replace(f'"{old_path}"', f'"{new_path}"')
            fixes_applied += 1
            print(f"✅ Fixed: {old_path} → {new_path}")
    
    # Write back
    with open(metadata_path, 'w') as f:
        f.write(content)
    
    return fixes_applied

def main():
    print("🔧 Starting Comprehensive Image Path Fix...")
    
    # Load data
    metadata = load_metadata()
    actual_images = get_actual_images()
    
    print(f"📊 Found {len(metadata)} posts and {len(actual_images)} image files")
    
    # Create mappings
    mappings, issues = create_path_mappings(metadata, actual_images)
    
    print(f"\n🎯 Found {len(mappings)} paths to fix:")
    for old, new in list(mappings.items())[:10]:  # Show first 10
        print(f"  {old} → {new}")
    if len(mappings) > 10:
        print(f"  ... and {len(mappings) - 10} more")
    
    if issues:
        print(f"\n⚠️  {len(issues)} unresolved issues:")
        for issue in issues[:5]:  # Show first 5
            print(f"  {issue}")
        if len(issues) > 5:
            print(f"  ... and {len(issues) - 5} more")
    
    # Apply fixes
    if mappings:
        fixes_applied = apply_fixes(mappings)
        print(f"\n✅ Applied {fixes_applied} fixes to metadata/index.json")
    
    print("\n🎉 Comprehensive fix complete!")

if __name__ == "__main__":
    main()