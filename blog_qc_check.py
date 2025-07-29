#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime
import sys

def check_blog_post_quality(filepath):
    """
    Comprehensive quality control check for blog posts.
    Returns a dictionary with issues found.
    """
    issues = []
    filename = os.path.basename(filepath)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"JSON SYNTAX ERROR at line {e.lineno}: {e.msg}"]
    except Exception as e:
        return [f"FILE READ ERROR: {str(e)}"]
    
    # 1. Check required fields
    required_fields = ['id', 'title', 'slug', 'excerpt', 'date', 'author', 'tags', 'image', 'readTime', 'content']
    for field in required_fields:
        if field not in data:
            issues.append(f"MISSING FIELD: '{field}' is required but not found")
        elif not data[field]:
            issues.append(f"EMPTY FIELD: '{field}' is present but empty")
    
    # 2. Check title formatting
    if 'title' in data:
        title = data['title']
        if len(title) < 10:
            issues.append(f"TITLE TOO SHORT: Title is only {len(title)} characters")
        if len(title) > 100:
            issues.append(f"TITLE TOO LONG: Title is {len(title)} characters")
        if not title[0].isupper():
            issues.append("TITLE FORMATTING: Title should start with uppercase letter")
    
    # 3. Check slug consistency
    if 'slug' in data and 'id' in data:
        if data['slug'] != data['id']:
            issues.append(f"SLUG MISMATCH: slug ('{data['slug']}') doesn't match id ('{data['id']}')")
    
    # 4. Check excerpt formatting
    if 'excerpt' in data:
        excerpt = data['excerpt']
        if len(excerpt) < 50:
            issues.append(f"EXCERPT TOO SHORT: Excerpt is only {len(excerpt)} characters")
        if len(excerpt) > 300:
            issues.append(f"EXCERPT TOO LONG: Excerpt is {len(excerpt)} characters")
    
    # 5. Check date format
    if 'date' in data:
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            issues.append(f"INVALID DATE FORMAT: '{data['date']}' should be YYYY-MM-DD")
    
    # 6. Check author field
    if 'author' in data:
        author = data['author']
        if 'DHM Guide Team' not in author and len(author.split()) < 2:
            issues.append(f"AUTHOR FORMAT: Author '{author}' may be incomplete")
    
    # 7. Check tags
    if 'tags' in data:
        if not isinstance(data['tags'], list):
            issues.append("TAGS FORMAT: Tags should be an array")
        elif len(data['tags']) == 0:
            issues.append("TAGS EMPTY: No tags specified")
        elif len(data['tags']) > 10:
            issues.append(f"TOO MANY TAGS: {len(data['tags'])} tags (recommended max: 10)")
    
    # 8. Check image path
    if 'image' in data:
        image_path = data['image']
        if not image_path.startswith('/images/'):
            issues.append(f"IMAGE PATH: Image path '{image_path}' should start with '/images/'")
        if not image_path.endswith('.webp'):
            issues.append(f"IMAGE FORMAT: Image '{image_path}' should be .webp format")
        
        # Check if image file exists
        full_image_path = f"/Users/patrickkavanagh/dhm-guide-website/public{image_path}"
        if not os.path.exists(full_image_path):
            issues.append(f"IMAGE MISSING: Image file '{image_path}' not found in public directory")
    
    # 9. Check readTime field
    if 'readTime' in data:
        read_time = data['readTime']
        if isinstance(read_time, str):
            if 'min read' not in read_time and not read_time.isdigit():
                issues.append(f"READ TIME FORMAT: '{read_time}' should be number or 'X min read'")
        elif isinstance(read_time, (int, float)):
            if read_time <= 0 or read_time > 60:
                issues.append(f"READ TIME RANGE: {read_time} minutes seems unrealistic")
    
    # 10. Check content
    if 'content' in data:
        content = data['content']
        
        # Handle case where content might be a list or not string
        if not isinstance(content, str):
            issues.append(f"CONTENT TYPE ERROR: Content should be string, found {type(content)}")
            return issues
        
        # Check content length
        if len(content) < 1000:
            issues.append(f"CONTENT TOO SHORT: Content is only {len(content)} characters")
        
        # Check for placeholder content
        placeholders = ['Lorem ipsum', 'placeholder', 'TODO', 'FIXME', 'XXX', 'TBD']
        for placeholder in placeholders:
            if placeholder.lower() in content.lower():
                issues.append(f"PLACEHOLDER CONTENT: Found '{placeholder}' in content")
        
        # Check for broken markdown links
        broken_links = re.findall(r'\]\(\s*\)', content)
        if broken_links:
            issues.append(f"BROKEN LINKS: Found {len(broken_links)} empty markdown links")
        
        # Check for malformed HTML
        unclosed_tags = []
        # Simple check for common unclosed HTML tags
        html_tags = ['<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>', '<p>', '<div>', '<span>', '<strong>', '<em>']
        for tag in html_tags:
            open_count = content.count(tag)
            close_tag = tag.replace('<', '</')
            close_count = content.count(close_tag)
            if open_count != close_count:
                unclosed_tags.append(f"{tag}: {open_count} open, {close_count} close")
        
        if unclosed_tags:
            issues.append(f"MALFORMED HTML: Mismatched tags - {'; '.join(unclosed_tags)}")
        
        # Check for weird characters
        weird_chars = re.findall(r'[^\x00-\x7F\u00A0-\u024F\u1E00-\u1EFF\u2000-\u206F\u20A0-\u20CF\u2100-\u214F\u2190-\u21FF\u2200-\u22FF]', content)
        if weird_chars:
            unique_weird = list(set(weird_chars))
            issues.append(f"WEIRD CHARACTERS: Found unusual characters: {', '.join(unique_weird[:10])}")
        
        # Check for incomplete articles (common signs)
        if content.count('.') < 10:  # Very few sentences
            issues.append("INCOMPLETE ARTICLE: Very few sentences found")
        
        if len(content.split()) < 500:  # Less than 500 words
            issues.append(f"CONTENT TOO SHORT: Only {len(content.split())} words")
    
    return issues

def main():
    posts_dir = "/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts"
    
    # Get all files starting with S-Z
    all_files = []
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json') and filename[0].lower() in 'stuvwxyz':
            all_files.append(os.path.join(posts_dir, filename))
    
    all_files.sort()
    
    print("=" * 80)
    print("BLOG POST QUALITY CONTROL REPORT - FILES S-Z")
    print("=" * 80)
    print(f"Total files checked: {len(all_files)}")
    print()
    
    total_issues = 0
    files_with_issues = 0
    
    for filepath in all_files:
        filename = os.path.basename(filepath)
        issues = check_blog_post_quality(filepath)
        
        if issues:
            files_with_issues += 1
            total_issues += len(issues)
            print(f"📄 {filename}")
            print("-" * 60)
            for i, issue in enumerate(issues, 1):
                print(f"  {i}. {issue}")
            print()
        else:
            print(f"✅ {filename} - No issues found")
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Files checked: {len(all_files)}")
    print(f"Files with issues: {files_with_issues}")
    print(f"Files without issues: {len(all_files) - files_with_issues}")
    print(f"Total issues found: {total_issues}")
    
    if files_with_issues > 0:
        print(f"\n⚠️  Quality control issues found in {files_with_issues} out of {len(all_files)} files")
    else:
        print(f"\n🎉 All {len(all_files)} files passed quality control!")

if __name__ == "__main__":
    main()