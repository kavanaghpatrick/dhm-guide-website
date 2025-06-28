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
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Blog Posts Loading Test</h1>
      {error ? (
        <div style={{ color: 'red' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ color: 'green' }}>
          <h3>Success!</h3>
          <p>Posts loaded: {posts.length}</p>
          <p>First post: {posts[0]?.title}</p>
        </div>
      )}
    </div>
  );
};

export default BlogMinimal;