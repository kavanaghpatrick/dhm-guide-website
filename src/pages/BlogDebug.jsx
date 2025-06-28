import React, { useState, useEffect } from 'react';

const BlogDebug = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log('BlogDebug component mounting...');
    
    const loadPosts = async () => {
      try {
        console.log('Step 1: Attempting static import...');
        const { posts: staticPosts } = await import('../blog/data/posts.js');
        console.log('Static import successful:', staticPosts?.length);
        setPosts(staticPosts || []);
      } catch (staticError) {
        console.error('Static import failed:', staticError);
        
        try {
          console.log('Step 2: Attempting dynamic import...');
          const module = await import('../blog/data/posts.js');
          const dynamicPosts = module.posts || module.default || [];
          console.log('Dynamic import successful:', dynamicPosts?.length);
          setPosts(dynamicPosts);
        } catch (dynamicError) {
          console.error('Dynamic import failed:', dynamicError);
          
          try {
            console.log('Step 3: Attempting getAllPosts import...');
            const { getAllPosts } = await import('../blog/utils/postLoader.js');
            const loaderPosts = getAllPosts();
            console.log('PostLoader successful:', loaderPosts?.length);
            setPosts(loaderPosts);
          } catch (loaderError) {
            console.error('PostLoader failed:', loaderError);
            setError(loaderError);
          }
        }
      }
      setLoading(false);
    };
    
    loadPosts();
  }, []);
  
  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Blog Debug - Loading...</h1>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red' }}>
        <h1>Blog Debug Error</h1>
        <p>Error: {error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Blog Debug Success!</h1>
      <p>Posts loaded: {posts.length}</p>
      <p>First post: {posts[0]?.title}</p>
      <h3>First 5 posts:</h3>
      <ul>
        {posts.slice(0, 5).map((post, i) => (
          <li key={i}>{post.title} - {post.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default BlogDebug;