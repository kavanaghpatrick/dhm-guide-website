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
        
        // Check if ID field is missing
        if (!data.id) {
            // Get the filename without extension to use as ID
            const filename = path.basename(filePath, '.json');
            
            // Add the ID field using the filename (which should match the slug)
            data.id = filename;
            
            // Write the updated content back to the file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            
            return { filename, status: 'fixed' };
        } else {
            return { filename: path.basename(filePath), status: 'already_has_id', existingId: data.id };
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
    console.log('Scanning for blog posts with missing ID fields...\n');
    
    // Get all JSON files in the posts directory
    const files = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(postsDir, file));
    
    console.log(`Found ${files.length} JSON files in posts directory\n`);
    
    // Process each file
    const results = {
        fixed: [],
        already_has_id: [],
        errors: []
    };
    
    files.forEach(filePath => {
        const result = processFile(filePath);
        
        if (result.status === 'fixed') {
            results.fixed.push(result.filename);
        } else if (result.status === 'already_has_id') {
            results.already_has_id.push(result);
        } else if (result.status === 'error') {
            results.errors.push(result);
        }
    });
    
    // Report results
    console.log('=== RESULTS ===\n');
    
    if (results.fixed.length > 0) {
        console.log(`✅ Fixed ${results.fixed.length} files with missing IDs:`);
        results.fixed.forEach(filename => {
            console.log(`   - ${filename}`);
        });
        console.log('');
    }
    
    if (results.already_has_id.length > 0) {
        console.log(`ℹ️  ${results.already_has_id.length} files already have ID fields`);
        
        // Check for any mismatches between filename and ID
        const mismatches = results.already_has_id.filter(r => {
            const expectedId = r.filename.replace('.json', '');
            return r.existingId !== expectedId;
        });
        
        if (mismatches.length > 0) {
            console.log('\n⚠️  Found ID mismatches (filename != id):');
            mismatches.forEach(r => {
                const expectedId = r.filename.replace('.json', '');
                console.log(`   - ${r.filename}: id="${r.existingId}" (expected: "${expectedId}")`);
            });
        }
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
    console.log(`Files already had IDs: ${results.already_has_id.length}`);
    console.log(`Files with errors: ${results.errors.length}`);
}

// Run the script
main();