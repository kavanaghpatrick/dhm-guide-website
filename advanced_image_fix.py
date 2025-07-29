#!/usr/bin/env python3
"""
Advanced Image Path Fix Script - Phase 2
Handles remaining unresolved image path issues with more intelligent matching
"""

import json
import os
import re
from pathlib import Path
from difflib import SequenceMatcher

def load_metadata():
    """Load the metadata/index.json file"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    with open(metadata_path, 'r') as f:
        return json.load(f)

def get_actual_images():
    """Get list of actual image files in public/images/"""
    images_dir = Path("public/images")
    return {f.name for f in images_dir.glob("*.webp")}

def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a, b).ratio()

def find_best_match(target_filename, actual_images, threshold=0.4):
    """Find the best matching image file"""
    # Remove common suffixes/prefixes for better matching
    clean_target = target_filename.replace('-hero.webp', '').replace('.webp', '').replace('.jpg', '')
    
    best_match = None
    best_score = 0
    
    for image in actual_images:
        clean_image = image.replace('-hero.webp', '').replace('.webp', '').replace('-hero', '')
        
        # Check for exact substring matches first
        if clean_target in clean_image or clean_image in clean_target:
            score = 0.9
        else:
            score = similarity(clean_target, clean_image)
        
        if score > best_score and score > threshold:
            best_score = score
            best_match = image
    
    return best_match, best_score

def create_advanced_mappings(metadata, actual_images):
    """Create advanced mappings using fuzzy matching"""
    mappings = {}
    issues = []
    
    for post in metadata:
        if 'image' not in post:
            continue
            
        current_path = post['image']
        filename = current_path.split('/')[-1]
        
        # Skip if file already exists
        if filename in actual_images:
            continue
            
        post_id = post.get('id', post.get('slug', 'unknown'))
        
        # Try to find best match
        best_match, score = find_best_match(filename, actual_images)
        
        if best_match and score > 0.4:
            mappings[current_path] = f"/images/{best_match}"
            print(f"📍 Fuzzy match: {filename} → {best_match} (score: {score:.2f})")
        else:
            # Try some manual rules for common patterns
            manual_match = None
            
            # Handle blog/ prefix cases
            if '/blog/' in current_path:
                base = filename.replace('.jpg', '').replace('.webp', '')
                candidates = [
                    f"{base}-hero.webp",
                    f"{base}-hero-hero.webp",
                    f"{base.replace('-guide', '')}-hero.webp",
                    f"alcohol-{base}-hero.webp" if not base.startswith('alcohol') else f"{base}-hero.webp"
                ]
                for candidate in candidates:
                    if candidate in actual_images:
                        manual_match = candidate
                        break
            
            # Handle very long names - try key word extraction
            elif len(filename) > 50:
                # Extract key terms
                words = post_id.split('-')
                key_terms = []
                
                # Common important words
                important_words = ['alcohol', 'dhm', 'liver', 'hangover', 'diabetes', 'immune', 'thyroid', 'brain', 'skin', 'heart']
                for word in words:
                    if word in important_words or len(word) > 4:
                        key_terms.append(word)
                        if len(key_terms) >= 3:  # Limit to first 3 key terms
                            break
                
                candidate = "-".join(key_terms[:3]) + "-hero.webp"
                if candidate in actual_images:
                    manual_match = candidate
            
            if manual_match:
                mappings[current_path] = f"/images/{manual_match}"
                print(f"🎯 Manual match: {filename} → {manual_match}")
            else:
                issues.append(f"No match found: {current_path} (post: {post_id})")
    
    return mappings, issues

def apply_fixes(mappings):
    """Apply the path fixes to metadata/index.json"""
    metadata_path = Path("src/newblog/data/metadata/index.json")
    
    with open(metadata_path, 'r') as f:
        content = f.read()
    
    fixes_applied = 0
    for old_path, new_path in mappings.items():
        if old_path in content:
            content = content.replace(f'"{old_path}"', f'"{new_path}"')
            fixes_applied += 1
            print(f"✅ Applied: {old_path} → {new_path}")
    
    with open(metadata_path, 'w') as f:
        f.write(content)
    
    return fixes_applied

def main():
    print("🚀 Starting Advanced Image Path Fix (Phase 2)...")
    
    metadata = load_metadata()
    actual_images = get_actual_images()
    
    print(f"📊 Analyzing {len(metadata)} posts against {len(actual_images)} image files")
    
    mappings, issues = create_advanced_mappings(metadata, actual_images)
    
    print(f"\n🎯 Found {len(mappings)} additional paths to fix")
    
    if mappings:
        fixes_applied = apply_fixes(mappings)
        print(f"\n✅ Applied {fixes_applied} additional fixes")
    
    if issues:
        print(f"\n⚠️  {len(issues)} issues still unresolved:")
        for issue in issues[:10]:
            print(f"  {issue}")
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more")
    
    print(f"\n🎉 Advanced fix complete! {len(mappings)} more issues resolved.")

if __name__ == "__main__":
    main()