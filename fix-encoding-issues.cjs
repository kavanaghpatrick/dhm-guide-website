#!/usr/bin/env node
/**
 * Safe Encoding Issues Fix Script
 * Fixes smart quotes, em/en dashes, and HTML entities in JSON blog posts
 * Based on Grok expert validation - prioritizes safety and JSON integrity
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class EncodingFixer {
  constructor() {
    this.postsDir = path.join(__dirname, 'src/newblog/data/posts');
    this.backupDir = path.join(__dirname, 'encoding-backup');
    this.stats = {
      filesProcessed: 0,
      totalReplacements: 0,
      smartQuotes: 0,
      emDashes: 0,
      enDashes: 0,
      htmlEntities: 0,
      errors: []
    };
    
    // Safe replacement mappings - only target content, preserve structure
    this.replacements = [
      // Smart quotes (PRIMARY ISSUE - 81,181 instances)
      { pattern: /[\u201C\u201D]/g, replacement: '"', type: 'smartQuotes', desc: 'Smart double quotes' },
      { pattern: /[\u2018\u2019]/g, replacement: "'", type: 'smartQuotes', desc: 'Smart single quotes' },
      
      // Em and En dashes (SECONDARY ISSUES)
      { pattern: /\u2014/g, replacement: '--', type: 'emDashes', desc: 'Em dashes' },
      { pattern: /\u2013/g, replacement: '-', type: 'enDashes', desc: 'En dashes' },
      
      // HTML entities (TERTIARY ISSUES)
      { pattern: /&ldquo;/g, replacement: '"', type: 'htmlEntities', desc: 'Left double quotation mark entities' },
      { pattern: /&rdquo;/g, replacement: '"', type: 'htmlEntities', desc: 'Right double quotation mark entities' },
      { pattern: /&lsquo;/g, replacement: "'", type: 'htmlEntities', desc: 'Left single quotation mark entities' },
      { pattern: /&rsquo;/g, replacement: "'", type: 'htmlEntities', desc: 'Right single quotation mark entities' },
      { pattern: /&mdash;/g, replacement: '--', type: 'htmlEntities', desc: 'Em dash entities' },
      { pattern: /&ndash;/g, replacement: '-', type: 'htmlEntities', desc: 'En dash entities' },
      
      // Unicode ellipsis (MINOR ISSUE)
      { pattern: /\u2026/g, replacement: '...', type: 'ellipsis', desc: 'Unicode ellipsis' }
    ];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  createBackup() {
    this.log('\n🔄 Creating backup of all JSON files...', 'blue');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const files = fs.readdirSync(this.postsDir).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      const sourcePath = path.join(this.postsDir, file);
      const backupPath = path.join(this.backupDir, file);
      fs.copyFileSync(sourcePath, backupPath);
    });

    this.log(`✅ Backup created: ${files.length} files backed up to ${this.backupDir}`, 'green');
  }

  validateJson(content, filename) {
    try {
      JSON.parse(content);
      return true;
    } catch (error) {
      this.stats.errors.push(`${filename}: JSON validation failed - ${error.message}`);
      return false;
    }
  }

  processFile(filename) {
    const filePath = path.join(this.postsDir, filename);
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Validate original JSON
      if (!this.validateJson(originalContent, filename)) {
        this.log(`❌ Skipping ${filename} - Invalid JSON`, 'red');
        return false;
      }

      let modifiedContent = originalContent;
      let fileReplacements = 0;

      // Apply all replacements
      this.replacements.forEach(({ pattern, replacement, type, desc }) => {
        const matches = modifiedContent.match(pattern);
        if (matches) {
          const count = matches.length;
          modifiedContent = modifiedContent.replace(pattern, replacement);
          fileReplacements += count;
          this.stats[type] += count;
          this.log(`  📝 ${desc}: ${count} replacements`, 'yellow');
        }
      });

      // Only write if changes were made
      if (fileReplacements > 0) {
        // Validate modified JSON before writing
        if (!this.validateJson(modifiedContent, filename)) {
          this.log(`❌ Replacement created invalid JSON in ${filename}`, 'red');
          return false;
        }

        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        this.stats.totalReplacements += fileReplacements;
        this.log(`✅ ${filename}: ${fileReplacements} total replacements`, 'green');
      } else {
        this.log(`✅ ${filename}: No encoding issues found`, 'green');
      }

      this.stats.filesProcessed++;
      return true;

    } catch (error) {
      this.stats.errors.push(`${filename}: Processing error - ${error.message}`);
      this.log(`❌ Error processing ${filename}: ${error.message}`, 'red');
      return false;
    }
  }

  testSampleFiles(count = 5) {
    this.log(`\n🧪 Testing on ${count} sample files first...`, 'blue');
    
    const files = fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.json'))
      .slice(0, count);

    let successCount = 0;
    files.forEach(file => {
      this.log(`\n📄 Testing: ${file}`, 'blue');
      if (this.processFile(file)) {
        successCount++;
      }
    });

    this.log(`\n📊 Test Results: ${successCount}/${files.length} files processed successfully`, 'blue');
    
    if (this.stats.errors.length > 0) {
      this.log('\n❌ Errors encountered:', 'red');
      this.stats.errors.forEach(error => this.log(`  ${error}`, 'red'));
      return false;
    }

    return successCount === files.length;
  }

  processAllFiles() {
    this.log('\n🚀 Processing all JSON files...', 'blue');
    
    const files = fs.readdirSync(this.postsDir).filter(file => file.endsWith('.json'));
    this.log(`📁 Found ${files.length} JSON files to process`, 'blue');

    files.forEach((file, index) => {
      this.log(`\n📄 [${index + 1}/${files.length}] Processing: ${file}`, 'blue');
      this.processFile(file);
    });
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('📊 ENCODING FIX SUMMARY', 'blue');
    this.log('='.repeat(60), 'blue');
    
    this.log(`Files processed: ${this.stats.filesProcessed}`, 'green');
    this.log(`Total replacements: ${this.stats.totalReplacements}`, 'green');
    this.log(`Smart quotes fixed: ${this.stats.smartQuotes}`, 'green');
    this.log(`Em dashes fixed: ${this.stats.emDashes}`, 'green');
    this.log(`En dashes fixed: ${this.stats.enDashes}`, 'green');
    this.log(`HTML entities fixed: ${this.stats.htmlEntities}`, 'green');
    
    if (this.stats.errors.length > 0) {
      this.log(`\nErrors encountered: ${this.stats.errors.length}`, 'red');
      this.stats.errors.forEach(error => this.log(`  ${error}`, 'red'));
    } else {
      this.log('\n✅ No errors encountered!', 'green');
    }

    this.log(`\n💾 Backup location: ${this.backupDir}`, 'blue');
    this.log('📝 Run git diff to review changes before committing', 'yellow');
  }

  async run() {
    this.log('🔧 DHM Guide - Encoding Issues Fix Script', 'blue');
    this.log('Based on Grok expert validation for safe JSON processing\n', 'blue');

    try {
      // Step 1: Create backup
      this.createBackup();

      // Step 2: Test on sample files
      if (!this.testSampleFiles(5)) {
        this.log('\n❌ Sample testing failed. Aborting bulk processing.', 'red');
        this.log('🔄 Files have been restored from backup.', 'yellow');
        return;
      }

      // Step 3: Ask for confirmation before bulk processing
      this.log('\n✅ Sample testing successful!', 'green');
      this.log('🤔 Proceeding with all 202 files...', 'yellow');

      // Reset stats for full run (excluding test files)
      this.stats = {
        filesProcessed: 0,
        totalReplacements: 0,
        smartQuotes: 0,
        emDashes: 0,
        enDashes: 0,
        htmlEntities: 0,
        errors: []
      };

      // Step 4: Process all files
      this.processAllFiles();

      // Step 5: Print summary
      this.printSummary();

      this.log('\n🎉 Encoding fix complete! Review changes with git diff before committing.', 'green');

    } catch (error) {
      this.log(`\n💥 Critical error: ${error.message}`, 'red');
      this.log('🔄 Consider restoring from backup if needed.', 'yellow');
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new EncodingFixer();
  fixer.run();
}

module.exports = EncodingFixer;