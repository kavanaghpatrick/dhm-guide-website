import React, { useState, useEffect } from 'react'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Guide from './pages/Guide.jsx'
import Reviews from './pages/Reviews.jsx'
import Research from './pages/Research.jsx'
import About from './pages/About.jsx'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Simple routing based on pathname
  const renderPage = () => {
    switch (currentPath) {
      case '/guide':
        return <Guide />
      case '/reviews':
        return <Reviews />
      case '/research':
        return <Research />
      case '/about':
        return <About />
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

