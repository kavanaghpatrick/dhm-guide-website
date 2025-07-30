#!/usr/bin/env python3
"""
Comprehensive Special Characters & Encoding Analysis for JSON files - Fixed Version
"""

import json
import os
import re
from collections import defaultdict

def analyze_special_characters(directory):
    """Analyze all JSON files for special characters and encoding issues"""
    
    results = {
        'total_files': 0,
        'files_with_issues': 0,
        'smart_quotes': {'files': [], 'count': 0, 'examples': []},
        'em_dashes': {'files': [], 'count': 0, 'examples': []},
        'en_dashes': {'files': [], 'count': 0, 'examples': []},
        'ellipsis': {'files': [], 'count': 0, 'examples': []},
        'html_entities': {'files': [], 'count': 0, 'examples': []},
        'escape_sequences': {'files': [], 'count': 0, 'examples': []},
        'non_breaking_spaces': {'files': [], 'count': 0, 'examples': []},
        'zero_width_chars': {'files': [], 'count': 0, 'examples': []},
        'other_unicode': {'files': [], 'count': 0, 'examples': []},
        'json_parse_errors': {'files': [], 'count': 0, 'examples': []},
        'malformed_entities': {'files': [], 'count': 0, 'examples': []},
        'problematic_escapes': {'files': [], 'count': 0, 'examples': []},
        'encoding_issues': {'files': [], 'count': 0, 'examples': []}
    }
    
    # Get all JSON files
    json_files = [f for f in os.listdir(directory) if f.endswith('.json')]
    results['total_files'] = len(json_files)
    
    for filename in json_files:
        filepath = os.path.join(directory, filename)
        file_has_issues = False
        
        try:
            # Read file with UTF-8 encoding
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Try to parse as JSON
            try:
                json_data = json.loads(content)
            except json.JSONDecodeError as e:
                results['json_parse_errors']['files'].append(filename)
                results['json_parse_errors']['count'] += 1
                results['json_parse_errors']['examples'].append(f"{filename}: {str(e)}")
                file_has_issues = True
            
            # Check for smart quotes
            smart_quote_chars = ['"', '"', ''', ''']
            for char in smart_quote_chars:
                count = content.count(char)
                if count > 0:
                    results['smart_quotes']['count'] += count
                    if filename not in results['smart_quotes']['files']:
                        results['smart_quotes']['files'].append(filename)
                        file_has_issues = True
                    
                    # Find first occurrence for example
                    pos = content.find(char)
                    if pos != -1:
                        line_num = content[:pos].count('\n') + 1
                        context_start = max(0, pos - 30)
                        context_end = min(len(content), pos + 30)
                        context = content[context_start:context_end].replace('\n', '\\n')
                        results['smart_quotes']['examples'].append({
                            'file': filename,
                            'line': line_num,
                            'char': char,
                            'context': context
                        })
            
            # Check for em dashes
            em_dash_count = content.count('—')
            if em_dash_count > 0:
                results['em_dashes']['files'].append(filename)
                results['em_dashes']['count'] += em_dash_count
                file_has_issues = True
                
                pos = content.find('—')
                if pos != -1:
                    line_num = content[:pos].count('\n') + 1
                    context_start = max(0, pos - 30)
                    context_end = min(len(content), pos + 30)
                    context = content[context_start:context_end].replace('\n', '\\n')
                    results['em_dashes']['examples'].append({
                        'file': filename,
                        'line': line_num,
                        'context': context
                    })
            
            # Check for en dashes
            en_dash_count = content.count('–')
            if en_dash_count > 0:
                results['en_dashes']['files'].append(filename)
                results['en_dashes']['count'] += en_dash_count
                file_has_issues = True
                
                pos = content.find('–')
                if pos != -1:
                    line_num = content[:pos].count('\n') + 1
                    context_start = max(0, pos - 30)
                    context_end = min(len(content), pos + 30)
                    context = content[context_start:context_end].replace('\n', '\\n')
                    results['en_dashes']['examples'].append({
                        'file': filename,
                        'line': line_num,
                        'context': context
                    })
            
            # Check for Unicode ellipsis
            ellipsis_count = content.count('…')
            if ellipsis_count > 0:
                results['ellipsis']['files'].append(filename)
                results['ellipsis']['count'] += ellipsis_count
                file_has_issues = True
                
                pos = content.find('…')
                if pos != -1:
                    line_num = content[:pos].count('\n') + 1
                    context_start = max(0, pos - 30)
                    context_end = min(len(content), pos + 30)
                    context = content[context_start:context_end].replace('\n', '\\n')
                    results['ellipsis']['examples'].append({
                        'file': filename,
                        'line': line_num,
                        'context': context
                    })
            
            # Check for HTML entities
            html_entity_pattern = r'&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9a-fA-F]+;'
            html_entities = re.findall(html_entity_pattern, content)
            if html_entities:
                results['html_entities']['files'].append(filename)
                results['html_entities']['count'] += len(html_entities)
                file_has_issues = True
                
                for entity in html_entities[:3]:  # First 3 examples
                    pos = content.find(entity)
                    if pos != -1:
                        line_num = content[:pos].count('\n') + 1
                        context_start = max(0, pos - 30)
                        context_end = min(len(content), pos + 30)
                        context = content[context_start:context_end].replace('\n', '\\n')
                        results['html_entities']['examples'].append({
                            'file': filename,
                            'line': line_num,
                            'entity': entity,
                            'context': context
                        })
            
            # Check for non-breaking spaces
            nbsp_count = content.count('\u00A0')
            if nbsp_count > 0:
                results['non_breaking_spaces']['files'].append(filename)
                results['non_breaking_spaces']['count'] += nbsp_count
                file_has_issues = True
            
            # Check for zero-width characters
            zero_width_chars = ['\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF']
            for char in zero_width_chars:
                count = content.count(char)
                if count > 0:
                    if filename not in results['zero_width_chars']['files']:
                        results['zero_width_chars']['files'].append(filename)
                        file_has_issues = True
                    results['zero_width_chars']['count'] += count
            
            if file_has_issues:
                results['files_with_issues'] += 1
                
        except UnicodeDecodeError as e:
            results['encoding_issues']['files'].append(filename)
            results['encoding_issues']['count'] += 1
            results['encoding_issues']['examples'].append(f"{filename}: {str(e)}")
            results['files_with_issues'] += 1
        except Exception as e:
            results['encoding_issues']['files'].append(filename)
            results['encoding_issues']['count'] += 1
            results['encoding_issues']['examples'].append(f"{filename}: {str(e)}")
            results['files_with_issues'] += 1
    
    return results

