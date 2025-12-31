import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2, List, User, ExternalLink, ChevronRight, Loader2, Info, AlertCircle, CheckCircle, Lightbulb, Leaf } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import {
  getPostBySlug,
  getRelatedPostsMetadata,
  preloadRelatedPosts,
  getCacheStats
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';
import { applyRedirect } from '../../utils/redirects.js';
import KeyTakeaways from './KeyTakeaways';
import ImageLightbox from './ImageLightbox';
import { Link as CustomLink } from '../../components/CustomLink';
import { motion } from 'framer-motion';

// Helper function to create enhanced components for special content patterns
const createEnhancedComponents = () => {
  // Function to detect and render info boxes
  const renderInfoBox = (text) => {
    // Pattern: **Info Box:** content
    if (text.startsWith('**Info Box:**')) {
      const content = text.replace('**Info Box:**', '').trim();
      return (
        <Alert className="border-blue-200 bg-blue-50 my-4">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Did You Know?</AlertTitle>
          <AlertDescription>{content}</AlertDescription>
        </Alert>
      );
    }
    
    // Pattern: **Warning:** content
    if (text.startsWith('**Warning:**')) {
      const content = text.replace('**Warning:**', '').trim();
      return (
        <Alert className="border-amber-200 bg-amber-50 my-4">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>{content}</AlertDescription>
        </Alert>
      );
    }
    
    // Pattern: **Pro Tip:** content
    if (text.startsWith('**Pro Tip:**')) {
      const content = text.replace('**Pro Tip:**', '').trim();
      return (
        <Alert className="border-green-200 bg-green-50 my-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Pro Tip</AlertTitle>
          <AlertDescription>{content}</AlertDescription>
        </Alert>
      );
    }
    
    // Pattern: **Key Insight:** content
    if (text.startsWith('**Key Insight:**')) {
      const content = text.replace('**Key Insight:**', '').trim();
      return (
        <Alert className="border-purple-200 bg-purple-50 my-4">
          <Lightbulb className="h-4 w-4 text-purple-600" />
          <AlertTitle>Key Insight</AlertTitle>
          <AlertDescription>{content}</AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  // Function to create enhanced product cards
  const renderProductCard = (text) => {
    // Pattern: **Product Spotlight: [Product Name]** - details
    const productMatch = text.match(/\*\*Product Spotlight: (.+?)\*\* - (.+)/);
    if (productMatch) {
      const [_, productName, details] = productMatch;
      return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 my-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-green-800">{productName}</CardTitle>
              <Badge className="bg-green-100 text-green-800">Featured</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{details}</p>
            <Button variant="outline" size="sm" className="mt-4">
              Learn More →
            </Button>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // Function to render visual separators
  const renderVisualSeparator = () => (
    <div className="relative my-12">
      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
        <Leaf className="w-6 h-6 text-green-600" />
      </div>
    </div>
  );

  return { renderInfoBox, renderProductCard, renderVisualSeparator };
};

// Helper function to extract key takeaways from content
const extractKeyTakeaways = (content) => {
  if (!content) return [];
  
  const contentStr = typeof content === 'string' ? content : 
    Array.isArray(content) ? content.map(section => section.content || '').join(' ') : '';
  
  // Look for "Key Takeaways" pattern in the content (with or without heading markers and emojis)
  const takeawaysMatch = contentStr.match(/(?:##\s*)?(?:[🎯🔥💡⚡🌟]?\s*)?Key Takeaways?(?:\s*[🎯🔥💡⚡🌟])?:?\s*(.*?)(?=\n\n|\n##|$)/si);
  if (takeawaysMatch) {
    const takeawaysText = takeawaysMatch[1].trim();
    // Extract bullet points - filter out complex formatting and nested content
    const lines = takeawaysText.split('\n').filter(line => line.trim());
    
    const takeaways = lines
      .filter(line => {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) return false;
        
        // Skip markdown formatting lines (**, *, etc. that are just formatting)
        if (/^\*+$/.test(trimmed)) return false;
        
        // Skip blockquotes and special formatting
        if (trimmed.startsWith('>')) return false;
        
        // Skip any line with special markdown formatting
        if (trimmed.includes('**') || trimmed.includes('##') || trimmed.includes('---')) return false;
        
        // Skip lines with special formatting patterns or emoji indicators
        if (/[🚨🔴🟡🟢⚡💡📊👨‍⚕️🛡️⚖️📋📱🩸💓🧠🔄🚫⏰👥📚🎯🏥💫🌙🌱🌞🍂🔬📅📱💊⚠️]/.test(trimmed)) return false;
        
        // Only accept simple bullet points that are plain text
        if (!/^[-•*]\s+[A-Za-z]/.test(trimmed)) return false;
        
        // Ensure it's not a complex formatted line
        if (trimmed.length < 20 || trimmed.length > 200) return false;
        
        return true;
      })
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .filter(text => text.length > 15); // Ensure substantial content
    
    return takeaways;
  }
  
  return [];
};

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
            return `**${section.title}**: ${section.content}`;
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
  // Replace escaped newlines with actual newlines for proper markdown rendering
  const content = post.content || '';
  return content.replace(/\\n/g, '\n');
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
  const [currentSlug, setCurrentSlug] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState([]);
  const contentRef = useRef(null);

  // Extract slug from URL
  const extractSlug = () => {
    const currentPath = window.location.pathname;
    return currentPath.replace('/never-hungover/', '').replace('/newblog/', '');
  };

  // Listen for URL changes
  useEffect(() => {
    // Check for redirects first
    const currentPath = window.location.pathname;
    if (applyRedirect(currentPath)) {
      return; // Redirect applied, no need to load
    }
    const handlePopState = () => {
      const newSlug = extractSlug();
      setCurrentSlug(newSlug);
    };

    // Set initial slug
    setCurrentSlug(extractSlug());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load post data dynamically
  useEffect(() => {
    if (!currentSlug) return;
    let isMounted = true;
    
    const loadPostData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        
        const slug = currentSlug;
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
          
          // Extract key takeaways from content
          const extractedTakeaways = extractKeyTakeaways(loadedPost.content);
          setKeyTakeaways(extractedTakeaways);
          
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
  }, [currentSlug]);

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
    // For internal links, ensure they work with the app's routing
    if (href && !href.startsWith('http')) {
      // Normalize the path
      const normalizedPath = href.startsWith('/') ? href : `/${href}`;
      window.history.pushState({}, '', normalizedPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href && href.startsWith('http')) {
      // External links open in new tab
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate Table of Contents with MutationObserver
  useEffect(() => {
    if (!post || !contentRef.current) return;

    let observer;
    let timeoutId;
    const maxWaitTime = 2000; // 2 second maximum wait
    let isGenerating = true;

    const generateTOC = () => {
      const headings = contentRef.current.querySelectorAll('h2, h3');
      
      if (headings.length > 0) {
        // Import the utility function inline to avoid module issues
        const items = Array.from(headings).map((heading, index) => {
          const text = heading.textContent;
          
          // Check if heading already has an ID (from embedded TOC links)
          if (heading.id) {
            return {
              id: heading.id,
              text,
              level: parseInt(heading.tagName.charAt(1))
            };
          }
          
          // Generate ID that matches the pattern used in content
          let id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          if (!id) {
            id = `heading-${index}`;
          }
          
          // Check if this ID already exists (from embedded links)
          let finalId = id;
          let counter = 1;
          while (document.getElementById(finalId) && document.getElementById(finalId) !== heading) {
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
        isGenerating = false;
        
        // Clean up observer
        if (observer) {
          observer.disconnect();
        }
        clearTimeout(timeoutId);
      }
    };

    // Set up MutationObserver
    observer = new MutationObserver((mutations) => {
      // Check if any mutations added heading elements
      const hasNewHeadings = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeName && /^H[23]$/.test(node.nodeName)
        )
      );

      if (hasNewHeadings) {
        // Debounce to avoid multiple rapid calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(generateTOC, 50);
      }
    });

    // Start observing
    observer.observe(contentRef.current, {
      childList: true,
      subtree: true
    });

    // Initial check (in case content is already rendered)
    generateTOC();

    // Timeout fallback
    timeoutId = setTimeout(() => {
      if (isGenerating) {
        console.warn('TOC generation timed out');
        generateTOC(); // Try one more time
        if (observer) {
          observer.disconnect();
        }
      }
    }, maxWaitTime);

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(timeoutId);
    };
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
    // Defensive check for invalid dates
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date provided to formatDate:', date);
      return 'Date unavailable';
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
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
    // First try to find the element directly
    let element = document.getElementById(id);
    
    // If not found, wait a bit for dynamic ID generation to complete
    if (!element) {
      setTimeout(() => {
        element = document.getElementById(id);
        if (element) {
          performScroll(element, id);
        } else {
          // If still not found, try to find a heading with matching text
          const headings = contentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings) {
            for (const heading of headings) {
              const headingId = heading.textContent
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              if (headingId === id || heading.id === id) {
                performScroll(heading, heading.id || id);
                break;
              }
            }
          }
        }
      }, 100);
    } else {
      performScroll(element, id);
    }
  };
  
  const performScroll = (element, id) => {
    const headerOffset = 120;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    // Temporarily disable smooth scrolling on mobile for better performance
    const scrollBehavior = window.innerWidth < 768 ? 'auto' : 'smooth';
    
    window.scrollTo({
      top: offsetPosition,
      behavior: scrollBehavior
    });
    
    setActiveSection(id);
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
      {/* Reading Progress Bar - positioned below header using CSS variable */}
      {isClient && (
        <div
          className="fixed left-0 w-full h-1 bg-gray-200 z-sticky"
          style={{ top: 'var(--header-height, 80px)' }}
        >
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
            <div className="sticky" style={{ top: 'calc(var(--header-height, 80px) + 16px)' }}>
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
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setShowToc(!showToc)}
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-md text-gray-700 hover:text-green-600 transition-all duration-200 hover:shadow-lg touch-manipulation min-h-[44px]"
              >
                <List className="w-4 h-4" />
                <span>Table of Contents</span>
                <div className={`transform transition-transform duration-200 ${showToc ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.button>
              
              {/* TOC animation uses grid for GPU-accelerated smooth animation (fixes #97) */}
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: showToc ? '1fr' : '0fr' }}
              >
                <div
                  className={`overflow-hidden transition-opacity duration-300 ${showToc ? 'opacity-100' : 'opacity-0'}`}
                  style={{ visibility: showToc ? 'visible' : 'hidden' }}
                >
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
            </div>
          )}

          {/* Article Content */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Hero Image - uses aspect-video for consistent ratio and no CLS */}
            {post.image && (
              <div className="w-full">
                <img
                  src={post.image}
                  alt={`${post.title} - DHM Guide`}
                  className="w-full aspect-video object-cover"
                  loading="eager"
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              {/* Key Takeaways Component */}
              {keyTakeaways.length > 0 && (
                <KeyTakeaways takeaways={keyTakeaways} />
              )}
              
              {/* Main Content - Constrained Width */}
              <div className="max-w-3xl mx-auto">
                <div ref={contentRef} className="prose prose-lg prose-green max-w-none enhanced-typography">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => {
                      const extractText = (node) => {
                        if (typeof node === 'string') return node;
                        if (Array.isArray(node)) return node.map(extractText).join('');
                        if (node?.props?.children) return extractText(node.props.children);
                        return '';
                      };
                      const text = extractText(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      return <h1 id={id} className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>;
                    },
                    h2: ({children}) => {
                      const extractText = (node) => {
                        if (typeof node === 'string') return node;
                        if (Array.isArray(node)) return node.map(extractText).join('');
                        if (node?.props?.children) return extractText(node.props.children);
                        return '';
                      };
                      const text = extractText(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      return <h2 id={id} className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">{children}</h2>;
                    },
                    h3: ({children}) => {
                      const extractText = (node) => {
                        if (typeof node === 'string') return node;
                        if (Array.isArray(node)) return node.map(extractText).join('');
                        if (node?.props?.children) return extractText(node.props.children);
                        return '';
                      };
                      const text = extractText(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      return (
                        <h3 id={id} className="text-xl font-bold text-gray-900 mt-8 mb-4 relative">
                          <span className="relative z-10 bg-white pr-4">{children}</span>
                          <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-green-200 to-transparent -translate-y-1/2 -z-0"></div>
                        </h3>
                      );
                    },
                    p: ({children}) => {
                      // Extract text content from children (which might be an array with React elements)
                      const extractText = (node) => {
                        if (typeof node === 'string') return node;
                        if (Array.isArray(node)) return node.map(extractText).join('');
                        if (node?.props?.children) return extractText(node.props.children);
                        return '';
                      };
                      
                      const fullText = extractText(children);
                      const { renderInfoBox, renderProductCard, renderVisualSeparator } = createEnhancedComponents();
                      
                      // Check for special patterns only at the start of the paragraph
                      const trimmedText = fullText.trim();
                      
                      // Check for info box patterns
                      if (trimmedText.startsWith('Info Box:')) {
                        const content = trimmedText.replace(/^Info Box:\s*/, '');
                        return (
                          <Alert className="border-blue-200 bg-blue-50 my-4">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Did You Know?</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Check for warning patterns
                      if (trimmedText.startsWith('Warning:')) {
                        const content = trimmedText.replace(/^Warning:\s*/, '');
                        return (
                          <Alert className="border-amber-200 bg-amber-50 my-4">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Check for pro tip patterns
                      if (trimmedText.startsWith('Pro Tip:')) {
                        const content = trimmedText.replace(/^Pro Tip:\s*/, '');
                        return (
                          <Alert className="border-green-200 bg-green-50 my-4">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Pro Tip</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Check for key insight patterns
                      if (trimmedText.startsWith('Key Insight:')) {
                        const content = trimmedText.replace(/^Key Insight:\s*/, '');
                        return (
                          <Alert className="border-purple-200 bg-purple-50 my-4">
                            <Lightbulb className="h-4 w-4 text-purple-600" />
                            <AlertTitle>Key Insight</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Check for important patterns
                      if (trimmedText.startsWith('Important:')) {
                        const content = trimmedText.replace(/^Important:\s*/, '');
                        return (
                          <Alert className="border-red-200 bg-red-50 my-4">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Check for patterns with asterisks (from blockquotes)
                      if (trimmedText.startsWith('**Warning:**')) {
                        const content = trimmedText.replace(/^\*\*Warning:\*\*\s*/, '');
                        return (
                          <Alert className="border-amber-200 bg-amber-50 my-4">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      if (trimmedText.startsWith('**Key Insight:**')) {
                        const content = trimmedText.replace(/^\*\*Key Insight:\*\*\s*/, '');
                        return (
                          <Alert className="border-purple-200 bg-purple-50 my-4">
                            <Lightbulb className="h-4 w-4 text-purple-600" />
                            <AlertTitle>Key Insight</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      if (trimmedText.startsWith('**Pro Tip:**')) {
                        const content = trimmedText.replace(/^\*\*Pro Tip:\*\*\s*/, '');
                        return (
                          <Alert className="border-green-200 bg-green-50 my-4">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Pro Tip</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      if (trimmedText.startsWith('**Emergency Protocol:**')) {
                        const content = trimmedText.replace(/^\*\*Emergency Protocol:\*\*\s*/, '');
                        return (
                          <Alert className="border-red-200 bg-red-50 my-4">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle>Emergency Protocol</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      if (trimmedText.startsWith('**Important Medical Information:**')) {
                        const content = trimmedText.replace(/^\*\*Important Medical Information:\*\*\s*/, '');
                        return (
                          <Alert className="border-blue-200 bg-blue-50 my-4">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Important Medical Information</AlertTitle>
                            <AlertDescription>{content}</AlertDescription>
                          </Alert>
                        );
                      }
                      
                      // Skip rendering key takeaways in the main content since we show them at the top
                      if (trimmedText.match(/^(?:##\s*)?(?:[🎯🔥💡⚡🌟]?\s*)?Key Takeaways?/i)) {
                        return null;
                      }
                      
                      // Check for product card patterns
                      if (trimmedText.startsWith('Product Spotlight:')) {
                        const productMatch = trimmedText.match(/^Product Spotlight:\s*([^-]+?)\s*-\s*(.+)/);
                        if (productMatch) {
                          const [_, productName, details] = productMatch;
                          return (
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 my-6">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-green-800">{productName.trim()}</CardTitle>
                                  <Badge className="bg-green-100 text-green-800">Featured</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-700">{details.trim()}</p>
                                <Button variant="outline" size="sm" className="mt-4">
                                  Learn More →
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        }
                      }
                      
                      // Check for separator pattern
                      if (fullText.trim() === '---') {
                        return renderVisualSeparator();
                      }
                      
                      // Default paragraph rendering
                      return <p className="text-gray-700 leading-relaxed mb-4 text-lg">{children}</p>;
                    },
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
                      const text = typeof children === 'string' ? children : '';
                      
                      // Check for special list item patterns
                      let icon = null;
                      let specialClass = '';
                      
                      if (text.includes('✅') || text.toLowerCase().includes('benefit')) {
                        icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                        specialClass = 'bg-green-50 border-l-2 border-green-500 pl-4 -ml-4';
                      } else if (text.includes('⚠️') || text.toLowerCase().includes('warning')) {
                        icon = <AlertCircle className="w-5 h-5 text-amber-600" />;
                        specialClass = 'bg-amber-50 border-l-2 border-amber-500 pl-4 -ml-4';
                      } else if (text.includes('💡') || text.toLowerCase().includes('tip')) {
                        icon = <Lightbulb className="w-5 h-5 text-purple-600" />;
                        specialClass = 'bg-purple-50 border-l-2 border-purple-500 pl-4 -ml-4';
                      }
                      
                      return isOrderedList ? (
                        <li className={`flex items-start gap-3 leading-relaxed text-gray-700 counter-increment-item ${specialClass}`}>
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5 counter-content">
                          </span>
                          <span className="flex-1">{children}</span>
                        </li>
                      ) : (
                        <li className={`flex items-start gap-3 leading-relaxed text-gray-700 ${specialClass}`}>
                          {icon || <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full mt-3"></span>}
                          <span className="flex-1">{children}</span>
                        </li>
                      );
                    },
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-green-500 pl-6 py-4 my-6 bg-green-50 italic text-gray-700 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                    code: ({node, inline, className, children, ...props}) => {
                      // ReactMarkdown v6+ doesn't always pass inline prop correctly
                      // Check if this is inline code by looking at the parent node
                      const isInline = inline !== false && !className?.includes('language-');
                      
                      if (isInline) {
                        const text = typeof children === 'string' ? children : 
                                    Array.isArray(children) ? children.join('') : '';
                        
                        // Common DHM-related terms that should have tooltips
                        const tooltipTerms = {
                          'ADH': 'Alcohol dehydrogenase - an enzyme that breaks down alcohol in your liver',
                          'ALDH': 'Aldehyde dehydrogenase - an enzyme that processes toxic acetaldehyde',
                          'GABA': 'Gamma-aminobutyric acid - the main inhibitory neurotransmitter in the brain',
                          'DHM': 'Dihydromyricetin - a natural flavonoid that prevents hangovers',
                          'mg/kg': 'Milligrams per kilogram of body weight - a standard dosing measurement',
                          'NAD+': 'Nicotinamide adenine dinucleotide - a coenzyme essential for metabolism',
                          'RCT': 'Randomized Controlled Trial - the gold standard for clinical research',
                          'ALDH2': 'Aldehyde dehydrogenase 2 - the specific enzyme variant that breaks down acetaldehyde'
                        };
                        
                        if (tooltipTerms[text]) {
                          return (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <code className="inline bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 underline decoration-dotted cursor-help" style={{display: 'inline'}}>
                                    {children}
                                  </code>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{tooltipTerms[text]}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                        
                        return <code className="inline bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" style={{display: 'inline'}} {...props}>{children}</code>;
                      }
                      
                      // Block code
                      return (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                      );
                    },
                    a: ({href, children}) => {
                      const isExternal = href?.startsWith('http');
                      const isHashLink = href?.startsWith('#');
                      const isInternal = href && !isExternal && !isHashLink && href !== '#';
                      
                      // Handle hash links (TOC links)
                      if (isHashLink && isClient) {
                        return (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              const targetId = href.slice(1); // Remove the #
                              scrollToSection(targetId);
                            }}
                            className="text-green-600 hover:text-green-700 underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const targetId = href.slice(1);
                                scrollToSection(targetId);
                              }
                            }}
                          >
                            {children}
                          </span>
                        );
                      }
                      
                      if (isInternal && isClient) {
                        return (
                          <CustomLink
                            to={href}
                            className="text-green-600 hover:text-green-700 underline transition-colors inline-flex items-center gap-1"
                          >
                            {children}
                          </CustomLink>
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
                      
                      // Check for percentage patterns (e.g., "70% faster")
                      const percentageMatch = text.match(/^(\d+)%\s+(.+)$/);
                      if (percentageMatch) {
                        const [_, percentage, description] = percentageMatch;
                        return (
                          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-1 rounded-lg border border-green-200">
                            <strong className="text-2xl font-bold text-green-700">{percentage}%</strong>
                            <span className="text-gray-700 font-medium">{description}</span>
                          </span>
                        );
                      }
                      
                      // Check for key stat patterns (e.g., "300mg" or "$29.99")
                      const statMatch = text.match(/^([\$]?\d+(?:mg|g|ml|L)?|\$\d+\.\d{2})$/);
                      if (statMatch) {
                        return (
                          <strong className="inline-block text-xl font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                            {children}
                          </strong>
                        );
                      }
                      
                      return isFormula ? (
                        <strong className="inline-block font-bold gradient-text-green border-b-2 border-green-200 pb-1 mr-1">
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
                    img: ({src, alt, ...props}) => {
                      // Use ImageLightbox for blog content images
                      return (
                        <div className="my-8">
                          <ImageLightbox 
                            src={src} 
                            alt={alt}
                            className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                          />
                        </div>
                      );
                    },
                    hr: () => (
                      <div className="relative my-12">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-4">
                            <Leaf className="w-6 h-6 text-green-600" />
                          </span>
                        </div>
                      </div>
                    ),
                  }}
                >
                  {renderContent(post)}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.slug}
                    className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <CustomLink
                      to={`/never-hungover/${relatedPost.slug}`}
                      className="block p-4"
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
                    </CustomLink>
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