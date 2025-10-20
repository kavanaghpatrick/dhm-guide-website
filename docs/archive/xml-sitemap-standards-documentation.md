# XML Sitemap Standards and Requirements Documentation

## Overview

This document provides comprehensive information about XML sitemap standards according to Google's sitemap protocol and Sitemap.org specifications, including format requirements, validation rules, and common errors.

## 1. Basic Protocol Requirements

### XML Declaration and Encoding
- **Required encoding**: UTF-8
- **XML declaration**: `<?xml version="1.0" encoding="UTF-8"?>`
- **Important**: The file must be saved with UTF-8 encoding

### Root Element Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- URL entries go here -->
</urlset>
```

### Required Elements
- `<urlset>`: Root element that encapsulates the sitemap
- `<url>`: Container for each URL entry
- `<loc>`: The actual URL (mandatory within each `<url>` element)

## 2. Google's Sitemap Protocol Requirements

### Size Limitations
- **Maximum file size**: 50MB (52,428,800 bytes) uncompressed
- **Maximum URLs per sitemap**: 50,000 URLs
- **URL length limit**: Less than 2,048 characters
- **Note**: These limits apply to uncompressed files, even if you submit a compressed version

### URL Requirements
- All URLs must be from a single host (e.g., www.example.com or store.example.com)
- URLs must start with the protocol (http:// or https://)
- Only include canonical URLs (not duplicate versions)
- URLs should end with a trailing slash if appropriate

### Google-Specific Updates (2025)
- Google ignores `<priority>` and `<changefreq>` values
- Google only uses `<lastmod>` if it's consistently and verifiably accurate
- Image metadata (captions, titles, licensing) is no longer supported in sitemaps
- Google recommends using both XML sitemaps and RSS/Atom feeds

## 3. Sitemap.org Specifications

### Complete Tag Reference

#### Mandatory Tags:
- `<urlset>`: Must include namespace declaration
- `<url>`: Parent container for each URL
- `<loc>`: The URL location

#### Optional Tags:
- `<lastmod>`: Last modification date
- `<changefreq>`: How frequently the page changes
- `<priority>`: Priority relative to other URLs on your site

## 4. Date Format Requirements (ISO 8601/W3C Datetime)

### Valid Lastmod Formats

#### Date Only Format (YYYY-MM-DD):
```xml
<lastmod>2025-01-29</lastmod>
<lastmod>2024-12-28</lastmod>
<lastmod>2023-06-15</lastmod>
```

#### Date and Time with Timezone (YYYY-MM-DDThh:mm:ssTZD):
```xml
<lastmod>2025-01-29T10:45:00+00:00</lastmod>
<lastmod>2024-12-28T18:00:15-05:00</lastmod>
<lastmod>2023-06-15T14:30:00Z</lastmod>
```

### Important Date Format Rules:
- If time is omitted, it defaults to midnight UTC (00:00:00Z)
- If you specify time, you MUST include the timezone
- When using hours, you must also specify minutes and seconds
- 'Z' suffix denotes zero UTC offset (same as +00:00)
- Timezone format: +hh:mm (ahead of UTC) or -hh:mm (behind UTC)

## 5. Valid Changefreq Values

The `<changefreq>` tag accepts only these specific values:
- `always`
- `hourly`
- `daily`
- `weekly`
- `monthly`
- `yearly`
- `never`

**Note**: Most search engines, including Google and Bing, largely ignore this value.

## 6. Priority Value Range

- **Valid range**: 0.0 to 1.0
- **Default value**: 0.5
- **Purpose**: Indicates relative importance of URLs within your site
- **Note**: Does not affect search ranking; Google ignores this value

### Priority Examples:
```xml
<priority>1.0</priority>   <!-- Highest priority -->
<priority>0.8</priority>   <!-- High priority -->
<priority>0.5</priority>   <!-- Default/medium priority -->
<priority>0.3</priority>   <!-- Low priority -->
<priority>0.0</priority>   <!-- Lowest priority -->
```

## 7. URL Encoding Requirements

### XML Entity Encoding (Required)
All URLs must have these characters entity-escaped:

| Character | XML Entity |
|-----------|------------|
| & | `&amp;` |
| ' | `&#x27;` or `&apos;` |
| " | `&quot;` |
| < | `&lt;` |
| > | `&gt;` |

### Correct URL Examples:
```xml
<!-- Wrong -->
<loc>https://example.com/page?param1=value&param2=value</loc>

<!-- Correct -->
<loc>https://example.com/page?param1=value&amp;param2=value</loc>

<!-- Wrong -->
<loc>https://example.com/products/item<special>name</loc>

<!-- Correct -->
<loc>https://example.com/products/item&lt;special&gt;name</loc>
```

### URL Percent Encoding
Special characters in the URL path or parameters should be percent-encoded:
- Space → %20
- # → %23
- % → %25

## 8. Common Validation Errors

### 1. Unescaped Ampersands
**Error**: Using & instead of &amp; in URLs
```xml
<!-- Error -->
<loc>https://example.com/page?a=1&b=2</loc>

<!-- Correct -->
<loc>https://example.com/page?a=1&amp;b=2</loc>
```

### 2. Invalid Date Format
**Error**: Missing timezone when time is specified
```xml
<!-- Error -->
<lastmod>2025-01-29T10:45:00</lastmod>

<!-- Correct -->
<lastmod>2025-01-29T10:45:00+00:00</lastmod>
```

### 3. Empty URL Tags
**Error**: Empty <loc> tags
```xml
<!-- Error -->
<url>
  <loc></loc>
</url>
```

### 4. Encoding Issues
- File not saved as UTF-8
- Missing UTF-8 declaration
- Special characters not properly encoded

### 5. Size Limit Exceeded
- More than 50,000 URLs in a single sitemap
- File size larger than 50MB

### 6. Invalid Changefreq Values
**Error**: Using custom values
```xml
<!-- Error -->
<changefreq>every-day</changefreq>
<changefreq>twice-daily</changefreq>

<!-- Correct -->
<changefreq>daily</changefreq>
<changefreq>hourly</changefreq>
```

## 9. Complete Sitemap Example

### Single Sitemap Example:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com/</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.example.com/products?category=electronics&amp;sort=price</loc>
    <lastmod>2025-01-28T15:30:00-05:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.example.com/about</loc>
    <lastmod>2024-12-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Sitemap Index Example (for multiple sitemaps):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml</loc>
    <lastmod>2025-01-29T10:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml</loc>
    <lastmod>2025-01-29T10:00:00+00:00</lastmod>
  </sitemap>
</sitemapindex>
```

## 10. Maximum Limits Summary

- **File size**: 50MB uncompressed
- **URLs per sitemap**: 50,000
- **URL length**: 2,048 characters
- **Total sitemaps per index**: No specific limit, but practical considerations apply
- **Nested sitemap indexes**: Not recommended

## Best Practices

1. **Use dynamic sitemaps** that update automatically when content changes
2. **Include lastmod dates** and keep them accurate
3. **Submit only canonical URLs**
4. **Validate your sitemap** before submission
5. **Use sitemap index files** for large sites
6. **Monitor sitemap errors** in Google Search Console
7. **Keep URLs organized** by importance and update frequency
8. **Avoid deprecated features** like image metadata in sitemaps

## Validation Tools

- Google Search Console Sitemaps Report
- XML Sitemap Validators (various online tools)
- W3C Markup Validator for XML syntax
- Direct submission testing in webmaster tools

This documentation reflects the current standards as of 2025, incorporating recent Google updates and industry best practices.