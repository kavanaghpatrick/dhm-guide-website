import React from 'react';
import { Link } from './CustomLink.jsx';
import { ArrowRight, Star, Shield, Award } from 'lucide-react';

/**
 * ReviewsCTA - Conversion component to drive traffic from blog posts to /reviews
 *
 * Based on ULTRATHINK research showing:
 * - 88.6% of blog posts have no /reviews link
 * - In-content CTAs have 121% higher CTR than sidebar
 * - Soft CTAs ("See Our Top Picks") outperform "Buy Now"
 */
export default function ReviewsCTA({ variant = 'default' }) {
  if (variant === 'compact') {
    return (
      <div className="my-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">Ready to try DHM?</h4>
            <p className="text-sm text-gray-600">We've independently tested 10+ supplements.</p>
          </div>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[44px]"
          >
            See Top Picks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 p-6 md:p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Independent Reviews</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Find the Right DHM Supplement
          </h3>

          <p className="text-gray-600 mb-4">
            We've tested 10+ DHM products for purity, effectiveness, and value.
            See which ones actually work.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>20,000+ reviews analyzed</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Third-party tested</span>
            </div>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg min-h-[48px]"
          >
            Compare DHM Products
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-xs text-gray-500 mt-3">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  );
}
