#!/usr/bin/env python3
"""
Hero Image Action Plan Generator
Creates prioritized actionable recommendations based on the comprehensive analysis.
"""

import json
from pathlib import Path
from datetime import datetime

def generate_action_plan():
    """Generate prioritized action plan based on analysis"""
    
    # Load the analysis data
    analysis_file = Path("/Users/patrickkavanagh/dhm-guide-website/comprehensive_hero_image_analysis.json")
    with open(analysis_file, 'r') as f:
        data = json.load(f)
    
    missing_images = data['missing_images']
    unused_images = data['unused_images']
    
    action_plan = f"""
# HERO IMAGE ACTION PLAN
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## EXECUTIVE SUMMARY
- **Total Missing Images**: {len(missing_images)}
- **High Priority (15+ Score)**: {len([m for m in missing_images if m['priority_score'] >= 15])}
- **Medium Priority (12-14)**: {len([m for m in missing_images if 12 <= m['priority_score'] < 15])}
- **Low Priority (<12)**: {len([m for m in missing_images if m['priority_score'] < 12])}
- **Unused Images Available**: {len(unused_images)}

## IMMEDIATE ACTION ITEMS (PRIORITY 1)

### Quick Wins - Posts Needing New Image Fields
These posts have NO image field at all - adding any hero image will be an immediate improvement:

"""
    
    # High priority posts with no image field
    no_image_field = [m for m in missing_images if m['missing_type'] == 'no_image_field' and m['priority_score'] >= 15]
    for missing in sorted(no_image_field, key=lambda x: x['priority_score'], reverse=True):
        suggested_filename = f"{missing['post_id']}-hero.webp"
        action_plan += f"""
**{missing['title'][:60]}...**
- File: `{missing['filename']}`
- Priority Score: {missing['priority_score']}
- Action: Add image field with: `/images/{suggested_filename}`
- Generate: {suggested_filename}
"""
    
    action_plan += f"""
### Path Fixes - Existing Images with Wrong Paths
These posts reference images that might exist but with different names:

"""
    
    # Check for potential matches between missing and unused images
    potential_matches = []
    for missing in missing_images:
        if missing['missing_type'] == 'image_not_found':
            expected = missing.get('expected_filename', '')
            for unused in unused_images:
                # Simple matching logic
                if expected and unused:
                    expected_base = expected.lower().replace('-hero', '').replace('.webp', '').replace('.jpg', '')
                    unused_base = unused.lower().replace('-hero', '').replace('.webp', '').replace('.jpg', '')
                    
                    # Check for substring matches
                    if len(expected_base) > 5 and (expected_base in unused_base or unused_base in expected_base):
                        potential_matches.append({
                            'post': missing['post_id'],
                            'expected': expected,
                            'suggested': unused,
                            'priority': missing['priority_score'],
                            'filename': missing['filename']
                        })
                        break
    
    for match in sorted(potential_matches, key=lambda x: x['priority'], reverse=True)[:10]:
        action_plan += f"""
**{match['post']}**
- File: `{match['filename']}`
- Current Path: `/images/{match['expected']}`
- Suggested Fix: Use existing `/images/{match['suggested']}`
- Priority: {match['priority']}
"""
    
    action_plan += f"""
## BATCH GENERATION STRATEGY (PRIORITY 2)

### High-Impact Posts Needing Hero Images
Generate these images first as they're most important for SEO/traffic:

"""
    
    # High priority posts that need image generation
    high_priority_generation = [m for m in missing_images if m['missing_type'] == 'image_not_found' and m['priority_score'] >= 15]
    for missing in sorted(high_priority_generation, key=lambda x: x['priority_score'], reverse=True):
        action_plan += f"""
**{missing['title'][:60]}...**
- Generate: `/images/{missing.get('expected_filename', 'missing-filename')}`
- Priority: {missing['priority_score']}
- Post ID: {missing['post_id']}
"""
    
    action_plan += f"""
### Image Naming Patterns for Consistency
Based on the analysis, follow these naming conventions:

1. **Standard Format**: `post-slug-hero.webp`
2. **Review Posts**: `product-name-review-2025-hero.webp`  
3. **Comparison Posts**: `product-a-vs-product-b-comparison-2025-hero.webp`
4. **Guide Posts**: `topic-complete-guide-2025-hero.webp`

## CONTENT THEMES FOR IMAGE GENERATION

### DHM/Supplement Related ({len([m for m in missing_images if 'dhm' in m['title'].lower()])} posts)
Focus on:
- Supplement bottles and pills
- Before/after scenarios
- Scientific/medical imagery
- Liver protection concepts

### Hangover/Recovery Related ({len([m for m in missing_images if any(word in m['title'].lower() for word in ['hangover', 'recovery', 'relief'])])} posts)
Focus on:
- Person feeling unwell vs recovered
- Timeline/process imagery
- Morning after scenarios
- Relief and wellness themes

### Lifestyle/Professional ({len([m for m in missing_images if any(word in m['title'].lower() for word in ['business', 'professional', 'career', 'work'])])} posts)
Focus on:
- Business/professional settings
- Networking events
- Work-life balance themes
- Success and performance imagery

## REPURPOSING UNUSED IMAGES

### High-Value Unused Images to Repurpose
"""
    
    # Suggest repurposing unused images
    valuable_unused = [img for img in unused_images if 'hero' in img and any(keyword in img.lower() for keyword in ['dhm', 'hangover', 'alcohol', 'liver'])]
    
    for unused in valuable_unused[:15]:
        # Try to match with missing posts
        base_name = unused.lower().replace('-hero', '').replace('.webp', '').replace('.jpg', '')
        matching_posts = [m for m in missing_images if base_name in m['post_id'].lower()]
        
        if matching_posts:
            action_plan += f"""
- **{unused}** → Could be used for: {matching_posts[0]['post_id']}
"""
        else:
            action_plan += f"""
- **{unused}** → Available for general DHM/hangover content
"""
    
    action_plan += f"""
## TECHNICAL IMPLEMENTATION

### Image Specifications
- **Format**: WebP (primary), with JPG fallback
- **Dimensions**: 1200x630px (optimal for social sharing)
- **File Size**: <100KB for fast loading
- **Alt Text**: Descriptive, includes main keywords

### Batch Update Script
```bash
# Update multiple posts with new image paths
for file in src/newblog/data/posts/*.json; do
    # Add image field if missing
    # Update paths to use /images/ prefix
    # Ensure consistent naming
done
```

## MEASUREMENT & TRACKING

### Success Metrics
- Reduce missing image rate from 31.2% to <5%
- Improve Core Web Vitals (LCP) scores
- Increase social sharing engagement
- Monitor SEO impact on image search traffic

### Quality Checklist
- [ ] All high-priority posts have hero images
- [ ] Image paths are consistent (/images/ prefix)
- [ ] Alt text is descriptive and keyword-rich
- [ ] Images load quickly (<2s LCP)
- [ ] Social sharing shows proper image previews

## PRIORITY EXECUTION ORDER

1. **Week 1**: Fix posts with no image field (11 posts)
2. **Week 2**: Generate high-priority missing images (20 posts)
3. **Week 3**: Repurpose unused images for medium priority posts
4. **Week 4**: Generate remaining images and optimize existing ones

Total estimated time: 20-30 hours for complete implementation.
"""
    
    # Save the action plan
    plan_file = Path("/Users/patrickkavanagh/dhm-guide-website/hero_image_action_plan.md")
    with open(plan_file, 'w', encoding='utf-8') as f:
        f.write(action_plan)
    
    print(f"Action plan saved to: {plan_file}")
    return plan_file

if __name__ == "__main__":
    generate_action_plan()