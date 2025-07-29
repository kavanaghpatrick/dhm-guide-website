#!/usr/bin/env python3
"""
Fix sitemap.xml date formats from invalid formats to ISO 8601 (YYYY-MM-DD)
Simple version without external dependencies
"""

import xml.etree.ElementTree as ET
import re
import sys
import os
import shutil
from datetime import datetime

# Month name to number mapping
MONTHS = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12
}

def parse_date_string(date_str):
    """
    Parse common date formats and return ISO format (YYYY-MM-DD)
    Handles formats like "July 28, 2025", "28 July 2025", etc.
    """
    if not date_str:
        return None
    
    # Already in ISO format?
    if re.match(r'^\d{4}-\d{2}-\d{2}', date_str):
        return date_str
    
    # Try to parse "Month DD, YYYY" format (e.g., "July 28, 2025")
    match = re.match(r'^(\w+)\s+(\d{1,2}),?\s+(\d{4})$', date_str.strip())
    if match:
        month_name, day, year = match.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num:02d}-{int(day):02d}"
    
    # Try to parse "DD Month YYYY" format (e.g., "28 July 2025")
    match = re.match(r'^(\d{1,2})\s+(\w+)\s+(\d{4})$', date_str.strip())
    if match:
        day, month_name, year = match.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num:02d}-{int(day):02d}"
    
    # Try MM/DD/YYYY or MM-DD-YYYY
    match = re.match(r'^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$', date_str.strip())
    if match:
        month, day, year = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    
    return None

def fix_sitemap_dates(input_file, output_file=None):
    """
    Parse sitemap.xml and fix any invalid date formats in <lastmod> tags
    """
    if output_file is None:
        output_file = input_file
        # Create backup
        backup_file = input_file + '.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S')
        shutil.copy2(input_file, backup_file)
        print(f"Created backup: {backup_file}")
    
    try:
        # Parse the XML
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        # Register namespace
        ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        # Stats
        total_dates = 0
        fixed_dates = 0
        
        # Find all <lastmod> elements
        for elem in root.iter():
            if elem.tag.endswith('lastmod'):
                total_dates += 1
                original_date = elem.text
                
                if original_date:
                    iso_date = parse_date_string(original_date)
                    
                    if iso_date and iso_date != original_date:
                        elem.text = iso_date
                        fixed_dates += 1
                        print(f"Fixed: '{original_date}' -> '{iso_date}'")
                    elif not iso_date:
                        print(f"WARNING: Could not parse date '{original_date}'")
        
        # Write the fixed sitemap
        tree.write(output_file, encoding='utf-8', xml_declaration=True)
        
        print(f"\nSummary:")
        print(f"Total <lastmod> tags found: {total_dates}")
        print(f"Invalid dates fixed: {fixed_dates}")
        print(f"Fixed sitemap saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to process sitemap: {e}")
        import traceback
        traceback.print_exc()
        return False

def validate_sitemap(sitemap_file):
    """
    Basic validation of sitemap structure and date formats
    """
    print(f"\nValidating sitemap: {sitemap_file}")
    
    try:
        tree = ET.parse(sitemap_file)
        root = tree.getroot()
        
        # Stats
        url_count = 0
        errors = []
        
        # Find all URL elements
        for elem in root.iter():
            if elem.tag.endswith('url'):
                url_count += 1
                
                # Find child elements
                loc = None
                lastmod = None
                changefreq = None
                priority = None
                
                for child in elem:
                    if child.tag.endswith('loc'):
                        loc = child
                    elif child.tag.endswith('lastmod'):
                        lastmod = child
                    elif child.tag.endswith('changefreq'):
                        changefreq = child
                    elif child.tag.endswith('priority'):
                        priority = child
                
                # Validate required elements
                if loc is None or not loc.text:
                    errors.append(f"URL #{url_count}: Missing or empty <loc> element")
                
                # Validate lastmod
                if lastmod is not None and lastmod.text:
                    if not re.match(r'^\d{4}-\d{2}-\d{2}', lastmod.text):
                        errors.append(f"URL #{url_count}: Invalid date format '{lastmod.text}'")
                
                # Validate changefreq
                if changefreq is not None and changefreq.text:
                    valid_freqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
                    if changefreq.text not in valid_freqs:
                        errors.append(f"URL #{url_count}: Invalid changefreq '{changefreq.text}'")
                
                # Validate priority
                if priority is not None and priority.text:
                    try:
                        p_val = float(priority.text)
                        if p_val < 0.0 or p_val > 1.0:
                            errors.append(f"URL #{url_count}: Priority {p_val} outside 0.0-1.0 range")
                    except ValueError:
                        errors.append(f"URL #{url_count}: Invalid priority value '{priority.text}'")
        
        print(f"Total URLs: {url_count}")
        
        if errors:
            print(f"\nValidation errors found ({len(errors)}):")
            for error in errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... and {len(errors) - 10} more errors")
        else:
            print("✓ Sitemap validation passed!")
        
        # Check file size
        file_size = os.path.getsize(sitemap_file)
        print(f"File size: {file_size / 1024:.1f} KB")
        
        if file_size > 50 * 1024 * 1024:
            print(f"WARNING: File size exceeds 50MB limit")
        
        if url_count > 50000:
            print(f"WARNING: URL count ({url_count}) exceeds 50,000 limit")
        
    except Exception as e:
        print(f"ERROR: Validation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Default to public/sitemap.xml if no argument provided
    if len(sys.argv) > 1:
        sitemap_path = sys.argv[1]
    else:
        sitemap_path = "public/sitemap.xml"
    
    if not os.path.exists(sitemap_path):
        print(f"ERROR: Sitemap file not found: {sitemap_path}")
        sys.exit(1)
    
    # Fix the sitemap
    if fix_sitemap_dates(sitemap_path):
        # Validate the fixed sitemap
        validate_sitemap(sitemap_path)
    else:
        sys.exit(1)