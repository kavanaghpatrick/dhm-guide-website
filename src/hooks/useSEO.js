import { useEffect } from 'react';
import { generateEnhancedBlogSchema } from '../utils/productSchemaGenerator.js';

/**
 * Extract the first image URL from markdown content
 */
const extractImageFromMarkdown = (content) => {
  if (!content) return null;
  
  // Match markdown image syntax: ![alt](url)
  const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (imageMatch) {
    return imageMatch[1];
  }
  
  // Match HTML img tags as fallback
  const htmlMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (htmlMatch) {
    return htmlMatch[1];
  }
  
  return null;
};

/**
 * Custom hook for managing dynamic SEO meta tags
 * Automatically updates document head with page-specific SEO data
 */
export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    const {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      ogType = 'website',
      twitterImage,
      structuredData,
      noIndex = false,
      author = 'DHM Guide Team'
    } = seoData;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (selector, attribute, value) => {
      if (!value) return;
      
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (attribute === 'property') {
          meta.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
        } else {
          meta.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    // Update basic meta tags (for SPA navigation)
    // Note: OG tags are NOT updated here because social media crawlers don't execute JavaScript
    // They only see the prerendered static HTML with baked-in OG tags
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
    updateMetaTag('meta[name="author"]', 'name', author);
    updateMetaTag('meta[name="robots"]', 'name', noIndex ? 'noindex, nofollow' : 'index, follow');

    // OG tags and Twitter cards are already in static HTML from prerendering
    // No need to update them client-side since social crawlers don't run JavaScript

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Update structured data (handle both single objects and arrays)
    if (structuredData) {
      // Remove existing structured data scripts added by this hook
      const existingScripts = document.querySelectorAll('script[data-seo-hook="true"]');
      existingScripts.forEach(script => script.remove());

      // Add new structured data (handle arrays)
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-hook', 'true');
        script.setAttribute('data-schema-index', index.toString());
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    // Cleanup function
    return () => {
      // Remove structured data scripts added by this hook when component unmounts
      const scripts = document.querySelectorAll('script[data-seo-hook="true"]');
      scripts.forEach(script => script.remove());
    };
  }, [seoData]);
};

/**
 * Generate page-specific SEO data
 */
