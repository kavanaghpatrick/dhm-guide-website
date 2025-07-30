#!/usr/bin/env python3
"""
Comprehensive Special Characters & Encoding Analysis for JSON files
Analyzes all JSON files for special characters, HTML entities, and encoding issues
"""

import json
import os
import re
from collections import defaultdict, Counter

def analyze_special_characters(directory):
    """Analyze all JSON files for special characters and encoding issues"""
    
    # Initialize counters and collections
    results = {
        'total_files': 0,
        'files_with_issues': 0,
        'smart_quotes': {'files': set(), 'count': 0, 'examples': []},
        'em_dashes': {'files': set(), 'count': 0, 'examples': []},
        'en_dashes': {'files': set(), 'count': 0, 'examples': []},
        'ellipsis': {'files': set(), 'count': 0, 'examples': []},
        'html_entities': {'files': set(), 'count': 0, 'examples': []},
        'escape_sequences': {'files': set(), 'count': 0, 'examples': []},
        'non_breaking_spaces': {'files': set(), 'count': 0, 'examples': []},
        'zero_width_chars': {'files': set(), 'count': 0, 'examples': []},
        'other_unicode': {'files': set(), 'count': 0, 'examples': []},
        'json_parse_errors': {'files': set(), 'count': 0, 'examples': []},
        'malformed_entities': {'files': set(), 'count': 0, 'examples': []},
        'problematic_escapes': {'files': set(), 'count': 0, 'examples': []},
        'encoding_issues': {'files': set(), 'count': 0, 'examples': []}
    }
    
    # Pattern definitions
    patterns = {
        'smart_quotes_open': r'[""]',      # Smart opening quotes
        'smart_quotes_close': r'[""]',     # Smart closing quotes
        'smart_single_quotes': r'['']',    # Smart single quotes
        'em_dash': r'—',                   # Em dash
        'en_dash': r'–',                   # En dash
        'ellipsis': r'…',                  # Horizontal ellipsis
        'html_entities': r'&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9a-fA-F]+;',  # HTML entities
        'malformed_entities': r'&[a-zA-Z][a-zA-Z0-9]*[^;]|&#[0-9]+[^;]|&#x[0-9a-fA-F]+[^;]',  # Malformed entities
        'escape_sequences': r'\\[nrtbf"\\\/]',  # JSON escape sequences
        'problematic_escapes': r'\\[^nrtbf"\\\/uU]',  # Invalid escape sequences
        'non_breaking_space': r'\u00A0',       # Non-breaking space
        'zero_width_space': r'\u200B',         # Zero-width space
        'zero_width_non_joiner': r'\u200C',    # Zero-width non-joiner
        'zero_width_joiner': r'\u200D',        # Zero-width joiner
        'word_joiner': r'\u2060',              # Word joiner
        'byte_order_mark': r'\uFEFF',          # Byte order mark
    }
    
    # Additional Unicode ranges to check
    unicode_ranges = [
        (0x2000, 0x206F, 'General Punctuation'),
        (0x2070, 0x209F, 'Superscripts and Subscripts'),
        (0x20A0, 0x20CF, 'Currency Symbols'),
        (0x2100, 0x214F, 'Letterlike Symbols'),
        (0x2150, 0x218F, 'Number Forms'),
        (0x2190, 0x21FF, 'Arrows'),
        (0x2200, 0x22FF, 'Mathematical Operators'),
    ]
    
    # Process all JSON files
    for filename in os.listdir(directory):
        if not filename.endswith('.json'):
            continue
            
        results['total_files'] += 1
        filepath = os.path.join(directory, filename)
        file_has_issues = False
        
        try:
            # Try to read with different encodings
            content = None
            encoding_used = None
            
            for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
                try:
                    with open(filepath, 'r', encoding=encoding) as f:
                        content = f.read()
                        encoding_used = encoding
                        break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                results['encoding_issues']['files'].add(filename)
                results['encoding_issues']['count'] += 1
                results['encoding_issues']['examples'].append(f"{filename}: Could not decode with any encoding")
                file_has_issues = True
                continue
            
            # Check if it's valid JSON
            try:
                json_data = json.loads(content)
            except json.JSONDecodeError as e:
                results['json_parse_errors']['files'].add(filename)
                results['json_parse_errors']['count'] += 1
                results['json_parse_errors']['examples'].append(f"{filename}: {str(e)}")
                file_has_issues = True
                # Continue with text analysis even if JSON parsing fails
            
            # Analyze content for patterns
            def check_pattern(pattern_name, pattern, category_key):
                nonlocal file_has_issues
                matches = re.findall(pattern, content)
                if matches:
                    results[category_key]['files'].add(filename)
                    results[category_key]['count'] += len(matches)
                    
                    # Add examples (limit to first 3 per file)
                    for i, match in enumerate(matches[:3]):
                        line_num = content[:content.find(match)].count('\n') + 1
                        context_start = max(0, content.find(match) - 50)
                        context_end = min(len(content), content.find(match) + len(match) + 50)
                        context = content[context_start:context_end].replace('\n', '\\n')
                        
                        results[category_key]['examples'].append({
                            'file': filename,
                            'line': line_num,
                            'match': match,
                            'context': context
                        })
                    
                    file_has_issues = True
            
            # Check all patterns
            check_pattern('smart_quotes_open', patterns['smart_quotes_open'], 'smart_quotes')
            check_pattern('smart_quotes_close', patterns['smart_quotes_close'], 'smart_quotes')
            check_pattern('smart_single_quotes', patterns['smart_single_quotes'], 'smart_quotes')
            check_pattern('em_dash', patterns['em_dash'], 'em_dashes')
            check_pattern('en_dash', patterns['en_dash'], 'en_dashes')
            check_pattern('ellipsis', patterns['ellipsis'], 'ellipsis')
            check_pattern('html_entities', patterns['html_entities'], 'html_entities')
            check_pattern('malformed_entities', patterns['malformed_entities'], 'malformed_entities')
            check_pattern('escape_sequences', patterns['escape_sequences'], 'escape_sequences')
            check_pattern('problematic_escapes', patterns['problematic_escapes'], 'problematic_escapes')
            check_pattern('non_breaking_space', patterns['non_breaking_space'], 'non_breaking_spaces')
            
            # Check zero-width characters
            zero_width_patterns = [
                patterns['zero_width_space'],
                patterns['zero_width_non_joiner'],
                patterns['zero_width_joiner'],
                patterns['word_joiner'],
                patterns['byte_order_mark']
            ]
            
            for pattern in zero_width_patterns:
                check_pattern('zero_width', pattern, 'zero_width_chars')
            
            # Check for other problematic Unicode characters
            for char in content:
                char_code = ord(char)
                for start, end, category in unicode_ranges:
                    if start <= char_code <= end:
                        results['other_unicode']['files'].add(filename)
                        results['other_unicode']['count'] += 1
                        
                        line_num = content[:content.find(char)].count('\n') + 1
                        results['other_unicode']['examples'].append({
                            'file': filename,
                            'line': line_num,
                            'char': char,
                            'unicode': f'U+{char_code:04X}',
                            'category': category
                        })
                        file_has_issues = True
                        break
            
            if file_has_issues:
                results['files_with_issues'] += 1
        
        except Exception as e:
            results['encoding_issues']['files'].add(filename)
            results['encoding_issues']['count'] += 1
            results['encoding_issues']['examples'].append(f"{filename}: Error reading file - {str(e)}")
            results['files_with_issues'] += 1
    
    return results

