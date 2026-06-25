# Modernization Goal & Guardrails

## Goal
Modernize the *look* of the 6 primary pages so the site feels current, premium, and
trustworthy — then ship the best ideas as **PostHog A/B variants** measured against the
current design. "Modern" here means: confident editorial typography, a refined and
distinctive palette, deliberate spacing rhythm, real depth/elevation, tasteful motion,
and trust signals that look designed (not bolted on). The site sells supplements via
Amazon affiliate links, so **modern must also convert** — beauty that lowers CTR loses.

## Guardrails (from CLAUDE.md — enforced by the feasibility pass)
1. **Simplicity first.** Prefer the smallest change that achieves the modern feel. Reject
   "enterprise" patterns, speculative abstraction, and redesigns-for-redesign's-sake.
2. **Buildable with the current stack.** Tailwind v4 + shadcn/Radix + CVA + Framer Motion +
   Lucide. No framework swaps, no heavy new dependencies unless they save real work.
3. **Protect Core Web Vitals & SEO.** Flag any LCP/CLS risk. Web fonts, large hero media,
   and above-the-fold reflow are the usual offenders. The site is SEO-sensitive and under a
   recrawl-quality watch.
4. **Don't break the z-index scale** (`src/App.css`). See CLAUDE.md Patterns #14–#16.
5. **Every idea must be A/B-testable** as an isolated variant (see posthog-ab-brief.md).
6. **Conversion is the tiebreaker.** Each recommendation states expected effect on affiliate
   CTR / engagement, not just aesthetics.

## What "good output" looks like
- A clear read of what currently feels dated on each page (grounded in the screenshots).
- 4–8 concrete, prioritized modernization moves per page, each tagged: area, effort (S/M/L),
  conversion risk, and the single highest-value A/B variant concept for that page.
- A shared modern design language (typography, color, spacing, elevation, motion) so the 6
  pages move together, not in 6 directions.
- A prioritized A/B roadmap: what to build first, the experiment key, hypothesis, primary metric.
