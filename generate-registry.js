#!/usr/bin/env node

/**
 * Automated registry generator for postRegistry.js
 * Scans the posts directory and generates the registry file automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, 'src/newblog/data/posts');
const registryPath = path.join(__dirname, 'src/newblog/data/postRegistry.js');

// Read all JSON files from posts directory
const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.json'))
  .sort(); // Sort for consistent ordering

// Generate the registry content
let output = `// Post Registry - Maps slugs to dynamic imports for Vite
// This file is auto-generated and helps Vite bundle dynamic imports correctly

const postModules = {
`;

files.forEach(file => {
  const slug = path.basename(file, '.json');
  output += `  "${slug}": () => import("./posts/${file}"),\n`;
});

output += `};

export default postModules;
`;

// Write the registry file
fs.writeFileSync(registryPath, output);

console.log(`✅ Generated registry with ${files.length} entries`);
console.log(`📁 Output: ${registryPath}`);