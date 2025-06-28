import React, { useState, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Guide from './pages/Guide.jsx'
import Reviews from './pages/Reviews.jsx'
import Research from './pages/Research.jsx'
import About from './pages/About.jsx'
import Compare from './pages/Compare.jsx'
import Blog from './pages/Blog.jsx'
import BlogMinimal from './pages/BlogMinimal.jsx'
import BlogBasic from './pages/BlogBasic.jsx'
import BlogPostsOnly from './pages/BlogPostsOnly.jsx'
import BlogSEOTest from './pages/BlogSEOTest.jsx'
import BlogCombinedTest from './pages/BlogCombinedTest.jsx'
import BlogPost from './blog/components/BlogPost.jsx'
import NewBlogListing from './newblog/pages/NewBlogListing.jsx'
import NewBlogPost from './newblog/components/NewBlogPost.jsx'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(() => 
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Simple routing based on pathname
  const renderPage = () => {
    // Handle Never Hungover blog post routes (e.g., /never-hungover/post-slug)
    if (currentPath.startsWith('/never-hungover/') && currentPath !== '/never-hungover/') {
      return <NewBlogPost />
    }
    
    // Handle old blog post routes (e.g., /blog/post-slug) - legacy support
    if (currentPath.startsWith('/blog/') && currentPath !== '/blog/') {
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
      {renderPage()}
    </Layout>
  )
}

export default App

// React import fix for blog post rendering
// Trigger Vercel deployment test - Fri Jun 27 09:57:17 EDT 2025
// Force deployment trigger
