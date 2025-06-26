import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { getPostBySlug } from '../utils/postLoader';

const BlogPost = () => {
  // Extract slug from current path
  const currentPath = window.location.pathname;
  const slug = currentPath.replace('/blog/', '');
  const post = getPostBySlug(slug);

  const handleNavigation = (href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={() => handleNavigation('/blog')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button 
            onClick={() => handleNavigation('/blog')}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(post.content)} min read</span>
            </div>
            {post.author && (
              <span>By {post.author}</span>
            )}
            <button
              onClick={sharePost}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg prose-green max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
                p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{children}</ol>,
                li: ({children}) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-green-500 pl-6 py-2 my-6 bg-green-50 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({inline, children}) => 
                  inline ? (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>
                  ) : (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                      <code className="text-sm font-mono text-gray-800">{children}</code>
                    </pre>
                  ),
                a: ({href, children}) => (
                  <a 
                    href={href} 
                    className="text-green-600 hover:text-green-700 underline transition-colors"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-700">{children}</em>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Try DHM?</h3>
          <p className="text-green-100 mb-6">
            Explore our comprehensive reviews and find the best DHM supplement for your needs.
          </p>
          <button 
            onClick={() => handleNavigation('/reviews')}
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            View Product Reviews
          </button>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

