#!/usr/bin/env python3
"""
Comprehensive Sitemap.xml Validator
Ensures full compliance with sitemap protocol standards
"""

import xml.etree.ElementTree as ET
from urllib.parse import urlparse
import re
from datetime import datetime
import sys

class SitemapValidator:
    def __init__(self, sitemap_path):
        self.sitemap_path = sitemap_path
        self.errors = []
        self.warnings = []
        self.stats = {
            'total_urls': 0,
            'valid_urls': 0,
            'invalid_dates': 0,
            'invalid_changefreq': 0,
            'invalid_priority': 0,
            'missing_elements': 0,
            'encoding_issues': 0
        }
        
    def validate(self):
        """Run all validation checks"""
        print("🔍 Comprehensive Sitemap Validation")
        print("===================================\n")
        
        # Parse XML
        try:
            self.tree = ET.parse(self.sitemap_path)
            self.root = self.tree.getroot()
        except ET.ParseError as e:
            self.errors.append(f"XML Parse Error: {e}")
            return False
        except FileNotFoundError:
            self.errors.append(f"File not found: {self.sitemap_path}")
            return False
            
        # Check namespace
        self._check_namespace()
        
        # Validate all URLs
        self._validate_urls()
        
        # Check file size and URL count
        self._check_limits()
        
        # Report results
        self._report_results()
        
        return len(self.errors) == 0
    
    def _check_namespace(self):
        """Verify correct namespace declaration"""
        expected_ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
        
        # Check root namespace
        if self.root.tag != f'{{{expected_ns}}}urlset':
            self.errors.append(f"Invalid root element or namespace. Expected {{{expected_ns}}}urlset")
    
    def _validate_urls(self):
        """Validate each URL entry"""
        ns = {'': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        for i, url_elem in enumerate(self.root.findall('url', ns)):
            self.stats['total_urls'] += 1
            url_errors = []
            
            # Check required <loc> element
            loc_elem = url_elem.find('loc', ns)
            if loc_elem is None or not loc_elem.text:
                url_errors.append("Missing or empty <loc> element")
            else:
                # Validate URL
                loc = loc_elem.text.strip()
                if not self._validate_url(loc):
                    url_errors.append(f"Invalid URL format: {loc}")
                
                # Check for unescaped characters
                if any(char in loc for char in ['&', '<', '>', '"', "'"]):
                    if '&amp;' not in loc:  # Allow properly escaped ampersands
                        url_errors.append(f"Unescaped characters in URL: {loc}")
                        self.stats['encoding_issues'] += 1
            
            # Check optional elements
            lastmod_elem = url_elem.find('lastmod', ns)
            if lastmod_elem is not None and lastmod_elem.text:
                if not self._validate_date(lastmod_elem.text.strip()):
                    url_errors.append(f"Invalid date format: {lastmod_elem.text}")
                    self.stats['invalid_dates'] += 1
            
            changefreq_elem = url_elem.find('changefreq', ns)
            if changefreq_elem is not None and changefreq_elem.text:
                if not self._validate_changefreq(changefreq_elem.text.strip()):
                    url_errors.append(f"Invalid changefreq value: {changefreq_elem.text}")
                    self.stats['invalid_changefreq'] += 1
            
            priority_elem = url_elem.find('priority', ns)
            if priority_elem is not None and priority_elem.text:
                if not self._validate_priority(priority_elem.text.strip()):
                    url_errors.append(f"Invalid priority value: {priority_elem.text}")
                    self.stats['invalid_priority'] += 1
            
            # Record errors
            if url_errors:
                line_num = (i * 6) + 10  # Approximate line number
                loc_text = loc_elem.text if loc_elem is not None else "Unknown"
                self.errors.append({
                    'line': line_num,
                    'url': loc_text,
                    'errors': url_errors
                })
            else:
                self.stats['valid_urls'] += 1
    
    def _validate_url(self, url):
        """Validate URL format"""
        try:
            result = urlparse(url)
            # Check for required components
            if not all([result.scheme, result.netloc]):
                return False
            # Check URL length
            if len(url) > 2048:
                self.warnings.append(f"URL exceeds recommended length of 2048 chars: {url[:50]}...")
                return False
            return True
        except:
            return False
    
    def _validate_date(self, date_str):
        """Validate date format (ISO 8601)"""
        # Valid formats:
        # YYYY-MM-DD
        # YYYY-MM-DDThh:mm:ss+TZ
        # YYYY-MM-DDThh:mm:ssZ
        
        patterns = [
            r'^\d{4}-\d{2}-\d{2}$',  # Date only
            r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\+\-]\d{2}:\d{2}$',  # With timezone
            r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$',  # UTC
            r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$'  # With milliseconds
        ]
        
        if any(re.match(pattern, date_str) for pattern in patterns):
            # Try to parse to ensure it's a valid date
            try:
                if 'T' in date_str:
                    datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    datetime.strptime(date_str, '%Y-%m-%d')
                return True
            except:
                return False
        return False
    
    def _validate_changefreq(self, freq):
        """Validate changefreq value"""
        valid_values = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
        return freq in valid_values
    
    def _validate_priority(self, priority):
        """Validate priority value"""
        try:
            val = float(priority)
            return 0.0 <= val <= 1.0
        except:
            return False
    
    def _check_limits(self):
        """Check file size and URL count limits"""
        import os
        
        # Check file size (50MB limit)
        file_size = os.path.getsize(self.sitemap_path)
        file_size_mb = file_size / (1024 * 1024)
        
        if file_size_mb > 50:
            self.errors.append(f"File size ({file_size_mb:.1f}MB) exceeds 50MB limit")
        elif file_size_mb > 40:
            self.warnings.append(f"File size ({file_size_mb:.1f}MB) approaching 50MB limit")
        
        # Check URL count (50,000 limit)
        if self.stats['total_urls'] > 50000:
            self.errors.append(f"URL count ({self.stats['total_urls']}) exceeds 50,000 limit")
        elif self.stats['total_urls'] > 40000:
            self.warnings.append(f"URL count ({self.stats['total_urls']}) approaching 50,000 limit")
    
    def _report_results(self):
        """Print validation results"""
        print(f"📊 Validation Results")
        print(f"====================")
        print(f"Total URLs: {self.stats['total_urls']}")
        print(f"Valid URLs: {self.stats['valid_urls']}")
        print(f"Invalid dates: {self.stats['invalid_dates']}")
        print(f"Invalid changefreq: {self.stats['invalid_changefreq']}")
        print(f"Invalid priority: {self.stats['invalid_priority']}")
        print(f"Encoding issues: {self.stats['encoding_issues']}")
        
        if self.errors:
            print(f"\n❌ Found {len(self.errors)} error(s):")
            for error in self.errors[:10]:  # Show first 10 errors
                if isinstance(error, dict):
                    print(f"\n  Line ~{error['line']}: {error['url']}")
                    for e in error['errors']:
                        print(f"    - {e}")
                else:
                    print(f"  - {error}")
            
            if len(self.errors) > 10:
                print(f"\n  ... and {len(self.errors) - 10} more errors")
        
        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if not self.errors:
            print(f"\n✅ Sitemap is fully compliant with sitemap protocol!")
        else:
            print(f"\n❌ Sitemap has compliance issues that need to be fixed")
            
        # Provide helpful links
        print(f"\n📚 Resources:")
        print(f"  - Sitemap Protocol: https://www.sitemaps.org/protocol.html")
        print(f"  - Google's Guidelines: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap")
        print(f"  - Validator Tool: https://www.xml-sitemaps.com/validate-xml-sitemap.html")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate sitemap.xml for compliance')
    parser.add_argument('--file', default='public/sitemap.xml', help='Path to sitemap.xml')
    args = parser.parse_args()
    
    validator = SitemapValidator(args.file)
    is_valid = validator.validate()
    
    return 0 if is_valid else 1

if __name__ == "__main__":
    sys.exit(main())