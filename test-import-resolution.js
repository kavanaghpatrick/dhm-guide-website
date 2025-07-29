#!/usr/bin/env node

/**
 * Import Resolution Test Script
 * 
 * This script tests the same image imports that Home.jsx is using
 * to diagnose module resolution and bundling issues with Vite.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

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

function checkFileExists(filePath, description) {
  const exists = existsSync(filePath);
  if (exists) {
    const stats = statSync(filePath);
    log(colors.green, `✓ ${description}: ${filePath} (${Math.round(stats.size / 1024)}KB)`);
    return true;
  } else {
    log(colors.red, `✗ ${description}: ${filePath} - FILE NOT FOUND`);
    return false;
  }
}

async function testImportResolution() {
  logSection('IMPORT RESOLUTION DIAGNOSTIC TEST');
  
  // Test file system paths first
  logSection('1. FILE SYSTEM VERIFICATION');
  
  const projectRoot = __dirname;
  log(colors.blue, 'Project Root:', projectRoot);
  
  // Check the imports that Home.jsx is trying to make
  const imagePaths = [
    {
      path: join(projectRoot, 'src/assets/02_liver_protection_infographic-1536w.webp'),
      description: 'Liver Protection Image (1536w)',
      importPath: '../assets/02_liver_protection_infographic-1536w.webp'
    },
    {
      path: join(projectRoot, 'src/assets/04_gaba_receptor_mechanism-1536w.webp'),
      description: 'GABA Mechanism Image (1536w)',
      importPath: '../assets/04_gaba_receptor_mechanism-1536w.webp'
    },
    {
      path: join(projectRoot, 'src/assets/05_traditional_heritage-1536w.webp'),
      description: 'Traditional Heritage Image (1536w)',
      importPath: '/assets/05_traditional_heritage-1536w.webp'
    },
    {
      path: join(projectRoot, 'public/images/before-after-dhm-1536w.webp'),
      description: 'Before/After DHM Image',
      importPath: '/images/before-after-dhm-1536w.webp'
    },
    {
      path: join(projectRoot, 'public/assets/05_traditional_heritage-1536w.webp'),
      description: 'Heritage Image (public/assets)',
      importPath: '/assets/05_traditional_heritage-1536w.webp'
    }
  ];
  
  let filesFound = 0;
  imagePaths.forEach(({ path, description, importPath }) => {
    log(colors.yellow, `\nChecking: ${importPath}`);
    if (checkFileExists(path, description)) {
      filesFound++;
    }
  });
  
  log(colors.blue, `\nSummary: ${filesFound}/${imagePaths.length} files found on filesystem`);
  
  // Test import resolution
  logSection('2. VITE IMPORT RESOLUTION TEST');
  
  try {
    // Try to resolve the imports as Vite would
    const viteConfigPath = join(projectRoot, 'vite.config.js');
    if (existsSync(viteConfigPath)) {
      log(colors.green, '✓ Found vite.config.js');
      
      // Read and display key Vite config
      const viteConfig = await import(`file://${viteConfigPath}`);
      log(colors.blue, 'Vite config loaded successfully');
      
      if (viteConfig.default?.resolve?.alias) {
        log(colors.cyan, 'Vite aliases found:');
        Object.entries(viteConfig.default.resolve.alias).forEach(([key, value]) => {
          log(colors.cyan, `  ${key} -> ${value}`);
        });
      }
    } else {
      log(colors.red, '✗ No vite.config.js found');
    }
  } catch (error) {
    log(colors.red, '✗ Error loading Vite config:', error.message);
  }
  
  // Test dynamic imports (how Vite handles them)
  logSection('3. DYNAMIC IMPORT TESTS');
  
  const testImports = [
    {
      path: './src/assets/02_liver_protection_infographic-1536w.webp',
      description: 'Liver image (relative)'
    },
    {
      path: './src/assets/04_gaba_receptor_mechanism-1536w.webp',
      description: 'GABA image (relative)'
    }
  ];
  
  for (const { path, description } of testImports) {
    try {
      log(colors.yellow, `\nTesting import: ${path}`);
      const fullPath = resolve(projectRoot, path);
      
      if (existsSync(fullPath)) {
        log(colors.green, `✓ ${description} - File exists at: ${fullPath}`);
        
        // In a real Vite environment, this would work differently
        // For testing, we'll just check if it's accessible
        const stats = statSync(fullPath);
        log(colors.blue, `  File size: ${Math.round(stats.size / 1024)}KB`);
        log(colors.blue, `  Modified: ${stats.mtime.toISOString()}`);
      } else {
        log(colors.red, `✗ ${description} - File not found at: ${fullPath}`);
      }
    } catch (error) {
      log(colors.red, `✗ Error testing ${description}:`, error.message);
    }
  }
  
  // Test public asset resolution
  logSection('4. PUBLIC ASSET RESOLUTION');
  
  const publicAssets = [
    '/images/before-after-dhm-1536w.webp',
    '/images/before-after-dhm-380w.webp',
    '/images/before-after-dhm-640w.webp',
    '/assets/05_traditional_heritage-1536w.webp',
    '/assets/05_traditional_heritage-640w.webp'
  ];
  
  publicAssets.forEach(assetPath => {
    const fullPath = join(projectRoot, 'public', assetPath);
    const exists = existsSync(fullPath);
    
    if (exists) {
      const stats = statSync(fullPath);
      log(colors.green, `✓ Public asset: ${assetPath} (${Math.round(stats.size / 1024)}KB)`);
    } else {
      log(colors.red, `✗ Public asset missing: ${assetPath}`);
      log(colors.yellow, `    Expected at: ${fullPath}`);
    }
  });
  
  // Test different resolution strategies
  logSection('5. RESOLUTION STRATEGY ANALYSIS');
  
  log(colors.cyan, 'Import patterns used in Home.jsx:');
  log(colors.blue, '1. Relative imports from src/assets: ../assets/image.webp');
  log(colors.blue, '2. Public path references: /images/image.webp');
  log(colors.blue, '3. Public asset references: /assets/image.webp');
  
  log(colors.cyan, '\nVite handling:');
  log(colors.blue, '- Relative imports: Processed by Vite, URLs generated');
  log(colors.blue, '- Public paths: Served directly from public folder');
  log(colors.blue, '- Asset imports: Should be processed and hashed by Vite');
  
  // Recommendations
  logSection('6. DIAGNOSTIC RECOMMENDATIONS');
  
  const recommendations = [
    'Check if all image files exist in expected locations',
    'Verify Vite asset processing is working correctly',
    'Test imports in development vs production builds',
    'Check browser network tab for failed resource loads',
    'Verify srcSet paths match actual file locations',
    'Test responsive image component configuration'
  ];
  
  recommendations.forEach((rec, index) => {
    log(colors.yellow, `${index + 1}. ${rec}`);
  });
  
  // Environment info
  logSection('7. ENVIRONMENT INFORMATION');
  
  log(colors.blue, 'Node.js version:', process.version);
  log(colors.blue, 'Platform:', process.platform);
  log(colors.blue, 'Working directory:', process.cwd());
  log(colors.blue, 'Script location:', __filename);
  
  // Check package.json for relevant dependencies
  try {
    const pkg = JSON.parse(require('fs').readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    log(colors.cyan, '\nRelevant dependencies:');
    
    const relevantDeps = ['vite', 'react', 'framer-motion'];
    relevantDeps.forEach(dep => {
      if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
        const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
        log(colors.green, `  ${dep}: ${version}`);
      }
    });
  } catch (error) {
    log(colors.red, 'Could not read package.json:', error.message);
  }
  
  logSection('TEST COMPLETE');
  log(colors.green, 'Import resolution diagnostic complete!');
  log(colors.cyan, 'Check the output above for missing files and configuration issues.');
}

// Run the test
testImportResolution().catch(error => {
  log(colors.red, 'Test failed:', error.message);
  console.error(error);
  process.exit(1);
});