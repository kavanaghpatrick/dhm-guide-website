import { useEffect } from 'react';

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

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
    updateMetaTag('meta[name="author"]', 'name', author);
    updateMetaTag('meta[name="robots"]', 'name', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'property', title);
    updateMetaTag('meta[property="og:description"]', 'property', description);
    updateMetaTag('meta[property="og:type"]', 'property', ogType);
    updateMetaTag('meta[property="og:url"]', 'property', canonicalUrl);
    updateMetaTag('meta[property="og:image"]', 'property', ogImage);
    updateMetaTag('meta[property="og:site_name"]', 'property', 'DHM Guide');

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', 'name', title);
    updateMetaTag('meta[name="twitter:description"]', 'name', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', twitterImage || ogImage);
    updateMetaTag('meta[name="twitter:card"]', 'name', 'summary_large_image');

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

    // Update structured data
    if (structuredData) {
      // Remove existing structured data scripts added by this hook
      const existingScripts = document.querySelectorAll('script[data-seo-hook="true"]');
      existingScripts.forEach(script => script.remove());

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-hook', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
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
  const baseUrl = 'https://dhmguide.com';
  
  switch (pageType) {
    case 'home':
      return {
        title: 'Never Wake Up Hungover Again: Science-Backed Hangover Prevention | DHM Guide',
        description: '🚀 Wake up feeling amazing after drinking - no matter how much you had. Clinically-proven hangover prevention with 15+ studies, expert reviews, and thousands of success stories. Stop suffering from hangovers forever.',
        keywords: 'hangover prevention, hangover cure, never hungover again, stop hangovers, hangover remedy, DHM, dihydromyricetin, anti-hangover supplement, wake up feeling great, alcohol recovery',
        canonicalUrl: baseUrl,
        ogImage: `${baseUrl}/og-image.jpg`,
        twitterImage: `${baseUrl}/twitter-image.jpg`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DHM Guide",
          "description": "Comprehensive guide to DHM (Dihydromyricetin) - the science-backed hangover prevention supplement",
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }
      };

    case 'guide':
      return {
        title: 'Ultimate Hangover Prevention Guide 2025: How to Stop Hangovers Forever | DHM Guide',
        description: 'Master hangover prevention with our complete 2025 guide. Clinical research, dosage protocols, and proven strategies to never wake up hungover again using DHM.',
        keywords: 'hangover prevention guide, stop hangovers, never wake up hungover, hangover cure guide, DHM dosage, hangover prevention strategies',
        canonicalUrl: `${baseUrl}/guide`,
        ogImage: `${baseUrl}/dhm-guide-featured.jpg`,
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
        title: 'Best Hangover Prevention Pills 2025: Top Supplements to Stop Hangovers | Reviews',
        description: 'Expert reviews of the best hangover prevention supplements that actually work. Compare top-rated anti-hangover pills with lab testing, user ratings, and effectiveness data.',
        keywords: 'best hangover prevention pills, hangover supplements reviews, anti-hangover pills, hangover cure supplements, stop hangovers supplements',
        canonicalUrl: `${baseUrl}/reviews`,
        ogImage: `${baseUrl}/dhm-reviews-featured.jpg`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "Product",
            "name": "DHM (Dihydromyricetin) Supplements"
          },
          "reviewRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.6",
            "reviewCount": "500"
          },
          "author": {
            "@type": "Organization",
            "name": "DHM Guide"
          }
        }
      };

    case 'research':
      return {
        title: 'Hangover Prevention Research: 15+ Clinical Studies Prove DHM Stops Hangovers',
        description: 'Access 15+ clinical studies proving hangover prevention works. Scientific evidence showing DHM reduces hangovers by 70%. Peer-reviewed research on effective hangover cures.',
        keywords: 'hangover prevention research, clinical studies hangovers, hangover cure research, DHM clinical trials, scientific proof hangover prevention',
        canonicalUrl: `${baseUrl}/research`,
        ogImage: `${baseUrl}/dhm-research-featured.jpg`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "DHM Research Database",
          "description": "Comprehensive collection of DHM (Dihydromyricetin) clinical studies and research papers",
          "creator": {
            "@type": "Organization",
            "name": "DHM Guide"
          }
        }
      };

    case 'compare':
      return {
        title: 'Compare Best Hangover Prevention Supplements 2025: Anti-Hangover Pills Comparison',
        description: 'Compare the best hangover prevention supplements side-by-side. Find your perfect anti-hangover pill based on effectiveness, price, and user reviews. Stop hangovers forever.',
        keywords: 'compare hangover supplements, hangover prevention comparison, anti-hangover pills comparison, best hangover cure supplements',
        canonicalUrl: `${baseUrl}/compare`,
        ogImage: `${baseUrl}/dhm-comparison-featured.jpg`,
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
        title: 'DHM Blog: Latest Hangover Prevention News & Research | DHM Guide',
        description: 'Stay updated with the latest DHM research, hangover prevention tips, and supplement news. Expert articles on dihydromyricetin science and health optimization.',
        keywords: 'DHM blog, hangover prevention blog, dihydromyricetin news, health optimization, supplement research',
        canonicalUrl: `${baseUrl}/blog`,
        ogImage: `${baseUrl}/blog-featured.jpg`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "DHM Guide Blog",
          "description": "Latest research and insights on DHM and hangover prevention"
        }
      };

    case 'about':
      return {
        title: 'About DHM Guide: Leading Hangover Prevention Experts & Research Team',
        description: 'Meet the hangover prevention experts behind DHM Guide. Our research team is dedicated to helping you never wake up hungover again with science-backed solutions.',
        keywords: 'hangover prevention experts, stop hangovers team, hangover cure specialists, hangover prevention research team',
        canonicalUrl: `${baseUrl}/about`,
        ogImage: `${baseUrl}/about-featured.jpg`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About DHM Guide",
          "description": "Your trusted resource for science-backed hangover prevention information"
        }
      };

    case 'blog-post':
      const { title, excerpt, slug, author, date, image, tags, content } = pageData;
      const blogPostUrl = `${baseUrl}/blog/${slug}`;
      
      // Extract image from content if not explicitly provided
      const extractedImage = image || extractImageFromMarkdown(content);
      const finalImage = extractedImage ? `${baseUrl}${extractedImage}` : `${baseUrl}/blog-default.jpg`;
      
      return {
        title: `${title} | DHM Guide`,
        description: excerpt,
        keywords: tags ? tags.join(', ') : 'DHM, dihydromyricetin, hangover prevention',
        canonicalUrl: blogPostUrl,
        ogImage: finalImage,
        ogType: 'article',
        author,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": excerpt,
          "image": finalImage,
          "datePublished": new Date(date).toISOString(),
          "dateModified": new Date(date).toISOString(),
          "author": {
            "@type": "Person",
            "name": author || "DHM Guide Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DHM Guide",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": blogPostUrl
          },
          "articleSection": "Health & Wellness",
          "keywords": tags ? tags : ["DHM", "Dihydromyricetin", "Hangover Prevention"]
        }
      };

    default:
      return {
        title: 'DHM Guide: Science-Backed Hangover Prevention',
        description: 'Your trusted resource for DHM (Dihydromyricetin) information and hangover prevention.',
        keywords: 'DHM, dihydromyricetin, hangover prevention',
        canonicalUrl: baseUrl,
        ogImage: `${baseUrl}/og-image.jpg`
      };
  }
};