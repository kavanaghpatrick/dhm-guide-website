/**
 * preloadModernFonts — inject a <link rel="preload"> for the modern variant's
 * body font, once per page load.
 *
 * Only variant ("modern") pages call this, so only the variant arm pays the
 * preload cost. Control pages never import this module.
 *
 * We preload Inter (the body/swap font) so it arrives before first paint and
 * minimizes the CLS window. We deliberately do NOT preload Fraunces — it uses
 * font-display: optional and must never compete with the LCP resource.
 */

const INTER_HREF = "/fonts/inter-variable.woff2";

export function preloadModernFonts() {
  if (typeof document === "undefined") return;

  // Idempotent: bail if we (or anything else) already preloaded this font.
  if (document.querySelector(`link[rel="preload"][href="${INTER_HREF}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.href = INTER_HREF;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

export default preloadModernFonts;
