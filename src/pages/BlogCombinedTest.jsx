import React from 'react';
import { getAllPosts } from '../blog/utils/postLoader';
import { useSEO, generatePageSEO } from '../hooks/useSEO.js';

const BlogCombinedTest = () => {
  console.log('BlogCombinedTest: Starting...');
  
  try {
    console.log('BlogCombinedTest: Step 1 - Testing SEO hook...');
    useSEO(generatePageSEO('blog'));
    console.log('BlogCombinedTest: Step 1 ✅ - SEO hook successful');
    
    console.log('BlogCombinedTest: Step 2 - Loading posts...');
    const posts = getAllPosts();
    console.log('BlogCombinedTest: Step 2 ✅ - Posts loaded:', posts.length);
    
    console.log('BlogCombinedTest: Step 3 - Testing post data access...');
    const firstPost = posts[0];
    console.log('BlogCombinedTest: Step 3 ✅ - First post:', firstPost.title);
    
    console.log('BlogCombinedTest: Step 4 - Testing tag operations...');
    const allTags = posts.flatMap(post => post.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    console.log('BlogCombinedTest: Step 4 ✅ - Tags processed:', uniqueTags.length);
    
    console.log('BlogCombinedTest: Step 5 - About to render...');
    
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Blog Combined Test</h1>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', margin: '10px 0', border: '1px solid #c3e6cb' }}>
          ✅ SEO hook + Posts loading working together
        </div>
        <p>Posts loaded: {posts.length}</p>
        <p>Unique tags: {uniqueTags.length}</p>
        <p>First post: {firstPost.title}</p>
        
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
          <strong>All systems working!</strong> The issue might be in complex rendering logic.
        </div>
      </div>
    );
  } catch (error) {
    console.error('BlogCombinedTest error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Combined Test Error</h1>
        <p>Error: {error.message}</p>
        <p>Stack: {error.stack}</p>
      </div>
    );
  }
};

export default BlogCombinedTest;