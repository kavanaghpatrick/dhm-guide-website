import React, { useState } from 'react';
import { Calendar, Clock, Tag, ArrowRight, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllPosts } from '../blog/utils/postLoader';
import { useSEO, generatePageSEO } from '../hooks/useSEO.js';

// Helper function to format titles with colons
const formatTitle = (title) => {
  if (!title || !title.includes(':')) {
    return { mainTitle: title, subtitle: null };
  }
  
  const [mainTitle, ...subtitleParts] = title.split(':');
  const subtitle = subtitleParts.join(':').trim();
  
  return {
    mainTitle: mainTitle.trim(),
    subtitle: subtitle || null
  };
};

const Blog = () => {
  useSEO(generatePageSEO('blog'));
  
  const posts = getAllPosts();
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Get all unique tags from all posts
  const getAllTags = () => {
    const allTags = posts.flatMap(post => post.tags);
    return [...new Set(allTags)].sort();
  };

  // Get popular/featured tags to show by default
  const getDefaultTags = () => {
    const allTags = getAllTags();
    // Show first 8 tags by default (most common ones appear first due to sorting)
    return allTags.slice(0, 8);
  };

  // Filter posts based on selected tags
  const filteredPosts = selectedTags.length === 0 
    ? posts 
    : posts.filter(post => 
        selectedTags.some(selectedTag => post.tags.includes(selectedTag))
      );

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTags([]);
  };

  // Toggle filter section visibility
  const toggleFilterVisibility = () => {
    setShowAllFilters(!showAllFilters);
  };

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

  const allTags = getAllTags();
  const defaultTags = getDefaultTags();
  const tagsToShow = showAllFilters ? allTags : defaultTags;
  const hasMoreTags = allTags.length > defaultTags.length;

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
        </div>
      </div>

      {/* Collapsible Tag Filter Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filter Header */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filter by Topic</h3>
              {selectedTags.length > 0 && (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {selectedTags.length} active
                </span>
              )}
            </div>

            {/* Clear Filters Button */}
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Tag Filter Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {tagsToShow.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-green-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              </button>
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasMoreTags && (
            <div className="mt-4 text-center">
              <button
                onClick={toggleFilterVisibility}
                className="inline-flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
              >
                {showAllFilters ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less Filters
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All Filters ({allTags.length - defaultTags.length} more)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Counter */}
          <div className="mt-4 text-sm text-gray-600">
            {selectedTags.length > 0 ? (
              <span>
                Showing {filteredPosts.length} of {posts.length} articles
                {selectedTags.length > 0 && (
                  <span className="ml-2">
                    for: {selectedTags.map(tag => `"${tag}"`).join(', ')}
                  </span>
                )}
              </span>
            ) : (
              <span>Showing all {posts.length} articles</span>
            )}
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
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                No articles found
              </h2>
              <p className="text-gray-500 mb-6">
                No articles match the selected tags. Try different tags or clear your filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPosts.map((post) => (
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
                  <div className="mb-4 text-left">
                    <button 
                      onClick={() => handleNavigation(`/blog/${post.slug}`)}
                      className="w-full transition-colors group block text-left"
                      style={{ textAlign: 'left' }}
                    >
                      {(() => {
                        const { mainTitle, subtitle } = formatTitle(post.title);
                        return (
                          <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-green-600 mb-1" style={{ textAlign: 'left' }}>
                              {mainTitle}
                            </h2>
                            {subtitle && (
                              <h3 className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed" style={{ textAlign: 'left' }}>
                                {subtitle}
                              </h3>
                            )}
                          </>
                        );
                      })()}
                    </button>
                  </div>

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

