# Design System Brief — Current State (read before proposing changes)

This is the **existing** design system. Modernization proposals must be expressed as
changes *relative to this*, and must be buildable with this stack (no framework swaps).

## Stack
- **Vite + React + Tailwind CSS v4**
- Theme tokens live in `src/App.css` inside an `@theme inline` block (NOT `tailwind.config.js` — v4 ignores the old config; `tailwind.config.js` is a stub).
- `cn()` helper (`src/lib/utils.js`) = `twMerge(clsx(...))` for safe class composition.
- **shadcn/Radix** UI primitives in `src/components/ui/` (Button, Card, Badge, Input, Dialog, Accordion, Tabs, etc.), styled via **CVA** (class-variance-authority).
- **Framer Motion v12** for motion. **Lucide React** for icons.

## Tokens (current)
- **Color:** base tokens in OKLch (`--color-background`, `--color-primary`, etc.), but pages overwhelmingly use **standard Tailwind utility colors**:
  - Brand/primary: **green** (`green-600 #16a34a`, `green-700 #15803d`, `green-800`)
  - Secondary/trust: **blue** (`blue-600/700`, `blue-50/100`)
  - Conversion accent: **orange** (`orange-500 #f97316`, `orange-600/700`) — CTAs, sticky mobile bar
  - Gradients: `from-green-600 to-green-800` (headings), `from-orange-500 to-orange-600` (CTAs)
- **Radius:** base `--radius: 0.625rem` (10px); scale sm/md/lg/xl.
- **Shadows:** Tailwind `shadow-xs → shadow-2xl`. Cards use `shadow-sm`, hover `shadow-lg`.
- **Z-index:** a CRITICAL custom scale (`--z-index-header: 40`, modal 50, etc.). Do not break it. See CLAUDE.md Patterns #14–#16.

## Typography (current — a key weakness)
- **No web fonts loaded.** Body uses the **system font stack** (`-apple-system, Segoe UI, Roboto, …`).
- **Headings use Georgia serif**; body is system sans.
- This is fast/accessible but reads generic. Typography is one of the biggest "modernization" levers — but any web font added must be weighed against LCP/CLS (the site is SEO-sensitive; see goal brief).

## Motion / Icons
- Framer Motion: scroll parallax on Home (`useScroll`/`useTransform`), card hover lifts (`translateY(-4px)`), button active `scale(0.97)`, FAQ/testimonial reveals.
- Custom keyframes in `src/styles/calculator-enhancements.css` (pulse-glow, shimmer, float, slide-up).
- Lucide icons throughout (Shield, Brain, Heart, Beaker, Star, Check, etc.).

## Current aesthetic (honest characterization)
Modern-ish health-SaaS circa 2023: clean, green-dominant, card-heavy, generous whitespace,
restrained motion. Weak spots commonly flagged: generic system typography, green/orange combo
can feel "supplement-affiliate," uneven spacing rhythm, dated gradient text, card monotony,
and trust signals that aren't visually elevated.
