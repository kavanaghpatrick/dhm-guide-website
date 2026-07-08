import React, { useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { trackEvent } from '../lib/posthog.js'
import {
  Home,
  Search,
  BookOpen,
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import '../styles/theme-modern.css'

export default function NotFound() {
  // Track 404 event for monitoring broken links
  useEffect(() => {
    trackEvent('page_not_found', {
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      search: window.location.search
    });
  }, []);

  const helpfulLinks = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Home",
      description: "Start fresh from our homepage",
      href: "/"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Best DHM Supplements",
      description: "See our top-rated products",
      href: "/reviews"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "DHM Guide",
      description: "Learn about hangover prevention",
      href: "/guide"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Browse Articles",
      description: "Explore our blog content",
      href: "/never-hungover"
    }
  ];

  return (
    <div
      className="theme-modern"
      style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      <div
        className="min-h-[70vh] flex items-center justify-center px-4"
        style={{ paddingBlock: 'var(--section-y)' }}
      >
        <div className="max-w-2xl w-full text-center">
          {/* 404 Header */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div
              className="inline-flex items-center justify-center"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-brand-soft)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-6)'
              }}
            >
              <AlertCircle
                className="w-10 h-10"
                aria-hidden="true"
                style={{ color: 'var(--color-brand)' }}
              />
            </div>
            <h1 style={{ marginBottom: 'var(--space-4)' }}>
              Page Not Found
            </h1>
            <p className="lead" style={{ maxWidth: '28rem', marginInline: 'auto' }}>
              Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists.
            </p>
          </div>

          {/* Quick Actions */}
          <div
            className="flex flex-col sm:flex-row justify-center"
            style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-12)' }}
          >
            <Link
              to="/"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
              style={{ textDecoration: 'none' }}
            >
              <Home aria-hidden="true" />
              Go to Homepage
            </Link>
            <Link
              to="/reviews"
              className="btn btn-secondary btn-lg w-full sm:w-auto"
              style={{ textDecoration: 'none' }}
            >
              <Star aria-hidden="true" />
              See Top DHM Products
            </Link>
          </div>

          {/* Helpful Links Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{ gap: 'var(--space-4)' }}
          >
            {helpfulLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="card-raised group"
                style={{ display: 'block', textDecoration: 'none', height: '100%' }}
              >
                <div
                  className="flex items-start"
                  style={{ gap: 'var(--space-4)' }}
                >
                  <span className="pathway__icon" style={{ flexShrink: 0 }} aria-hidden="true">
                    {link.icon}
                  </span>
                  <div className="text-left flex-1">
                    <h2
                      className="card-title flex items-center"
                      style={{
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-1)',
                        color: 'var(--color-ink)'
                      }}
                    >
                      {link.title}
                      <ArrowRight
                        className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        aria-hidden="true"
                        style={{ color: 'var(--color-brand-strong)' }}
                      />
                    </h2>
                    <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Help Text */}
          <p
            className="text-soft"
            style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-small)' }}
          >
            If you believe this is an error, please{' '}
            <a
              href="mailto:contact@dhmguide.com"
              style={{ color: 'var(--color-info)' }}
            >
              let us know
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
