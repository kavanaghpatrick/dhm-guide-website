import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2, List, User, ExternalLink, ChevronRight } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';

const BlogPost = () => {
  const [tocItems, setTocItems] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  
  // Fix hydration issues by ensuring client-side only rendering for interactive elements
  useEffect(() => {
    setIsClient(true);
    
    // Extract slug from current path safely on client side
    try {
      const currentPath = window.location.pathname;
      const slug = currentPath.replace('/blog/', '');
      
      const foundPost = getPostBySlug(slug);
      const foundRelatedPosts = foundPost ? getRelatedPosts(foundPost, 3) : [];
      
      setPost(foundPost);
      setRelatedPosts(foundRelatedPosts);
    } catch (error) {
      console.error('BlogPost: Error loading post data:', error);
      setPost(null);
      setRelatedPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // SEO optimization for individual blog posts
  useSEO(post ? generatePageSEO('blog-post', {
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    author: post.author,
    date: post.date,
    image: post.image,
    tags: post.tags,
    content: post.content
  }) : null);

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Table of Contents
  useEffect(() => {
    if (post && contentRef.current) {
      // Wait for content to be fully rendered
      setTimeout(() => {
        const headings = contentRef.current.querySelectorAll('h2, h3');
        const items = Array.from(headings).map((heading, index) => {
          // Generate a clean ID from the heading text
          const text = heading.textContent;
          let id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
          
          // Ensure ID is not empty and unique
          if (!id) {
            id = `heading-${index}`;
          }
          
          // Check if ID already exists and make it unique
          let finalId = id;
          let counter = 1;
          while (document.getElementById(finalId)) {
            finalId = `${id}-${counter}`;
            counter++;
          }
          
          heading.id = finalId;
          return {
            id: finalId,
            text,
            level: parseInt(heading.tagName.charAt(1))
          };
        });
        setTocItems(items);
      }, 100);
    }
  }, [post]);

  // Track reading progress and active section
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!contentRef.current) return;

          // Calculate reading progress
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = Math.min((scrollTop / docHeight) * 100, 100);
          setReadingProgress(progress);

          // Find active section
          const headings = contentRef.current.querySelectorAll('h2, h3');
          let current = '';
          
          // Find the heading that's currently in view
          headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            // Use a more generous threshold for active section detection
            if (rect.top <= 150 && rect.bottom >= 0) {
              current = heading.id;
            }
          });
          
          // If no heading is in the threshold, find the closest one above
          if (!current && headings.length > 0) {
            let closest = headings[0];
            let closestDistance = Math.abs(headings[0].getBoundingClientRect().top);
            
            headings.forEach((heading) => {
              const distance = Math.abs(heading.getBoundingClientRect().top);
              if (distance < closestDistance && heading.getBoundingClientRect().top <= 150) {
                closest = heading;
                closestDistance = distance;
              }
            });
            current = closest.id;
          }
          
          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set active section
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

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

  // Show loading state while content is being loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">DHM Guide</h1>
          <p className="text-gray-600 mb-6">Loading blog post...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

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
      const headerOffset = 120; // Increased offset for better positioning
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Also update the active section immediately
      setActiveSection(id);
    } else {
      // Fallback: try to find the element by text content
      const headings = contentRef.current?.querySelectorAll('h2, h3');
      if (headings) {
        const matchingHeading = Array.from(headings).find(heading => 
          heading.id === id || heading.textContent.toLowerCase().includes(id.replace(/-/g, ' '))
        );
        if (matchingHeading) {
          matchingHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(matchingHeading.id || id);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Reading Progress Bar - Client-side only */}
      {isClient && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            {isClient ? (
              <button 
                onClick={() => handleNavigation('/')}
                className="hover:text-green-600 transition-colors fast-click blog-link"
              >
                Home
              </button>
            ) : (
              <span className="hover:text-green-600 transition-colors">Home</span>
            )}
            <ChevronRight className="w-4 h-4" />
            {isClient ? (
              <button 
                onClick={() => handleNavigation('/blog')}
                className="hover:text-green-600 transition-colors fast-click blog-link"
              >
                Blog
              </button>
            ) : (
              <span className="hover:text-green-600 transition-colors">Blog</span>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 truncate">{post ? post.title : 'Loading...'}</span>
          </nav>

          {isClient ? (
            <button 
              onClick={() => handleNavigation('/blog')}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6 fast-click blog-link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{post ? formatDate(post.date) : 'Loading...'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post ? calculateReadTime(post.content) : '0'} min read</span>
            </div>
            {post && post.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {post.author}</span>
              </div>
            )}
            {isClient && post && (
              <button
                onClick={sharePost}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors fast-click blog-link"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {post ? post.title : 'Loading...'}
          </h1>

          {post && post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          {post && post.tags && post.tags.length > 0 && (
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
        {isClient && tocItems.length > 0 && (
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
          {isClient && tocItems.length > 0 && (
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
            <div ref={contentRef} className="prose prose-lg prose-green max-w-none enhanced-typography">
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
                  a: ({href, children}) => {
                    // Handle internal vs external links
                    const isExternal = href?.startsWith('http');
                    const isInternal = href && !isExternal && href !== '#';
                    
                    if (isInternal && isClient) {
                      return (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(href);
                          }}
                          className="text-green-600 hover:text-green-700 underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNavigation(href);
                            }
                          }}
                        >
                          {children}
                        </span>
                      );
                    }
                    
                    return (
                      <a 
                        href={href} 
                        className="text-green-600 hover:text-green-700 underline transition-colors inline-flex items-center gap-1"
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                        {isExternal && <ExternalLink className="w-3 h-3" />}
                      </a>
                    );
                  },
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

