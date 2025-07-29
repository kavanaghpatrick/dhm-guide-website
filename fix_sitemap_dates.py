#!/usr/bin/env python3
"""
Fix sitemap.xml date formats from invalid formats to ISO 8601 (YYYY-MM-DD)
Handles various date formats like "July 28, 2025" and converts them to "2025-07-28"
"""

import xml.etree.ElementTree as ET
from dateutil import parser
from datetime import datetime
import sys
import os
import shutil

def fix_sitemap_dates(input_file, output_file=None):
    """
    Parse sitemap.xml and fix any invalid date formats in <lastmod> tags
    
    Args:
        input_file: Path to the sitemap.xml file
        output_file: Path to save fixed sitemap (optional, defaults to overwriting input)
    """
    if output_file is None:
        output_file = input_file
        # Create backup
        backup_file = input_file + '.backup'
        shutil.copy2(input_file, backup_file)
        print(f"Created backup: {backup_file}")
    
    try:
        # Parse the XML
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        # Namespace for sitemap
        ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        # Stats
        total_dates = 0
        fixed_dates = 0
        
        # Find all <url> elements (or <sitemap> in indexes)
        for elem in root.findall('.//sitemap:url', ns) + root.findall('.//sitemap:sitemap', ns):
            lastmod = elem.find('sitemap:lastmod', ns)
            if lastmod is not None:
                total_dates += 1
                original_date = lastmod.text
                
                # Check if date is already in ISO format (YYYY-MM-DD)
                import re
                if original_date and not re.match(r'^\d{4}-\d{2}-\d{2}', original_date):
                    try:
                        # Parse the date (handles formats like "July 28, 2025")
                        parsed_date = parser.parse(original_date)
                        # Convert to ISO 8601 (YYYY-MM-DD)
                        iso_date = parsed_date.strftime('%Y-%m-%d')
                        
                        if iso_date != original_date:
                            lastmod.text = iso_date
                            fixed_dates += 1
                            print(f"Fixed: '{original_date}' -> '{iso_date}'")
                    except (ValueError, TypeError) as e:
                        print(f"ERROR: Could not parse date '{original_date}': {e}")
        
        # Write the fixed sitemap with proper XML declaration and formatting
        tree.write(output_file, encoding='utf-8', xml_declaration=True, method='xml')
        
        print(f"\nSummary:")
        print(f"Total <lastmod> tags found: {total_dates}")
        print(f"Invalid dates fixed: {fixed_dates}")
        print(f"Fixed sitemap saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to process sitemap: {e}")
        return False

def validate_sitemap(sitemap_file):
    """
    Basic validation of sitemap structure and date formats
    """
    print(f"\nValidating sitemap: {sitemap_file}")
    
    try:
        tree = ET.parse(sitemap_file)
        root = tree.getroot()
        
        # Check namespace
        if root.tag != '{http://www.sitemaps.org/schemas/sitemap/0.9}urlset':
            print("WARNING: Root element should be 'urlset' with proper namespace")
        
        ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        # Stats
        url_count = 0
        errors = []
        
        # Validate each URL
        for url_elem in root.findall('.//sitemap:url', ns):
            url_count += 1
            
            # Check required <loc> element
            loc = url_elem.find('sitemap:loc', ns)
            if loc is None or not loc.text:
                errors.append(f"URL #{url_count}: Missing or empty <loc> element")
            
            # Validate <lastmod> if present
            lastmod = url_elem.find('sitemap:lastmod', ns)
            if lastmod is not None and lastmod.text:
                # Check ISO 8601 format
                import re
                if not re.match(r'^\d{4}-\d{2}-\d{2}', lastmod.text):
                    errors.append(f"URL #{url_count}: Invalid date format '{lastmod.text}'")
            
            # Validate <changefreq> if present
            changefreq = url_elem.find('sitemap:changefreq', ns)
            if changefreq is not None and changefreq.text:
                valid_freqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
                if changefreq.text not in valid_freqs:
                    errors.append(f"URL #{url_count}: Invalid changefreq '{changefreq.text}'")
            
            # Validate <priority> if present
            priority = url_elem.find('sitemap:priority', ns)
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
        
        # Check file size (50MB limit)
        file_size = os.path.getsize(sitemap_file)
        if file_size > 50 * 1024 * 1024:
            print(f"WARNING: File size ({file_size / 1024 / 1024:.1f}MB) exceeds 50MB limit")
        
        # Check URL count (50,000 limit)
        if url_count > 50000:
            print(f"WARNING: URL count ({url_count}) exceeds 50,000 limit")
        
    except Exception as e:
        print(f"ERROR: Validation failed: {e}")

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