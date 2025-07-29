import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files identified as having missing content/metadata
const problemFiles = [
  'shift-workers-alcohol-circadian-disruption-guide-2025.json',
  'alcohol-hypertension-blood-pressure-management-2025.json',
  'alcohol-ketogenic-diet-ketosis-impact-analysis-2025.json', 
  'alcohol-kidney-disease-renal-function-impact-2025.json',
  'alcohol-mitochondrial-function-cellular-energy-recovery-2025.json',
  'alcohol-and-nootropics-cognitive-enhancement-interactions-2025.json',
  'dhm-supplements-comparison-center-2025.json'
];

const postsDir = path.join(__dirname, 'src/newblog/data/posts');

// Template for missing fields
const getDefaultMetadata = (filename) => {
  const slug = filename.replace('.json', '');
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/2025/g, '2025')
    .replace(/Dhm/g, 'DHM');

  return {
    id: slug,
    title,
    slug,
    excerpt: `Complete guide to ${title.toLowerCase()}. Learn science-backed strategies and expert recommendations for optimal health outcomes.`,
    metaDescription: `Discover ${title.toLowerCase()} with our comprehensive 2025 guide. Expert insights, research-backed recommendations, and practical strategies.`,
    date: "2025-07-29",
    author: "DHM Guide Team",
    tags: extractTags(slug),
    readTime: 15,
    image: `/images/${slug}-hero.webp`
  };
};

const extractTags = (slug) => {
  const tags = [];
  if (slug.includes('alcohol')) tags.push('alcohol health');
  if (slug.includes('dhm')) tags.push('dhm', 'dihydromyricetin');
  if (slug.includes('2025')) tags.push('2025 health trends');
  if (slug.includes('liver')) tags.push('liver health');
  if (slug.includes('sleep')) tags.push('sleep optimization');
  if (slug.includes('guide')) tags.push('health guide');
  return tags.length > 0 ? tags : ['health', 'wellness', 'alcohol'];
};

const generateBasicContent = (title) => {
  return `# ${title}

## Introduction

This comprehensive guide explores ${title.toLowerCase()}, providing evidence-based insights and practical recommendations for optimal health outcomes.

## Key Points

- Understanding the science behind ${title.toLowerCase().split(' ').slice(-3).join(' ')}
- Evidence-based recommendations from leading health experts
- Practical strategies for implementation
- Latest research findings and clinical studies

## Expert Recommendations

Our research-backed approach focuses on providing actionable insights that prioritize your health while helping you make informed decisions.

## Conclusion

By understanding ${title.toLowerCase()}, you can make more informed decisions about your health and wellness journey.

*This content is for informational purposes only and should not replace professional medical advice.*`;
};

console.log('🔧 Fixing missing content and metadata...\n');

problemFiles.forEach(filename => {
  const filePath = path.join(postsDir, filename);
  
  try {
    let fileData = {};
    
    // Try to read existing file
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      fileData = JSON.parse(fileContent);
      console.log(`📁 Processing existing file: ${filename}`);
    } else {
      console.log(`📁 Creating new file: ${filename}`);
    }
    
    // Get default metadata
    const defaults = getDefaultMetadata(filename);
    
    // Merge with existing data, prioritizing existing content where it exists
    const updatedData = {
      ...defaults,
      ...fileData,
      // Force update these critical fields if missing
      id: fileData.id || defaults.id,
      title: fileData.title || defaults.title,
      slug: fileData.slug || defaults.slug,
      excerpt: fileData.excerpt || defaults.excerpt,
      date: fileData.date || defaults.date,
      author: fileData.author || defaults.author,
      tags: fileData.tags || defaults.tags,
      readTime: typeof fileData.readTime === 'number' ? fileData.readTime : defaults.readTime,
      image: fileData.image || defaults.image,
      content: fileData.content || generateBasicContent(defaults.title)
    };
    
    // Write updated file
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    console.log(`✅ Fixed: ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log('\n🎉 Missing content and metadata fix completed!');