import React, { useState } from 'react';
import { getAllPosts } from '../blog/utils/postLoader';
import { useSEO, generatePageSEO } from '../hooks/useSEO.js';

const BlogMinimal = () => {
  console.log('BlogMinimal rendering...');
  
  let posts = [];
  let error = null;
  
  try {
    console.log('Step 1: Testing SEO hook...');
    useSEO(generatePageSEO('blog'));
    console.log('Step 2: SEO hook successful');
    
    console.log('Step 3: Testing useState...');
    const [selectedTags, setSelectedTags] = useState([]);
    const [showAllFilters, setShowAllFilters] = useState(false);
    console.log('Step 4: useState successful');
    
    console.log('Step 5: getAllPosts imported successfully');
    console.log('Step 6: Calling getAllPosts...');
    posts = getAllPosts();
    console.log('Step 7: Posts loaded successfully:', posts.length);
    
    console.log('Step 8: Testing functions...');
    const getAllTags = () => {
      const allTags = posts.flatMap(post => post.tags);
      return [...new Set(allTags)].sort();
    };
    
    const allTags = getAllTags();
    console.log('Step 9: getAllTags successful, found:', allTags.length, 'tags');
    
  } catch (err) {
    console.error('Error in BlogMinimal:', err);
    error = err.message;
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Blog Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Test rendering step by step to find the exact issue
  let renderContent = null;
  
  try {
    console.log('Starting render test...');
    
    renderContent = (
      <div style={{ padding: '20px' }}>
        <h1>Blog Render Test - Step by Step</h1>
        <p>Posts available: {posts.length}</p>
        
        {/* Test 1: Basic text only */}
        <div style={{ marginBottom: '20px', border: '1px solid green', padding: '10px' }}>
          <h3>Test 1: Basic text rendering</h3>
          <p>This is basic text. If you see this, basic rendering works.</p>
        </div>
        
        {/* Test 2: Simple data display */}
        <div style={{ marginBottom: '20px', border: '1px solid blue', padding: '10px' }}>
          <h3>Test 2: First post title only</h3>
          <p>Title: {String(posts[0]?.title || 'NO TITLE')}</p>
        </div>
        
        {/* Test 3: Try rendering ONE post safely */}
        <div style={{ marginBottom: '20px', border: '1px solid orange', padding: '10px' }}>
          <h3>Test 3: Single post render</h3>
          {posts[0] ? (
            <div>
              <p>ID: {String(posts[0].id || 'no-id')}</p>
              <p>Slug: {String(posts[0].slug || 'no-slug')}</p>
              <p>Date: {String(posts[0].date || 'no-date')}</p>
            </div>
          ) : (
            <p>No first post found</p>
          )}
        </div>
      </div>
    );
    
    console.log('Render content created successfully');
    
  } catch (renderError) {
    console.error('Render error:', renderError);
    renderContent = (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Render Error</h1>
        <p>Error during render: {renderError.message}</p>
      </div>
    );
  }
  
  return renderContent;
};

export default BlogMinimal;