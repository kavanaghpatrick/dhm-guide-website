import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the postRegistry.js file
const registryPath = path.join(__dirname, '../data/postRegistry.js');
let registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract all blog_post references
const blogPostPattern = /import\("\.\/posts\/(blog_post_[^"]+)\.json"\)/g;
const matches = [...registryContent.matchAll(blogPostPattern)];

console.log(`Found ${matches.length} blog_post references to fix`);

// For each blog_post reference, check if a non-blog_post version exists
const postsDir = path.join(__dirname, '../data/posts');
const existingPosts = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

matches.forEach(match => {
  const blogPostFile = match[1] + '.json';
  
  // Extract the base name without blog_post prefix
  let baseName = blogPostFile
    .replace(/^blog_post_\d+_/, '')
    .replace(/^blog_post_batch\d+_\d+_/, '');
  
  console.log(`\nProcessing: ${blogPostFile}`);
  console.log(`Base name: ${baseName}`);
  
  // Check if the non-blog_post version exists
  if (existingPosts.includes(baseName)) {
    // Replace with the non-blog_post version
    console.log(`✓ Found ${baseName} - updating import`);
    const oldImport = `import("./posts/${blogPostFile}")`;
    const newImport = `import("./posts/${baseName}")`;
    registryContent = registryContent.replace(oldImport, newImport);
  } else {
    // Remove the entire line if no alternative exists
    console.log(`✗ No alternative found - will remove entry`);
    // Find the full line containing this import
    const linePattern = new RegExp(`^.*"[^"]+": \\(\\) => import\\("\\./posts/${blogPostFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\),?\\n`, 'gm');
    registryContent = registryContent.replace(linePattern, '');
  }
});

// Remove any duplicate keys
const lines = registryContent.split('\n');
const seenKeys = new Set();
const cleanedLines = [];

lines.forEach(line => {
  if (line.includes(': () => import(')) {
    const keyMatch = line.match(/"([^"]+)":/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        cleanedLines.push(line);
      } else {
        console.log(`Removing duplicate key: ${key}`);
      }
    } else {
      cleanedLines.push(line);
    }
  } else {
    cleanedLines.push(line);
  }
});

registryContent = cleanedLines.join('\n');

// Write back
fs.writeFileSync(registryPath, registryContent);
console.log('\n✨ postRegistry.js has been fixed!');