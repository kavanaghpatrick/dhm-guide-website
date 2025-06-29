import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script is no longer needed as the legacy blog system has been removed
// The new blog system loads data directly from JSON files in /src/newblog/data/posts/

console.log('⚠️  This script is deprecated!');
console.log('The legacy blog system has been removed.');
console.log('Blog posts are now managed as JSON files in /src/newblog/data/posts/');
console.log('');
console.log('To add new blog posts:');
console.log('1. Create a new JSON file in /src/newblog/data/posts/');
console.log('2. Follow the existing post structure');
console.log('3. Update /src/newblog/data/posts/index.js to include the new post');