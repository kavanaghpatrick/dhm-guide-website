#!/usr/bin/env python3
import os
import glob

def fix_quotes_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace curly quotes with straight quotes
        content = content.replace('\u2018', "'")  # left single quote
        content = content.replace('\u2019', "'")  # right single quote
        content = content.replace('\u201C', '"')  # left double quote
        content = content.replace('\u201D', '"')  # right double quote
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Fixed: {file_path}")
        return True
    except Exception as e:
        print(f"Error with {file_path}: {e}")
        return False

# Change to posts directory
os.chdir('/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts')

# Fix all JSON files
fixed_count = 0
for file_path in glob.glob('*.json'):
    if fix_quotes_in_file(file_path):
        fixed_count += 1

print(f"\nFixed {fixed_count} files successfully!")