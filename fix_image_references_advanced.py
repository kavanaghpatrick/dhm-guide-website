#!/usr/bin/env python3
"""
Advanced Image Reference Fix Script for DHM Guide Website
Identifies and fixes broken image references in blog posts systematically.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from difflib import SequenceMatcher

class AdvancedImageReferenceFixer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.posts_dir = self.project_root / "src" / "newblog" / "data" / "posts"
        self.images_dir = self.project_root / "public" / "images"
        self.existing_images = set()
        self.broken_references = []
        self.fixed_references = []
        self.missing_images = []
        self.similarity_threshold = 0.6
        
    def scan_existing_images(self):
        """Scan public/images/ directory to catalog all available images."""
        print("🔍 Scanning existing images...")
        
        if not self.images_dir.exists():
            print(f"❌ Images directory not found: {self.images_dir}")
            return
            
        for img_path in self.images_dir.rglob("*"):
            if img_path.is_file() and img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']:
                # Store relative path from /images/
                rel_path = str(img_path.relative_to(self.images_dir))
                self.existing_images.add(rel_path)
        
        print(f"✅ Found {len(self.existing_images)} existing images")
        
    def find_similar_image(self, target_name: str) -> Tuple[str, float]:
        """Find most similar existing image based on filename."""
        if not target_name:
            return None, 0.0
            
        best_match = None
        best_score = 0.0
        
        target_base = Path(target_name).stem.lower()
        
        for existing_img in self.existing_images:
            existing_base = Path(existing_img).stem.lower()
            
            # Calculate similarity
            similarity = SequenceMatcher(None, target_base, existing_base).ratio()
            
            if similarity > best_score and similarity >= self.similarity_threshold:
                best_score = similarity
                best_match = existing_img
        
        return best_match, best_score
    
    def analyze_json_files(self):
        """Analyze all JSON files for image references."""
        print("🔍 Analyzing JSON files for image references...")
        
        json_files = list(self.posts_dir.glob("*.json"))
        print(f"Found {len(json_files)} JSON files to analyze")
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                self._check_json_image_fields(json_file, data)
                
            except Exception as e:
                print(f"❌ Error processing {json_file}: {e}")
    
    def _check_json_image_fields(self, file_path: Path, data: dict):
        """Check specific image fields in JSON data."""
        image_fields = ['image', 'hero', 'featured_image']
        
        def check_nested_dict(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    if key in image_fields and isinstance(value, str):
                        self._analyze_image_reference(file_path, current_path, value)
                    elif isinstance(value, (dict, list)):
                        check_nested_dict(value, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    current_path = f"{path}[{i}]"
                    check_nested_dict(item, current_path)
        
        check_nested_dict(data)
    
    def _analyze_image_reference(self, file_path: Path, field: str, image_path: str):
        """Analyze a single image reference."""
        if not image_path or not any(ext in image_path.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
            return
            
        # Clean the path
        clean_path = image_path.strip()
        
        # Handle different path formats
        relative_path = None
        
        if clean_path.startswith('/images/'):
            relative_path = clean_path[8:]  # Remove '/images/'
        elif clean_path.startswith('images/'):
            relative_path = clean_path[7:]   # Remove 'images/'
        elif clean_path.startswith('/'):
            relative_path = clean_path[1:]   # Remove leading '/'
        else:
            relative_path = clean_path
        
        # Handle blog/* paths - these should be /images/*
        if clean_path.startswith('/blog/') or clean_path.startswith('blog/'):
            relative_path = clean_path.replace('/blog/', '').replace('blog/', '')
            correct_path = f"/images/{relative_path}"
            
            # Check if this image exists or find similar
            if relative_path in self.existing_images:
                self.broken_references.append({
                    'file': str(file_path),
                    'field': field,
                    'current': clean_path,
                    'correct': correct_path,
                    'type': 'wrong_directory',
                    'confidence': 1.0
                })
            else:
                similar_img, similarity = self.find_similar_image(relative_path)
                if similar_img:
                    self.broken_references.append({
                        'file': str(file_path),
                        'field': field,
                        'current': clean_path,
                        'correct': f"/images/{similar_img}",
                        'type': 'wrong_directory_and_name',
                        'confidence': similarity
                    })
                else:
                    self.missing_images.append({
                        'file': str(file_path),
                        'field': field,
                        'missing_path': clean_path,
                        'expected_relative': relative_path
                    })
            return
        
        # Check if image exists
        if relative_path in self.existing_images:
            # Image exists, ensure path is correct format
            correct_path = f"/images/{relative_path}"
            if clean_path != correct_path:
                self.broken_references.append({
                    'file': str(file_path),
                    'field': field,
                    'current': clean_path,
                    'correct': correct_path,
                    'type': 'incorrect_format',
                    'confidence': 1.0
                })
        else:
            # Image doesn't exist, try to find alternatives
            similar_img, similarity = self.find_similar_image(relative_path)
            
            if similar_img:
                self.broken_references.append({
                    'file': str(file_path),
                    'field': field,
                    'current': clean_path,
                    'correct': f"/images/{similar_img}",
                    'type': 'similar_match',
                    'confidence': similarity
                })
            else:
                # Try extension variations
                alternative = self._find_extension_alternative(relative_path)
                if alternative:
                    self.broken_references.append({
                        'file': str(file_path),
                        'field': field,
                        'current': clean_path,
                        'correct': f"/images/{alternative}",
                        'type': 'wrong_extension',
                        'confidence': 1.0
                    })
                else:
                    self.missing_images.append({
                        'file': str(file_path),
                        'field': field,
                        'missing_path': clean_path,
                        'expected_relative': relative_path
                    })
    
    def _find_extension_alternative(self, relative_path: str) -> str:
        """Try to find an alternative image file with different extension."""
        base_name = Path(relative_path).stem
        dir_name = str(Path(relative_path).parent) if Path(relative_path).parent.name != '.' else ''
        
        # Try different extensions
        extensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif']
        
        for ext in extensions:
            if dir_name:
                candidate = f"{dir_name}/{base_name}{ext}"
            else:
                candidate = f"{base_name}{ext}"
            
            if candidate in self.existing_images:
                return candidate
        
        return None
    
    def fix_json_files(self, min_confidence: float = 0.7):
        """Fix all identified broken references in JSON files."""
        high_confidence_fixes = [fix for fix in self.broken_references if fix['confidence'] >= min_confidence]
        
        print(f"🔧 Fixing {len(high_confidence_fixes)} high-confidence broken references...")
        
        files_to_fix = {}
        
        # Group fixes by file
        for fix in high_confidence_fixes:
            file_path = fix['file']
            if file_path not in files_to_fix:
                files_to_fix[file_path] = []
            files_to_fix[file_path].append(fix)
        
        # Process each file
        for file_path, fixes in files_to_fix.items():
            try:
                self._fix_json_file(file_path, fixes)
                print(f"✅ Fixed {len(fixes)} references in {Path(file_path).name}")
            except Exception as e:
                print(f"❌ Error fixing {file_path}: {e}")
    
    def _fix_json_file(self, file_path: str, fixes: List[dict]):
        """Fix a single JSON file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply fixes by replacing the image paths in the JSON content
        for fix in fixes:
            old_path = fix['current']
            new_path = fix['correct']
            
            # Replace the specific field value
            content = content.replace(f'"{old_path}"', f'"{new_path}"')
            self.fixed_references.append(fix)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def create_missing_images_report(self):
        """Create a report of images that need to be created or found."""
        report = []
        report.append("# Missing Images Report")
        report.append(f"Generated on: {self._get_timestamp()}")
        report.append("")
        
        if self.missing_images:
            report.append("## Images That Need to be Created/Found")
            report.append("")
            
            # Group by extension
            by_extension = {}
            for missing in self.missing_images:
                ext = Path(missing['expected_relative']).suffix.lower()
                if ext not in by_extension:
                    by_extension[ext] = []
                by_extension[ext].append(missing)
            
            for ext, images in sorted(by_extension.items()):
                report.append(f"### {ext.upper()} files ({len(images)} missing)")
                report.append("")
                for img in images:
                    file_name = Path(img['file']).name
                    report.append(f"- `{img['expected_relative']}` (referenced in {file_name})")
                report.append("")
        
        # Low confidence fixes that need manual review
        low_confidence_fixes = [fix for fix in self.broken_references if fix['confidence'] < 0.7]
        if low_confidence_fixes:
            report.append("## Low Confidence Matches - Manual Review Needed")
            report.append("")
            for fix in low_confidence_fixes:
                file_name = Path(fix['file']).name
                report.append(f"- **{file_name}**: `{fix['current']}` → `{fix['correct']}` (confidence: {fix['confidence']:.2f})")
            report.append("")
        
        return "\n".join(report)
    
    def generate_comprehensive_report(self):
        """Generate a comprehensive report of the analysis and fixes."""
        report = []
        report.append("# Comprehensive Image Reference Fix Report")
        report.append(f"Generated on: {self._get_timestamp()}")
        report.append("")
        
        # Summary
        report.append("## Summary")
        report.append(f"- Total existing images: {len(self.existing_images)}")
        report.append(f"- Broken references found: {len(self.broken_references)}")
        report.append(f"- High-confidence fixes: {len([f for f in self.broken_references if f['confidence'] >= 0.7])}")
        report.append(f"- Low-confidence matches: {len([f for f in self.broken_references if f['confidence'] < 0.7])}")
        report.append(f"- References fixed: {len(self.fixed_references)}")
        report.append(f"- Missing images: {len(self.missing_images)}")
        report.append("")
        
        # Fixed references
        if self.fixed_references:
            report.append("## Fixed References")
            for fix in self.fixed_references:
                file_name = Path(fix['file']).name
                report.append(f"- **{file_name}** ({fix['field']}): `{fix['current']}` → `{fix['correct']}` [{fix['type']}]")
            report.append("")
        
        # Problem patterns
        if self.broken_references:
            report.append("## Problem Patterns Found")
            pattern_counts = {}
            for fix in self.broken_references:
                pattern = fix['type']
                pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
            
            for pattern, count in sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True):
                report.append(f"- **{pattern}**: {count} instances")
            report.append("")
        
        # Missing images summary
        if self.missing_images:
            report.append("## Missing Images Summary")
            report.append(f"Found {len(self.missing_images)} missing image references")
            
            # Common patterns in missing images
            patterns = {}
            for missing in self.missing_images:
                if 'blog/' in missing['missing_path']:
                    patterns['blog_directory'] = patterns.get('blog_directory', 0) + 1
                if missing['expected_relative'].endswith('.jpg'):
                    patterns['jpg_extension'] = patterns.get('jpg_extension', 0) + 1
                if missing['expected_relative'].endswith('.webp'):
                    patterns['webp_extension'] = patterns.get('webp_extension', 0) + 1
            
            if patterns:
                report.append("\n### Common Missing Image Patterns:")
                for pattern, count in patterns.items():
                    report.append(f"- {pattern}: {count} images")
            report.append("")
        
        return "\n".join(report)
    
    def _get_timestamp(self):
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def run_full_analysis(self, auto_fix: bool = False, min_confidence: float = 0.7):
        """Run the complete analysis and fix process."""
        print("🚀 Starting advanced image reference analysis...")
        
        # Step 1: Scan existing images
        self.scan_existing_images()
        
        # Step 2: Analyze JSON files
        self.analyze_json_files()
        
        # Step 3: Generate analysis results
        print("\n📊 Analysis Results:")
        print(f"- Found {len(self.broken_references)} broken references")
        print(f"- High-confidence fixes available: {len([f for f in self.broken_references if f['confidence'] >= min_confidence])}")
        print(f"- Found {len(self.missing_images)} missing images")
        
        # Step 4: Fix high-confidence issues if requested
        if auto_fix:
            self.fix_json_files(min_confidence)
        else:
            high_confidence_count = len([f for f in self.broken_references if f['confidence'] >= min_confidence])
            if high_confidence_count > 0:
                response = input(f"\n🔧 Fix {high_confidence_count} high-confidence broken references? (y/n): ")
                if response.lower() == 'y':
                    self.fix_json_files(min_confidence)
                else:
                    print("⏭️  Skipping fixes")
        
        # Step 5: Generate comprehensive report
        report = self.generate_comprehensive_report()
        
        # Save main report
        report_path = self.project_root / "image_fix_comprehensive_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Save missing images report
        missing_report = self.create_missing_images_report()
        missing_report_path = self.project_root / "missing_images_report.md"
        with open(missing_report_path, 'w', encoding='utf-8') as f:
            f.write(missing_report)
        
        print(f"\n📋 Reports saved to:")
        print(f"  - Comprehensive: {report_path}")
        print(f"  - Missing Images: {missing_report_path}")
        
        return report

def main():
    # Detect project root
    current_dir = Path.cwd()
    project_root = current_dir
    
    # Look for package.json to confirm we're in the right place
    if not (project_root / "package.json").exists():
        print("❌ Could not find package.json. Please run from project root.")
        return
    
    fixer = AdvancedImageReferenceFixer(str(project_root))
    report = fixer.run_full_analysis(auto_fix=True)
    
    print("\n✅ Advanced image reference analysis complete!")
    print("\n" + "="*80)
    print("Key Findings:")
    print(f"- {len(fixer.broken_references)} broken references identified")
    print(f"- {len(fixer.fixed_references)} references fixed")
    print(f"- {len(fixer.missing_images)} images need to be created/found")

if __name__ == "__main__":
    main()