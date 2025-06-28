import React from 'react';
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
    
    console.log('Step 3: getAllPosts imported successfully');
    console.log('Step 4: Calling getAllPosts...');
    posts = getAllPosts();
    console.log('Step 5: Posts loaded successfully:', posts.length);
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