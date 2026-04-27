/**
 * NOTE: Tailwind v4 reads theme tokens from `@theme` blocks in CSS, not from
 * this file. The `theme.extend` syntax used in v3 is silently ignored.
 *
 * Custom z-index tokens (z-header, z-modal, z-popover, etc.) are defined in
 * `src/App.css` inside the `@theme inline { ... }` block. See that file for
 * the canonical scale.
 *
 * Keeping this file as a stub for IDE / lint awareness; consider removing
 * once the Tailwind v4 ecosystem confirms it isn't needed.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
