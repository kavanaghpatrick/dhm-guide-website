#!/usr/bin/env node

/**
 * Verification script for postRegistry.js
 * Checks that all dynamic imports in the registry point to existing files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the postRegistry - adjust path as needed
const registryPath = path.join(__dirname, 'src/newblog/data/postRegistry.js');

// Read and parse the registry file
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract all import paths using regex
const importRegex = /import\("\.\/posts\/([^"]+)"\)/g;
let match;
const imports = [];

while ((match = importRegex.exec(registryContent)) !== null) {
  imports.push(match[1]);
}

console.log(`Found ${imports.length} imports in postRegistry.js\n`);

// Check each file exists
let missingCount = 0;
let successCount = 0;
const postsDir = path.join(__dirname, 'src/newblog/data/posts');

imports.forEach((filename, index) => {
  const filePath = path.join(postsDir, filename);
  const exists = fs.existsSync(filePath);
  
  if (!exists) {
    console.error(`❌ Missing file: ${filename}`);
    missingCount++;
  } else {
    // Also check if it's valid JSON
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      successCount++;
      if (index < 5 || index % 50 === 0) {
        console.log(`✅ Valid: ${filename}`);
      }
    } catch (err) {
      console.error(`❌ Invalid JSON in: ${filename} - ${err.message}`);
      missingCount++;
    }
  }
});

// Check for case sensitivity issues
console.log('\n--- Checking for case sensitivity issues ---');
const actualFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
const registryFiles = imports;

// Look for files that exist with different casing
registryFiles.forEach(regFile => {
  const lowerReg = regFile.toLowerCase();
  const matchingFiles = actualFiles.filter(f => f.toLowerCase() === lowerReg && f !== regFile);
  if (matchingFiles.length > 0) {
    console.warn(`⚠️  Case mismatch: Registry has "${regFile}" but disk has "${matchingFiles[0]}"`);
  }
});

// Check for orphaned files (exist on disk but not in registry)
console.log('\n--- Checking for orphaned files ---');
const registrySet = new Set(registryFiles);
const orphaned = actualFiles.filter(f => !registrySet.has(f) && !f.includes('.bak') && !f.includes('.backup'));
if (orphaned.length > 0) {
  console.warn(`⚠️  Found ${orphaned.length} JSON files not in registry:`);
  orphaned.forEach(f => console.warn(`   - ${f}`));
}

// Summary
console.log('\n--- Summary ---');
console.log(`Total imports checked: ${imports.length}`);
console.log(`✅ Valid files: ${successCount}`);
console.log(`❌ Issues found: ${missingCount}`);

if (missingCount > 0) {
  console.error('\n❌ Verification failed! Fix the issues above before pushing.');
  process.exit(1);
} else {
  console.log('\n✅ All imports verified successfully!');
  process.exit(0);
}