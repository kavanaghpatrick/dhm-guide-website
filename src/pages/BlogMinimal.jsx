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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Simple Hero */}
      <div className="bg-green-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">DHM Guide Blog</h1>
          <p className="text-xl">Expert insights on hangover prevention</p>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="mb-8 text-gray-600">Showing {posts.length} articles</p>
        <div className="space-y-6">
          {posts.slice(0, 10).map((post, index) => (
            <article key={post.slug || index} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="text-sm text-gray-500">
                Published: {post.date} • By {post.author || 'DHM Guide Team'}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogMinimal;