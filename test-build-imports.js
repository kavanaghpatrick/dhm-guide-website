#!/usr/bin/env node

/**
 * Build-time Import Test
 * 
 * This script tests how Vite processes imports during build time
 * and checks the actual output URLs and file handling.
 */

import { build } from 'vite'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(60) + colors.reset);
  console.log(colors.bold + colors.cyan + title + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(60) + colors.reset);
}

// Create a simple test component that uses the same imports as Home.jsx
const testComponentContent = `
import React from 'react'
import liver1536w from './assets/02_liver_protection_infographic-1536w.webp'
import gaba1536w from './assets/04_gaba_receptor_mechanism-1536w.webp'

export default function ImportTest() {
  // Log the resolved imports
  console.log('Vite resolved imports:')
  console.log('liver1536w:', liver1536w)
  console.log('gaba1536w:', gaba1536w)
  
  return (
    <div>
      <h1>Import Resolution Test</h1>
      <div>
        <p>Liver image URL: {liver1536w}</p>
        <p>GABA image URL: {gaba1536w}</p>
        <img src={liver1536w} alt="Liver" style={{maxWidth: '200px'}} />
        <img src={gaba1536w} alt="GABA" style={{maxWidth: '200px'}} />
      </div>
    </div>
  )
}
`;

async function testBuildImports() {
  logSection('BUILD-TIME IMPORT RESOLUTION TEST');
  
  try {
    // Create a temporary test component
    const testComponentPath = join(__dirname, 'src', 'ImportTest.jsx');
    writeFileSync(testComponentPath, testComponentContent);
    log(colors.green, '✓ Created test component:', testComponentPath);
    
    // Create a temporary test entry point
    const testEntryContent = `
import React from 'react'
import { createRoot } from 'react-dom/client'
import ImportTest from './ImportTest.jsx'

const root = createRoot(document.getElementById('root'))
root.render(<ImportTest />)
`;
    
    const testEntryPath = join(__dirname, 'src', 'test-main.jsx');
    writeFileSync(testEntryPath, testEntryContent);
    log(colors.green, '✓ Created test entry point:', testEntryPath);
    
    // Test build configuration
    logSection('1. TESTING VITE BUILD PROCESS');
    
    const buildConfig = {
      configFile: join(__dirname, 'vite.config.js'),
      build: {
        outDir: 'dist-test',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: testEntryPath
          },
          output: {
            entryFileNames: 'test-[name].js',
            chunkFileNames: 'test-[name].js',
            assetFileNames: 'assets/[name]-[hash][extname]'
          }
        },
        write: true,
        minify: false, // Keep readable for debugging
        sourcemap: true
      },
      logLevel: 'info'
    };
    
    log(colors.blue, 'Starting Vite build with test configuration...');
    
    const buildResult = await build(buildConfig);
    log(colors.green, '✓ Build completed successfully');
    
    // Analyze the build output
    logSection('2. ANALYZING BUILD OUTPUT');
    
    const distPath = join(__dirname, 'dist-test');
    if (existsSync(distPath)) {
      log(colors.green, '✓ Build output directory created:', distPath);
      
      // Check what assets were generated
      const { readdirSync, statSync } = await import('fs');
      
      function analyzeDirectory(dir, prefix = '') {
        const items = readdirSync(dir);
        items.forEach(item => {
          const itemPath = join(dir, item);
          const stats = statSync(itemPath);
          
          if (stats.isDirectory()) {
            log(colors.cyan, `${prefix}📁 ${item}/`);
            analyzeDirectory(itemPath, prefix + '  ');
          } else {
            const sizeKB = Math.round(stats.size / 1024);
            log(colors.blue, `${prefix}📄 ${item} (${sizeKB}KB)`);
            
            // If it's a JS file, check for image imports
            if (item.endsWith('.js')) {
              try {
                const content = readFileSync(itemPath, 'utf8');
                const imageMatches = content.match(/["']([^"']*\.(webp|png|jpg|jpeg))["']/g);
                if (imageMatches) {
                  log(colors.yellow, `${prefix}  📸 Image references found:`);
                  imageMatches.forEach(match => {
                    log(colors.yellow, `${prefix}    ${match}`);
                  });
                }
              } catch (e) {
                log(colors.red, `${prefix}  ✗ Could not read file:`, e.message);
              }
            }
          }
        });
      }
      
      analyzeDirectory(distPath);
    } else {
      log(colors.red, '✗ Build output directory not found');
    }
    
    // Test if the images were processed correctly
    logSection('3. IMAGE PROCESSING VERIFICATION');
    
    const assetsDir = join(__dirname, 'dist-test', 'assets');
    if (existsSync(assetsDir)) {
      const assetFiles = readdirSync(assetsDir);
      const imageAssets = assetFiles.filter(file => 
        file.includes('liver_protection') || file.includes('gaba_receptor')
      );
      
      if (imageAssets.length > 0) {
        log(colors.green, '✓ Image assets found in build output:');
        imageAssets.forEach(asset => {
          const assetPath = join(assetsDir, asset);
          const stats = statSync(assetPath);
          log(colors.green, `  - ${asset} (${Math.round(stats.size / 1024)}KB)`);
        });
      } else {
        log(colors.yellow, '⚠ No image assets found with expected names');
        log(colors.blue, 'All assets in build:');
        assetFiles.forEach(file => {
          log(colors.blue, `  - ${file}`);
        });
      }
    } else {
      log(colors.red, '✗ Assets directory not found in build output');
    }
    
    // Check the generated HTML to see how images are referenced
    logSection('4. HTML OUTPUT ANALYSIS');
    
    const htmlFiles = readdirSync(join(__dirname, 'dist-test'))
      .filter(file => file.endsWith('.html'));
    
    if (htmlFiles.length > 0) {
      htmlFiles.forEach(htmlFile => {
        try {
          const htmlPath = join(__dirname, 'dist-test', htmlFile);
          const htmlContent = readFileSync(htmlPath, 'utf8');
          
          log(colors.green, `✓ Analyzing ${htmlFile}:`);
          
          // Check for asset references
          const assetRefs = htmlContent.match(/href="[^"]*assets\/[^"]*"/g) || [];
          const srcRefs = htmlContent.match(/src="[^"]*assets\/[^"]*"/g) || [];
          
          if (assetRefs.length > 0) {
            log(colors.blue, '  Asset href references:');
            assetRefs.forEach(ref => log(colors.blue, `    ${ref}`));
          }
          
          if (srcRefs.length > 0) {
            log(colors.blue, '  Asset src references:');
            srcRefs.forEach(ref => log(colors.blue, `    ${ref}`));
          }
        } catch (error) {
          log(colors.red, `✗ Error reading ${htmlFile}:`, error.message);
        }
      });
    }
    
    // Cleanup test files
    logSection('5. CLEANUP');
    
    try {
      const { unlinkSync } = await import('fs');
      unlinkSync(testComponentPath);
      unlinkSync(testEntryPath);
      log(colors.green, '✓ Cleaned up test files');
    } catch (error) {
      log(colors.yellow, '⚠ Could not clean up test files:', error.message);
    }
    
    logSection('TEST SUMMARY');
    
    log(colors.cyan, 'Key Findings:');
    log(colors.blue, '1. Check if images were processed and moved to dist-test/assets/');
    log(colors.blue, '2. Verify that import statements resolve to correct asset URLs');
    log(colors.blue, '3. Compare with actual Home.jsx import behavior');
    log(colors.blue, '4. Test responsive image component with build output');
    
  } catch (error) {
    log(colors.red, '✗ Build test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testBuildImports().catch(error => {
  log(colors.red, 'Test script failed:', error.message);
  console.error(error);
  process.exit(1);
});