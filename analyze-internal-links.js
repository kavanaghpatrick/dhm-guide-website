import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract links from content
function extractInternalLinks(content) {
    const links = [];
    
    // Regular expressions for different link patterns
    const patterns = [
        // Markdown links: [text](url)
        /\[([^\]]+)\]\(\/blog\/([^)]+)\)/g,
        // HTML links: <a href="/blog/...">
        /<a[^>]+href="\/blog\/([^"]+)"[^>]*>([^<]+)<\/a>/g,
        // CustomLink components
        /<CustomLink[^>]+to="\/blog\/([^"]+)"[^>]*>([^<]+)<\/CustomLink>/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (pattern.source.includes('CustomLink') || pattern.source.includes('<a')) {
                links.push({
                    url: match[1],
                    text: match[2]
                });
            } else {
                links.push({
                    url: match[2],
                    text: match[1]
                });
            }
        }
    });
    
    return links;
}

// Main analysis function
function analyzeInternalLinks() {
    const postsDir = path.join(__dirname, 'src/newblog/data/posts');
    const linkingData = {};
    const allLinks = [];
    const linkMatrix = {};
    
    // Read all JSON files
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json') && !f.includes('backup') && !f.includes('broken'));
    
    files.forEach(file => {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        try {
            const postData = JSON.parse(content);
            const postSlug = file.replace('.json', '');
            
            linkingData[postSlug] = {
                title: postData.title || 'Untitled',
                outgoingLinks: [],
                incomingLinks: []
            };
            
            // Extract links from content
            if (postData.content) {
                const links = extractInternalLinks(postData.content);
                linkingData[postSlug].outgoingLinks = links;
                
                // Track all links for matrix
                links.forEach(link => {
                    allLinks.push({
                        from: postSlug,
                        to: link.url,
                        text: link.text
                    });
                    
                    // Initialize link matrix
                    if (!linkMatrix[postSlug]) linkMatrix[postSlug] = {};
                    if (!linkMatrix[postSlug][link.url]) linkMatrix[postSlug][link.url] = [];
                    linkMatrix[postSlug][link.url].push(link.text);
                });
            }
        } catch (e) {
            console.error(`Error parsing ${file}:`, e.message);
        }
    });
    
    // Calculate incoming links
    allLinks.forEach(link => {
        if (linkingData[link.to]) {
            linkingData[link.to].incomingLinks.push({
                from: link.from,
                text: link.text
            });
        }
    });
    
    // Generate statistics
    const stats = {
        totalPosts: Object.keys(linkingData).length,
        totalLinks: allLinks.length,
        postsWithOutgoingLinks: 0,
        postsWithIncomingLinks: 0,
        postsWithBidirectionalLinks: [],
        orphanedPosts: [],
        mostLinkedTo: [],
        mostLinking: [],
        anchorTextVariations: {}
    };
    
    // Analyze linking patterns
    Object.entries(linkingData).forEach(([slug, data]) => {
        if (data.outgoingLinks.length > 0) stats.postsWithOutgoingLinks++;
        if (data.incomingLinks.length > 0) stats.postsWithIncomingLinks++;
        if (data.outgoingLinks.length === 0 && data.incomingLinks.length === 0) {
            stats.orphanedPosts.push(slug);
        }
        
        // Check for bidirectional links
        data.outgoingLinks.forEach(outLink => {
            const targetPost = linkingData[outLink.url];
            if (targetPost && targetPost.outgoingLinks.some(link => link.url === slug)) {
                const pair = [slug, outLink.url].sort().join(' <-> ');
                if (!stats.postsWithBidirectionalLinks.includes(pair)) {
                    stats.postsWithBidirectionalLinks.push(pair);
                }
            }
        });
        
        // Track anchor text variations
        data.outgoingLinks.forEach(link => {
            if (!stats.anchorTextVariations[link.url]) {
                stats.anchorTextVariations[link.url] = new Set();
            }
            stats.anchorTextVariations[link.url].add(link.text);
        });
    });
    
    // Sort posts by link counts
    const sortedByIncoming = Object.entries(linkingData)
        .map(([slug, data]) => ({ slug, count: data.incomingLinks.length, title: data.title }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    const sortedByOutgoing = Object.entries(linkingData)
        .map(([slug, data]) => ({ slug, count: data.outgoingLinks.length, title: data.title }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    stats.mostLinkedTo = sortedByIncoming;
    stats.mostLinking = sortedByOutgoing;
    
    // Convert anchor text sets to arrays for JSON
    Object.keys(stats.anchorTextVariations).forEach(url => {
        stats.anchorTextVariations[url] = Array.from(stats.anchorTextVariations[url]);
    });
    
    return { linkingData, stats, linkMatrix };
}

// Run analysis
const results = analyzeInternalLinks();

// Save results
fs.writeFileSync('linking-analysis.json', JSON.stringify(results, null, 2));

console.log('Analysis complete. Results saved to linking-analysis.json');
console.log('\nQuick Stats:');
console.log(`Total Posts: ${results.stats.totalPosts}`);
console.log(`Total Internal Links: ${results.stats.totalLinks}`);
console.log(`Posts with Outgoing Links: ${results.stats.postsWithOutgoingLinks}`);
console.log(`Posts with Incoming Links: ${results.stats.postsWithIncomingLinks}`);
console.log(`Bidirectional Link Pairs: ${results.stats.postsWithBidirectionalLinks.length}`);
console.log(`Orphaned Posts: ${results.stats.orphanedPosts.length}`);