#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the postRegistry.js file
const registryPath = path.join(__dirname, 'src/newblog/data/postRegistry.js');

// Read the postRegistry.js file
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract all import paths using regex
const importRegex = /import\("(.*?)"\)/g;
const matches = [...registryContent.matchAll(importRegex)];

console.log(`\n📊 Checking ${matches.length} imports in postRegistry.js...\n`);

let missingFiles = [];
let existingFiles = [];

// Check each import path
for (const match of matches) {
  const relativePath = match[1];
  // Convert relative path to absolute path from postRegistry location
  const absolutePath = path.join(path.dirname(registryPath), relativePath);
  
  // Extract slug from the import statement
  const slugMatch = registryContent.match(new RegExp(`"([^"]+)":\\s*\\(\\)\\s*=>\\s*import\\("${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  const slug = slugMatch ? slugMatch[1] : 'unknown';
  
  if (fs.existsSync(absolutePath)) {
    existingFiles.push({ slug, path: relativePath });
  } else {
    missingFiles.push({ slug, path: relativePath, fullPath: absolutePath });
  }
}

// Report results
console.log(`✅ Found: ${existingFiles.length} files`);
console.log(`❌ Missing: ${missingFiles.length} files\n`);

if (missingFiles.length > 0) {
  console.log('🚨 MISSING FILES:\n');
  missingFiles.forEach(({ slug, path, fullPath }) => {
    console.log(`Slug: "${slug}"`);
    console.log(`Import path: ${path}`);
    console.log(`Expected location: ${fullPath}`);
    console.log('---');
  });
} else {
  console.log('🎉 All imported files exist!');
}

// Additional check: Look for JSON files in posts directory that aren't in registry
const postsDir = path.join(path.dirname(registryPath), 'posts');
if (fs.existsSync(postsDir)) {
  const jsonFiles = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => `./posts/${file}`);
  
  const registeredPaths = matches.map(m => m[1]);
  const unregisteredFiles = jsonFiles.filter(file => !registeredPaths.includes(file));
  
  if (unregisteredFiles.length > 0) {
    console.log(`\n⚠️  Found ${unregisteredFiles.length} JSON files not in registry:\n`);
    unregisteredFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
}

// Exit with error code if missing files
process.exit(missingFiles.length > 0 ? 1 : 0);