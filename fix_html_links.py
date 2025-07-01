#!/usr/bin/env python3
import os
import glob
import re
import json

def convert_html_links_to_markdown(text):
    """Convert HTML <a href="url">text</a> links to Markdown [text](url) format"""
    # Pattern to match <a href="url">text</a>
    pattern = r'<a href="([^"]*)"[^>]*>([^<]*)</a>'
    
    # Replace with Markdown format
    markdown_text = re.sub(pattern, r'[\2](\1)', text)
    
    return markdown_text

def fix_links_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert HTML links to Markdown in content field
        if 'content' in data and isinstance(data['content'], str):
            original_content = data['content']
            data['content'] = convert_html_links_to_markdown(original_content)
            
            # Check if any changes were made
            if original_content != data['content']:
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