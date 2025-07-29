#!/usr/bin/env python3
"""
Comprehensive Image Reference Fix Script
Systematically fixes broken image references in blog posts.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple

class ImageReferenceFixer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.posts_dir = self.project_root / "src" / "newblog" / "data" / "posts"
        self.images_dir = self.project_root / "public" / "images"
        self.existing_images = set()
        self.broken_references = []
        self.fixed_references = []
        self.missing_images = []
        
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
        
        for field in image_fields:
            if field in data:
                image_path = data[field]
                if isinstance(image_path, str) and any(ext in image_path.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                    self._analyze_image_reference(file_path, field, image_path)
    
    def _analyze_image_reference(self, file_path: Path, field: str, image_path: str):
        """Analyze a single image reference."""
        # Clean the path
        clean_path = image_path.strip()
        
        # Remove leading /images/ if present
        if clean_path.startswith('/images/'):
            relative_path = clean_path[8:]  # Remove '/images/'
        elif clean_path.startswith('images/'):
            relative_path = clean_path[7:]   # Remove 'images/'
        else:
            relative_path = clean_path.lstrip('/')
        
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
                    'type': 'incorrect_format'
                })
        else:
            # Image doesn't exist, try to find alternatives
            alternative = self._find_image_alternative(relative_path)
            if alternative:
                self.broken_references.append({
                    'file': str(file_path),
                    'field': field,
                    'current': clean_path,
                    'correct': f"/images/{alternative}",
                    'type': 'wrong_extension'
                })
            else:
                self.missing_images.append({
                    'file': str(file_path),
                    'field': field,
                    'missing_path': clean_path,
                    'expected_relative': relative_path
                })
    
    def _find_image_alternative(self, relative_path: str) -> str:
        """Try to find an alternative image file with different extension."""
        base_name = Path(relative_path).stem
        
        # Try different extensions
        extensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif']
        
        for ext in extensions:
            candidate = f"{base_name}{ext}"
            if candidate in self.existing_images:
                return candidate
        
        # Try with different patterns
        for existing_img in self.existing_images:
            existing_base = Path(existing_img).stem
            if existing_base == base_name:
                return existing_img
        
        return None
    
    def fix_json_files(self):
        """Fix all identified broken references in JSON files."""
        print(f"🔧 Fixing {len(self.broken_references)} broken references...")
        
        files_to_fix = {}
        
        # Group fixes by file
        for fix in self.broken_references:
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
            data = json.load(f)
        
        # Apply fixes
        for fix in fixes:
            field = fix['field']
            if field in data:
                data[field] = fix['correct']
                self.fixed_references.append(fix)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def generate_report(self):
        """Generate a comprehensive report of the fixes."""
        report = []
        report.append("# Image Reference Fix Report")
        report.append(f"Generated on: {self._get_timestamp()}")
        report.append("")
        
        # Summary
        report.append("## Summary")
        report.append(f"- Total existing images: {len(self.existing_images)}")
        report.append(f"- Broken references found: {len(self.broken_references)}")
        report.append(f"- References fixed: {len(self.fixed_references)}")
        report.append(f"- Missing images: {len(self.missing_images)}")
        report.append("")
        
        # Fixed references
        if self.fixed_references:
            report.append("## Fixed References")
            for fix in self.fixed_references:
                file_name = Path(fix['file']).name
                report.append(f"- **{file_name}** ({fix['field']}): `{fix['current']}` → `{fix['correct']}`")
            report.append("")
        
        # Missing images
        if self.missing_images:
            report.append("## Missing Images That Need Creation")
            report.append("These images are referenced but don't exist:")
            report.append("")
            for missing in self.missing_images:
                file_name = Path(missing['file']).name
                report.append(f"- **{missing['expected_relative']}** (referenced in {file_name})")
            report.append("")
            
            # Group by pattern
            extensions = {}
            for missing in self.missing_images:
                ext = Path(missing['expected_relative']).suffix
                if ext not in extensions:
                    extensions[ext] = []
                extensions[ext].append(missing['expected_relative'])
            
            report.append("### Missing Images by Extension")
            for ext, images in extensions.items():
                report.append(f"**{ext} files ({len(images)})**:")
                for img in sorted(images):
                    report.append(f"- {img}")
                report.append("")
        
        # Most common issues
        if self.broken_references:
            report.append("## Common Issues Fixed")
            issue_types = {}
            for fix in self.broken_references:
                issue_type = fix['type']
                if issue_type not in issue_types:
                    issue_types[issue_type] = 0
                issue_types[issue_type] += 1
            
            for issue_type, count in issue_types.items():
                report.append(f"- **{issue_type}**: {count} instances")
            report.append("")
        
        return "\n".join(report)
    
    def _get_timestamp(self):
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def run_full_analysis(self):
        """Run the complete analysis and fix process."""
        print("🚀 Starting comprehensive image reference analysis...")
        
        # Step 1: Scan existing images
        self.scan_existing_images()
        
        # Step 2: Analyze JSON files
        self.analyze_json_files()
        
        # Step 3: Generate report before fixes
        print("\n📊 Analysis Results:")
        print(f"- Found {len(self.broken_references)} broken references")
        print(f"- Found {len(self.missing_images)} missing images")
        
        # Step 4: Ask for confirmation before fixing
        if self.broken_references:
            response = input(f"\n🔧 Fix {len(self.broken_references)} broken references? (y/n): ")
            if response.lower() == 'y':
                self.fix_json_files()
            else:
                print("⏭️  Skipping fixes")
        
        # Step 5: Generate final report
        report = self.generate_report()
        
        # Save report
        report_path = self.project_root / "image_fix_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n📋 Report saved to: {report_path}")
        
        return report

def main():
    # Detect project root
    current_dir = Path.cwd()
    project_root = current_dir
    
    # Look for package.json to confirm we're in the right place
    if not (project_root / "package.json").exists():
        print("❌ Could not find package.json. Please run from project root.")
        return
    
    fixer = ImageReferenceFixer(str(project_root))
    report = fixer.run_full_analysis()
    
    print("\n✅ Image reference analysis complete!")
    print("\n" + "="*50)
    print(report)

if __name__ == "__main__":
    main()