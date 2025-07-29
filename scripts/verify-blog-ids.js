#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the posts directory
const postsDir = path.join(__dirname, '..', 'src', 'newblog', 'data', 'posts');

// Main function
function main() {
    console.log('Verifying all blog posts have correct ID fields...\n');
    
    // Get all JSON files
    const files = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(postsDir, file));
    
    console.log(`Checking ${files.length} JSON files...\n`);
    
    let allGood = true;
    const issues = [];
    
    files.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            const filename = path.basename(filePath, '.json');
            
            if (!data.id) {
                allGood = false;
                issues.push({
                    file: filename,
                    issue: 'Missing ID field'
                });
            } else if (data.id !== filename) {
                allGood = false;
                issues.push({
                    file: filename,
                    issue: `ID mismatch: "${data.id}" should be "${filename}"`
                });
            }
        } catch (error) {
            allGood = false;
            issues.push({
                file: path.basename(filePath),
                issue: `Error: ${error.message}`
            });
        }
    });
    
    if (allGood) {
        console.log('✅ SUCCESS: All blog posts have correct ID fields!');
        console.log(`   - Total files verified: ${files.length}`);
        console.log('   - All IDs match their filenames');
        console.log('   - No missing ID fields found');
    } else {
        console.log('❌ ISSUES FOUND:');
        issues.forEach(issue => {
            console.log(`   - ${issue.file}: ${issue.issue}`);
        });
        console.log(`\nTotal issues: ${issues.length}`);
    }
}

// Run verification
main();