import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2, List, User, ExternalLink, ChevronRight } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '../utils/postLoader';

const BlogPost = () => {
  const [tocItems, setTocItems] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const contentRef = useRef(null);
  
  // Extract slug from current path
  const currentPath = window.location.pathname;
  const slug = currentPath.replace('/blog/', '');
  const post = getPostBySlug(slug);
  const relatedPosts = post ? getRelatedPosts(post, 3) : [];

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Table of Contents
  useEffect(() => {
    if (post && contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h2, h3');
      const items = Array.from(headings).map((heading) => {
        // Generate a clean ID from the heading text
        const text = heading.textContent;
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        heading.id = id;
        return {
          id,
          text,
          level: parseInt(heading.tagName.charAt(1))
        };
      });
      setTocItems(items);
    }
  }, [post]);

  // Track reading progress and active section
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      // Calculate reading progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(progress);

      // Find active section
      const headings = contentRef.current.querySelectorAll('h2, h3');
      let current = '';
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add structured data
  useEffect(() => {
    if (post) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image ? [post.image] : [],
        "datePublished": post.date.toISOString(),
        "dateModified": post.date.toISOString(),
        "author": {
          "@type": "Person",
          "name": post.author || "DHM Guide Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "DHM Guide",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.dhmguide.com/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        },
        "articleSection": "Health & Wellness",
        "wordCount": post.content.split(' ').length,
        "timeRequired": `PT${calculateReadTime(post.content)}M`
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={() => handleNavigation('/blog')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

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

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for fixed header and some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => handleNavigation('/')}
              className="hover:text-green-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => handleNavigation('/blog')}
              className="hover:text-green-600 transition-colors"
            >
              Blog
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 truncate">{post.title}</span>
          </nav>

          <button 
            onClick={() => handleNavigation('/blog')}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          
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
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {post.author}</span>
              </div>
            )}
            <button
              onClick={sharePost}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex gap-8">
        {/* Table of Contents - Desktop Sidebar */}
        {tocItems.length > 0 && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <List className="w-4 h-4 text-green-600" />
                  Table of Contents
                </h3>
                <nav className="space-y-1">
                  {tocItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-150 ${
                        activeSection === item.id
                          ? 'bg-green-100 text-green-700 font-medium shadow-sm border-l-2 border-green-500'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:shadow-sm'
                      } ${item.level === 3 ? 'ml-4 text-xs' : ''}`}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile TOC Toggle */}
          {tocItems.length > 0 && (
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowToc(!showToc)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md text-gray-700 hover:text-green-600 transition-all duration-200 hover:shadow-lg"
              >
                <List className="w-4 h-4" />
                <span>Table of Contents</span>
                <div className={`transform transition-transform duration-200 ${showToc ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showToc ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
                  <nav className="space-y-2">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          scrollToSection(item.id);
                          setShowToc(false);
                        }}
                        className={`block w-full text-left text-sm py-2 px-3 rounded transition-all duration-150 ${
                          activeSection === item.id
                            ? 'bg-green-100 text-green-700 font-medium shadow-sm'
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                        } ${item.level === 3 ? 'ml-4' : ''}`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div ref={contentRef} className="prose prose-lg prose-green max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4 text-lg">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 text-lg">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2 text-lg">{children}</ol>,
                  li: ({children}) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-green-500 pl-6 py-4 my-6 bg-green-50 italic text-gray-700 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({inline, children}) => 
                    inline ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>
                    ) : (
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                        <code className="text-sm font-mono text-gray-800">{children}</code>
                      </pre>
                    ),
                  a: ({href, children}) => (
                    <a 
                      href={href} 
                      className="text-green-600 hover:text-green-700 underline transition-colors inline-flex items-center gap-1"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                      {href?.startsWith('http') && <ExternalLink className="w-3 h-3" />}
                    </a>
                  ),
                  strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Author Bio */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {(post.author || 'DHM Guide Team').charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">{post.author || 'DHM Guide Team'}</h3>
                <p className="text-gray-600 mb-3">
                  Expert in hangover prevention and DHM research. Dedicated to providing science-backed information 
                  about dihydromyricetin and alcohol health optimization.
                </p>
                <div className="flex gap-4 text-sm">
                  <button 
                    onClick={() => handleNavigation('/blog')}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    More Articles
                  </button>
                  <button 
                    onClick={() => handleNavigation('/about')}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    About DHM Guide
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div 
                    key={relatedPost.slug}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleNavigation(`/blog/${relatedPost.slug}`)}
                  >
                    {relatedPost.image && (
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadTime(relatedPost.content)} min read</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Try DHM?</h3>
            <p className="text-green-100 mb-6">
              Explore our comprehensive reviews and find the best DHM supplement for your needs.
            </p>
            <button 
              onClick={() => handleNavigation('/reviews')}
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              View Product Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

