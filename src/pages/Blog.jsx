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
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Main Title with Enhanced Typography */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent">
                DHM Guide
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-green-100">
                Blog
              </span>
            </h1>
          </div>

          {/* Enhanced Subtitle */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-green-50 leading-relaxed font-light">
              Expert insights, research updates, and practical guides for 
              <span className="font-semibold text-white"> hangover prevention</span> and 
              <span className="font-semibold text-white"> DHM supplementation</span>
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                🔬 Science-Backed Research
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                💊 Expert Dosage Guides
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                📊 Clinical Studies
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-green-100 text-sm">Research Studies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-green-100 text-sm">User Experiences</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div className="text-green-100 text-sm">Effectiveness Rate</div>
            </div>
          </div>
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

