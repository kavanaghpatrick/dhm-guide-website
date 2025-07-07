import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    // Add a small delay before retry to ensure resources are loaded
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#059669', marginBottom: '16px' }}>
            DHM Guide
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '400px' }}>
            Loading the latest content... If this persists, please refresh the page.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                touchAction: 'manipulation',
                minHeight: '44px',
                minWidth: '44px'
              }}
              className="fast-click"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                touchAction: 'manipulation',
                minHeight: '44px',
                minWidth: '44px'
              }}
              className="fast-click"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Touch optimization setup
function setupTouchOptimizations() {
  // Ensure DOM is ready before manipulating it
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  
  try {
    // Add touch interaction optimizations
    document.body.style.touchAction = 'manipulation';
    document.body.style.webkitTapHighlightColor = 'transparent';
    
    // Remove 300ms click delay
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.content = 'width=device-width, initial-scale=1, user-scalable=no';
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, user-scalable=no';
      document.head.appendChild(meta);
    }
  } catch (error) {
    console.log('Touch optimizations could not be applied:', error);
  }
}

// Initialize React app
function initializeApp() {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root container not found');
    }

    // Setup touch optimizations
    setupTouchOptimizations();
    
    // Add touch optimization class to root
    container.classList.add('fast-click');
    
    const root = createRoot(container);
    
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    
    // Fallback rendering
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif; background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h2 style="color: #059669; margin-bottom: 16px;">DHM Guide</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">There was an issue loading the page. Please refresh to try again.</p>
          <button onclick="window.location.reload()" style="background-color: #059669; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; touch-action: manipulation; min-height: 44px; min-width: 44px;" class="fast-click">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

