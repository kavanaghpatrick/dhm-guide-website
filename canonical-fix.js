// Script to update canonical tag dynamically
// This should be added to the head of index.html

(function() {
  // Function to update canonical tag based on current URL
  function updateCanonicalTag() {
    const currentPath = window.location.pathname;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      // Normalize path: remove trailing slash except for root
      const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/')
        ? currentPath.slice(0, -1)
        : currentPath;
      // Build the full canonical URL using current origin (works in dev/staging/prod)
      const canonicalUrl = `${window.location.origin}${normalizedPath}`;
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }
  
  // Update on initial load
  updateCanonicalTag();
  
  // Listen for route changes (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      updateCanonicalTag();
    }
  }).observe(document, {subtree: true, childList: true});
  
  // Also listen for popstate events
  window.addEventListener('popstate', updateCanonicalTag);
})();