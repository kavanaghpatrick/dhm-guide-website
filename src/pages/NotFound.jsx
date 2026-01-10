import React, { useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { trackEvent } from '../lib/posthog.js'
import {
  Home,
  Search,
  BookOpen,
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/reviews">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Star className="w-4 h-4 mr-2" />
              See Top DHM Products
            </Button>
          </Link>
        </div>

        {/* Helpful Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {helpfulLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {link.icon}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors flex items-center gap-2">
                      {link.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please{' '}
          <a
            href="mailto:contact@dhmguide.com"
            className="text-green-600 hover:underline"
          >
            let us know
          </a>.
        </p>
      </div>
    </div>
  );
}
