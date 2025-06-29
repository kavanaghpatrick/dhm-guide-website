import React, { lazy, Suspense, useState, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
import './App.css'

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home.jsx'))
const Guide = lazy(() => import('./pages/Guide.jsx'))
const Reviews = lazy(() => import('./pages/Reviews.jsx'))
const Research = lazy(() => import('./pages/Research.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const BlogPost = lazy(() => import('./blog/components/BlogPost.jsx'))
const NewBlogListing = lazy(() => import('./newblog/pages/NewBlogListing.jsx'))
const NewBlogPost = lazy(() => import('./newblog/components/NewBlogPost.jsx'))

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
)

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      // Remove trailing slash except for root
      const path = window.location.pathname;
      return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    }
    return '/';
  })

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      // Remove trailing slash except for root
      setCurrentPath(path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path);
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Simple routing based on pathname
  const renderPage = () => {
    // Handle Never Hungover blog post routes (e.g., /never-hungover/post-slug)
    if (currentPath.startsWith('/never-hungover/')) {
      return <NewBlogPost />
    }
    
    // Handle old blog post routes (e.g., /blog/post-slug) - legacy support
    if (currentPath.startsWith('/blog/')) {
      return <BlogPost />
    }

    // Handle legacy /newblog routes - redirect to new path
    if (currentPath.startsWith('/newblog')) {
      window.history.replaceState({}, '', currentPath.replace('/newblog', '/never-hungover'));
      window.dispatchEvent(new PopStateEvent('popstate'));
      return null;
    }
    
    switch (currentPath) {
      case '/guide':
        return <Guide />
      case '/reviews':
        return <Reviews />
      case '/research':
        return <Research />
      case '/about':
        return <About />
      case '/compare':
        return <Compare />
      case '/never-hungover':
        return <NewBlogListing />
      case '/blog':
        return <Blog />
      default:
        return <Home />
    }
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {renderPage()}
      </Suspense>
    </Layout>
  )
}

export default App

// React import fix for blog post rendering
// Trigger Vercel deployment test - Fri Jun 27 09:57:17 EDT 2025
// Force deployment trigger
