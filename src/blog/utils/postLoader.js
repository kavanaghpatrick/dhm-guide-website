import { posts } from '../data/posts.js';

export const getAllPosts = () => {
  // Convert date strings to Date objects and sort by date (newest first)
  return posts
    .map(post => ({
      ...post,
      date: new Date(post.date)
    }))
    .sort((a, b) => b.date - a.date);
};

export const getPostBySlug = (slug) => {
  const allPosts = getAllPosts();
  return allPosts.find(post => post.slug === slug);
};

export const getRecentPosts = (limit = 3) => {
  const allPosts = getAllPosts();
  return allPosts.slice(0, limit);
};

export const getRelatedPosts = (currentPost, limit = 3) => {
  if (!currentPost || !currentPost.tags) return [];
  
  const allPosts = getAllPosts();
  
  // Calculate relevance score for each post based on shared tags
  const scoredPosts = allPosts
    .filter(post => post.slug !== currentPost.slug) // Exclude current post
    .map(post => {
      if (!post.tags) return { ...post, score: 0 };
      
      // Count shared tags
      const sharedTags = post.tags.filter(tag => 
        currentPost.tags.includes(tag)
      ).length;
      
      return {
        ...post,
        score: sharedTags
      };
    })
    .filter(post => post.score > 0) // Only include posts with shared tags
    .sort((a, b) => {
      // Sort by score first, then by date
      if (b.score !== a.score) return b.score - a.score;
      return b.date - a.date;
    });
  
  return scoredPosts.slice(0, limit);
};

