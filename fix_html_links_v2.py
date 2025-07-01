#!/usr/bin/env python3
import os
import glob
import re
import json

def convert_html_links_to_markdown(text):
    """Convert HTML <a href="url">text</a> links to Markdown [text](url) format"""
    if not isinstance(text, str):
        return text
    
    # Pattern to match <a href="url">text</a>
    pattern = r'<a href="([^"]*)"[^>]*>([^<]*)</a>'
    
    # Replace with Markdown format
    markdown_text = re.sub(pattern, r'[\2](\1)', text)
    
    return markdown_text

def fix_links_in_content_item(item):
    """Fix links in a single content item"""
    changed = False
    
    if isinstance(item, dict):
        for key, value in item.items():
            if key == 'content' and isinstance(value, str):
                original = value
                item[key] = convert_html_links_to_markdown(value)
                if original != item[key]:
                    changed = True
            elif isinstance(value, (dict, list)):
                if fix_links_in_content_item(value):
                    changed = True
    elif isinstance(item, list):
        for subitem in item:
            if fix_links_in_content_item(subitem):
                changed = True
    
    return changed

def fix_links_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        changed = False
        
        # Fix links in content field (could be string or list)
        if 'content' in data:
            if isinstance(data['content'], str):
                # Old format - single string
                original_content = data['content']
                data['content'] = convert_html_links_to_markdown(original_content)
                if original_content != data['content']:
                    changed = True
            elif isinstance(data['content'], list):
                # New format - list of content objects
                if fix_links_in_content_item(data['content']):
                    changed = True
        
        # Also check other text fields that might have links
        text_fields = ['excerpt', 'description']
        for field in text_fields:
            if field in data and isinstance(data[field], str):
                original = data[field]
                data[field] = convert_html_links_to_markdown(original)
                if original != data[field]:
                    changed = True
        
        if changed:
            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"Fixed links in: {file_path}")
            return True
        
        return False
    except Exception as e:
        print(f"Error with {file_path}: {e}")
        return False

# Change to posts directory
os.chdir('/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts')

# Fix all JSON files
fixed_count = 0
for file_path in glob.glob('*.json'):
    if fix_links_in_file(file_path):
        fixed_count += 1

print(f"\nFixed HTML links in {fixed_count} files!")