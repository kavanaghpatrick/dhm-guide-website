import React from 'react';

const BlogBasic = () => {
  console.log('BlogBasic component starting...');
  
  try {
    console.log('BlogBasic: Attempting to render...');
    
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Blog Basic Test</h1>
        <p>If you can see this text, React rendering is working.</p>
        <p>This component has NO hooks, NO imports from local files, NO complex logic.</p>
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
          <strong>Test successful!</strong> The error is likely in:
          <ul>
            <li>useSEO hook</li>
            <li>getAllPosts function</li>
            <li>Complex rendering logic</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('BlogBasic render error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>BlogBasic Error</h1>
        <p>Even the basic component failed: {error.message}</p>
      </div>
    );
  }
};

export default BlogBasic;