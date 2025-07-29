import React from 'react'

// Test the exact same imports that Home.jsx is using
console.log('=== TESTING VITE IMPORT RESOLUTION ===')

// 1. Test relative imports from src/assets (same as Home.jsx lines 19-20)
console.log('Testing relative imports from src/assets...')
try {
  const liver1536w = await import('../assets/02_liver_protection_infographic-1536w.webp')
  console.log('✓ Liver 1536w import:', liver1536w)
  console.log('  - default export:', liver1536w.default)
  console.log('  - type:', typeof liver1536w.default)
} catch (error) {
  console.error('✗ Liver 1536w import failed:', error)
}

try {
  const gaba1536w = await import('../assets/04_gaba_receptor_mechanism-1536w.webp')
  console.log('✓ GABA 1536w import:', gaba1536w)
  console.log('  - default export:', gaba1536w.default)
  console.log('  - type:', typeof gaba1536w.default)
} catch (error) {
  console.error('✗ GABA 1536w import failed:', error)
}

// 2. Test static imports (how Home.jsx does it)
import liver1536wStatic from '../assets/02_liver_protection_infographic-1536w.webp'
import gaba1536wStatic from '../assets/04_gaba_receptor_mechanism-1536w.webp'

console.log('Static imports resolved:')
console.log('  - liver1536wStatic:', liver1536wStatic)
console.log('  - gaba1536wStatic:', gaba1536wStatic)
console.log('  - liver type:', typeof liver1536wStatic)
console.log('  - gaba type:', typeof gaba1536wStatic)

// 3. Test if these resolve to URLs or other values
console.log('URL validation:')
console.log('  - liver is URL-like:', liver1536wStatic?.includes?.('/') || liver1536wStatic?.startsWith?.('data:'))
console.log('  - gaba is URL-like:', gaba1536wStatic?.includes?.('/') || gaba1536wStatic?.startsWith?.('data:'))

// 4. Test the public asset paths used in the LazyImage component
console.log('Public asset paths (used in LazyImage):')
const publicPaths = [
  '/assets/05_traditional_heritage-1536w.webp',
  '/assets/05_traditional_heritage-640w.webp',
  '/assets/05_traditional_heritage-768w.webp',
  '/assets/05_traditional_heritage-1024w.webp'
]

publicPaths.forEach(path => {
  console.log(`  - ${path}: should be served from public/assets/`)
})

// 5. Test the responsive image srcSet paths
console.log('Responsive image srcSet paths (from Home.jsx):')
const srcSetPaths = [
  '/images/before-after-dhm-380w.webp',
  '/images/before-after-dhm-500w.webp', 
  '/images/before-after-dhm-640w.webp',
  '/images/before-after-dhm-768w.webp',
  '/images/before-after-dhm-1024w.webp',
  '/images/before-after-dhm-1536w.webp'
]

srcSetPaths.forEach(path => {
  console.log(`  - ${path}: should be served from public/images/`)
})

export default function TestImports() {
  console.log('TestImports component rendering...')
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Import Resolution Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Static Import Results:</h2>
        <p>Liver image import: {liver1536wStatic}</p>
        <p>GABA image import: {gaba1536wStatic}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Image Display Test:</h2>
        {liver1536wStatic && (
          <div>
            <h3>Liver Protection Image:</h3>
            <img 
              src={liver1536wStatic} 
              alt="Liver protection test"
              style={{ maxWidth: '300px' }}
              onLoad={() => console.log('✓ Liver image loaded successfully')}
              onError={(e) => console.error('✗ Liver image failed to load:', e)}
            />
          </div>
        )}
        
        {gaba1536wStatic && (
          <div>
            <h3>GABA Mechanism Image:</h3>
            <img 
              src={gaba1536wStatic} 
              alt="GABA mechanism test"
              style={{ maxWidth: '300px' }}
              onLoad={() => console.log('✓ GABA image loaded successfully')}
              onError={(e) => console.error('✗ GABA image failed to load:', e)}
            />
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Public Asset Test:</h2>
        <img 
          src="/assets/05_traditional_heritage-1536w.webp"
          alt="Heritage test" 
          style={{ maxWidth: '300px' }}
          onLoad={() => console.log('✓ Heritage image loaded successfully')}
          onError={(e) => console.error('✗ Heritage image failed to load:', e)}
        />
      </div>
      
      <div>
        <h2>Console Output:</h2>
        <p>Check the browser console for detailed import resolution information.</p>
      </div>
    </div>
  )
}