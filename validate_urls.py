#!/usr/bin/env python3
"""Quick validation of URL integrity between metadata and actual files."""

import json
import os
from pathlib import Path

# Read metadata
with open('src/newblog/data/metadata/index.json', 'r') as f:
    metadata = json.load(f)

# Get all post files
posts_dir = Path('src/newblog/data/posts')
post_files = {f.stem for f in posts_dir.glob('*.json')}

# Check for mismatches
print("Checking for URL mismatches...")
mismatches = []

for item in metadata:
    slug = item.get('slug', '')
    if slug and slug not in post_files:
        mismatches.append({
            'slug': slug,
            'title': item.get('title', 'Unknown'),
            'id': item.get('id', 'Unknown')
        })

if mismatches:
    print(f"\nFound {len(mismatches)} mismatches:")
    for m in mismatches:
        print(f"  - Slug: {m['slug']}")
        print(f"    Title: {m['title']}")
        print(f"    ID: {m['id']}")
        print()
else:
    print("✓ All slugs match existing files!")

# Check postRegistry
print("\nChecking postRegistry.js...")
with open('src/newblog/data/postRegistry.js', 'r') as f:
    registry_content = f.read()
    
registry_slugs = set()
for line in registry_content.split('\n'):
    if "': () => import(" in line:
        slug = line.strip().split("'")[1]
        registry_slugs.add(slug)

# Check for missing in registry
missing_in_registry = post_files - registry_slugs
if missing_in_registry:
    print(f"\nFiles missing from postRegistry.js:")
    for slug in sorted(missing_in_registry):
        print(f"  - {slug}")
else:
    print("✓ All files are in postRegistry.js!")