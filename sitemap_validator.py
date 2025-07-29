#!/usr/bin/env python3
"""
Comprehensive sitemap.xml validator and maintenance tool
Based on sitemap protocol specification and search engine best practices
"""

import xml.etree.ElementTree as ET
import re
import sys
import os
from urllib.parse import urlparse
from datetime import datetime

class SitemapValidator:
    def __init__(self, sitemap_path):
        self.sitemap_path = sitemap_path
        self.errors = []
        self.warnings = []
        self.stats = {
            'total_urls': 0,
            'duplicate_urls': 0,
            'invalid_dates': 0,
            'invalid_priorities': 0,
            'invalid_changefreqs': 0,
            'missing_locs': 0,
            'invalid_urls': 0
        }
        
    def validate(self):
        """Run all validation checks on the sitemap"""
        print(f"Validating sitemap: {self.sitemap_path}")
        print("=" * 60)
        
        try:
            # Parse XML
            tree = ET.parse(self.sitemap_path)
            root = tree.getroot()
            
            # Validate structure
            self._validate_structure(root)
            
            # Validate URLs
            self._validate_urls(root)
            
            # Check file constraints
            self._check_file_constraints()
            
            # Print results
            self._print_results()
            
        except ET.ParseError as e:
            self.errors.append(f"XML Parse Error: {e}")
            self._print_results()
            return False
        except Exception as e:
            self.errors.append(f"Unexpected Error: {e}")
            self._print_results()
            return False
        
        return len(self.errors) == 0
    
    def _validate_structure(self, root):
        """Validate XML structure and namespace"""
        # Check root element
        expected_tag = '{http://www.sitemaps.org/schemas/sitemap/0.9}urlset'
        if root.tag != expected_tag:
            self.errors.append(f"Invalid root element: expected 'urlset' with proper namespace, got '{root.tag}'")
        
        # Check for XML declaration (done via file read)
        with open(self.sitemap_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            if not first_line.startswith('<?xml'):
                self.errors.append("Missing XML declaration. Should start with: <?xml version=\"1.0\" encoding=\"UTF-8\"?>")
    
    def _validate_urls(self, root):
        """Validate each URL entry in the sitemap"""
        seen_urls = set()
        
        for url_elem in root.iter():
            if not url_elem.tag.endswith('url'):
                continue
                
            self.stats['total_urls'] += 1
            url_data = self._extract_url_data(url_elem)
            
            # Validate <loc>
            if not url_data['loc']:
                self.errors.append(f"URL #{self.stats['total_urls']}: Missing or empty <loc> element")
                self.stats['missing_locs'] += 1
            else:
                # Check for duplicates
                if url_data['loc'] in seen_urls:
                    self.errors.append(f"URL #{self.stats['total_urls']}: Duplicate URL '{url_data['loc']}'")
                    self.stats['duplicate_urls'] += 1
                seen_urls.add(url_data['loc'])
                
                # Validate URL format
                self._validate_url_format(url_data['loc'], self.stats['total_urls'])
            
            # Validate <lastmod>
            if url_data['lastmod']:
                self._validate_lastmod(url_data['lastmod'], self.stats['total_urls'])
            
            # Validate <changefreq>
            if url_data['changefreq']:
                self._validate_changefreq(url_data['changefreq'], self.stats['total_urls'])
            
            # Validate <priority>
            if url_data['priority']:
                self._validate_priority(url_data['priority'], self.stats['total_urls'])
    
    def _extract_url_data(self, url_elem):
        """Extract data from a URL element"""
        data = {
            'loc': None,
            'lastmod': None,
            'changefreq': None,
            'priority': None
        }
        
        for child in url_elem:
            if child.tag.endswith('loc'):
                data['loc'] = child.text
            elif child.tag.endswith('lastmod'):
                data['lastmod'] = child.text
            elif child.tag.endswith('changefreq'):
                data['changefreq'] = child.text
            elif child.tag.endswith('priority'):
                data['priority'] = child.text
        
        return data
    
    def _validate_url_format(self, url, url_num):
        """Validate URL format and requirements"""
        if not url:
            return
        
        # Check URL length
        if len(url) > 2048:
            self.errors.append(f"URL #{url_num}: URL exceeds 2048 character limit ({len(url)} chars)")
            self.stats['invalid_urls'] += 1
        
        # Parse URL
        try:
            parsed = urlparse(url)
            
            # Must be absolute URL
            if not parsed.scheme or not parsed.netloc:
                self.errors.append(f"URL #{url_num}: Not an absolute URL: '{url}'")
                self.stats['invalid_urls'] += 1
            
            # Should use HTTPS
            if parsed.scheme == 'http':
                self.warnings.append(f"URL #{url_num}: Consider using HTTPS instead of HTTP: '{url}'")
            
            # Check for fragments
            if parsed.fragment:
                self.warnings.append(f"URL #{url_num}: URL contains fragment (#{parsed.fragment}), which may be ignored by search engines")
            
            # Check for unencoded characters
            if ' ' in url:
                self.errors.append(f"URL #{url_num}: URL contains unencoded spaces: '{url}'")
                self.stats['invalid_urls'] += 1
                
        except Exception as e:
            self.errors.append(f"URL #{url_num}: Invalid URL format: '{url}' - {e}")
            self.stats['invalid_urls'] += 1
    
    def _validate_lastmod(self, lastmod, url_num):
        """Validate lastmod date format"""
        if not lastmod:
            return
        
        # Check basic ISO 8601 date format (YYYY-MM-DD)
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        datetime_pattern = r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?$'
        
        if not (re.match(date_pattern, lastmod) or re.match(datetime_pattern, lastmod)):
            self.errors.append(f"URL #{url_num}: Invalid date format '{lastmod}'. Must be ISO 8601 (YYYY-MM-DD or YYYY-MM-DDThh:mm:ss+TZ)")
            self.stats['invalid_dates'] += 1
        else:
            # Try to parse the date
            try:
                if 'T' in lastmod:
                    # Has time component
                    date_part = lastmod.split('T')[0]
                else:
                    date_part = lastmod
                
                year, month, day = map(int, date_part.split('-'))
                
                # Basic date validation
                if month < 1 or month > 12:
                    self.errors.append(f"URL #{url_num}: Invalid month in date '{lastmod}'")
                    self.stats['invalid_dates'] += 1
                elif day < 1 or day > 31:
                    self.errors.append(f"URL #{url_num}: Invalid day in date '{lastmod}'")
                    self.stats['invalid_dates'] += 1
                
                # Check for future dates (more than 1 day in future)
                try:
                    date_obj = datetime(year, month, day)
                    if date_obj > datetime.now().replace(hour=23, minute=59, second=59):
                        self.warnings.append(f"URL #{url_num}: Future date '{lastmod}' may be ignored by search engines")
                except ValueError:
                    self.errors.append(f"URL #{url_num}: Invalid date '{lastmod}'")
                    self.stats['invalid_dates'] += 1
                    
            except Exception:
                self.errors.append(f"URL #{url_num}: Cannot parse date '{lastmod}'")
                self.stats['invalid_dates'] += 1
    
    def _validate_changefreq(self, changefreq, url_num):
        """Validate changefreq value"""
        valid_values = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
        
        if changefreq not in valid_values:
            self.errors.append(f"URL #{url_num}: Invalid changefreq '{changefreq}'. Must be one of: {', '.join(valid_values)}")
            self.stats['invalid_changefreqs'] += 1
    
    def _validate_priority(self, priority, url_num):
        """Validate priority value"""
        try:
            p_val = float(priority)
            if p_val < 0.0 or p_val > 1.0:
                self.errors.append(f"URL #{url_num}: Priority {p_val} outside valid range (0.0-1.0)")
                self.stats['invalid_priorities'] += 1
        except ValueError:
            self.errors.append(f"URL #{url_num}: Invalid priority value '{priority}'. Must be a decimal between 0.0 and 1.0")
            self.stats['invalid_priorities'] += 1
    
    def _check_file_constraints(self):
        """Check file size and URL count constraints"""
        # File size (50MB limit)
        file_size = os.path.getsize(self.sitemap_path)
        file_size_mb = file_size / (1024 * 1024)
        
        if file_size_mb > 50:
            self.errors.append(f"File size ({file_size_mb:.1f}MB) exceeds 50MB limit")
        elif file_size_mb > 40:
            self.warnings.append(f"File size ({file_size_mb:.1f}MB) approaching 50MB limit")
        
        # URL count (50,000 limit)
        if self.stats['total_urls'] > 50000:
            self.errors.append(f"URL count ({self.stats['total_urls']}) exceeds 50,000 limit")
        elif self.stats['total_urls'] > 45000:
            self.warnings.append(f"URL count ({self.stats['total_urls']}) approaching 50,000 limit")
    
    def _print_results(self):
        """Print validation results"""
        print("\n" + "=" * 60)
        print("VALIDATION RESULTS")
        print("=" * 60)
        
        # Stats
        print(f"\nStatistics:")
        print(f"  Total URLs: {self.stats['total_urls']}")
        print(f"  File size: {os.path.getsize(self.sitemap_path) / 1024:.1f} KB")
        
        # Errors
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for i, error in enumerate(self.errors[:20], 1):
                print(f"  {i}. {error}")
            if len(self.errors) > 20:
                print(f"  ... and {len(self.errors) - 20} more errors")
        else:
            print("\n✅ No errors found!")
        
        # Warnings
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings[:10], 1):
                print(f"  {i}. {warning}")
            if len(self.warnings) > 10:
                print(f"  ... and {len(self.warnings) - 10} more warnings")
        
        # Summary
        print(f"\n" + "=" * 60)
        if self.errors:
            print("❌ Sitemap validation FAILED")
            print("\nIssue Summary:")
            if self.stats['missing_locs'] > 0:
                print(f"  - Missing <loc> elements: {self.stats['missing_locs']}")
            if self.stats['invalid_urls'] > 0:
                print(f"  - Invalid URLs: {self.stats['invalid_urls']}")
            if self.stats['duplicate_urls'] > 0:
                print(f"  - Duplicate URLs: {self.stats['duplicate_urls']}")
            if self.stats['invalid_dates'] > 0:
                print(f"  - Invalid date formats: {self.stats['invalid_dates']}")
            if self.stats['invalid_changefreqs'] > 0:
                print(f"  - Invalid changefreq values: {self.stats['invalid_changefreqs']}")
            if self.stats['invalid_priorities'] > 0:
                print(f"  - Invalid priority values: {self.stats['invalid_priorities']}")
        else:
            print("✅ Sitemap validation PASSED")
        
        print("\nNext Steps:")
        if self.errors:
            print("1. Fix all errors listed above")
            print("2. Run this validator again to verify fixes")
            print("3. Submit to Google Search Console and Bing Webmaster Tools")
        else:
            print("1. Submit sitemap to search engines if not already done")
            print("2. Monitor search console for indexing status")
            print("3. Update sitemap when content changes")

if __name__ == "__main__":
    # Default to public/sitemap.xml if no argument provided
    if len(sys.argv) > 1:
        sitemap_path = sys.argv[1]
    else:
        sitemap_path = "public/sitemap.xml"
    
    if not os.path.exists(sitemap_path):
        print(f"ERROR: Sitemap file not found: {sitemap_path}")
        sys.exit(1)
    
    # Run validation
    validator = SitemapValidator(sitemap_path)
    if validator.validate():
        sys.exit(0)
    else:
        sys.exit(1)