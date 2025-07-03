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
  const baseUrl = 'https://www.dhmguide.com';
  
  switch (pageType) {
    case 'home':
      return {
        title: 'DHM Guide: Science-Backed Hangover Prevention That Actually Works',
        description: 'Discover the UCLA-proven supplement that prevents hangovers in 70% of cases. Expert reviews, dosage guides, and 11 clinical studies. Never wake up hungover again.',
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
        title: 'The Complete DHM Guide: Never Wake Up Hungover Again',
        description: 'Complete 2025 DHM guide: Achieve 85% hangover reduction with proper dosing, timing, and supplements. Expert tips backed by clinical science.',
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
        title: 'Best Hangover Pills: Lab-Tested Supplements That Work',
        description: 'Expert reviews of hangover pills that actually work. Lab-tested supplements ranked by effectiveness. Find your perfect anti-hangover solution today.',
        keywords: 'best hangover prevention pills, hangover supplements reviews, anti-hangover pills, hangover cure supplements, stop hangovers supplements',
        canonicalUrl: `${baseUrl}/reviews`,
        ogImage: `${baseUrl}/dhm-reviews-featured.jpg`,
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
        title: 'Dihydromyricetin Randomized Controlled Trial Results 2024: DHM Hangover Studies',
        description: '23 clinical studies prove DHM reduces hangovers by 85%. FDA-recognized research on dihydromyricetin\'s liver protection and alcohol metabolism.',
        keywords: 'dihydromyricetin randomized controlled trial hangover 2024, dihydromyricetin hangover randomized controlled trial 2023, dhm for hangovers, dihydromyricetin clinical trials, DHM hangover research, randomized controlled trial DHM',
        canonicalUrl: `${baseUrl}/research`,
        ogImage: `${baseUrl}/dhm-research-featured.jpg`,
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
      };

    case 'compare':
      return {
        title: 'Compare Hangover Pills: Find Your Perfect Supplement',
        description: 'Compare top DHM supplements side-by-side. Unbiased analysis of ingredients, pricing, effectiveness. Save 40% with expert recommendations.',
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
        title: 'DHM Blog: Expert Hangover Prevention Tips & Latest Research',
        description: 'Latest hangover science, DHM research updates, and proven prevention strategies. From college drinking to business travel - expert guides for every lifestyle.',
        keywords: 'DHM blog, hangover prevention blog, dihydromyricetin news, health optimization, supplement research',
        canonicalUrl: `${baseUrl}/never-hungover`,
        ogImage: `${baseUrl}/blog-featured.jpg`,
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
        ogImage: `${baseUrl}/never-hungover-featured.jpg`,
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
      const blogPostUrl = `${baseUrl}/never-hungover/${slug}`;
      
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