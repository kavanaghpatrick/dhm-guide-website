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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>DHM Guide Blog - Step by Step Test</h1>
      <p style={{ marginBottom: '20px' }}>Posts loaded: {posts.length}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Testing first post data:</h3>
        <pre style={{ backgroundColor: '#white', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify({
            title: posts[0]?.title,
            slug: posts[0]?.slug,
            date: posts[0]?.date,
            author: posts[0]?.author,
            excerpt: posts[0]?.excerpt?.substring(0, 100) + '...'
          }, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3>First 3 posts (no Tailwind):</h3>
        {posts.slice(0, 3).map((post, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', backgroundColor: 'white' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{post.title || 'No title'}</h4>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              {post.excerpt || 'No excerpt'}
            </p>
            <small style={{ color: '#999' }}>
              {post.date || 'No date'} • {post.author || 'DHM Guide Team'}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogMinimal;