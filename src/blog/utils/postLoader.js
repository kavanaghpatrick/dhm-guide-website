import matter from 'gray-matter';

// Import all markdown files from the posts directory
const postModules = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });

export const getAllPosts = () => {
  const posts = [];
  
  for (const path in postModules) {
    const content = postModules[path];
    
    if (!content) {
      continue;
    }
    
    const { data, content: markdownContent } = matter(content);
    
    // Extract slug from filename
    const slug = path.replace('../posts/', '').replace('.md', '');
    
    posts.push({
      slug,
      content: markdownContent,
      ...data,
      // Ensure date is a Date object
      date: new Date(data.date)
    });
  }
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => b.date - a.date);
};

export const getPostBySlug = (slug) => {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
};

export const getRecentPosts = (limit = 3) => {
  const posts = getAllPosts();
  return posts.slice(0, limit);
};

export const getPostsByTag = (tag) => {
  const posts = getAllPosts();
  return posts.filter(post => 
    post.tags && post.tags.includes(tag)
  );
};

