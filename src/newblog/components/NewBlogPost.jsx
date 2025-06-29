import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2, List, User, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { 
  getPostBySlug, 
  getRelatedPostsMetadata, 
  preloadRelatedPosts,
  getCacheStats 
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';

// Helper function to render content based on format
const renderContent = (post) => {
  // Handle array-based content structure (new posts)
  if (Array.isArray(post.content)) {
    return post.content
      .map(section => {
        // Handle different content types
        switch (section.type) {
          case 'section':
            return `## ${section.heading}\n\n${section.content}`;
          case 'callout':
            return `> **${section.title}**: ${section.content}`;
          case 'highlight':
            if (section.stats) {
              const stats = section.stats.map(stat => `- **${stat.label}**: ${stat.value}`).join('\n');
              return `### Key Statistics\n\n${stats}`;
            }
            return '';
          default:
            // For any other content types, just return the content if it exists
            return section.content || '';
        }
      })
      .filter(content => content.length > 0) // Remove empty content
      .join('\n\n');
  }
  
  // Handle simple string content (legacy posts)
  return post.content || '';
};

const NewBlogPost = () => {
  // State management
  const [tocItems, setTocItems] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const contentRef = useRef(null);

  // Extract slug from URL
  const extractSlug = () => {
    const currentPath = window.location.pathname;
    return currentPath.replace('/never-hungover/', '').replace('/newblog/', '');
  };

  // Load post data dynamically
  useEffect(() => {
    let isMounted = true;
    
    const loadPostData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        
        const slug = extractSlug();
        console.log('🔄 Loading post:', slug);
        
        // Load main post
        const loadedPost = await getPostBySlug(slug);
        
        if (!isMounted) return;
        
        if (!loadedPost) {
          setLoadingError('Post not found');
          setPost(null);
          setRelatedPosts([]);
        } else {
          setPost(loadedPost);
          
          // Load related posts metadata (instant)
          const relatedMeta = getRelatedPostsMetadata(loadedPost, 3);
          setRelatedPosts(relatedMeta);
          
          // Preload related posts in background
          preloadRelatedPosts(loadedPost, 3);
          
          console.log('✅ Post loaded successfully:', slug);
          console.log('📊 Cache stats:', getCacheStats());
        }
      } catch (error) {
        console.error('❌ Error loading post:', error);
        if (isMounted) {
          setLoadingError(error.message);
          setPost(null);
          setRelatedPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsClient(true);
        }
      }
    };

    loadPostData();
    
    return () => {
      isMounted = false;
    };
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

  // Navigation handler
  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Table of Contents
  useEffect(() => {
    if (post && contentRef.current) {
      setTimeout(() => {
        const headings = contentRef.current.querySelectorAll('h2, h3');
        const items = Array.from(headings).map((heading, index) => {
          const text = heading.textContent;
          let id = text
            .toLowerCase()
            .replace(/[^a-z0-9\\s-]/g, '')
            .replace(/\\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          if (!id) {
            id = `heading-${index}`;
          }
          
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
          
          headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 0) {
              current = heading.id;
            }
          });
          
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
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  // Helper functions
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(id);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Never Hungover</h1>
          </div>
          <p className="text-gray-600 mb-2">Loading post dynamically...</p>
          <div className="text-sm text-green-600">
            ⚡ Only loading what you need
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            {loadingError || "The blog post you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => handleNavigation('/never-hungover')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Never Hungover
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Reading Progress Bar */}
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
            <button 
              onClick={() => handleNavigation('/')}
              className="hover:text-green-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => handleNavigation('/never-hungover')}
              className="hover:text-green-600 transition-colors"
            >
              Never Hungover
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 truncate">
              {formatTitle(post.title).mainTitle}
            </span>
          </nav>

          <button 
            onClick={() => handleNavigation('/never-hungover')}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Never Hungover
          </button>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
            {post.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {post.author}</span>
              </div>
            )}
            {isClient && (
              <button
                onClick={sharePost}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>

          <div className="mb-4">
            {(() => {
              const { mainTitle, subtitle } = formatTitle(post.title);
              return (
                <>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    {mainTitle}
                  </h1>
                  {subtitle && (
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-600 mt-3 leading-relaxed">
                      {subtitle}
                    </h2>
                  )}
                </>
              );
            })()}
          </div>

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
          <article className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Hero Image */}
            {post.image && (
              <div className="w-full">
                <img 
                  src={post.image} 
                  alt={`${post.title} - DHM Guide`}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  loading="eager"
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              <div ref={contentRef} className="prose prose-lg prose-green max-w-none enhanced-typography">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">{children}</h2>,
                    h3: ({children}) => (
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 relative">
                        <span className="relative z-10 bg-white pr-4">{children}</span>
                        <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-green-200 to-transparent -translate-y-1/2 -z-0"></div>
                      </h3>
                    ),
                    p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4 text-lg">{children}</p>,
                    ul: ({children}) => (
                      <ul className="space-y-3 mb-6 text-lg">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="space-y-3 mb-6 text-lg counter-reset-list">
                        {children}
                      </ol>
                    ),
                    li: ({children, ...props}) => {
                      const isOrderedList = props.node?.parentNode?.tagName === 'ol';
                      return isOrderedList ? (
                        <li className="flex items-start gap-3 leading-relaxed text-gray-700 counter-increment-item">
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5 counter-content">
                          </span>
                          <span className="flex-1">{children}</span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-3 leading-relaxed text-gray-700">
                          <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full mt-3"></span>
                          <span className="flex-1">{children}</span>
                        </li>
                      );
                    },
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
                    strong: ({children}) => {
                      const text = typeof children === 'string' ? children : '';
                      const isFormula = text.includes(':') && text.endsWith(':');
                      
                      return isFormula ? (
                        <strong className="inline-block font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent border-b-2 border-green-200 pb-1 mr-1">
                          {children}
                        </strong>
                      ) : (
                        <strong className="font-bold text-gray-900 bg-green-50 px-1 py-0.5 rounded">
                          {children}
                        </strong>
                      );
                    },
                    em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                    table: ({children}) => (
                      <div className="overflow-x-auto my-8 rounded-xl shadow-lg border border-gray-200">
                        <table className="w-full border-collapse bg-white">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({children}) => (
                      <thead className="bg-gradient-to-r from-green-600 to-green-700">
                        {children}
                      </thead>
                    ),
                    tbody: ({children}) => (
                      <tbody className="divide-y divide-gray-200">
                        {children}
                      </tbody>
                    ),
                    tr: ({children, ...props}) => {
                      const isHeader = props.node?.tagName === 'tr' && props.node?.parentNode?.tagName === 'thead';
                      return (
                        <tr className={isHeader ? '' : 'hover:bg-gray-50 transition-colors duration-150'}>
                          {children}
                        </tr>
                      );
                    },
                    th: ({children}) => (
                      <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider border-r border-green-500 last:border-r-0">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200 last:border-r-0 leading-relaxed">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {renderContent(post)}
                </ReactMarkdown>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div 
                    key={relatedPost.slug}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleNavigation(`/never-hungover/${relatedPost.slug}`)}
                  >
                    {relatedPost.image && (
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        loading="lazy"
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
                      <span>{relatedPost.readTime} min read</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Info */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <h4 className="font-semibold text-green-800 mb-2">⚡ Dynamically Loaded</h4>
            <div className="text-green-700 space-y-1">
              <div>• Post loaded on-demand: {Math.round(JSON.stringify(post).length / 1024)}KB</div>
              <div>• Related posts preloaded in background</div>
              <div>• Smart caching active: {getCacheStats().size}/{getCacheStats().maxSize} posts cached</div>
              <div>• Reading progress and TOC generated client-side</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBlogPost;