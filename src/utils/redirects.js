// Redirect configuration for removed/archived posts
// These posts had empty content and were causing SEO penalties

export const archivedPostRedirects = {
  // Redirect empty posts to related content
  '/never-hungover/complete-guide-hangover-types-2025': '/never-hungover',
  '/never-hungover/flyby-vs-fuller-health-complete-comparison': '/reviews',
  '/never-hungover/fraternity-formal-hangover-prevention-complete-dhm-guide-2025': '/never-hungover',
  '/never-hungover/greek-week-champion-recovery-guide-dhm-competition-success-2025': '/never-hungover',
  '/never-hungover/hangxiety-2025-dhm-prevents-post-drinking-anxiety': '/never-hungover',
  '/never-hungover/post-dry-january-smart-drinking-strategies-2025': '/never-hungover',
  '/never-hungover/professional-hangover-free-networking-guide-2025': '/never-hungover',
  '/never-hungover/rush-week-survival-guide-dhm-strategies-sorority-recruitment-2025': '/never-hungover',
  '/never-hungover/whiskey-vs-vodka-hangover': '/never-hungover/wine-hangover-guide',
};

// Check if a path needs redirection
export function checkRedirect(path) {
  // Normalize path
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  if (archivedPostRedirects[normalizedPath]) {
    return {
      shouldRedirect: true,
      redirectTo: archivedPostRedirects[normalizedPath],
      statusCode: 301 // Permanent redirect
    };
  }
  
  return {
    shouldRedirect: false
  };
}

// Apply redirect if needed
export function applyRedirect(path) {
  const redirect = checkRedirect(path);
  
  if (redirect.shouldRedirect) {
    // For client-side routing
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', redirect.redirectTo);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return true;
    }
  }
  
  return false;
}