export const generatePageSEO = (pageType, pageData = {}) => {
  const baseUrl = 'https://www.dhmguide.com';
  
  switch (pageType) {
    case 'home':
      return {
        title: 'DHM Guide: Science-Backed Hangover Prevention That Actually Works',
        description: 'Discover the UCLA-proven supplement that prevents hangovers in 70% of cases. Expert reviews, dosage guides, and 11 clinical studies. Never wake up hungover again.',
        keywords: 'hangover prevention, hangover cure, never hungover again, stop hangovers, hangover remedy, DHM, dihydromyricetin, anti-hangover supplement, wake up feeling great, alcohol recovery',
        canonicalUrl: baseUrl,
        ogImage: `${baseUrl}/og-image.webp`,
        twitterImage: `${baseUrl}/twitter-image.webp`
        // No structuredData - homepage uses index.html schemas
      };

    case 'guide':
      return {
        title: 'The Complete DHM Guide: Never Wake Up Hungover Again',
        description: 'Complete 2025 DHM guide: Achieve 85% hangover reduction with proper dosing, timing, and supplements. Expert tips backed by clinical science.',
        keywords: 'hangover prevention guide, stop hangovers, never wake up hungover, hangover cure guide, DHM dosage, hangover prevention strategies',
        canonicalUrl: `${baseUrl}/guide`,
        ogImage: `${baseUrl}/dhm-guide-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Complete DHM Guide 2025: Science-Backed Hangover Prevention",
          "description": "Master DHM (Dihydromyricetin) with our comprehensive 2025 guide. Clinical research, dosage protocols, safety data, and expert recommendations.",
          "author": {
            "@type": "Organization",
            "name": "DHM Guide"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DHM Guide"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/guide`
          }
        }
      };

    case 'reviews':
      return {
        title: 'Best DHM Supplements 2025: Top 7 Tested & Ranked',
        description: 'We tested 7 DHM supplements. See which won for effectiveness, value, and speed. Interactive comparison tool included.',
        keywords: 'best dhm supplements, dhm supplement reviews, best dhm for hangovers, dhm pills, dhm supplement comparison',
        canonicalUrl: `${baseUrl}/reviews`,
        ogImage: `${baseUrl}/dhm-reviews-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Best Hangover Pills: Lab-Tested Supplements That Work",
          "description": "Expert reviews of hangover pills that actually work. Lab-tested supplements ranked by effectiveness.",
          "author": {
            "@type": "Organization",
            "name": "DHM Guide"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DHM Guide"
          }
        }
      };

    case 'research':
      return {
        title: 'Does DHM Work? 11 Studies Show 70% Reduction (UCLA-Backed)',
        description: '11 clinical studies from UCLA, USC, and international research show DHM reduces hangover severity by 70%. Complete peer-reviewed analysis.',
        keywords: 'does dhm work, dhm clinical studies, dhm research, ucla dhm study, dhm effectiveness, dhm hangover studies',
        canonicalUrl: `${baseUrl}/research`,
        ogImage: `${baseUrl}/dhm-research-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "Dihydromyricetin Randomized Controlled Trial Database 2024",
          "description": "Comprehensive collection of dihydromyricetin (DHM) randomized controlled trials and clinical studies for hangover prevention",
          "creator": {
            "@type": "Organization",
            "name": "DHM Guide"
          },
          "keywords": ["dihydromyricetin", "randomized controlled trial", "hangover", "DHM", "clinical trials", "2024"]
        }
        // Note: FAQ schema is added by prerender script (scripts/prerender-main-pages.js)
        // to avoid duplicate schema markup that causes Google Search Console errors
      };

    case 'compare':
      return {
        title: 'Compare Hangover Pills: Find Your Perfect Supplement',
        description: 'Compare top DHM supplements side-by-side. Unbiased analysis of ingredients, pricing, effectiveness. Save 40% with expert recommendations.',
        keywords: 'compare hangover supplements, hangover prevention comparison, anti-hangover pills comparison, best hangover cure supplements',
        canonicalUrl: `${baseUrl}/compare`,
        ogImage: `${baseUrl}/dhm-comparison-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "DHM Supplement Comparison Tool",
          "description": "Interactive tool to compare DHM supplements",
          "applicationCategory": "HealthApplication"
        }
      };

    case 'blog':
      return {
        title: 'DHM Blog: Expert Hangover Prevention Tips & Latest Research',
        description: 'Latest hangover science, DHM research updates, and proven prevention strategies. From college drinking to business travel - expert guides for every lifestyle.',
        keywords: 'DHM blog, hangover prevention blog, dihydromyricetin news, health optimization, supplement research',
        canonicalUrl: `${baseUrl}/never-hungover`,
        ogImage: `${baseUrl}/blog-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "DHM Guide Blog",
          "description": "Latest research and insights on DHM and hangover prevention"
        }
      };

    case 'never-hungover':
      return {
        title: 'Never Hungover: Master Science-Backed Hangover Prevention',
        description: 'Learn how to never wake up hungover again. Expert guides on DHM, proven prevention strategies, and cutting-edge research. Master the hangover-free lifestyle.',
        keywords: 'never hungover, hangover prevention, how to never get hungover, DHM hangover prevention, hangover-free lifestyle, prevent hangovers completely',
        canonicalUrl: `${baseUrl}/never-hungover`,
        ogImage: `${baseUrl}/never-hungover-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Never Hungover - DHM Guide",
          "description": "Master the science of hangover prevention and never wake up hungover again",
          "publisher": {
            "@type": "Organization",
            "name": "DHM Guide"
          }
        }
      };

    case 'about':
      return {
        title: 'About DHM Guide: Hangover Prevention Experts',
        description: 'Trusted DHM authority since 2020. Expert team analyzes clinical research, tests supplements, provides unbiased hangover prevention guidance.',
        keywords: 'hangover prevention experts, stop hangovers team, hangover cure specialists, hangover prevention research team',
        canonicalUrl: `${baseUrl}/about`,
        ogImage: `${baseUrl}/about-featured.webp`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About DHM Guide",
          "description": "Your trusted resource for science-backed hangover prevention information"
        }
      };

    case 'blog-post': {
      const { title, excerpt, slug, author, date, image, tags, content } = pageData;
      const blogPostUrl = `${baseUrl}/never-hungover/${slug}`;
      
      // Extract image from content if not explicitly provided
      const extractedImage = image || extractImageFromMarkdown(content);
      const finalImage = extractedImage ? `${baseUrl}${extractedImage}` : `${baseUrl}/blog-default.webp`;
      
      // Safely handle date conversion
      let dateString = '2024-01-01T00:00:00Z'; // Default fallback
      if (date instanceof Date && !isNaN(date.getTime())) {
        try {
          dateString = date.toISOString();
        } catch (error) {
          console.error('Error converting date to ISO string:', error);
        }
      }
      
      // Generate enhanced schemas for product reviews
      const enhancedSchemas = generateEnhancedBlogSchema({
        slug,
        title,
        excerpt,
        date: dateString,
        author,
        tags,
        content
      });
      
      // Use enhanced schemas if available, otherwise fall back to default
      const structuredDataArray = enhancedSchemas && enhancedSchemas.length > 0 ? enhancedSchemas : [{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": excerpt,
        "image": finalImage,
        "datePublished": dateString,
        "dateModified": dateString,
        "author": {
          "@type": "Person",
          "name": author || "DHM Guide Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "DHM Guide",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.webp`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": blogPostUrl
        },
        "articleSection": "Health & Wellness",
        "keywords": tags ? tags : ["DHM", "Dihydromyricetin", "Hangover Prevention"]
      }];
      
      return {
        title: `${title} | DHM Guide`,
        description: excerpt,
        keywords: tags ? tags.join(', ') : 'DHM, dihydromyricetin, hangover prevention',
        canonicalUrl: blogPostUrl,
        ogImage: finalImage,
        ogType: 'article',
        author,
        structuredData: structuredDataArray
      };
    }

    default:
      return {
        title: 'DHM Guide: Science-Backed Hangover Prevention',
        description: 'Your trusted resource for DHM (Dihydromyricetin) information and hangover prevention.',
        keywords: 'DHM, dihydromyricetin, hangover prevention',
        canonicalUrl: baseUrl,
        ogImage: `${baseUrl}/og-image.webp`
      };
  }
};