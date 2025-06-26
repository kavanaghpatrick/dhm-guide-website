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

