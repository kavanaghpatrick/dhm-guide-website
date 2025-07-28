#!/usr/bin/env python3

import json
import os

# Read the metadata file
with open('src/newblog/data/metadata/index.json', 'r') as f:
    data = json.load(f)

# Target posts to check - expanded list of recent 2025 posts
target_posts = [
    'advanced-liver-detox-science-vs-marketing-myths-2025',
    'alcohol-aging-longevity-2025',
    'alcohol-and-anxiety-breaking-the-cycle-naturally-2025',
    'alcohol-and-heart-health-complete-cardiovascular-guide-2025',
    'alcohol-and-immune-system-complete-health-impact-2025',
    'alcohol-and-inflammation-complete-health-impact-guide-2025',
    'alcohol-and-rem-sleep-complete-scientific-analysis-2025',
    'alcohol-athletic-performance-complete-impact-analysis-2025',
    'alcohol-brain-health-2025',
    'alcohol-digestive-health-gi-impact-guide-2025',
    'alcohol-eye-health-complete-vision-impact-guide-2025',
    'alcohol-fertility-reproductive-health-guide-2025',
    'alcohol-recovery-nutrition-complete-healing-protocol-2025',
    'alcohol-skin-health-anti-aging-impact-analysis-2025',
    'alcohol-weight-loss-metabolic-guide-2025',
    'business-travel-alcohol-executive-health-guide-2025',
    'cold-therapy-alcohol-recovery-guide-2025',
    'dhm-availability-worldwide-guide-2025',
    'functional-medicine-hangover-prevention-2025',
    'hangxiety-2025-dhm-prevents-post-drinking-anxiety',
    'holiday-drinking-survival-guide-health-first-approach',
    'nad-alcohol-cellular-energy-recovery-2025',
    'post-dry-january-smart-drinking-strategies-2025',
    'smart-social-drinking-your-health-first-strategies-guide-2025',
    'viral-hangover-cures-tested-science-2025',
    'zebra-striping-drinking-trend-2025',
    'why-women-get-hangovers-worse-than-men-science-explained-2025'
]

print('Post Analysis for Hero Images:')
print('=' * 50)

missing_images = []
found_images = []

for post in data:
    if post['slug'] in target_posts:
        title = post['title']
        slug = post['slug']
        image_path = post.get('image', 'NO IMAGE SPECIFIED')
        
        if image_path != 'NO IMAGE SPECIFIED':
            # Check if file exists
            full_path = 'public' + image_path
            exists = os.path.exists(full_path)
            
            if exists:
                size = os.path.getsize(full_path)
                status = f'EXISTS ({size} bytes)'
                found_images.append({
                    'title': title,
                    'slug': slug,
                    'image_path': image_path,
                    'size': size
                })
            else:
                status = 'MISSING'
                missing_images.append({
                    'title': title,
                    'slug': slug,
                    'image_path': image_path
                })
        else:
            status = 'NO PATH SPECIFIED'
            missing_images.append({
                'title': title,
                'slug': slug,
                'image_path': 'NO PATH SPECIFIED'
            })
        
        print(f'Title: {title}')
        print(f'Slug: {slug}')
        print(f'Image Path: {image_path}')
        print(f'Status: {status}')
        print('-' * 40)

print('\n\nSUMMARY:')
print('=' * 50)
print(f'Total posts checked: {len(target_posts)}')
print(f'Missing images: {len(missing_images)}')
print(f'Found images: {len(found_images)}')

if missing_images:
    print('\nMISSING IMAGES:')
    for img in missing_images:
        print(f'- {img["slug"]}: {img["image_path"]}')

if found_images:
    print('\nFOUND IMAGES:')
    for img in found_images:
        print(f'- {img["slug"]}: {img["image_path"]} ({img["size"]} bytes)')