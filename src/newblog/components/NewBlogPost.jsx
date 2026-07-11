import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2, List, User, ExternalLink, ChevronRight, Loader2, Info, AlertCircle, CheckCircle, Lightbulb, Leaf } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';
import {
  getPostBySlug,
  getRelatedPostsMetadata,
  preloadRelatedPosts,
  getCacheStats
} from '../utils/postLoader';
import { useSEO, generatePageSEO } from '../../hooks/useSEO.js';
import { applyRedirect } from '../../utils/redirects.js';
import { usePageTracking } from '../../hooks/usePageTracking';
import KeyTakeaways from './KeyTakeaways';
import ImageLightbox from './ImageLightbox';
import Picture from '../../components/Picture';
import { Link as CustomLink } from '../../components/CustomLink';
import { trackElementClick } from '../../lib/posthog';
import { motion } from 'framer-motion';
import InlineComparisonTable from '../../components/InlineComparisonTable';
import { preloadModernFonts } from '../../lib/preloadModernFonts.js';
import '../../styles/theme-modern.css';

// Matches <!-- inline-comparison-table:VARIANT:PLACEMENT:ID,ID,ID --> in markdown.
// Capture groups: 1=variant, 2=placement, 3=id list (comma-separated).
const INLINE_COMPARISON_TABLE_MARKER = /<!--\s*inline-comparison-table:([\w-]+):([\w-]+):([\d,]+)\s*-->/g;

// Slugs whose markdown bodies already contain in-content /reviews CTAs.
// Skip the auto-injected template CTA on these to avoid duplication.
const REVIEWS_CTA_SKIP_SLUGS = new Set([
  'dhm-dosage-guide-2025',
]);

// Posts shorter than this (rendered markdown chars) skip the mid-content CTA.
const TEMPLATE_CTA_MIN_CONTENT_LENGTH = 500;

/**
 * Inline /reviews CTA injected automatically into every blog post body.
 * Mirrors the soft, on-brand style of the working /reviews link in
 * dhm-dosage-guide-2025 (9.5% element-CTR). Distinct (left border + light
 * gradient) but not flashy. Click is captured by PostHog via [data-track="cta"]
 * (autocapture allowlist) plus an explicit element_clicked event with
 * placement metadata for funnel analysis.
 */
const InlineReviewsCTA = ({ placement, postSlug }) => {
  const handleClick = () => {
    trackElementClick('cta', {
      placement,
      destination: '/reviews',
      post_slug: postSlug,
      element_name: 'blog_template_reviews_cta',
    });
  };

  return (
    <div
      className="not-prose card"
      style={{
        marginBlock: 'var(--space-8)',
        backgroundColor: 'var(--color-brand-soft)',
        borderLeft: '3px solid var(--color-brand)',
      }}
    >
      <p
        style={{
          margin: '0 0 var(--space-1)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-ink)',
        }}
      >
        Looking for the best DHM supplement?
      </p>
      <p
        className="text-soft"
        style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-small)' }}
      >
        We've independently tested 10+ products for purity, absorption, and value.
      </p>
      <CustomLink
        to="/reviews"
        data-track="cta"
        data-element-name="blog_template_reviews_cta"
        data-placement={placement}
        onClick={handleClick}
        className="btn btn-secondary"
        style={{ color: 'var(--color-brand-strong)' }}
      >
        See our top-rated picks
        <ChevronRight className="w-4 h-4" />
      </CustomLink>
    </div>
  );
};

/**
 * In-article callout — the modern border-first replacement for the shadcn
 * <Alert>/green-gradient boxes the control template used. Uses the scoped
 * .callout primitives from theme-modern.css (icon + title + body, 1px border +
 * 3px accent rule). Variant → semantic mapping (per #384):
 *   note (blue)    — Info Box / Did You Know / Important Medical Information
 *   tip (green)    — Pro Tip
 *   warning (amber)— Warning / Important / Emergency Protocol
 *   key (ink)      — Key Insight
 * Orange is never emitted here — it stays exclusive to affiliate/buy CTAs.
 */
