import React from 'react';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { getAllPosts } from '../blog/utils/postLoader';

const Blog = () => {
  const posts = getAllPosts();

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            DHM Guide Blog
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Expert insights, research updates, and practical guides for hangover prevention and DHM supplementation
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-500">
              We're working on creating valuable content for you. Check back soon for expert insights on DHM and hangover prevention.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-8">
                  {/* Post Header */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                    {post.author && (
                      <span>By {post.author}</span>
                    )}
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
                      {post.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  <button 
                    onClick={() => handleNavigation(`/blog/${post.slug}`)}
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors group"
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

