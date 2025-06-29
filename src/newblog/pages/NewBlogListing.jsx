import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Tag, Search, Filter, Loader2 } from 'lucide-react';
import { 
  getAllPostsMetadata, 
  getAllTags, 
  searchPostsMetadata, 
  getPostsByTag,
  preloadPost 
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';

const NewBlogListing = () => {
  // SEO optimization
  useSEO(generatePageSEO('never-hungover'));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Load metadata instantly (no dynamic imports needed)
  const allPosts = useMemo(() => getAllPostsMetadata(), []);
  const allTags = useMemo(() => getAllTags(), []);

  // Filter posts based on search and tags
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    // Apply search filter
    if (searchQuery.trim()) {
      posts = searchPostsMetadata(searchQuery.trim());
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      posts = posts.filter(post => 
        selectedTags.some(tag => post.tags?.includes(tag))
      );
    }

    return posts;
  }, [allPosts, searchQuery, selectedTags]);

  // Navigation handler
  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preload post on hover
  const handlePostHover = (slug) => {
    preloadPost(slug);
  };

  // Tag management
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2">
                <span className="bg-gradient-to-r from-green-600 via-green-700 to-green-600 bg-clip-text text-transparent inline-block transform hover:scale-105 transition-transform duration-300">
                  Never
                </span>
                <span className="text-gray-900 ml-3 inline-block">
                  Hungover
                </span>
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"></div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Master the science of hangover prevention. Expert guides, proven strategies, 
              and cutting-edge research to help you <span className="font-medium text-green-700">never wake up hungover again</span>.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {allPosts.length} Expert Articles
              </span>
              <span className="text-gray-300">•</span>
              <span>Average read: 12 minutes</span>
              <span className="text-gray-300">•</span>
              <span>Science-backed content</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Tag Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Topic
                </h3>
                {(selectedTags.length > 0 || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, showAllFilters ? allTags.length : 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                
                {allTags.length > 12 && (
                  <button
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    {showAllFilters ? 'Show Less' : `+${allTags.length - 12} More`}
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {(searchQuery || selectedTags.length > 0) && (
              <div className="mb-6 text-sm text-gray-600">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
                {selectedTags.length > 0 && (
                  <span> in: {selectedTags.join(', ')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => handleNavigation(`/never-hungover/${post.slug}`)}
                onMouseEnter={() => handlePostHover(post.slug)}
              >
                {/* Post Image */}
                {post.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Post Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-green-600 transition-colors">
                    {post.title}
                  </h2>

                  {/* Post Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author */}
                  <div className="text-sm text-gray-500">
                    By {post.author}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NewBlogListing;