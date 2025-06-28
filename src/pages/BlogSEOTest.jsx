import React from 'react';
import { useSEO, generatePageSEO } from '../hooks/useSEO.js';

const BlogSEOTest = () => {
  console.log('BlogSEOTest: Starting...');
  
  try {
    console.log('BlogSEOTest: Testing SEO hook...');
    useSEO(generatePageSEO('blog'));
    console.log('BlogSEOTest: SEO hook completed successfully');
    
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Blog SEO Test</h1>
        <p>SEO hook executed successfully!</p>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', margin: '10px 0', border: '1px solid #c3e6cb' }}>
          ✅ useSEO hook works fine
        </div>
        <p>If you see this, the SEO hook is not the problem.</p>
      </div>
    );
  } catch (error) {
    console.error('BlogSEOTest: SEO hook error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>SEO Hook Error</h1>
        <p>Error in SEO hook: {error.message}</p>
        <div style={{ backgroundColor: '#f8d7da', padding: '10px', margin: '10px 0', border: '1px solid #f5c6cb' }}>
          ❌ SEO hook is causing the error
        </div>
      </div>
    );
  }
};

export default BlogSEOTest;