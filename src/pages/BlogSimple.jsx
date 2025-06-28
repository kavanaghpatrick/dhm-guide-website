import React, { useState } from 'react';
import { useSEO, generatePageSEO } from '../hooks/useSEO.js';

const BlogSimple = () => {
  useSEO(generatePageSEO('blog'));
  
  // Test with hardcoded data to isolate the issue
  const mockPosts = [
    {
      id: 'test-1',
      title: 'Test Post 1',
      slug: 'test-post-1',
      excerpt: 'This is a test post excerpt',
      date: '2025-06-28',
      author: 'Test Author',
      tags: ['test', 'example']
    },
    {
      id: 'test-2', 
      title: 'Test Post 2',
      slug: 'test-post-2',
      excerpt: 'This is another test post excerpt',
      date: '2025-06-27',
      author: 'Test Author',
      tags: ['test', 'sample']
    }
  ];

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Simple Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            DHM Guide Blog
          </h1>
          <p className="text-xl md:text-2xl text-green-50 leading-relaxed">
            Expert insights, research updates, and practical guides for hangover prevention
          </p>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="mb-8 text-gray-600">Showing {mockPosts.length} test articles</p>
        
        <div className="grid gap-8">
          {mockPosts.map((post) => (
            <article 
              key={post.slug}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-8">
                {/* Post Header */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📅 {post.date}</span>
                  <span>⏱️ 5 min read</span>
                  <span>By {post.author}</span>
                </div>

                {/* Post Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-green-600 transition-colors">
                  <button 
                    onClick={() => handleNavigation(`/blog/${post.slug}`)}
                    className="text-left w-full"
                  >
                    {post.title}
                  </button>
                </h2>

                {/* Post Excerpt */}
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read More Link */}
                <button 
                  onClick={() => handleNavigation(`/blog/${post.slug}`)}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Read Full Article →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSimple;