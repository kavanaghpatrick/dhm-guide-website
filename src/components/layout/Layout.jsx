import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Menu, X, Leaf, ChevronDown } from 'lucide-react'
import { useRouter } from '@/hooks/useRouter'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { useModernExperiment } from '@/lib/experiment'
import clusterConfig from '../../../scripts/cluster-config.json'
import '../../styles/theme-modern.css'

// Util: kebab-case → Title Case ("dhm-master" → "DHM Master")
const ACRONYMS = new Set(['dhm', 'nac', 'bac', 'rem', 'gi'])
function titleCase(words) {
  return words
    .map(w => ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
function clusterLabel(name) {
  // dhm-master → DHM Master Guide; otherwise simple Title Case
  if (name === 'dhm-master') return 'DHM Master'
  if (name === 'health-impact') return 'Alcohol & Health'
  return titleCase(name.split('-'))
}
// Convert post slug to readable spoke title; strip trailing year, "complete-guide", etc.
function slugToSpokeTitle(slug) {
  const tokens = slug
    .replace(/-2025$/, '')
    .replace(/-complete-guide$/, '')
    .split('-')
    .filter(Boolean)
  // cap at 6 tokens for nav brevity
  const capped = tokens.length > 6 ? tokens.slice(0, 6) : tokens
  return titleCase(capped)
}
const SPOKES_PER_CLUSTER = 5

function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTopicsOpen, setIsTopicsOpen] = useState(false)
  const [expandedClusterMobile, setExpandedClusterMobile] = useState(null)
  // Mount flag — createPortal needs document.body, which doesn't exist
  // on the server during SSR / prerender. Render dropdown only after mount.
  const [mounted, setMounted] = useState(false)
  const topicsRef = useRef(null)
  const dropdownRef = useRef(null)
  const { navigate, isActive, getNavItems } = useRouter()
  const { headerRef, headerHeight } = useHeaderHeight()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close topics dropdown on Escape or outside click.
  // Outside-click must check BOTH the trigger (topicsRef) and the portaled
  // dropdown (dropdownRef) — the dropdown lives in document.body now, so
  // it's not a descendant of the trigger anymore.
  useEffect(() => {
    if (!isTopicsOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setIsTopicsOpen(false) }
    const onClick = (e) => {
      const inTrigger = topicsRef.current && topicsRef.current.contains(e.target)
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
      if (!inTrigger && !inDropdown) {
        setIsTopicsOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [isTopicsOpen])

  // A/B Test #255: Nav CTA copy re-test (previously #134)
  const navCtaVariant = useFeatureFlag('nav-cta-copy-v1', 'control')
  const navCtaCopy = navCtaVariant === 'see-top-picks' ? 'See Top Picks' : 'Best Supplements'

  // The shared header CTA navigates to /reviews — it is NOT an affiliate/buy CTA, so
  // it must NEVER use the reserved conversion orange. It renders as a calm, single-tone
  // deep brand green (the "trust" accent) via theme-modern tokens on the .btn base,
  // consistent with the shipped modern chrome. `useModernExperiment` is still consumed
  // for parity with the rest of the file (and any future variant gating), but the CTA
  // treatment is now unconditionally modern/green on the restyled chrome.
  useModernExperiment()
  // Solid brand-strong green fill with white text (7.1:1 contrast, AA); no gradient,
  // no orange. Applied on top of the theme-modern `.btn` base (44px min target, radius).
  const navCtaGreenStyle = {
    backgroundColor: 'var(--color-brand-strong)',
    borderColor: 'var(--color-brand-strong)',
    color: 'var(--color-on-brand)',
    boxShadow: 'none',
  }

  // Get navigation items from centralized router
  const navItems = getNavItems().map(route => ({
    name: route.name,
    href: route.path
  }))

  const handleNavigation = useCallback((href) => {
    navigate(href, () => setIsMenuOpen(false))
  }, [navigate])

  return (
    <div className="min-h-screen bg-white">
      {/* Header — modern chrome. Scoped `theme-modern` so the shared design tokens
          (--color-paper/-border/-brand/-ink, --font-display, --radius, --elev-1)
          cascade into the header subtree (the header sits OUTSIDE each page's
          .theme-modern wrapper, so it needs its own scope).
          NB: do NOT add opacity/transform/will-change/filter here without also
          escaping the Topics dropdown (#161) to position:fixed — this header is a
          stacking-context-creating ancestor of that dropdown. The previous
          `style={{ opacity: headerOpacity }}` from useTransform trapped the
          dropdown's z-50 inside the header's local stacking context and caused
          page content to render above the dropdown. (issue: mega-menu overlap) */}
      <header
        ref={headerRef}
        className="theme-modern fixed top-0 left-0 right-0 z-header backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-paper) 82%, transparent)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-h-[40px]">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                // Allow Ctrl/Cmd+click for "open in new tab"
                if (e.metaKey || e.ctrlKey) return;

                e.preventDefault();
                handleNavigation('/');
              }}
              className="flex items-center space-x-2 group flex-shrink-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--radius)' }}
              >
                <Leaf className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span
                className="text-xl lg:text-2xl font-bold whitespace-nowrap"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-strong)' }}
              >
                DHM Guide
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center max-w-4xl mx-8">
              {navItems.map((item) => {
                // Replace /never-hungover with mega-menu Topics dropdown
                if (item.href === '/never-hungover') {
                  return (
                    <div
                      key="topics-dropdown"
                      ref={topicsRef}
                      className="relative"
                      onMouseEnter={() => setIsTopicsOpen(true)}
                      onMouseLeave={() => setIsTopicsOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setIsTopicsOpen(o => !o)}
                        onFocus={() => setIsTopicsOpen(true)}
                        aria-haspopup="true"
                        aria-expanded={isTopicsOpen}
                        aria-controls="topics-mega-menu"
                        data-track="nav-topics-trigger"
                        className={`nav-link relative px-3 py-2 text-sm whitespace-nowrap inline-flex items-center gap-1 ${
                          isActive('/never-hungover') ? 'is-active' : ''
                        }`}
                      >
                        Topics
                        <ChevronDown className={`w-4 h-4 transition-transform ${isTopicsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        {isActive('/never-hungover') && (
                          <span
                            className="nav-marker absolute bottom-0 left-0 right-0 h-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                      {/* Dropdown panel is portaled to document.body — see below.
                          This breaks it out of the header's DOM subtree (and any
                          stacking context the header creates from backdrop-filter,
                          opacity, transform, etc.). The trigger button stays here
                          inside the header for accessibility & layout. */}
                    </div>
                  )
                }
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      // Allow Ctrl/Cmd+click for "open in new tab"
                      if (e.metaKey || e.ctrlKey) return;

                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                    className={`nav-link relative px-3 py-2 text-sm whitespace-nowrap ${
                      isActive(item.href) ? 'is-active' : ''
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span
                        className="nav-marker absolute bottom-0 left-0 right-0 h-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                )
              })}
            </nav>

            {/* CTA Button — internal nav to /reviews (NOT an affiliate/buy CTA), so
                it renders in brand GREEN, never the reserved conversion orange. */}
            <div className="hidden lg:block flex-shrink-0">
              <a
                href="/reviews"
                data-track="nav-cta"
                data-cta-variant={navCtaVariant}
                onClick={(e) => {
                  // Allow Ctrl/Cmd+click for "open in new tab"
                  if (e.metaKey || e.ctrlKey) return;

                  e.preventDefault();
                  handleNavigation('/reviews');
                }}
                className="btn"
                style={navCtaGreenStyle}
              >
                {navCtaCopy}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav-link lg:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              data-track="mobile_menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 pb-4 pt-4"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => {
                  // Replace /never-hungover with collapsible Topics section on mobile
                  if (item.href === '/never-hungover') {
                    return (
                      <div
                        key="topics-mobile"
                        className="rounded-lg overflow-hidden"
                        style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedClusterMobile(c => c === '__topics__' ? null : '__topics__')}
                          aria-expanded={expandedClusterMobile === '__topics__'}
                          className={`nav-link-block w-full text-sm text-left justify-between ${
                            isActive('/never-hungover') ? 'is-active' : ''
                          }`}
                        >
                          <span>Topics</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedClusterMobile === '__topics__' ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                        {expandedClusterMobile === '__topics__' && (
                          <div
                            className="px-2 py-2 space-y-3"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--color-brand-soft) 55%, transparent)' }}
                          >
                            {clusterConfig.clusters.map((cluster) => {
                              const pillarHref = `/never-hungover/${cluster.pillar}`
                              return (
                                <div key={cluster.name} className="px-2">
                                  <a
                                    href={pillarHref}
                                    onClick={(e) => {
                                      if (e.metaKey || e.ctrlKey) return
                                      e.preventDefault()
                                      handleNavigation(pillarHref)
                                    }}
                                    data-track="nav-topics-cluster-mobile"
                                    data-cluster={cluster.name}
                                    className="block text-sm font-bold py-2"
                                    style={{ color: 'var(--color-brand-strong)' }}
                                  >
                                    {clusterLabel(cluster.name)} →
                                  </a>
                                  <ul
                                    className="pl-3 space-y-1"
                                    style={{ borderLeft: '2px solid var(--color-border)' }}
                                  >
                                    {cluster.spokes.slice(0, SPOKES_PER_CLUSTER).map((spoke) => {
                                      const href = `/never-hungover/${spoke}`
                                      return (
                                        <li key={spoke}>
                                          <a
                                            href={href}
                                            onClick={(e) => {
                                              if (e.metaKey || e.ctrlKey) return
                                              e.preventDefault()
                                              handleNavigation(href)
                                            }}
                                            data-track="nav-topics-spoke-mobile"
                                            data-cluster={cluster.name}
                                            className="nav-link block text-xs py-1.5 min-h-[32px]"
                                          >
                                            {slugToSpokeTitle(spoke)}
                                          </a>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                </div>
                              )
                            })}
                            <div className="px-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                              <a
                                href="/never-hungover"
                                onClick={(e) => {
                                  if (e.metaKey || e.ctrlKey) return
                                  e.preventDefault()
                                  handleNavigation('/never-hungover')
                                }}
                                className="nav-link block text-sm font-medium py-2"
                                style={{ color: 'var(--color-brand-strong)' }}
                              >
                                View all articles →
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      // Allow Ctrl/Cmd+click for "open in new tab"
                      if (e.metaKey || e.ctrlKey) return;

                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                    className={`nav-link-block text-sm text-left ${
                      isActive(item.href) ? 'is-active' : ''
                    }`}
                  >
                    {item.name}
                  </a>
                  )
                })}
                <a
                  href="/reviews"
                  onClick={(e) => {
                    // Allow Ctrl/Cmd+click for "open in new tab"
                    if (e.metaKey || e.ctrlKey) return;

                    e.preventDefault();
                    handleNavigation('/reviews');
                  }}
                  className="btn btn-block mt-4"
                  style={navCtaGreenStyle}
                >
                  {navCtaCopy}
                </a>
              </div>
            </motion.nav>
          )}
        </div>
      </header>

      {/* Topics mega-menu dropdown — portaled to document.body so it escapes
          the header's stacking context entirely. The header has position:fixed
          + backdrop-filter (and possibly future transforms/filters), each of
          which create a stacking context that traps z-index of descendants.
          By rendering into document.body, the dropdown sits at the document
          root's stacking context where its z-50 stacks above all page chrome.
          Hover semantics are preserved by adding onMouseEnter/onMouseLeave
          here that flip the same isTopicsOpen state — so cursor moving from
          trigger → dropdown keeps it open even though they're no longer
          parent/child in the DOM tree. */}
      {mounted && isTopicsOpen && createPortal(
        <div
          ref={dropdownRef}
          id="topics-mega-menu"
          role="region"
          aria-label="Topics"
          onMouseEnter={() => setIsTopicsOpen(true)}
          onMouseLeave={() => setIsTopicsOpen(false)}
          style={{
            top: headerHeight + 8,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--elev-1)',
          }}
          className="theme-modern fixed left-1/2 -translate-x-1/2 w-screen max-w-4xl p-6 z-50"
        >
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            {clusterConfig.clusters.map((cluster) => {
              const pillarHref = `/never-hungover/${cluster.pillar}`
              return (
                <div key={cluster.name}>
                  <a
                    href={pillarHref}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return
                      e.preventDefault()
                      setIsTopicsOpen(false)
                      handleNavigation(pillarHref)
                    }}
                    data-track="nav-topics-cluster"
                    data-cluster={cluster.name}
                    className="nav-link block text-sm font-bold mb-2 leading-tight"
                    style={{ color: 'var(--color-brand-strong)' }}
                  >
                    {clusterLabel(cluster.name)} →
                  </a>
                  <ul className="space-y-1.5">
                    {cluster.spokes.slice(0, SPOKES_PER_CLUSTER).map((spoke) => {
                      const href = `/never-hungover/${spoke}`
                      return (
                        <li key={spoke}>
                          <a
                            href={href}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey) return
                              e.preventDefault()
                              setIsTopicsOpen(false)
                              handleNavigation(href)
                            }}
                            data-track="nav-topics-spoke"
                            data-cluster={cluster.name}
                            className="nav-link block text-xs leading-snug"
                          >
                            {slugToSpokeTitle(spoke)}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <a
              href="/never-hungover"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return
                e.preventDefault()
                setIsTopicsOpen(false)
                handleNavigation('/never-hungover')
              }}
              className="nav-link text-sm font-medium"
              style={{ color: 'var(--color-brand-strong)' }}
            >
              View all articles →
            </a>
          </div>
        </div>,
        document.body
      )}

      {/* Main Content */}
      <main style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300">
        {children}
      </main>

      {/* Sticky Mobile CTA - A/B Test #126 */}
      <StickyMobileCTA />

      {/* Footer — modern chrome. Scoped `theme-modern` for token access. Rendered as a
          LIGHT warm surface (paper) so it reads as a continuation of the warm-paper
          modern pages, separated from the body by a single 1px --color-border hairline
          (border-first, no heavy slab). Replaces the old cold near-black footer slab.
          Links use quiet ink-soft → brand-strong hover; headings/wordmark are solid
          Fraunces ink; disclosure/copyright use ink-soft. Footer tap targets carry a
          44px min-height on mobile (a11y). No orange anywhere — no affiliate CTA here. */}
      <footer
        className="theme-modern py-12"
        style={{
          backgroundColor: 'var(--color-paper)',
          color: 'var(--color-ink-soft)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-brand)', borderRadius: 'var(--radius)' }}
                >
                  <Leaf className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
                >
                  DHM Guide
                </span>
              </div>
              <p className="mb-4 max-w-md" style={{ color: 'var(--color-ink-soft)' }}>
                Your comprehensive resource for understanding DHM (Dihydromyricetin) and its benefits for hangover prevention and liver health.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                © 2026 DHM Guide. All rights reserved.
              </p>
              <p className="text-sm mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                As an Amazon Associate I earn from qualifying purchases made through links on this site, at no additional cost to you.
              </p>
            </div>

            <div>
              <h3
                className="font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
              >
                Quick Links
              </h3>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        // Allow Ctrl/Cmd+click for "open in new tab"
                        if (e.metaKey || e.ctrlKey) return;

                        e.preventDefault();
                        handleNavigation(item.href);
                      }}
                      className="nav-link text-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
              >
                Resources
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/research"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      handleNavigation('/research');
                    }}
                    className="nav-link text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}
                  >
                    Scientific Studies
                  </a>
                </li>
                <li>
                  <a
                    href="/reviews"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      handleNavigation('/reviews');
                    }}
                    className="nav-link text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}
                  >
                    Product Reviews
                  </a>
                </li>
                <li>
                  <a
                    href="/dhm-dosage-calculator"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      handleNavigation('/dhm-dosage-calculator');
                    }}
                    className="nav-link text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}
                  >
                    Dosage Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      handleNavigation('/about');
                    }}
                    className="nav-link text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}
                  >
                    Safety Information
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default React.memo(Layout)

