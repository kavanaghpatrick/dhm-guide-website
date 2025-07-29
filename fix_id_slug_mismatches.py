#!/usr/bin/env python3
"""
Fix ID/slug mismatches in JSON files.
Ensures ID matches slug for consistent routing and SEO.
"""

import json
import os
import glob
import shutil
from datetime import datetime

def load_json_file(filepath):
    """Load and parse JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def save_json_file(filepath, data):
    """Save JSON data to file."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def find_mismatches(directory):
    """Find all JSON files where ID doesn't match slug."""
    mismatches = []
    json_files = glob.glob(os.path.join(directory, "*.json"))
    
    for filepath in json_files:
        data = load_json_file(filepath)
        if data:
            post_id = data.get('id', '')
            slug = data.get('slug', '')
            
            if post_id != slug:
                filename = os.path.basename(filepath)
                mismatches.append({
                    'filepath': filepath,
                    'filename': filename,
                    'id': post_id,
                    'slug': slug,
                    'needs_rename': filename.startswith('dda614c2-') or filename != f"{slug}.json"
                })
    
    return mismatches

def fix_id_slug_mismatch(filepath, data, new_id):
    """Fix ID to match slug in JSON data."""
    data['id'] = new_id
    return save_json_file(filepath, data)

def rename_file_to_slug(filepath, slug):
    """Rename file to match its slug."""
    directory = os.path.dirname(filepath)
    new_filename = f"{slug}.json"
    new_filepath = os.path.join(directory, new_filename)
    
    if filepath != new_filepath:
        try:
            shutil.move(filepath, new_filepath)
            print(f"Renamed: {os.path.basename(filepath)} -> {new_filename}")
            return new_filepath
        except Exception as e:
            print(f"Error renaming {filepath}: {e}")
            return filepath
    
    return filepath

def main():
    """Main function to fix all ID/slug mismatches."""
    posts_dir = "/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts"
    
    print("Finding ID/slug mismatches...")
    mismatches = find_mismatches(posts_dir)
    
    if not mismatches:
        print("No ID/slug mismatches found!")
        return
    
    print(f"\nFound {len(mismatches)} files with ID/slug mismatches:\n")
    
    # Display all mismatches
    for i, mismatch in enumerate(mismatches, 1):
        print(f"{i}. {mismatch['filename']}")
        print(f"   ID:   {mismatch['id']}")
        print(f"   Slug: {mismatch['slug']}")
        if mismatch['needs_rename']:
            print(f"   * Needs file rename")
        print()
    
    # Create backup directory
    backup_dir = f"backups/id_slug_fix_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    # Fix mismatches
    print("\nFixing mismatches...")
    fixed_count = 0
    renamed_count = 0
    
    for mismatch in mismatches:
        filepath = mismatch['filepath']
        slug = mismatch['slug']
        
        # Load data
        data = load_json_file(filepath)
        if not data:
            continue
        
        # Backup original file
        backup_path = os.path.join(backup_dir, os.path.basename(filepath))
        shutil.copy2(filepath, backup_path)
        
        # Fix ID to match slug
        if fix_id_slug_mismatch(filepath, data, slug):
            fixed_count += 1
            print(f"Fixed ID: {mismatch['filename']} (ID now matches slug: {slug})")
        
        # Rename file if needed
        if mismatch['needs_rename']:
            new_filepath = rename_file_to_slug(filepath, slug)
            if new_filepath != filepath:
                renamed_count += 1
    
    print(f"\nSummary:")
    print(f"- Fixed {fixed_count} ID/slug mismatches")
    print(f"- Renamed {renamed_count} files")
    print(f"- Backups saved to: {backup_dir}")
    
    # Verify fixes
    print("\nVerifying fixes...")
    remaining_mismatches = find_mismatches(posts_dir)
    if remaining_mismatches:
        print(f"WARNING: {len(remaining_mismatches)} mismatches still remain!")
    else:
        print("✓ All ID/slug mismatches have been fixed!")

if __name__ == "__main__":
    main()