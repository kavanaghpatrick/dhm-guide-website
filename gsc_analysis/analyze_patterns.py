#!/usr/bin/env python3
"""
Analyze GSC data to identify success patterns in top-performing pages.
Focus on content types, topics, CTR, and position correlations.
"""

import csv
import re
from collections import defaultdict
from urllib.parse import urlparse

def parse_percentage(pct_str):
    """Convert '6.56%' to 0.0656"""
    return float(pct_str.strip('%')) / 100

def parse_url_pattern(url):
    """Extract content type and topic from URL"""
    path = urlparse(url).path

    # Identify content type
    if '/compare' in path:
        content_type = 'comparison-tool'
    elif 'calculator' in path:
        content_type = 'calculator'
    elif '/reviews' in path and path.count('/') == 1:
        content_type = 'reviews-hub'
    elif '/research' in path and path.count('/') == 1:
        content_type = 'research-hub'
    elif '-review-' in path:
        content_type = 'review'
    elif '-comparison-' in path or '-vs-' in path:
        content_type = 'comparison'
    elif '-guide-' in path or 'complete-guide' in path:
        content_type = 'guide'
    elif path == '/' or path == '':
        content_type = 'homepage'
    else:
        content_type = 'article'

    # Extract topic keywords
    topics = []
    if 'dosage' in path:
        topics.append('dosage')
    if any(word in path for word in ['timing', 'when-to-take']):
        topics.append('timing')
    if any(word in path for word in ['safety', 'side-effects', 'long-term']):
        topics.append('safety')
    if any(word in path for word in ['liver', 'nac', 'milk-thistle']):
        topics.append('liver-health')
    if 'asian-flush' in path:
        topics.append('asian-flush')
    if 'hangover' in path and 'how-long' in path:
        topics.append('hangover-duration')
    if any(brand in path for brand in ['flyby', 'cheers', 'no-days-wasted', 'double-wood',
                                        'dhm1000', 'fuller-health', 'toniiq', 'zbiotics',
                                        'nusapure', 'dhm-depot', 'good-morning']):
        topics.append('product-specific')

    return content_type, topics

def analyze_pages():
    """Analyze Pages.csv for patterns"""

    pages = []
    with open('/Users/patrickkavanagh/dhm-guide-website/gsc_analysis/Pages.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip if no clicks
            clicks = int(row['Clicks'])
            if clicks == 0:
                continue

            impressions = int(row['Impressions'])
            ctr = parse_percentage(row['CTR'])
            position = float(row['Position'])
            url = row['Top pages']

            content_type, topics = parse_url_pattern(url)

            pages.append({
                'url': url,
                'clicks': clicks,
                'impressions': impressions,
                'ctr': ctr,
                'position': position,
                'content_type': content_type,
                'topics': topics
            })

    return pages

def analyze_queries():
    """Analyze Queries.csv for patterns"""

    queries = []
    with open('/Users/patrickkavanagh/dhm-guide-website/gsc_analysis/Queries.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            clicks = int(row['Clicks'])
            if clicks == 0:
                continue

            impressions = int(row['Impressions'])
            ctr = parse_percentage(row['CTR'])
            position = float(row['Position'])
            query = row['Top queries']

            # Categorize query intent
            query_lower = query.lower()
            if any(word in query_lower for word in ['how much', 'dosage', 'dose']):
                intent = 'dosage'
            elif any(word in query_lower for word in ['when', 'timing', 'before or after']):
                intent = 'timing'
            elif any(word in query_lower for word in ['review', 'reviews']):
                intent = 'reviews'
            elif ' vs ' in query_lower:
                intent = 'comparison'
            elif any(word in query_lower for word in ['best', 'top']):
                intent = 'best-of'
            elif any(word in query_lower for word in ['side effects', 'safe', 'daily']):
                intent = 'safety'
            else:
                intent = 'informational'

            queries.append({
                'query': query,
                'clicks': clicks,
                'impressions': impressions,
                'ctr': ctr,
                'position': position,
                'intent': intent
            })

    return queries

def main():
    pages = analyze_pages()
    queries = analyze_queries()

    print("=" * 80)
    print("GSC SUCCESS PATTERN ANALYSIS")
    print("=" * 80)
    print()

    # Sort pages by clicks
    pages_by_clicks = sorted(pages, key=lambda x: x['clicks'], reverse=True)

    # 1. CONTENT TYPE ANALYSIS
    print("1. CONTENT TYPE PERFORMANCE")
    print("-" * 80)

    type_stats = defaultdict(lambda: {'clicks': 0, 'impressions': 0, 'pages': 0, 'avg_ctr': [], 'avg_position': []})
    for page in pages:
        ct = page['content_type']
        type_stats[ct]['clicks'] += page['clicks']
        type_stats[ct]['impressions'] += page['impressions']
        type_stats[ct]['pages'] += 1
        type_stats[ct]['avg_ctr'].append(page['ctr'])
        type_stats[ct]['avg_position'].append(page['position'])

    # Calculate averages and sort by clicks
    type_summary = []
    for ct, stats in type_stats.items():
        avg_ctr = sum(stats['avg_ctr']) / len(stats['avg_ctr'])
        avg_position = sum(stats['avg_position']) / len(stats['avg_position'])
        clicks_per_page = stats['clicks'] / stats['pages']
        type_summary.append({
            'type': ct,
            'total_clicks': stats['clicks'],
            'pages': stats['pages'],
            'clicks_per_page': clicks_per_page,
            'avg_ctr': avg_ctr,
            'avg_position': avg_position,
            'impressions': stats['impressions']
        })

    type_summary.sort(key=lambda x: x['total_clicks'], reverse=True)

    for ts in type_summary:
        print(f"{ts['type']:20} | {ts['total_clicks']:3} clicks ({ts['pages']:2} pages, {ts['clicks_per_page']:.1f} avg) | "
              f"CTR: {ts['avg_ctr']:.2%} | Pos: {ts['avg_position']:.1f}")

    print()

    # 2. TOPIC ANALYSIS
    print("2. TOP TOPIC PERFORMANCE (with clicks)")
    print("-" * 80)

    topic_stats = defaultdict(lambda: {'clicks': 0, 'pages': 0, 'avg_ctr': [], 'avg_position': []})
    for page in pages:
        for topic in page['topics']:
            topic_stats[topic]['clicks'] += page['clicks']
            topic_stats[topic]['pages'] += 1
            topic_stats[topic]['avg_ctr'].append(page['ctr'])
            topic_stats[topic]['avg_position'].append(page['position'])

    topic_summary = []
    for topic, stats in topic_stats.items():
        avg_ctr = sum(stats['avg_ctr']) / len(stats['avg_ctr'])
        avg_position = sum(stats['avg_position']) / len(stats['avg_position'])
        topic_summary.append({
            'topic': topic,
            'clicks': stats['clicks'],
            'pages': stats['pages'],
            'avg_ctr': avg_ctr,
            'avg_position': avg_position
        })

    topic_summary.sort(key=lambda x: x['clicks'], reverse=True)

    for ts in topic_summary:
        print(f"{ts['topic']:20} | {ts['clicks']:3} clicks ({ts['pages']:2} pages) | "
              f"CTR: {ts['avg_ctr']:.2%} | Pos: {ts['avg_position']:.1f}")

    print()

    # 3. QUERY INTENT ANALYSIS
    print("3. QUERY INTENT PERFORMANCE")
    print("-" * 80)

    intent_stats = defaultdict(lambda: {'clicks': 0, 'queries': 0, 'avg_ctr': [], 'avg_position': []})
    for query in queries:
        intent = query['intent']
        intent_stats[intent]['clicks'] += query['clicks']
        intent_stats[intent]['queries'] += 1
        intent_stats[intent]['avg_ctr'].append(query['ctr'])
        intent_stats[intent]['avg_position'].append(query['position'])

    intent_summary = []
    for intent, stats in intent_stats.items():
        avg_ctr = sum(stats['avg_ctr']) / len(stats['avg_ctr'])
        avg_position = sum(stats['avg_position']) / len(stats['avg_position'])
        intent_summary.append({
            'intent': intent,
            'clicks': stats['clicks'],
            'queries': stats['queries'],
            'avg_ctr': avg_ctr,
            'avg_position': avg_position
        })

    intent_summary.sort(key=lambda x: x['clicks'], reverse=True)

    for isummary in intent_summary:
        print(f"{isummary['intent']:20} | {isummary['clicks']:3} clicks ({isummary['queries']:2} queries) | "
              f"CTR: {isummary['avg_ctr']:.2%} | Pos: {isummary['avg_position']:.1f}")

    print()

    # 4. POSITION vs CTR CORRELATION
    print("4. POSITION RANGE vs CTR PERFORMANCE")
    print("-" * 80)

    position_buckets = {
        '1-3': [],
        '4-7': [],
        '8-10': [],
        '11-20': [],
        '21+': []
    }

    for page in pages:
        pos = page['position']
        if pos <= 3:
            bucket = '1-3'
        elif pos <= 7:
            bucket = '4-7'
        elif pos <= 10:
            bucket = '8-10'
        elif pos <= 20:
            bucket = '11-20'
        else:
            bucket = '21+'

        position_buckets[bucket].append(page)

    for bucket_name in ['1-3', '4-7', '8-10', '11-20', '21+']:
        bucket_pages = position_buckets[bucket_name]
        if not bucket_pages:
            continue

        total_clicks = sum(p['clicks'] for p in bucket_pages)
        total_impressions = sum(p['impressions'] for p in bucket_pages)
        avg_ctr = sum(p['ctr'] for p in bucket_pages) / len(bucket_pages)
        avg_position = sum(p['position'] for p in bucket_pages) / len(bucket_pages)

        print(f"Position {bucket_name:6} | {len(bucket_pages):2} pages | {total_clicks:3} clicks | "
              f"CTR: {avg_ctr:.2%} | Avg Pos: {avg_position:.1f}")

    print()

    # 5. TOP 20 PAGE DETAILS
    print("5. TOP 20 PAGES BY CLICKS (Pattern Analysis)")
    print("-" * 80)

    for i, page in enumerate(pages_by_clicks[:20], 1):
        url_path = urlparse(page['url']).path
        # Extract last part of URL for readability
        page_name = url_path.split('/')[-1] or 'homepage'
        if len(page_name) > 50:
            page_name = page_name[:47] + '...'

        topics_str = ', '.join(page['topics']) if page['topics'] else 'general'

        print(f"{i:2}. {page['clicks']:3} clicks | {page['content_type']:18} | {page['ctr']:.2%} CTR | "
              f"Pos {page['position']:.1f} | {topics_str}")
        print(f"    {page_name}")

    print()

    # 6. HIGH CTR WINNERS (>5% CTR)
    print("6. HIGH CTR PAGES (>5% CTR)")
    print("-" * 80)

    high_ctr_pages = [p for p in pages if p['ctr'] > 0.05]
    high_ctr_pages.sort(key=lambda x: x['ctr'], reverse=True)

    for page in high_ctr_pages:
        url_path = urlparse(page['url']).path
        page_name = url_path.split('/')[-1] or 'homepage'
        if len(page_name) > 60:
            page_name = page_name[:57] + '...'

        print(f"{page['ctr']:.2%} CTR | {page['clicks']:2} clicks | Pos {page['position']:.1f} | "
              f"{page['content_type']:18} | {page_name}")

    print()

    # 7. TOP QUERIES
    print("7. TOP QUERIES BY CLICKS")
    print("-" * 80)

    queries_by_clicks = sorted(queries, key=lambda x: x['clicks'], reverse=True)
    for i, query in enumerate(queries_by_clicks[:15], 1):
        print(f"{i:2}. {query['clicks']:2} clicks | {query['ctr']:.2%} CTR | Pos {query['position']:.1f} | "
              f"{query['intent']:15} | {query['query']}")

    print()

    # 8. KEY INSIGHTS SUMMARY
    print("=" * 80)
    print("KEY INSIGHTS")
    print("=" * 80)

    # Find highest performing content type by clicks per page
    best_type = max(type_summary, key=lambda x: x['clicks_per_page'])
    print(f"1. Best Content Type: {best_type['type']} ({best_type['clicks_per_page']:.1f} clicks/page avg)")

    # Find best topic
    if topic_summary:
        best_topic = topic_summary[0]
        print(f"2. Best Topic: {best_topic['topic']} ({best_topic['clicks']} total clicks across {best_topic['pages']} pages)")

    # Find best query intent
    best_intent = intent_summary[0]
    print(f"3. Best Query Intent: {best_intent['intent']} ({best_intent['clicks']} total clicks)")

    # Best position range
    best_bucket = max(
        [(name, bucket) for name, bucket in position_buckets.items() if bucket],
        key=lambda x: sum(p['clicks'] for p in x[1])
    )
    bucket_clicks = sum(p['clicks'] for p in best_bucket[1])
    print(f"4. Best Position Range: {best_bucket[0]} ({bucket_clicks} total clicks, {len(best_bucket[1])} pages)")

    # High CTR pattern
    avg_high_ctr_pos = sum(p['position'] for p in high_ctr_pages) / len(high_ctr_pages) if high_ctr_pages else 0
    print(f"5. High CTR Pattern: {len(high_ctr_pages)} pages with >5% CTR, avg position {avg_high_ctr_pos:.1f}")

    print()

if __name__ == '__main__':
    main()
