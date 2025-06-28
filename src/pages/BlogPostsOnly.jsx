import React from 'react';
import { getAllPosts } from '../blog/utils/postLoader';

const BlogPostsOnly = () => {
  console.log('BlogPostsOnly: Starting...');
  
  let posts = [];
  let error = null;
  
  try {
    console.log('BlogPostsOnly: Loading posts...');
    posts = getAllPosts();
    console.log('BlogPostsOnly: Posts loaded successfully:', posts.length);
  } catch (err) {
    console.error('BlogPostsOnly: Error loading posts:', err);
    error = err.message;
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Posts Loading Error</h1>
        <p>Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Blog Posts Test (No SEO Hook)</h1>
      <p>Successfully loaded {posts.length} posts</p>
      
      {posts.length > 0 && (
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
          <h3>First Post:</h3>
          <p><strong>Title:</strong> {posts[0].title}</p>
          <p><strong>Slug:</strong> {posts[0].slug}</p>
          <p><strong>Date:</strong> {String(posts[0].date)}</p>
          <p><strong>Tags:</strong> {posts[0].tags ? posts[0].tags.join(', ') : 'None'}</p>
        </div>
      )}
      
      <p>If you see this, the posts data loads fine. The issue is likely with the SEO hook.</p>
    </div>
  );
};

export default BlogPostsOnly;