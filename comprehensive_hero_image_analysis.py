#!/usr/bin/env python3
"""
Comprehensive Hero Image Analysis for DHM Guide Website
Analyzes all 202 blog posts to identify missing hero images and patterns.
"""

import json
import os
import glob
from pathlib import Path
from collections import defaultdict
import re
from datetime import datetime

class HeroImageAnalyzer:
    def __init__(self):
        self.posts_dir = Path("/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts")
        self.images_dir = Path("/Users/patrickkavanagh/dhm-guide-website/public/images")
        self.posts_data = []
        self.missing_images = []
        self.existing_images = set()
        self.unused_images = set()
        self.image_patterns = defaultdict(list)
        
    def load_all_posts(self):
        """Load all JSON blog posts"""
        print("Loading all blog posts...")
        json_files = list(self.posts_dir.glob("*.json"))
        
        # Filter out non-post files
        json_files = [f for f in json_files if f.name not in ['index.js']]
        
        print(f"Found {len(json_files)} JSON files")
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    post_data = json.load(f)
                    post_data['filename'] = json_file.name
                    post_data['filepath'] = str(json_file)
                    self.posts_data.append(post_data)
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"Error loading {json_file}: {e}")
        
        print(f"Successfully loaded {len(self.posts_data)} posts")
    
    def get_existing_images(self):
        """Get all existing images in the public/images directory"""
        print("Scanning existing images...")
        
        # Get all image files (webp, jpg, png)
        image_extensions = ['*.webp', '*.jpg', '*.jpeg', '*.png']
        for ext in image_extensions:
            for img_path in self.images_dir.glob(ext):
                self.existing_images.add(img_path.name)
        
        print(f"Found {len(self.existing_images)} existing images")
    
    def analyze_missing_images(self):
        """Analyze which posts have missing hero images"""
        print("Analyzing missing hero images...")
        
        for post in self.posts_data:
            image_field = post.get('image', '')
            post_id = post.get('id', post.get('slug', post['filename'].replace('.json', '')))
            title = post.get('title', 'No title')
            date = post.get('publishedAt', post.get('date', ''))
            category = post.get('category', 'Uncategorized')
            
            missing_info = {
                'post_id': post_id,
                'filename': post['filename'],
                'title': title,
                'date': date,
                'category': category,
                'image_field': str(image_field),
                'missing_type': None,
                'priority_score': 0
            }
            
            # Handle both string and object image fields
            actual_image_path = ''
            if not image_field:
                missing_info['missing_type'] = 'no_image_field'
                missing_info['priority_score'] = 10  # High priority
                self.missing_images.append(missing_info)
            else:
                # Extract image path - could be string or nested object
                if isinstance(image_field, dict):
                    # First check if there's a direct 'image' string field
                    if 'image' in image_field and isinstance(image_field['image'], str):
                        actual_image_path = image_field['image']
                    # Check for nested image object with 'src'
                    elif 'image' in image_field and isinstance(image_field['image'], dict):
                        nested_image = image_field['image']
                        actual_image_path = nested_image.get('src', '')
                    # Check for direct 'src' field
                    elif 'src' in image_field:
                        actual_image_path = image_field['src']
                    else:
                        actual_image_path = ''
                elif isinstance(image_field, str):
                    actual_image_path = image_field
                else:
                    missing_info['missing_type'] = 'invalid_image_field'
                    missing_info['priority_score'] = 9
                    self.missing_images.append(missing_info)
                    continue
                
                if not actual_image_path:
                    missing_info['missing_type'] = 'empty_image_path'
                    missing_info['priority_score'] = 9
                    self.missing_images.append(missing_info)
                    continue
                
                # Extract just the filename from the image path
                if actual_image_path.startswith('/images/'):
                    image_filename = actual_image_path.replace('/images/', '')
                elif actual_image_path.startswith('images/'):
                    image_filename = actual_image_path.replace('images/', '')
                elif actual_image_path.startswith('/'):
                    image_filename = actual_image_path[1:]  # Remove leading slash
                else:
                    image_filename = actual_image_path
                
                # Check if the image exists
                if image_filename not in self.existing_images:
                    missing_info['missing_type'] = 'image_not_found'
                    missing_info['expected_filename'] = image_filename
                    missing_info['actual_image_path'] = actual_image_path
                    missing_info['priority_score'] = 8  # Medium-high priority
                    self.missing_images.append(missing_info)
        
        print(f"Found {len(self.missing_images)} posts with missing images")
    
    def categorize_missing_patterns(self):
        """Categorize missing images by patterns"""
        print("Analyzing missing image patterns...")
        
        pattern_analysis = {
            'by_category': defaultdict(list),
            'by_date_year': defaultdict(list),
            'by_naming_pattern': defaultdict(list),
            'by_missing_type': defaultdict(list)
        }
        
        for missing in self.missing_images:
            # By category
            pattern_analysis['by_category'][missing['category']].append(missing)
            
            # By year
            if missing['date']:
                try:
                    # Try different date formats
                    date_str = missing['date']
                    if 'T' in date_str:
                        year = datetime.fromisoformat(date_str.replace('Z', '+00:00')).year
                    else:
                        year = datetime.strptime(date_str[:10], '%Y-%m-%d').year
                    pattern_analysis['by_date_year'][year].append(missing)
                except:
                    pattern_analysis['by_date_year']['unknown'].append(missing)
            else:
                pattern_analysis['by_date_year']['no_date'].append(missing)
            
            # By missing type
            pattern_analysis['by_missing_type'][missing['missing_type']].append(missing)
            
            # By naming pattern
            if missing['missing_type'] == 'image_not_found':
                expected = missing.get('expected_filename', '')
                if 'hero' in expected.lower():
                    pattern_analysis['by_naming_pattern']['hero_pattern'].append(missing)
                elif expected.endswith('.webp'):
                    pattern_analysis['by_naming_pattern']['webp_extension'].append(missing)
                elif expected.endswith('.jpg'):
                    pattern_analysis['by_naming_pattern']['jpg_extension'].append(missing)
                else:
                    pattern_analysis['by_naming_pattern']['other_pattern'].append(missing)
        
        return pattern_analysis
    
    def calculate_priority_scores(self):
        """Calculate priority scores based on SEO importance"""
        print("Calculating priority scores...")
        
        # Enhance priority scores based on various factors
        for missing in self.missing_images:
            score = missing['priority_score']
            
            # Category-based priorities
            high_priority_categories = ['Health', 'Supplements', 'Science', 'Reviews']
            if missing['category'] in high_priority_categories:
                score += 3
            
            # Date-based priorities (newer posts get higher priority)
            if missing['date']:
                try:
                    if '2025' in missing['date']:
                        score += 4
                    elif '2024' in missing['date']:
                        score += 2
                except:
                    pass
            
            # Title-based priorities
            title_lower = missing['title'].lower()
            high_priority_keywords = ['dhm', 'hangover', 'guide', 'complete', 'ultimate', 'review']
            for keyword in high_priority_keywords:
                if keyword in title_lower:
                    score += 1
            
            missing['priority_score'] = min(score, 20)  # Cap at 20
    
    def find_unused_images(self):
        """Find images that exist but aren't referenced by any posts"""
        print("Finding unused images...")
        
        referenced_images = set()
        for post in self.posts_data:
            image_field = post.get('image', '')
            if image_field:
                # Handle both string and nested object image fields
                actual_image_path = ''
                if isinstance(image_field, dict):
                    # First check if there's a direct 'image' string field
                    if 'image' in image_field and isinstance(image_field['image'], str):
                        actual_image_path = image_field['image']
                    # Check for nested image object with 'src'
                    elif 'image' in image_field and isinstance(image_field['image'], dict):
                        nested_image = image_field['image']
                        actual_image_path = nested_image.get('src', '')
                    # Check for direct 'src' field
                    elif 'src' in image_field:
                        actual_image_path = image_field['src']
                elif isinstance(image_field, str):
                    actual_image_path = image_field
                
                if actual_image_path:
                    if actual_image_path.startswith('/images/'):
                        image_filename = actual_image_path.replace('/images/', '')
                    elif actual_image_path.startswith('images/'):
                        image_filename = actual_image_path.replace('images/', '')
                    elif actual_image_path.startswith('/'):
                        image_filename = actual_image_path[1:]  # Remove leading slash
                    else:
                        image_filename = actual_image_path
                    referenced_images.add(image_filename)
        
        self.unused_images = self.existing_images - referenced_images
        print(f"Found {len(self.unused_images)} unused images")
    
    def suggest_image_strategies(self):
        """Suggest strategies for handling missing images"""
        strategies = {
            'immediate_actions': [],
            'batch_generation': [],
            'repurpose_existing': [],
            'path_fixes': []
        }
        
        for missing in self.missing_images:
            if missing['missing_type'] == 'no_image_field':
                strategies['immediate_actions'].append({
                    'action': 'Generate hero image',
                    'post': missing['post_id'],
                    'suggested_name': f"{missing['post_id']}-hero.webp",
                    'priority': missing['priority_score']
                })
            elif missing['missing_type'] == 'image_not_found':
                # Check if similar image exists
                expected = missing.get('expected_filename', '')
                similar_found = False
                
                for existing_img in self.existing_images:
                    # Check for similar filenames
                    if self.calculate_similarity(expected, existing_img) > 0.8:
                        strategies['path_fixes'].append({
                            'action': 'Update image path',
                            'post': missing['post_id'],
                            'current_path': expected,
                            'suggested_path': existing_img,
                            'priority': missing['priority_score']
                        })
                        similar_found = True
                        break
                
                if not similar_found:
                    strategies['batch_generation'].append({
                        'action': 'Generate missing image',
                        'post': missing['post_id'],
                        'expected_name': expected,
                        'priority': missing['priority_score']
                    })
        
        return strategies
    
    def calculate_similarity(self, str1, str2):
        """Calculate string similarity using a simple approach"""
        if not str1 or not str2:
            return 0
        
        # Remove extensions for comparison
        str1_base = str1.lower().rsplit('.', 1)[0]
        str2_base = str2.lower().rsplit('.', 1)[0]
        
        # Simple substring matching
        if str1_base in str2_base or str2_base in str1_base:
            return 0.9
        
        # Check for common keywords
        common_parts = set(str1_base.split('-')) & set(str2_base.split('-'))
        if len(common_parts) > 2:
            return 0.8
        
        return 0
    
    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("Generating comprehensive report...")
        
        patterns = self.categorize_missing_patterns()
        strategies = self.suggest_image_strategies()
        
        report = f"""
# COMPREHENSIVE HERO IMAGE ANALYSIS REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## EXECUTIVE SUMMARY
- Total blog posts analyzed: {len(self.posts_data)}
- Posts with missing hero images: {len(self.missing_images)}
- Missing image rate: {(len(self.missing_images)/len(self.posts_data)*100):.1f}%
- Total existing images: {len(self.existing_images)}
- Unused images available: {len(self.unused_images)}

## MISSING IMAGES BREAKDOWN

### By Missing Type:
"""
        
        for missing_type, posts in patterns['by_missing_type'].items():
            report += f"- {missing_type.replace('_', ' ').title()}: {len(posts)} posts\n"
        
        report += f"""
### By Category:
"""
        for category, posts in sorted(patterns['by_category'].items(), key=lambda x: len(x[1]), reverse=True):
            report += f"- {category}: {len(posts)} posts\n"
        
        report += f"""
### By Year:
"""
        for year, posts in sorted(patterns['by_date_year'].items(), key=lambda x: str(x[0]), reverse=True):
            report += f"- {year}: {len(posts)} posts\n"
        
        report += f"""
## HIGH PRIORITY MISSING IMAGES (Score >= 15)
"""
        high_priority = sorted([m for m in self.missing_images if m['priority_score'] >= 15], 
                              key=lambda x: x['priority_score'], reverse=True)
        
        for missing in high_priority[:20]:  # Top 20
            report += f"""
### {missing['title'][:60]}...
- File: {missing['filename']}
- Category: {missing['category']}
- Date: {missing['date']}
- Missing Type: {missing['missing_type']}
- Priority Score: {missing['priority_score']}
- Expected Image: {missing.get('expected_filename', 'N/A')}
"""
        
        report += f"""
## SUGGESTED ACTION STRATEGIES

### Immediate Actions Required ({len(strategies['immediate_actions'])} items):
"""
        for action in sorted(strategies['immediate_actions'], key=lambda x: x['priority'], reverse=True)[:10]:
            report += f"- Generate {action['suggested_name']} for {action['post']} (Priority: {action['priority']})\n"
        
        report += f"""
### Path Fixes Required ({len(strategies['path_fixes'])} items):
"""
        for fix in sorted(strategies['path_fixes'], key=lambda x: x['priority'], reverse=True)[:10]:
            report += f"- Update {fix['post']}: {fix['current_path']} → {fix['suggested_path']} (Priority: {fix['priority']})\n"
        
        report += f"""
### Batch Generation Needed ({len(strategies['batch_generation'])} items):
"""
        for gen in sorted(strategies['batch_generation'], key=lambda x: x['priority'], reverse=True)[:10]:
            report += f"- Generate {gen['expected_name']} for {gen['post']} (Priority: {gen['priority']})\n"
        
        report += f"""
## UNUSED IMAGES THAT COULD BE REPURPOSED ({len(self.unused_images)} total)
"""
        unused_list = sorted(list(self.unused_images))
        for unused in unused_list[:20]:  # Show first 20
            report += f"- {unused}\n"
        
        report += f"""
## DETAILED MISSING IMAGES LIST
"""
        for missing in sorted(self.missing_images, key=lambda x: x['priority_score'], reverse=True):
            report += f"""
### {missing['post_id']}
- Title: {missing['title']}
- File: {missing['filename']}
- Category: {missing['category']}
- Date: {missing['date']}
- Missing Type: {missing['missing_type']}
- Priority Score: {missing['priority_score']}
- Current Image Field: {missing['image_field']}
- Expected Filename: {missing.get('expected_filename', 'N/A')}
"""
        
        return report
    
    def save_detailed_json_report(self):
        """Save detailed analysis as JSON for further processing"""
        detailed_data = {
            'analysis_date': datetime.now().isoformat(),
            'summary': {
                'total_posts': len(self.posts_data),
                'missing_images_count': len(self.missing_images),
                'missing_rate_percent': round(len(self.missing_images)/len(self.posts_data)*100, 2),
                'existing_images_count': len(self.existing_images),
                'unused_images_count': len(self.unused_images)
            },
            'missing_images': self.missing_images,
            'unused_images': sorted(list(self.unused_images)),
            'patterns': self.categorize_missing_patterns(),
            'strategies': self.suggest_image_strategies()
        }
        
        json_file = Path("/Users/patrickkavanagh/dhm-guide-website/comprehensive_hero_image_analysis.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(detailed_data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"Detailed JSON report saved to: {json_file}")
        return json_file
    
    def run_analysis(self):
        """Run the complete analysis"""
        print("=" * 60)
        print("COMPREHENSIVE HERO IMAGE ANALYSIS")
        print("=" * 60)
        
        self.load_all_posts()
        self.get_existing_images()
        self.analyze_missing_images()
        self.calculate_priority_scores()
        self.find_unused_images()
        
        # Generate and save reports
        report = self.generate_report()
        json_file = self.save_detailed_json_report()
        
        # Save text report
        report_file = Path("/Users/patrickkavanagh/dhm-guide-website/comprehensive_hero_image_analysis_report.md")
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"Analysis complete!")
        print(f"Text report saved to: {report_file}")
        print(f"JSON data saved to: {json_file}")
        
        return report_file, json_file

if __name__ == "__main__":
    analyzer = HeroImageAnalyzer()
    analyzer.run_analysis()