def generate_detailed_report(results):
    """Generate comprehensive report"""
    
    print("=" * 80)
    print("COMPREHENSIVE SPECIAL CHARACTERS & ENCODING ANALYSIS REPORT")
    print("=" * 80)
    print()
    
    # Summary
    print("📊 EXECUTIVE SUMMARY")
    print("-" * 40)
    print(f"Total files analyzed: {results['total_files']}")
    print(f"Files with issues: {results['files_with_issues']}")
    print(f"Clean files: {results['total_files'] - results['files_with_issues']}")
    print(f"Issue rate: {(results['files_with_issues'] / results['total_files'] * 100):.1f}%")
    print()
    
    # Detailed breakdown
    issue_types = [
        ('smart_quotes', 'Smart Quotes (" " \' \')', 'HIGH'),
        ('em_dashes', 'Em Dashes (—)', 'MEDIUM'),
        ('en_dashes', 'En Dashes (–)', 'MEDIUM'),
        ('ellipsis', 'Unicode Ellipsis (…)', 'LOW'),
        ('html_entities', 'HTML Entities', 'MEDIUM'),
        ('non_breaking_spaces', 'Non-breaking Spaces', 'LOW'),
        ('zero_width_chars', 'Zero-width Characters', 'HIGH'),
        ('json_parse_errors', 'JSON Parse Errors', 'CRITICAL'),
        ('encoding_issues', 'Encoding Issues', 'CRITICAL')
    ]
    
    # Critical Issues
    critical_issues = []
    high_issues = []
    medium_issues = []
    low_issues = []
    
    for issue_key, issue_name, priority in issue_types:
        if results[issue_key]['count'] > 0:
            issue_data = {
                'key': issue_key,
                'name': issue_name,
                'priority': priority,
                'files': len(results[issue_key]['files']),
                'count': results[issue_key]['count'],
                'examples': results[issue_key]['examples']
            }
            
            if priority == 'CRITICAL':
                critical_issues.append(issue_data)
            elif priority == 'HIGH':
                high_issues.append(issue_data)
            elif priority == 'MEDIUM':
                medium_issues.append(issue_data)
            else:
                low_issues.append(issue_data)
    
    def print_issue_section(issues, section_title, emoji):
        if issues:
            print(f"{emoji} {section_title}")
            print("-" * 60)
            for issue in issues:
                print(f"🔴 {issue['name']}")
                print(f"   Files affected: {issue['files']}")
                print(f"   Total occurrences: {issue['count']}")
                
                if issue['examples']:
                    print("   Examples:")
                    for i, example in enumerate(issue['examples'][:3]):
                        if isinstance(example, dict):
                            if 'context' in example:
                                print(f"     {i+1}. {example['file']}:{example.get('line', '?')} - Context: ...{example['context'][:50]}...")
                            elif 'entity' in example:
                                print(f"     {i+1}. {example['file']}:{example.get('line', '?')} - Entity: {example['entity']}")
                            else:
                                print(f"     {i+1}. {example['file']}:{example.get('line', '?')} - Character: {example.get('char', 'N/A')}")
                        else:
                            print(f"     {i+1}. {example}")
                print()
    
    print_issue_section(critical_issues, "CRITICAL ISSUES (Can break functionality)", "🚨")
    print_issue_section(high_issues, "HIGH PRIORITY ISSUES (Major display/search problems)", "⚠️")
    print_issue_section(medium_issues, "MEDIUM PRIORITY ISSUES (Display inconsistencies)", "⚡")
    print_issue_section(low_issues, "LOW PRIORITY ISSUES (Minor formatting concerns)", "ℹ️")
    
    # Impact analysis
    print("📈 IMPACT ANALYSIS")
    print("-" * 40)
    
    if results['smart_quotes']['count'] > 0:
        print("🎯 SMART QUOTES IMPACT:")
        print(f"   - {results['smart_quotes']['count']} instances across {len(results['smart_quotes']['files'])} files")
        print("   - Can cause: Copy/paste issues, search problems, JSON parsing errors")
        print("   - User impact: HIGH (breaks text selection and search)")
        print()
    
    if results['em_dashes']['count'] > 0 or results['en_dashes']['count'] > 0:
        total_dashes = results['em_dashes']['count'] + results['en_dashes']['count']
        print("🎯 DASH CHARACTERS IMPACT:")
        print(f"   - {total_dashes} instances of non-standard dashes")
        print("   - Can cause: Encoding issues, text processing problems")
        print("   - User impact: MEDIUM (display inconsistencies)")
        print()
    
    if results['html_entities']['count'] > 0:
        print("🎯 HTML ENTITIES IMPACT:")
        print(f"   - {results['html_entities']['count']} HTML entities found")
        print("   - Can cause: Double-encoding, display issues")
        print("   - User impact: MEDIUM (incorrect character display)")
        print()
    
    # Fix recommendations
    print("🔧 RECOMMENDED FIXES BY PRIORITY")
    print("-" * 40)
    
    if results['json_parse_errors']['count'] > 0:
        print("1. CRITICAL: Fix JSON parsing errors immediately")
        print("   - Validate all JSON files with a linter")
        print("   - Fix syntax errors before any other changes")
        print()
    
    if results['smart_quotes']['count'] > 0:
        print("2. HIGH: Replace smart quotes with standard ASCII")
        print('   - Find/Replace " with "')
        print('   - Find/Replace " with "')
        print("   - Find/Replace ' with '")
        print("   - Find/Replace ' with '")
        print("   - This is the most impactful fix for user experience")
        print()
    
    if results['em_dashes']['count'] > 0:
        print("3. MEDIUM: Replace em dashes")
        print("   - Find/Replace — with --")
        print("   - Or use standard hyphen - if appropriate")
        print()
    
    if results['en_dashes']['count'] > 0:
        print("4. MEDIUM: Replace en dashes")
        print("   - Find/Replace – with -")
        print()
    
    if results['ellipsis']['count'] > 0:
        print("5. LOW: Replace Unicode ellipsis")
        print("   - Find/Replace … with ...")
        print()
    
    # Sample files for immediate attention
    all_critical_files = set()
    for issue_key in ['json_parse_errors', 'encoding_issues']:
        all_critical_files.update(results[issue_key]['files'])
    
    all_high_files = set()
    for issue_key in ['smart_quotes', 'zero_width_chars']:
        all_high_files.update(results[issue_key]['files'])
    
    if all_critical_files:
        print("🚨 FILES NEEDING IMMEDIATE ATTENTION (CRITICAL):")
        for filename in sorted(list(all_critical_files)[:10]):  # Show first 10
            print(f"   - {filename}")
        if len(all_critical_files) > 10:
            print(f"   ... and {len(all_critical_files) - 10} more files")
        print()
    
    if all_high_files:
        print("⚠️  FILES WITH HIGH PRIORITY ISSUES (Show first 10):")
        for filename in sorted(list(all_high_files)[:10]):
            print(f"   - {filename}")
        if len(all_high_files) > 10:
            print(f"   ... and {len(all_high_files) - 10} more files")
        print()
    
    print("=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    directory = "/Users/patrickkavanagh/dhm-guide-website/src/newblog/data/posts"
    results = analyze_special_characters(directory)
    generate_detailed_report(results)