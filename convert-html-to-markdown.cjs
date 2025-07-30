const fs = require('fs').promises;
const path = require('path');

// List of files to convert
const filesToConvert = [
  'activated-charcoal-hangover.json',
  'alcohol-and-immune-system-complete-health-impact-2025.json',
  'smart-social-drinking-your-health-first-strategies-guide-2025.json',
  'is-dhm-safe-science-behind-side-effects-2025.json',
  'holiday-drinking-survival-guide-health-first-approach.json',
  'dhm-vs-zbiotics.json',
  'dhm-vs-prickly-pear-hangovers.json'
];

const postsDir = './src/newblog/data/posts';

// Conversion functions
function convertHtmlToMarkdown(html) {
  let md = html;
  
  // Headers
  md = md.replace(/<h1>(.+?)<\/h1>/g, '# $1');
  md = md.replace(/<h2>(.+?)<\/h2>/g, '## $1');
  md = md.replace(/<h3>(.+?)<\/h3>/g, '### $1');
  md = md.replace(/<h4>(.+?)<\/h4>/g, '#### $1');
  md = md.replace(/<h5>(.+?)<\/h5>/g, '##### $1');
  md = md.replace(/<h6>(.+?)<\/h6>/g, '###### $1');
  
  // Bold
  md = md.replace(/<strong>(.+?)<\/strong>/g, '**$1**');
  
  // Italic
  md = md.replace(/<em>(.+?)<\/em>/g, '*$1*');
  
  // Links - handle both internal and external
  md = md.replace(/<a href="(.+?)">(.+?)<\/a>/g, '[$2]($1)');
  
  // Lists - convert nested structure
  md = md.replace(/<ul>/g, '\n');
  md = md.replace(/<\/ul>/g, '\n');
  md = md.replace(/<ol>/g, '\n');
  md = md.replace(/<\/ol>/g, '\n');
  md = md.replace(/<li>/g, '- ');
  md = md.replace(/<\/li>/g, '');
  
  // Paragraphs
  md = md.replace(/<p>/g, '\n');
  md = md.replace(/<\/p>/g, '\n');
  
  // Blockquotes - special handling for info boxes, pro tips, etc.
  // First, handle blockquotes with headers inside
  md = md.replace(/<blockquote>\s*<h3>(.+?)<\/h3>\s*<p>(.+?)<\/p>\s*<\/blockquote>/gs, (match, title, content) => {
    return `\n> ### ${title}\n> ${content.replace(/\n/g, '\n> ')}\n`;
  });
  
  // Handle blockquotes with lists
  md = md.replace(/<blockquote>\s*<h3>(.+?)<\/h3>\s*<ul>(.+?)<\/ul>\s*<\/blockquote>/gs, (match, title, listContent) => {
    const items = listContent.match(/<li>(.+?)<\/li>/g) || [];
    const mdItems = items.map(item => {
      const text = item.replace(/<li>/, '').replace(/<\/li>/, '');
      return `> - ${text}`;
    }).join('\n');
    return `\n> ### ${title}\n${mdItems}\n`;
  });
  
  // Handle simple blockquotes
  md = md.replace(/<blockquote>\s*<p>(.+?)<\/p>\s*<\/blockquote>/gs, (match, content) => {
    return `\n> ${content.replace(/\n/g, '\n> ')}\n`;
  });
  
  // Handle blockquotes without p tags
  md = md.replace(/<blockquote>(.+?)<\/blockquote>/gs, (match, content) => {
    return `\n> ${content.replace(/\n/g, '\n> ')}\n`;
  });
  
  // Tables - convert to markdown tables
  md = md.replace(/<table[^>]*>(.+?)<\/table>/gs, (match, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>(.+?)<\/tr>/gs) || [];
    let mdTable = '\n';
    
    rows.forEach((row, index) => {
      const cells = row.match(/<t[hd][^>]*>(.+?)<\/t[hd]>/g) || [];
      const mdCells = cells.map(cell => {
        const content = cell.replace(/<t[hd][^>]*>/, '').replace(/<\/t[hd]>/, '');
        return content.replace(/<[^>]+>/g, ''); // Remove any inner HTML
      });
      
      mdTable += '| ' + mdCells.join(' | ') + ' |\n';
      
      // Add separator after header row
      if (index === 0) {
        mdTable += '|' + mdCells.map(() => ' --- ').join('|') + '|\n';
      }
    });
    
    return mdTable + '\n';
  });
  
  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  md = md.trim();
  
  return md;
}

// Main conversion function
async function convertFiles() {
  console.log('Starting HTML to Markdown conversion...\n');
  
  for (const filename of filesToConvert) {
    const filepath = path.join(postsDir, filename);
    
    try {
      // Skip if already in array format
      if (filename === 'activated-charcoal-hangover.json') {
        console.log(`✓ Skipping ${filename} - already in array format`);
        continue;
      }
      
      // Read file
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);
      
      // Check if content is HTML string
      if (typeof data.content === 'string' && data.content.includes('<')) {
        console.log(`Converting ${filename}...`);
        
        // Convert HTML to Markdown
        const markdown = convertHtmlToMarkdown(data.content);
        
        // Update the data
        data.content = markdown;
        
        // Save back to file
        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`✓ Converted ${filename}`);
      } else {
        console.log(`✓ Skipping ${filename} - not HTML format`);
      }
      
    } catch (error) {
      console.error(`✗ Error converting ${filename}:`, error.message);
    }
  }
  
  console.log('\nConversion complete!');
}

// Run the conversion
convertFiles().catch(console.error);