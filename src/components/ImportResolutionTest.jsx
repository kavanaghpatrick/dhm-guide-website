import React, { useState, useEffect } from 'react';
import ResponsiveImage from './ResponsiveImage.jsx';
import ResponsiveImageFixed from './ResponsiveImageFixed.jsx';

// Import the same images that Home.jsx uses
import liver1536w from '../assets/02_liver_protection_infographic-1536w.webp';
import gaba1536w from '../assets/04_gaba_receptor_mechanism-1536w.webp';

const ImportResolutionTest = () => {
  const [loadResults, setLoadResults] = useState({});

  useEffect(() => {
    // Log the resolved imports to console
    console.log('=== IMPORT RESOLUTION TEST ===');
    console.log('liver1536w (Vite import):', liver1536w);
    console.log('gaba1536w (Vite import):', gaba1536w);
    console.log('typeof liver1536w:', typeof liver1536w);
    console.log('typeof gaba1536w:', typeof gaba1536w);
  }, []);

  const handleImageLoad = (id, success, url = '') => {
    setLoadResults(prev => ({
      ...prev,
      [id]: { success, url, timestamp: new Date().toISOString() }
    }));
  };

  const testCases = [
    {
      id: 'vite-liver-original',
      name: 'Vite Import + Original ResponsiveImage (Liver)',
      component: ResponsiveImage,
      src: liver1536w,
      alt: 'Liver protection (Vite import with original component)'
    },
    {
      id: 'vite-liver-fixed',
      name: 'Vite Import + Fixed ResponsiveImage (Liver)',
      component: ResponsiveImageFixed,
      src: liver1536w,
      alt: 'Liver protection (Vite import with fixed component)'
    },
    {
      id: 'vite-gaba-original',
      name: 'Vite Import + Original ResponsiveImage (GABA)',
      component: ResponsiveImage,
      src: gaba1536w,
      alt: 'GABA mechanism (Vite import with original component)'
    },
    {
      id: 'vite-gaba-fixed',
      name: 'Vite Import + Fixed ResponsiveImage (GABA)',
      component: ResponsiveImageFixed,
      src: gaba1536w,
      alt: 'GABA mechanism (Vite import with fixed component)'
    },
    {
      id: 'public-heritage-original',
      name: 'Public Path + Original ResponsiveImage (Heritage)',
      component: ResponsiveImage,
      src: '/assets/05_traditional_heritage-1536w.webp',
      alt: 'Heritage image (public path with original component)'
    },
    {
      id: 'public-heritage-fixed',
      name: 'Public Path + Fixed ResponsiveImage (Heritage)',
      component: ResponsiveImageFixed,
      src: '/assets/05_traditional_heritage-1536w.webp',
      alt: 'Heritage image (public path with fixed component)'
    },
    {
      id: 'public-before-after',
      name: 'Public Image Path (Before/After)',
      component: 'img', // Regular img tag
      src: '/images/before-after-dhm-1536w.webp',
      alt: 'Before/After DHM (public images path)'
    }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Import Resolution Test Results</h1>
      
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Import Values Debug</h2>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`liver1536w: ${liver1536w}
gaba1536w: ${gaba1536w}
typeof liver: ${typeof liver1536w}
typeof gaba: ${typeof gaba1536w}

Is liver Vite-processed: ${/-[a-zA-Z0-9]{8,}\.webp$/.test(liver1536w)}
Is gaba Vite-processed: ${/-[a-zA-Z0-9]{8,}\.webp$/.test(gaba1536w)}`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Load Results Summary</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#eee' }}>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Test Case</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map(testCase => {
              const result = loadResults[testCase.id];
              return (
                <tr key={testCase.id}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{testCase.name}</td>
                  <td style={{ 
                    border: '1px solid #ccc', 
                    padding: '8px',
                    color: result ? (result.success ? 'green' : 'red') : 'orange'
                  }}>
                    {result ? (result.success ? '✅ Loaded' : '❌ Failed') : '⏳ Loading...'}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '12px' }}>
                    {result?.timestamp || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {testCases.map(testCase => {
        const Component = testCase.component;
        
        return (
          <div key={testCase.id} style={{ 
            marginBottom: '30px', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '5px' 
          }}>
            <h3>{testCase.name}</h3>
            <p><strong>Source:</strong> <code>{testCase.src}</code></p>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {Component === 'img' ? (
                  <img
                    src={testCase.src}
                    alt={testCase.alt}
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                    onLoad={() => handleImageLoad(testCase.id, true, testCase.src)}
                    onError={(e) => {
                      console.error(`Failed to load ${testCase.id}:`, e);
                      handleImageLoad(testCase.id, false, testCase.src);
                    }}
                  />
                ) : (
                  <Component
                    src={testCase.src}
                    alt={testCase.alt}
                    className=""
                    width={200}
                    height={150}
                    loading="eager"
                    onLoad={() => handleImageLoad(testCase.id, true, testCase.src)}
                    onError={(e) => {
                      console.error(`Failed to load ${testCase.id}:`, e);
                      handleImageLoad(testCase.id, false, testCase.src);
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong>Expected behavior:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                  {testCase.id.includes('vite') && testCase.id.includes('original') && (
                    <li style={{ color: 'red' }}>⚠️ May generate invalid srcSet from hashed URL</li>
                  )}
                  {testCase.id.includes('vite') && testCase.id.includes('fixed') && (
                    <li style={{ color: 'green' }}>✅ Should handle Vite import correctly</li>
                  )}
                  {testCase.id.includes('public') && (
                    <li style={{ color: 'blue' }}>ℹ️ Should work with both components</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
        <h3>How to Use This Test</h3>
        <ol>
          <li>Open browser dev tools and check the Console tab</li>
          <li>Look for any 404 errors in the Network tab</li>
          <li>Check if images load successfully above</li>
          <li>Compare behavior between "Original" and "Fixed" components</li>
          <li>Verify that srcSet attributes are generated correctly</li>
        </ol>
        
        <h4>What to Look For:</h4>
        <ul>
          <li><strong>Vite imports with Original component:</strong> May show 404s for invalid srcSet URLs</li>
          <li><strong>Vite imports with Fixed component:</strong> Should load correctly without srcSet</li>
          <li><strong>Public paths:</strong> Should work with both components and generate valid srcSet</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportResolutionTest;