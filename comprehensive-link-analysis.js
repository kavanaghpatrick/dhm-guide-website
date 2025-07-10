import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract ALL types of links
function extractAllLinks(content) {
    const links = {
        internal: [],
        mainPages: [],
        external: []
    };
    
    // Patterns for different link types
    const patterns = [
        // Markdown links: [text](url)
        /\[([^\]]+)\]\(([^)]+)\)/g,
        // HTML links: <a href="url">
        /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
        // CustomLink components
        /<CustomLink[^>]+to="([^"]+)"[^>]*>([^<]+)<\/CustomLink>/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        const contentCopy = content;
        pattern.lastIndex = 0;
        
        while ((match = pattern.exec(contentCopy)) !== null) {
            let url, text;
            
            if (pattern.source.includes('CustomLink')) {
                url = match[1];
                text = match[2];
            } else if (pattern.source.includes('<a')) {
                url = match[1];
                text = match[2];
            } else {
                text = match[1];
                url = match[2];
            }
            
            // Categorize links
            if (url.startsWith('/blog/')) {
                links.internal.push({ url: url.replace('/blog/', ''), text });
            } else if (url.match(/^\/(guide|compare|research|reviews|dosage-calculator)/)) {
                links.mainPages.push({ url, text, page: url.split('/')[1] });
            } else if (url.startsWith('http')) {
                links.external.push({ url, text });
            }
        }
    });
    
    return links;
}

// Main analysis function
function comprehensiveLinkAnalysis() {
    const postsDir = path.join(__dirname, 'src/newblog/data/posts');
    const results = {
        posts: {},
        statistics: {
            totalPosts: 0,
            totalInternalLinks: 0,
            totalMainPageLinks: 0,
            totalExternalLinks: 0,
            postsWithInternalLinks: 0,
            postsWithMainPageLinks: 0,
            postsWithNoLinks: 0,
            averageLinksPerPost: 0,
            linkDistribution: {
                guide: 0,
                compare: 0,
                research: 0,
                reviews: 0,
                calculator: 0
            }
        },
        linkingMatrix: {},
        bidirectionalPairs: [],
        orphanedPosts: [],
        anchorTextAnalysis: {},
        topLinkedPosts: [],
        topLinkingPosts: []
    };
    
    // Read all JSON files
    const files = fs.readdirSync(postsDir).filter(f => 
        f.endsWith('.json') && 
        !f.includes('backup') && 
        !f.includes('broken') &&
        !f.includes('original')
    );
    
    // First pass: Extract all links
    files.forEach(file => {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        try {
            const postData = JSON.parse(content);
            const postSlug = file.replace('.json', '');
            
            const links = extractAllLinks(postData.content || '');
            
            results.posts[postSlug] = {
                title: postData.title || 'Untitled',
                date: postData.date,
                links: links,
                incomingLinks: []
            };
            
            // Update statistics
            results.statistics.totalPosts++;
            results.statistics.totalInternalLinks += links.internal.length;
            results.statistics.totalMainPageLinks += links.mainPages.length;
            results.statistics.totalExternalLinks += links.external.length;
            
            if (links.internal.length > 0) results.statistics.postsWithInternalLinks++;
            if (links.mainPages.length > 0) results.statistics.postsWithMainPageLinks++;
            if (links.internal.length === 0 && links.mainPages.length === 0) {
                results.statistics.postsWithNoLinks++;
                results.orphanedPosts.push({
                    slug: postSlug,
                    title: postData.title
                });
            }
            
            // Count main page links
            links.mainPages.forEach(link => {
                if (results.statistics.linkDistribution[link.page]) {
                    results.statistics.linkDistribution[link.page]++;
                } else if (link.page === 'dosage-calculator') {
                    results.statistics.linkDistribution.calculator++;
                }
            });
            
            // Build linking matrix
            links.internal.forEach(link => {
                if (!results.linkingMatrix[postSlug]) {
                    results.linkingMatrix[postSlug] = {};
                }
                if (!results.linkingMatrix[postSlug][link.url]) {
                    results.linkingMatrix[postSlug][link.url] = [];
                }
                results.linkingMatrix[postSlug][link.url].push(link.text);
                
                // Track anchor text
                if (!results.anchorTextAnalysis[link.url]) {
                    results.anchorTextAnalysis[link.url] = {};
                }
                if (!results.anchorTextAnalysis[link.url][link.text]) {
                    results.anchorTextAnalysis[link.url][link.text] = 0;
                }
                results.anchorTextAnalysis[link.url][link.text]++;
            });
            
        } catch (e) {
            console.error(`Error parsing ${file}:`, e.message);
        }
    });
    
    // Second pass: Calculate incoming links and bidirectional pairs
    Object.entries(results.linkingMatrix).forEach(([fromSlug, targets]) => {
        Object.entries(targets).forEach(([toSlug, anchorTexts]) => {
            if (results.posts[toSlug]) {
                results.posts[toSlug].incomingLinks.push({
                    from: fromSlug,
                    anchorTexts: anchorTexts
                });
                
                // Check for bidirectional links
                if (results.linkingMatrix[toSlug] && results.linkingMatrix[toSlug][fromSlug]) {
                    const pair = [fromSlug, toSlug].sort().join(' <-> ');
                    if (!results.bidirectionalPairs.includes(pair)) {
                        results.bidirectionalPairs.push(pair);
                    }
                }
            }
        });
    });
    
    // Calculate averages and rankings
    results.statistics.averageLinksPerPost = 
        (results.statistics.totalInternalLinks + results.statistics.totalMainPageLinks) / 
        results.statistics.totalPosts;
    
    // Top linked posts (most incoming links)
    results.topLinkedPosts = Object.entries(results.posts)
        .map(([slug, data]) => ({
            slug,
            title: data.title,
            incomingCount: data.incomingLinks.length
        }))
        .sort((a, b) => b.incomingCount - a.incomingCount)
        .slice(0, 15);
    
    // Top linking posts (most outgoing links)
    results.topLinkingPosts = Object.entries(results.posts)
        .map(([slug, data]) => ({
            slug,
            title: data.title,
            outgoingCount: data.links.internal.length + data.links.mainPages.length
        }))
        .sort((a, b) => b.outgoingCount - a.outgoingCount)
        .slice(0, 15);
    
    return results;
}

// Generate visual link map
function generateLinkMap(results) {
    let map = '# Visual Link Map\\n\\n';
    map += '## Posts with Most Connections\\n\\n';
    
    results.topLinkingPosts.slice(0, 10).forEach(post => {
        if (post.outgoingCount > 0) {
            map += `### ${post.title}\\n`;
            map += `**Slug**: ${post.slug}\\n`;
            map += `**Total Outgoing Links**: ${post.outgoingCount}\\n\\n`;
            
            const postData = results.posts[post.slug];
            if (postData.links.internal.length > 0) {
                map += '**Internal Blog Links**:\\n';
                postData.links.internal.forEach(link => {
                    map += `- [${link.text}] → ${link.url}\\n`;
                });
                map += '\\n';
            }
            
            if (postData.links.mainPages.length > 0) {
                map += '**Main Page Links**:\\n';
                postData.links.mainPages.forEach(link => {
                    map += `- [${link.text}] → ${link.url}\\n`;
                });
                map += '\\n';
            }
        }
    });
    
    return map;
}

// Run analysis
console.log('Starting comprehensive link analysis...');
const results = comprehensiveLinkAnalysis();

// Save detailed results
fs.writeFileSync('comprehensive-link-analysis.json', JSON.stringify(results, null, 2));

// Generate summary report
const report = `# Comprehensive Internal Linking Analysis

## Summary Statistics
- **Total Posts**: ${results.statistics.totalPosts}
- **Total Internal Blog Links**: ${results.statistics.totalInternalLinks}
- **Total Main Page Links**: ${results.statistics.totalMainPageLinks}
- **Total External Links**: ${results.statistics.totalExternalLinks}
- **Posts with Internal Links**: ${results.statistics.postsWithInternalLinks}
- **Posts with Main Page Links**: ${results.statistics.postsWithMainPageLinks}
- **Posts with No Links**: ${results.statistics.postsWithNoLinks}
- **Average Links per Post**: ${results.statistics.averageLinksPerPost.toFixed(2)}
- **Bidirectional Link Pairs**: ${results.bidirectionalPairs.length}

## Main Page Link Distribution
- Guide: ${results.statistics.linkDistribution.guide}
- Compare: ${results.statistics.linkDistribution.compare}
- Research: ${results.statistics.linkDistribution.research}
- Reviews: ${results.statistics.linkDistribution.reviews}
- Calculator: ${results.statistics.linkDistribution.calculator}

## Top 10 Most Linked Posts
${results.topLinkedPosts.slice(0, 10).map((post, i) => 
    `${i + 1}. **${post.title}** (${post.incomingCount} incoming links)`
).join('\\n')}

## Top 10 Posts with Most Outgoing Links
${results.topLinkingPosts.slice(0, 10).map((post, i) => 
    `${i + 1}. **${post.title}** (${post.outgoingCount} links)`
).join('\\n')}

## Orphaned Posts (No Links)
${results.orphanedPosts.slice(0, 20).map(post => 
    `- ${post.title}`
).join('\\n')}
${results.orphanedPosts.length > 20 ? `\\n... and ${results.orphanedPosts.length - 20} more` : ''}

${generateLinkMap(results)}
`;

fs.writeFileSync('link-analysis-summary.md', report);

console.log('Analysis complete!');
console.log(`Total Internal Links: ${results.statistics.totalInternalLinks}`);
console.log(`Average Links per Post: ${results.statistics.averageLinksPerPost.toFixed(2)}`);
console.log(`Orphaned Posts: ${results.orphanedPosts.length}`);