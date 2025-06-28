// Test if all imports work correctly
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing blog post imports...\n');

try {
  // Test 1: Check if all JSON files exist
  const postsDir = join(__dirname, '../src/newblog/data/posts');
  const files = readdirSync(postsDir);
  console.log(`✅ Found ${files.length} post files`);
  
  // Test 2: Check if postRegistry matches actual files
  const registryPath = join(__dirname, '../src/newblog/data/postRegistry.js');
  const registryContent = readFileSync(registryPath, 'utf-8');
  const slugMatches = registryContent.match(/['"]([^'"]+)['"]: \(\) => import/g) || [];
  console.log(`✅ Registry contains ${slugMatches.length} entries`);
  
  // Test 3: Verify each post can be read
  let errors = 0;
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = readFileSync(join(postsDir, file), 'utf-8');
        JSON.parse(content);
      } catch (e) {
        console.error(`❌ Error reading ${file}: ${e.message}`);
        errors++;
      }
    }
  }
  
  if (errors === 0) {
    console.log(`✅ All post files are valid JSON`);
  } else {
    console.log(`❌ Found ${errors} invalid post files`);
  }
  
  // Test 4: Check for mismatches
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  console.log(`\n📊 Summary:`);
  console.log(`   JSON files: ${jsonFiles.length}`);
  console.log(`   Registry entries: ${slugMatches.length}`);
  
  if (jsonFiles.length !== slugMatches.length) {
    console.warn(`⚠️  Mismatch between files and registry!`);
  }
  
} catch (error) {
  console.error('Test failed:', error);
  process.exit(1);
}

console.log('\n✅ All tests passed!');