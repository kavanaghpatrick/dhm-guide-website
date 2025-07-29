#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the posts directory
const postsDir = path.join(__dirname, '..', 'src', 'newblog', 'data', 'posts');

// Function to process a single JSON file
function processFile(filePath) {
    try {
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Get the expected ID from filename
        const expectedId = path.basename(filePath, '.json');
        
        // Check if ID matches filename
        if (data.id && data.id !== expectedId) {
            // Store the old ID for reporting
            const oldId = data.id;
            
            // Update the ID to match the filename
            data.id = expectedId;
            
            // Write the updated content back to the file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            
            return { 
                filename: path.basename(filePath), 
                status: 'fixed', 
                oldId, 
                newId: expectedId 
            };
        } else if (data.id === expectedId) {
            return { 
                filename: path.basename(filePath), 
                status: 'already_correct' 
            };
        } else {
            return { 
                filename: path.basename(filePath), 
                status: 'no_id' 
            };
        }
    } catch (error) {
        return { 
            filename: path.basename(filePath), 
            status: 'error', 
            error: error.message 
        };
    }
}

// Main function
function main() {
    console.log('Scanning for blog posts with ID mismatches...\n');
    
    // Get all JSON files in the posts directory
    const files = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(postsDir, file));
    
    console.log(`Found ${files.length} JSON files in posts directory\n`);
    
    // Process each file
    const results = {
        fixed: [],
        already_correct: [],
        no_id: [],
        errors: []
    };
    
    files.forEach(filePath => {
        const result = processFile(filePath);
        
        if (result.status === 'fixed') {
            results.fixed.push(result);
        } else if (result.status === 'already_correct') {
            results.already_correct.push(result);
        } else if (result.status === 'no_id') {
            results.no_id.push(result);
        } else if (result.status === 'error') {
            results.errors.push(result);
        }
    });
    
    // Report results
    console.log('=== RESULTS ===\n');
    
    if (results.fixed.length > 0) {
        console.log(`✅ Fixed ${results.fixed.length} files with ID mismatches:`);
        results.fixed.forEach(result => {
            console.log(`   - ${result.filename}:`);
            console.log(`     Old ID: "${result.oldId}"`);
            console.log(`     New ID: "${result.newId}"`);
        });
        console.log('');
    }
    
    if (results.already_correct.length > 0) {
        console.log(`ℹ️  ${results.already_correct.length} files already have correct IDs`);
        console.log('');
    }
    
    if (results.no_id.length > 0) {
        console.log(`⚠️  ${results.no_id.length} files have no ID field`);
        console.log('');
    }
    
    if (results.errors.length > 0) {
        console.log(`❌ ${results.errors.length} files had errors:`);
        results.errors.forEach(result => {
            console.log(`   - ${result.filename}: ${result.error}`);
        });
        console.log('');
    }
    
    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Files fixed: ${results.fixed.length}`);
    console.log(`Files already correct: ${results.already_correct.length}`);
    console.log(`Files without ID: ${results.no_id.length}`);
    console.log(`Files with errors: ${results.errors.length}`);
}

// Run the script
main();