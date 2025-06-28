import React, { useState, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Guide from './pages/Guide.jsx'
import Reviews from './pages/Reviews.jsx'
import Research from './pages/Research.jsx'
import About from './pages/About.jsx'
import Compare from './pages/Compare.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './blog/components/BlogPost.jsx'
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
    // Handle blog post routes (e.g., /blog/post-slug)
    if (currentPath.startsWith('/blog/') && currentPath !== '/blog/') {
      return <BlogPost />
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