const CALLOUT_ICONS = {
  note: Info,
  tip: CheckCircle,
  warning: AlertCircle,
  key: Lightbulb,
};

const Callout = ({ variant = 'note', title, children }) => {
  const Icon = CALLOUT_ICONS[variant] || Info;
  return (
    <div className={`not-prose callout callout--${variant}`} role="note">
      <span className="callout__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="callout__content">
        {title && <p className="callout__title">{title}</p>}
        <p className="callout__body">{children}</p>
      </div>
    </div>
  );
};

/**
 * Split a markdown string at approximately the target percentage, snapping
 * to the nearest paragraph break (double newline) so we never split mid-
 * paragraph, mid-table, or mid-list. Returns [before, after].
 *
 * If no clean break exists at/after the target (or the break is too close
 * to the end), returns [content, ''] - mid-content CTA is then skipped and
 * only the end-of-content CTA renders.
 */
const splitContentAtRatio = (content, ratio = 0.3) => {
  if (!content || typeof content !== 'string') return [content || '', ''];
  const target = Math.floor(content.length * ratio);
  const breakIdx = content.indexOf('\n\n', target);
  if (breakIdx === -1) return [content, ''];
  if (breakIdx / content.length > 0.85) return [content, ''];
  return [content.slice(0, breakIdx), content.slice(breakIdx + 2)];
};

