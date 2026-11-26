import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
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
import InlineComparisonTable from '../../components/InlineComparisonTable';
import { preloadModernFonts } from '../../lib/preloadModernFonts.js';
import { cleanMarkdown } from '../utils/cleanMarkdown.js';
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
    <div className="not-prose post-offer">
      <p className="post-offer__title">Looking for the best DHM supplement?</p>
      <p className="post-offer__text">
        We've independently tested 10+ products for purity, absorption, and value.
      </p>
      <CustomLink
        to="/reviews"
        data-track="cta"
        data-element-name="blog_template_reviews_cta"
        data-placement={placement}
        onClick={handleClick}
        className="btn btn-secondary"
      >
        See our top-rated picks
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </CustomLink>
    </div>
  );
};

/**
 * In-article callout. One quiet style (a 2px rule, title + body, no icon or
 * box; see theme-modern.css section 16). Variant → semantic mapping (#384):
 *   note (blue)    — Info Box / Did You Know / Important Medical Information
 *   tip (green)    — Pro Tip
 *   warning (amber)— Warning / Important / Emergency Protocol
 *   key (ink)      — Key Insight
 * Orange is never emitted here — it stays exclusive to affiliate/buy CTAs.
 */
const Callout = ({ variant = 'note', title, children }) => (
  <div className={`not-prose callout callout--${variant}`} role="note">
    <div className="callout__content">
      {title && <p className="callout__title">{title}</p>}
      <p className="callout__body">{children}</p>
    </div>
  </div>
);

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
  return post.content || '';
};

