import React from 'react';
import { Link } from './CustomLink.jsx';
import { ArrowRight } from 'lucide-react';
import { trackElementClick } from '../lib/posthog';

/**
 * CompareCTA - Restrained, on-brand call-to-action that drives blog post
 * readers to /compare (where the affiliate links live).
 *
 * Design intent: "super clean" - one card, one heading, one button. No
 * decorative graphics, no trust badges, no shadows, no animations beyond
 * a button hover state. Restraint > decoration.
 *
 * Visual language matches the existing affiliate-button gradient
 * (orange-500 -> orange-600) per CLAUDE.md Pattern #12, while the card
 * itself is the calmer ReviewsCTA shape stripped of icons and gradients.
 *
 * No props - drops directly into NewBlogPost as <CompareCTA />.
 *
 * Stacking-context note (CLAUDE.md Pattern #14): this component does NOT
 * use transform, opacity != 1, filter, backdrop-filter, or motion wrappers,
 * so it cannot trap descendants in a stacking context.
 */
export default function CompareCTA() {
  const handleClick = () => {
    trackElementClick('cta', {
      element_type: 'compare_cta',
      cta_destination: '/compare',
      placement: 'in_post',
    });
  };

  return (
    <div className="my-10 px-6 py-6 md:py-8 bg-orange-50 border border-orange-200 rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
            Compare top DHM supplements
          </h3>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            10 products tested side-by-side on dose, purity, and price.
          </p>
        </div>

        <Link
          to="/compare"
          data-track="cta"
          data-cta-destination="/compare"
          data-placement="in_post"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 self-start md:self-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base font-medium px-6 py-3 rounded-lg whitespace-nowrap min-h-[48px]"
        >
          See comparison
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
