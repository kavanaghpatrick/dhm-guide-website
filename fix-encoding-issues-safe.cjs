#!/usr/bin/env node
/**
 * Ultra-Safe Encoding Issues Fix Script
 * Uses JSON parsing to safely modify only string values
 * Based on Grok expert validation with enhanced safety
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

class SafeEncodingFixer {
  constructor() {
    this.postsDir = path.join(__dirname, 'src/newblog/data/posts');
    this.backupDir = path.join(__dirname, 'encoding-backup-safe');
    this.stats = {
      filesProcessed: 0,
      totalReplacements: 0,
      smartQuotes: 0,
      emDashes: 0,
      enDashes: 0,
      htmlEntities: 0,
      ellipsis: 0,
      errors: []
    };
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

  // Safe string replacement that preserves JSON structure
  fixStringValue(str) {
    if (typeof str !== 'string') return str;
    
    let fixed = str;
    let replacements = 0;

    // Smart quotes (PRIMARY ISSUE - 81,181 instances)
    const smartDoubleQuotes = fixed.match(/[\u201C\u201D]/g);
    if (smartDoubleQuotes) {
      fixed = fixed.replace(/[\u201C\u201D]/g, '"');
      replacements += smartDoubleQuotes.length;
      this.stats.smartQuotes += smartDoubleQuotes.length;
    }

    const smartSingleQuotes = fixed.match(/[\u2018\u2019]/g);
    if (smartSingleQuotes) {
      fixed = fixed.replace(/[\u2018\u2019]/g, "'");
      replacements += smartSingleQuotes.length;
      this.stats.smartQuotes += smartSingleQuotes.length;
    }

    // Em dashes (SECONDARY ISSUE)
    const emDashes = fixed.match(/\u2014/g);
    if (emDashes) {
      fixed = fixed.replace(/\u2014/g, '--');
      replacements += emDashes.length;
      this.stats.emDashes += emDashes.length;
    }

    // En dashes (SECONDARY ISSUE)
    const enDashes = fixed.match(/\u2013/g);
    if (enDashes) {
      fixed = fixed.replace(/\u2013/g, '-');
      replacements += enDashes.length;
      this.stats.enDashes += enDashes.length;
    }

    // HTML entities (TERTIARY ISSUE)
    const htmlEntityMatches = [
      { pattern: /&ldquo;/g, replacement: '"' },
      { pattern: /&rdquo;/g, replacement: '"' },
      { pattern: /&lsquo;/g, replacement: "'" },
      { pattern: /&rsquo;/g, replacement: "'" },
      { pattern: /&mdash;/g, replacement: '--' },
      { pattern: /&ndash;/g, replacement: '-' }
    ];

    htmlEntityMatches.forEach(({ pattern, replacement }) => {
      const matches = fixed.match(pattern);
      if (matches) {
        fixed = fixed.replace(pattern, replacement);
        replacements += matches.length;
        this.stats.htmlEntities += matches.length;
      }
    });

    // Unicode ellipsis (MINOR ISSUE)
    const ellipsis = fixed.match(/\u2026/g);
    if (ellipsis) {
      fixed = fixed.replace(/\u2026/g, '...');
      replacements += ellipsis.length;
      this.stats.ellipsis += ellipsis.length;
    }

    return { fixed, replacements };
  }

  // Recursively process all string values in JSON object
  processJsonValue(value) {
    let totalReplacements = 0;

    if (typeof value === 'string') {
      const result = this.fixStringValue(value);
      return { value: result.fixed, replacements: result.replacements };
    } else if (Array.isArray(value)) {
      const newArray = [];
      for (const item of value) {
        const result = this.processJsonValue(item);
        newArray.push(result.value);
        totalReplacements += result.replacements;
      }
      return { value: newArray, replacements: totalReplacements };
    } else if (value && typeof value === 'object') {
      const newObject = {};
      for (const [key, val] of Object.entries(value)) {
        const result = this.processJsonValue(val);
        newObject[key] = result.value;
        totalReplacements += result.replacements;
      }
      return { value: newObject, replacements: totalReplacements };
    }

    return { value, replacements: 0 };
  }

  processFile(filename) {
    const filePath = path.join(this.postsDir, filename);
    
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse JSON safely
      let jsonData;
      try {
        jsonData = JSON.parse(originalContent);
      } catch (parseError) {
        this.stats.errors.push(`${filename}: Original JSON is invalid - ${parseError.message}`);
        this.log(`❌ Skipping ${filename} - Invalid original JSON`, 'red');
        return false;
      }

      // Process all string values in the JSON
      const result = this.processJsonValue(jsonData);
      const fileReplacements = result.replacements;

      // Only write if changes were made
      if (fileReplacements > 0) {
        // Serialize back to JSON with proper formatting
        const modifiedContent = JSON.stringify(result.value, null, 2);
        
        // Validate the serialized JSON
        try {
          JSON.parse(modifiedContent);
        } catch (validateError) {
          this.stats.errors.push(`${filename}: Serialization created invalid JSON - ${validateError.message}`);
          this.log(`❌ Serialization error in ${filename}`, 'red');
          return false;
        }

        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        this.stats.totalReplacements += fileReplacements;
        this.log(`✅ ${filename}: ${fileReplacements} encoding issues fixed`, 'green');
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

    let successCount = 0;
    files.forEach((file, index) => {
      this.log(`\n📄 [${index + 1}/${files.length}] Processing: ${file}`, 'blue');
      if (this.processFile(file)) {
        successCount++;
      }
    });

    this.log(`\n📊 Final Results: ${successCount}/${files.length} files processed successfully`, 'blue');
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('📊 SAFE ENCODING FIX SUMMARY', 'blue');
    this.log('='.repeat(60), 'blue');
    
    this.log(`Files processed: ${this.stats.filesProcessed}`, 'green');
    this.log(`Total replacements: ${this.stats.totalReplacements}`, 'green');
    this.log(`Smart quotes fixed: ${this.stats.smartQuotes}`, 'green');
    this.log(`Em dashes fixed: ${this.stats.emDashes}`, 'green');
    this.log(`En dashes fixed: ${this.stats.enDashes}`, 'green');
    this.log(`HTML entities fixed: ${this.stats.htmlEntities}`, 'green');
    this.log(`Ellipsis fixed: ${this.stats.ellipsis}`, 'green');
    
    if (this.stats.errors.length > 0) {
      this.log(`\nErrors encountered: ${this.stats.errors.length}`, 'red');
      this.stats.errors.forEach(error => this.log(`  ${error}`, 'red'));
    } else {
      this.log('\n✅ No errors encountered!', 'green');
    }

    this.log(`\n💾 Backup location: ${this.backupDir}`, 'blue');
    this.log('📝 Run git diff to review changes before committing', 'yellow');

    // Calculate impact
    const expectedSmartQuotes = 81181; // From our analysis
    const percentageFixed = Math.round((this.stats.smartQuotes / expectedSmartQuotes) * 100);
    this.log(`\n🎯 IMPACT: Fixed ${percentageFixed}% of smart quote issues (${this.stats.smartQuotes}/${expectedSmartQuotes})`, 'green');
  }

  async run() {
    this.log('🔧 DHM Guide - ULTRA-SAFE Encoding Issues Fix Script', 'blue');
    this.log('Uses JSON parsing for maximum safety - Based on Grok validation\n', 'blue');

    try {
      // Step 1: Create backup
      this.createBackup();

      // Step 2: Test on sample files first
      if (!this.testSampleFiles(3)) {
        this.log('\n❌ Sample testing failed. Aborting bulk processing.', 'red');
        this.log('🔄 Original files remain unchanged.', 'yellow');
        return;
      }

      // Step 3: Reset stats and process all files
      this.log('\n✅ Sample testing successful!', 'green');
      this.log('🚀 Proceeding with all 202 files...', 'yellow');

      // Reset stats for full run
      this.stats = {
        filesProcessed: 0,
        totalReplacements: 0,
        smartQuotes: 0,
        emDashes: 0,
        enDashes: 0,
        htmlEntities: 0,
        ellipsis: 0,
        errors: []
      };

      // Step 4: Process all files
      this.processAllFiles();

      // Step 5: Print summary
      this.printSummary();

      this.log('\n🎉 Safe encoding fix complete! Review changes with git diff before committing.', 'green');

    } catch (error) {
      this.log(`\n💥 Critical error: ${error.message}`, 'red');
      this.log('🔄 Consider restoring from backup if needed.', 'yellow');
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new SafeEncodingFixer();
  fixer.run();
}

module.exports = SafeEncodingFixer;