// Helper function to create enhanced components for special content patterns
const createEnhancedComponents = () => {
  // Function to detect and render info boxes → modern .callout primitives
  const renderInfoBox = (text) => {
    // Pattern: **Info Box:** content
    if (text.startsWith('**Info Box:**')) {
      const content = text.replace('**Info Box:**', '').trim();
      return <Callout variant="note" title="Did You Know?">{content}</Callout>;
    }

    // Pattern: **Warning:** content
    if (text.startsWith('**Warning:**')) {
      const content = text.replace('**Warning:**', '').trim();
      return <Callout variant="warning" title="Important">{content}</Callout>;
    }

    // Pattern: **Pro Tip:** content
    if (text.startsWith('**Pro Tip:**')) {
      const content = text.replace('**Pro Tip:**', '').trim();
      return <Callout variant="tip" title="Pro Tip">{content}</Callout>;
    }

    // Pattern: **Key Insight:** content
    if (text.startsWith('**Key Insight:**')) {
      const content = text.replace('**Key Insight:**', '').trim();
      return <Callout variant="key" title="Key Insight">{content}</Callout>;
    }

    return null;
  };

  // Function to create enhanced product cards → border-first card (brand accents)
  const renderProductCard = (text) => {
    // Pattern: **Product Spotlight: [Product Name]** - details
    const productMatch = text.match(/\*\*Product Spotlight: (.+?)\*\* - (.+)/);
    if (productMatch) {
      const [_, productName, details] = productMatch;
      return (
        <div className="not-prose card-raised" style={{ marginBlock: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
            <p className="card-title" style={{ color: 'var(--color-ink)' }}>{productName}</p>
            <span className="badge badge-brand" style={{ flex: '0 0 auto' }}>Featured</span>
          </div>
          <p className="text-soft" style={{ margin: '0 0 var(--space-4)' }}>{details}</p>
          <CustomLink to="/reviews" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-brand-strong)' }}>
            See Full Details →
          </CustomLink>
        </div>
      );
    }
    return null;
  };

  // Function to render visual separators → quiet brand-green leaf on a hairline
  const renderVisualSeparator = () => (
    <div className="not-prose" style={{ position: 'relative', marginBlock: 'var(--space-12)' }}>
      <div style={{ borderTop: '1px solid var(--color-border)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--color-paper)', paddingInline: 'var(--space-4)' }}>
        <Leaf style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-brand)' }} aria-hidden="true" />
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

  // Memoize full content rendering
  const fullContent = useMemo(() => {
    if (!post?.content) return '';
    return renderContent(post);
  }, [post?.content]);

  // Extract slug from URL
  const extractSlug = () => {
    const currentPath = window.location.pathname;
    return currentPath.replace('/never-hungover/', '').replace('/newblog/', '');
  };

  // Modern variant: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts();
  }, []);

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

  // Enrich pageview with blog post metadata
  usePageTracking(post ? {
    postSlug: post.slug,
    postCategory: post.tags?.[0] || 'uncategorized',
    tags: post.tags,
    wordCount: post.content?.split(/\s+/).length || 0,
    hasAffiliateLinks: post.content?.includes('amzn.to') || post.content?.includes('amazon.com')
  } : {});

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
      <div
        className="theme-modern"
        style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Loader2 className="animate-spin" style={{ width: '2rem', height: '2rem', color: 'var(--color-brand)' }} />
            <h1 style={{ fontSize: '1.5rem' }}>Never Hungover</h1>
          </div>
          <p className="text-soft" style={{ margin: 0 }}>Loading post…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError || !post) {
    return (
      <div
        className="theme-modern"
        style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center', paddingInline: 'var(--space-4)' }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Post Not Found</h1>
          <p className="text-soft" style={{ marginBottom: 'var(--space-6)' }}>
            {loadingError || "The blog post you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => handleNavigation('/never-hungover')}
            className="btn btn-secondary"
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
    <div
      className="theme-modern"
      style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {/* Reading Progress Bar - positioned below header using CSS variable */}
      {isClient && (
        <div
          className="fixed left-0 w-full h-1 z-sticky"
          style={{ top: 'var(--header-height, 80px)', backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%`, backgroundColor: 'var(--color-brand)' }}
          />
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
            <button
              onClick={() => handleNavigation('/')}
              className="transition-colors hover:[color:var(--color-brand-strong)]"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => handleNavigation('/never-hungover')}
              className="transition-colors hover:[color:var(--color-brand-strong)]"
            >
              Never Hungover
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="truncate" style={{ color: 'var(--color-ink)' }}>
              {formatTitle(post.title).mainTitle}
            </span>
          </nav>

          <button
            onClick={() => handleNavigation('/never-hungover')}
            className="btn btn-ghost btn-sm mb-6"
            style={{ color: 'var(--color-brand-strong)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Never Hungover
          </button>

          <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {formatDate(post.date)}</span>
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
                data-track="share"
                className="flex items-center gap-1 transition-colors hover:[color:var(--color-ink)]"
                style={{ color: 'var(--color-brand-strong)' }}
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
                  <h1 style={{ marginBottom: subtitle ? 'var(--space-3)' : 0 }}>
                    {mainTitle}
                  </h1>
                  {subtitle && (
                    <p className="lead" style={{ margin: 0 }}>
                      {subtitle}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {post.excerpt && (
            <p className="lead" style={{ marginBottom: 'var(--space-6)' }}>
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="chip">
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
              <div className="card">
                {/* Navigation-chrome label — deliberately NOT a heading element so
                    it stays out of the article's semantic outline (h1 → body h2 → h3). */}
                <p
                  className="mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 var(--space-4)' }}
                >
                  <List className="w-4 h-4" style={{ color: 'var(--color-brand)' }} aria-hidden="true" />
                  Table of Contents
                </p>
                <nav className="space-y-1">
                  {tocItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full text-left text-sm transition-all duration-150 ${item.level === 3 ? 'ml-4' : ''}`}
                        style={{
                          minHeight: '44px',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          borderLeft: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                          backgroundColor: isActive ? 'var(--color-brand-soft)' : 'transparent',
                          color: isActive ? 'var(--color-brand-strong)' : 'var(--color-ink-soft)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {item.text}
                      </button>
                    );
                  })}
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
                className="btn btn-secondary touch-manipulation"
              >
                <List className="w-4 h-4" />
                <span>Table of Contents</span>
                <div className={`transform transition-transform duration-200 ${showToc ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                <div className="card mt-4">
                  <nav className="space-y-1">
                    {tocItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            scrollToSection(item.id);
                            setShowToc(false);
                          }}
                          className={`block w-full text-left text-sm transition-all duration-150 ${item.level === 3 ? 'ml-4' : ''}`}
                          style={{
                            minHeight: '44px',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            backgroundColor: isActive ? 'var(--color-brand-soft)' : 'transparent',
                            color: isActive ? 'var(--color-brand-strong)' : 'var(--color-ink-soft)',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {item.text}
                        </button>
                      );
                    })}
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
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
            {/* Hero Image - aspect-video + width/height attrs prevent CLS (Issue #293) */}
            {post.image && (
              <div className="w-full">
                <Picture
                  src={post.image}
                  alt={`${post.title} - DHM Guide`}
                  className="w-full aspect-video object-cover"
                  width={1600}
                  height={900}
                  priority
                  fetchPriority="high"
                />
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Quick Answer callout — positioned in the first ~100 words for AI engine extraction (Perplexity, ChatGPT, Gemini). Issue #292. */}
              {post.quickAnswer && (
                <div
                  className="container-prose"
                  style={{
                    marginBottom: 'var(--space-8)',
                    padding: 'var(--space-4) var(--space-6)',
                    backgroundColor: '#EAF0FE',
                    borderLeft: '3px solid var(--color-info)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 var(--space-1)',
                      fontSize: 'var(--text-small)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-wide)',
                      color: 'var(--color-info)',
                    }}
                  >
                    Quick Answer
                  </p>
                  <p style={{ margin: 0, fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--color-ink)' }}>
                    {post.quickAnswer}
                  </p>
                </div>
              )}

              {/* Key Takeaways Component */}
              {keyTakeaways.length > 0 && (
                <KeyTakeaways takeaways={keyTakeaways} />
              )}

              {/* Main Content — the scoped .article-body typography (Fraunces solid
                  headings, Inter body ~68ch measure) replaces the Tailwind prose. */}
              <div ref={contentRef} className="article-body">
                {(() => {
                  // Shared components config for ReactMarkdown
                  const markdownComponents = {
                    h1: ({children}) => {
                      const extractText = (node) => {
                        if (typeof node === 'string') return node;
                        if (Array.isArray(node)) return node.map(extractText).join('');
                        if (node?.props?.children) return extractText(node.props.children);
                        return '';
                      };
                      const text = extractText(children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      return <h1 id={id}>{children}</h1>;
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
                      return <h2 id={id}>{children}</h2>;
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
                      return <h3 id={id}>{children}</h3>;
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
                      
                      // Check for info box patterns → modern .callout primitives
                      if (trimmedText.startsWith('Info Box:')) {
                        const content = trimmedText.replace(/^Info Box:\s*/, '');
                        return <Callout variant="note" title="Did You Know?">{content}</Callout>;
                      }

                      // Check for warning patterns
                      if (trimmedText.startsWith('Warning:')) {
                        const content = trimmedText.replace(/^Warning:\s*/, '');
                        return <Callout variant="warning" title="Important">{content}</Callout>;
                      }

                      // Check for pro tip patterns
                      if (trimmedText.startsWith('Pro Tip:')) {
                        const content = trimmedText.replace(/^Pro Tip:\s*/, '');
                        return <Callout variant="tip" title="Pro Tip">{content}</Callout>;
                      }

                      // Check for key insight patterns
                      if (trimmedText.startsWith('Key Insight:')) {
                        const content = trimmedText.replace(/^Key Insight:\s*/, '');
                        return <Callout variant="key" title="Key Insight">{content}</Callout>;
                      }

                      // Check for important patterns
                      if (trimmedText.startsWith('Important:')) {
                        const content = trimmedText.replace(/^Important:\s*/, '');
                        return <Callout variant="warning" title="Important">{content}</Callout>;
                      }

                      // Check for patterns with asterisks (from blockquotes)
                      if (trimmedText.startsWith('**Warning:**')) {
                        const content = trimmedText.replace(/^\*\*Warning:\*\*\s*/, '');
                        return <Callout variant="warning" title="Warning">{content}</Callout>;
                      }

                      if (trimmedText.startsWith('**Key Insight:**')) {
                        const content = trimmedText.replace(/^\*\*Key Insight:\*\*\s*/, '');
                        return <Callout variant="key" title="Key Insight">{content}</Callout>;
                      }

                      if (trimmedText.startsWith('**Pro Tip:**')) {
                        const content = trimmedText.replace(/^\*\*Pro Tip:\*\*\s*/, '');
                        return <Callout variant="tip" title="Pro Tip">{content}</Callout>;
                      }

                      if (trimmedText.startsWith('**Emergency Protocol:**')) {
                        const content = trimmedText.replace(/^\*\*Emergency Protocol:\*\*\s*/, '');
                        return <Callout variant="warning" title="Emergency Protocol">{content}</Callout>;
                      }

                      if (trimmedText.startsWith('**Important Medical Information:**')) {
                        const content = trimmedText.replace(/^\*\*Important Medical Information:\*\*\s*/, '');
                        return <Callout variant="note" title="Important Medical Information">{content}</Callout>;
                      }
                      
                      // Skip rendering key takeaways in the main content since we show them at the top
                      if (trimmedText.match(/^(?:##\s*)?(?:[🎯🔥💡⚡🌟]?\s*)?Key Takeaways?/i)) {
                        return null;
                      }
                      
                      // Check for product card patterns → border-first card
                      if (trimmedText.startsWith('Product Spotlight:')) {
                        const productMatch = trimmedText.match(/^Product Spotlight:\s*([^-]+?)\s*-\s*(.+)/);
                        if (productMatch) {
                          const [_, productName, details] = productMatch;
                          return (
                            <div className="not-prose card-raised" style={{ marginBlock: 'var(--space-6)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                                <p className="card-title" style={{ color: 'var(--color-ink)' }}>{productName.trim()}</p>
                                <span className="badge badge-brand" style={{ flex: '0 0 auto' }}>Featured</span>
                              </div>
                              <p className="text-soft" style={{ margin: '0 0 var(--space-4)' }}>{details.trim()}</p>
                              <CustomLink to="/reviews" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-brand-strong)' }}>
                                See Full Details →
                              </CustomLink>
                            </div>
                          );
                        }
                      }

                      // Check for separator pattern
                      if (fullText.trim() === '---') {
                        return renderVisualSeparator();
                      }

                      // Default paragraph rendering — styled by .article-body descendant CSS
                      return <p>{children}</p>;
                    },
                    // Lists + blockquote are styled by .article-body descendant CSS
                    // (brand-green markers, hanging indent, brand-soft quote). Plain
                    // elements keep the SEO-visible text/structure untouched.
                    ul: ({children}) => <ul>{children}</ul>,
                    ol: ({children}) => <ol>{children}</ol>,
                    li: ({children}) => <li>{children}</li>,
                    blockquote: ({children}) => <blockquote>{children}</blockquote>,
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
                                  <code
                                    className="cursor-help"
                                    style={{ display: 'inline', textDecoration: 'underline dotted' }}
                                  >
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

                        return <code style={{ display: 'inline' }} {...props}>{children}</code>;
                      }

                      // Block code — styled by .article-body pre/code descendant CSS
                      return (
                        <pre>
                          <code className={className} {...props}>{children}</code>
                        </pre>
                      );
                    },
                    a: ({href, children}) => {
                      const isExternal = href?.startsWith('http');
                      const isHashLink = href?.startsWith('#');
                      const isInternal = href && !isExternal && !isHashLink && href !== '#';
                      // Detect Amazon affiliate links so the global useAffiliateTracking
                      // hook gets proper placement metadata + Google compliance attrs.
                      const isAffiliate = isExternal && /(?:^|\/\/|\.)(amazon\.[a-z.]{2,6}|amzn\.to)\//i.test(href || '');

                      // Handle hash links (TOC links) — internal nav, brand green
                      if (isHashLink && isClient) {
                        return (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              const targetId = href.slice(1); // Remove the #
                              scrollToSection(targetId);
                            }}
                            className="inline-flex items-center gap-1 cursor-pointer underline"
                            style={{ color: 'var(--color-brand-strong)' }}
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

                      // Internal article link — brand green (nav), NOT the body blue
                      if (isInternal && isClient) {
                        return (
                          <CustomLink
                            to={href}
                            className="inline-flex items-center gap-1 underline"
                            style={{ color: 'var(--color-brand-strong)' }}
                          >
                            {children}
                          </CustomLink>
                        );
                      }

                      // External / affiliate link — plain <a>, contract preserved
                      // byte-for-byte (rel/target/data-placement, NO onClick). Body
                      // color comes from the .article-body a rule (editorial blue);
                      // orange is never applied to in-article links.
                      return (
                        <a
                          href={href}
                          className="inline-flex items-center gap-1"
                          target={isExternal ? '_blank' : undefined}
                          rel={isAffiliate ? 'nofollow sponsored noopener noreferrer' : (isExternal ? 'noopener noreferrer' : undefined)}
                          data-placement={isAffiliate ? 'blog_content_inline' : undefined}
                        >
                          {children}
                          {isExternal && <ExternalLink className="w-3 h-3" />}
                        </a>
                      );
                    },
                    // strong/em styled by .article-body descendant CSS (quiet
                    // font-weight:600 solid ink — no green pills / gradient text).
                    strong: ({children}) => <strong>{children}</strong>,
                    em: ({children}) => <em>{children}</em>,
                    // Tables wrap in .table-scroll for mobile overflow safety; the
                    // .article-body table/thead/th/td CSS supplies brand-soft header,
                    // paper zebra, 1px border + radius.
                    table: ({children}) => (
                      <div className="table-scroll">
                        <table>{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead>{children}</thead>,
                    tbody: ({children}) => <tbody>{children}</tbody>,
                    tr: ({children}) => <tr>{children}</tr>,
                    th: ({children}) => <th>{children}</th>,
                    td: ({children}) => <td>{children}</td>,
                    img: ({src, alt, ...props}) => {
                      // Use ImageLightbox for blog content images; rounded + 1px
                      // border comes from the .article-body img rule on the inner img.
                      return (
                        <div style={{ marginBlock: 'var(--space-8)' }}>
                          <ImageLightbox
                            src={src}
                            alt={alt}
                            className="w-full"
                          />
                        </div>
                      );
                    },
                    hr: () => (
                      <div className="not-prose" style={{ position: 'relative', marginBlock: 'var(--space-12)' }}>
                        <div style={{ borderTop: '1px solid var(--color-border)' }} />
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--color-paper)', paddingInline: 'var(--space-4)' }}>
                          <Leaf style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-brand)' }} aria-hidden="true" />
                        </div>
                      </div>
                    ),
                  };

                  // Renders a markdown string, replacing inline-comparison-table markers
                  // with <InlineComparisonTable /> components. Markers are HTML comments
                  // of the form <!-- inline-comparison-table:VARIANT:PLACEMENT:ID,ID,ID -->.
                  // Malformed markers are skipped silently in prod (warn in dev).
                  const renderMarkdownWithMarkers = (md, keyPrefix) => {
                    if (typeof md !== 'string' || md.length === 0) return null;
                    if (!md.includes('<!-- inline-comparison-table:')) {
                      return (
                        <ReactMarkdown key={`${keyPrefix}-md-0`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {md}
                        </ReactMarkdown>
                      );
                    }
                    const parts = [];
                    let lastIndex = 0;
                    let chunkIdx = 0;
                    // Reset regex state since /g regexes carry lastIndex across uses.
                    INLINE_COMPARISON_TABLE_MARKER.lastIndex = 0;
                    let match;
                    while ((match = INLINE_COMPARISON_TABLE_MARKER.exec(md)) !== null) {
                      const before = md.slice(lastIndex, match.index);
                      if (before.length > 0) {
                        parts.push(
                          <ReactMarkdown key={`${keyPrefix}-md-${chunkIdx}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {before}
                          </ReactMarkdown>
                        );
                      }
                      const [, variant, placementVal, idsStr] = match;
                      const ids = idsStr.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
                      if ((variant === 'compact' || variant === 'full') && placementVal && ids.length > 0) {
                        parts.push(
                          <InlineComparisonTable
                            key={`${keyPrefix}-tbl-${chunkIdx}`}
                            variant={variant}
                            placement={placementVal}
                            productIds={ids}
                          />
                        );
                      } else if (process.env.NODE_ENV !== 'production') {
                        console.warn(`[NewBlogPost] Malformed inline-comparison-table marker: ${match[0]}`);
                      }
                      lastIndex = match.index + match[0].length;
                      chunkIdx += 1;
                    }
                    const tail = md.slice(lastIndex);
                    if (tail.length > 0) {
                      parts.push(
                        <ReactMarkdown key={`${keyPrefix}-md-${chunkIdx}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {tail}
                        </ReactMarkdown>
                      );
                    }
                    return <>{parts}</>;
                  };

                  // Auto-inject template-level /reviews CTA at ~30% and end of body.
                  // Skip if: post opts out (post.skipReviewsCta), slug is in skip list
                  // (already has in-content /reviews CTAs), or body is too short.
                  const showTemplateCta =
                    !post.skipReviewsCta &&
                    !REVIEWS_CTA_SKIP_SLUGS.has(post.slug) &&
                    typeof fullContent === 'string' &&
                    fullContent.length >= TEMPLATE_CTA_MIN_CONTENT_LENGTH;

                  if (!showTemplateCta) {
                    return renderMarkdownWithMarkers(fullContent, 'full');
                  }

                  const [contentBefore, contentAfter] = splitContentAtRatio(fullContent, 0.3);
                  return (
                    <>
                      {renderMarkdownWithMarkers(contentBefore, 'before')}
                      {contentAfter && (
                        <>
                          <InlineReviewsCTA placement="blog_template_mid" postSlug={post.slug} />
                          {renderMarkdownWithMarkers(contentAfter, 'after')}
                        </>
                      )}
                      <InlineReviewsCTA placement="blog_template_end" postSlug={post.slug} />
                    </>
                  );
                })()}
                </div>
            </div>
          </motion.article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="card" style={{ marginTop: 'var(--space-8)' }}>
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-ink)', marginBottom: 'var(--space-6)' }}
              >
                Related Articles
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.slug}
                    className="card-raised"
                    style={{ padding: 0, overflow: 'hidden', height: '100%' }}
                  >
                    <CustomLink
                      to={`/never-hungover/${relatedPost.slug}`}
                      style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
                    >
                      {relatedPost.image && (
                        <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                        <h4
                          className="card-title line-clamp-2"
                          style={{ fontSize: '1.0625rem', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}
                        >
                          {relatedPost.title}
                        </h4>
                        <p
                          className="text-soft line-clamp-2"
                          style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-3)' }}
                        >
                          {relatedPost.excerpt}
                        </p>
                        <div
                          className="cluster"
                          style={{ gap: 'var(--space-1)', marginTop: 'auto', color: 'var(--color-ink-soft)', fontSize: 'var(--text-eyebrow)' }}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{relatedPost.readTime} min read</span>
                        </div>
                        <span
                          className="cluster"
                          style={{ gap: 'var(--space-1)', marginTop: 'var(--space-3)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
                        >
                          Read
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CustomLink>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Performance Info — dev only, neutral card in production diagnostics off */}
          {!import.meta.env.PROD && (
            <div className="card" style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-small)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>⚡ Dynamically Loaded</h4>
              <div className="text-soft" style={{ display: 'grid', gap: '0.25rem' }}>
                <div>• Post loaded on-demand: {Math.round(JSON.stringify(post).length / 1024)}KB</div>
                <div>• Related posts preloaded in background</div>
                <div>• Smart caching active: {getCacheStats().size}/{getCacheStats().maxSize} posts cached</div>
                <div>• Reading progress and TOC generated client-side</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewBlogPost;