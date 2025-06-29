// New Blog Post Loader with Dynamic Loading and Caching
import metadata from '../data/metadata/index.json';
import postModules from '../data/postRegistry.js';

// LRU Cache for loaded posts
class PostCache {
  constructor(maxSize = 10) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(slug) {
    if (this.cache.has(slug)) {
      // Move to end (most recently used)
      const post = this.cache.get(slug);
      this.cache.delete(slug);
      this.cache.set(slug, post);
      return post;
    }
    return null;
  }

  set(slug, post) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(slug, post);
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
const postCache = new PostCache(15); // Cache up to 15 posts

/**
 * Get all posts metadata (no content) - instant loading
 */
export const getAllPostsMetadata = () => {
  return metadata.map(post => ({
    ...post,
    date: new Date(post.date)
  })).sort((a, b) => b.date - a.date);
};

/**
 * Get recent posts metadata
 */
export const getRecentPostsMetadata = (limit = 5) => {
  return getAllPostsMetadata().slice(0, limit);
};

/**
 * Get posts by tag (metadata only)
 */
export const getPostsByTag = (tag) => {
  return getAllPostsMetadata().filter(post => 
    post.tags && post.tags.includes(tag)
  );
};

/**
 * Search posts by title or content (metadata only)
 */
export const searchPostsMetadata = (query) => {
  const searchTerm = query.toLowerCase();
  return getAllPostsMetadata().filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.excerpt.toLowerCase().includes(searchTerm) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  );
};

/**
 * Get all unique tags
 */
export const getAllTags = () => {
  const allTags = metadata.flatMap(post => post.tags || []);
  return [...new Set(allTags)].sort();
};

/**
 * Dynamically load a single post with full content
 */
export const getPostBySlug = async (slug) => {
  // Check cache first
  const cachedPost = postCache.get(slug);
  if (cachedPost) {
    console.log(`📦 Cache hit for post: ${slug}`);
    return cachedPost;
  }

  try {
    console.log(`🔄 Loading post: ${slug}`);
    
    // Use the registry to get the import function
    const importFn = postModules[slug];
    if (!importFn) {
      console.error(`❌ No import function found for slug: ${slug}`);
      return null;
    }
    
    // Dynamic import of individual post file
    const postModule = await importFn();
    const post = postModule.default || postModule;
    
    // Convert date string to Date object
    const processedPost = {
      ...post,
      date: new Date(post.datePublished || post.date)
    };
    
    // Cache the loaded post
    postCache.set(slug, processedPost);
    
    console.log(`✅ Post loaded and cached: ${slug}`);
    return processedPost;
    
  } catch (error) {
    console.error(`❌ Error loading post ${slug}:`, error);
    return null;
  }
};

/**
 * Preload a post in the background (for prefetching)
 */
export const preloadPost = async (slug) => {
  // Don't preload if already cached
  if (postCache.get(slug)) {
    return;
  }

  try {
    await getPostBySlug(slug);
    console.log(`🚀 Preloaded post: ${slug}`);
  } catch (error) {
    console.warn(`⚠️ Failed to preload post ${slug}:`, error);
  }
};

/**
 * Get related posts metadata based on tags
 */
export const getRelatedPostsMetadata = (currentPost, limit = 3) => {
  if (!currentPost || !currentPost.tags) {
    return [];
  }

  const allPosts = getAllPostsMetadata();
  
  // Score posts based on tag overlap
  const scoredPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const commonTags = post.tags?.filter(tag => currentPost.tags.includes(tag)) || [];
      return {
        ...post,
        score: commonTags.length
      };
    })
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit);
};

/**
 * Batch preload related posts
 */
export const preloadRelatedPosts = async (currentPost, limit = 3) => {
  const relatedPosts = getRelatedPostsMetadata(currentPost, limit);
  
  // Preload in parallel
  const preloadPromises = relatedPosts.map(post => preloadPost(post.slug));
  
  try {
    await Promise.all(preloadPromises);
    console.log(`🔄 Preloaded ${relatedPosts.length} related posts`);
  } catch (error) {
    console.warn('⚠️ Some related posts failed to preload:', error);
  }
};

/**
 * Clear the post cache (useful for development or memory management)
 */
export const clearPostCache = () => {
  postCache.clear();
  console.log('🗑️ Post cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: postCache.cache.size,
    maxSize: postCache.maxSize,
    cached: Array.from(postCache.cache.keys())
  };
};

// Utility functions for backwards compatibility with original blog
export const getAllPosts = async () => {
  console.warn('⚠️ getAllPosts() loads all posts - consider using getAllPostsMetadata() instead');
  
  const allMetadata = getAllPostsMetadata();
  const allPosts = await Promise.all(
    allMetadata.map(async (meta) => {
      try {
        return await getPostBySlug(meta.slug);
      } catch (error) {
        console.error(`Failed to load post ${meta.slug}:`, error);
        return null;
      }
    })
  );
  
  return allPosts.filter(post => post !== null);
};

export const getRelatedPosts = async (currentPost, limit = 3) => {
  const relatedMeta = getRelatedPostsMetadata(currentPost, limit);
  
  const relatedPosts = await Promise.all(
    relatedMeta.map(async (meta) => {
      try {
        return await getPostBySlug(meta.slug);
      } catch (error) {
        console.error(`Failed to load related post ${meta.slug}:`, error);
        return null;
      }
    })
  );
  
  return relatedPosts.filter(post => post !== null);
};