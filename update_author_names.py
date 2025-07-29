#!/usr/bin/env python3
"""
Script to update all instances of "Manus AI" (and variations) to "DHM Guide Team"
across metadata/index.json and all post JSON files.

Features:
- Case-insensitive matching
- Creates backups before modifying
- Reports how many files were updated
- Handles various author name formats
"""

import json
import os
import re
import shutil
from datetime import datetime
from pathlib import Path


class AuthorNameUpdater:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.backup_dir = self.base_dir / "backups" / f"author_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.files_updated = 0
        self.total_replacements = 0
        self.new_author_name = "DHM Guide Team"
        
        # Pattern to match variations of "Manus AI" or just "Manus"
        # This will match: Manus AI, Manus, manus ai, MANUS AI, etc.
        self.author_pattern = re.compile(r'\bmanus(?:\s+ai)?\b', re.IGNORECASE)
        
    def create_backup(self, file_path):
        """Create a backup of the file before modifying."""
        relative_path = file_path.relative_to(self.base_dir)
        backup_path = self.backup_dir / relative_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file_path, backup_path)
        
    def update_author_in_dict(self, data, file_path):
        """Recursively update author fields in a dictionary."""
        replacements = 0
        
        if isinstance(data, dict):
            for key, value in data.items():
                if key == "author" and isinstance(value, str):
                    # Check if the value matches our pattern
                    if self.author_pattern.search(value):
                        old_value = value
                        data[key] = self.new_author_name
                        replacements += 1
                        print(f"  - Updated author from '{old_value}' to '{self.new_author_name}'")
                elif isinstance(value, (dict, list)):
                    replacements += self.update_author_in_dict(value, file_path)
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, (dict, list)):
                    replacements += self.update_author_in_dict(item, file_path)
                    
        return replacements
    
    def process_json_file(self, file_path):
        """Process a single JSON file."""
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                data = json.loads(content)
            
            # Update author fields
            replacements = self.update_author_in_dict(data, file_path)
            
            if replacements > 0:
                # Create backup
                self.create_backup(file_path)
                
                # Write updated content
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                self.files_updated += 1
                self.total_replacements += replacements
                print(f"✓ Updated {file_path.relative_to(self.base_dir)} ({replacements} replacement{'s' if replacements > 1 else ''})")
                
        except json.JSONDecodeError as e:
            print(f"✗ Error parsing JSON in {file_path}: {e}")
        except Exception as e:
            print(f"✗ Error processing {file_path}: {e}")
    
    def run(self):
        """Run the author name update process."""
        print(f"Starting author name update process...")
        print(f"Updating all variations of 'Manus AI' to '{self.new_author_name}'")
        print(f"Creating backups in: {self.backup_dir.relative_to(self.base_dir)}")
        print("-" * 60)
        
        # Process metadata/index.json
        metadata_file = self.base_dir / "src" / "newblog" / "data" / "metadata" / "index.json"
        if metadata_file.exists():
            print("\nProcessing metadata/index.json...")
            self.process_json_file(metadata_file)
        else:
            print(f"\n✗ Metadata file not found: {metadata_file}")
        
        # Process all post JSON files
        posts_dir = self.base_dir / "src" / "newblog" / "data" / "posts"
        if posts_dir.exists():
            print("\nProcessing post JSON files...")
            json_files = list(posts_dir.glob("*.json"))
            print(f"Found {len(json_files)} JSON files in posts directory")
            
            for json_file in sorted(json_files):
                self.process_json_file(json_file)
        else:
            print(f"\n✗ Posts directory not found: {posts_dir}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("SUMMARY:")
        print(f"- Files updated: {self.files_updated}")
        print(f"- Total replacements: {self.total_replacements}")
        print(f"- Backups created in: {self.backup_dir.relative_to(self.base_dir)}")
        
        if self.files_updated > 0:
            print(f"\n✓ Successfully updated {self.files_updated} file{'s' if self.files_updated > 1 else ''}")
            print(f"  All original files have been backed up")
        else:
            print("\n✓ No files needed updating (no 'Manus AI' variations found)")


def main():
    """Main function."""
    # Get the base directory (current working directory)
    base_dir = Path.cwd()
    
    # Confirm with user
    print("Author Name Update Script")
    print("========================")
    print(f"Base directory: {base_dir}")
    print(f"This will update all variations of 'Manus AI' to 'DHM Guide Team'")
    print("Files to be processed:")
    print("- src/newblog/data/metadata/index.json")
    print("- All JSON files in src/newblog/data/posts/")
    print("\nBackups will be created before any modifications.")
    
    response = input("\nDo you want to proceed? (yes/no): ").strip().lower()
    if response != 'yes':
        print("Operation cancelled.")
        return
    
    # Run the updater
    updater = AuthorNameUpdater(base_dir)
    updater.run()


if __name__ == "__main__":
    main()