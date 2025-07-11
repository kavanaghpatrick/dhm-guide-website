// Script to update canonical tag dynamically
// This should be added to the head of index.html

(function() {
  // Function to update canonical tag based on current URL
  function updateCanonicalTag() {
    const currentPath = window.location.pathname;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      // Build the full canonical URL
      const canonicalUrl = `https://www.dhmguide.com${currentPath}`;
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