const NewBlogPost = () => {
  // State management
  const [activeSection, setActiveSection] = useState('');
  const [activeSub, setActiveSub] = useState('');
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
    return cleanMarkdown(renderContent(post));
  }, [post?.content]);

  // Table of contents, read straight from the markdown with the same id rule
  // as the h2/h3 components below: [{id, text, children: [{id, text}]}].
  // H3s are kept only under an H2 with 2 to 8 of them (listicle items, steps).
  const toc = useMemo(() => {
    const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const plain = (t) => t.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+#+\s*$/, '').replace(/\s*\{#[^}]*\}/g, '').trim();
    const items = [];
    for (const [, hashes, raw] of fullContent.replace(/```[\s\S]*?```/g, '').matchAll(/^(##|###)[ \t]+(.+)$/gm)) {
      const text = plain(raw);
      const id = slugify(text);
      if (!id) continue;
      if (hashes === '##') {
        // Short label: "Hidden Alcohol: Mouthwash, Cough Syrup..." -> "Hidden Alcohol".
        const cut = text.indexOf(': ');
        items.push({ id, text: cut >= 12 ? text.slice(0, cut) : text, children: [] });
      } else if (items.length) {
        items[items.length - 1].children.push({ id, text });
      }
    }
    for (const item of items) if (item.children.length < 2 || item.children.length > 8) item.children = [];
    return items;
  }, [fullContent]);

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

  // Scroll-spy: the last H2 (and H3 inside it) whose top has passed y=150.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!contentRef.current) return;
        let h2 = '';
        let h3 = '';
        for (const h of contentRef.current.querySelectorAll('h2, h3')) {
          if (h.getBoundingClientRect().top > 150) break;
          if (h.tagName === 'H2') { h2 = h.id; h3 = ''; } else h3 = h.id;
        }
        setActiveSection(h2);
        setActiveSub(h3);
      });
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
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
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

  // Some posts store readTime as "18 min read", most as a number.
  const readTimeLabel = (t) => (/min/i.test(String(t)) ? String(t) : `${t} min read`);
  const hasToc = toc.length > 1;
  // "Updated" only when the post records an edit after it was published.
  // post.date is a Date (postLoader); dateModified/lastModified are strings.
  const published = new Date(post.date || post.datePublished);
  const modified = new Date(post.dateModified || post.lastModified);
  const wasEdited = modified > published; // false when either is missing (NaN)
  const shownDate = wasEdited ? modified : published;
  const tocLink = (item, active) => (
    <a
      href={`#${item.id}`}
      className={active ? 'is-active' : undefined}
      aria-current={active ? 'location' : undefined}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(item.id);
      }}
    >
      {item.text}
    </a>
  );
  // One list, used by both the phone "Contents" block and the desktop rail.
  const tocList = (
    <ol>
      {toc.map((item) => (
        <li key={item.id}>
          {tocLink(item, activeSection === item.id)}
          {item.children.length > 0 && (
            <ol>
              {item.children.map((child) => (
                <li key={child.id}>{tocLink(child, activeSub === child.id)}</li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    // key: mount a fresh tree, so React doesn't morph the centred loading
    // wrapper into the article (that move registered as a 0.33 layout shift).
    <div key="post" className="theme-modern" data-blog="post">
      <div className="post-shell">
        <article className="post">
          {/* A div, not <header>: index.css styles every `header button`. */}
          <div className="post-head">
            <nav className="post-eyebrow post-crumbs t-label" aria-label="Breadcrumb">
              <CustomLink to="/never-hungover">Never Hungover</CustomLink>
              {post.category && <span> / {post.category}</span>}
            </nav>

            {/* The full title, matching the prerendered H1 and <title>. */}
            <h1 className="post-title">{post.title}</h1>

            {post.excerpt && <p className="post-lead">{post.excerpt}</p>}

            {/* One quiet line: "Published|Updated <date> · N min read", nothing
                else. The author stays in the JSON-LD. */}
            <p className="post-meta">
              {wasEdited ? 'Updated' : 'Published'}{' '}
              <time dateTime={isNaN(shownDate) ? undefined : shownDate.toISOString().slice(0, 10)}>
                {formatDate(shownDate)}
              </time>
              {post.readTime && <> · {readTimeLabel(post.readTime)}</>}
            </p>

            {/* FTC affiliate disclosure — near the top, only on posts with buy links. */}
            {/amazon\.com|amzn\.to|inline-comparison-table/.test(post.content || '') && (
              <p className="post-disclosure">
                We earn a commission if you buy through our links, at no cost to you.
              </p>
            )}

            <hr className="post-rule" />
          </div>

          {/* Below 1024px: a collapsed native "Contents" block, no JS state. */}
          {hasToc && (
            <details className="contents">
              <summary>
                Contents
                <ChevronDown aria-hidden="true" />
              </summary>
              <nav className="post-toc" aria-label="Contents">{tocList}</nav>
            </details>
          )}

          <div className="post-main">
          {/* From 1024px: a quiet sticky rail in the left margin (CSS). */}
          {hasToc && (
            <div className="post-toc-rail">
              <nav className="post-toc post-toc--rail" aria-label="On this page">
                <p className="post-toc__label">On this page</p>
                {tocList}
              </nav>
            </div>
          )}

          {/* Quick Answer — first block of the article column, level with the
              top of the rail; still in the first ~100 words for AI engine
              extraction. Issue #292. */}
          {post.quickAnswer && (
            <div className="post-answer">
              <p className="post-block-label">Quick answer</p>
              <p className="post-answer__text">{post.quickAnswer}</p>
            </div>
          )}

          {/* Hero image - width/height attrs + aspect-video prevent CLS (Issue #293) */}
          {post.image && (
            <div className="post-figure">
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

          {keyTakeaways.length > 0 && <KeyTakeaways takeaways={keyTakeaways} />}

          {/* Article body — styled by .article-body (theme-modern.css section 15). */}
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
                        return <hr />;
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
                            className="post-anchor"
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

                      // Internal article link — accent green via the .article-body a rule
                      if (isInternal && isClient) {
                        return (
                          <CustomLink to={href}>
                            {children}
                          </CustomLink>
                        );
                      }

                      // External / affiliate link — plain <a>, contract preserved
                      // (rel/target/data-placement, NO onClick). Body color comes from
                      // the .article-body a rule (accent green), except affiliate
                      // links written as "Check price…" which render as the orange
                      // buy button (.btn-cta).
                      const isBuyButton = isAffiliate && /^check price/i.test([].concat(children).join(''));
                      return (
                        <a
                          href={href}
                          className={isBuyButton ? 'btn btn-cta' : undefined}
                          target={isExternal ? '_blank' : undefined}
                          rel={isAffiliate ? 'nofollow sponsored noopener noreferrer' : (isExternal ? 'noopener noreferrer' : undefined)}
                          data-placement={isAffiliate ? 'blog_content_inline' : undefined}
                        >
                          {children}
                          {isExternal && !isBuyButton && <ExternalLink aria-hidden="true" />}
                        </a>
                      );
                    },
                    // strong/em styled by .article-body descendant CSS (quiet
                    // font-weight:600 solid ink — no green pills / gradient text).
                    strong: ({children}) => <strong>{children}</strong>,
                    em: ({children}) => <em>{children}</em>,
                    // Tables scroll inside .table-scroll (edge shadows signpost the
                    // scroll); focusable + labelled so keyboard users can scroll it.
                    table: ({children}) => (
                      <div className="table-scroll" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)">
                        <table>{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead>{children}</thead>,
                    tbody: ({children}) => <tbody>{children}</tbody>,
                    tr: ({children}) => <tr>{children}</tr>,
                    th: ({children}) => <th>{children}</th>,
                    td: ({children}) => <td>{children}</td>,
                    img: ({src, alt, ...props}) => {
                      // ImageLightbox for content images; .article-body img styles the inner img.
                      return (
                        <div>
                          <ImageLightbox
                            src={src}
                            alt={alt}
                            className="w-full"
                          />
                        </div>
                      );
                    },
                    hr: () => <hr />,
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
        </article>

        {relatedPosts.length > 0 && (
          <section className="post-related" aria-labelledby="post-related-title">
            <h2 id="post-related-title" className="post-related__title">Related articles</h2>
            <ul className="post-related__list">
              {relatedPosts.map((relatedPost) => (
                <li key={relatedPost.slug}>
                  <CustomLink to={`/never-hungover/${relatedPost.slug}`} className="post-related__link">
                    <h3 className="post-related__name">{relatedPost.title}</h3>
                    {relatedPost.excerpt && <p className="post-related__excerpt">{relatedPost.excerpt}</p>}
                    {relatedPost.readTime && <p className="post-related__meta">{readTimeLabel(relatedPost.readTime)}</p>}
                  </CustomLink>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default NewBlogPost;