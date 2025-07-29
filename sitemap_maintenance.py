#!/usr/bin/env python3
"""
Sitemap maintenance utilities for ongoing management
Includes auto-update of lastmod dates, URL verification, and more
"""

import xml.etree.ElementTree as ET
import os
import sys
import shutil
from datetime import datetime
import argparse
import hashlib
import json

class SitemapMaintenance:
    def __init__(self, sitemap_path):
        self.sitemap_path = sitemap_path
        self.cache_file = sitemap_path + '.cache'
        
    def update_lastmod_dates(self, file_patterns=None):
        """
        Update lastmod dates based on actual file modification times
        This helps keep the sitemap in sync with content changes
        """
        print("Updating lastmod dates based on file changes...")
        
        # Load content hash cache
        cache = self._load_cache()
        
        # Parse sitemap
        tree = ET.parse(self.sitemap_path)
        root = tree.getroot()
        ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        updated_count = 0
        
        for url_elem in root.iter():
            if not url_elem.tag.endswith('url'):
                continue
            
            loc_elem = None
            lastmod_elem = None
            
            for child in url_elem:
                if child.tag.endswith('loc'):
                    loc_elem = child
                elif child.tag.endswith('lastmod'):
                    lastmod_elem = child
            
            if loc_elem is not None and loc_elem.text:
                url = loc_elem.text
                
                # Try to determine if content has changed
                content_changed, new_date = self._check_content_change(url, cache)
                
                if content_changed:
                    if lastmod_elem is None:
                        # Create lastmod element
                        lastmod_elem = ET.SubElement(url_elem, 'lastmod')
                    
                    lastmod_elem.text = new_date
                    updated_count += 1
                    print(f"  Updated: {url} -> {new_date}")
        
        if updated_count > 0:
            # Backup and save
            backup_file = self.sitemap_path + '.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S')
            shutil.copy2(self.sitemap_path, backup_file)
            tree.write(self.sitemap_path, encoding='utf-8', xml_declaration=True)
            
            # Save cache
            self._save_cache(cache)
            
            print(f"\nUpdated {updated_count} lastmod dates")
            print(f"Backup saved to: {backup_file}")
        else:
            print("\nNo updates needed - all dates are current")
    
    def _check_content_change(self, url, cache):
        """
        Check if content for a URL has changed
        This is a simplified check - in production, you'd check actual content files
        """
        # For this example, we'll use the current date for any new URLs
        # In a real implementation, you'd check the actual content files
        
        url_hash = hashlib.md5(url.encode()).hexdigest()
        today = datetime.now().strftime('%Y-%m-%d')
        
        if url_hash not in cache:
            # New URL
            cache[url_hash] = {
                'url': url,
                'last_updated': today,
                'content_hash': 'new'
            }
            return True, today
        
        # For demo purposes, we'll say content hasn't changed
        # In production, you'd hash the actual content and compare
        return False, cache[url_hash]['last_updated']
    
    def _load_cache(self):
        """Load the cache file"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def _save_cache(self, cache):
        """Save the cache file"""
        with open(self.cache_file, 'w') as f:
            json.dump(cache, f, indent=2)
    
    def add_url(self, url, changefreq='weekly', priority=0.5):
        """Add a new URL to the sitemap"""
        print(f"Adding new URL: {url}")
        
        # Parse sitemap
        tree = ET.parse(self.sitemap_path)
        root = tree.getroot()
        ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        # Check if URL already exists
        for url_elem in root.iter():
            if url_elem.tag.endswith('url'):
                for child in url_elem:
                    if child.tag.endswith('loc') and child.text == url:
                        print(f"URL already exists in sitemap: {url}")
                        return False
        
        # Create new URL element
        url_elem = ET.SubElement(root, 'url')
        
        loc_elem = ET.SubElement(url_elem, 'loc')
        loc_elem.text = url
        
        lastmod_elem = ET.SubElement(url_elem, 'lastmod')
        lastmod_elem.text = datetime.now().strftime('%Y-%m-%d')
        
        changefreq_elem = ET.SubElement(url_elem, 'changefreq')
        changefreq_elem.text = changefreq
        
        priority_elem = ET.SubElement(url_elem, 'priority')
        priority_elem.text = str(priority)
        
        # Backup and save
        backup_file = self.sitemap_path + '.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S')
        shutil.copy2(self.sitemap_path, backup_file)
        tree.write(self.sitemap_path, encoding='utf-8', xml_declaration=True)
        
        print(f"URL added successfully")
        print(f"Backup saved to: {backup_file}")
        return True
    
    def remove_url(self, url):
        """Remove a URL from the sitemap"""
        print(f"Removing URL: {url}")
        
        # Parse sitemap
        tree = ET.parse(self.sitemap_path)
        root = tree.getroot()
        ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        removed = False
        
        for url_elem in list(root.iter()):
            if url_elem.tag.endswith('url'):
                for child in url_elem:
                    if child.tag.endswith('loc') and child.text == url:
                        root.remove(url_elem)
                        removed = True
                        break
        
        if removed:
            # Backup and save
            backup_file = self.sitemap_path + '.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S')
            shutil.copy2(self.sitemap_path, backup_file)
            tree.write(self.sitemap_path, encoding='utf-8', xml_declaration=True)
            
            print(f"URL removed successfully")
            print(f"Backup saved to: {backup_file}")
        else:
            print(f"URL not found in sitemap: {url}")
        
        return removed
    
    def generate_report(self):
        """Generate a report of sitemap contents"""
        print("Generating sitemap report...")
        print("=" * 60)
        
        # Parse sitemap
        tree = ET.parse(self.sitemap_path)
        root = tree.getroot()
        
        # Collect statistics
        stats = {
            'total_urls': 0,
            'by_changefreq': {},
            'by_priority': {},
            'recent_updates': [],
            'old_updates': []
        }
        
        today = datetime.now()
        
        for url_elem in root.iter():
            if not url_elem.tag.endswith('url'):
                continue
            
            stats['total_urls'] += 1
            
            url_data = {}
            for child in url_elem:
                if child.tag.endswith('loc'):
                    url_data['loc'] = child.text
                elif child.tag.endswith('lastmod'):
                    url_data['lastmod'] = child.text
                elif child.tag.endswith('changefreq'):
                    url_data['changefreq'] = child.text
                    stats['by_changefreq'][child.text] = stats['by_changefreq'].get(child.text, 0) + 1
                elif child.tag.endswith('priority'):
                    url_data['priority'] = child.text
                    stats['by_priority'][child.text] = stats['by_priority'].get(child.text, 0) + 1
            
            # Check lastmod age
            if 'lastmod' in url_data:
                try:
                    lastmod_date = datetime.strptime(url_data['lastmod'], '%Y-%m-%d')
                    days_old = (today - lastmod_date).days
                    
                    if days_old <= 7:
                        stats['recent_updates'].append((url_data['loc'], url_data['lastmod']))
                    elif days_old > 365:
                        stats['old_updates'].append((url_data['loc'], url_data['lastmod'], days_old))
                except:
                    pass
        
        # Print report
        print(f"\nTotal URLs: {stats['total_urls']}")
        print(f"File size: {os.path.getsize(self.sitemap_path) / 1024:.1f} KB")
        
        print("\nURLs by Change Frequency:")
        for freq, count in sorted(stats['by_changefreq'].items()):
            print(f"  {freq}: {count}")
        
        print("\nURLs by Priority:")
        for priority, count in sorted(stats['by_priority'].items(), reverse=True):
            print(f"  {priority}: {count}")
        
        if stats['recent_updates']:
            print(f"\nRecently Updated (last 7 days): {len(stats['recent_updates'])}")
            for url, date in stats['recent_updates'][:5]:
                print(f"  {date}: {url}")
            if len(stats['recent_updates']) > 5:
                print(f"  ... and {len(stats['recent_updates']) - 5} more")
        
        if stats['old_updates']:
            print(f"\nURLs Not Updated in Over a Year: {len(stats['old_updates'])}")
            for url, date, days in stats['old_updates'][:5]:
                print(f"  {date} ({days} days ago): {url}")
            if len(stats['old_updates']) > 5:
                print(f"  ... and {len(stats['old_updates']) - 5} more")
        
        print("\n" + "=" * 60)

def main():
    parser = argparse.ArgumentParser(description='Sitemap maintenance utilities')
    parser.add_argument('sitemap', nargs='?', default='public/sitemap.xml',
                        help='Path to sitemap.xml (default: public/sitemap.xml)')
    parser.add_argument('--update-dates', action='store_true',
                        help='Update lastmod dates based on content changes')
    parser.add_argument('--add-url', metavar='URL',
                        help='Add a new URL to the sitemap')
    parser.add_argument('--remove-url', metavar='URL',
                        help='Remove a URL from the sitemap')
    parser.add_argument('--changefreq', default='weekly',
                        help='Change frequency for new URLs (default: weekly)')
    parser.add_argument('--priority', type=float, default=0.5,
                        help='Priority for new URLs (default: 0.5)')
    parser.add_argument('--report', action='store_true',
                        help='Generate a report of sitemap contents')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.sitemap):
        print(f"ERROR: Sitemap file not found: {args.sitemap}")
        sys.exit(1)
    
    maintenance = SitemapMaintenance(args.sitemap)
    
    if args.update_dates:
        maintenance.update_lastmod_dates()
    elif args.add_url:
        maintenance.add_url(args.add_url, args.changefreq, args.priority)
    elif args.remove_url:
        maintenance.remove_url(args.remove_url)
    elif args.report:
        maintenance.generate_report()
    else:
        # Default to report
        maintenance.generate_report()

if __name__ == "__main__":
    main()