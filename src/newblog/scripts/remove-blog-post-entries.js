import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read metadata
const metadataPath = path.join(__dirname, '../data/metadata/index.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

console.log(`Original entries: ${metadata.length}`);

// Filter out entries with blog_post slugs
const filteredMetadata = metadata.filter(entry => {
  const shouldKeep = !entry.slug.includes('blog_post_');
  if (!shouldKeep) {
    console.log(`Removing: ${entry.slug} - ${entry.title}`);
  }
  return shouldKeep;
});

console.log(`Filtered entries: ${filteredMetadata.length}`);
console.log(`Removed: ${metadata.length - filteredMetadata.length} entries`);

// Write back
fs.writeFileSync(metadataPath, JSON.stringify(filteredMetadata, null, 2));
console.log('\n✨ Metadata cleaned!');