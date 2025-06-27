import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add error boundary and debugging
console.log('Main.jsx: Starting React app initialization');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h1>Something went wrong with the React app</h1>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', marginTop: '10px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fix hydration issues by using client-side only rendering
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    console.log('Main.jsx: Root element found:', !!rootElement);
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Clear any existing content to prevent hydration mismatches
    rootElement.innerHTML = '';
    
    const root = createRoot(rootElement);
    console.log('Main.jsx: React root created successfully');
    
    // Use client-side only rendering to avoid hydration issues
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    
    console.log('Main.jsx: React app rendered successfully');
  } catch (error) {
    console.error('Main.jsx: Failed to initialize React app:', error);
    
    // Fallback rendering
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: red;">
          <h1>React App Failed to Load</h1>
          <p>Error: ${error.message}</p>
          <p>Check console for details</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
