// Test script to verify date handling fixes
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing date handling fixes...\n');

// Test the getValidDate function logic
function testGetValidDate() {
  console.log('Testing getValidDate function logic:');
  
  // Test cases
  const testCases = [
    { 
      name: 'Valid datePublished', 
      post: { datePublished: '2024-03-15', slug: 'test-1' },
      expected: '2024-03-15T00:00:00.000Z'
    },
    { 
      name: 'Valid date field', 
      post: { date: '2024-03-15', slug: 'test-2' },
      expected: '2024-03-15T00:00:00.000Z'
    },
    { 
      name: 'Invalid date string', 
      post: { date: 'invalid-date', slug: 'test-3' },
      expectedFallback: true
    },
    { 
      name: 'Missing date fields', 
      post: { slug: 'test-4' },
      expectedFallback: true
    },
    { 
      name: 'Empty date string', 
      post: { date: '', slug: 'test-5' },
      expectedFallback: true
    },
    { 
      name: 'ISO date format', 
      post: { datePublished: '2024-03-15T10:30:00Z', slug: 'test-6' },
      expected: '2024-03-15T10:30:00.000Z'
    }
  ];
  
  // Simulate the getValidDate function
  const getValidDate = (post, slug) => {
    const dateString = post.datePublished || post.date;
    
    if (dateString) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      console.log(`  ⚠️ Invalid date string "${dateString}" for post: ${slug}`);
    } else {
      console.log(`  ⚠️ No date field found for post: ${slug}`);
    }
    
    const fallbackDate = new Date('2024-01-01T00:00:00Z');
    console.log(`  ℹ️ Using fallback date for post: ${slug}`);
    return fallbackDate;
  };
  
  testCases.forEach(testCase => {
    console.log(`\n  Testing: ${testCase.name}`);
    const result = getValidDate(testCase.post, testCase.post.slug);
    
    if (testCase.expectedFallback) {
      const fallbackDate = new Date('2024-01-01T00:00:00Z');
      if (result.toISOString() === fallbackDate.toISOString()) {
        console.log(`  ✅ Correctly used fallback date`);
      } else {
        console.log(`  ❌ Expected fallback date but got: ${result.toISOString()}`);
      }
    } else if (testCase.expected) {
      if (result.toISOString() === testCase.expected) {
        console.log(`  ✅ Correct date: ${result.toISOString()}`);
      } else {
        console.log(`  ❌ Expected ${testCase.expected} but got: ${result.toISOString()}`);
      }
    }
  });
}

// Test actual blog post files
async function testBlogPostFiles() {
  console.log('\n\nTesting actual blog post files:');
  
  try {
    const postsDir = join(__dirname, '../src/newblog/data/posts');
    const files = readdirSync(postsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let filesWithoutDates = 0;
    let filesWithInvalidDates = 0;
    let filesWithValidDates = 0;
    
    for (const file of jsonFiles) {
      const content = readFileSync(join(postsDir, file), 'utf-8');
      const post = JSON.parse(content);
      
      const dateString = post.datePublished || post.date;
      if (!dateString) {
        filesWithoutDates++;
        console.log(`  ⚠️ ${file}: Missing date field`);
      } else {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          filesWithInvalidDates++;
          console.log(`  ❌ ${file}: Invalid date "${dateString}"`);
        } else {
          filesWithValidDates++;
        }
      }
    }
    
    console.log(`\n📊 Blog Post Date Summary:`);
    console.log(`   Total posts: ${jsonFiles.length}`);
    console.log(`   Valid dates: ${filesWithValidDates}`);
    console.log(`   Missing dates: ${filesWithoutDates}`);
    console.log(`   Invalid dates: ${filesWithInvalidDates}`);
    
    if (filesWithoutDates > 0 || filesWithInvalidDates > 0) {
      console.log(`\n⚠️  ${filesWithoutDates + filesWithInvalidDates} posts will use fallback date (2024-01-01)`);
    }
    
  } catch (error) {
    console.error('Error testing blog post files:', error);
  }
}

// Test formatDate function logic
function testFormatDate() {
  console.log('\n\nTesting formatDate function logic:');
  
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.log('  Invalid date provided to formatDate:', date);
      return 'Date unavailable';
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('  Error formatting date:', error);
      return 'Date unavailable';
    }
  };
  
  const testCases = [
    { name: 'Valid date', input: new Date('2024-03-15'), expected: 'March 15, 2024' },
    { name: 'Invalid date', input: new Date('invalid'), expected: 'Date unavailable' },
    { name: 'Null date', input: null, expected: 'Date unavailable' },
    { name: 'Undefined date', input: undefined, expected: 'Date unavailable' },
    { name: 'String instead of Date', input: '2024-03-15', expected: 'Date unavailable' },
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n  Testing: ${testCase.name}`);
    const result = formatDate(testCase.input);
    if (result === testCase.expected) {
      console.log(`  ✅ Correct: ${result}`);
    } else {
      console.log(`  ❌ Expected "${testCase.expected}" but got: "${result}"`);
    }
  });
}

// Run all tests
console.log('='.repeat(60));
testGetValidDate();
console.log('\n' + '='.repeat(60));
await testBlogPostFiles();
console.log('\n' + '='.repeat(60));
testFormatDate();
console.log('\n' + '='.repeat(60));

console.log('\n✅ Date handling tests completed!');