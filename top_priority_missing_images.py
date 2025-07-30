#!/usr/bin/env python3
"""
Top Priority Missing Images List
Creates a specific list of the most critical missing images with exact specifications.
"""

import json
from pathlib import Path

def create_priority_list():
    """Create a prioritized list of missing images to generate"""
    
    # Load analysis data
    analysis_file = Path("/Users/patrickkavanagh/dhm-guide-website/comprehensive_hero_image_analysis.json")
    with open(analysis_file, 'r') as f:
        data = json.load(f)
    
    missing_images = data['missing_images']
    
    # Get top 20 highest priority missing images
    top_priority = sorted(missing_images, key=lambda x: x['priority_score'], reverse=True)[:20]
    
    priority_list = """# TOP 20 PRIORITY MISSING HERO IMAGES

Generate these images first for maximum SEO and user experience impact:

| Priority | Post Title | Filename | Suggested Image Name | Content Theme |
|----------|------------|----------|---------------------|---------------|
"""
    
    for i, missing in enumerate(top_priority, 1):
        title = missing['title'][:50] + "..." if len(missing['title']) > 50 else missing['title']
        
        # Determine content theme based on title
        title_lower = missing['title'].lower()
        if 'dhm' in title_lower or 'supplement' in title_lower:
            theme = "DHM/Supplement"
        elif 'hangover' in title_lower or 'recovery' in title_lower:
            theme = "Hangover/Recovery"
        elif any(word in title_lower for word in ['business', 'professional', 'career']):
            theme = "Professional/Business"
        elif 'review' in title_lower or 'comparison' in title_lower:
            theme = "Product Review"
        else:
            theme = "Health/Wellness"
        
        # Determine suggested filename
        if missing['missing_type'] == 'no_image_field':
            suggested_name = f"{missing['post_id']}-hero.webp"
        elif missing['missing_type'] == 'image_not_found':
            suggested_name = missing.get('expected_filename', f"{missing['post_id']}-hero.webp")
        else:
            suggested_name = f"{missing['post_id']}-hero.webp"
        
        priority_list += f"| {i} | {title} | {missing['filename']} | {suggested_name} | {theme} |\n"
    
    priority_list += f"""
## DETAILED SPECIFICATIONS FOR TOP 5

### 1. {top_priority[0]['title'][:60]}...
- **File**: `/images/{f"{top_priority[0]['post_id']}-hero.webp" if top_priority[0]['missing_type'] == 'no_image_field' else top_priority[0].get('expected_filename', f"{top_priority[0]['post_id']}-hero.webp")}`
- **Dimensions**: 1200x630px
- **Theme**: DHM supplement guide with Japanese raisin tree imagery
- **Visual Elements**: 
  - DHM supplement bottles/pills
  - Japanese raisin tree or botanical elements
  - Scientific/medical design aesthetic
  - Text overlay: "Complete DHM Guide"
- **Color Scheme**: Professional medical (blues, greens, white)
- **Alt Text**: "DHM dihydromyricetin complete guide Japanese raisin tree extract hangover prevention"

### 2. {top_priority[1]['title'][:60]}...
- **File**: `/images/{f"{top_priority[1]['post_id']}-hero.webp" if top_priority[1]['missing_type'] == 'no_image_field' else top_priority[1].get('expected_filename', f"{top_priority[1]['post_id']}-hero.webp")}`
- **Dimensions**: 1200x630px
- **Theme**: Hangover duration timeline/recovery process
- **Visual Elements**:
  - Timeline showing hangover progression
  - Clock or time-based imagery
  - Before/during/after hangover states
  - Text overlay: "How Long Does a Hangover Last?"
- **Color Scheme**: Timeline colors (red to yellow to green)
- **Alt Text**: "How long does hangover last duration timeline complete guide 2025"

### 3. {top_priority[2]['title'][:60]}...
- **File**: `/images/{f"{top_priority[2]['post_id']}-hero.webp" if top_priority[2]['missing_type'] == 'no_image_field' else top_priority[2].get('expected_filename', f"{top_priority[2]['post_id']}-hero.webp")}`
- **Dimensions**: 1200x630px
- **Theme**: Summer drinking safety with DHM protection
- **Visual Elements**:
  - Summer setting (beach, pool, outdoor party)
  - DHM supplement with sun/summer imagery
  - Safety/protection visual metaphors
  - Text overlay: "Summer DHM Safety Guide"
- **Color Scheme**: Summer colors (bright blues, yellows, oranges)
- **Alt Text**: "Summer alcohol consumption DHM safety guide 2025 hangover prevention"

### 4. {top_priority[3]['title'][:60]}...
- **File**: `/images/{f"{top_priority[3]['post_id']}-hero.webp" if top_priority[3]['missing_type'] == 'no_image_field' else top_priority[3].get('expected_filename', f"{top_priority[3]['post_id']}-hero.webp")}`
- **Dimensions**: 1200x630px
- **Theme**: Hangover recovery process and solutions
- **Visual Elements**:
  - Person in recovery stages (sick → better → healthy)
  - Recovery methods/supplements
  - Upward arrow or progress indicators
  - Text overlay: "Complete Recovery Guide"
- **Color Scheme**: Recovery progression (dark to bright)
- **Alt Text**: "How to get over hangover complete recovery guide 2025 fast relief"

### 5. {top_priority[4]['title'][:60]}...
- **File**: `/images/{f"{top_priority[4]['post_id']}-hero.webp" if top_priority[4]['missing_type'] == 'no_image_field' else top_priority[4].get('expected_filename', f"{top_priority[4]['post_id']}-hero.webp")}`
- **Dimensions**: 1200x630px
- **Theme**: Product review with Amazon customer feedback
- **Visual Elements**:
  - NusaPure DHM product bottle/packaging
  - 5-star rating system or customer testimonials
  - Amazon-style review interface elements
  - Text overlay: "89+ Customer Reviews"
- **Color Scheme**: Amazon-inspired (orange accents, professional)
- **Alt Text**: "NusaPure DHM review analysis Amazon customers budget hangover supplement"

## CONTENT CREATION GUIDELINES

### DHM/Supplement Images
- Always include supplement bottles, pills, or packaging
- Use medical/scientific color schemes (blues, greens, whites)
- Include liver protection imagery when relevant
- Add trust signals (clinical studies, certifications)

### Review Images
- Feature the actual product prominently
- Include rating systems or customer testimonial elements
- Use brand colors when appropriate
- Add "Review" or "Analysis" text overlays

### Guide/Educational Images
- Use infographic-style layouts
- Include step-by-step or timeline elements
- Add educational icons or symbols
- Use clear, readable typography

### Technical Requirements
- **Format**: WebP with JPG fallback
- **Size**: Under 100KB for fast loading
- **Dimensions**: 1200x630px (1.91:1 ratio)
- **Text**: Readable at small sizes
- **Brand**: Consistent with site design
- **SEO**: Descriptive filenames and alt text
"""
    
    # Save the priority list
    priority_file = Path("/Users/patrickkavanagh/dhm-guide-website/top_priority_missing_images.md")
    with open(priority_file, 'w', encoding='utf-8') as f:
        f.write(priority_list)
    
    print(f"Priority list saved to: {priority_file}")
    print(f"Top {len(top_priority)} priority images identified")
    
    return priority_file

if __name__ == "__main__":
    create_priority_list()