def generate_report(results):
    """Generate a comprehensive report"""
    
    print("=" * 80)
    print("COMPREHENSIVE SPECIAL CHARACTERS & ENCODING ANALYSIS REPORT")
    print("=" * 80)
    print()
    
    # Summary
    print("📊 SUMMARY")
    print("-" * 40)
    print(f"Total files analyzed: {results['total_files']}")
    print(f"Files with issues: {results['files_with_issues']}")
    print(f"Clean files: {results['total_files'] - results['files_with_issues']}")
    print(f"Issue rate: {(results['files_with_issues'] / results['total_files'] * 100):.1f}%")
    print()
    
    # Priority classification
    high_priority = ['json_parse_errors', 'encoding_issues', 'malformed_entities', 'problematic_escapes']
    medium_priority = ['smart_quotes', 'em_dashes', 'en_dashes', 'ellipsis', 'html_entities']
    low_priority = ['non_breaking_spaces', 'zero_width_chars', 'other_unicode', 'escape_sequences']
    
    def print_category(category_name, category_key, priority):
        if results[category_key]['count'] > 0:
            print(f"🔴 {priority} PRIORITY: {category_name}")
            print(f"   Files affected: {len(results[category_key]['files'])}")
            print(f"   Total occurrences: {results[category_key]['count']}")
            
            # Show examples
            if results[category_key]['examples']:
                print("   Examples:")
                for i, example in enumerate(results[category_key]['examples'][:5]):  # Limit to 5 examples
                    if isinstance(example, dict):
                        if 'context' in example:
                            print(f"     {i+1}. {example['file']}:{example['line']} - '{example['match']}' in context: ...{example['context']}...")
                        else:
                            print(f"     {i+1}. {example['file']}:{example['line']} - {example.get('char', '')} ({example.get('unicode', '')})")
                    else:
                        print(f"     {i+1}. {example}")
            print()
    
    # High Priority Issues
    print("🚨 HIGH PRIORITY ISSUES (Can cause JSON parsing errors or display problems)")
    print("-" * 70)
    for category in high_priority:
        category_names = {
            'json_parse_errors': 'JSON Parsing Errors',
            'encoding_issues': 'File Encoding Issues',
            'malformed_entities': 'Malformed HTML Entities',
            'problematic_escapes': 'Invalid Escape Sequences'
        }
        print_category(category_names[category], category, 'HIGH')
    
    # Medium Priority Issues
    print("⚠️  MEDIUM PRIORITY ISSUES (Can cause display inconsistencies)")
    print("-" * 60)
    for category in medium_priority:
        category_names = {
            'smart_quotes': 'Smart Quotes (" " \' \')',
            'em_dashes': 'Em Dashes (—)',
            'en_dashes': 'En Dashes (–)',
            'ellipsis': 'Unicode Ellipsis (…)',
            'html_entities': 'HTML Entities'
        }
        print_category(category_names[category], category, 'MEDIUM')
    
    # Low Priority Issues
    print("ℹ️  LOW PRIORITY ISSUES (Minor formatting concerns)")
    print("-" * 50)
    for category in low_priority:
        category_names = {
            'non_breaking_spaces': 'Non-breaking Spaces',
            'zero_width_chars': 'Zero-width Characters',
            'other_unicode': 'Other Unicode Characters',
            'escape_sequences': 'JSON Escape Sequences'
        }
        print_category(category_names[category], category, 'LOW')
    
    # Recommendations
    print("💡 RECOMMENDATIONS")
    print("-" * 40)
    
    if results['json_parse_errors']['count'] > 0:
        print("🔧 CRITICAL: Fix JSON parsing errors immediately")
        print("   - Check for unescaped quotes, missing commas, trailing commas")
        print("   - Validate JSON syntax with a linter")
        print()
    
    if results['smart_quotes']['count'] > 0:
        print("🔧 HIGH IMPACT: Replace smart quotes with standard ASCII")
        print("   - Replace " " with \" (standard double quotes)")
        print("   - Replace ' ' with ' (standard single quotes)")
        print("   - This fixes copy/paste and search issues")
        print()
    
    if results['em_dashes']['count'] > 0 or results['en_dashes']['count'] > 0:
        print("🔧 MEDIUM IMPACT: Standardize dashes")
        print("   - Replace — (em dash) with -- or -")
        print("   - Replace – (en dash) with - (hyphen)")
        print("   - Improves text processing and search")
        print()
    
    if results['ellipsis']['count'] > 0:
        print("🔧 LOW IMPACT: Replace Unicode ellipsis")
        print("   - Replace … with ... (three periods)")
        print("   - Ensures consistent rendering across platforms")
        print()
    
    if results['html_entities']['count'] > 0:
        print("🔧 CONTEXT DEPENDENT: Review HTML entities")
        print("   - Ensure entities are properly formed")
        print("   - Consider if plain text equivalents are preferable")
        print("   - Check if entities are being double-encoded")
        print()
    
    # Files that need immediate attention
    critical_files = set()
    for category in high_priority:
        critical_files.update(results[category]['files'])
    
    if critical_files:
        print("🚨 FILES REQUIRING IMMEDIATE ATTENTION:")
        for filename in sorted(critical_files):
            print(f"   - {filename}")
        print()
    
    print("=" * 80)
    print("Analysis complete. Focus on HIGH PRIORITY issues first.")
    print("=" * 80)

if __name__ == "__main__":
    directory = "/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts"
    results = analyze_special_characters(directory)
    generate_report(results)